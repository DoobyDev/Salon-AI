export function createLiveRevenueAnalyticsService({
  getPrisma,
  bookingDateRegex,
  toCsvCell,
  adminPlanPriceMap = {},
  dailyRevenueTarget = 2000
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeLiveTimeframe(input) {
    const raw = String(input || "").trim().toLowerCase();
    if (raw === "7d" || raw === "7days" || raw === "week") return "7d";
    if (raw === "30d" || raw === "30days" || raw === "month") return "30d";
    return "today";
  }

  function buildAdminRevenueAnalyticsCsv(payload, generatedAtIso = new Date().toISOString()) {
    const summary = payload?.summary || {};
    const monthly = Array.isArray(payload?.monthly) ? payload.monthly : [];
    const lines = [
      "section,metric,value",
      `summary,generated_at,${toCsvCell(generatedAtIso)}`,
      `summary,active_subscriptions,${toCsvCell(summary.activeSubscriptions || 0)}`,
      `summary,estimated_mrr,${toCsvCell(summary.estimatedMrr || 0)}`,
      `summary,average_plan_value,${toCsvCell(summary.avgPlanValue || 0)}`,
      `summary,period_months,${toCsvCell(summary.periodMonths || 0)}`,
      `summary,estimated_revenue_in_period,${toCsvCell(summary.estimatedRevenueInPeriod || 0)}`,
      `summary,subscription_cancellations_in_period,${toCsvCell(summary.subscriptionCancellationsInPeriod || 0)}`,
      `summary,booking_cancellations_in_period,${toCsvCell(summary.bookingCancellationsInPeriod || 0)}`,
      "",
      "monthly,month_key,month_label,subscription_activations,subscription_cancellations,booking_cancellations,estimated_subscription_revenue"
    ];
    monthly.forEach((row) => {
      lines.push(
        [
          "monthly",
          toCsvCell(row.key || ""),
          toCsvCell(row.label || ""),
          toCsvCell(row.subscriptionActivations || 0),
          toCsvCell(row.subscriptionCancellations || 0),
          toCsvCell(row.bookingCancellations || 0),
          toCsvCell(row.estimatedSubscriptionRevenue || 0)
        ].join(",")
      );
    });
    return `${lines.join("\n")}\n`;
  }

  function buildBusinessAccountingBookingsCsv({ businessName = "", businessId = "", bookings = [] }, generatedAtIso = new Date().toISOString()) {
    const rows = Array.isArray(bookings) ? bookings : [];
    const totalBookings = rows.length;
    const cancelledBookings = rows.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
    const nonCancelledBookings = rows.filter((row) => String(row.status || "").toLowerCase() !== "cancelled").length;
    const grossRevenue = rows.reduce((sum, row) => sum + Number(row.price || 0), 0);
    const realizedRevenue = rows
      .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row.price || 0), 0);
    const lines = [
      "section,metric,value",
      `summary,generated_at,${toCsvCell(generatedAtIso)}`,
      `summary,business_id,${toCsvCell(businessId)}`,
      `summary,business_name,${toCsvCell(businessName)}`,
      `summary,total_bookings,${toCsvCell(totalBookings)}`,
      `summary,non_cancelled_bookings,${toCsvCell(nonCancelledBookings)}`,
      `summary,cancelled_bookings,${toCsvCell(cancelledBookings)}`,
      `summary,gross_revenue,${toCsvCell(Number(grossRevenue.toFixed(2)))}`,
      `summary,realized_revenue,${toCsvCell(Number(realizedRevenue.toFixed(2)))}`,
      "",
      "bookings,booking_id,date,time,status,service,price,customer_name,customer_email,customer_phone,source,created_at,updated_at"
    ];
    rows.forEach((row) => {
      lines.push(
        [
          "bookings",
          toCsvCell(row.id || ""),
          toCsvCell(row.date || ""),
          toCsvCell(row.time || ""),
          toCsvCell(row.status || ""),
          toCsvCell(row.service || ""),
          toCsvCell(Number(row.price || 0)),
          toCsvCell(row.customerName || ""),
          toCsvCell(row.customerEmail || ""),
          toCsvCell(row.customerPhone || ""),
          toCsvCell(row.source || ""),
          toCsvCell(row.createdAt ? new Date(row.createdAt).toISOString() : ""),
          toCsvCell(row.updatedAt ? new Date(row.updatedAt).toISOString() : "")
        ].join(",")
      );
    });
    return `${lines.join("\n")}\n`;
  }

  async function computeBusinessLiveRevenueSnapshot(businessId, timeframe = "today", options = {}) {
    const prisma = prismaClient();
    const safeTimeframe = normalizeLiveTimeframe(timeframe);
    const now = new Date();
    const nowIso = now.toISOString();
    const inputFrom = String(options?.from || "").trim();
    const inputTo = String(options?.to || "").trim();
    const customRangeRequested = bookingDateRegex.test(inputFrom) && bookingDateRegex.test(inputTo) && inputFrom <= inputTo;
    const daysInRange = customRangeRequested ? 0 : safeTimeframe === "30d" ? 30 : safeTimeframe === "7d" ? 7 : 1;
    const rangeStart = customRangeRequested
      ? new Date(`${inputFrom}T00:00:00Z`)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysInRange - 1));
    const rangeEnd = customRangeRequested ? new Date(`${inputTo}T23:59:59Z`) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const effectiveDaysInRange = customRangeRequested
      ? Math.max(1, Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : daysInRange;
    const rangeStartKey = rangeStart.toISOString().slice(0, 10);
    const rangeEndKey = rangeEnd.toISOString().slice(0, 10);
    const hourlyWindowStart = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const lastHourStart = new Date(now.getTime() - 60 * 60 * 1000);
    const lastFifteenMinStart = new Date(now.getTime() - 15 * 60 * 1000);
    const rangeTarget = Math.max(1, Number(dailyRevenueTarget) * effectiveDaysInRange);

    const [bookingsRange, bookingsHourly] = await Promise.all([
      prisma.booking.findMany({
        where: {
          businessId,
          date: {
            gte: rangeStartKey,
            lte: rangeEndKey
          }
        },
        select: {
          id: true,
          date: true,
          status: true,
          price: true,
          createdAt: true
        }
      }),
      prisma.booking.findMany({
        where: {
          businessId,
          createdAt: {
            gte: hourlyWindowStart
          }
        },
        select: {
          id: true,
          status: true,
          price: true,
          createdAt: true
        }
      })
    ]);

    const dailyMap = new Map();
    for (let i = 0; i < effectiveDaysInRange; i += 1) {
      const d = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, {
        date: key,
        label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
        revenue: 0,
        cancellations: 0,
        bookings: 0
      });
    }

    let periodRevenue = 0;
    let periodCancellationRevenue = 0;
    let periodBookings = 0;
    let periodCancellations = 0;

    bookingsRange.forEach((booking) => {
      const rowKey = String(booking.date || "");
      const slot = dailyMap.get(rowKey);
      if (!slot) return;
      const price = Number(booking.price || 0);
      const isCancelled = String(booking.status || "").toLowerCase() === "cancelled";
      slot.bookings += 1;
      periodBookings += 1;
      if (isCancelled) {
        slot.cancellations += 1;
        periodCancellations += 1;
        periodCancellationRevenue += price;
        return;
      }
      slot.revenue += price;
      periodRevenue += price;
    });

    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 5, 0, 0, 0);
    const hourlyBuckets = [];
    const hourlyLookup = new Map();
    for (let i = 0; i < 6; i += 1) {
      const t = new Date(hourStart.getTime() + i * 60 * 60 * 1000);
      const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} ${String(
        t.getHours()
      ).padStart(2, "0")}:00`;
      const row = {
        key,
        label: t.toLocaleTimeString("en-US", { hour: "numeric" }),
        revenue: 0,
        cancellations: 0,
        bookings: 0
      };
      hourlyBuckets.push(row);
      hourlyLookup.set(key, row);
    }

    let lastHourRevenue = 0;
    let last15MinRevenue = 0;
    let lastHourBookings = 0;

    bookingsHourly.forEach((booking) => {
      const createdAt = new Date(booking.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(
        createdAt.getDate()
      ).padStart(2, "0")} ${String(createdAt.getHours()).padStart(2, "0")}:00`;
      const slot = hourlyLookup.get(key);
      const price = Number(booking.price || 0);
      const isCancelled = String(booking.status || "").toLowerCase() === "cancelled";
      if (slot) {
        slot.bookings += 1;
        if (isCancelled) {
          slot.cancellations += 1;
        } else {
          slot.revenue += price;
        }
      }
      if (!isCancelled && createdAt >= lastHourStart) {
        lastHourRevenue += price;
        lastHourBookings += 1;
      }
      if (!isCancelled && createdAt >= lastFifteenMinStart) {
        last15MinRevenue += price;
      }
    });

    const dailyRows = Array.from(dailyMap.values()).map((row) => ({
      ...row,
      revenue: Number(row.revenue.toFixed(2))
    }));
    let flowRows = [];
    if (safeTimeframe === "today") {
      flowRows = hourlyBuckets.map((row) => ({
        ...row,
        revenue: Number(row.revenue.toFixed(2))
      }));
    } else if (safeTimeframe === "7d" && !customRangeRequested) {
      flowRows = dailyRows;
    } else {
      const groupSize = 3;
      for (let i = 0; i < dailyRows.length; i += groupSize) {
        const chunk = dailyRows.slice(i, i + groupSize);
        const start = chunk[0];
        const end = chunk[chunk.length - 1];
        flowRows.push({
          key: `${start.date}_${end.date}`,
          label: `${start.label}-${end.label.split(" ").slice(-1)[0]}`,
          revenue: Number(chunk.reduce((sum, row) => sum + Number(row.revenue || 0), 0).toFixed(2)),
          cancellations: chunk.reduce((sum, row) => sum + Number(row.cancellations || 0), 0),
          bookings: chunk.reduce((sum, row) => sum + Number(row.bookings || 0), 0)
        });
      }
    }

    const cancellationRate = periodBookings > 0 ? (periodCancellations / periodBookings) * 100 : 0;
    const targetProgress = rangeTarget > 0 ? (periodRevenue / rangeTarget) * 100 : 0;

    return {
      mode: "business",
      timeframe: customRangeRequested ? "custom" : safeTimeframe,
      range: {
        from: rangeStartKey,
        to: rangeEndKey
      },
      generatedAt: nowIso,
      refreshIntervalSec: 15,
      cards: {
        todayRevenue: Number(periodRevenue.toFixed(2)),
        todayCancelledRevenue: Number(periodCancellationRevenue.toFixed(2)),
        todayBookings: periodBookings,
        todayCancellations: periodCancellations,
        lastHourRevenue: Number(lastHourRevenue.toFixed(2)),
        last15MinRevenue: Number(last15MinRevenue.toFixed(2)),
        lastHourBookings
      },
      gauges: {
        dailyTarget: Number(rangeTarget.toFixed(2)),
        targetProgressPct: Number(Math.min(999, Math.max(0, targetProgress)).toFixed(1)),
        cancellationRatePct: Number(Math.max(0, cancellationRate).toFixed(1))
      },
      stream: {
        hourly: flowRows,
        weekly: dailyRows
      }
    };
  }

  async function computePlatformLiveRevenueSnapshot(timeframe = "today", options = {}) {
    const safeTimeframe = normalizeLiveTimeframe(timeframe);
    const inputFrom = String(options?.from || "").trim();
    const inputTo = String(options?.to || "").trim();
    const customRangeRequested = bookingDateRegex.test(inputFrom) && bookingDateRegex.test(inputTo) && inputFrom <= inputTo;
    let monthCount = safeTimeframe === "30d" ? 6 : safeTimeframe === "7d" ? 3 : 1;
    if (customRangeRequested) {
      const fromDate = new Date(`${inputFrom}T00:00:00Z`);
      const toDate = new Date(`${inputTo}T23:59:59Z`);
      const months =
        (toDate.getUTCFullYear() - fromDate.getUTCFullYear()) * 12 +
        (toDate.getUTCMonth() - fromDate.getUTCMonth()) +
        1;
      monthCount = Math.max(1, Math.min(24, months));
    }
    const payload = await computeAdminRevenueAnalytics(monthCount);
    const monthly = Array.isArray(payload?.monthly) ? payload.monthly : [];
    const summary = payload?.summary || {};
    const nowIso = new Date().toISOString();
    const latest = monthly.length ? monthly[monthly.length - 1] : null;
    const previous = monthly.length > 1 ? monthly[monthly.length - 2] : null;
    const estimatedMrr = Number(summary.estimatedMrr || 0);
    const mrrGoal = Math.max(1, Number((estimatedMrr * 1.12).toFixed(2)));
    const subCancellationRate = Number(summary.activeSubscriptions || 0)
      ? (Number(summary.subscriptionCancellationsInPeriod || 0) / Number(summary.activeSubscriptions || 1)) * 100
      : 0;

    return {
      mode: "platform",
      timeframe: customRangeRequested ? "custom" : safeTimeframe,
      range: customRangeRequested ? { from: inputFrom, to: inputTo } : null,
      generatedAt: nowIso,
      refreshIntervalSec: 15,
      cards: {
        todayRevenue: Number(estimatedMrr.toFixed(2)),
        todayCancelledRevenue: Number(summary.estimatedRevenueInPeriod || 0),
        todayBookings: Number(summary.subscriptionCancellationsInPeriod || 0),
        todayCancellations: Number(summary.bookingCancellationsInPeriod || 0),
        lastHourRevenue: Number(latest?.estimatedSubscriptionRevenue || 0),
        last15MinRevenue: Number(previous?.estimatedSubscriptionRevenue || 0),
        lastHourBookings: Number(latest?.subscriptionActivations || 0)
      },
      gauges: {
        dailyTarget: Number(mrrGoal.toFixed(2)),
        targetProgressPct: Number(((estimatedMrr / mrrGoal) * 100).toFixed(1)),
        cancellationRatePct: Number(Math.max(0, subCancellationRate).toFixed(1))
      },
      stream: {
        hourly: monthly.map((row) => ({
          key: row.key,
          label: row.label,
          revenue: Number(row.estimatedSubscriptionRevenue || 0),
          cancellations: Number((row.subscriptionCancellations || 0) + (row.bookingCancellations || 0))
        })),
        weekly: []
      }
    };
  }

  async function computeAdminRevenueAnalytics(monthCount = 6) {
    const prisma = prismaClient();
    const safeMonthCount = Math.max(1, Math.min(24, Number(monthCount) || 6));
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const rangeStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - (safeMonthCount - 1), 1);
    const subscriptions = await prisma.subscription.findMany({
      select: { plan: true, status: true, createdAt: true }
    });
    const datedSubscriptions = subscriptions
      .map((row) => ({ ...row, createdAt: row?.createdAt ? new Date(row.createdAt) : null }))
      .filter((row) => row.createdAt instanceof Date && !Number.isNaN(row.createdAt.getTime()));
    const earliestSubscription = datedSubscriptions.length
      ? datedSubscriptions.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
      : null;
    const firstSubscriptionDate = earliestSubscription
      ? new Date(
          earliestSubscription.createdAt.getFullYear(),
          earliestSubscription.createdAt.getMonth(),
          earliestSubscription.createdAt.getDate(),
          0,
          0,
          0,
          0
        )
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const monthKeys = [];
    const monthLabels = [];
    for (let i = 0; i < safeMonthCount; i += 1) {
      const slot = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1);
      const key = `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, "0")}`;
      monthKeys.push(key);
      monthLabels.push(slot.toLocaleString("en-US", { month: "short", year: "numeric" }));
    }

    const [auditRows, cancelledBookings] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          action: {
            in: ["billing.subscription_activated", "billing.subscription_cancelled"]
          },
          createdAt: { gte: firstSubscriptionDate }
        },
        select: { action: true, createdAt: true }
      }),
      prisma.booking.findMany({
        where: {
          status: "cancelled",
          updatedAt: { gte: rangeStart }
        },
        select: { updatedAt: true }
      })
    ]);

    const monthly = monthKeys.map((key, index) => ({
      key,
      label: monthLabels[index],
      subscriptionActivations: 0,
      subscriptionCancellations: 0,
      bookingCancellations: 0,
      estimatedSubscriptionRevenue: 0
    }));
    const monthLookup = Object.fromEntries(monthly.map((entry) => [entry.key, entry]));

    auditRows.forEach((row) => {
      const dt = new Date(row.createdAt);
      if (Number.isNaN(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const slot = monthLookup[key];
      if (!slot) return;
      if (row.action === "billing.subscription_activated") slot.subscriptionActivations += 1;
      if (row.action === "billing.subscription_cancelled") slot.subscriptionCancellations += 1;
    });

    cancelledBookings.forEach((row) => {
      const dt = new Date(row.updatedAt);
      if (Number.isNaN(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const slot = monthLookup[key];
      if (!slot) return;
      slot.bookingCancellations += 1;
    });

    const activeSubscriptions = subscriptions.filter((row) => String(row.status || "").toLowerCase() === "active");
    const estimatedMrr = activeSubscriptions.reduce((sum, row) => {
      const planKey = String(row.plan || "starter").trim().toLowerCase();
      return sum + Number(adminPlanPriceMap[planKey] || adminPlanPriceMap.starter);
    }, 0);
    const activeCount = activeSubscriptions.length;
    const avgPlanValue = activeCount > 0 ? estimatedMrr / activeCount : adminPlanPriceMap.starter;

    const daily = [];
    const dayLookup = new Map();
    const dailyCursor = new Date(firstSubscriptionDate.getFullYear(), firstSubscriptionDate.getMonth(), firstSubscriptionDate.getDate(), 0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    while (dailyCursor <= today) {
      const key = `${dailyCursor.getFullYear()}-${String(dailyCursor.getMonth() + 1).padStart(2, "0")}-${String(dailyCursor.getDate()).padStart(2, "0")}`;
      const row = {
        key,
        date: key,
        label: dailyCursor.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        subscriptionActivations: 0,
        subscriptionCancellations: 0,
        activeSubscriptions: 0,
        estimatedMrr: 0
      };
      daily.push(row);
      dayLookup.set(key, row);
      dailyCursor.setDate(dailyCursor.getDate() + 1);
    }

    const netDeltaAcrossRange = monthly.reduce(
      (sum, row) => sum + row.subscriptionActivations - row.subscriptionCancellations,
      0
    );
    let estimatedActiveInMonth = Math.max(0, activeCount - netDeltaAcrossRange);
    monthly.forEach((row) => {
      estimatedActiveInMonth = Math.max(
        0,
        estimatedActiveInMonth + row.subscriptionActivations - row.subscriptionCancellations
      );
      row.estimatedSubscriptionRevenue = Number((estimatedActiveInMonth * avgPlanValue).toFixed(2));
    });

    auditRows.forEach((row) => {
      const dt = new Date(row.createdAt);
      if (Number.isNaN(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const slot = dayLookup.get(key);
      if (!slot) return;
      if (row.action === "billing.subscription_activated") slot.subscriptionActivations += 1;
      if (row.action === "billing.subscription_cancelled") slot.subscriptionCancellations += 1;
    });

    const netDeltaAcrossDays = daily.reduce(
      (sum, row) => sum + row.subscriptionActivations - row.subscriptionCancellations,
      0
    );
    let estimatedActiveInDay = Math.max(0, activeCount - netDeltaAcrossDays);
    daily.forEach((row) => {
      estimatedActiveInDay = Math.max(
        0,
        estimatedActiveInDay + row.subscriptionActivations - row.subscriptionCancellations
      );
      row.activeSubscriptions = estimatedActiveInDay;
      row.estimatedMrr = Number((estimatedActiveInDay * avgPlanValue).toFixed(2));
    });

    return {
      summary: {
        activeSubscriptions: activeCount,
        estimatedMrr: Number(estimatedMrr.toFixed(2)),
        avgPlanValue: Number(avgPlanValue.toFixed(2)),
        periodMonths: safeMonthCount,
        estimatedRevenueInPeriod: Number(monthly.reduce((sum, row) => sum + Number(row.estimatedSubscriptionRevenue || 0), 0).toFixed(2)),
        firstSubscriptionDate: firstSubscriptionDate.toISOString(),
        subscriptionCancellationsInPeriod: monthly.reduce((sum, row) => sum + Number(row.subscriptionCancellations || 0), 0),
        bookingCancellationsInPeriod: monthly.reduce((sum, row) => sum + Number(row.bookingCancellations || 0), 0)
      },
      monthly,
      dailyMrrSeries: daily,
      note: "Estimated subscription revenue uses subscription status and plan-value mapping."
    };
  }

  return {
    normalizeLiveTimeframe,
    buildAdminRevenueAnalyticsCsv,
    buildBusinessAccountingBookingsCsv,
    computeBusinessLiveRevenueSnapshot,
    computePlatformLiveRevenueSnapshot,
    computeAdminRevenueAnalytics
  };
}
