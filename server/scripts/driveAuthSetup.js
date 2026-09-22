// One-time setup: authorizes this app against your Google Drive account
// using the OAuth 2.0 device flow (no browser needed on this machine).
//
// Requires an OAuth client of type "TVs and Limited Input devices" —
// see README for how to create one. Set GOOGLE_OAUTH_CLIENT_ID and
// GOOGLE_OAUTH_CLIENT_SECRET in .env first, then run: npm run drive:auth
require('dotenv').config();
const { writeStoredToken, SCOPE } = require('../services/driveOAuth');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env first.');
    process.exit(1);
  }

  const deviceRes = await fetch('https://oauth2.googleapis.com/device/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, scope: SCOPE }),
  });
  const device = await deviceRes.json();
  if (!deviceRes.ok) {
    console.error('Failed to start device authorization:', device);
    process.exit(1);
  }

  console.log('\n1. On your phone or laptop, open:', device.verification_url);
  console.log('2. Enter this code when asked:', device.user_code);
  console.log('\nWaiting for you to approve...\n');

  const intervalMs = (device.interval || 5) * 1000;
  const deadline = Date.now() + device.expires_in * 1000;

  while (Date.now() < deadline) {
    await sleep(intervalMs);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        device_code: device.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    const token = await tokenRes.json();

    if (tokenRes.ok) {
      writeStoredToken(token);
      console.log('Authorized. Refresh token saved — the nightly backup job can now run unattended.');
      return;
    }

    if (token.error === 'authorization_pending') continue;
    if (token.error === 'slow_down') {
      await sleep(intervalMs);
      continue;
    }

    console.error('Authorization failed:', token);
    process.exit(1);
  }

  console.error('Timed out waiting for approval. Run this again to retry.');
  process.exit(1);
}

main().catch((err) => {
  console.error('driveAuthSetup failed:', err);
  process.exit(1);
});
