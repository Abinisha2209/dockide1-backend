// docker/dockerManager.js
async function getOrCreateContainer(email) {
  const containerName = `dockide_${email.replace(/[@.]/g, "_")}`;
  const volumeName = `dockide_volume_${email.replace(/[@.]/g, "_")}`;

  const exec = require("child_process").execSync;

  try {
    // Check if container already exists
    const existing = exec(`docker ps -a --format "{{.Names}}"`).toString();
    if (existing.includes(containerName)) {
      return containerName; // container already exists
    }

    // Create volume if not exists (this is safe even if it exists)
    exec(`docker volume create ${volumeName}`);

    // Create new container
    exec(
      `docker run -d --name ${containerName} -v ${volumeName}:/home/workspace python:3.11-slim tail -f /dev/null`
    );

    return containerName;
  } catch (err) {
    console.error("Docker error:", err);
    throw err;
  }
}

// ✅ Export properly
module.exports = { getOrCreateContainer };
