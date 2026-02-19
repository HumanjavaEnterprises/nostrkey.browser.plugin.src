#!/usr/bin/env node
/**
 * Generate icon PNGs from SVG
 * Run: node scripts/generate-icons.js
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.join(__dirname, '../src/images/NostrKey-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/images');

const ICON_SIZES = [
    { name: 'icon-48.png', size: 48 },
    { name: 'icon-64.png', size: 64 },
    { name: 'icon-96.png', size: 96 },
    { name: 'icon-128.png', size: 128 },
    { name: 'icon-256.png', size: 256 },
    { name: 'icon-512.png', size: 512 },
];

const TOOLBAR_SIZES = [
    { name: 'toolbar-16.png', size: 16 },
    { name: 'toolbar-19.png', size: 19 },
    { name: 'toolbar-32.png', size: 32 },
    { name: 'toolbar-38.png', size: 38 },
    { name: 'toolbar-48.png', size: 48 },
    { name: 'toolbar-72.png', size: 72 },
];

async function generateIcons() {
    const svgBuffer = fs.readFileSync(SVG_PATH);
    
    const allSizes = [...ICON_SIZES, ...TOOLBAR_SIZES];
    
    for (const { name, size } of allSizes) {
        const outputPath = path.join(OUTPUT_DIR, name);
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);
        console.log(`Generated: ${name} (${size}x${size})`);
    }
    
    console.log('\\nAll icons generated!');
}

generateIcons().catch(console.error);
