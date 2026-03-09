// Module status evaluation logic used by dashboard cards/popups.
export function createModuleStatusRuntime({
  escapeHtml,
  getBusinessProfileName,
  getBusinessProfileServices,
  getSocialInputs,
  getBookingRows,
  getAccountingRows,
  getAdminAccountSupportResults,
  getStaffRosterRows,
  getWaitlistRows,
  getCommercialPayload,
  getRevenueAttributionPayload,
  getProfitabilityPayload
}) {
  function moduleOperationalStatus(mod) {
    const key = String(mod?.key || "").trim();
    const profileName = String(getBusinessProfileName?.() || "").trim();
    const servicesCount = String(getBusinessProfileServices?.() || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean).length;
    const socialCount = (Array.isArray(getSocialInputs?.()) ? getSocialInputs() : [])
      .filter((input) => Boolean(String(input?.value || "").trim())).length;
    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const bookingCount = bookingRows.length;
    const pendingBookings = bookingRows
      .filter((row) => ["pending", "pending_confirmation", "awaiting_confirmation"].includes(String(row?.status || "").toLowerCase())).length;
    const accountingRows = Array.isArray(getAccountingRows?.()) ? getAccountingRows() : [];
    const connectedAccounting = accountingRows
      .filter((row) => String(row?.status || "").toLowerCase() === "connected" || row?.connected === true).length;
    const adminAccountSupportResults = Array.isArray(getAdminAccountSupportResults?.()) ? getAdminAccountSupportResults() : [];
    const staffRosterRows = Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : [];
    const waitlistRows = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows() : [];
    const commercialPayload = getCommercialPayload?.();
    const revenueAttributionPayload = getRevenueAttributionPayload?.();
    const profitabilityPayload = getProfitabilityPayload?.();

    const ready = (label, note) => ({ label, note, tone: "good" });
    const attention = (label, note) => ({ label, note, tone: "attention" });
    const setup = (label, note) => ({ label, note, tone: "setup" });

    switch (key) {
      case "account_support":
        return ready(
          adminAccountSupportResults.length ? "Live" : "Ready",
          adminAccountSupportResults.length
            ? `${adminAccountSupportResults.length} account result${adminAccountSupportResults.length === 1 ? "" : "s"} loaded for admin support.`
            : "Search subscriber or customer accounts and open the record you need."
        );
      case "business_profile":
        return profileName && servicesCount > 0
          ? ready("Configured", `${servicesCount} services listed and profile details present.`)
          : setup("Needs Setup", "Add business details and services to improve booking conversion.");
      case "staff":
        return staffRosterRows.length
          ? ready("Live", `${staffRosterRows.length} staff records available for capacity planning.`)
          : setup("Needs Setup", "Add staff and rota coverage so booking capacity reflects reality.");
      case "waitlist":
        return waitlistRows.length
          ? ready("Live", `${waitlistRows.length} waitlist entries are ready for slot recovery.`)
          : setup("Ready To Set Up", "Add waitlist clients so cancellations can be recovered quickly.");
      case "accounting":
        return connectedAccounting > 0
          ? ready("Connected", `${connectedAccounting} accounting integration${connectedAccounting === 1 ? "" : "s"} connected.`)
          : attention("Needs Connection", "Connect accounting to reduce manual reconciliation work.");
      case "commercial":
        return commercialPayload
          ? ready("Live", "Memberships/packages/gift cards are available in this module.")
          : setup("Needs Setup", "Create memberships, packages, or gift cards before selling them.");
      case "revenue":
        return revenueAttributionPayload
          ? ready("Live", `Revenue attribution is using ${bookingCount} booking${bookingCount === 1 ? "" : "s"} of context.`)
          : setup("Needs Data", "Add spend tracking to compare channels properly.");
      case "profitability":
        return profitabilityPayload
          ? ready("Live", "Profitability summary is available with current inputs.")
          : setup("Needs Inputs", "Add payroll and costs to make profit signals meaningful.");
      case "social":
        return socialCount > 0
          ? ready("Configured", `${socialCount} social link${socialCount === 1 ? "" : "s"} configured.`)
          : setup("Needs Setup", "Add social links and profile media for trust and discovery.");
      case "booking_ops":
        return pendingBookings > 0
          ? attention("Action Needed", `${pendingBookings} booking confirmation${pendingBookings === 1 ? "" : "s"} need attention.`)
          : ready("Live", `${bookingCount} booking${bookingCount === 1 ? "" : "s"} loaded.`);
      case "calendar":
        return ready("Live", `${bookingCount} booking${bookingCount === 1 ? "" : "s"} mapped to calendar context.`);
      case "subscriber_copilot":
      case "admin_copilot":
        return ready("Ready", "Lexi is available for guided actions and module help.");
      default:
        if (mod?.startHere) return ready("Start Here", "Use this first to decide what to work on next.");
        return ready("Available", "Module is ready to use.");
    }
  }

  function renderModuleStatusPill(status, options = {}) {
    const s = status || {};
    const compact = options.compact === true;
    const cls = s.tone === "good" ? "is-good" : s.tone === "attention" ? "is-attention" : s.tone === "setup" ? "is-setup" : "";
    return `<span class="module-card-status ${cls}${compact ? " is-compact" : ""}">${escapeHtml(String(s.label || "Available"))}</span>`;
  }

  return {
    moduleOperationalStatus,
    renderModuleStatusPill
  };
}
