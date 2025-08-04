const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getOrCreateContainer } = require("../docker/dockerManager");

// 🔐 Auto-store or update user in DB on sign-in
router.post("/login", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes("@") || !name) {
    return res.status(400).json({ message: "Valid email and name are required" });
  }

  try {
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      await pool.query("UPDATE users SET name = ?, last_login = NOW() WHERE email = ?", [name, email]);
      const [updatedUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      console.log(`🔄 Updated user: ${email}`);
      return res.json({ message: "User updated", user: updatedUser[0] });
    }

    const [result] = await pool.query(
      "INSERT INTO users (email, name, last_login) VALUES (?, ?, NOW())",
      [email, name]
    );

    const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    console.log(`✅ New user created: ${email}`);
    res.json({ message: "User created", user: newUser[0] });

  } catch (err) {
    console.error("🚨 Error in /login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/container", async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

const { Id: containerId } = await getOrCreateContainer(email); // ✅ destructures just the Id


    if (!containerId) {
      console.error(`⚠️ Container created but no ID found for: ${email}`);
      return res.status(500).json({ message: "Container created but no ID returned" });
    }

    await pool.query(
      "UPDATE users SET docker_id = ? WHERE email = ?",
      [containerId, email]
    );

    console.log(`🐳 Assigned container ID ${containerId} to user ${email}`);
    res.status(200).json({ message: "Container ready", containerId });

  } catch (error) {
    console.error("🚨 Container creation error:", error);
    res.status(500).json({ message: "Server error while initializing workspace" });
  }
});

module.exports = router;
