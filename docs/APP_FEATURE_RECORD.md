# App Feature Record

Last updated: 2026-03-10

Purpose:
- Keep a permanent record of what the app can do.
- Track features by role: Admin, Subscriber, Customer.
- Give a promotion-ready feature reference for sales pages, demos, and pitches.
- Serve as the source to update whenever major app features change.

Maintenance rule:
- Update this file whenever a feature is added, removed, materially changed, or promoted to production-ready status.
- Add new dated entries to the `Feature Update Log` section at the end.

## Product Summary

Ask Lexi is an AI salon, barbershop, and beauty business operating system.

It combines:
- AI receptionist
- beauty consultant
- booking manager
- business operations dashboard
- revenue and accounting visibility
- multi-role access for customers, salon owners, and platform admins

The app is designed to help salons:
- capture more bookings
- reduce missed calls and interruptions
- guide customers into the right service
- manage daily diary pressure
- track revenue and recover lost demand

## Core Platform Features

- Public web app, desktop shell, and mobile-capable delivery path
- Role-based authentication for:
  - customer
  - subscriber
  - admin
- Ask Lexi AI assistant available across the product
- Booking lifecycle support:
  - create bookings
  - view bookings
  - cancel bookings
  - reschedule bookings
- Business profile management
- Service catalog and pricing management
- Staff and rota support
- Waitlist and rebooking support
- Revenue analytics
- Accounting export
- Audit logging
- Stripe and PayPal billing support
- Prisma/PostgreSQL persistence
- Redis-aware runtime support for cache and queue scale paths

## Ask Lexi Capabilities

### Public / customer-facing Lexi

- Answer service and treatment questions
- Help customers understand what service they need
- Guide customers toward a booking
- Explain how the app works
- Support booking-related questions in chat

### Subscriber Lexi

- Answer business and dashboard questions
- Help owners understand bookings, diary pressure, and next actions
- Help with revenue, finance, and accounting questions
- Guide use of the dashboard and subscriber tools
- Stay available as a persistent in-app assistant

### Admin Lexi

- Answer admin and platform questions
- Help interpret diagnostics and platform state
- Explain admin modules and operational workflows
- Support platform monitoring and managed-business oversight questions
- Explain likely notification-delivery problems and suggest the next admin checks in plain language
- Launch notification-fix guidance directly from the admin dashboard for a selected salon

## Landing Page / Public Marketing Features

- Premium Ask Lexi landing page
- Homepage hero now foregrounds a compact Lexi introduction strip from first load so visitors immediately see the AI receptionist without overloading the hero
- Premium salon-inspired visual theme across landing page and dashboards
- Shared theme-token approach so the main app colors can be changed from a small set of palette variables
- Auth and legal pages now use page-level theme tokens instead of mostly hardcoded visual values
- Shared `salon-theme.css` now acts as the main theme source for homepage, dashboard, auth, and legal pages
- Three selectable preset themes now available across the app, with theme controls restricted to the admin dashboard and persistent theme switching
- Clear positioning around:
  - AI salon receptionist
  - beauty consultant
  - booking manager
- Hero section focused on:
  - missed-call recovery
  - calmer front desk operations
  - owner control
- Live Ask Lexi modal on homepage
- Public booking activity feed from demo booking endpoint
- Clear CTA path to:
  - log in
  - start free trial
  - open owner dashboard
- Promotional sections covering:
  - operator OS
  - revenue and accounting
  - booking flow
  - pricing tiers

## Customer Dashboard Features

Status: basic dashboard available

### Included now

- Customer-specific dashboard view
- Booking totals
- Upcoming booking count
- Ready-to-rebook summary
- Next appointment spotlight card
- Booking list for customer-linked appointments
- Customer self-service booking cancellation
- Customer self-service booking reschedule with in-app reschedule panel
- Saved salon activity summary
- Rebooking suggestion prompts based on visit age
- Salon offer visibility based on the salons the customer already visits
- Matching active gift-card visibility when the customer name matches an issued gift card
- Recent aftercare notes from completed visits
- Direct customer actions from rebooking prompts, salon offers, gift cards, and aftercare notes via prefilled Ask Lexi flows
- Ask Lexi access from the dashboard
- First-run onboarding panel that explains what the customer dashboard does and offers quick Lexi-led actions
- Customer dashboard wording simplified so the main areas are easier to understand at a glance
- Customer extras like offers, gift cards, and aftercare are now tucked behind a simple expandable section to keep the default view cleaner

