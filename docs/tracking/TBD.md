# TBD Tracker

Last updated: 2026-03-10

Purpose:
- Keep only unresolved product, UX, or technical decisions here.
- Do not keep completed or already-decided items in this file.

## Decisions Needed
- [ ] How far should PWA support go beyond installable shell coverage?
  - Files: public/sw.js, public/pwa-runtime.js, public/manifest.webmanifest, public/index.html, public/dashboard.html

- [ ] What is the final scope for demo-mode surfaces vs production-only surfaces?
  - Files: public/dashboard.html, public/dashboard.js

- [ ] Keep or remove hidden account-support panel until backend/admin flows are fully validated?
  - Files: public/dashboard.html, public/dashboard.js, server.js

- [ ] Decide naming convention migration strategy:
  - camelCase ids?
  - section naming consistency?
  - module key taxonomy?

- [ ] Decide comment policy:
  - Comment only non-obvious logic blocks
  - Avoid line-by-line narration
  - Require JSDoc on exported/shared helpers
