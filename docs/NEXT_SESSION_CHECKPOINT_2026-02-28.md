# Historical Checkpoint (2026-02-28)

This file is historical session context only. It is not the live source of truth for current work.
Use `docs/tracking/` for active TODOs, TBD decisions, and FIXMEs.
Do not treat this checkpoint as an active handoff or current plan.

## Current Product State

- Homepage and dashboard have been visually redesigned into a more unified Lexi-led product.
- Ask Lexi popup redesign is now the current stable UI direction.
- The same shared Ask Lexi popup direction is now used across:
  - homepage
  - customer dashboard
  - subscriber dashboard
  - admin dashboard
- Push-to-talk control is now small and kept in the chat control row, not over Lexi's image.
- Popup dark/light mode theming was corrected after the redesign:
  - dark mode uses dark popup/chat surfaces again
  - light mode uses light popup/chat surfaces again
  - chat text and background colors now match each theme properly
- The blue orb overlay over Lexi's image was removed.
- Deploy caching issue was fixed:
  - `public/sw.js` now uses fresher frontend cache behavior
  - `server.js` now sends stricter cache headers for HTML/core assets
- Homepage nav updated:
  - `Login`
  - `Ask Lexi`
- Lexi chat was changed from an always-open inline chat into a popup-first experience.
- Visible canned prompt buttons were removed from the Lexi chat areas.
- Lexi is now expected to answer:
  - hair salon questions
  - barbershop questions
  - beauty salon questions
  - treatment questions
  - subscriber business-side questions

## Lexi Direction Agreed

Lexi is not just a chatbot.

Lexi should function as:
- AI salon receptionist
- beauty consultant
- booking manager
- subscriber business assistant

That means Lexi must support both:
- customer-side help:
  - service recommendations
  - treatment suitability guidance
  - availability/booking flow
  - aftercare/basic policy guidance
- subscriber-side help:
  - bookings
  - staffing
  - cancellations
  - pricing/policy explanations
  - finance/business workflow guidance

## Avatar Plan Saved For Next Session

Planned Lexi avatar approach:

1. Keep the existing Lexi backend/booking logic as the brain.
2. Add a real-time avatar/voice layer on top.
3. Use popup-based Lexi as the main interaction surface.
4. Ship web first, then allow mobile/desktop wrappers to inherit it.

Recommended architecture:
- OpenAI Realtime for live conversation/voice pipeline
- HeyGen Live/Streaming Avatar for visual avatar layer
- text fallback remains available if voice/avatar fails

Planned avatar popup contents:
- Lexi avatar/video area
- live transcript
- mic button
- mute button
- booking state below
- fallback typed input if needed

Recommended rollout order:
1. Avatar-ready popup architecture
2. Backend realtime session endpoint
3. Voice/avatar provider integration
4. Subscriber settings for Lexi voice/avatar behavior

## Avatar Scaffold Now Added

- Homepage Lexi popup now includes an avatar-ready stage:
  - avatar area
  - live-status panel
  - provider readiness chips
  - voice/mute controls placeholder
  - existing text chat remains as fallback in the same popup
- Customer dashboard Lexi popup now uses the same avatar-ready shell.
- Backend endpoints now exist:
  - `GET /api/lexi/avatar-config`
  - `POST /api/lexi/realtime/session`
- Current backend behavior is honest scaffolding only:
  - reports provider/realtime readiness
  - can now mint an OpenAI Realtime client secret when `OPENAI_API_KEY` and `OPENAI_REALTIME_MODEL` are configured
  - homepage and customer dashboard popups can now request a live session contract from the server
  - homepage and customer dashboard now also attempt full browser WebRTC + microphone connection using the brokered client secret
  - popup now exposes live voice states, mute, disconnect, and transcript/status updates
  - HeyGen avatar session lifecycle is now wired on the backend
  - homepage and customer dashboard can now try to attach a HeyGen LiveKit avatar stream into the popup stage
  - next step is real env configuration and browser validation

## Next Steps

1. Review the latest homepage/dashboard/mobile UI in both dark and light mode and decide what still feels weak visually.
2. Improve the actual Lexi product logic inside the popup now that the shared UI shell is stable.
3. Make the 7 Business Hub modules feel more distinct inside their popup flows if needed.
4. Connect a real provider stack into the avatar scaffold:
   - improve transcript/rendering reliability across browsers
   - decide whether subscriber popup gets the same live voice path immediately
   - fallback behavior for unsupported/mobile cases

## Latest Stable Stop Point

- Latest pushed commit:
  - `a0e84ec` `Refine Lexi flows and unify app theme`
