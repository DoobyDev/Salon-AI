import { describe, expect, it, vi } from "vitest";
import { createDashboardSessionControlsRuntime } from "../public/dashboard-session-controls.js";

function createElement() {
  return {
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    }
  };
}

describe("dashboard session controls runtime", () => {
  it("toggles manage mode for manager roles and reports status", async () => {
    let manageModeEnabled = false;
    const showManageToast = vi.fn();
    const manageModeToggle = createElement();

    const runtime = createDashboardSessionControlsRuntime({
      win: { addEventListener: vi.fn(), clearInterval: vi.fn() },
      isDashboardManagerRole: () => true,
      getManageModeEnabled: () => manageModeEnabled,
      setManageMode: (value) => {
        manageModeEnabled = value;
      },
      showManageToast,
      setDashActionStatus: vi.fn(),
      getAccountingLiveTimerId: () => null,
      setAccountingLiveTimerId: vi.fn(),
      manageModeToggle,
      demoModeToggle: createElement()
    });

    runtime.bindDashboardSessionControls();
    await manageModeToggle.dispatch("click");

    expect(manageModeEnabled).toBe(true);
    expect(showManageToast).toHaveBeenCalledWith("Edit Mode enabled.");
  });

  it("reports removed demo mode and clears live timer on beforeunload", async () => {
    let timerId = 42;
    const setDashActionStatus = vi.fn();
    const demoModeToggle = createElement();
    let beforeUnloadHandler = null;
    const clearInterval = vi.fn();

    const runtime = createDashboardSessionControlsRuntime({
      win: {
        addEventListener: vi.fn((type, handler) => {
          if (type === "beforeunload") beforeUnloadHandler = handler;
        }),
        clearInterval
      },
      isDashboardManagerRole: () => false,
      getManageModeEnabled: () => false,
      setManageMode: vi.fn(),
      showManageToast: vi.fn(),
      setDashActionStatus,
      getAccountingLiveTimerId: () => timerId,
      setAccountingLiveTimerId: (value) => {
        timerId = value;
      },
      manageModeToggle: createElement(),
      demoModeToggle
    });

    runtime.bindDashboardSessionControls();
    await demoModeToggle.dispatch("click");

    expect(setDashActionStatus).toHaveBeenCalledWith("Demo Mode has been removed from dashboards.", true);

    beforeUnloadHandler?.();
    expect(clearInterval).toHaveBeenCalledWith(42);
    expect(timerId).toBe(null);
  });
});
