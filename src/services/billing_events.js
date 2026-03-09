export function createBillingEventService({
  getPrisma,
  paypalBillingService,
  clearReadCache,
  writeAuditLog
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function processPayPalBillingWebhookEvent(paypalEvent = {}) {
    const prisma = prismaClient();
    const eventType = String(paypalEvent?.event_type || "").trim().toUpperCase();
    const resource = paypalEvent?.resource && typeof paypalEvent.resource === "object" ? paypalEvent.resource : {};
    if (!eventType || !resource || typeof resource !== "object") return;

    const custom = paypalBillingService.parsePayPalCustomId(resource.custom_id);
    const businessId = custom.businessId;
    if (!businessId) return;

    const resourceStatus = String(resource.status || "").trim().toUpperCase();
    const billingCycle = custom.billingCycle || paypalBillingService.inferBillingCycleFromPayPalPlan(resource.plan_id) || "monthly";
    const periodEndIso = paypalBillingService.toIsoOrNull(resource?.billing_info?.next_billing_time);
    const cancelledEventTypes = new Set([
      "BILLING.SUBSCRIPTION.CANCELLED",
      "BILLING.SUBSCRIPTION.SUSPENDED",
      "BILLING.SUBSCRIPTION.EXPIRED"
    ]);

    const status =
      cancelledEventTypes.has(eventType) || ["CANCELLED", "SUSPENDED", "EXPIRED"].includes(resourceStatus)
        ? "cancelled"
        : "active";
    const nextPeriodEnd = status === "active" ? periodEndIso : null;

    await prisma.subscription.upsert({
      where: { businessId },
      update: {
        status,
        plan: billingCycle,
        currentPeriodEnd: nextPeriodEnd ? new Date(nextPeriodEnd) : null
      },
      create: {
        businessId,
        status,
        plan: billingCycle,
        currentPeriodEnd: nextPeriodEnd ? new Date(nextPeriodEnd) : null
      }
    });
    clearReadCache();

    await writeAuditLog({
      actorId: custom.userId || null,
      actorRole: "system",
      action: status === "active" ? "billing.subscription_activated" : "billing.subscription_cancelled",
      entityType: "subscription",
      entityId: businessId,
      metadata: {
        provider: "paypal",
        eventType,
        paypalSubscriptionId: String(resource.id || "").trim() || null,
        billingCycle
      }
    });
  }

  async function processBillingEvent(event) {
    const prisma = prismaClient();
    if (!event?.type) return;
    if (event.provider === "paypal") {
      const paypalEvent = event.data?.object || {};
      await processPayPalBillingWebhookEvent(paypalEvent);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object || {};
      const businessId = session.metadata?.businessId;
      if (businessId) {
        await prisma.subscription.upsert({
          where: { businessId },
          update: {
            stripeCustomerId: session.customer?.toString() || null,
            stripeSubscription: session.subscription?.toString() || null,
            status: "active"
          },
          create: {
            businessId,
            stripeCustomerId: session.customer?.toString() || null,
            stripeSubscription: session.subscription?.toString() || null,
            status: "active",
            plan: "pro"
          }
        });
        clearReadCache();
        await writeAuditLog({
          actorRole: "system",
          action: "billing.subscription_activated",
          entityType: "subscription",
          entityId: businessId,
          metadata: { eventType: event.type }
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data?.object || {};
      await prisma.subscription.updateMany({
        where: { stripeSubscription: subscription.id },
        data: { status: "cancelled" }
      });
      clearReadCache();
      await writeAuditLog({
        actorRole: "system",
        action: "billing.subscription_cancelled",
        entityType: "subscription",
        entityId: subscription.id,
        metadata: { eventType: event.type }
      });
    }
  }

  return {
    processPayPalBillingWebhookEvent,
    processBillingEvent
  };
}
