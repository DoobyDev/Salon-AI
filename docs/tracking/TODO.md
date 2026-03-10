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
Notes: Confirm current subscriber/admin/customer layouts still feel correct after the recent control-center, reminders, onboarding, and simplification passes. The old dashboard mock/demo mode is already disabled in code; remaining demo-scope decisions now apply to public/homepage demo surfaces instead.

- [ ] Browser-verify admin quick toggles in the control center.
Files: `public/dashboard-calendar-pulse.js`, `public/dashboard.js`
Notes: Code path was statically checked on 2026-03-10 and still keeps the storyline booking-driven. This still needs an in-browser click-through confirmation.

- [ ] Browser-verify the admin accounts panel search, selection, and inline edit flow.
Files: `public/dashboard.html`, `public/dashboard.js`, `public/dashboard-admin-support.js`
Notes: The admin account tooling was rewired on 2026-03-10 to the current `adminAccountSearchForm` / `adminAccountsTable` / `adminAccountDetail` surface, and automated runtime coverage now exists for initial load, search submission, inline account edits, both managed-action buttons, and both booking/platform CSV export paths in `tests/admin_support_runtime.test.js`. The remaining work is in-browser confirmation of account search, account selection, subscriber business-name edits, managed-dashboard jump actions, popup behavior, and the visible export experience.

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

- [ ] Confirm production env completeness for billing and notifications.
Files: `.env.example`, `README.md`, `server.js`
Notes: `.env.example` and `README.md` now document Stripe monthly/yearly price IDs, notification/runtime controls, and the deferred realtime/avatar variables. For the current release phase, only billing and notification env completeness are in scope; realtime/avatar live values stay deferred until the end-of-build rollout.

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
Notes: Placeholder fields are still present across the legal and business pack, including operator/entity/contact placeholders in `legal/01_TERMS_AND_CONDITIONS.md`, privacy/contact placeholders in `legal/02_PRIVACY_POLICY_UK_GDPR.md`, billing/refund placeholders in `legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md` and `legal/06_REFUND_AND_CANCELLATION_POLICY.md`, subprocessor/provider placeholders in `legal/16_SUBPROCESSOR_REGISTER.md`, and core business-plan assumptions in `business/20_BUSINESS_PLAN_EXECUTIVE.md` and `business/22_FINANCIAL_MODEL_TEMPLATE.md`. Replace these with real company, policy, and operating values before public/legal sign-off.

- [ ] Do a release-readiness sweep once browser validation and realtime env validation are complete.
Files: `README.md`, `.env.example`, `server.js`, `public/*`
Notes: Include URLs, credentials completeness, fallback behavior, and deploy-facing configuration. Stripe/PayPal redirect behavior is already covered in `tests/billing_redirects.test.js`, subscriber billing summary plus checkout/portal runtime branches are now covered in `tests/subscriber_billing_runtime.test.js`, dashboard billing control buttons are now covered in `tests/billing_controls_runtime.test.js`, subscriber/admin command-center rendering plus action branches are now covered in `tests/dashboard_command_center_runtime.test.js`, Business Hub onboarding/billing/first-week growth rendering is now covered in `tests/business_growth_panel_runtime.test.js`, Business Hub popup card rendering/open-close/Lexi-launch/focus branches are now covered in `tests/business_hub_popup_runtime.test.js`, subscriber copilot snapshot/link inference plus popup/chat/workspace/context helper branches are now covered in `tests/business_copilot_runtime.test.js`, commercial/merch/revenue/profitability dashboard rendering branches are now covered in `tests/business_controls_runtime.test.js`, commercial/revenue/profitability form and managed-action event wiring is now covered in `tests/business_controls_events_runtime.test.js`, Business Hub command-deck/report payload/report HTML/print/email-flow/event wiring branches are now covered in `tests/business_reporting_runtime.test.js`, waitlist staging/rendering plus waitlist/ops/CRM event wiring is now covered in `tests/operations_runtime.test.js`, module Lexi-assist launch plus operator action handling is now covered in `tests/module_actions_runtime.test.js`, module operator blueprint and Lexi brief helper logic is now covered in `tests/module_brief_helpers_runtime.test.js`, accounting live timeframe/range controls plus business live-payload loading are now covered in `tests/accounting_live_controls_runtime.test.js` and `tests/accounting_live_runtime.test.js`, accounting integration render/load/connect/disconnect branches are now covered in `tests/accounting_integrations_runtime.test.js`, managed accounting add/edit/delete flows are now covered in `tests/manage_accounting_actions_runtime.test.js`, local account-session plus subscriber emergency-admin modal flows are now covered in `tests/account_session_controls_runtime.test.js` and `tests/contact_admin_runtime.test.js`, admin managed-business selection/shortcut controls are now covered in `tests/admin_business_controls_runtime.test.js` and `tests/admin_managed_controls_runtime.test.js`, admin business filtering/select-summary/loading orchestration is now covered in `tests/admin_business_runtime.test.js`, admin platform overview/export paths are now covered in `tests/admin_platform_runtime.test.js`, customer/subscriber/admin Lexi launch controls are now covered in `tests/ai_launch_controls_runtime.test.js`, booking date-filter presets plus dashboard role-chrome initialization are now covered in `tests/booking_filter_runtime.test.js` and `tests/dashboard_role_chrome_runtime.test.js`, mobile bottom-nav plus quick-sheet routing is now covered in `tests/dashboard_mobile_nav_runtime.test.js`, manage-mode/status helper branches are now covered in `tests/dashboard_session_controls_runtime.test.js` and `tests/dashboard_status_utils_runtime.test.js`, module-usage plus dashboard preference/demo-mode helpers are now covered in `tests/module_usage_runtime.test.js` and `tests/dashboard_preferences_runtime.test.js`, and module catalog/definitions/grouping/navigation/click-routing helpers are now covered in `tests/module_catalog_runtime.test.js`, `tests/module_definitions_runtime.test.js`, `tests/module_grouping_runtime.test.js`, `tests/module_navigation_runtime.test.js`, `tests/module_click_router_runtime.test.js`, and `tests/module_routing_runtime.test.js`; the remaining work is deploy-facing env/browser confirmation. Treat realtime/avatar as a separate late-stage sweep when those paid integrations are intentionally enabled.
