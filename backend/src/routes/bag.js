const { Router } = require("express");
const { getCustomerByBagCode, getCustomerByEmail } = require("../lib/customer");

const router = Router();

// GET /api/bag/email?email=xxx  (must be declared before /:code)
router.get("/email", async (req, res) => {
  const email = String(req.query.email || "")
    .trim()
    .toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required." });

  const customer = await getCustomerByEmail(email);
  if (!customer) {
    return res.status(404).json({ error: "No account found with this email." });
  }

  res.json({
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
    phone: customer.phone,
  });
});

// GET /api/bag/:code
router.get("/:code", async (req, res) => {
  const customer = await getCustomerByBagCode(req.params.code);
  if (!customer) {
    return res.status(404).json({ error: "Bag code not found." });
  }
  res.json({
    bagCode: customer.bagCode,
    firstName: customer.firstName,
    lastName: customer.lastName,
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
  });
});

module.exports = router;
