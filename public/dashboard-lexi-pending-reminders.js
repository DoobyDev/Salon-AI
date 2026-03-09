// Pending booking reminder popup and reminder loop for subscriber/admin roles.
export function createLexiPendingRemindersRuntime(deps) {
  const {
    getUserRole,
    getBookingRows,
    isPendingConfirmationStatus,
    escapeHtml,
    showManageToast,
    getLexiPendingReminderTimerId,
    setLexiPendingReminderTimerId,
    getLexiPendingSnoozeUntil,
    setLexiPendingSnoozeUntil,
    getLexiPendingLastPopupSignature,
    setLexiPendingLastPopupSignature,
    getLexiPendingLastToastAt,
    setLexiPendingLastToastAt,
    setBookingStatusValue,
    setActiveStatusChip,
    applyBookingFilters,
    bookingOperationsSection,
    bookingTools,
    bookingsList
  } = deps || {};

  function ensureLexiPendingPopup() {
    let popup = document.getElementById("lexiPendingPopup");
    if (popup) return popup;
    popup = document.createElement("section");
    popup.id = "lexiPendingPopup";
    popup.className = "lexi-pending-popup";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-live", "polite");
    popup.setAttribute("aria-label", "Lexi pending booking reminder");
    popup.innerHTML = `
      <div class="lexi-pending-popup-media">
        <p class="lexi-pending-popup-label">Lexi | AI Receptionist</p>
        <h3 class="lexi-pending-popup-title">Booking request pending confirmation</h3>
      </div>
      <div class="lexi-pending-popup-body">
        <div class="lexi-pending-popup-details" id="lexiPendingPopupDetails">
          <strong>Waiting for subscriber confirmation</strong>
          <small>Open Booking Operations to confirm or decline the request.</small>
        </div>
        <div class="lexi-pending-popup-actions">
          <button type="button" class="btn" data-lexi-pending-action="review">Review Pending Bookings</button>
          <button type="button" class="btn btn-ghost" data-lexi-pending-action="snooze">Snooze 5 min</button>
          <button type="button" class="btn btn-ghost" data-lexi-pending-action="dismiss">Dismiss</button>
        </div>
      </div>
    `;
    popup.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-lexi-pending-action]") : null;
      if (!target) return;
      const action = String(target.getAttribute("data-lexi-pending-action") || "");
      if (action === "review") {
        openLexiPendingBookingsReview();
        hideLexiPendingPopup();
        return;
      }
      if (action === "snooze") {
        setLexiPendingSnoozeUntil?.(Date.now() + (5 * 60 * 1000));
        hideLexiPendingPopup();
        showManageToast?.("Lexi reminders snoozed for 5 minutes.");
        return;
      }
      hideLexiPendingPopup();
    });
    document.body.appendChild(popup);
    return popup;
  }

  function hideLexiPendingPopup() {
    const popup = document.getElementById("lexiPendingPopup");
    if (!popup) return;
    popup.classList.remove("is-open");
  }

  function getPendingConfirmationBookings() {
    return (getBookingRows?.() || []).filter((row) => isPendingConfirmationStatus?.(row?.status));
  }

  function buildLexiPendingSignature(rows) {
    return rows
      .map((row) => [row?.id, row?.date, row?.time, row?.status].map((v) => String(v || "")).join("|"))
      .sort()
      .join("||");
  }

  function updateLexiPendingPopupContent(rows = []) {
    const popup = ensureLexiPendingPopup();
    const details = popup.querySelector("#lexiPendingPopupDetails");
    if (!details) return;
    const count = rows.length;
    const first = rows[0] || {};
    if (!count) {
      details.innerHTML = "<strong>No pending bookings</strong><small>You're all caught up.</small>";
      return;
    }
    const firstLine = `${first.customerName || "Customer"} | ${first.service || "Service"} | ${first.date || "N/A"} ${first.time || ""}`.trim();
    details.innerHTML = `
      <strong>${count} pending booking${count === 1 ? "" : "s"} waiting for confirmation</strong>
      <small>${escapeHtml?.(firstLine)}${count > 1 ? ` • +${count - 1} more` : ""}</small>
    `;
  }

  function showLexiPendingPopup(rows = [], options = {}) {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    if (!rows.length) return;
    if (!options.force && Date.now() < Number(getLexiPendingSnoozeUntil?.() || 0)) return;
    updateLexiPendingPopupContent(rows);
    const popup = ensureLexiPendingPopup();
    popup.classList.add("is-open");
  }

  function openLexiPendingBookingsReview() {
    setBookingStatusValue?.("pending");
    setActiveStatusChip?.("pending");
    applyBookingFilters?.();
    (bookingOperationsSection || bookingTools || bookingsList)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stopLexiPendingReminderLoop() {
    const timerId = getLexiPendingReminderTimerId?.();
    if (timerId) {
      window.clearInterval(timerId);
      setLexiPendingReminderTimerId?.(null);
    }
  }

  function ensureLexiPendingReminderLoop() {
    if (getLexiPendingReminderTimerId?.()) return;
    const timerId = window.setInterval(() => {
      const pendingRows = getPendingConfirmationBookings();
      if (!pendingRows.length) {
        stopLexiPendingReminderLoop();
        hideLexiPendingPopup();
        return;
      }
      if (Date.now() < Number(getLexiPendingSnoozeUntil?.() || 0)) return;
      const now = Date.now();
      if (now - Number(getLexiPendingLastToastAt?.() || 0) >= 60000) {
        const count = pendingRows.length;
        showManageToast?.(`Lexi: ${count} pending booking${count === 1 ? "" : "s"} still waiting for confirmation.`);
        setLexiPendingLastToastAt?.(now);
      }
    }, 15000);
    setLexiPendingReminderTimerId?.(timerId);
  }

  function syncLexiPendingReminders() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) {
      stopLexiPendingReminderLoop();
      hideLexiPendingPopup();
      return;
    }
    const pendingRows = getPendingConfirmationBookings();
    updateLexiPendingPopupContent(pendingRows);
    if (!pendingRows.length) {
      setLexiPendingLastPopupSignature?.("");
      setLexiPendingSnoozeUntil?.(0);
      stopLexiPendingReminderLoop();
      hideLexiPendingPopup();
      return;
    }
    ensureLexiPendingReminderLoop();
    const signature = buildLexiPendingSignature(pendingRows);
    if (signature !== String(getLexiPendingLastPopupSignature?.() || "")) {
      setLexiPendingLastPopupSignature?.(signature);
      setLexiPendingSnoozeUntil?.(0);
      showLexiPendingPopup(pendingRows, { force: true });
      setLexiPendingLastToastAt?.(0);
    }
  }

  return {
    ensureLexiPendingPopup,
    hideLexiPendingPopup,
    getPendingConfirmationBookings,
    buildLexiPendingSignature,
    updateLexiPendingPopupContent,
    showLexiPendingPopup,
    openLexiPendingBookingsReview,
    stopLexiPendingReminderLoop,
    ensureLexiPendingReminderLoop,
    syncLexiPendingReminders
  };
}
