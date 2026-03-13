// Admin platform analytics runtime.
export function createAdminPlatformRuntime(deps) {
  const {
    fetchImpl = fetch,
    getUserRole,
    headers,
    escapeHtml,
    formatMoney,
    setDashActionStatus,
    renderAdminManagedBusinessSummary = () => {},
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
    adminPlatformExportBtn,
    onManageFreeSubscribers,
    getAdminPlatformAnalytics,
    setAdminPlatformAnalytics,
    getAdminRevenueAnalytics,
    setAdminRevenueAnalytics
  } = deps || {};

  function buildMockAdminPlatformAnalytics() {
    return {
      analytics: {
        totalBusinesses: 48,
        totalUsers: 1264,
        activeAppUsers: 1065,
        activeMonthlySubscribers: 29,
        activeYearlySubscribers: 12,
        freeLifetimeSubscribers: 6,
        totalBookings: 8342,
        todayBookings: 22,
        weekBookings: 138,
        monthBookings: 524,
        todayLexiBookings: 7,
        weekLexiBookings: 41,
        monthLexiBookings: 163,
        todayRevenue: 486,
        weekRevenue: 3180,
        monthRevenue: 12440,
        cancelledBookings: 618,
        conversionRate: 72.6
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

  function renderAdminPlatformOverview() {
    if (getUserRole?.() !== "admin") return;
    const adminPlatformAnalytics = getAdminPlatformAnalytics?.();
    const adminRevenueAnalytics = getAdminRevenueAnalytics?.();

    if (adminPlatformMetricGrid) {
      const analytics = adminPlatformAnalytics?.analytics || {};
      const cards = [
        {
          label: "Active app users",
          value: String(analytics.activeAppUsers || Number(analytics.totalSubscribers || 0) + Number(analytics.totalCustomers || 0)),
          detail: `${Number(analytics.totalSubscribers || 0)} subscribers • ${Number(analytics.totalCustomers || 0)} customers`
        },
        {
          label: "Active subscribers",
          value: String((Number(analytics.activeMonthlySubscribers || 0) + Number(analytics.activeYearlySubscribers || 0)) || 0),
          detail: `${Number(analytics.activeMonthlySubscribers || 0)} monthly • ${Number(analytics.activeYearlySubscribers || 0)} yearly`
        },
        {
          label: "Free subscribers",
          value: String(Number(analytics.freeLifetimeSubscribers || 0)),
          detail: "Complimentary lifetime promoter accounts",
          action: "manage-free-subscribers"
        }
      ];
      adminPlatformMetricGrid.innerHTML = cards.map((card) => `
        <article class="admin-platform-metric-card"${card.action ? ` data-admin-metric-action="${escapeHtml(card.action)}"` : ""}>
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
          <small>${escapeHtml(card.detail)}</small>
        </article>
      `).join("");
    }

    if (adminRevenueSummaryGrid) {
      const analytics = adminPlatformAnalytics?.analytics || {};
      const rows = [
        {
          label: "Revenue made",
          value: formatMoney(analytics.todayRevenue || 0),
          breakdown: [
            `Today: ${formatMoney(analytics.todayRevenue || 0)}`,
            `Week: ${formatMoney(analytics.weekRevenue || 0)}`,
            `Month: ${formatMoney(analytics.monthRevenue || 0)}`
          ]
        },
        {
          label: "Bookings",
          value: String(analytics.todayBookings || 0),
          breakdown: [
            `Today: ${Number(analytics.todayBookings || 0)}`,
            `Week: ${Number(analytics.weekBookings || 0)}`,
            `Month: ${Number(analytics.monthBookings || 0)}`
          ]
        },
        {
          label: "Bookings with Lexi",
          value: String(analytics.todayLexiBookings || 0),
          breakdown: [
            `Today: ${Number(analytics.todayLexiBookings || 0)}`,
            `Week: ${Number(analytics.weekLexiBookings || 0)}`,
            `Month: ${Number(analytics.monthLexiBookings || 0)}`
          ]
        }
      ];
      adminRevenueSummaryGrid.innerHTML = rows.map((row) => `
        <article class="admin-platform-summary-card">
          <p>${escapeHtml(row.label)}</p>
          <strong>${escapeHtml(row.value)}</strong>
          <div class="admin-platform-summary-breakdown">
            ${row.breakdown.map((item) => `<small>${escapeHtml(item)}</small>`).join("")}
          </div>
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
      adminRevenueTrendGraph.innerHTML = monthly.map((row, index) => {
        const revenue = Number(row?.estimatedSubscriptionRevenue || 0);
        const heightPct = Math.max(8, Math.round((revenue / maxRevenue) * 100));
        const subscriptionCancellations = Number(row?.subscriptionCancellations || 0);
        const bookingCancellations = Number(row?.bookingCancellations || 0);
        const cancelCount = subscriptionCancellations + bookingCancellations;
        const retainedPct = Math.max(0, Math.min(100, 100 - Math.round((cancelCount / Math.max(1, cancelCount + 12)) * 100)));
        const accentClass = `is-accent-${(index % 4) + 1}`;
        return `
          <article class="admin-revenue-trend-bar ${accentClass}">
            <div class="admin-revenue-trend-head">
              <div class="admin-revenue-trend-copy">
                <strong>${escapeHtml(String(row?.label || "Month"))}</strong>
              </div>
            </div>
            <div class="admin-revenue-trend-bar-track">
              <span style="height:${heightPct}%;"></span>
            </div>
            <div class="admin-revenue-trend-stats">
              <article class="admin-revenue-month-stat"><p>Share</p><strong>${escapeHtml(`${heightPct}%`)}</strong><small>Vs top month</small></article>
              <article class="admin-revenue-month-stat"><p>Sub churn</p><strong>${escapeHtml(String(subscriptionCancellations))}</strong><small>Cancelled plans</small></article>
              <article class="admin-revenue-month-stat"><p>Booking loss</p><strong>${escapeHtml(String(bookingCancellations))}</strong><small>Cancelled bookings</small></article>
              <article class="admin-revenue-month-stat"><p>Retention</p><strong>${escapeHtml(`${retainedPct}%`)}</strong><small>Lower drag is better</small></article>
            </div>
            <div class="admin-revenue-trend-meta">
              <small>${escapeHtml(`${cancelCount} total cancels`)}</small>
              <small>${escapeHtml(`Rank: ${heightPct >= 80 ? "Top" : heightPct >= 55 ? "Mid" : "Low"}`)}</small>
            </div>
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
          <div class="admin-revenue-signal-top">
            <p>${escapeHtml(card.label)}</p>
            <span class="admin-revenue-signal-chip">Signal</span>
          </div>
          <strong>${escapeHtml(card.title)}</strong>
          <div class="admin-revenue-signal-divider"></div>
          <small>${escapeHtml(card.detail)}</small>
        </article>
      `).join("");
    }

    if (adminRevenueMonthlyList) {
      adminRevenueMonthlyList.innerHTML = "";
      adminRevenueMonthlyList.hidden = true;
    }

    if (adminRevenuePeriodPill) {
      adminRevenuePeriodPill.textContent = `Last ${Number(adminRevenueAnalytics?.summary?.periodMonths || 6)} months`;
    }
    if (adminRevenueNote) {
      adminRevenueNote.textContent = String(adminRevenueAnalytics?.note || "");
    }

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
    setAdminRevenueAnalytics?.(revenueData || null);
    renderAdminPlatformOverview();
  }

  function bindAdminPlatformEvents() {
    adminPlatformMetricGrid?.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-metric-action]") : null;
      if (!(target instanceof HTMLElement)) return;
      const action = String(target.getAttribute("data-admin-metric-action") || "").trim();
      if (action === "manage-free-subscribers") {
        onManageFreeSubscribers?.();
      }
    });

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
    loadAdminPlatformOverview,
    bindAdminPlatformEvents
  };
}
