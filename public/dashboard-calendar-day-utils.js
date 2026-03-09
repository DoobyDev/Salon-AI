// Calendar day parsing and summary helpers.
export function createCalendarDayUtilsRuntime(deps) {
  const {
    parseServiceEditorText,
    getBusinessProfileServicesValue,
    formatMoney,
    normalizeText
  } = deps || {};

  function parseDateKeyToDate(dateKey) {
    const raw = String(dateKey || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const parsed = new Date(`${raw}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function statusChipClass(status) {
    const normalized = normalizeText?.(status);
    if (normalized.includes("cancel")) return "cancelled";
    if (normalized.includes("complete")) return "completed";
    if (normalized.includes("confirm")) return "confirmed";
    return "";
  }

  function parseTimeToMinutes(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const mins = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null;
    if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
    return hours * 60 + mins;
  }

  function formatMinutesToTime(totalMinutes) {
    const mins = Number(totalMinutes);
    if (!Number.isFinite(mins)) return "n/a";
    const clamped = Math.max(0, Math.round(mins));
    const hours = Math.floor(clamped / 60);
    const minutes = clamped % 60;
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = ((hours + 11) % 12) + 1;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  function summarizeCalendarDaySchedule(rows = []) {
    const slots = rows
      .map((row) => ({ row, minutes: parseTimeToMinutes(row?.time) }))
      .filter((entry) => Number.isFinite(entry.minutes))
      .sort((a, b) => a.minutes - b.minutes);

    if (!slots.length) {
      return {
        earliest: null,
        latest: null,
        largestGapMins: null,
        gapCount: 0,
        busiestHourLabel: null
      };
    }

    let largestGapMins = 0;
    let gapCount = 0;
    for (let index = 1; index < slots.length; index += 1) {
      const gap = slots[index].minutes - slots[index - 1].minutes;
      if (gap >= 45) {
        gapCount += 1;
        largestGapMins = Math.max(largestGapMins, gap);
      }
    }

    const byHour = new Map();
    slots.forEach((entry) => {
      const hour = Math.floor(entry.minutes / 60);
      byHour.set(hour, (byHour.get(hour) || 0) + 1);
    });
    const busiestHour = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0] || null;
    const busiestHourLabel = busiestHour
      ? `${formatMinutesToTime(busiestHour[0] * 60)}-${formatMinutesToTime(busiestHour[0] * 60 + 59)} (${busiestHour[1]})`
      : null;

    return {
      earliest: slots[0].minutes,
      latest: slots[slots.length - 1].minutes,
      largestGapMins: largestGapMins || null,
      gapCount,
      busiestHourLabel
    };
  }

  function getServicePriceLookupForDashboard() {
    try {
      const services = parseServiceEditorText?.(String(getBusinessProfileServicesValue?.() || ""));
      const lookup = new Map();
      services.forEach((service) => {
        const name = String(service?.name || "").trim().toLowerCase();
        const price = Number(service?.price || 0);
        if (name && Number.isFinite(price) && price >= 0) lookup.set(name, price);
      });
      return lookup;
    } catch {
      return new Map();
    }
  }

  function estimateBookingRevenueValue(row, servicePriceLookup = new Map()) {
    const directCandidates = [row?.price, row?.amount, row?.total, row?.estimatedRevenue];
    for (const candidate of directCandidates) {
      const num = Number(candidate);
      if (Number.isFinite(num) && num >= 0) return { value: num, source: "direct" };
    }
    const serviceName = String(row?.service || "").trim().toLowerCase();
    if (!serviceName) return { value: 0, source: "missing" };
    if (servicePriceLookup.has(serviceName)) {
      return { value: Number(servicePriceLookup.get(serviceName) || 0), source: "service" };
    }
    for (const [name, price] of servicePriceLookup.entries()) {
      if (serviceName.includes(name) || name.includes(serviceName)) {
        return { value: Number(price || 0), source: "service" };
      }
    }
    return { value: 0, source: "missing" };
  }

  function summarizeCalendarDayRevenue(rows = []) {
    const servicePriceLookup = getServicePriceLookupForDashboard();
    const summary = {
      total: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      estimatedCount: 0,
      missingCount: 0
    };
    rows.forEach((row) => {
      const estimate = estimateBookingRevenueValue(row, servicePriceLookup);
      const amount = Number(estimate.value || 0);
      if (estimate.source === "service") summary.estimatedCount += 1;
      if (estimate.source === "missing") summary.missingCount += 1;
      summary.total += amount;
      const status = normalizeText?.(row?.status);
      if (status.includes("cancel")) summary.cancelled += amount;
      else if (status.includes("complete")) summary.completed += amount;
      else if (status.includes("confirm")) summary.confirmed += amount;
      else summary.confirmed += amount;
    });
    return summary;
  }

  function formatCalendarDayTitle(dateKey) {
    const date = parseDateKeyToDate(dateKey);
    if (!date) return dateKey;
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  return {
    parseDateKeyToDate,
    statusChipClass,
    parseTimeToMinutes,
    formatMinutesToTime,
    summarizeCalendarDaySchedule,
    summarizeCalendarDayRevenue,
    formatCalendarDayTitle
  };
}
