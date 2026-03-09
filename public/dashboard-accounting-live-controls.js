// Accounting live view timeframe and range controls.
export function createAccountingLiveControlsRuntime(deps) {
  const {
    setAccountingTimeframe,
    setQuickFilterVisualState,
    setAccountingLiveRange,
    setAccountingLiveNote,
    getThisWeekRange,
    getThisMonthRange,
    accountingTimeframeSwitch,
    accountingQfWeek,
    accountingQfMonth,
    accountingCustomApply,
    accountingCustomFrom,
    accountingCustomTo
  } = deps || {};

  function bindAccountingLiveControlsEvents() {
    accountingTimeframeSwitch?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const timeframe = String(target.getAttribute("data-timeframe") || "").trim().toLowerCase();
      if (!timeframe) return;
      setAccountingTimeframe?.(timeframe, { reload: true });
    });

    accountingQfWeek?.addEventListener("click", () => {
      const range = getThisWeekRange?.();
      if (!range) return;
      setQuickFilterVisualState?.("week");
      setAccountingLiveRange?.(range.from, range.to, { reload: true });
    });

    accountingQfMonth?.addEventListener("click", () => {
      const range = getThisMonthRange?.();
      if (!range) return;
      setQuickFilterVisualState?.("month");
      setAccountingLiveRange?.(range.from, range.to, { reload: true });
    });

    accountingCustomApply?.addEventListener("click", () => {
      const from = String(accountingCustomFrom?.value || "").trim();
      const to = String(accountingCustomTo?.value || "").trim();
      if (!from || !to) {
        setAccountingLiveNote?.("Select both start and end dates for custom range.", true);
        return;
      }
      if (from > to) {
        setAccountingLiveNote?.("Custom range is invalid: start date must be before end date.", true);
        return;
      }
      setQuickFilterVisualState?.("custom");
      setAccountingLiveRange?.(from, to, { reload: true });
    });
  }

  return {
    bindAccountingLiveControlsEvents
  };
}
