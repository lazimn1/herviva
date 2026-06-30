import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_FILE = path.join(__dirname, "data", "orders.json");
const PORT = process.env.PORT || 3001;

const app = express();
app.disable("x-powered-by");

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow this origin"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json({ limit: "20kb" }));

function ensureOrdersFile() {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

function readOrders() {
  ensureOrdersFile();
  return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
}

function writeOrders(orders) {
  ensureOrdersFile();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function generateOrderId() {
  return `HV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

const SHIPPING_FLAT = 99;
const FREE_SHIPPING_MIN = 2999;

function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT;
}

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value) {
  return /^[0-9]{10}$/.test(value);
}

function validateOrderPayload(payload) {
  const { items, customer, paymentMethod } = payload || {};

  if (!Array.isArray(items) || items.length === 0) {
    return "Order must include at least one item";
  }

  if (!customer || typeof customer !== "object") {
    return "Customer details are required";
  }

  if (!customer.name?.trim()) {
    return "Customer name is required";
  }

  if (!isValidPhone(customer.phone)) {
    return "A valid 10-digit phone number is required";
  }

  if (!customer.address?.trim()) {
    return "Delivery address is required";
  }

  if (!isValidEmail(customer.email)) {
    return "A valid email address is required";
  }

  if (!new Set(["razorpay", "cod"]).has(paymentMethod)) {
    return "Payment method must be Razorpay or Cash on Delivery";
  }

  for (const item of items) {
    if (!item || typeof item !== "object") {
      return "Invalid item in cart";
    }
    if (!item.id || !item.name) {
      return "Each item must have an id and name";
    }
    if (typeof item.qty !== "number" || item.qty <= 0) {
      return "Each item quantity must be a positive number";
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return "Each item price must be a positive number";
    }
  }

  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    payments: razorpay ? "razorpay" : "cod_only",
  });
});

app.post("/api/orders/create", async (req, res) => {
  try {
    const validationError = validateOrderPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { items, customer, paymentMethod } = req.body;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = calcShipping(subtotal);
    const total = subtotal + shipping;

    const orderId = generateOrderId();
    const order = {
      id: orderId,
      items,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || "cod",
      status: paymentMethod === "razorpay" ? "pending_payment" : "confirmed",
      createdAt: new Date().toISOString(),
    };

    if (paymentMethod === "razorpay") {
      if (!razorpay) {
        return res.status(503).json({
          error: "Online payments not configured. Use Cash on Delivery or add Razorpay keys to .env",
        });
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: orderId,
        notes: {
          order_id: orderId,
          customer_name: customer.name,
          customer_phone: customer.phone,
        },
      });

      order.razorpayOrderId = razorpayOrder.id;
      const orders = readOrders();
      orders.push(order);
      writeOrders(orders);

      return res.json({
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        key: process.env.RAZORPAY_KEY_ID,
        customer: {
          name: customer.name,
          email: customer.email || "",
          contact: customer.phone,
        },
      });
    }

    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);

    res.json({ orderId, amount: total, status: "confirmed" });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/orders/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: "Payment verification unavailable" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.razorpayOrderId === razorpay_order_id);
    if (idx === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    orders[idx].status = "paid";
    orders[idx].razorpayPaymentId = razorpay_payment_id;
    orders[idx].paidAt = new Date().toISOString();
    writeOrders(orders);

    res.json({ success: true, orderId: orders[idx].id });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.get("/api/orders/:id", (req, res) => {
  const orders = readOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  next();
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.message?.includes("CORS")) {
    return res.status(401).json({ error: err.message });
  }

  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`herviva API running on http://localhost:${PORT}`);
  if (!razorpay) {
    console.log("Razorpay not configured — COD orders only. Add keys to .env to enable online payments.");
  }
});
