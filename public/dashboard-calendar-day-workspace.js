// Calendar day workspace popup runtime.
export function createCalendarDayWorkspaceRuntime(deps) {
  const {
    doc = document,
    ensureManageModalOverlay,
    getCloseModulePopupActive,
    setCloseModulePopupActive,
    isDashboardDemoDataModeActive,
    applyBookingFilters,
    renderSubscriberCalendar,
    renderExecutivePulse,
    shouldRenderTopMetricsGrid,
    metricsGrid,
    loadBookings,
    loadMetrics,
    getUserRole,
    isDashboardManagerRole,
    getManageModeEnabled,
    getManagedBusinessId,
    getUserBusinessId,
    getBookingsForDateKey,
    normalizeText,
    summarizeCalendarDaySchedule,
    summarizeCalendarDayRevenue,
    statusChipClass,
    formatDateTime,
    escapeHtml,
    formatMinutesToTime,
    formatMoney,
    formatCalendarDayTitle,
    getSelectedCalendarDateKey,
    returnToDashboardHomeView,
    focusModuleByKey,
    setWaitlistStatus,
    stageWaitlistRecoveryFromBooking,
    showManageToast,
    setBookingDateFilter,
    openBusinessAiChatPopup,
    requestLexiSubmit,
    openManageForm,
    createBooking,
    rescheduleBooking,
    openManageConfirm,
    cancelBooking
  } = deps || {};

  async function refreshBookingsAfterDayPopupMutation() {
    if (isDashboardDemoDataModeActive?.()) {
      applyBookingFilters?.();
      renderSubscriberCalendar?.();
      renderExecutivePulse?.();
      return;
    }
    if (shouldRenderTopMetricsGrid?.() && metricsGrid) metricsGrid.innerHTML = "";
    const tasks = [loadBookings?.({ append: false })];
    if (getUserRole?.() !== "customer") tasks.push(loadMetrics?.());
    await Promise.all(tasks);
  }

  async function openCalendarDayWorkspace(dateKey) {
    const safeDateKey = String(dateKey || "").trim();
    if (!safeDateKey) return;
    if (typeof getCloseModulePopupActive?.() === "function") {
      getCloseModulePopupActive()?.();
    }

    const overlay = ensureManageModalOverlay?.();
    if (!overlay) return;
    overlay.innerHTML = "";
    overlay.style.display = "flex";

    const shell = doc.createElement("section");
    shell.className = "calendar-day-modal";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "calendarDayModalTitle");
    overlay.appendChild(shell);

    const canManage = isDashboardManagerRole?.() && getManageModeEnabled?.();
    const businessId = String(getManagedBusinessId?.() || getUserBusinessId?.() || "").trim();

    const close = () => {
      if (typeof getCloseModulePopupActive?.() !== "function") return;
      doc.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("click", onOverlayClick);
      overlay.style.display = "none";
      overlay.innerHTML = "";
      setCloseModulePopupActive?.(null);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    const onOverlayClick = (event) => {
      if (event.target === overlay) close();
    };

    setCloseModulePopupActive?.(close);
    doc.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("click", onOverlayClick);

    const renderDayPopup = () => {
      const rows = getBookingsForDateKey?.(safeDateKey) || [];
      const total = rows.length;
      const cancelled = rows.filter((row) => normalizeText?.(row?.status).includes("cancel")).length;
      const confirmed = rows.filter((row) => normalizeText?.(row?.status) === "confirmed").length;
      const completed = rows.filter((row) => normalizeText?.(row?.status) === "completed").length;
      const serviceCounts = new Map();
      rows.forEach((row) => {
        const name = String(row?.service || "Service").trim() || "Service";
        serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
      });
      const topServiceEntry = Array.from(serviceCounts.entries()).sort((a, b) => b[1] - a[1])[0] || null;
      const scheduleSummary = summarizeCalendarDaySchedule?.(rows) || {};
      const revenueSummary = summarizeCalendarDayRevenue?.(rows) || {};
      const revenueTarget = Math.max(250, Math.round(Math.max(Number(revenueSummary.total || 0), 1) * 1.25 / 10) * 10);
      const revenueProgressPct = revenueTarget > 0 ? Math.min(100, Math.round((Number(revenueSummary.total || 0) / revenueTarget) * 100)) : 0;
      const cancelledRevenuePct = Number(revenueSummary.total || 0) > 0 ? Math.round((Number(revenueSummary.cancelled || 0) / Number(revenueSummary.total || 0)) * 100) : 0;
      const completedRevenuePct = Number(revenueSummary.total || 0) > 0 ? Math.round((Number(revenueSummary.completed || 0) / Number(revenueSummary.total || 0)) * 100) : 0;
      const useRevenuePreview = total > 0 && Number(revenueSummary.total || 0) <= 0;
      const previewRevenueTotal = Math.max(280, total * 85);
      const previewCancelled = cancelled > 0 ? Math.round(previewRevenueTotal * 0.18) : Math.round(previewRevenueTotal * 0.08);
      const previewCompleted = completed > 0 ? Math.round(previewRevenueTotal * 0.42) : Math.round(previewRevenueTotal * 0.26);
      const previewConfirmed = Math.max(0, previewRevenueTotal - previewCompleted - previewCancelled);
      const revenueDisplay = useRevenuePreview
        ? {
            total: previewRevenueTotal,
            confirmed: previewConfirmed,
            completed: previewCompleted,
            cancelled: previewCancelled,
            target: Math.round(previewRevenueTotal * 1.2 / 10) * 10,
            progressPct: 83,
            cancelledPct: Math.round((previewCancelled / Math.max(previewRevenueTotal, 1)) * 100),
            completedPct: Math.round((previewCompleted / Math.max(previewRevenueTotal, 1)) * 100)
          }
        : {
            total: Number(revenueSummary.total || 0),
            confirmed: Number(revenueSummary.confirmed || 0),
            completed: Number(revenueSummary.completed || 0),
            cancelled: Number(revenueSummary.cancelled || 0),
            target: revenueTarget,
            progressPct: revenueProgressPct,
            cancelledPct: cancelledRevenuePct,
            completedPct: completedRevenuePct
          };

      const bookingCards = rows.length
        ? rows.map((row) => {
            const status = String(row?.status || "pending").trim() || "pending";
            const chipClass = statusChipClass?.(status) || "";
            const customer = String(row?.customerName || "Customer").trim() || "Customer";
            const service = String(row?.service || "Service").trim() || "Service";
            const bookingId = String(row?.id || "");
            const canEditThis = canManage && bookingId && !normalizeText?.(status).includes("cancel");
            const canRecoverThis = canManage && bookingId && normalizeText?.(status).includes("cancel");
            const contactBits = [String(row?.customerPhone || "").trim(), String(row?.customerEmail || "").trim()].filter(Boolean);
            const businessName = String(row?.businessName || "").trim();
            return `
            <li class="calendar-day-booking-card">
              <div class="calendar-day-booking-head">
                <div>
                  <strong>${escapeHtml?.(row?.time || "Time not set")} - ${escapeHtml?.(customer)}</strong>
                  <small>${escapeHtml?.(service)}</small>
                </div>
                <span class="calendar-day-booking-chip ${chipClass}">${escapeHtml?.(status)}</span>
              </div>
              <div class="calendar-day-booking-meta">
                ${contactBits.length ? `<span>${escapeHtml?.(contactBits.join(" | "))}</span>` : "<span>No customer contact saved.</span>"}
                ${businessName ? `<span>${escapeHtml?.(businessName)}</span>` : ""}
                ${row?.createdAt ? `<span>Created ${escapeHtml?.(formatDateTime?.(row.createdAt))}</span>` : ""}
              </div>
              <div class="calendar-day-booking-actions">
                <button class="btn btn-ghost" type="button" data-day-popup-action="open-bookings">Open Booking Operations</button>
                <button class="btn btn-ghost" type="button" data-day-popup-action="edit-booking" data-booking-id="${escapeHtml?.(bookingId)}" ${canEditThis ? "" : "disabled"}>Edit</button>
                <button class="btn btn-ghost" type="button" data-day-popup-action="delete-booking" data-booking-id="${escapeHtml?.(bookingId)}" ${canEditThis ? "" : "disabled"}>Delete</button>
                ${canRecoverThis ? `<button class="btn btn-ghost" type="button" data-day-popup-action="recover-slot" data-booking-id="${escapeHtml?.(bookingId)}">Recover Slot</button>` : ""}
              </div>
            </li>
          `;
          }).join("")
        : `<li class="calendar-day-empty">No bookings in the diary for this day yet.</li>`;

      const helperNote = canManage
        ? "Add, edit, or cancel bookings from this day view. Changes sync back into the dashboard."
        : isDashboardManagerRole?.()
          ? "Enable Edit Mode to add, edit, or delete bookings from this day view."
          : "This is a read-only day view. Open Booking Operations to review more detail.";
      const scheduleSignalItems = [
        scheduleSummary.earliest != null ? `First booking: ${formatMinutesToTime?.(scheduleSummary.earliest)}` : "First booking: not set",
        scheduleSummary.latest != null ? `Last booking: ${formatMinutesToTime?.(scheduleSummary.latest)}` : "Last booking: not set",
        scheduleSummary.busiestHourLabel ? `Peak hour: ${scheduleSummary.busiestHourLabel}` : "Peak hour: not enough bookings yet",
        scheduleSummary.largestGapMins != null
          ? `Largest open gap: ${scheduleSummary.largestGapMins} mins (${scheduleSummary.gapCount} gap${scheduleSummary.gapCount === 1 ? "" : "s"} to fill)`
          : "Open gaps: no major gaps (45+ mins) in loaded bookings"
      ];
      const revenueSignalItems = [
        {
          label: "Estimated Day Revenue",
          value: formatMoney?.(revenueDisplay.total),
          meterClass: "",
          widthPct: revenueDisplay.progressPct,
          meta: `${revenueDisplay.progressPct}% of day target (${formatMoney?.(revenueDisplay.target)})${useRevenuePreview ? " - preview" : ""}`
        },
        {
          label: "Confirmed / Pending Value",
          value: formatMoney?.(revenueDisplay.confirmed),
          meterClass: "confirmed",
          widthPct: revenueDisplay.total > 0 ? Math.round((revenueDisplay.confirmed / revenueDisplay.total) * 100) : 0,
          meta: revenueDisplay.total > 0 ? `${Math.round((revenueDisplay.confirmed / revenueDisplay.total) * 100)}% of loaded day value${useRevenuePreview ? " (preview)" : ""}` : "No booking value yet"
        },
        {
          label: "Completed Value",
          value: formatMoney?.(revenueDisplay.completed),
          meterClass: "completed",
          widthPct: revenueDisplay.completedPct,
          meta: revenueDisplay.total > 0 ? `${revenueDisplay.completedPct}% of loaded day value${useRevenuePreview ? " (preview)" : ""}` : "No completed booking value yet"
        },
        {
          label: "Cancelled Value Risk",
          value: formatMoney?.(revenueDisplay.cancelled),
          meterClass: "cancelled",
          widthPct: revenueDisplay.cancelledPct,
          meta: revenueDisplay.cancelled > 0 ? `${revenueDisplay.cancelledPct}% at risk on this day${useRevenuePreview ? " (preview)" : ""}` : "No cancelled value in loaded day bookings"
        }
      ];
      const daySummaryText = [
        `${formatCalendarDayTitle?.(safeDateKey)}`,
        `Total bookings: ${total}`,
        `Confirmed: ${confirmed}`,
        `Cancelled: ${cancelled}`,
        `Completed: ${completed}`,
        `Estimated day revenue: ${formatMoney?.(revenueDisplay.total)}${useRevenuePreview ? " (preview estimate)" : ""}`,
        `Cancelled value risk: ${formatMoney?.(revenueDisplay.cancelled)}${useRevenuePreview ? " (preview estimate)" : ""}`,
        topServiceEntry ? `Top service: ${topServiceEntry[0]} (${topServiceEntry[1]})` : "Top service: none yet",
        scheduleSignalItems[0],
        scheduleSignalItems[1],
        scheduleSignalItems[2],
        scheduleSignalItems[3]
      ].join("\n");

      shell.innerHTML = `
      <div class="calendar-day-modal-head">
        <div>
          <h3 id="calendarDayModalTitle">${escapeHtml?.(formatCalendarDayTitle?.(safeDateKey))}</h3>
          <p>Review the day at a glance, check bookings, and manage schedule changes without leaving the calendar.</p>
          <div class="module-info-modal-meta">
            <span class="module-chip">Calendar day workspace</span>
            <span class="module-chip muted">${escapeHtml?.(safeDateKey)}</span>
            ${getSelectedCalendarDateKey?.() === safeDateKey ? '<span class="module-chip muted">Day filter active</span>' : ""}
          </div>
        </div>
        <button type="button" class="module-info-close" aria-label="Close day workspace">x</button>
      </div>
      <div class="calendar-day-modal-body">
        <section class="calendar-day-summary-grid" aria-label="Day summary">
          <article class="calendar-day-stat"><p>Total bookings</p><strong>${total}</strong></article>
          <article class="calendar-day-stat"><p>Confirmed</p><strong>${confirmed}</strong></article>
          <article class="calendar-day-stat"><p>Cancelled</p><strong>${cancelled}</strong></article>
          <article class="calendar-day-stat"><p>Completed</p><strong>${completed}</strong></article>
        </section>
        <section class="calendar-day-layout">
          <div class="calendar-day-pane">
            <div class="calendar-day-actions-row">
              <button class="btn" type="button" data-day-popup-action="add-booking" ${canManage && businessId ? "" : "disabled"}>Add Booking</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="open-bookings">Open Booking Operations</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="open-waitlist">Waitlist Recovery</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="clear-filter">Clear Day Filter</button>
            </div>
            <p class="calendar-day-list-note">${escapeHtml?.(helperNote)}</p>
            <ul class="calendar-day-booking-list">${bookingCards}</ul>
          </div>
          <aside class="calendar-day-pane">
            <h4>Day Summary</h4>
            <p>${total ? `You have ${total} booking${total === 1 ? "" : "s"} scheduled for this day.` : "No bookings scheduled yet for this day."}</p>
            <div class="module-info-feature-list">
              <li>${escapeHtml?.(topServiceEntry ? `Most booked service: ${topServiceEntry[0]} (${topServiceEntry[1]})` : "Most booked service: none yet")}</li>
              <li>${escapeHtml?.(cancelled ? `${cancelled} cancellation${cancelled === 1 ? "" : "s"} on this day. Check waitlist recovery if needed.` : "No cancellations on this day in the loaded bookings.")}</li>
              <li>${escapeHtml?.(getSelectedCalendarDateKey?.() === safeDateKey ? "Booking Operations is filtered to this day right now." : "Clicking a date also updates your booking filters for faster follow-up.")}</li>
            </div>
            <h4 style="margin-top:0.15rem;">Schedule Signals</h4>
            <div class="module-info-feature-list">
              ${scheduleSignalItems.map((item) => `<li>${escapeHtml?.(item)}</li>`).join("")}
            </div>
            <h4 style="margin-top:0.15rem;">Day Revenue Signals</h4>
            <div class="calendar-day-revenue-gauges">
              ${revenueSignalItems.map((item) => `
                <article class="calendar-day-revenue-gauge">
                  <div class="calendar-day-revenue-gauge-top">
                    <span>${escapeHtml?.(item.label)}</span>
                    <strong>${escapeHtml?.(item.value)}</strong>
                  </div>
                  <div class="calendar-day-revenue-meter ${escapeHtml?.(item.meterClass)}" style="--day-gauge-width:${Math.max(0, Math.min(100, Number(item.widthPct || 0)))}%;">
                    <i aria-hidden="true"></i>
                  </div>
                  <div class="calendar-day-revenue-note">${escapeHtml?.(item.meta)}</div>
                </article>
              `).join("")}
            </div>
            ${useRevenuePreview ? `
              <p class="calendar-day-revenue-note">
                Preview revenue signals are shown because this day has bookings without saved prices yet. Add service prices or priced bookings to see real values.
              </p>
            ` : ""}
            ${!useRevenuePreview && total === 0 ? `
              <p class="calendar-day-revenue-note">
                New day / clean slate: revenue signals stay visible and start at zero until bookings are added.
              </p>
            ` : ""}
            ${(Number(revenueSummary.estimatedCount || 0) > 0 || Number(revenueSummary.missingCount || 0) > 0) ? `
              <p class="calendar-day-revenue-note">
                ${escapeHtml?.(
                  `${revenueSummary.estimatedCount ? `${revenueSummary.estimatedCount} booking value estimate${revenueSummary.estimatedCount === 1 ? "" : "s"} used from your service price list.` : ""}${revenueSummary.estimatedCount && revenueSummary.missingCount ? " " : ""}${revenueSummary.missingCount ? `${revenueSummary.missingCount} booking${revenueSummary.missingCount === 1 ? "" : "s"} have no price estimate yet.` : ""}`
                )}
              </p>
            ` : ""}
            <h4 style="margin-top:0.15rem;">Quick Links</h4>
            <div class="calendar-day-actions-row">
              <button class="btn btn-ghost" type="button" data-module-jump="calendar">Calendar</button>
              <button class="btn btn-ghost" type="button" data-module-jump="booking_ops">Booking Operations</button>
              <button class="btn btn-ghost" type="button" data-module-jump="waitlist">Waitlist</button>
            </div>
            <h4 style="margin-top:0.15rem;">Quick Actions</h4>
            <div class="calendar-day-actions-row">
              <button class="btn btn-ghost" type="button" data-day-popup-action="ask-copilot">Ask Copilot About This Day</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="copy-summary" data-summary="${escapeHtml?.(daySummaryText)}">Copy Day Summary</button>
            </div>
          </aside>
        </section>
      </div>
      <div class="module-workspace-actions">
        <small class="module-info-hint">Press Esc or click outside to close.</small>
        <button type="button" class="btn btn-ghost calendar-day-dashboard-btn">Back to Dashboard</button>
        <button type="button" class="btn btn-ghost calendar-day-close-btn">Close</button>
      </div>
    `;

      shell.querySelector(".module-info-close")?.addEventListener("click", close);
      shell.querySelector(".calendar-day-dashboard-btn")?.addEventListener("click", () => {
        close();
        returnToDashboardHomeView?.();
      });
      shell.querySelector(".calendar-day-close-btn")?.addEventListener("click", close);

      shell.querySelectorAll("[data-day-popup-action]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const target = event.currentTarget;
          if (!(target instanceof HTMLElement)) return;
          const action = String(target.getAttribute("data-day-popup-action") || "").trim();
          const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
          try {
            if (action === "open-bookings") {
              close();
              focusModuleByKey?.("booking_ops");
              return;
            }
            if (action === "open-waitlist") {
              close();
              focusModuleByKey?.("waitlist");
              setWaitlistStatus?.(`Waitlist recovery view opened for ${safeDateKey}. Review cancellations and contact best-fit clients.`);
              return;
            }
            if (action === "recover-slot" && bookingId) {
              const booking = rows.find((row) => String(row?.id || "").trim() === bookingId);
              close();
              if (stageWaitlistRecoveryFromBooking?.(booking)) {
                showManageToast?.("Waitlist recovery form pre-filled from cancelled booking.");
              }
              return;
            }
            if (action === "clear-filter") {
              setBookingDateFilter?.({ keys: null, label: "All dates" });
              applyBookingFilters?.();
              renderSubscriberCalendar?.();
              renderDayPopup();
              return;
            }
            if (action === "ask-copilot") {
              const questionText = getUserRole?.() === "admin"
                ? `Review ${safeDateKey}. What should I check for issues, cancellations, staffing pressure, or follow-up today?`
                : `Review ${safeDateKey}. What should I focus on today for bookings, cancellations, staffing pressure, waitlist recovery, and revenue?`;
              close();
              if (getUserRole?.() === "admin") {
                openBusinessAiChatPopup?.("admin", {
                  focusInput: false,
                  prompt: questionText
                });
              } else {
                openBusinessAiChatPopup?.("subscriber", {
                  focusInput: false,
                  prompt: questionText
                });
              }
              requestLexiSubmit?.();
              return;
            }
            if (action === "copy-summary") {
              const summary = String(target.getAttribute("data-summary") || "").trim();
              if (!summary) return;
              try {
                if (navigator?.clipboard?.writeText) {
                  await navigator.clipboard.writeText(summary);
                } else {
                  throw new Error("Clipboard unavailable");
                }
                showManageToast?.("Day summary copied.");
              } catch {
                showManageToast?.("Could not copy summary on this device.", "error");
              }
              return;
            }
            if (action === "add-booking") {
              if (!canManage || !businessId) return;
              close();
              const values = await openManageForm?.({
                title: `Add Booking (${safeDateKey})`,
                submitLabel: "Create Booking",
                fields: [
                  { id: "customerName", label: "Customer Name", required: true },
                  { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+12025550111" },
                  { id: "customerEmail", label: "Customer Email" },
                  { id: "service", label: "Service", required: true },
                  { id: "date", label: "Date", type: "date", required: true, value: safeDateKey },
                  { id: "time", label: "Time", type: "time", required: true }
                ]
              });
              if (!values) {
                openCalendarDayWorkspace(safeDateKey);
                return;
              }
              await createBooking?.({ businessId, ...values });
              await refreshBookingsAfterDayPopupMutation();
              showManageToast?.("Booking created.");
              openCalendarDayWorkspace(safeDateKey);
              return;
            }
            if (action === "edit-booking" && bookingId) {
              if (!canManage) return;
              close();
              await rescheduleBooking?.(bookingId);
              await refreshBookingsAfterDayPopupMutation();
              showManageToast?.("Booking updated.");
              openCalendarDayWorkspace(safeDateKey);
              return;
            }
            if (action === "delete-booking" && bookingId) {
              if (!canManage) return;
              close();
              const confirmedDelete = await openManageConfirm?.({
                title: "Delete Booking",
                message: "Cancel this booking for the selected day?",
                confirmLabel: "Delete"
              });
              if (confirmedDelete) {
                await cancelBooking?.(bookingId);
                await refreshBookingsAfterDayPopupMutation();
                showManageToast?.("Booking deleted.");
              }
              openCalendarDayWorkspace(safeDateKey);
            }
          } catch (error) {
            showManageToast?.(error?.message || "Could not complete booking action.", "error");
            openCalendarDayWorkspace(safeDateKey);
          }
        });
      });

      shell.querySelectorAll("[data-module-jump]").forEach((button) => {
        button.addEventListener("click", (event) => {
          const target = event.currentTarget;
          if (!(target instanceof HTMLElement)) return;
          const next = String(target.getAttribute("data-module-jump") || "").trim();
          if (!next) return;
          close();
          focusModuleByKey?.(next);
        });
      });
    };

    renderDayPopup();
    const closeButton = shell.querySelector(".module-info-close");
    if (closeButton instanceof HTMLElement) closeButton.focus();
  }

  return {
    refreshBookingsAfterDayPopupMutation,
    openCalendarDayWorkspace
  };
}
