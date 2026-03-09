// Small dashboard status/date utility helpers.
export function createDashboardStatusUtilsRuntime(deps) {
  const {
    getUserRole,
    getBookingRows,
    accountingStatusNote,
    accountingLiveNote
  } = deps || {};

  function isSubscriberCleanSlate() {
    return getUserRole?.() === "subscriber" && (Array.isArray(getBookingRows?.()) ? getBookingRows().length : 0) === 0;
  }

  function shouldRenderTopMetricsGrid() {
    const role = String(getUserRole?.() || "").trim().toLowerCase();
    return !(role === "subscriber" || role === "admin");
  }

  function formatDateShort(value) {
    if (!value) return "N/A";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-GB");
  }

  function setAccountingStatus(message, isError = false) {
    if (!accountingStatusNote) return;
    accountingStatusNote.textContent = message || "";
    accountingStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function setAccountingLiveNote(message, isError = false) {
    if (!accountingLiveNote) return;
    accountingLiveNote.textContent = message || "";
    accountingLiveNote.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  return {
    isSubscriberCleanSlate,
    shouldRenderTopMetricsGrid,
    formatDateShort,
    setAccountingStatus,
    setAccountingLiveNote
  };
}
