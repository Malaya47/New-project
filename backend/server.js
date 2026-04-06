require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const QRCode = require("qrcode");
const { sendOrderConfirmation, sendStatusUpdate } = require("./mailer");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 5000);
const APP_BASE_URL = process.env.APP_BASE_URL || "https://laundry.li";
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "..", "data");
const DB_PATH = path.join(DATA_DIR, "laundry.sqlite");
const SESSION_COOKIE = "laundry_session";
const DEFAULT_RETURN_WINDOW = "Within 48 hours between 6:00 PM and 9:00 PM";
const DEFAULT_BILLING_PLAN = "single";
const ADMIN_EMAIL = "admin@laundry.li";
const ADMIN_PASSWORD = "LaundryAdmin123!";
const ORDER_STATUSES = [
  "scheduled",
  "picked_up",
  "processing",
  "returning",
  "completed",
];

fs.mkdirSync(DATA_DIR, { recursive: true });

function sqlEscape(value) {
  if (value === undefined || value === null || value === "") {
    return "NULL";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function dbRun(sql) {
  return execFileSync("sqlite3", ["-cmd", ".timeout 5000", DB_PATH, sql], {
    encoding: "utf8",
  });
}

function dbGet(sql) {
  const output = execFileSync(
    "sqlite3",
    ["-json", "-cmd", ".timeout 5000", DB_PATH, sql],
    {
      encoding: "utf8",
    },
  );

  return output.trim() ? JSON.parse(output) : [];
}

function ensureColumn(tableName, columnName, definition) {
  const columns = dbGet(`PRAGMA table_info(${tableName});`);
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    dbRun(`ALTER TABLE ${tableName} ADD COLUMN ${definition};`);
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || !password) return false;

  const [salt, hash] = passwordHash.split(":");
  if (!salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(derived, "hex"),
  );
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index === -1) return cookies;
      const key = part.slice(0, index);
      const value = decodeURIComponent(part.slice(index + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  } else {
    parts.push("SameSite=Lax");
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
  setCookie(res, name, "", { maxAge: 0 });
}

function initDatabase() {
  dbRun(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT,
      bag_code TEXT NOT NULL UNIQUE,
      qr_payload TEXT NOT NULL,
      qr_svg TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      pickup_slot TEXT NOT NULL,
      laundry_type TEXT NOT NULL,
      shirts_count INTEGER NOT NULL,
      notes TEXT,
      amount REAL NOT NULL,
      invoice_number TEXT NOT NULL UNIQUE,
      invoice_html TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  ensureColumn("customers", "password_hash", "password_hash TEXT");
  ensureColumn("customers", "status", "status TEXT DEFAULT 'active'");
  ensureColumn("customers", "last_login_at", "last_login_at TEXT");

  ensureColumn("orders", "status", "status TEXT DEFAULT 'scheduled'");
  ensureColumn("orders", "return_window", "return_window TEXT");
  ensureColumn("orders", "invoice_text", "invoice_text TEXT");
  ensureColumn("orders", "updated_at", "updated_at TEXT");
  ensureColumn("orders", "billing_plan", "billing_plan TEXT DEFAULT 'single'");

  seedAdmin();
}

function seedAdmin() {
  const existing = dbGet(
    `SELECT id FROM admins WHERE email = ${sqlEscape(ADMIN_EMAIL)} LIMIT 1;`,
  )[0];

  if (!existing) {
    const now = new Date().toISOString();
    dbRun(`
      INSERT INTO admins (id, email, name, password_hash, created_at)
      VALUES (
        ${sqlEscape(crypto.randomUUID())},
        ${sqlEscape(ADMIN_EMAIL)},
        'Operations Admin',
        ${sqlEscape(hashPassword(ADMIN_PASSWORD))},
        ${sqlEscape(now)}
      );
    `);
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeLabel(value) {
  return String(value)
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function calculateAmounts(shirtsCount, billingPlan = DEFAULT_BILLING_PLAN) {
  const normalizedPlan =
    billingPlan === "subscription" ? "subscription" : "single";
  const baseAmount = normalizedPlan === "subscription" ? 50 : 55;
  const addOnAmount = Number(shirtsCount || 0) * 4;
  const amount = baseAmount + addOnAmount;
  return { baseAmount, addOnAmount, amount, billingPlan: normalizedPlan };
}

function createInvoiceHtml(record) {
  const notes = record.notes ? record.notes : "No special instructions";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${record.invoiceNumber}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #2f241a;
      --muted: #7a6654;
      --line: #d9c3ac;
      --paper: #fffdf8;
      --gold: #bb8a52;
      --gold-dark: #8d6437;
      --panel: #fff7ee;
      --chip: #f8ebdb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background: linear-gradient(180deg, #f9efe2, #fffdf9);
      padding: 32px 16px;
    }
    .invoice {
      max-width: 920px;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(96, 60, 25, 0.12);
    }
    .hero {
      padding: 32px;
      background: linear-gradient(135deg, #f6eadc, #fff8ef);
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
    }
    .brand {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
    }
    .sub {
      margin: 0;
      color: var(--muted);
      font-family: Arial, sans-serif;
    }
    .status {
      padding: 10px 14px;
      border-radius: 999px;
      background: var(--chip);
      border: 1px solid var(--line);
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: var(--muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      padding: 28px 32px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 20px;
    }
    h2 {
      margin: 0 0 14px;
      font-size: 18px;
    }
    dl {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px 14px;
      margin: 0;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      font-weight: 600;
    }
    .totals {
      padding: 0 32px 32px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, sans-serif;
      font-size: 14px;
      overflow: hidden;
      border-radius: 20px;
      border: 1px solid var(--line);
    }
    th, td {
      padding: 14px 18px;
      border-bottom: 1px solid var(--line);
      text-align: left;
    }
    th {
      background: #f9efe5;
      color: var(--muted);
      font-weight: 600;
    }
    tr:last-child td {
      border-bottom: 0;
    }
    .amount {
      text-align: right;
      font-weight: 700;
    }
    .summary {
      display: flex;
      justify-content: flex-end;
      margin-top: 18px;
    }
    .summary-box {
      min-width: 300px;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      color: white;
      border-radius: 20px;
      padding: 18px 22px;
      font-family: Arial, sans-serif;
    }
    .summary-box div {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      padding: 6px 0;
    }
    .footer {
      padding: 0 32px 32px;
      color: var(--muted);
      font-family: Arial, sans-serif;
      font-size: 13px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 0 32px 24px;
    }
    button {
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      color: white;
      font-weight: 700;
    }
    .ghost {
      background: white;
      color: var(--ink);
      border: 1px solid var(--line);
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice {
        box-shadow: none;
        border-radius: 0;
        border: 0;
      }
      .actions {
        display: none;
      }
    }
    @media (max-width: 720px) {
      .hero {
        flex-direction: column;
      }
      .grid {
        grid-template-columns: 1fr;
        padding: 20px;
      }
      .hero, .totals, .footer, .actions {
        padding-left: 20px;
        padding-right: 20px;
      }
      dl {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="hero">
      <div>
        <p class="brand">laundry.li</p>
        <p class="sub">Premium laundry pickup and Swiss monthly billing invoice</p>
      </div>
      <div class="status">Status: ${normalizeLabel(record.status)}</div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Invoice Details</h2>
        <dl>
          <dt>Invoice number</dt>
          <dd>${record.invoiceNumber}</dd>
          <dt>Issued on</dt>
          <dd>${record.createdAt}</dd>
          <dt>Pickup date</dt>
          <dd>${record.pickupDate}</dd>
          <dt>Time slot</dt>
          <dd>${record.pickupSlot}</dd>
          <dt>Bag code</dt>
          <dd>${record.bagCode}</dd>
          <dt>Return window</dt>
          <dd>${record.returnWindow}</dd>
          <dt>Billing plan</dt>
          <dd>${normalizeLabel(record.billingPlan)}</dd>
        </dl>
      </article>

      <article class="card">
        <h2>Customer</h2>
        <dl>
          <dt>Name</dt>
          <dd>${record.fullName}</dd>
          <dt>Email</dt>
          <dd>${record.email}</dd>
          <dt>Address</dt>
          <dd>${record.address}, ${record.city} ${record.postalCode}</dd>
          <dt>Phone</dt>
          <dd>${record.phone || "Not provided"}</dd>
          <dt>Laundry type</dt>
          <dd>${record.laundryType}</dd>
          <dt>Order status</dt>
          <dd>${normalizeLabel(record.status)}</dd>
          <dt>Billing</dt>
          <dd>${record.billingPlan === "subscription" ? "Subscription bag" : "One-time order"}</dd>
        </dl>
      </article>
    </section>

    <section class="totals">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Notes</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${record.billingPlan === "subscription" ? "Weekly subscription bag" : "One-time laundry bag"}</td>
            <td>${record.billingPlan === "subscription" ? "Fixed weekly pickup with preferred price" : "Pickup, wash, dry, iron, fold, and return within 48 hours"}</td>
            <td class="amount">${formatMoney(record.baseAmount)}</td>
          </tr>
          <tr>
            <td>Shirts / blouses add-on (${record.shirtsCount})</td>
            <td>${record.shirtsCount > 0 ? "Pressed individually" : "None added"}</td>
            <td class="amount">${formatMoney(record.addOnAmount)}</td>
          </tr>
          <tr>
            <td>Special instructions</td>
            <td>${notes}</td>
            <td class="amount">${formatMoney(0)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-box">
          <div><span>Subtotal</span><strong>${formatMoney(record.amount)}</strong></div>
          <div><span>Payment</span><strong>Collected by monthly invoice</strong></div>
          <div><span>Total due</span><strong>${formatMoney(record.amount)}</strong></div>
        </div>
      </div>
    </section>

    <section class="footer">
      <p>This invoice was generated automatically after the pickup booking was confirmed.</p>
      <p>Use the QR-linked bag code for future repeat pickups and keep your details unchanged unless your address changes.</p>
    </section>

    <div class="actions">
      <button class="ghost" onclick="navigator.clipboard && navigator.clipboard.writeText(document.documentElement.outerHTML)">Copy invoice HTML</button>
      <button onclick="window.print()">Print invoice</button>
    </div>
  </main>

  <script>
    window.addEventListener("load", () => {
      const autoprint = new URLSearchParams(window.location.search).get("print");
      if (autoprint !== "0") {
        setTimeout(() => window.print(), 250);
      }
    });
  </script>
</body>
</html>`;
}

function createInvoiceText(record) {
  return [
    `Invoice ${record.invoiceNumber}`,
    `Customer: ${record.fullName}`,
    `Email: ${record.email}`,
    `Bag code: ${record.bagCode}`,
    `Pickup: ${record.pickupDate} | ${record.pickupSlot}`,
    `Laundry type: ${record.laundryType}`,
    `Billing plan: ${record.billingPlan === "subscription" ? "Subscription" : "One-time order"}`,
    `Shirts add-on: ${record.shirtsCount}`,
    `Notes: ${record.notes || "No special instructions"}`,
    `Status: ${normalizeLabel(record.status)}`,
    `Total due: ${formatMoney(record.amount)}`,
  ].join("\n");
}

function getOrderRecord(orderId) {
  return dbGet(`
    SELECT
      o.id,
      o.customer_id,
      o.pickup_date,
      o.pickup_slot,
      o.laundry_type,
      o.shirts_count,
      o.notes,
      o.amount,
      o.invoice_number,
      o.invoice_html,
      o.invoice_text,
      o.status,
      COALESCE(o.billing_plan, '${DEFAULT_BILLING_PLAN}') AS billing_plan,
      COALESCE(o.return_window, '${DEFAULT_RETURN_WINDOW}') AS return_window,
      o.created_at,
      c.first_name,
      c.last_name,
      c.email,
      c.address,
      c.city,
      c.postal_code,
      c.phone,
      c.bag_code
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ${sqlEscape(orderId)}
    LIMIT 1;
  `)[0];
}

function buildInvoiceRecordFromRow(row) {
  const { baseAmount, addOnAmount } = calculateAmounts(
    row.shirts_count,
    row.billing_plan,
  );
  return {
    invoiceNumber: row.invoice_number,
    createdAt: new Date(row.created_at).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pickupDate: row.pickup_date,
    pickupSlot: row.pickup_slot,
    laundryType: normalizeLabel(row.laundry_type),
    shirtsCount: Number(row.shirts_count || 0),
    notes: row.notes || "",
    baseAmount,
    addOnAmount,
    amount: Number(row.amount || 0),
    billingPlan: row.billing_plan || DEFAULT_BILLING_PLAN,
    returnWindow: row.return_window || DEFAULT_RETURN_WINDOW,
    bagCode: row.bag_code,
    fullName: `${row.first_name} ${row.last_name}`,
    email: row.email,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    phone: row.phone || "",
    status: row.status || "scheduled",
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function createSession(res, role, userId) {
  const sessionId = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 7);

  dbRun(`
    INSERT INTO sessions (id, user_id, role, created_at, expires_at)
    VALUES (
      ${sqlEscape(sessionId)},
      ${sqlEscape(userId)},
      ${sqlEscape(role)},
      ${sqlEscape(createdAt.toISOString())},
      ${sqlEscape(expiresAt.toISOString())}
    );
  `);

  setCookie(res, SESSION_COOKIE, sessionId, { maxAge: 60 * 60 * 24 * 7 });
}

function destroySession(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];

  if (sessionId) {
    dbRun(`DELETE FROM sessions WHERE id = ${sqlEscape(sessionId)};`);
  }

  clearCookie(res, SESSION_COOKIE);
}

function getSession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];

  if (!sessionId) return null;

  const session = dbGet(`
    SELECT id, user_id, role, expires_at
    FROM sessions
    WHERE id = ${sqlEscape(sessionId)}
    LIMIT 1;
  `)[0];

  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    dbRun(`DELETE FROM sessions WHERE id = ${sqlEscape(sessionId)};`);
    return null;
  }

  return session;
}

function getCustomerById(customerId) {
  return dbGet(`
    SELECT id, email, first_name, last_name, address, postal_code, city, phone,
           bag_code, qr_payload, qr_svg, status, created_at
    FROM customers
    WHERE id = ${sqlEscape(customerId)}
    LIMIT 1;
  `)[0];
}

function getCustomerByEmail(email) {
  return dbGet(`
    SELECT *
    FROM customers
    WHERE email = ${sqlEscape(String(email).trim().toLowerCase())}
    LIMIT 1;
  `)[0];
}

function getCustomerByBagCode(bagCode) {
  return dbGet(`
    SELECT *
    FROM customers
    WHERE bag_code = ${sqlEscape(String(bagCode).trim().toUpperCase())}
    LIMIT 1;
  `)[0];
}

function getAdminByEmail(email) {
  return dbGet(`
    SELECT *
    FROM admins
    WHERE email = ${sqlEscape(String(email).trim().toLowerCase())}
    LIMIT 1;
  `)[0];
}

async function createBagIdentity() {
  const bagCode = `LB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const qrPayload = `${APP_BASE_URL}/bag/${bagCode}`;
  const qrSvg = await QRCode.toString(qrPayload, {
    type: "svg",
    margin: 1,
    width: 240,
    color: {
      dark: "#6b4d2f",
      light: "#0000",
    },
  });

  return { bagCode, qrPayload, qrSvg };
}

function insertCustomerRecord({
  customerId,
  email,
  firstName = "",
  lastName = "",
  address = "",
  postalCode = "",
  city = "",
  phone = null,
  bagCode,
  qrPayload,
  qrSvg,
  passwordHash,
  now,
}) {
  const safeFirstName = String(firstName || "").trim() || "Pending";
  const safeLastName = String(lastName || "").trim() || "Customer";
  const safeAddress = String(address || "").trim() || "Address pending";
  const safePostalCode = String(postalCode || "").trim() || "Pending";
  const safeCity = String(city || "").trim() || "Pending";

  dbRun(`
    INSERT INTO customers (
      id, email, first_name, last_name, address, postal_code, city, phone,
      bag_code, qr_payload, qr_svg, created_at, password_hash, status, last_login_at
    ) VALUES (
      ${sqlEscape(customerId)},
      ${sqlEscape(email)},
      ${sqlEscape(safeFirstName)},
      ${sqlEscape(safeLastName)},
      ${sqlEscape(safeAddress)},
      ${sqlEscape(safePostalCode)},
      ${sqlEscape(safeCity)},
      ${sqlEscape(phone)},
      ${sqlEscape(bagCode)},
      ${sqlEscape(qrPayload)},
      ${sqlEscape(qrSvg)},
      ${sqlEscape(now)},
      ${sqlEscape(passwordHash)},
      'active',
      ${sqlEscape(now)}
    );
  `);
}

function buildOrderPayload({ customer, body }) {
  const shirtsCount = Number(body.shirtsCount || 0);
  const { baseAmount, addOnAmount, amount, billingPlan } = calculateAmounts(
    shirtsCount,
    body.billingPlan || DEFAULT_BILLING_PLAN,
  );
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();
  const record = {
    orderId: crypto.randomUUID(),
    invoiceNumber,
    createdAt: new Date(now).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pickupDate: body.pickupDate,
    pickupSlot: body.pickupSlot,
    laundryType: normalizeLabel(body.laundryType),
    shirtsCount,
    notes: body.notes || "",
    baseAmount,
    addOnAmount,
    amount,
    billingPlan,
    returnWindow: DEFAULT_RETURN_WINDOW,
    bagCode: customer.bag_code,
    fullName: `${customer.first_name} ${customer.last_name}`,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postal_code,
    phone: customer.phone || "",
    status: "scheduled",
  };

  return record;
}

function insertOrder(customerId, body, customer) {
  const record = buildOrderPayload({ customer, body });
  const invoiceHtml = createInvoiceHtml(record);
  const invoiceText = createInvoiceText(record);
  const now = new Date().toISOString();

  dbRun(`
    INSERT INTO orders (
      id, customer_id, pickup_date, pickup_slot, laundry_type, shirts_count,
      notes, amount, invoice_number, invoice_html, invoice_text, created_at,
      status, return_window, updated_at, billing_plan
    ) VALUES (
      ${sqlEscape(record.orderId)},
      ${sqlEscape(customerId)},
      ${sqlEscape(body.pickupDate)},
      ${sqlEscape(body.pickupSlot)},
      ${sqlEscape(body.laundryType)},
      ${record.shirtsCount},
      ${sqlEscape(body.notes || null)},
      ${record.amount},
      ${sqlEscape(record.invoiceNumber)},
      ${sqlEscape(invoiceHtml)},
      ${sqlEscape(invoiceText)},
      ${sqlEscape(now)},
      ${sqlEscape(record.status)},
      ${sqlEscape(record.returnWindow)},
      ${sqlEscape(now)},
      ${sqlEscape(record.billingPlan)}
    );
  `);

  return {
    ...record,
    invoiceHtml,
    invoiceText,
    invoiceUrl: `/invoice/${record.orderId}`,
  };
}

function getOrdersForCustomer(customerId) {
  return dbGet(`
    SELECT id, invoice_number, pickup_date, pickup_slot, laundry_type, shirts_count,
           notes, amount, status,
           COALESCE(billing_plan, '${DEFAULT_BILLING_PLAN}') AS billing_plan,
           COALESCE(return_window, '${DEFAULT_RETURN_WINDOW}') AS return_window,
           created_at
    FROM orders
    WHERE customer_id = ${sqlEscape(customerId)}
    ORDER BY created_at DESC
    LIMIT 12;
  `);
}

function cleanCustomerProfileValue(value, placeholder) {
  return value === placeholder ? "" : value;
}

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: cleanCustomerProfileValue(customer.first_name, "Pending"),
    lastName: cleanCustomerProfileValue(customer.last_name, "Customer"),
    address: cleanCustomerProfileValue(customer.address, "Address pending"),
    postalCode: cleanCustomerProfileValue(customer.postal_code, "Pending"),
    city: cleanCustomerProfileValue(customer.city, "Pending"),
    phone: customer.phone,
    bagCode: customer.bag_code,
    qrPayload: customer.qr_payload,
    qrSvg: customer.qr_svg,
    status: customer.status,
    createdAt: customer.created_at,
  };
}

function requireSession(req, res, role) {
  const session = getSession(req);
  if (!session || (role && session.role !== role)) {
    sendJson(res, 401, { error: "Authentication required" });
    return null;
  }
  return session;
}

async function handleRegister(req, res) {
  try {
    const body = await parseBody(req);
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
        sendJson(res, 400, { error: `${field} is required` });
        return;
      }
    }

    const email = String(body.email).trim().toLowerCase();
    let customer = getCustomerByEmail(email);
    const now = new Date().toISOString();

    if (
      customer &&
      customer.password_hash &&
      !verifyPassword(body.password, customer.password_hash)
    ) {
      sendJson(res, 400, {
        error: "An account with this email already exists. Please sign in.",
      });
      return;
    }

    if (!customer) {
      const customerId = crypto.randomUUID();
      const { bagCode, qrPayload, qrSvg } = await createBagIdentity();

      insertCustomerRecord({
        customerId,
        email,
        firstName: body.firstName,
        lastName: body.lastName,
        address: body.address,
        postalCode: body.postalCode,
        city: body.city,
        phone: body.phone || null,
        bagCode,
        qrPayload,
        qrSvg,
        passwordHash: hashPassword(body.password),
        now,
      });
    } else {
      dbRun(`
        UPDATE customers
        SET first_name = ${sqlEscape(body.firstName)},
            last_name = ${sqlEscape(body.lastName)},
            address = ${sqlEscape(body.address)},
            postal_code = ${sqlEscape(body.postalCode)},
            city = ${sqlEscape(body.city)},
            phone = ${sqlEscape(body.phone || null)},
            password_hash = COALESCE(password_hash, ${sqlEscape(hashPassword(body.password))}),
            last_login_at = ${sqlEscape(now)}
        WHERE id = ${sqlEscape(customer.id)};
      `);
    }

    customer = getCustomerByEmail(email);
    const order = insertOrder(customer.id, body, customer);
    createSession(res, "customer", customer.id);

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

    sendJson(res, 201, {
      success: true,
      mode: "registered",
      customer: serialized,
      order: orderPayload,
    });

    // fire-and-forget emails
    sendOrderConfirmation({ customer: serialized, order: orderPayload }).catch(
      console.error,
    );
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to create registration" });
  }
}

async function handleSignup(req, res) {
  try {
    const body = await parseBody(req);
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
        sendJson(res, 400, { error: `${field} is required` });
        return;
      }
    }

    const email = String(body.email).trim().toLowerCase();
    const existingCustomer = getCustomerByEmail(email);
    if (existingCustomer) {
      sendJson(res, 400, {
        error: "An account with this email already exists. Please sign in.",
      });
      return;
    }

    const now = new Date().toISOString();
    const customerId = crypto.randomUUID();
    const { bagCode, qrPayload, qrSvg } = await createBagIdentity();

    insertCustomerRecord({
      customerId,
      email,
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      postalCode: body.postalCode,
      city: body.city,
      phone: body.phone || null,
      bagCode,
      qrPayload,
      qrSvg,
      passwordHash: hashPassword(body.password),
      now,
    });

    const customer = getCustomerByEmail(email);
    createSession(res, "customer", customer.id);

    sendJson(res, 201, {
      success: true,
      role: "customer",
      customer: serializeCustomer(customer),
      orders: [],
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to create account" });
  }
}

async function handleCustomerLogin(req, res) {
  try {
    const body = await parseBody(req);
    const customer = getCustomerByEmail(body.email || "");

    if (!customer || !verifyPassword(body.password, customer.password_hash)) {
      sendJson(res, 401, { error: "Invalid email or password" });
      return;
    }

    dbRun(`
      UPDATE customers
      SET last_login_at = ${sqlEscape(new Date().toISOString())}
      WHERE id = ${sqlEscape(customer.id)};
    `);

    createSession(res, "customer", customer.id);
    sendJson(res, 200, {
      success: true,
      role: "customer",
      customer: serializeCustomer(customer),
      orders: getOrdersForCustomer(customer.id),
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to sign in" });
  }
}

async function handleCustomerStart(req, res) {
  try {
    const body = await parseBody(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      sendJson(res, 400, { error: "email and password are required" });
      return;
    }

    const customer = getCustomerByEmail(email);

    if (!customer) {
      const now = new Date().toISOString();
      const customerId = crypto.randomUUID();
      const { bagCode, qrPayload, qrSvg } = await createBagIdentity();

      insertCustomerRecord({
        customerId,
        email,
        bagCode,
        qrPayload,
        qrSvg,
        passwordHash: hashPassword(password),
        now,
      });

      const createdCustomer = getCustomerByEmail(email);
      createSession(res, "customer", createdCustomer.id);

      sendJson(res, 200, {
        success: true,
        mode: "signup",
        role: "customer",
        customer: serializeCustomer(createdCustomer),
        orders: [],
      });
      return;
    }

    if (!verifyPassword(password, customer.password_hash)) {
      sendJson(res, 401, { error: "Incorrect password for this email" });
      return;
    }

    dbRun(`
      UPDATE customers
      SET last_login_at = ${sqlEscape(new Date().toISOString())}
      WHERE id = ${sqlEscape(customer.id)};
    `);

    createSession(res, "customer", customer.id);
    sendJson(res, 200, {
      success: true,
      mode: "login",
      role: "customer",
      customer: serializeCustomer(customer),
      orders: getOrdersForCustomer(customer.id),
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to start account flow" });
  }
}

async function handleAdminLogin(req, res) {
  try {
    const body = await parseBody(req);
    const admin = getAdminByEmail(body.email || "");

    if (!admin || !verifyPassword(body.password, admin.password_hash)) {
      sendJson(res, 401, { error: "Invalid admin credentials" });
      return;
    }

    createSession(res, "admin", admin.id);
    sendJson(res, 200, {
      success: true,
      role: "admin",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      overview: getAdminOverviewData(),
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to sign in as admin" });
  }
}

function handleLogout(req, res) {
  destroySession(req, res);
  sendJson(res, 200, { success: true });
}

function handleSession(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 200, { authenticated: false });
    return;
  }

  if (session.role === "customer") {
    const customer = getCustomerById(session.user_id);
    sendJson(res, 200, {
      authenticated: true,
      role: "customer",
      customer: serializeCustomer(customer),
      orders: getOrdersForCustomer(customer.id),
    });
    return;
  }

  const admin = dbGet(`
    SELECT id, email, name
    FROM admins
    WHERE id = ${sqlEscape(session.user_id)}
    LIMIT 1;
  `)[0];

  sendJson(res, 200, {
    authenticated: true,
    role: "admin",
    admin,
    overview: getAdminOverviewData(),
  });
}

async function handleRepeatPickup(req, res) {
  try {
    const body = await parseBody(req);
    let customer = null;
    const session = getSession(req);

    if (session?.role === "customer") {
      customer = getCustomerById(session.user_id);
    } else if (body.bagCode) {
      customer = getCustomerByBagCode(body.bagCode);
    }

    if (!customer) {
      sendJson(res, 404, {
        error: "Bag code not found. Please register first.",
      });
      return;
    }

    const requiredFields = ["pickupDate", "pickupSlot", "laundryType"];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        sendJson(res, 400, { error: `${field} is required` });
        return;
      }
    }

    const order = insertOrder(customer.id, body, customer);
    const serializedRepeat = serializeCustomer(customer);
    const repeatOrderPayload = {
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
    sendJson(res, 201, {
      success: true,
      customer: serializedRepeat,
      order: {
        id: repeatOrderPayload.orderId,
        invoiceNumber: repeatOrderPayload.invoiceNumber,
        invoiceUrl: repeatOrderPayload.invoiceUrl,
        amount: repeatOrderPayload.amount,
        billingPlan: repeatOrderPayload.billingPlan,
        pickupDate: repeatOrderPayload.pickupDate,
        pickupSlot: repeatOrderPayload.pickupSlot,
        returnWindow: repeatOrderPayload.returnWindow,
        status: repeatOrderPayload.status,
      },
    });

    // fire-and-forget emails
    sendOrderConfirmation({
      customer: serializedRepeat,
      order: repeatOrderPayload,
    }).catch(console.error);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to create repeat pickup" });
  }
}

function handleRegistrations(res) {
  try {
    const rows = dbGet(`
      SELECT
        o.id,
        o.invoice_number,
        o.pickup_date,
        o.pickup_slot,
        o.laundry_type,
        o.amount,
        o.status,
        COALESCE(o.billing_plan, '${DEFAULT_BILLING_PLAN}') AS billing_plan,
        COALESCE(o.return_window, '${DEFAULT_RETURN_WINDOW}') AS return_window,
        c.first_name,
        c.last_name,
        c.email,
        c.bag_code
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 20;
    `);

    sendJson(res, 200, rows);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to fetch registrations" });
  }
}

function getAdminOverviewData() {
  const stats = dbGet(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COALESCE(SUM(amount), 0) FROM orders) AS revenue,
      (SELECT COUNT(*) FROM orders WHERE status != 'completed') AS active_orders;
  `)[0];

  const recentOrders = dbGet(`
    SELECT
      o.id,
      o.invoice_number,
      o.pickup_date,
      o.pickup_slot,
      o.laundry_type,
      o.amount,
      o.status,
      COALESCE(o.billing_plan, '${DEFAULT_BILLING_PLAN}') AS billing_plan,
      COALESCE(o.return_window, '${DEFAULT_RETURN_WINDOW}') AS return_window,
      c.first_name,
      c.last_name,
      c.email,
      c.bag_code,
      c.qr_svg,
      c.qr_payload
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY o.created_at DESC
    LIMIT 12;
  `);

  const customers = dbGet(`
    SELECT id, first_name, last_name, email, city, bag_code, qr_svg, qr_payload, status, created_at
    FROM customers
    ORDER BY created_at DESC
    LIMIT 12;
  `);

  return {
    stats: {
      customers: Number(stats.customers || 0),
      orders: Number(stats.orders || 0),
      revenue: formatMoney(stats.revenue || 0),
      activeOrders: Number(stats.active_orders || 0),
    },
    recentOrders,
    customers,
    statusOptions: ORDER_STATUSES,
  };
}

function handleAdminOverview(req, res) {
  const session = requireSession(req, res, "admin");
  if (!session) return;
  sendJson(res, 200, getAdminOverviewData());
}

async function handleOrderStatusUpdate(req, res, orderId) {
  const session = requireSession(req, res, "admin");
  if (!session) return;

  try {
    const body = await parseBody(req);
    const status = String(body.status || "").trim();

    if (!ORDER_STATUSES.includes(status)) {
      sendJson(res, 400, { error: "Invalid order status" });
      return;
    }

    dbRun(`
      UPDATE orders
      SET status = ${sqlEscape(status)},
          updated_at = ${sqlEscape(new Date().toISOString())}
      WHERE id = ${sqlEscape(orderId)};
    `);

    const row = getOrderRecord(orderId);
    if (row) {
      const invoiceRecord = buildInvoiceRecordFromRow(row);
      dbRun(`
        UPDATE orders
        SET invoice_html = ${sqlEscape(createInvoiceHtml(invoiceRecord))},
            invoice_text = ${sqlEscape(createInvoiceText(invoiceRecord))}
        WHERE id = ${sqlEscape(orderId)};
      `);

      // notify the customer of their status change
      sendStatusUpdate({
        customer: {
          firstName: row.first_name,
          email: row.email,
        },
        order: {
          invoiceNumber: row.invoice_number,
          pickupDate: row.pickup_date,
          pickupSlot: row.pickup_slot,
          laundryType: row.laundry_type,
          shirtsCount: row.shirts_count,
          amount: formatMoney(row.amount),
          billingPlan: row.billing_plan,
          returnWindow: row.return_window || DEFAULT_RETURN_WINDOW,
        },
        status,
      }).catch(console.error);
    }

    sendJson(res, 200, { success: true, overview: getAdminOverviewData() });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unable to update order status" });
  }
}

function handleInvoice(req, res, orderId) {
  try {
    const row = getOrderRecord(orderId);

    if (!row) {
      sendHtml(res, 404, "<h1>Invoice not found</h1>");
      return;
    }

    const invoiceRecord = buildInvoiceRecordFromRow(row);
    sendHtml(res, 200, createInvoiceHtml(invoiceRecord));
  } catch (error) {
    console.error(error);
    sendHtml(res, 500, "<h1>Unable to load invoice</h1>");
  }
}

function handleInvoiceText(req, res, orderId) {
  try {
    const row = getOrderRecord(orderId);

    if (!row) {
      sendText(res, 404, "Invoice not found");
      return;
    }

    const invoiceRecord = buildInvoiceRecordFromRow(row);
    sendText(res, 200, createInvoiceText(invoiceRecord));
  } catch (error) {
    console.error(error);
    sendText(res, 500, "Unable to load invoice");
  }
}

initDatabase();

const server = http.createServer((req, res) => {
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host || `localhost:${PORT}`}`,
  );
  const pathname = requestUrl.pathname;

  if (
    req.method === "POST" &&
    (pathname === "/api/register" || pathname === "/api/auth/register")
  ) {
    handleRegister(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    handleSignup(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    handleCustomerLogin(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/start") {
    handleCustomerStart(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/login") {
    handleAdminLogin(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    handleLogout(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/auth/session") {
    handleSession(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/repeat-pickup") {
    handleRepeatPickup(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/registrations") {
    handleRegistrations(res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin/overview") {
    handleAdminOverview(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin/customers") {
    const session = requireSession(req, res, "admin");
    if (!session) return;
    try {
      const rows = dbGet(`
        SELECT
          c.id,
          c.first_name,
          c.last_name,
          c.email,
          c.city,
          c.address,
          c.postal_code,
          c.phone,
          c.bag_code,
          c.qr_svg,
          c.status,
          c.created_at,
          COUNT(o.id) AS order_count,
          COALESCE(SUM(o.amount), 0) AS total_spent
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC;
      `);
      sendJson(res, 200, rows);
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: "Unable to fetch customers" });
    }
    return;
  }

  if (
    req.method === "GET" &&
    pathname.startsWith("/api/admin/customers/") &&
    pathname.endsWith("/orders")
  ) {
    const session = requireSession(req, res, "admin");
    if (!session) return;
    try {
      const customerId = pathname
        .replace("/api/admin/customers/", "")
        .replace("/orders", "");
      const customer = getCustomerById(customerId);
      if (!customer) {
        sendJson(res, 404, { error: "Customer not found" });
        return;
      }
      const orders = dbGet(`
        SELECT
          id, invoice_number, pickup_date, pickup_slot, laundry_type,
          shirts_count, notes, amount, status,
          COALESCE(billing_plan, '${DEFAULT_BILLING_PLAN}') AS billing_plan,
          created_at
        FROM orders
        WHERE customer_id = ${sqlEscape(customerId)}
        ORDER BY created_at DESC;
      `);
      sendJson(res, 200, {
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          address: customer.address,
          postalCode: customer.postal_code,
          city: customer.city,
          phone: customer.phone,
          bagCode: customer.bag_code,
          qrSvg: customer.qr_svg,
          status: customer.status,
          createdAt: customer.created_at,
        },
        orders,
        statusOptions: ORDER_STATUSES,
      });
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: "Unable to fetch customer orders" });
    }
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/admin/orders/")) {
    handleOrderStatusUpdate(
      req,
      res,
      pathname.replace("/api/admin/orders/", ""),
    );
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/invoice-text/")) {
    handleInvoiceText(req, res, pathname.replace("/invoice-text/", ""));
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/invoice/")) {
    handleInvoice(req, res, pathname.replace("/invoice/", ""));
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/bag/")) {
    const code = pathname.replace("/api/bag/", "").trim().toUpperCase();
    const customer = getCustomerByBagCode(code);
    if (!customer) {
      sendJson(res, 404, { error: "Bag code not found." });
      return;
    }
    sendJson(res, 200, {
      bagCode: customer.bag_code,
      firstName: customer.first_name,
      lastName: customer.last_name,
      address: customer.address,
      postalCode: customer.postal_code,
      city: customer.city,
    });
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "laundry-backend" });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Laundry backend running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  server,
  initDatabase,
  createInvoiceHtml,
  createInvoiceText,
};
