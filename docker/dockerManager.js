// docker/dockerManager.js
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function getOrCreateContainer(email) {
  const containerName = `dockide_${email.replace(/[@.]/g, "_")}`;
  const volumeName = `dockide_volume_${email.replace(/[@.]/g, "_")}`;

  try {
    // Check existing container
    const { stdout: existing } = await exec(
      `docker ps -aqf "name=^/${containerName}$"`
    );
    if (existing.trim()) {
      return { Id: existing.trim().substring(0, 12), Name: containerName };
    }

    // Create volume
    await exec(`docker volume create ${volumeName}`);

    // Create container from full Python ML/DL image
    const { stdout } = await exec(
  `docker run -d --name ${containerName} -v ${volumeName}:/home/workspace dockide-python:latest tail -f /dev/null`
);


    return { Id: created.trim().substring(0, 12), Name: containerName };
  } catch (err) {
    console.error("🚨 Docker error:", err);
    throw err;
  }
}

module.exports = { getOrCreateContainer };
