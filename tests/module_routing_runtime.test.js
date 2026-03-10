import { describe, expect, it } from "vitest";
import { createModuleRoutingRuntime } from "../public/dashboard-module-routing.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.classList = {
      contains: (name) => Boolean(initial.classes?.includes(name))
    };
    Object.assign(this, initial);
  }
}

globalThis.HTMLElement = FakeHTMLElement;

describe("module routing runtime", () => {
  it("identifies popup-only business module keys", () => {
    const runtime = createModuleRoutingRuntime({
      getRole: () => "subscriber"
    });

    expect(runtime.isPopupOnlyBusinessModuleKey("accounting")).toBe(true);
    expect(runtime.isPopupOnlyBusinessModuleKey("calendar")).toBe(false);
  });

  it("detects popup-mounted sections and pinned modules by role", () => {
    const subscriberRuntime = createModuleRoutingRuntime({
      getRole: () => "subscriber"
    });
    const adminRuntime = createModuleRoutingRuntime({
      getRole: () => "admin"
    });

    expect(subscriberRuntime.isPopupMountedBusinessSection(new FakeHTMLElement({ classes: ["module-popup-mounted"] }))).toBe(true);
    expect(subscriberRuntime.isPopupMountedBusinessSection(new FakeHTMLElement({ classes: [] }))).toBe(false);
    expect(subscriberRuntime.isPinnedBusinessModule({ key: "calendar" })).toBe(true);
    expect(subscriberRuntime.isPinnedBusinessModule({ key: "admin_copilot" })).toBe(false);
    expect(adminRuntime.isPinnedBusinessModule({ key: "admin_copilot" })).toBe(true);
  });
});
