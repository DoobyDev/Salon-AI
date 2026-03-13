// Account session/logout and local billing-preference controls.
export function createAccountSessionControlsRuntime(deps) {
  const {
    win = window,
    storage = localStorage,
    session = sessionStorage,
    authTokenKey,
    authUserKey,
    subscriptionAutoRenewPrefStorageKey,
    setDashActionStatus,
    logoutBtn,
    subscriptionAutoRenewToggle
  } = deps || {};

  function bindAccountSessionControlsEvents() {
    logoutBtn?.addEventListener("click", (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();

      session.removeItem(authTokenKey);
      session.removeItem(authUserKey);
      storage.removeItem(authTokenKey);
      storage.removeItem(authUserKey);
      storage.removeItem("salonTheme");
      win.location.assign("/?logout=1");
    });

    subscriptionAutoRenewToggle?.addEventListener("change", () => {
      try {
        storage.setItem(
          subscriptionAutoRenewPrefStorageKey,
          subscriptionAutoRenewToggle.checked ? "on" : "off"
        );
      } catch {
        // Ignore localStorage errors.
      }
      setDashActionStatus?.("Auto renew preference saved for this device. Use Manage Billing to apply billing-account changes.");
    });
  }

  return {
    bindAccountSessionControlsEvents
  };
}
