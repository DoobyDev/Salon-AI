# TBD Tracker

Last updated: 2026-03-12

Purpose:
- Keep only unresolved product, UX, or technical decisions here.
- Do not keep completed or already-decided items in this file.

## Decisions Needed
- [ ] How far should PWA support go beyond installable shell coverage?
  - Files: public/sw.js, public/pwa-runtime.js, public/manifest.webmanifest, public/index.html, public/dashboard.html

- [ ] What is the final scope for public demo surfaces after launch?
  - Files: public/app.js, src/services/lexi_demo_seed.js, public/dashboard-customer-lexi-realtime.js

- [ ] What is the final visual scope of Section 3 on the admin dashboard?
  - Files: public/dashboard-admin.html, public/dashboard-admin-platform.js, public/ask-lexi.css
  - Notes: The KPI cards, monthly trend cards, and signal-card grid are now much closer to the intended operator view, but there is still an open product decision on how much of the richer revenue visual layer should stay versus being reduced further.

- [ ] Should free lifetime promoter access remain file-backed or move into the main database schema later?
  - Files: src/services/free_subscriber_access.js, data/free_subscriber_access.json, src/services/auth_route_handlers.js, src/services/admin_platform_handlers.js
  - Notes: The current email-grant workflow is live and workable for admin operations now. A later schema-backed model may be cleaner if promoter/free-access management becomes a core commercial workflow.
