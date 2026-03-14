# TODO Tracker

Last updated: 2026-03-14

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
- For any requested UI/UX change, trace the exact live route, active file path, and rendered surface first instead of changing a likely duplicate path.
- When a change is accepted as correct, immediately remove, isolate, or neutralize any older duplicate path, stale override, or secondary code path that could overwrite it later.
- Treat rendering conflicts, stale overrides, duplicate UI paths, and dead layers as maintenance bugs, not optional cleanup.
- If a layer is unused, unreliable, or repeatedly causes editing regressions, remove it during the fix so the app stays clean, predictable, and maintainable.

## Current Priority

Local validation target for the next pass:
- `http://localhost:3000`
- Automated checks passed on 2026-03-11: `npm run check`, `npm test`
- Manual browser pass helper: `docs/DASHBOARD_MANUAL_QA_CHECKLIST_2026-03-11.md`

Tomorrow restart point:
- Admin/dashboard shell work is in a stable stop state after the dedicated customer/admin shell fixes, logout hardening, and header Ask Lexi access cleanup.
- Subscriber month-calendar work is the active restart point.
- Current latest calendar state:
  - a new subscriber month planner was rebuilt and pushed to `main`
  - git commit pushed: `3ad7007` (`Redesign subscriber month calendar`)
  - the current live direction is a literal 31-day grid with stronger visible box outlines and reduced day-cell detail
  - the month board now renders as a true weekday-aligned calendar grid and sits above the selected-day / rota support panels
  - clicking a day still updates the selected day and opens the existing day popup flow
  - this latest pass still needs real browser review to confirm the visual direction matches the requested "see the 31 days in a grid" brief
- Next pass on the subscriber diary should focus on:
  - opening the live subscriber dashboard in-browser and checking whether the current month grid now reads clearly enough as a classic calendar
  - if still not correct, deciding between three tighter directions before more code churn:
    - ultra-classic wall calendar: white cells, dark borders, big numbers
    - compact product calendar: numbers plus small status dots only
    - plain operator grid: numbers and booking counts only
  - keeping further edits scoped to the current live month-grid path in `public/dashboard.html`, `public/dashboard-calendar-pulse.js`, and `public/ask-lexi.css`
  - avoiding any reintroduction of removed duplicate diary paths or secondary calendar render layers
- Subscriber Business Hub `Business Information` popup was the latest active UI pass.
- Current live state of that popup:
  - it now uses a simpler single business-information form instead of the duplicated read/view version
  - form fields are scrollable inside the popup again
  - the top `Edit` button is back and unlocks the read-only fields in place
  - after `Save updates`, the popup returns to its default read-only state with the `Edit` button shown again
  - sample/mock business values now act as guidance only instead of silently pre-filling the editable fields
  - the save button stays disabled until edit mode is opened, and the popup now shows visible save/error feedback
- Next pass on that popup should focus on:
  - doing a real browser visual pass on spacing, readonly/edit contrast, and save flow clarity
  - deciding whether the remaining guidance/fallback text still feels helpful or should be reduced further
  - only changing the subscriber `Business Information` popup itself, not the outer Business Hub card grid unless a separate issue is found
- [ ] Write proper welcome email cover letters/templates for subscriber walk-ins.
Files: `src/services/booking_route_handlers.js`
Notes: The rebuilt subscriber calendar now sends a simple placeholder thank-you email when a walk-in is added with an email address. Replace that plain text with the final branded cover-letter/email template later.
- Homepage work is still the active design track, but it should not continue as broad redesign churn.
- Today completed on the homepage:
  - kept the rest of the homepage intact and focused on `#experience` plus the Ask Lexi popup only
  - rebuilt `#experience` again into a dedicated full-width hero layout instead of letting it inherit the older mixed hero-card structure
  - pushed Lexi into a larger centered visual stage so she reads more like the star of the app instead of a narrow supporting portrait
  - widened and recentered the Lexi portrait treatment inside `#experience`
  - kept iterating the Ask Lexi popup toward a more landscape-first layout with a fixed outer shell and only the conversation thread scrolling
  - refreshed homepage/dashboard CSS and JS asset versions repeatedly so live browser routes now serve the current assets
