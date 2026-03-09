// Accounting live panel runtime.
export function createAccountingLiveRuntime(deps) {
  const {
    win = window,
    fetchImpl = fetch,
    getUserRole,
    isDashboardManagerRole,
    isDashboardDemoDataModeActive,
    canManageBusinessModules,
    withManagedBusiness,
    headers,
    formatMoney,
    escapeHtml,
    renderExecutivePulse,
    setAccountingStatus,
    setAccountingLiveNote,
    accountingLivePanel,
    accountingLiveCards,
    accountingLiveGauges,
    accountingLiveRevenueBars,
    accountingLiveCancelBars,
    accountingTfToday,
    accountingTf7d,
    accountingTf30d,
    accountingQfWeek,
    accountingQfMonth,
    accountingCustomFrom,
    accountingCustomTo,
    getAccountingLiveTimeframe,
    setAccountingLiveTimeframe,
    getAccountingLiveQuickFilter,
    setAccountingLiveQuickFilter,
    getAccountingLiveRangeFrom,
    setAccountingLiveRangeFrom,
    getAccountingLiveRangeTo,
    setAccountingLiveRangeTo,
    getAccountingLivePayload,
    setAccountingLivePayload,
    getAccountingLiveTimerId,
    setAccountingLiveTimerId
  } = deps || {};

  function formatRelativeTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "just now";
    const diffSec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const minutes = Math.floor(diffSec / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  function timeframeLabel(value) {
    const key = String(value || "").trim().toLowerCase();
    if (key === "7d") return "Last 7 Days";
    if (key === "30d") return "Last 30 Days";
    if (key === "custom") return "Custom Range";
    return "Today";
  }

  function setQuickFilterVisualState(key) {
    setAccountingLiveQuickFilter?.(key || "");
    const quickFilter = getAccountingLiveQuickFilter?.();
    const entries = [
      [accountingQfWeek, "week"],
      [accountingQfMonth, "month"]
    ];
    entries.forEach(([btn, id]) => {
      if (!btn) return;
      btn.classList.toggle("active", quickFilter === id);
    });
    if (quickFilter) {
      [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
        if (!btn) return;
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
    }
  }

  function setAccountingTimeframe(nextTimeframe, { reload = true } = {}) {
    const safe = nextTimeframe === "7d" || nextTimeframe === "30d" ? nextTimeframe : "today";
    setAccountingLiveTimeframe?.(safe);
    setQuickFilterVisualState("");
    setAccountingLiveRangeFrom?.("");
    setAccountingLiveRangeTo?.("");
    if (accountingCustomFrom) accountingCustomFrom.value = "";
    if (accountingCustomTo) accountingCustomTo.value = "";
    const buttons = [accountingTfToday, accountingTf7d, accountingTf30d];
    buttons.forEach((btn) => {
      if (!btn) return;
      const active = String(btn.getAttribute("data-timeframe") || "") === safe;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (reload) {
      loadAccountingLiveRevenue().catch(() => {});
    }
  }

  function setAccountingLiveRange(from, to, { reload = true } = {}) {
    setAccountingLiveRangeFrom?.(String(from || "").trim());
    setAccountingLiveRangeTo?.(String(to || "").trim());
    if (accountingCustomFrom) accountingCustomFrom.value = getAccountingLiveRangeFrom?.() || "";
    if (accountingCustomTo) accountingCustomTo.value = getAccountingLiveRangeTo?.() || "";
    if (reload) {
      loadAccountingLiveRevenue().catch(() => {});
    }
  }

  function getThisWeekRange() {
    const now = new Date();
    const weekday = now.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = start.toISOString().slice(0, 10);
    const to = end.toISOString().slice(0, 10);
    return { from, to };
  }

  function getThisMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = start.toISOString().slice(0, 10);
    const to = end.toISOString().slice(0, 10);
    return { from, to };
  }

  function renderAccountingLiveRevenue() {
    if (
      !accountingLivePanel ||
      !accountingLiveCards ||
      !accountingLiveGauges ||
      !accountingLiveRevenueBars ||
      !accountingLiveCancelBars
    ) return;
    if (!isDashboardManagerRole?.()) {
      accountingLivePanel.style.display = "none";
      return;
    }

    accountingLivePanel.style.display = "";
    const accountingLivePayload = getAccountingLivePayload?.();
    const accountingLiveTimeframe = getAccountingLiveTimeframe?.();
    const mode = String(accountingLivePayload?.mode || "business");
    const timeframe = String(accountingLivePayload?.timeframe || accountingLiveTimeframe || "today");
    const rangeFrom = String(accountingLivePayload?.range?.from || "");
    const rangeTo = String(accountingLivePayload?.range?.to || "");
    const periodText = timeframe === "custom" && rangeFrom && rangeTo ? `${rangeFrom} to ${rangeTo}` : timeframeLabel(timeframe);
    if (timeframe !== accountingLiveTimeframe) {
      setAccountingLiveTimeframe?.(timeframe === "7d" || timeframe === "30d" ? timeframe : "today");
      [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
        if (!btn) return;
        const active = String(btn.getAttribute("data-timeframe") || "") === getAccountingLiveTimeframe?.();
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }
    if (timeframe === "custom" && rangeFrom && rangeTo) {
      setQuickFilterVisualState(getAccountingLiveQuickFilter?.() || "custom");
      if (accountingCustomFrom) accountingCustomFrom.value = rangeFrom;
      if (accountingCustomTo) accountingCustomTo.value = rangeTo;
      setAccountingLiveRangeFrom?.(rangeFrom);
      setAccountingLiveRangeTo?.(rangeTo);
    }
    const cards = accountingLivePayload?.cards || {};
    const gauges = accountingLivePayload?.gauges || {};
    const hourlyRows = Array.isArray(accountingLivePayload?.stream?.hourly) ? accountingLivePayload.stream.hourly : [];
    const weeklyRows = Array.isArray(accountingLivePayload?.stream?.weekly) ? accountingLivePayload.stream.weekly : [];

    accountingLiveCards.innerHTML = "";
    const cardRows = mode === "platform"
      ? [
          { label: `Estimated MRR (${periodText})`, value: formatMoney?.(cards.todayRevenue || 0) },
          { label: `Estimated Revenue (${periodText})`, value: formatMoney?.(cards.todayCancelledRevenue || 0) },
          { label: "Subscription Cancellations", value: String(cards.todayBookings || 0) },
          { label: "Booking Cancellations", value: String(cards.todayCancellations || 0) }
        ]
      : [
          { label: `${periodText} Revenue`, value: formatMoney?.(cards.todayRevenue || 0) },
          { label: "Last 60m Revenue", value: formatMoney?.(cards.lastHourRevenue || 0) },
          { label: "Last 15m Revenue", value: formatMoney?.(cards.last15MinRevenue || 0) },
          { label: `${periodText} Cancellations`, value: String(cards.todayCancellations || 0) }
        ];
    cardRows.forEach((card) => {
      const article = win.document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      accountingLiveCards.appendChild(article);
    });

    const targetProgress = Number(gauges.targetProgressPct || 0);
    const cancellationRate = Number(gauges.cancellationRatePct || 0);
    accountingLiveGauges.innerHTML = `
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, targetProgress))}">
        <span>${Math.round(targetProgress)}%</span>
      </div>
      <small>${mode === "platform" ? "MRR goal progress" : "Daily target progress"} (${formatMoney?.(gauges.dailyTarget || 0)} target)</small>
    </article>
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, cancellationRate))}">
        <span>${Math.round(cancellationRate)}%</span>
      </div>
      <small>${mode === "platform" ? "Subscription churn signal" : "Cancellation rate today"}</small>
    </article>
  `;

    let flowRows = hourlyRows.length ? hourlyRows : weeklyRows.slice(-6);
    const role = getUserRole?.();
    if (!flowRows.length && (role === "subscriber" || role === "admin")) {
      const labels = mode === "platform"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM"];
      flowRows = labels.map((label) => ({ label, revenue: 0, cancellations: 0 }));
    }
    const maxRevenue = Math.max(1, ...flowRows.map((row) => Number(row.revenue || 0)));
    accountingLiveRevenueBars.innerHTML = "";
    flowRows.forEach((row) => {
      const height = Math.max(8, Math.round((Number(row.revenue || 0) / maxRevenue) * 108));
      const col = win.document.createElement("article");
      col.className = "live-bar-col";
      col.innerHTML = `
      <div class="live-bar revenue" style="--bar-height:${height}px"></div>
      <small>${escapeHtml?.(row.label || "")}</small>
      <small>${escapeHtml?.(formatMoney?.(row.revenue || 0))}</small>
    `;
      accountingLiveRevenueBars.appendChild(col);
    });

    const maxCancels = Math.max(1, ...flowRows.map((row) => Number(row.cancellations || 0)));
    accountingLiveCancelBars.innerHTML = "";
    flowRows.forEach((row) => {
      const height = Math.max(8, Math.round((Number(row.cancellations || 0) / maxCancels) * 108));
      const col = win.document.createElement("article");
      col.className = "live-bar-col";
      col.innerHTML = `
      <div class="live-bar cancel" style="--bar-height:${height}px"></div>
      <small>${escapeHtml?.(row.label || "")}</small>
      <small>${Number(row.cancellations || 0)}</small>
    `;
      accountingLiveCancelBars.appendChild(col);
    });

    const stamp = formatRelativeTime(accountingLivePayload?.generatedAt);
    const scopeText = mode === "platform" ? "Platform" : "Business";
    if (!accountingLivePayload && role === "subscriber") {
      setAccountingLiveNote?.(`${scopeText} live revenue is ready for a clean start. Gauges and graphs will fill as bookings and revenue data come in.`);
    } else {
      setAccountingLiveNote?.(
        `${scopeText} live sync (${periodText}) ${stamp}. Auto-refresh every ${Number(accountingLivePayload?.refreshIntervalSec || 15)}s.`
      );
    }
    renderExecutivePulse?.();
  }

  async function loadAccountingLiveRevenue({ silent = false } = {}) {
    if (isDashboardDemoDataModeActive?.()) {
      const accountingLivePayload = getAccountingLivePayload?.();
      if (accountingLivePayload && typeof accountingLivePayload === "object") {
        accountingLivePayload.timeframe = getAccountingLiveRangeFrom?.() && getAccountingLiveRangeTo?.() ? "custom" : getAccountingLiveTimeframe?.();
        accountingLivePayload.range = getAccountingLiveRangeFrom?.() && getAccountingLiveRangeTo?.()
          ? { from: getAccountingLiveRangeFrom?.(), to: getAccountingLiveRangeTo?.() }
          : undefined;
        accountingLivePayload.generatedAt = new Date().toISOString();
        setAccountingLivePayload?.(accountingLivePayload);
      }
      renderAccountingLiveRevenue();
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("timeframe", getAccountingLiveRangeFrom?.() && getAccountingLiveRangeTo?.() ? "custom" : getAccountingLiveTimeframe?.() || "today");
      if (getAccountingLiveRangeFrom?.() && getAccountingLiveRangeTo?.()) {
        params.set("from", getAccountingLiveRangeFrom?.());
        params.set("to", getAccountingLiveRangeTo?.());
      }
      let endpoint = "";
      if (canManageBusinessModules?.()) {
        params.set("scope", "business");
        endpoint = withManagedBusiness?.(`/api/accounting-integrations/live-revenue?${params.toString()}`);
      } else if (getUserRole?.() === "admin") {
        params.set("scope", "platform");
        endpoint = `/api/accounting-integrations/live-revenue?${params.toString()}`;
      }
      if (!endpoint) {
        renderAccountingLiveRevenue();
        return;
      }
      const res = await fetchImpl(endpoint, { headers: headers?.() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load live accounting revenue.");
      setAccountingLivePayload?.(data || null);
      renderAccountingLiveRevenue();
    } catch (error) {
      if (!silent) setAccountingStatus?.(error.message, true);
      setAccountingLiveNote?.(error.message, true);
    }
  }

  function startAccountingLiveStream() {
    const timerId = getAccountingLiveTimerId?.();
    if (timerId) {
      win.clearInterval(timerId);
      setAccountingLiveTimerId?.(null);
    }
    if (!isDashboardManagerRole?.()) return;
    if (isDashboardDemoDataModeActive?.()) {
      renderAccountingLiveRevenue();
      return;
    }
    loadAccountingLiveRevenue().catch(() => {});
    const newTimer = win.setInterval(() => {
      loadAccountingLiveRevenue({ silent: true }).catch(() => {});
    }, 15000);
    setAccountingLiveTimerId?.(newTimer);
  }

  return {
    formatRelativeTime,
    timeframeLabel,
    setAccountingTimeframe,
    setQuickFilterVisualState,
    setAccountingLiveRange,
    getThisWeekRange,
    getThisMonthRange,
    renderAccountingLiveRevenue,
    loadAccountingLiveRevenue,
    startAccountingLiveStream
  };
}
