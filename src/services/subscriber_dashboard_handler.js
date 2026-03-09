export function createSubscriberDashboardHandler({
  prisma,
  resolveManagedBusinessId,
  normalizeBookingDateTime,
  getNotificationProviderStatus,
  reminderSettingsService
} = {}) {
  function parseAuditMetadata(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

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

    const recommendedActions = [];
    if (lateCancellations.length > 0) {
      recommendedActions.push({
        id: "fill-cancellations",
        label: "Fill cancellation gaps",
        detail: `${lateCancellations.length} last-minute cancellation${lateCancellations.length === 1 ? "" : "s"} today.`
      });
    }
    if (todayConfirmed.length < 3) {
      recommendedActions.push({
        id: "boost-today-demand",
        label: "Boost today's demand",
        detail: "Low confirmed bookings today. Send a same-day offer to recent clients."
      });
    }
    if (noShowRate >= 10) {
      recommendedActions.push({
        id: "tighten-confirmations",
        label: "Tighten confirmations",
        detail: `No-show/cancelled rate is ${noShowRate}%. Enable reminder cadence and deposit prompts.`
      });
    }
    if (!recommendedActions.length) {
      recommendedActions.push({
        id: "maintain-momentum",
        label: "Maintain momentum",
        detail: "Today looks healthy. Focus on upsells and rebooking at checkout."
      });
    }

    const nowMs = now.getTime();
    const customerKeyFor = (booking) => {
      const email = String(booking.customerEmail || "").trim().toLowerCase();
      const phone = String(booking.customerPhone || "").trim();
      if (email) return `email:${email}`;
      if (phone) return `phone:${phone}`;
      return `name:${String(booking.customerName || "guest").trim().toLowerCase()}`;
    };

    const noShowRisk = normalized
      .filter((booking) => booking.status === "confirmed" && booking.startsAt.getTime() > nowMs)
      .map((booking) => {
        const history = normalized.filter(
          (candidate) =>
            customerKeyFor(candidate) === customerKeyFor(booking) && candidate.startsAt.getTime() < booking.startsAt.getTime()
        );
        const historyCount = history.length;
        const cancelledCount = history.filter((candidate) => candidate.status === "cancelled").length;
        const cancellationRate = historyCount ? cancelledCount / historyCount : 0;
        const leadHours = (booking.startsAt.getTime() - nowMs) / (1000 * 60 * 60);

        let score = 5;
        const reasons = [];
        if (leadHours <= 6) {
          score += 35;
          reasons.push("Very short lead time.");
        } else if (leadHours <= 24) {
          score += 22;
          reasons.push("Booking is within 24 hours.");
        } else if (leadHours <= 48) {
          score += 12;
          reasons.push("Booking is within 48 hours.");
        }
        if (cancellationRate >= 0.5) {
          score += 35;
          reasons.push("High previous cancellation rate.");
        } else if (cancellationRate >= 0.25) {
          score += 22;
          reasons.push("Moderate previous cancellation rate.");
        } else if (cancellationRate >= 0.1) {
          score += 10;
          reasons.push("Some previous cancellations.");
        }
        const price = Number(booking.price || 0);
        if (price >= 100) {
          score += 5;
          reasons.push("High-value appointment.");
        }

        const riskScore = Math.min(99, Math.max(0, Math.round(score)));
        const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
        return {
          bookingId: booking.id,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone || "",
          customerEmail: booking.customerEmail || "",
          service: booking.service,
          date: booking.normalizedDate,
          time: booking.time,
          riskScore,
          riskLevel,
          reasons
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const groupedByCustomer = new Map();
    normalized.forEach((booking) => {
      const key = customerKeyFor(booking);
      const current = groupedByCustomer.get(key) || [];
      current.push(booking);
      groupedByCustomer.set(key, current);
    });

    const rebookingPrompts = [];
    groupedByCustomer.forEach((entries, customerKey) => {
      const nonCancelledPast = entries.filter((row) => row.status !== "cancelled" && row.startsAt.getTime() < nowMs);
      if (!nonCancelledPast.length) return;
      const hasFutureConfirmed = entries.some((row) => row.status === "confirmed" && row.startsAt.getTime() > nowMs);
      if (hasFutureConfirmed) return;

      nonCancelledPast.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
      const lastVisit = nonCancelledPast[0];
      const daysSince = Math.floor((nowMs - lastVisit.startsAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 28) return;
      const customerName = String(lastVisit.customerName || "Client").trim();
      const serviceName = String(lastVisit.service || "a service").trim();
      rebookingPrompts.push({
        customerKey,
        customerName,
        customerPhone: lastVisit.customerPhone || "",
        customerEmail: lastVisit.customerEmail || "",
        lastService: serviceName,
        daysSinceLastVisit: daysSince,
        suggestedMessage: `Hi ${customerName}, it has been ${daysSince} days since your ${serviceName}. We have new availability this week and would love to book your next visit.`
      });
    });
    rebookingPrompts.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);

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

    const deliveryLogs = communicationLogs.filter((row) => row.action === "notification.delivery");
    const confirmationDeliveries = deliveryLogs.filter((row) => parseAuditMetadata(row.metadata).deliveryType === "booking_confirmation");
    const scheduledReminderDeliveries = deliveryLogs.filter((row) => parseAuditMetadata(row.metadata).deliveryType === "scheduled_reminder");
    const communicationSummary = {
      remindersLogged: communicationLogs.filter((row) => row.action === "booking.reminder_marked").length,
      confirmationsLogged: communicationLogs.filter((row) => row.action === "booking.confirmation_marked").length,
      rebookingLogged: communicationLogs.filter((row) => row.action === "rebooking.prompt_sent").length,
      notificationsSent: deliveryLogs.filter((row) => parseAuditMetadata(row.metadata).outcome === "sent").length,
      notificationsFailed: deliveryLogs.filter((row) => parseAuditMetadata(row.metadata).outcome === "failed").length,
      confirmationNotificationsSent: confirmationDeliveries.filter((row) => parseAuditMetadata(row.metadata).outcome === "sent").length,
      scheduledReminderNotificationsSent: scheduledReminderDeliveries.filter((row) => parseAuditMetadata(row.metadata).outcome === "sent").length,
      scheduledReminderNotificationsFailed: scheduledReminderDeliveries.filter((row) => parseAuditMetadata(row.metadata).outcome === "failed").length
    };
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
    const communicationIssues = [];
    const communicationNextSteps = [];
    let readinessStatus = "ready";
    let readinessLabel = "Ready to send";
    let readinessSummary = "Communication setup looks workable for current bookings.";

    if (settings && !settings.liveRemindersEnabled) {
      readinessStatus = "manual";
      readinessLabel = "Manual follow-up only";
      readinessSummary = "Live reminders are currently switched off for this salon.";
      communicationIssues.push("The team has live reminders turned off, so diary follow-up depends on manual action.");
      communicationNextSteps.push("Turn live reminders back on if you want automatic SMS or email follow-up.");
    } else if (!providerStatus.smsConfigured && !providerStatus.emailConfigured) {
      readinessStatus = "setup";
      readinessLabel = "Setup incomplete";
      readinessSummary = "Live SMS and email providers are not configured yet.";
      communicationIssues.push("This salon cannot send live booking notifications until at least one channel is configured.");
      communicationNextSteps.push("Connect SMS or email delivery before relying on automated reminders.");
    } else if (missingContactUpcoming >= 3 || (futureConfirmedBookings.length && contactCoveragePct < 70)) {
      readinessStatus = "contacts";
      readinessLabel = "Contact details need work";
      readinessSummary = "Too many upcoming bookings do not have a phone number or email saved.";
      communicationIssues.push("A noticeable share of upcoming bookings cannot be reached automatically.");
      communicationNextSteps.push("Capture a phone number or email during booking so reminders have somewhere to go.");
    } else if (communicationSummary.notificationsFailed >= Math.max(2, communicationSummary.notificationsSent)) {
      readinessStatus = "risk";
      readinessLabel = "Delivery risk";
      readinessSummary = "Recent notification failures are outweighing successful sends.";
      communicationIssues.push("Live reminders are trying to send, but too many recent attempts are failing.");
      communicationNextSteps.push("Review provider setup and invalid contact details before busy days are affected.");
    } else if (futureConfirmedBookings.length >= 3 && communicationSummary.notificationsSent === 0) {
      readinessStatus = "quiet";
      readinessLabel = "Reminder flow looks quiet";
      readinessSummary = "Upcoming bookings are in the diary, but no recent live reminder sends are showing.";
      communicationIssues.push("The team may be relying on manual follow-up or reminders are not running yet.");
      communicationNextSteps.push("Check that reminder sending is enabled and being used for upcoming bookings.");
    } else {
      communicationIssues.push("At least one live delivery channel is available and recent activity does not show a major warning.");
      communicationNextSteps.push("Keep customer phone and email details complete so reminders stay reliable.");
    }

    if (providerStatus.smsConfigured && !providerStatus.emailConfigured) {
      communicationIssues.push("SMS is ready, but email delivery is not configured.");
    } else if (!providerStatus.smsConfigured && providerStatus.emailConfigured) {
      communicationIssues.push("Email is ready, but SMS delivery is not configured.");
    }

    if (!communicationNextSteps.length) {
      communicationNextSteps.push("Use the recovery and messaging areas to keep follow-up activity visible to the team.");
    }

    const reminderLeadHours = Number(settings?.reminderLeadHours || 24);
    const remindersDueSoon = futureConfirmedBookings
      .map((booking) => {
        const dueAtMs = booking.startsAt.getTime() - reminderLeadHours * 60 * 60 * 1000;
        const msUntilDue = dueAtMs - nowMs;
        const reachable = Boolean(String(booking.customerPhone || "").trim() || String(booking.customerEmail || "").trim());
        return {
          bookingId: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail || "",
          customerPhone: booking.customerPhone || "",
          service: booking.service,
          date: booking.normalizedDate,
          time: booking.time,
          dueAt: new Date(dueAtMs).toISOString(),
          hoursUntilDue: Number((msUntilDue / (1000 * 60 * 60)).toFixed(1)),
          reachable,
          hasPhone: Boolean(String(booking.customerPhone || "").trim()),
          hasEmail: Boolean(String(booking.customerEmail || "").trim())
        };
      })
      .filter((row) => row.hoursUntilDue >= -1 && row.hoursUntilDue <= 24)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, 8);

    const recentCommunications = communicationLogs.map((row) => ({
      action: row.action,
      createdAt: row.createdAt,
      metadata: parseAuditMetadata(row.metadata)
    }));

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
          status: readinessStatus,
          label: readinessLabel,
          summary: readinessSummary,
          settings,
          upcomingBookings: futureConfirmedBookings.length,
          reachableUpcoming: reachableUpcoming.length,
          missingContactUpcoming,
          contactCoveragePct,
          smsReachableUpcoming,
          emailReachableUpcoming,
          availableChannels: Array.isArray(providerStatus.availableChannels) ? providerStatus.availableChannels : [],
          issues: communicationIssues.slice(0, 3),
          nextSteps: communicationNextSteps.slice(0, 3)
        },
        dueSoon: remindersDueSoon
      }
    });
  };
}
