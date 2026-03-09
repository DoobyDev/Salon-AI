export function createStaffRosterService({
  getPrisma,
  readStaffRosterFile,
  writeStaffRosterFile,
  supportedShiftDays,
  supportedStaffAvailability,
  supportedStaffRotaStatus,
  supportedStaffRotaShift,
  bookingDateRegex,
  randomUuid
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeShiftDays(input) {
    const values = Array.isArray(input) ? input : String(input || "").split(",");
    const normalized = values
      .map((v) => String(v || "").trim().toLowerCase())
      .filter((v) => supportedShiftDays.includes(v));
    return Array.from(new Set(normalized));
  }

  function summarizeStaffRoster(members) {
    const todayKey = supportedShiftDays[new Date().getDay()];
    const onDuty = members.filter((m) => m.availability === "on_duty");
    const scheduledToday = members.filter((m) => Array.isArray(m.shiftDays) && m.shiftDays.includes(todayKey));
    return {
      totalMembers: members.length,
      onDutyCount: onDuty.length,
      offDutyCount: members.length - onDuty.length,
      scheduledTodayCount: scheduledToday.length,
      estimatedChairCapacityToday: onDuty.length * 6
    };
  }

  function normalizeStaffMembers(rows) {
    const source = Array.isArray(rows) ? rows : [];
    return source
      .map((item) => ({
        id: String(item?.id || "").trim(),
        name: String(item?.name || "").trim(),
        role: String(item?.role || "staff").trim(),
        availability: supportedStaffAvailability.has(String(item?.availability || "").trim())
          ? String(item.availability)
          : "off_duty",
        shiftDays: normalizeShiftDays(item?.shiftDays),
        updatedAt: item?.updatedAt || null
      }))
      .filter((item) => item.id && item.name);
  }

  function normalizeWeekStartKey(input) {
    const value = String(input || "").trim();
    return bookingDateRegex.test(value) ? value : "";
  }

  function currentWeekStartKey() {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = base.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    base.setDate(base.getDate() + mondayOffset);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function normalizeStaffRotaShift(value) {
    const raw = String(value || "").trim().toLowerCase();
    return supportedStaffRotaShift.has(raw) ? raw : "full";
  }

  function normalizeStaffRotaStatus(value) {
    const raw = String(value || "").trim().toLowerCase();
    return supportedStaffRotaStatus.has(raw) ? raw : "off";
  }

  function normalizeStaffRotaDayKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    return supportedShiftDays.includes(raw) ? raw : "";
  }

  function normalizeStaffRotaCell(cell) {
    if (!cell || typeof cell !== "object") return null;
    return {
      status: normalizeStaffRotaStatus(cell.status),
      shift: normalizeStaffRotaShift(cell.shift),
      updatedAt: typeof cell.updatedAt === "string" ? cell.updatedAt : null,
      updatedByRole: typeof cell.updatedByRole === "string" ? String(cell.updatedByRole) : null
    };
  }

  function normalizeStaffRotaWeek(rawWeek) {
    const source = rawWeek && typeof rawWeek === "object" ? rawWeek : {};
    const rawCells = source.cells && typeof source.cells === "object" ? source.cells : {};
    const cells = {};
    Object.entries(rawCells).forEach(([staffId, dayMap]) => {
      const normalizedStaffId = String(staffId || "").trim();
      if (!normalizedStaffId || !dayMap || typeof dayMap !== "object") return;
      const normalizedDayMap = {};
      Object.entries(dayMap).forEach(([dayKey, cell]) => {
        const normalizedDay = normalizeStaffRotaDayKey(dayKey);
        if (!normalizedDay) return;
        const normalizedCell = normalizeStaffRotaCell(cell);
        if (!normalizedCell) return;
        normalizedDayMap[normalizedDay] = normalizedCell;
      });
      if (Object.keys(normalizedDayMap).length) cells[normalizedStaffId] = normalizedDayMap;
    });
    const sicknessLogs = Array.isArray(source.sicknessLogs)
      ? source.sicknessLogs
          .map((entry) => ({
            id: String(entry?.id || "").trim() || randomUuid(),
            staffId: String(entry?.staffId || "").trim(),
            staffName: String(entry?.staffName || "").trim(),
            day: normalizeStaffRotaDayKey(entry?.day),
            shift: normalizeStaffRotaShift(entry?.shift),
            replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
            weekStart: normalizeWeekStartKey(entry?.weekStart) || null,
            reportedAt: typeof entry?.reportedAt === "string" ? entry.reportedAt : null,
            actorId: typeof entry?.actorId === "string" ? entry.actorId : null,
            actorRole: typeof entry?.actorRole === "string" ? entry.actorRole : null
          }))
          .filter((entry) => entry.staffId && entry.day)
      : [];
    return {
      cells,
      sicknessLogs,
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null
    };
  }

  function getNormalizedStaffBusinessRecord(all, businessId) {
    const raw = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    return {
      ...raw,
      members: normalizeStaffMembers(raw.members || []),
      rotaWeeks:
        raw.rotaWeeks && typeof raw.rotaWeeks === "object"
          ? Object.fromEntries(
              Object.entries(raw.rotaWeeks)
                .map(([weekKey, week]) => [normalizeWeekStartKey(weekKey), normalizeStaffRotaWeek(week)])
                .filter(([weekKey]) => Boolean(weekKey))
            )
          : {}
    };
  }

  function getStaffRotaWeekPayload(businessRecord, weekStart) {
    const key = normalizeWeekStartKey(weekStart) || currentWeekStartKey();
    const week = normalizeStaffRotaWeek(businessRecord?.rotaWeeks?.[key]);
    return { weekStart: key, ...week };
  }

  function buildStaffRosterResponse(businessRecord, options = {}) {
    const members = normalizeStaffMembers(businessRecord?.members || []);
    const response = {
      members,
      summary: summarizeStaffRoster(members)
    };
    if (options.includeRotaWeek) {
      Object.assign(response, {
        rotaWeek: getStaffRotaWeekPayload(businessRecord, options.weekStart)
      });
    }
    return response;
  }

  function hasPrismaStaffRosterModels() {
    const prisma = prismaClient();
    const memberModel = prisma?.staffRosterMember;
    const weekModel = prisma?.staffRotaWeek;
    return Boolean(
      memberModel &&
      weekModel &&
      typeof memberModel.findMany === "function" &&
      typeof memberModel.deleteMany === "function" &&
      typeof memberModel.createMany === "function" &&
      typeof weekModel.findMany === "function" &&
      typeof weekModel.deleteMany === "function" &&
      typeof weekModel.createMany === "function"
    );
  }

  function isPrismaStaffRosterStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("staffroster") || msg.includes("staff rota") || msg.includes("staffrosta") || msg.includes("staffrota");
  }

  function mapStaffRosterMemberDbRow(row) {
    return {
      id: String(row?.id || "").trim(),
      name: String(row?.name || "").trim(),
      role: String(row?.role || "staff").trim(),
      availability: String(row?.availability || "off_duty").trim().toLowerCase(),
      shiftDays: Array.isArray(row?.shiftDays) ? row.shiftDays : [],
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
    };
  }

  function mapStaffRotaWeekDbRow(row) {
    return {
      cells: row?.cells && typeof row.cells === "object" ? row.cells : {},
      sicknessLogs: Array.isArray(row?.sicknessLogs) ? row.sicknessLogs : [],
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
    };
  }

  async function loadStaffBusinessRecordFromPrisma(businessId) {
    if (!hasPrismaStaffRosterModels()) return null;
    const prisma = prismaClient();
    try {
      const [memberRows, weekRows] = await Promise.all([
        prisma.staffRosterMember.findMany({
          where: { businessId },
          orderBy: [{ updatedAt: "asc" }, { id: "asc" }]
        }),
        prisma.staffRotaWeek.findMany({
          where: { businessId },
          orderBy: [{ weekStart: "asc" }]
        })
      ]);
      const rotaWeeks = {};
      weekRows.forEach((row) => {
        const key = normalizeWeekStartKey(row?.weekStart);
        if (!key) return;
        rotaWeeks[key] = normalizeStaffRotaWeek(mapStaffRotaWeekDbRow(row));
      });
      return {
        members: normalizeStaffMembers(memberRows.map(mapStaffRosterMemberDbRow)),
        rotaWeeks
      };
    } catch (error) {
      if (isPrismaStaffRosterStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function loadStaffBusinessRecord(businessId) {
    const dbRecord = await loadStaffBusinessRecordFromPrisma(businessId);
    if (dbRecord) return dbRecord;
    const all = await readStaffRosterFile();
    return getNormalizedStaffBusinessRecord(all, businessId);
  }

  async function saveStaffBusinessRecord(businessId, businessRecord) {
    const normalized = {
      members: normalizeStaffMembers(businessRecord?.members || []),
      rotaWeeks:
        businessRecord?.rotaWeeks && typeof businessRecord.rotaWeeks === "object"
          ? Object.fromEntries(
              Object.entries(businessRecord.rotaWeeks)
                .map(([weekKey, week]) => [normalizeWeekStartKey(weekKey), normalizeStaffRotaWeek(week)])
                .filter(([weekKey]) => Boolean(weekKey))
            )
          : {}
    };

    if (hasPrismaStaffRosterModels()) {
      const prisma = prismaClient();
      try {
        const memberData = normalized.members.map((member) => ({
          id: member.id,
          businessId,
          name: member.name,
          role: member.role || "staff",
          availability: member.availability || "off_duty",
          shiftDays: member.shiftDays || []
        }));
        const weekData = Object.entries(normalized.rotaWeeks).map(([weekStart, week]) => ({
          id: randomUuid(),
          businessId,
          weekStart,
          cells: week?.cells && typeof week.cells === "object" ? week.cells : {},
          sicknessLogs: Array.isArray(week?.sicknessLogs) ? week.sicknessLogs : []
        }));

        await prisma.staffRosterMember.deleteMany({ where: { businessId } });
        if (memberData.length) await prisma.staffRosterMember.createMany({ data: memberData });

        await prisma.staffRotaWeek.deleteMany({ where: { businessId } });
        if (weekData.length) await prisma.staffRotaWeek.createMany({ data: weekData });
        return normalized;
      } catch (error) {
        if (!isPrismaStaffRosterStorageUnavailable(error)) throw error;
      }
    }

    const all = await readStaffRosterFile();
    all[businessId] = normalized;
    await writeStaffRosterFile(all);
    return normalized;
  }

  async function upsertStaffMember(businessId, payload) {
    const businessRecord = await loadStaffBusinessRecord(businessId);
    const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
    const existingIndex = members.findIndex((member) => String(member?.id || "") === payload.id);
    const member = {
      id: payload.id,
      name: payload.name,
      role: payload.role || "staff",
      availability: payload.availability,
      shiftDays: normalizeShiftDays(payload.shiftDays),
      updatedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) members[existingIndex] = member;
    else members.push(member);
    businessRecord.members = members;
    await saveStaffBusinessRecord(businessId, businessRecord);
    return {
      member,
      businessRecord,
      response: buildStaffRosterResponse(businessRecord, {
        includeRotaWeek: true,
        weekStart: payload.weekStart
      })
    };
  }

  async function updateStaffAvailability(businessId, staffId, availability, weekStart) {
    const businessRecord = await loadStaffBusinessRecord(businessId);
    const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
    const index = members.findIndex((member) => String(member?.id || "") === staffId);
    if (index < 0) throw Object.assign(new Error("Staff member not found."), { statusCode: 404 });
    members[index] = {
      ...members[index],
      availability,
      updatedAt: new Date().toISOString()
    };
    businessRecord.members = members;
    await saveStaffBusinessRecord(businessId, businessRecord);
    return {
      member: members[index],
      businessRecord,
      response: buildStaffRosterResponse(businessRecord, {
        includeRotaWeek: true,
        weekStart
      })
    };
  }

  async function removeStaffMember(businessId, staffId, weekStart) {
    const businessRecord = await loadStaffBusinessRecord(businessId);
    const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
    const filtered = members.filter((member) => String(member?.id || "") !== staffId);
    if (filtered.length === members.length) throw Object.assign(new Error("Staff member not found."), { statusCode: 404 });
    businessRecord.members = filtered;

    if (businessRecord.rotaWeeks && typeof businessRecord.rotaWeeks === "object") {
      Object.values(businessRecord.rotaWeeks).forEach((week) => {
        if (!week || typeof week !== "object") return;
        if (week.cells && typeof week.cells === "object") delete week.cells[staffId];
        if (Array.isArray(week.sicknessLogs)) {
          week.sicknessLogs = week.sicknessLogs.filter((entry) => String(entry?.staffId || "") !== staffId);
        }
      });
    }

    await saveStaffBusinessRecord(businessId, businessRecord);
    return buildStaffRosterResponse(businessRecord, {
      includeRotaWeek: true,
      weekStart
    });
  }

  async function updateRotaWeekBulk(businessId, { weekStart, updates, appendSicknessLogs, actorId, actorRole }) {
    const resolvedWeekStart = normalizeWeekStartKey(weekStart) || currentWeekStartKey();
    const businessRecord = await loadStaffBusinessRecord(businessId);
    const members = normalizeStaffMembers(businessRecord.members || []);
    const validIds = new Set(members.map((member) => String(member.id)));
    if (!businessRecord.rotaWeeks || typeof businessRecord.rotaWeeks !== "object") businessRecord.rotaWeeks = {};
    const week = normalizeStaffRotaWeek(businessRecord.rotaWeeks[resolvedWeekStart]);
    if (!week.cells || typeof week.cells !== "object") week.cells = {};
    const now = new Date().toISOString();

    let applied = 0;
    (Array.isArray(updates) ? updates : []).forEach((item) => {
      const staffId = String(item?.staffId || "").trim();
      const day = normalizeStaffRotaDayKey(item?.day);
      if (!staffId || !day || !validIds.has(staffId)) return;
      if (!week.cells[staffId] || typeof week.cells[staffId] !== "object") week.cells[staffId] = {};
      week.cells[staffId][day] = {
        status: normalizeStaffRotaStatus(item?.status),
        shift: normalizeStaffRotaShift(item?.shift),
        updatedAt: now,
        updatedByRole: String(actorRole || "")
      };
      applied += 1;
    });

    const inputLogs = Array.isArray(appendSicknessLogs) ? appendSicknessLogs : [];
    if (inputLogs.length) {
      const safeLogs = inputLogs
        .map((entry) => ({
          id: String(entry?.id || "").trim() || randomUuid(),
          staffId: String(entry?.staffId || "").trim(),
          staffName: String(entry?.staffName || "").trim(),
          day: normalizeStaffRotaDayKey(entry?.day),
          shift: normalizeStaffRotaShift(entry?.shift),
          replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
          weekStart: resolvedWeekStart,
          reportedAt: now,
          actorId,
          actorRole
        }))
        .filter((entry) => entry.staffId && validIds.has(entry.staffId) && entry.day);
      week.sicknessLogs = [...(Array.isArray(week.sicknessLogs) ? week.sicknessLogs : []), ...safeLogs].slice(-100);
    }

    week.updatedAt = now;
    businessRecord.rotaWeeks[resolvedWeekStart] = week;
    await saveStaffBusinessRecord(businessId, businessRecord);

    return {
      weekStart: resolvedWeekStart,
      payload: getStaffRotaWeekPayload(businessRecord, resolvedWeekStart),
      appliedUpdates: applied,
      sicknessLogs: inputLogs.length
    };
  }

  async function resetRotaWeek(businessId, weekStart) {
    const resolvedWeekStart = normalizeWeekStartKey(weekStart) || currentWeekStartKey();
    const businessRecord = await loadStaffBusinessRecord(businessId);
    if (!businessRecord.rotaWeeks || typeof businessRecord.rotaWeeks !== "object") businessRecord.rotaWeeks = {};
    delete businessRecord.rotaWeeks[resolvedWeekStart];
    await saveStaffBusinessRecord(businessId, businessRecord);
    return {
      weekStart: resolvedWeekStart,
      payload: getStaffRotaWeekPayload(businessRecord, resolvedWeekStart)
    };
  }

  return {
    normalizeShiftDays,
    summarizeStaffRoster,
    normalizeStaffMembers,
    normalizeWeekStartKey,
    currentWeekStartKey,
    normalizeStaffRotaShift,
    normalizeStaffRotaStatus,
    normalizeStaffRotaDayKey,
    normalizeStaffRotaWeek,
    getStaffRotaWeekPayload,
    buildStaffRosterResponse,
    loadStaffBusinessRecord,
    saveStaffBusinessRecord,
    upsertStaffMember,
    updateStaffAvailability,
    removeStaffMember,
    updateRotaWeekBulk,
    resetRotaWeek
  };
}
