import { createSharedAskLexiPopup } from "./shared-ask-lexi-popup.js";
import { buildPrimaryAskLexiPopupOptions } from "./shared-ask-lexi-presets.js";

const headerAskLexiBtn = document.getElementById("headerAskLexiBtn");
const role = String(document.body?.getAttribute("data-role") || "").trim().toLowerCase();

const popup = createSharedAskLexiPopup(
  buildPrimaryAskLexiPopupOptions({
    triggerButtons: [headerAskLexiBtn],
    source: role === "customer" ? "dashboard-customer" : "dashboard-subscriber",
    role
  })
);

let pendingPrompt = "";

function openDashboardSharedLexiPopup(options = {}) {
  const trigger = options?.trigger instanceof HTMLElement ? options.trigger : null;
  const prompt = String(options?.prompt || "").trim();
  pendingPrompt = prompt;
  popup.open("", trigger);
  popup.setInputValue(prompt);
}

function submitDashboardSharedLexiPrompt() {
  const prompt = String(pendingPrompt || popup.getInputValue() || "").trim();
  if (!prompt) return;
  pendingPrompt = "";
  popup.setInputValue("");
  popup.sendMessage(prompt);
}

function resetDashboardSharedLexiPopup(initialMessage = "") {
  pendingPrompt = "";
  popup.reset(initialMessage);
}

window.openDashboardSharedLexiPopup = openDashboardSharedLexiPopup;
window.submitDashboardSharedLexiPrompt = submitDashboardSharedLexiPrompt;
window.resetDashboardSharedLexiPopup = resetDashboardSharedLexiPopup;
