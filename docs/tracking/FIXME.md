# FIXME Tracker

Last updated: 2026-03-13

## Known Issues / Technical Debt
- [ ] Dashboard contains dense mixed concerns (UI render + state + events + business logic) in a single large script.
  - Files: public/dashboard.js
  - Notes: Refactor into modules in phases after behavior freeze.

- [ ] Homepage and Ask Lexi modal styling now carry too much iteration residue in one stylesheet.
  - Files: public/ask-lexi.css, public/index.html
  - Notes: Multiple 2026-03-13 passes on `#experience` and the Ask Lexi popup added overlapping homepage-specific and modal-specific styling in `public/ask-lexi.css`. Once the final visual direction is approved, do a cleanup pass to remove dead/legacy hero selectors, collapse duplicate overrides, and separate the homepage hero and modal styling into clearer blocks or extracted files.
