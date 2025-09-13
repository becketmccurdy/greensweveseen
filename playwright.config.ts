import { defineConfig } from '@playwright/test'

const DEPLOY_BASE_URL = process.env.E2E_BASE_URL
const baseURL = DEPLOY_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },
  // Only start a local dev server when no external base URL is provided
  ...(DEPLOY_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          timeout: 120_000,
          reuseExistingServer: !process.env.CI,
          env: {
            NEXT_TELEMETRY_DISABLED: '1',
          },
        },
      }),
})
