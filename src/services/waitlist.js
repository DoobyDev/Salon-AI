export function createWaitlistService({
  getPrisma,
  supportedWaitlistStatus,
  readWaitlistFile,
  writeWaitlistFile
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeWaitlistRows(rows) {
    const source = Array.isArray(rows) ? rows : [];
    return source
      .map((item) => ({
        id: String(item?.id || "").trim(),
        customerName: String(item?.customerName || "").trim(),
        customerPhone: String(item?.customerPhone || "").trim(),
        customerEmail: String(item?.customerEmail || "").trim().toLowerCase(),
        service: String(item?.service || "").trim(),
        preferredDate: String(item?.preferredDate || "").trim(),
        preferredTime: String(item?.preferredTime || "").trim(),
        status: supportedWaitlistStatus.has(String(item?.status || "").trim()) ? String(item.status) : "waiting",
        notes: String(item?.notes || "").trim(),
        createdAt: item?.createdAt || null,
        updatedAt: item?.updatedAt || null,
        lastActionAt: item?.lastActionAt || null
      }))
      .filter((item) => item.id && item.customerName);
  }

  function summarizeWaitlist(rows) {
    const entries = normalizeWaitlistRows(rows);
    const waiting = entries.filter((e) => e.status === "waiting").length;
    const contacted = entries.filter((e) => e.status === "contacted").length;
    const booked = entries.filter((e) => e.status === "booked").length;
    return {
      totalEntries: entries.length,
      waitingCount: waiting,
      contactedCount: contacted,
      bookedCount: booked
    };
  }

  function hasPrismaWaitlistModel() {
    const prisma = prismaClient();
    const model = prisma?.waitlistEntry;
    return Boolean(
      model &&
      typeof model.findMany === "function" &&
      typeof model.findUnique === "function" &&
      typeof model.create === "function" &&
      typeof model.update === "function" &&
      typeof model.delete === "function"
    );
  }

  function isPrismaWaitlistStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("waitlist") && (msg.includes("does not exist") || msg.includes("unknown") || msg.includes("table"));
  }

  function mapWaitlistDbRow(row) {
    if (!row || typeof row !== "object") return null;
    return {
      id: String(row.id || "").trim(),
      customerName: String(row.customerName || "").trim(),
      customerPhone: String(row.customerPhone || "").trim(),
      customerEmail: String(row.customerEmail || "").trim().toLowerCase(),
      service: String(row.service || "").trim(),
      preferredDate: String(row.preferredDate || "").trim(),
      preferredTime: String(row.preferredTime || "").trim(),
      status: supportedWaitlistStatus.has(String(row.status || "").trim()) ? String(row.status) : "waiting",
      notes: String(row.notes || "").trim(),
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      lastActionAt: row.lastActionAt ? new Date(row.lastActionAt).toISOString() : null
    };
  }

  async function listWaitlistEntriesForBusiness(businessId) {
    if (!hasPrismaWaitlistModel()) return null;
    const prisma = prismaClient();
    try {
      const rows = await prisma.waitlistEntry.findMany({
        where: { businessId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }]
      });
      return normalizeWaitlistRows(rows.map(mapWaitlistDbRow));
    } catch (error) {
      if (isPrismaWaitlistStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function getWaitlistEntriesForBusiness(businessId) {
    const dbRows = await listWaitlistEntriesForBusiness(businessId);
    if (dbRows) return dbRows;
    const all = await readWaitlistFile();
    return normalizeWaitlistRows(all?.[businessId]?.entries || []);
  }

  async function upsertWaitlistEntryForBusiness(businessId, payload) {
    if (hasPrismaWaitlistModel()) {
      const prisma = prismaClient();
      try {
        const existing = await prisma.waitlistEntry.findUnique({ where: { id: payload.id } });
        if (existing && existing.businessId !== businessId) {
          throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
        }
        const row = existing
          ? await prisma.waitlistEntry.update({
            where: { id: payload.id },
            data: {
              customerName: payload.customerName,
              customerPhone: payload.customerPhone || "",
              customerEmail: payload.customerEmail || null,
              service: payload.service || "",
              preferredDate: payload.preferredDate || null,
              preferredTime: payload.preferredTime || null,
              notes: payload.notes || null,
              status: "waiting"
            }
          })
          : await prisma.waitlistEntry.create({
            data: {
              id: payload.id,
              businessId,
              customerName: payload.customerName,
              customerPhone: payload.customerPhone || "",
              customerEmail: payload.customerEmail || null,
              service: payload.service || "",
              preferredDate: payload.preferredDate || null,
              preferredTime: payload.preferredTime || null,
              notes: payload.notes || null,
              status: "waiting",
              lastActionAt: null
            }
          });
        const entries = await listWaitlistEntriesForBusiness(businessId);
        return { entry: mapWaitlistDbRow(row), entries: entries || [] };
      } catch (error) {
        if (error?.statusCode) throw error;
        if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
      }
    }

    const all = await readWaitlistFile();
    const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    const entries = normalizeWaitlistRows(businessRecord.entries || []);
    const index = entries.findIndex((item) => item.id === payload.id);
    const now = new Date().toISOString();
    const next = {
      id: payload.id,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      service: payload.service,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      notes: payload.notes,
      status: "waiting",
      createdAt: index >= 0 ? entries[index].createdAt || now : now,
      updatedAt: now,
      lastActionAt: index >= 0 ? entries[index].lastActionAt || null : null
    };
    if (index >= 0) entries[index] = next;
    else entries.push(next);
    businessRecord.entries = entries;
    all[businessId] = businessRecord;
    await writeWaitlistFile(all);
    return { entry: next, entries };
  }

  async function markWaitlistEntryContactedForBusiness(businessId, entryId) {
    if (hasPrismaWaitlistModel()) {
      const prisma = prismaClient();
      try {
        const existing = await prisma.waitlistEntry.findUnique({ where: { id: entryId } });
        if (!existing || existing.businessId !== businessId) {
          throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
        }
        const row = await prisma.waitlistEntry.update({
          where: { id: entryId },
          data: {
            status: "contacted",
            lastActionAt: new Date()
          }
        });
        const entries = await listWaitlistEntriesForBusiness(businessId);
        return { entry: mapWaitlistDbRow(row), entries: entries || [] };
      } catch (error) {
        if (error?.statusCode) throw error;
        if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
      }
    }

    const all = await readWaitlistFile();
    const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    const entries = normalizeWaitlistRows(businessRecord.entries || []);
    const index = entries.findIndex((item) => item.id === entryId);
    if (index < 0) {
      throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
    }
    const now = new Date().toISOString();
    entries[index] = {
      ...entries[index],
      status: "contacted",
      updatedAt: now,
      lastActionAt: now
    };
    businessRecord.entries = entries;
    all[businessId] = businessRecord;
    await writeWaitlistFile(all);
    return { entry: entries[index], entries };
  }

  async function deleteWaitlistEntryForBusiness(businessId, entryId) {
    if (hasPrismaWaitlistModel()) {
      const prisma = prismaClient();
      try {
        const existing = await prisma.waitlistEntry.findUnique({ where: { id: entryId } });
        if (!existing || existing.businessId !== businessId) {
          throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
        }
        await prisma.waitlistEntry.delete({ where: { id: entryId } });
        const entries = await listWaitlistEntriesForBusiness(businessId);
        return { entries: entries || [] };
      } catch (error) {
        if (error?.statusCode) throw error;
        if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
      }
    }

    const all = await readWaitlistFile();
    const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    const entries = normalizeWaitlistRows(businessRecord.entries || []);
    const filtered = entries.filter((item) => item.id !== entryId);
    if (filtered.length === entries.length) {
      throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
    }
    businessRecord.entries = filtered;
    all[businessId] = businessRecord;
    await writeWaitlistFile(all);
    return { entries: filtered };
  }

  return {
    normalizeWaitlistRows,
    summarizeWaitlist,
    listWaitlistEntriesForBusiness,
    getWaitlistEntriesForBusiness,
    upsertWaitlistEntryForBusiness,
    markWaitlistEntryContactedForBusiness,
    deleteWaitlistEntryForBusiness
  };
}
