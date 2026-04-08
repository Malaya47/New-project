require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const { handleRegister } = require("./routes/auth");
const adminRouter = require("./routes/admin");
const ordersRouter = require("./routes/orders");
const bagRouter = require("./routes/bag");
const invoiceRouter = require("./routes/invoice");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

// ── Routes ──────────────────────────────────────────────────────────────────

// Register (both paths)
app.post("/api/register", handleRegister);
app.post("/api/auth/register", handleRegister);

// Auth routes: /api/auth/*
app.use("/api/auth", authRouter);

// Admin routes: /api/admin/*
app.use("/api/admin", adminRouter);

// Orders & registrations
app.use("/api", ordersRouter);

// Bag lookup: /api/bag/:code
app.use("/api/bag", bagRouter);

// Invoice HTML: /invoice/:id
app.use("/invoice", invoiceRouter);

// Invoice text: /invoice-text/:id  (legacy path — maps to /invoice/text/:id internally)
app.get("/invoice-text/:id", async (req, res) => {
  req.url = `/text/${req.params.id}`;
  invoiceRouter(req, res, () => res.status(404).send("Not found"));
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "laundry-backend" });
});

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Laundry backend running at http://${HOST}:${PORT}`);
  });
}

module.exports = app;
