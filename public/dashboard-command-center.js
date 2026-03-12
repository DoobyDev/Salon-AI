// Subscriber/admin command center runtime.
export function createCommandCenterRuntime(deps) {
  const fallbackNavigator = typeof globalThis !== "undefined" ? globalThis.navigator : undefined;
  const {
    nav = fallbackNavigator,
    getUserRole,
    formatMoney,
    applyBookingFilters,
    setActiveStatusChip,
    renderExecutivePulse,
    commandCenterStatus,
    bookingTools,
    bookingsList,
    bookingStatus,
    bookingSort,
    waitlistSection,
    subscriberCommandCenterSection,
    commandCenterCards,
    commandCenterActions,
    getSubscriberCommandCenter
  } = deps || {};

  function setCommandCenterStatus(message, isError = false) {
    if (!commandCenterStatus) return;
    commandCenterStatus.textContent = message || "";
    commandCenterStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function focusBookingOperations() {
    const section = bookingTools || bookingsList;
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function writeToClipboard(text) {
    if (!nav?.clipboard?.writeText) return false;
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function runCommandCenterAction(actionId) {
    if (!actionId) return;
    if (!bookingStatus || !bookingSort) return;

    if (actionId === "fill-cancellations") {
      bookingStatus.value = "cancelled";
      setActiveStatusChip?.("cancelled");
      applyBookingFilters?.();
      (waitlistSection || bookingTools || bookingsList)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setCommandCenterStatus("Showing cancelled bookings and opening waitlist tools for fast backfill.");
      return;
    }

    if (actionId === "boost-today-demand") {
      const offerTemplate = "Same-day availability just opened up. Reply now to reserve your slot.";
      const copied = await writeToClipboard(offerTemplate);
      bookingStatus.value = "all";
      setActiveStatusChip?.("all");
      bookingSort.value = "newest";
      applyBookingFilters?.();
      focusBookingOperations();
      setCommandCenterStatus(
        copied
          ? "Campaign template copied. Use it for SMS/email blast now."
          : "Campaign idea ready: Send a same-day availability offer to recent clients."
      );
      return;
    }

    if (actionId === "tighten-confirmations") {
      bookingStatus.value = "confirmed";
      setActiveStatusChip?.("confirmed");
      bookingSort.value = "newest";
      applyBookingFilters?.();
      focusBookingOperations();
      setCommandCenterStatus("Focused on confirmed bookings. Prioritize reminders for today's appointments.");
      return;
    }

    if (actionId === "maintain-momentum") {
      bookingStatus.value = "confirmed";
      setActiveStatusChip?.("confirmed");
      bookingSort.value = "oldest";
      applyBookingFilters?.();
      focusBookingOperations();
      setCommandCenterStatus("Stable day. Focus your team on rebooking and upsells at checkout.");
    }
  }

  function renderCommandCenter() {
    if (!subscriberCommandCenterSection || !commandCenterCards || !commandCenterActions) return;
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) {
      subscriberCommandCenterSection.style.display = "none";
      return;
    }

    const data = getSubscriberCommandCenter?.() || {
      today: { totalBookings: 0, confirmedBookings: 0, estimatedRevenue: 0, lastMinuteCancellations: 0 },
      next7Days: { confirmedBookings: 0, estimatedRevenue: 0 },
      serviceHealth: { cancellationRate: 0 },
      recommendedActions: [{ label: "Load bookings", detail: "No command-center data yet." }]
    };

    const cards = [
      { label: "Today", value: data.today?.totalBookings ?? 0 },
      { label: "Revenue", value: formatMoney?.(data.today?.estimatedRevenue ?? 0) },
      { label: "Next 7 Days", value: data.next7Days?.confirmedBookings ?? 0 },
      { label: "Risk", value: `${Number(data.serviceHealth?.cancellationRate || 0).toFixed(1)}%` }
    ];

    commandCenterCards.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.className = "command-card";
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      commandCenterCards.appendChild(article);
    });

    const actions = Array.isArray(data.recommendedActions) ? data.recommendedActions : [];
    commandCenterActions.innerHTML = "";
    actions.slice(0, 3).forEach((action) => {
      const li = document.createElement("li");
      const actionId = String(action.id || "").trim();
      li.innerHTML = `
        <div><strong>${action.label || "Action"}</strong></div>
        <small>${action.detail || ""}</small>
        <div class="action-controls">
          <button class="btn btn-ghost command-action-run" type="button" data-action-id="${actionId}">Open</button>
        </div>
      `;
      commandCenterActions.appendChild(li);
    });
    setCommandCenterStatus(actions.length ? "Start with the first action and keep the day moving." : "No priority actions yet.");
    renderExecutivePulse?.();
  }

  function bindCommandCenterEvents() {
    commandCenterActions?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("command-action-run")) return;
      const actionId = target.getAttribute("data-action-id");
      runCommandCenterAction(actionId).catch(() => {
        setCommandCenterStatus("Could not run this action right now.", true);
      });
    });
  }

  return {
    setCommandCenterStatus,
    focusBookingOperations,
    runCommandCenterAction,
    renderCommandCenter,
    bindCommandCenterEvents
  };
}
