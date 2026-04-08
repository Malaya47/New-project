const crypto = require("crypto");

const DEFAULT_RETURN_WINDOW = "Within 48 hours between 6:00 PM and 9:00 PM";
const DEFAULT_BILLING_PLAN = "single";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || !password) return false;
  const [salt, hash] = passwordHash.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(derived, "hex"),
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeLabel(value) {
  return String(value)
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function calculateAmounts(shirtsCount, billingPlan = DEFAULT_BILLING_PLAN) {
  const normalizedPlan =
    billingPlan === "subscription" ? "subscription" : "single";
  const baseAmount = normalizedPlan === "subscription" ? 50 : 55;
  const addOnAmount = Number(shirtsCount || 0) * 4;
  const amount = baseAmount + addOnAmount;
  return { baseAmount, addOnAmount, amount, billingPlan: normalizedPlan };
}

module.exports = {
  DEFAULT_RETURN_WINDOW,
  DEFAULT_BILLING_PLAN,
  hashPassword,
  verifyPassword,
  formatMoney,
  normalizeLabel,
  calculateAmounts,
};
