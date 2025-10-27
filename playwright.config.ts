import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  timeout: 240 * 1000,

  use: {
    baseURL: 'https://carto.com/',
    trace: 'on-first-retry',
    actionTimeout: 90 * 1000,
  },

  projects: [
    // 1. UI Mode
    {
      name: 'ui-chromium',
      testDir: './tests/ui/',
      use: { ...devices['Desktop Chrome'], headless: false },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui/',

      use: { ...devices['Desktop Firefox'], headless: false },
    },

    // 2. API Mode
    {
      name: 'api-mode',
      testDir: './tests/api/',
      workers: 1,
      use: {
        baseURL: 'https://demoqa.com',
      },
    },
  ],
});
