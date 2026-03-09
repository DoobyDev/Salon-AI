// Customer Lexi planner/calendar runtime.
export function createCustomerLexiPlannerRuntime(deps) {
  const {
    doc = document,
    t,
    getUserRole,
    parseBookingDate,
    toDateKey,
    pad2,
    todayDateKeyLocal,
    escapeHtml,
    getStaffInitials,
    getStaffColorForId,
    formatBusinessTypeLabel,
    getSelectedCustomerSalon,
    getBookingRows,
    customerLexiDaySummary,
    customerLexiStaffLegend,
    customerLexiCalendarGrid,
    customerLexiCalendarMonth,
    customerLexiCalendarMeta,
    customerLexiPlannerMeta,
    customerLexiCalendarViewTabs,
    getCustomerLexiSelectedDateKey,
    setCustomerLexiSelectedDateKey,
    getCustomerLexiCalendarView,
    getCustomerLexiCalendarMonthCursor
  } = deps || {};

  function parseCustomerSlotEntry(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const [datePart, timePart = ""] = raw.split(/\s+/);
    const parsedDate = parseBookingDate?.(datePart);
    if (!parsedDate) return null;
    return {
      raw,
      dateKey: toDateKey?.(parsedDate),
      time: timePart || raw,
      date: parsedDate
    };
  }

  function getCustomerLexiCalendarDataset() {
    const salon = getSelectedCustomerSalon?.();
    const bookingsByDate = new Map();
    const slotsByDate = new Map();
    const upcomingBookings = [];

    (Array.isArray(getBookingRows?.()) ? getBookingRows() : []).forEach((row) => {
      const dateObj = parseBookingDate?.(row?.date);
      if (!dateObj) return;
      const dateKey = toDateKey?.(dateObj);
      const list = bookingsByDate.get(dateKey) || [];
      list.push(row);
      bookingsByDate.set(dateKey, list);
      upcomingBookings.push({ row, dateObj, dateKey });
    });

    (Array.isArray(salon?.availableSlots) ? salon.availableSlots : []).forEach((slot) => {
      const parsed = parseCustomerSlotEntry(slot);
      if (!parsed) return;
      const list = slotsByDate.get(parsed.dateKey) || [];
      list.push(parsed);
      slotsByDate.set(parsed.dateKey, list);
    });

    return { salon, bookingsByDate, slotsByDate, upcomingBookings };
  }

  function buildCustomerLexiPlannerPrompt(action, payload = {}) {
    const salonName = payload.salonName || "the selected salon";
    const dateLabel = payload.dateLabel || "the selected day";
    if (action === "week-plan") {
      return `Review the week around ${dateLabel} at ${salonName}. Show me the best booking options, busy days, and easier days to book.`;
    }
    if (action === "month-plan") {
      return `Review this month at ${salonName} and recommend the best dates and times to book based on the available slots shown.`;
    }
    if (action === "day-slots") {
      return `What are the best available slots on ${dateLabel} at ${salonName}?`;
    }
    if (action === "day-booking") {
      return `Help me plan ${dateLabel} at ${salonName}. Which time should I choose based on availability?`;
    }
    return `Recommend my next best booking slot at ${salonName} based on available times and a convenient day.`;
  }

  function getCustomerLexiTeamMembers(salon) {
    const names = Array.from(
      new Set(
        [
          ...(Array.isArray(salon?.specialists) ? salon.specialists : []),
          ...(Array.isArray(salon?.barbers) ? salon.barbers : [])
        ]
          .map((name) => String(name || "").trim())
          .filter(Boolean)
      )
    );
    return names.map((name) => ({
      name,
      color: getStaffColorForId?.(`customer:${String(salon?.id || "salon")}:${name.toLowerCase()}`)
    }));
  }

  function renderCustomerLexiStaffLegend(salon) {
    if (!customerLexiStaffLegend) return;
    const teamMembers = getCustomerLexiTeamMembers(salon);
    if (!teamMembers.length) {
      customerLexiStaffLegend.innerHTML = '<span class="calendar-staff-chip">No team names listed yet</span>';
      return;
    }
    customerLexiStaffLegend.innerHTML = teamMembers
      .slice(0, 8)
      .map((member) => {
        return `
        <span class="calendar-staff-chip">
          <span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml?.(member.color)}">${escapeHtml?.(getStaffInitials?.(member.name))}</span>
          ${escapeHtml?.(member.name)}
        </span>
      `;
      })
      .join("");
  }

  function getWeekStartFromDateKey(dateKey) {
    const dateObj = parseBookingDate?.(dateKey);
    if (!dateObj) return null;
    const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const weekday = d.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    d.setDate(d.getDate() + mondayOffset);
    return d;
  }

  function renderCustomerLexiDaySummary(dataset) {
    if (!customerLexiDaySummary) return;
    const teamMembers = getCustomerLexiTeamMembers(dataset.salon);
    const dateKey = String(getCustomerLexiSelectedDateKey?.() || "").trim();
    if (!dateKey) {
      customerLexiDaySummary.innerHTML = `
      <h3>Selected Day</h3>
      <p>Choose a date to see your bookings, open slots, and quick Lexi booking help.</p>
    `;
      return;
    }
    const bookingRowsForDay = dataset.bookingsByDate.get(dateKey) || [];
    const slotsForDay = dataset.slotsByDate.get(dateKey) || [];
    const dateObj = parseBookingDate?.(dateKey);
    const dateLabel = dateObj
      ? dateObj.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
      : dateKey;
    const salonName = dataset.salon?.name || "Selected salon";
    const calendarView = getCustomerLexiCalendarView?.();
    if (calendarView === "week") {
      const weekStart = getWeekStartFromDateKey(dateKey);
      const weekDays = weekStart
        ? Array.from({ length: 7 }, (_, index) => {
            const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
            const key = toDateKey?.(d);
            return {
              key,
              label: d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" }),
              bookings: (dataset.bookingsByDate.get(key) || []).length,
              slots: (dataset.slotsByDate.get(key) || []).length
            };
          })
        : [];
      const totalWeekBookings = weekDays.reduce((sum, item) => sum + item.bookings, 0);
      const totalWeekSlots = weekDays.reduce((sum, item) => sum + item.slots, 0);
      customerLexiDaySummary.innerHTML = `
      <h3>Week View</h3>
      <p><strong>${escapeHtml?.(salonName)}</strong><br />Weekly booking and availability overview around ${escapeHtml?.(dateLabel)}.</p>
      <ul class="customer-lexi-summary-list">
        <li><strong>${totalWeekBookings} booking${totalWeekBookings === 1 ? "" : "s"} this week</strong><small>From your saved bookings in this dashboard</small></li>
        <li><strong>${totalWeekSlots} open slot${totalWeekSlots === 1 ? "" : "s"} showing</strong><small>Current slots visible for the selected salon</small></li>
        <li><strong>${teamMembers.length} team member${teamMembers.length === 1 ? "" : "s"}</strong><small>${escapeHtml?.(teamMembers.length ? teamMembers.map((m) => m.name).join(", ") : "No staff names listed")}</small></li>
      </ul>
      <ul class="customer-lexi-summary-list">
        ${weekDays
          .map(
            (item) => `<li><strong>${escapeHtml?.(item.label)}</strong><small>${item.bookings} booking${item.bookings === 1 ? "" : "s"} - ${item.slots} slot${item.slots === 1 ? "" : "s"} - ${escapeHtml?.(teamMembers.length ? `${teamMembers.length} staff listed` : "No staff listed")}</small></li>`
          )
          .join("")}
      </ul>
      <div class="customer-lexi-summary-actions">
        <button type="button" class="btn btn-ghost" data-customer-lexi-action="week-plan" data-date-key="${escapeHtml?.(dateKey)}" data-date-label="${escapeHtml?.(dateLabel)}">${escapeHtml?.(t?.("dashboard.customer_week_review", "Ask Lexi to review this week"))}</button>
        <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
      </div>
    `;
      return;
    }
    if (calendarView === "month") {
      const monthPrefix = dateKey.slice(0, 8);
      const monthlySlotDays = Array.from(dataset.slotsByDate.entries())
        .filter(([key]) => String(key).startsWith(monthPrefix))
        .map(([key, slots]) => ({ key, count: slots.length }))
        .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
        .slice(0, 5);
      const monthBookings = Array.from(dataset.bookingsByDate.entries())
        .filter(([key]) => String(key).startsWith(monthPrefix))
        .reduce((sum, [, rows]) => sum + rows.length, 0);
      const monthSlots = Array.from(dataset.slotsByDate.entries())
        .filter(([key]) => String(key).startsWith(monthPrefix))
        .reduce((sum, [, slots]) => sum + slots.length, 0);
      customerLexiDaySummary.innerHTML = `
      <h3>Month View</h3>
      <p><strong>${escapeHtml?.(salonName)}</strong><br />Monthly booking and availability summary for ${escapeHtml?.(dateKey.slice(0, 7))}.</p>
      <ul class="customer-lexi-summary-list">
        <li><strong>${monthBookings} booking${monthBookings === 1 ? "" : "s"}</strong><small>Your bookings saved this month</small></li>
        <li><strong>${monthSlots} open slot${monthSlots === 1 ? "" : "s"}</strong><small>Visible slots this month for the selected salon</small></li>
        <li><strong>${teamMembers.length} staff listed</strong><small>${escapeHtml?.(teamMembers.length ? teamMembers.map((m) => m.name).join(", ") : "No staff names listed")}</small></li>
      </ul>
      <ul class="customer-lexi-summary-list">
        ${
          monthlySlotDays.length
            ? monthlySlotDays
                .map((item) => `<li><strong>${escapeHtml?.(item.key)}</strong><small>${item.count} slot${item.count === 1 ? "" : "s"} visible</small></li>`)
                .join("")
            : '<li><strong>No visible slot-heavy dates yet</strong><small>Select another salon or month to compare availability.</small></li>'
        }
      </ul>
      <div class="customer-lexi-summary-actions">
        <button type="button" class="btn btn-ghost" data-customer-lexi-action="month-plan" data-date-key="${escapeHtml?.(dateKey)}" data-date-label="${escapeHtml?.(dateLabel)}">${escapeHtml?.(t?.("dashboard.customer_month_review", "Ask Lexi to review this month"))}</button>
        <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
      </div>
    `;
      return;
    }
    customerLexiDaySummary.innerHTML = `
    <h3>Selected Day</h3>
    <p><strong>${escapeHtml?.(dateLabel)}</strong><br />Lexi is comparing your plans with ${escapeHtml?.(salonName)} availability.</p>
    <ul class="customer-lexi-summary-list">
      <li><strong>${bookingRowsForDay.length} personal booking${bookingRowsForDay.length === 1 ? "" : "s"}</strong><small>${bookingRowsForDay.length ? "Your bookings saved in this dashboard" : "No personal bookings saved for this day"}</small></li>
      <li><strong>${slotsForDay.length} salon slot${slotsForDay.length === 1 ? "" : "s"} showing</strong><small>${slotsForDay.length ? escapeHtml?.(slotsForDay.slice(0, 3).map((slot) => slot.time).join(", ")) : "No open slots listed for this date"}</small></li>
      <li><strong>${escapeHtml?.(salonName)}</strong><small>${escapeHtml?.(formatBusinessTypeLabel?.(dataset.salon?.businessType || ""))}${dataset.salon?.city ? ` - ${escapeHtml?.(dataset.salon.city)}` : ""} - ${escapeHtml?.(teamMembers.length ? `${teamMembers.length} staff listed` : "No staff listed")}</small></li>
    </ul>
    <div class="customer-lexi-summary-actions">
      <button type="button" class="btn btn-ghost" data-customer-lexi-action="day-slots" data-date-key="${escapeHtml?.(dateKey)}" data-date-label="${escapeHtml?.(dateLabel)}">${escapeHtml?.(t?.("dashboard.customer_best_slots", "Ask Lexi about this day's best slots"))}</button>
      <button type="button" class="btn btn-ghost" data-customer-lexi-action="day-booking" data-date-key="${escapeHtml?.(dateKey)}" data-date-label="${escapeHtml?.(dateLabel)}">Let Lexi help me choose a time</button>
      <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
    </div>
  `;
  }

  function renderCustomerLexiCalendar() {
    if (getUserRole?.() !== "customer") return;
    if (!customerLexiCalendarGrid || !customerLexiCalendarMonth || !customerLexiCalendarMeta) return;

    const dataset = getCustomerLexiCalendarDataset();
    const teamMembers = getCustomerLexiTeamMembers(dataset.salon);
    const monthCursor = getCustomerLexiCalendarMonthCursor?.();
    const monthDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    customerLexiCalendarMonth.textContent = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const monthStartWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = todayDateKeyLocal?.();
    const monthPrefix = `${year}-${pad2?.(month + 1)}-`;

    let monthSlotCount = 0;
    let monthBookingCount = 0;
    dataset.slotsByDate.forEach((slots, key) => { if (String(key).startsWith(monthPrefix)) monthSlotCount += slots.length; });
    dataset.bookingsByDate.forEach((rows, key) => { if (String(key).startsWith(monthPrefix)) monthBookingCount += rows.length; });

    let selectedDateKey = String(getCustomerLexiSelectedDateKey?.() || "").trim();
    if (!selectedDateKey || !selectedDateKey.startsWith(monthPrefix)) {
      const firstUsefulDate = Array.from(new Set([...dataset.slotsByDate.keys(), ...dataset.bookingsByDate.keys()]))
        .filter((key) => String(key).startsWith(monthPrefix))
        .sort()[0];
      selectedDateKey = firstUsefulDate || (todayKey.startsWith(monthPrefix) ? todayKey : `${monthPrefix}01`);
      setCustomerLexiSelectedDateKey?.(selectedDateKey);
    }

    const calendarView = getCustomerLexiCalendarView?.();
    customerLexiCalendarMeta.innerHTML = `
    <strong>${escapeHtml?.(dataset.salon?.name || "Select a salon")}</strong><br />
    ${monthSlotCount} open slot${monthSlotCount === 1 ? "" : "s"} shown this month - ${monthBookingCount} personal booking${monthBookingCount === 1 ? "" : "s"} in your diary - View: ${escapeHtml?.(calendarView)}
  `;
    if (customerLexiPlannerMeta) {
      customerLexiPlannerMeta.textContent = dataset.salon
        ? `Lexi can compare your bookings with ${dataset.salon.name}'s available times and help you choose a better slot.`
        : "Choose a salon and Lexi will compare your schedule with that salon's open times.";
    }
    renderCustomerLexiStaffLegend(dataset.salon);

    customerLexiCalendarGrid.innerHTML = "";
    for (let i = 0; i < monthStartWeekday; i += 1) {
      const empty = doc.createElement("article");
      empty.className = "customer-lexi-day empty";
      empty.innerHTML = '<button type="button" class="customer-lexi-day-btn" disabled aria-hidden="true"></button>';
      customerLexiCalendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${monthPrefix}${pad2?.(day)}`;
      const slots = dataset.slotsByDate.get(dateKey) || [];
      const bookings = dataset.bookingsByDate.get(dateKey) || [];
      const isToday = dateKey === todayKey;
      const isSelected = dateKey === selectedDateKey;
      const cell = doc.createElement("article");
      cell.className = `customer-lexi-day${slots.length ? " has-slots" : ""}${bookings.length ? " has-booking" : ""}${isToday ? " is-today" : ""}${isSelected ? " selected" : ""}`;
      cell.dataset.dateKey = dateKey;
      cell.innerHTML = `
      <button class="customer-lexi-day-btn" type="button" data-date-key="${dateKey}" aria-label="${dateKey}: ${slots.length} slot${slots.length === 1 ? "" : "s"}, ${bookings.length} booking${bookings.length === 1 ? "" : "s"}">
        <strong>${day}</strong>
        <span class="customer-lexi-day-signals">
          ${slots.length ? `<span class="slots-pill">${slots.length} slot${slots.length === 1 ? "" : "s"}</span>` : ""}
          ${bookings.length ? `<span class="booked-pill">${bookings.length} booked</span>` : ""}
        </span>
        <span class="customer-lexi-day-team" aria-hidden="true">
          ${
            (slots.length || bookings.length) && teamMembers.length
              ? teamMembers
                  .slice(0, 3)
                  .map((member) => `<span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml?.(member.color)}" title="${escapeHtml?.(member.name)}"></span>`)
                  .join("")
              : ""
          }
        </span>
      </button>
    `;
      customerLexiCalendarGrid.appendChild(cell);
    }

    if (customerLexiCalendarViewTabs) {
      customerLexiCalendarViewTabs.querySelectorAll(".customer-lexi-view-tab").forEach((button) => {
        if (!(button instanceof HTMLElement)) return;
        const nextView = String(button.getAttribute("data-customer-lexi-view") || "").trim().toLowerCase();
        button.classList.toggle("is-active", nextView === calendarView);
        button.setAttribute("aria-selected", nextView === calendarView ? "true" : "false");
      });
    }

    renderCustomerLexiDaySummary(dataset);
  }

  return {
    parseCustomerSlotEntry,
    getCustomerLexiCalendarDataset,
    buildCustomerLexiPlannerPrompt,
    getCustomerLexiTeamMembers,
    renderCustomerLexiStaffLegend,
    getWeekStartFromDateKey,
    renderCustomerLexiDaySummary,
    renderCustomerLexiCalendar
  };
}
