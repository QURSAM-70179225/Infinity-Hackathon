const db = require("../services/db");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createToken } = require("../utils/token");
const { httpError } = require("../utils/httpError");

// Only company email addresses may create an account.
const COMPANY_DOMAIN = "@novaworks.example";

function publicUser(user) {
  const { id, ref, name, email, role, specialization, skills } = user;
  return { id, ref, name, email, role, specialization, skills };
}

// POST /api/auth/login  { email, password }
async function login(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) throw httpError(400, "Enter your email and password.");

  const user = await db.getUserByEmail(email);
  // Same message for unknown email and wrong password, so nothing is leaked.
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw httpError(401, "Invalid email or password.");
  }

  res.json({ token: createToken(user.id), user: publicUser(user) });
}

// POST /api/auth/signup  { name, email, password, specialization }
// A new account is ALWAYS a developer agent. The role is never taken from the request,
// so nobody can sign up as an admin or a manager.
async function signup(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const specialization = String(req.body?.specialization || "").trim() || "Developer";

  if (name.length < 2) throw httpError(400, "Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, "Enter a valid email address.");
  if (!email.endsWith(COMPANY_DOMAIN)) {
    throw httpError(400, `Use your company email. It must end with ${COMPANY_DOMAIN}`);
  }
  if (password.length < 8) throw httpError(400, "Password must be at least 8 characters.");
  if (await db.getUserByEmail(email)) throw httpError(409, "An account with this email already exists. Log in instead.");

  // Next free directory code after DEV06, DEV07 ...
  const users = await db.listUsers();
  const numbers = users.map((u) => Number((String(u.ref).match(/^DEV(\d+)$/) || [])[1] || 0));
  const ref = `DEV${String(Math.max(0, ...numbers) + 1).padStart(2, "0")}`;

  const user = await db.createUser({
    ref,
    name,
    email,
    password_hash: hashPassword(password),
    role: "AGENT",
    specialization,
    skills: [],
  });

  res.status(201).json({ token: createToken(user.id), user: publicUser(user) });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { login, signup, me };
