import express from "express";
import { placeOrder } from "./handlers/placeOrder";
import { orderStatusChanged } from "./handlers/orderStatusChanged";

const app = express();
app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/place-order", placeOrder);
app.post("/order-status-changed", orderStatusChanged);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Actions handler running on port ${PORT}`);
});
