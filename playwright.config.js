import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,          // no stray test.only lands in CI
  retries: process.env.CI ? 1 : 0,       // one retry absorbs CI-only flake; the redress test is mutation-verified load-bearing
  use: {
    headless: false, // Extensions require headed mode
  },
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.resolve('distros/chrome')}`,
            `--load-extension=${path.resolve('distros/chrome')}`,
          ],
        },
      },
    },
  ],
});
