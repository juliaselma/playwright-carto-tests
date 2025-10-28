/*import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  //reporter: 'html',
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
      reporter: [['html', { outputFolder: 'playwright-report/chromium' }]],
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui/',

      use: { ...devices['Desktop Firefox'], headless: false },
      reporter: [['html', { outputFolder: 'playwright-report/firefox' }]],
    },

    // 2. API Mode
    {
      name: 'api-mode',
      testDir: './tests/api/',
      workers: 1,
      use: {
        baseURL: 'https://demoqa.com',
      },
      reporter: [['html', { outputFolder: 'playwright-report/api' }]],
    },
  ],
});*/
// playwright.config.ts (VERSION CORREGIDA)

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

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
      use: { ...devices['Desktop Chrome'], headless: true },
    },

    // 1. UI Mode (Firefox)
    {
      name: 'ui-firefox',
      testDir: './tests/ui/',
      use: { ...devices['Desktop Firefox'], headless: true },
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
