# App Feature Record

Last updated: 2026-03-14

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
- Installable PWA shell now correctly links the shared manifest and registers the shared service worker from the live home, auth, dashboard, and legal page entrypoints
- Role-based authentication for:
  - customer
  - subscriber
  - admin
- Ask Lexi AI assistant available across the product
- Ask Lexi now uses one shared popup presentation across the homepage and all dashboard shells, replacing the mix of separate popup and drawer designs
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
- Public Ask Lexi now opens from a single homepage nav trigger into the shared portrait-plus-conversation popup

### Subscriber Lexi

- Answer business and dashboard questions
- Help owners understand bookings, diary pressure, and next actions
- Help with revenue, finance, and accounting questions
- Guide use of the dashboard and subscriber tools
- Stay available as a persistent in-app assistant
- Subscriber dashboard Ask Lexi access is now consolidated to one header trigger that opens the same shared popup used on the homepage
- Protected realtime/avatar session startup now requires subscriber or admin auth before live business-assistant sessions can be created

### Admin Lexi

- Answer admin and platform questions
- Help interpret diagnostics and platform state
- Explain admin modules and operational workflows
- Support platform monitoring and managed-business oversight questions
- Explain likely notification-delivery problems and suggest the next admin checks in plain language
- Launch notification-fix guidance directly from the admin dashboard for a selected salon
- Admin dashboard Ask Lexi access now uses the same shared popup shell as the homepage and other dashboards
- Protected admin realtime/avatar session startup now requires admin auth before live platform-assistant sessions can be created

## Admin Dashboard Features

Status: simplified admin workspace active

### Included now

- Dedicated admin-only dashboard shell is now served for `/dashboard?role=admin` so the admin view no longer shares the subscriber page structure
- Sticky top nav simplified to:
  - Ask Lexi
  - Log out
- Search area for subscriber salons and customer accounts
- Search results now act as the main full-width admin workspace and open the same subscriber or customer dashboard preview directly on click
- App revenue section showing:
  - active app users
  - monthly and yearly active subscriber split
  - free lifetime promo subscriber count
  - day, week, and month revenue cards
  - day, week, and month booking cards
  - day, week, and month Lexi-booking cards
  - donut chart
  - gauges
  - trend graph
  - monthly revenue rows
  - signal cards
- Business Hub grid with focused cards for:
  - Accounting
  - Social Media
  - Merch
  - Finance
  - Cancellations
  - Business Information
  - Staff Setup
  - Salon Features
- Business Hub cards act as clean launch points for focused admin pages without keeping an extra detail section open on the main dashboard
- Free-subscriber metric card now opens an admin popup for adding promoter email grants, reviewing granted emails, and removing free access when needed

### Admin value

- Keeps the admin screen simple and fast to scan
- Separates platform search, revenue oversight, and business-area navigation into one clear operator view
- Removes the old shared-role dashboard conflict that was making the admin page look like the subscriber dashboard

## Landing Page / Public Marketing Features

