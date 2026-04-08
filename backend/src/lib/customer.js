const prisma = require("../db");

function cleanCustomerProfileValue(value, placeholder) {
  return value === placeholder ? "" : value;
}

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: cleanCustomerProfileValue(customer.firstName, "Pending"),
    lastName: cleanCustomerProfileValue(customer.lastName, "Customer"),
    address: cleanCustomerProfileValue(customer.address, "Address pending"),
    postalCode: cleanCustomerProfileValue(customer.postalCode, "Pending"),
    city: cleanCustomerProfileValue(customer.city, "Pending"),
    phone: customer.phone,
    bagCode: customer.bagCode,
    qrPayload: customer.qrPayload,
    qrSvg: customer.qrSvg,
    status: customer.status,
    createdAt: customer.createdAt,
  };
}

async function getCustomerById(customerId) {
  return prisma.customer.findUnique({ where: { id: customerId } });
}

async function getCustomerByEmail(email) {
  return prisma.customer.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });
}

async function getCustomerByBagCode(bagCode) {
  return prisma.customer.findUnique({
    where: { bagCode: String(bagCode).trim().toUpperCase() },
  });
}

async function getOrdersForCustomer(customerId) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      invoiceNumber: true,
      pickupDate: true,
      pickupSlot: true,
      laundryType: true,
      shirtsCount: true,
      notes: true,
      amount: true,
      status: true,
      billingPlan: true,
      returnWindow: true,
      createdAt: true,
    },
  });
}

module.exports = {
  serializeCustomer,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByBagCode,
  getOrdersForCustomer,
};
