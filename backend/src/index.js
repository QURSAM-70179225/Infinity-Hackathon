// Entry point: loads config, starts the Express API.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Allow the frontend to call this API. CORS_ORIGIN can list allowed sites when deployed.
// Values are cleaned first, so "https://site.vercel.app/" or "https://site.vercel.app/login"
// still match the browser's origin "https://site.vercel.app".
function cleanOrigin(value) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
}
const allowed = (process.env.CORS_ORIGIN || "").split(",").map(cleanOrigin).filter(Boolean);
app.use(
  cors({
    origin: (origin, done) => {
      // No origin: same-site requests, health checks, curl. Local development is always allowed.
      if (!origin || allowed.length === 0 || allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return done(null, true);
      }
      console.warn(`CORS blocked a request from ${origin}. Allowed: ${allowed.join(", ")}`);
      return done(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));

// Opening the bare backend address shows this instead of "Route not found".
app.get("/", (req, res) => res.json({ ok: true, service: "NovaWorks CRM API", health: "/api/health" }));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

// Unknown route.
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Central error handler: every thrown error ends up here as clean JSON.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || "Something went wrong.", ...(err.details || {}) });
});

// Startup check: list missing settings by name (never their values) so they show in the Render logs.
const missing = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "GROQ_API_KEY", "SESSION_SECRET"].filter((name) => !(process.env[name] || "").trim());
if ((process.env.DB_MODE || "supabase").trim().toLowerCase() === "local") missing.splice(0, missing.length, ...missing.filter((n) => !n.startsWith("SUPABASE")));
if (missing.length) console.warn(`Settings not found: ${missing.join(", ")}. Add them to backend/.env or the Render Environment tab.`);

const port = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, () => {
    // On Render, PORT is set by Render and the API is reached through the service's public https URL,
    // not through localhost. Locally, it is http://localhost:5000.
    if (process.env.RENDER) console.log(`API listening on internal port ${port}. Use the public Render URL, for example /api/health.`);
    else console.log(`API running on http://localhost:${port}`);
  });
}

module.exports = app;
