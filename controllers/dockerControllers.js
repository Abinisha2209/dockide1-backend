const db = require("../db");

exports.startSession = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const [result] = await db.query(
      "INSERT INTO session_logs (user_id, start_time) VALUES (?, NOW())",
      [userId]
    );
    res.json({ success: true, sessionId: result.insertId });
  } catch (err) {
    console.error("Session error:", err);
    res.status(500).json({ error: "Could not start session" });
  }
};
