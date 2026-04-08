const crypto = require("crypto");
const prisma = require("../db");

const SESSION_COOKIE = "laundry_session";

async function createSession(res, role, userId) {
  const sessionId = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 7);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      role,
      createdAt,
      expiresAt,
    },
  });

  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

async function destroySession(req, res) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  res.clearCookie(SESSION_COOKIE);
}

async function getSession(req) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}

async function requireAuth(req, res, role) {
  const session = await getSession(req);
  if (!session || (role && session.role !== role)) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return session;
}

module.exports = {
  createSession,
  destroySession,
  getSession,
  requireAuth,
  SESSION_COOKIE,
};
