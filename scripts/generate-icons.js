#!/usr/bin/env node
/**
 * Run: node scripts/generate-icons.js
 * Generates placeholder PWA icons in public/icons/
 * Replace with real branded icons before production
 */
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0a"/>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:0.1"/>
    </linearGradient>
  </defs>
  <text x="50%" y="58%" font-size="${size * 0.45}" text-anchor="middle" dominant-baseline="middle">👓</text>
</svg>`;

  // Write SVG (usable as icon for dev; convert to PNG for production)
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

// Also create a simple PNG-like placeholder by writing an SVG with .png extension
// (browsers will accept SVG named as .png in many cases during development)
sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0a"/>
  <text x="50%" y="58%" font-size="${size * 0.45}" text-anchor="middle" dominant-baseline="middle">👓</text>
</svg>`;
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), svg);
});

console.log('\n✅ Icons generated in public/icons/');
console.log('💡 For production: replace with real PNG icons from realfavicongenerator.net');