- Important current truth:
  - the server is serving the latest homepage and popup markup/CSS correctly
  - if the homepage still feels wrong, that is now a design-direction issue, not a stale-cache/server mismatch
- Next homepage pass should focus on:
  - doing a real browser review of `#experience` at desktop and mobile widths before any more structural edits
  - deciding whether the current rebuilt hero is acceptable or whether it should be replaced from a clean visual reference instead of incrementally tweaked again
  - keeping the next iteration scoped to `#experience` only unless a separate issue is found elsewhere on the page
  - checking the Ask Lexi popup visually after the latest shell/thread-scroll redesign and deciding whether it needs a cleaner luxury pass or a clearer “live AI receptionist” pass

- [ ] Browser-verify PWA installability and shell updates on the live routes.
Files: `public/index.html`, `public/auth.html`, `public/dashboard.html`, `public/legal.html`, `public/pwa-runtime.js`, `public/sw.js`, `public/manifest.webmanifest`
Notes: The shared manifest link and service-worker registration were reconnected on 2026-03-10 for the active home/auth/dashboard/legal entrypoints. A headless Edge render pass on 2026-03-11 confirmed the live home/auth/legal routes load with the expected shared shell markup, but install prompt behavior, service-worker activation/update behavior, and stale-page regression checks still need an interactive browser session. The dashboard shell entrypoint was also corrected on 2026-03-11 so `public/dashboard.html` now loads `public/dashboard.js` instead of the older `public/ask-lexi-dashboard.js`; rerun browser installability checks against that live entrypoint.

- [x] Browser-validate homepage first-load Lexi visibility.
Files: `public/index.html`, `public/ask-lexi.css`
Notes: Completed on 2026-03-11 with a headless Edge render pass at desktop and mobile widths. Lexi is immediately visible at first load in both layouts, and the compact intro strip now reads as a top-of-page identity cue that supports the main portrait instead of hiding it.

- [ ] Browser-validate the dashboard before more structural edits.
Files: `public/dashboard.html`, `public/dashboard.js`, `public/styles.css`
Notes: Confirm current subscriber/admin/customer layouts still feel correct after the recent control-center, reminders, onboarding, simplification passes, dedicated customer/admin shell work, logout return-to-home fixes, and header Ask Lexi entrypoint changes. A headless Edge route check on 2026-03-11 confirmed unauthenticated `/dashboard?role=subscriber|admin|customer` requests correctly land on the auth surface, and authenticated desktop render captures now exist for the current subscriber and admin dashboard first-view layouts. Those first-view renders looked structurally correct for the current control-center/metric-band/diary composition, but customer dashboard rendering and broader in-page interaction coverage are still pending before this item can be closed. The old dashboard mock/demo mode is already disabled in code; remaining demo-scope decisions now apply to public/homepage demo surfaces instead.

