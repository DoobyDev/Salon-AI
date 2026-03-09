// Staff roster utility helpers used across rota rendering and editing flows.
export function parseShiftDaysInput(raw) {
  return String(raw || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function normalizeStaffCellStatus(value) {
  const v = String(value || "").trim().toLowerCase();
  if (["scheduled", "available", "off", "sick", "covering"].includes(v)) return v;
  return "off";
}

export function normalizeStaffShiftType(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "am" || v === "pm" || v === "full") return v;
  return "full";
}

export function roleLabel(value) {
  return String(value || "staff")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function getStaffStatusLabel(status) {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "available":
      return "Available";
    case "sick":
      return "Sick";
    case "covering":
      return "Covering";
    default:
      return "Off";
  }
}

export function getStaffStatusDotColor(status) {
  switch (status) {
    case "scheduled":
      return "#7cead8";
    case "available":
      return "#6db9ff";
    case "sick":
      return "#ff949c";
    case "covering":
      return "#ffcb6b";
    default:
      return "#7d8697";
  }
}

export function getStaffInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function nextStaffCellStatus(current) {
  const cycle = ["scheduled", "available", "off", "sick", "covering"];
  const index = cycle.indexOf(normalizeStaffCellStatus(current));
  return cycle[(index + 1) % cycle.length];
}

export function getStaffShiftLabel(shift) {
  const value = normalizeStaffShiftType(shift);
  if (value === "am") return "AM";
  if (value === "pm") return "PM";
  return "Full";
}
