# Session Checkpoint (2026-03-14)

This file is a session handoff note for the next restart.
Active source of truth is still:
- `docs/tracking/TODO.md`
- `docs/tracking/TBD.md`
- `docs/tracking/FIXME.md`

## Current Stop Point

- Subscriber calendar was the active focus.
- The live subscriber diary is now a full-width calendar board again.
- The three right-hand diary panels were removed from the subscriber calendar shell so the board can use the full width.
- The month board now uses:
  - a literal weekday-aligned grid
  - stronger visible box outlines
  - larger day numbers
  - plain booking-count labels
  - rota-cover context inside each day cell
- Calendar tabs now change the live board context for:
  - `Day`
  - `Week`
  - `Month`
  - `Year`
- Day detail still continues through the existing day popup flow when a calendar day is clicked.

## Important Current Truth

- The calendar runtime file is still:
  - `public/dashboard-calendar-pulse.js`
- The subscriber diary markup is still:
  - `public/dashboard.html`
- The subscriber calendar styling is still mainly:
  - `public/ask-lexi.css`
- The next pass should not reintroduce the deleted right-hand panel stack unless explicitly requested.

## What Still Needs Validation

1. Open the live subscriber dashboard in a real browser.
2. Confirm the full-width month board actually reads clearly at desktop width.
3. Confirm `Day`, `Week`, `Month`, and `Year` each feel visually correct now that the board is the main surface.
4. Confirm the day popup is enough for detail now that the side panels are gone.
5. If the calendar still feels wrong, simplify further from the live board path only instead of rebuilding a second diary path.

## Secondary Follow-Up After Calendar

- Recheck the subscriber Business Hub `Business Information` popup for spacing and save-flow clarity.
- Then return to the homepage `#experience` section and Ask Lexi popup visual direction.

## Git Note

- The current workspace was prepared for a checkpoint save, but the git commit did not complete because elevated commit permission was declined during this session.
- Local file changes are still present in the working tree.
- Next session can either:
  - create the checkpoint commit first
  - or continue directly from the existing working tree