- Premium Ask Lexi landing page
- Homepage hero now foregrounds a compact Lexi introduction strip from first load so visitors immediately see the AI receptionist without overloading the hero
- Homepage hero now anchors the Lexi introduction strip inside the main portrait card so the identity cue and hero image read as one combined stage
- Homepage Lexi portrait card now blends the intro strip and main hero image into one unified visual composition instead of separate stacked image blocks
- Homepage hero now uses a single combined Lexi stage on the right, folding the live booking preview into the main portrait card instead of splitting it into a second card
- Homepage hero spacing has been tightened so the `#experience` section reads denser and wastes less vertical space around the combined Lexi stage
- Homepage `#experience` now works as one fuller combined section, replacing the old portrait chat preview with denser supporting content and a stronger Lexi stage
- Homepage hero no longer uses the extra portrait conversation block, and the Lexi image now sits inside a more polished framed visual treatment
- Homepage hero now pushes Lexi as the unmistakable star of the page with a larger portrait stage, stronger framing, and supporting proof built around her presence
- Homepage hero now presents Lexi as the dominant first-screen focal point with a larger portrait stage, richer in-image capability overlays, and tighter supporting copy so the page reads around her instead of beside her
- Homepage hero messaging now frames Lexi more clearly as both the customer-facing front-of-house presence and the owner-facing operating signal
- Homepage `#experience` section has now been tightened again so more of the full hero reads above the fold without needing to scroll to its lower edge
- Homepage hero has since been compressed further by removing extra stacked support blocks and shrinking the Lexi stage so the section itself is materially shorter
- Lower homepage sections now better match the Lexi-first hero direction with stronger proof-band, operator-workspace, commercial-control, booking-flow, and pricing framing
- Public booking feed now sits as a cleaner supporting proof panel beside the outcomes section instead of feeling like a disconnected utility block
- Pricing section now frames the offer more clearly as operating-system tiers rather than generic AI-chat positioning
- Homepage now closes with a stronger CTA and operator-value summary section so the page ends with a clearer conversion moment instead of dropping straight into the footer
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
- Homepage Ask Lexi is now launched from the header nav only, and the popup uses one shared portrait-plus-chat dialog designed to keep Lexi visible and the chat thread professionally framed
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
- Dedicated customer dashboard shell is now served for `/dashboard?role=customer` so the customer view no longer inherits the shared subscriber page chrome
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
- Extra in-panel customer Ask Lexi launchers are now removed from the main customer dashboard shell so the shared header launcher is the primary entrypoint
- Customer dashboard wording simplified so the main areas are easier to understand at a glance
- Customer extras like offers, gift cards, and aftercare are now tucked behind a simple expandable section to keep the default view cleaner

### Customer value

- Gives customers a simple place to review appointment activity
- Keeps the customer view lighter and less operational than owner/admin views

### Suggested future expansion

- Customer profile and preferences
- Preferred salons management beyond the current saved-salon activity summary
- Deeper communication preferences and notification controls

## Subscriber Dashboard Features

Status: reduced owner workspace active

### Current subscriber shell

- Sticky top nav with:
  - Ask Lexi
  - Log out
- Subscriber shared dashboard shell now opens directly on the diary without the extra hero banner above it
- Full-width booking diary as the main working surface
- Rebuilt subscriber calendar from scratch around a clickable calendar surface instead of the older diary experiments
- Day, weekly, monthly, and yearly calendar views
- Monthly grid as the default main diary view
- Subscriber month planner now uses a true full-month calendar board with weekday-aligned cells, visible open-capacity days, month-level load stats, and a selected-day agenda/rota side panel
- Clickable calendar days that open a popup showing who is booked in for that day
- Walk-in creation directly from the day popup
- Optional walk-in welcome email when a customer email address is provided
- Selected-day coverage check showing planned team cover, assigned vs unassigned bookings, and stylist clash pressure
- Guided booking panel for new appointments
- Booking cancellation from the dashboard
- Booking reschedule from the dashboard with in-app reschedule panel
- Service-day appointment panel for check-in, in-progress tracking, completion, visit notes, and aftercare notes
- Suggested booking times inside the guided booking panel based on opening hours and current diary
- Alternative nearby-day suggestions when the selected day is closed or limited
- Subscriber booking suggestions now fetched from a protected backend route using real business hours and slot-capacity checks
- Guided booking panel now surfaces client-record prep guidance, consultation prompts, formula notes, stylist preference, and patch-test reminders
- Business Hub `Business Information` popup now shows the subscriber's current business details in a simpler editable form so they can review and update core business information in one place
- The subscriber `Business Information` popup now keeps sample fallback text as guidance only instead of pre-filling editable fields, and the save flow now shows visible editing and save/error feedback
### Ask Lexi for subscribers