### Customer value

- Gives customers a simple place to review appointment activity
- Keeps the customer view lighter and less operational than owner/admin views

### Suggested future expansion

- Self-service cancel
- Self-service reschedule
- Next appointment spotlight card
- Preferred salons / saved salons
- Rebooking suggestions
- Customer profile and preferences

## Subscriber Dashboard Features

Status: operational owner dashboard available

### Diary and booking operations

- Full-width booking diary as the main working surface
- Calendar month navigation
- Day selection with booking and revenue summary
- Selected-day booking agenda
- Selected-day agenda filters for:
  - all bookings
  - live bookings
  - cancelled bookings
  - open-gap view
- Selected-day diary views for:
  - timeline
  - grouped by stylist
- Selected-day coverage check showing planned team cover, assigned vs unassigned bookings, and stylist clash pressure
- Guided booking panel for new appointments
- Booking cancellation from the dashboard
- Booking reschedule from the dashboard with in-app reschedule panel
- Service-day appointment panel for check-in, in-progress tracking, completion, visit notes, and aftercare notes
- Suggested booking times inside the guided booking panel based on opening hours and current diary
- Alternative nearby-day suggestions when the selected day is closed or limited
- Subscriber booking suggestions now fetched from a protected backend route using real business hours and slot-capacity checks
- Guided booking panel now surfaces client-record prep guidance, consultation prompts, formula notes, stylist preference, and patch-test reminders
- Guided booking panel now includes stylist assignment plus overlap warnings based on service duration and existing diary bookings

### Daily operating control

- Today booking metrics
- Expected revenue metrics
- Reminders due soon metric
- On duty today metric
- Recommended action list
- Communication-status view for reminder, confirmation, and rebooking activity already logged by the team
- Live notification delivery status for booking SMS/email outcomes, including sent and failed channel counts
- Communication readiness view for subscriber businesses, showing setup status, reachable upcoming bookings, available channels, and next checks in plain language
- Reminder settings controls for subscribers, including live on/off, preferred channel, reminder timing, and manual fallback
- Live booking notification delivery now respects subscriber reminder settings, including on/off state, preferred channel, and manual fallback
- Scheduled reminders now run in the server background and use the subscriber’s chosen lead time for upcoming bookings
- Subscriber communication history now distinguishes timed reminder sends from immediate booking confirmations
- Subscriber communication status now shows reminders due soon, based on the salon’s saved reminder timing and upcoming appointments
- Reminders-due-soon rows now have direct actions for opening the diary day, reviewing the customer, or asking Lexi what to do
- Due-soon reminder actions now jump directly into the matching diary day, customer view, or Lexi guidance flow
- Subscriber dashboard now keeps deeper setup tools and broader CRM tools behind simple expandable sections so the default daily workspace stays clearer
- Subscriber booking access has been simplified by replacing the large guided-booking explainer block with a smaller direct booking action card
- Subscriber message-queue tools are now tucked behind an expandable section so the main daily workspace stays focused on diary, recovery, reminders, and customers
- No-show risk visibility
- Rebooking prompts surfaced from operations data
- Recovery view combining:
  - late cancellations
  - high no-show risk bookings
  - rebooking opportunities
  - waitlist demand
- One-click recovery actions to open the day, work the waitlist, book a recovered slot, and ask Lexi for the next best move
- Plain-language no-show prevention panel with suggested reminder wording, confirmation tracking, and fast recovery actions
- Subscriber messaging board combining rebooking prompts, risky confirmations, and waitlist offers into one outreach queue

### Customer management

- Searchable customer list inside the subscriber dashboard
- Selected-customer detail view for quick front-desk follow-up
- Per-customer visit count
- Per-customer lifetime spend
- Per-customer cancellation count
- Last-visit age visibility
- Next booking visibility
- Service history summary per customer
- Recent booking history view per customer
- Suggested next-step message for rebooking and follow-up
- One-click book-again action from selected customer view
- One-click add-to-waitlist action from selected customer view
- Ask Lexi launch from selected customer view
- Editable client record per customer for allergies, formula notes, consultation notes, visit prep, preferred stylist, and patch-test status

### Revenue and finance

- Live revenue snapshot
- Revenue timeframe switching:
  - today
  - last 7 days
  - last 30 days
