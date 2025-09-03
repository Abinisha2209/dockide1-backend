// routes/user.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getOrCreateContainer } = require("../docker/dockerManager");
const { exec } = require("child_process");
const path = require("path");

// 🔐 Auto-store or update user in DB + Start session on sign-in
router.post("/login", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes("@") || !name) {
    return res.status(400).json({ message: "Valid email and name are required" });
  }

  try {
    let userId;
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      await pool.query("UPDATE users SET name = ?, last_login = NOW() WHERE email = ?", [name, email]);
      userId = existingUser[0].id;
      console.log(`🔄 Updated user: ${email}`);
    } else {
      const [result] = await pool.query(
        "INSERT INTO users (email, name, last_login) VALUES (?, ?, NOW())",
        [email, name]
      );
      userId = result.insertId;
      console.log(` New user created: ${email}`);
    }

    // 🔥 Create new session log
    await pool.query("INSERT INTO session_logs (user_id, start_time) VALUES (?, NOW())", [userId]);
    console.log(` Session started for user ID: ${userId}`);

    const [finalUser] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    res.json({ message: "Login successful", user: finalUser[0] });

  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🐳 Container creation and assignment
router.post("/container", async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const { Id: containerId } = await getOrCreateContainer(email);

    if (!containerId) {
      console.error(`Container created but no ID found for: ${email}`);
      return res.status(500).json({ message: "Container created but no ID returned" });
    }

    await pool.query(
      "UPDATE users SET docker_id = ? WHERE email = ?",
      [containerId, email]
    );

    console.log(`Assigned container ID ${containerId} to user ${email}`);
    res.status(200).json({ message: "Container ready", containerId });

  } catch (error) {
    console.error("Container creation error:", error);
    res.status(500).json({ message: "Server error while initializing workspace" });
  }
});

// 📦 Dataset extractor (docker cp from host to container)
router.post("/extract-dataset", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const containerName = `dockide_${email.replace(/[@.]/g, "_")}`;
  const hostPath = path.resolve(__dirname, "../datasets/titanic.csv");
  const containerPath = "/home/workspace/titanic.csv";

  exec(`docker cp "${hostPath}" ${containerName}:"${containerPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Docker cp error:", err);
      return res.status(500).json({ message: "Failed to extract dataset. Try again." });
    }
    console.log(`Dataset copied to container ${containerName}`);
    return res.json({ message: "Dataset extracted successfully!" });
  });
});

module.exports = router;
