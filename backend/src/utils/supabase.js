// One shared Supabase client for the whole backend.
const { createClient } = require("@supabase/supabase-js");
const { httpError } = require("./httpError");

let client;

function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      throw httpError(500, "Database is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to backend/.env");
    }
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

module.exports = { getSupabase };
