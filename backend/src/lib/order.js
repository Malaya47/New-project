const crypto = require("crypto");
const prisma = require("../db");
const {
  calculateAmounts,
  normalizeLabel,
  DEFAULT_BILLING_PLAN,
  DEFAULT_RETURN_WINDOW,
} = require("./helpers");
const {
  createInvoiceHtml,
  createInvoiceText,
  buildRecord,
} = require("./invoice");

async function insertOrder(customerId, body, customer) {
  const shirtsCount = Number(body.shirtsCount || 0);
  const { baseAmount, addOnAmount, amount, billingPlan } = calculateAmounts(
    shirtsCount,
    body.billingPlan || DEFAULT_BILLING_PLAN,
  );

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const orderId = crypto.randomUUID();
  const now = new Date();

  const record = buildRecord({
    orderId,
    invoiceNumber,
    createdAt: now.toISOString(),
    body,
    customer,
    shirtsCount,
    baseAmount,
    addOnAmount,
    amount,
    billingPlan,
  });

  const invoiceHtml = createInvoiceHtml(record);
  const invoiceText = createInvoiceText(record);

  await prisma.order.create({
    data: {
      id: orderId,
      customerId,
      pickupDate: body.pickupDate,
      pickupSlot: body.pickupSlot,
      laundryType: body.laundryType,
      shirtsCount,
      notes: body.notes || null,
      amount,
      invoiceNumber,
      invoiceHtml,
      invoiceText,
      status: "scheduled",
      returnWindow: DEFAULT_RETURN_WINDOW,
      billingPlan,
      createdAt: now,
      updatedAt: now,
    },
  });

  return {
    ...record,
    invoiceHtml,
    invoiceText,
    invoiceUrl: `/invoice/${orderId}`,
  };
}

module.exports = { insertOrder };
