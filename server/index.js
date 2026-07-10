/* global process */
import express from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Remove unused __dirname
const PORT = process.env.PORT || 3001;

const app = express();
app.disable("x-powered-by");
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use("/api/", apiLimiter);

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://herviva.vercel.app",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
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

// Initialize Supabase
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

  if (!Array.isArray(items) || items.length === 0) return "Order must include at least one item";
  if (!customer || typeof customer !== "object") return "Customer details are required";
  if (!customer.name?.trim()) return "Customer name is required";
  if (!isValidPhone(customer.phone)) return "A valid 10-digit phone number is required";
  if (!customer.address?.trim()) return "Delivery address is required";
  if (!isValidEmail(customer.email)) return "A valid email address is required";
  if (!new Set(["razorpay", "cod"]).has(paymentMethod)) return "Payment method must be Razorpay or Cash on Delivery";

  for (const item of items) {
    if (!item || typeof item !== "object") return "Invalid item in cart";
    if (!item.id || !item.name) return "Each item must have an id and name";
    if (typeof item.qty !== "number" || item.qty <= 0) return "Each item quantity must be a positive number";
    if (typeof item.price !== "number" || item.price <= 0) return "Each item price must be a positive number";
  }

  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    payments: razorpay ? "razorpay" : "cod_only",
    database: supabase ? "supabase" : "none"
  });
});

app.post("/api/orders/create", async (req, res) => {
  try {
    const validationError = validateOrderPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!supabase) {
      return res.status(503).json({ error: "Database not configured on server" });
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
          error: "Online payments not configured. Use Cash on Delivery.",
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
      
      const { error: dbError } = await supabase.from('orders').insert([order]);
      if (dbError) {
        const maskedKey = supabaseKey ? supabaseKey.substring(0, 10) + "..." : "null";
        throw new Error(`DB Error: ${dbError.message || JSON.stringify(dbError)} | URL=[${supabaseUrl}] KEY=[${maskedKey}]`);
      }

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

    const { error: dbError } = await supabase.from('orders').insert([order]);
    if (dbError) {
      const maskedKey = supabaseKey ? supabaseKey.substring(0, 10) + "..." : "null";
      throw new Error(`DB Error: ${dbError.message || JSON.stringify(dbError)} | URL=[${supabaseUrl}] KEY=[${maskedKey}]`);
    }

    res.json({ orderId, amount: total, status: "confirmed" });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

app.post("/api/orders/verify", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

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

    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},razorpayOrderId.eq.${razorpay_order_id}`);

    if (fetchError || !orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderToUpdate = orders[0];

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date().toISOString()
      })
      .eq('id', orderToUpdate.id);
      
    if (updateError) throw updateError;

    res.json({ success: true, orderId: orderToUpdate.id });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error || !data) return res.status(404).json({ error: "Order not found" });
    res.json(data);
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.post("/api/orders/track", async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer->>email', email.trim())
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error("Track orders db error:", error);
      return res.status(500).json({ error: "Failed to track orders" });
    }
    
    res.json({ orders: data || [] });
  } catch (err) {
    console.error("Track orders error:", err);
    res.status(500).json({ error: "Failed to track orders" });
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err?.message?.includes("CORS")) {
    return res.status(401).json({ error: err.message });
  }
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Only start the server if we're not in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`herviva API running on http://localhost:${PORT}`);
    if (!razorpay) console.log("Razorpay not configured — COD orders only.");
    if (!supabase) console.log("Supabase not configured — DB operations will fail.");
  });
}

// Export the app for Vercel serverless functions
export default app;
