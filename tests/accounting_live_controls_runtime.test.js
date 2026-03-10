import { describe, expect, it, vi } from "vitest";
import { createAccountingLiveControlsRuntime } from "../public/dashboard-accounting-live-controls.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  async dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createElement(initial = {}) {
  return new FakeHTMLElement({ value: "", ...initial });
}

describe("accounting live controls runtime", () => {
  it("switches timeframe from the timeframe button group", async () => {
    const setAccountingTimeframe = vi.fn();
    const accountingTimeframeSwitch = createElement();
    const runtime = createAccountingLiveControlsRuntime({
      setAccountingTimeframe,
      setQuickFilterVisualState: vi.fn(),
      setAccountingLiveRange: vi.fn(),
      setAccountingLiveNote: vi.fn(),
      getThisWeekRange: vi.fn(),
      getThisMonthRange: vi.fn(),
      accountingTimeframeSwitch,
      accountingQfWeek: createElement(),
      accountingQfMonth: createElement(),
      accountingCustomApply: createElement(),
      accountingCustomFrom: createElement(),
      accountingCustomTo: createElement()
    });

    runtime.bindAccountingLiveControlsEvents();
    await accountingTimeframeSwitch.dispatch("click", {
      target: new FakeHTMLElement({
        getAttribute(name) {
          return name === "data-timeframe" ? "7d" : "";
        }
      })
    });

    expect(setAccountingTimeframe).toHaveBeenCalledWith("7d", { reload: true });
  });

  it("applies week/month quick filters and validates custom ranges", async () => {
    const setQuickFilterVisualState = vi.fn();
    const setAccountingLiveRange = vi.fn();
    const setAccountingLiveNote = vi.fn();
    const accountingTimeframeSwitch = createElement();
    const accountingQfWeek = createElement();
    const accountingQfMonth = createElement();
    const accountingCustomApply = createElement();
    const accountingCustomFrom = createElement({ value: "" });
    const accountingCustomTo = createElement({ value: "" });

    const runtime = createAccountingLiveControlsRuntime({
      setAccountingTimeframe: vi.fn(),
      setQuickFilterVisualState,
      setAccountingLiveRange,
      setAccountingLiveNote,
      getThisWeekRange: () => ({ from: "2026-03-09", to: "2026-03-10" }),
      getThisMonthRange: () => ({ from: "2026-03-01", to: "2026-03-10" }),
      accountingTimeframeSwitch,
      accountingQfWeek,
      accountingQfMonth,
      accountingCustomApply,
      accountingCustomFrom,
      accountingCustomTo
    });

    runtime.bindAccountingLiveControlsEvents();

    await accountingQfWeek.dispatch("click");
    await accountingQfMonth.dispatch("click");

    expect(setQuickFilterVisualState).toHaveBeenNthCalledWith(1, "week");
    expect(setAccountingLiveRange).toHaveBeenNthCalledWith(1, "2026-03-09", "2026-03-10", { reload: true });
    expect(setQuickFilterVisualState).toHaveBeenNthCalledWith(2, "month");
    expect(setAccountingLiveRange).toHaveBeenNthCalledWith(2, "2026-03-01", "2026-03-10", { reload: true });

    await accountingCustomApply.dispatch("click");
    expect(setAccountingLiveNote).toHaveBeenCalledWith("Select both start and end dates for custom range.", true);

    accountingCustomFrom.value = "2026-03-11";
    accountingCustomTo.value = "2026-03-10";
    await accountingCustomApply.dispatch("click");
    expect(setAccountingLiveNote).toHaveBeenCalledWith(
      "Custom range is invalid: start date must be before end date.",
      true
    );

    accountingCustomFrom.value = "2026-03-01";
    accountingCustomTo.value = "2026-03-10";
    await accountingCustomApply.dispatch("click");
    expect(setQuickFilterVisualState).toHaveBeenLastCalledWith("custom");
    expect(setAccountingLiveRange).toHaveBeenLastCalledWith("2026-03-01", "2026-03-10", { reload: true });
  });
});
