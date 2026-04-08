const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || `"laundry.li" <${SMTP_USER}>`;
const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "";

function createTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail(to, subject, html) {
  const transport = createTransport();
  if (!transport) {
    console.warn("[mailer] SMTP not configured — skipping email to:", to);
    return;
  }
  try {
    await transport.sendMail({ from: MAIL_FROM, to, subject, html });
    console.log(`[mailer] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error("[mailer] Failed to send email:", err.message);
  }
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const BASE = `
  <div style="font-family:Manrope,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fffaf4;border-radius:24px;overflow:hidden;border:1px solid #f2dfc6">
`;
const FOOTER_HTML = `
  <div style="padding:20px 32px;background:#f2dfc6;text-align:center;font-size:12px;color:#6b4828">
    laundry.li &nbsp;·&nbsp; Premium laundry pickup &nbsp;·&nbsp; © ${new Date().getFullYear()}
  </div>
`;

function header(title) {
  return `
    <div style="background:linear-gradient(135deg,#c89761,#8c6338);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:28px;color:#fff;font-weight:700">${title}</h1>
    </div>
  `;
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px 0;color:#6b4828;font-size:14px;width:45%">${label}</td>
      <td style="padding:8px 0;color:#2a1c12;font-size:14px;font-weight:600">${value}</td>
    </tr>
  `;
}

function orderTable(order) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      ${row("Invoice", order.invoiceNumber)}
      ${row("Pickup date", order.pickupDate)}
      ${row("Time slot", order.pickupSlot)}
      ${row("Laundry type", order.laundryType)}
      ${order.shirtsCount > 0 ? row("Shirts / blouses", `${order.shirtsCount} piece(s)`) : ""}
      ${row("Amount", order.amount)}
      ${row("Billing plan", order.billingPlan === "subscription" ? "Subscription (CHF 50/bag)" : "One-time (CHF 55/bag)")}
      ${row("Return window", order.returnWindow)}
    </table>
  `;
}

// ─── Customer: new order ──────────────────────────────────────────────────────
function buildCustomerOrderHtml({ customer, order }) {
  const qrSection = ""; // personalized QR removed — bags carry a single generic QR

  return `${BASE}
    ${header("Pickup confirmed!")}
    <div style="padding:32px">
      <p style="font-size:16px;color:#2a1c12;margin-top:0">Hi ${customer.firstName},</p>
      <p style="font-size:14px;color:#6b4828;line-height:1.7">
        Your laundry pickup is confirmed. Place your bag outside the door in the morning — we'll handle the rest and return it clean within 48 hours.
      </p>
      ${orderTable(order)}
      ${qrSection}
      <div style="margin-top:24px;padding:16px;background:#fbf3e8;border-radius:12px;font-size:13px;color:#6b4828;line-height:1.7">
        <strong>Next time:</strong> just scan the QR code on your bag with your phone camera — no login needed. Your address and details will be auto-detected.
      </div>
    </div>
    ${FOOTER_HTML}
  </div>`;
}

// ─── Admin: new order notification ───────────────────────────────────────────
function buildAdminOrderHtml({ customer, order }) {
  return `${BASE}
    ${header("New order received")}
    <div style="padding:32px">
      <p style="font-size:14px;color:#6b4828;margin-top:0">A new pickup has been booked.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        ${row("Customer", `${customer.firstName} ${customer.lastName}`)}
        ${row("Email", customer.email)}
        ${row("Phone", customer.phone || "—")}
        ${row("Address", `${customer.address}, ${customer.postalCode} ${customer.city}`)}
        ${row("Bag code", customer.bagCode)}
      </table>
      <hr style="border:none;border-top:1px solid #f2dfc6;margin:16px 0"/>
      ${orderTable(order)}
    </div>
    ${FOOTER_HTML}
  </div>`;
}

// ─── Customer: status update ──────────────────────────────────────────────────
const STATUS_MESSAGES = {
  scheduled: {
    emoji: "📅",
    label: "Scheduled",
    body: "Your pickup is scheduled. Please place your bag outside by the morning.",
  },
  picked_up: {
    emoji: "🚗",
    label: "Picked up",
    body: "We've collected your bag and it's on its way to our facility.",
  },
  processing: {
    emoji: "🌀",
    label: "Processing",
    body: "Your laundry is currently being washed, dried, ironed, and folded.",
  },
  returning: {
    emoji: "🚚",
    label: "On its way",
    body: "Your clean laundry is being returned and will arrive soon.",
  },
  completed: {
    emoji: "✅",
    label: "Completed",
    body: "Your laundry has been returned. Thank you for using laundry.li!",
  },
};

function buildStatusUpdateHtml({ customer, order, status }) {
  const info = STATUS_MESSAGES[status] || {
    emoji: "ℹ️",
    label: status,
    body: "Your order status has been updated.",
  };
  return `${BASE}
    ${header(`${info.emoji} Order update: ${info.label}`)}
    <div style="padding:32px">
      <p style="font-size:16px;color:#2a1c12;margin-top:0">Hi ${customer.firstName},</p>
      <p style="font-size:15px;color:#6b4828;line-height:1.7">${info.body}</p>
      ${orderTable({ ...order, amount: order.amount })}
    </div>
    ${FOOTER_HTML}
  </div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────
async function sendOrderConfirmation({ customer, order }) {
  const subject = `Pickup confirmed — ${order.invoiceNumber}`;
  await sendMail(
    customer.email,
    subject,
    buildCustomerOrderHtml({ customer, order }),
  );
  if (ADMIN_EMAIL) {
    await sendMail(
      ADMIN_EMAIL,
      `[laundry.li] New order: ${order.invoiceNumber} — ${customer.firstName} ${customer.lastName}`,
      buildAdminOrderHtml({ customer, order }),
    );
  }
}

async function sendStatusUpdate({ customer, order, status }) {
  const info = STATUS_MESSAGES[status] || { label: status };
  const subject = `Your order is ${info.label} — ${order.invoiceNumber}`;
  await sendMail(
    customer.email,
    subject,
    buildStatusUpdateHtml({ customer, order, status }),
  );
}

// ─── OTP email ───────────────────────────────────────────────────────────────
async function sendOtpEmail(email, otp) {
  const html = `${BASE}
    ${header("Your verification code")}
    <div style="padding:32px">
      <p style="font-size:16px;color:#2a1c12;margin-top:0">Your one-time verification code is:</p>
      <div style="text-align:center;margin:32px 0">
        <span style="display:inline-block;font-size:44px;font-weight:800;letter-spacing:0.25em;color:#2a1c12;background:#f2dfc6;padding:16px 28px;border-radius:16px">${otp}</span>
      </div>
      <p style="font-size:14px;color:#6b4828;line-height:1.7">
        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
      <p style="font-size:13px;color:#946537;margin-top:16px">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    ${FOOTER_HTML}
  </div>`;
  await sendMail(email, "Your laundry.li verification code", html);
}

module.exports = { sendOrderConfirmation, sendStatusUpdate, sendOtpEmail };
