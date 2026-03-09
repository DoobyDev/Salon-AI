// Opening/Closing checklist popup runtime.
export function createOpenCloseChecklistRuntime(deps) {
  const {
    storageKey,
    todayDateKeyLocal,
    parseBookingDate,
    toDateKey,
    getStaffWorkingForDate,
    getBookingRows,
    getOperationsInsights,
    getAccountingRows,
    getWaitlistRows,
    escapeHtml,
    showManageToast,
    setDashActionStatus,
    openModuleInfoModal
  } = deps || {};

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state || {}));
    } catch {
      // ignore storage failures
    }
  }

  function buildModel() {
    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const operationsInsights = getOperationsInsights?.() || {};
    const accountingRows = Array.isArray(getAccountingRows?.()) ? getAccountingRows() : [];
    const waitlistRows = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows() : [];
    const todayKey = todayDateKeyLocal?.();
    const bookingsToday = bookingRows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === todayKey : false;
    });
    const todayCancelled = bookingsToday.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
    const todayCompleted = bookingsToday.filter((row) => String(row?.status || "").toLowerCase() === "completed").length;
    const todayPending = bookingsToday.length - todayCompleted - todayCancelled;
    const workingToday = getStaffWorkingForDate?.(new Date()) || [];
    const noShowRisks = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
    const rebookingPrompts = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts.length : 0;
    const connectedAccounting = accountingRows.filter((row) => row?.connected || row?.status === "connected").length;
    const waitlistCount = waitlistRows.length;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const workingTomorrow = getStaffWorkingForDate?.(tomorrow) || [];
    const tomorrowKey = toDateKey?.(tomorrow);
    const tomorrowBookings = bookingRows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === tomorrowKey : false;
    }).length;

    const openingItems = [
      { id: "open_team_cover", label: "Confirm team cover for today", hint: `${workingToday.length} staff scheduled`, status: workingToday.length ? "ready" : "risk" },
      { id: "open_diary_check", label: "Review today diary load", hint: `${bookingsToday.length} bookings (${todayPending} still active)`, status: bookingsToday.length ? "ready" : "watch" },
      { id: "open_risk_scan", label: "Check no-show / rebooking signals", hint: `${noShowRisks} no-show risks • ${rebookingPrompts} rebooking prompts`, status: noShowRisks ? "risk" : "ready" },
      { id: "open_waitlist_readiness", label: "Prepare waitlist recovery", hint: `${waitlistCount} waitlist entries ready`, status: waitlistCount ? "ready" : "watch" },
      { id: "open_finance_feed", label: "Confirm takings/accounting feed", hint: `${connectedAccounting} accounting connection${connectedAccounting === 1 ? "" : "s"} live`, status: connectedAccounting ? "ready" : "risk" }
    ];
    const closingItems = [
      { id: "close_booking_reconcile", label: "Review completed vs cancelled bookings", hint: `${todayCompleted} completed • ${todayCancelled} cancelled`, status: todayCancelled ? "watch" : "ready" },
      { id: "close_recovery_queue", label: "Queue service recovery / rebooking follow-up", hint: `${todayCancelled + noShowRisks} follow-up opportunities`, status: todayCancelled + noShowRisks ? "watch" : "ready" },
      { id: "close_takings_export", label: "Export or note daily takings", hint: connectedAccounting ? "Accounting feed available" : "Manual review recommended", status: connectedAccounting ? "ready" : "risk" },
      { id: "close_tomorrow_staffing", label: "Check tomorrow staffing cover", hint: `${workingTomorrow.length} staff • ${tomorrowBookings} bookings tomorrow`, status: workingTomorrow.length ? "ready" : "risk" },
      { id: "close_handover_notes", label: "Log handover notes for team", hint: "Capture issues, VIP clients, and follow-ups", status: "watch" }
    ];

    const exceptionFeed = [];
    if (!workingToday.length) exceptionFeed.push({ level: "critical", text: "No staff rota coverage set for today." });
    if (noShowRisks > 0) exceptionFeed.push({ level: "risk", text: `${noShowRisks} booking${noShowRisks === 1 ? "" : "s"} flagged as no-show risk.` });
    if (!connectedAccounting) exceptionFeed.push({ level: "warning", text: "Accounting connection is not live. Daily takings may need manual review." });
    if (todayCancelled > 0 && waitlistCount === 0) exceptionFeed.push({ level: "warning", text: "Cancellations detected but no waitlist entries available for recovery." });
    if (!workingTomorrow.length && tomorrowBookings > 0) exceptionFeed.push({ level: "critical", text: "Tomorrow has bookings but no rota cover is set." });
    if (!exceptionFeed.length) exceptionFeed.push({ level: "good", text: "No major exceptions detected. Routine checks should be quick today." });

    return {
      todayKey,
      bookingsToday: bookingsToday.length,
      workingToday: workingToday.length,
      noShowRisks,
      waitlistCount,
      connectedAccounting,
      openingItems,
      closingItems,
      exceptionFeed
    };
  }

  function renderPanel() {
    const model = buildModel();
    const allState = loadState();
    const state = allState[model.todayKey] && typeof allState[model.todayKey] === "object" ? allState[model.todayKey] : {};
    const checked = state.checked && typeof state.checked === "object" ? state.checked : {};
    const auto = state.auto && typeof state.auto === "object" ? state.auto : { opening: false, closing: false };
    const completionFor = (items) => {
      if (!items.length) return 0;
      const done = items.filter((item) => checked[item.id] === true).length;
      return Math.round((done / items.length) * 100);
    };
    const openingProgress = completionFor(model.openingItems);
    const closingProgress = completionFor(model.closingItems);

    const renderChecklistRows = (items, lane) => items.map((item) => {
      const isChecked = checked[item.id] === true;
      const statusClass = item.status === "risk" ? "is-risk" : item.status === "watch" ? "is-watch" : "is-ready";
      return `
      <button type="button" class="openclose-check-item ${isChecked ? "is-complete" : ""} ${statusClass}" data-openclose-toggle="${escapeHtml(item.id)}" data-openclose-lane="${escapeHtml(lane)}">
        <span class="openclose-check-indicator" aria-hidden="true">${isChecked ? "✓" : ""}</span>
        <span class="openclose-check-copy">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.hint)}</small>
        </span>
      </button>
    `;
    }).join("");

    const exceptionRows = model.exceptionFeed.map((item) => `
    <li class="openclose-exception ${item.level === "critical" ? "is-critical" : item.level === "risk" ? "is-risk" : item.level === "warning" ? "is-warning" : "is-good"}">
      <strong>${item.level === "good" ? "Stable" : item.level === "critical" ? "Critical" : item.level === "risk" ? "Risk" : "Warning"}</strong>
      <small>${escapeHtml(item.text)}</small>
    </li>
  `).join("");

    return `
    <section class="module-openclose-shell" data-openclose-root="1" data-openclose-date="${escapeHtml(model.todayKey)}">
      <div class="module-openclose-top">
        <article class="module-openclose-kpi">
          <p>Today Bookings</p>
          <strong>${model.bookingsToday}</strong>
          <small>${model.waitlistCount} waitlist • ${model.noShowRisks} no-show risks</small>
        </article>
        <article class="module-openclose-kpi">
          <p>Staff Cover</p>
          <strong>${model.workingToday}</strong>
          <small>${model.workingToday ? "Rota coverage detected" : "No rota coverage set"}</small>
        </article>
        <article class="module-openclose-kpi">
          <p>Automation Readiness</p>
          <strong>${model.connectedAccounting ? "High" : "Medium"}</strong>
          <small>${model.connectedAccounting} accounting feeds connected</small>
        </article>
      </div>
      <div class="module-openclose-grid">
        <section class="module-openclose-lane" data-openclose-lane-shell="opening">
          <div class="module-openclose-lane-head">
            <div>
              <h5>Opening Run</h5>
              <p>${openingProgress}% complete</p>
            </div>
            <div class="module-openclose-lane-actions">
              <button type="button" class="btn btn-ghost" data-openclose-run="opening">AI Run</button>
              <button type="button" class="btn btn-ghost" data-openclose-auto="opening" aria-pressed="${auto.opening ? "true" : "false"}">${auto.opening ? "Auto On" : "Auto Off"}</button>
            </div>
          </div>
          <div class="module-openclose-progress"><span style="width:${openingProgress}%"></span></div>
          <div class="module-openclose-list">${renderChecklistRows(model.openingItems, "opening")}</div>
        </section>
        <section class="module-openclose-lane" data-openclose-lane-shell="closing">
          <div class="module-openclose-lane-head">
            <div>
              <h5>Closing Run</h5>
              <p>${closingProgress}% complete</p>
            </div>
            <div class="module-openclose-lane-actions">
              <button type="button" class="btn btn-ghost" data-openclose-run="closing">AI Run</button>
              <button type="button" class="btn btn-ghost" data-openclose-auto="closing" aria-pressed="${auto.closing ? "true" : "false"}">${auto.closing ? "Auto On" : "Auto Off"}</button>
            </div>
          </div>
          <div class="module-openclose-progress"><span style="width:${closingProgress}%"></span></div>
          <div class="module-openclose-list">${renderChecklistRows(model.closingItems, "closing")}</div>
        </section>
      </div>
      <section class="module-openclose-exceptions">
        <div class="module-openclose-exceptions-head">
          <h5>Exception Feed</h5>
          <button type="button" class="btn btn-ghost" data-openclose-run="exceptions">AI Prioritize</button>
        </div>
        <ul>${exceptionRows}</ul>
      </section>
    </section>
  `;
  }

  function bindPanel(shell, mod) {
    const root = shell.querySelector("[data-openclose-root='1']");
    if (!(root instanceof HTMLElement)) return;
    const persist = (mutator) => {
      const all = loadState();
      const dateKey = String(root.getAttribute("data-openclose-date") || todayDateKeyLocal?.()).trim();
      const current = all[dateKey] && typeof all[dateKey] === "object" ? all[dateKey] : {};
      const next = {
        checked: current.checked && typeof current.checked === "object" ? { ...current.checked } : {},
        auto: current.auto && typeof current.auto === "object" ? { opening: !!current.auto.opening, closing: !!current.auto.closing } : { opening: false, closing: false }
      };
      mutator(next);
      all[dateKey] = next;
      saveState(all);
    };

    root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const toggle = target.closest("[data-openclose-toggle]");
      if (toggle instanceof HTMLElement) {
        const itemId = String(toggle.getAttribute("data-openclose-toggle") || "").trim();
        if (!itemId) return;
        persist((next) => {
          next.checked[itemId] = !(next.checked[itemId] === true);
        });
        showManageToast?.("Checklist updated.");
        setDashActionStatus?.("Opening & Closing checklist updated.");
        openModuleInfoModal?.(mod.key);
        return;
      }
      const autoBtn = target.closest("[data-openclose-auto]");
      if (autoBtn instanceof HTMLElement) {
        const lane = String(autoBtn.getAttribute("data-openclose-auto") || "").trim().toLowerCase();
        if (!(lane === "opening" || lane === "closing")) return;
        persist((next) => {
          next.auto[lane] = !next.auto[lane];
        });
        setDashActionStatus?.(`${lane === "opening" ? "Opening" : "Closing"} autopilot ${autoBtn.getAttribute("aria-pressed") === "true" ? "disabled" : "enabled"}.`);
        openModuleInfoModal?.(mod.key);
        return;
      }
      const runBtn = target.closest("[data-openclose-run]");
      if (runBtn instanceof HTMLElement) {
        const lane = String(runBtn.getAttribute("data-openclose-run") || "").trim().toLowerCase();
        const model = buildModel();
        if (lane === "opening" || lane === "closing") {
          const items = lane === "opening" ? model.openingItems : model.closingItems;
          persist((next) => {
            items.forEach((item) => {
              if (item.status === "risk") return;
              next.checked[item.id] = true;
            });
          });
          const label = lane === "opening" ? "Opening" : "Closing";
          setDashActionStatus?.(`${label} AI run completed. Safe routine steps were checked and exceptions left for review.`);
          showManageToast?.(`${label} AI run complete.`);
          openModuleInfoModal?.(mod.key);
          return;
        }
        if (lane === "exceptions") {
          setDashActionStatus?.("AI prioritized exception feed. Focus critical items first, then warnings.");
          showManageToast?.("Exception feed prioritized.");
        }
      }
    });
  }

  return {
    loadOpenCloseChecklistState: loadState,
    saveOpenCloseChecklistState: saveState,
    openingClosingChecklistModel: buildModel,
    renderOpeningClosingChecklistPanel: renderPanel,
    bindOpeningClosingChecklistPanel: bindPanel
  };
}
