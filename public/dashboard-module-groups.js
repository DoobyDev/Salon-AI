// Module grouping helpers for navigator ordering and section labels.
export function createModuleGroupingRuntime({ getModulesForRole, getRole }) {
  function moduleGroupForRole(mod) {
    if (!mod || !mod.key) return "Modules";
    const key = String(mod.key);
    const map = {
      account_support: "Operations",
      admin_copilot: "Copilot",
      subscriber_copilot: "Copilot",
      home: "Home",
      subscription_plan: "Home",
      owner_summary: "Home",
      overview: "Home",
      command_center: "Home",
      calendar: "Home",
      business_growth_status: "Home",
      first_7_days_snapshot: "Home",
      frontdesk: "Growth",
      business_profile: "Growth",
      crm: "Growth",
      client_retention: "Growth",
      offers_packages: "Growth",
      merch: "Growth",
      social: "Growth",
      reviews_reputation: "Growth",
      referrals_partnerships: "Growth",
      booking_ops: "Operations",
      reschedules_changes: "Operations",
      staff: "Operations",
      capacity_planner: "Operations",
      waitlist: "Operations",
      operations: "Operations",
      opening_closing_checklist: "Operations",
      service_recovery_playbook: "Operations",
      accounting: "Finance",
      daily_takings: "Finance",
      revenue: "Finance",
      finance_targets: "Finance",
      profitability: "Finance",
      commercial: "Finance",
      cashflow_forecast: "Finance",
      payout_reconciliation: "Finance"
    };
    return map[key] || "Modules";
  }

  function groupedModulesForCurrentRole() {
    const modules = (Array.isArray(getModulesForRole?.()) ? getModulesForRole() : []).filter((mod) => {
      if (!mod || mod.hideInNavigator === true) return false;
      if (String(getRole?.() || "").toLowerCase() === "subscriber" && mod.key === "subscriber_copilot") return false;
      return true;
    });
    const groupOrder = ["Home", "Copilot", "Operations", "Growth", "Finance", "Modules"];
    const groups = new Map();
    modules.forEach((mod) => {
      const group = moduleGroupForRole(mod);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(mod);
    });
    return groupOrder
      .filter((group) => groups.has(group))
      .map((group) => ({ group, modules: groups.get(group) }));
  }

  function formatModuleGroupHeading(groupName) {
    const group = String(groupName || "").trim();
    if (!group) return "MODULES";
    return group;
  }

  return {
    moduleGroupForRole,
    groupedModulesForCurrentRole,
    formatModuleGroupHeading
  };
}
