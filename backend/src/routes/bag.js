const { Router } = require("express");
const { getCustomerByBagCode } = require("../lib/customer");

const router = Router();

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
