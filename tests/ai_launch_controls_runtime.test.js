import { describe, expect, it, vi } from "vitest";
import { createAiLaunchControlsRuntime } from "../public/dashboard-ai-launch-controls.js";

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
  return new FakeHTMLElement(initial);
}

describe("ai launch controls runtime", () => {
  it("opens the customer Lexi popup from both customer launch buttons", async () => {
    const openCustomerLexiPopup = vi.fn();
    const queueCustomerLexiPrompt = vi.fn();
    const customerLexiLaunchBtn = createElement();
    const customerLexiLaunchBookingBtn = createElement();

    const runtime = createAiLaunchControlsRuntime({
      setBusinessAiPrompt: vi.fn(),
      openBusinessAiChatPopup: vi.fn(),
      openCustomerLexiPopup,
      queueCustomerLexiPrompt,
      adminCopilotForm: { requestSubmit: vi.fn() },
      subscriberCopilotForm: { requestSubmit: vi.fn() },
      customerLexiLaunchBtn,
      customerLexiLaunchBookingBtn
    });

    runtime.bindAiLaunchControls();

    await customerLexiLaunchBtn.dispatch("click");
    await customerLexiLaunchBookingBtn.dispatch("click");

    expect(openCustomerLexiPopup).toHaveBeenCalledTimes(2);
    expect(queueCustomerLexiPrompt).toHaveBeenCalledWith("Help me book this week.");
  });

  it("primes subscriber quick-routine prompts and submits the subscriber copilot form", async () => {
    const setBusinessAiPrompt = vi.fn();
    const openBusinessAiChatPopup = vi.fn();
    const subscriberCopilotForm = { requestSubmit: vi.fn() };
    const subscriberAiQuickRoutines = createElement();

    const runtime = createAiLaunchControlsRuntime({
      setBusinessAiPrompt,
      openBusinessAiChatPopup,
      openCustomerLexiPopup: vi.fn(),
      queueCustomerLexiPrompt: vi.fn(),
      adminCopilotForm: { requestSubmit: vi.fn() },
      subscriberCopilotForm,
      customerLexiLaunchBtn: createElement(),
      customerLexiLaunchBookingBtn: createElement()
    });

    runtime.bindAiLaunchControls({ subscriberAiQuickRoutines });

    await subscriberAiQuickRoutines.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector !== ".ai-routine-btn") return null;
          const button = new FakeHTMLElement();
          button.getAttribute = (name) => (name === "data-ai-prompt" ? "Show me today's priorities." : "");
          return button;
        }
      })
    });

    expect(setBusinessAiPrompt).toHaveBeenCalledWith("subscriber", "Show me today's priorities.");
    expect(openBusinessAiChatPopup).toHaveBeenCalledWith("subscriber", { focusInput: false });
    expect(subscriberCopilotForm.requestSubmit).toHaveBeenCalled();
  });

  it("primes admin quick-routine prompts and submits the admin copilot form", async () => {
    const setBusinessAiPrompt = vi.fn();
    const openBusinessAiChatPopup = vi.fn();
    const adminCopilotForm = { requestSubmit: vi.fn() };
    const adminAiQuickRoutines = createElement();

    const runtime = createAiLaunchControlsRuntime({
      setBusinessAiPrompt,
      openBusinessAiChatPopup,
      openCustomerLexiPopup: vi.fn(),
      queueCustomerLexiPrompt: vi.fn(),
      adminCopilotForm,
      subscriberCopilotForm: { requestSubmit: vi.fn() },
      customerLexiLaunchBtn: createElement(),
      customerLexiLaunchBookingBtn: createElement()
    });

    runtime.bindAiLaunchControls({ adminAiQuickRoutines });

    await adminAiQuickRoutines.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector !== ".ai-routine-btn") return null;
          const button = new FakeHTMLElement();
          button.getAttribute = (name) => (name === "data-ai-prompt" ? "Which salons need attention first?" : "");
          return button;
        }
      })
    });

    expect(setBusinessAiPrompt).toHaveBeenCalledWith("admin", "Which salons need attention first?");
    expect(openBusinessAiChatPopup).toHaveBeenCalledWith("admin", { focusInput: false });
    expect(adminCopilotForm.requestSubmit).toHaveBeenCalled();
  });
});
