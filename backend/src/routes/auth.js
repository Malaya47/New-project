const { Router } = require("express");
const crypto = require("crypto");
const prisma = require("../db");
const { hashPassword, verifyPassword } = require("../lib/helpers");
const { createSession, destroySession, getSession } = require("../lib/session");
const {
  serializeCustomer,
  getCustomerByEmail,
  getCustomerById,
  getOrdersForCustomer,
} = require("../lib/customer");
const { insertOrder } = require("../lib/order");
const { sendOrderConfirmation, sendOtpEmail } = require("../../mailer");
const { formatMoney } = require("../lib/helpers");

function makeBagCode() {
  return `LB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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
    const bagCode = makeBagCode();
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
        qrPayload: "",
        qrSvg: "",
        passwordHash: body.password ? hashPassword(body.password) : null,
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

  res.status(201).json({
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

  const bagCode = makeBagCode();
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
      qrPayload: "",
      qrSvg: "",
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
    const bagCode = makeBagCode();
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
        qrPayload: "",
        qrSvg: "",
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

// ─── OTP routes ───────────────────────────────────────────────────────────────

// POST /api/auth/otp/send
router.post("/otp/send", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const now = new Date();
  const existing = await prisma.otpCode.findUnique({ where: { email } });
  if (existing && now - new Date(existing.sentAt) < 60_000) {
    return res
      .status(429)
      .json({ error: "Please wait a moment before requesting another code." });
  }

  const otp = generateOtp();
  await prisma.otpCode.upsert({
    where: { email },
    create: {
      id: crypto.randomUUID(),
      email,
      otp,
      verified: false,
      sentAt: now,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    update: {
      otp,
      verified: false,
      sentAt: now,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  console.log(`[OTP] ${email} → ${otp}`);
  await sendOtpEmail(email, otp);

  res.json({ success: true, message: "Verification code sent to your email." });
});

// POST /api/auth/otp/verify
router.post("/otp/verify", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  const entry = await prisma.otpCode.findUnique({ where: { email } });
  if (!entry || new Date(entry.expiresAt) < new Date()) {
    return res
      .status(400)
      .json({ error: "OTP has expired. Please request a new one." });
  }
  if (entry.otp !== otp) {
    return res
      .status(400)
      .json({ error: "Incorrect code. Please check your email." });
  }

  // Mark verified; extend expiry by 15 min for profile submission
  await prisma.otpCode.update({
    where: { email },
    data: {
      otp: null,
      verified: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  res.json({ success: true, verified: true });
});

// POST /api/auth/otp/register  — saves profile after OTP verification
router.post("/otp/register", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const firstName = String(req.body.firstName || "").trim();
  const lastName = String(req.body.lastName || "").trim();
  const address = String(req.body.address || "").trim();
  const postalCode = String(req.body.postalCode || "").trim();
  const city = String(req.body.city || "").trim();
  const phone = req.body.phone ? String(req.body.phone).trim() : null;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const entry = await prisma.otpCode.findUnique({ where: { email } });
  if (!entry || !entry.verified || new Date(entry.expiresAt) < new Date()) {
    return res.status(400).json({
      error: "Email not verified. Please complete OTP verification first.",
    });
  }

  if (!firstName || !lastName || !address) {
    return res
      .status(400)
      .json({ error: "First name, last name, and address are required." });
  }

  let customer = await getCustomerByEmail(email);

  if (!customer) {
    const bagCode = makeBagCode();
    customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName,
        address,
        postalCode: postalCode || "Pending",
        city: city || "Pending",
        phone,
        bagCode,
        qrPayload: "",
        qrSvg: "",
        status: "active",
        lastLoginAt: new Date(),
      },
    });
  } else {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        firstName: firstName || customer.firstName,
        lastName: lastName || customer.lastName,
        address: address || customer.address,
        postalCode: postalCode || customer.postalCode,
        city: city || customer.city,
        phone: phone ?? customer.phone,
        lastLoginAt: new Date(),
      },
    });
    customer = await getCustomerByEmail(email);
  }

  await prisma.otpCode.delete({ where: { email } });
  await createSession(res, "customer", customer.id);

  res
    .status(201)
    .json({ success: true, customer: serializeCustomer(customer) });
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
