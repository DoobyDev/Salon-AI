# Codebase Conventions

Last updated: 2026-03-05

## Naming
- Keep route paths stable once published.
- Prefer descriptive keys over abbreviations in dashboard module identifiers.
- Use `camelCase` for JS variables/functions.
- Use `UPPER_SNAKE_CASE` for constants.
- Keep DOM ids explicit and feature-scoped (example: `customerLexiCalendarGrid`).

## File Organization
- `public/` for browser runtime code and static assets.
- `src/services/` for domain behaviors.
- `src/infrastructure/` for runtime plumbing (cache/jobs/rate limits).
- `docs/tracking/` for execution status, TODO/FIXME/TBD, and reorg plans.

## Comments
- Add comments only where behavior is non-obvious.
- Avoid line-by-line narration of straightforward code.
- Prefer brief block comments above complex functions.
- Keep comments updated when behavior changes.

## Product Documentation
- When app features change, update `docs/APP_FEATURE_RECORD.md` in the same work.
- This applies to public app features, Ask Lexi behavior, and all customer/subscriber/admin dashboard capabilities.
- Add a dated item to the feature update log whenever the feature record is changed.

## Refactor Safety
- Use phased refactors with no route/API breakage.
- Validate browser behavior after each phase.
- Remove only clearly redundant or dead code.
- Prefer small commits with clear scope.
