// One-off: rasterizes public/icons/source.svg into the PNG sizes iOS/PWA
// installability wants. Re-run with `node scripts/generate-icons.js` if the
// source SVG ever changes.
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'public', 'icons', 'source.svg');
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');

const sizes = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

async function run() {
  for (const { file, size } of sizes) {
    await sharp(SRC)
      .resize(size, size)
      .flatten({ background: '#ffffff' })
      .png()
      .toFile(path.join(OUT_DIR, file));
    console.log(`[icons] wrote ${file}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
