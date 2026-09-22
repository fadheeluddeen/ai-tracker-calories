const cron = require('node-cron');
const { pool } = require('../db');
const { sendToAllSubscriptions } = require('../services/push');

function currentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Finds active supplements whose schedule includes the current minute
 * (matched via Postgres to_char, so seconds in schedule_times are
 * ignored) and pushes a reminder for each to every subscribed device.
 */
async function checkAndNotify() {
  const hhmm = currentHHMM();

  let rows;
  try {
    const result = await pool.query(
      `SELECT id, name, dosage FROM supplements
       WHERE active = true AND EXISTS (
         SELECT 1 FROM unnest(schedule_times) t WHERE to_char(t, 'HH24:MI') = $1
       )`,
      [hhmm]
    );
    rows = result.rows;
  } catch (err) {
    console.error('[supplementReminders] lookup failed:', err.message);
    return;
  }

  for (const supplement of rows) {
    try {
      await sendToAllSubscriptions({
        title: 'Supplement reminder',
        body: supplement.dosage ? `${supplement.name} — ${supplement.dosage}` : supplement.name,
      });
      console.log(`[supplementReminders] sent reminder for "${supplement.name}"`);
    } catch (err) {
      console.error(`[supplementReminders] send failed for "${supplement.name}":`, err.message);
    }
  }
}

function startSupplementReminderJob() {
  cron.schedule('* * * * *', checkAndNotify);
  console.log('[supplementReminders] cron job scheduled (every minute)');
}

module.exports = { startSupplementReminderJob, checkAndNotify };