- Header-launched shared Ask Lexi popup
- Subscriber Ask Lexi presentation now uses the same shared popup shell as homepage and admin
- Subscriber Ask Lexi uses current dashboard context such as selected-day diary coverage pressure, module context, and booking-diary workflows
- Quick prompts for:
  - booking customer
  - today's priorities
  - accounting help

### Subscriber value

- Keeps the subscriber dashboard focused on the live diary first
- Removes inline dashboard sprawl so the owner view is easier to scan
- Keeps the subscriber shell limited to the live diary under the top nav, without the extra Business Hub section
- Gives subscribers a cleaner self-service place to keep their core business details current

## Admin Dashboard Features

Status: simplified oversight dashboard available with preview-first admin flow

### Admin workspace layout

- Admin-specific dashboard view
- Sticky admin top nav now trimmed down to the two core controls:
  - Ask Lexi
  - Log out
- Admin dashboard now follows a simpler four-section order:
  - top nav
  - account search
  - app revenue
  - business hub
- Admin dashboard now avoids the older watchboard-style first screen so the page is easier to scan and navigate

### Account search and preview

- Admin account oversight list for subscribers and customers
- Admin account search by:
  - name
  - email
  - business
  - city
  - country
- Admin selected-account drilldown panel
- Admin managed action to open the linked subscriber dashboard as a live admin preview
- Admin managed action to open the linked customer dashboard as a live admin preview
- Admin managed business-profile shortcut remains available for subscriber accounts
- Admin preview routing now supports customer analytics and booking loading through admin-authorized customer email scope
- Admin recent account activity visibility

### Platform revenue and analytics

- Admin revenue analytics endpoint support
- Revenue section now focuses on subscriber signups, recurring app revenue, and growth visuals
- Revenue section now surfaces subscriber and earnings visuals including:
  - summary cards
  - donut mix chart
  - retention gauge
  - booking-yield gauge
  - monthly trend graph
  - monthly revenue rows
  - signal cards
- Admin revenue and account-search sections now fall back to mock populated data when live platform data is empty, so the admin layout can still be reviewed visually during setup and early rollout
- Platform revenue analytics CSV export entry point

### Business hub

- Business Hub now appears as a simple admin card grid instead of a mixed control-map/status surface
- Each Business Hub card opens a focused admin page view using the dashboard URL for:
  - business information
  - staff
  - salon features
  - social media
  - merch
  - accounting
  - finance
  - cancellations

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
- Dashboard logout now routes all roles through a dedicated sign-out page that clears client auth state and returns straight to the homepage
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
- premium booking diary workspace
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
- 2026-03-14: The subscriber booking diary was removed from the live subscriber dashboard after multiple rejected rebuild attempts, leaving the owner shell without a diary surface until a fresh approved replacement is built. The older `subscriberCalendarSection`, the later `subscriberBookingCalendarSection` rebuild, and the unused calendar Lexi sidebar runtime file were all removed from the live path.
- 2026-03-14: The subscriber monthly calendar grid was cleaned up to use a dedicated month-cell render path and a single full-width month-board layout, removing the extra override layers that had been obscuring the intended month-diary presentation.
- 2026-03-14: The subscriber monthly calendar view was simplified again so each month day now renders as a compact clickable box with just the date and booking status, making the full month easier to see at once.
- 2026-03-14: The rebuilt subscriber booking diary was pushed further toward a literal month-box calendar, with the month grid now presented as the full-width primary surface, real month days only in monthly view, and the selected-day / Lexi detail cards moved underneath the calendar instead of sharing the main row.
- 2026-03-14: The subscriber booking diary was deleted and rebuilt from scratch into a new multi-view calendar with day, weekly, monthly, and yearly views, clickable day popups, and a walk-in capture flow with optional welcome email sending.
- 2026-03-13: The subscriber `Business Information` popup now keeps sample fallback text as guidance only, disables saving until edit mode is opened, and shows visible save/error feedback instead of silently failing.
- 2026-03-13: Subscriber Business Hub `Business Information` now opens as a simpler editable business-details form inside the popup so owners can review and update core profile information in one place.
- 2026-03-13: The subscriber Business Hub section was removed again so the shared owner route returns to top nav plus booking diary only.
- 2026-03-13: The admin-style Business Hub section was restored underneath the subscriber booking diary, using the shared subscriber hub runtime so the owner shell now shows top nav, diary, and business hub only.
- 2026-03-13: The shared `/dashboard` subscriber route now hard-locks customer and admin grids off at the CSS layer so only the top nav and booking diary can appear in the owner shell.
- 2026-03-13: The shared subscriber dashboard hero banner was removed so the `/dashboard` owner route now opens directly on the diary under the top nav.
- 2026-03-13: Customer dashboard onboarding card was removed from both the dedicated customer route and the shared dashboard fallback, leaving the customer shell to open directly on bookings and rebooking content.
- 2026-03-13: The temporary subscriber Business Hub section was removed again so the reduced subscriber shell returns to just the top nav and booking diary.
- 2026-03-13: Subscriber dashboard was reduced to a diary-first owner shell with only the top nav, booking diary, and shared Business Hub visible in the main layout. Older inline subscriber sections were removed from the live dashboard surface in favor of hub-led navigation.
- 2026-03-13: Subscriber and customer dashboard Ask Lexi entrypoints were reconnected to the single shared popup runtime, so workspace, module, and calendar Lexi actions now open the same shared Ask Lexi experience instead of dead placeholder launch paths.

