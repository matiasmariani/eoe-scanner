// Run once: node scripts/generate-icons.mjs
// Requires: npm install --save-dev sharp
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const svgIcon = readFileSync(join(root, 'public/icons/icon.svg'));
const svgMaskable = readFileSync(join(root, 'public/icons/icon-maskable.svg'));

await sharp(svgIcon).resize(192, 192).toFile(join(root, 'public/icons/icon-192.png'));
await sharp(svgIcon).resize(512, 512).toFile(join(root, 'public/icons/icon-512.png'));
await sharp(svgMaskable).resize(512, 512).toFile(join(root, 'public/icons/icon-maskable-512.png'));
await sharp(svgIcon).resize(180, 180).toFile(join(root, 'public/apple-touch-icon.png'));
await sharp(svgIcon).resize(32, 32).toFile(join(root, 'public/favicon.png'));

console.log('Icons generated successfully.');
