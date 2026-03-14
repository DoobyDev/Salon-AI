// Role-based dashboard module definitions and normalization.
export function createModuleDefinitionsRuntime(deps) {
  const {
    getUserRole,
    subscriberExecutivePulseSection,
    subscriberSubscriptionSection,
    frontDeskSection,
    subscriberCommandCenterSection,
    businessGrowthSection,
    first7DaysSnapshotSection,
    businessProfileSection,
    bookingOperationsSection,
    accountingIntegrationsSection,
    staffRosterSection,
    waitlistSection,
    operationsInsightsSection,
    crmSection,
    commercialSection,
    merchSection,
    revenueAttributionSection,
    profitabilitySection,
    socialMediaSection
  } = deps || {};

  function normalizeModuleConfig(mod) {
    if (!mod || typeof mod !== "object") return null;
    const hasSection = mod.section instanceof HTMLElement;
    const key = String(mod.key || "");
    const inferredCadence = (() => {
      if (key === "home") return "Start here";
      if (["command_center", "booking_ops", "calendar", "waitlist", "staff", "overview"].includes(key)) return "Use daily";
      if (["revenue", "profitability", "commercial", "accounting", "crm", "social", "frontdesk", "business_profile"].includes(key)) return "Weekly check";
      return "Use daily";
    })();
    return {
      popupMode: hasSection ? "interactive" : "info",
      popupSize: hasSection ? "large" : "medium",
      enabled: true,
      cadence: inferredCadence,
      startHere: key === "home",
      navSummary: String(mod.howItHelps || mod.howItWorks || "").trim(),
      ...mod
    };
  }

  function moduleDefinitionsForRole() {
    const role = getUserRole?.();
    if (role === "customer") {
      return [];
    }

    if (role === "subscriber" || role === "admin") {
      const modules = [
        {
          key: "home",
          section: subscriberExecutivePulseSection,
          label: "Home",
          hideInNavigator: true,
          popupMode: "interactive",
          popupSize: "large",
          cadence: "Start here",
          startHere: true,
          navSummary: "Open your daily control view with priorities, bookings, staffing pressure, and revenue signals.",
          features: ["Today's priorities", "Bookings and revenue pulse", "Quick action focus"],
          howItWorks: "Pulls together the main numbers, alerts, and priorities you need to run the day.",
          howItHelps: "Gives you a clear starting point before you jump into bookings, staffing, or finance."
        },
        {
          key: "subscription_plan",
          section: subscriberSubscriptionSection,
          label: "Live Subscription Plan",
          popupMode: "interactive",
          popupSize: "medium",
          cadence: "Monthly check",
          navSummary: "Review your current plan status, next renewal date, and update billing settings.",
          features: ["Current plan status", "Renewal timing", "Change plan and billing management"],
          howItWorks: "Shows your current subscription summary and links to plan changes or billing management actions.",
          howItHelps: "Keeps plan and renewal details easy to find without opening the full business growth panel."
        },
        {
          key: "owner_summary",
          section: subscriberExecutivePulseSection,
          label: "Owner Summary",
          popupSize: "large",
          cadence: "Start here",
          navSummary: "Get a quick owner-level view of priorities, pressure points, and what needs attention next.",
          features: ["Owner-level overview", "Priority focus", "Business pulse"],
          howItWorks: "Shows a simplified executive view of what matters most right now.",
          howItHelps: "Helps owners check the business quickly without digging through every module."
        },
        {
          key: "frontdesk",
          section: frontDeskSection,
          label: "Front Desk Profile",
          popupSize: "large",
          navSummary: "Review how your salon profile and service presentation look to clients.",
          features: ["Public profile preview", "Service menu presentation", "Trust-building details"],
          howItWorks: "Shows what clients see: your profile, services, reviews, and front desk presentation.",
          howItHelps: "Helps you keep your booking experience polished and consistent."
        },
        {
          key: "command_center",
          section: subscriberCommandCenterSection,
          label: "Command Center",
          popupMode: "interactive",
          popupSize: "medium",
          cadence: "Use daily",
          navSummary: "See what needs attention first today, plus pressure points coming up this week.",
          features: ["Today's priority list", "Next 7 days outlook", "Risk alerts"],
          howItWorks: "Brings together today's key tasks and upcoming booking/revenue pressure points.",
          howItHelps: "Shows your team what to deal with first so the day runs smoother."
        },
        {
          key: "business_growth_status",
          section: businessGrowthSection,
          label: "Business Growth Status",
          popupSize: "large",
          cadence: "Weekly check",
          navSummary: "Check onboarding progress, billing status, and early business performance in one place.",
          features: ["Billing status", "Onboarding progress", "First-week performance"],
          howItWorks: "Brings together plan status, setup checklist progress, and early performance signals.",
          howItHelps: "Keeps setup and subscription progress visible so nothing important gets missed."
        },
        {
          key: "first_7_days_snapshot",
          section: first7DaysSnapshotSection,
          label: "First 7 Days Snapshot",
          popupMode: "interactive",
          popupSize: "medium",
          cadence: "Daily check",
          navSummary: "Quick view of bookings, completions, cancellations, and revenue for your recent first-week trend.",
          features: ["Bookings count", "Completed vs cancelled", "Revenue snapshot"],
          howItWorks: "Summarizes recent booking and revenue activity into a compact startup snapshot.",
          howItHelps: "Helps you track early momentum and spot issues quickly."
        },
        {
          key: "business_profile",
          section: businessProfileSection,
          label: "Business Profile",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Update your salon details, opening hours, and service menu so clients book the right thing.",
          features: ["Edit business details", "Update services and hours", "Profile setup tools"],
          howItWorks: "Update your salon details, service list, opening hours, and profile setup.",
          howItHelps: "Keeps your booking info accurate so clients can book with confidence."
        },
        {
          key: "booking_ops",
          section: bookingOperationsSection,
          label: "Booking Operations",
          popupSize: "xl",
          cadence: "Use daily",
          navSummary: "Handle booking changes, status updates, and reschedules without jumping between screens.",
          features: ["Search and filters", "Status updates", "Reschedule and manage bookings"],
          howItWorks: "Find bookings quickly, update statuses, and manage changes from one place.",
          howItHelps: "Cuts front desk admin time and helps keep the diary under control."
        },
        {
          key: "reschedules_changes",
          section: bookingOperationsSection,
          label: "Reschedules & Changes",
          popupSize: "xl",
          cadence: "Use daily",
          navSummary: "Focus on moved, changed, or updated appointments without scanning the full booking list.",
          features: ["Reschedule workflow", "Booking updates", "Change handling"],
          howItWorks: "Uses the booking workspace for schedule changes and client updates.",
          howItHelps: "Helps the team process changes quickly during busy periods."
        },
        {
          key: "accounting",
          section: accountingIntegrationsSection,
          label: "Accounting",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Track revenue activity and exports for your books and provider reconciliation.",
          features: ["Revenue feed", "Provider connections", "CSV exports"],
          howItWorks: "Connect your providers, track revenue activity, and export files for accounts.",
          howItHelps: "Saves admin time and gives you a clearer view of what the business is taking in."
        },
        {
          key: "daily_takings",
          section: accountingIntegrationsSection,
          label: "Daily Takings",
          popupSize: "xl",
          cadence: "Use daily",
          navSummary: "Check daily revenue movement and cashflow signals without opening full reports.",
          features: ["Daily revenue view", "Recent revenue flow", "Quick finance check"],
          howItWorks: "Uses the accounting workspace with a day-focused revenue view.",
          howItHelps: "Makes daily money checks faster for owners and managers."
        },
        {
          key: "staff",
          section: staffRosterSection,
          label: "Staff and Capacity",
          popupSize: "large",
          cadence: "Use daily",
          navSummary: "Match team cover to demand so the day runs smoothly and you avoid overbooking.",
          features: ["Team availability", "Shift coverage", "Capacity planning"],
          howItWorks: "Manage staff availability and match cover to expected demand.",
          howItHelps: "Helps prevent overbooking and keeps service running smoothly."
        },
        {
          key: "capacity_planner",
          section: staffRosterSection,
          label: "Capacity Planner",
          popupSize: "large",
          cadence: "Use daily",
          navSummary: "Plan cover around your busiest times and upcoming bookings.",
          features: ["Capacity view", "Shift planning", "Demand matching"],
          howItWorks: "Uses the staffing workspace to focus on coverage and capacity planning.",
          howItHelps: "Helps avoid pressure points before they impact service."
        },
        {
          key: "waitlist",
          section: waitlistSection,
          label: "Waitlist",
          popupMode: "interactive",
          popupSize: "large",
          cadence: "Use daily",
          navSummary: "Refill cancelled appointments quickly using your waitlist and recovery workflow.",
          features: ["Capture missed demand", "Backfill cancelled slots", "Recovery workflows"],
          howItWorks: "Add clients to the waitlist and use it to refill cancelled appointments faster.",
          howItHelps: "Helps recover income when clients cancel at short notice."
        },
        {
          key: "operations",
          section: operationsInsightsSection,
          label: "No-Show and Rebooking",
          popupSize: "large",
          cadence: "Use daily",
          navSummary: "Spot no-show risks and rebooking opportunities before they turn into empty chairs.",
          features: ["No-show risk checks", "Rebooking prompts", "Priority outreach list"],
          howItWorks: "Highlights bookings at risk and clients who are due a rebooking message.",
          howItHelps: "Helps keep chairs full and improves repeat bookings."
        },
        {
          key: "crm",
          section: crmSection,
          label: "CRM and Campaigns",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Plan client follow-up and reactivation campaigns using useful customer segments.",
          features: ["Client segments", "Campaign ideas", "Retention targeting"],
          howItWorks: "Groups clients into useful segments and suggests campaign-ready actions.",
          howItHelps: "Makes follow-up and reactivation marketing easier to run consistently."
        },
        {
          key: "client_retention",
          section: crmSection,
          label: "Client Retention",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Focus on keeping clients coming back with rebooking and follow-up actions.",
          features: ["Retention focus", "Rebooking prompts", "Follow-up planning"],
          howItWorks: "Uses the CRM workspace with a retention-first workflow.",
          howItHelps: "Improves repeat visits and client lifetime value."
        },
        {
          key: "commercial",
          section: commercialSection,
          label: "Memberships and Packages",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Manage memberships, bundles, and gift cards to support repeat spend and cash flow.",
          features: ["Membership plans", "Service bundles", "Gift card setup"],
          howItWorks: "Manage memberships, packages, and gift cards from one place.",
          howItHelps: "Supports repeat spend and steadier cash flow."
        },
        {
          key: "merch",
          section: merchSection,
          label: "Merch",
          popupMode: "interactive",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Sell in-salon retail products with images, descriptions, sale prices, and shipment tracking.",
          features: ["Product catalog", "Image and description", "Ship to customer"],
          howItWorks: "Add products you stock in the salon, attach product imagery, set pricing, and create shipment records for customers.",
          howItHelps: "Makes retail product sales easier to manage without leaving the subscriber dashboard."
        },
        {
          key: "offers_packages",
          section: commercialSection,
          label: "Offers & Packages",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Manage value offers and service packages that support repeat spend.",
          features: ["Package offers", "Promotion-ready bundles", "Repeat spend support"],
          howItWorks: "Uses the commercial workspace to manage bundles and package offers.",
          howItHelps: "Makes it easier to create offers that support retention and revenue."
        },
        {
          key: "revenue",
          section: revenueAttributionSection,
          label: "Revenue Attribution",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "See which channels are actually bringing bookings and a return on your spend.",
          features: ["Channel tracking", "Spend vs takings", "ROI comparison"],
          howItWorks: "Tracks which channels bring bookings, revenue, and return on spend.",
          howItHelps: "Helps you put your marketing budget where it is actually working."
        },
        {
          key: "finance_targets",
          section: profitabilitySection,
          label: "Finance Targets",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Track break-even and target progress to keep decisions tied to real business goals.",
          features: ["Break-even tracking", "Target checks", "Decision support"],
          howItWorks: "Uses profitability tools to review targets, margin pressure, and break-even.",
          howItHelps: "Keeps financial decisions grounded in clear targets."
        },
        {
          key: "profitability",
          section: profitabilitySection,
          label: "Profitability and Payroll",
          popupSize: "xl",
          cadence: "Weekly check",
          navSummary: "Understand margin, payroll impact, and break-even so you can make better decisions.",
          features: ["Payroll inputs", "Cost planning", "Profit and break-even view"],
          howItWorks: "Combines payroll and business costs to estimate margin and break-even.",
          howItHelps: "Shows what is really driving profit so you can make better decisions."
        },
        {
          key: "social",
          section: socialMediaSection,
          label: "Social Presence",
          popupSize: "large",
          cadence: "Weekly check",
          navSummary: "Keep your social links and profile details tidy so your brand looks consistent.",
          features: ["Social links", "Profile consistency", "Brand visibility support"],
          howItWorks: "Keep your social links and profile details updated in one place.",
          howItHelps: "Makes your brand look more consistent and helps clients trust what they see."
        },
        {
          key: "opening_closing_checklist",
          label: "Opening & Closing Checklist",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Use daily",
          navSummary: "Run a consistent open/close routine so bookings, tills, and team handover stay tidy.",
          features: ["Open checklist", "Close checklist", "Shift handover routine"],
          howItWorks: "Provides a structured checklist for opening tasks, closing tasks, and end-of-day handover.",
          howItHelps: "Reduces missed setup steps and keeps operations more consistent day to day."
        },
        {
          key: "service_recovery_playbook",
          label: "Service Recovery",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Use daily",
          navSummary: "Handle complaints, rework requests, and goodwill actions with a clear response playbook.",
          features: ["Issue triage", "Response templates", "Follow-up actions"],
          howItWorks: "Shows a structured workflow for handling service issues, rebooking fixes, and client follow-up.",
          howItHelps: "Helps protect reviews and retention when something goes wrong."
        },
        {
          key: "reviews_reputation",
          label: "Reviews & Reputation",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Weekly check",
          navSummary: "Track review quality and response habits to keep your brand trust high.",
          features: ["Review monitoring", "Response routine", "Reputation health"],
          howItWorks: "Organizes a weekly review-response workflow and highlights reputation habits to maintain.",
          howItHelps: "Supports conversion and repeat bookings by keeping trust signals strong."
        },
        {
          key: "referrals_partnerships",
          label: "Referrals & Partnerships",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Weekly check",
          navSummary: "Plan referral offers and local partnerships that can bring in repeat local demand.",
          features: ["Referral ideas", "Partner outreach", "Offer tracking prompts"],
          howItWorks: "Provides a simple framework for referral campaigns and local partner promotions.",
          howItHelps: "Creates additional growth channels beyond your normal booking flow."
        },
        {
          key: "cashflow_forecast",
          label: "Cashflow Forecast",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Weekly check",
          navSummary: "Estimate short-term cash pressure using bookings, payroll timing, and fixed costs.",
          features: ["7-30 day view", "Cash pressure prompts", "Planning checks"],
          howItWorks: "Guides a short-range cashflow review using takings, payout timing, and cost commitments.",
          howItHelps: "Helps you spot pressure early and avoid reactive decisions."
        },
        {
          key: "payout_reconciliation",
          label: "Payout Reconciliation",
          popupMode: "info",
          popupSize: "medium",
          cadence: "Weekly check",
          navSummary: "Reconcile provider payouts, exports, and expected takings before issues snowball.",
          features: ["Payout checks", "Mismatch review", "Export reconciliation"],
          howItWorks: "Outlines a routine for comparing provider payouts against booking and accounting exports.",
          howItHelps: "Reduces finance surprises and makes month-end checks faster."
        }
      ];
      return modules.map(normalizeModuleConfig).filter((mod) => mod?.enabled !== false);
    }

    return [];
  }

  return {
    normalizeModuleConfig,
    moduleDefinitionsForRole
  };
}
