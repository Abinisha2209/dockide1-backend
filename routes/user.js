const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getOrCreateContainer } = require("../docker/dockerManager");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");

// ---------------- Login / Create User ----------------
router.post("/login", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes("@") || !name)
    return res.status(400).json({ message: "Valid email and name required" });

  try {
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      await pool.query("UPDATE users SET name = ?, last_login = NOW() WHERE email = ?", [name, email]);
      const [updatedUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      return res.json({ message: "User updated", user: updatedUser[0] });
    }

    const [result] = await pool.query(
      "INSERT INTO users (email, name, last_login) VALUES (?, ?, NOW())",
      [email, name]
    );
    const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    return res.json({ message: "User created", user: newUser[0] });
  } catch (err) {
    console.error("🚨 /login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- Create/Retrieve Docker Container ----------------
router.post("/container", async (req, res) => {
  try {
    const email = req.body.email;
    if (!email || !email.includes("@")) return res.status(400).json({ message: "Invalid email" });

    const { Id: containerId } = await getOrCreateContainer(email);
    if (!containerId) return res.status(500).json({ message: "Container creation failed" });

    await pool.query("UPDATE users SET docker_id = ? WHERE email = ?", [containerId, email]);
    res.status(200).json({ message: "Container ready", containerId });
  } catch (err) {
    console.error("🚨 Container error:", err);
    res.status(500).json({ message: "Server error while initializing workspace" });
  }
});

// ---------------- Execute Python Code with Plot Support ----------------
router.post("/execute", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email and code required" });

    // Get container
    const [rows] = await pool.query("SELECT docker_id FROM users WHERE email = ?", [email]);
    if (!rows.length || !rows[0].docker_id)
      return res.status(400).json({ message: "No container found" });
    const containerId = rows[0].docker_id;

    // Wrap user code to support headless plots
    const wrappedCode = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64, sys, traceback

# Redirect stdout
from contextlib import redirect_stdout
import builtins
import sys
stdout = io.StringIO()
with redirect_stdout(stdout):
    try:
${code.split("\n").map((line) => "        " + line).join("\n")}
    except Exception as e:
        traceback.print_exc()

# Collect plots as base64
plots = []
for i in plt.get_fignums():
    buf = io.BytesIO()
    plt.figure(i).savefig(buf, format='png')
    buf.seek(0)
    plots.append("data:image/png;base64," + base64.b64encode(buf.read()).decode())
    plt.close(i)

# Print stdout and plots as JSON
import json
print(json.dumps({"stdout": stdout.getvalue(), "plots": plots}))
`;

    // Save to temp file
    const fileName = `temp_code_${Date.now()}.py`;
    fs.writeFileSync(fileName, wrappedCode, "utf8");

    // Copy to container
    await exec(`docker cp ${fileName} ${containerId}:/home/workspace/${fileName}`);
    fs.unlinkSync(fileName);

    // Execute inside container
    const { stdout, stderr } = await exec(
      `docker exec ${containerId} python3 /home/workspace/${fileName}`
    );

    // Parse JSON output
    let result;
    try {
      result = JSON.parse(stdout.trim());
    } catch (err) {
      result = { stdout, plots: [] };
    }

    res.json({ output: result.stdout, plots: result.plots || [] });
  } catch (err) {
    console.error("🚨 Execution error:", err);
    res.status(500).json({ output: err.stderr || "Error executing code", plots: [] });
  }
});

module.exports = router;
