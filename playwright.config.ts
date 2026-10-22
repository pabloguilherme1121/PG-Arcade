import { defineConfig, devices } from "@playwright/test";
const port = Number(process.env.E2E_PORT || (process.env.CI ? 5173 : 5189));
// Repeated snapshots of 132 SVG covers dominate Firefox tracing time. Preserve
// actions, network, source and screenshots; failures also keep error-context.md.
// Opt into full DOM snapshots when investigating a specific Firefox failure.
const firefoxTrace = process.env.E2E_FULL_DOM_TRACE === "1"
  ? "retain-on-failure" as const
  : { mode: "retain-on-failure", snapshots: false, screenshots: true, sources: true } as const;
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL:
      process.env.E2E_BASE_URL ||
      `http://127.0.0.1:${port}/${process.env.GITHUB_ACTIONS ? "PG-Arcade/" : ""}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ...(process.env.CI
      ? [{ name: "firefox", use: { ...devices["Desktop Firefox"], trace: firefoxTrace } }]
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
