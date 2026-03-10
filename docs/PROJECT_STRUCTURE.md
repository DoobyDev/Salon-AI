# Project Structure

Last updated: 2026-03-10

Purpose:
- Define where new code should go before more reorganization work happens.
- Keep naming predictable across dashboard modules, browser code, server services, and tests.
- Reduce future cleanup work by documenting the conventions already being used successfully.

## Root

- `server.js`
  Primary server entrypoint and app composition layer. Keep this focused on wiring, startup, exported app/runtime handles, and top-level registrations. Do not grow new domain logic here if it can live in `src/services/`.
- `package.json`
  Scripts, dependencies, and runtime package metadata.
- `.env.example`
  Source-of-truth template for required and optional environment variables.
- `README.md`
  Setup, runtime, and deploy-facing guidance.
- `desktop/`
  Electron wrapper code only.
- `public/`
  Browser-side application code, styles, and static assets.
- `src/`
  Server-side application code.
- `tests/`
  Automated test suites.
- `docs/`
  Product, architecture, release, and tracking documentation.
- `prisma/`
  Schema, migrations, seed, and data backfill logic.
- `data/`
  Local JSON-backed runtime data stores. Treat this as local/runtime state, not feature code.

## Frontend Structure

### Core rule

- Keep `public/dashboard.js` as the composition root for dashboard runtime wiring.
- Put new dashboard behavior in focused `public/dashboard-*.js` files instead of expanding `public/dashboard.js`.
- Keep homepage/public Lexi behavior in `public/app.js`, `public/ask-lexi-home.js`, and related shared assets unless a broader split is clearly needed.

### Dashboard file naming

- `public/dashboard-<area>.js`
  Generic dashboard runtime/support modules.
  Examples: `dashboard-layout.js`, `dashboard-status-utils.js`, `dashboard-request-utils.js`.
- `public/dashboard-admin-<area>.js`
  Admin-only or admin-first dashboard modules.
  Examples: `dashboard-admin-platform.js`, `dashboard-admin-support.js`.
- `public/dashboard-customer-<area>.js`
  Customer dashboard and customer journey modules.
  Examples: `dashboard-customer-reception.js`, `dashboard-customer-lexi-realtime.js`.
- `public/dashboard-manage-<area>.js`
  Shared manage-mode actions and orchestration.
  Examples: `dashboard-manage-ui.js`, `dashboard-manage-dispatcher.js`.
- `public/dashboard-module-<area>.js`
  Business-hub/module-catalog system files only.
  Examples: `dashboard-module-routing.js`, `dashboard-module-status.js`.

### Frontend naming rules

- Use `create<Name>Runtime` for stateful browser runtimes that bind DOM, events, or fetches.
- Use `get<Name>` for pure selectors/builders and `build<Name>` for payload or prompt assembly.
- Use `render<Name>` only for functions whose job is DOM output.
- Use `<feature>Section`, `<feature>Button`, `<feature>Input`, `<feature>List`, `<feature>State` for DOM node variables.
- Keep DOM ids explicit and feature-scoped.
  Good: `customerLexiCalendarGrid`, `subscriberCommandCenterSection`
  Avoid: `grid`, `panel`, `list2`

### Frontend placement rules

- If code is browser-only and tied to DOM/UI behavior, it belongs in `public/`.
- If a dashboard area gets complex enough to have its own helpers, create neighboring `dashboard-<area>-*.js` files instead of broad utility dumping.
- Do not add generic helpers to unrelated files just because they are already imported by `dashboard.js`.

## Server Structure

### Core rule

- Keep domain logic in `src/services/`.
- Keep infrastructure concerns in `src/infrastructure/`.
- Keep `server.js` focused on composition, middleware setup, route registration, and startup behavior.

### Server file naming

- `src/services/<domain>.js`
  Domain logic, data shaping, calculations, or storage abstraction.
  Examples: `crm_segments.js`, `staff_roster.js`, `revenue_profitability.js`.
