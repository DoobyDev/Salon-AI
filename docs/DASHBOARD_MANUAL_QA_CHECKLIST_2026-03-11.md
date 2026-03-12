# Dashboard Manual QA Checklist

Date prepared: 2026-03-11

Purpose:
- Give a fast manual validation path for the highest-priority open dashboard/browser TODO items.
- Focus on the live authenticated flows that still need a real browser pass.

Use with:
- `http://localhost:3000`
- `docs/tracking/TODO.md`

## Accounts Needed

- Admin account
- Subscriber account with linked business data
- Customer account with booking history if available

## 1. Admin Dashboard Validation

Route:
- `/dashboard?role=admin`

Checks:
- Confirm the admin dashboard loads instead of redirecting back to `/auth`.
- Confirm the top admin metrics render.
- Confirm the business list and account panel both appear.

### Admin accounts panel

In the `Customer and subscriber accounts` section:

- Search for a subscriber account by name or email.
- Click a subscriber row.
- Confirm the detail card shows:
  - account name
  - email
  - business name
  - managed action buttons

Expected managed actions:
- `Open dashboard`
- `Edit business info`

Then verify:
- Clicking `Open dashboard` changes the managed business context and loads that business dashboard state.
- Clicking `Edit business info` opens the business-information popup/workspace modal.
- `Export accounting CSV` still works visibly from the page.
- `Platform revenue CSV` still works visibly from the page.

Pass note:
- If the managed action buttons are visible and both actions work from the live page, the main admin-account runtime blocker can be closed.

### Admin control-center toggles

- Navigate to any admin control/toggle area that affects summary cards.
- Toggle each option once.
- Confirm the storyline remains booking-driven and does not switch into an unintended revenue/signups chart.

Pass note:
- If toggles affect summary/finance state only and do not break the storyline visual contract, the admin quick-toggle TODO can be closed.

## 2. Subscriber Dashboard Validation

Route:
- `/dashboard?role=subscriber`

Checks:
- Confirm the subscriber dashboard loads with diary, command-center, and metrics visible.
- Open the guided booking panel and confirm it still renders correctly.
- Confirm reminder/readiness cards look structurally correct.
- Confirm merch/commercial panels render without broken empty states or layout overlap.

### Reminder flow spot-check

- Confirm reminder settings are visible.
- Confirm due-soon reminder rows, if present, have working direct actions.
- Confirm notification health/readiness sections render without missing labels or broken counts.

## 3. Customer Dashboard Validation

Route:
- `/dashboard?role=customer`

Checks:
- Confirm the customer dashboard loads correctly, not just subscriber/admin.
- Confirm next appointment spotlight renders if data exists.
- Confirm booking list is visible.
- Confirm self-service cancel/reschedule entry points render.
- Expand the extras section and confirm offers/gift cards/aftercare areas render cleanly.

Pass note:
- If the customer view renders correctly and the key actions are visible, the broader dashboard browser-validation item is much closer to closure.

## 4. PWA Browser Check

Routes:
- `/`
- `/auth`
- `/dashboard`
- `/legal`

Checks:
- Confirm the site is installable in a normal browser session.
- Confirm the app icon/name are correct in the install prompt if shown.
- Confirm service worker updates do not leave obviously stale pages after refresh.

## 5. What To Record Back Into TODO

If a check passes:
- update the matching note in `docs/tracking/TODO.md`
- remove the item only if it is fully verified

If a check fails:
- record:
  - route used
  - role used
  - exact visible problem
  - whether it is layout-only, interaction-only, or data/runtime-specific
  - affected file if known
