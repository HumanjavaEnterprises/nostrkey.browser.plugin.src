#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'dev';
const target = process.argv[3] || 'safari'; // safari | chrome | all

const SRC = './Shared (Extension)/Resources';
const CHROME_DIST = './chrome-dist';

const entryPoints = {
    'background.build': `${SRC}/background.js`,
    'content.build': `${SRC}/content.js`,
    'nostr.build': `${SRC}/nostr.js`,
    'popup.build': `${SRC}/popup.js`,
    'options.build': `${SRC}/options.js`,
    'permission/permission.build': `${SRC}/permission/permission.js`,
    'experimental/experimental.build': `${SRC}/experimental/experimental.js`,
    'event_history/event_history.build': `${SRC}/event_history/event_history.js`,
    'vault/vault.build': `${SRC}/vault/vault.js`,
};

// Chrome needs the service-worker entry point as well
const chromeEntryPoints = {
    ...entryPoints,
    'background-sw.build': `${SRC}/background-sw.js`,
};

const shared = {
    bundle: true,
};

// ---------------------------------------------------------------------------
// Safari build — outputs directly into the Xcode Resources folder
// ---------------------------------------------------------------------------
async function buildSafari(opts = {}) {
    await esbuild.build({
        ...shared,
        ...opts,
        entryPoints,
        outdir: SRC,
    });
    console.log('Safari build complete.');
}

// ---------------------------------------------------------------------------
// Chrome build — bundles to chrome-dist/ with the Chrome manifest
// ---------------------------------------------------------------------------
function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            copyRecursive(path.join(src, child), path.join(dest, child));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function buildChrome(opts = {}) {
    // 1. Bundle JS into chrome-dist/
    await esbuild.build({
        ...shared,
        ...opts,
        entryPoints: chromeEntryPoints,
        outdir: CHROME_DIST,
    });

    // 2. Copy static assets that the extension needs at runtime
    const staticFiles = [
        'popup.html',
        'popup.css',
        'options.html',
        'options.css',
        'background.html',
        'permission/permission.html',
        'experimental/experimental.html',
        'event_history/event_history.html',
        'vault/vault.html',
    ];

    for (const file of staticFiles) {
        const srcPath = path.join(SRC, file);
        const destPath = path.join(CHROME_DIST, file);
        if (fs.existsSync(srcPath)) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }

    // 3. Copy images directory
    const imgSrc = path.join(SRC, 'images');
    const imgDest = path.join(CHROME_DIST, 'images');
    if (fs.existsSync(imgSrc)) {
        copyRecursive(imgSrc, imgDest);
    }

    // 4. Copy _locales directory
    const locSrc = path.join(SRC, '_locales');
    const locDest = path.join(CHROME_DIST, '_locales');
    if (fs.existsSync(locSrc)) {
        copyRecursive(locSrc, locDest);
    }

    // 5. Copy Chrome-specific manifest
    fs.copyFileSync('./chrome/manifest.json', path.join(CHROME_DIST, 'manifest.json'));

    // 6. Copy the built CSS (options.build.css) if it exists in SRC
    const cssSrc = path.join(SRC, 'options.build.css');
    if (fs.existsSync(cssSrc)) {
        fs.copyFileSync(cssSrc, path.join(CHROME_DIST, 'options.build.css'));
    }

    console.log('Chrome build complete → chrome-dist/');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
    const isProd = mode === 'prod';
    const buildOpts = isProd
        ? { minify: true, drop: ['console'] }
        : { sourcemap: 'inline' };

    if (mode === 'watch') {
        // Watch mode only supports Safari (Xcode in-place) for now
        const ctx = await esbuild.context({
            ...shared,
            ...{ sourcemap: 'inline' },
            entryPoints,
            outdir: SRC,
        });
        await ctx.watch();
        console.log('Watching for changes (Safari)...');
        return;
    }

    if (target === 'all') {
        await buildSafari(buildOpts);
        await buildChrome(buildOpts);
    } else if (target === 'chrome') {
        await buildChrome(buildOpts);
    } else {
        // default: safari
        await buildSafari(buildOpts);
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
