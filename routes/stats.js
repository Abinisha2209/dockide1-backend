// routes/stats.js
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/users", async (req, res) => {
  const [rows] = await db.query("SELECT COUNT(*) AS count FROM users");
  res.json({ count: rows[0].count || 0 });
});

router.get("/hours", async (req, res) => {
  const [rows] = await db.query(
    "SELECT SUM(duration) AS hours FROM session_logs"
  );
  const totalHours = parseFloat(rows[0].hours || 0).toFixed(1);
  res.json({ hours: totalHours });
});

router.get("/uptime", async (req, res) => {
  // Replace with real uptime logic if available
  res.json({ uptime: 99.98 });
});

module.exports = router;
