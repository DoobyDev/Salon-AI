import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBusinessReportingRuntime } from "../public/dashboard-business-reporting.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.className = "";
    this.value = "";
    this.attrs = {};
    this.classList = {
      add: vi.fn(),
      remove: vi.fn()
    };
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }

  appendChild(child) {
    this.children.push(child);
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  closest(selector) {
    if (selector === "[data-hub-auto-toggle]") return this;
    return null;
  }
}

globalThis.HTMLElement = FakeHTMLElement;

const localStorageState = new Map();
globalThis.localStorage = {
  getItem: vi.fn((key) => (localStorageState.has(key) ? localStorageState.get(key) : null)),
  setItem: vi.fn((key, value) => {
    localStorageState.set(key, String(value));
  })
};

function parseBookingDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createRuntime(overrides = {}) {
  const doc = {
    createElement: vi.fn(() => new FakeHTMLElement())
  };

  return createBusinessReportingRuntime({
    doc,
    win: {
      open: vi.fn(),
      setTimeout: vi.fn((fn) => fn())
    },
    fetchImpl: vi.fn(),
    getUserRole: () => "subscriber",
    getUserEmail: () => "owner@example.com",
    getUserName: () => "Owner Name",
    getUserBusinessId: () => "biz_1",
    getManagedBusinessId: () => "biz_1",
    headers: () => ({ Authorization: "Bearer token" }),
    withManagedBusiness: (path) => path,
    formatMoney: (value) => `GBP ${Number(value || 0).toFixed(2)}`,
    escapeHtml: (value) => String(value || ""),
    todayDateKeyLocal: () => "2026-03-10",
    parseBookingDate,
    toDateKey,
    getBookingRows: () => [
      { date: "2026-03-10", time: "09:00", customerName: "Alex", service: "Cut", status: "confirmed", price: 45 },
      { date: "2026-03-10", time: "11:00", customerName: "Taylor", service: "Colour", status: "cancelled", price: 80 },
      { date: "2026-03-12", time: "14:00", customerName: "Morgan", service: "Blow Dry", status: "confirmed", price: 35 }
    ],
    getStaffWorkingForDate: (date) => (date.getDate() === 10 ? [{ name: "Sam" }] : [{ name: "Jamie" }, { name: "Parker" }]),
    getAccountingRows: () => [{ connected: true }],
    getWaitlistRows: () => [{ id: "w1" }, { id: "w2" }],
    getOperationsInsights: () => ({ noShowRisk: [{ id: "r1" }], rebookingPrompts: [{ id: "rp1" }] }),
    getBusinessProfileServicesValue: () => "Cut\nColour\nBlow Dry",
    getBusinessProfileNameValue: () => "Salon Prime",
    getBusinessProfileEmailValue: () => "hello@salonprime.test",
    getBusinessProfilePhoneValue: () => "07111111111",
    getBusinessProfileCityValue: () => "London",
    getBusinessProfileCountryValue: () => "UK",
    getStaffRosterRows: () => [{ name: "Sam", role: "stylist", availability: "full_time" }],
    isDashboardDemoDataModeActive: () => false,
    openManageForm: vi.fn(),
    setDashActionStatus: vi.fn(),
    showManageToast: vi.fn(),
    hubCommandSignalGrid: new FakeHTMLElement(),
    hubReportStatusPill: new FakeHTMLElement(),
    hubPrintReportBtn: new FakeHTMLElement(),
    hubEmailReportBtn: new FakeHTMLElement(),
    hubReportHighlights: new FakeHTMLElement(),
    hubReportStatusText: new FakeHTMLElement(),
    hubPriorityList: new FakeHTMLElement(),
    hubAutoRoutines: new FakeHTMLElement(),
    hubRunPrioritySweepBtn: new FakeHTMLElement(),
    localStorageKey: "hub_auto_routines",
    ...overrides
  });
}

