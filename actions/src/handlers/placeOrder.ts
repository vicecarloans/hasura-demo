import { Request, Response } from "express";
import { pool } from "../db";
import {
  HasuraActionPayload,
  PlaceOrderInput,
  ProductRow,
} from "../types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function placeOrder(req: Request, res: Response): Promise<void> {
  const body = req.body as HasuraActionPayload<PlaceOrderInput>;
  const { user_id, items, shipping_address, notes } = body.input.input;

  if (!items || items.length === 0) {
    res.status(400).json({ message: "Order must contain at least one item" });
    return;
  }

  if (!UUID_REGEX.test(user_id)) {
    res
      .status(400)
      .json({ message: "Invalid user_id format: must be a valid UUID" });
    return;
  }

  const seenProductIds = new Set<string>();
  for (const item of items) {
    if (!UUID_REGEX.test(item.product_id)) {
      res
        .status(400)
        .json({ message: `Invalid product_id format: ${item.product_id}` });
      return;
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      res.status(400).json({
        message: `Invalid quantity for product ${item.product_id}: must be a positive integer`,
      });
      return;
    }
    if (seenProductIds.has(item.product_id)) {
      res.status(400).json({
        message: `Duplicate product_id: ${item.product_id}. Combine quantities into a single item.`,
      });
      return;
    }
    seenProductIds.add(item.product_id);
  }

  if (shipping_address) {
    try {
      JSON.parse(shipping_address);
    } catch {
      res
        .status(400)
        .json({ message: "shipping_address must be a valid JSON string" });
      return;
    }
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 1. Validate user exists
    const userResult = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id],
    );
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: `User ${user_id} not found` });
      return;
    }

    // 2. Validate products exist, are active, and lock rows for stock check
    const productIds = items.map((item) => item.product_id);
    const productsResult = await client.query<ProductRow>(
      "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ANY($1::uuid[]) FOR UPDATE",
      [productIds],
    );

    const productsMap = new Map<string, ProductRow>();
    for (const row of productsResult.rows) {
      productsMap.set(row.id, row);
    }

    for (const item of items) {
      const product = productsMap.get(item.product_id);
      if (!product) {
        await client.query("ROLLBACK");
        res
          .status(400)
          .json({ message: `Product ${item.product_id} not found` });
        return;
      }
      if (!product.is_active) {
        await client.query("ROLLBACK");
        res
          .status(400)
          .json({ message: `Product "${product.name}" is not available` });
        return;
      }
      if (product.stock_quantity < item.quantity) {
        await client.query("ROLLBACK");
        res.status(400).json({
          message: `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock_quantity}`,
        });
        return;
      }
    }

    // 3. Calculate total from server-side prices
    let totalAmount = 0;
    for (const item of items) {
      const product = productsMap.get(item.product_id)!;
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // 4. Create the order
    const shippingAddr = shipping_address || null;
    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders (user_id, status, total_amount, shipping_address, notes)
       VALUES ($1, 'pending', $2, $3::jsonb, $4)
       RETURNING id`,
      [user_id, totalAmount, shippingAddr, notes || null],
    );
    const orderId = orderResult.rows[0].id;

    // 5. Create order items and decrement stock
    for (const item of items) {
      const product = productsMap.get(item.product_id)!;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, product.price],
      );

      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.product_id],
      );
    }

    await client.query("COMMIT");

    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      order_id: orderId,
      total_amount: totalAmount,
      status: "pending",
      items_count: itemsCount,
      message: `Order placed successfully with ${itemsCount} item(s) totaling $${totalAmount.toFixed(2)}`,
    });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    console.error("Error placing order:", err);
    res
      .status(500)
      .json({ message: "Internal server error while placing order" });
  } finally {
    if (client) client.release();
  }
}
