# TODO Tracker

Last updated: 2026-03-10

Purpose:
- Keep one running list of work that is still incomplete, still needs testing, or still needs validation.
- Treat this file as the default session handoff document.
- Update it whenever work is finished, deferred, newly discovered, or only partially validated.
- Do not keep completed items in this file.

Update rule:
- Remove items that are fully completed and verified.
- Mark validation-only items as done only after the relevant browser/test/env check has actually happened.
- Add new blockers or follow-up work as soon as they are discovered.
- If an item is finished, delete it instead of archiving it here.

## Current Priority

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
Notes: Intentionally deferred until later-stage release prep because live OpenAI realtime voice and moving-avatar provider usage adds ongoing cost. Current local `.env` has `OPENAI_API_KEY` but is missing `OPENAI_REALTIME_MODEL`, so live voice sessions are not ready yet.

## Config And Environment

- [ ] Add and verify realtime env values in `.env`.
Files: `.env`
Notes: Deferred until the paid realtime/avatar rollout is approved. Add `OPENAI_REALTIME_MODEL` and, if using avatar mode, `LEXI_AVATAR_PROVIDER`, `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, and optional voice settings when ready.

- [ ] Confirm `APP_URL` and `CORS_ORIGIN` match the environment being tested.
Files: `.env`, `server.js`
Notes: Current `.env` mixes `APP_URL=https://salon-ai-1.onrender.com` with `CORS_ORIGIN=http://localhost:3000`. Confirm whether local or deployed testing is intended before browser validation.

- [ ] Confirm production env completeness for billing, notifications, and Lexi realtime/avatar integrations.
Files: `.env.example`, `README.md`, `server.js`
Notes: `.env.example` and `README.md` were updated on 2026-03-10 for Lexi realtime/avatar variables. Production completeness still needs explicit review.

## Testing And Verification

- [ ] Run the new Lexi realtime test coverage in a non-sandboxed environment.
Files: `tests/lexi_realtime.test.js`
Notes: Test file was added on 2026-03-10 and syntax-checked, but Vitest execution is blocked in this sandbox by Windows `spawn EPERM`.

- [ ] Run the targeted dashboard/backend test suite after the next dashboard or Lexi pass.
Files: `tests/subscriber_dashboard.test.js`, `tests/lexi_realtime.test.js`, `tests/dashboard_admin_notification_health.test.js`, `tests/subscriber_communication_readiness.test.js`, `tests/subscriber_communication_summary.test.js`, `tests/subscriber_operations_insights.test.js`, `tests/subscriber_command_center.test.js`
Notes: Prefer focused runs first, then full `npm test` when environment allows. `tests/subscriber_dashboard.test.js` was expanded on 2026-03-10 to cover communication readiness and due-soon reminder payloads, `tests/dashboard_admin_notification_health.test.js` now covers admin notification guidance logic, `tests/subscriber_communication_readiness.test.js` covers subscriber reminder-readiness plus due-soon reminder calculations, `tests/subscriber_communication_summary.test.js` covers the communications rollup helper, `tests/subscriber_operations_insights.test.js` covers no-show risk plus rebooking prompt generation, and `tests/subscriber_command_center.test.js` covers the command-center recommendation thresholds.

- [ ] Manually verify reminder and notification flows with realistic bookings.
Files: `server.js`, `public/dashboard.html`, `public/dashboard.js`
Notes: Includes reminder settings, due-soon queues, delivery outcomes, subscriber readiness, and admin notification-health visibility.

## Product And UX Follow-Up

- [ ] Keep dashboard styling restrained and avoid broad gradient sweeps.
Files: `public/styles.css`, `public/dashboard.html`
Notes: Current visual preference is calmer surfaces with targeted accents, not heavier shell gradients.

- [ ] Review control-center spacing and dead space in cards.
Files: `public/dashboard.html`, `public/styles.css`
Notes: Especially check subscriber/admin control-center panels after the merch swap and dashboard simplification. Medium-screen layout tightening was added on 2026-03-10 in `public/ask-lexi.css`, including denser two-column panel handling, responsive fallback for dense customer/admin table rows, dashboard-only header/search/export wrapping fallbacks, structured wrapping for selected-day/calendar control rows, and horizontal containment for the weekly team planner; browser confirmation is still needed.

- [ ] Decide whether subscriber/admin should get the same live Lexi voice path now or later.
Files: `public/dashboard.js`, `public/app.js`, `src/services/lexi_realtime_route_handlers.js`
Notes: Customer/public scaffolding exists; broader rollout should be decided only after the paid voice/avatar phase is greenlit.

## Architecture And Maintenance

- [ ] Consolidate duplicated role-visibility logic in dashboard boot/layout code.
Files: `public/dashboard.js`
Notes: Partially reduced on 2026-03-10 by consolidating repeated section-hiding groups into `public/dashboard-layout.js`. Further simplification is still worthwhile if role switching changes again.

- [ ] Add targeted comments in complex runtime areas where behavior contracts are easy to break.
Files: `public/dashboard.js`, `public/dashboard-calendar-pulse.js`, `server.js`, `public/app.js`
Notes: One guard comment was added on 2026-03-10 for the admin quick-toggle/storyline contract; continue selectively. Admin notification-health logic was also extracted into `public/dashboard-admin-notification-health.js`, subscriber readiness plus due-soon reminder logic were extracted into `src/services/subscriber_communication_readiness.js`, the subscriber communications rollup now lives in `src/services/subscriber_communication_summary.js`, subscriber no-show/rebooking calculations now live in `src/services/subscriber_operations_insights.js`, and command-center recommendation thresholds now live in `src/services/subscriber_command_center.js` to reduce risk inside larger files.

- [ ] Add naming and folder conventions guidance, then enforce it on new code.
Files: `docs/PROJECT_STRUCTURE.md`, `docs/tracking/REPO_REORG_PLAN.md`
Notes: Keep this aligned with the ongoing modular dashboard split.

## Operations And Release Readiness

- [ ] Review legal pack placeholders before public/legal finalization.
Files: `docs/business_legal_pack/*`

- [ ] Do a release-readiness sweep once browser validation and realtime env validation are complete.
Files: `README.md`, `.env.example`, `server.js`, `public/*`
Notes: Include URLs, credentials completeness, fallback behavior, and deploy-facing configuration.
