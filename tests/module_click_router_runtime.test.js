import { describe, expect, it, vi } from "vitest";
import { createModuleClickRouterRuntime } from "../public/dashboard-module-click-router.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.attrs = {};
    Object.assign(this, initial);
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createEventTarget({ back = null, hubPopup = null, moduleJump = null, modulePopup = null } = {}) {
  return new FakeHTMLElement({
    closest(selector) {
      if (selector === "#workspaceBackToDashboardBtn") return back;
      if (selector === "[data-business-hub-popup]") return hubPopup;
      if (selector === "[data-module-jump]") return moduleJump;
      if (selector === "[data-module-popup]") return modulePopup;
      return null;
    }
  });
}

describe("module click router runtime", () => {
  it("routes back-button and business-hub popup clicks", () => {
    let clickHandler = null;
    const returnToDashboardHomeView = vi.fn();
    const openBusinessHubModulePopup = vi.fn();

    const doc = {
      addEventListener(type, handler) {
        if (type === "click") clickHandler = handler;
      }
    };

    const runtime = createModuleClickRouterRuntime({
      doc,
      returnToDashboardHomeView,
      openBusinessHubModulePopup
    });

    runtime.bindModuleClickRouter();

    clickHandler?.({
      target: createEventTarget({
        back: new FakeHTMLElement()
      })
    });
    expect(returnToDashboardHomeView).toHaveBeenCalled();

    const hubPopupTrigger = new FakeHTMLElement();
    hubPopupTrigger.setAttribute("data-business-hub-popup", "growth");
    clickHandler?.({
      target: createEventTarget({
        hubPopup: hubPopupTrigger
      })
    });
    expect(openBusinessHubModulePopup).toHaveBeenCalledWith("growth");
  });

  it("routes popup triggers through interactive, info, and standard module flows", () => {
    let clickHandler = null;
    const interactiveMod = { key: "accounting" };
    const infoMod = { key: "reviews_reputation" };
    const standardMod = { key: "calendar" };
    const openInteractiveModulePopup = vi.fn();
    const openModuleInfoModal = vi.fn();
    const focusModuleByKey = vi.fn();

    const runtime = createModuleClickRouterRuntime({
      doc: {
        addEventListener(type, handler) {
          if (type === "click") clickHandler = handler;
        }
      },
      moduleDefinitionByKey: (key) => {
        if (key === "accounting") return interactiveMod;
        if (key === "reviews_reputation") return infoMod;
        if (key === "calendar") return standardMod;
        return null;
      },
      moduleUsesInteractivePopup: (mod) => mod === interactiveMod,
      moduleUsesInfoPopup: (mod) => mod === infoMod,
      openInteractiveModulePopup,
      openModuleInfoModal,
      focusModuleByKey
    });

    runtime.bindModuleClickRouter();

    const interactiveTrigger = new FakeHTMLElement();
    interactiveTrigger.setAttribute("data-module-popup", "accounting");
    clickHandler?.({ target: createEventTarget({ modulePopup: interactiveTrigger }) });
    expect(openInteractiveModulePopup).toHaveBeenCalledWith("accounting");

    const infoTrigger = new FakeHTMLElement();
    infoTrigger.setAttribute("data-module-popup", "reviews_reputation");
    clickHandler?.({ target: createEventTarget({ modulePopup: infoTrigger }) });
    expect(openModuleInfoModal).toHaveBeenCalledWith("reviews_reputation");

    const standardTrigger = new FakeHTMLElement();
    standardTrigger.setAttribute("data-module-popup", "calendar");
    clickHandler?.({ target: createEventTarget({ modulePopup: standardTrigger }) });
    expect(focusModuleByKey).toHaveBeenCalledWith("calendar");
  });

  it("updates workspace back-button state for quick actions and still focuses the selected module", () => {
    let clickHandler = null;
    const setWorkspaceBackButtonVisible = vi.fn();
    const openInteractiveModulePopup = vi.fn();
    const focusModuleByKey = vi.fn();

    const jumpTrigger = new FakeHTMLElement();
    jumpTrigger.setAttribute("data-module-jump", "calendar");

    const homeTrigger = new FakeHTMLElement();
    homeTrigger.setAttribute("data-module-jump", "home");

    const popupJumpTrigger = new FakeHTMLElement();
    popupJumpTrigger.setAttribute("data-module-jump", "waitlist");

    const dashboardQuickActionsSection = {
      contains(node) {
        return node === jumpTrigger || node === homeTrigger || node === popupJumpTrigger;
      }
    };

    const runtime = createModuleClickRouterRuntime({
      doc: {
        addEventListener(type, handler) {
          if (type === "click") clickHandler = handler;
        }
      },
      dashboardQuickActionsSection,
      moduleDefinitionByKey: (key) => (key ? { key } : null),
      moduleUsesInteractivePopup: (mod) => mod.key === "waitlist",
      moduleUsesInfoPopup: () => false,
      openInteractiveModulePopup,
      setWorkspaceBackButtonVisible,
      focusModuleByKey
    });

    runtime.bindModuleClickRouter();

    clickHandler?.({ target: createEventTarget({ moduleJump: jumpTrigger }) });
    expect(setWorkspaceBackButtonVisible).toHaveBeenCalledWith(true);
    expect(focusModuleByKey).toHaveBeenCalledWith("calendar");

    clickHandler?.({ target: createEventTarget({ moduleJump: homeTrigger }) });
    expect(setWorkspaceBackButtonVisible).toHaveBeenLastCalledWith(false);

    clickHandler?.({ target: createEventTarget({ moduleJump: popupJumpTrigger }) });
    expect(openInteractiveModulePopup).toHaveBeenCalledWith("waitlist");
  });
});
