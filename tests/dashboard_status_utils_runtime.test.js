import { describe, expect, it } from "vitest";
import { createDashboardStatusUtilsRuntime } from "../public/dashboard-status-utils.js";

describe("dashboard status utils runtime", () => {
  it("reports subscriber clean-slate and top-metrics visibility by role", () => {
    const accountingStatusNote = { textContent: "", style: {} };
    const accountingLiveNote = { textContent: "", style: {} };

    const subscriberRuntime = createDashboardStatusUtilsRuntime({
      getUserRole: () => "subscriber",
      getBookingRows: () => [],
      accountingStatusNote,
      accountingLiveNote
    });

    expect(subscriberRuntime.isSubscriberCleanSlate()).toBe(true);
    expect(subscriberRuntime.shouldRenderTopMetricsGrid()).toBe(false);

    const customerRuntime = createDashboardStatusUtilsRuntime({
      getUserRole: () => "customer",
      getBookingRows: () => [{ id: "booking_1" }],
      accountingStatusNote,
      accountingLiveNote
    });

    expect(customerRuntime.isSubscriberCleanSlate()).toBe(false);
    expect(customerRuntime.shouldRenderTopMetricsGrid()).toBe(true);
  });

  it("formats dates and updates accounting notes", () => {
    const accountingStatusNote = { textContent: "", style: {} };
    const accountingLiveNote = { textContent: "", style: {} };
    const runtime = createDashboardStatusUtilsRuntime({
      getUserRole: () => "admin",
      getBookingRows: () => [],
      accountingStatusNote,
      accountingLiveNote
    });

    expect(runtime.formatDateShort("2026-03-10T12:00:00.000Z")).toBe("10/03/2026");
    expect(runtime.formatDateShort("bad-date")).toBe("N/A");

    runtime.setAccountingStatus("Status ok");
    runtime.setAccountingLiveNote("Live sync failed", true);

    expect(accountingStatusNote.textContent).toBe("Status ok");
    expect(accountingStatusNote.style.color).toBe("var(--muted)");
    expect(accountingLiveNote.textContent).toBe("Live sync failed");
    expect(accountingLiveNote.style.color).toBe("#ffadb5");
  });
});
