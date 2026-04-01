const crypto = require("crypto");
const db = require("./db");

const DEFAULT_RETURN_WINDOW = "Within 48 hours between 6:00 PM and 9:00 PM";
const DEFAULT_BILLING_PLAN = "single";

function formatMoney(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function calculateAmounts(shirtsCount, billingPlan = DEFAULT_BILLING_PLAN) {
  const normalizedPlan = billingPlan === "subscription" ? "subscription" : "single";
  const baseAmount = normalizedPlan === "subscription" ? 50 : 55;
  const addOnAmount = Number(shirtsCount || 0) * 4;
  return {
    billingPlan: normalizedPlan,
    baseAmount,
    addOnAmount,
    amount: baseAmount + addOnAmount,
  };
}

function normalizeLaundryType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "Not selected";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function createInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function createOrderRecord(customer, body) {
  const shirtsCount = Number(body.shirtsCount || 0);
  const pricing = calculateAmounts(shirtsCount, body.billingPlan || DEFAULT_BILLING_PLAN);
  const now = new Date().toISOString();

  return db.insertOrder({
    id: crypto.randomUUID(),
    customerId: customer.id,
    invoice_number: createInvoiceNumber(),
    pickup_date: String(body.pickupDate).trim(),
    pickup_slot: String(body.pickupSlot).trim(),
    laundry_type: String(body.laundryType).trim(),
    shirts_count: shirtsCount,
    notes: body.notes ? String(body.notes).trim() : "",
    amount: pricing.amount,
    base_amount: pricing.baseAmount,
    add_on_amount: pricing.addOnAmount,
    status: "scheduled",
    billing_plan: pricing.billingPlan,
    return_window: DEFAULT_RETURN_WINDOW,
    createdAt: now,
    updatedAt: now,
  });
}

function serializeOrder(order) {
  return {
    id: order.id,
    invoiceNumber: order.invoice_number,
    invoiceUrl: `/invoice/${order.id}`,
    amount: formatMoney(order.amount),
    billingPlan: order.billing_plan,
    pickupDate: order.pickup_date,
    pickupSlot: order.pickup_slot,
    returnWindow: order.return_window,
    status: order.status,
  };
}

function createInvoiceText(customer, order) {
  const lines = [
    `Invoice: ${order.invoice_number}`,
    `Customer: ${customer.firstName} ${customer.lastName}`,
    `Email: ${customer.email}`,
    `Bag code: ${customer.bagCode}`,
    `Address: ${customer.address}, ${customer.city} ${customer.postalCode}`,
    `Pickup date: ${order.pickup_date}`,
    `Pickup slot: ${order.pickup_slot}`,
    `Laundry type: ${normalizeLaundryType(order.laundry_type)}`,
    `Billing plan: ${order.billing_plan === "subscription" ? "Subscription" : "One-time"}`,
    `Shirts / blouses: ${order.shirts_count || 0}`,
    `Return window: ${order.return_window}`,
    `Status: ${String(order.status || "").replaceAll("_", " ")}`,
    `Total due: ${formatMoney(order.amount)}`,
  ];

  if (order.notes) {
    lines.splice(lines.length - 2, 0, `Notes: ${order.notes}`);
  }

  return lines.join("\n");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createInvoiceHtml(customer, order) {
  const statusLabel = String(order.status || "").replaceAll("_", " ");
  const billingLabel = order.billing_plan === "subscription" ? "Subscription bag" : "One-time bag";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(order.invoice_number)} | laundry.li</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f6efe5; color: #4d3726; }
      .shell { max-width: 860px; margin: 0 auto; padding: 32px 20px 56px; }
      .card { background: #fffaf4; border: 1px solid #e2cdb8; border-radius: 24px; padding: 28px; box-shadow: 0 20px 40px rgba(137, 99, 54, 0.08); }
      .top { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
      h1 { margin: 0 0 8px; font-size: 34px; }
      h2 { margin: 0 0 14px; font-size: 18px; }
      p { margin: 0 0 8px; line-height: 1.5; }
      .muted { color: #7a6551; }
      .badge { display: inline-block; padding: 8px 12px; border-radius: 999px; background: #e8d0ad; font-weight: 700; text-transform: capitalize; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 24px 0; }
      .item { background: white; border: 1px solid #ead9c8; border-radius: 18px; padding: 16px; }
      .item small { display: block; color: #8b735d; margin-bottom: 6px; }
      .item strong { font-size: 18px; }
      .total { margin-top: 20px; padding: 18px 20px; border-radius: 18px; background: linear-gradient(135deg, #b88749, #d9b787); color: white; display: flex; justify-content: space-between; gap: 12px; font-weight: 700; }
      .actions { margin-top: 20px; }
      .actions button { border: 0; border-radius: 999px; background: #4d3726; color: white; padding: 12px 20px; font-size: 15px; cursor: pointer; }
      @media print { .actions { display: none; } body { background: white; } .card { box-shadow: none; border-color: #ddd; } }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <div class="top">
          <div>
            <p class="muted">laundry.li</p>
            <h1>Invoice</h1>
            <p>${escapeHtml(order.invoice_number)}</p>
          </div>
          <div>
            <p class="muted">Status</p>
            <div class="badge">${escapeHtml(statusLabel)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="item"><small>Customer</small><strong>${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</strong></div>
          <div class="item"><small>Bag code</small><strong>${escapeHtml(customer.bagCode)}</strong></div>
          <div class="item"><small>Pickup</small><strong>${escapeHtml(order.pickup_date)} · ${escapeHtml(order.pickup_slot)}</strong></div>
          <div class="item"><small>Return window</small><strong>${escapeHtml(order.return_window)}</strong></div>
          <div class="item"><small>Billing plan</small><strong>${escapeHtml(billingLabel)}</strong></div>
          <div class="item"><small>Laundry type</small><strong>${escapeHtml(normalizeLaundryType(order.laundry_type))}</strong></div>
        </div>

        <h2>Billing summary</h2>
        <p>Base bag service: ${formatMoney(order.base_amount || (order.billing_plan === "subscription" ? 50 : 55))}</p>
        <p>Shirts & blouses (${order.shirts_count || 0}): ${formatMoney(order.add_on_amount || Number(order.shirts_count || 0) * 4)}</p>
        ${order.notes ? `<p>Notes: ${escapeHtml(order.notes)}</p>` : ""}

        <div class="total">
          <span>Total due</span>
          <span>${formatMoney(order.amount)}</span>
        </div>

        <div class="actions">
          <button onclick="window.print()">Print invoice</button>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

module.exports = {
  DEFAULT_RETURN_WINDOW,
  DEFAULT_BILLING_PLAN,
  formatMoney,
  calculateAmounts,
  createOrderRecord,
  serializeOrder,
  createInvoiceHtml,
  createInvoiceText,
};
