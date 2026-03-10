# Repo Reorganization Plan

Last updated: 2026-03-10

## Goal
Improve clarity and maintainability without breaking current app behavior.

## Safety Rules
1. No global renames in one shot.
2. Refactor one area at a time with tests and browser verification.
3. Keep route/API compatibility until migration is complete.
4. Add comments only where logic is non-obvious.

## Proposed Phases

### Phase 1: Tracking + Standards (Now)
- Create TODO/FIXME/TBD trackers.
- Document naming/comment conventions.
- Publish project-structure placement rules and file naming guidance.
- Freeze behavior baseline with smoke checks.

Phase 1 status:
- Trackers are in place.
- Naming/comment conventions now live in `docs/tracking/CODEBASE_CONVENTIONS.md`.
- Project placement and naming guidance now live in `docs/PROJECT_STRUCTURE.md`.
- Browser validation baseline is still incomplete and remains tracked in `docs/tracking/TODO.md`.

### Phase 2: Frontend Structure
- Split public/dashboard.js into focused modules:
  - `dashboard-<area>.js` for shared dashboard runtime slices
  - `dashboard-admin-<area>.js` for admin-specific slices
  - `dashboard-customer-<area>.js` for customer-specific slices
  - `dashboard-manage-<area>.js` for manage-mode orchestration
  - `dashboard-module-<area>.js` for business-hub/module-system files
- Keep existing DOM ids and behavior stable.

Phase 2 guidance:
- Treat `public/dashboard.js` as composition root, not the default place for new logic.
- Prefer extracting coherent runtime factories instead of moving isolated helpers into random files.
- When creating a new dashboard file, match the existing prefix family instead of inventing a new one.

### Phase 3: Server Structure
- Move server.js sections into route/service files:
  - `src/services/*_handlers.js` for route handlers
  - `src/services/*.js` for domain services and calculations
  - `src/services/*_utils.js` or `*_support.js` only when the suffix matches the file role
  - `src/infrastructure/*` for shared runtime plumbing
- Keep endpoint URLs unchanged.

Phase 3 guidance:
- Do not create vague buckets like `misc.js`, `helpers.js`, or `utils.js`.
- Prefer role/domain-explicit names such as `subscriber_*`, `admin_*`, `booking_*`, `lexi_*`.
- Keep `server.js` responsible for composition and startup only.

### Phase 4: Naming Cleanup
- Rename internals incrementally (variables/functions/files), not routes.
- Use compatibility adapters where needed.

Phase 4 sequencing:
- Rename only after the target area has tests or a stable verification path.
- Prefer one naming family cleanup at a time, for example admin dashboard files or subscriber service files.
- Do not rename published API routes as part of internal cleanup.

### Phase 5: Comment Pass
- Add targeted comments and JSDoc for complex logic only.
- Avoid noisy comments that restate obvious code.

## Initial Candidate Targets
- public/dashboard.js (largest complexity hotspot)
- server.js (large mixed responsibilities)
- public/app.js (Lexi realtime/avatar UX state handling)

## Enforcement Rules During Refactor

1. Any new file added during refactor must follow `docs/PROJECT_STRUCTURE.md`.
2. If a file does not fit an existing naming family, document the new family before expanding it.
3. Update `docs/tracking/TODO.md` when a planned phase item is completed or blocked.
4. Update `docs/APP_FEATURE_RECORD.md` whenever a refactor materially changes product-facing behavior.
