export function createWaitlistHandlers({
  prisma,
  resolveManagedBusinessId,
  waitlistService,
  randomUUID,
  isValidPhone,
  isValidEmail,
  normalizeBookingDateTime,
  writeAuditLog
} = {}) {
  async function waitlistHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const rows = await waitlistService.getWaitlistEntriesForBusiness(businessId);
    return res.json({
      entries: rows,
      summary: waitlistService.summarizeWaitlist(rows)
    });
  }

  async function upsertWaitlistHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const customerName = String(req.body?.customerName || "").trim();
    const customerPhone = String(req.body?.customerPhone || "").trim();
    const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const service = String(req.body?.service || "").trim();
    const preferredDate = String(req.body?.preferredDate || "").trim();
    const preferredTime = String(req.body?.preferredTime || "").trim();
    const notes = String(req.body?.notes || "").trim();
    if (!customerName) return res.status(400).json({ error: "Customer name is required." });
    if (!customerPhone && !customerEmail) {
      return res.status(400).json({ error: "Phone or email is required." });
    }
    if (customerPhone && !isValidPhone(customerPhone)) return res.status(400).json({ error: "Invalid phone format." });
    if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: "Invalid email format." });
    if ((preferredDate && !preferredTime) || (!preferredDate && preferredTime)) {
      return res.status(400).json({ error: "Preferred date and time must be supplied together." });
    }
    if (preferredDate && preferredTime && !normalizeBookingDateTime(preferredDate, preferredTime)) {
      return res.status(400).json({ error: "Invalid preferred date/time." });
    }

    let saved;
    try {
      saved = await waitlistService.upsertWaitlistEntryForBusiness(businessId, {
        id,
        customerName,
        customerPhone,
        customerEmail,
        service,
        preferredDate,
        preferredTime,
        notes
      });
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "waitlist.upserted",
      entityType: "waitlist",
      entityId: id,
      metadata: { businessId, service }
    });

    return res.json({
      entry: saved.entry,
      entries: saved.entries,
      summary: waitlistService.summarizeWaitlist(saved.entries)
    });
  }

  async function waitlistBackfillHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const entryId = String(req.params.entryId || "").trim();
    if (!entryId) return res.status(400).json({ error: "Waitlist entry id is required." });

    const cancelledBookingId = String(req.body?.cancelledBookingId || "").trim();
    let cancelledBooking = null;
    if (cancelledBookingId) {
      cancelledBooking = await prisma.booking.findUnique({ where: { id: cancelledBookingId } });
      if (!cancelledBooking || cancelledBooking.businessId !== businessId || cancelledBooking.status !== "cancelled") {
        return res.status(400).json({ error: "Cancelled booking not found for this business." });
      }
    }

    let updated;
    try {
      updated = await waitlistService.markWaitlistEntryContactedForBusiness(businessId, entryId);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "waitlist.backfill_contacted",
      entityType: "waitlist",
      entityId: entryId,
      metadata: {
        businessId,
        cancelledBookingId: cancelledBooking?.id || null,
        service: cancelledBooking?.service || updated.entry?.service || null
      }
    });

    return res.json({
      entry: updated.entry,
      entries: updated.entries,
      summary: waitlistService.summarizeWaitlist(updated.entries)
    });
  }

  async function deleteWaitlistHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const entryId = String(req.params.entryId || "").trim();
    if (!entryId) return res.status(400).json({ error: "Waitlist entry id is required." });

    let deleted;
    try {
      deleted = await waitlistService.deleteWaitlistEntryForBusiness(businessId, entryId);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "waitlist.removed",
      entityType: "waitlist",
      entityId: entryId,
      metadata: { businessId }
    });

    return res.json({
      entries: deleted.entries,
      summary: waitlistService.summarizeWaitlist(deleted.entries)
    });
  }

  return {
    waitlistHandler,
    upsertWaitlistHandler,
    waitlistBackfillHandler,
    deleteWaitlistHandler
  };
}
