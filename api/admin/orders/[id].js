const { handleAdminOrderUpdate } = require("../../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const orderId = req.query.id;
    await handleAdminOrderUpdate(req, res, orderId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update order status" });
  }
};
