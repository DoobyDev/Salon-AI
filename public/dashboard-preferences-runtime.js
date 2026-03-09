// Dashboard action status, demo-fill preference, demo navigation, and UI density helpers.
export function createDashboardPreferencesRuntime(deps) {
  const {
    dashActionStatus,
    demoModeToggle,
    hideSection,
    currentRole,
    demoFillSessionKey,
    demoFillModeStorageKey,
    getDashboardDemoFillModeEnabled,
    setDashboardDemoFillModeEnabled,
    isMockMode,
    token,
    userRaw,
    getManagedBusinessId
  } = deps || {};

  let dashActionTimerId = null;

  function setDashActionStatus(message, isError = false, autoClearMs = 4200) {
    if (!dashActionStatus) return;
    dashActionStatus.textContent = String(message || "").trim();
    dashActionStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
    if (dashActionTimerId) {
      window.clearTimeout(dashActionTimerId);
      dashActionTimerId = null;
    }
    if (!dashActionStatus.textContent || autoClearMs <= 0) return;
    dashActionTimerId = window.setTimeout(() => {
      if (dashActionStatus) dashActionStatus.textContent = "";
      dashActionTimerId = null;
    }, autoClearMs);
  }

  function refreshDemoModeToggle() {
    if (!demoModeToggle) return;
    hideSection?.(demoModeToggle);
  }

  function loadDashboardDemoFillPreference() {
    if (!(currentRole === "subscriber" || currentRole === "admin")) return false;
    try {
      const active = sessionStorage.getItem(`${demoFillSessionKey}:${currentRole}`) === "on";
      localStorage.removeItem(`${demoFillModeStorageKey}:${currentRole}`);
      return active;
    } catch {
      return false;
    }
  }

  function setDashboardDemoFillPreference(enabled) {
    const nextEnabled = Boolean(enabled) && !isMockMode && (currentRole === "subscriber" || currentRole === "admin");
    setDashboardDemoFillModeEnabled?.(nextEnabled);
    try {
      sessionStorage.setItem(`${demoFillSessionKey}:${currentRole}`, nextEnabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
    refreshDemoModeToggle();
  }

  function isDashboardDemoDataModeActive() {
    return Boolean(isMockMode || getDashboardDemoFillModeEnabled?.());
  }

  function navigateWithDemoMode(nextEnabled) {
    const enableDemo = Boolean(nextEnabled);
    if (!enableDemo && (!token || !userRaw)) {
      setDashActionStatus("Sign in first to exit demo mode.", true);
      return;
    }
    const url = new URL(window.location.href);
    if (enableDemo) {
      url.searchParams.set("mock", "1");
      url.searchParams.set("role", currentRole || "subscriber");
      if (currentRole === "admin" && String(getManagedBusinessId?.() || "").trim()) {
        url.searchParams.set("businessId", String(getManagedBusinessId?.() || "").trim());
      }
    } else {
      url.searchParams.delete("mock");
      url.searchParams.delete("role");
    }
    window.location.href = url.toString();
  }

  function loadUiDensityPreference() {
    return "light";
  }

  function setUiDensity() {
    if (document.body) {
      document.body.classList.add("dashboard-light-mode");
      document.body.classList.remove("theme-vibrant");
      document.body.dataset.theme = "classic";
      document.body.dataset.themeMode = "light";
    }
  }

  function initializeUiDensity() {
    setUiDensity();
  }

  return {
    setDashActionStatus,
    refreshDemoModeToggle,
    loadDashboardDemoFillPreference,
    setDashboardDemoFillPreference,
    isDashboardDemoDataModeActive,
    navigateWithDemoMode,
    loadUiDensityPreference,
    setUiDensity,
    initializeUiDensity
  };
}
