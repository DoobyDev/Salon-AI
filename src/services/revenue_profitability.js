export function createRevenueProfitabilityService({
  getPrisma,
  readRevenueSpendFile,
  writeRevenueSpendFile,
  readProfitabilityInputsFile,
  writeProfitabilityInputsFile
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeRevenueChannel(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "direct";
    if (raw === "manual") return "direct";
    if (raw === "ai") return "ai_assistant";
    return raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "direct";
  }

  function formatRevenueChannelLabel(channel) {
    return String(channel || "direct")
      .split("_")
      .filter(Boolean)
      .map((chunk) => chunk.slice(0, 1).toUpperCase() + chunk.slice(1))
      .join(" ");
  }

  function normalizeRevenueSpendRecord(record) {
    const source = record && typeof record === "object" ? record : {};
    const out = {};
    Object.entries(source).forEach(([channelRaw, spendRaw]) => {
      const channel = normalizeRevenueChannel(channelRaw);
      const spend = Number(spendRaw || 0);
      if (!Number.isFinite(spend) || spend < 0) return;
      out[channel] = Number(spend.toFixed(2));
    });
    return out;
  }

  function computeRevenueAttribution(bookings, spendRecord = {}) {
    const spendByChannel = normalizeRevenueSpendRecord(spendRecord);
    const channelRollup = new Map();

    const ensureChannel = (channel) => {
      if (!channelRollup.has(channel)) {
        channelRollup.set(channel, {
          channel,
          label: formatRevenueChannelLabel(channel),
          bookings: 0,
          revenue: 0,
          cancelledBookings: 0,
          spend: Number(spendByChannel[channel] || 0)
        });
      }
      return channelRollup.get(channel);
    };

    (Array.isArray(bookings) ? bookings : []).forEach((booking) => {
      const channel = normalizeRevenueChannel(booking?.source || "direct");
      const row = ensureChannel(channel);
      if (String(booking?.status || "").toLowerCase() === "cancelled") {
        row.cancelledBookings += 1;
        return;
      }
      row.bookings += 1;
      row.revenue += Number(booking?.price || 0);
    });

    Object.keys(spendByChannel).forEach((channel) => {
      const row = ensureChannel(channel);
      row.spend = Number(spendByChannel[channel] || 0);
    });

    const rows = Array.from(channelRollup.values());
    const totalRevenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
    const totalSpend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
    const totalBookings = rows.reduce((sum, row) => sum + Number(row.bookings || 0), 0);

    const channels = rows
      .map((row) => {
        const sharePercent = totalBookings ? Number(((row.bookings / totalBookings) * 100).toFixed(1)) : 0;
        const roiPercent = row.spend > 0 ? Number((((row.revenue - row.spend) / row.spend) * 100).toFixed(1)) : null;
        return {
          channel: row.channel,
          label: row.label,
          bookings: row.bookings,
          cancelledBookings: row.cancelledBookings,
          revenue: Number(row.revenue.toFixed(2)),
          spend: Number(row.spend.toFixed(2)),
          sharePercent,
          roiPercent
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);

    const bestRevenueChannel = channels[0]?.channel || null;
    const roiEligible = channels.filter((row) => typeof row.roiPercent === "number");
    const bestRoiChannel = roiEligible.sort((a, b) => b.roiPercent - a.roiPercent)[0]?.channel || null;

    return {
      channels,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalSpend: Number(totalSpend.toFixed(2)),
        totalAttributedBookings: totalBookings,
        blendedRoiPercent: totalSpend > 0 ? Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1)) : null,
        bestRevenueChannel,
        bestRoiChannel
      }
    };
  }

  function normalizeProfitabilityRecord(record) {
    const source = record && typeof record === "object" ? record : {};
    const payrollEntries = (Array.isArray(source.payrollEntries) ? source.payrollEntries : [])
      .map((entry) => {
        const hours = Number(entry?.hours || 0);
        const hourlyRate = Number(entry?.hourlyRate || 0);
        const bonus = Number(entry?.bonus || 0);
        return {
          id: String(entry?.id || "").trim(),
          staffName: String(entry?.staffName || "").trim(),
          role: String(entry?.role || "").trim(),
          hours: Number.isFinite(hours) && hours >= 0 ? Number(hours.toFixed(2)) : 0,
          hourlyRate: Number.isFinite(hourlyRate) && hourlyRate >= 0 ? Number(hourlyRate.toFixed(2)) : 0,
          bonus: Number.isFinite(bonus) && bonus >= 0 ? Number(bonus.toFixed(2)) : 0,
          updatedAt: entry?.updatedAt || null
        };
      })
      .filter((entry) => entry.id && entry.staffName);
    const fixedCostsRaw = source.fixedCosts && typeof source.fixedCosts === "object" ? source.fixedCosts : {};
    const fixedCosts = {
      rent: Math.max(0, Number(fixedCostsRaw.rent || 0)),
      utilities: Math.max(0, Number(fixedCostsRaw.utilities || 0)),
      software: Math.max(0, Number(fixedCostsRaw.software || 0)),
      other: Math.max(0, Number(fixedCostsRaw.other || 0))
    };
    const cogsPercentRaw = Number(source.cogsPercent || 0);
    const cogsPercent = Number.isFinite(cogsPercentRaw)
      ? Math.min(95, Math.max(0, Number(cogsPercentRaw.toFixed(2))))
      : 0;
    return {
      payrollEntries,
      fixedCosts: {
        rent: Number(fixedCosts.rent.toFixed(2)),
        utilities: Number(fixedCosts.utilities.toFixed(2)),
        software: Number(fixedCosts.software.toFixed(2)),
        other: Number(fixedCosts.other.toFixed(2))
      },
      cogsPercent
    };
  }

  function computeProfitabilitySummary(bookings, record) {
    const normalized = normalizeProfitabilityRecord(record);
    const bookingRows = (Array.isArray(bookings) ? bookings : []).filter(
      (booking) => String(booking?.status || "").toLowerCase() !== "cancelled"
    );
    const grossRevenue = bookingRows.reduce((sum, booking) => sum + Number(booking?.price || 0), 0);
    const bookingCount = bookingRows.length;
    const averageTicket = bookingCount ? grossRevenue / bookingCount : 0;
    const payrollTotal = normalized.payrollEntries.reduce(
      (sum, entry) => sum + Number(entry.hours || 0) * Number(entry.hourlyRate || 0) + Number(entry.bonus || 0),
      0
    );
    const fixedCostsTotal = Object.values(normalized.fixedCosts).reduce((sum, value) => sum + Number(value || 0), 0);
    const cogsAmount = grossRevenue * (normalized.cogsPercent / 100);
    const totalCosts = payrollTotal + fixedCostsTotal + cogsAmount;
    const estimatedProfit = grossRevenue - totalCosts;
    const profitMarginPercent = grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : null;
    const breakevenRevenue =
      normalized.cogsPercent >= 100
        ? null
        : (payrollTotal + fixedCostsTotal) / Math.max(0.01, 1 - normalized.cogsPercent / 100);

    return {
      payrollEntries: normalized.payrollEntries,
      fixedCosts: normalized.fixedCosts,
      cogsPercent: normalized.cogsPercent,
      summary: {
        grossRevenue: Number(grossRevenue.toFixed(2)),
        nonCancelledBookings: bookingCount,
        averageTicket: Number(averageTicket.toFixed(2)),
        payrollTotal: Number(payrollTotal.toFixed(2)),
        fixedCostsTotal: Number(fixedCostsTotal.toFixed(2)),
        cogsAmount: Number(cogsAmount.toFixed(2)),
        totalCosts: Number(totalCosts.toFixed(2)),
        estimatedProfit: Number(estimatedProfit.toFixed(2)),
        profitMarginPercent: profitMarginPercent === null ? null : Number(profitMarginPercent.toFixed(1)),
        breakevenRevenue: breakevenRevenue === null ? null : Number(breakevenRevenue.toFixed(2))
      }
    };
  }

  function isPrismaRevenueProfitabilityStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("revenue") || msg.includes("profitability");
  }

  async function loadRevenueSpendRecordFromPrisma(businessId) {
    const model = prismaClient()?.revenueSpendChannel;
    if (!model || typeof model.findMany !== "function") return null;
    try {
      const rows = await model.findMany({
        where: { businessId },
        orderBy: [{ channel: "asc" }]
      });
      const record = {};
      rows.forEach((row) => {
        const channel = normalizeRevenueChannel(row?.channel);
        if (!channel) return;
        record[channel] = Number(Number(row?.spend || 0).toFixed(2));
      });
      return normalizeRevenueSpendRecord(record);
    } catch (error) {
      if (isPrismaRevenueProfitabilityStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function loadRevenueSpendRecord(businessId) {
    const dbRecord = await loadRevenueSpendRecordFromPrisma(businessId);
    if (dbRecord) return dbRecord;
    const all = await readRevenueSpendFile();
    return normalizeRevenueSpendRecord(all?.[businessId]);
  }

  async function saveRevenueSpendRecord(businessId, record) {
    const normalized = normalizeRevenueSpendRecord(record);
    const model = prismaClient()?.revenueSpendChannel;
    if (model && typeof model.deleteMany === "function" && typeof model.createMany === "function") {
      try {
        await model.deleteMany({ where: { businessId } });
        const rows = Object.entries(normalized).map(([channel, spend]) => ({
          id: `${businessId}:${channel}`,
          businessId,
          channel,
          spend: Number(spend || 0)
        }));
        if (rows.length) {
          await model.createMany({ data: rows });
        }
        return normalized;
      } catch (error) {
        if (!isPrismaRevenueProfitabilityStorageUnavailable(error)) throw error;
      }
    }
    const all = await readRevenueSpendFile();
    all[businessId] = normalized;
    await writeRevenueSpendFile(all);
    return normalized;
  }

  async function loadProfitabilityRecordFromPrisma(businessId) {
    const payrollModel = prismaClient()?.profitabilityPayrollEntry;
    const configModel = prismaClient()?.profitabilityConfig;
    if (!payrollModel || !configModel || typeof payrollModel.findMany !== "function" || typeof configModel.findUnique !== "function") {
      return null;
    }
    try {
      const [payrollRows, config] = await Promise.all([
        payrollModel.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
        configModel.findUnique({ where: { businessId } })
      ]);
      return normalizeProfitabilityRecord({
        payrollEntries: payrollRows.map((row) => ({
          id: String(row?.id || "").trim(),
          staffName: String(row?.staffName || "").trim(),
          role: String(row?.role || "").trim(),
          hours: Number(row?.hours || 0),
          hourlyRate: Number(row?.hourlyRate || 0),
          bonus: Number(row?.bonus || 0),
          updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
        })),
        fixedCosts: {
          rent: Number(config?.rent || 0),
          utilities: Number(config?.utilities || 0),
          software: Number(config?.software || 0),
          other: Number(config?.other || 0)
        },
        cogsPercent: Number(config?.cogsPercent || 0)
      });
    } catch (error) {
      if (isPrismaRevenueProfitabilityStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function loadProfitabilityRecord(businessId) {
    const dbRecord = await loadProfitabilityRecordFromPrisma(businessId);
    if (dbRecord) return dbRecord;
    const all = await readProfitabilityInputsFile();
    return normalizeProfitabilityRecord(all?.[businessId]);
  }

  async function saveProfitabilityRecord(businessId, record) {
    const normalized = normalizeProfitabilityRecord(record);
    const payrollModel = prismaClient()?.profitabilityPayrollEntry;
    const configModel = prismaClient()?.profitabilityConfig;
    if (
      payrollModel &&
      configModel &&
      typeof payrollModel.deleteMany === "function" &&
      typeof payrollModel.createMany === "function" &&
      typeof configModel.upsert === "function"
    ) {
      try {
        await payrollModel.deleteMany({ where: { businessId } });
        if (normalized.payrollEntries.length) {
          await payrollModel.createMany({
            data: normalized.payrollEntries.map((entry) => ({
              id: entry.id,
              businessId,
              staffName: entry.staffName,
              role: entry.role || "",
              hours: Number(entry.hours || 0),
              hourlyRate: Number(entry.hourlyRate || 0),
              bonus: Number(entry.bonus || 0)
            }))
          });
        }

        await configModel.upsert({
          where: { businessId },
          update: {
            rent: Number(normalized.fixedCosts.rent || 0),
            utilities: Number(normalized.fixedCosts.utilities || 0),
            software: Number(normalized.fixedCosts.software || 0),
            other: Number(normalized.fixedCosts.other || 0),
            cogsPercent: Number(normalized.cogsPercent || 0)
          },
          create: {
            businessId,
            rent: Number(normalized.fixedCosts.rent || 0),
            utilities: Number(normalized.fixedCosts.utilities || 0),
            software: Number(normalized.fixedCosts.software || 0),
            other: Number(normalized.fixedCosts.other || 0),
            cogsPercent: Number(normalized.cogsPercent || 0)
          }
        });
        return normalized;
      } catch (error) {
        if (!isPrismaRevenueProfitabilityStorageUnavailable(error)) throw error;
      }
    }

    const all = await readProfitabilityInputsFile();
    all[businessId] = normalized;
    await writeProfitabilityInputsFile(all);
    return normalized;
  }

  return {
    normalizeRevenueChannel,
    normalizeRevenueSpendRecord,
    computeRevenueAttribution,
    normalizeProfitabilityRecord,
    computeProfitabilitySummary,
    loadRevenueSpendRecord,
    saveRevenueSpendRecord,
    loadProfitabilityRecord,
    saveProfitabilityRecord
  };
}
