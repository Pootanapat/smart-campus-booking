import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://127.0.0.1:5180', headless: true },
  webServer: {
    command:
      process.env.E2E_STATIC === '1'
        ? 'node deployment/static-server.mjs --root dist --port 5180'
        : 'npm run dev -- --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1050 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
});
