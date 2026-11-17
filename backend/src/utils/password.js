// Password hashing with scrypt (built into Node, no extra package).
// We store "scrypt$salt$hash", never the plain password.
const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [algorithm, salt, hash] = String(stored || "").split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const known = Buffer.from(hash, "hex");
  const test = crypto.scryptSync(String(password), salt, known.length);
  return crypto.timingSafeEqual(known, test);
}

module.exports = { hashPassword, verifyPassword };
