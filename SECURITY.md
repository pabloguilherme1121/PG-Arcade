# Security Policy

## Supported version

Security fixes target the current `main` branch and the version published on GitHub Pages.

## Reporting a vulnerability

Do not publish credentials, private data, exploit details, or security-sensitive reproduction data in a public issue. Use a GitHub Security Advisory when available. Non-sensitive bugs can use a normal issue with a minimal reproduction.

## Scope

PG Arcade is a static browser application with no account system or backend API. Progress, favorites and records are stored locally. The project must not introduce dynamic `eval`, secret material in the client bundle, remote code execution paths, or third-party tracking without explicit review.
