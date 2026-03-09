export function createEngagementRouteHandlers({
  prisma,
  resolveManagedBusinessId,
  writeAuditLog,
  buildCrmSegments,
  commercialControlsService
} = {}) {
  function parseBookingNotesMeta(notes) {
    const text = String(notes || "").trim();
    if (!text) return { aftercareNotes: "", cleanNotes: "" };
    const lines = text.split(/\r?\n/);
    let aftercareNotes = "";
    let bodyStart = 0;
    for (let index = 0; index < lines.length; index += 1) {
      const line = String(lines[index] || "").trim();
      const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (!match) {
        bodyStart = index;
        break;
      }
      const label = String(match[1] || "").trim().toLowerCase();
      const value = String(match[2] || "").trim();
      if (label === "aftercare") aftercareNotes = value;
      bodyStart = index + 1;
    }
    return {
      aftercareNotes,
      cleanNotes: lines.slice(bodyStart).join("\n").trim()
    };
  }

  async function recoveryActionMarkHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const bookingId = String(req.body?.bookingId || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const service = String(req.body?.service || "").trim();
    const date = String(req.body?.date || "").trim();
    const time = String(req.body?.time || "").trim();
    const action = String(req.body?.action || "").trim().toLowerCase();

    if (!bookingId) return res.status(400).json({ error: "Booking is required." });
    if (!["reminder_sent", "confirmed"].includes(action)) {
      return res.status(400).json({ error: "Recovery action is not supported." });
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: action === "confirmed" ? "booking.confirmation_marked" : "booking.reminder_marked",
      entityType: "booking_recovery",
      entityId: bookingId,
      metadata: { businessId, bookingId, customerName, service, date, time }
    });

    return res.json({ ok: true });
  }

  async function rebookingMarkSentHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const customerKey = String(req.body?.customerKey || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const service = String(req.body?.service || "").trim();
    if (!customerKey) return res.status(400).json({ error: "Customer key is required." });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "rebooking.prompt_sent",
      entityType: "rebooking",
      entityId: customerKey,
      metadata: { businessId, customerName, service }
    });

    return res.json({ ok: true });
  }

  async function customerDashboardHandler(req, res) {
    const bookings = await prisma.booking.findMany({ where: { customerEmail: req.auth.email || "" } });
    const savedBusinesses = new Set(bookings.map((booking) => booking.businessId)).size;
    const user = req.auth?.sub ? await prisma.user.findUnique({ where: { id: req.auth.sub }, select: { name: true, email: true } }) : null;
    const visitedBusinessIds = Array.from(new Set(bookings.map((booking) => String(booking.businessId || "").trim()).filter(Boolean)));
    const offersByBusiness = [];
    const matchingGiftCards = [];

    for (const businessId of visitedBusinessIds) {
      if (!commercialControlsService?.loadCommercialRecord) continue;
      const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } });
      if (!business) continue;
      const record = await commercialControlsService.loadCommercialRecord(businessId);
      const memberships = (Array.isArray(record?.memberships) ? record.memberships : []).filter((row) => String(row.status || "").toLowerCase() === "active");
      const packages = (Array.isArray(record?.packages) ? record.packages : []).filter((row) => String(row.status || "").toLowerCase() === "active");
      const merch = (Array.isArray(record?.merch) ? record.merch : []).filter((row) => String(row.status || "").toLowerCase() === "active");
      const giftCards = (Array.isArray(record?.giftCards) ? record.giftCards : []).filter((row) => {
        const recipient = String(row.recipientName || "").trim().toLowerCase();
        const userName = String(user?.name || "").trim().toLowerCase();
        return userName && recipient && recipient === userName && String(row.status || "").toLowerCase() === "active";
      });

      if (memberships.length || packages.length || merch.length) {
        offersByBusiness.push({
          businessId,
          businessName: String(business.name || "Salon"),
          memberships: memberships.slice(0, 2).map((row) => ({ name: row.name, price: row.price, billingCycle: row.billingCycle })),
          packages: packages.slice(0, 2).map((row) => ({ name: row.name, price: row.price, sessionCount: row.sessionCount })),
          merch: merch.slice(0, 3).map((row) => ({ name: row.name, salePrice: row.salePrice, description: row.description }))
        });
      }

      giftCards.forEach((row) => {
        matchingGiftCards.push({
          businessId,
          businessName: String(business.name || "Salon"),
          code: row.code,
          remainingBalance: Number(row.remainingBalance || 0),
          expiresAt: row.expiresAt || null
        });
      });
    }

    const aftercareHistory = bookings
      .filter((booking) => String(booking.status || "").toLowerCase() === "completed")
      .map((booking) => {
        const meta = parseBookingNotesMeta(booking.notes || "");
        return {
          bookingId: booking.id,
          businessName: String(booking.businessName || "Salon"),
          service: String(booking.service || "Service"),
          date: String(booking.date || ""),
          aftercareNotes: meta.aftercareNotes,
          bookingNotes: meta.cleanNotes
        };
      })
      .filter((row) => row.aftercareNotes || row.bookingNotes)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 6);

    return res.json({
      analytics: {
        totalBookings: bookings.length,
        upcomingBookings: bookings.filter((booking) => booking.status === "confirmed").length,
        savedBusinesses,
        loyaltyPoints: bookings.length * 25,
        availableOfferBusinesses: offersByBusiness.length,
        activeGiftCards: matchingGiftCards.length
      },
      customerCare: {
        offersByBusiness,
        giftCards: matchingGiftCards,
        aftercareHistory
      }
    });
  }

  async function crmSegmentsHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const bookings = await prisma.booking.findMany({
      where: { businessId },
      orderBy: [{ createdAt: "desc" }]
    });
    return res.json(buildCrmSegments(bookings));
  }

  async function crmCampaignSendHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const segmentId = String(req.body?.segmentId || "").trim();
    const customerKey = String(req.body?.customerKey || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const message = String(req.body?.message || "").trim();
    const channel = String(req.body?.channel || "manual").trim().toLowerCase();
    if (!segmentId || !customerKey) return res.status(400).json({ error: "Segment and customer are required." });
    if (!message) return res.status(400).json({ error: "Campaign message is required." });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "crm.campaign_sent",
      entityType: "crm_campaign",
      entityId: `${segmentId}:${customerKey}`,
      metadata: { businessId, segmentId, customerName, channel }
    });

    return res.json({ ok: true });
  }

  return {
    recoveryActionMarkHandler,
    rebookingMarkSentHandler,
    customerDashboardHandler,
    crmSegmentsHandler,
    crmCampaignSendHandler
  };
}
