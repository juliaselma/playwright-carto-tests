import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  outputDir: 'playwright-report',
  timeout: 240 * 1000,
  workers: 2,

  use: {
    baseURL: 'https://carto.com/',
    trace: 'on-first-retry',
    actionTimeout: 90 * 1000,
  },

  projects: [
    // 1. UI Mode (Chromium)
    {
      name: 'ui-chromium',
      testDir: './tests/ui/',
      use: { ...devices['Desktop Chrome'], headless: isCI },
    },

    // 1. UI Mode (Firefox)
    {
      name: 'ui-firefox',
      testDir: './tests/ui/',
      use: { ...devices['Desktop Firefox'], headless: isCI },
    },

    // 2. API Mode
    {
      name: 'api-mode',
      testDir: './tests/api/',
      use: {
        baseURL: 'https://demoqa.com',
      },
    },
  ],
});
