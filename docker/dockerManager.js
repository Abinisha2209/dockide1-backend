const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function getOrCreateContainer(email) {
  const containerName = `dockide_${email.replace(/[@.]/g, "_")}`;
  const volumeName = `dockide_volume_${email.replace(/[@.]/g, "_")}`;

  try {
    // 🔍 Check if container exists and get short ID
    const { stdout: existing } = await exec(
      `docker ps -aqf "name=^/${containerName}$"`
    );

    if (existing.trim()) {
      const shortId = existing.trim().substring(0, 12);
      console.log(`🔎 Existing container found: ${shortId}`);
      return { Id: shortId, Name: containerName };
    }

    // 🧱 Create volume
    await exec(`docker volume create ${volumeName}`);

    // 🚀 Create container and get short ID
    const { stdout: created } = await exec(
      `docker run -d --name ${containerName} -v ${volumeName}:/home/workspace python:3.11-slim tail -f /dev/null`
    );

    const shortId = created.trim().substring(0, 12);
    console.log(`✅ New container created: ${shortId}`);
    return { Id: shortId, Name: containerName };
  } catch (err) {
    console.error("🚨 Docker error:", err);
    throw err;
  }
}

module.exports = { getOrCreateContainer };