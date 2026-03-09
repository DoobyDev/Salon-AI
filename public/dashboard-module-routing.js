// Module routing helpers used by popup mounting and pinned-section behavior.
export function createModuleRoutingRuntime({ getRole }) {
  function isPopupOnlyBusinessModuleKey(moduleKey) {
    return [
      "account_support",
      "business_information",
      "staff_setup",
      "salon_features",
      "social_media",
      "accounting",
      "finance",
      "cancellations",
      "operations",
      "crm",
      "client_retention",
      "commercial",
      "offers_packages",
      "revenue",
      "profitability",
      "finance_targets"
    ].includes(String(moduleKey || "").trim());
  }

  function isPopupMountedBusinessSection(sectionEl) {
    return sectionEl instanceof HTMLElement && sectionEl.classList.contains("module-popup-mounted");
  }

  function isPinnedBusinessModule(mod) {
    const role = String(getRole?.() || "").trim().toLowerCase();
    if (!mod || !mod.key) return false;
    if (!(role === "subscriber" || role === "admin")) return false;
    const key = String(mod.key || "");
    if (key === "calendar") return true;
    if (role === "admin" && key === "admin_copilot") return true;
    return false;
  }

  return {
    isPopupOnlyBusinessModuleKey,
    isPopupMountedBusinessSection,
    isPinnedBusinessModule
  };
}
