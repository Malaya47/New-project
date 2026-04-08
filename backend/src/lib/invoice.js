const {
  calculateAmounts,
  normalizeLabel,
  formatMoney,
  DEFAULT_BILLING_PLAN,
  DEFAULT_RETURN_WINDOW,
} = require("./helpers");

function buildRecord({
  orderId,
  invoiceNumber,
  createdAt,
  body,
  customer,
  shirtsCount,
  baseAmount,
  addOnAmount,
  amount,
  billingPlan,
}) {
  return {
    orderId,
    invoiceNumber,
    createdAt: new Date(createdAt).toLocaleDateString("en-IN", {
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
    bagCode: customer.bagCode,
    fullName: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postalCode,
    phone: customer.phone || "",
    status: "scheduled",
  };
}

function buildRecordFromRow(row) {
  const { baseAmount, addOnAmount } = calculateAmounts(
    row.shirtsCount,
    row.billingPlan,
  );
  return {
    invoiceNumber: row.invoiceNumber,
    createdAt: new Date(row.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pickupDate: row.pickupDate,
    pickupSlot: row.pickupSlot,
    laundryType: normalizeLabel(row.laundryType),
    shirtsCount: Number(row.shirtsCount || 0),
    notes: row.notes || "",
    baseAmount,
    addOnAmount,
    amount: Number(row.amount || 0),
    billingPlan: row.billingPlan || DEFAULT_BILLING_PLAN,
    returnWindow: row.returnWindow || DEFAULT_RETURN_WINDOW,
    bagCode: row.customer.bagCode,
    fullName: `${row.customer.firstName} ${row.customer.lastName}`,
    email: row.customer.email,
    address: row.customer.address,
    city: row.customer.city,
    postalCode: row.customer.postalCode,
    phone: row.customer.phone || "",
    status: row.status || "scheduled",
  };
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
    h2 { margin: 0 0 14px; font-size: 18px; }
    dl {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px 14px;
      margin: 0;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }
    dt { color: var(--muted); }
    dd { margin: 0; font-weight: 600; }
    .totals { padding: 0 32px 32px; }
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
    th { background: #f9efe5; color: var(--muted); font-weight: 600; }
    tr:last-child td { border-bottom: 0; }
    .amount { text-align: right; font-weight: 700; }
    .summary { display: flex; justify-content: flex-end; margin-top: 18px; }
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
      body { background: white; padding: 0; }
      .invoice { box-shadow: none; border-radius: 0; border: 0; }
      .actions { display: none; }
    }
    @media (max-width: 720px) {
      .hero { flex-direction: column; }
      .grid { grid-template-columns: 1fr; padding: 20px; }
      .hero, .totals, .footer, .actions { padding-left: 20px; padding-right: 20px; }
      dl { grid-template-columns: 1fr; gap: 6px; }
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
          <dt>Invoice number</dt><dd>${record.invoiceNumber}</dd>
          <dt>Issued on</dt><dd>${record.createdAt}</dd>
          <dt>Pickup date</dt><dd>${record.pickupDate}</dd>
          <dt>Time slot</dt><dd>${record.pickupSlot}</dd>
          <dt>Bag code</dt><dd>${record.bagCode}</dd>
          <dt>Return window</dt><dd>${record.returnWindow}</dd>
          <dt>Billing plan</dt><dd>${normalizeLabel(record.billingPlan)}</dd>
        </dl>
      </article>

      <article class="card">
        <h2>Customer</h2>
        <dl>
          <dt>Name</dt><dd>${record.fullName}</dd>
          <dt>Email</dt><dd>${record.email}</dd>
          <dt>Address</dt><dd>${record.address}, ${record.city} ${record.postalCode}</dd>
          <dt>Phone</dt><dd>${record.phone || "Not provided"}</dd>
          <dt>Laundry type</dt><dd>${record.laundryType}</dd>
          <dt>Order status</dt><dd>${normalizeLabel(record.status)}</dd>
          <dt>Billing</dt><dd>${record.billingPlan === "subscription" ? "Subscription bag" : "One-time order"}</dd>
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

module.exports = {
  buildRecord,
  buildRecordFromRow,
  createInvoiceHtml,
  createInvoiceText,
};
