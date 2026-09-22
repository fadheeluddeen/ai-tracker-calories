const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const WARN_THRESHOLD_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

function getUploadsDirSize() {
  let total = 0;
  for (const name of fs.readdirSync(UPLOADS_DIR)) {
    const stat = fs.statSync(path.join(UPLOADS_DIR, name));
    if (stat.isFile()) total += stat.size;
  }
  return total;
}

/**
 * Saves the compressed photo to local disk. This is the source of truth
 * for the immediate response — Drive is a best-effort backup on top of it.
 * Returns the path relative to the repo root (what gets stored in the DB).
 */
async function saveToDisk(buffer, filename) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const fullPath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(fullPath, buffer);

  const totalSize = getUploadsDirSize();
  if (totalSize > WARN_THRESHOLD_BYTES) {
    console.warn(
      `[storage] uploads/ is now ${(totalSize / 1024 ** 3).toFixed(2)}GB — over the 5GB warning threshold`
    );
  }

  return path.relative(path.join(__dirname, '..', '..'), fullPath);
}

module.exports = { saveToDisk, UPLOADS_DIR };
