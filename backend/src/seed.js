// Creates the ten demo accounts. Run with: npm run seed
// Upserts by email, so running it again never creates duplicates.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = require("./services/db");
const { hashPassword } = require("./utils/password");
const { DEMO_USERS, DEMO_PASSWORD } = require("./utils/demoUsers");

async function seed() {
  const mode = (process.env.DB_MODE || "supabase").trim().toLowerCase();
  const rows = DEMO_USERS.map((user) => ({ ...user, password_hash: hashPassword(DEMO_PASSWORD) }));
  const count = await db.upsertUsers(rows);
  console.log(`Seed complete (${mode} database). Users in database: ${count}. Password for all: ${DEMO_PASSWORD}`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  if (String(err.message).includes("Database error")) {
    console.error("Check that you ran backend/sql/schema.sql in the Supabase SQL Editor.");
  }
  process.exit(1);
});
