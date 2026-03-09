# TBD Tracker

Last updated: 2026-03-05

## Decisions Needed
- [ ] Should subscriber/admin get full live voice/avatar now, or later after customer/public hardening?
  - Files: server.js, public/dashboard.js

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
