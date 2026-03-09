// Module operator blueprint model used by Lexi assist and module actions.
export function getModuleOperatorBlueprint(mod, role) {
  if (!mod) return null;
  const key = String(mod.key || "").trim();
  const roleArea = role === "admin" ? "admin" : role === "subscriber" ? "subscriber" : "customer";
  const shared = {
    confidence: roleArea === "customer" ? 88 : 94,
    modeLabel: roleArea === "customer" ? "Guided assist" : "Autopilot assist",
    modeSummary: roleArea === "customer"
      ? "Keeps booking steps simple and only shows what you need next."
      : "Surfaces exceptions first, recommends actions, and keeps routine work lightweight.",
    focus: "Review this area and take the next best action.",
    impact: "Keeps the day moving with fewer manual checks.",
    nextSteps: [
      "Review the AI summary before making changes.",
      "Use one-tap actions for the most common routine tasks.",
      "Open the full module only when you need detailed controls."
    ],
    quickActions: []
  };

  const byKey = {
    opening_closing_checklist: {
      focus: "Run opening or closing routines with exception-only prompts.",
      impact: "Reduces missed setup/close tasks and improves handover consistency.",
      nextSteps: [
        "Run Opening Setup and review only flagged issues.",
        "Confirm staffing/diary readiness for the day.",
        "Log close-of-day checks when trade finishes."
      ],
      quickActions: [
        { id: "simulate_opening", label: "Run Opening Setup", variant: "primary" },
        { id: "simulate_closing", label: "Run Closing Routine", variant: "ghost" }
      ]
    },
    service_recovery_playbook: {
      focus: "Handle issues quickly with AI-guided recovery steps and follow-up prompts.",
      impact: "Protects reviews and retention when appointments go wrong.",
      nextSteps: [
        "Triage the issue severity and choose a response path.",
        "Generate a recovery offer or follow-up message.",
        "Track outcome and rebooking opportunity."
      ],
      quickActions: [
        { id: "draft_recovery_message", label: "Draft Recovery Message", variant: "primary" },
        { id: "copy_playbook", label: "Copy Playbook Steps", variant: "ghost" }
      ]
    },
    reviews_reputation: {
      focus: "Prioritize reviews needing replies and maintain response consistency.",
      impact: "Improves trust signals and conversion from profile views.",
      nextSteps: [
        "Review urgent/negative feedback first.",
        "Draft response in your preferred tone.",
        "Queue review requests for happy clients."
      ],
      quickActions: [
        { id: "draft_review_response", label: "Draft Reply", variant: "primary" },
        { id: "queue_review_requests", label: "Queue Requests", variant: "ghost" }
      ]
    },
    referrals_partnerships: {
      focus: "Set up repeatable referral and local partner campaigns with minimal admin.",
      impact: "Adds growth channels without relying only on paid traffic.",
      nextSteps: [
        "Pick a referral offer structure.",
        "Select local partner targets.",
        "Track weekly outreach and conversions."
      ],
      quickActions: [
        { id: "generate_referral_offer", label: "Generate Referral Offer", variant: "primary" },
        { id: "open_related_module", label: "Open Growth Module", variant: "ghost", moduleKey: "crm" }
      ]
    },
    cashflow_forecast: {
      focus: "Predict short-term cash pressure and show actions before it becomes urgent.",
      impact: "Improves planning and reduces reactive spending decisions.",
      nextSteps: [
        "Review next 7-30 day takings and outgoings assumptions.",
        "Flag payroll or cost-pressure dates.",
        "Plan mitigation actions before the pressure date."
      ],
      quickActions: [
        { id: "simulate_forecast", label: "Run Forecast", variant: "primary" },
        { id: "open_related_module", label: "Open Finance Targets", variant: "ghost", moduleKey: "finance_targets" }
      ]
    },
    payout_reconciliation: {
      focus: "Compare expected takings with provider payouts and highlight mismatches.",
      impact: "Catches payout/export issues earlier and speeds up reconciliation.",
      nextSteps: [
        "Run payout mismatch check.",
        "Review flagged rows and reconcile notes.",
        "Export or mark reviewed."
      ],
      quickActions: [
        { id: "simulate_reconcile", label: "Run Reconciliation Check", variant: "primary" },
        { id: "open_related_module", label: "Open Accounting", variant: "ghost", moduleKey: "accounting" }
      ]
    }
  };

  const roleDefaults = roleArea === "customer"
    ? {
        confidence: 86,
        modeLabel: "Guided booking",
        modeSummary: "Minimal prompts and next steps so booking stays simple.",
        focus: "Show the next step needed to complete a booking or check details.",
        impact: "Reduces friction and keeps the customer flow fast.",
        nextSteps: ["Check the summary.", "Open the tool.", "Complete the task."],
        quickActions: [{ id: "open_module", label: "Open Tool", variant: "primary" }]
      }
    : {
        quickActions: [
          { id: "simulate_ai_run", label: "Run AI Routine", variant: "primary" },
          { id: "open_module", label: "Open Working View", variant: "ghost" }
        ]
      };

  const merged = {
    ...shared,
    ...roleDefaults,
    ...(byKey[key] || {}),
    quickActions: (byKey[key]?.quickActions && byKey[key].quickActions.length)
      ? byKey[key].quickActions
      : (roleDefaults.quickActions || shared.quickActions)
  };
  return merged;
}
