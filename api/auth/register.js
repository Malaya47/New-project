const { handleRegister } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await handleRegister(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create registration" });
  }
};
