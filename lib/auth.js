import db from "./db";
import { hashPassword } from "./utils";

export async function createSignup(req, res) {
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
    res
      .status(400)
      .json({
        error: "An account with this email already exists. Please sign in.",
      });
    return;
  }
  const now = new Date().toISOString();
  const customerId = crypto.randomUUID();
  // ...additional logic for bagCode, QR, etc. (copy from server.js)
  db.insertCustomer({
    id: customerId,
    email,
    firstName: body.firstName,
    lastName: body.lastName,
    address: body.address,
    postalCode: body.postalCode,
    city: body.city,
    passwordHash: hashPassword(body.password),
    createdAt: now,
    // ...other fields
  });
  // ...create session, etc.
  res.status(201).json({ success: true });
}

export async function handleLogin(req, res) {
  const body = req.body || (await parseBody(req));
  const customer = db.getCustomerByEmail(body.email || "");
  if (!customer || !db.verifyPassword(body.password, customer.password_hash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  db.updateCustomerLastLogin(customer.id);
  // TODO: Implement session creation for Vercel (JWT or cookie)
  res.status(200).json({
    success: true,
    role: "customer",
    customer: db.serializeCustomer(customer),
    orders: db.getOrdersForCustomer(customer.id),
  });
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  });
}
