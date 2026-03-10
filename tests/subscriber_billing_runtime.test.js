import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriberBillingRuntime } from "../public/dashboard-subscriber-billing.js";

function createElement(initial = {}) {
  return {
    value: "",
    checked: false,
    textContent: "",
    title: "",
    ...initial
  };
}

function createRuntimeHarness() {
  let billingSummary = null;

  const subscriptionBillingCycle = createElement({ value: "monthly" });
  const subscriptionBillingProvider = createElement({ value: "stripe" });
  const subscriptionCurrentPlanLabel = createElement();
  const subscriptionCurrentPlanMeta = createElement();
  const subscriptionPaymentConnectNote = createElement();
  const subscriptionAutoRenewToggle = createElement({ checked: false });
  const startBilling = createElement({ textContent: "Start Billing" });
  const navigateToUrl = vi.fn();

  const runtime = createSubscriberBillingRuntime({
    getUserRole: () => "subscriber",
    withManagedBusiness: (path) => path,
    headers: () => ({ Authorization: "Bearer test" }),
    formatDateShort: (value) => String(value || "").slice(0, 10),
    getBillingSummary: () => billingSummary,
    setBillingSummary: (value) => {
      billingSummary = value;
    },
    subscriptionBillingCycle,
    subscriptionBillingProvider,
    subscriptionCurrentPlanLabel,
    subscriptionCurrentPlanMeta,
    subscriptionPaymentConnectNote,
    subscriptionAutoRenewToggle,
    startBilling,
    autoRenewStorageKey: "billing:autoRenew",
    navigateToUrl
  });

  return {
    runtime,
    subscriptionBillingCycle,
    subscriptionBillingProvider,
    subscriptionCurrentPlanLabel,
    subscriptionCurrentPlanMeta,
    subscriptionPaymentConnectNote,
    subscriptionAutoRenewToggle,
    startBilling,
    navigateToUrl,
    getBillingSummary: () => billingSummary,
    setBillingSummary: (value) => {
      billingSummary = value;
    }
  };
}

describe("subscriber billing runtime", () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    globalThis.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it("renders billing controls from the current billing summary", () => {
    const harness = createRuntimeHarness();
    harness.setBillingSummary({
      planLabel: "Subscriber Yearly",
      status: "trialing",
      currentPeriodEnd: "2026-05-01T00:00:00.000Z",
      hasStripeCustomer: true,
      cancelAtPeriodEnd: true
    });

    harness.runtime.renderSubscriberBillingControls();

    expect(harness.subscriptionCurrentPlanLabel.textContent).toBe("Subscriber Yearly");
    expect(harness.subscriptionCurrentPlanMeta.textContent).toBe("Trialing | Next renewal: 2026-05-01");
    expect(harness.subscriptionBillingCycle.value).toBe("yearly");
    expect(harness.subscriptionBillingProvider.value).toBe("stripe");
    expect(harness.startBilling.textContent).toBe("Change Plan");
    expect(harness.subscriptionAutoRenewToggle.checked).toBe(false);
  });

  it("loads the billing summary and applies inferred PayPal billing state", async () => {
    const harness = createRuntimeHarness();
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planLabel: "Core Plan",
        status: "active",
        currentPeriodEnd: "2026-04-15T09:00:00.000Z",
        autoRenew: true
      })
    });

    await harness.runtime.loadBillingSummary();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/billing/subscriber-summary", {
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.getBillingSummary()).toEqual(
      expect.objectContaining({
        planLabel: "Core Plan",
        status: "active"
      })
    );
    expect(harness.subscriptionBillingProvider.value).toBe("paypal");
    expect(harness.subscriptionPaymentConnectNote.textContent).toContain("Need to switch or reconnect providers?");
  });

  it("creates a Stripe checkout session and navigates to the returned URL", async () => {
    const harness = createRuntimeHarness();
    harness.subscriptionBillingProvider.value = "stripe";
    harness.subscriptionBillingCycle.value = "yearly";
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://stripe.example/checkout" })
    });

    await harness.runtime.createCheckout();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/billing/create-checkout-session", {
      method: "POST",
      headers: { Authorization: "Bearer test" },
      body: JSON.stringify({ billingCycle: "yearly" })
    });
    expect(harness.navigateToUrl).toHaveBeenCalledWith("https://stripe.example/checkout");
  });

  it("switches to PayPal checkout when requested by provider", async () => {
    const harness = createRuntimeHarness();
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://paypal.example/approve" })
    });

    await harness.runtime.openBillingCheckoutForProvider("paypal");

    expect(harness.subscriptionBillingProvider.value).toBe("paypal");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/billing/create-paypal-subscription", {
      method: "POST",
      headers: { Authorization: "Bearer test" },
      body: JSON.stringify({ billingCycle: "monthly" })
    });
    expect(harness.navigateToUrl).toHaveBeenCalledWith("https://paypal.example/approve");
  });

  it("opens the Stripe billing portal and rejects PayPal portal requests", async () => {
    const harness = createRuntimeHarness();
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://stripe.example/portal" })
    });

    await harness.runtime.createPortal();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/billing/create-portal-session", {
      method: "POST",
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.navigateToUrl).toHaveBeenCalledWith("https://stripe.example/portal");

    harness.subscriptionBillingProvider.value = "paypal";
    await expect(harness.runtime.createPortal()).rejects.toThrow(
      "PayPal billing changes are managed in your PayPal account."
    );
  });
});
