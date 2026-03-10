# TODO Tracker

Last updated: 2026-03-10

Purpose:
- Keep one running list of work that is still incomplete, still needs testing, or still needs validation.
- Treat this file as the default session handoff document.
- Update it whenever work is finished, deferred, newly discovered, or only partially validated.
- Do not keep completed items in this file.
- Keep all documentation files current every session so README, feature records, tracking docs, and business/legal docs stay aligned with the live app design, behavior, and enabled features.

Update rule:
- Remove items that are fully completed and verified.
- Mark validation-only items as done only after the relevant browser/test/env check has actually happened.
- Add new blockers or follow-up work as soon as they are discovered.
- If an item is finished, delete it instead of archiving it here.

## Current Priority

- [ ] Browser-verify PWA installability and shell updates on the live routes.
Files: `public/index.html`, `public/auth.html`, `public/dashboard.html`, `public/legal.html`, `public/pwa-runtime.js`, `public/sw.js`, `public/manifest.webmanifest`
Notes: The shared manifest link and service-worker registration were reconnected on 2026-03-10 for the active home/auth/dashboard/legal entrypoints. Confirm install prompt behavior, app-shell updates, and no stale-page regressions after deploy.

- [ ] Browser-validate homepage first-load Lexi visibility.
Files: `public/index.html`, `public/ask-lexi.css`
Notes: Confirm Lexi is immediately visible at the top of the homepage on desktop and mobile, and that the compact intro strip added on 2026-03-10 now supports the main hero portrait instead of feeling like a duplicate.

- [ ] Browser-validate the dashboard before more structural edits.
Files: `public/dashboard.html`, `public/dashboard.js`, `public/styles.css`
Notes: Confirm current subscriber/admin/customer layouts still feel correct after the recent control-center, reminders, onboarding, and simplification passes.

- [ ] Browser-verify admin quick toggles in the control center.
Files: `public/dashboard-calendar-pulse.js`, `public/dashboard.js`
Notes: Code path was statically checked on 2026-03-10 and still keeps the storyline booking-driven. This still needs an in-browser click-through confirmation.

- [ ] Browser-validate merch analytics in both subscriber and admin managed-business views.
Files: `public/dashboard-calendar-pulse.js`, `public/dashboard-merch-analytics.js`, `public/dashboard.js`
Notes: Shared merch analytics logic was deduplicated on 2026-03-10. Confirm rendered numbers, shipment states, and empty states visually.

- [ ] Validate Lexi realtime voice end-to-end with real env values.
Files: `server.js`, `src/services/lexi_realtime_support.js`, `src/services/lexi_realtime_route_handlers.js`, `public/app.js`, `public/dashboard-customer-lexi-realtime.js`
Notes: Intentionally deferred until the end of the build because live OpenAI realtime voice and moving-avatar provider usage adds paid runtime cost. Protected subscriber/admin realtime and avatar session gating is covered by automated tests already; the remaining work is late-stage env configuration plus browser confirmation once rollout is approved.

## Config And Environment

- [ ] Add and verify realtime env values in `.env`.
Files: `.env`
Notes: Deferred until the end-of-build rollout for paid realtime/avatar features. Add `OPENAI_REALTIME_MODEL` and, if using avatar mode, `LEXI_AVATAR_PROVIDER`, `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, and optional voice settings only when that release phase starts.

- [ ] Confirm `APP_URL` and `CORS_ORIGIN` match the environment being tested.
Files: `.env`, `server.js`
Notes: Current `.env` mixes `APP_URL=https://salon-ai-1.onrender.com` with `CORS_ORIGIN=http://localhost:3000`. Confirm whether local or deployed testing is intended before browser validation.

- [ ] Confirm production env completeness for billing, notifications, and Lexi realtime/avatar integrations.
Files: `.env.example`, `README.md`, `server.js`
Notes: `.env.example` and `README.md` now document Lexi realtime/avatar variables, Stripe monthly/yearly price IDs, and optional runtime controls. For now, only billing/notification env completeness is in scope; realtime/avatar live values stay deferred until the end-of-build rollout.

## Testing And Verification

- [ ] Manually verify reminder and notification flows with realistic bookings.
Files: `server.js`, `public/dashboard.html`, `public/dashboard.js`
Notes: Includes reminder settings, due-soon queues, delivery outcomes, subscriber readiness, and admin notification-health visibility. Automated regression coverage for reminder settings, reminder dispatch, notification fallback logic, and reminder-settings handlers landed on 2026-03-10; the remaining work is live/manual behavior confirmation.

## Product And UX Follow-Up

- [ ] Review control-center spacing and dead space in cards.
Files: `public/dashboard.html`, `public/styles.css`
Notes: Especially check subscriber/admin control-center panels after the merch swap and dashboard simplification. Medium-screen layout tightening was added on 2026-03-10 in `public/ask-lexi.css`, including denser two-column panel handling, responsive fallback for dense customer/admin table rows, dashboard-only header/search/export wrapping fallbacks, structured wrapping for selected-day/calendar control rows, and horizontal containment for the weekly team planner; browser confirmation is still needed.

## Architecture And Maintenance

- [ ] Add targeted comments in complex runtime areas where behavior contracts are easy to break.
Files: `public/dashboard.js`, `public/dashboard-calendar-pulse.js`, `server.js`, `public/app.js`
Notes: One guard comment was added on 2026-03-10 for the admin quick-toggle/storyline contract, another now protects the shared role-layout contract in `public/dashboard-startup-runtime.js`, and targeted contract comments now protect reminder dedupe plus notification skip-audit behavior in `src/services/reminder_dispatch.js` and `src/services/notifications.js`; continue selectively. Admin notification-health logic was also extracted into `public/dashboard-admin-notification-health.js`, subscriber readiness plus due-soon reminder logic were extracted into `src/services/subscriber_communication_readiness.js`, the subscriber communications rollup now lives in `src/services/subscriber_communication_summary.js`, subscriber no-show/rebooking calculations now live in `src/services/subscriber_operations_insights.js`, and command-center recommendation thresholds now live in `src/services/subscriber_command_center.js` to reduce risk inside larger files.

## Operations And Release Readiness

- [ ] Review legal pack placeholders before public/legal finalization.
Files: `docs/business_legal_pack/*`

- [ ] Do a release-readiness sweep once browser validation and realtime env validation are complete.
Files: `README.md`, `.env.example`, `server.js`, `public/*`
Notes: Include URLs, credentials completeness, fallback behavior, and deploy-facing configuration. Treat realtime/avatar as a separate late-stage sweep when those paid integrations are intentionally enabled.
