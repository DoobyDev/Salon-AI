// Subscriber calendar and executive pulse rendering runtime.
export function createCalendarPulseRuntime(deps) {
  const {
    doc = document,
    getUserRole,
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
    renderCalendarFeatureSidebarLexi,
    renderCalendarDiaryWeekStrip,
    updateBookingRangeControls,
    renderBusinessAiWorkspace,
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
    showToast,
    showManageToast,
    subscriberExecutivePulseSection,
    bookingCalendarGrid,
    calendarMonthLabel,
    bookingCalendarStaffLegend,
    calendarLegend,
    calendarPrev,
    calendarNext,
    calendarDiaryWeekStrip,
    calendarDiaryTodayBtn,
    calendarDiaryAddWalkInBtn,
    calendarDiaryOpenStaffBtn,
    bookingRangeToday,
    bookingRangeWeek,
    bookingRangeMonth,
    bookingRangeClear,
    bookingSearch,
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

  function selectedCalendarDateSummary() {
    const dateKey = String(getSelectedCalendarDateKey?.() || "").trim();
    if (!dateKey) return null;
    const date = parseBookingDate?.(dateKey);
    if (!date) return null;
    const rows = (Array.isArray(getBookingRows?.()) ? getBookingRows() : []).filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === dateKey : false;
    });
    const cancelled = rows.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
    const completed = rows.filter((row) => String(row?.status || "").toLowerCase() === "completed").length;
    const revenue = rows
      .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const staff = getStaffWorkingForDate?.(date) || [];
    return {
      dateKey,
      label: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      bookings: rows.length,
      cancelled,
      completed,
      revenue,
      staffCount: staff.length,
      staffNames: staff.map((member) => member.name).slice(0, 6)
    };
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
    const calendarMonth = getCalendarMonth?.() || new Date();
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(firstDay);
    calendarMonthLabel.textContent = monthLabel;

    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const selectedCalendarDateKey = String(getSelectedCalendarDateKey?.() || "").trim();
    const bookingCountByDate = new Map();
    bookingRows.forEach((booking) => {
      const bookingDate = parseBookingDate?.(booking.date);
      if (!bookingDate) return;
      const key = toDateKey?.(bookingDate);
      bookingCountByDate.set(key, (bookingCountByDate.get(key) || 0) + 1);
    });

    let monthStaffLegendCount = 0;
    if (bookingCalendarStaffLegend) {
      const monthStaffMap = new Map();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        (getStaffWorkingForDate?.(date) || []).forEach((staff) => {
          if (!monthStaffMap.has(staff.id)) monthStaffMap.set(staff.id, staff);
        });
      }
      const chips = Array.from(monthStaffMap.values())
        .slice(0, 10)
        .map((staff) => `
          <span class="calendar-staff-chip" title="${escapeHtml(staff.name)}">
            <span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(staff.color)}">${escapeHtml(getStaffInitials?.(staff.name))}</span>
            <span>${escapeHtml(staff.name)}</span>
          </span>
        `);
      if (monthStaffMap.size > 10) {
        chips.push(`<span class="calendar-staff-chip">+${monthStaffMap.size - 10} more staff</span>`);
      }
      bookingCalendarStaffLegend.innerHTML = chips.join("");
      monthStaffLegendCount = monthStaffMap.size;
    }

    bookingCalendarGrid.innerHTML = "";
    const todayKey = toDateKey?.(new Date());
    const weekdayOffset = (firstDay.getDay() + 6) % 7;
    for (let index = 0; index < weekdayOffset; index += 1) {
      const spacer = doc.createElement("div");
      spacer.className = "calendar-day empty";
      bookingCalendarGrid.appendChild(spacer);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let monthlyBookings = 0;
    let activeDays = 0;
    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day);
      const key = toDateKey?.(currentDate);
      const count = bookingCountByDate.get(key) || 0;
      const staffWorking = getStaffWorkingForDate?.(currentDate) || [];
      if (count > 0) {
        monthlyBookings += count;
        activeDays += 1;
      }
      const visibleStaffDots = staffWorking.slice(0, 4);
      const extraStaffCount = Math.max(0, staffWorking.length - visibleStaffDots.length);
      const staffTitle = staffWorking.length
        ? `Working staff: ${staffWorking.map((item) => item.name).join(", ")}`
        : "No rota coverage set";
      const cell = doc.createElement("article");
      const selected = selectedCalendarDateKey && selectedCalendarDateKey === key;
      const isToday = key === todayKey;
      cell.className = `calendar-day${count > 0 ? " has-bookings" : ""}${selected ? " selected" : ""}${isToday ? " is-today" : ""}`;
      cell.dataset.dateKey = key;
      cell.innerHTML = `
        <button class="calendar-day-btn" type="button" data-date-key="${key}" aria-label="${key}: ${count} booking${count === 1 ? "" : "s"}">
          <strong>${day}</strong>
          <small class="calendar-day-count${count > 0 ? "" : " is-empty"}">${count > 0 ? String(count) : ""}</small>
          <span class="calendar-day-staff-dots" title="${escapeHtml(staffTitle)}" aria-label="${escapeHtml(staffTitle)}">
            ${visibleStaffDots
              .map((item) => `<span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(item.color)}" title="${escapeHtml(item.name)}">${escapeHtml(getStaffInitials?.(item.name))}</span>`)
              .join("")}
            ${extraStaffCount > 0 ? `<span class="calendar-day-staff-more">+${extraStaffCount}</span>` : ""}
          </span>
        </button>
      `;
      bookingCalendarGrid.appendChild(cell);
    }

    if (calendarLegend) {
      calendarLegend.textContent = monthlyBookings > 0
        ? `${monthlyBookings} bookings across ${activeDays} day${activeDays === 1 ? "" : "s"} this month.`
        : "No bookings in the diary this month yet.";
    }
    renderCalendarFeatureSidebarLexi?.({
      monthLabel,
      monthlyBookings,
      activeDays,
      staffLegendCount: monthStaffLegendCount,
      selectedDay: selectedCalendarDateSummary()
    });
    renderCalendarDiaryWeekStrip?.();
    updateBookingRangeControls?.();
    renderBusinessAiWorkspace?.("subscriber");
    renderBusinessAiWorkspace?.("admin");
    renderWorkspaceStarPanel?.();
  }

  function bindCalendarPulseEvents() {
    calendarPrev?.addEventListener("click", () => {
      const current = getCalendarMonth?.() || new Date();
      setCalendarMonth?.(new Date(current.getFullYear(), current.getMonth() - 1, 1));
      renderSubscriberCalendar();
    });

    calendarNext?.addEventListener("click", () => {
      const current = getCalendarMonth?.() || new Date();
      setCalendarMonth?.(new Date(current.getFullYear(), current.getMonth() + 1, 1));
      renderSubscriberCalendar();
    });

    bookingCalendarGrid?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest(".calendar-day-btn");
      if (!(button instanceof HTMLElement)) return;
      const dateKey = String(button.getAttribute("data-date-key") || "").trim();
      if (!dateKey) return;
      setBookingDateFilter?.({
        keys: new Set([dateKey]),
        label: `Selected ${dateKey}`,
        selectedDateKey: dateKey
      });
      if (bookingSearch && !bookingSearch.value) {
        focusBookingOperations?.();
      }
      applyBookingFilters?.();
      renderSubscriberCalendar();
      renderBusinessAiWorkspace?.("subscriber");
      renderBusinessAiWorkspace?.("admin");
      openCalendarDayWorkspace?.(dateKey);
    });

    calendarDiaryWeekStrip?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("[data-date-key]");
      if (!(button instanceof HTMLElement)) return;
      const dateKey = String(button.getAttribute("data-date-key") || "").trim();
      if (!dateKey) return;
      jumpToCalendarDate?.(dateKey);
    });

    calendarDiaryTodayBtn?.addEventListener("click", () => {
      jumpToCalendarDate?.(todayDateKeyLocal?.());
    });

    calendarDiaryAddWalkInBtn?.addEventListener("click", () => {
      openCalendarDiaryWalkIn?.().catch((error) => {
        showManageToast?.(error?.message || "Could not add walk-in.", "error");
      });
    });

    calendarDiaryOpenStaffBtn?.addEventListener("click", () => {
      focusModuleByKey?.("staff");
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
    selectedCalendarDateSummary,
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
