export function createBookingTimeUtils({ bookingDateRegex, bookingTimeRegex }) {
  function isValidDateTimeParts(date, time) {
    if (!bookingDateRegex.test(date) || !bookingTimeRegex.test(time)) return false;
    const parsed = new Date(`${date}T${time}:00Z`);
    return !Number.isNaN(parsed.getTime());
  }

  function normalizeBookingDateTime(dateInput, timeInput) {
    const date = String(dateInput || "").trim();
    const time = String(timeInput || "").trim();
    if (isValidDateTimeParts(date, time)) {
      return { date, time };
    }

    const merged = `${date} ${time}`.trim();
    const parsed = new Date(merged);
    if (Number.isNaN(parsed.getTime())) return null;

    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    const hh = String(parsed.getHours()).padStart(2, "0");
    const min = String(parsed.getMinutes()).padStart(2, "0");

    const normalized = { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
    return isValidDateTimeParts(normalized.date, normalized.time) ? normalized : null;
  }

  function parseOpenHours(value) {
    if (!value || typeof value !== "string") return null;
    const cleaned = value.trim().toLowerCase();
    if (!cleaned || cleaned === "closed") return null;
    const [openRaw, closeRaw] = value.split("-");
    if (!openRaw || !closeRaw) return null;
    const open = openRaw.trim();
    const close = closeRaw.trim();
    if (!bookingTimeRegex.test(open) || !bookingTimeRegex.test(close)) return null;
    return { open, close };
  }

  function addMinutesToTime(time, minutes) {
    const [h, m] = String(time || "00:00").split(":").map((v) => Number(v));
    const total = h * 60 + m + minutes;
    const nextH = Math.floor(total / 60);
    const nextM = total % 60;
    return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
  }

  function timeToMinutes(time) {
    const [h, m] = String(time || "00:00").split(":").map((v) => Number(v));
    return h * 60 + m;
  }

  function dayKeyFromDate(date) {
    const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return map[date.getDay()];
  }

  function bookingStartsAtMs(date, time) {
    const normalized = normalizeBookingDateTime(date, time);
    if (!normalized) return null;
    const parsed = new Date(`${normalized.date}T${normalized.time}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
  }

  function isBookingSlotInPast(date, time, graceMinutes = 2) {
    const startsAt = bookingStartsAtMs(date, time);
    if (!Number.isFinite(startsAt)) return false;
    return startsAt < (Date.now() - Math.max(0, Number(graceMinutes || 0)) * 60_000);
  }

  function normalizeBookingStatusValue(status) {
    return String(status || "").trim().toLowerCase();
  }

  return {
    isValidDateTimeParts,
    normalizeBookingDateTime,
    parseOpenHours,
    addMinutesToTime,
    timeToMinutes,
    dayKeyFromDate,
    bookingStartsAtMs,
    isBookingSlotInPast,
    normalizeBookingStatusValue
  };
}
