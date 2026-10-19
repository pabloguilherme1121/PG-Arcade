// First pass is diagnostic: do not introduce flaky score gates before a verified baseline.
// Runs only in CI against the Pages production build; no analytics SDK or user tracking.
module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:5192/PG-Arcade/",
        "http://127.0.0.1:5192/PG-Arcade/#/jogar/snake",
      ],
      startServerCommand: "npm run preview -- --host 127.0.0.1 --port 5192 --strictPort",
      numberOfRuns: 2,
      settings: { chromeFlags: "--no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.6 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
