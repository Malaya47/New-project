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
const {
  createOrderRecord,
  serializeOrder,
  createInvoiceHtml,
  createInvoiceText,
} = require("./orders");

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

function createSession(res, userId, role = "customer") {
  const session = db.insertSession({
    id: crypto.randomUUID(),
    userId,
    role,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  });

  setCookie(res, SESSION_COOKIE, session.id, { maxAge: 60 * 60 * 24 * 7 });
  return session;
}

function serializeAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
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

async function handleRegister(req, res) {
  const body = req.body || (await parseBody(req));
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
      res.status(400).json({ error: `${field} is required` });
      return;
    }
  }

  const email = String(body.email).trim().toLowerCase();
  let customer = db.getCustomerByEmail(email);

  if (customer && customer.passwordHash && !verifyPassword(body.password, customer.passwordHash)) {
    res.status(400).json({
      error: "An account with this email already exists. Please sign in.",
    });
    return;
  }

  if (!customer) {
    const now = new Date().toISOString();
    customer = db.insertCustomer({
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
  } else {
    customer = db.updateCustomerLastLogin(customer.id) || customer;
  }

  const order = createOrderRecord(customer, body);
  createSession(res, customer.id);

  res.status(201).json({
    success: true,
    mode: "registered",
    customer: serializeCustomer(customer),
    order: serializeOrder(order),
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

async function handleAdminLogin(req, res) {
  const body = req.body || (await parseBody(req));
  const admin = db.getAdminByEmail(body.email || "");

  if (!admin || !verifyPassword(body.password, admin.passwordHash)) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  createSession(res, admin.id, "admin");

  res.status(200).json({
    success: true,
    role: "admin",
    admin: serializeAdmin(admin),
    overview: db.getAdminOverview(),
  });
}

async function handleRepeatPickup(req, res) {
  const body = req.body || (await parseBody(req));
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  const session = sessionId ? db.getSessionById(sessionId) : null;

  let customer = null;
  if (session?.role === "customer") {
    customer = db.getCustomerById(session.userId);
  } else if (body.bagCode) {
    customer = db.getCustomerByBagCode(body.bagCode);
  }

  if (!customer) {
    res.status(404).json({ error: "Bag code not found. Please register first." });
    return;
  }

  const requiredFields = ["pickupDate", "pickupSlot", "laundryType"];
  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      res.status(400).json({ error: `${field} is required` });
      return;
    }
  }

  const order = createOrderRecord(customer, body);
  res.status(201).json({
    success: true,
    customer: serializeCustomer(customer),
    order: serializeOrder(order),
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

  if (session.role === "admin") {
    const admin = db.getAdminById(session.userId);
    if (!admin) {
      clearCookie(res, SESSION_COOKIE);
      res.status(200).json({ authenticated: false });
      return;
    }

    res.status(200).json({
      authenticated: true,
      role: "admin",
      admin: serializeAdmin(admin),
      overview: db.getAdminOverview(),
    });
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

async function handleAdminOverview(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  const session = sessionId ? db.getSessionById(sessionId) : null;

  if (!session || session.role !== "admin") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  res.status(200).json(db.getAdminOverview());
}

async function handleAdminOrderUpdate(req, res, orderId) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  const session = sessionId ? db.getSessionById(sessionId) : null;

  if (!session || session.role !== "admin") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body || (await parseBody(req));
  const validStatuses = ["scheduled", "picked_up", "processing", "returning", "completed"];
  const status = String(body.status || "").trim();

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid order status" });
    return;
  }

  const order = db.updateOrderStatus(orderId, status);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.status(200).json({ success: true, overview: db.getAdminOverview() });
}

async function handleInvoice(req, res, orderId) {
  const order = db.getOrderById(orderId);
  if (!order) {
    res.status(404).send("<h1>Invoice not found</h1>");
    return;
  }

  const customer = db.getCustomerById(order.customerId);
  if (!customer) {
    res.status(404).send("<h1>Customer not found</h1>");
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(createInvoiceHtml(customer, order));
}

async function handleInvoiceText(req, res, orderId) {
  const order = db.getOrderById(orderId);
  if (!order) {
    res.status(404).send("Invoice not found");
    return;
  }

  const customer = db.getCustomerById(order.customerId);
  if (!customer) {
    res.status(404).send("Customer not found");
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(createInvoiceText(customer, order));
}

module.exports = {
  createSignup,
  handleRegister,
  handleLogin,
  handleAdminLogin,
  handleRepeatPickup,
  handleSession,
  handleLogout,
  handleAdminOverview,
  handleAdminOrderUpdate,
  handleInvoice,
  handleInvoiceText,
};
