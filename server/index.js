require('dotenv').config();
const path = require('path');
const express = require('express');
const mealsRouter = require('./routes/meals');
const pantryRouter = require('./routes/pantry');
const chefRouter = require('./routes/chef');
const supplementsRouter = require('./routes/supplements');
const pushRouter = require('./routes/push');
const settingsRouter = require('./routes/settings');
const profileRouter = require('./routes/profile');
const weightRouter = require('./routes/weight');
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
app.use('/api/profile', profileRouter);
app.use('/api/weight', weightRouter);

// Real frontend (built via `npm run build:client`). Single-page app, so any
// non-API, non-static route falls through to index.html.
// index.html must never be cached — it's the only file that points at the
// current build, and a stale copy (iOS home-screen apps hold on to it)
// keeps loading the old JS forever. Hashed assets can cache indefinitely.
const setClientCacheHeaders = (res, filePath) => {
  if (filePath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'no-store');
  } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
};
app.use(express.static(CLIENT_DIST, { setHeaders: setClientCacheHeaders }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.setHeader('Cache-Control', 'no-store');
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
