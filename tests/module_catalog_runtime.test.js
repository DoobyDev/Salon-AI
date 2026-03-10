import { describe, expect, it } from "vitest";
import { createModuleCatalogRuntime } from "../public/dashboard-module-catalog.js";

describe("module catalog runtime", () => {
  it("looks up module definitions by key", () => {
    const runtime = createModuleCatalogRuntime({
      getModules: () => [
        { key: "calendar", popupMode: "interactive" },
        { key: "finance", popupMode: "info" }
      ]
    });

    expect(runtime.moduleDefinitionByKey("calendar")).toEqual({ key: "calendar", popupMode: "interactive" });
    expect(runtime.moduleDefinitionByKey("missing")).toBe(null);
  });

  it("reports interactive vs info popup modes", () => {
    const runtime = createModuleCatalogRuntime({
      getModules: () => []
    });

    expect(runtime.moduleUsesInteractivePopup({ popupMode: "interactive" })).toBe(true);
    expect(runtime.moduleUsesInteractivePopup({ popupMode: "info" })).toBe(false);
    expect(runtime.moduleUsesInfoPopup({ popupMode: "info" })).toBe(true);
    expect(runtime.moduleUsesInfoPopup({ popupMode: "interactive" })).toBe(false);
  });
});
