const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, '..', '..', 'secrets', 'google-oauth-token.json');
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

function requireOAuthEnv() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not set in .env');
  }
  return { clientId, clientSecret };
}

function readStoredToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
}

function writeStoredToken(token) {
  fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

/**
 * Returns an authenticated Drive v3 client using the refresh token saved by
 * driveAuthSetup.js. Throws if the one-time device-flow authorization
 * hasn't been done yet (run: npm run drive:auth).
 */
function getDriveClient() {
  const { clientId, clientSecret } = requireOAuthEnv();
  const token = readStoredToken();
  if (!token || !token.refresh_token) {
    throw new Error(
      `no stored OAuth token at ${TOKEN_PATH} — run "npm run drive:auth" once to authorize`
    );
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: token.refresh_token });

  return google.drive({ version: 'v3', auth: oAuth2Client });
}

module.exports = { getDriveClient, readStoredToken, writeStoredToken, TOKEN_PATH, SCOPE };
