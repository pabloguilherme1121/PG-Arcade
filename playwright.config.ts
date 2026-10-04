import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://127.0.0.1:5173/${process.env.GITHUB_ACTIONS ? "PG-Arcade/" : ""}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ...(process.env.CI
      ? [{ name: "firefox", use: { ...devices["Desktop Firefox"] } }]
      : []),
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run preview",
        url: `http://127.0.0.1:5173/${process.env.GITHUB_ACTIONS ? "PG-Arcade/" : ""}`,
        reuseExistingServer: !process.env.CI,
      },
});
