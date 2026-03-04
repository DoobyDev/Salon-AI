# Next Session Checkpoint (2026-02-28)

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
