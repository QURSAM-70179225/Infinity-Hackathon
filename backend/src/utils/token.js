// Login tokens in standard JWT format (HS256), signed with SESSION_SECRET.
// The browser cannot change the token without breaking the signature.
const crypto = require("crypto");

const EIGHT_HOURS = 8 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is missing in backend/.env");
  return value;
}

const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const sign = (text) => crypto.createHmac("sha256", secret()).update(text).digest("base64url");

function createToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ uid: userId, iat: now, exp: now + EIGHT_HOURS })}`;
  return `${body}.${sign(body)}`;
}

// Returns the payload, or null if the token is fake, changed or expired.
function verifyToken(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (!payload.uid || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
