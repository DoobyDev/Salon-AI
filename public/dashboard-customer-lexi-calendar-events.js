// Customer Lexi calendar interaction bindings.
export function createCustomerLexiCalendarEventsRuntime(deps) {
  const {
    getCustomerLexiCalendarMonthCursor,
    setCustomerLexiCalendarMonthCursor,
    getCustomerLexiSelectedDateKey,
    setCustomerLexiSelectedDateKey,
    getCustomerLexiCalendarView,
    setCustomerLexiCalendarView,
    renderCustomerLexiCalendar,
    getSelectedCustomerSalon,
    buildCustomerLexiPlannerPrompt,
    queueCustomerLexiPrompt,
    openCustomerLexiPopup,
    customerSlotsSection,
    customerLexiCalendarPrev,
    customerLexiCalendarNext,
    customerLexiCalendarGrid,
    customerLexiCalendarViewTabs,
    customerLexiAskNextBest,
    customerLexiDaySummary
  } = deps || {};

  function bindCustomerLexiCalendarEvents() {
    customerLexiCalendarPrev?.addEventListener("click", () => {
      const cursor = getCustomerLexiCalendarMonthCursor?.() || new Date();
      setCustomerLexiCalendarMonthCursor?.(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
      renderCustomerLexiCalendar?.();
    });

    customerLexiCalendarNext?.addEventListener("click", () => {
      const cursor = getCustomerLexiCalendarMonthCursor?.() || new Date();
      setCustomerLexiCalendarMonthCursor?.(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
      renderCustomerLexiCalendar?.();
    });

    customerLexiCalendarGrid?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest(".customer-lexi-day-btn");
      if (!(button instanceof HTMLElement) || button.hasAttribute("disabled")) return;
      const dateKey = String(button.getAttribute("data-date-key") || "").trim();
      if (!dateKey) return;
      setCustomerLexiSelectedDateKey?.(dateKey);
      renderCustomerLexiCalendar?.();
    });

    customerLexiCalendarViewTabs?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest(".customer-lexi-view-tab");
      if (!(button instanceof HTMLElement)) return;
      const nextView = String(button.getAttribute("data-customer-lexi-view") || "").trim().toLowerCase();
      if (!["day", "week", "month"].includes(nextView)) return;
      setCustomerLexiCalendarView?.(nextView);
      renderCustomerLexiCalendar?.();
    });

    customerLexiAskNextBest?.addEventListener("click", () => {
      const salon = getSelectedCustomerSalon?.();
      const prompt = buildCustomerLexiPlannerPrompt?.("next-best", { salonName: salon?.name || "the selected salon" });
      queueCustomerLexiPrompt?.(prompt);
      openCustomerLexiPopup?.();
    });

    customerLexiDaySummary?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const actionButton = target.closest("[data-customer-lexi-action]");
      if (!(actionButton instanceof HTMLElement)) return;
      const action = String(actionButton.getAttribute("data-customer-lexi-action") || "").trim();
      if (!action) return;
      if (action === "jump-slots") {
        customerSlotsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const salon = getSelectedCustomerSalon?.();
      const dateKey = String(actionButton.getAttribute("data-date-key") || getCustomerLexiSelectedDateKey?.() || "").trim();
      const dateLabel = String(actionButton.getAttribute("data-date-label") || dateKey).trim();
      const prompt = buildCustomerLexiPlannerPrompt?.(action, {
        salonName: salon?.name || "the selected salon",
        dateKey,
        dateLabel
      });
      queueCustomerLexiPrompt?.(prompt);
      openCustomerLexiPopup?.();
    });
  }

  return {
    bindCustomerLexiCalendarEvents
  };
}
