// Module catalog lookup helpers for popup routing/navigation behavior.
export function createModuleCatalogRuntime({ getModules }) {
  function moduleDefinitionByKey(moduleKey) {
    const key = String(moduleKey || "").trim();
    if (!key) return null;
    const modules = Array.isArray(getModules?.()) ? getModules() : [];
    return modules.find((mod) => mod.key === key) || null;
  }

  function moduleUsesInteractivePopup(mod) {
    if (!mod) return false;
    return String(mod.popupMode || "info").toLowerCase() === "interactive";
  }

  function moduleUsesInfoPopup(mod) {
    if (!mod) return false;
    return String(mod.popupMode || "info").toLowerCase() === "info";
  }

  return {
    moduleDefinitionByKey,
    moduleUsesInteractivePopup,
    moduleUsesInfoPopup
  };
}
