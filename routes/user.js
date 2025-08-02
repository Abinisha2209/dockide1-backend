// routes/user.js
const express = require("express");
const router = express.Router();
const { getOrCreateContainer } = require("../docker/dockerManager");

router.post("/container", async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const container = await getOrCreateContainer(email);
    res.status(200).json({ message: "Container ready", container });
  } catch (error) {
    console.error("Container creation error:", error);
    res.status(500).json({ message: "Server error while initializing workspace" });
  }
});

module.exports = router;
