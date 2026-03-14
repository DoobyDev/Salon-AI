// Subscriber calendar and executive pulse rendering runtime.
export function createCalendarPulseRuntime(deps) {
  const {
    fetchImpl = fetch,
    doc = document,
    getUserRole,
    getUserBusinessId,
    hideSection,
    showSection,
    escapeHtml,
    formatMoney,
    formatDateTime,
    parseBookingDate,
    toDateKey,
    todayDateKeyLocal,
    isPendingConfirmationStatus,
    getExecutivePulseRangeConfig,
    getExecutiveRowRevenueEstimate,
    getExecutivePulseBuckets,
    getBookingRows,
    getSelectedCalendarDateKey,
    getManagedBusinessId,
    getAdminPlatformAnalytics,
    getAdminRevenueAnalytics,
    getProfitabilityPayload,
    computeSubscriberMerchAnalytics,
    getCalendarMonth,
    setCalendarMonth,
    getExecutivePulseRange,
    setExecutivePulseRange,
    getExecutivePulseAdminMetricView,
    setExecutivePulseAdminMetricView,
    getLatestExecutivePulseSnapshotDraft,
    setLatestExecutivePulseSnapshotDraft,
    getStaffWorkingForDate,
    getStaffInitials,
    updateBookingRangeControls,
    renderWorkspaceStarPanel,
    applyBookingFilters,
    focusBookingOperations,
    openCalendarDayWorkspace,
    setBookingDateFilter,
    jumpToCalendarDate,
    openCalendarDiaryWalkIn,
    focusModuleByKey,
    applyBookingDatePreset,
    readExecutivePulseSnapshots,
    writeExecutivePulseSnapshots,
    refreshBookingsAfterDayPopupMutation,
    openManageForm,
    headers,
    withManagedBusiness,
    showToast,
    showManageToast,
    subscriberExecutivePulseSection,
    bookingCalendarGrid,
    calendarMonthLabel,
    calendarLegend,
    calendarPrev,
    calendarNext,
    bookingRangeToday,
    bookingRangeWeek,
    bookingRangeMonth,
    bookingRangeClear,
    bookingSearch,
    calendarViewTabs,
    executivePulseSubtitle,
    executivePulseTitle,
    executivePulseSignals,
    executivePulseGauges,
    executivePulseBars,
    executivePulseStorylineTitle,
    executivePulseActions,
    executivePulseRangeTabs,
    executivePulseAdminMetricTabs,
    executivePulseRangeMeta,
    executivePulseSaveSnapshotBtn,
    executivePulseFinanceTitle,
    executivePulseFinanceWindowLabel,
    executivePulseFinanceStats,
    executivePulseRevenueChart,
    executivePulseRevenueChartNote,
    executivePulseProfitChart,
    executivePulseProfitChartNote,
    executivePulseActionsTitle,
    executivePulseActionsSubtitle,
    executivePulseSnapshotList,
    executivePulseSnapshotsTitle,
    executivePulseSnapshotsSubtitle
  } = deps || {};

  let calendarViewMode = "month";
  let openCalendarPopupDateKey = "";

  function getCalendarViewStepDate(baseDate, direction) {
    const anchor = baseDate instanceof Date && !Number.isNaN(baseDate.getTime()) ? baseDate : new Date();
    const step = direction < 0 ? -1 : 1;
    if (calendarViewMode === "day") {
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + step);
    }
    if (calendarViewMode === "week") {
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + step * 7);
    }
    if (calendarViewMode === "year") {
      return new Date(anchor.getFullYear() + step, 0, 1);
    }
    return new Date(anchor.getFullYear(), anchor.getMonth() + step, 1);
  }

  function startOfWeek(dateObj) {
    const date = dateObj instanceof Date && !Number.isNaN(dateObj.getTime()) ? new Date(dateObj) : new Date();
    const offset = date.getDay() === 0 ? -6 : 1 - date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
  }

  function formatCalendarHeadline(dateObj) {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "Calendar";
    if (calendarViewMode === "day") {
      return dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (calendarViewMode === "week") {
      const start = startOfWeek(dateObj);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })}`;
    }
    if (calendarViewMode === "year") {
      return String(dateObj.getFullYear());
    }
    return dateObj.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  function buildBookingRowsByDate() {
    const map = new Map();
    (Array.isArray(getBookingRows?.()) ? getBookingRows() : []).forEach((row) => {
      const bookingDate = parseBookingDate?.(row?.date);
      if (!bookingDate) return;
      const key = toDateKey?.(bookingDate);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    map.forEach((rows) => {
      rows.sort((a, b) => String(a?.time || "").localeCompare(String(b?.time || "")));
    });
    return map;
  }

  function summarizeRows(rows = []) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const revenue = safeRows
      .filter((row) => normalizeStatus(row?.status) !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const completed = safeRows.filter((row) => normalizeStatus(row?.status) === "completed").length;
    const cancelled = safeRows.filter((row) => normalizeStatus(row?.status) === "cancelled").length;
    return {
      total: safeRows.length,
      completed,
      cancelled,
      revenue
    };
  }

  function getSelectedOrFallbackDate(anchorDate, rowsByDate) {
    const selectedKey = String(getSelectedCalendarDateKey?.() || "").trim();
    if (selectedKey) {
      const selectedDate = parseBookingDate?.(selectedKey) || new Date(selectedKey);
      if (selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime())) return selectedDate;
    }
    const today = new Date();
    if (anchorDate instanceof Date && !Number.isNaN(anchorDate.getTime()) && anchorDate.getFullYear() === today.getFullYear() && anchorDate.getMonth() === today.getMonth()) {
      return today;
    }
    const firstBookedKey = Array.from(rowsByDate.keys())
      .filter((key) => {
        const dateObj = new Date(key);
        return dateObj instanceof Date && !Number.isNaN(dateObj.getTime()) && dateObj.getFullYear() === anchorDate.getFullYear() && dateObj.getMonth() === anchorDate.getMonth();
      })
      .sort()[0];
    if (firstBookedKey) return new Date(firstBookedKey);
    return new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  }

  function getDatesInView(anchorDate) {
    const dates = [];
    if (!(anchorDate instanceof Date) || Number.isNaN(anchorDate.getTime())) return dates;
    if (calendarViewMode === "day") {
      dates.push(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate()));
      return dates;
    }
    if (calendarViewMode === "week") {
      const start = startOfWeek(anchorDate);
      for (let index = 0; index < 7; index += 1) {
        dates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
      }
      return dates;
    }
    if (calendarViewMode === "year") {
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const monthDays = new Date(anchorDate.getFullYear(), monthIndex + 1, 0).getDate();
        for (let day = 1; day <= monthDays; day += 1) {
          dates.push(new Date(anchorDate.getFullYear(), monthIndex, day));
        }
      }
      return dates;
    }
    const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      dates.push(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day));
    }
    return dates;
  }

  function getStaffCoverageSummary(dates) {
    const totals = new Map();
    let shiftCount = 0;
    let coveredDays = 0;
    (Array.isArray(dates) ? dates : []).forEach((dateObj) => {
      const staffWorking = Array.isArray(getStaffWorkingForDate?.(dateObj)) ? getStaffWorkingForDate(dateObj) : [];
      if (staffWorking.length) coveredDays += 1;
      shiftCount += staffWorking.length;
      staffWorking.forEach((staff) => {
        const name = String(staff?.name || "Team member").trim() || "Team member";
        if (!totals.has(name)) {
          totals.set(name, { name, shifts: 0, covering: 0 });
        }
        const entry = totals.get(name);
        entry.shifts += 1;
        if (String(staff?.status || "").trim().toLowerCase() === "covering") {
          entry.covering += 1;
        }
      });
    });
    const staffList = Array.from(totals.values()).sort((a, b) => b.shifts - a.shifts || a.name.localeCompare(b.name));
    return {
      shiftCount,
      coveredDays,
      uniqueStaffCount: staffList.length,
      staffList
    };
  }

  function getViewSummary(anchorDate, rowsByDate) {
    const dates = getDatesInView(anchorDate);
    const staffSummary = getStaffCoverageSummary(dates);
    let activeDays = 0;
    let totalBookings = 0;
    let totalRevenue = 0;
    let openDays = 0;
    let busiest = null;

    dates.forEach((dateObj) => {
      const key = toDateKey?.(dateObj);
      const rows = rowsByDate.get(key) || [];
      const summary = summarizeRows(rows);
      totalBookings += summary.total;
      totalRevenue += summary.revenue;
      if (summary.total) {
        activeDays += 1;
        if (!busiest || summary.total > busiest.count) {
          busiest = {
            count: summary.total,
            date: new Date(dateObj),
            label: dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          };
        }
      } else {
        openDays += 1;
      }
    });

    return {
      dates,
      activeDays,
      totalBookings,
      totalRevenue,
      openDays,
      busiest,
      staffSummary
    };
  }

  function formatViewEyebrow() {
    if (calendarViewMode === "day") return "Single day view";
    if (calendarViewMode === "week") return "Whole week view";
    if (calendarViewMode === "year") return "Whole year view";
    return "Whole month view";
  }

  function formatMetricsTitle() {
    if (calendarViewMode === "day") return "Day snapshot";
    if (calendarViewMode === "week") return "7-day snapshot";
    if (calendarViewMode === "year") return "12-month snapshot";
    return "31-day snapshot";
  }

  function buildMonthPlaceholderMarkup() {
    const article = doc.createElement("article");
    article.className = "booking-diary-fresh__month-cell is-blank";
    article.setAttribute("aria-hidden", "true");
    return article;
  }

  function buildDayCellMarkup(dateObj, rowsByDate) {
    const key = toDateKey?.(dateObj);
    const rows = rowsByDate.get(key) || [];
    const summary = summarizeRows(rows);
    const todayKey = toDateKey?.(new Date());
    const isToday = key === todayKey;
    const isSelected = String(getSelectedCalendarDateKey?.() || "").trim() === key;
    const previewNames = rows.slice(0, 3).map((row) => String(row?.customerName || "Customer").trim()).filter(Boolean);
    const article = doc.createElement("article");
    article.className = `booking-diary-fresh__day-card${summary.total ? " has-bookings" : ""}${isToday ? " is-today" : ""}${isSelected ? " selected" : ""}`;
    article.innerHTML = `
      <button class="booking-diary-fresh__day-btn" type="button" data-calendar-date="${escapeHtml(key)}" aria-label="${escapeHtml(key)}">
        <div class="booking-diary-fresh__day-number">
          <strong>${escapeHtml(String(dateObj.getDate()))}</strong>
          ${summary.total ? `<span class="booking-diary-fresh__pill">${escapeHtml(String(summary.total))} booked</span>` : `<span class="booking-diary-fresh__pill is-muted">Open</span>`}
        </div>
        <div class="booking-diary-fresh__day-summary">
          <span>${escapeHtml(summary.total ? `${summary.total} appointment${summary.total === 1 ? "" : "s"}` : "No bookings yet")}</span>
          ${
            previewNames.length
              ? `<small>${escapeHtml(previewNames.join(", "))}${rows.length > previewNames.length ? ` +${rows.length - previewNames.length} more` : ""}</small>`
              : `<small>${escapeHtml(isToday ? "Tap to review today and add walk-ins." : "Tap to review this day.")}</small>`
          }
        </div>
      </button>
    `;
    return article;
  }

  function buildMonthCellMarkup(dateObj, rowsByDate) {
    const key = toDateKey?.(dateObj);
    const rows = rowsByDate.get(key) || [];
    const summary = summarizeRows(rows);
    const todayKey = toDateKey?.(new Date());
    const isToday = key === todayKey;
    const isSelected = String(getSelectedCalendarDateKey?.() || "").trim() === key;
    const staffWorking = getStaffWorkingForDate?.(dateObj) || [];
    const liveCount = Math.max(0, summary.total - summary.completed - summary.cancelled);
    const bookingLabel = summary.total ? `${summary.total} booking${summary.total === 1 ? "" : "s"}` : "Open capacity";
    const supportLabel = staffWorking.length
      ? `${staffWorking.length} staff on rota`
      : "No rota cover";
    const stateLabel = isSelected
      ? "Selected"
      : isToday
        ? "Today"
        : summary.total >= 5
          ? "Packed"
          : summary.total >= 3
            ? "Busy"
            : summary.total >= 1
              ? "Light"
              : "Open";
    const countBadgeLabel = summary.total ? `${summary.total} booked` : "Open";
    const articleLabel = [
      dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      bookingLabel,
      supportLabel,
      liveCount ? `${liveCount} live` : ""
    ].filter(Boolean).join(". ");
    const article = doc.createElement("article");
    article.className = `booking-diary-fresh__month-cell${summary.total ? " has-bookings" : " is-open"}${isToday ? " is-today" : ""}${isSelected ? " selected" : ""}${summary.total >= 5 ? " is-packed" : summary.total >= 3 ? " is-busy" : summary.total ? " is-light" : ""}`;
    article.innerHTML = `
      <button class="booking-diary-fresh__month-btn" type="button" data-calendar-date="${escapeHtml(key)}" aria-label="${escapeHtml(articleLabel)}">
        <div class="booking-diary-fresh__month-top">
          <strong>${escapeHtml(String(dateObj.getDate()))}</strong>
          <span class="booking-diary-fresh__month-count${summary.total ? "" : " is-muted"}">${escapeHtml(countBadgeLabel)}</span>
        </div>
        <div class="booking-diary-fresh__month-body">
          <strong class="booking-diary-fresh__month-primary">${escapeHtml(bookingLabel)}</strong>
          <span class="booking-diary-fresh__month-secondary">${escapeHtml(supportLabel)}</span>
          <div class="booking-diary-fresh__month-foot">
            <span>${escapeHtml(liveCount ? `${liveCount} live` : summary.cancelled ? `${summary.cancelled} cancelled` : "Ready to book")}</span>
            <span>${escapeHtml(stateLabel)}</span>
          </div>
        </div>
      </button>
    `;
    return article;
  }

  function renderMonthlyGrid(anchorDate, rowsByDate) {
    bookingCalendarGrid.className = "booking-diary-fresh__grid booking-diary-fresh__grid--month";
    bookingCalendarGrid.innerHTML = "";
    const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const weekdayOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate();
    for (let offset = 0; offset < weekdayOffset; offset += 1) {
      bookingCalendarGrid.appendChild(buildMonthPlaceholderMarkup());
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      bookingCalendarGrid.appendChild(buildMonthCellMarkup(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day), rowsByDate));
    }
    const remainder = (weekdayOffset + daysInMonth) % 7;
    const trailing = remainder === 0 ? 0 : 7 - remainder;
    for (let offset = 0; offset < trailing; offset += 1) {
      bookingCalendarGrid.appendChild(buildMonthPlaceholderMarkup());
    }
  }

  function renderWeeklyGrid(anchorDate, rowsByDate) {
    bookingCalendarGrid.className = "booking-diary-fresh__grid booking-diary-fresh__grid--week";
    bookingCalendarGrid.innerHTML = "";
    const weekStart = startOfWeek(anchorDate);
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + offset);
      const cell = buildDayCellMarkup(date, rowsByDate);
      cell.classList.add("booking-diary-fresh__day-card--week");
      bookingCalendarGrid.appendChild(cell);
    }
  }

  function renderDailyGrid(anchorDate, rowsByDate) {
    bookingCalendarGrid.className = "booking-diary-fresh__grid booking-diary-fresh__grid--day";
    bookingCalendarGrid.innerHTML = "";
    const cell = buildDayCellMarkup(anchorDate, rowsByDate);
    cell.classList.add("booking-diary-fresh__day-card--single");
    bookingCalendarGrid.appendChild(cell);
  }

  function renderYearlyGrid(anchorDate, rowsByDate) {
    bookingCalendarGrid.className = "booking-diary-fresh__grid booking-diary-fresh__grid--year";
    bookingCalendarGrid.innerHTML = "";
    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      const monthDate = new Date(anchorDate.getFullYear(), monthIndex, 1);
      const card = doc.createElement("article");
      card.className = "booking-diary-fresh__mini-month";
      const weekdayOffset = (monthDate.getDay() + 6) % 7;
      const daysInMonth = new Date(anchorDate.getFullYear(), monthIndex + 1, 0).getDate();
      let monthBookingCount = 0;
      const monthRows = [];
      for (let index = 0; index < weekdayOffset; index += 1) {
        monthRows.push('<span class="booking-diary-fresh__mini-day is-empty" aria-hidden="true"></span>');
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(anchorDate.getFullYear(), monthIndex, day);
        const key = toDateKey?.(date);
        const count = (rowsByDate.get(key) || []).length;
        monthBookingCount += count;
        monthRows.push(`
          <button class="booking-diary-fresh__mini-day${count ? " has-bookings" : ""}" type="button" data-calendar-date="${escapeHtml(key)}">
            <span>${escapeHtml(String(day))}</span>
          </button>
        `);
      }
      card.innerHTML = `
        <div class="booking-diary-fresh__mini-month-head">
          <strong>${escapeHtml(monthDate.toLocaleDateString("en-GB", { month: "long" }))}</strong>
          <small>${escapeHtml(String(monthBookingCount))} bookings</small>
        </div>
        <div class="booking-diary-fresh__mini-month-grid">${monthRows.join("")}</div>
      `;
      bookingCalendarGrid.appendChild(card);
    }
  }

  function renderCalendarMonthMetrics(anchorDate, rowsByDate) {
    const container = doc.getElementById("calendarMonthMetrics");
    if (!container || !(anchorDate instanceof Date) || Number.isNaN(anchorDate.getTime())) return;
    const summary = getViewSummary(anchorDate, rowsByDate);
    const totalDays = summary.dates.length;
    const avgOnActiveDays = summary.activeDays ? Math.max(1, Math.round(summary.totalBookings / summary.activeDays)) : 0;
    const staffingValue = calendarViewMode === "day" ? summary.staffSummary.uniqueStaffCount : summary.staffSummary.shiftCount;
    const staffingMeta = calendarViewMode === "day"
      ? (summary.staffSummary.coveredDays ? `${summary.staffSummary.coveredDays} covered day${summary.staffSummary.coveredDays === 1 ? "" : "s"}` : "No staff cover loaded")
      : `${summary.staffSummary.uniqueStaffCount} unique staff in view`;

    container.innerHTML = `
      <article>
        <span>Booked days</span>
        <strong>${escapeHtml(String(summary.activeDays))}</strong>
        <small>${escapeHtml(`${totalDays} day window in view`)}</small>
      </article>
      <article>
        <span>Total bookings</span>
        <strong>${escapeHtml(String(summary.totalBookings))}</strong>
        <small>${escapeHtml(summary.activeDays ? `${avgOnActiveDays} average on active days` : "No bookings loaded yet")}</small>
      </article>
      <article>
        <span>Scheduled revenue</span>
        <strong>${escapeHtml(formatMoney?.(summary.totalRevenue) || "GBP0")}</strong>
        <small>${escapeHtml(summary.totalRevenue > 0 ? "Loaded from non-cancelled bookings" : "No scheduled revenue in view yet")}</small>
      </article>
      <article>
        <span>${escapeHtml(calendarViewMode === "day" ? "On-shift staff" : "Staff shifts")}</span>
        <strong>${escapeHtml(String(staffingValue))}</strong>
        <small>${escapeHtml(staffingMeta)}</small>
      </article>
    `;
  }

  function renderSelectedDayPanel(anchorDate, rowsByDate) {
    const label = doc.getElementById("calendarSelectedDayLabel");
    const meta = doc.getElementById("calendarSelectedDayMeta");
    const agenda = doc.getElementById("calendarSelectedDayAgenda");
    const rotaPanel = doc.getElementById("calendarDiaryRotaPanel");
    const selectedEyebrow = doc.getElementById("calendarSelectedEyebrow");
    const rotaTitle = doc.getElementById("calendarRotaTitle");
    if (!label || !meta || !agenda || !rotaPanel) return;

    if (calendarViewMode !== "day") {
      const viewSummary = getViewSummary(anchorDate, rowsByDate);
      const staffSummary = viewSummary.staffSummary;
      const dates = viewSummary.dates;

      if (calendarViewMode === "week") {
        const weekStart = startOfWeek(anchorDate);
        const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
        if (selectedEyebrow) selectedEyebrow.textContent = "Week focus";
        if (rotaTitle) rotaTitle.textContent = "Staff cover this week";
        label.textContent = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })}`;
        meta.textContent = `${viewSummary.totalBookings} bookings across ${viewSummary.activeDays} active day${viewSummary.activeDays === 1 ? "" : "s"} • ${formatMoney?.(viewSummary.totalRevenue)} scheduled • ${staffSummary.shiftCount} staff shifts planned`;
        agenda.innerHTML = dates.map((dateObj) => {
          const rows = rowsByDate.get(toDateKey?.(dateObj)) || [];
          const daySummary = summarizeRows(rows);
          const staffWorking = getStaffWorkingForDate?.(dateObj) || [];
          return `
            <article class="booking-diary-fresh__agenda-card">
              <div class="booking-diary-fresh__agenda-top">
                <strong>${escapeHtml(dateObj.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))}</strong>
                <span>${escapeHtml(rows.length ? `${rows.length} booked` : "Open")}</span>
              </div>
              <p>${escapeHtml(rows.length ? `${rows.length} booking${rows.length === 1 ? "" : "s"} in the diary` : "No bookings loaded")}</p>
              <small>${escapeHtml(`${staffWorking.length} staff on shift${daySummary.revenue > 0 ? ` • ${formatMoney?.(daySummary.revenue)} scheduled` : ""}`)}</small>
            </article>
          `;
        }).join("");
      } else if (calendarViewMode === "month") {
        if (selectedEyebrow) selectedEyebrow.textContent = "Month focus";
        if (rotaTitle) rotaTitle.textContent = "Staff cover this month";
        label.textContent = anchorDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
        meta.textContent = `${viewSummary.totalBookings} bookings across ${viewSummary.activeDays} active day${viewSummary.activeDays === 1 ? "" : "s"} • ${viewSummary.openDays} open day${viewSummary.openDays === 1 ? "" : "s"} • ${formatMoney?.(viewSummary.totalRevenue)} scheduled`;
        const busyDays = dates
          .map((dateObj) => {
            const rows = rowsByDate.get(toDateKey?.(dateObj)) || [];
            const daySummary = summarizeRows(rows);
            const staffWorking = getStaffWorkingForDate?.(dateObj) || [];
            return { dateObj, daySummary, staffWorking };
          })
          .filter((item) => item.daySummary.total > 0)
          .sort((a, b) => b.daySummary.total - a.daySummary.total || a.dateObj - b.dateObj)
          .slice(0, 6);
        agenda.innerHTML = busyDays.length
          ? busyDays.map((item) => `
            <article class="booking-diary-fresh__agenda-card">
              <div class="booking-diary-fresh__agenda-top">
                <strong>${escapeHtml(item.dateObj.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))}</strong>
                <span>${escapeHtml(`${item.daySummary.total} booked`)}</span>
              </div>
              <p>${escapeHtml(item.daySummary.total >= 5 ? "Packed service day" : item.daySummary.total >= 3 ? "Busy service day" : "Light service day")}</p>
              <small>${escapeHtml(`${item.staffWorking.length} staff on shift${item.daySummary.revenue > 0 ? ` • ${formatMoney?.(item.daySummary.revenue)} scheduled` : ""}`)}</small>
            </article>
          `).join("")
          : `
            <article class="booking-diary-fresh__empty-card">
              <strong>Month still open</strong>
              <small>No bookings are loaded in this month yet, so the full board is still open capacity.</small>
            </article>
          `;
      } else {
        if (selectedEyebrow) selectedEyebrow.textContent = "Year focus";
        if (rotaTitle) rotaTitle.textContent = "Staff cover this year";
        label.textContent = String(anchorDate.getFullYear());
        const activeMonths = new Set(
          dates
            .filter((dateObj) => (rowsByDate.get(toDateKey?.(dateObj)) || []).length)
            .map((dateObj) => `${dateObj.getFullYear()}-${dateObj.getMonth()}`)
        ).size;
        meta.textContent = `${viewSummary.totalBookings} bookings across ${activeMonths} active month${activeMonths === 1 ? "" : "s"} • ${formatMoney?.(viewSummary.totalRevenue)} scheduled • ${staffSummary.shiftCount} staff shifts planned`;
        const yearMonths = Array.from({ length: 12 }, (_, monthIndex) => {
          const monthDate = new Date(anchorDate.getFullYear(), monthIndex, 1);
          const monthDays = new Date(anchorDate.getFullYear(), monthIndex + 1, 0).getDate();
          let monthBookings = 0;
          let monthRevenue = 0;
          let monthStaff = 0;
          for (let day = 1; day <= monthDays; day += 1) {
            const dateObj = new Date(anchorDate.getFullYear(), monthIndex, day);
            const rows = rowsByDate.get(toDateKey?.(dateObj)) || [];
            const summary = summarizeRows(rows);
            monthBookings += summary.total;
            monthRevenue += summary.revenue;
            monthStaff += (getStaffWorkingForDate?.(dateObj) || []).length;
          }
          return { monthDate, monthBookings, monthRevenue, monthStaff };
        });
        agenda.innerHTML = yearMonths.map((item) => `
          <article class="booking-diary-fresh__agenda-card">
            <div class="booking-diary-fresh__agenda-top">
              <strong>${escapeHtml(item.monthDate.toLocaleDateString("en-GB", { month: "long" }))}</strong>
              <span>${escapeHtml(item.monthBookings ? `${item.monthBookings} booked` : "Open")}</span>
            </div>
            <p>${escapeHtml(item.monthBookings ? `${item.monthBookings} bookings loaded this month` : "No bookings loaded this month")}</p>
            <small>${escapeHtml(`${item.monthStaff} staff shifts${item.monthRevenue > 0 ? ` • ${formatMoney?.(item.monthRevenue)} scheduled` : ""}`)}</small>
          </article>
        `).join("");
      }

      rotaPanel.innerHTML = staffSummary.staffList.length
        ? staffSummary.staffList.slice(0, calendarViewMode === "year" ? 8 : 6).map((staff) => `
          <article class="booking-diary-fresh__rota-card">
            <div>
              <strong>${escapeHtml(staff.name)}</strong>
              <small>${escapeHtml(`${staff.shifts} shift${staff.shifts === 1 ? "" : "s"}${staff.covering ? ` • ${staff.covering} covering` : ""}`)}</small>
            </div>
            <span>${escapeHtml(getStaffInitials?.(staff.name) || "ST")}</span>
          </article>
        `).join("")
        : `
          <article class="booking-diary-fresh__empty-card">
            <strong>No staff cover loaded</strong>
            <small>This ${escapeHtml(calendarViewMode)} view does not currently show any scheduled team cover.</small>
          </article>
        `;
      return;
    }

    const focusDate = getSelectedOrFallbackDate(anchorDate, rowsByDate);
    const dateKey = toDateKey?.(focusDate);
    const rows = rowsByDate.get(dateKey) || [];
    const staffWorking = getStaffWorkingForDate?.(focusDate) || [];
    const summary = summarizeRows(rows);

    if (selectedEyebrow) selectedEyebrow.textContent = "Selected day";
    if (rotaTitle) rotaTitle.textContent = "Cover for the selected day";

    label.textContent = focusDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    meta.textContent = rows.length
      ? `${summary.total} bookings loaded • ${summary.completed} completed • ${summary.cancelled} cancelled${summary.revenue > 0 ? ` • ${formatMoney?.(summary.revenue)} scheduled` : ""}`
      : "No bookings loaded for this date yet. Use it as an open-capacity day or add a walk-in.";

    agenda.innerHTML = rows.length
      ? rows.slice(0, 5).map((row) => `
        <article class="booking-diary-fresh__agenda-card">
          <div class="booking-diary-fresh__agenda-top">
            <strong>${escapeHtml(String(row?.time || "Time not set"))}</strong>
            <span>${escapeHtml(String(row?.status || "pending"))}</span>
          </div>
          <p>${escapeHtml(String(row?.customerName || "Customer"))}</p>
          <small>${escapeHtml(String(row?.service || "Service"))}</small>
        </article>
      `).join("")
      : `
        <article class="booking-diary-fresh__empty-card">
          <strong>Open diary day</strong>
          <small>No bookings are loaded for this date, so it is ready for outreach, same-day demand, or protected admin time.</small>
        </article>
      `;

    rotaPanel.innerHTML = staffWorking.length
      ? staffWorking.slice(0, 5).map((staff) => `
        <article class="booking-diary-fresh__rota-card">
          <div>
            <strong>${escapeHtml(String(staff?.name || "Team member"))}</strong>
            <small>${escapeHtml(String(staff?.status === "covering" ? "Covering shift" : "Scheduled to work"))}</small>
          </div>
          <span>${escapeHtml(getStaffInitials?.(String(staff?.name || "")) || "ST")}</span>
        </article>
      `).join("")
      : `
        <article class="booking-diary-fresh__empty-card">
          <strong>No rota cover set</strong>
          <small>This day does not currently show any scheduled team cover.</small>
        </article>
      `;
  }

  function ensureCalendarDayPopup() {
    let modal = doc.getElementById("calendarDayPopupModal");
    if (modal) return modal;
    modal = doc.createElement("section");
    modal.className = "lexi-modal calendar-day-popup-modal";
    modal.id = "calendarDayPopupModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="lexi-modal-backdrop" data-calendar-day-popup-close></div>
      <div class="lexi-modal-card calendar-day-popup-card" role="dialog" aria-modal="true" aria-labelledby="calendarDayPopupTitle">
        <div class="lexi-modal-head">
          <div>
            <p class="kicker">Day Bookings</p>
            <h2 id="calendarDayPopupTitle">Selected day</h2>
          </div>
          <button class="btn btn-ghost btn-small" type="button" data-calendar-day-popup-close>Close</button>
        </div>
        <p class="section-copy" id="calendarDayPopupSummary"></p>
        <div class="calendar-day-popup-stats" id="calendarDayPopupStats"></div>
        <div class="calendar-day-popup-list" id="calendarDayPopupList"></div>
        <div class="calendar-day-popup-actions">
          <button class="btn" type="button" id="calendarDayPopupWalkInBtn">Add Walk-in</button>
          <button class="btn btn-ghost" type="button" id="calendarDayPopupWorkspaceBtn">Open Day Workspace</button>
        </div>
      </div>
    `;
    const close = () => {
      modal.hidden = true;
      openCalendarPopupDateKey = "";
    };
    modal.querySelectorAll("[data-calendar-day-popup-close]").forEach((node) => node.addEventListener("click", close));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) close();
    });
    doc.body.appendChild(modal);
    return modal;
  }

  async function createWalkInBooking(dateKey, values) {
    const businessId = String(getUserBusinessId?.() || "").trim();
    const payload = {
      businessId,
      date: dateKey,
      customerName: String(values?.customerName || "").trim(),
      customerPhone: String(values?.customerPhone || "").trim(),
      customerEmail: String(values?.customerEmail || "").trim().toLowerCase()
    };
    const endpoint = withManagedBusiness?.("/api/businesses/me/walk-ins") || "/api/businesses/me/walk-ins";
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Could not add walk-in.");
    return data;
  }

  async function openWalkInForm(dateKey) {
    const values = await openManageForm?.({
      title: `Add Walk-in (${dateKey})`,
      submitLabel: "Save Walk-in",
      fields: [
        { id: "customerName", label: "Full Name", required: true },
        { id: "customerPhone", label: "Phone Number", required: true, placeholder: "+447700900123" },
        { id: "customerEmail", label: "Email Address", type: "email" }
      ]
    });
    if (!values) return;
    await createWalkInBooking(dateKey, values);
    await refreshBookingsAfterDayPopupMutation?.();
    showManageToast?.(String(values.customerEmail || "").trim() ? "Walk-in saved and welcome email queued." : "Walk-in saved.");
    openCalendarDayPopup(dateKey);
  }

  function openCalendarDayPopup(dateKey) {
    const modal = ensureCalendarDayPopup();
    const safeDateKey = String(dateKey || "").trim();
    if (!safeDateKey) return;
    openCalendarPopupDateKey = safeDateKey;
    const dateObj = parseDateKeyToDate(safeDateKey);
    const rows = getBookingsForDateKey(safeDateKey);
    const summary = summarizeRows(rows);
    const title = modal.querySelector("#calendarDayPopupTitle");
    const copy = modal.querySelector("#calendarDayPopupSummary");
    const stats = modal.querySelector("#calendarDayPopupStats");
    const list = modal.querySelector("#calendarDayPopupList");
    const walkInBtn = modal.querySelector("#calendarDayPopupWalkInBtn");
    const workspaceBtn = modal.querySelector("#calendarDayPopupWorkspaceBtn");
    if (title) {
      title.textContent = dateObj
        ? dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : safeDateKey;
    }
    if (copy) {
      copy.textContent = rows.length
        ? `${rows.length} booking${rows.length === 1 ? "" : "s"} are currently in the diary for this day.`
        : "No bookings are currently in the diary for this day yet.";
    }
    if (stats) {
      stats.innerHTML = `
        <article><span>Bookings</span><strong>${escapeHtml(String(summary.total))}</strong></article>
        <article><span>Revenue</span><strong>${escapeHtml(formatMoney(summary.revenue))}</strong></article>
        <article><span>Completed</span><strong>${escapeHtml(String(summary.completed))}</strong></article>
      `;
    }
    if (list) {
      list.innerHTML = rows.length
        ? rows
            .map(
              (row) => `
                <article class="calendar-day-popup-row">
                  <div>
                    <strong>${escapeHtml(`${row.time || "--:--"} - ${row.customerName || "Customer"}`)}</strong>
                    <small>${escapeHtml(row.service || "Service")}</small>
                  </div>
                  <span>${escapeHtml(String(row.status || "confirmed"))}</span>
                </article>
              `
            )
            .join("")
        : `<div class="empty-state">No one is booked in for this day yet.</div>`;
    }
    if (walkInBtn) {
      walkInBtn.onclick = () => {
        openWalkInForm(safeDateKey).catch((error) => showManageToast?.(error?.message || "Could not save walk-in.", "error"));
      };
    }
    if (workspaceBtn) {
      workspaceBtn.onclick = () => {
        modal.hidden = true;
        openCalendarDayWorkspace?.(safeDateKey);
      };
    }
    modal.hidden = false;
    setBookingDateFilter?.({
      keys: new Set([safeDateKey]),
      label: `Selected ${safeDateKey}`,
      selectedDateKey: safeDateKey
    });
    applyBookingFilters?.();
    renderSubscriberCalendar();
  }

  function normalizeStatus(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseClockMinutes(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  function formatClockLabel(totalMinutes) {
    const minutes = Number(totalMinutes);
    if (!Number.isFinite(minutes)) return "";
    const normalized = Math.max(0, Math.round(minutes));
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = ((hours + 11) % 12) + 1;
    return `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`;
  }

  function parseDateKeyToDate(dateKey) {
    const raw = String(dateKey || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const parsed = new Date(`${raw}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function getFocusDateKey() {
    return String(getSelectedCalendarDateKey?.() || todayDateKeyLocal?.() || "").trim();
  }

  function getBusinessHoursForDate(dateObj) {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null;
    const keys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = keys[dateObj.getDay()];
    const input = doc.getElementById(`businessHours${dayKey.charAt(0).toUpperCase()}${dayKey.slice(1)}`);
    const raw = String(input?.value || "").trim();
    if (!raw || /closed/i.test(raw)) return null;
    const match = raw.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);
    if (!match) return null;
    const start = parseClockMinutes(match[1]);
    const end = parseClockMinutes(match[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return { start, end, label: raw };
  }

  function estimateBookingDurationMinutes(row) {
    const serviceName = String(row?.service || "").trim().toLowerCase();
    const servicesInput = doc.getElementById("businessProfileServices");
    const lines = String(servicesInput?.value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      const [name, durationRaw] = line.split("|").map((part) => part?.trim?.() || "");
      const duration = Number(durationRaw);
      const normalizedName = String(name || "").trim().toLowerCase();
      if (!normalizedName || !Number.isFinite(duration) || duration <= 0) continue;
      if (normalizedName === serviceName || normalizedName.includes(serviceName) || serviceName.includes(normalizedName)) {
        return Math.max(30, duration);
      }
    }
    return 60;
  }

  function getBookingsForDateKey(dateKey) {
    return (Array.isArray(getBookingRows?.()) ? getBookingRows() : [])
      .filter((row) => {
        const bookingDate = parseBookingDate?.(row?.date);
        return bookingDate ? toDateKey?.(bookingDate) === dateKey : false;
      })
      .map((row) => {
        const start = parseClockMinutes(row?.time);
        const duration = estimateBookingDurationMinutes(row);
        return {
          ...row,
          startMinutes: Number.isFinite(start) ? start : null,
          endMinutes: Number.isFinite(start) ? start + duration : null,
          durationMinutes: duration
        };
      })
      .sort((a, b) => {
        const aStart = Number.isFinite(a.startMinutes) ? a.startMinutes : 9999;
        const bStart = Number.isFinite(b.startMinutes) ? b.startMinutes : 9999;
        if (aStart !== bStart) return aStart - bStart;
        return String(a?.createdAt || "").localeCompare(String(b?.createdAt || ""));
      });
  }

  function buildOpenGapRows(rows, dayWindow) {
    const entries = Array.isArray(rows) ? rows.filter((row) => Number.isFinite(row.startMinutes)) : [];
    const start = Number(dayWindow?.start);
    const end = Number(dayWindow?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
    const gaps = [];
    let cursor = start;
    entries.forEach((row) => {
      if (row.startMinutes > cursor) {
        gaps.push({ start: cursor, end: row.startMinutes });
      }
      cursor = Math.max(cursor, Number(row.endMinutes || row.startMinutes || cursor));
    });
    if (cursor < end) {
      gaps.push({ start: cursor, end });
    }
    return gaps.filter((gap) => gap.end - gap.start >= 45);
  }

  function getVisibleRowsForFilter(rows, gaps) {
    if (calendarDayFilter === "cancelled") {
      return rows.filter((row) => normalizeStatus(row?.status).includes("cancel"));
    }
    if (calendarDayFilter === "live") {
      return rows.filter((row) => !normalizeStatus(row?.status).includes("cancel"));
    }
    if (calendarDayFilter === "gaps") {
      return gaps;
    }
    return rows;
  }

  function renderDailyScheduleGrid(container, rows, dayWindow) {
    if (!container) return;
    const focusDateKey = getFocusDateKey();
    const focusDate = parseDateKeyToDate(focusDateKey) || new Date();
    const allRows = Array.isArray(rows) ? rows : [];
    const visibleGaps = buildOpenGapRows(allRows, dayWindow);
    const visibleRows = getVisibleRowsForFilter(allRows, visibleGaps);
    const scheduleRows = [];
    for (let minutes = dayWindow.start; minutes <= dayWindow.end; minutes += 30) {
      const slotRows = Array.isArray(visibleRows)
        ? visibleRows.filter((row) => Number.isFinite(row?.startMinutes) && row.startMinutes >= minutes && row.startMinutes < minutes + 30)
        : [];
      const slotGaps = Array.isArray(visibleRows)
        ? visibleRows.filter((gap) => Number.isFinite(gap?.start) && gap.start >= minutes && gap.start < minutes + 30 && gap?.end > gap?.start)
        : [];
      scheduleRows.push(`
        <article class="subscriber-diary-slot">
          <div class="subscriber-diary-slot-time">${escapeHtml(formatClockLabel(minutes))}</div>
          <div class="subscriber-diary-slot-body">
            ${
              slotRows.length
                ? slotRows
                    .map((row) => {
                      const status = normalizeStatus(row?.status || "pending");
                      const chipClass = status.includes("cancel")
                        ? "is-cancelled"
                        : status.includes("complete")
                          ? "is-completed"
                          : status.includes("confirm")
                            ? "is-confirmed"
                            : "is-pending";
                      const price = Number(row?.price || 0);
                      return `
                        <button class="subscriber-diary-booking ${chipClass}" type="button" data-open-day-workspace="${escapeHtml(focusDateKey)}">
                          <div class="subscriber-diary-booking-head">
                            <strong>${escapeHtml(String(row?.time || formatClockLabel(minutes)))} - ${escapeHtml(String(row?.customerName || "Customer"))}</strong>
                            <span>${escapeHtml(String(row?.status || "pending"))}</span>
                          </div>
                          <p>${escapeHtml(String(row?.service || "Service"))}</p>
                          <small>${escapeHtml(`${row.durationMinutes} mins`)}${price > 0 ? ` • ${escapeHtml(formatMoney(price))}` : ""}</small>
                        </button>
                      `;
                    })
                    .join("")
                : slotGaps.length
                  ? slotGaps
                      .map((gap) => `
                        <div class="subscriber-diary-gap">
                          <strong>${escapeHtml(`${Math.round((gap.end - gap.start) / 60 * 10) / 10}h open gap`)}</strong>
                          <small>${escapeHtml(`${formatClockLabel(gap.start)} to ${formatClockLabel(gap.end)}`)}</small>
                        </div>
                      `)
                      .join("")
                  : `<div class="subscriber-diary-slot-empty">${escapeHtml(
                      focusDate.toDateString() === new Date().toDateString() ? "Available" : "Open"
                    )}</div>`
            }
          </div>
        </article>
      `);
    }
    container.innerHTML = `<div class="subscriber-diary-grid">${scheduleRows.join("")}</div>`;
  }

  function renderDailyListView(container, rows, dayWindow) {
    if (!container) return;
    const visibleGaps = buildOpenGapRows(rows, dayWindow);
    const visibleRows = getVisibleRowsForFilter(rows, visibleGaps);
    if (calendarDayFilter === "gaps") {
      container.innerHTML = visibleRows.length
        ? `<div class="subscriber-diary-list">${visibleRows
            .map(
              (gap) => `
                <article class="subscriber-diary-list-card is-gap">
                  <strong>${escapeHtml(`${formatClockLabel(gap.start)} to ${formatClockLabel(gap.end)}`)}</strong>
                  <small>${escapeHtml(`${gap.end - gap.start} minutes of open capacity`)}</small>
                </article>
              `
            )
            .join("")}</div>`
        : `<div class="empty-state">No open gaps of 45 minutes or more in this day.</div>`;
      return;
    }
    container.innerHTML = visibleRows.length
      ? `<div class="subscriber-diary-list">${visibleRows
          .map((row) => {
            const price = Number(row?.price || 0);
            return `
              <article class="subscriber-diary-list-card">
                <div>
                  <strong>${escapeHtml(String(row?.time || "Time not set"))} - ${escapeHtml(String(row?.customerName || "Customer"))}</strong>
                  <small>${escapeHtml(String(row?.service || "Service"))}</small>
                </div>
                <div class="subscriber-diary-list-meta">
                  <span>${escapeHtml(String(row?.status || "pending"))}</span>
                  <span>${escapeHtml(`${row.durationMinutes} mins`)}</span>
                  ${price > 0 ? `<span>${escapeHtml(formatMoney(price))}</span>` : ""}
                </div>
              </article>
            `;
          })
          .join("")}</div>`
      : `<div class="empty-state">No bookings match this diary filter for the selected day.</div>`;
  }

  function renderExecutivePulseMiniBars(container, buckets, valueKey, { emptyText = "No data yet" } = {}) {
    if (!container) return;
    container.innerHTML = "";
    if (!Array.isArray(buckets) || !buckets.length) {
      container.innerHTML = `<small style="color:var(--muted);grid-column:1 / -1;">${escapeHtml(emptyText)}</small>`;
      return;
    }
    const maxValue = Math.max(1, ...buckets.map((bucket) => Number(bucket?.[valueKey] || 0)));
    buckets.forEach((bucket) => {
      const value = Number(bucket?.[valueKey] || 0);
      const height = Math.max(6, Math.round((value / maxValue) * 92));
      const col = doc.createElement("div");
      col.className = "executive-mini-bar-col";
      col.innerHTML = `
        <div class="executive-mini-bar" style="--exec-mini-bar-height:${height}px" title="${escapeHtml(bucket.label)}: ${escapeHtml(String(Math.round(value)))}"></div>
        <small>${escapeHtml(String(bucket.label))}</small>
      `;
      container.appendChild(col);
    });
  }

  function buildExecutiveStoryPolylinePoints(values = [], width = 640, height = 190, padding = 18) {
    if (!Array.isArray(values) || !values.length) return [];
    const maxValue = Math.max(1, ...values.map((value) => Number(value || 0)));
    const usableWidth = Math.max(1, width - (padding * 2));
    const usableHeight = Math.max(1, height - (padding * 2));
    return values.map((value, index) => {
      const x = padding + (values.length === 1 ? usableWidth / 2 : (usableWidth * index) / Math.max(1, values.length - 1));
      const y = height - padding - ((Number(value || 0) / maxValue) * usableHeight);
      return { x, y };
    });
  }

  function buildExecutiveStoryAreaPath(points = [], width = 640, height = 190, padding = 18) {
    if (!Array.isArray(points) || !points.length) return "";
    const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const first = points[0];
    const last = points[points.length - 1];
    return `${line} L ${last.x.toFixed(1)} ${(height - padding).toFixed(1)} L ${first.x.toFixed(1)} ${(height - padding).toFixed(1)} Z`;
  }

  function renderExecutiveStoryLineChart(buckets, options = {}) {
    const {
      valueKey = "bookings",
      widthPerPoint = 44,
      minWidth = 640,
      stroke = "rgba(14,165,233,0.95)",
      fillTop = "rgba(14,165,233,0.28)",
      pointFill = "rgba(245,158,11,0.95)",
      axisClass = "is-month",
      labelStep = 1,
      scrollable = true,
      chartPadding = 18,
      axisLabels = null,
      axisColumns = null
    } = options;
    const values = buckets.map((bucket) => Number(bucket?.[valueKey] || 0));
    const svgWidth = Math.max(minWidth, buckets.length * widthPerPoint);
    const points = buildExecutiveStoryPolylinePoints(values, svgWidth, 190, chartPadding);
    const areaPath = buildExecutiveStoryAreaPath(points, svgWidth, 190, chartPadding);
    const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const gradientId = `execStoryGradient${Math.random().toString(36).slice(2, 8)}`;
    const renderedAxisLabels = Array.isArray(axisLabels) && axisLabels.length
      ? axisLabels
      : buckets.map((bucket, index) => (index % Math.max(1, labelStep) === 0 ? String(bucket.label || "") : ""));
    const renderedAxisColumns = Math.max(1, Number(axisColumns) || renderedAxisLabels.length || buckets.length);
    return `
      <div class="executive-story-chart">
        <div class="${scrollable ? "executive-story-scroll" : "executive-story-static"}">
          <svg viewBox="0 0 ${svgWidth} 190" role="img" aria-label="Booking storyline">
            <defs>
              <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${fillTop}"></stop>
                <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
              </linearGradient>
            </defs>
            <path d="${areaPath}" fill="url(#${gradientId})"></path>
            <path d="${linePath}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
            ${points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" fill="${pointFill}"></circle>`).join("")}
          </svg>
        </div>
        <div class="executive-story-axis ${axisClass}" style="grid-template-columns: repeat(${renderedAxisColumns}, minmax(0, 1fr));">
          ${renderedAxisLabels.map((label) => `<span>${label ? escapeHtml(String(label)) : "&nbsp;"}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderExecutiveStoryLollipopChart(buckets, options = {}) {
    const {
      valueKey = "revenue",
      className = "is-day-lollipop",
      columnVar = "--story-columns",
      minFillPct = 8,
      amountFormatter = (value) => formatMoney(value),
      detailFormatter = (bucket) => `${Number(bucket?.bookings || 0)} booking${Number(bucket?.bookings || 0) === 1 ? "" : "s"}`
    } = options;
    const maxValue = Math.max(1, ...buckets.map((bucket) => Number(bucket?.[valueKey] || 0)));
    return {
      className,
      styleProperty: columnVar,
      styleValue: String(Math.max(1, buckets.length)),
      markup: buckets.map((bucket) => {
        const value = Number(bucket?.[valueKey] || 0);
        const fillPct = Math.max(minFillPct, Math.round((value / maxValue) * 100));
        return `
          <article class="executive-hour-col ${className === "is-week-lollipop" ? "is-week" : "is-day"}">
            <strong>${escapeHtml(String(bucket.label || ""))}</strong>
            <div class="executive-hour-track">
              <span class="executive-hour-fill" style="--hour-fill:${fillPct}%;"></span>
              <span class="executive-hour-dot" aria-hidden="true"></span>
            </div>
            <small>${escapeHtml(amountFormatter(value, bucket))}</small>
            <small>${escapeHtml(detailFormatter(bucket))}</small>
          </article>
        `;
      }).join("")
    };
  }

  function renderExecutivePulseStoryline(container, buckets, rangeConfig) {
    if (!container) return;
    container.innerHTML = "";
    container.className = "executive-bars managed-command-bars";
    container.style.removeProperty("--week-columns");
    container.style.removeProperty("--day-columns");
    if (!Array.isArray(buckets) || !buckets.length) {
      container.classList.add("is-empty");
      container.innerHTML = `<small class="executive-storyline-note">No booking activity in ${escapeHtml(rangeConfig?.label?.toLowerCase?.() || "this range")} yet.</small>`;
      return;
    }
    const key = String(rangeConfig?.key || "").toLowerCase();
    if (key === "day") {
      const chart = renderExecutiveStoryLollipopChart(buckets, {
        valueKey: "revenue",
        className: "is-day-lollipop",
        columnVar: "--day-columns"
      });
      container.classList.add(chart.className);
      container.style.setProperty(chart.styleProperty, chart.styleValue);
      container.innerHTML = chart.markup;
      return;
    }
    if (key === "week") {
      const chart = renderExecutiveStoryLollipopChart(buckets, {
        valueKey: "revenue",
        className: "is-week-lollipop",
        columnVar: "--week-columns"
      });
      container.classList.add(chart.className);
      container.style.setProperty(chart.styleProperty, chart.styleValue);
      container.innerHTML = chart.markup;
      return;
    }
    if (key === "month") {
      container.classList.add("is-month");
      container.innerHTML = renderExecutiveStoryLineChart(buckets, {
        valueKey: "revenue",
        widthPerPoint: 24,
        minWidth: 760,
        stroke: "rgba(14,165,233,0.95)",
        fillTop: "rgba(14,165,233,0.22)",
        pointFill: "rgba(16,185,129,0.95)",
        axisClass: "is-year",
        labelStep: Math.max(1, Math.ceil(buckets.length / 12)),
        scrollable: false,
        chartPadding: 10
      });
      return;
    }
    if (key === "year") {
      const yearStart = rangeConfig?.start instanceof Date ? rangeConfig.start : new Date(new Date().getFullYear(), 0, 1);
      const yearAxisLabels = Array.from({ length: 12 }, (_, index) =>
        new Date(yearStart.getFullYear(), index, 1).toLocaleDateString("en-GB", { month: "short" })
      );
      container.classList.add("is-year");
      container.innerHTML = renderExecutiveStoryLineChart(buckets, {
        valueKey: "revenue",
        widthPerPoint: 4,
        minWidth: 920,
        stroke: "rgba(99,102,241,0.95)",
        fillTop: "rgba(99,102,241,0.18)",
        pointFill: "rgba(245,158,11,0.9)",
        axisClass: "is-year",
        labelStep: 30,
        scrollable: false,
        chartPadding: 8,
        axisLabels: yearAxisLabels,
        axisColumns: 12
      });
      return;
    }
    container.classList.add("is-all");
    container.innerHTML = renderExecutiveStoryLineChart(buckets, {
      valueKey: "revenue",
      widthPerPoint: 8,
      minWidth: 920,
      stroke: "rgba(16,185,129,0.95)",
      fillTop: "rgba(16,185,129,0.24)",
      pointFill: "rgba(245,158,11,0.95)",
      axisClass: "is-year",
      labelStep: Math.max(1, Math.ceil(buckets.length / 14)),
      scrollable: false,
      chartPadding: 8
    });
  }

  function renderExecutivePulseSnapshotsList(items) {
    if (!executivePulseSnapshotList) return;
    const rows = Array.isArray(items) ? items : [];
    if (!rows.length) {
      executivePulseSnapshotList.innerHTML = `<div class="executive-snapshot-empty">Save an Executive Pulse snapshot to keep a quick performance checkpoint for later reviews.</div>`;
      return;
    }
    executivePulseSnapshotList.innerHTML = "";
    rows.slice(0, 10).forEach((item) => {
      const wrapper = doc.createElement("article");
      wrapper.className = "executive-snapshot-item";
      const savedAt = item?.savedAt ? formatDateTime?.(item.savedAt) : "Unknown";
      wrapper.innerHTML = `
        <div class="executive-snapshot-item-head">
          <strong>${escapeHtml(String(item.rangeLabel || "Snapshot"))}</strong>
          <small>${escapeHtml(String(savedAt))}</small>
        </div>
        <p>${escapeHtml(String(item.headline || "Performance snapshot saved."))}</p>
        <ul>
          <li>Revenue: ${escapeHtml(String(item.revenue || "GBP0.00"))}</li>
          <li>Profit: ${escapeHtml(String(item.profit || "GBP0.00"))}</li>
          <li>Bookings: ${escapeHtml(String(item.bookings || 0))} (${escapeHtml(String(item.confirmed || 0))} confirmed)</li>
          <li>Cancellations: ${escapeHtml(String(item.cancelled || 0))} (${escapeHtml(String(item.cancelRate || "0%"))})</li>
        </ul>
      `;
      executivePulseSnapshotList.appendChild(wrapper);
    });
  }

  function renderExecutivePulse() {
    if (!subscriberExecutivePulseSection || !executivePulseSignals || !executivePulseGauges || !executivePulseBars || !executivePulseActions) return;
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) {
      hideSection?.(subscriberExecutivePulseSection);
      return;
    }
    showSection?.(subscriberExecutivePulseSection);
    if (executivePulseTitle) {
      executivePulseTitle.textContent = role === "admin" ? "Admin Control Center" : "Subscriber Control Center";
    }
    if (executivePulseStorylineTitle) {
      executivePulseStorylineTitle.textContent = "Storyline";
    }

    const isAdmin = role === "admin";
    const executivePulseRange = String(getExecutivePulseRange?.() || "day").trim().toLowerCase();
    const executivePulseAdminMetricView = String(getExecutivePulseAdminMetricView?.() || "bookings").trim().toLowerCase();
    const selectedCalendarDateKey = String(getSelectedCalendarDateKey?.() || "").trim();
    const managedBusinessId = String(getManagedBusinessId?.() || "").trim();
    const rangeConfig = getExecutivePulseRangeConfig?.(executivePulseRange);
    const allRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const rowsInRange = allRows.filter((row) => {
      const date = parseBookingDate?.(row?.date);
      return date && date >= rangeConfig.start && date <= rangeConfig.end;
    });
    const statusOf = (row) => String(row?.status || "").toLowerCase();
    const bookingCount = rowsInRange.length;
    const confirmedCount = rowsInRange.filter((row) => ["confirmed", "completed"].includes(statusOf(row))).length;
    const completedCount = rowsInRange.filter((row) => statusOf(row) === "completed").length;
    const cancelledCount = rowsInRange.filter((row) => statusOf(row) === "cancelled").length;
    const pendingCount = rowsInRange.filter((row) => isPendingConfirmationStatus?.(row?.status)).length;
    const cancelRate = bookingCount ? (cancelledCount / bookingCount) * 100 : 0;
    const revenue = rowsInRange.reduce((sum, row) => sum + (statusOf(row) === "cancelled" ? 0 : getExecutiveRowRevenueEstimate?.(row)), 0);
    const avgTicket = bookingCount ? revenue / Math.max(1, confirmedCount || bookingCount - cancelledCount || 1) : 0;
    const cancellationValue = rowsInRange
      .filter((row) => statusOf(row) === "cancelled")
      .reduce((sum, row) => sum + getExecutiveRowRevenueEstimate?.(row), 0);
    const profitabilityPayload = getProfitabilityPayload?.();
    const marginPct = Number(profitabilityPayload?.summary?.profitMarginPercent || 35);
    const estimatedProfit = revenue * Math.max(0, Math.min(0.95, marginPct / 100));
    const todayKey = toDateKey?.(new Date());
    const selectedRows = selectedCalendarDateKey ? allRows.filter((row) => String(row?.date || "").trim() === selectedCalendarDateKey) : [];
    const adminAnalytics = getAdminPlatformAnalytics?.()?.analytics || {};
    const adminRevenueSummary = getAdminRevenueAnalytics?.()?.summary || {};
    const platformTodayBookings = Number(adminAnalytics.todayBookings || 0);
    const activeSubscriptions = Number(adminRevenueSummary.activeSubscriptions || 0);
    const totalCustomers = Number(adminAnalytics.totalCustomers || 0);
    const totalSubscribers = Number(adminAnalytics.totalSubscribers || 0);
    const customerSignupsThisMonth = Number(adminAnalytics.customerSignupsThisMonth || 0);
    const customerSignupsThisYear = Number(adminAnalytics.customerSignupsThisYear || 0);
    const subscriberSignupsThisMonth = Number(adminAnalytics.subscriberSignupsThisMonth || 0);
    const subscriberSignupsThisYear = Number(adminAnalytics.subscriberSignupsThisYear || 0);
    const estimatedMrr = Number(adminRevenueSummary.estimatedMrr || 0);
    const avgPlanValue = Number(adminRevenueSummary.avgPlanValue || 0);
    const annualRecurringRevenue = estimatedMrr * 12;
    const adminSubscriberRetentionPct = activeSubscriptions + Number(adminRevenueSummary.subscriptionCancellationsInPeriod || 0) > 0
      ? Math.round((activeSubscriptions / Math.max(1, activeSubscriptions + Number(adminRevenueSummary.subscriptionCancellationsInPeriod || 0))) * 100)
      : 0;
    const merchAnalytics = computeSubscriberMerchAnalytics?.() || {
      items: [],
      shipments: [],
      soldUnits: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      catalogValue: 0,
      topProducts: [],
      preparing: 0,
      shipped: 0,
      delivered: 0,
      lowStock: 0,
      recentShipments: []
    };
    // Keep the storyline booking-driven for admin as well; quick metric toggles only swap the surrounding KPI copy/cards.
    const buckets = getExecutivePulseBuckets?.(rowsInRange, rangeConfig, marginPct) || [];

    executivePulseRangeTabs?.querySelectorAll("button[data-exec-range]").forEach((btn) => {
      const key = String(btn.getAttribute("data-exec-range") || "");
      const active = key === executivePulseRange;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (executivePulseAdminMetricTabs) {
      executivePulseAdminMetricTabs.hidden = !isAdmin;
      executivePulseAdminMetricTabs.querySelectorAll("button[data-admin-metric-view]").forEach((btn) => {
        const key = String(btn.getAttribute("data-admin-metric-view") || "");
        const active = key === executivePulseAdminMetricView;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }
    if (executivePulseRangeMeta) {
      executivePulseRangeMeta.textContent = isAdmin
        ? `${rangeConfig.label} - ${bookingCount} bookings • View: ${executivePulseAdminMetricView === "subscriber_revenue" ? "Subscriber Revenue" : executivePulseAdminMetricView === "customer_signup" ? "Customer Signup" : "Bookings"}`
        : `${rangeConfig.label} - ${bookingCount} bookings`;
    }
    if (executivePulseSubtitle) {
      executivePulseSubtitle.textContent = role === "admin"
        ? `${rangeConfig.label} platform view: use the quick toggle to switch between booking data, subscriber revenue, and customer signup metrics.`
        : `${rangeConfig.label} business view: your own bookings, revenue, cancellations and next actions in one control center.`;
    }
    if (executivePulseFinanceTitle) executivePulseFinanceTitle.textContent = "Merch Sales Pulse";
    if (executivePulseFinanceWindowLabel) executivePulseFinanceWindowLabel.textContent = "Revenue, fulfilment cost, and profit across merch sales";
    if (executivePulseActionsTitle) executivePulseActionsTitle.textContent = "Merch Movers";
    if (executivePulseActionsSubtitle) executivePulseActionsSubtitle.textContent = "Best sellers, stock pressure, and catalog momentum";
    if (executivePulseSnapshotsTitle) executivePulseSnapshotsTitle.textContent = "Shipment Radar";
    if (executivePulseSnapshotsSubtitle) executivePulseSnapshotsSubtitle.textContent = "Recent orders, shipping flow, and dispatch visibility";

    const signalCards = role === "admin"
      ? executivePulseAdminMetricView === "subscriber_revenue"
        ? [
            { label: "Subscriber MRR", value: formatMoney(estimatedMrr), delta: `${activeSubscriptions} active subscribers`, down: false },
            { label: "Projected Annual Revenue", value: formatMoney(annualRecurringRevenue), delta: `${formatMoney(avgPlanValue)} average plan value`, down: false },
            { label: "Subscriber Signups This Month", value: String(subscriberSignupsThisMonth), delta: `${subscriberSignupsThisYear} this year`, down: false },
            { label: "Subscriber Retention", value: `${adminSubscriberRetentionPct}%`, delta: `${Number(adminRevenueSummary.subscriptionCancellationsInPeriod || 0)} subscriber cancellations in period`, down: false }
          ]
        : executivePulseAdminMetricView === "customer_signup"
          ? [
              { label: "Signed-up Customers", value: String(totalCustomers || 0), delta: `${totalSubscribers || activeSubscriptions} subscriber accounts`, down: false },
              { label: "Customer Signups This Month", value: String(customerSignupsThisMonth), delta: `${customerSignupsThisYear} this year`, down: false },
              { label: "Subscriber Signups This Month", value: String(subscriberSignupsThisMonth), delta: `${subscriberSignupsThisYear} this year`, down: false },
              { label: "Today Bookings", value: String(platformTodayBookings), delta: `${Number(adminAnalytics.totalBookings || 0)} bookings app-wide`, down: false }
            ]
          : [
              { label: rangeConfig.key === "day" ? "App Bookings" : `${rangeConfig.label} Bookings`, value: String(bookingCount), delta: `${confirmedCount} confirmed/completed`, down: false },
              { label: "App Revenue", value: formatMoney(revenue), delta: `${formatMoney(avgTicket)} avg booking value`, down: false },
              { label: "Cancellation Rate", value: `${cancelRate.toFixed(1)}%`, delta: `${cancelledCount} cancelled`, down: cancelRate >= 10 },
              { label: "Today Bookings", value: String(platformTodayBookings), delta: `${Number(adminAnalytics.totalBookings || 0)} bookings app-wide`, down: false }
            ]
      : [
          { label: rangeConfig.key === "day" ? "Today Bookings" : `${rangeConfig.label} Bookings`, value: String(bookingCount), delta: `${confirmedCount} confirmed/completed`, down: false },
          { label: "Revenue", value: formatMoney(revenue), delta: `${formatMoney(avgTicket)} avg ticket`, down: false },
          { label: "Cancellation Rate", value: `${cancelRate.toFixed(1)}%`, delta: `${cancelledCount} cancelled`, down: cancelRate >= 10 },
          { label: "Pending Confirmations", value: String(pendingCount), delta: pendingCount ? "Front desk follow-up needed" : "No pending confirmations", down: pendingCount > 0 }
        ];
    executivePulseSignals.innerHTML = "";
    signalCards.forEach((card) => {
      const el = doc.createElement("article");
      el.className = "executive-signal-card";
      el.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(card.value)}</strong><small class="${card.down ? "down" : ""}">${escapeHtml(card.delta)}</small>`;
      executivePulseSignals.appendChild(el);
    });

    const completionPct = bookingCount ? Math.round((completedCount / bookingCount) * 100) : 0;
    const confirmationPct = bookingCount ? Math.round((confirmedCount / bookingCount) * 100) : 0;
    const cancelPct = bookingCount ? Math.round((cancelledCount / bookingCount) * 100) : 0;
    const gaugeCards = [
      {
        label: "Completed",
        value: `${completionPct}%`,
        progress: completionPct,
        sub: `${completedCount} completed`,
        tone: "success",
        kicker: bookingCount ? `${bookingCount - completedCount} still in play` : "No completed bookings yet"
      },
      {
        label: "Confirmed Mix",
        value: `${confirmationPct}%`,
        progress: confirmationPct,
        sub: `${confirmedCount} confirmed/completed`,
        tone: "info",
        kicker: pendingCount ? `${pendingCount} pending confirmation` : "Confirmation flow is stable"
      },
      {
        label: "Cancellation Pressure",
        value: `${cancelPct}%`,
        progress: cancelPct,
        sub: `${formatMoney(cancellationValue)} at risk`,
        tone: cancelPct >= 10 ? "danger" : "warning",
        kicker: cancelledCount ? `${cancelledCount} cancelled bookings` : "No cancelled bookings in range"
      }
    ];
    executivePulseGauges.innerHTML = "";
    gaugeCards.forEach((gauge) => {
      const card = doc.createElement("article");
      card.className = `executive-gauge tone-${escapeHtml(gauge.tone || "info")}`;
      card.innerHTML = `
        <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, Number(gauge.progress || 0)))}">
          <span>${escapeHtml(gauge.value)}</span>
        </div>
        <div class="executive-gauge-label">${escapeHtml(gauge.label)}</div>
        <div class="executive-gauge-sub">${escapeHtml(gauge.sub)}</div>
        <div class="executive-gauge-kicker">${escapeHtml(gauge.kicker || "")}</div>
      `;
      executivePulseGauges.appendChild(card);
    });

    executivePulseBars.innerHTML = "";
    renderExecutivePulseStoryline(executivePulseBars, buckets, rangeConfig);

    const merchTop = Array.isArray(merchAnalytics?.topProducts) ? merchAnalytics.topProducts.slice(0, 4) : [];
    if (!merchTop.length) {
      executivePulseActions.innerHTML = `<li class="merch-command-empty">Add merch products and create shipments to start seeing sales analytics here.</li>`;
    } else {
      const maxSold = Math.max(1, ...merchTop.map((item) => Number(item.sold || 0)));
      executivePulseActions.innerHTML = merchTop.map((item) => {
        const fillPct = Math.max(12, Math.round((Number(item.sold || 0) / maxSold) * 100));
        return `
          <li class="merch-command-card">
            <p>${escapeHtml(item.shippingAvailable ? "Shippable merch" : "Collection merch")}</p>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(`${item.sold} sold • ${formatMoney(item.revenue)} revenue • ${item.stock} left in stock`)}</small>
            <div class="merch-command-progress" aria-hidden="true"><span style="width:${fillPct}%;"></span></div>
          </li>
        `;
      }).join("");
    }

    if (executivePulseFinanceStats) {
      const cards = [
        { label: "Merch Revenue", value: formatMoney(merchAnalytics?.revenue || 0), meta: `${Number(merchAnalytics?.soldUnits || 0)} units sold`, tone: "positive" },
        { label: "Fulfilment Cost", value: formatMoney(merchAnalytics?.cost || 0), meta: `${Number(merchAnalytics?.preparing || 0)} preparing • ${Number(merchAnalytics?.shipped || 0)} shipped`, tone: "negative" },
        { label: "Merch Profit", value: formatMoney(merchAnalytics?.profit || 0), meta: `${formatMoney(merchAnalytics?.catalogValue || 0)} catalog value`, tone: Number(merchAnalytics?.profit || 0) > 0 ? "positive" : "neutral" },
        { label: "Low Stock Risk", value: String(Number(merchAnalytics?.lowStock || 0)), meta: `${Number(merchAnalytics?.delivered || 0)} delivered shipments`, tone: Number(merchAnalytics?.lowStock || 0) > 0 ? "negative" : "neutral" }
      ];
      executivePulseFinanceStats.innerHTML = "";
      cards.forEach((item) => {
        const article = doc.createElement("article");
        article.className = `executive-finance-stat ${item.tone || "neutral"}`;
        article.innerHTML = `<p>${escapeHtml(item.label)}</p><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.meta)}</small>`;
        executivePulseFinanceStats.appendChild(article);
      });
    }

    if (executivePulseRevenueChartNote) executivePulseRevenueChartNote.textContent = rangeConfig.chartLabel;
    if (executivePulseProfitChartNote) executivePulseProfitChartNote.textContent = rangeConfig.chartLabel;
    renderExecutivePulseMiniBars(executivePulseRevenueChart, buckets, "revenue", { emptyText: "No revenue data in this range yet." });
    renderExecutivePulseMiniBars(executivePulseProfitChart, buckets, "profit", { emptyText: "No profit signal yet." });

    setLatestExecutivePulseSnapshotDraft?.({
      range: rangeConfig.key,
      rangeLabel: rangeConfig.label,
      headline: `${rangeConfig.label} pulse summary`,
      revenue: formatMoney(
        isAdmin && executivePulseAdminMetricView === "subscriber_revenue"
          ? estimatedMrr
          : !isAdmin
            ? Number(merchAnalytics?.revenue || 0)
            : revenue
      ),
      profit: formatMoney(
        isAdmin && executivePulseAdminMetricView === "subscriber_revenue"
          ? annualRecurringRevenue
          : !isAdmin
            ? Number(merchAnalytics?.profit || 0)
            : estimatedProfit
      ),
      bookings: isAdmin ? platformTodayBookings : bookingCount,
      confirmed: isAdmin ? platformTodayBookings : confirmedCount,
      cancelled: cancelledCount,
      cancelRate: `${cancelRate.toFixed(1)}%`
    });

    const recentShipments = Array.isArray(merchAnalytics?.recentShipments) ? merchAnalytics.recentShipments : [];
    if (!recentShipments.length) {
      if (executivePulseSnapshotList) {
        executivePulseSnapshotList.innerHTML = `<div class="merch-command-empty">Shipment activity will appear here once merch orders start moving through dispatch.</div>`;
      }
    } else if (executivePulseSnapshotList) {
      executivePulseSnapshotList.innerHTML = `
        <div class="merch-command-grid">
          <article class="merch-command-card">
            <p>Shipment pipeline</p>
            <strong>${escapeHtml(`${Number(merchAnalytics?.preparing || 0)} preparing • ${Number(merchAnalytics?.shipped || 0)} shipped • ${Number(merchAnalytics?.delivered || 0)} delivered`)}</strong>
            <small>${escapeHtml(`${Number(merchAnalytics?.items?.length || 0)} products in catalog • ${Number(merchAnalytics?.shipments?.length || 0)} shipment records total`)}</small>
          </article>
          ${recentShipments.map((shipment) => `
            <article class="merch-command-shipment">
              <strong>${escapeHtml(`${shipment.customerName} • ${shipment.itemName}`)}</strong>
              <small>${escapeHtml(`${shipment.shippingStatus} • ${formatMoney(shipment.salePrice + shipment.shippingFee)} order value`)}</small>
              <small>${escapeHtml(shipment.trackingRef ? `Tracking: ${shipment.trackingRef}` : "Tracking not added yet")}</small>
            </article>
          `).join("")}
        </div>
      `;
    }
  }

  function renderSubscriberCalendar() {
    if (!bookingCalendarGrid || !calendarMonthLabel) return;
    const anchorDate = getCalendarMonth?.() || new Date();
    const rowsByDate = buildBookingRowsByDate();
    const boardEyebrow = doc.getElementById("calendarBoardEyebrow");
    const metricsTitle = doc.getElementById("calendarMetricsTitle");
    calendarMonthLabel.textContent = formatCalendarHeadline(anchorDate);
    if (boardEyebrow) boardEyebrow.textContent = formatViewEyebrow();
    if (metricsTitle) metricsTitle.textContent = formatMetricsTitle();
    const weekdaysRow = bookingCalendarGrid.previousElementSibling;
    if (weekdaysRow instanceof HTMLElement) {
      weekdaysRow.hidden = calendarViewMode === "year";
    }

    if (calendarViewMode === "day") {
      renderDailyGrid(anchorDate, rowsByDate);
    } else if (calendarViewMode === "week") {
      renderWeeklyGrid(anchorDate, rowsByDate);
    } else if (calendarViewMode === "year") {
      renderYearlyGrid(anchorDate, rowsByDate);
    } else {
      renderMonthlyGrid(anchorDate, rowsByDate);
    }

    renderCalendarMonthMetrics(anchorDate, rowsByDate);
    renderSelectedDayPanel(anchorDate, rowsByDate);

    let totalBookings = 0;
    let activeDays = 0;
    rowsByDate.forEach((rows) => {
      if (rows.length) {
        totalBookings += rows.length;
        activeDays += 1;
      }
    });

    if (calendarLegend) {
      calendarLegend.textContent = totalBookings > 0
        ? `${formatCalendarHeadline(anchorDate)}. ${totalBookings} bookings across ${activeDays} day${activeDays === 1 ? "" : "s"}. Click any day box to open that date.`
        : `${formatCalendarHeadline(anchorDate)}. No bookings are loaded in this ${calendarViewMode} view yet. Click any day box to review or add a walk-in.`;
    }
    calendarViewTabs?.querySelectorAll("[data-calendar-view]").forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      const isActive = String(button.getAttribute("data-calendar-view") || "") === calendarViewMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    updateBookingRangeControls?.();
    renderWorkspaceStarPanel?.();
  }

  function bindCalendarPulseEvents() {
    calendarPrev?.addEventListener("click", () => {
      const current = getCalendarMonth?.() || new Date();
      setCalendarMonth?.(getCalendarViewStepDate(current, -1));
      renderSubscriberCalendar();
    });

    calendarNext?.addEventListener("click", () => {
      const current = getCalendarMonth?.() || new Date();
      setCalendarMonth?.(getCalendarViewStepDate(current, 1));
      renderSubscriberCalendar();
    });

    bookingCalendarGrid?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("[data-calendar-date]");
      if (!(button instanceof HTMLElement)) return;
      const dateKey = String(button.getAttribute("data-calendar-date") || "").trim();
      if (!dateKey) return;
      jumpToCalendarDate?.(dateKey);
      openCalendarDayPopup(dateKey);
    });

    doc.getElementById("calendarTodayBtn")?.addEventListener("click", () => {
      setCalendarMonth?.(new Date());
      renderSubscriberCalendar();
    });

    calendarViewTabs?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const nextView = String(target.getAttribute("data-calendar-view") || "").trim().toLowerCase();
      if (!["day", "week", "month", "year"].includes(nextView)) return;
      calendarViewMode = nextView;
      renderSubscriberCalendar();
    });

    bookingRangeToday?.addEventListener("click", () => applyBookingDatePreset?.("today"));
    bookingRangeWeek?.addEventListener("click", () => applyBookingDatePreset?.("week"));
    bookingRangeMonth?.addEventListener("click", () => applyBookingDatePreset?.("month"));
    bookingRangeClear?.addEventListener("click", () => applyBookingDatePreset?.(""));

    executivePulseRangeTabs?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const nextRange = String(target.getAttribute("data-exec-range") || "").trim().toLowerCase();
      if (!["all", "day", "week", "month", "year"].includes(nextRange)) return;
      if (String(getExecutivePulseRange?.() || "day").trim().toLowerCase() === nextRange) return;
      setExecutivePulseRange?.(nextRange);
      renderExecutivePulse();
    });

    executivePulseAdminMetricTabs?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const nextView = String(target.getAttribute("data-admin-metric-view") || "").trim().toLowerCase();
      if (!["bookings", "subscriber_revenue", "customer_signup"].includes(nextView)) return;
      if (String(getExecutivePulseAdminMetricView?.() || "bookings").trim().toLowerCase() === nextView) return;
      setExecutivePulseAdminMetricView?.(nextView);
      renderExecutivePulse();
    });

    executivePulseSaveSnapshotBtn?.addEventListener("click", () => {
      const latestExecutivePulseSnapshotDraft = getLatestExecutivePulseSnapshotDraft?.();
      if (!latestExecutivePulseSnapshotDraft) {
        showToast?.("Executive Pulse is still loading.");
        return;
      }
      const rows = readExecutivePulseSnapshots?.() || [];
      const next = [{ ...latestExecutivePulseSnapshotDraft, savedAt: new Date().toISOString() }, ...rows];
      writeExecutivePulseSnapshots?.(next);
      renderExecutivePulseSnapshotsList(next);
      showToast?.(`Executive Pulse snapshot saved (${latestExecutivePulseSnapshotDraft.rangeLabel}).`);
    });
  }

  return {
    renderExecutivePulseMiniBars,
    buildExecutiveStoryPolylinePoints,
    buildExecutiveStoryAreaPath,
    renderExecutiveStoryLineChart,
    renderExecutiveStoryLollipopChart,
    renderExecutivePulseStoryline,
    renderExecutivePulseSnapshotsList,
    renderExecutivePulse,
    renderSubscriberCalendar,
    bindCalendarPulseEvents
  };
}
