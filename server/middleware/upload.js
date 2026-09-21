const multer = require('multer');

// Buffer stays in memory just long enough to compress; nothing hits disk
// until compress.js has produced the final JPEG.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB raw phone photo, plenty of headroom
});

module.exports = { upload };
