import { describe, expect, it, vi } from "vitest";
import { createBusinessCopilotRuntime } from "../public/dashboard-business-copilot.js";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(name) {
    this.values.add(name);
  }

  remove(name) {
    this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeHTMLElement {
  constructor(initial = {}) {
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.className = "";
    this.classList = new FakeClassList();
    this.attrs = {};
    this.listeners = {};
    this.parentNode = null;
    this.parentElement = null;
    this.scrollHeight = 0;
    this.scrollTop = 0;
    Object.assign(this, initial);
  }

  appendChild(child) {
    child.parentNode = this;
    child.parentElement = this;
    this.children.push(child);
  }

  insertBefore(child, reference) {
    child.parentNode = this;
    child.parentElement = this;
    const index = this.children.indexOf(reference);
    if (index === -1) {
      this.children.push(child);
      return child;
    }
    this.children.splice(index, 0, child);
    return child;
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  querySelector(selector) {
    return this.queryMap?.[selector] || null;
  }

  querySelectorAll(selector) {
    return this.queryMapAll?.[selector] || [];
  }

  focus() {
    this.focused = true;
  }

  remove() {
    if (!this.parentNode?.children) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
    this.parentElement = null;
  }
}

globalThis.HTMLElement = FakeHTMLElement;
globalThis.HTMLButtonElement = FakeHTMLElement;

describe("business copilot runtime", () => {
  it("renders subscriber snapshot cards and visible module links", () => {
    const snapshotHost = new FakeHTMLElement();
    const linksHost = new FakeHTMLElement();

    const runtime = createBusinessCopilotRuntime({
      win: { requestAnimationFrame: (fn) => fn?.() },
      doc: {
        createElement: vi.fn(() => new FakeHTMLElement())
      },
      escapeHtml: (value) => String(value || ""),
      subscriberCopilotSnapshot: snapshotHost,
      subscriberCopilotLinks: linksHost,
      moduleDefinitionByKey: (key) => ({ key, label: key.toUpperCase() })
    });

    runtime.renderSubscriberCopilotSnapshot({
      business: { name: "Salon Prime", type: "Hair" },
      bookings: { total: 18, cancelled: 2, cancelRatePct: 11, upcoming7d: 14 },
      health: { openaiConfigured: false, accountingSignalsAvailable: true }
    });

    expect(snapshotHost.children).toHaveLength(8);
    expect(snapshotHost.children[0].innerHTML).toContain("Salon Prime");
    expect(snapshotHost.children[6].innerHTML).toContain("Not connected");
    expect(snapshotHost.children[7].innerHTML).toContain("Live");

    const links = runtime.buildSubscriberCopilotLinks(
      {
        answer: "You should focus on your waitlist and accounting export first.",
        findings: ["Waitlist demand is building."],
        suggestedActions: ["Review calendar gaps."],
        suggestedFixes: ["Reconcile yesterday's payout export."]
      },
      "What should I focus on today?"
    );

    expect(links).toEqual([
      { key: "command_center", label: "Command Center" },
      { key: "calendar", label: "Calendar" },
      { key: "waitlist", label: "Waitlist" },
      { key: "accounting", label: "Accounting" }
    ]);

    runtime.renderSubscriberCopilotLinks(links);

    expect(linksHost.classList.contains("is-visible")).toBe(true);
    expect(linksHost.children).toHaveLength(5);
    expect(linksHost.children[0].textContent).toBe("Open this in your dashboard:");
    expect(linksHost.children[1].getAttribute("data-module-jump")).toBe("command_center");
    expect(linksHost.children[4].textContent).toBe("Accounting");
  });

  it("falls back to default links and builds subscriber/admin business context strings", () => {
    const runtime = createBusinessCopilotRuntime({
      win: { requestAnimationFrame: (fn) => fn?.() },
      doc: {
        createElement: vi.fn(() => new FakeHTMLElement())
      },
      formatMoney: (value) => `GBP ${Number(value || 0).toFixed(2)}`,
      moduleDefinitionByKey: (key) => {
        const labels = {
          command_center: "Command Center",
          calendar: "Calendar",
          booking_ops: "Booking Operations"
        };
        return labels[key] ? { key, label: labels[key] } : null;
      },
      selectedCalendarDateSummary: () => ({
        dateKey: "2026-03-10",
        bookings: 5,
        cancelled: 1,
        staffCount: 3,
        revenue: 210
      }),
      parseBookingDate: (value) => new Date(`${value}T09:00:00Z`),
      toDateKey: (value) => value.toISOString().slice(0, 10),
      todayDateKeyLocal: () => "2026-03-10",
      getBookingRows: () => [
        { date: "2026-03-10", status: "confirmed", price: 70 },
        { date: "2026-03-10", status: "cancelled", price: 30 },
        { date: "2026-03-10", status: "completed", price: 140 },
        { date: "2026-03-11", status: "confirmed", price: 65 }
      ],
      getStaffWorkingForDate: () => [{ id: "s1" }, { id: "s2" }],
      getWaitlistRows: () => [{ id: "w1" }, { id: "w2" }, { id: "w3" }],
      getOperationsInsights: () => ({
        noShowRisk: [{ id: "r1" }, { id: "r2" }]
      }),
      getAccountingRows: () => [
        { connected: true },
        { status: "connected" },
        { connected: false }
      ],
      getSubscriberAiScope: () => "today",
      getAdminAiScope: () => "diagnostics",
      getManagedBusinessId: () => "biz_123"
    });

    expect(
      runtime.buildSubscriberCopilotLinks(
        { answer: "Give me the basics." },
        "General help"
      )
    ).toEqual([
      { key: "command_center", label: "Command Center" },
      { key: "calendar", label: "Calendar" },
      { key: "booking_ops", label: "Booking Operations" }
    ]);

    const subscriberContext = runtime.businessAiContextString("subscriber");
    const adminContext = runtime.businessAiContextString("admin");

    expect(subscriberContext).toContain("Scope: today");
    expect(subscriberContext).toContain("Today: 3 bookings, 1 cancelled, revenue signal GBP 210.00, 2 staff on rota");
    expect(subscriberContext).toContain("Waitlist: 3 entries");
    expect(subscriberContext).toContain("No-show risks: 2");
    expect(subscriberContext).toContain("Accounting: 2 connection(s) live");
    expect(subscriberContext).toContain("Selected day (2026-03-10): 5 bookings, 1 cancelled, 3 staff, revenue GBP 210.00");

    expect(adminContext).toContain("Managed business: biz_123");
    expect(adminContext).toContain("Scope: diagnostics");
  });

  it("manages popup hosts, prompts, chat seed/reset, and workspace scope rendering", () => {
    const subscriberInput = new FakeHTMLElement();
    const subscriberAnswer = new FakeHTMLElement({ textContent: "Use the dashboard context to decide what to do next." });
    const subscriberMessages = new FakeHTMLElement({ childElementCount: 0 });
    const popupCard = new FakeHTMLElement();
    const popupOverlay = new FakeHTMLElement({
      queryMap: {
        ".copilot-chat-popup": popupCard
      }
    });
    const subscriberContext = new FakeHTMLElement();
    const chipToday = new FakeHTMLElement();
    chipToday.setAttribute("data-ai-scope", "today");
    chipToday.classList.toggle = vi.fn((name, force) => {
      if (force) chipToday.classList.add(name);
      else chipToday.classList.remove(name);
    });
    const chipGrowth = new FakeHTMLElement();
    chipGrowth.setAttribute("data-ai-scope", "growth");
    chipGrowth.classList.toggle = vi.fn((name, force) => {
      if (force) chipGrowth.classList.add(name);
      else chipGrowth.classList.remove(name);
    });
    const subscriberScopeWrap = new FakeHTMLElement({
      queryMapAll: {
        ".ai-scope-chip": [chipToday, chipGrowth]
      }
    });
    const originalParent = new FakeHTMLElement();
    originalParent.appendChild(popupCard);

    const body = new FakeHTMLElement();
    body.classList = new FakeClassList();
    const popupHosts = {};
    const popupPlaceholders = {};
    let openRole = "";
    let lastTrigger = null;
    const setBusinessLexiMicButtonState = vi.fn();
    const setBusinessLexiPanelState = vi.fn();

    const runtime = createBusinessCopilotRuntime({
      win: { requestAnimationFrame: (fn) => fn?.() },
      doc: {
        body,
        createElement: vi.fn(() => new FakeHTMLElement())
      },
      escapeHtml: (value) => String(value || ""),
      formatMoney: (value) => `GBP ${Number(value || 0).toFixed(2)}`,
      selectedCalendarDateSummary: () => ({
        label: "Tuesday 10 March",
        dateKey: "2026-03-10",
        bookings: 4,
        staffCount: 2,
        staffNames: ["Alex", "Jamie"]
      }),
      parseBookingDate: (value) => new Date(`${value}T09:00:00Z`),
      toDateKey: (value) => value.toISOString().slice(0, 10),
      todayDateKeyLocal: () => "2026-03-10",
      getBookingRows: () => [
        { date: "2026-03-10", status: "confirmed", price: 80 },
        { date: "2026-03-10", status: "cancelled", price: 20 }
      ],
      getStaffWorkingForDate: () => [{ id: "s1" }, { id: "s2" }],
      getWaitlistRows: () => [{ id: "w1" }],
      getOperationsInsights: () => ({ noShowRisk: [{ id: "r1" }] }),
      getAccountingRows: () => [{ connected: true }],
      getSubscriberAiScope: () => "today",
      getBusinessCopilotPopupHosts: () => popupHosts,
      setBusinessCopilotPopupHost: (role, host) => {
        popupHosts[role] = host;
      },
      getBusinessCopilotPopupPlaceholders: () => popupPlaceholders,
      setBusinessCopilotPopupPlaceholder: (role, placeholder) => {
        popupPlaceholders[role] = placeholder;
      },
      getOpenCopilotPopupRole: () => openRole,
      setOpenCopilotPopupRole: (role) => {
        openRole = role;
      },
      getLastCopilotPopupTrigger: () => lastTrigger,
      setLastCopilotPopupTrigger: (trigger) => {
        lastTrigger = trigger;
      },
      getBusinessLexiSpeechRecognition: () => ({}),
      setBusinessLexiSpeechRecognition: vi.fn(),
      getBusinessLexiMicListening: () => ({}),
      setBusinessLexiMicListening: vi.fn(),
      subscriberCopilotInput: subscriberInput,
      subscriberCopilotAnswer: subscriberAnswer,
      subscriberCopilotMessages: subscriberMessages,
      subscriberCopilotPopup: popupOverlay,
      subscriberBusinessAiContext: subscriberContext,
      subscriberAiScopeChips: subscriberScopeWrap
    });

    runtime.setBusinessLexiMicButtonState = setBusinessLexiMicButtonState;
    runtime.setBusinessLexiPanelState = setBusinessLexiPanelState;

    const host = runtime.ensureBusinessAiPopupHost("subscriber");
    expect(popupHosts.subscriber).toBe(host);
    expect(host.getAttribute("aria-hidden")).toBe("true");

    runtime.setBusinessAiPrompt("subscriber", "  What should I do first today?  ");
    expect(subscriberInput.value).toBe("What should I do first today?");
    expect(subscriberInput.focused).toBe(true);

    const appended = runtime.appendCopilotChatMessage("subscriber", "assistant", "Check your waitlist first.", { pending: true });
    subscriberMessages.childElementCount = subscriberMessages.children.length;
    expect(appended.row.className).toContain("is-pending");
    expect(subscriberMessages.children).toHaveLength(1);

    runtime.ensureCopilotChatSeed("subscriber");
    expect(subscriberMessages.children).toHaveLength(1);

    subscriberMessages.childElementCount = 0;
    subscriberMessages.children = [];
    runtime.ensureCopilotChatSeed("subscriber");
    expect(subscriberMessages.children).toHaveLength(1);
    expect(subscriberMessages.children[0].textContent).toBe("Use the dashboard context to decide what to do next.");

    runtime.resetCopilotChat("subscriber", "Fresh start.");
    expect(subscriberMessages.innerHTML).toBe("");
    expect(subscriberMessages.children.at(-1).textContent).toBe("Fresh start.");

    const trigger = new FakeHTMLElement();
    runtime.openBusinessAiChatPopup("subscriber", {
      trigger,
      prompt: "Show me today's risks",
      focusInput: true
    });

    expect(body.children.includes(host)).toBe(true);
    expect(host.children.includes(popupCard)).toBe(true);
    expect(host.classList.contains("is-open")).toBe(true);
    expect(body.classList.contains("home-lexi-popup-open")).toBe(true);
    expect(openRole).toBe("subscriber");
    expect(lastTrigger).toBe(trigger);
    expect(subscriberInput.value).toBe("Show me today's risks");

    runtime.renderBusinessAiWorkspace("subscriber");
    expect(subscriberContext.innerHTML).toContain("Business AI Context");
    expect(subscriberContext.innerHTML).toContain("Today: <strong>2</strong> bookings");
    expect(subscriberContext.innerHTML).toContain("Revenue signal <strong>GBP 80.00</strong>");
    expect(chipToday.classList.contains("is-active")).toBe(true);
    expect(chipGrowth.classList.contains("is-active")).toBe(false);

    runtime.closeBusinessAiChatPopup("subscriber");
    expect(host.classList.contains("is-open")).toBe(false);
    expect(body.classList.contains("home-lexi-popup-open")).toBe(false);
    expect(openRole).toBe("");
    expect(lastTrigger).toBe(null);
    expect(trigger.focused).toBe(true);
    expect(originalParent.children.includes(popupCard)).toBe(true);
    expect(runtime.copilotPromptWithBusinessContext("subscriber", "What should I do next?")).toContain("Optional business context");
  });
});
