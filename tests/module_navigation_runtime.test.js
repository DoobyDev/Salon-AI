import { afterEach, describe, expect, it, vi } from "vitest";
import { createModuleNavigationRuntime } from "../public/dashboard-module-navigation.js";

class FakeClassList {
  constructor() {
    this.remove = vi.fn();
    this.add = vi.fn();
  }
}

class FakeSection {
  constructor() {
    this.classList = new FakeClassList();
    this.scrollIntoView = vi.fn();
    this.offsetWidth = 0;
  }
}

describe("module navigation runtime", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  it("focuses modules, returns home, and applies section visibility", async () => {
    let activeModuleKey = "";
    const homeSection = new FakeSection();
    const calendarSection = new FakeSection();
    const financeSection = new FakeSection();
    const markModuleUsed = vi.fn();
    const openInteractiveModulePopup = vi.fn();
    const hideSection = vi.fn();
    const showSection = vi.fn();
    const renderModuleNavigator = vi.fn();
    const renderBusinessHubCards = vi.fn();

    globalThis.window = {
      setTimeout: vi.fn((fn) => fn())
    };
    globalThis.document = {
      getElementById: vi.fn((id) => {
        if (id === "businessGrowthSection") return homeSection;
        if (id === "dashboardOverviewSection") return calendarSection;
        return null;
      })
    };

    const groupedModules = [
      {
        group: "Home",
        modules: [
          { key: "home", section: homeSection, startHere: true },
          { key: "calendar", section: calendarSection }
        ]
      },
      {
        group: "Finance",
        modules: [
          { key: "finance", section: financeSection }
        ]
      }
    ];

    const runtime = createModuleNavigationRuntime({
      getUserRole: () => "subscriber",
      getActiveModuleKey: () => activeModuleKey,
      setActiveModuleKey: (value) => {
        activeModuleKey = value;
      },
      groupedModulesForCurrentRole: () => groupedModules,
      markModuleUsed,
      isPopupOnlyBusinessModuleKey: (key) => key === "finance",
      openInteractiveModulePopup,
      hideSection,
      showSection,
      isPinnedBusinessModule: (mod) => mod.key === "calendar",
      renderModuleNavigator,
      renderBusinessHubCards,
      setWorkspaceBackButtonVisible: vi.fn(),
      workspaceBackToDashboardBtn: null,
      dashboardQuickActionsSection: homeSection,
      getManageModeEnabled: () => true,
      showManageToast: vi.fn(),
      getManagedBusinessId: () => "biz_1",
      getUserBusinessId: () => "biz_1",
      openManageForm: vi.fn(),
      createBooking: vi.fn(),
      refreshBookingsAfterDayPopupMutation: vi.fn(),
      todayDateKeyLocal: () => "2026-03-10"
    });

    runtime.initializeModuleNavigator();
    expect(activeModuleKey).toBe("home");
    expect(renderBusinessHubCards).toHaveBeenCalled();

    runtime.focusModuleByKey("calendar");
    expect(markModuleUsed).toHaveBeenCalledWith("calendar", "focus");
    expect(activeModuleKey).toBe("calendar");
    expect(calendarSection.scrollIntoView).toHaveBeenCalled();

    runtime.focusModuleByKey("finance");
    expect(openInteractiveModulePopup).toHaveBeenCalledWith("finance");

    runtime.returnToDashboardHomeView();
    expect(homeSection.scrollIntoView).toHaveBeenCalled();
    expect(renderModuleNavigator).toHaveBeenCalled();
    expect(showSection).toHaveBeenCalled();
    expect(hideSection).toHaveBeenCalled();
  });

  it("opens mobile quick booking only in manage mode with a business selected", async () => {
    const focusModuleByKey = vi.fn();
    const showManageToast = vi.fn();
    const createBooking = vi.fn().mockResolvedValue(undefined);
    const refreshBookingsAfterDayPopupMutation = vi.fn().mockResolvedValue(undefined);
    const openManageForm = vi.fn().mockResolvedValue({
      customerName: "Morgan Blake",
      customerPhone: "+447700900123",
      service: "Cut",
      date: "2026-03-10",
      time: "10:00"
    });

    globalThis.window = { setTimeout: vi.fn() };
    globalThis.document = { getElementById: vi.fn() };

    const runtime = createModuleNavigationRuntime({
      getUserRole: () => "subscriber",
      getActiveModuleKey: () => "home",
      setActiveModuleKey: vi.fn(),
      groupedModulesForCurrentRole: () => [],
      markModuleUsed: vi.fn(),
      isPopupOnlyBusinessModuleKey: () => false,
      openInteractiveModulePopup: vi.fn(),
      hideSection: vi.fn(),
      showSection: vi.fn(),
      isPinnedBusinessModule: vi.fn(),
      renderModuleNavigator: vi.fn(),
      renderBusinessHubCards: vi.fn(),
      setWorkspaceBackButtonVisible: vi.fn(),
      workspaceBackToDashboardBtn: null,
      dashboardQuickActionsSection: null,
      getManageModeEnabled: () => true,
      showManageToast,
      getManagedBusinessId: () => "biz_1",
      getUserBusinessId: () => "biz_1",
      openManageForm,
      createBooking,
      refreshBookingsAfterDayPopupMutation,
      todayDateKeyLocal: () => "2026-03-10",
      focusModuleByKey
    });

    await runtime.openQuickCreateBookingFromMobile();

    expect(openManageForm).toHaveBeenCalled();
    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: "biz_1",
        service: "Cut"
      })
    );
    expect(refreshBookingsAfterDayPopupMutation).toHaveBeenCalled();
    expect(showManageToast).toHaveBeenCalledWith("Booking created.");
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });
});
