// Dashboard manage-mode preference and toggle state helpers.
export function createDashboardManageModeRuntime(deps) {
  const {
    doc = document,
    localStorageImpl = localStorage,
    manageModeStorageKey,
    getUserRole,
    getManageModeEnabled,
    setManageModeEnabled,
    manageModeToggle,
    hideSection,
    renderStaffSummary,
    renderStaffRoster,
    staffRosterSection
  } = deps || {};

  function isDashboardManagerRole() {
    const role = String(getUserRole?.() || "").trim().toLowerCase();
    return role === "subscriber" || role === "admin";
  }

  function loadManageModePreference() {
    try {
      return localStorageImpl.getItem(manageModeStorageKey) === "on";
    } catch {
      return false;
    }
  }

  function setManageMode(enabled) {
    const nextEnabled = Boolean(enabled);
    setManageModeEnabled?.(nextEnabled);
    if (doc.body) {
      doc.body.setAttribute("data-manage-mode", nextEnabled ? "on" : "off");
    }
    if (manageModeToggle) {
      manageModeToggle.textContent = `Edit Mode: ${nextEnabled ? "On" : "Off"}`;
      manageModeToggle.setAttribute("aria-pressed", nextEnabled ? "true" : "false");
    }
    try {
      localStorageImpl.setItem(manageModeStorageKey, nextEnabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
    if (staffRosterSection) {
      renderStaffSummary?.();
      renderStaffRoster?.();
    }
  }

  function initializeManageMode() {
    // Separate edit mode is removed; manager actions are available by default.
    if (manageModeToggle) hideSection?.(manageModeToggle);
    setManageMode(true);
  }

  return {
    isDashboardManagerRole,
    loadManageModePreference,
    setManageMode,
    initializeManageMode
  };
}
