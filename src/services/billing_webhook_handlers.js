export function createBillingWebhookHandlers({
  stripe,
  stripeWebhookSecret,
  paypalBillingService,
  jobRuntime
} = {}) {
  async function stripeBillingWebhookHandler(req, res) {
    if (!stripe || !stripeWebhookSecret) return res.status(400).send("Stripe not configured");
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") return res.status(400).send("Missing signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
    } catch (error) {
      return res.status(400).send(`Webhook signature invalid: ${error.message}`);
    }

    await jobRuntime.enqueueBillingEvent(event);
    return res.json({ received: true, queued: jobRuntime.enabled });
  }

  async function paypalBillingWebhookHandler(req, res) {
    if (!paypalBillingService.isPayPalConfigured()) return res.status(400).send("PayPal not configured");
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const eventType = String(payload?.event_type || "").trim();
    if (!eventType) return res.status(400).send("Missing PayPal event type");

    let signatureValid = false;
    try {
      signatureValid = await paypalBillingService.verifyPayPalWebhookSignature(payload, req.headers);
    } catch {
      signatureValid = false;
    }
    if (!signatureValid) return res.status(400).send("PayPal webhook signature invalid");

    await jobRuntime.enqueueBillingEvent({
      provider: "paypal",
      type: eventType,
      data: {
        object: payload
      }
    });
    return res.json({ received: true, queued: jobRuntime.enabled });
  }

  return {
    stripeBillingWebhookHandler,
    paypalBillingWebhookHandler
  };
}
