// Document-level routing for dashboard module jump and popup controls.
export function createModuleClickRouterRuntime(deps) {
  const {
    doc = document,
    dashboardQuickActionsSection,
    returnToDashboardHomeView,
    openBusinessHubModulePopup,
    moduleDefinitionByKey,
    moduleUsesInteractivePopup,
    moduleUsesInfoPopup,
    openInteractiveModulePopup,
    openModuleInfoModal,
    setWorkspaceBackButtonVisible,
    focusModuleByKey
  } = deps || {};

  function bindModuleClickRouter() {
    doc.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const backBtn = target.closest("#workspaceBackToDashboardBtn");
      if (backBtn instanceof HTMLElement) {
        returnToDashboardHomeView?.();
        return;
      }

      const businessHubPopupTrigger = target.closest("[data-business-hub-popup]");
      if (businessHubPopupTrigger instanceof HTMLElement) {
        const hubKey = String(businessHubPopupTrigger.getAttribute("data-business-hub-popup") || "").trim();
        if (!hubKey) return;
        openBusinessHubModulePopup?.(hubKey);
        return;
      }

      const trigger = target.closest("[data-module-jump]");
      const popupTrigger = target.closest("[data-module-popup]");
      if (popupTrigger instanceof HTMLElement) {
        const popupKey = String(popupTrigger.getAttribute("data-module-popup") || "").trim();
        if (!popupKey) return;
        const popupMod = moduleDefinitionByKey?.(popupKey);
        if (!popupMod) return;
        if (moduleUsesInteractivePopup?.(popupMod)) {
          openInteractiveModulePopup?.(popupKey);
          return;
        }
        if (moduleUsesInfoPopup?.(popupMod)) {
          openModuleInfoModal?.(popupKey);
          return;
        }
        focusModuleByKey?.(popupKey);
        return;
      }

      if (!(trigger instanceof HTMLElement)) return;
      const next = String(trigger.getAttribute("data-module-jump") || "").trim();
      if (!next) return;
      if (dashboardQuickActionsSection?.contains(trigger)) {
        const mod = moduleDefinitionByKey?.(next);
        if (mod) {
          if (moduleUsesInteractivePopup?.(mod)) {
            openInteractiveModulePopup?.(next);
            return;
          }
          if (moduleUsesInfoPopup?.(mod)) {
            openModuleInfoModal?.(next);
            return;
          }
        }
        setWorkspaceBackButtonVisible?.(next !== "home");
      }
      focusModuleByKey?.(next);
    });
  }

  return {
    bindModuleClickRouter
  };
}
