const sharp = require('sharp');

/**
 * Resize to fit within 1600x1600 (no upscaling, no cropping) and
 * re-encode as JPEG quality ~80. Content stays unchanged, just smaller.
 */
async function compressImage(buffer) {
  return sharp(buffer)
    .rotate() // apply EXIF orientation, then strip it
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

module.exports = { compressImage };
