# TODO Tracker

Last updated: 2026-03-12

Purpose:
- Keep one running list of work that is still incomplete, still needs testing, or still needs validation.
- Treat this file as the default session handoff document.
- Update it whenever work is finished, deferred, newly discovered, or only partially validated.
- Do not keep completed items in this file.
- Keep all documentation files current every session so README, feature records, tracking docs, and business/legal docs stay aligned with the live app design, behavior, and enabled features.
- Always keep `docs/business_legal_pack/` updated as the app changes so legal/business documents stay aligned with the live routes, billing model, provider stack, data handling, and enabled features.

Update rule:
- Remove items that are fully completed and verified.
- Mark validation-only items as done only after the relevant browser/test/env check has actually happened.
- Add new blockers or follow-up work as soon as they are discovered.
- If an item is finished, delete it instead of archiving it here.

## Current Priority

Local validation target for the next pass:
- `http://localhost:3000`
- Automated checks passed on 2026-03-11: `npm run check`, `npm test`
- Manual browser pass helper: `docs/DASHBOARD_MANUAL_QA_CHECKLIST_2026-03-11.md`

Tomorrow restart point:
- Admin dashboard has been split to a dedicated admin-only shell and is now in active design cleanup.
- Today completed: top nav cleanup, full-width account search, direct dashboard preview launch from search results, KPI-focused revenue cards, free-subscriber email grant popup, cleaner Business Hub, combined monthly trend cards, and warmer admin card styling.
- Next admin UX pass should focus on:
  - simplifying or removing any remaining low-value Section 3 visuals
  - refining Business Hub labels/cards/pages
  - running a real browser QA pass across admin/subscriber/customer after the latest admin-shell split

- [ ] Browser-verify PWA installability and shell updates on the live routes.
Files: `public/index.html`, `public/auth.html`, `public/dashboard.html`, `public/legal.html`, `public/pwa-runtime.js`, `public/sw.js`, `public/manifest.webmanifest`
Notes: The shared manifest link and service-worker registration were reconnected on 2026-03-10 for the active home/auth/dashboard/legal entrypoints. A headless Edge render pass on 2026-03-11 confirmed the live home/auth/legal routes load with the expected shared shell markup, but install prompt behavior, service-worker activation/update behavior, and stale-page regression checks still need an interactive browser session. The dashboard shell entrypoint was also corrected on 2026-03-11 so `public/dashboard.html` now loads `public/dashboard.js` instead of the older `public/ask-lexi-dashboard.js`; rerun browser installability checks against that live entrypoint.

- [x] Browser-validate homepage first-load Lexi visibility.
Files: `public/index.html`, `public/ask-lexi.css`
Notes: Completed on 2026-03-11 with a headless Edge render pass at desktop and mobile widths. Lexi is immediately visible at first load in both layouts, and the compact intro strip now reads as a top-of-page identity cue that supports the main portrait instead of hiding it.

- [ ] Browser-validate the dashboard before more structural edits.
Files: `public/dashboard.html`, `public/dashboard.js`, `public/styles.css`
Notes: Confirm current subscriber/admin/customer layouts still feel correct after the recent control-center, reminders, onboarding, and simplification passes. A headless Edge route check on 2026-03-11 confirmed unauthenticated `/dashboard?role=subscriber|admin|customer` requests correctly land on the auth surface, and authenticated desktop render captures now exist for the current subscriber and admin dashboard first-view layouts. Those first-view renders looked structurally correct for the current control-center/metric-band/diary composition, but customer dashboard rendering and broader in-page interaction coverage are still pending before this item can be closed. The old dashboard mock/demo mode is already disabled in code; remaining demo-scope decisions now apply to public/homepage demo surfaces instead.

- [ ] Browser-verify admin quick toggles in the control center.
Files: `public/dashboard-calendar-pulse.js`, `public/dashboard.js`
Notes: Code path was statically checked on 2026-03-10 and still keeps the storyline booking-driven. The admin dashboard control-center surface now has a 2026-03-11 authenticated first-view render capture, but the quick-toggle controls themselves were not exposed in the top-level admin first-view DOM during the browser pass, so this remaining check likely needs a managed-business/admin-drill-in state plus an in-browser click-through confirmation.

- [ ] Browser-verify the new admin-only dashboard shell and admin search preview flow.
Files: `public/dashboard-admin.html`, `public/dashboard-admin-shell.js`, `public/dashboard-admin-platform.js`, `public/dashboard-admin-support.js`, `src/services/platform_route_handlers.js`
Notes: The admin dashboard was moved on 2026-03-12 to a dedicated `/dashboard?role=admin` shell so it no longer shares subscriber/customer DOM. The admin search area is now full width and opens subscriber/customer preview dashboards directly from result rows. The app revenue area was also rebuilt around operator KPIs plus free-subscriber management. Remaining work is a real browser pass to confirm layout, popup behavior, preview navigation, and overall clarity after the latest simplification pass.

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

