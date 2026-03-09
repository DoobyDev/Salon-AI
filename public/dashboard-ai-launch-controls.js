// Customer Lexi launch buttons and AI quick-routine bindings.
export function createAiLaunchControlsRuntime(deps) {
  const {
    setBusinessAiPrompt,
    openBusinessAiChatPopup,
    openCustomerLexiPopup,
    queueCustomerLexiPrompt,
    adminCopilotForm,
    subscriberCopilotForm,
    customerLexiLaunchBtn,
    customerLexiLaunchBookingBtn
  } = deps || {};

  function bindAiRoutineButtons(container, role) {
    container?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest(".ai-routine-btn");
      if (!(button instanceof HTMLElement)) return;
      const prompt = String(button.getAttribute("data-ai-prompt") || "").trim();
      if (!prompt) return;
      setBusinessAiPrompt?.(role, prompt);
      openBusinessAiChatPopup?.(role, { focusInput: false });
      if (role === "admin") {
        adminCopilotForm?.requestSubmit();
      } else {
        subscriberCopilotForm?.requestSubmit();
      }
    });
  }

  function bindAiLaunchControls({ subscriberAiQuickRoutines, adminAiQuickRoutines } = {}) {
    customerLexiLaunchBtn?.addEventListener("click", () => {
      openCustomerLexiPopup?.();
    });

    customerLexiLaunchBookingBtn?.addEventListener("click", () => {
      queueCustomerLexiPrompt?.("Help me book this week.");
      openCustomerLexiPopup?.();
    });

    bindAiRoutineButtons(subscriberAiQuickRoutines, "subscriber");
    bindAiRoutineButtons(adminAiQuickRoutines, "admin");
  }

  return {
    bindAiLaunchControls
  };
}
