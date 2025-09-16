const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DB connection
const pool = require("./db"); // nếu db.js export = module.exports = pool;

// Routes
const shopsRouter = require("./routes/shops.routes");
const usersRouter = require("./routes/users.routes");
const channelsRouter = require("./routes/channels.routes");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/shops", shopsRouter);
app.use("/api/users", usersRouter);
app.use("/api/channels", channelsRouter);

// Test DB route
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 API Server is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
