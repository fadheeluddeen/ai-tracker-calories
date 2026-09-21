const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { Readable } = require('stream');

let driveClient = null;

function getDriveClient() {
  if (driveClient) return driveClient;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath || !fs.existsSync(path.resolve(keyPath))) {
    throw new Error(`service account key not found at ${keyPath}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(keyPath),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

/**
 * Best-effort backup upload to a shared Drive folder. Callers must not let
 * a failure here fail the request — this always resolves; on any problem
 * it logs and returns null instead of throwing.
 */
async function uploadToDrive(buffer, filename) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      console.error('[drive] GOOGLE_DRIVE_FOLDER_ID is not set, skipping backup upload');
      return null;
    }

    const drive = getDriveClient();
    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: 'image/jpeg',
        body: Readable.from(buffer),
      },
      fields: 'id',
    });

    return res.data.id || null;
  } catch (err) {
    console.error('[drive] backup upload failed:', err.message);
    return null;
  }
}

module.exports = { uploadToDrive };
