const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

/**
 * Saves the compressed photo to local disk. This is the source of truth
 * for the immediate response — Drive is a best-effort backup on top of it.
 * Returns the path relative to the repo root (what gets stored in the DB).
 */
async function saveToDisk(buffer, filename) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const fullPath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(fullPath, buffer);
  return path.relative(path.join(__dirname, '..', '..'), fullPath);
}

module.exports = { saveToDisk, UPLOADS_DIR };