- Cancellation-rate visibility
- Estimated profit visibility
- Breakeven revenue visibility
- Revenue bar visualization

### Accounting and commercial support

- Accounting CSV export for business bookings
- Revenue attribution view by channel
- Subscriber checkout hub with live memberships, packages, gift cards, and retail visibility
- One-click rebook-next-visit flow from the service-day panel
- Gift-card issue form inside the subscriber dashboard
- Retail product recommendations can be pushed into aftercare notes during service-day checkout
- Accounting integration status view
- Accounting integration connect flow
- Accounting integration disconnect flow

### Team and staff

- Team coverage list
- Staff roster visibility
- On-duty vs off-duty visibility
- Weekly team planner with week navigation and rota-based daily coverage by staff member
- Weekly team planner editing with selectable staff/day cells, plain-language status and shift controls, save, discard, and reset actions

### Business setup

- Business profile endpoint support
- Service list support used by quick booking flow
- Service-driven booking creation
- Add-booking entry points from header, diary day, and selected customer view
- Live booking summary inside guided booking panel

### Ask Lexi for subscribers

- Persistent Ask Lexi drawer / panel
- Dashboard-wide Ask Lexi entry points
- Ask Lexi from header
- Ask Lexi from selected diary day
- Subscriber Ask Lexi uses current dashboard context such as selected customer, saved client record, recovery item, message task, and booking draft
- Subscriber Ask Lexi also uses selected-day diary coverage pressure such as rota cover, unassigned bookings, and stylist clashes
- Subscriber Ask Lexi can now help diagnose reminder-readiness issues using live communication setup and contact-coverage context
- Quick prompts for:
  - booking customer
  - today's priorities
  - accounting help

### Subscriber value

- Gives salon owners one control room for day-to-day trading
- Puts the diary at the center instead of hiding it behind generic widgets
- Connects operations, finance, and AI assistance in one place
- First-run onboarding panel helps new salon owners understand the most important setup steps

## Admin Dashboard Features

Status: oversight dashboard available

### Platform oversight

- Admin-specific dashboard view
- Total businesses metric
- Total subscribers metric
- Total customers metric
- Total bookings metric
- Today booking visibility
- Monthly signup visibility for subscribers and customers

### Portfolio visibility

- Business list for platform oversight
- Cross-business operational alert board for quiet, cancellation-heavy, inactive, or weak-upcoming salons
- Subscription health summary for active vs inactive subscriber plans
- Plan mix visibility across subscriber businesses
- Quiet active-business visibility so admins can spot commercially weak salons even when plans are still active
- Billing watchboard for upcoming renewals, month-ahead renewals, and subscriber plans needing commercial follow-up
- Cross-business notification-health view for salons with recent SMS/email delivery failures
- Admin Ask Lexi now uses selected-business and alert-board context to answer which businesses need attention and why
- Location and business-type visibility per business
- Admin selectable business drilldown panel
- Business owner visibility per salon account
- Subscriber plan and subscription status visibility per business
- Renewal date visibility and billing state guidance inside selected business details
- Business health label for quick admin review
- Per-business booking, revenue, customer, and service counts
- Recent business booking activity visibility
- Admin account oversight list for subscribers and customers
- Admin account search by:
  - name
  - email
  - business
  - city
  - country
- Admin selected-account drilldown panel
- Admin account editing for:
  - account name
  - account email
  - subscriber business name
- Admin recent account activity visibility

### Platform revenue and analytics

- Admin revenue analytics endpoint support
- Platform revenue analytics CSV export entry point
- Admin can oversee app/platform revenue instead of only business revenue
- Admin platform revenue card set for:
  - estimated MRR
  - revenue in period
  - subscription cancellations
  - booking cancellations
- Admin revenue trend chart from platform analytics payload

### Ask Lexi for admins

- Ask Lexi available inside dashboard
- Admin copilot support for platform questions
- Managed-business and platform diagnostics support

### Admin value

- Gives platform operators a central oversight view
- Helps monitor app health, account growth, and platform-level revenue activity
- First-run onboarding panel explains how to use the admin control room and where to focus first

### Suggested future expansion

- MRR dashboard cards
- churn tracking
- billing failure monitoring
- managed-business drilldown
- per-business health scoring
- support queue overview

## Auth and Access Features

- Shared auth entry point via `/auth`
- Customer registration
- Subscriber registration
- Role-aware login
- Admin login path
- Session storage for current signed-in user
- Dashboard role switching for admin users

