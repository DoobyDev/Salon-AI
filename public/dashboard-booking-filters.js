// Booking date-filter and preset runtime.
export function createBookingFilterRuntime(deps) {
  const {
    bookingRangeToday,
    bookingRangeWeek,
    bookingRangeMonth,
    bookingRangeClear,
    bookingCalendarSelectionStatus,
    getBookingDateFilterPreset,
    getSelectedCalendarDateKey,
    getBookingDateFilterKeys,
    getBookingDateFilterLabel,
    setBookingDateFilterState,
    applyBookingFilters,
    renderSubscriberCalendar,
    toDateKey
  } = deps || {};

  function updateBookingRangeControls() {
    const buttonMap = [
      [bookingRangeToday, "today"],
      [bookingRangeWeek, "week"],
      [bookingRangeMonth, "month"],
      [bookingRangeClear, ""]
    ];
    buttonMap.forEach(([button, preset]) => {
      if (!button) return;
      const bookingDateFilterPreset = String(getBookingDateFilterPreset?.() || "").trim();
      const selectedCalendarDateKey = String(getSelectedCalendarDateKey?.() || "").trim();
      const bookingDateFilterKeys = getBookingDateFilterKeys?.();
      const active = preset
        ? bookingDateFilterPreset === preset
        : !bookingDateFilterPreset && !selectedCalendarDateKey && !bookingDateFilterKeys;
      button.classList.toggle("active", active);
    });
    if (bookingCalendarSelectionStatus) {
      bookingCalendarSelectionStatus.textContent = `Calendar filter: ${getBookingDateFilterLabel?.() || "All dates"}`;
    }
  }

  function setBookingDateFilter({ keys = null, label = "All dates", preset = "", selectedDateKey = "" } = {}) {
    setBookingDateFilterState?.({
      keys: keys instanceof Set && keys.size ? keys : null,
      label: label || "All dates",
      preset: preset || "",
      selectedDateKey: selectedDateKey || ""
    });
    updateBookingRangeControls();
  }

  function dateKeyRangeForPreset(preset) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (preset === "today") {
      return { from: today, to: today, label: "Today" };
    }
    if (preset === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: start, to: end, label: "This Week" };
    }
    if (preset === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: start, to: end, label: "This Month" };
    }
    return null;
  }

  function makeDateKeySet(from, to) {
    if (!(from instanceof Date) || !(to instanceof Date)) return null;
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;
    const keys = new Set();
    const cursor = new Date(start);
    while (cursor <= end) {
      keys.add(toDateKey?.(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return keys;
  }

  function applyBookingDatePreset(preset) {
    const range = dateKeyRangeForPreset(preset);
    if (!range) {
      setBookingDateFilter({ keys: null, label: "All dates" });
      applyBookingFilters?.();
      renderSubscriberCalendar?.();
      return;
    }
    const keys = makeDateKeySet(range.from, range.to);
    setBookingDateFilter({ keys, label: range.label, preset, selectedDateKey: "" });
    applyBookingFilters?.();
    renderSubscriberCalendar?.();
  }

  return {
    updateBookingRangeControls,
    setBookingDateFilter,
    dateKeyRangeForPreset,
    makeDateKeySet,
    applyBookingDatePreset
  };
}
