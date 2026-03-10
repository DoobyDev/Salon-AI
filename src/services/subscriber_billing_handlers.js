export function createSubscriberBillingHandlers({
  prisma,
  stripe,
  appUrl,
  clearReadCache,
  writeAuditLog,
  paypalBillingService,
  resolveManagedBusinessId,
  subscriberMonthlyFeeGbp,
  subscriberYearlyFeeGbp,
  yearlyDiscountPercent
} = {}) {
  async function subscriberBillingSummaryHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
      select: {
        status: true,
        plan: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscription: true
      }
    });

    const status = String(subscription?.status || "inactive").trim().toLowerCase();
    const plan = String(subscription?.plan || "starter").trim().toLowerCase();
    const planLabel = plan === "yearly" ? "Subscriber Yearly" : "Subscriber Monthly";
    const effectiveMonthlyOnYearly = Number((subscriberYearlyFeeGbp / 12).toFixed(2));
    const provider = subscription?.stripeCustomerId || subscription?.stripeSubscription
      ? "stripe"
      : status === "active" || status === "trialing" || status === "past_due"
        ? "paypal"
        : "";

    return res.json({
      status,
      plan,
      planLabel,
      provider,
      currentPeriodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString() : null,
      monthlyFee: subscriberMonthlyFeeGbp,
      yearlyFee: subscriberYearlyFeeGbp,
      yearlyDiscountPercent,
      effectiveMonthlyOnYearly,
      hasStripeCustomer: Boolean(subscription?.stripeCustomerId),
      hasStripeSubscription: Boolean(subscription?.stripeSubscription)
    });
  }

  async function createCheckoutSessionHandler(req, res) {
    if (!stripe) return res.status(400).json({ error: "Stripe not configured." });
    const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
    if (!user?.businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const business = await prisma.business.findUnique({ where: { id: user.businessId } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ error: "Billing cycle must be monthly or yearly." });
    }

    const monthlyPriceId = String(process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID || "").trim();
    const yearlyPriceId = String(process.env.STRIPE_PRICE_ID_YEARLY || "").trim();
    const bodyPriceId = String(req.body?.priceId || "").trim();
    const priceId = bodyPriceId || (billingCycle === "yearly" ? yearlyPriceId : monthlyPriceId);
    if (!priceId) return res.status(400).json({ error: "Missing Stripe price ID." });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=cancel`,
      metadata: {
        businessId: business.id,
        userId: user.id,
        billingCycle,
        monthlyFeeGbp: String(subscriberMonthlyFeeGbp),
        yearlyFeeGbp: String(subscriberYearlyFeeGbp),
        yearlyDiscountPercent: String(yearlyDiscountPercent)
      }
    });
    clearReadCache();
    await writeAuditLog({
      actorId: user.id,
      actorRole: "subscriber",
      action: "billing.checkout_session_created",
      entityType: "subscription",
      entityId: business.id
    });

    return res.json({ url: session.url });
  }

  async function createPaypalSubscriptionHandler(req, res) {
    if (!paypalBillingService.isPayPalConfigured()) return res.status(400).json({ error: "PayPal not configured." });
    const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
    if (!user?.businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const business = await prisma.business.findUnique({ where: { id: user.businessId } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ error: "Billing cycle must be monthly or yearly." });
    }

    const monthlyPlanId = String(process.env.PAYPAL_PLAN_ID_MONTHLY || "").trim();
    const yearlyPlanId = String(process.env.PAYPAL_PLAN_ID_YEARLY || "").trim();
    const planId = billingCycle === "yearly" ? yearlyPlanId : monthlyPlanId;
    if (!planId) return res.status(400).json({ error: "Missing PayPal plan ID." });

    let session;
    try {
      session = await paypalBillingService.createPayPalSubscriptionSession({
        planId,
        businessId: business.id,
        userId: user.id,
        userEmail: user.email,
        billingCycle
      });
    } catch (error) {
      return res.status(502).json({ error: error.message || "PayPal checkout failed." });
    }

    clearReadCache();
    await writeAuditLog({
      actorId: user.id,
      actorRole: "subscriber",
      action: "billing.paypal_subscription_created",
      entityType: "subscription",
      entityId: business.id,
      metadata: {
        billingCycle,
        provider: "paypal",
        paypalSubscriptionId: session.subscriptionId || null
      }
    });

    return res.json({ url: session.approvalUrl, subscriptionId: session.subscriptionId || null });
  }

  async function createPortalSessionHandler(req, res) {
    if (!stripe) return res.status(400).json({ error: "Stripe not configured." });
    const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
    if (!user?.businessId) return res.status(400).json({ error: "Business not found." });
    const subscription = await prisma.subscription.findUnique({ where: { businessId: user.businessId } });
    if (!subscription?.stripeCustomerId) return res.status(400).json({ error: "No Stripe customer." });

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard`
    });
    clearReadCache();
    await writeAuditLog({
      actorId: user.id,
      actorRole: "subscriber",
      action: "billing.portal_session_created",
      entityType: "subscription",
      entityId: subscription.id
    });
    return res.json({ url: session.url });
  }

  return {
    subscriberBillingSummaryHandler,
    createCheckoutSessionHandler,
    createPaypalSubscriptionHandler,
    createPortalSessionHandler
  };
}
