# FIXME Tracker

Last updated: 2026-03-14

## Known Issues / Technical Debt
- [ ] Dashboard contains dense mixed concerns (UI render + state + events + business logic) in a single large script.
  - Files: public/dashboard.js
  - Notes: Refactor into modules in phases after behavior freeze.

- [ ] Subscriber calendar styling and rendering still carry churn from multiple same-day redesign passes.
  - Files: public/dashboard.html, public/dashboard-calendar-pulse.js, public/ask-lexi.css, public/dashboard-layout.js, public/dashboard.js
  - Notes: The subscriber month planner was rebuilt and pushed on 2026-03-14, then tightened again toward a more literal 31-day grid with stronger borders and finally simplified into a full-width calendar-board surface by removing the extra right-hand panels. Before more feature work lands on top, do a cleanup pass after the visual direction is approved so the current month-grid path stays singular and easy to maintain.

- [ ] Homepage and Ask Lexi modal styling now carry too much iteration residue in one stylesheet.
  - Files: public/ask-lexi.css, public/index.html
  - Notes: Multiple 2026-03-13 passes on `#experience` and the Ask Lexi popup added overlapping homepage-specific and modal-specific styling in `public/ask-lexi.css`. Once the final visual direction is approved, do a cleanup pass to remove dead/legacy hero selectors, collapse duplicate overrides, and separate the homepage hero and modal styling into clearer blocks or extracted files.
