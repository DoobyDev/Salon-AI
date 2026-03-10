import { describe, expect, it } from "vitest";
import { createModuleGroupingRuntime } from "../public/dashboard-module-groups.js";

describe("module grouping runtime", () => {
  it("assigns modules to expected navigator groups", () => {
    const runtime = createModuleGroupingRuntime({
      getModulesForRole: () => [],
      getRole: () => "subscriber"
    });

    expect(runtime.moduleGroupForRole({ key: "calendar" })).toBe("Home");
    expect(runtime.moduleGroupForRole({ key: "crm" })).toBe("Growth");
    expect(runtime.moduleGroupForRole({ key: "profitability" })).toBe("Finance");
    expect(runtime.moduleGroupForRole({ key: "unknown_mod" })).toBe("Modules");
  });

  it("groups current-role modules in the expected order and hides navigator-hidden items", () => {
    const runtime = createModuleGroupingRuntime({
      getModulesForRole: () => [
        { key: "calendar" },
        { key: "crm" },
        { key: "profitability" },
        { key: "subscriber_copilot" },
        { key: "hidden_mod", hideInNavigator: true }
      ],
      getRole: () => "subscriber"
    });

    expect(runtime.groupedModulesForCurrentRole()).toEqual([
      { group: "Home", modules: [{ key: "calendar" }] },
      { group: "Growth", modules: [{ key: "crm" }] },
      { group: "Finance", modules: [{ key: "profitability" }] }
    ]);
    expect(runtime.formatModuleGroupHeading("Finance")).toBe("Finance");
    expect(runtime.formatModuleGroupHeading("")).toBe("MODULES");
  });
});
