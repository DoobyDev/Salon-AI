// Executive pulse scope, storage, time parsing, and bucket-building helpers.
export function createExecutivePulseUtilsRuntime(deps) {
  const {
    getFrontDeskBusiness,
    getManagedBusinessId,
    getIsMockMode,
    getUserRole,
    snapshotsStorageKey,
    getBookingRows,
    parseBookingDate,
    getBusinessHoursInputs,
    parseTimeToMinutes,
    formatMinutesToTime,
    toDateKey,
    pad2
  } = deps || {};

  function getExecutivePulseScopeKey() {
    const frontDeskBusiness = getFrontDeskBusiness?.();
    const safeFrontDeskBusinessId =
      frontDeskBusiness && typeof frontDeskBusiness === "object"
        ? String(frontDeskBusiness.id || "").trim()
        : "";
    const businessId =
      String(getManagedBusinessId?.() || safeFrontDeskBusinessId || "").trim() ||
      (getIsMockMode?.() ? "mock-business" : "no-business");
    return `${String(getUserRole?.() || "subscriber").toLowerCase()}:${businessId}`;
  }

  function getExecutivePulseSnapshotStorageKey() {
    return `${snapshotsStorageKey}:${getExecutivePulseScopeKey()}`;
  }

  function readExecutivePulseSnapshots() {
    try {
      const rows = JSON.parse(localStorage.getItem(getExecutivePulseSnapshotStorageKey()) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function writeExecutivePulseSnapshots(rows) {
    try {
      localStorage.setItem(getExecutivePulseSnapshotStorageKey(), JSON.stringify(Array.isArray(rows) ? rows.slice(0, 20) : []));
    } catch {
      // Ignore localStorage errors.
    }
  }

  function getExecutivePulseRangeConfig(range = "day") {
    const bookingRows = getBookingRows?.() || [];
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (range === "all") {
      const datedRows = bookingRows
        .map((row) => parseBookingDate?.(row?.date))
        .filter((dt) => dt instanceof Date && Number.isFinite(dt.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      const firstBooking = datedRows[0] || now;
      const start = new Date(firstBooking.getFullYear(), firstBooking.getMonth(), firstBooking.getDate(), 0, 0, 0, 0);
      const daySpan = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
      return {
        key: "all",
        label: "All time",
        chartLabel: "Daily revenue line",
        start,
        end,
        groupBy: "day",
        bucketCount: daySpan
      };
    }
    if (range === "year") {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      const daysInYear = Math.round((yearEnd.getTime() - start.getTime()) / 86400000) + 1;
      return { key: "year", label: "This year", chartLabel: "365-day revenue line", start, end: yearEnd, groupBy: "day", bucketCount: daysInYear };
    }
    if (range === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), daysInMonth, 23, 59, 59, 999);
      return { key: "month", label: "This month", chartLabel: "Full month revenue line", start, end: monthEnd, groupBy: "day", bucketCount: daysInMonth };
    }
    if (range === "week") {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset, 0, 0, 0, 0);
      const weekEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
      return { key: "week", label: "This week", chartLabel: "Working-week revenue lollipops", start, end: weekEnd, groupBy: "day", bucketCount: 7, onlyWorkingDays: true };
    }
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const workingHours = getExecutivePulseWorkingHoursForDate(start);
    const hourStartMin = Number.isFinite(workingHours?.startMinutes) ? workingHours.startMinutes : 8 * 60;
    const hourEndMin = Number.isFinite(workingHours?.endMinutes) ? workingHours.endMinutes : 18 * 60;
    const bucketCount = Math.max(1, Math.min(16, Math.ceil((hourEndMin - hourStartMin) / 60)));
    return {
      key: "day",
      label: "Today",
      chartLabel: "Hourly revenue lollipops",
      start,
      end,
      groupBy: "hour",
      bucketCount,
      hourStartMin,
      hourEndMin
    };
  }

  function getExecutiveRowRevenueEstimate(row) {
    const candidates = [row?.price, row?.amount, row?.total, row?.estimatedPrice, row?.servicePrice];
    for (const value of candidates) {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }
    return 0;
  }

  function parseFlexibleHourTextToMinutes(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    const simple24h = raw.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (simple24h) {
      const h = Number(simple24h[1]);
      const m = Number(simple24h[2] || 0);
      if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) return h * 60 + m;
    }
    const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampm) {
      const baseHour = Number(ampm[1]);
      const mins = Number(ampm[2] || 0);
      if (!Number.isFinite(baseHour) || !Number.isFinite(mins) || baseHour < 1 || baseHour > 12 || mins < 0 || mins > 59) return null;
      const suffix = ampm[3];
      const h24 = suffix === "pm" ? (baseHour % 12) + 12 : baseHour % 12;
      return h24 * 60 + mins;
    }
    return null;
  }

  function parseBusinessHoursRangeToMinutes(value) {
    const raw = String(value || "").trim();
    if (!raw || /closed/i.test(raw)) return null;
    const normalized = raw
      .replace(/[–—]/g, "-")
      .replace(/\bto\b/gi, "-")
      .replace(/\s+/g, " ")
      .trim();
    const parts = normalized.split("-").map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const startMinutes = parseFlexibleHourTextToMinutes(parts[0]);
    const endMinutes = parseFlexibleHourTextToMinutes(parts[1]);
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return null;
    if (endMinutes <= startMinutes) return null;
    return { startMinutes, endMinutes };
  }

  function getExecutivePulseWorkingHoursForDate(dateValue) {
    const dt = dateValue instanceof Date ? dateValue : new Date();
    const weekdayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = weekdayKeys[dt.getDay()] || "monday";
    const safeFrontDeskBusinessHours =
      getFrontDeskBusiness?.() && typeof getFrontDeskBusiness?.() === "object"
        ? getFrontDeskBusiness().hours
        : null;
    const hourSources = [safeFrontDeskBusinessHours];
    for (const source of hourSources) {
      if (!source || typeof source !== "object") continue;
      const parsed = parseBusinessHoursRangeToMinutes(source[dayKey]);
      if (parsed) return parsed;
    }
    const inputMap = getBusinessHoursInputs?.() || {};
    return parseBusinessHoursRangeToMinutes(inputMap[dayKey]?.value || "");
  }

  function parseExecutiveBookingRowTimeMinutes(row) {
    const raw = String(row?.time || "").trim();
    if (!raw) return null;
    const parsed24h = parseTimeToMinutes?.(raw);
    if (Number.isFinite(parsed24h)) return parsed24h;
    const parsedFlexible = parseFlexibleHourTextToMinutes(raw);
    if (Number.isFinite(parsedFlexible)) return parsedFlexible;
    const loose = raw.match(/^(\d{1,2})/);
    if (loose) {
      const hour = Number(loose[1]);
      if (Number.isFinite(hour) && hour >= 0 && hour <= 23) return hour * 60;
    }
    return null;
  }

  function getExecutivePulseBuckets(rows, rangeConfig, profitMarginPct) {
    const marginFactor = Math.max(0, Math.min(0.95, Number.isFinite(profitMarginPct) ? profitMarginPct / 100 : 0.35));
    const buckets = [];
    const map = new Map();
    const addBucket = (key, label) => {
      if (!map.has(key)) {
        const bucket = { key, label, bookings: 0, confirmed: 0, cancelled: 0, revenue: 0, profit: 0 };
        map.set(key, bucket);
        buckets.push(bucket);
      }
      return map.get(key);
    };

    if (rangeConfig.groupBy === "hour") {
      const hourStartMin = Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 8 * 60;
      const hourEndMin = Number.isFinite(rangeConfig.hourEndMin) ? rangeConfig.hourEndMin : 20 * 60;
      for (let mins = hourStartMin; mins < hourEndMin; mins += 60) {
        const hourKey = `h-${Math.floor(mins / 60)}`;
        const label = formatMinutesToTime?.(mins).replace(":00 ", "").replace(" AM", "a").replace(" PM", "p");
        addBucket(hourKey, label);
      }
    }
    if (rangeConfig.groupBy === "day") {
      const cursor = new Date(rangeConfig.start.getFullYear(), rangeConfig.start.getMonth(), rangeConfig.start.getDate());
      const endDate = new Date(rangeConfig.end.getFullYear(), rangeConfig.end.getMonth(), rangeConfig.end.getDate());
      while (cursor <= endDate) {
        const hours = getExecutivePulseWorkingHoursForDate(cursor);
        if (!rangeConfig.onlyWorkingDays || hours) {
          const key = toDateKey?.(cursor);
          const label = rangeConfig.onlyWorkingDays
            ? cursor.toLocaleDateString("en-GB", { weekday: "short" })
            : cursor.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
          addBucket(key, label);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    rows.forEach((row) => {
      const dt = parseBookingDate?.(row?.date);
      if (!dt) return;
      if (dt < rangeConfig.start || dt > rangeConfig.end) return;
      let key = "";
      let label = "";
      if (rangeConfig.groupBy === "year") {
        key = `${dt.getFullYear()}`;
        label = String(dt.getFullYear());
      } else if (rangeConfig.groupBy === "month") {
        key = `${dt.getFullYear()}-${pad2?.(dt.getMonth() + 1)}`;
        label = dt.toLocaleDateString("en-GB", { month: "short" });
      } else if (rangeConfig.groupBy === "week") {
        const weekStart = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - dt.getDay());
        key = `w-${toDateKey?.(weekStart)}`;
        label = weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      } else if (rangeConfig.groupBy === "day") {
        if (rangeConfig.onlyWorkingDays && !getExecutivePulseWorkingHoursForDate(dt)) return;
        key = toDateKey?.(dt);
        label = rangeConfig.onlyWorkingDays
          ? dt.toLocaleDateString("en-GB", { weekday: "short" })
          : dt.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      } else {
        const rowMinutes = parseExecutiveBookingRowTimeMinutes(row);
        const fallbackMinutes = Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 12 * 60;
        const clampedMinutes = Math.max(
          Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 0,
          Math.min(
            Number.isFinite(rangeConfig.hourEndMin) ? Math.max((rangeConfig.hourEndMin || 60) - 1, 0) : (23 * 60 + 59),
            Number.isFinite(rowMinutes) ? rowMinutes : fallbackMinutes
          )
        );
        const hourStart = Math.floor(clampedMinutes / 60) * 60;
        key = `h-${Math.floor(hourStart / 60)}`;
        label = formatMinutesToTime?.(hourStart).replace(":00 ", "").replace(" AM", "a").replace(" PM", "p");
      }
      const status = String(row?.status || "").toLowerCase();
      const bucket = addBucket(key, label);
      bucket.bookings += 1;
      if (status === "cancelled") bucket.cancelled += 1;
      if (status === "confirmed" || status === "completed") bucket.confirmed += 1;
      const revenue = status === "cancelled" ? 0 : getExecutiveRowRevenueEstimate(row);
      bucket.revenue += revenue;
      bucket.profit += revenue * marginFactor;
    });

    if (rangeConfig.groupBy !== "hour") {
      buckets.sort((a, b) => String(a.key).localeCompare(String(b.key)));
      if (buckets.length > rangeConfig.bucketCount) return buckets.slice(-rangeConfig.bucketCount);
    }
    return buckets.slice(0, rangeConfig.bucketCount);
  }

  return {
    getExecutivePulseScopeKey,
    getExecutivePulseSnapshotStorageKey,
    readExecutivePulseSnapshots,
    writeExecutivePulseSnapshots,
    getExecutivePulseRangeConfig,
    getExecutiveRowRevenueEstimate,
    parseFlexibleHourTextToMinutes,
    parseBusinessHoursRangeToMinutes,
    getExecutivePulseWorkingHoursForDate,
    parseExecutiveBookingRowTimeMinutes,
    getExecutivePulseBuckets
  };
}
