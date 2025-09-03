// routes/sessions.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Start a session
router.post("/start", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const result = await db.query(
      "INSERT INTO session_logs (user_id, start_time) VALUES (?, NOW())",
      [userId]
    );
    console.log("📍 Session started:", userId);
    res.json({ success: true, sessionId: result[0].insertId });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Could not start session" });
  }
});

// End a session & record duration
router.post("/end", async (req, res) => {
  const { sessionId, duration } = req.body; // duration in hours

  if (!sessionId || duration == null) {
    return res.status(400).json({ error: "sessionId and duration required" });
  }

  try {
    await db.query(
      "UPDATE session_logs SET end_time = NOW(), duration = ? WHERE id = ?",
      [duration, sessionId]
    );
    console.log(`✅ Session ${sessionId} ended. Duration: ${duration}h`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Could not end session" });
  }
});

module.exports = router;
