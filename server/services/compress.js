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

/**
 * Same idea as compressImage but for full-screen background photos: a
 * bigger bounding box (1920px) and slightly higher quality since it's
 * displayed large, not as a thumbnail.
 */
async function compressBackgroundImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}

module.exports = { compressImage, compressBackgroundImage };
