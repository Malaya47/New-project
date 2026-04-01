const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const DB_FILE = path.join(os.tmpdir(), "laundry-demo-db.json");

function createQrSvg(bagCode) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120" role="img" aria-label="${bagCode}">
  <rect width="120" height="120" rx="12" fill="#fff8ef"/>
  <rect x="12" y="12" width="96" height="96" rx="8" fill="#ffffff" stroke="#d9c3ac"/>
  <rect x="22" y="22" width="24" height="24" fill="#6b4d2f"/>
  <rect x="30" y="30" width="8" height="8" fill="#fff"/>
  <rect x="74" y="22" width="24" height="24" fill="#6b4d2f"/>
  <rect x="82" y="30" width="8" height="8" fill="#fff"/>
  <rect x="22" y="74" width="24" height="24" fill="#6b4d2f"/>
  <rect x="30" y="82" width="8" height="8" fill="#fff"/>
  <rect x="58" y="58" width="8" height="8" fill="#6b4d2f"/>
  <rect x="66" y="66" width="8" height="8" fill="#6b4d2f"/>
  <rect x="74" y="58" width="8" height="8" fill="#6b4d2f"/>
  <rect x="58" y="74" width="8" height="8" fill="#6b4d2f"/>
  <text x="60" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6b4d2f">${bagCode}</text>
</svg>`;
}

function defaultDb() {
  return {
    customers: [],
    sessions: [],
    orders: [],
  };
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    return defaultDb();
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return defaultDb();
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function withDb(mutator) {
  const data = loadDb();
  const result = mutator(data);
  saveDb(data);
  return result;
}

function getCustomerByEmail(email) {
  const data = loadDb();
  return data.customers.find(
    (customer) => customer.email === String(email).trim().toLowerCase()
  );
}

function getCustomerById(id) {
  const data = loadDb();
  return data.customers.find((customer) => customer.id === id);
}

function insertCustomer(customer) {
  return withDb((data) => {
    const created = {
      ...customer,
      qrPayload: `laundry.li/bag/${customer.bagCode}`,
      qrSvg: createQrSvg(customer.bagCode),
    };
    data.customers.push(created);
    return created;
  });
}

function updateCustomerLastLogin(customerId) {
  return withDb((data) => {
    const customer = data.customers.find((item) => item.id === customerId);
    if (customer) {
      customer.lastLoginAt = new Date().toISOString();
    }
    return customer;
  });
}

function createBagCode() {
  return `LB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function insertSession(session) {
  return withDb((data) => {
    data.sessions = data.sessions.filter(
      (item) => new Date(item.expiresAt).getTime() > Date.now()
    );
    data.sessions.push(session);
    return session;
  });
}

function getSessionById(id) {
  const data = loadDb();
  const session = data.sessions.find((item) => item.id === id);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    deleteSession(id);
    return null;
  }
  return session;
}

function deleteSession(id) {
  withDb((data) => {
    data.sessions = data.sessions.filter((item) => item.id !== id);
  });
}

function getOrdersForCustomer(customerId) {
  const data = loadDb();
  return data.orders.filter((order) => order.customerId === customerId);
}

module.exports = {
  getCustomerByEmail,
  getCustomerById,
  insertCustomer,
  updateCustomerLastLogin,
  createBagCode,
  insertSession,
  getSessionById,
  deleteSession,
  getOrdersForCustomer,
};
