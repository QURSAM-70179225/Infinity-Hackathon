// Finds out who is calling. The user always comes from the signed token,
// never from a role or user id sent by the browser.
const { verifyToken } = require("../utils/token");
const db = require("../services/db");
const { httpError } = require("../utils/httpError");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw httpError(401, "Please log in.");

  // Load the user fresh from the database so the role is always the real one.
  const user = await db.getUserById(payload.uid);
  if (!user) throw httpError(401, "Please log in.");

  delete user.password_hash;
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) throw httpError(403, "You do not have permission to do this.");
    next();
  };
}

module.exports = { requireAuth, requireRole };
