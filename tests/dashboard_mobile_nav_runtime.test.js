import { describe, expect, it, vi } from "vitest";
import { createDashboardMobileNavRuntime } from "../public/dashboard-mobile-nav.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    this.attrs = {};
    this.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn()
    };
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  async dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  focus() {
    this.focused = true;
  }
}

globalThis.HTMLElement = FakeHTMLElement;
globalThis.getComputedStyle = (element) => ({ display: element.display || "block" });

function createNavButton(section, { action = "", module = "", display = "block" } = {}) {
  return new FakeHTMLElement({
    attrs: {
      "data-mobile-nav-section": section,
      "data-mobile-nav-action": action,
      "data-mobile-nav-module": module
    },
    display
  });
}

describe("dashboard mobile nav runtime", () => {
  it("returns only visible mobile nav buttons and marks the active section", () => {
    const overviewBtn = createNavButton("dashboardOverviewSection");
    const calendarBtn = createNavButton("subscriberCalendarSection");
    const hiddenBtn = createNavButton("bookingOperationsSection", { display: "none" });
    const mobileBottomNav = new FakeHTMLElement({
      querySelectorAll() {
        return [overviewBtn, calendarBtn, hiddenBtn];
      }
    });

    const runtime = createDashboardMobileNavRuntime({
      doc: { addEventListener: vi.fn(), getElementById: vi.fn() },
      win: {},
      mobileBottomNav,
      mobileQuickSheetOverlay: new FakeHTMLElement(),
      mobileQuickSheetClose: new FakeHTMLElement(),
      getCurrentRole: () => "subscriber",
      getUserRole: () => "subscriber",
      todayDateKeyLocal: () => "2026-03-10",
      openQuickCreateBookingFromMobile: vi.fn(),
      returnToDashboardHomeView: vi.fn(),
      focusModuleByKey: vi.fn(),
      openCalendarDayWorkspace: vi.fn(),
      openDashboardLexiForCurrentRole: vi.fn(),
      showManageToast: vi.fn()
    });

    expect(runtime.visibleMobileNavButtons()).toEqual([overviewBtn, calendarBtn]);

    runtime.setActiveMobileNavButtonBySection("subscriberCalendarSection");
    expect(calendarBtn.classList.toggle).toHaveBeenCalledWith("is-active", true);
    expect(overviewBtn.classList.toggle).toHaveBeenCalledWith("is-active", false);
  });

  it("handles quick-sheet actions for today, new booking, and copilot", async () => {
    const overlay = new FakeHTMLElement();
    const closeBtn = new FakeHTMLElement();
    const focusModuleByKey = vi.fn();
    const openCalendarDayWorkspace = vi.fn();
    const openQuickCreateBookingFromMobile = vi.fn().mockResolvedValue(undefined);
    const openDashboardLexiForCurrentRole = vi.fn();
    const showManageToast = vi.fn();
    const mobileBottomNav = new FakeHTMLElement({
      querySelectorAll() {
        return [createNavButton("dashboardOverviewSection"), createNavButton("subscriberCalendarSection")];
      }
    });

    const runtime = createDashboardMobileNavRuntime({
      doc: {
        addEventListener: vi.fn(),
        getElementById: vi.fn(() => ({ scrollIntoView: vi.fn() }))
      },
      win: {
        setTimeout: vi.fn((fn) => fn())
      },
      mobileBottomNav,
      mobileQuickSheetOverlay: overlay,
      mobileQuickSheetClose: closeBtn,
      getCurrentRole: () => "subscriber",
      getUserRole: () => "subscriber",
      todayDateKeyLocal: () => "2026-03-10",
      openQuickCreateBookingFromMobile,
      returnToDashboardHomeView: vi.fn(),
      focusModuleByKey,
      openCalendarDayWorkspace,
      openDashboardLexiForCurrentRole,
      showManageToast
    });

    runtime.initializeMobileBottomNav();

    await overlay.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector !== "[data-mobile-quick-action]") return null;
          return new FakeHTMLElement({
            getAttribute(name) {
              return name === "data-mobile-quick-action" ? "today" : "";
            }
          });
        }
      })
    });
    expect(focusModuleByKey).toHaveBeenCalledWith("calendar");
    expect(openCalendarDayWorkspace).toHaveBeenCalledWith("2026-03-10");

    await overlay.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector !== "[data-mobile-quick-action]") return null;
          return new FakeHTMLElement({
            getAttribute(name) {
              return name === "data-mobile-quick-action" ? "new-booking" : "";
            }
          });
        }
      })
    });
    expect(openQuickCreateBookingFromMobile).toHaveBeenCalled();

    await overlay.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector !== "[data-mobile-quick-action]") return null;
          return new FakeHTMLElement({
            getAttribute(name) {
              return name === "data-mobile-quick-action" ? "copilot" : "";
            }
          });
        }
      })
    });
    expect(openDashboardLexiForCurrentRole).toHaveBeenCalledWith(null, "booking_diary");
    expect(showManageToast).not.toHaveBeenCalled();
  });

  it("routes direct bottom-nav clicks to modules and opens the quick sheet", async () => {
    const quickSheetBtn = createNavButton("", { action: "quick-sheet" });
    const bookingsBtn = createNavButton("bookingOperationsSection", { module: "booking_ops" });
    const mobileBottomNav = new FakeHTMLElement({
      querySelectorAll() {
        return [quickSheetBtn, bookingsBtn];
      }
    });
    const overlay = new FakeHTMLElement();
    const focusModuleByKey = vi.fn();

    const runtime = createDashboardMobileNavRuntime({
      doc: {
        addEventListener: vi.fn(),
        getElementById: vi.fn(() => ({ scrollIntoView: vi.fn() }))
      },
      win: {},
      mobileBottomNav,
      mobileQuickSheetOverlay: overlay,
      mobileQuickSheetClose: new FakeHTMLElement(),
      getCurrentRole: () => "subscriber",
      getUserRole: () => "subscriber",
      todayDateKeyLocal: () => "2026-03-10",
      openQuickCreateBookingFromMobile: vi.fn(),
      returnToDashboardHomeView: vi.fn(),
      focusModuleByKey,
      openCalendarDayWorkspace: vi.fn(),
      openDashboardLexiForCurrentRole: vi.fn(),
      showManageToast: vi.fn()
    });

    runtime.initializeMobileBottomNav();

    await mobileBottomNav.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          return selector === ".mobile-bottom-nav-item" ? quickSheetBtn : null;
        }
      })
    });
    expect(overlay.classList.add).toHaveBeenCalledWith("is-open");
    expect(overlay.attrs["aria-hidden"]).toBe("false");

    await mobileBottomNav.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          return selector === ".mobile-bottom-nav-item" ? bookingsBtn : null;
        }
      })
    });
    expect(focusModuleByKey).toHaveBeenCalledWith("booking_ops");
  });
});