- This commit is the actual deployed stop point as of 2026-03-02 and includes:
  - shared Lexi popup redesign live across homepage/admin/subscriber/customer
  - unified app theme refinements across homepage, auth, dashboard, and shared styling
  - homepage header Ask Lexi / Book actions wired into the popup flow
  - stronger Lexi booking flow on the homepage:
    - typo-tolerant customer input parsing
    - pending booking draft memory
    - customer sign-in/sign-up handoff when a booking is ready to confirm
    - booking finalization after customer auth
    - Lexi conversation context stored into booking notes
  - expanded public Lexi fallback logic on the backend:
    - better service guidance and FAQ handling
    - clearer booking confirmation prompts
    - clearer account / sign-in / sign-up guidance
    - conversation memory passed through `/api/chat`
  - avatar/realtime scaffold still present for homepage and customer flows
  - subscriber/admin avatar stage markup remains in place for later provider activation

## Key Files For Next Session

- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `public/dashboard.html`
- `public/dashboard.js`
- `server.js`
- `public/sw.js`

## Session Resume Note

- Do not resume from `e88d94d`.
- Resume from `a0e84ec`.
- The next practical focus is not the popup redesign anymore; that part is already deployed.
- Resume with:
  - validating realtime/avatar provider configuration in-browser
  - deciding whether subscriber/admin should get the same live voice path now or later
  - tightening Lexi product logic and fallback behavior around the now-live booking handoff flow

## 2026-03-04 End Of Session Checkpoint

- Latest pushed commit:
  - `2d1b774` `Update dashboards and merch analytics`
- Working tree is clean after push.

## Current Dashboard Stop Point

- Admin and subscriber dashboard work moved heavily into `public/dashboard.html`, `public/dashboard.js`, and `server.js`.
- The old broken Business Hub popup path was replaced earlier in the session, but the latest visible UI direction removed the extra shell gradients from the hub surfaces.
- `Booking Storyline` heading now reads `Storyline` for both subscriber and admin.
- Default storyline range is `Day`.
- Storyline chart behavior currently expected:
  - `Day`: hourly lollipop chart using salon hours or fallback working hours
  - `Week`: 6 or 7 lollipops based on configured working days, anchored Monday to Sunday
  - `Month`: full month line chart
  - `Year`: full-year line chart with a reduced month axis so it does not run off-screen
  - `All Time`: line chart positioned after `Year` in the filter order
- Admin `Command Filters` now include extra quick toggles for:
  - `Bookings`
  - `Subscriber Revenue`
  - `Customer Signup`
- Important: those admin quick toggles were intended to change summary/finance data only.
- Important: the user explicitly wanted the existing storyline visuals kept as-is and did not want the booking storyline replaced by subscriber-revenue charts.

## Merch Analytics Direction

- Subscriber control center:
  - `Finance Pulse` was replaced with merch sales analytics
  - `Next Moves` was replaced with merch-focused analytics
  - `Saved Views` was replaced with shipment/merch analytics
- The same merch analytics treatment was then applied to the admin managed-business side as well.
- Merch-related rendering is now mixed into the command-center data path in `public/dashboard.js`.

## Visual Direction At Stop Point

- The user tested stronger gradients and then backed several of them out.
- Removed/softened backgrounds now matter:
  - gradient removed from `.business-hub-shell`
  - gradient removed from `#businessGrowthSection`
  - extra section gradients were also removed from the broader dashboard shells
- Booking diary weekday labels were changed to black, including the aqua/light variant, because the prior treatment looked worse to the user.
- The user is sensitive to dead space, especially inside control-center panels.

## Backend/Data Notes

- `server.js` was extended during this session to provide additional admin counters, including subscriber and customer signup totals/count windows.
- There was also admin revenue-series work added for platform-level subscription analytics.
- Because the user later asked to keep the admin storyline visually unchanged, confirm which server-side admin metrics are still actively consumed before doing another admin control-center refactor.

## Next Session Priorities

1. Open the dashboard in-browser before making more dashboard structural changes.
2. Verify the admin quick-toggle buttons only affect the intended summary/finance cards and not the storyline visuals.
3. Review the merch analytics sections in both subscriber and admin because they were added quickly and have not been browser-validated in this session.
4. If more styling work is requested, avoid broad gradient sweeps first; the current preference is more restrained surfaces with targeted color accents.

## Resume From Here

- Resume from `2d1b774`.
- Start with `public/dashboard.html`, `public/dashboard.js`, and `server.js`.
- If the next task is visual, validate in-browser before another major dashboard rewrite.
