// Staff rota date and working-coverage helpers shared by calendar/pulse views.
export function createStaffDateUtilsRuntime(deps) {
  const {
    staffRotaDays,
    formatDateKey,
    getStaffRotaOverridesLoaded,
    loadStaffRotaOverrides,
    getStaffRotaOverrides,
    getStaffRosterRows,
    getStaffMemberId,
    normalizeStaffCellStatus,
    getBaseStaffDayStatus,
    getStaffColorForId
  } = deps || {};

  function getRotaDayKeyFromDate(dateObj) {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
    const day = dateObj.getDay();
    if (day === 0) return "sun";
    return staffRotaDays?.[day - 1]?.key || "";
  }

  function getRotaWeekStartKeyForDate(dateObj) {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
    const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + mondayOffset);
    return formatDateKey?.(d);
  }

  function getStaffWorkingForDate(dateObj) {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return [];
    if (!getStaffRotaOverridesLoaded?.()) loadStaffRotaOverrides?.();
    const dayKey = getRotaDayKeyFromDate(dateObj);
    const weekKey = getRotaWeekStartKeyForDate(dateObj);
    if (!dayKey || !weekKey) return [];
    const staffRotaOverrides = getStaffRotaOverrides?.();
    const week = staffRotaOverrides?.[weekKey];
    const weekCells = week?.cells && typeof week.cells === "object" ? week.cells : {};
    return (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : [])
      .map((member) => {
        const memberId = getStaffMemberId?.(member);
        if (!memberId) return null;
        const overrideCell = weekCells?.[memberId]?.[dayKey];
        let status = "";
        if (overrideCell && typeof overrideCell === "object") {
          status = normalizeStaffCellStatus?.(overrideCell.status);
        } else if (typeof overrideCell === "string") {
          status = normalizeStaffCellStatus?.(overrideCell);
        } else {
          status = getBaseStaffDayStatus?.(member, dayKey);
        }
        if (!(status === "scheduled" || status === "covering")) return null;
        return {
          id: memberId,
          name: String(member.name || "Staff"),
          color: getStaffColorForId?.(memberId),
          status
        };
      })
      .filter(Boolean);
  }

  return {
    getRotaDayKeyFromDate,
    getRotaWeekStartKeyForDate,
    getStaffWorkingForDate
  };
}
