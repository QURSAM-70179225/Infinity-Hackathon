// The one place the app gets its database from.
// DB_MODE=supabase (default) -> hosted PostgreSQL on Supabase.
// DB_MODE=local              -> JSON file on this computer.
// Both files export the same functions, so nothing else in the app changes.
const mode = (process.env.DB_MODE || "supabase").trim().toLowerCase();

module.exports = mode === "local" ? require("./localDb") : require("./supabaseDb");