## Booking Features

- Public booking creation endpoint
- Business-aware service validation
- Future-time validation
- Capacity and business-hours validation
- Booking price assignment from service catalog
- Booking source tracking
- Booking cancel endpoint
- Booking reschedule endpoint
- Role-aware booking list endpoint
- Public demo booking feed endpoint

## Revenue, Reporting, and Accounting Features

- Business live revenue endpoint
- Platform live revenue endpoint
- Business accounting export CSV
- Admin platform revenue analytics export CSV
- Revenue attribution calculations
- Profitability summary calculations
- Payroll input support
- Fixed-cost input support
- COGS percentage support
- Accounting provider support for:
  - QuickBooks
  - Xero
  - FreshBooks
  - Sage

## Business Operations Features

- Business profile management
- Social media profile management
- Staff roster management
- Staff rota support
- Availability status support
- Waitlist support
- Rebooking mark-sent support
- CRM segmentation support
- CRM campaign send logging support

## Billing and Subscription Features

- Stripe checkout support
- PayPal subscription support
- Billing portal session support
- Billing return/cancel redirects now use the canonical `/dashboard` route instead of static `.html` paths for Stripe, PayPal, and billing-portal flows
- Subscriber billing summary support
- Billing webhook handling
- Platform subscription/revenue analytics support

## Promotional Summary By Role

### What customers get

- Simple dashboard
- visibility into their appointments
- Ask Lexi booking assistance
- a cleaner booking experience

### What subscribers get

- full salon operating dashboard
- diary-first day-to-day workspace
- revenue and accounting visibility
- staff and operations support
- Ask Lexi embedded throughout the app

### What admins get

- platform oversight dashboard
- business and user growth visibility
- app revenue visibility
- exportable platform analytics
- Ask Lexi admin support

## Recommended Sales Language

- 24/7 AI Salon Receptionist That Books Appointments Automatically
- AI Beauty Consultant and Booking Manager for Salons and Barbershops
- The Salon Owner Control Room for Diary, Revenue, and Recovery
- One AI Front Desk for Booking, Customer Questions, and Daily Operations

## Feature Update Log

### 2026-03-09