describe("business reporting runtime", () => {
  beforeEach(() => {
    localStorageState.clear();
  });

  it("renders the business hub command deck and builds a report payload/html snapshot", () => {
    const runtime = createRuntime();

    runtime.renderBusinessHubCommandDeck();
    const payload = runtime.buildBusinessReportPayload();
    const html = runtime.buildBusinessReportHtml(payload);

    expect(payload.summary.todayBookings).toBe(2);
    expect(payload.summary.accountingConnected).toBe(1);
    expect(payload.reportHighlights).toHaveLength(4);
    expect(html).toContain("Salon Prime - Business Report");
    expect(html).toContain("AI Priorities");
    expect(html).toContain("Alex");
  });

  it("opens the print window and updates print status when a popup is available", async () => {
    const popup = {
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn()
      },
      focus: vi.fn(),
      print: vi.fn()
    };
    const setDashActionStatus = vi.fn();
    const hubReportStatusPill = new FakeHTMLElement();

    const runtime = createRuntime({
      win: {
        open: vi.fn(() => popup),
        setTimeout: vi.fn((fn) => fn())
      },
      setDashActionStatus,
      hubReportStatusPill
    });

    await runtime.printBusinessReportPdf();

    expect(popup.document.write).toHaveBeenCalled();
    expect(popup.focus).toHaveBeenCalled();
    expect(popup.print).toHaveBeenCalled();
    expect(setDashActionStatus).toHaveBeenCalledWith("Print dialog opened. Choose Save as PDF to create a business report PDF.");
    expect(hubReportStatusPill.textContent).toBe("Print opened");
    expect(hubReportStatusPill.classList.add).toHaveBeenCalledWith("muted");
  });

  it("queues demo report emails locally and handles the email flow status update", async () => {
    const openManageForm = vi.fn().mockResolvedValue({
      recipientEmail: "ops@example.com",
      note: "Weekly review"
    });
    const setDashActionStatus = vi.fn();
    const showManageToast = vi.fn();
    const hubReportStatusPill = new FakeHTMLElement();
    const hubReportStatusText = new FakeHTMLElement();

    const runtime = createRuntime({
      isDashboardDemoDataModeActive: () => true,
      openManageForm,
      setDashActionStatus,
      showManageToast,
      hubReportStatusPill,
      hubReportStatusText
    });

    await runtime.openBusinessReportEmailFlow();

    const queuedRows = JSON.parse(localStorageState.get("salon_ai_demo_report_emails_v1") || "[]");
    expect(queuedRows).toHaveLength(1);
    expect(queuedRows[0].recipientEmail).toBe("ops@example.com");
    expect(hubReportStatusPill.textContent).toBe("Queued");
    expect(hubReportStatusText.textContent).toContain("Recipient: ops@example.com");
    expect(setDashActionStatus).toHaveBeenCalledWith("Business report queued for email delivery.");
    expect(showManageToast).toHaveBeenCalledWith("Business report queued.");
  });

  it("binds auto-routine toggles and priority sweep actions", async () => {
    const setDashActionStatus = vi.fn();
    const showManageToast = vi.fn();
    const hubAutoRoutines = new FakeHTMLElement();
    const hubRunPrioritySweepBtn = new FakeHTMLElement();

    const runtime = createRuntime({
      setDashActionStatus,
      showManageToast,
      hubAutoRoutines,
      hubRunPrioritySweepBtn
    });

    runtime.bindBusinessReportingEvents();

    const toggleTarget = new FakeHTMLElement();
    toggleTarget.setAttribute("data-hub-auto-toggle", "openingSweep");
    hubAutoRoutines.dispatch("click", { target: toggleTarget });
    expect(JSON.parse(localStorageState.get("hub_auto_routines") || "{}").openingSweep).toBe(true);
    expect(setDashActionStatus).toHaveBeenCalledWith("openingSweep automation enabled for this device.");

    hubRunPrioritySweepBtn.dispatch("click");
    expect(setDashActionStatus).toHaveBeenCalledWith("AI sweep complete: priorities reordered for staffing, booking risk and finance readiness.");
    expect(showManageToast).toHaveBeenCalledWith("AI priority sweep complete.");
  });
});
