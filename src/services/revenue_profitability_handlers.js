export function createRevenueProfitabilityHandlers({
  prisma,
  resolveManagedBusinessId,
  revenueProfitabilityService,
  randomUUID,
  writeAuditLog
} = {}) {
  async function revenueAttributionHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const [bookings, spendRecord] = await Promise.all([
      prisma.booking.findMany({ where: { businessId } }),
      revenueProfitabilityService.loadRevenueSpendRecord(businessId)
    ]);
    return res.json(revenueProfitabilityService.computeRevenueAttribution(bookings, spendRecord));
  }

  async function revenueAttributionSpendHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const channel = revenueProfitabilityService.normalizeRevenueChannel(req.body?.channel);
    const spend = Number(req.body?.spend);
    if (!channel) return res.status(400).json({ error: "Channel is required." });
    if (!Number.isFinite(spend) || spend < 0) return res.status(400).json({ error: "Spend must be a valid number >= 0." });

    const businessRecord = await revenueProfitabilityService.loadRevenueSpendRecord(businessId);
    businessRecord[channel] = Number(spend.toFixed(2));
    await revenueProfitabilityService.saveRevenueSpendRecord(businessId, businessRecord);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "revenue.channel_spend_updated",
      entityType: "revenue",
      entityId: `${businessId}:${channel}`,
      metadata: { businessId, channel, spend: businessRecord[channel] }
    });

    const bookings = await prisma.booking.findMany({ where: { businessId } });
    return res.json(revenueProfitabilityService.computeRevenueAttribution(bookings, businessRecord));
  }

  async function profitabilitySummaryHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const [bookings, record] = await Promise.all([
      prisma.booking.findMany({ where: { businessId } }),
      revenueProfitabilityService.loadProfitabilityRecord(businessId)
    ]);
    return res.json(revenueProfitabilityService.computeProfitabilitySummary(bookings, record));
  }

  async function upsertProfitabilityPayrollHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const staffName = String(req.body?.staffName || "").trim();
    const role = String(req.body?.role || "").trim();
    const hours = Number(req.body?.hours || 0);
    const hourlyRate = Number(req.body?.hourlyRate || 0);
    const bonus = Number(req.body?.bonus || 0);
    if (!staffName) return res.status(400).json({ error: "Staff name is required." });
    if (!Number.isFinite(hours) || hours < 0) return res.status(400).json({ error: "Hours must be a valid number >= 0." });
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      return res.status(400).json({ error: "Hourly rate must be a valid number >= 0." });
    }
    if (!Number.isFinite(bonus) || bonus < 0) return res.status(400).json({ error: "Bonus must be a valid number >= 0." });

    const record = await revenueProfitabilityService.loadProfitabilityRecord(businessId);
    const rows = Array.isArray(record.payrollEntries) ? record.payrollEntries : [];
    const index = rows.findIndex((entry) => entry.id === id);
    const next = {
      id,
      staffName,
      role,
      hours: Number(hours.toFixed(2)),
      hourlyRate: Number(hourlyRate.toFixed(2)),
      bonus: Number(bonus.toFixed(2)),
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) rows[index] = next;
    else rows.push(next);
    record.payrollEntries = rows;
    await revenueProfitabilityService.saveProfitabilityRecord(businessId, record);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "profitability.payroll_upserted",
      entityType: "profitability",
      entityId: id,
      metadata: { businessId, staffName, role }
    });

    const bookings = await prisma.booking.findMany({ where: { businessId } });
    const payload = revenueProfitabilityService.computeProfitabilitySummary(bookings, record);
    return res.json({
      payrollEntry: next,
      ...payload
    });
  }

  async function deleteProfitabilityPayrollHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const entryId = String(req.params.entryId || "").trim();
    if (!entryId) return res.status(400).json({ error: "Payroll entry id is required." });

    const record = await revenueProfitabilityService.loadProfitabilityRecord(businessId);
    const rows = Array.isArray(record.payrollEntries) ? record.payrollEntries : [];
    const filtered = rows.filter((entry) => entry.id !== entryId);
    if (filtered.length === rows.length) return res.status(404).json({ error: "Payroll entry not found." });
    record.payrollEntries = filtered;
    await revenueProfitabilityService.saveProfitabilityRecord(businessId, record);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "profitability.payroll_removed",
      entityType: "profitability",
      entityId: entryId,
      metadata: { businessId }
    });

    const bookings = await prisma.booking.findMany({ where: { businessId } });
    return res.json(revenueProfitabilityService.computeProfitabilitySummary(bookings, record));
  }

  async function upsertProfitabilityCostsHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const rent = Number(req.body?.rent || 0);
    const utilities = Number(req.body?.utilities || 0);
    const software = Number(req.body?.software || 0);
    const other = Number(req.body?.other || 0);
    const cogsPercent = Number(req.body?.cogsPercent || 0);
    const values = [rent, utilities, software, other];
    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      return res.status(400).json({ error: "Fixed costs must be valid numbers >= 0." });
    }
    if (!Number.isFinite(cogsPercent) || cogsPercent < 0 || cogsPercent > 95) {
      return res.status(400).json({ error: "COGS percent must be between 0 and 95." });
    }

    const record = await revenueProfitabilityService.loadProfitabilityRecord(businessId);
    record.fixedCosts = {
      rent: Number(rent.toFixed(2)),
      utilities: Number(utilities.toFixed(2)),
      software: Number(software.toFixed(2)),
      other: Number(other.toFixed(2))
    };
    record.cogsPercent = Number(cogsPercent.toFixed(2));
    await revenueProfitabilityService.saveProfitabilityRecord(businessId, record);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "profitability.costs_updated",
      entityType: "profitability",
      entityId: businessId,
      metadata: { businessId, ...record.fixedCosts, cogsPercent: record.cogsPercent }
    });

    const bookings = await prisma.booking.findMany({ where: { businessId } });
    return res.json(revenueProfitabilityService.computeProfitabilitySummary(bookings, record));
  }

  return {
    revenueAttributionHandler,
    revenueAttributionSpendHandler,
    profitabilitySummaryHandler,
    upsertProfitabilityPayrollHandler,
    deleteProfitabilityPayrollHandler,
    upsertProfitabilityCostsHandler
  };
}
