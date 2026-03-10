import { describe, expect, it, vi } from "vitest";
import { createBillingControlsRuntime } from "../public/dashboard-billing-controls.js";

function createElement() {
  return {
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    }
  };
}

function createHarness(overrides = {}) {
  const startBilling = createElement();
  const manageBilling = createElement();
  const connectStripeBillingBtn = createElement();
  const connectPayPalBillingBtn = createElement();
  const contactAdminBtn = createElement();

  const setDashActionStatus = vi.fn();
  const createCheckout = vi.fn().mockResolvedValue(undefined);
  const createPortal = vi.fn().mockResolvedValue(undefined);
  const openBillingCheckoutForProvider = vi.fn().mockResolvedValue(undefined);
  const openContactAdminModal = vi.fn();

  const runtime = createBillingControlsRuntime({
    getUserRole: () => overrides.role || "subscriber",
    isDashboardDemoDataModeActive: () => Boolean(overrides.demoMode),
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
  });

  return {
    runtime,
    startBilling,
    manageBilling,
    connectStripeBillingBtn,
    connectPayPalBillingBtn,
    contactAdminBtn,
    setDashActionStatus,
    createCheckout,
    createPortal,
    openBillingCheckoutForProvider,
    openContactAdminModal
  };
}

describe("billing controls runtime", () => {
  it("opens checkout, portal, provider connect flows, and contact-admin for subscribers", async () => {
    const harness = createHarness();
    harness.runtime.bindBillingControlEvents();

    await harness.startBilling.dispatch("click");
    await harness.manageBilling.dispatch("click");
    await harness.connectStripeBillingBtn.dispatch("click");
    await harness.connectPayPalBillingBtn.dispatch("click");
    await harness.contactAdminBtn.dispatch("click");

    expect(harness.createCheckout).toHaveBeenCalled();
    expect(harness.createPortal).toHaveBeenCalled();
    expect(harness.openBillingCheckoutForProvider).toHaveBeenNthCalledWith(1, "stripe");
    expect(harness.openBillingCheckoutForProvider).toHaveBeenNthCalledWith(2, "paypal");
    expect(harness.openContactAdminModal).toHaveBeenCalled();
  });

  it("blocks billing actions in demo mode with the correct status messages", async () => {
    const harness = createHarness({ demoMode: true });
    harness.runtime.bindBillingControlEvents();

    await harness.startBilling.dispatch("click");
    await harness.manageBilling.dispatch("click");
    await harness.connectStripeBillingBtn.dispatch("click");
    await harness.connectPayPalBillingBtn.dispatch("click");

    expect(harness.createCheckout).not.toHaveBeenCalled();
    expect(harness.createPortal).not.toHaveBeenCalled();
    expect(harness.openBillingCheckoutForProvider).not.toHaveBeenCalled();
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Mock mode: billing checkout is disabled.", true);
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Mock mode: billing portal is disabled.", true);
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Mock mode: Stripe connect is disabled.", true);
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Mock mode: PayPal connect is disabled.", true);
  });

  it("ignores subscriber-only connect and contact-admin actions for non-subscriber roles", async () => {
    const harness = createHarness({ role: "admin" });
    harness.runtime.bindBillingControlEvents();

    await harness.connectStripeBillingBtn.dispatch("click");
    await harness.connectPayPalBillingBtn.dispatch("click");
    await harness.contactAdminBtn.dispatch("click");

    expect(harness.openBillingCheckoutForProvider).not.toHaveBeenCalled();
    expect(harness.openContactAdminModal).not.toHaveBeenCalled();
  });

  it("surfaces checkout and portal errors through dashboard status", async () => {
    const harness = createHarness();
    harness.createCheckout.mockRejectedValueOnce(new Error("Checkout failed."));
    harness.createPortal.mockRejectedValueOnce(new Error("Portal failed."));
    harness.runtime.bindBillingControlEvents();

    await harness.startBilling.dispatch("click");
    await harness.manageBilling.dispatch("click");

    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Checkout failed.", true);
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Portal failed.", true);
  });
});
