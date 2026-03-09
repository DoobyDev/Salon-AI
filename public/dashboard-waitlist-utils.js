// Waitlist utility helpers.
export function parseWaitlistDateTime(raw) {
  const value = String(raw || "").trim();
  if (!value) return { preferredDate: "", preferredTime: "" };
  const dateTime = new Date(value);
  if (Number.isNaN(dateTime.getTime())) return null;
  const yyyy = dateTime.getFullYear();
  const mm = String(dateTime.getMonth() + 1).padStart(2, "0");
  const dd = String(dateTime.getDate()).padStart(2, "0");
  const hh = String(dateTime.getHours()).padStart(2, "0");
  const min = String(dateTime.getMinutes()).padStart(2, "0");
  return { preferredDate: `${yyyy}-${mm}-${dd}`, preferredTime: `${hh}:${min}` };
}

export function buildWaitlistRecoveryPrefillDateTime(booking) {
  const date = String(booking?.date || "").trim();
  const time = String(booking?.time || "").trim();
  if (!date) return "";
  return time ? `${date} ${time}` : date;
}
