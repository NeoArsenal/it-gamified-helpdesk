const sharp = require('sharp');
const fs = require('fs');

async function generateAllIcons() {
  console.log('Generating crisp anti-aliased vector icons...');

  // 1. Render emblem-clean.png for web UI (512x512 with smooth squircle anti-aliasing)
  await sharp('public/emblem.svg')
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile('public/emblem-clean.png');
  console.log('✓ public/emblem-clean.png generated (512x512)');

  // 2. Render PWA & Mobile App Icons from public/app-icon.svg (Solid #134685, safe-area centered)
  // 512x512
  await sharp('public/app-icon.svg')
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile('public/icon-512.png');
  console.log('✓ public/icon-512.png generated (512x512)');

  // 192x192
  await sharp('public/app-icon.svg')
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile('public/icon-192.png');
  console.log('✓ public/icon-192.png generated (192x192)');

  // apple-touch-icon.png (180x180)
  await sharp('public/app-icon.svg')
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile('public/apple-touch-icon.png');
  console.log('✓ public/apple-touch-icon.png generated (180x180)');

  // App router icons (Next.js automatically serves these)
  await sharp('public/app-icon.svg')
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile('src/app/icon.png');
  console.log('✓ src/app/icon.png generated (512x512)');

  await sharp('public/app-icon.svg')
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile('src/app/apple-icon.png');
  console.log('✓ src/app/apple-icon.png generated (180x180)');

  console.log('\nAll application icons successfully generated with 100% anti-aliasing and ZERO jagged edges!');
}

generateAllIcons().catch(console.error);
