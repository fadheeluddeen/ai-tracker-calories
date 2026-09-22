// Nightly job: uploads any photo in uploads/ that hasn't been backed up to
// Drive yet. Drive is a backup copy only — local files are never deleted
// here. A failure on one file is logged and skipped; it never aborts the
// rest of the run, so the next photo (and tomorrow night's retry) still
// happen.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');
const { getDriveClient } = require('../services/driveOAuth');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function uploadOne(drive, folderId, filename) {
  const fullPath = path.join(UPLOADS_DIR, filename);
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(fullPath),
    },
    fields: 'id',
  });
  return res.data.id;
}

async function main() {
  let drive;
  try {
    drive = getDriveClient();
  } catch (err) {
    log('cannot start backup run:', err.message);
    await pool.end();
    process.exit(1);
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

  const files = fs
    .readdirSync(UPLOADS_DIR)
    .filter((f) => f !== '.gitkeep' && !f.startsWith('.'));

  log(`found ${files.length} photo(s) on disk, checking backup status...`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of files) {
    const photoDiskPath = `uploads/${filename}`;

    let row;
    try {
      const { rows } = await pool.query(
        'SELECT id, backed_up FROM meals WHERE photo_disk_path = $1',
        [photoDiskPath]
      );
      row = rows[0];
    } catch (err) {
      log(`✗ ${filename}: db lookup failed, skipping —`, err.message);
      failed++;
      continue;
    }

    if (!row) {
      log(`- ${filename}: no matching meals row, skipping`);
      skipped++;
      continue;
    }
    if (row.backed_up) {
      skipped++;
      continue;
    }

    try {
      const driveId = await uploadOne(drive, folderId, filename);
      await pool.query('UPDATE meals SET backed_up = true, photo_drive_id = $1 WHERE id = $2', [
        driveId,
        row.id,
      ]);
      log(`✓ ${filename} -> drive file ${driveId}`);
      uploaded++;
    } catch (err) {
      log(`✗ ${filename}: upload failed, will retry next run —`, err.message);
      failed++;
    }
  }

  log(`done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  await pool.end();
}

main().catch(async (err) => {
  log('unexpected error, aborting run:', err);
  await pool.end();
  process.exit(1);
});
