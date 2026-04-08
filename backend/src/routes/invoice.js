const { Router } = require("express");
const prisma = require("../db");
const {
  buildRecordFromRow,
  createInvoiceHtml,
  createInvoiceText,
} = require("../lib/invoice");

const router = Router();

// GET /invoice/:id
router.get("/:id", async (req, res) => {
  const row = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true },
  });

  if (!row) {
    return res.status(404).send("<h1>Invoice not found</h1>");
  }

  const record = buildRecordFromRow(row);
  res
    .set("Content-Type", "text/html; charset=utf-8")
    .send(createInvoiceHtml(record));
});

// GET /invoice-text/:id
router.get("/text/:id", async (req, res) => {
  const row = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true },
  });

  if (!row) {
    return res.status(404).type("text/plain").send("Invoice not found");
  }

  const record = buildRecordFromRow(row);
  res.type("text/plain").send(createInvoiceText(record));
});

module.exports = router;
