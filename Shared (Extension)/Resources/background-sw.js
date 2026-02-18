/**
 * Chrome MV3 service worker entry point.
 *
 * Chrome MV3 requires a service worker instead of a background page.
 * This file simply re-exports everything from background.js so that
 * esbuild can bundle it into a single file (background-sw.build.js)
 * that is referenced by the Chrome manifest's "service_worker" field.
 *
 * The background.js module registers its own runtime.onMessage listener
 * at import time, so importing it here is sufficient to activate all
 * background logic.
 */

import './background.js';
