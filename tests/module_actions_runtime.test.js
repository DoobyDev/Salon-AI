import { describe, expect, it, vi } from "vitest";
import { createModuleActionRuntime } from "../public/dashboard-module-actions.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.value = "";
    this.placeholder = "";
    this.attrs = {};
    Object.assign(this, initial);
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }
}

describe("module action runtime", () => {
  it("opens Lexi assist for subscriber/admin roles with suggested context", () => {
    const subscriberInput = new FakeHTMLElement({ value: "old" });
    const openBusinessAiChatPopup = vi.fn();
    const resetCopilotChat = vi.fn();
    const setDashActionStatus = vi.fn();

    const runtime = createModuleActionRuntime({
      getUserRole: () => "subscriber",
      moduleOperatorBlueprint: () => ({ focus: "Retain revenue" }),
      moduleLexiAssistQuestion: () => "How do I reduce cancellations today?",
      copilotPopupRefs: () => ({ input: subscriberInput }),
      openBusinessAiChatPopup,
      resetCopilotChat,
      setDashActionStatus
    });

    runtime.openLexiModuleAssist({ key: "waitlist", label: "Waitlist" }, { trigger: "module-popup" });

    expect(subscriberInput.value).toBe("");
    expect(subscriberInput.placeholder).toBe("Ask Lexi about Waitlist...");
    expect(subscriberInput.attrs["data-lexi-suggested-question"]).toBe("How do I reduce cancellations today?");
    expect(openBusinessAiChatPopup).toHaveBeenCalledWith("subscriber", { trigger: "module-popup", focusInput: true });
    expect(resetCopilotChat).toHaveBeenCalledWith("subscriber", "Hi, what can I help you with?");
    expect(setDashActionStatus).toHaveBeenCalledWith("Lexi chat opened for Waitlist. Close Lexi to return to this module popup.");
  });

  it("routes open-module and related-module actions through workspace navigation", async () => {
    const setWorkspaceBackButtonVisible = vi.fn();
    const focusModuleByKey = vi.fn();
    const close = vi.fn();

    const runtime = createModuleActionRuntime({
      getUserRole: () => "admin",
      setWorkspaceBackButtonVisible,
      focusModuleByKey
    });

    await runtime.runModuleOperatorAction("open_module", { key: "calendar", label: "Calendar" }, { close });
    expect(setWorkspaceBackButtonVisible).toHaveBeenCalledWith(true);
    expect(focusModuleByKey).toHaveBeenCalledWith("calendar");
    expect(close).toHaveBeenCalled();

    await runtime.runModuleOperatorAction("open_related_module", { key: "home", label: "Hub" }, { moduleKey: "accounting", close });
    expect(setWorkspaceBackButtonVisible).toHaveBeenCalledWith(true);
    expect(focusModuleByKey).toHaveBeenCalledWith("accounting");
  });

  it("copies playbooks and falls back to canned or generic operator messages", async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(true);
    const showManageToast = vi.fn();
    const setDashActionStatus = vi.fn();

    const runtime = createModuleActionRuntime({
      getUserRole: () => "subscriber",
      moduleOperatorBlueprint: () => ({
        nextSteps: ["Call waitlist", "Offer same-day slot"],
        focus: "Recover revenue",
        impact: "Reduce lost-chair time"
      }),
      writeToClipboard,
      showManageToast,
      setDashActionStatus
    });

    await runtime.runModuleOperatorAction("copy_playbook", { key: "waitlist", label: "Waitlist" });
    expect(writeToClipboard).toHaveBeenCalledWith(
      expect.stringContaining("Waitlist - AI Playbook")
    );
    expect(showManageToast).toHaveBeenCalledWith("Playbook copied.", undefined);
    expect(setDashActionStatus).toHaveBeenCalledWith("Playbook copied to clipboard.", false);

    await runtime.runModuleOperatorAction("simulate_opening", { key: "home", label: "Business Hub" });
    expect(setDashActionStatus).toHaveBeenCalledWith("Business Hub: Opening setup run completed. Team readiness, bookings, and priority checks are ready.");

    await runtime.runModuleOperatorAction("unknown_action", { key: "crm", label: "CRM" });
    expect(setDashActionStatus).toHaveBeenCalledWith("CRM: AI assistant prepared the next best actions for this workflow.");
    expect(showManageToast).toHaveBeenCalledWith("CRM: AI assistant prepared the next best actions for this workflow.");
  });
});
