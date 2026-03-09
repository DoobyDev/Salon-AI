// Dashboard-level session and UI control bindings.
export function createDashboardSessionControlsRuntime(deps) {
  const {
    win = window,
    isDashboardManagerRole,
    getManageModeEnabled,
    setManageMode,
    showManageToast,
    setDashActionStatus,
    getAccountingLiveTimerId,
    setAccountingLiveTimerId,
    manageModeToggle,
    demoModeToggle
  } = deps || {};

  function bindDashboardSessionControls() {
    manageModeToggle?.addEventListener("click", () => {
      if (!isDashboardManagerRole?.()) return;
      setManageMode?.(!getManageModeEnabled?.());
      showManageToast?.(`Edit Mode ${getManageModeEnabled?.() ? "enabled" : "disabled"}.`);
    });

    demoModeToggle?.addEventListener("click", () => {
      setDashActionStatus?.("Demo Mode has been removed from dashboards.", true);
    });

    win.addEventListener("beforeunload", () => {
      const timerId = getAccountingLiveTimerId?.();
      if (!timerId) return;
      win.clearInterval(timerId);
      setAccountingLiveTimerId?.(null);
    });
  }

  return {
    bindDashboardSessionControls
  };
}
