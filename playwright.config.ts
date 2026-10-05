import { defineConfig, devices } from "@playwright/test";
const port = Number(process.env.E2E_PORT || (process.env.CI ? 5173 : 5189));
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://127.0.0.1:${port}/${process.env.GITHUB_ACTIONS ? "PG-Arcade/" : ""}`,
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
        command: `npm run preview -- --port ${port} --strictPort`,
        url: `http://127.0.0.1:${port}/${process.env.GITHUB_ACTIONS ? "PG-Arcade/" : ""}`,
        reuseExistingServer: false,
      },
});
