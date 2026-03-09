export function createAccountingIntegrationsService({
  getPrisma,
  supportedAccountingProviders = [],
  readAccountingIntegrationsFile,
  writeAccountingIntegrationsFile
} = {}) {
  const providerList = Array.isArray(supportedAccountingProviders) ? supportedAccountingProviders : [];
  const providerSet = new Set(providerList);

  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeAccountingProvider(input) {
    const provider = String(input || "").trim().toLowerCase();
    return providerSet.has(provider) ? provider : "";
  }

  function summarizeBusinessAccountingIntegrations(businessRecord = {}) {
    return providerList.map((provider) => {
      const item = businessRecord?.[provider];
      return {
        provider,
        status: item?.status === "connected" ? "connected" : "not_connected",
        connected: item?.status === "connected",
        accountLabel: String(item?.accountLabel || ""),
        syncMode: String(item?.syncMode || "daily"),
        connectedAt: item?.connectedAt || null,
        updatedAt: item?.updatedAt || null
      };
    });
  }

  function isPrismaAccountingIntegrationsStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("accounting") || msg.includes("integration");
  }

  async function loadAccountingIntegrationsRecordFromPrisma(businessId) {
    const model = prismaClient()?.accountingIntegration;
    if (!model || typeof model.findMany !== "function") return null;
    try {
      const rows = await model.findMany({
        where: { businessId },
        orderBy: [{ provider: "asc" }]
      });
      const record = {};
      rows.forEach((row) => {
        const provider = normalizeAccountingProvider(row?.provider);
        if (!provider) return;
        record[provider] = {
          provider,
          status: String(row?.status || "not_connected"),
          accountLabel: String(row?.accountLabel || ""),
          syncMode: String(row?.syncMode || "daily"),
          connectedAt: row?.connectedAt ? new Date(row.connectedAt).toISOString() : null,
          updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
        };
      });
      return record;
    } catch (error) {
      if (isPrismaAccountingIntegrationsStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function loadAccountingIntegrationsRecord(businessId) {
    const dbRecord = await loadAccountingIntegrationsRecordFromPrisma(businessId);
    if (dbRecord) return dbRecord;
    const all = await readAccountingIntegrationsFile();
    return all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  }

  async function saveAccountingIntegrationsRecord(businessId, record) {
    const normalized = {};
    summarizeBusinessAccountingIntegrations(record).forEach((row) => {
      normalized[row.provider] = {
        provider: row.provider,
        status: row.status,
        accountLabel: row.accountLabel,
        syncMode: row.syncMode,
        connectedAt: row.connectedAt,
        updatedAt: row.updatedAt
      };
    });

    const model = prismaClient()?.accountingIntegration;
    if (model && typeof model.deleteMany === "function" && typeof model.createMany === "function") {
      try {
        await model.deleteMany({ where: { businessId } });
        const rows = Object.values(normalized).map((row) => ({
          id: `${businessId}:${row.provider}`,
          businessId,
          provider: row.provider,
          status: String(row.status || "not_connected"),
          accountLabel: String(row.accountLabel || ""),
          syncMode: String(row.syncMode || "daily"),
          connectedAt: row.connectedAt ? new Date(row.connectedAt) : null
        }));
        if (rows.length) {
          await model.createMany({ data: rows });
        }
        return normalized;
      } catch (error) {
        if (!isPrismaAccountingIntegrationsStorageUnavailable(error)) throw error;
      }
    }

    const all = await readAccountingIntegrationsFile();
    all[businessId] = normalized;
    await writeAccountingIntegrationsFile(all);
    return normalized;
  }

  async function connectAccountingIntegration(businessId, { provider, accountLabel, syncMode }) {
    const businessRecord = await loadAccountingIntegrationsRecord(businessId);
    const now = new Date().toISOString();
    businessRecord[provider] = {
      provider,
      status: "connected",
      accountLabel,
      syncMode,
      connectedAt: businessRecord?.[provider]?.connectedAt || now,
      updatedAt: now
    };
    await saveAccountingIntegrationsRecord(businessId, businessRecord);
    return {
      provider: businessRecord[provider],
      providers: summarizeBusinessAccountingIntegrations(businessRecord)
    };
  }

  async function disconnectAccountingIntegration(businessId, provider) {
    const businessRecord = await loadAccountingIntegrationsRecord(businessId);
    const existing = businessRecord?.[provider];
    if (!existing || existing.status !== "connected") {
      throw Object.assign(new Error("Provider is not connected for this business."), { statusCode: 404 });
    }
    const now = new Date().toISOString();
    businessRecord[provider] = {
      provider,
      status: "not_connected",
      accountLabel: "",
      syncMode: existing.syncMode || "daily",
      connectedAt: null,
      updatedAt: now
    };
    await saveAccountingIntegrationsRecord(businessId, businessRecord);
    return {
      provider: businessRecord[provider],
      providers: summarizeBusinessAccountingIntegrations(businessRecord)
    };
  }

  return {
    normalizeAccountingProvider,
    summarizeBusinessAccountingIntegrations,
    loadAccountingIntegrationsRecord,
    saveAccountingIntegrationsRecord,
    connectAccountingIntegration,
    disconnectAccountingIntegration
  };
}
