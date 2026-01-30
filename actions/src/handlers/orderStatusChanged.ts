import { Request, Response } from "express";
import { pool } from "../db";
import { HasuraEventPayload, OrderRow, UserRow } from "../types";

export async function orderStatusChanged(
  req: Request,
  res: Response,
): Promise<void> {
  const payload = req.body as HasuraEventPayload<OrderRow>;
  
  console.log(
    `[event] id=${payload.id} trigger=${payload.trigger.name} op=${payload.event.op}`,
  );

  const oldRow = payload.event.data.old;
  const newRow = payload.event.data.new;

  if (!newRow) {
    console.log("[event] No new row data — skipping");
    res.json({ ok: true });
    return;
  }

  const oldStatus = oldRow?.status ?? "(none)";
  const newStatus = newRow.status;

  console.log(
    `[event] order ${newRow.id}: status ${oldStatus} → ${newStatus}`,
  );

  if (newStatus === "delivered") {
    try {
      const result = await pool.query<Pick<UserRow, "name" | "email">>(
        "SELECT name, email FROM users WHERE id = $1",
        [newRow.user_id],
      );
      if (result.rows.length > 0) {
        const { name, email } = result.rows[0];
        console.log(
          `[event] Order ${newRow.id} delivered to ${name} (${email})`,
        );
      }
    } catch (err) {
      console.error("[event] Failed to look up user:", err);
    }
  }

  res.json({ ok: true });
}
