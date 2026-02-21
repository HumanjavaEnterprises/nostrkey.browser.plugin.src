#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'dev';
const target = process.argv[3] || 'safari'; // safari | chrome | all

const SRC = './src';
const SAFARI_DIST = './distros/safari';
const CHROME_DIST = './distros/chrome';

const entryPoints = {
    'background.build': `${SRC}/background.js`,
    'content.build': `${SRC}/content.js`,
    'nostr.build': `${SRC}/nostr.js`,
    'popup.build': `${SRC}/popup.js`,
    'sidepanel.build': `${SRC}/sidepanel.js`,
    'options.build': `${SRC}/options.js`,
    'permission/permission.build': `${SRC}/permission/permission.js`,
    'experimental/experimental.build': `${SRC}/experimental/experimental.js`,
    'event_history/event_history.build': `${SRC}/event_history/event_history.js`,
    'vault/vault.build': `${SRC}/vault/vault.js`,
    'api-keys/api-keys.build': `${SRC}/api-keys/api-keys.js`,
    'security/security.build': `${SRC}/security/security.js`,
};

// Chrome needs the service-worker entry point as well
const chromeEntryPoints = {
    ...entryPoints,
    'background-sw.build': `${SRC}/background-sw.js`,
};

const shared = {
    bundle: true,
    plugins: [{
        name: 'node-module-stubs',
        setup(build) {
            // Stub out Node.js built-in modules that crypto-browserify tries to import.
            // The extension runs in a browser context where window.crypto is always
            // available, so the crypto-browserify fallback path is never reached.
            const stubs = ['stream', 'crypto'];
            for (const mod of stubs) {
                build.onResolve({ filter: new RegExp(`^${mod}$`) }, () => ({
                    path: mod,
                    namespace: 'node-stub',
                }));
            }
            build.onLoad({ filter: /.*/, namespace: 'node-stub' }, () => ({
                contents: 'module.exports = {};',
                loader: 'js',
            }));
        },
    }],
};

// Static assets shared by both Safari and Chrome builds
const staticFiles = [
    'popup.html',
    'popup.css',
    'sidepanel.html',
    'full_settings.html',
    'options.css',
    'background.html',
    'permission/permission.html',
    'experimental/experimental.html',
    'event_history/event_history.html',
    'vault/vault.html',
    'api-keys/api-keys.html',
    'security/security.html',
];

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

/**
 * Copy static assets (HTML, CSS, images, locales) into a dist directory.
 */
function copyStaticAssets(distDir) {
    for (const file of staticFiles) {
        const srcPath = path.join(SRC, file);
        const destPath = path.join(distDir, file);
        if (fs.existsSync(srcPath)) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }

    // Images directory
    const imgSrc = path.join(SRC, 'images');
    if (fs.existsSync(imgSrc)) {
        copyRecursive(imgSrc, path.join(distDir, 'images'));
    }

    // _locales directory
    const locSrc = path.join(SRC, '_locales');
    if (fs.existsSync(locSrc)) {
        copyRecursive(locSrc, path.join(distDir, '_locales'));
    }

    // Built CSS
    const cssSrc = path.join(SRC, 'options.build.css');
    if (fs.existsSync(cssSrc)) {
        fs.copyFileSync(cssSrc, path.join(distDir, 'options.build.css'));
    }
}

// ---------------------------------------------------------------------------
// Safari build — bundles to distros/safari/
// ---------------------------------------------------------------------------
async function buildSafari(opts = {}) {
    await esbuild.build({
        ...shared,
        ...opts,
        entryPoints,
        outdir: SAFARI_DIST,
    });

    copyStaticAssets(SAFARI_DIST);

    // Safari manifest
    fs.copyFileSync(path.join(SRC, 'manifest.json'), path.join(SAFARI_DIST, 'manifest.json'));

    // Copy source files that Xcode project expects
    const xcodeSourceFiles = ['popup.js', 'options.js', 'nostr.js', 'content.js', 'background.js'];
    xcodeSourceFiles.forEach(file => {
        const src = path.join(SRC, file);
        const dest = path.join(SAFARI_DIST, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
        }
    });

    console.log(`Safari build complete → ${SAFARI_DIST}/`);
}

// ---------------------------------------------------------------------------
// Chrome build — bundles to distros/chrome/ with the Chrome manifest
// ---------------------------------------------------------------------------
async function buildChrome(opts = {}) {
    await esbuild.build({
        ...shared,
        ...opts,
        entryPoints: chromeEntryPoints,
        outdir: CHROME_DIST,
    });

    copyStaticAssets(CHROME_DIST);

    // Chrome-specific manifest
    fs.copyFileSync(path.join(SRC, 'chrome-manifest.json'), path.join(CHROME_DIST, 'manifest.json'));

    console.log(`Chrome build complete → ${CHROME_DIST}/`);
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
        // Watch mode outputs to Safari dist
        const ctx = await esbuild.context({
            ...shared,
            ...{ sourcemap: 'inline' },
            entryPoints,
            outdir: SAFARI_DIST,
        });
        await ctx.watch();
        // Initial static asset copy so the dist is ready
        copyStaticAssets(SAFARI_DIST);
        fs.copyFileSync(path.join(SRC, 'manifest.json'), path.join(SAFARI_DIST, 'manifest.json'));
        console.log(`Watching for changes (Safari → ${SAFARI_DIST}/)...`);
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