### 2026-03-13

- Replaced the mixed homepage, subscriber, customer, and admin Ask Lexi launch paths with one shared popup implementation and one main header launcher per page shell
- Removed the older static Ask Lexi drawer and extra visible dashboard launch buttons so the app now presents a single cleaner Ask Lexi entry pattern
- Deleted the unused legacy `public/ask-lexi-dashboard.js` runtime so the old drawer-based dashboard Ask Lexi path no longer sits in the repo as a misleading parallel implementation
- Standardized the popup content around one professional portrait-plus-conversation layout with a clearer Lexi image panel and a dedicated scrolling chat thread
- Refined the shared Ask Lexi popup content with role-specific support copy, cleaner prompt framing, and a more polished professional presentation across homepage, subscriber, customer, and admin entrypoints
- Rebuilt the homepage Ask Lexi popup from scratch into a simpler live-chat dialog after the previous popup shell became too fragile across viewport sizes
- Replaced the heavier homepage popup rail and layered chat-shell composition with a cleaner portrait-plus-chat layout that keeps the conversation area and composer visible more reliably
- Simplified the public Ask Lexi popup structure so the homepage interaction reads like one focused booking conversation instead of a stacked promotional modal
- Extended the same simpler Ask Lexi popup shell direction across the dashboard customer and business-assistant popups so Ask Lexi entrypoints feel visually consistent instead of mixing unrelated popup designs

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
- Reconnected the installable PWA shell so the current public, auth, dashboard, and legal pages all expose the shared manifest and register the shared service worker
- Matched Lexi avatar-session auth gating to the realtime-session rules so subscriber/admin live avatar sessions now enforce the same protected-scope access checks
- Reconciled the admin account tooling to the current dashboard accounts panel so search, detail review, inline edits, and managed-dashboard jump actions now use one live admin surface

### 2026-03-11

- Hardened the admin accounts panel so managed-dashboard and business-profile actions still render when live subscriber account payloads need role/business identifier normalization
- Corrected the customer dashboard feature record so already-shipped self-service, spotlight, and saved-salon items no longer appear under future expansion
- Simplified the admin dashboard by removing non-essential app-revenue, subscription-health, and billing-watch sections from the main live layout so the control room stays focused on operator actions
- Rebuilt the admin dashboard around a search-first workflow with preview links into subscriber and customer dashboards, a clickable control-map card grid, a richer revenue studio, and a dedicated app-status section
- Simplified the admin dashboard again into the intended four-section structure: top nav, account search, revenue, and a Business Hub card grid with focused admin detail pages

