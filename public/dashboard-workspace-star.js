// Workspace star panel and dashboard Lexi launcher runtime.
export function createWorkspaceStarRuntime(deps) {
  const {
    win = window,
    doc = document,
    getUserRole,
    getBookingRows,
    getSelectedCalendarDateKey,
    toDateKey,
    formatMoney,
    isPendingConfirmationStatus,
    openBusinessAiChatPopup,
    openCustomerLexiPopup,
    focusModuleByKey,
    workspaceStarPanel,
    workspaceStarSummary,
    workspaceStarAskLexiBtn,
    workspaceStarOpenCalendarBtn,
    workspaceStarCalendarFocus,
    workspaceStarCalendarNote,
    workspaceStarTodayCount,
    workspaceStarTodayRevenue,
    workspaceStarLexiPrompt,
    workspaceStarLexiHint,
    calendarMonthLabel,
    subscriberCopilotOpenPopup,
    adminCopilotOpenPopup,
    subscriberLexiQuickOpenButtons
  } = deps || {};

  function dashboardLexiPromptForSource(source) {
    const key = String(source || "").trim().toLowerCase();
    if (key === "booking_diary") return "Review my booking diary and tell me what needs attention first.";
    if (key === "daily_workspace") return "What should I focus on today in the business?";
    if (key === "executive_pulse") return "Give me a simple executive summary for today, this week, and this month.";
    if (key === "hub_setup") return "Walk me through the most important business setup tasks next.";
    if (key === "business_modules") return "Which business module should I use next and why?";
    return "";
  }

  function openDashboardLexiForCurrentRole(trigger, source = "") {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    const lexiRole = role === "admin" ? "admin" : "subscriber";
    openBusinessAiChatPopup?.(lexiRole, {
      trigger: trigger instanceof HTMLElement ? trigger : null,
      focusInput: true,
      prompt: dashboardLexiPromptForSource(source)
    });
  }

  function openDashboardLexiForRole(role, source = "", trigger = null) {
    const currentRole = getUserRole?.();
    const requestedRole = String(role || "").trim().toLowerCase();
    const normalizedRole = requestedRole === "current"
      ? (currentRole === "admin" ? "admin" : "subscriber")
      : (requestedRole === "admin" ? "admin" : "subscriber");
    if (normalizedRole === "admin" && currentRole !== "admin") return;
    if (normalizedRole === "subscriber" && !(currentRole === "subscriber" || currentRole === "admin")) return;
    openBusinessAiChatPopup?.(normalizedRole, {
      trigger: trigger instanceof HTMLElement ? trigger : null,
      focusInput: true,
      prompt: dashboardLexiPromptForSource(source)
    });
  }

  function renderWorkspaceStarPanel() {
    if (!workspaceStarPanel) return;
    const role = getUserRole?.();
    const isBizRole = role === "subscriber" || role === "admin";
    workspaceStarPanel.style.display = isBizRole ? "" : "none";
    if (!isBizRole) return;

    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const selectedCalendarDateKey = String(getSelectedCalendarDateKey?.() || "").trim();
    const todayKey = toDateKey?.(new Date());
    const todayRows = bookingRows.filter((row) => String(row?.date || "").trim() === todayKey);
    const todayRevenue = todayRows
      .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const selectedRows = selectedCalendarDateKey
      ? bookingRows.filter((row) => String(row?.date || "").trim() === selectedCalendarDateKey)
      : [];
    const pendingCount = bookingRows.filter((row) => isPendingConfirmationStatus?.(row?.status)).length;
    const selectedCount = selectedRows.length;
    const selectedRevenue = selectedRows
      .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const monthLabel = String(calendarMonthLabel?.textContent || "Current month").trim();
    const todayDiaryLabel = workspaceStarPanel.querySelector(".workspace-star-card:nth-child(2) p");
    if (todayDiaryLabel) todayDiaryLabel.textContent = "Today's Diary";

    if (workspaceStarCalendarFocus) {
      workspaceStarCalendarFocus.textContent = selectedCalendarDateKey
        ? `${selectedCalendarDateKey} selected`
        : `${monthLabel} diary view`;
    }
    if (workspaceStarCalendarNote) {
      workspaceStarCalendarNote.textContent = selectedCalendarDateKey
        ? `${selectedCount} booking${selectedCount === 1 ? "" : "s"} - ${formatMoney?.(selectedRevenue)} in view`
        : "Pick a day in the calendar to sync Booking Operations and Lexi guidance.";
    }
    if (workspaceStarTodayCount) {
      workspaceStarTodayCount.textContent = `${todayRows.length} booking${todayRows.length === 1 ? "" : "s"} today`;
    }
    if (workspaceStarTodayRevenue) {
      workspaceStarTodayRevenue.textContent = `Revenue snapshot: ${formatMoney?.(todayRevenue)}`;
    }
    if (workspaceStarLexiPrompt) {
      workspaceStarLexiPrompt.textContent = selectedCalendarDateKey
        ? `Review ${selectedCalendarDateKey} and tell me what needs attention first.`
        : "Review today's diary and tell me the next 3 front-desk actions.";
    }
    if (workspaceStarLexiHint) {
      workspaceStarLexiHint.textContent = pendingCount > 0
        ? `${pendingCount} pending confirmation${pendingCount === 1 ? "" : "s"} detected.`
        : "Short, direct actions for the front desk.";
    }
    if (workspaceStarSummary) {
      workspaceStarSummary.textContent = selectedCalendarDateKey
        ? `Calendar day filter is active for ${selectedCalendarDateKey}. Ask Lexi for quick actions, rebooking priorities or confirmation follow-up.`
        : "Start with the diary, then ask Lexi for the shortest action plan for bookings, cancellations and confirmations.";
    }
  }

  function bindWorkspaceStarEvents() {
    workspaceStarAskLexiBtn?.addEventListener("click", (event) => {
      openDashboardLexiForCurrentRole(event.currentTarget, "daily_workspace");
    });

    workspaceStarOpenCalendarBtn?.addEventListener("click", () => {
      focusModuleByKey?.("calendar");
    });

    subscriberCopilotOpenPopup?.addEventListener("click", (event) => {
      openDashboardLexiForCurrentRole(event.currentTarget, "daily_workspace");
    });

    subscriberLexiQuickOpenButtons?.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const source = String(btn.getAttribute("data-open-subscriber-lexi") || "").trim();
        openDashboardLexiForCurrentRole(event.currentTarget, source);
      });
    });

    doc.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dashboardLexiButton = target.closest("[data-open-subscriber-lexi], #subscriberCopilotOpenPopup, #adminCopilotOpenPopup, #workspaceStarAskLexiBtn");
      if (dashboardLexiButton instanceof HTMLElement) {
        const source = String(dashboardLexiButton.getAttribute("data-open-subscriber-lexi") || "daily_workspace").trim();
        const role = getUserRole?.();
        if (role === "subscriber" || role === "admin") {
          event.preventDefault();
          openDashboardLexiForCurrentRole(dashboardLexiButton, source);
          return;
        }
      }
      const lexiLink = target.closest('a[href="#customerReceptionSection"]');
      if (!(lexiLink instanceof HTMLElement)) return;
      if (getUserRole?.() !== "customer") return;
      event.preventDefault();
      openCustomerLexiPopup?.();
    });
  }

  win.openDashboardLexiForRole = (role, source = "", triggerId = "") => {
    const trigger = triggerId ? doc.getElementById(String(triggerId || "").trim()) : null;
    openDashboardLexiForRole(role, source, trigger);
  };

  return {
    renderWorkspaceStarPanel,
    dashboardLexiPromptForSource,
    openDashboardLexiForCurrentRole,
    openDashboardLexiForRole,
    bindWorkspaceStarEvents
  };
}
