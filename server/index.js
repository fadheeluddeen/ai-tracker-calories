require('dotenv').config();
const path = require('path');
const express = require('express');
const mealsRouter = require('./routes/meals');
const pantryRouter = require('./routes/pantry');
const chefRouter = require('./routes/chef');
const supplementsRouter = require('./routes/supplements');
const pushRouter = require('./routes/push');
const settingsRouter = require('./routes/settings');
const { ensureSeeded } = require('./services/settings');
const { startSupplementReminderJob } = require('./jobs/supplementReminders');

const app = express();
const PORT = process.env.PORT || 3020;

const CLIENT_DIST = path.join(__dirname, '..', 'reference-ui', 'dist');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/meals', mealsRouter);
app.use('/api/pantry', pantryRouter);
app.use('/api/chef', chefRouter);
app.use('/api/supplements', supplementsRouter);
app.use('/api/push', pushRouter);
app.use('/api/settings', settingsRouter);

// Real frontend (built via `npm run build:client`). Single-page app, so any
// non-API, non-static route falls through to index.html.
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Never let one bad request crash the whole server.
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});

process.on('unhandledRejection', (err) => {
  console.error('[server] unhandled rejection:', err);
});

ensureSeeded()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] plate-log listening on port ${PORT}`);
    });
    startSupplementReminderJob();
  })
  .catch((err) => {
    console.error('[server] failed to seed settings table, exiting:', err);
    process.exit(1);
  });
