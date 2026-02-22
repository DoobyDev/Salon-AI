# Release Notes - 2026-02-22

## Release Readiness Summary

- Status: Ready for release
- Syntax checks: Passed
- Test suite: Passed (9 files, 35 tests)
- Responsive QA: Completed across desktop, tablet, mobile, and landscape breakpoints
- Accessibility QA: Completed (focus visibility, skip links, reduced-motion, ARIA updates)

## What Was Finalized

- Dashboard module switcher improvements:
  - Expanded module guidance ("Main features", "How it works", "How it helps")
  - Cleaner module labels and section naming consistency
  - Sticky behavior tuned by breakpoint (desktop sticky, tablet/landscape relaxed)
- Business growth/onboarding UX:
  - Onboarding checklist with progress summary
  - One-click module jump actions from checklist and empty states
  - First 7 days and live plan context retained with clearer guidance
- Revenue and accounting UX:
  - Timeframe controls and live panel remained intact
  - Export-ready accounting flow retained
- Billing and payments:
  - Added PayPal as a subscriber billing option alongside Stripe
  - Added PayPal subscription creation endpoint and webhook processing
- Homepage conversion polish:
  - Stronger CTA hierarchy and trust/proof line
  - Improved demo/dashboard action wording consistency
  - Added privacy/data-handling trust messaging and public legal policy hub links
- Mobile and device-specific responsiveness:
  - Additional breakpoints for 430px / 390px / 360px
  - Tablet and short-landscape tuning for calmer density and cleaner wrapping
- Accessibility pass:
  - `:focus-visible` styles
  - Skip links for home and dashboard
  - `sr-only` labels for chat inputs
  - `prefers-reduced-motion` support
- UX feedback flow polish:
  - Replaced disruptive dashboard `alert(...)` usage with inline status feedback
  - Added inline status messaging for public app search/chat/profile actions

## Notable Copy/Label Standardization

- Unified "Sign In" wording across customer/subscriber/admin contexts
- Standardized "Sign Out" wording
- Standardized booking and profile action labels (e.g., "Book a Visit", "Open Profile")
- Standardized segment wording (Hair Salon / Barbershop / Beauty Salon) across onboarding and dashboards

## Verification Commands Run

- `npm run check`
- `npm test`
- `node --check public/app.js`
- `node --check public/dashboard.js`
- `node --check public/auth.js`
- `node --check server.js`

## Notes

- Running `npm test -- --runInBand` failed because Vitest does not support `--runInBand`. Running plain `npm test` passed.
- Deprecation warnings for Node's `punycode` module appeared during tests; these are non-blocking and do not fail the suite.
