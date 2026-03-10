import { describe, expect, it, vi } from "vitest";
import { createBusinessHubRuntime } from "../public/dashboard-business-hub-popup.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
    this.className = "";
    this.attrs = {};
    this.listeners = {};
    this.ownerDocument = null;
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  removeEventListener(type) {
    delete this.listeners[type];
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  querySelector(selector) {
    return this.queryMap?.[selector] || null;
  }

  focus() {
    this.focused = true;
  }

  dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createShell(doc) {
  const closeIcon = new FakeHTMLElement();
  const closeBtn = new FakeHTMLElement();
  const lexiBtn = new FakeHTMLElement();
  const openBtn = new FakeHTMLElement();
  const shell = new FakeHTMLElement({
    ownerDocument: doc,
    queryMap: {
      ".module-info-close": closeIcon,
      ".hub-popup-close-btn": closeBtn,
      ".hub-popup-lexi-btn": lexiBtn,
      ".hub-popup-open-btn": openBtn
    }
  });

  return { shell, closeIcon, closeBtn, lexiBtn, openBtn };
}

describe("business hub popup runtime", () => {
  it("renders hub cards and opens popup actions for Lexi and module focus", () => {
    const grid = new FakeHTMLElement();
    const overlay = new FakeHTMLElement();
    const docListeners = {};
    const { shell, closeIcon, lexiBtn, openBtn } = createShell({
      addEventListener(type, handler) {
        docListeners[type] = handler;
      },
      removeEventListener(type) {
        delete docListeners[type];
      }
    });
    const markModuleUsed = vi.fn();
    const closePrevious = vi.fn();
    let activeClose = closePrevious;
    const setCloseModulePopupActive = vi.fn((value) => {
      activeClose = value;
    });
    const openLexiModuleAssist = vi.fn();
    const setWorkspaceBackButtonVisible = vi.fn();
    const focusModuleByKey = vi.fn();
    const moduleCard = {
      key: "growth",
      title: "Business Growth",
      kicker: "Growth",
      summary: "Track onboarding and growth",
      information: ["Onboarding progress"],
      jobs: ["Review weekly momentum"],
      outcomes: ["Keep growth visible"],
      mod: {
        key: "growth",
        features: ["Quick actions", "First-week metrics"]
      }
    };

    const runtime = createBusinessHubRuntime({
      doc: {
        createElement: vi.fn((tag) => {
          if (tag === "section") return shell;
          return new FakeHTMLElement();
        }),
        addEventListener(type, handler) {
          docListeners[type] = handler;
        },
        removeEventListener(type) {
          delete docListeners[type];
        }
      },
      businessHubCardsGrid: grid,
      getBusinessHubModules: () => [moduleCard],
      moduleDefinitionByKey: (key) => ({ key }),
      moduleOperationalStatus: () => ({ tone: "good", label: "Live" }),
      renderModuleStatusPill: () => '<span class="pill">Live</span>',
      escapeHtml: (value) => String(value || ""),
      markModuleUsed,
      ensureManageModalOverlay: () => overlay,
      getCloseModulePopupActive: () => activeClose,
      setCloseModulePopupActive,
      openLexiModuleAssist,
      setWorkspaceBackButtonVisible,
      focusModuleByKey
    });

    runtime.renderBusinessHubCards();

    expect(grid.children).toHaveLength(1);
    expect(grid.children[0].getAttribute("data-business-hub-key")).toBe("growth");

    grid.children[0].dispatch("click", {
      preventDefault() {},
      stopPropagation() {}
    });

    expect(closePrevious).toHaveBeenCalled();
    expect(markModuleUsed).toHaveBeenCalledWith("growth", "open");
    expect(overlay.style.display).toBe("flex");
    expect(shell.innerHTML).toContain("Business Growth");
    expect(closeIcon.focused).toBe(true);

    lexiBtn.dispatch("click");
    expect(openLexiModuleAssist).toHaveBeenCalledTimes(1);
    expect(openLexiModuleAssist.mock.calls[0][0]).toBe(moduleCard.mod);
    expect(openLexiModuleAssist.mock.calls[0][1].trigger).toBe(lexiBtn);

    openBtn.dispatch("click");
    expect(setWorkspaceBackButtonVisible).toHaveBeenCalledWith(true);
    expect(focusModuleByKey).toHaveBeenCalledWith("growth");
    expect(overlay.style.display).toBe("none");
    expect(setCloseModulePopupActive).toHaveBeenCalledWith(expect.any(Function));
  });

  it("closes the popup on escape and overlay click", () => {
    const overlay = new FakeHTMLElement();
    const docListeners = {};
    const { shell, closeBtn } = createShell({
      addEventListener(type, handler) {
        docListeners[type] = handler;
      },
      removeEventListener(type) {
        delete docListeners[type];
      }
    });

    let activeClose = null;
    const runtime = createBusinessHubRuntime({
      doc: {
        createElement: vi.fn(() => shell),
        addEventListener(type, handler) {
          docListeners[type] = handler;
        },
        removeEventListener(type) {
          delete docListeners[type];
        }
      },
      businessHubCardsGrid: new FakeHTMLElement(),
      getBusinessHubModules: () => [{
        key: "home",
        title: "Business Hub",
        kicker: "Hub",
        summary: "Summary",
        mod: { key: "home", features: [] }
      }],
      moduleDefinitionByKey: (key) => ({ key }),
      moduleOperationalStatus: () => ({ tone: "setup", label: "Setup" }),
      renderModuleStatusPill: () => "",
      escapeHtml: (value) => String(value || ""),
      markModuleUsed: vi.fn(),
      ensureManageModalOverlay: () => overlay,
      getCloseModulePopupActive: () => activeClose,
      setCloseModulePopupActive: vi.fn((value) => {
        activeClose = value;
      }),
      openLexiModuleAssist: vi.fn(),
      setWorkspaceBackButtonVisible: vi.fn(),
      focusModuleByKey: vi.fn()
    });

    runtime.openBusinessHubModulePopup("home");
    expect(overlay.style.display).toBe("flex");

    docListeners.keydown?.({
      key: "Escape",
      preventDefault: vi.fn()
    });
    expect(overlay.style.display).toBe("none");

    runtime.openBusinessHubModulePopup("home");
    overlay.dispatch("click", { target: overlay });
    expect(overlay.style.display).toBe("none");

    runtime.openBusinessHubModulePopup("home");
    closeBtn.dispatch("click");
    expect(overlay.style.display).toBe("none");
  });
});
