# Repo Reorganization Plan

Last updated: 2026-03-05

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
- Freeze behavior baseline with smoke checks.

### Phase 2: Frontend Structure
- Split public/dashboard.js into focused modules:
  - dashboard/layout
  - dashboard/state
  - dashboard/modules/*
  - dashboard/copilot
  - dashboard/api
- Keep existing DOM ids and behavior stable.

### Phase 3: Server Structure
- Move server.js sections into route/service files:
  - src/routes/*
  - src/services/*
  - src/lib/*
- Keep endpoint URLs unchanged.

### Phase 4: Naming Cleanup
- Rename internals incrementally (variables/functions/files), not routes.
- Use compatibility adapters where needed.

### Phase 5: Comment Pass
- Add targeted comments and JSDoc for complex logic only.
- Avoid noisy comments that restate obvious code.

## Initial Candidate Targets
- public/dashboard.js (largest complexity hotspot)
- server.js (large mixed responsibilities)
- public/app.js (Lexi realtime/avatar UX state handling)
