// Admin platform analytics runtime.
export function createAdminPlatformRuntime(deps) {
  const {
    win = window,
    doc = document,
    fetchImpl = fetch,
    getUserRole,
    headers,
    escapeHtml,
    formatMoney,
    formatDateShort,
    setDashActionStatus,
    renderAdminManagedBusinessSummary,
    parseExportFileName,
    adminPlatformMetricGrid,
    adminRevenueSummaryGrid,
    adminRevenueMixChart,
    adminRevenueHealthGauge,
    adminRevenueYieldGauge,
    adminRevenueTrendGraph,
    adminRevenueMonthlyList,
    adminRevenueSignalList,
    adminRevenuePeriodPill,
    adminRevenueNote,
    adminUsageSummaryGrid,
    adminUsageHourlyList,
    adminUsageWeekdayList,
    adminUsageRoleGrid,
    adminUsageOperationsGrid,
    adminUsagePeriodPill,
    adminUsageNote,
    adminPlatformExportBtn,
    getAdminPlatformAnalytics,
    setAdminPlatformAnalytics,
    getAdminRevenueAnalytics,
    setAdminRevenueAnalytics,
    getAdminUsageAnalytics,
    setAdminUsageAnalytics
  } = deps || {};

  function buildMockAdminPlatformAnalytics() {
    return {
      analytics: {
        totalBusinesses: 48,
        totalUsers: 1264,
        totalBookings: 8342,
        cancelledBookings: 618,
        conversionRate: 72.6
      },
      usage: {
        hourly: [
          { label: "06:00", total: 22, loginCount: 5, lexiCount: 3 },
          { label: "09:00", total: 74, loginCount: 18, lexiCount: 21 },
          { label: "12:00", total: 81, loginCount: 22, lexiCount: 19 },
          { label: "15:00", total: 67, loginCount: 16, lexiCount: 17 },
          { label: "18:00", total: 48, loginCount: 11, lexiCount: 12 },
          { label: "21:00", total: 26, loginCount: 6, lexiCount: 7 }
        ],
        weekdays: [
          { label: "Mon", total: 188 },
          { label: "Tue", total: 201 },
          { label: "Wed", total: 214 },
          { label: "Thu", total: 239 },
          { label: "Fri", total: 264 },
          { label: "Sat", total: 177 },
          { label: "Sun", total: 96 }
        ],
        summary: {
          periodDays: 14,
          busiestHourLabel: "12:00",
          quietestHourLabel: "03:00",
          bestUpdateWindowLabel: "02:00-05:00",
          bestUpdateWindowEvents: 9,
          roleCounts: {
            subscriber: 644,
            customer: 421,
            admin: 39,
            anonymous: 18
          }
        }
      }
    };
  }

  function buildMockAdminRevenueAnalytics() {
    return {
      summary: {
        activeSubscriptions: 41,
        estimatedMrr: 2009,
        avgPlanValue: 49,
        periodMonths: 6,
        estimatedRevenueInPeriod: 11484,
        subscriptionCancellationsInPeriod: 5,
        bookingCancellationsInPeriod: 618
      },
      monthly: [
        { label: "Oct", estimatedSubscriptionRevenue: 1715, subscriptionCancellations: 1, bookingCancellations: 95 },
        { label: "Nov", estimatedSubscriptionRevenue: 1792, subscriptionCancellations: 0, bookingCancellations: 91 },
        { label: "Dec", estimatedSubscriptionRevenue: 1840, subscriptionCancellations: 1, bookingCancellations: 104 },
        { label: "Jan", estimatedSubscriptionRevenue: 1911, subscriptionCancellations: 1, bookingCancellations: 118 },
        { label: "Feb", estimatedSubscriptionRevenue: 2058, subscriptionCancellations: 1, bookingCancellations: 101 },
        { label: "Mar", estimatedSubscriptionRevenue: 2168, subscriptionCancellations: 1, bookingCancellations: 109 }
      ],
      note: "Mock admin revenue view is active so layout and visuals stay populated while live platform data grows."
    };
  }

  function hasUsablePlatformAnalytics(payload) {
    return Number(payload?.analytics?.totalBusinesses || 0) > 0 || Number(payload?.analytics?.totalUsers || 0) > 0;
  }

  function hasUsableRevenueAnalytics(payload) {
    return Number(payload?.summary?.activeSubscriptions || 0) > 0 || Array.isArray(payload?.monthly) && payload.monthly.length > 0;
  }

  function renderAdminUsageIntelligenceContent() {
    if (getUserRole?.() !== "admin") return;
    const adminUsageAnalytics = getAdminUsageAnalytics?.();
    if (adminUsageHourlyList) {
      const hourly = Array.isArray(adminUsageAnalytics?.hourly) ? adminUsageAnalytics.hourly : [];
      const maxHourly = Math.max(1, ...hourly.map((row) => Number(row?.total || 0)));
      adminUsageHourlyList.innerHTML = hourly.map((row) => `
        <article class="admin-usage-hour-card">
          <strong>${escapeHtml(String(row?.label || "00:00"))}</strong>
          <small>${escapeHtml(`${Number(row?.total || 0)} events`)}</small>
          <small>${escapeHtml(`${Number(row?.loginCount || 0)} logins • ${Number(row?.lexiCount || 0)} Lexi`)}</small>
          <div class="admin-usage-hour-bar">
            <span style="width:${Math.max(8, Math.round((Number(row?.total || 0) / maxHourly) * 100))}%"></span>
          </div>
        </article>
      `).join("");
    }
    if (adminUsageWeekdayList) {
      const weekdays = Array.isArray(adminUsageAnalytics?.weekdays) ? adminUsageAnalytics.weekdays : [];
      const maxWeekday = Math.max(1, ...weekdays.map((row) => Number(row?.total || 0)));
      adminUsageWeekdayList.innerHTML = weekdays.map((row) => `
        <article class="admin-usage-weekday-card">
          <strong>${escapeHtml(String(row?.label || "Day"))}</strong>
          <small>${escapeHtml(`${Number(row?.total || 0)} recorded activity events`)}</small>
          <div class="admin-usage-weekday-bar">
            <span style="width:${Math.max(8, Math.round((Number(row?.total || 0) / maxWeekday) * 100))}%"></span>
          </div>
        </article>
      `).join("");
    }
    if (adminUsageRoleGrid) {
      const roleCounts = adminUsageAnalytics?.summary?.roleCounts || {};
      const rows = [
        ["Subscribers", Number(roleCounts.subscriber || 0)],
        ["Customers", Number(roleCounts.customer || 0)],
        ["Admins", Number(roleCounts.admin || 0)],
        ["Anonymous", Number(roleCounts.anonymous || 0)]
      ];
      const maxRole = Math.max(1, ...rows.map(([, value]) => value));
      adminUsageRoleGrid.innerHTML = rows.map(([label, value]) => `
        <article class="admin-usage-role-card">
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(`${value} activity events`)}</small>
          <div class="admin-usage-role-bar">
            <span style="width:${Math.max(8, Math.round((value / maxRole) * 100))}%"></span>
          </div>
        </article>
      `).join("");
    }
  }

  function renderAdminPlatformOverview() {
    if (getUserRole?.() !== "admin") return;
    const adminPlatformAnalytics = getAdminPlatformAnalytics?.();
    const adminRevenueAnalytics = getAdminRevenueAnalytics?.();
    const adminUsageAnalytics = getAdminUsageAnalytics?.();

    if (adminPlatformMetricGrid) {
      const analytics = adminPlatformAnalytics?.analytics || {};
      const cards = [
        ["Businesses", String(analytics.totalBusinesses || 0)],
        ["Users", String(analytics.totalUsers || 0)],
        ["Bookings", String(analytics.totalBookings || 0)],
        ["Cancelled", String(analytics.cancelledBookings || 0)],
        ["Conversion", `${Number(analytics.conversionRate || 0).toFixed(1)}%`]
      ];
      adminPlatformMetricGrid.innerHTML = cards.map(([label, value]) => `
        <article class="admin-platform-metric-card">
          <p>${escapeHtml(label)}</p>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `).join("");
    }

    if (adminRevenueSummaryGrid) {
      const summary = adminRevenueAnalytics?.summary || {};
      const rows = [
        ["Active subscriptions", String(summary.activeSubscriptions || 0)],
        ["Estimated MRR", formatMoney(summary.estimatedMrr || 0)],
        ["Avg plan value", formatMoney(summary.avgPlanValue || 0)],
        [`Revenue (${summary.periodMonths || 6}m)`, formatMoney(summary.estimatedRevenueInPeriod || 0)],
        ["Subscriber churn", String(summary.subscriptionCancellationsInPeriod || 0)],
        ["Booking cancellations", String(summary.bookingCancellationsInPeriod || 0)]
      ];
      adminRevenueSummaryGrid.innerHTML = rows.map(([label, value]) => `
        <article class="admin-platform-summary-card">
          <p>${escapeHtml(label)}</p>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `).join("");
    }

    if (adminRevenueMixChart) {
      const summary = adminRevenueAnalytics?.summary || {};
      const retainedValue = Number(summary.estimatedRevenueInPeriod || 0);
      const lostValue = Math.max(0, Number(summary.avgPlanValue || 0) * Number(summary.subscriptionCancellationsInPeriod || 0));
      const total = Math.max(1, retainedValue + lostValue);
      const retainedPct = Math.max(0, Math.min(100, Math.round((retainedValue / total) * 100)));
      adminRevenueMixChart.style.setProperty("--revenue-fill", String(retainedPct));
      adminRevenueMixChart.innerHTML = `
        <div class="admin-revenue-donut-chart" aria-hidden="true"></div>
        <div class="admin-revenue-donut-copy">
          <strong>${escapeHtml(`${retainedPct}%`)}</strong>
          <small>retained value</small>
        </div>
        <div class="admin-revenue-donut-meta">
          <div class="admin-revenue-meta-row"><span>Revenue in period</span><span>${escapeHtml(formatMoney(retainedValue))}</span></div>
          <div class="admin-revenue-meta-row"><span>Estimated churn drag</span><span>${escapeHtml(formatMoney(lostValue))}</span></div>
        </div>
      `;
    }

    if (adminRevenueHealthGauge) {
      const summary = adminRevenueAnalytics?.summary || {};
      const activeSubscriptions = Number(summary.activeSubscriptions || 0);
      const cancelledSubscriptions = Number(summary.subscriptionCancellationsInPeriod || 0);
      const retentionScore = Math.max(0, Math.min(100, Math.round((activeSubscriptions / Math.max(1, activeSubscriptions + cancelledSubscriptions)) * 100)));
      adminRevenueHealthGauge.innerHTML = `
        <div class="admin-revenue-gauge-track" style="--gauge-fill:${retentionScore};" aria-hidden="true"></div>
        <div class="admin-revenue-gauge-copy">
          <strong>${escapeHtml(`${retentionScore}%`)}</strong>
          <small>subscriber retention signal</small>
        </div>
        <div class="admin-revenue-gauge-legend">
          <div class="admin-revenue-meta-row"><span>Active subscriptions</span><span>${escapeHtml(String(activeSubscriptions))}</span></div>
          <div class="admin-revenue-meta-row"><span>Cancelled in period</span><span>${escapeHtml(String(cancelledSubscriptions))}</span></div>
        </div>
      `;
    }

    if (adminRevenueYieldGauge) {
      const summary = adminRevenueAnalytics?.summary || {};
      const totalBookings = Number(adminPlatformAnalytics?.analytics?.totalBookings || 0);
      const cancelledBookings = Number(adminPlatformAnalytics?.analytics?.cancelledBookings || 0);
      const conversionRate = Number(adminPlatformAnalytics?.analytics?.conversionRate || 0);
      const yieldScore = Math.max(0, Math.min(100, Math.round(conversionRate)));
      adminRevenueYieldGauge.innerHTML = `
        <div class="admin-revenue-gauge-track" style="--gauge-fill:${yieldScore};" aria-hidden="true"></div>
        <div class="admin-revenue-gauge-copy">
          <strong>${escapeHtml(`${yieldScore}%`)}</strong>
          <small>booking yield signal</small>
        </div>
        <div class="admin-revenue-gauge-legend">
          <div class="admin-revenue-meta-row"><span>Total bookings</span><span>${escapeHtml(String(totalBookings))}</span></div>
          <div class="admin-revenue-meta-row"><span>Cancelled bookings</span><span>${escapeHtml(String(cancelledBookings))}</span></div>
          <div class="admin-revenue-meta-row"><span>Revenue period</span><span>${escapeHtml(formatMoney(Number(summary.estimatedRevenueInPeriod || 0)))}</span></div>
        </div>
      `;
    }

    if (adminRevenueTrendGraph) {
      const monthly = Array.isArray(adminRevenueAnalytics?.monthly) ? adminRevenueAnalytics.monthly : [];
      const maxRevenue = Math.max(1, ...monthly.map((row) => Number(row?.estimatedSubscriptionRevenue || 0)));
      adminRevenueTrendGraph.innerHTML = monthly.map((row) => {
        const revenue = Number(row?.estimatedSubscriptionRevenue || 0);
        const heightPct = Math.max(8, Math.round((revenue / maxRevenue) * 100));
        return `
          <article class="admin-revenue-trend-bar">
            <span style="height:${heightPct}%;"></span>
            <strong>${escapeHtml(String(row?.label || "Month"))}</strong>
            <small>${escapeHtml(formatMoney(revenue))}</small>
          </article>
        `;
      }).join("");
    }

    if (adminRevenueSignalList) {
      const summary = adminRevenueAnalytics?.summary || {};
      const monthly = Array.isArray(adminRevenueAnalytics?.monthly) ? adminRevenueAnalytics.monthly : [];
      const sortedByRevenue = [...monthly].sort((a, b) => Number(b?.estimatedSubscriptionRevenue || 0) - Number(a?.estimatedSubscriptionRevenue || 0));
      const strongestMonth = sortedByRevenue[0] || null;
      const weakestMonth = sortedByRevenue[sortedByRevenue.length - 1] || null;
      const periodMonths = Number(summary.periodMonths || 6);
      const cancelledSubscriptions = Number(summary.subscriptionCancellationsInPeriod || 0);
      const cancelledBookings = Number(summary.bookingCancellationsInPeriod || 0);
      const activeSubscriptions = Number(summary.activeSubscriptions || 0);
      const revenueInPeriod = Number(summary.estimatedRevenueInPeriod || 0);
      const estimatedMrr = Number(summary.estimatedMrr || 0);
      const avgPlanValue = Number(summary.avgPlanValue || 0);
      const churnDrag = Math.max(0, cancelledSubscriptions * avgPlanValue);
      const cancelPressure = cancelledBookings > 0
        ? `${cancelledBookings} booking cancellations in period`
        : "No booking cancellation pressure in this period";
      const strongestRevenue = Number(strongestMonth?.estimatedSubscriptionRevenue || 0);
      const weakestRevenue = Number(weakestMonth?.estimatedSubscriptionRevenue || 0);
      const monthlyGap = Math.max(0, strongestRevenue - weakestRevenue);
      const averageMonthlyRevenue = periodMonths > 0 ? revenueInPeriod / periodMonths : revenueInPeriod;
      const revenuePerSubscriber = activeSubscriptions > 0 ? estimatedMrr / activeSubscriptions : 0;
      const cancellationRate = activeSubscriptions + cancelledSubscriptions > 0
        ? Math.round((cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) * 100)
        : 0;
      const focusNote = churnDrag > monthlyGap
        ? "Subscriber churn is dragging more value than month-to-month pace swings."
        : "Revenue pacing is the bigger watchpoint than subscriber churn right now.";
      const signalCards = [
        { label: "MRR Watch", title: formatMoney(estimatedMrr), detail: `${activeSubscriptions} active subscriptions contributing to current recurring revenue.` },
        { label: "Average Monthly Pace", title: formatMoney(averageMonthlyRevenue), detail: `Average revenue across the last ${periodMonths} month${periodMonths === 1 ? "" : "s"}.` },
        { label: "Best Month", title: strongestMonth ? `${strongestMonth.label}: ${formatMoney(strongestRevenue)}` : "No month loaded", detail: strongestMonth ? "Use this month as the pace benchmark for subscriber retention and plan growth." : "Revenue history has not loaded yet." },
        { label: "Weakest Month", title: weakestMonth ? `${weakestMonth.label}: ${formatMoney(weakestRevenue)}` : "No month loaded", detail: weakestMonth ? `Gap to strongest month: ${formatMoney(monthlyGap)}.` : "Revenue history has not loaded yet." },
        { label: "Churn Drag", title: formatMoney(churnDrag), detail: `${cancelledSubscriptions} subscriber cancellations across ${periodMonths} months.` },
        { label: "Cancellation Pressure", title: cancelPressure, detail: revenueInPeriod > 0 ? `${formatMoney(revenueInPeriod)} tracked in the same period.` : "No revenue tracked yet in this period." },
        { label: "Plan Value", title: formatMoney(avgPlanValue), detail: revenuePerSubscriber > 0 ? `${formatMoney(revenuePerSubscriber)} MRR per active subscriber.` : "Per-subscriber revenue will appear once active subscriptions are loaded." },
        { label: "Retention Rate", title: `${Math.max(0, 100 - cancellationRate)}%`, detail: cancellationRate > 0 ? `${cancellationRate}% cancellation rate across active and cancelled subscriptions in this window.` : "No subscription churn in this window." },
        { label: "Revenue Spread", title: formatMoney(monthlyGap), detail: strongestMonth && weakestMonth ? `${strongestMonth.label} is outperforming ${weakestMonth.label} by ${formatMoney(monthlyGap)}.` : "Monthly spread appears once revenue history is loaded." },
        { label: "Admin Focus", title: focusNote, detail: "Review retention, cancellation spikes, and plan-value protection together before product or pricing changes." }
      ];
      adminRevenueSignalList.innerHTML = signalCards.map((card) => `
        <article class="admin-revenue-signal-card">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.title)}</strong>
          <small>${escapeHtml(card.detail)}</small>
        </article>
      `).join("");
    }

    if (adminRevenueMonthlyList) {
      const monthly = Array.isArray(adminRevenueAnalytics?.monthly) ? adminRevenueAnalytics.monthly : [];
      const maxRevenue = Math.max(1, ...monthly.map((row) => Number(row?.estimatedSubscriptionRevenue || 0)));
      const periodRevenue = Math.max(1, Number(adminRevenueAnalytics?.summary?.estimatedRevenueInPeriod || 0));
      adminRevenueMonthlyList.innerHTML = monthly.map((row, index) => {
        const revenue = Number(row?.estimatedSubscriptionRevenue || 0);
        const subscriptionCancellations = Number(row?.subscriptionCancellations || 0);
        const bookingCancellations = Number(row?.bookingCancellations || 0);
        const cancelCount = subscriptionCancellations + bookingCancellations;
        const widthPct = Math.max(8, Math.round((revenue / maxRevenue) * 100));
        const retainedPct = Math.max(0, Math.min(100, 100 - Math.round((cancelCount / Math.max(1, cancelCount + 12)) * 100)));
        const revenueSharePct = Math.max(1, Math.round((revenue / periodRevenue) * 100));
        const accentClass = `is-accent-${(index % 4) + 1}`;
        return `
          <article class="admin-revenue-month-row ${accentClass}">
            <div class="admin-revenue-month-head">
              <div class="admin-revenue-month-copy">
                <p>Revenue Window</p>
                <strong>${escapeHtml(String(row?.label || "Month"))}</strong>
              </div>
              <div class="admin-revenue-month-hero">
                <span>${escapeHtml(formatMoney(revenue))}</span>
                <small>${escapeHtml(`${revenueSharePct}% of period revenue`)}</small>
              </div>
            </div>
            <div class="admin-revenue-month-bar">
              <span style="width:${widthPct}%"></span>
            </div>
            <div class="admin-revenue-month-stats">
              <article class="admin-revenue-month-stat"><p>Month Share</p><strong>${escapeHtml(`${widthPct}%`)}</strong><small>Compared with the top month in this view</small></article>
              <article class="admin-revenue-month-stat"><p>Subscriber Churn</p><strong>${escapeHtml(String(subscriptionCancellations))}</strong><small>Subscription cancellations recorded in this month</small></article>
              <article class="admin-revenue-month-stat"><p>Booking Loss</p><strong>${escapeHtml(String(bookingCancellations))}</strong><small>Booking cancellations affecting app revenue flow</small></article>
              <article class="admin-revenue-month-stat"><p>Retention Signal</p><strong>${escapeHtml(`${retainedPct}%`)}</strong><small>Higher values mean lower cancellation drag in this window</small></article>
            </div>
            <div class="admin-revenue-month-meta">
              <small>${escapeHtml(`${cancelCount} total cancellations this month`)}</small>
              <small>${escapeHtml(`Revenue rank: ${widthPct >= 80 ? "Top tier" : widthPct >= 55 ? "Mid range" : "Recovery needed"}`)}</small>
            </div>
          </article>
        `;
      }).join("");
    }

    if (adminRevenuePeriodPill) {
      adminRevenuePeriodPill.textContent = `Last ${Number(adminRevenueAnalytics?.summary?.periodMonths || 6)} months`;
    }
    if (adminRevenueNote) {
      adminRevenueNote.textContent = String(adminRevenueAnalytics?.note || "");
    }

    if (adminUsageSummaryGrid) {
      const summary = adminUsageAnalytics?.summary || {};
      const rows = [
        ["Activity window", `${Number(summary.periodDays || 14)} days`],
        ["Busiest hour", `${summary.busiestHourLabel || "00:00"} UTC`],
        ["Quietest hour", `${summary.quietestHourLabel || "00:00"} UTC`],
        ["Best update window", `${summary.bestUpdateWindowLabel || "00:00-03:00"} UTC`],
        ["Subscriber events", String(summary.roleCounts?.subscriber || 0)],
        ["Customer events", String(summary.roleCounts?.customer || 0)]
      ];
      adminUsageSummaryGrid.innerHTML = rows.map(([label, value]) => `
        <article class="admin-platform-summary-card">
          <p>${escapeHtml(label)}</p>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `).join("");
    }

    if (adminUsageOperationsGrid) {
      const usageSummary = adminUsageAnalytics?.summary || {};
      const analytics = adminPlatformAnalytics?.analytics || {};
      const bestWindow = String(usageSummary.bestUpdateWindowLabel || "00:00-03:00").trim();
      const busiestHour = String(usageSummary.busiestHourLabel || "00:00").trim();
      const subscriberEvents = Number(usageSummary.roleCounts?.subscriber || 0);
      const customerEvents = Number(usageSummary.roleCounts?.customer || 0);
      const roleLead = subscriberEvents >= customerEvents ? "Subscribers" : "Customers";
      const roleGap = Math.abs(subscriberEvents - customerEvents);
      const cancellationRate = Number(analytics.totalBookings || 0)
        ? Number((((Number(analytics.cancelledBookings || 0) / Math.max(1, Number(analytics.totalBookings || 0))) * 100)).toFixed(1))
        : 0;
      const cards = [
        { label: "Best update slot", title: `${bestWindow} UTC`, note: `Quietest 3-hour block based on ${Number(usageSummary.bestUpdateWindowEvents || 0)} recorded events.` },
        { label: "Peak support cover", title: `${busiestHour} UTC`, note: "This is the busiest hour in the app, so support/admin visibility matters most here." },
        { label: "Primary traffic", title: `${roleLead} lead by ${roleGap}`, note: `${subscriberEvents} subscriber events vs ${customerEvents} customer events in the current window.` },
        { label: "Booking risk", title: `${cancellationRate}% cancellation rate`, note: "Useful for deciding whether admin should focus on subscriber support, recovery, or product changes." },
        { label: "Platform load", title: `${Number(analytics.totalBookings || 0)} bookings`, note: "Daily top calendar and platform revenue should be reviewed together when this starts climbing." },
        { label: "Revenue watch", title: formatMoney(Number(adminRevenueAnalytics?.summary?.estimatedMrr || 0)), note: "MRR is the fastest health signal for platform growth and churn pressure." }
      ];
      adminUsageOperationsGrid.innerHTML = cards.map((card) => `
        <article class="admin-usage-operations-card">
          <p>${escapeHtml(card.label)}</p>
          <strong>${card.title}</strong>
          <small>${escapeHtml(card.note)}</small>
        </article>
      `).join("");
    }

    if (adminUsagePeriodPill) {
      adminUsagePeriodPill.textContent = `Last ${Number(adminUsageAnalytics?.summary?.periodDays || 14)} days`;
    }
    if (adminUsageNote) {
      const summary = adminUsageAnalytics?.summary || {};
      adminUsageNote.textContent = `Best low-activity update window: ${summary.bestUpdateWindowLabel || "00:00-03:00"} UTC, based on ${Number(summary.bestUpdateWindowEvents || 0)} recorded events across the quietest 3-hour block.`;
    }

    renderAdminUsageIntelligenceContent();
    renderAdminManagedBusinessSummary?.();
  }

  async function loadAdminPlatformOverview() {
    if (getUserRole?.() !== "admin") return;
    let analyticsData = null;
    let revenueData = null;
    let usingMockData = false;
    try {
      const [analyticsRes, revenueRes] = await Promise.all([
        fetchImpl("/api/dashboard/admin", { headers: headers?.() }),
        fetchImpl("/api/dashboard/admin/revenue-analytics", { headers: headers?.() })
      ]);
      analyticsData = await analyticsRes.json();
      revenueData = await revenueRes.json();
      if (!analyticsRes.ok) throw new Error(analyticsData.error || "Unable to load admin platform analytics.");
      if (!revenueRes.ok) throw new Error(revenueData.error || "Unable to load admin revenue analytics.");
    } catch {
      usingMockData = true;
    }

    if (!hasUsablePlatformAnalytics(analyticsData) || !hasUsableRevenueAnalytics(revenueData)) {
      usingMockData = true;
    }

    if (usingMockData) {
      analyticsData = buildMockAdminPlatformAnalytics();
      revenueData = buildMockAdminRevenueAnalytics();
      setDashActionStatus?.("Showing mock admin analytics so the dashboard stays fully populated.", false, 2400);
    }

    setAdminPlatformAnalytics?.(analyticsData || null);
    setAdminUsageAnalytics?.(analyticsData?.usage || null);
    setAdminRevenueAnalytics?.(revenueData || null);
    renderAdminPlatformOverview();
  }

  function bindAdminPlatformEvents() {
    adminPlatformExportBtn?.addEventListener("click", async () => {
      if (getUserRole?.() !== "admin") return;
      try {
        setDashActionStatus?.("Preparing platform revenue export...");
        const res = await fetchImpl("/api/dashboard/admin/revenue-analytics/export?format=csv", { headers: headers?.() });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Unable to export admin revenue analytics.");
        }
        const blob = await res.blob();
        const url = win.URL.createObjectURL(blob);
        const anchor = doc.createElement("a");
        anchor.href = url;
        anchor.download = parseExportFileName?.(res.headers.get("Content-Disposition"), "admin_revenue_analytics.csv");
        doc.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        win.URL.revokeObjectURL(url);
        setDashActionStatus?.("Platform revenue CSV exported.");
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });
  }

  return {
    renderAdminPlatformOverview,
    renderAdminUsageIntelligenceContent,
    loadAdminPlatformOverview,
    bindAdminPlatformEvents
  };
}
