export function createReminderDispatchService({
  getPrisma,
  reminderSettingsService,
  normalizeBookingDateTime,
  processBookingNotificationDelivery,
  intervalMs = 5 * 60 * 1000,
  dispatchWindowMs = 90 * 60 * 1000,
  maxLeadHours = 72
} = {}) {
  let timer = null;
  let running = false;

  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function runSweep() {
    const prisma = prismaClient();
    if (!prisma?.__isAvailable) return;
    if (running) return;
    running = true;
    try {
      const now = new Date();
      const startDate = now.toISOString().slice(0, 10);
      const endDateObj = new Date(now.getTime() + maxLeadHours * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
      const endDate = endDateObj.toISOString().slice(0, 10);
      const bookings = await prisma.booking.findMany({
        where: {
          status: "confirmed",
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        take: 500
      });
      const settingsCache = new Map();

      for (const booking of bookings) {
        const normalized = normalizeBookingDateTime(booking.date, booking.time);
        if (!normalized) continue;
        const startsAt = new Date(`${normalized.date}T${normalized.time}:00`);
        if (Number.isNaN(startsAt.getTime())) continue;
        if (startsAt.getTime() <= now.getTime()) continue;

        const businessId = String(booking.businessId || "").trim();
        if (!businessId) continue;
        if (!settingsCache.has(businessId)) {
          settingsCache.set(businessId, await reminderSettingsService.getReminderSettingsForBusiness(businessId));
        }
        const settings = settingsCache.get(businessId) || null;
        if (!settings || settings.liveRemindersEnabled === false || String(settings.channelPreference || "").toLowerCase() === "manual") {
          continue;
        }

        const leadHours = Number(settings.reminderLeadHours || 24);
        const dueAtMs = startsAt.getTime() - leadHours * 60 * 60 * 1000;
        if (now.getTime() < dueAtMs || now.getTime() - dueAtMs > dispatchWindowMs) continue;

        // Scheduled reminders are deduped from audit logs, so changing this marker also changes dispatch idempotency.
        const existing = await prisma.auditLog.findFirst({
          where: {
            action: "notification.delivery",
            entityId: booking.id,
            metadata: { contains: "scheduled_reminder" }
          },
          select: { id: true }
        });
        if (existing) continue;

        await processBookingNotificationDelivery({
          businessId,
          businessName: booking.businessName,
          booking,
          customerEmail: booking.customerEmail || "",
          customerPhone: booking.customerPhone || "",
          deliveryType: "scheduled_reminder"
        });
      }
    } catch (error) {
      console.error("Reminder dispatch sweep failed:", error?.message || error);
    } finally {
      running = false;
    }
  }

  function start() {
    if (timer) return;
    runSweep().catch(() => {});
    timer = setInterval(() => {
      runSweep().catch(() => {});
    }, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return {
    start,
    stop,
    runSweep
  };
}
