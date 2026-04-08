const { Router } = require("express");
const crypto = require("crypto");
const prisma = require("../db");
const { hashPassword, verifyPassword } = require("../lib/helpers");
const { createBagIdentity } = require("../lib/qr");
const { createSession, destroySession, getSession } = require("../lib/session");
const {
  serializeCustomer,
  getCustomerByEmail,
  getCustomerById,
  getOrdersForCustomer,
} = require("../lib/customer");
const { insertOrder } = require("../lib/order");
const { sendOrderConfirmation } = require("../../mailer");
const { formatMoney } = require("../lib/helpers");

const router = Router();

// POST /api/register  (alias: /api/auth/register)
async function handleRegister(req, res) {
  const body = req.body;
  const requiredFields = [
    "email",
    "firstName",
    "lastName",
    "address",
    "postalCode",
    "city",
    "password",
    "pickupDate",
    "pickupSlot",
    "laundryType",
  ];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const email = String(body.email).trim().toLowerCase();
  let customer = await getCustomerByEmail(email);
  const now = new Date();

  if (
    customer &&
    customer.passwordHash &&
    !verifyPassword(body.password, customer.passwordHash)
  ) {
    return res.status(400).json({
      error: "An account with this email already exists. Please sign in.",
    });
  }

  if (!customer) {
    const { bagCode, qrPayload, qrSvg } = await createBagIdentity();
    customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        email,
        firstName: String(body.firstName || "").trim() || "Pending",
        lastName: String(body.lastName || "").trim() || "Customer",
        address: String(body.address || "").trim() || "Address pending",
        postalCode: String(body.postalCode || "").trim() || "Pending",
        city: String(body.city || "").trim() || "Pending",
        phone: body.phone || null,
        bagCode,
        qrPayload,
        qrSvg,
        passwordHash: hashPassword(body.password),
        status: "active",
        lastLoginAt: now,
      },
    });
  } else {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        address: body.address,
        postalCode: body.postalCode,
        city: body.city,
        phone: body.phone || null,
        passwordHash: customer.passwordHash ?? hashPassword(body.password),
        lastLoginAt: now,
      },
    });
    customer = await getCustomerByEmail(email);
  }

  const order = await insertOrder(customer.id, body, customer);
  await createSession(res, "customer", customer.id);

  const serialized = serializeCustomer(customer);
  const orderPayload = {
    id: order.orderId,
    invoiceNumber: order.invoiceNumber,
    invoiceUrl: order.invoiceUrl,
    amount: formatMoney(order.amount),
    billingPlan: order.billingPlan,
    pickupDate: order.pickupDate,
    pickupSlot: order.pickupSlot,
    laundryType: order.laundryType,
    shirtsCount: order.shirtsCount,
    returnWindow: order.returnWindow,
    status: order.status,
  };

  res
    .status(201)
    .json({
      success: true,
      mode: "registered",
      customer: serialized,
      order: orderPayload,
    });

  sendOrderConfirmation({ customer: serialized, order: orderPayload }).catch(
    console.error,
  );
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const body = req.body;
  const requiredFields = [
    "email",
    "firstName",
    "lastName",
    "address",
    "postalCode",
    "city",
    "password",
  ];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const email = String(body.email).trim().toLowerCase();
  const existing = await getCustomerByEmail(email);
  if (existing) {
    return res.status(400).json({
      error: "An account with this email already exists. Please sign in.",
    });
  }

  const { bagCode, qrPayload, qrSvg } = await createBagIdentity();
  const customer = await prisma.customer.create({
    data: {
      id: crypto.randomUUID(),
      email,
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      address: String(body.address).trim(),
      postalCode: String(body.postalCode).trim(),
      city: String(body.city).trim(),
      phone: body.phone || null,
      bagCode,
      qrPayload,
      qrSvg,
      passwordHash: hashPassword(body.password),
      status: "active",
      lastLoginAt: new Date(),
    },
  });

  await createSession(res, "customer", customer.id);
  res.status(201).json({
    success: true,
    role: "customer",
    customer: serializeCustomer(customer),
    orders: [],
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const customer = await getCustomerByEmail(req.body.email || "");
  if (!customer || !verifyPassword(req.body.password, customer.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(res, "customer", customer.id);
  res.json({
    success: true,
    role: "customer",
    customer: serializeCustomer(customer),
    orders: await getOrdersForCustomer(customer.id),
  });
});

// POST /api/auth/start  — login or auto-create
router.post("/start", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  let customer = await getCustomerByEmail(email);

  if (!customer) {
    const { bagCode, qrPayload, qrSvg } = await createBagIdentity();
    customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        email,
        firstName: "Pending",
        lastName: "Customer",
        address: "Address pending",
        postalCode: "Pending",
        city: "Pending",
        bagCode,
        qrPayload,
        qrSvg,
        passwordHash: hashPassword(password),
        status: "active",
        lastLoginAt: new Date(),
      },
    });
    await createSession(res, "customer", customer.id);
    return res.json({
      success: true,
      mode: "signup",
      role: "customer",
      customer: serializeCustomer(customer),
      orders: [],
    });
  }

  if (!verifyPassword(password, customer.passwordHash)) {
    return res.status(401).json({ error: "Incorrect password for this email" });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(res, "customer", customer.id);
  res.json({
    success: true,
    mode: "login",
    role: "customer",
    customer: serializeCustomer(customer),
    orders: await getOrdersForCustomer(customer.id),
  });
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ success: true });
});

// GET /api/auth/session
router.get("/session", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.json({ authenticated: false });

  if (session.role === "customer") {
    const customer = await getCustomerById(session.userId);
    return res.json({
      authenticated: true,
      role: "customer",
      customer: serializeCustomer(customer),
      orders: await getOrdersForCustomer(customer.id),
    });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  const { getAdminOverviewData } = require("./admin");
  res.json({
    authenticated: true,
    role: "admin",
    admin,
    overview: await getAdminOverviewData(),
  });
});

module.exports = router;
module.exports.handleRegister = handleRegister;
