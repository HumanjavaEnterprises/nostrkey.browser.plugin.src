import { defineConfig } from '@playwright/test';

// Every spec launches its own browser with the extension loaded, through
// launchWithExtension in test/e2e/helpers/consent-harness.js.
export default defineConfig({
  testDir: './test/e2e',
  globalSetup: './test/e2e/helpers/check-build.js',
  timeout: 30000,
  forbidOnly: !!process.env.CI,          // no stray test.only lands in CI
  retries: process.env.CI ? 1 : 0,       // one retry absorbs CI-only flake; the redress test is mutation-verified
  use: {
    headless: false, // Extensions require headed mode
  },
  projects: [
    { name: 'chrome', use: { browserName: 'chromium' } },
  ],
});
