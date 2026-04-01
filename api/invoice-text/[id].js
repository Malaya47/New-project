const { handleInvoiceText } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    await handleInvoiceText(req, res, req.query.id);
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load invoice");
  }
};
