// Billing and subscriber contact shortcut controls.
export function createBillingControlsRuntime(deps) {
  const {
    getUserRole,
    isDashboardDemoDataModeActive,
    setDashActionStatus,
    createCheckout,
    createPortal,
    openBillingCheckoutForProvider,
    openContactAdminModal,
    startBilling,
    manageBilling,
    connectStripeBillingBtn,
    connectPayPalBillingBtn,
    contactAdminBtn
  } = deps || {};

  function bindBillingControlEvents() {
    startBilling?.addEventListener("click", async () => {
      if (isDashboardDemoDataModeActive?.()) {
        setDashActionStatus?.("Mock mode: billing checkout is disabled.", true);
        return;
      }
      try {
        setDashActionStatus?.("Opening secure checkout...");
        await createCheckout?.();
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    manageBilling?.addEventListener("click", async () => {
      if (isDashboardDemoDataModeActive?.()) {
        setDashActionStatus?.("Mock mode: billing portal is disabled.", true);
        return;
      }
      try {
        setDashActionStatus?.("Opening billing portal...");
        await createPortal?.();
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    connectStripeBillingBtn?.addEventListener("click", async () => {
      if (getUserRole?.() !== "subscriber") return;
      if (isDashboardDemoDataModeActive?.()) {
        setDashActionStatus?.("Mock mode: Stripe connect is disabled.", true);
        return;
      }
      try {
        setDashActionStatus?.("Opening secure Stripe billing setup...");
        await openBillingCheckoutForProvider?.("stripe");
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    connectPayPalBillingBtn?.addEventListener("click", async () => {
      if (getUserRole?.() !== "subscriber") return;
      if (isDashboardDemoDataModeActive?.()) {
        setDashActionStatus?.("Mock mode: PayPal connect is disabled.", true);
        return;
      }
      try {
        setDashActionStatus?.("Opening secure PayPal billing setup...");
        await openBillingCheckoutForProvider?.("paypal");
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    contactAdminBtn?.addEventListener("click", () => {
      if (getUserRole?.() !== "subscriber") return;
      openContactAdminModal?.();
    });
  }

  return {
    bindBillingControlEvents
  };
}
