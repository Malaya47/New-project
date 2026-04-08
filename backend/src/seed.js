require("dotenv").config();
const crypto = require("crypto");
const prisma = require("./db");
const { hashPassword } = require("./lib/helpers");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@laundry.li";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "LaundryAdmin123!";

async function seed() {
  const existing = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!existing) {
    await prisma.admin.create({
      data: {
        id: crypto.randomUUID(),
        email: ADMIN_EMAIL,
        name: "Operations Admin",
        passwordHash: hashPassword(ADMIN_PASSWORD),
      },
    });
    console.log(`[seed] Admin created: ${ADMIN_EMAIL}`);
  } else {
    console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
  }

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
