export function toUserTimeDisplay(time24h) {
  const [hourRaw, minuteRaw] = String(time24h || "00:00").split(":").map((v) => Number(v));
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour12 = hourRaw % 12 || 12;
  return `${hour12}:${String(minuteRaw).padStart(2, "0")} ${suffix}`;
}

export function slotLabel(date, time) {
  return `${date} ${toUserTimeDisplay(time)}`;
}

export function formatDisplayDateGb(value, options = {}) {
  if (!value) return "";
  const raw = String(value || "").trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-GB", options);
}

export function formatOrdinalDay(day) {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

export function formatDisplayDateLongGb(value, options = {}) {
  if (!value) return "";
  const raw = String(value || "").trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const weekday = options.weekday ? `${parsed.toLocaleDateString("en-GB", { weekday: "long" })}, ` : "";
  const day = formatOrdinalDay(parsed.getDate());
  const monthYear = parsed.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return `${weekday}${day} ${monthYear}`;
}

export function formatDisplayDateWithWeekdayGb(value) {
  return formatDisplayDateLongGb(value, { weekday: true });
}

export function formatLexiBookingDate(value, options = {}) {
  if (!value) return "";
  const raw = String(value || "").trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const weekday = options.weekday ? `${parsed.toLocaleDateString("en-GB", { weekday: "long" })} ` : "";
  const day = formatOrdinalDay(parsed.getDate());
  const month = parsed.toLocaleDateString("en-GB", { month: "long" });
  const year = options.year ? ` ${parsed.getFullYear()}` : "";
  return `${weekday}${day} ${month}${year}`.trim();
}

export function formatLexiSlotLabelForDisplay(slot) {
  const raw = String(slot || "").trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
  if (!match) return raw;
  return `${formatDisplayDateGb(match[1], { day: "2-digit", month: "2-digit", year: "numeric" })} ${match[2]}`;
}