- Added permanent feature record document for product and promotion reference
- Recorded current public marketing, customer dashboard, subscriber dashboard, and admin dashboard capabilities
- Recorded Ask Lexi capability coverage across public, subscriber, and admin experiences
- Recorded revenue, accounting, booking, billing, and operational support features
- Expanded customer dashboard with next-booking spotlight and self-service cancel/reschedule actions
- Expanded admin dashboard with app revenue summary cards and revenue trend visualization
- Expanded customer dashboard with saved-salon activity and rebooking prompts
- Expanded admin dashboard with searchable subscriber/customer account oversight
- Expanded admin dashboard with selected-account drilldown and inline account editing
- Expanded admin dashboard with selectable managed-business drilldown, owner/plan visibility, health labels, and recent booking activity
- Expanded subscriber dashboard with searchable customer profiles, visit/spend summaries, and selected-customer follow-up guidance
- Expanded subscriber customer view with one-click rebooking, waitlist, and Ask Lexi actions
- Replaced browser prompt rescheduling with an in-app reschedule panel for subscriber and customer bookings
- Replaced the basic quick-booking form with a guided booking panel and live booking summary
- Added simple suggested-time guidance inside the guided booking panel
- Added nearby-day suggestions inside the guided booking panel when a selected day is closed or too limited
- Upgraded guided booking suggestions to use backend slot checks instead of UI-only estimates
- Refreshed the app visual theme with a more premium salon-focused color system and richer surfaces
- Extended the theme system to auth/legal/older app pages with centralized palette overrides for easier future color changes
- Reduced remaining hardcoded auth/legal colors further by converting them into reusable page tokens
- Unified `styles.css` and `ask-lexi.css` around a shared theme file so broad color changes can be made from one place
- Added app-wide preset theme switching with persistent saved selection and admin-dashboard-only theme controls
- Added subscriber diary day filters and clearer day-status signals for live, cancelled, and open-gap review
- Added one-click subscriber recovery actions for risky bookings, waitlist backfill, day-gap review, and Ask Lexi support
- Added a subscriber no-show prevention panel with reminder copy, confirmation logging, and clearer next-step guidance
- Added a subscriber messaging board with a unified outreach queue, copy-ready messages, follow-up loading, and quick recovery shortcuts
- Added subscriber client records with saved allergies, formula notes, consultation notes, visit-prep guidance, stylist preference, and patch-test tracking
- Made the guided booking flow client-record-aware with prep guidance, consultation flags, and patch-test reminders during booking
- Added subscriber stylist assignment in guided booking, diary stylist visibility, and overlap warnings for service-duration clashes
- Added a subscriber selected-day diary view that can switch between a flat timeline and grouped-by-stylist planning
- Added a subscriber weekly team planner with rota week navigation and day-by-day staff coverage
- Added editable weekly team-planner controls for rota status and shift updates directly inside the subscriber dashboard
- Added an admin operational alert board to quickly spot which subscriber businesses look quiet, risky, or in need of review
- Made admin Ask Lexi context-aware so platform guidance can reflect the selected business and current cross-business alert board
- Added admin subscription-health oversight with active vs inactive counts, plan mix visibility, and quiet-active business tracking
- Added admin billing watch with renewal timing, billing-attention counts, and selected-business renewal guidance
- Added subscriber service-day controls for check-in, in-progress tracking, completion, visit notes, and aftercare capture
- Added subscriber checkout hub with commercial offer visibility, one-click rebooking from service day, gift-card issuing, and retail-to-aftercare shortcuts
- Expanded the customer dashboard with salon-offer visibility, matching gift-card visibility, and recent aftercare notes from completed visits
- Made customer rebooking, gift-card use, salon offers, and aftercare panels actionable through prefilled Ask Lexi booking/help flows
- Added first-run onboarding panels for subscriber, customer, and admin dashboards with quick next-step actions
- Added subscriber communication-status tracking for reminders, confirmations, and rebooking actions already logged in the app
- Added live notification delivery logging so subscriber communication status now includes real SMS/email sent and failed outcomes
- Added admin notification-health oversight so the platform can spot salons with recent communication delivery failures
- Made admin notification health more actionable with likely-cause guidance in the selected-business detail view and notification-aware Ask Lexi answers
- Added one-click admin notification actions so failing salons can be opened directly or sent into Ask Lexi fix guidance from the alert area
- Added subscriber communication readiness so salon owners can see reminder setup quality, contact coverage, live channel availability, and the next fix to make
- Added subscriber reminder settings so salon owners can directly control live reminder use, channel preference, timing, and manual fallback from the dashboard
- Connected subscriber reminder settings into live booking notification delivery so saved communication choices now affect real sends and fallback logging
- Added background scheduled reminder dispatch so 2h/24h/48h/72h reminder timing now drives real pre-appointment reminder sends
- Clarified subscriber communication tracking so owners can see whether delivery activity was a booking confirmation or a timed scheduled reminder
- Added a reminders-due-soon view so salon owners can see upcoming automated follow-up before the system sends it
- Added direct due-soon reminder actions so salon owners can jump into the diary, customer view, or Lexi guidance from the reminder queue
- Tightened the due-soon reminder workflow so the reminder queue now acts as a direct control surface for diary, customer, and Lexi actions
- Simplified subscriber and customer dashboard presentation so daily-use tools stay visible first and less-frequent tools stay tucked away until needed
- Reduced instructional clutter on the subscriber and customer dashboards so the main screens behave more like working tools and less like feature lists
- Simplified top-line dashboard metrics so subscriber and customer views now emphasize daily-use signals instead of vague engagement counts
- Reduced overlap in the subscriber dashboard by moving broader message-queue work behind an expandable section instead of keeping it open in the main daily flow
- Added selected-day coverage pressure signals that compare diary load, stylist assignment, and weekly rota cover
- Connected selected-day coverage pressure into subscriber Ask Lexi so she can recommend staffing and diary actions for that specific day
- Made subscriber Ask Lexi context-aware so her guidance can reflect the selected customer, saved client record, recovery panel, message queue, and live booking draft

### 2026-03-10

- Updated the homepage hero so Lexi is visibly present from the first screen with a top-of-page portrait cue for new visitors
- Refined the homepage Lexi intro into a more compact top-of-hero strip so first-load visibility stays clear without competing too heavily with the main portrait
- Corrected subscriber billing return paths so Stripe checkout, PayPal subscription approval, and billing-portal return flow all route back through the canonical `/dashboard` page
