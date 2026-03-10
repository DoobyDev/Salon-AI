import { describe, expect, it, vi } from "vitest";
import { createAccountingLiveRuntime } from "../public/dashboard-accounting-live.js";

function createButton(timeframe) {
  const attrs = { "data-timeframe": timeframe };
  return {
    classList: {
      toggle: vi.fn(),
      remove: vi.fn()
    },
    setAttribute: vi.fn(),
    getAttribute(name) {
      return attrs[name] || "";
    }
  };
}

describe("accounting live runtime", () => {
  it("updates timeframe state and clears custom range inputs", () => {
    let timeframe = "today";
    let quickFilter = "week";
    let rangeFrom = "2026-03-01";
    let rangeTo = "2026-03-10";
    const accountingCustomFrom = { value: "2026-03-01" };
    const accountingCustomTo = { value: "2026-03-10" };
    const accountingTfToday = createButton("today");
    const accountingTf7d = createButton("7d");
    const accountingTf30d = createButton("30d");

    const runtime = createAccountingLiveRuntime({
      win: { document: { createElement: vi.fn() }, clearInterval: vi.fn(), setInterval: vi.fn() },
      fetchImpl: vi.fn(),
      getUserRole: () => "subscriber",
      isDashboardManagerRole: () => true,
      isDashboardDemoDataModeActive: () => false,
      canManageBusinessModules: () => true,
      withManagedBusiness: (path) => path,
      headers: () => ({ Authorization: "Bearer test" }),
      formatMoney: (value) => `GBP ${Number(value || 0)}`,
      escapeHtml: (value) => String(value ?? ""),
      renderExecutivePulse: vi.fn(),
      setAccountingStatus: vi.fn(),
      setAccountingLiveNote: vi.fn(),
      accountingLivePanel: { style: {} },
      accountingLiveCards: { innerHTML: "", appendChild: vi.fn() },
      accountingLiveGauges: { innerHTML: "" },
      accountingLiveRevenueBars: { innerHTML: "", appendChild: vi.fn() },
      accountingLiveCancelBars: { innerHTML: "", appendChild: vi.fn() },
      accountingTfToday,
      accountingTf7d,
      accountingTf30d,
      accountingQfWeek: { classList: { toggle: vi.fn() } },
      accountingQfMonth: { classList: { toggle: vi.fn() } },
      accountingCustomFrom,
      accountingCustomTo,
      getAccountingLiveTimeframe: () => timeframe,
      setAccountingLiveTimeframe: (value) => {
        timeframe = value;
      },
      getAccountingLiveQuickFilter: () => quickFilter,
      setAccountingLiveQuickFilter: (value) => {
        quickFilter = value;
      },
      getAccountingLiveRangeFrom: () => rangeFrom,
      setAccountingLiveRangeFrom: (value) => {
        rangeFrom = value;
      },
      getAccountingLiveRangeTo: () => rangeTo,
      setAccountingLiveRangeTo: (value) => {
        rangeTo = value;
      },
      getAccountingLivePayload: () => null,
      setAccountingLivePayload: vi.fn(),
      getAccountingLiveTimerId: () => null,
      setAccountingLiveTimerId: vi.fn()
    });

    runtime.setAccountingTimeframe("30d", { reload: false });

    expect(timeframe).toBe("30d");
    expect(quickFilter).toBe("");
    expect(rangeFrom).toBe("");
    expect(rangeTo).toBe("");
    expect(accountingCustomFrom.value).toBe("");
    expect(accountingCustomTo.value).toBe("");
    expect(accountingTf30d.classList.toggle).toHaveBeenCalledWith("active", true);
    expect(accountingTfToday.setAttribute).toHaveBeenCalledWith("aria-selected", "false");
  });

  it("loads business-scoped live accounting revenue and stores the payload", async () => {
    let payload = null;
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mode: "business",
        timeframe: "today",
        cards: { todayRevenue: 120, todayCancellations: 2 },
        gauges: { targetProgressPct: 48, cancellationRatePct: 12, dailyTarget: 250 },
        stream: { hourly: [{ label: "9 AM", revenue: 120, cancellations: 2 }] },
        generatedAt: "2026-03-10T12:00:00.000Z",
        refreshIntervalSec: 15
      })
    });

    const runtime = createAccountingLiveRuntime({
      win: {
        document: {
          createElement: vi.fn(() => ({ className: "", innerHTML: "" }))
        },
        clearInterval: vi.fn(),
        setInterval: vi.fn()
      },
      fetchImpl,
      getUserRole: () => "subscriber",
      isDashboardManagerRole: () => true,
      isDashboardDemoDataModeActive: () => false,
      canManageBusinessModules: () => true,
      withManagedBusiness: (path) => path,
      headers: () => ({ Authorization: "Bearer test" }),
      formatMoney: (value) => `GBP ${Number(value || 0)}`,
      escapeHtml: (value) => String(value ?? ""),
      renderExecutivePulse: vi.fn(),
      setAccountingStatus: vi.fn(),
      setAccountingLiveNote: vi.fn(),
      accountingLivePanel: { style: {} },
      accountingLiveCards: { innerHTML: "", appendChild: vi.fn() },
      accountingLiveGauges: { innerHTML: "" },
      accountingLiveRevenueBars: { innerHTML: "", appendChild: vi.fn() },
      accountingLiveCancelBars: { innerHTML: "", appendChild: vi.fn() },
      accountingTfToday: createButton("today"),
      accountingTf7d: createButton("7d"),
      accountingTf30d: createButton("30d"),
      accountingQfWeek: { classList: { toggle: vi.fn() } },
      accountingQfMonth: { classList: { toggle: vi.fn() } },
      accountingCustomFrom: { value: "" },
      accountingCustomTo: { value: "" },
      getAccountingLiveTimeframe: () => "today",
      setAccountingLiveTimeframe: vi.fn(),
      getAccountingLiveQuickFilter: () => "",
      setAccountingLiveQuickFilter: vi.fn(),
      getAccountingLiveRangeFrom: () => "",
      setAccountingLiveRangeFrom: vi.fn(),
      getAccountingLiveRangeTo: () => "",
      setAccountingLiveRangeTo: vi.fn(),
      getAccountingLivePayload: () => payload,
      setAccountingLivePayload: (value) => {
        payload = value;
      },
      getAccountingLiveTimerId: () => null,
      setAccountingLiveTimerId: vi.fn()
    });

    await runtime.loadAccountingLiveRevenue();

    expect(fetchImpl).toHaveBeenCalledWith("/api/accounting-integrations/live-revenue?timeframe=today&scope=business", {
      headers: { Authorization: "Bearer test" }
    });
    expect(payload).toEqual(
      expect.objectContaining({
        mode: "business",
        timeframe: "today"
      })
    );
  });
});
