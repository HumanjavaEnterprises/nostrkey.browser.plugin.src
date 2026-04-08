import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
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
