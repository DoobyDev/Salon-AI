// Shared formatting, date, and clipboard helpers used across dashboard runtimes.
export function createDashboardSharedUtilsRuntime() {
  function formatMoney(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return "GBP0.00";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric);
  }

  async function writeToClipboard(text) {
    if (!navigator?.clipboard?.writeText) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function toDateKey(dateValue) {
    return `${dateValue.getFullYear()}-${pad2(dateValue.getMonth() + 1)}-${pad2(dateValue.getDate())}`;
  }

  function todayDateKeyLocal() {
    return toDateKey(new Date());
  }

  function parseBookingDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const safe = new Date(`${raw}T12:00:00`);
      return Number.isNaN(safe.getTime()) ? null : safe;
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatProviderLabel(value) {
    const provider = String(value || "").trim().toLowerCase();
    const map = {
      quickbooks: "QuickBooks",
      xero: "Xero",
      freshbooks: "FreshBooks",
      sage: "Sage"
    };
    return map[provider] || provider;
  }

  function formatDateTime(value) {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return {
    formatMoney,
    writeToClipboard,
    pad2,
    toDateKey,
    todayDateKeyLocal,
    parseBookingDate,
    formatProviderLabel,
    formatDateTime
  };
}
