// Module purpose profile text used in popup purpose strips.
export function getModuleBusinessJobProfile(mod) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "Module").trim();
  const byKey = {
    home: {
      job: "Run the day from one control view",
      outcome: "Priorities, pressure points, and next actions stay visible.",
      requiredAction: "Review the top priority cards before opening other modules."
    },
    owner_summary: {
      job: "Give the owner a fast business read",
      outcome: "The owner can decide what needs attention in under 2 minutes.",
      requiredAction: "Check the top 3 priorities and delegate one action."
    },
    command_center: {
      job: "Turn signals into actions",
      outcome: "The team gets a ranked action queue instead of guessing.",
      requiredAction: "Work from the first action card and clear blockers."
    },
    booking_ops: {
      job: "Manage bookings and booking statuses",
      outcome: "The diary stays accurate and clients get the right updates.",
      requiredAction: "Confirm pending bookings and resolve status changes."
    },
    calendar: {
      job: "Control the diary and daily schedule",
      outcome: "Appointments are visible, organized, and easy to adjust.",
      requiredAction: "Review today/tomorrow capacity and resolve clashes."
    },
    waitlist: {
      job: "Recover cancelled slots",
      outcome: "Empty gaps are turned into rebooked revenue opportunities.",
      requiredAction: "Contact the best-fit waitlist clients when a slot opens."
    },
    staff: {
      job: "Manage staff availability and rota cover",
      outcome: "Booking capacity reflects who is actually working.",
      requiredAction: "Confirm on-duty coverage for peak booking periods."
    },
    commercial: {
      job: "Control memberships, packages, and gift cards",
      outcome: "Repeat revenue and upsell offers stay structured and visible.",
      requiredAction: "Review active offers and remove stale items."
    },
    crm: {
      job: "Grow repeat visits and retention",
      outcome: "Segments and campaigns are easier to run consistently.",
      requiredAction: "Review high-value and at-risk client segments."
    },
    operations: {
      job: "Reduce no-shows and recover revenue",
      outcome: "At-risk appointments get follow-up before revenue is lost.",
      requiredAction: "Review risk prompts and action recovery messages."
    },
    revenue: {
      job: "Track channel performance",
      outcome: "You can see which channels produce bookings and revenue.",
      requiredAction: "Review spend and adjust low-performing channels."
    },
    profitability: {
      job: "Protect margins",
      outcome: "Payroll, costs, and revenue can be reviewed together.",
      requiredAction: "Update payroll/cost inputs before reading profit signals."
    },
    accounting: {
      job: "Connect and reconcile finance systems",
      outcome: "Takings and exports are easier to reconcile accurately.",
      requiredAction: "Connect a provider or run an export/reconciliation check."
    },
    social: {
      job: "Keep social presence current",
      outcome: "Clients see up-to-date links and branding touchpoints.",
      requiredAction: "Add or review social links and profile media."
    },
    frontdesk: {
      job: "Polish the public-facing profile",
      outcome: "Clients get a clearer, more trustworthy booking experience.",
      requiredAction: "Review services, contact details, and profile presentation."
    },
    business_profile: {
      job: "Complete business setup",
      outcome: "The salon is ready for bookings with accurate core details.",
      requiredAction: "Finish contact details, services, and opening hours."
    },
    subscriber_copilot: {
      job: "Use Lexi for owner-side decisions",
      outcome: "You get fast guidance on bookings, ops, growth, and risks.",
      requiredAction: "Ask Lexi for the next best actions for today."
    },
    admin_copilot: {
      job: "Use Lexi for platform diagnostics",
      outcome: "Admin checks become faster with guided troubleshooting.",
      requiredAction: "Ask Lexi a specific diagnostics question."
    }
  };
  if (byKey[key]) return byKey[key];
  if (/lexi|copilot|chat/i.test(`${key} ${label}`)) {
    return {
      job: "Guide the user to the next action",
      outcome: "Questions turn into clear actions without leaving the workflow.",
      requiredAction: "Ask one focused question and apply the answer."
    };
  }
  if (/calendar|booking|waitlist|reschedule|operations/i.test(`${key} ${label}`)) {
    return {
      job: "Keep front-desk operations flowing",
      outcome: "Bookings and follow-up actions stay organized and current.",
      requiredAction: "Review exceptions first, then complete routine updates."
    };
  }
  if (/revenue|profit|account|cash|finance/i.test(`${key} ${label}`)) {
    return {
      job: "Turn numbers into decisions",
      outcome: "Finance signals are visible and easier to act on.",
      requiredAction: "Update missing inputs and review the latest summary."
    };
  }
  return {
    job: `Manage ${label}`,
    outcome: "This part of the business stays maintained and usable.",
    requiredAction: "Review the current status and complete the main action."
  };
}
