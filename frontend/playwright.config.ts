import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'
const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000'

const browserChannel =
  process.env.CI || process.env.PLAYWRIGHT_BUNDLE_CHROMIUM === 'true'
    ? undefined
    : 'chrome'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    ...(browserChannel ? { channel: browserChannel } : {}),
    baseURL,
    trace: 'on-first-retry',
  },
  globalSetup: './e2e/global-setup.ts',
  metadata: {
    apiURL,
  },
})
