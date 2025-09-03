const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const router = express.Router();

const asyncExec = util.promisify(exec);

router.post("/run", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).send("Missing input");

  const containerName = `dockide_${email.replace(/[@.]/g, "_")}`;
  const codePath = `/tmp/${containerName}_user_code.py`;

  try {
    fs.writeFileSync(codePath, code);
    await asyncExec(`docker cp ${codePath} ${containerName}:/home/workspace/user_code.py`);
    const { stdout } = await asyncExec(`docker exec ${containerName} python /home/workspace/user_code.py`);
    fs.unlinkSync(codePath);

    const expected = "35";
    const got = stdout.trim();
    const passed = got === expected;

    res.json({ passed, expected, got });
  } catch (err) {
    console.error("Execution failed:", err);
    res.status(500).send("Code execution failed");
  }
});

module.exports = router;
