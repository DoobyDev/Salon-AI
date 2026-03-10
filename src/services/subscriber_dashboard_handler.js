import {
  buildSubscriberCommunicationSummary,
  buildSubscriberRecentCommunications
} from "./subscriber_communication_summary.js";
import {
  computeSubscriberRemindersDueSoon,
  evaluateSubscriberCommunicationReadiness
} from "./subscriber_communication_readiness.js";
import {
  buildSubscriberNoShowRisk,
  buildSubscriberRebookingPrompts
} from "./subscriber_operations_insights.js";
import { buildSubscriberRecommendedActions } from "./subscriber_command_center.js";

export function createSubscriberDashboardHandler({
  prisma,
  resolveManagedBusinessId,
  normalizeBookingDateTime,
  getNotificationProviderStatus,
  reminderSettingsService
} = {}) {
  return async function subscriberDashboardHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const bookings = await prisma.booking.findMany({ where: { businessId } });
    const revenue = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const next7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const lookbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const normalized = bookings
      .map((booking) => {
        const dateTime = normalizeBookingDateTime(booking.date, booking.time);
        if (!dateTime) return null;
        const startsAt = new Date(`${dateTime.date}T${dateTime.time}:00`);
        if (Number.isNaN(startsAt.getTime())) return null;
        return {
          ...booking,
          normalizedDate: dateTime.date,
          startsAt
        };
      })
      .filter(Boolean);

    const todayBookings = normalized.filter((booking) => booking.normalizedDate === today);
    const todayConfirmed = todayBookings.filter((booking) => booking.status === "confirmed");
    const lateCancellations = normalized.filter((booking) => {
      if (booking.status !== "cancelled") return false;
      return booking.startsAt >= todayStart && booking.startsAt < tomorrowStart;
    });

    const next7Confirmed = normalized.filter((booking) => {
      if (booking.status !== "confirmed") return false;
      return booking.startsAt >= todayStart && booking.startsAt < next7Days;
    });

    const noShowRate = bookings.length
      ? Number(((bookings.filter((booking) => booking.status === "cancelled").length / bookings.length) * 100).toFixed(1))
      : 0;

    const recommendedActions = buildSubscriberRecommendedActions({
      lateCancellations,
      todayConfirmed,
      noShowRate
    });

    const nowMs = now.getTime();
    const noShowRisk = buildSubscriberNoShowRisk(normalized, nowMs);
    const rebookingPrompts = buildSubscriberRebookingPrompts(normalized, nowMs);

    const [aiConversations, communicationLogs] = await Promise.all([
      prisma.auditLog.count({
        where: {
          entityType: "chat",
          actorRole: "anonymous",
          metadata: { contains: businessId }
        }
      }),
      prisma.auditLog.findMany({
        where: {
          createdAt: { gte: lookbackStart },
          action: { in: ["booking.reminder_marked", "booking.confirmation_marked", "rebooking.prompt_sent", "notification.delivery"] },
          metadata: { contains: businessId }
        },
        orderBy: [{ createdAt: "desc" }],
        take: 12
      })
    ]);

    const communicationSummary = buildSubscriberCommunicationSummary(communicationLogs);
    const providerStatus = typeof getNotificationProviderStatus === "function" ? getNotificationProviderStatus() : {};
    const settings = reminderSettingsService ? await reminderSettingsService.getReminderSettingsForBusiness(businessId) : null;
    const futureConfirmedBookings = normalized.filter((booking) => booking.status === "confirmed" && booking.startsAt.getTime() > nowMs);
    const reachableUpcoming = futureConfirmedBookings.filter(
      (booking) => String(booking.customerPhone || "").trim() || String(booking.customerEmail || "").trim()
    );
    const smsReachableUpcoming = futureConfirmedBookings.filter((booking) => String(booking.customerPhone || "").trim()).length;
    const emailReachableUpcoming = futureConfirmedBookings.filter((booking) => String(booking.customerEmail || "").trim()).length;
    const missingContactUpcoming = Math.max(0, futureConfirmedBookings.length - reachableUpcoming.length);
    const contactCoveragePct = futureConfirmedBookings.length
      ? Number(((reachableUpcoming.length / futureConfirmedBookings.length) * 100).toFixed(0))
      : 100;
    const readiness = evaluateSubscriberCommunicationReadiness({
      settings,
      providerStatus,
      communicationSummary,
      futureConfirmedBookings,
      reachableUpcoming,
      missingContactUpcoming,
      contactCoveragePct
    });

    const reminderLeadHours = Number(settings?.reminderLeadHours || 24);
    const remindersDueSoon = computeSubscriberRemindersDueSoon({
      futureConfirmedBookings,
      reminderLeadHours,
      nowMs
    });

    const recentCommunications = buildSubscriberRecentCommunications(communicationLogs);

    return res.json({
      analytics: {
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
        cancellationCount: bookings.filter((booking) => booking.status === "cancelled").length,
        estimatedRevenue: revenue,
        aiConversations
      },
      commandCenter: {
        today: {
          totalBookings: todayBookings.length,
          confirmedBookings: todayConfirmed.length,
          estimatedRevenue: Number(todayConfirmed.reduce((sum, booking) => sum + Number(booking.price || 0), 0).toFixed(2)),
          lastMinuteCancellations: lateCancellations.length
        },
        next7Days: {
          confirmedBookings: next7Confirmed.length,
          estimatedRevenue: Number(next7Confirmed.reduce((sum, booking) => sum + Number(booking.price || 0), 0).toFixed(2))
        },
        serviceHealth: {
          cancellationRate: noShowRate
        },
        recommendedActions
      },
      operationsInsights: {
        noShowRisk,
        rebookingPrompts: rebookingPrompts.slice(0, 10),
        summary: {
          highRiskCount: noShowRisk.filter((row) => row.riskLevel === "high").length,
          rebookingCandidates: rebookingPrompts.length
        }
      },
      communications: {
        summary: communicationSummary,
        recent: recentCommunications,
        readiness: {
          status: readiness.status,
          label: readiness.label,
          summary: readiness.summary,
          settings,
          upcomingBookings: readiness.upcomingBookings,
          reachableUpcoming: readiness.reachableUpcoming,
          missingContactUpcoming: readiness.missingContactUpcoming,
          contactCoveragePct: readiness.contactCoveragePct,
          smsReachableUpcoming,
          emailReachableUpcoming,
          availableChannels: readiness.availableChannels,
          issues: readiness.issues,
          nextSteps: readiness.nextSteps
        },
        dueSoon: remindersDueSoon
      }
    });
  };
}
