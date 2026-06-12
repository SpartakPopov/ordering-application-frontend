import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Each test gets 30 seconds before it is marked as failed
  timeout: 30_000,

  // Retry once on CI so a flaky network startup does not fail the whole run
  retries: process.env.CI ? 1 : 0,

  use: {
    // All page.goto('/') calls are relative to this base URL
    baseURL: 'http://localhost',

    // Keep a video of every failed test — uploaded as a CI artefact for debugging
    video: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  reporter: [
    ['list'],                          // console output during the run
    ['html', { open: 'never' }],       // HTML report saved to playwright-report/
  ],
});
