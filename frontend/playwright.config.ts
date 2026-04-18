import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 300_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  testIgnore: ['**/kanban.spec.ts', '**/canvas.spec.ts', '**/auth.spec.ts', '**/chat.spec.ts', '**/workspace.spec.ts'],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],



  globalSetup: './tests/globalSetup.ts',
})