- `src/services/<domain>_handlers.js`
  Request/response handlers for a specific route surface.
  Examples: `booking_route_handlers.js`, `subscriber_billing_handlers.js`.
- `src/services/<domain>_utils.js`
  Small, domain-specific helpers, not catch-all utility dumping grounds.
  Examples: `booking_time_utils.js`, `request_context_utils.js`.
- `src/services/<domain>_support.js`
  Integration helpers or supporting orchestration that does not fit route handlers cleanly.
  Example: `lexi_realtime_support.js`.
- `src/infrastructure/<area>.js`
  Cross-cutting runtime plumbing only.
  Examples: `redis_runtime.js`, `distributed_rate_limit.js`, `jobs.js`.

### Server naming rules

- Use `create<Name>Service` for service factories.
- Use `create<Name>Handlers` or `create<Name>RouteHandlers` for route-oriented factories.
- Use explicit domain prefixes when a file is role-specific.
  Good: `subscriber_command_center.js`, `admin_platform_handlers.js`
  Avoid: `command_center.js` if the logic is subscriber-only
- Keep published route paths stable even if internal file names improve.

## Tests

- Put tests in `tests/` with file names that mirror the feature or service under test.
- Prefer `<feature>.test.js` for a focused suite around one route surface or helper area.
- When server logic splits into a new file, update or add a matching test file rather than growing unrelated suites.
- Test names should describe behavior, not implementation details.

## Docs

- Put durable architecture, structure, and process docs in `docs/`.
- Put active handoff and refactor tracking docs in `docs/tracking/`.
- Treat `docs/tracking/` as the live source of truth for open work, unresolved decisions, and active fixes.
- Mark older checkpoints, release notes, and retired roadmaps as historical at the top of the file so they cannot be mistaken for active planning documents.
- Update `docs/APP_FEATURE_RECORD.md` whenever product capabilities materially change.

## Data and Runtime Artifacts

- Keep runtime logs and temp outputs out of source folders and out of commits unless explicitly needed.
- Treat `data/*.json` as environment/runtime state unless a task explicitly changes seed/default content.
- Do not rely on temp files in the repo root for feature behavior.

## Naming Summary

- JavaScript variables/functions: `camelCase`
- Constructors/classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Browser/dashboard files: `kebab-case` with role or domain prefixes
- Server service files: `snake_case` with explicit domain naming
- Public routes and API paths: preserve compatibility once published

## Naming Migration Guidance

- Do not mass-rename published DOM ids, routes, or API paths just for style consistency while the app is still being validated.
- For new JavaScript variables, functions, and DOM ids, prefer the current `camelCase` pattern already used across the dashboard code.
- For new files, follow the established role/domain prefixes instead of inventing parallel naming families.
- Only rename existing ids, section names, or module keys when:
  - the change removes real ambiguity or merge risk
  - the affected runtime/tests/docs are updated in the same batch
  - the rename is narrow enough to verify safely
- Treat broader naming cleanup as post-behavior-freeze work, not default in-flight maintenance.

## Comment Policy

- Add comments only where a behavior contract, sequencing rule, or non-obvious dependency would otherwise be easy to break.
- Do not add line-by-line narration or comments that restate obvious code.
- Prefer short guard comments above risky logic blocks over long explanatory prose.
- Add JSDoc only for exported/shared helpers when the purpose, inputs, or outputs are not already obvious from the function name and local usage.
- If a block is hard to explain briefly, prefer extracting or renaming it before adding heavier commentary.

## Decision Rules For New Files

Before adding a file, ask:
1. Is this browser code or server code?
2. Is it role-specific, domain-specific, or cross-cutting?
3. Does an existing neighboring file family already define the naming pattern?
4. Will this name still make sense if the feature grows in three months?

If the answer is unclear, prefer a more explicit domain/role name over a shorter generic one.
