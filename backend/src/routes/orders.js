const { Router } = require("express");
const { getSession } = require("../lib/session");
const {
  getCustomerById,
  getCustomerByBagCode,
  getCustomerByEmail,
  serializeCustomer,
} = require("../lib/customer");
const { insertOrder } = require("../lib/order");
const { formatMoney } = require("../lib/helpers");
const { sendOrderConfirmation } = require("../../mailer");
const prisma = require("../db");

const router = Router();

// POST /api/repeat-pickup
router.post("/repeat-pickup", async (req, res) => {
  const body = req.body;
  let customer = null;
  const session = await getSession(req);

  if (session?.role === "customer") {
    customer = await getCustomerById(session.userId);
  } else if (body.bagCode) {
    customer = await getCustomerByBagCode(body.bagCode);
  } else if (body.email) {
    customer = await getCustomerByEmail(body.email);
  }

  if (!customer) {
    return res
      .status(404)
      .json({ error: "Bag code not found. Please register first." });
  }

  const requiredFields = ["pickupDate", "pickupSlot", "laundryType"];
  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const order = await insertOrder(customer.id, body, customer);
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

  res
    .status(201)
    .json({ success: true, customer: serialized, order: orderPayload });

  sendOrderConfirmation({ customer: serialized, order: orderPayload }).catch(
    console.error,
  );
});

// GET /api/registrations
router.get("/registrations", async (req, res) => {
  const rows = await prisma.order.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
    select: {
      id: true,
      invoiceNumber: true,
      pickupDate: true,
      pickupSlot: true,
      laundryType: true,
      amount: true,
      status: true,
      billingPlan: true,
      returnWindow: true,
      customer: {
        select: { firstName: true, lastName: true, email: true, bagCode: true },
      },
    },
  });
  res.json(rows);
});

module.exports = router;
