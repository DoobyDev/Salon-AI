// Subscriber billing summary, plan rendering, and checkout/portal flows.
export function createSubscriberBillingRuntime(deps) {
  const {
    getUserRole,
    withManagedBusiness,
    headers,
    formatDateShort,
    getBillingSummary,
    setBillingSummary,
    subscriptionBillingCycle,
    subscriptionBillingProvider,
    subscriptionCurrentPlanLabel,
    subscriptionCurrentPlanMeta,
    subscriptionPaymentConnectNote,
    subscriptionAutoRenewToggle,
    startBilling,
    autoRenewStorageKey,
    navigateToUrl
  } = deps || {};

  function inferBillingCycleFromSummary(summary) {
    const explicit = String(summary?.billingCycle || summary?.interval || "").trim().toLowerCase();
    if (explicit === "monthly" || explicit === "yearly") return explicit;
    if (explicit === "month" || explicit === "monthly_plan") return "monthly";
    if (explicit === "year" || explicit === "annual" || explicit === "yearly_plan") return "yearly";
    const planLabel = String(summary?.planLabel || "").trim().toLowerCase();
    if (planLabel.includes("year")) return "yearly";
    if (planLabel.includes("month")) return "monthly";
    return String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase() || "monthly";
  }

  function inferBillingProviderFromSummary(summary) {
    const explicit = String(summary?.provider || "").trim().toLowerCase();
    if (explicit === "stripe" || explicit === "paypal") return explicit;
    if (summary?.hasStripeCustomer || summary?.hasStripeSubscription) return "stripe";
    const status = String(summary?.status || "").trim().toLowerCase();
    if (status === "active" || status === "trialing" || status === "past_due") return "paypal";
    return String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase() || "stripe";
  }

  function getAutoRenewFromSummary(summary) {
    if (typeof summary?.autoRenew === "boolean") return summary.autoRenew;
    if (typeof summary?.cancelAtPeriodEnd === "boolean") return !summary.cancelAtPeriodEnd;
    try {
      const stored = localStorage.getItem(autoRenewStorageKey);
      if (stored === "on") return true;
      if (stored === "off") return false;
    } catch {
      // Ignore storage errors and use default.
    }
    return true;
  }

  function renderSubscriberBillingControls() {
    if (getUserRole?.() !== "subscriber") return;
    const billingSummary = getBillingSummary?.();
    const planLabel = String(billingSummary?.planLabel || "Subscriber Monthly").trim() || "Subscriber Monthly";
    const status = String(billingSummary?.status || "active").trim().toLowerCase();
    const renewalText = billingSummary?.currentPeriodEnd
      ? `Next renewal: ${formatDateShort?.(billingSummary.currentPeriodEnd)}`
      : "Next renewal: Not available yet";
    const statusLabel = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Active";

    if (subscriptionCurrentPlanLabel) {
      subscriptionCurrentPlanLabel.textContent = planLabel;
    }
    if (subscriptionCurrentPlanMeta) {
      subscriptionCurrentPlanMeta.textContent = `${statusLabel} | ${renewalText}`;
    }
    if (subscriptionBillingCycle) {
      const inferredCycle = inferBillingCycleFromSummary(billingSummary);
      if (inferredCycle === "monthly" || inferredCycle === "yearly") {
        subscriptionBillingCycle.value = inferredCycle;
      }
    }
    if (subscriptionBillingProvider) {
      const inferredProvider = inferBillingProviderFromSummary(billingSummary);
      if (inferredProvider === "stripe" || inferredProvider === "paypal") {
        subscriptionBillingProvider.value = inferredProvider;
      }
    }
    if (startBilling) {
      startBilling.textContent = "Change Plan";
    }
    if (subscriptionPaymentConnectNote) {
      const hasBilling = status === "active" || status === "trialing" || status === "past_due";
      subscriptionPaymentConnectNote.textContent = hasBilling
        ? "Need to switch or reconnect providers? Use Connect Stripe / Connect PayPal to open a secure provider flow."
        : "Connect a payment provider to activate secure subscriber billing and manage refunds through Stripe or PayPal.";
    }
    if (subscriptionAutoRenewToggle) {
      subscriptionAutoRenewToggle.checked = getAutoRenewFromSummary(billingSummary);
      subscriptionAutoRenewToggle.title = "Use Manage Billing to apply auto-renew settings with your payment provider.";
    }
  }

  async function loadBillingSummary() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    const res = await fetch(withManagedBusiness?.("/api/billing/subscriber-summary"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load billing summary.");
    setBillingSummary?.(data || null);
    renderSubscriberBillingControls();
  }

  async function createPayPalCheckout() {
    const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
    const res = await fetch("/api/billing/create-paypal-subscription", {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ billingCycle })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "PayPal session failed.");
    if (data.url) navigateToUrl?.(data.url);
  }

  async function createCheckout() {
    const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
    if (billingProvider === "paypal") {
      await createPayPalCheckout();
      return;
    }
    const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
    const res = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ billingCycle })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Billing session failed.");
    if (data.url) navigateToUrl?.(data.url);
  }

  async function createPortal() {
    const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
    if (billingProvider === "paypal") {
      throw new Error("PayPal billing changes are managed in your PayPal account.");
    }
    const res = await fetch("/api/billing/create-portal-session", {
      method: "POST",
      headers: headers?.()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Portal session failed.");
    if (data.url) navigateToUrl?.(data.url);
  }

  async function openBillingCheckoutForProvider(provider) {
    const nextProvider = String(provider || "").trim().toLowerCase();
    if (nextProvider !== "stripe" && nextProvider !== "paypal") {
      throw new Error("Unsupported billing provider.");
    }
    if (subscriptionBillingProvider) subscriptionBillingProvider.value = nextProvider;
    if (nextProvider === "paypal") {
      await createPayPalCheckout();
      return;
    }
    await createCheckout();
  }

  return {
    loadBillingSummary,
    inferBillingCycleFromSummary,
    inferBillingProviderFromSummary,
    getAutoRenewFromSummary,
    renderSubscriberBillingControls,
    openBillingCheckoutForProvider,
    createCheckout,
    createPayPalCheckout,
    createPortal
  };
}
