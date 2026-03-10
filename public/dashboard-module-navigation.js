// Dashboard module navigation, home view routing, and mobile quick-booking flow.
export function createModuleNavigationRuntime(deps) {
  const {
    getUserRole,
    getActiveModuleKey,
    setActiveModuleKey,
    groupedModulesForCurrentRole,
    markModuleUsed,
    isPopupOnlyBusinessModuleKey,
    openInteractiveModulePopup,
    hideSection,
    showSection,
    isPinnedBusinessModule,
    renderModuleNavigator,
    renderBusinessHubCards,
    setWorkspaceBackButtonVisible,
    workspaceBackToDashboardBtn,
    dashboardQuickActionsSection,
    getManageModeEnabled,
    showManageToast,
    getManagedBusinessId,
    getUserBusinessId,
    openManageForm,
    createBooking,
    refreshBookingsAfterDayPopupMutation,
    todayDateKeyLocal
  } = deps || {};

  function focusModuleByKey(moduleKey) {
    const key = String(moduleKey || "").trim();
    if (!key) return;
    markModuleUsed?.(key, "focus");
    const modules = groupedModulesForCurrentRole?.()
      .flatMap((entry) => entry.modules)
      .filter((mod) => Boolean(mod?.section));
    const found = modules.find((mod) => mod.key === key);
    if (!found) return;
    setActiveModuleKey?.(found.key);
    if (isPopupOnlyBusinessModuleKey?.(found.key)) {
      applyModuleVisibility();
      openInteractiveModulePopup?.(found.key);
      return;
    }
    applyModuleVisibility();
    found.section?.classList.remove("panel-focus");
    void found.section?.offsetWidth;
    found.section?.classList.add("panel-focus");
    window.setTimeout(() => {
      found.section?.classList.remove("panel-focus");
    }, 700);
    found.section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setWorkspaceBackButtonVisibleLocal(isVisible) {
    if (!(workspaceBackToDashboardBtn instanceof HTMLElement)) return;
    workspaceBackToDashboardBtn.classList.toggle("is-visible", Boolean(isVisible));
  }

  function returnToDashboardHomeView() {
    (setWorkspaceBackButtonVisible || setWorkspaceBackButtonVisibleLocal)(false);
    const role = getUserRole?.();
    if (role === "subscriber" || role === "admin") {
      const businessHubSection = document.getElementById("businessGrowthSection");
      const overviewSection = document.getElementById("dashboardOverviewSection");
      const target = businessHubSection || overviewSection || dashboardQuickActionsSection;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    focusModuleByKey("home");
    dashboardQuickActionsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openQuickCreateBookingFromMobile() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    if (!getManageModeEnabled?.()) {
      showManageToast?.("Turn on Edit Mode to add a booking.", "error");
      focusModuleByKey("booking_ops");
      return;
    }
    const businessId = String(getManagedBusinessId?.() || getUserBusinessId?.() || "").trim();
    if (!businessId) {
      showManageToast?.("No business selected yet.", "error");
      return;
    }
    const defaultDate = todayDateKeyLocal?.();
    const values = await openManageForm?.({
      title: `Add Booking (${defaultDate})`,
      submitLabel: "Create Booking",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+447700900123" },
        { id: "customerEmail", label: "Customer Email" },
        { id: "service", label: "Service", required: true },
        { id: "date", label: "Date", type: "date", required: true, value: defaultDate },
        { id: "time", label: "Time", type: "time", required: true }
      ]
    });
    if (!values) return;
    await createBooking?.({ businessId, ...values });
    await refreshBookingsAfterDayPopupMutation?.();
    showManageToast?.("Booking created.");
    focusModuleByKey("booking_ops");
  }

  function applyModuleVisibility() {
    const modules = groupedModulesForCurrentRole?.().flatMap((entry) => entry.modules);
    const sectionModules = modules.filter((mod) => Boolean(mod?.section));
    if (!sectionModules.length) return;
    const active = sectionModules.find((mod) => mod.key === getActiveModuleKey?.()) || sectionModules[0];
    setActiveModuleKey?.(active.key);
    sectionModules.forEach((mod) => {
      if (isPopupOnlyBusinessModuleKey?.(mod.key)) hideSection?.(mod.section);
      else if (mod.key === active.key || isPinnedBusinessModule?.(mod)) showSection?.(mod.section);
      else hideSection?.(mod.section);
    });
    renderModuleNavigator?.();
  }

  function initializeModuleNavigator() {
    const modules = groupedModulesForCurrentRole?.().flatMap((entry) => entry.modules);
    const sectionModules = modules.filter((mod) => Boolean(mod?.section));
    if (!modules.length) return;
    if (!getActiveModuleKey?.() || !sectionModules.some((mod) => mod.key === getActiveModuleKey?.())) {
      setActiveModuleKey?.((sectionModules.find((mod) => mod.startHere) || sectionModules[0] || modules[0]).key);
    }
    applyModuleVisibility();
    const role = getUserRole?.();
    if (role === "subscriber" || role === "admin") {
      renderBusinessHubCards?.();
    }
  }

  return {
    focusModuleByKey,
    setWorkspaceBackButtonVisible: setWorkspaceBackButtonVisibleLocal,
    returnToDashboardHomeView,
    openQuickCreateBookingFromMobile,
    applyModuleVisibility,
    initializeModuleNavigator
  };
}
