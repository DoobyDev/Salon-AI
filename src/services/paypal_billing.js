export function createPayPalBillingService({
  clientId = "",
  clientSecret = "",
  env = "sandbox",
  webhookId = "",
  appUrl = "",
  monthlyPlanId = "",
  yearlyPlanId = "",
  fetchImpl = fetch
} = {}) {
  const normalizedEnv = String(env || "sandbox").trim().toLowerCase();
  const normalizedClientId = String(clientId || "").trim();
  const normalizedClientSecret = String(clientSecret || "").trim();
  const normalizedWebhookId = String(webhookId || "").trim();
  const normalizedAppUrl = String(appUrl || "").trim();
  const normalizedMonthlyPlanId = String(monthlyPlanId || "").trim();
  const normalizedYearlyPlanId = String(yearlyPlanId || "").trim();

  function getPayPalBaseUrl() {
    return normalizedEnv === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  function isPayPalConfigured() {
    return Boolean(normalizedClientId && normalizedClientSecret);
  }

  async function createPayPalAccessToken() {
    if (!isPayPalConfigured()) {
      throw new Error("PayPal is not configured.");
    }

    const auth = Buffer.from(`${normalizedClientId}:${normalizedClientSecret}`).toString("base64");
    const res = await fetchImpl(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
    const data = await res.json();
    if (!res.ok) {
      const details = Array.isArray(data?.details) ? data.details.map((item) => item?.issue).filter(Boolean).join(", ") : "";
      throw new Error(details || data?.error_description || "Unable to authorize with PayPal.");
    }
    const token = String(data?.access_token || "").trim();
    if (!token) throw new Error("PayPal access token missing.");
    return token;
  }

  async function createPayPalSubscriptionSession({ planId, businessId, userId, userEmail, billingCycle }) {
    const accessToken = await createPayPalAccessToken();
    const res = await fetchImpl(`${getPayPalBaseUrl()}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: `${businessId}:${userId}:${billingCycle}`,
        subscriber: {
          email_address: userEmail
        },
        application_context: {
          brand_name: "Salon AI",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${normalizedAppUrl}/dashboard?billing=success&provider=paypal`,
          cancel_url: `${normalizedAppUrl}/dashboard?billing=cancel&provider=paypal`
        }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      const details = Array.isArray(data?.details) ? data.details.map((item) => item?.issue).filter(Boolean).join(", ") : "";
      throw new Error(details || data?.message || "Unable to create PayPal subscription.");
    }

    const links = Array.isArray(data?.links) ? data.links : [];
    const approveUrl = String(links.find((link) => link?.rel === "approve")?.href || "").trim();
    if (!approveUrl) throw new Error("PayPal approval link missing.");
    return {
      approvalUrl: approveUrl,
      subscriptionId: String(data?.id || "").trim()
    };
  }

  function parsePayPalCustomId(customId) {
    const raw = String(customId || "").trim();
    if (!raw.includes(":")) return { businessId: raw, userId: "", billingCycle: "" };
    const [businessId, userId = "", billingCycle = ""] = raw.split(":");
    return {
      businessId: String(businessId || "").trim(),
      userId: String(userId || "").trim(),
      billingCycle: String(billingCycle || "").trim().toLowerCase()
    };
  }

  function inferBillingCycleFromPayPalPlan(planId) {
    const raw = String(planId || "").trim();
    if (!raw) return "";
    if (raw === normalizedYearlyPlanId) return "yearly";
    if (raw === normalizedMonthlyPlanId) return "monthly";
    return "";
  }

  function toIsoOrNull(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  async function verifyPayPalWebhookSignature(payload, headers) {
    if (!normalizedWebhookId) return true;
    const transmissionId = String(headers["paypal-transmission-id"] || "").trim();
    const transmissionTime = String(headers["paypal-transmission-time"] || "").trim();
    const certUrl = String(headers["paypal-cert-url"] || "").trim();
    const authAlgo = String(headers["paypal-auth-algo"] || "").trim();
    const transmissionSig = String(headers["paypal-transmission-sig"] || "").trim();
    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false;

    const accessToken = await createPayPalAccessToken();
    const verifyRes = await fetchImpl(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: normalizedWebhookId,
        webhook_event: payload
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) return false;
    return String(verifyData?.verification_status || "").toUpperCase() === "SUCCESS";
  }

  return {
    getPayPalBaseUrl,
    isPayPalConfigured,
    createPayPalAccessToken,
    createPayPalSubscriptionSession,
    parsePayPalCustomId,
    inferBillingCycleFromPayPalPlan,
    toIsoOrNull,
    verifyPayPalWebhookSignature
  };
}
