# TODO Tracker

Last updated: 2026-03-05

## High Priority
- [ ] Validate dashboard in browser before further structural edits.
  - Files: public/dashboard.html, public/dashboard.js
- [ ] Verify admin quick toggles only affect summary/finance cards and do not alter storyline visuals.
  - Files: public/dashboard.js, server.js
- [ ] Browser-validate merch analytics (subscriber + admin managed business).
  - Files: public/dashboard.html, public/dashboard.js, server.js
- [ ] Validate Lexi realtime/avatar path end-to-end with real env keys.
  - Files: server.js, public/app.js, public/dashboard.js

## Product/UX
- [ ] Keep dashboard styling restrained (avoid broad gradient sweeps).
  - Files: public/styles.css, public/dashboard.html
- [ ] Review control-center spacing to reduce dead space in cards.
  - Files: public/dashboard.html, public/styles.css

## Architecture/Codebase
- [ ] Consolidate duplicated role-visibility logic in dashboard boot/layout logic.
  - Files: public/dashboard.js
- [ ] Add module-level comments for complex areas (targeted, not blanket comments).
  - Files: server.js, public/dashboard.js, public/app.js
- [ ] Add naming and folder conventions doc, then enforce on new code.
  - Files: docs/PROJECT_STRUCTURE.md, docs/tracking/REPO_REORG_PLAN.md

## Operations
- [ ] Confirm production env completeness for realtime/avatar and billing integrations.
  - Files: .env.example, server.js, README.md
- [ ] Review legal pack placeholders before public/legal finalization.
  - Files: docs/business_legal_pack/*
