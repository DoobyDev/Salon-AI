// Calendar diary focus, strip, walk-in, and refresh runtime.
export function createCalendarDiaryRuntime(deps) {
  const {
    win = window,
    doc = document,
    getUserRole,
    getManageModeEnabled,
    getManagedBusinessId,
    getUserBusinessId,
    getSelectedCalendarDateKey,
    getBookingRows,
    getStaffRosterRows,
    getCalendarMonth,
    setCalendarMonth,
    getCalendarTodayRefreshTimerId,
    setCalendarTodayRefreshTimerId,
    parseDateKeyToDate,
    parseBookingDate,
    parseServiceEditorText,
    toDateKey,
    formatMoney,
    escapeHtml,
    getStaffWorkingForDate,
    getStaffMemberId,
    summarizeCalendarDaySchedule,
    setBookingDateFilter,
    applyBookingFilters,
    renderSubscriberCalendar,
    renderBusinessAiWorkspace,
    openCalendarDayWorkspace,
    openManageForm,
    createBooking,
    refreshBookingsAfterDayPopupMutation,
    showManageToast,
    focusModuleByKey,
    calendarDiaryWeekStrip
  } = deps || {};

  function getCalendarDiaryFocusDateKey() {
    return String(getSelectedCalendarDateKey?.() || toDateKey?.(new Date())).trim();
  }

  function getCalendarDiaryFocusDate() {
    return parseDateKeyToDate?.(getCalendarDiaryFocusDateKey()) || new Date();
  }

  function getCalendarDiaryServiceOptions() {
    try {
      return parseServiceEditorText?.(String(deps?.getBusinessProfileServicesValue?.() || "")).map((service) => ({
        value: String(service.name || "").trim(),
        label: `${String(service.name || "").trim()} • ${Number(service.durationMin || 0)} min • ${formatMoney?.(Number(service.price || 0))}`
      })).filter((option) => option.value);
    } catch {
      return [];
    }
  }

  function getBookingsForDateKey(dateKey) {
    return (Array.isArray(getBookingRows?.()) ? getBookingRows() : [])
      .filter((row) => {
        const date = parseBookingDate?.(row?.date);
        return date ? toDateKey?.(date) === dateKey : false;
      })
      .sort((a, b) => {
        const aTime = String(a?.time || "");
        const bTime = String(b?.time || "");
        if (aTime !== bTime) return aTime.localeCompare(bTime);
        return String(a?.createdAt || "").localeCompare(String(b?.createdAt || ""));
      });
  }

  function formatCalendarDayTitle(dateKey) {
    const date = parseDateKeyToDate?.(dateKey);
    if (!date) return dateKey;
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function jumpToCalendarDate(dateKey, options = {}) {
    const safeDateKey = String(dateKey || "").trim();
    if (!safeDateKey) return;
    const dateObj = parseDateKeyToDate?.(safeDateKey);
    if (dateObj) {
      setCalendarMonth?.(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }
    setBookingDateFilter?.({
      keys: new Set([safeDateKey]),
      label: `Selected ${safeDateKey}`,
      selectedDateKey: safeDateKey
    });
    applyBookingFilters?.();
    renderSubscriberCalendar?.();
    renderBusinessAiWorkspace?.("subscriber");
    renderBusinessAiWorkspace?.("admin");
    if (options.openDayWorkspace) {
      openCalendarDayWorkspace?.(safeDateKey);
    }
  }

  function renderCalendarDiaryWeekStrip() {
    if (!calendarDiaryWeekStrip) return;
    const focusDate = getCalendarDiaryFocusDate();
    const start = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate());
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);

    const cards = [];
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const dateKey = toDateKey?.(date);
      const rows = getBookingsForDateKey(dateKey);
      const staffWorking = getStaffWorkingForDate?.(date) || [];
      const isSelected = dateKey === getCalendarDiaryFocusDateKey();
      const topLine = rows.length ? `${rows.length} booking${rows.length === 1 ? "" : "s"}` : "No bookings";
      const detail = staffWorking.length ? `${staffWorking.length} staff on rota` : "No rota cover set";
      cards.push(`
        <button type="button" class="calendar-week-focus-card${isSelected ? " is-selected" : ""}" data-date-key="${escapeHtml(dateKey)}">
          <span>${escapeHtml(date.toLocaleDateString("en-GB", { weekday: "short" }))}</span>
          <strong>${escapeHtml(date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }))}</strong>
          <small>${escapeHtml(topLine)} • ${escapeHtml(detail)}</small>
        </button>
      `);
    }
    calendarDiaryWeekStrip.innerHTML = cards.join("");
  }

  function renderCalendarDiaryAgenda() {
    const calendarDiaryAgenda = doc.getElementById("calendarDiaryAgenda");
    if (!calendarDiaryAgenda) return;
    const focusDateKey = getCalendarDiaryFocusDateKey();
    const rows = getBookingsForDateKey(focusDateKey);
    const title = formatCalendarDayTitle(focusDateKey);
    const scheduleSummary = summarizeCalendarDaySchedule?.(rows) || {};
    const openGapText = scheduleSummary.largestGapMins != null
      ? `Largest gap ${scheduleSummary.largestGapMins} mins`
      : "No major 45+ minute gaps";
    const items = rows.length
      ? rows.slice(0, 8).map((row) => {
          const status = String(row?.status || "pending").trim() || "pending";
          const service = String(row?.service || "Service").trim() || "Service";
          const customer = String(row?.customerName || "Customer").trim() || "Customer";
          const contact = [String(row?.customerPhone || "").trim(), String(row?.customerEmail || "").trim()].filter(Boolean).join(" • ") || "No contact saved";
          return `
            <li>
              <div class="calendar-diary-agenda-row">
                <div>
                  <strong>${escapeHtml(String(row?.time || "Time not set"))} • ${escapeHtml(customer)}</strong>
                  <small>${escapeHtml(service)}</small>
                </div>
                <span class="calendar-diary-agenda-chip">${escapeHtml(status)}</span>
              </div>
              <small>${escapeHtml(contact)}</small>
            </li>
          `;
        }).join("")
      : `
        <li class="calendar-diary-agenda-empty">
          <strong>No bookings yet for this day.</strong>
          <small>Add a walk-in, keep this date open for same-day demand, or ask Lexi how to fill it.</small>
        </li>
      `;
    calendarDiaryAgenda.innerHTML = `
      <div class="calendar-diary-agenda-head">
        <div>
          <p class="calendar-wow-kicker" style="margin-bottom:0.2rem;">Selected day agenda</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="calendar-diary-agenda-meta">${escapeHtml(rows.length ? `${rows.length} bookings loaded • ${openGapText}` : "Use this panel to work the selected day.")}</div>
      </div>
      <div class="calendar-diary-agenda-actions">
        <button class="btn" type="button" data-calendar-diary-action="add-walk-in" data-date-key="${escapeHtml(focusDateKey)}">Add Walk-in</button>
        <button class="btn btn-ghost" type="button" data-calendar-diary-action="open-day" data-date-key="${escapeHtml(focusDateKey)}">Open Day Workspace</button>
        <button class="btn ask-lexi-btn" type="button" data-calendar-diary-action="ask-lexi" data-date-key="${escapeHtml(focusDateKey)}">Ask Lexi About This Day</button>
      </div>
      <ul class="calendar-diary-agenda-list">${items}</ul>
    `;
  }

  function renderCalendarDiaryRotaPanel() {
    const calendarDiaryRotaPanel = doc.getElementById("calendarDiaryRotaPanel");
    if (!calendarDiaryRotaPanel) return;
    const focusDate = getCalendarDiaryFocusDate();
    const focusDateKey = toDateKey?.(focusDate);
    const staffWorking = getStaffWorkingForDate?.(focusDate) || [];
    const staffRosterRows = Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : [];
    const rows = staffWorking.slice(0, 4).map((staff) => {
      const member = staffRosterRows.find((row) => getStaffMemberId?.(row) === staff.id);
      const availability = String(member?.availability || "on_duty").trim() || "on_duty";
      const nextAvailability = availability === "on_duty" ? "off_duty" : "on_duty";
      return `
        <li>
          <div class="calendar-diary-staff-head">
            <div>
              <strong>${escapeHtml(staff.name)}</strong>
              <small>${escapeHtml(staff.status === "covering" ? "Covering shift" : "Scheduled to work")}</small>
            </div>
            <span class="calendar-diary-agenda-chip">${escapeHtml(availability === "on_duty" ? "On duty" : "Off duty")}</span>
          </div>
          <div class="calendar-diary-staff-actions">
            <button class="btn btn-ghost" type="button" data-calendar-rota-action="sick" data-staff-id="${escapeHtml(staff.id)}">Report Sick</button>
            <button class="btn btn-ghost" type="button" data-calendar-rota-action="toggle" data-staff-id="${escapeHtml(staff.id)}" data-next="${escapeHtml(nextAvailability)}">${escapeHtml(nextAvailability === "off_duty" ? "Set Off Duty" : "Set Available")}</button>
          </div>
        </li>
      `;
    }).join("");
    calendarDiaryRotaPanel.innerHTML = `
      <h3>Staff cover for ${escapeHtml(focusDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))}</h3>
      <p class="calendar-diary-staff-note">${escapeHtml(staffWorking.length ? `${staffWorking.length} team member${staffWorking.length === 1 ? "" : "s"} available for the selected day.` : "No rota cover is set for this day yet.")}</p>
      ${rows ? `<ul class="calendar-diary-staff-list">${rows}</ul>` : ""}
      <div class="calendar-diary-rota-actions">
        <button class="btn btn-ghost" type="button" data-calendar-rota-action="open-staff">Open Staff Rota</button>
        <button class="btn btn-ghost" type="button" data-calendar-rota-action="open-day" data-date-key="${escapeHtml(focusDateKey)}">Open Day Workspace</button>
      </div>
    `;
  }

  async function openCalendarDiaryWalkIn(defaultDateKey = getCalendarDiaryFocusDateKey()) {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    if (!getManageModeEnabled?.()) {
      showManageToast?.("Turn on Edit Mode to add a walk-in.", "error");
      focusModuleByKey?.("booking_ops");
      return;
    }
    const businessId = String(getManagedBusinessId?.() || getUserBusinessId?.() || "").trim();
    if (!businessId) {
      showManageToast?.("No business selected yet.", "error");
      return;
    }
    const serviceOptions = getCalendarDiaryServiceOptions();
    const values = await openManageForm?.({
      title: `Add Walk-in (${defaultDateKey})`,
      submitLabel: "Create Walk-in",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+447700900123" },
        { id: "customerEmail", label: "Customer Email" },
        serviceOptions.length
          ? { id: "service", label: "Service", type: "select", required: true, value: serviceOptions[0].value, options: serviceOptions }
          : { id: "service", label: "Service", required: true },
        { id: "date", label: "Date", type: "date", required: true, value: defaultDateKey },
        { id: "time", label: "Time", type: "time", required: true },
        { id: "notes", label: "Notes", type: "textarea", rows: 2 }
      ]
    });
    if (!values) return;
    await createBooking?.({ businessId, ...values, source: "walk_in" });
    await refreshBookingsAfterDayPopupMutation?.();
    jumpToCalendarDate(String(values.date || defaultDateKey).trim() || defaultDateKey);
    showManageToast?.("Walk-in added to the diary.");
  }

  function scheduleCalendarTodayRefresh() {
    const timerId = getCalendarTodayRefreshTimerId?.();
    if (timerId) {
      win.clearTimeout(timerId);
      setCalendarTodayRefreshTimerId?.(null);
    }
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    const delayMs = Math.max(1000, nextMidnight.getTime() - now.getTime());
    const nextTimer = win.setTimeout(() => {
      renderSubscriberCalendar?.();
      scheduleCalendarTodayRefresh();
    }, delayMs);
    setCalendarTodayRefreshTimerId?.(nextTimer);
  }

  return {
    getCalendarDiaryFocusDateKey,
    getCalendarDiaryFocusDate,
    getCalendarDiaryServiceOptions,
    getBookingsForDateKey,
    formatCalendarDayTitle,
    jumpToCalendarDate,
    renderCalendarDiaryWeekStrip,
    renderCalendarDiaryAgenda,
    renderCalendarDiaryRotaPanel,
    openCalendarDiaryWalkIn,
    scheduleCalendarTodayRefresh
  };
}
