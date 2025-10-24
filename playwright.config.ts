import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 240 * 1000,

  use: {
    // URL base de la aplicación CARTO para tests de UI
    baseURL: 'https://carto.com/',
    trace: 'on-first-retry',
    actionTimeout: 90 * 1000,
  },

  // === Proyectos para CI/CD (Parte 4: Bonus) ===
  projects: [
    // 1. UI Mode (Tests de Interfaz de Usuario)
    {
      name: 'ui-chromium',
      testDir: './tests/ui/', // Solo ejecuta tests de UI [cite: 85]
      use: { ...devices['Desktop Chrome'], actionTimeout: 90 * 1000 },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui/', // Solo ejecuta tests de UI [cite: 85]
      use: { ...devices['Desktop Firefox'] },
    },

    // 2. API Mode (Tests de API)
    {
      name: 'api-mode',
      testDir: './tests/api/', // Solo ejecuta tests de API [cite: 86]
      // Desactiva el navegador para las pruebas de API [cite: 88]
      use: {
        baseURL: 'https://demoqa.com', // URL base de la API de Libros [cite: 64]
        headless: true,
        // No necesita un dispositivo de escritorio/móvil específico
      },
    },
  ],
});
