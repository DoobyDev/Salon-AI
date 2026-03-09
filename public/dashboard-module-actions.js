// Module action handlers for Lexi launch and operator quick actions.
export function createModuleActionRuntime(deps) {
  const {
    getUserRole,
    moduleOperatorBlueprint,
    moduleLexiAssistQuestion,
    copilotPopupRefs,
    openBusinessAiChatPopup,
    resetCopilotChat,
    setDashActionStatus,
    setWorkspaceBackButtonVisible,
    focusModuleByKey,
    writeToClipboard,
    showManageToast
  } = deps || {};

  function openLexiModuleAssist(mod, options = {}) {
    const roleValue = String(getUserRole?.() || "").trim().toLowerCase();
    if (!mod || !(roleValue === "subscriber" || roleValue === "admin")) return;
    const role = roleValue === "admin" ? "admin" : "subscriber";
    const blueprint = options.blueprint || moduleOperatorBlueprint?.(mod);
    const refs = copilotPopupRefs?.(role) || {};
    const suggested = String(options.question || moduleLexiAssistQuestion?.(mod, blueprint) || "").trim();
    if (refs.input) {
      refs.input.value = "";
      refs.input.placeholder = `Ask Lexi about ${mod.label}...`;
      refs.input.setAttribute("data-lexi-suggested-question", suggested);
    }
    openBusinessAiChatPopup?.(role, { trigger: options.trigger, focusInput: true });
    resetCopilotChat?.(role, "Hi, what can I help you with?");
    setDashActionStatus?.(`Lexi chat opened for ${mod.label}. Close Lexi to return to this module popup.`);
  }

  async function runModuleOperatorAction(actionId, mod, options = {}) {
    const action = String(actionId || "").trim();
    if (!action || !mod) return;
    const blueprint = options.blueprint || moduleOperatorBlueprint?.(mod);
    const label = mod.label || "Module";

    if (action === "open_module") {
      setWorkspaceBackButtonVisible?.(mod.key !== "home");
      focusModuleByKey?.(mod.key);
      options.close?.();
      return;
    }
    if (action === "open_related_module") {
      const targetKey = String(options.moduleKey || "").trim() || "home";
      setWorkspaceBackButtonVisible?.(targetKey !== "home");
      focusModuleByKey?.(targetKey);
      options.close?.();
      return;
    }

    const cannedMessages = {
      simulate_ai_run: `${label}: AI routine prepared a prioritized action plan and flagged only exceptions.`,
      simulate_opening: `${label}: Opening setup run completed. Team readiness, bookings, and priority checks are ready.`,
      simulate_closing: `${label}: Closing routine staged. Cash-up, diary review, and handover reminders prepared.`,
      draft_recovery_message: `${label}: Recovery message drafted with apology, rebooking option, and follow-up note.`,
      copy_playbook: `${label}: Recovery playbook copied for quick use.`,
      draft_review_response: `${label}: Review response drafted in a calm, professional tone.`,
      queue_review_requests: `${label}: Review request queue prepared for completed happy clients.`,
      generate_referral_offer: `${label}: Referral offer draft generated with local-partner variant.`,
      simulate_forecast: `${label}: Forecast run complete. Short-term pressure dates and actions highlighted.`,
      simulate_reconcile: `${label}: Reconciliation scan complete. Mismatch checks and review points prepared.`
    };

    if (action === "copy_playbook") {
      const text = [
        `${label} - AI Playbook`,
        ...(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps : []),
        "",
        `Focus: ${blueprint?.focus || ""}`,
        `Impact: ${blueprint?.impact || ""}`
      ].join("\n");
      const copied = await writeToClipboard?.(text);
      showManageToast?.(copied ? "Playbook copied." : "Clipboard unavailable.", copied ? undefined : "error");
      setDashActionStatus?.(copied ? "Playbook copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
      return;
    }

    const msg = cannedMessages[action] || `${label}: AI assistant prepared the next best actions for this workflow.`;
    setDashActionStatus?.(msg);
    showManageToast?.(msg.length > 96 ? `${label}: AI routine ready.` : msg);
  }

  return {
    openLexiModuleAssist,
    runModuleOperatorAction
  };
}
