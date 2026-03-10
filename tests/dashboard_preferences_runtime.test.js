import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDashboardPreferencesRuntime } from "../public/dashboard-preferences-runtime.js";

describe("dashboard preferences runtime", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalLocalStorage = globalThis.localStorage;
  const originalSessionStorage = globalThis.sessionStorage;

  beforeEach(() => {
    globalThis.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    globalThis.sessionStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };
    globalThis.window = {
      clearTimeout: vi.fn(),
      setTimeout: vi.fn((fn) => {
        fn();
        return 1;
      }),
      location: {
        href: "https://app.example.com/dashboard?mock=1"
      }
    };
    globalThis.document = {
      body: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        dataset: {}
      }
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.localStorage = originalLocalStorage;
    globalThis.sessionStorage = originalSessionStorage;
    vi.restoreAllMocks();
  });

  it("writes action status, auto-clears it, and manages demo-fill preference", () => {
    let demoFillEnabled = false;
    const dashActionStatus = { textContent: "", style: {} };
    const demoModeToggle = {};
    const hideSection = vi.fn();

    const runtime = createDashboardPreferencesRuntime({
      dashActionStatus,
      demoModeToggle,
      hideSection,
      currentRole: "subscriber",
      demoFillSessionKey: "demoFillSession",
      demoFillModeStorageKey: "demoFillMode",
      getDashboardDemoFillModeEnabled: () => demoFillEnabled,
      setDashboardDemoFillModeEnabled: (value) => {
        demoFillEnabled = value;
      },
      isMockMode: false,
      token: "token_1",
      userRaw: '{"role":"subscriber"}',
      getManagedBusinessId: () => ""
    });

    runtime.setDashActionStatus("Saved.", false, 1000);
    expect(dashActionStatus.textContent).toBe("");

    runtime.setDashboardDemoFillPreference(true);
    expect(demoFillEnabled).toBe(true);
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("demoFillSession:subscriber", "on");
    expect(hideSection).toHaveBeenCalledWith(demoModeToggle);
  });

  it("loads demo preference, reports active demo mode, and navigates mock URLs", () => {
    let demoFillEnabled = false;
    globalThis.sessionStorage.getItem = vi.fn(() => "on");

    const runtime = createDashboardPreferencesRuntime({
      dashActionStatus: { textContent: "", style: {} },
      demoModeToggle: {},
      hideSection: vi.fn(),
      currentRole: "admin",
      demoFillSessionKey: "demoFillSession",
      demoFillModeStorageKey: "demoFillMode",
      getDashboardDemoFillModeEnabled: () => demoFillEnabled,
      setDashboardDemoFillModeEnabled: (value) => {
        demoFillEnabled = value;
      },
      isMockMode: false,
      token: "token_1",
      userRaw: '{"role":"admin"}',
      getManagedBusinessId: () => "biz_2"
    });

    expect(runtime.loadDashboardDemoFillPreference()).toBe(true);
    expect(runtime.isDashboardDemoDataModeActive()).toBe(false);

    runtime.navigateWithDemoMode(true);
    expect(globalThis.window.location.href).toContain("mock=1");
    expect(globalThis.window.location.href).toContain("role=admin");
    expect(globalThis.window.location.href).toContain("businessId=biz_2");
  });

  it("forces light-mode dashboard density", () => {
    const runtime = createDashboardPreferencesRuntime({
      dashActionStatus: { textContent: "", style: {} },
      demoModeToggle: {},
      hideSection: vi.fn(),
      currentRole: "subscriber",
      demoFillSessionKey: "demoFillSession",
      demoFillModeStorageKey: "demoFillMode",
      getDashboardDemoFillModeEnabled: () => false,
      setDashboardDemoFillModeEnabled: vi.fn(),
      isMockMode: false,
      token: "token_1",
      userRaw: '{"role":"subscriber"}',
      getManagedBusinessId: () => ""
    });

    runtime.initializeUiDensity();

    expect(globalThis.document.body.classList.add).toHaveBeenCalledWith("dashboard-light-mode");
    expect(globalThis.document.body.classList.remove).toHaveBeenCalledWith("theme-vibrant");
    expect(globalThis.document.body.dataset.theme).toBe("classic");
    expect(globalThis.document.body.dataset.themeMode).toBe("light");
  });
});
