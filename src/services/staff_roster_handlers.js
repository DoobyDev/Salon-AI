export function createStaffRosterHandlers({
  resolveManagedBusinessId,
  staffRosterService,
  supportedStaffAvailability,
  writeAuditLog,
  randomUUID
} = {}) {
  async function staffRosterHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const businessRecord = await staffRosterService.loadStaffBusinessRecord(businessId);
    return res.json(
      staffRosterService.buildStaffRosterResponse(businessRecord, {
        includeRotaWeek: true,
        weekStart: req.query?.weekStart
      })
    );
  }

  async function upsertStaffRosterHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "staff").trim();
    const availability = String(req.body?.availability || "off_duty").trim().toLowerCase();
    const shiftDays = staffRosterService.normalizeShiftDays(req.body?.shiftDays);
    if (!name) return res.status(400).json({ error: "Staff member name is required." });
    if (!supportedStaffAvailability.has(availability)) {
      return res.status(400).json({ error: "Invalid availability value." });
    }

    const result = await staffRosterService.upsertStaffMember(businessId, {
      id,
      name,
      role,
      availability,
      shiftDays,
      weekStart: req.body?.weekStart
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "staff.roster_upserted",
      entityType: "staff",
      entityId: id,
      metadata: { businessId, availability }
    });

    return res.json({
      member: result.response.members.find((item) => item.id === id) || null,
      ...result.response
    });
  }

  async function updateStaffAvailabilityHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const staffId = String(req.params.staffId || "").trim();
    const availability = String(req.body?.availability || "").trim().toLowerCase();
    if (!staffId) return res.status(400).json({ error: "Staff member id is required." });
    if (!supportedStaffAvailability.has(availability)) {
      return res.status(400).json({ error: "Invalid availability value." });
    }

    let result;
    try {
      result = await staffRosterService.updateStaffAvailability(businessId, staffId, availability, req.body?.weekStart);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Staff member not found." });
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "staff.availability_updated",
      entityType: "staff",
      entityId: staffId,
      metadata: { businessId, availability }
    });

    return res.json({
      member: result.response.members.find((item) => item.id === staffId) || null,
      ...result.response
    });
  }

  async function deleteStaffRosterHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const staffId = String(req.params.staffId || "").trim();
    if (!staffId) return res.status(400).json({ error: "Staff member id is required." });

    let response;
    try {
      response = await staffRosterService.removeStaffMember(businessId, staffId, req.query?.weekStart);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Staff member not found." });
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "staff.removed",
      entityType: "staff",
      entityId: staffId,
      metadata: { businessId }
    });
    return res.json(response);
  }

  async function staffRotaWeekHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const weekStart = staffRosterService.normalizeWeekStartKey(req.query?.weekStart) || staffRosterService.currentWeekStartKey();
    const businessRecord = await staffRosterService.loadStaffBusinessRecord(businessId);
    return res.json(staffRosterService.getStaffRotaWeekPayload(businessRecord, weekStart));
  }

  async function bulkUpdateStaffRotaHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const weekStart = staffRosterService.normalizeWeekStartKey(req.body?.weekStart) || staffRosterService.currentWeekStartKey();
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];
    const appendSicknessLogs = Array.isArray(req.body?.sicknessLogs) ? req.body.sicknessLogs : [];

    const result = await staffRosterService.updateRotaWeekBulk(businessId, {
      weekStart,
      updates,
      appendSicknessLogs,
      actorId: req.auth.sub,
      actorRole: req.auth.role
    });

    if (result.appliedUpdates || appendSicknessLogs.length) {
      await writeAuditLog({
        actorId: req.auth.sub,
        actorRole: req.auth.role,
        action: "staff.rota_bulk_updated",
        entityType: "staff_rota",
        entityId: `${businessId}:${weekStart}`,
        metadata: { businessId, weekStart, appliedUpdates: result.appliedUpdates, sicknessLogs: appendSicknessLogs.length }
      });
    }

    return res.json(result.payload);
  }

  async function resetStaffRotaHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const result = await staffRosterService.resetRotaWeek(businessId, req.body?.weekStart);
    const weekStart = result.weekStart;
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "staff.rota_week_reset",
      entityType: "staff_rota",
      entityId: `${businessId}:${weekStart}`,
      metadata: { businessId, weekStart }
    });
    return res.json(result.payload);
  }

  return {
    staffRosterHandler,
    upsertStaffRosterHandler,
    updateStaffAvailabilityHandler,
    deleteStaffRosterHandler,
    staffRotaWeekHandler,
    bulkUpdateStaffRotaHandler,
    resetStaffRotaHandler
  };
}
