import { describe, expect, it, vi } from "vitest";
import { createOperationsRuntime } from "../public/dashboard-operations-runtime.js";

class FakeClassList {
  constructor(classes = []) {
    this.classes = new Set(classes);
  }

  contains(name) {
    return this.classes.has(name);
  }
}

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
    this.value = "";
    this.attrs = {};
    this.classList = new FakeClassList(initial.classes || []);
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

  appendChild(child) {
    this.children.push(child);
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  scrollIntoView() {
    this.scrolled = true;
  }

  focus() {
    this.focused = true;
  }
}

globalThis.HTMLElement = FakeHTMLElement;
globalThis.document = {
  createElement: vi.fn(() => new FakeHTMLElement())
};
globalThis.window = {
  setTimeout: vi.fn((fn) => fn())
};

function submitEvent() {
  return {
    preventDefault: vi.fn()
  };
}

describe("operations runtime", () => {
  it("stages waitlist recovery from bookings and renders waitlist/ops/crm states", () => {
    const waitlistNameInput = new FakeHTMLElement();
    const waitlistPhoneInput = new FakeHTMLElement();
    const waitlistEmailInput = new FakeHTMLElement();
    const waitlistServiceInput = new FakeHTMLElement();
    const waitlistDateInput = new FakeHTMLElement();
    const waitlistSection = new FakeHTMLElement();
    const waitlistSummaryCards = new FakeHTMLElement();
    const waitlistList = new FakeHTMLElement();
    const noShowRiskList = new FakeHTMLElement();
    const rebookingPromptList = new FakeHTMLElement();
    const crmSegmentsList = new FakeHTMLElement();
    const showSection = vi.fn();
    const focusModuleByKey = vi.fn();

    const runtime = createOperationsRuntime({
      canManageBusinessModules: () => true,
      isPopupMountedBusinessSection: () => true,
      hideSection: vi.fn(),
      showSection,
      normalizeText: (value) => String(value || "").toLowerCase(),
      focusModuleByKey,
      buildWaitlistRecoveryDateTime: (booking) => `${booking.date}T${booking.time}`,
      getBookingRows: () => [
        {
          id: "b1",
          customerName: "Taylor",
          customerPhone: "07111111111",
          customerEmail: "TAYLOR@example.com",
          service: "Colour",
          date: "2026-03-12",
          time: "14:00",
          status: "cancelled"
        }
      ],
      getWaitlistSummary: () => ({ totalEntries: 2, waitingCount: 1, contactedCount: 1, bookedCount: 0 }),
      getWaitlistRows: () => [
        {
          id: "w1",
          customerName: "Jamie",
          service: "Cut",
          preferredDate: "2026-03-12",
          preferredTime: "09:00",
          customerPhone: "07000000000",
          status: "waiting"
        }
      ],
      getOperationsInsights: () => ({
        noShowRisk: [{ bookingId: "b1", customerName: "Taylor", service: "Colour", date: "2026-03-12", time: "14:00", riskLevel: "high", riskScore: 8, reasons: ["Late arrival history"] }],
        rebookingPrompts: [{ customerKey: "email:jamie@test", customerName: "Jamie", lastService: "Cut", daysSinceLastVisit: 44, suggestedMessage: "Come back this week." }]
      }),
      getCrmSegmentsPayload: () => ({
        segments: [{ id: "lapsed", label: "Lapsed", leads: [{ customerKey: "email:jamie@test", customerName: "Jamie", message: "We miss you." }] }]
      }),
      waitlistStatusNote: new FakeHTMLElement(),
      operationsStatusNote: new FakeHTMLElement(),
      crmStatusNote: new FakeHTMLElement(),
      waitlistSection,
      operationsInsightsSection: new FakeHTMLElement(),
      crmSection: new FakeHTMLElement(),
      waitlistSummaryCards,
      waitlistList,
      noShowRiskList,
      rebookingPromptList,
      crmSegmentsList,
      waitlistNameInput,
      waitlistPhoneInput,
      waitlistEmailInput,
      waitlistServiceInput,
      waitlistDateInput
    });

    const staged = runtime.stageWaitlistRecoveryFromBooking("b1");
    expect(staged).toBe(true);
    expect(waitlistNameInput.value).toBe("Taylor");
    expect(waitlistEmailInput.value).toBe("taylor@example.com");
    expect(waitlistDateInput.value).toBe("2026-03-12T14:00");
    expect(focusModuleByKey).toHaveBeenCalledWith("waitlist");
    expect(waitlistSection.scrolled).toBe(true);
    expect(waitlistNameInput.focused).toBe(true);

    runtime.renderWaitlistSummary();
    runtime.renderWaitlist();
    runtime.renderOperationsInsights();
    runtime.renderCrmSegments();

    expect(waitlistSummaryCards.children).toHaveLength(3);
    expect(waitlistList.children[0].innerHTML).toContain("Jamie");
    expect(noShowRiskList.children[0].innerHTML).toContain("Mark Reminder Sent");
    expect(rebookingPromptList.children[0].innerHTML).toContain("Come back this week.");
    expect(crmSegmentsList.children[0].innerHTML).toContain("Lapsed");
    expect(showSection).toHaveBeenCalled();
  });

  it("submits and edits waitlist entries through the event handlers", async () => {
    const waitlistForm = new FakeHTMLElement();
    const waitlistList = new FakeHTMLElement();
    const waitlistNameInput = new FakeHTMLElement({ value: "Jamie" });
    const waitlistPhoneInput = new FakeHTMLElement({ value: "07123456789" });
    const waitlistEmailInput = new FakeHTMLElement({ value: "" });
    const waitlistServiceInput = new FakeHTMLElement({ value: "Cut" });
    const waitlistDateInput = new FakeHTMLElement({ value: "2026-03-12 09:00" });
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], summary: {} })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], summary: {} })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], summary: {} })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], summary: {} })
      });
    const openManageForm = vi.fn().mockResolvedValue({
      customerName: "Jamie Updated",
      customerPhone: "07123456789",
      customerEmail: "jamie@test.com",
      service: "Colour",
      preferredDate: "2026-03-13",
      preferredTime: "10:30"
    });
    const openManageConfirm = vi.fn().mockResolvedValue(true);
    const setWaitlistStatus = vi.fn();
    const showManageToast = vi.fn();

    const runtime = createOperationsRuntime({
      isDashboardManagerRole: () => true,
      getManageModeEnabled: () => true,
      openManageForm,
      openManageConfirm,
      showManageToast,
      fetchImpl,
      withManagedBusiness: (path) => path,
      headers: () => ({ Authorization: "Bearer token" }),
      parseWaitlistDateTimeInput: () => ({ preferredDate: "2026-03-12", preferredTime: "09:00" }),
      waitlistForm,
      waitlistList,
      waitlistNameInput,
      waitlistPhoneInput,
      waitlistEmailInput,
      waitlistServiceInput,
      waitlistDateInput,
      getWaitlistRows: () => [{ id: "w1", customerName: "Jamie", customerPhone: "07123456789", customerEmail: "jamie@test.com", service: "Cut", preferredDate: "2026-03-12", preferredTime: "09:00" }],
      waitlistStatusNote: new FakeHTMLElement()
    });

    runtime.bindOperationsEvents();

    await waitlistForm.dispatch("submit", submitEvent());
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "/api/waitlist/upsert",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          customerName: "Jamie",
          customerPhone: "07123456789",
          customerEmail: "",
          service: "Cut",
          preferredDate: "2026-03-12",
          preferredTime: "09:00",
          notes: ""
        })
      })
    );
    expect(waitlistNameInput.value).toBe("");

    const editTarget = new FakeHTMLElement({ classes: ["waitlist-edit"] });
    editTarget.setAttribute("data-id", "w1");
    await waitlistList.dispatch("click", { target: editTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/waitlist/upsert",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: "w1",
          customerName: "Jamie Updated",
          customerPhone: "07123456789",
          customerEmail: "jamie@test.com",
          service: "Colour",
          preferredDate: "2026-03-13",
          preferredTime: "10:30"
        })
      })
    );
    expect(showManageToast).toHaveBeenCalledWith("Waitlist entry updated.");

    const backfillTarget = new FakeHTMLElement({ classes: ["waitlist-backfill"] });
    backfillTarget.setAttribute("data-id", "w1");
    await waitlistList.dispatch("click", { target: backfillTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      "/api/waitlist/w1/backfill",
      expect.objectContaining({
        method: "POST"
      })
    );

    const removeTarget = new FakeHTMLElement({ classes: ["waitlist-remove"] });
    removeTarget.setAttribute("data-id", "w1");
    await waitlistList.dispatch("click", { target: removeTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      4,
      "/api/waitlist/w1",
      expect.objectContaining({
        method: "DELETE"
      })
    );
    expect(showManageToast).toHaveBeenCalledWith("Waitlist entry deleted.");
  });

  it("handles operations and crm clipboard/send actions", async () => {
    const noShowRiskList = new FakeHTMLElement();
    const rebookingPromptList = new FakeHTMLElement();
    const crmSegmentsList = new FakeHTMLElement();
    const writeToClipboard = vi.fn().mockResolvedValue(true);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      });
    const operationsStatusNote = new FakeHTMLElement();
    const crmStatusNote = new FakeHTMLElement();

    const runtime = createOperationsRuntime({
      fetchImpl,
      withManagedBusiness: (path) => path,
      headers: () => ({ Authorization: "Bearer token" }),
      writeToClipboard,
      noShowRiskList,
      rebookingPromptList,
      crmSegmentsList,
      operationsStatusNote,
      crmStatusNote
    });

    runtime.bindOperationsEvents();

    const reminderTarget = new FakeHTMLElement({ classes: ["ops-send-reminder"] });
    reminderTarget.setAttribute("data-booking-id", "b1");
    reminderTarget.setAttribute("data-customer-name", "Taylor");
    reminderTarget.setAttribute("data-service", "Colour");
    await noShowRiskList.dispatch("click", { target: reminderTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "/api/operations/rebooking/mark-sent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ customerKey: "booking:b1", customerName: "Taylor", service: "Colour" })
      })
    );

    const copyTarget = new FakeHTMLElement({ classes: ["ops-copy-rebooking"] });
    copyTarget.setAttribute("data-message", "Come back this week.");
    await rebookingPromptList.dispatch("click", { target: copyTarget });
    expect(writeToClipboard).toHaveBeenCalledWith("Come back this week.");
    expect(operationsStatusNote.textContent).toBe("Rebooking prompt copied to clipboard.");

    const markTarget = new FakeHTMLElement({ classes: ["ops-mark-rebooking"] });
    markTarget.setAttribute("data-customer-key", "email:jamie@test");
    markTarget.setAttribute("data-customer-name", "Jamie");
    markTarget.setAttribute("data-service", "Cut");
    await rebookingPromptList.dispatch("click", { target: markTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/operations/rebooking/mark-sent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ customerKey: "email:jamie@test", customerName: "Jamie", service: "Cut" })
      })
    );

    const crmCopyTarget = new FakeHTMLElement({ classes: ["crm-copy-message"] });
    crmCopyTarget.setAttribute("data-message", "We miss you.");
    await crmSegmentsList.dispatch("click", { target: crmCopyTarget });
    expect(crmStatusNote.textContent).toBe("Campaign template copied to clipboard.");

    const crmMarkTarget = new FakeHTMLElement({ classes: ["crm-mark-sent"] });
    crmMarkTarget.setAttribute("data-segment-id", "lapsed");
    crmMarkTarget.setAttribute("data-customer-key", "email:jamie@test");
    crmMarkTarget.setAttribute("data-customer-name", "Jamie");
    crmMarkTarget.setAttribute("data-message", "We miss you.");
    await crmSegmentsList.dispatch("click", { target: crmMarkTarget });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      "/api/crm/campaigns/send",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          segmentId: "lapsed",
          customerKey: "email:jamie@test",
          customerName: "Jamie",
          message: "We miss you.",
          channel: "manual"
        })
      })
    );
    expect(crmStatusNote.textContent).toBe("Campaign activity marked as sent.");
  });
});
