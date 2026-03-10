import { describe, expect, it, vi } from "vitest";
import { createModuleUsageRuntime } from "../public/dashboard-module-usage.js";

describe("module usage runtime", () => {
  it("tracks module opens/focuses by role and saves them in local storage", () => {
    const storage = {
      getItem: vi.fn(() => "{}"),
      setItem: vi.fn()
    };
    const runtime = createModuleUsageRuntime({
      getRole: () => "subscriber",
      storage
    });

    runtime.markModuleUsed("calendar", "open");

    expect(storage.setItem).toHaveBeenCalledWith(
      "dashboard:module-usage:v1:subscriber",
      expect.stringContaining("\"calendar\"")
    );
  });

  it("returns a friendly usage summary for untouched and previously used modules", () => {
    const recentIso = "2026-03-10T12:00:00.000Z";
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValueOnce("{}")
        .mockReturnValueOnce(JSON.stringify({
          calendar: {
            opens: 3,
            focuses: 1,
            lastMode: "open",
            lastUsedAt: recentIso
          }
        })),
      setItem: vi.fn()
    };

    const runtime = createModuleUsageRuntime({
      getRole: () => "admin",
      storage
    });

    expect(runtime.moduleUsageSummary({ key: "calendar" })).toEqual({
      label: "Not used yet",
      detail: "Open this popup to start using it today."
    });

    const summary = runtime.moduleUsageSummary({ key: "calendar" });
    expect(summary.label).toBe("3 popup opens");
    expect(summary.detail).toContain("Last used");
  });
});
