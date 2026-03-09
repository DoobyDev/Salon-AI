export function createAccountingLiveRevenueHandlers({
  bookingDateRegex,
  liveRevenueAnalyticsService,
  resolveManagedBusinessId,
  prisma
} = {}) {
  async function liveRevenueHandler(req, res) {
    const timeframe = liveRevenueAnalyticsService.normalizeLiveTimeframe(req.query?.timeframe);
    const from = String(req.query?.from || "").trim();
    const to = String(req.query?.to || "").trim();
    if ((from && !bookingDateRegex.test(from)) || (to && !bookingDateRegex.test(to))) {
      return res.status(400).json({ error: "Invalid date filter. Use YYYY-MM-DD." });
    }
    if (from && to) {
      if (from > to) return res.status(400).json({ error: "Invalid date range. 'from' must be before 'to'." });
      const fromDate = new Date(`${from}T00:00:00Z`);
      const toDate = new Date(`${to}T23:59:59Z`);
      const diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (!Number.isFinite(diffDays) || diffDays <= 0 || diffDays > 366) {
        return res.status(400).json({ error: "Date range must be between 1 and 366 days." });
      }
    }

    const scope = String(req.query?.scope || "business").trim().toLowerCase();
    if (scope === "platform") {
      if (req.auth?.role !== "admin") {
        return res.status(403).json({ error: "Platform live revenue is restricted to admin." });
      }
      const platformPayload = await liveRevenueAnalyticsService.computePlatformLiveRevenueSnapshot(timeframe, { from, to });
      return res.json(platformPayload);
    }

    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const payload = await liveRevenueAnalyticsService.computeBusinessLiveRevenueSnapshot(businessId, timeframe, { from, to });
    return res.json(payload);
  }

  async function accountingExportHandler(req, res) {
    const format = String(req.query?.format || "csv").trim().toLowerCase();
    if (format !== "csv") {
      return res.status(400).json({ error: "Only csv export format is currently supported." });
    }

    const scope = String(req.query?.scope || "business").trim().toLowerCase();
    const generatedAt = new Date().toISOString();

    if (scope === "platform") {
      if (req.auth?.role !== "admin") {
        return res.status(403).json({ error: "Platform export is restricted to admin." });
      }
      const payload = await liveRevenueAnalyticsService.computeAdminRevenueAnalytics(6);
      const csv = liveRevenueAnalyticsService.buildAdminRevenueAnalyticsCsv(payload, generatedAt);
      const fileDate = generatedAt.slice(0, 10);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=\"platform_revenue_analytics_${fileDate}.csv\"`);
      return res.status(200).send(csv);
    }

    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const bookings = await prisma.booking.findMany({
      where: { businessId },
      select: {
        id: true,
        date: true,
        time: true,
        status: true,
        service: true,
        price: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        source: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [{ date: "desc" }, { time: "desc" }, { createdAt: "desc" }]
    });

    const csv = liveRevenueAnalyticsService.buildBusinessAccountingBookingsCsv(
      { businessName: String(business.name || ""), businessId: business.id, bookings },
      generatedAt
    );
    const safeBusinessName = String(business.name || "business")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "business";
    const fileDate = generatedAt.slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${safeBusinessName}_bookings_accounting_${fileDate}.csv\"`);
    return res.status(200).send(csv);
  }

  return {
    liveRevenueHandler,
    accountingExportHandler
  };
}