- [ ] Browser-validate the latest subscriber month grid before more calendar redesign.
Files: `public/dashboard.html`, `public/dashboard-calendar-pulse.js`, `public/ask-lexi.css`, `public/dashboard-layout.js`
Notes: On 2026-03-14 the subscriber month planner was rebuilt into a visible weekday-aligned 31-day grid and pushed to `main` in commit `3ad7007`. The latest follow-up pass tightened it again into a cleaner operator-style month board with stronger outlines, larger day numbers, plain booking-count labels, rota-cover context, and less status noise inside each box. The extra right-hand diary panels were then removed so the calendar board now runs full width, with day detail continuing through the existing day popup flow. The next session should start with a real browser visual pass of the live subscriber dashboard and confirm this simplified full-width month board is the accepted end state.

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
Files: `server.js`, `src/services/lexi_realtime_support.js`, `src/services/lexi_realtime_route_handlers.js`, `public/app.js`
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
Notes: One guard comment was added on 2026-03-10 for the admin quick-toggle/storyline contract, another now protects the shared role-layout contract in `public/dashboard-startup-runtime.js`, and targeted contract comments now protect reminder dedupe plus notification skip-audit behavior in `src/services/reminder_dispatch.js` and `src/services/notifications.js`; continue selectively. Admin notification-health logic was also extracted into `public/dashboard-admin-notification-health.js`, subscriber readiness plus due-soon reminder logic now live in `src/services/subscriber_communication_readiness.js`, the subscriber communications rollup now lives in `src/services/subscriber_communication_summary.js`, subscriber no-show/rebooking calculations now live in `src/services/subscriber_operations_insights.js`, command-center recommendation thresholds now live in `src/services/subscriber_command_center.js`, and more leftover bridge glue was removed from `public/dashboard.js` so manage-UI, request-utils, status/preferences, business-profile, calendar-diary, shared money/date helpers, provider/date-time helpers, date-key helpers, pad helpers, startup preference wiring, admin/bootstrap/mock dashboard wiring, CRM/waitlist manage-action wiring, calendar-day workspace wiring, and staff rota wiring now rely more directly on their extracted runtimes. The obvious no-behavior-change alias cleanup passes are now mostly exhausted, so continue only where further extraction still clearly reduces risk.

## Operations And Release Readiness

- [ ] Review legal pack placeholders before public/legal finalization.
Files: `docs/business_legal_pack/*`
Notes: A repo audit on 2026-03-11 found 68 remaining `[PLACEHOLDER ...]` fields across the pack. The highest-priority public-facing gaps are operator/entity/contact placeholders in `legal/01_TERMS_AND_CONDITIONS.md`, controller/contact placeholders in `legal/02_PRIVACY_POLICY_UK_GDPR.md`, VAT/pricing wording in `legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`, refund/cooling-off language in `legal/06_REFUND_AND_CANCELLATION_POLICY.md`, processor/provider entries in `legal/08_DATA_PROCESSING_ADDENDUM_DPA.md` and `legal/16_SUBPROCESSOR_REGISTER.md`, security owner/contact placeholders in `legal/10_INCIDENT_RESPONSE_AND_BREACH_NOTIFICATION.md`, and core business-plan assumptions in `business/20_BUSINESS_PLAN_EXECUTIVE.md` and `business/22_FINANCIAL_MODEL_TEMPLATE.md`. `docs/business_legal_pack/LEGAL_INPUT_CHECKLIST.md` now separates repo-known values from business/legal inputs, and the four main public-facing legal docs were prefilled on 2026-03-11 with repo-confirmed branding/provider context only; the remaining placeholders now mostly require real entity, tax, jurisdiction, and refund-policy decisions before public/legal sign-off.

- [ ] Do a release-readiness sweep once browser validation and realtime env validation are complete.
Files: `README.md`, `.env.example`, `server.js`, `public/*`
Notes: Include URLs, credentials completeness, fallback behavior, and deploy-facing configuration. Automated regression coverage is green again as of 2026-03-11, including Stripe/PayPal redirects, billing runtime/control flows, command-center rendering/actions, Business Hub rendering/reporting flows, copilot/runtime helpers, commercial/merch/revenue/profitability controls, waitlist/ops/CRM wiring, Lexi launch controls, accounting live/integration/manage flows, account-session and emergency-admin flows, admin managed-business/platform flows, booking filters, role chrome, mobile nav, manage-mode/status helpers, module usage/preferences/catalog/routing helpers, PWA shell/runtime wiring, and the broader auth/booking/platform page coverage already listed below; the remaining work is deploy-facing env/browser confirmation. Treat realtime/avatar as a separate late-stage sweep when those paid integrations are intentionally enabled.
