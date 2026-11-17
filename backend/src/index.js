// Entry point: loads config, starts the Express API.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Allow the frontend to call this API. CORS_ORIGIN can list allowed sites when deployed.
const allowed = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json({ limit: "1mb" }));

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

const port = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = app;