### 2026-03-12

- Split the admin dashboard onto a dedicated `/dashboard?role=admin` shell so it no longer inherits the shared subscriber/customer page structure
- Kept the admin screen to the requested simple flow: top nav, search area, app revenue, and Business Hub
- Added route-level serving for the admin-only shell plus no-store caching protection for the dedicated admin page asset
- Expanded the admin revenue cards to show active app users, monthly/yearly subscriber split, free lifetime promo subscribers, period revenue, bookings, and Lexi bookings
- Added email-linked free subscriber grant management plus subscriber welcome messaging for promoter accounts
- Restored focused Business Hub detail pages on the dedicated admin shell so `adminPage` links open the intended area-specific guidance instead of only highlighting a card
- Tightened subscriber dashboard card spacing and stopped short panels from stretching to the tallest neighbor so the daily workspace wastes less space
- Kept subscriber customer and recovery detail panels in-view more reliably on wide layouts by removing extra container gap and pinning the action side panels
- Rebuilt the homepage `#experience` area into one denser hero section and removed the old portrait conversation preview in favor of stronger support cards and improved portrait framing
- Reworked the homepage hero again so Lexi dominates the section visually instead of sharing equal weight with generic marketing cards
- Moved the homepage Lexi introduction strip into the top of the main portrait card so the hero identity cue sits directly with the primary Lexi image
- Refined the homepage Lexi portrait styling so the intro strip and hero image now read as one polished, unified card
- Merged the homepage Lexi portrait and live preview into one combined hero card so the right-hand stage now uses a single Lexi image and one unified panel
- Tightened the homepage `#experience` section spacing by reducing outer hero padding and compressing the merged Lexi card layout
- Reworked the homepage hero again so Lexi now leads the first screen with a more dominant portrait composition, stronger visual staging, and lighter supporting copy weight
- Extended the homepage redesign below the hero so the outcomes, operator-workspace, commercial, booking-flow, and pricing sections now carry more of the same Lexi-first visual language
- Reframed the public booking feed as a cleaner supporting proof panel and sharpened the pricing section so the offer reads more like system tiers than AI-chat packaging
- Added a stronger homepage closing CTA section so the page now ends with a clearer subscriber-conversion prompt and a tighter operator-value recap
- Split the customer dashboard onto a dedicated `/dashboard?role=customer` shell so customer chrome and logout behavior no longer depend on the shared subscriber shell
- Refined the homepage hero copy again so the main header, supporting note, and proof points use the left-hand space more effectively without enlarging the hero
- Redesigned the homepage Ask Lexi popup so the main product interaction now looks more like a premium live salon agent chat surface than a basic modal
- Tightened the homepage hero again by reducing copy load and visual height so the full section becomes visible sooner while keeping Lexi as the focal point
- Compressed the homepage hero again by removing extra stacked support content and reducing the portrait-stage height so the section reads shorter above the fold
- Restored the preferred `Meet Lexi` homepage hero look and reduced its visual footprint with a smaller portrait stage, tighter spacing, and shorter supporting elements so the section sits higher above the fold
- Simplified the homepage `#experience` hero further by removing the two proof cards beneath the main CTA row so the opening section reads cleaner and shorter
- Removed the homepage `#experience` CTA buttons so the opening Lexi section now acts as a cleaner brand-introduction panel rather than a multi-action conversion block
- Compressed the `Meet Lexi` card itself so the portrait stage, overlays, summary, and capability chips sit closer to the shorter left-hand copy block instead of extending well below it
- Reframed the homepage `#experience` headline and lede with stronger sales-led wording around front-desk coverage, after-hours booking capture, and owner control
- Expanded the homepage front-desk outcomes section with additional sales cards covering rebooking momentum and clearer client guidance
- Added a top-nav Ask Lexi action on the homepage so the main product interaction is reachable from the header alongside the existing dashboard header Ask Lexi controls
- Refreshed homepage and dashboard script asset versions so header Ask Lexi buttons consistently pick up the current popup/runtime behavior instead of stale cached code
- Reshaped the homepage Ask Lexi popup into a wider landscape layout with Lexi anchored on the left and the live chat surface taking the larger right-hand panel
- Refreshed homepage and dashboard stylesheet asset versions so Ask Lexi modal layout updates are not hidden behind stale cached CSS
- Rebalanced the homepage `#experience` Lexi card into a compact horizontal composition so the section keeps the preferred `Meet Lexi` look without growing taller
- Tightened the homepage `#experience` Lexi card again with a fixed compact desktop height, smaller portrait treatment, and simplified overlays so the section stays contained without growing
- Simplified the homepage `Meet Lexi` card structure into one flatter image-and-copy row so the `#experience` section stays compact without depending on oversized portrait staging
- Rolled the homepage `#experience` section back from the full rebuild into the preferred compact `Meet Lexi` hero direction while keeping the section height controlled
- Replaced the homepage `#experience` hero again with a cleaner dedicated two-part composition that keeps Lexi central while holding the section to a tighter, more controlled height
- Corrected the rebuilt homepage `#experience` layout so the new hero uses the full section width instead of collapsing into the first column of the old shared hero grid
- Widened the homepage `#experience` Lexi portrait treatment so the agent image reads less slim while still fitting inside the same compact section height
- Centered and widened the homepage `#experience` Lexi portrait further, and added supporting caption text around the image so the right-hand card feels more deliberate without growing taller
- Increased the homepage `#experience` Lexi portrait size again so the agent image holds more visual presence inside the right-hand card without expanding the section height
- Simplified the homepage `#experience` Lexi card again by removing extra portrait callouts and enlarging the centered portrait treatment so Lexi holds the visual focus more confidently
- Reduced the Ask Lexi popup footprint with a narrower modal width, tighter internal padding, a smaller portrait rail, and a shorter chat thread so the window feels less oversized
- Reshaped the Ask Lexi popup further into a more landscape-first window with a lower overall height so the bottom of the chat composer stays visible more reliably on screen
- Fixed the Ask Lexi popup scroll behavior so the modal keeps a stable overall shape and only the Lexi/user conversation thread scrolls inside it
- Refined the Ask Lexi popup visual design again without changing its outer footprint, giving the rail, chat shell, thread, and composer a cleaner premium live-agent presentation
- Rebuilt the homepage `#experience` section from a clean dedicated layout again so Lexi stays visually dominant in a full-width hero without relying on leftover earlier hero-card styles
- Removed the dead subscriber quick-actions dashboard path from the shared dashboard runtime, reset shell, and reset CSS so `/dashboard` no longer carries hidden subscriber section wiring for markup that has already been deleted
- Deleted the old unreferenced dashboard reset assets (`dashboard-shell-reset.js` and `rebuild.css`) so the repo no longer carries a second abandoned subscriber/dashboard shell path beside the live dashboard implementation
- Stopped the shared `/dashboard` startup from loading hidden subscriber-only growth, profile, social, staffing, CRM, commercial, revenue, and profitability branches in the background, so the reduced subscriber route now boots only the diary-first path it still actually shows
- Deleted the unmounted mobile dashboard navigation path from the shared dashboard runtime because no live dashboard HTML now includes the old mobile bottom-nav / quick-sheet shell that code depended on
- Added the same 8-card Business Hub used in the admin dashboard into the subscriber dashboard under the booking diary, using the shared admin-hub renderer so both dashboards now show the same card set and styling
- Corrected the subscriber Business Hub heading and supporting copy so the visible hub section now matches the admin dashboard wording exactly instead of using a different shared-dashboard description
- Corrected the subscriber Business Hub container spacing so the shared admin-style card grid is no longer compressed by subscriber-only dashboard-card spacing rules
- Removed the remaining Business Hub card filtering dependency on live module lookups so both admin and subscriber dashboards now always render the full shared 8-card Business Hub set instead of dropping cards when one lookup path is incomplete
- Aligned the subscriber Business Hub to the same fixed 8-card business-area source used by the admin shell and rendered it whenever the subscriber hub grid exists, so the subscriber dashboard no longer depends on the broader shared-role module path to decide whether those 8 cards appear
- Replaced the subscriber Business Hub card rendering with direct live HTML plus one small click handler, so the subscriber dashboard no longer depends on a second JS render path to make the 8 Business Hub cards appear
- Replaced the old under-section admin Business Hub detail view with one shared landscape Business Hub information popup, so both admin and subscriber dashboards now open the same extended card information in a modal instead of rendering a second detail section under the grid
- Matched the Business Hub information popup shell to the Ask Lexi popup size envelope so both dashboard popups now open in the same overall desktop window footprint
- Refreshed the dashboard stylesheet asset path and tightened the Business Hub modal selector so the new landscape popup sizing actually overrides the generic modal shell on the live dashboard routes
- Bound the subscriber Business Hub directly to the same shared modal runtime used by admin, and moved the landscape modal sizing override below the generic dashboard modal shell so both live routes now use the same popup behavior and footprint
- Bumped the shared Business Hub module import versions and added those modules to the service-worker refresh list so subscriber and admin dashboards now load the same live popup runtime instead of a stale cached Business Hub module path
- Added a dedicated subscriber Business Hub launcher script on the shared `/dashboard` route so those 8 subscriber cards can always open the same landscape modal even if the wider shared dashboard runtime hits an unrelated subscriber-path failure earlier in boot
- Expanded the subscriber Business Hub card popups into role-specific extended info windows with editable per-card draft fields inside the same fixed-size landscape modal, using internal scrolling instead of enlarging the popup shell
- Matched the admin Business Hub card popups to the same extended editable modal flow, with admin-specific draft storage and labels so all 8 admin and subscriber cards now open the same fixed-size editable information popup pattern
- Rewrote the shared Business Hub popup headings and edit panel copy per card so each admin and subscriber Business Hub popup now reads as its own business area instead of repeating the same generic panel labels
- Rebuilt the subscriber `Business Information` Business Hub popup into a true business-profile surface using the live subscriber sign-in and business profile fields, customer-facing website/image preview, Ask Lexi help action, and direct profile-management actions inside the existing fixed-size modal
- Fixed the shared Business Hub popup runtime after the Business Information refactor so all Business Hub cards can open again on both admin and subscriber dashboards instead of failing on a stale removed variable reference
- Fixed the Business Hub `Business Information` popup scroll behavior by making the left preview/highlight column scroll internally too, so the modal keeps its fixed size while the full profile content remains reachable
- Replaced the homepage command/feed block with a real public Front Desk search and preview surface, so visitors can look up subscribed salons, open a customer-facing business profile, review public business details and imagery, and ask Lexi to handle booking help from the homepage itself
- Moved the homepage public Front Desk preview off the page and into a dedicated popup window, keeping the inline preview section hidden until a business is explicitly opened from the search results
- Removed the old inline homepage `home-feed-shell` Front Desk preview path entirely so the public salon preview now exists in one place only: the dedicated popup opened from salon search results
- Moved the homepage salon result list into the same Front Desk popup too, so searching no longer shows any `home-frontdesk-result` cards underneath the page and the popup is now the only salon-results surface

### 2026-03-14

- Added a redesigned subscriber month planner to the dashboard with a proper full calendar board, weekday alignment, richer day cells, and an always-visible month summary panel
- Added selected-day agenda and rota preview panels beside the subscriber month board so salon owners can keep day detail in view without losing the wider 31-day picture







