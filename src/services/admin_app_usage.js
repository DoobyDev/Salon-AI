export function createAdminAppUsageService({
  getPrisma
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function computeAdminAppUsageAnalytics(dayCount = 14) {
    const prisma = prismaClient();
    const safeDayCount = Math.max(3, Math.min(60, Number(dayCount) || 14));
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (safeDayCount - 1));
    const auditRows = await prisma.auditLog.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { action: true, actorRole: true, createdAt: true }
    });

    const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      total: 0,
      loginCount: 0,
      bookingCount: 0,
      lexiCount: 0
    }));
    const weekdayBuckets = [
      { key: 1, label: "Mon", total: 0 },
      { key: 2, label: "Tue", total: 0 },
      { key: 3, label: "Wed", total: 0 },
      { key: 4, label: "Thu", total: 0 },
      { key: 5, label: "Fri", total: 0 },
      { key: 6, label: "Sat", total: 0 },
      { key: 0, label: "Sun", total: 0 }
    ];
    const roleCounts = {
      admin: 0,
      subscriber: 0,
      customer: 0,
      anonymous: 0
    };

    auditRows.forEach((row) => {
      const createdAt = new Date(row.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const action = String(row.action || "").trim().toLowerCase();
      const actorRole = String(row.actorRole || "anonymous").trim().toLowerCase() || "anonymous";
      const hourBucket = hourBuckets[createdAt.getHours()];
      const weekdayBucket = weekdayBuckets.find((entry) => entry.key === createdAt.getDay());
      if (hourBucket) {
        hourBucket.total += 1;
        if (action === "auth.login_success") hourBucket.loginCount += 1;
        if (action.startsWith("booking.")) hourBucket.bookingCount += 1;
        if (action.includes("copilot_query")) hourBucket.lexiCount += 1;
      }
      if (weekdayBucket) weekdayBucket.total += 1;
      if (roleCounts[actorRole] !== undefined) roleCounts[actorRole] += 1;
      else roleCounts.anonymous += 1;
    });

    const sortedByUsage = hourBuckets.slice().sort((a, b) => a.total - b.total || a.hour - b.hour);
    const quietest = sortedByUsage[0] || hourBuckets[0];
    const busiest = hourBuckets.slice().sort((a, b) => b.total - a.total || a.hour - b.hour)[0] || hourBuckets[0];

    const consecutiveWindows = [];
    for (let startHour = 0; startHour < 24; startHour += 1) {
      const span = [0, 1, 2].map((offset) => hourBuckets[(startHour + offset) % 24]);
      const total = span.reduce((sum, row) => sum + Number(row?.total || 0), 0);
      consecutiveWindows.push({
        startHour,
        total,
        label: `${String(startHour).padStart(2, "0")}:00-${String((startHour + 3) % 24).padStart(2, "0")}:00`
      });
    }
    consecutiveWindows.sort((a, b) => a.total - b.total || a.startHour - b.startHour);
    const bestWindow = consecutiveWindows[0] || { label: "00:00-03:00", total: 0 };

    return {
      summary: {
        periodDays: safeDayCount,
        totalEvents: auditRows.length,
        busiestHourLabel: busiest?.label || "00:00",
        busiestHourEvents: Number(busiest?.total || 0),
        quietestHourLabel: quietest?.label || "00:00",
        quietestHourEvents: Number(quietest?.total || 0),
        bestUpdateWindowLabel: bestWindow.label,
        bestUpdateWindowEvents: Number(bestWindow.total || 0),
        roleCounts
      },
      hourly: hourBuckets,
      weekdays: weekdayBuckets
    };
  }

  return {
    computeAdminAppUsageAnalytics
  };
}
