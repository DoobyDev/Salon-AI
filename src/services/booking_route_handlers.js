export function createBookingRouteHandlers({
  prisma,
  parsePageSize,
  decodeCursor,
  encodeCursor,
  makeCacheKey,
  getCached,
  setCached,
  isValidPhone,
  isValidEmail,
  normalizeBookingDateTime,
  isBookingSlotInPast,
  isSlotWithinBusinessHours,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  jobRuntime,
  sendDirectEmail,
  clearReadCache,
  writeAuditLog,
  canMutateBooking,
  normalizeBookingStatusValue
} = {}) {
  function pad2(value) {
    return String(Math.max(0, Number(value || 0))).padStart(2, "0");
  }

  function buildWalkInTime(dateKey) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    if (String(dateKey || "") === todayKey) {
      return `${pad2(today.getHours())}:${pad2(today.getMinutes())}`;
    }
    return "12:00";
  }

  async function createWalkInBookingHandler(req, res) {
    const authRole = String(req.auth?.role || "").trim().toLowerCase();
    const businessId =
      authRole === "admin"
        ? String(req.body?.businessId || req.query?.businessId || "").trim()
        : String(req.auth?.businessId || req.body?.businessId || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const customerPhone = String(req.body?.customerPhone || "").trim();
    const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const date = String(req.body?.date || "").trim();
    if (!businessId || !customerName || !customerPhone || !date) {
      return res.status(400).json({ error: "Missing walk-in fields." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid walk-in date." });
    }
    if (!isValidPhone(customerPhone)) return res.status(400).json({ error: "Invalid customer phone format." });
    if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: "Invalid customer email format." });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const booking = await prisma.booking.create({
      data: {
        businessId,
        businessName: business.name,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        service: "Walk-in Visit",
        price: 0,
        date,
        time: buildWalkInTime(date),
        status: "completed",
        source: "manual",
        notes: "[WalkIn] Added from subscriber calendar popup."
      }
    });

    let welcomeEmail = null;
    if (customerEmail && sendDirectEmail) {
      welcomeEmail = await sendDirectEmail({
        to: customerEmail,
        subject: `Thanks for visiting ${business.name} today`,
        text: `Hi ${customerName}, thanks for visiting ${business.name} today. We would love to welcome you back, and next time you can use the app to book your appointment more easily.`
      });
    }

    clearReadCache();
    await writeAuditLog({
      actorRole: authRole || "subscriber",
      action: "booking.walk_in_created",
      entityType: "booking",
      entityId: booking.id,
      metadata: { businessId: booking.businessId, welcomeEmailOutcome: welcomeEmail?.outcome || "" }
    });

    return res.status(201).json({ booking, welcomeEmail });
  }

  function parseBookingNotesMeta(notes) {
    const text = String(notes || "").trim();
    if (!text) return { stylistName: "", serviceState: "", serviceNotes: "", aftercareNotes: "", cleanNotes: "" };
    const lines = text.split(/\r?\n/);
    const meta = { stylistName: "", serviceState: "", serviceNotes: "", aftercareNotes: "", cleanNotes: "" };
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
      if (label === "stylist") meta.stylistName = value;
      if (label === "servicestate") meta.serviceState = value;
      if (label === "servicenotes") meta.serviceNotes = value;
      if (label === "aftercare") meta.aftercareNotes = value;
      bodyStart = index + 1;
    }

    meta.cleanNotes = lines.slice(bodyStart).join("\n").trim();
    return meta;
  }

  function buildBookingNotesPayload({ stylistName = "", serviceState = "", serviceNotes = "", aftercareNotes = "", userNotes = "" } = {}) {
    const cleanStylist = String(stylistName || "").trim();
    const cleanServiceState = String(serviceState || "").trim();
    const cleanServiceNotes = String(serviceNotes || "").trim();
    const cleanAftercareNotes = String(aftercareNotes || "").trim();
    const cleanNotes = String(userNotes || "").trim();
    return [
      cleanStylist ? `[Stylist] ${cleanStylist}` : "",
      cleanServiceState ? `[ServiceState] ${cleanServiceState}` : "",
      cleanServiceNotes ? `[ServiceNotes] ${cleanServiceNotes}` : "",
      cleanAftercareNotes ? `[Aftercare] ${cleanAftercareNotes}` : "",
      cleanNotes
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function createBookingHandler(req, res) {
    const businessId = String(req.body?.businessId || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const customerPhone = String(req.body?.customerPhone || "").trim();
    const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const service = String(req.body?.service || "").trim();
    const date = String(req.body?.date || "").trim();
    const time = String(req.body?.time || "").trim();
    const source = String(req.body?.source || "manual").trim().toLowerCase() === "lexi" ? "lexi" : "manual";
    const notes = String(req.body?.notes || "").trim().slice(0, 12000);

    if (!businessId || !customerName || !customerPhone || !service || !date || !time) {
      return res.status(400).json({ error: "Missing booking fields." });
    }
    if (!isValidPhone(customerPhone)) return res.status(400).json({ error: "Invalid customer phone format." });
    if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: "Invalid customer email format." });

    const normalized = normalizeBookingDateTime(date, time);
    if (!normalized) return res.status(400).json({ error: "Invalid date/time format." });
    if (isBookingSlotInPast(normalized.date, normalized.time)) {
      return res.status(400).json({ error: "Bookings must be scheduled for a future time." });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId }, include: { services: true } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const svc = business.services.find((row) => row.name.toLowerCase() === service.toLowerCase());
    if (!svc) return res.status(400).json({ error: "Selected service is not offered by this business." });
    const durationMin = Math.max(5, Number(svc.durationMin || 45));
    if (!isSlotWithinBusinessHours(business, normalized.date, normalized.time, durationMin)) {
      return res.status(400).json({ error: "Selected slot is outside operating hours for this service duration." });
    }
    const capacity = await getSlotCapacityForBusinessDate(businessId, normalized.date);
    const atCapacity = await isSlotAtCapacity({
      businessId,
      date: normalized.date,
      time: normalized.time,
      capacity
    });
    if (atCapacity) return res.status(409).json({ error: "Selected slot reached staff capacity." });

    const booking = await prisma.booking.create({
      data: {
        businessId,
        businessName: business.name,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        service,
        price: svc.price,
        date: normalized.date,
        time: normalized.time,
        status: "confirmed",
        source,
        notes: notes || null
      }
    });

    await jobRuntime.enqueueNotification({
      businessName: business.name,
      booking,
      customerEmail: customerEmail || "",
      customerPhone,
      deliveryType: "booking_confirmation"
    });
    clearReadCache();
    await writeAuditLog({
      actorRole: "anonymous",
      action: "booking.created_manual",
      entityType: "booking",
      entityId: booking.id,
      metadata: { businessId: booking.businessId }
    });

    return res.status(201).json({ booking });
  }

  async function publicDemoBookingsHandler(req, res) {
    const limit = parsePageSize(req.query.limit, 20);
    const cursorPayload = decodeCursor(req.query.cursor);
    const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
    const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
    const where = [{ status: "confirmed" }];
    if (cursorDate && cursorId) {
      where.push({
        OR: [
          { createdAt: { lt: cursorDate } },
          { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
        ]
      });
    }

    const cacheKey = makeCacheKey(["public-demo:v2", limit, req.query.cursor || ""]);
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached);

    const bookings = await prisma.booking.findMany({
      where: { AND: where },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: {
        id: true,
        customerName: true,
        service: true,
        date: true,
        time: true,
        businessName: true,
        createdAt: true
      }
    });
    const hasMore = bookings.length > limit;
    const pageRows = bookings.slice(0, limit);
    const sanitized = pageRows.map((booking) => ({
      ...booking,
      customerName: `${String(booking.customerName || "").slice(0, 1)}***`
    }));
    const last = pageRows[pageRows.length - 1];
    const payload = {
      bookings: sanitized.map(({ createdAt, ...rest }) => rest),
      pagination: {
        limit,
        hasMore,
        nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
      }
    };
    await setCached(cacheKey, payload, 10_000);
    return res.json(payload);
  }

  async function adminBookingsHandler(req, res) {
    const limit = parsePageSize(req.query.limit, 50);
    const cursorPayload = decodeCursor(req.query.cursor);
    const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
    const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
    const where = [];
    if (cursorDate && cursorId) {
      where.push({
        OR: [
          { createdAt: { lt: cursorDate } },
          { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
        ]
      });
    }
    const bookings = await prisma.booking.findMany({
      where: where.length ? { AND: where } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1
    });
    const hasMore = bookings.length > limit;
    const pageRows = bookings.slice(0, limit);
    const last = pageRows[pageRows.length - 1];
    return res.json({
      bookings: pageRows,
      pagination: {
        limit,
        hasMore,
        nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
      }
    });
  }

  async function myBookingsHandler(req, res) {
    const limit = parsePageSize(req.query.limit, 50);
    const cursorPayload = decodeCursor(req.query.cursor);
    const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
    const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
    const adminBusinessId = String(req.query.businessId || "").trim();
    const adminCustomerEmail = String(req.query.customerEmail || "").trim().toLowerCase();
    const filterAnd = [];

    if (req.auth.role === "subscriber") {
      filterAnd.push({ businessId: req.auth.businessId || "" });
    } else if (req.auth.role === "admin" && adminBusinessId) {
      filterAnd.push({ businessId: adminBusinessId });
    } else if (req.auth.role === "admin" && adminCustomerEmail) {
      filterAnd.push({ customerEmail: adminCustomerEmail });
    } else if (req.auth.role === "customer") {
      filterAnd.push({ customerEmail: req.auth.email || "" });
    }
    if (cursorDate && cursorId) {
      filterAnd.push({
        OR: [
          { createdAt: { lt: cursorDate } },
          { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
        ]
      });
    }

    const bookings = await prisma.booking.findMany({
      where: filterAnd.length ? { AND: filterAnd } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1
    });
    const hasMore = bookings.length > limit;
    const pageRows = bookings.slice(0, limit);
    const last = pageRows[pageRows.length - 1];
    return res.json({
      bookings: pageRows,
      pagination: {
        limit,
        hasMore,
        nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
      }
    });
  }

  async function cancelBookingHandler(req, res) {
    const bookingId = String(req.params.bookingId || "").trim();
    if (!bookingId) return res.status(400).json({ error: "Booking ID is required." });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canMutateBooking(req, booking)) return res.status(403).json({ error: "Forbidden." });
    const bookingStatus = normalizeBookingStatusValue(booking.status);
    if (bookingStatus === "cancelled") return res.status(400).json({ error: "Booking is already cancelled." });
    if (bookingStatus === "completed") return res.status(400).json({ error: "Completed bookings cannot be cancelled." });

    const feeApplied = false;
    const cancelled = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled" }
    });
    clearReadCache();
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "booking.cancelled",
      entityType: "booking",
      entityId: cancelled.id,
      metadata: { feeApplied }
    });

    return res.json({
      booking: cancelled,
      policy: {
        subscriberControlled: true,
        feeApplied
      }
    });
  }

  async function rescheduleBookingHandler(req, res) {
    const bookingId = String(req.params.bookingId || "").trim();
    const date = String(req.body?.date || "").trim();
    const time = String(req.body?.time || "").trim();
    if (!bookingId || !date || !time) return res.status(400).json({ error: "Booking ID, date, and time are required." });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canMutateBooking(req, booking)) return res.status(403).json({ error: "Forbidden." });
    const bookingStatus = normalizeBookingStatusValue(booking.status);
    if (bookingStatus === "cancelled") return res.status(400).json({ error: "Cancelled bookings cannot be rescheduled." });
    if (bookingStatus === "completed") return res.status(400).json({ error: "Completed bookings cannot be rescheduled." });
    const business = await prisma.business.findUnique({
      where: { id: booking.businessId },
      include: { services: true }
    });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const normalized = normalizeBookingDateTime(date, time);
    if (!normalized) return res.status(400).json({ error: "Invalid date/time format." });
    if (normalized.date === String(booking.date || "").trim() && normalized.time === String(booking.time || "").trim()) {
      return res.status(400).json({ error: "Booking is already scheduled for that date and time." });
    }
    if (isBookingSlotInPast(normalized.date, normalized.time)) {
      return res.status(400).json({ error: "Rescheduled time must be in the future." });
    }
    const svc = business.services.find((serviceRow) => serviceRow.name.toLowerCase() === String(booking.service || "").toLowerCase());
    const durationMin = Math.max(5, Number(svc?.durationMin || 45));
    if (!isSlotWithinBusinessHours(business, normalized.date, normalized.time, durationMin)) {
      return res.status(400).json({ error: "Selected slot is outside operating hours for this service duration." });
    }

    const capacity = await getSlotCapacityForBusinessDate(booking.businessId, normalized.date);
    const conflict = await isSlotAtCapacity({
      businessId: booking.businessId,
      date: normalized.date,
      time: normalized.time,
      capacity,
      excludeBookingId: booking.id
    });
    if (conflict) return res.status(409).json({ error: "Selected slot reached staff capacity." });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        date: normalized.date,
        time: normalized.time
      }
    });
    clearReadCache();

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "booking.rescheduled",
      entityType: "booking",
      entityId: updated.id,
      metadata: { from: { date: booking.date, time: booking.time }, to: normalized }
    });

    return res.json({ booking: updated });
  }

  async function updateBookingServiceStateHandler(req, res) {
    const bookingId = String(req.params.bookingId || "").trim();
    const requestedState = String(req.body?.serviceState || "").trim().toLowerCase();
    const serviceNotes = String(req.body?.serviceNotes || "").trim().slice(0, 4000);
    const aftercareNotes = String(req.body?.aftercareNotes || "").trim().slice(0, 4000);
    const allowedStates = new Set(["confirmed", "checked_in", "in_progress", "completed"]);

    if (!bookingId) return res.status(400).json({ error: "Booking ID is required." });
    if (!allowedStates.has(requestedState)) {
      return res.status(400).json({ error: "Service state must be confirmed, checked_in, in_progress, or completed." });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canMutateBooking(req, booking)) return res.status(403).json({ error: "Forbidden." });
    const bookingStatus = normalizeBookingStatusValue(booking.status);
    if (bookingStatus === "cancelled") return res.status(400).json({ error: "Cancelled bookings cannot be updated." });
    if (bookingStatus === "completed" && requestedState !== "completed") {
      return res.status(400).json({ error: "Completed bookings can only have notes updated." });
    }

    const existing = parseBookingNotesMeta(booking.notes || "");
    const finalState = bookingStatus === "completed" ? "completed" : requestedState;
    const nextStatus = finalState === "completed" ? "completed" : booking.status;
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: nextStatus,
        notes: buildBookingNotesPayload({
          stylistName: existing.stylistName,
          serviceState: finalState,
          serviceNotes: serviceNotes || existing.serviceNotes,
          aftercareNotes: aftercareNotes || existing.aftercareNotes,
          userNotes: existing.cleanNotes
        }) || null
      }
    });

    clearReadCache();
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "booking.service_state_updated",
      entityType: "booking",
      entityId: updated.id,
      metadata: { serviceState: finalState, status: nextStatus }
    });

    return res.json({ booking: updated });
  }

  return {
    createBookingHandler,
    createWalkInBookingHandler,
    publicDemoBookingsHandler,
    adminBookingsHandler,
    myBookingsHandler,
    cancelBookingHandler,
    rescheduleBookingHandler,
    updateBookingServiceStateHandler
  };
}
