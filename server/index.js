require('dotenv').config();
const path = require('path');
const express = require('express');
const mealsRouter = require('./routes/meals');

const app = express();
const PORT = process.env.PORT || 3020;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/meals', mealsRouter);

// Never let one bad request crash the whole server.
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});

process.on('unhandledRejection', (err) => {
  console.error('[server] unhandled rejection:', err);
});

app.listen(PORT, () => {
  console.log(`[server] plate-log listening on port ${PORT}`);
});
