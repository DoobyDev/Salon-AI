# FIXME Tracker

Last updated: 2026-03-10

## Known Issues / Technical Debt
- [ ] Realtime session error handling paths are present, but production readiness depends on configured keys and browser validation.
  - Files: public/app.js, public/dashboard.js, server.js
  - Notes: Realtime can return non-ready contracts when env is missing. Treat this as deferred until the paid OpenAI rollout phase begins.

- [ ] Avatar flow has explicit non-configured states; verify fallback UX is consistent across homepage and dashboard.
  - Files: public/app.js, public/dashboard.js, server.js
  - Notes: Treat this as deferred until the paid avatar rollout phase begins.

- [ ] Dashboard contains dense mixed concerns (UI render + state + events + business logic) in a single large script.
  - Files: public/dashboard.js
  - Notes: Refactor into modules in phases after behavior freeze.
