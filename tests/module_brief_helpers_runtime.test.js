import { describe, expect, it } from "vitest";
import { getModuleOperatorBlueprint } from "../public/dashboard-module-operator-blueprint.js";
import { createModuleLexiBriefRuntime } from "../public/dashboard-module-lexi-brief.js";

describe("module operator blueprint", () => {
  it("returns role-aware defaults and module-specific quick actions", () => {
    const customerBlueprint = getModuleOperatorBlueprint({ key: "calendar", label: "Calendar" }, "customer");
    const recoveryBlueprint = getModuleOperatorBlueprint({ key: "service_recovery_playbook", label: "Recovery" }, "subscriber");
    const referralBlueprint = getModuleOperatorBlueprint({ key: "referrals_partnerships", label: "Referrals" }, "admin");

    expect(customerBlueprint.modeLabel).toBe("Guided booking");
    expect(customerBlueprint.quickActions[0].id).toBe("open_module");

    expect(recoveryBlueprint.focus).toContain("Handle issues quickly");
    expect(recoveryBlueprint.quickActions.map((item) => item.id)).toEqual(["draft_recovery_message", "copy_playbook"]);

    expect(referralBlueprint.quickActions[1]).toEqual(
      expect.objectContaining({ id: "open_related_module", moduleKey: "crm" })
    );
  });

  it("falls back to shared defaults when a module has no custom blueprint", () => {
    const genericBlueprint = getModuleOperatorBlueprint({ key: "custom_module", label: "Custom" }, "subscriber");

    expect(genericBlueprint.confidence).toBe(94);
    expect(genericBlueprint.modeLabel).toBe("Autopilot assist");
    expect(genericBlueprint.quickActions).toEqual([
      { id: "simulate_ai_run", label: "Run AI Routine", variant: "primary" },
      { id: "open_module", label: "Open Working View", variant: "ghost" }
    ]);
  });
});

describe("module Lexi brief runtime", () => {
  const runtime = createModuleLexiBriefRuntime({
    modulePopupSnapshotItems: () => ["2 alerts", "Waitlist active", "Bookings stable"],
    moduleLexiNarrativeProfile: (mod) => {
      if (mod.key === "waitlist") {
        return {
          askPrompt: "Review my waitlist and tell me which slot to fill first.",
          roleSummary: "Keeps cancellations recoverable.",
          impactSummary: "Protects empty-chair time quickly.",
          lexiNow: ["Check today’s gaps first.", "Use the warmest lead before cold outreach."]
        };
      }
      return null;
    },
    moduleOpsCategoryLabel: (mod) => `Ops:${mod.key}`,
    loadHubAutoRoutinePrefs: () => ({
      "waitlist:monitor": true,
      "waitlist:prep": true,
      "waitlist:report": false
    })
  });

  it("builds custom Lexi assist prompts when a narrative profile provides one", () => {
    const question = runtime.moduleLexiAssistQuestion(
      { key: "waitlist", label: "Waitlist" },
      { focus: "Recover cancelled slots", nextSteps: ["Call warm leads"] }
    );

    expect(question).toBe("Review my waitlist and tell me which slot to fill first.");
  });

  it("builds fallback prompts and brief models from blueprint + snapshots", () => {
    const question = runtime.moduleLexiAssistQuestion(
      { key: "operations", label: "Operations" },
      { focus: "Reduce no-shows", nextSteps: ["Review today’s risk bookings"] }
    );
    const model = runtime.buildModuleLexiBriefModel(
      { key: "waitlist", label: "Waitlist", features: ["Stage recovery", "Contact clients"], cadence: "Use hourly" },
      { focus: "Recover cancelled slots", nextSteps: ["Call warm leads"], confidence: 93, modeLabel: "AI assist" }
    );

    expect(question).toContain("Review my Operations module for today.");
    expect(question).toContain("Current signals: 2 alerts ? Waitlist active");
    expect(model.category).toBe("Ops:waitlist");
    expect(model.statusLabel).toBe("Live and contributing");
    expect(model.features).toEqual(["Stage recovery", "Contact clients"]);
    expect(model.lexiNow).toContain("Automation: Monitor On ? Prep On ? Report Off");
    expect(model.confidence).toBe(93);
    expect(model.cadence).toBe("Use hourly");
  });
});
