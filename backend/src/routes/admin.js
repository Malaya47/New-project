const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../lib/session");
const {
  formatMoney,
  normalizeLabel,
  DEFAULT_BILLING_PLAN,
  DEFAULT_RETURN_WINDOW,
} = require("../lib/helpers");
const { verifyPassword, hashPassword } = require("../lib/helpers");
const { createBagIdentity } = require("../lib/qr");
const { createSession } = require("../lib/session");
const {
  buildRecordFromRow,
  createInvoiceHtml,
  createInvoiceText,
} = require("../lib/invoice");
const { sendStatusUpdate } = require("../../mailer");

const ORDER_STATUSES = [
  "scheduled",
  "picked_up",
  "processing",
  "returning",
  "completed",
];

const router = Router();

async function getAdminOverviewData() {
  const [
    customerCount,
    orderCount,
    revenueAgg,
    activeOrderCount,
    recentOrders,
    customers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { amount: true } }),
    prisma.order.count({ where: { status: { not: "completed" } } }),
    prisma.order.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        bagCode: true,
        qrSvg: true,
        qrPayload: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    stats: {
      customers: customerCount,
      orders: orderCount,
      revenue: formatMoney(revenueAgg._sum.amount || 0),
      activeOrders: activeOrderCount,
    },
    recentOrders,
    customers,
    statusOptions: ORDER_STATUSES,
  };
}

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: {
      email: String(req.body.email || "")
        .trim()
        .toLowerCase(),
    },
  });

  if (!admin || !verifyPassword(req.body.password, admin.passwordHash)) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  await createSession(res, "admin", admin.id);
  res.json({
    success: true,
    role: "admin",
    admin: { id: admin.id, email: admin.email, name: admin.name },
    overview: await getAdminOverviewData(),
  });
});

// GET /api/admin/overview
router.get("/overview", async (req, res) => {
  const session = await requireAuth(req, res, "admin");
  if (!session) return;
  res.json(await getAdminOverviewData());
});

// GET /api/admin/customers
router.get("/customers", async (req, res) => {
  const session = await requireAuth(req, res, "admin");
  if (!session) return;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const result = await Promise.all(
    customers.map(async (c) => {
      const agg = await prisma.order.aggregate({
        where: { customerId: c.id },
        _sum: { amount: true },
      });
      return {
        ...c,
        orderCount: c._count.orders,
        totalSpent: Number(agg._sum.amount || 0),
      };
    }),
  );

  res.json(result);
});

// GET /api/admin/customers/:id/orders
router.get("/customers/:id/orders", async (req, res) => {
  const session = await requireAuth(req, res, "admin");
  if (!session) return;

  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const orders = await prisma.order.findMany({
    where: { customerId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      address: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
      phone: customer.phone,
      bagCode: customer.bagCode,
      qrSvg: customer.qrSvg,
      status: customer.status,
      createdAt: customer.createdAt,
    },
    orders,
    statusOptions: ORDER_STATUSES,
  });
});

// POST /api/admin/orders/:id
router.post("/orders/:id", async (req, res) => {
  const session = await requireAuth(req, res, "admin");
  if (!session) return;

  const status = String(req.body.status || "").trim();
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }

  const now = new Date();
  await prisma.order.update({
    where: { id: req.params.id },
    data: { status, updatedAt: now },
  });

  const row = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true },
  });

  if (row) {
    const invoiceRecord = buildRecordFromRow(row);
    await prisma.order.update({
      where: { id: req.params.id },
      data: {
        invoiceHtml: createInvoiceHtml(invoiceRecord),
        invoiceText: createInvoiceText(invoiceRecord),
      },
    });

    sendStatusUpdate({
      customer: {
        firstName: row.customer.firstName,
        email: row.customer.email,
      },
      order: {
        invoiceNumber: row.invoiceNumber,
        pickupDate: row.pickupDate,
        pickupSlot: row.pickupSlot,
        laundryType: row.laundryType,
        shirtsCount: row.shirtsCount,
        amount: formatMoney(row.amount),
        billingPlan: row.billingPlan,
        returnWindow: row.returnWindow || DEFAULT_RETURN_WINDOW,
      },
      status,
    }).catch(console.error);
  }

  res.json({ success: true, overview: await getAdminOverviewData() });
});

module.exports = router;
module.exports.getAdminOverviewData = getAdminOverviewData;
