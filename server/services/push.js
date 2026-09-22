const webpush = require('web-push');
const { pool } = require('../db');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@localhost',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Sends `payload` (plain object, JSON-stringified) to every stored push
 * subscription. Never throws — a delivery failure to one subscriber never
 * blocks the others. Subscriptions the push service reports as gone
 * (404/410 — user uninstalled, revoked permission, etc.) are pruned from
 * the table so it doesn't accumulate dead endpoints.
 */
async function sendToAllSubscriptions(payload) {
  const { rows } = await pool.query('SELECT * FROM push_subscriptions');
  const body = JSON.stringify(payload);

  await Promise.all(
    rows.map(async (row) => {
      const subscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh_key, auth: row.auth_key },
      };
      try {
        await webpush.sendNotification(subscription, body);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [row.id]);
          console.log(`[push] pruned dead subscription ${row.id}`);
        } else {
          console.error(`[push] send failed for subscription ${row.id}:`, err.message);
        }
      }
    })
  );

  return rows.length;
}

module.exports = { sendToAllSubscriptions };
