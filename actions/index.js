const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgrespassword@postgres:5432/hasura_demo",
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/place-order", async (req, res) => {
  const { input } = req.body;
  const { user_id, items, shipping_address, notes } = input.input;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order must contain at least one item" });
  }

  // Validate user_id format
  if (!UUID_REGEX.test(user_id)) {
    return res.status(400).json({ message: "Invalid user_id format: must be a valid UUID" });
  }

  // Validate item quantities and product_id formats, reject duplicates
  const seenProductIds = new Set();
  for (const item of items) {
    if (!UUID_REGEX.test(item.product_id)) {
      return res.status(400).json({ message: `Invalid product_id format: ${item.product_id}` });
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({
        message: `Invalid quantity for product ${item.product_id}: must be a positive integer`,
      });
    }
    if (seenProductIds.has(item.product_id)) {
      return res.status(400).json({
        message: `Duplicate product_id: ${item.product_id}. Combine quantities into a single item.`,
      });
    }
    seenProductIds.add(item.product_id);
  }

  // Validate shipping_address is valid JSON if provided
  if (shipping_address) {
    try {
      JSON.parse(shipping_address);
    } catch (e) {
      return res.status(400).json({ message: "shipping_address must be a valid JSON string" });
    }
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 1. Validate user exists
    const userResult = await client.query("SELECT id FROM users WHERE id = $1", [user_id]);
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: `User ${user_id} not found` });
    }

    // 2. Validate products exist, are active, and lock rows for stock check
    const productIds = items.map((item) => item.product_id);
    const productsResult = await client.query(
      "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ANY($1::uuid[]) FOR UPDATE",
      [productIds]
    );

    const productsMap = new Map();
    for (const row of productsResult.rows) {
      productsMap.set(row.id, row);
    }

    for (const item of items) {
      const product = productsMap.get(item.product_id);
      if (!product) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Product ${item.product_id} not found` });
      }
      if (!product.is_active) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Product "${product.name}" is not available` });
      }
      if (product.stock_quantity < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock_quantity}`,
        });
      }
    }

    // 3. Calculate total from server-side prices
    let totalAmount = 0;
    for (const item of items) {
      const product = productsMap.get(item.product_id);
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // 4. Create the order
    const shippingAddr = shipping_address || null;
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, shipping_address, notes)
       VALUES ($1, 'pending', $2, $3::jsonb, $4)
       RETURNING id`,
      [user_id, totalAmount, shippingAddr, notes || null]
    );
    const orderId = orderResult.rows[0].id;

    // 5. Create order items and decrement stock
    for (const item of items) {
      const product = productsMap.get(item.product_id);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, product.price]
      );

      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
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
    return res.status(500).json({ message: "Internal server error while placing order" });
  } finally {
    if (client) client.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Actions handler running on port ${PORT}`);
});
