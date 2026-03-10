# Ask Lexi | AI Salon Receptionist

Full-stack multi-platform app (Web, Desktop, Mobile) for hair salon, barbershop, and beauty salon discovery, Ask Lexi booking support, role dashboards, reminders/notifications, and subscriber billing.

## Platforms

- Web: `http://localhost:3000`
- Production Web: `https://www.aisalonreceptionist.co.uk`
- Desktop: Electron app (`npm run desktop`)
- Mobile:
  - Installable PWA shell on the live web routes (`/`, `/auth`, `/dashboard`, `/legal`)
  - Native wrapper via Capacitor (Android/iOS)

## Project Layout

- Structure reference: `docs/PROJECT_STRUCTURE.md`
- Product and role feature catalog: `docs/APP_FEATURE_RECORD.md`
- Business/legal templates and print packs: `docs/business_legal_pack/`
- Public legal policy hub route: `/legal` (served from `public/legal.html`)
- Runtime logs are kept in `logs/` (instead of project root) for cleaner maintenance.

## Core Features

- Luxury/futuristic landing page with business search and live front desk demo
- Role auth: admin, subscriber, customer
- Real dashboard pages:
  - `/auth`
  - `/dashboard`
  - `/legal`
- Prisma + PostgreSQL persistence
- Redis-backed caching, distributed rate limiting, and job queues
- Stripe and PayPal subscriber billing (checkout + webhooks, plus Stripe billing portal)
- AI receptionist booking flow (OpenAI tool-calling)
- Booking lifecycle APIs (create, cancel, reschedule)
- SMS/Email booking notifications (Twilio + SendGrid)
- Subscriber reminder settings, due-soon queueing, and scheduled reminder dispatch
- Audit logging for auth, billing, chat, and booking events
- Docker deployment support

## Tech

- Node.js + Express
- Prisma + PostgreSQL
- OpenAI
- Stripe
- PayPal
- Twilio + SendGrid
- Electron
- Capacitor

## Setup

Local development notes:
- Use Node `20.14.0` for this repo. On Windows with `nvm`: `nvm use 20.14.0`
- Local database defaults:
  - Postgres: `localhost:5432`
  - Redis: `localhost:6380`
- If port `3000` is already in use, start with a different port:
```powershell
$env:PORT='3130'
npm start
```

1. Install:
```bash
npm install
```

2. Create env:
```bash
copy .env.example .env
```

3. Configure `.env`:
- `DATABASE_URL`
- `DATABASE_URL_POOLER` (optional, recommended for runtime)
- `DIRECT_URL` (required for migrations/introspection when using a pooler)
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_REALTIME_MODEL` if you want live Lexi voice sessions
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `REDIS_URL` (recommended for scale; local Docker mapping is `redis://localhost:6380`)
- Stripe/PayPal/Twilio/SendGrid keys as needed
- For Stripe subscriber billing, set:
  - `STRIPE_PRICE_ID_MONTHLY` for the monthly plan
  - `STRIPE_PRICE_ID_YEARLY` for the yearly plan
  - `STRIPE_PRICE_ID` is still accepted as a fallback monthly price id, but new setups should prefer `STRIPE_PRICE_ID_MONTHLY`
- For Lexi live voice/avatar testing, also set:
  - `LEXI_REALTIME_VOICE` (optional, defaults to `marin`)
  - `LEXI_REALTIME_TRANSCRIBE_MODEL` (optional, defaults to `gpt-4o-mini-transcribe`)
  - `LEXI_AVATAR_PROVIDER=heygen` if enabling avatar mode
  - `HEYGEN_API_KEY`
  - `HEYGEN_AVATAR_ID`
  - `HEYGEN_VOICE_ID` (optional)
- Optional runtime controls:
  - `ACCOUNTING_DAILY_REVENUE_TARGET` to tune admin live-revenue target calculations
  - `FORCE_LEXI_DEMO_SEED=1` to force Lexi demo business reseeding in development
- For production deployment, set:
  - `APP_URL=https://www.aisalonreceptionist.co.uk`
  - `CORS_ORIGIN=https://www.aisalonreceptionist.co.uk`

Lexi realtime/avatar notes:
- Without `OPENAI_REALTIME_MODEL`, Lexi popup voice mode stays in pending/text-fallback mode.
- Without the HeyGen variables, avatar mode stays unavailable even if text chat and realtime voice are enabled.
- Keep `APP_URL` and `CORS_ORIGIN` aligned with the environment you are actually testing.

Billing env note:
- Stripe checkout resolves the monthly plan from `STRIPE_PRICE_ID_MONTHLY` first, then falls back to `STRIPE_PRICE_ID`.

4. Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Pooler setup note:
- Set `DATABASE_URL_POOLER` to your Supabase pooler URL (typically port `6543`).
- Set `DIRECT_URL` to the direct DB URL (typically port `5432`).
- Runtime prefers `DATABASE_URL_POOLER` automatically.
- For local development on Windows, prefer the local Postgres/Redis setup if Prisma TLS fails against Supabase.

5. Start:
```bash
npm start
```

## Desktop

Run local desktop shell:
```bash
npm run desktop
```

Build installers:
```bash
npm run desktop:build
```

Cross-platform build:
```bash
npm run desktop:build:all
```

## Mobile (Capacitor)

1. Set deployed URL in `capacitor.config.json`:
- `server.url`
- Current domain: `https://www.aisalonreceptionist.co.uk`

2. Sync/open projects:
```bash
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
```

## Billing (Stripe + PayPal)

- Subscriber starts plan with `POST /api/billing/create-checkout-session`
- Subscriber starts PayPal subscription with `POST /api/billing/create-paypal-subscription`
- Manage billing with `POST /api/billing/create-portal-session`
- Stripe webhook endpoint: `POST /api/billing/webhook`
- PayPal webhook endpoint: `POST /api/billing/paypal-webhook`

## Booking Endpoints

- Public demo feed: `GET /api/bookings/public-demo`
- Authenticated booking list (admin): `GET /api/bookings`
- Role-aware booking list: `GET /api/me/bookings`
- Cancel booking: `PATCH /api/bookings/:bookingId/cancel`
- Reschedule booking: `PATCH /api/bookings/:bookingId/reschedule`

Pagination:
- List/search endpoints support `limit` and `cursor` query params.
- Responses include `pagination: { limit, hasMore, nextCursor }`.

## Scale Runtime (Phase 2)

- Redis-backed cache for hot public endpoints
- Distributed rate limiting using Redis counters
- BullMQ queues for:
  - Booking notification dispatch
  - Billing webhook event processing (Stripe/PayPal)

If `REDIS_URL` is missing, the app falls back to in-process behavior.

## Testing / CI

- Local checks:
```bash
npm run check
npm run test
```

- GitHub Actions workflow:
- `.github/workflows/ci.yml`

## Deployment

Use included:
- `Dockerfile`
- `docker-compose.yml`

Then run:
```bash
docker compose up --build -d
```

## Important Notes

- App requires PostgreSQL for full runtime.
- If Prisma client is missing, API starts with clear Prisma initialization errors.
- Update demo credentials and lock `CORS_ORIGIN` before production.
- Final legal wording should be reviewed by a solicitor before public release.