- [ ] Confirm production env completeness for billing and notifications.
Files: `.env.example`, `README.md`, `server.js`
Notes: Local validation was re-aligned on 2026-03-11 with `APP_URL=http://localhost:3000`, `CORS_ORIGIN=http://localhost:3000`, and `PAYPAL_ENV=sandbox`. The remaining work is production-side completeness for billing and notifications. `.env.example` and `README.md` already document Stripe monthly/yearly price IDs, notification/runtime controls, and the deferred realtime/avatar variables; realtime/avatar live values stay deferred until the end-of-build rollout.

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
Notes: One guard comment was added on 2026-03-10 for the admin quick-toggle/storyline contract, another now protects the shared role-layout contract in `public/dashboard-startup-runtime.js`, targeted contract comments now protect reminder dedupe plus notification skip-audit behavior in `src/services/reminder_dispatch.js` and `src/services/notifications.js`, and the business-copilot runtime now also documents its popup-card restore contract plus its intentionally sanitized AI-context summary in `public/dashboard-business-copilot.js`; continue selectively. Admin notification-health logic was also extracted into `public/dashboard-admin-notification-health.js`, subscriber readiness plus due-soon reminder logic were extracted into `src/services/subscriber_communication_readiness.js`, the subscriber communications rollup now lives in `src/services/subscriber_communication_summary.js`, subscriber no-show/rebooking calculations now live in `src/services/subscriber_operations_insights.js`, command-center recommendation thresholds now live in `src/services/subscriber_command_center.js`, and more leftover bridge glue was removed from `public/dashboard.js` so manage-UI, request-utils, status/preferences, business-profile, calendar-diary, copilot, shared money/date helpers, provider/date-time helpers, date-key helpers, pad helpers, startup preference wiring, admin/bootstrap/mock dashboard wiring, CRM/waitlist manage-action wiring, calendar-day workspace wiring, staff rota wiring, and broader manager/manage-mode helper delegates now rely more directly on their extracted runtimes. The obvious no-behavior-change alias cleanup passes are now mostly exhausted, so continue only where further extraction still clearly reduces risk.

## Operations And Release Readiness

- [ ] Review legal pack placeholders before public/legal finalization.
Files: `docs/business_legal_pack/*`
Notes: A repo audit on 2026-03-11 found 68 remaining `[PLACEHOLDER ...]` fields across the pack. The highest-priority public-facing gaps are operator/entity/contact placeholders in `legal/01_TERMS_AND_CONDITIONS.md`, controller/contact placeholders in `legal/02_PRIVACY_POLICY_UK_GDPR.md`, VAT/pricing wording in `legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`, refund/cooling-off language in `legal/06_REFUND_AND_CANCELLATION_POLICY.md`, processor/provider entries in `legal/08_DATA_PROCESSING_ADDENDUM_DPA.md` and `legal/16_SUBPROCESSOR_REGISTER.md`, security owner/contact placeholders in `legal/10_INCIDENT_RESPONSE_AND_BREACH_NOTIFICATION.md`, and core business-plan assumptions in `business/20_BUSINESS_PLAN_EXECUTIVE.md` and `business/22_FINANCIAL_MODEL_TEMPLATE.md`. `docs/business_legal_pack/LEGAL_INPUT_CHECKLIST.md` now separates repo-known values from business/legal inputs, and the four main public-facing legal docs were prefilled on 2026-03-11 with repo-confirmed branding/provider context only; the remaining placeholders now mostly require real entity, tax, jurisdiction, and refund-policy decisions before public/legal sign-off.

- [ ] Do a release-readiness sweep once browser validation and realtime env validation are complete.
Files: `README.md`, `.env.example`, `server.js`, `public/*`
Notes: Include URLs, credentials completeness, fallback behavior, and deploy-facing configuration. Automated regression coverage is green again as of 2026-03-11, including Stripe/PayPal redirects, billing runtime/control flows, command-center rendering/actions, Business Hub rendering/reporting flows, copilot/runtime helpers, commercial/merch/revenue/profitability controls, waitlist/ops/CRM wiring, Lexi launch controls, accounting live/integration/manage flows, account-session and emergency-admin flows, admin managed-business/platform flows, booking filters, role chrome, mobile nav, manage-mode/status helpers, module usage/preferences/catalog/routing helpers, PWA shell/runtime wiring, and the broader auth/booking/platform page coverage already listed below; the remaining work is deploy-facing env/browser confirmation. Treat realtime/avatar as a separate late-stage sweep when those paid integrations are intentionally enabled.
