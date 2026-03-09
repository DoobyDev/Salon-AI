// Lexi narrative helpers for module-specific guidance copy.
export function moduleOpsCategoryLabel(mod) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "").trim();
  const haystack = `${key} ${label}`;
  if (/account|revenue|profit|cash|payout|finance|payroll|takings/i.test(haystack)) return "Finance Ops";
  if (/crm|review|referral|growth|social|commercial|membership|package|retention/i.test(haystack)) return "Growth Ops";
  if (/staff|rota|capacity/i.test(haystack)) return "Team Ops";
  if (/booking|calendar|waitlist|reschedule|frontdesk|operations/i.test(haystack)) return "Front Desk Ops";
  return "Business Ops";
}

export function moduleLexiNarrativeProfile(mod, blueprint, snapshots = []) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "this module").trim();
  const firstSignal = snapshots[0] || "";
  const focus = String(blueprint?.focus || "").trim();
  const nextSteps = Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps.filter(Boolean) : [];

  const fallback = {
    roleSummary: String(mod?.navSummary || mod?.howItWorks || `Supports ${label} workflows for the business.`).trim(),
    impactSummary: String(mod?.howItHelps || `Helps the business run ${label} with less manual admin and clearer decisions.`).trim(),
    lexiNow: [
      focus ? `Lexi is prioritizing: ${focus}` : `Lexi is monitoring ${label} for risks and opportunities.`,
      "Lexi is checking live signals, exceptions, and changes before recommending actions.",
      nextSteps[0] ? `Lexi is preparing your next move: ${nextSteps[0]}` : "Lexi is preparing your next best actions for this module."
    ],
    askPrompt: `Review my ${label} module and give me the best next actions, risks, and quick wins for today.`
  };

  switch (key) {
    case "home":
    case "owner_summary":
      return {
        roleSummary: "This is the leadership control view for the day. It combines priorities, revenue pressure, booking load, and operational signals so you can decide what matters first.",
        impactSummary: "It reduces decision fatigue by surfacing the most urgent business actions before you jump into individual modules.",
        lexiNow: [
          "Lexi is ranking today's priorities across bookings, staffing, and revenue pressure.",
          "Lexi is watching for exceptions that could disrupt trade (gaps, overbooked periods, no-show risk, pending confirmations).",
          "Lexi is preparing a practical action sequence for the next 1-3 hours."
        ],
        askPrompt: "Review my Home/Owner Summary and tell me the top priorities for today, what to do first, and what can wait."
      };
    case "command_center":
      return {
        roleSummary: "Command Center is your action queue. It turns dashboard signals into operational tasks the team can execute quickly.",
        impactSummary: "It helps the front desk and managers move faster by converting data into a clear list of what to do next.",
        lexiNow: [
          "Lexi is sorting today's action queue by urgency and business impact.",
          "Lexi is checking upcoming pressure points in the next 7 days so you can act before they become problems.",
          "Lexi is drafting one-tap routines for routine tasks and leaving exceptions for human decisions."
        ],
        askPrompt: "Review Command Center and give me a prioritized action list for today and this week."
      };
    case "booking_ops":
      return {
        roleSummary: "Booking Operations is the front-desk control module for appointment management, status updates, and booking changes.",
        impactSummary: "It protects diary accuracy, reduces admin time, and keeps customer communication and booking status aligned.",
        lexiNow: [
          "Lexi is checking pending confirmations, cancellations, and status mismatches in the booking list.",
          "Lexi is identifying booking changes that need fast action to protect diary flow and revenue.",
          "Lexi is preparing the next best booking-admin actions for your team."
        ],
        askPrompt: "Review Booking Operations and tell me what bookings need attention first, including pending confirmations and risky changes."
      };
    case "reschedules_changes":
      return {
        roleSummary: "Reschedules & Changes is a focused lens on moved, edited, and updated appointments so the team can process changes without scanning the full diary.",
        impactSummary: "It reduces front-desk friction during busy periods and helps prevent missed changes or client miscommunication.",
        lexiNow: [
          "Lexi is filtering for changed appointments and reschedule signals that need review.",
          "Lexi is checking whether moved bookings create gaps, overlaps, or staffing pressure.",
          "Lexi is preparing follow-up actions to confirm updates and stabilize the diary."
        ],
        askPrompt: "Review Reschedules and Changes and tell me which moved bookings need follow-up or diary adjustments."
      };
    case "calendar":
      return {
        roleSummary: "Calendar is the diary planning view. It shows demand patterns across days so you can spot pressure, gaps, and staffing needs early.",
        impactSummary: "It helps the business plan ahead, protect service quality, and improve schedule efficiency across the week and month.",
        lexiNow: [
          "Lexi is scanning the diary for busy days, open gaps, and uneven load across the month.",
          "Lexi is checking selected-day pressure against available team capacity.",
          "Lexi is preparing planning suggestions for cover, gap recovery, and front-desk prep."
        ],
        askPrompt: "Review my Calendar and tell me where I have pressure, gaps, and planning opportunities this week."
      };
    case "staff":
    case "capacity_planner":
      return {
        roleSummary: key === "capacity_planner"
          ? "Capacity Planner focuses on matching team cover to booking demand so the diary can absorb busy periods without overloading the team."
          : "Staff and Capacity manages team availability, rota visibility, and cover planning against booking demand.",
        impactSummary: "It improves service delivery by balancing demand with available staff and reducing overbooking or underused hours.",
        lexiNow: [
          "Lexi is comparing booking load to team coverage for the selected dates.",
          "Lexi is flagging capacity pressure, idle gaps, and rota mismatch risks.",
          "Lexi is preparing staffing and scheduling recommendations to protect the day."
        ],
        askPrompt: "Review staff coverage and capacity, then tell me what rota or scheduling changes would improve the diary."
      };
    case "waitlist":
      return {
        roleSummary: "Waitlist is the slot-recovery module. It turns cancellations and gaps into rebooking opportunities using ready-to-contact clients.",
        impactSummary: "It helps protect revenue and utilization by filling empty chair time faster.",
        lexiNow: [
          "Lexi is matching cancellations and gaps to waitlist demand by service and timing.",
          "Lexi is ranking the best recovery opportunities based on likely conversion and fit.",
          "Lexi is preparing outreach prompts and recovery actions for the front desk."
        ],
        askPrompt: "Review the waitlist and tell me which gaps I can backfill first to recover revenue."
      };
    case "operations":
      return {
        roleSummary: "No-Show & Rebooking focuses on attendance risk, missed appointments, and rebooking recovery workflows.",
        impactSummary: "It helps reduce revenue leakage by catching patterns early and improving rebooking follow-through.",
        lexiNow: [
          "Lexi is tracking no-show and cancellation patterns that affect diary reliability.",
          "Lexi is surfacing rebooking opportunities and recovery prompts for at-risk clients.",
          "Lexi is preparing actions to reduce repeat no-show impact."
        ],
        askPrompt: "Review no-show and rebooking risks and tell me the best recovery actions for today."
      };
    case "accounting":
    case "daily_takings":
      return {
        roleSummary: key === "daily_takings"
          ? "Daily Takings is the cashflow check for today's trading activity, giving a fast view of money movement without opening full reports."
          : "Accounting manages finance feeds, exports, and reconciliation-ready revenue activity for bookkeeping and owner review.",
        impactSummary: "It improves financial visibility by keeping takings, exports, and finance checks accessible during daily operations.",
        lexiNow: [
          key === "daily_takings"
            ? "Lexi is checking today's completed bookings, cancellations, and pending confirmations against takings."
            : "Lexi is checking connected finance feeds and export/reconciliation readiness.",
          "Lexi is looking for anomalies, missing data, or timing gaps that may affect finance accuracy.",
          "Lexi is preparing the next finance checks and a clean summary for the owner."
        ],
        askPrompt: key === "daily_takings"
          ? "Review Daily Takings and tell me today's revenue picture, risks, and any finance follow-ups I should do."
          : "Review Accounting and tell me what is live, what needs reconciliation, and what finance tasks I should do next."
      };
    case "revenue":
    case "finance_targets":
    case "profitability":
    case "cashflow_forecast":
    case "payout_reconciliation":
      return {
        roleSummary:
          key === "revenue" ? "Revenue Attribution shows which channels and activities are driving bookings and income." :
          key === "finance_targets" ? "Finance Targets turns revenue and cost goals into a measurable business plan for the team." :
          key === "profitability" ? "Profitability & Payroll balances takings, costs, and payroll to protect margin." :
          key === "cashflow_forecast" ? "Cashflow Forecast predicts short-term pressure dates and helps plan mitigations before they become urgent." :
          "Payout Reconciliation compares expected takings and provider payouts to catch mismatches quickly.",
        impactSummary:
          key === "revenue" ? "It helps the business spend and market smarter by showing what actually converts into revenue." :
          key === "finance_targets" ? "It keeps the business focused on measurable weekly and monthly targets instead of reactive decisions." :
          key === "profitability" ? "It helps protect margin by making payroll and cost pressure visible before profit slips." :
          key === "cashflow_forecast" ? "It improves confidence in short-term planning by showing likely pressure points and response options." :
          "It reduces finance admin and payout errors by making mismatches visible early.",
        lexiNow: [
          key === "revenue"
            ? "Lexi is checking channel contribution, booking volume, and ROI signals."
            : key === "finance_targets"
              ? "Lexi is checking progress against targets and highlighting gaps to target."
              : key === "profitability"
                ? "Lexi is checking margin pressure from payroll, costs, and booking mix."
                : key === "cashflow_forecast"
                  ? "Lexi is modelling short-term cash pressure dates and assumptions."
                  : "Lexi is scanning payout records for mismatch patterns and reconciliation exceptions.",
          "Lexi is isolating the biggest drivers affecting finance performance right now.",
          "Lexi is preparing recommended actions to improve control, margin, or cash confidence."
        ],
        askPrompt: `Review ${label} and give me the most important finance actions, risks, and opportunities right now.`
      };
    case "crm":
    case "client_retention":
    case "commercial":
    case "offers_packages":
    case "reviews_reputation":
    case "referrals_partnerships":
    case "social":
      return {
        roleSummary:
          key === "crm" ? "CRM & Campaigns manages client segments, follow-ups, and outreach planning to drive repeat bookings." :
          key === "client_retention" ? "Client Retention focuses on keeping clients coming back through reactivation and repeat-booking strategies." :
          key === "commercial" ? "Memberships & Packages manages recurring revenue offers, bundles, and client-value products." :
          key === "offers_packages" ? "Offers & Packages focuses on promotional structures and package design to increase bookings and spend." :
          key === "reviews_reputation" ? "Reviews & Reputation manages review responses, brand tone, and trust-building follow-up." :
          key === "referrals_partnerships" ? "Referrals & Partnerships drives local growth through referrals, partnerships, and repeatable offers." :
          "Social & Brand helps keep your public profile and channels consistent with the salon experience.",
        impactSummary:
          key === "crm" ? "It improves repeat bookings by turning client data into targeted, timely follow-up actions." :
          key === "client_retention" ? "It protects lifetime value by catching churn risk and creating rebooking opportunities." :
          key === "commercial" ? "It increases recurring and prepaid revenue through structured offers clients can understand easily." :
          key === "offers_packages" ? "It helps fill gaps and increase ticket value with stronger package and offer planning." :
          key === "reviews_reputation" ? "It improves trust and conversion by keeping responses fast, calm, and consistent." :
          key === "referrals_partnerships" ? "It adds new client growth channels without relying only on ads." :
          "It supports better conversion by keeping brand visibility and profile presentation polished.",
        lexiNow: [
          key === "reviews_reputation"
            ? "Lexi is prioritizing review replies and drafting responses in your brand tone."
            : key === "social"
              ? "Lexi is checking brand/profile completeness and social link readiness."
              : "Lexi is checking growth signals, client behavior patterns, and offer opportunities.",
          key === "client_retention"
            ? "Lexi is identifying at-risk clients and likely rebooking prompts."
            : key === "commercial" || key === "offers_packages"
              ? "Lexi is comparing offers/packages against booking gaps and spend opportunities."
              : "Lexi is identifying the highest-impact outreach or growth actions to run next.",
          "Lexi is preparing a practical campaign, response, or offer action plan for the team."
        ],
        askPrompt: `Review ${label} and tell me the best growth/retention actions Lexi should run next for this business.`
      };
    case "business_profile":
    case "frontdesk":
    case "business_growth_status":
    case "first_7_days_snapshot":
    case "subscription_plan":
      return {
        roleSummary:
          key === "business_profile" ? "Business Profile is the source of truth for salon details, services, opening hours, and booking-facing information." :
          key === "frontdesk" ? "Front Desk Profile shows how the business appears to clients and supports a polished booking experience." :
          key === "business_growth_status" ? "Business Growth Status combines setup, billing, and early performance into a single progress view." :
          key === "first_7_days_snapshot" ? "First 7 Days Snapshot tracks early booking and revenue momentum so you can spot startup issues quickly." :
          "Live Subscription Plan manages plan status, billing state, and renewal timing for the account.",
        impactSummary:
          key === "business_profile" ? "It improves booking accuracy and trust by keeping customer-facing business details correct." :
          key === "frontdesk" ? "It increases conversion confidence by showing a cleaner, more complete customer-facing experience." :
          key === "business_growth_status" ? "It keeps setup and commercial readiness visible so the business reaches a stable go-live faster." :
          key === "first_7_days_snapshot" ? "It helps owners measure momentum and respond early to cancellations or weak conversion." :
          "It prevents billing surprises and keeps subscription decisions easy to manage.",
        lexiNow: [
          key === "business_profile"
            ? "Lexi is checking profile completeness, service clarity, and booking-facing details."
            : key === "frontdesk"
              ? "Lexi is reviewing customer-facing presentation, trust details, and service visibility."
              : key === "subscription_plan"
                ? "Lexi is checking billing status, plan details, and renewal timing."
                : "Lexi is checking progress signals and setup/commercial readiness.",
          firstSignal ? `Lexi is using current module signals: ${firstSignal}` : "Lexi is using live module data and setup signals to prioritize improvements.",
          "Lexi is preparing the next improvements that will most improve readiness, trust, or momentum."
        ],
        askPrompt: `Review ${label} and tell me what to improve first to strengthen setup, trust, and business performance.`
      };
    case "opening_closing_checklist":
      return {
        roleSummary: "Opening & Closing Checklist runs repeatable startup and shutdown routines with AI prioritization so key tasks aren't missed.",
        impactSummary: "It improves consistency, handover quality, and operational readiness across busy salon days.",
        lexiNow: [
          "Lexi is checking today's opening/closing readiness using bookings, staffing, and exception signals.",
          "Lexi is auto-completing safe routine checks and leaving risk items for review.",
          "Lexi is prioritizing exceptions so the team handles the highest-impact issues first."
        ],
        askPrompt: "Review Opening and Closing Checklist readiness and tell me what should be handled first today."
      };
    case "service_recovery_playbook":
      return {
        roleSummary: "Service Recovery Playbook helps the team respond quickly to problems with AI-guided recovery messaging and rebooking options.",
        impactSummary: "It protects reviews, trust, and future revenue by handling service issues professionally and consistently.",
        lexiNow: [
          "Lexi is triaging service issues and prioritizing the most urgent recovery cases.",
          "Lexi is drafting recovery responses and rebooking options that match the issue severity.",
          "Lexi is tracking follow-up actions to improve outcomes and retention."
        ],
        askPrompt: "Review the Service Recovery Playbook and tell me which recovery cases need action first and what Lexi should send."
      };
    default:
      return fallback;
  }
}
