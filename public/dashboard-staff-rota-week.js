// Staff rota week/state lifecycle runtime.
export function createStaffRotaWeekRuntime(deps) {
  const {
    win = window,
    storage = localStorage,
    fetchImpl = fetch,
    STAFF_ROTA_OVERRIDES_STORAGE_KEY,
    STAFF_ROTA_DAYS = [],
    staffStatusNote,
    getStaffRotaWeekOffset,
    getStaffRotaOverrides,
    setStaffRotaOverrides,
    getStaffRotaOverridesLoaded,
    setStaffRotaOverridesLoaded,
    getStaffRotaWeekLoading,
    setStaffRotaWeekLoading,
    isDashboardDemoDataModeActive,
    withManagedBusiness,
    headers,
    normalizeStaffCellStatus,
    normalizeStaffShiftType,
    getStaffWeekOverridesBucket,
    clearStaffWeekOverrides
  } = deps || {};

  function setStaffStatus(message, isError = false) {
    if (!staffStatusNote) return;
    staffStatusNote.textContent = message || "";
    staffStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function loadStaffRotaOverrides() {
    try {
      const parsed = JSON.parse(storage.getItem(STAFF_ROTA_OVERRIDES_STORAGE_KEY) || "{}");
      setStaffRotaOverrides?.(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setStaffRotaOverrides?.({});
    }
    setStaffRotaOverridesLoaded?.(true);
  }

  function saveStaffRotaOverrides() {
    try {
      storage.setItem(STAFF_ROTA_OVERRIDES_STORAGE_KEY, JSON.stringify(getStaffRotaOverrides?.() || {}));
    } catch {
      // ignore storage failures
    }
  }

  function formatDateKey(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getStaffWeekStartDate() {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayIndex = base.getDay();
    const mondayDiff = dayIndex === 0 ? -6 : 1 - dayIndex;
    base.setDate(base.getDate() + mondayDiff + Number(getStaffRotaWeekOffset?.() || 0) * 7);
    base.setHours(0, 0, 0, 0);
    return base;
  }

  function getStaffWeekKey() {
    return formatDateKey(getStaffWeekStartDate());
  }

  function getStaffWeekMeta() {
    const weekStart = getStaffWeekStartDate();
    return STAFF_ROTA_DAYS.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        ...day,
        date,
        dateLabel: `${date.getDate()}/${date.getMonth() + 1}`,
        longLabel: date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
      };
    });
  }

  function formatStaffWeekRange() {
    const days = getStaffWeekMeta();
    const start = days[0]?.date;
    const end = days[6]?.date;
    if (!start || !end) return "This Week";
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = start.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    const endLabel = end.toLocaleDateString("en-GB", { month: sameMonth ? undefined : "short", day: "numeric" });
    return `${startLabel} - ${endLabel}`;
  }

  function normalizeIncomingRotaWeek(payload) {
    const weekStart = String(payload?.weekStart || "").trim() || getStaffWeekKey();
    const rawCells = payload?.cells && typeof payload.cells === "object" ? payload.cells : {};
    const cells = {};
    Object.entries(rawCells).forEach(([staffId, dayMap]) => {
      const id = String(staffId || "").trim();
      if (!id || !dayMap || typeof dayMap !== "object") return;
      const nextDayMap = {};
      Object.entries(dayMap).forEach(([dayKey, cell]) => {
        const dk = String(dayKey || "").trim().toLowerCase();
        if (!STAFF_ROTA_DAYS.some((d) => d.key === dk)) return;
        if (cell && typeof cell === "object") {
          nextDayMap[dk] = {
            status: normalizeStaffCellStatus?.(cell.status),
            shift: normalizeStaffShiftType?.(cell.shift)
          };
        } else if (typeof cell === "string") {
          nextDayMap[dk] = {
            status: normalizeStaffCellStatus?.(cell),
            shift: "full"
          };
        }
      });
      if (Object.keys(nextDayMap).length) cells[id] = nextDayMap;
    });
    const sicknessLogs = Array.isArray(payload?.sicknessLogs)
      ? payload.sicknessLogs
          .map((entry) => ({
            id: String(entry?.id || "").trim() || "",
            staffId: String(entry?.staffId || "").trim(),
            staffName: String(entry?.staffName || "").trim(),
            day: String(entry?.day || "").trim().toLowerCase(),
            shift: normalizeStaffShiftType?.(entry?.shift),
            replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
            weekStart: String(entry?.weekStart || weekStart).trim(),
            reportedAt: String(entry?.reportedAt || "").trim() || null
          }))
          .filter((entry) => entry.staffId && STAFF_ROTA_DAYS.some((d) => d.key === entry.day))
      : [];
    return { weekStart, cells, sicknessLogs, updatedAt: payload?.updatedAt || null };
  }

  async function loadStaffRotaWeek({ silent = false } = {}) {
    const weekKey = getStaffWeekKey();
    const overrides = getStaffRotaOverrides?.() || {};
    if (isDashboardDemoDataModeActive?.()) {
      if (!getStaffRotaOverridesLoaded?.()) loadStaffRotaOverrides();
      const demoOverrides = getStaffRotaOverrides?.() || {};
      if (!demoOverrides[weekKey]) {
        demoOverrides[weekKey] = { cells: {}, sicknessLogs: [], updatedAt: null };
        setStaffRotaOverrides?.(demoOverrides);
        saveStaffRotaOverrides();
      }
      return demoOverrides[weekKey];
    }
    if (getStaffRotaWeekLoading?.()) return overrides?.[weekKey] || null;
    setStaffRotaWeekLoading?.(true);
    try {
      const res = await fetchImpl(withManagedBusiness?.(`/api/staff-roster/rota?weekStart=${encodeURIComponent(weekKey)}`), {
        headers: headers?.()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load rota week.");
      const normalized = normalizeIncomingRotaWeek(data);
      const nextOverrides = getStaffRotaOverrides?.() && typeof getStaffRotaOverrides?.() === "object" ? getStaffRotaOverrides?.() : {};
      nextOverrides[normalized.weekStart] = normalized;
      setStaffRotaOverrides?.(nextOverrides);
      setStaffRotaOverridesLoaded?.(true);
      saveStaffRotaOverrides();
      return normalized;
    } catch (error) {
      if (!silent) setStaffStatus(error.message, true);
      if (!getStaffRotaOverridesLoaded?.()) loadStaffRotaOverrides();
      return (getStaffRotaOverrides?.() || {})?.[weekKey] || null;
    } finally {
      setStaffRotaWeekLoading?.(false);
    }
  }

  async function persistStaffRotaBulk({ updates = [], sicknessLogs = [] } = {}) {
    const weekStart = getStaffWeekKey();
    const normalizedUpdates = (Array.isArray(updates) ? updates : [])
      .map((item) => ({
        staffId: String(item?.staffId || "").trim(),
        day: String(item?.day || "").trim().toLowerCase(),
        status: normalizeStaffCellStatus?.(item?.status),
        shift: normalizeStaffShiftType?.(item?.shift)
      }))
      .filter((item) => item.staffId && STAFF_ROTA_DAYS.some((d) => d.key === item.day));
    const normalizedLogs = (Array.isArray(sicknessLogs) ? sicknessLogs : [])
      .map((item) => ({
        staffId: String(item?.staffId || "").trim(),
        staffName: String(item?.staffName || "").trim(),
        day: String(item?.day || "").trim().toLowerCase(),
        shift: normalizeStaffShiftType?.(item?.shift),
        replacementMode: String(item?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest"
      }))
      .filter((item) => item.staffId && STAFF_ROTA_DAYS.some((d) => d.key === item.day));

    if (isDashboardDemoDataModeActive?.()) {
      if (!getStaffRotaOverridesLoaded?.()) loadStaffRotaOverrides();
      const bucket = getStaffWeekOverridesBucket?.(true);
      if (bucket) {
        normalizedUpdates.forEach((item) => {
          if (!bucket.cells[item.staffId]) bucket.cells[item.staffId] = {};
          bucket.cells[item.staffId][item.day] = { status: item.status, shift: item.shift };
        });
        if (!Array.isArray(bucket.sicknessLogs)) bucket.sicknessLogs = [];
        normalizedLogs.forEach((log) => {
          bucket.sicknessLogs.push({
            id: win.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            ...log,
            weekStart,
            reportedAt: new Date().toISOString()
          });
        });
        bucket.updatedAt = new Date().toISOString();
        saveStaffRotaOverrides();
      }
      return getStaffWeekOverridesBucket?.();
    }

    const res = await fetchImpl(withManagedBusiness?.("/api/staff-roster/rota/bulk"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ weekStart, updates: normalizedUpdates, sicknessLogs: normalizedLogs })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save rota changes.");
    const normalized = normalizeIncomingRotaWeek(data);
    const nextOverrides = getStaffRotaOverrides?.() && typeof getStaffRotaOverrides?.() === "object" ? getStaffRotaOverrides?.() : {};
    nextOverrides[weekStart] = normalized;
    setStaffRotaOverrides?.(nextOverrides);
    setStaffRotaOverridesLoaded?.(true);
    saveStaffRotaOverrides();
    return normalized;
  }

  async function resetStaffRotaWeekRemote() {
    const weekStart = getStaffWeekKey();
    if (isDashboardDemoDataModeActive?.()) {
      clearStaffWeekOverrides?.();
      return;
    }
    const res = await fetchImpl(withManagedBusiness?.("/api/staff-roster/rota/reset"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ weekStart })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to reset rota week.");
    const normalized = normalizeIncomingRotaWeek(data);
    const nextOverrides = getStaffRotaOverrides?.() && typeof getStaffRotaOverrides?.() === "object" ? getStaffRotaOverrides?.() : {};
    nextOverrides[weekStart] = normalized;
    setStaffRotaOverrides?.(nextOverrides);
    setStaffRotaOverridesLoaded?.(true);
    saveStaffRotaOverrides();
  }

  return {
    setStaffStatus,
    loadStaffRotaOverrides,
    saveStaffRotaOverrides,
    getStaffWeekStartDate,
    getStaffWeekKey,
    getStaffWeekMeta,
    formatStaffWeekRange,
    normalizeIncomingRotaWeek,
    loadStaffRotaWeek,
    persistStaffRotaBulk,
    resetStaffRotaWeekRemote
  };
}
