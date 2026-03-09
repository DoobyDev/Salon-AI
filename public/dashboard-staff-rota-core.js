// Staff rota core runtime for state, snapshot, and update workflows.
export function createStaffRotaCoreRuntime(deps) {
  const {
    win = window,
    STAFF_ROTA_DAYS = [],
    getStaffRotaOverrides,
    setStaffRotaOverrides,
    getStaffRotaOverridesLoaded,
    loadStaffRotaOverrides,
    saveStaffRotaOverrides,
    getStaffWeekKey,
    getStaffWeekMeta,
    getStaffRosterRows,
    setStaffRosterRows,
    setStaffSummary,
    setStaffRotaOverridesLoaded,
    getStaffRotaSelectedMemberId,
    setStaffRotaSelectedMemberId,
    normalizeStaffCellStatus,
    normalizeStaffShiftType,
    getStaffRoleLabel,
    getStaffShiftLabel,
    renderStaffSummary,
    renderStaffRoster,
    renderSubscriberCalendar,
    setStaffStatus,
    showManageToast,
    persistStaffRotaBulk,
    openManageForm
  } = deps || {};

  function getStaffMemberId(member) {
    return String(member?.id || member?.name || "").trim();
  }

  function getStaffWeekOverridesBucket(createIfMissing = false) {
    const weekKey = getStaffWeekKey?.();
    let overrides = getStaffRotaOverrides?.();
    if (!overrides || typeof overrides !== "object") {
      overrides = {};
      setStaffRotaOverrides?.(overrides);
    }
    if (!overrides[weekKey] && createIfMissing) {
      overrides[weekKey] = { cells: {}, sicknessLogs: [], updatedAt: null };
    }
    return overrides[weekKey] || null;
  }

  function getStaffMemberWeekOverrides(memberId, createIfMissing = false) {
    const bucket = getStaffWeekOverridesBucket(createIfMissing);
    if (!bucket) return null;
    if (!bucket.cells || typeof bucket.cells !== "object") bucket.cells = {};
    if (!bucket.cells[memberId] && createIfMissing) bucket.cells[memberId] = {};
    return bucket.cells[memberId] || null;
  }

  function getBaseStaffDayStatus(member, dayKey) {
    const shiftDays = Array.isArray(member?.shiftDays)
      ? member.shiftDays.map((d) => String(d || "").trim().toLowerCase()).filter(Boolean)
      : [];
    const scheduled = shiftDays.includes(String(dayKey || "").toLowerCase());
    if (scheduled) return member?.availability === "off_duty" ? "off" : "scheduled";
    return member?.availability === "on_duty" ? "available" : "off";
  }

  function getStaffDayState(member, dayKey) {
    const memberId = getStaffMemberId(member);
    const overrides = memberId ? getStaffMemberWeekOverrides(memberId) : null;
    const override = overrides ? overrides[String(dayKey || "").toLowerCase()] : null;
    if (override && typeof override === "object") {
      return {
        status: normalizeStaffCellStatus?.(override.status),
        shift: normalizeStaffShiftType?.(override.shift)
      };
    }
    if (typeof override === "string" && override) {
      return {
        status: normalizeStaffCellStatus?.(override),
        shift: "full"
      };
    }
    return {
      status: getBaseStaffDayStatus(member, dayKey),
      shift: "full"
    };
  }

  function getStaffDayStatus(member, dayKey) {
    return getStaffDayState(member, dayKey).status;
  }

  function getStaffDayShift(member, dayKey) {
    return getStaffDayState(member, dayKey).shift;
  }

  function setStaffDayState(memberId, dayKey, { status, shift } = {}) {
    const nextStatus = normalizeStaffCellStatus?.(status);
    const nextShift = normalizeStaffShiftType?.(shift);
    const bucket = getStaffMemberWeekOverrides(memberId, true);
    if (!bucket) return;
    bucket[String(dayKey || "").toLowerCase()] = { status: nextStatus, shift: nextShift };
    saveStaffRotaOverrides?.();
  }

  function setStaffDayStatus(memberId, dayKey, status) {
    setStaffDayState(memberId, dayKey, { status, shift: "full" });
  }

  function clearStaffWeekOverrides() {
    const weekKey = getStaffWeekKey?.();
    const overrides = getStaffRotaOverrides?.();
    if (overrides && overrides[weekKey]) {
      delete overrides[weekKey];
      saveStaffRotaOverrides?.();
    }
  }

  function pruneStaffRotaOverridesForCurrentRoster() {
    const validIds = new Set((Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).map((m) => getStaffMemberId(m)).filter(Boolean));
    const overrides = getStaffRotaOverrides?.();
    if (!overrides || typeof overrides !== "object") return;
    let changed = false;
    Object.keys(overrides).forEach((weekKey) => {
      const week = overrides[weekKey];
      if (!week || typeof week !== "object") {
        delete overrides[weekKey];
        changed = true;
        return;
      }
      const cells = week.cells && typeof week.cells === "object" ? week.cells : {};
      Object.keys(cells).forEach((memberId) => {
        if (!validIds.has(memberId)) {
          delete cells[memberId];
          changed = true;
        }
      });
      week.cells = cells;
      if (Array.isArray(week.sicknessLogs)) {
        const before = week.sicknessLogs.length;
        week.sicknessLogs = week.sicknessLogs.filter((entry) => validIds.has(String(entry?.staffId || "")));
        if (week.sicknessLogs.length !== before) changed = true;
      } else {
        week.sicknessLogs = [];
      }
      if (!Object.keys(week.cells).length && (!week.sicknessLogs || !week.sicknessLogs.length)) {
        delete overrides[weekKey];
        changed = true;
      }
    });
    if (changed) saveStaffRotaOverrides?.();
  }

  function getStaffColorForId(staffId) {
    const id = String(staffId || "").trim();
    if (!id) return "#7cead8";
    const palette = [
      "#ff7aa8", "#6db9ff", "#7cead8", "#b891ff", "#ffc35c", "#5ad0ff", "#b7df5a", "#f091ff",
      "#ff9a6a", "#88a9ff", "#5fd8a7", "#d79b5a", "#ff6f91", "#4cb5ff", "#45d7c0", "#9b7cff",
      "#f7b84b", "#33c8ff", "#9ad94a", "#df77ff", "#ff8652", "#7397ff", "#43c98f", "#c58a45",
      "#ff5fbe", "#58a6ff", "#3fdcc8", "#a98dff", "#ffd166", "#4fd1c5", "#a3e635", "#e879f9"
    ];

    const knownIds = new Set([id]);
    (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).forEach((member) => {
      const memberId = String(getStaffMemberId(member) || "").trim();
      if (memberId) knownIds.add(memberId);
    });

    const orderedIds = Array.from(knownIds).sort();
    const usedPaletteSlots = new Set();
    const assigned = new Map();

    orderedIds.forEach((staffKey, orderIndex) => {
      let hash = 0;
      for (let i = 0; i < staffKey.length; i += 1) {
        hash = (hash * 31 + staffKey.charCodeAt(i)) | 0;
      }
      let paletteIndex = Math.abs(hash) % palette.length;
      let guard = 0;
      while (usedPaletteSlots.has(paletteIndex) && guard < palette.length) {
        paletteIndex = (paletteIndex + 1) % palette.length;
        guard += 1;
      }

      if (guard < palette.length) {
        usedPaletteSlots.add(paletteIndex);
        assigned.set(staffKey, palette[paletteIndex]);
        return;
      }

      const hue = (orderIndex * 137.508) % 360;
      const sat = 76;
      const light = 64 - ((Math.floor(orderIndex / palette.length) % 3) * 7);
      assigned.set(staffKey, `hsl(${hue.toFixed(1)}deg ${sat}% ${light}%)`);
    });

    return assigned.get(id) || palette[0];
  }

  function buildStaffRotaSnapshot() {
    if (!getStaffRotaOverridesLoaded?.()) loadStaffRotaOverrides?.();
    const weekDays = Array.isArray(getStaffWeekMeta?.()) ? getStaffWeekMeta() : STAFF_ROTA_DAYS.map((day) => ({ ...day }));
    const members = Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : [];
    const weekBucket = getStaffWeekOverridesBucket(false);
    const rows = members.map((member) => ({
      member,
      memberId: getStaffMemberId(member),
      days: weekDays.map((d) => {
        const state = getStaffDayState(member, d.key);
        return { ...d, status: state.status, shift: state.shift };
      })
    }));
    const dayStats = weekDays.map((day) => {
      let scheduled = 0;
      let available = 0;
      let off = 0;
      let sick = 0;
      let covering = 0;
      rows.forEach((row) => {
        const status = row.days.find((d) => d.key === day.key)?.status || "off";
        if (status === "scheduled") scheduled += 1;
        else if (status === "available") available += 1;
        else if (status === "sick") sick += 1;
        else if (status === "covering") covering += 1;
        else off += 1;
      });
      const isWeekend = day.key === "sat" || day.key === "sun";
      const target = isWeekend ? 3 : 2;
      const activeCoverage = scheduled + covering;
      const gap = Math.max(0, target - activeCoverage);
      return { ...day, scheduled, available, off, sick, covering, target, activeCoverage, gap };
    });
    return {
      weekDays,
      rows,
      dayStats,
      sicknessLogs: Array.isArray(weekBucket?.sicknessLogs) ? weekBucket.sicknessLogs : []
    };
  }

  function findCoverCandidatesForDay(dayKey, excludedMemberId = "") {
    const candidates = [];
    (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).forEach((member) => {
      const memberId = getStaffMemberId(member);
      if (!memberId || memberId === excludedMemberId) return;
      const status = getStaffDayStatus(member, dayKey);
      if (status === "available" || status === "scheduled") {
        candidates.push({
          id: memberId,
          name: member.name || "Staff",
          role: getStaffRoleLabel?.(member.role),
          status
        });
      }
    });
    return candidates;
  }

  function getCurrentRotaBrush({ staffBrushStatusSelect, staffBrushShiftSelect } = {}) {
    return {
      status: normalizeStaffCellStatus?.(staffBrushStatusSelect?.value || "scheduled"),
      shift: normalizeStaffShiftType?.(staffBrushShiftSelect?.value || "full")
    };
  }

  async function applyStaffRotaUpdates(updates = [], { sicknessLogs = [], silent = false } = {}) {
    const normalizedUpdates = (Array.isArray(updates) ? updates : [])
      .map((u) => ({
        staffId: String(u?.staffId || "").trim(),
        day: String(u?.day || "").trim().toLowerCase(),
        status: normalizeStaffCellStatus?.(u?.status),
        shift: normalizeStaffShiftType?.(u?.shift)
      }))
      .filter((u) => u.staffId && STAFF_ROTA_DAYS.some((d) => d.key === u.day));
    if (!normalizedUpdates.length && !(Array.isArray(sicknessLogs) && sicknessLogs.length)) return 0;
    normalizedUpdates.forEach((u) => setStaffDayState(u.staffId, u.day, { status: u.status, shift: u.shift }));
    renderStaffSummary?.();
    renderStaffRoster?.();
    try {
      await persistStaffRotaBulk?.({ updates: normalizedUpdates, sicknessLogs });
    } catch (error) {
      if (!silent) setStaffStatus?.(error.message, true);
      throw error;
    }
    return normalizedUpdates.length;
  }

  function loadStaffDemoRotaPreview() {
    const demoMembers = [
      { id: "demo-s1", name: "Ava Stone", role: "stylist", availability: "on_duty", shiftDays: ["mon", "tue", "wed", "fri"] },
      { id: "demo-s2", name: "Mia Brooks", role: "colorist", availability: "on_duty", shiftDays: ["tue", "wed", "thu", "sat"] },
      { id: "demo-s3", name: "Noah Reed", role: "barber", availability: "on_duty", shiftDays: ["mon", "thu", "fri", "sat"] },
      { id: "demo-s4", name: "Luca Hayes", role: "receptionist", availability: "on_duty", shiftDays: ["mon", "tue", "wed", "thu", "fri"] },
      { id: "demo-s5", name: "Ella Quinn", role: "esthetician", availability: "off_duty", shiftDays: ["sat", "sun"] }
    ].map((m) => ({ ...m, updatedAt: new Date().toISOString() }));

    const weekKey = getStaffWeekKey?.();
    let overrides = getStaffRotaOverrides?.();
    if (!overrides || typeof overrides !== "object") overrides = {};
    overrides[weekKey] = {
      cells: {
        "demo-s1": { mon: { status: "scheduled", shift: "full" }, tue: { status: "scheduled", shift: "am" }, wed: { status: "sick", shift: "full" }, fri: { status: "scheduled", shift: "pm" } },
        "demo-s2": { tue: { status: "scheduled", shift: "pm" }, wed: { status: "covering", shift: "full" }, thu: { status: "scheduled", shift: "full" }, sat: { status: "scheduled", shift: "full" } },
        "demo-s3": { mon: { status: "scheduled", shift: "full" }, thu: { status: "available", shift: "full" }, fri: { status: "scheduled", shift: "full" }, sat: { status: "scheduled", shift: "am" } },
        "demo-s4": { mon: { status: "scheduled", shift: "full" }, tue: { status: "scheduled", shift: "full" }, wed: { status: "scheduled", shift: "full" }, thu: { status: "scheduled", shift: "full" }, fri: { status: "scheduled", shift: "full" } },
        "demo-s5": { sat: { status: "scheduled", shift: "pm" }, sun: { status: "available", shift: "am" } }
      },
      sicknessLogs: [
        {
          id: `demo-log-${weekKey}`,
          staffId: "demo-s1",
          staffName: "Ava Stone",
          day: "wed",
          shift: "full",
          replacementMode: "auto",
          weekStart: weekKey,
          reportedAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setStaffRotaOverrides?.(overrides);
    setStaffRotaOverridesLoaded?.(true);
    saveStaffRotaOverrides?.();

    setStaffRosterRows?.(demoMembers);
    setStaffSummary?.({
      totalMembers: demoMembers.length,
      onDutyCount: demoMembers.filter((m) => m.availability === "on_duty").length,
      offDutyCount: demoMembers.filter((m) => m.availability !== "on_duty").length,
      scheduledTodayCount: 3,
      estimatedChairCapacityToday: 18
    });
    setStaffRotaSelectedMemberId?.("demo-s1");
    renderStaffSummary?.();
    renderStaffRoster?.();
    renderSubscriberCalendar?.();
    setStaffStatus?.("Demo rota preview loaded (local preview only).");
  }

  async function promptStaffSickReport(staffId) {
    const member = (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).find((row) => String(row.id || "") === String(staffId || ""));
    if (!member) return false;
    const values = await openManageForm?.({
      title: "Record Staff Sickness",
      submitLabel: "Apply",
      fields: [
        {
          id: "day",
          label: "Sickness applies to",
          type: "select",
          value: "today",
          options: [
            { value: "today", label: "Today" },
            { value: "all_scheduled", label: "All scheduled days this week" },
            ...STAFF_ROTA_DAYS.map((day) => ({ value: day.key, label: `${day.label} (${day.key.toUpperCase()})` }))
          ]
        },
        {
          id: "replace",
          label: "Try cover action",
          type: "select",
          value: "suggest",
          options: [
            { value: "suggest", label: "Suggest cover only" },
            { value: "auto", label: "Auto-assign cover where possible" }
          ]
        },
        {
          id: "shift",
          label: "Shift",
          type: "select",
          value: "full",
          options: [
            { value: "full", label: "Full day" },
            { value: "am", label: "AM" },
            { value: "pm", label: "PM" }
          ]
        }
      ]
    });
    if (!values) return false;
    const todayIndex = new Date().getDay();
    const todayKey = todayIndex === 0 ? "sun" : STAFF_ROTA_DAYS[todayIndex - 1]?.key || "mon";
    const selectedDay = String(values.day || "today").trim().toLowerCase();
    let targetDays = [];
    if (selectedDay === "today") {
      targetDays = [todayKey];
    } else if (selectedDay === "all_scheduled") {
      targetDays = STAFF_ROTA_DAYS.map((d) => d.key).filter((dayKey) => {
        const status = getStaffDayStatus(member, dayKey);
        return status === "scheduled" || status === "covering";
      });
    } else {
      targetDays = [selectedDay];
    }
    if (!targetDays.length) {
      setStaffStatus?.("No scheduled shifts found to mark as sick for this week.", true);
      return false;
    }
    const shift = normalizeStaffShiftType?.(values.shift || "full");
    const updates = targetDays.map((dayKey) => ({ staffId, day: dayKey, status: "sick", shift }));
    setStaffRotaSelectedMemberId?.(String(staffId || "").trim());
    const replacementMode = String(values.replace || "").trim().toLowerCase() === "auto" ? "auto" : "suggest";
    const sicknessLogs = targetDays.map((dayKey) => ({
      staffId,
      staffName: member.name || "Staff",
      day: dayKey,
      shift,
      replacementMode
    }));
    await applyStaffRotaUpdates(updates, { sicknessLogs, silent: true });
    if (replacementMode === "auto") {
      await applyAutoCoverForWeek({ onlyDays: targetDays, forMemberId: staffId, silent: true });
    }
    return true;
  }

  async function applyAutoCoverForWeek({ onlyDays = null, forMemberId = "", silent = false } = {}) {
    const targetDaySet = Array.isArray(onlyDays) && onlyDays.length ? new Set(onlyDays.map((d) => String(d || "").trim().toLowerCase())) : null;
    const updates = [];
    let assignments = 0;
    (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).forEach((member) => {
      const memberId = getStaffMemberId(member);
      if (!memberId) return;
      if (forMemberId && memberId !== String(forMemberId)) return;
      STAFF_ROTA_DAYS.forEach((day) => {
        if (targetDaySet && !targetDaySet.has(day.key)) return;
        const status = getStaffDayStatus(member, day.key);
        if (status !== "sick") return;
        const candidates = findCoverCandidatesForDay(day.key, memberId);
        const chosen = candidates.find((c) => c.status === "available") || candidates[0];
        if (!chosen) return;
        const chosenMember = (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).find((row) => getStaffMemberId(row) === chosen.id);
        const shift = chosenMember ? getStaffDayShift(chosenMember, day.key) : "full";
        updates.push({ staffId: chosen.id, day: day.key, status: "covering", shift });
        assignments += 1;
      });
    });
    if (updates.length) {
      await applyStaffRotaUpdates(updates, { silent: true });
    }
    if (!silent) {
      if (assignments) {
        setStaffStatus?.(`Auto-fill cover assigned ${assignments} replacement shift${assignments > 1 ? "s" : ""}.`);
        showManageToast?.(`Assigned ${assignments} cover shift${assignments > 1 ? "s" : ""}.`);
      } else {
        setStaffStatus?.("No sickness gaps found or no available cover to assign.");
      }
    }
    return assignments;
  }

  return {
    getStaffMemberId,
    getStaffWeekOverridesBucket,
    getStaffMemberWeekOverrides,
    getBaseStaffDayStatus,
    getStaffDayState,
    getStaffDayStatus,
    getStaffDayShift,
    setStaffDayState,
    setStaffDayStatus,
    clearStaffWeekOverrides,
    pruneStaffRotaOverridesForCurrentRoster,
    getStaffColorForId,
    buildStaffRotaSnapshot,
    findCoverCandidatesForDay,
    getCurrentRotaBrush,
    applyStaffRotaUpdates,
    loadStaffDemoRotaPreview,
    promptStaffSickReport,
    applyAutoCoverForWeek
  };
}
