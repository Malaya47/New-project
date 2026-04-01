const crypto = require("crypto");
const db = require("./db");
const {
  hashPassword,
  verifyPassword,
  parseBody,
  parseCookies,
  setCookie,
  clearCookie,
} = require("./utils");

const SESSION_COOKIE = "laundry_session";

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
    phone: customer.phone || "",
    bagCode: customer.bagCode,
    qrPayload: customer.qrPayload,
    qrSvg: customer.qrSvg,
    status: customer.status || "active",
    createdAt: customer.createdAt,
  };
}

function createSession(res, userId) {
  const session = db.insertSession({
    id: crypto.randomUUID(),
    userId,
    role: "customer",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  });

  setCookie(res, SESSION_COOKIE, session.id, { maxAge: 60 * 60 * 24 * 7 });
  return session;
}

async function createSignup(req, res) {
  const body = req.body || (await parseBody(req));
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
      res.status(400).json({ error: `${field} is required` });
      return;
    }
  }

  const email = String(body.email).trim().toLowerCase();
  const existingCustomer = db.getCustomerByEmail(email);
  if (existingCustomer) {
    res.status(400).json({
      error: "An account with this email already exists. Please sign in.",
    });
    return;
  }

  const now = new Date().toISOString();
  const customer = db.insertCustomer({
    id: crypto.randomUUID(),
    email,
    firstName: String(body.firstName).trim(),
    lastName: String(body.lastName).trim(),
    address: String(body.address).trim(),
    postalCode: String(body.postalCode).trim(),
    city: String(body.city).trim(),
    phone: body.phone ? String(body.phone).trim() : "",
    passwordHash: hashPassword(body.password),
    bagCode: db.createBagCode(),
    createdAt: now,
    lastLoginAt: now,
    status: "active",
  });

  createSession(res, customer.id);

  res.status(201).json({
    success: true,
    role: "customer",
    customer: serializeCustomer(customer),
    orders: db.getOrdersForCustomer(customer.id),
  });
}

async function handleLogin(req, res) {
  const body = req.body || (await parseBody(req));
  const customer = db.getCustomerByEmail(body.email || "");

  if (!customer || !verifyPassword(body.password, customer.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  db.updateCustomerLastLogin(customer.id);
  createSession(res, customer.id);

  res.status(200).json({
    success: true,
    role: "customer",
    customer: serializeCustomer(customer),
    orders: db.getOrdersForCustomer(customer.id),
  });
}

async function handleSession(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];

  if (!sessionId) {
    res.status(200).json({ authenticated: false });
    return;
  }

  const session = db.getSessionById(sessionId);
  if (!session) {
    clearCookie(res, SESSION_COOKIE);
    res.status(200).json({ authenticated: false });
    return;
  }

  const customer = db.getCustomerById(session.userId);
  if (!customer) {
    clearCookie(res, SESSION_COOKIE);
    res.status(200).json({ authenticated: false });
    return;
  }

  res.status(200).json({
    authenticated: true,
    role: "customer",
    customer: serializeCustomer(customer),
    orders: db.getOrdersForCustomer(customer.id),
  });
}

async function handleLogout(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  if (sessionId) {
    db.deleteSession(sessionId);
  }
  clearCookie(res, SESSION_COOKIE);
  res.status(200).json({ success: true });
}

module.exports = {
  createSignup,
  handleLogin,
  handleSession,
  handleLogout,
};
