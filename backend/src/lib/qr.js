const QRCode = require("qrcode");
const crypto = require("crypto");

const APP_BASE_URL = process.env.APP_BASE_URL || "https://laundry.li";

async function createBagIdentity() {
  const bagCode = `LB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const qrPayload = `${APP_BASE_URL}/bag/${bagCode}`;
  const qrSvg = await QRCode.toString(qrPayload, {
    type: "svg",
    margin: 1,
    width: 240,
    color: {
      dark: "#6b4d2f",
      light: "#0000",
    },
  });

  return { bagCode, qrPayload, qrSvg };
}

module.exports = { createBagIdentity };
