const { handleSession } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await handleSession(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to restore session" });
  }
};
