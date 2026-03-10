import { describe, expect, it, vi } from "vitest";
import { createCommandCenterRuntime } from "../public/dashboard-command-center.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    this.children = [];
    this.style = {};
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
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

  scrollIntoView() {
    this.scrolled = true;
  }
}

globalThis.HTMLElement = FakeHTMLElement;
globalThis.document = {
  createElement: vi.fn(() => new FakeHTMLElement())
};

describe("dashboard command center runtime", () => {
  it("renders subscriber command-center cards and actions", () => {
    const subscriberCommandCenterSection = new FakeHTMLElement();
    subscriberCommandCenterSection.style.display = "";
    const commandCenterCards = new FakeHTMLElement();
    const commandCenterActions = new FakeHTMLElement();
    const commandCenterStatus = new FakeHTMLElement();
    const renderExecutivePulse = vi.fn();

    const runtime = createCommandCenterRuntime({
      getUserRole: () => "subscriber",
      formatMoney: (value) => `GBP ${Number(value).toFixed(2)}`,
      renderExecutivePulse,
      commandCenterStatus,
      subscriberCommandCenterSection,
      commandCenterCards,
      commandCenterActions,
      getSubscriberCommandCenter: () => ({
        today: { totalBookings: 4, estimatedRevenue: 210 },
        next7Days: { confirmedBookings: 11 },
        serviceHealth: { cancellationRate: 12.5 },
        recommendedActions: [
          { id: "fill-cancellations", label: "Fill cancellations", detail: "Recover revenue quickly." },
          { id: "tighten-confirmations", label: "Tighten confirmations", detail: "Reduce no-shows." }
        ]
      })
    });

    runtime.renderCommandCenter();

    expect(commandCenterCards.children).toHaveLength(4);
    expect(commandCenterCards.children[0].innerHTML).toContain("Today");
    expect(commandCenterCards.children[1].innerHTML).toContain("GBP 210.00");
    expect(commandCenterActions.children).toHaveLength(2);
    expect(commandCenterActions.children[0].innerHTML).toContain("Fill cancellations");
    expect(commandCenterStatus.textContent).toContain("Start with the first action");
    expect(renderExecutivePulse).toHaveBeenCalled();
  });

  it("hides the command center for non-subscriber roles", () => {
    const subscriberCommandCenterSection = new FakeHTMLElement();
    subscriberCommandCenterSection.style.display = "";

    const runtime = createCommandCenterRuntime({
      getUserRole: () => "customer",
      subscriberCommandCenterSection,
      commandCenterCards: new FakeHTMLElement(),
      commandCenterActions: new FakeHTMLElement()
    });

    runtime.renderCommandCenter();

    expect(subscriberCommandCenterSection.style.display).toBe("none");
  });

  it("runs command-center actions and handles clipboard fallback", async () => {
    const bookingStatus = new FakeHTMLElement({ value: "all" });
    const bookingSort = new FakeHTMLElement({ value: "oldest" });
    const waitlistSection = new FakeHTMLElement();
    const bookingTools = new FakeHTMLElement();
    const commandCenterStatus = new FakeHTMLElement();
    const applyBookingFilters = vi.fn();
    const setActiveStatusChip = vi.fn();

    const runtime = createCommandCenterRuntime({
      nav: {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("blocked"))
        }
      },
      applyBookingFilters,
      setActiveStatusChip,
      commandCenterStatus,
      bookingTools,
      bookingStatus,
      bookingSort,
      waitlistSection
    });

    await runtime.runCommandCenterAction("fill-cancellations");
    expect(bookingStatus.value).toBe("cancelled");
    expect(setActiveStatusChip).toHaveBeenCalledWith("cancelled");
    expect(waitlistSection.scrolled).toBe(true);

    await runtime.runCommandCenterAction("boost-today-demand");
    expect(bookingStatus.value).toBe("all");
    expect(bookingSort.value).toBe("newest");
    expect(bookingTools.scrolled).toBe(true);
    expect(commandCenterStatus.textContent).toContain("Campaign idea ready");

    await runtime.runCommandCenterAction("maintain-momentum");
    expect(bookingStatus.value).toBe("confirmed");
    expect(bookingSort.value).toBe("oldest");
    expect(commandCenterStatus.textContent).toContain("Stable day");
  });
});
