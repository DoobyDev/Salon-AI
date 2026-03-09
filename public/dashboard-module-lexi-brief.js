// Lexi question + brief model helpers for module popups.
export function createModuleLexiBriefRuntime({
  modulePopupSnapshotItems,
  moduleLexiNarrativeProfile,
  moduleOpsCategoryLabel,
  loadHubAutoRoutinePrefs
}) {
  function moduleLexiAssistQuestion(mod, blueprint) {
    if (!mod) return "Review this module and tell me the best next actions.";
    const snapshots = modulePopupSnapshotItems(mod).filter(Boolean).slice(0, 2);
    const custom = moduleLexiNarrativeProfile(mod, blueprint, snapshots);
    if (custom?.askPrompt) return String(custom.askPrompt).trim();
    const focus = String(blueprint?.focus || "").trim();
    const nextStep = String(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps[0] || "" : "").trim();
    const parts = [
      `Review my ${mod.label} module for today.`,
      focus ? `Focus on: ${focus}` : "",
      snapshots.length ? `Current signals: ${snapshots.join(" ? ")}` : "",
      nextStep ? `Give me the best next actions and quick wins, starting with: ${nextStep}` : "Give me the best next actions and quick wins."
    ].filter(Boolean);
    return parts.join(" ");
  }

  function buildModuleLexiBriefModel(mod, blueprint) {
    if (!mod) return null;
    const snapshots = modulePopupSnapshotItems(mod).filter(Boolean).slice(0, 4);
    const customNarrative = moduleLexiNarrativeProfile(mod, blueprint, snapshots);
    const category = moduleOpsCategoryLabel(mod);
    const autoPrefs = loadHubAutoRoutinePrefs();
    const key = String(mod.key || "").trim();
    const monitorOn = autoPrefs[`${key}:monitor`] !== false;
    const prepOn = autoPrefs[`${key}:prep`] === true;
    const reportOn = autoPrefs[`${key}:report`] !== false;
    const features = Array.isArray(mod.features) ? mod.features.filter(Boolean).slice(0, 3) : [];
    const nextSteps = Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps.filter(Boolean).slice(0, 3) : [];
    const roleSummary = String(customNarrative?.roleSummary || mod.navSummary || mod.howItWorks || mod.howItHelps || "Supports a key part of day-to-day salon operations.").trim();
    const impactSummary = String(customNarrative?.impactSummary || mod.howItHelps || "Helps the business run more consistently with less manual admin.").trim();
    const statusTone = snapshots.some((line) => /waiting|not set|none|unavailable/i.test(line))
      ? "attention"
      : snapshots.length
        ? "active"
        : "baseline";
    const statusLabel = statusTone === "attention"
      ? "Needs setup / review"
      : statusTone === "active"
        ? "Live and contributing"
        : "Ready to activate";
    return {
      category,
      roleSummary,
      impactSummary,
      statusTone,
      statusLabel,
      snapshots,
      features,
      nextSteps,
      lexiNow: [
        ...(Array.isArray(customNarrative?.lexiNow) && customNarrative.lexiNow.length
          ? customNarrative.lexiNow.slice(0, 1)
          : [blueprint?.focus ? `Priority focus: ${blueprint.focus}` : `Priority focus: Keep ${mod.label} moving with exception-first review.`]),
        `Automation: Monitor ${monitorOn ? "On" : "Off"} ? Prep ${prepOn ? "On" : "Off"} ? Report ${reportOn ? "On" : "Off"}`,
        ...(Array.isArray(customNarrative?.lexiNow) && customNarrative.lexiNow.length > 1
          ? customNarrative.lexiNow.slice(1, 3)
          : [nextSteps[0] ? `Next task: ${nextSteps[0]}` : "Next task: Open the workspace and complete the highest-impact action first."])
      ].filter(Boolean).slice(0, 3),
      cadence: String(mod.cadence || "Use daily").trim(),
      confidence: Number(blueprint?.confidence || 90),
      modeLabel: String(blueprint?.modeLabel || "AI assist").trim()
    };
  }

  return {
    moduleLexiAssistQuestion,
    buildModuleLexiBriefModel
  };
}
