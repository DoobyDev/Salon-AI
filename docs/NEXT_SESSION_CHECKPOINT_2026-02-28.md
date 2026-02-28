# Next Session Checkpoint (2026-02-28)

## Current Product State

- Homepage and dashboard have been visually redesigned into a more unified Lexi-led product.
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

## Next Steps

1. Review the latest homepage/dashboard/mobile UI in both dark and light mode.
2. Push any remaining light-mode cleanup if still pending locally.
3. Decide whether to push the latest Lexi popup/human-tone changes if not already pushed.
4. Start the avatar-ready Lexi popup architecture:
   - frontend popup structure
   - backend realtime session route
   - provider/env planning

## Key Files For Next Session

- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `public/dashboard.html`
- `public/dashboard.js`
- `server.js`
- `public/sw.js`

