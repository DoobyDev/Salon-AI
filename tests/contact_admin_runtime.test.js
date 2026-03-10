import { describe, expect, it, vi } from "vitest";
import { createContactAdminRuntime } from "../public/dashboard-contact-admin.js";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeHTMLElement {
  constructor(initial = {}) {
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
    this.className = "";
    this.value = "";
    this.listeners = {};
    this.classList = new FakeClassList();
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  removeEventListener(type) {
    delete this.listeners[type];
  }

  appendChild(child) {
    this.child = child;
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  async dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }

  focus() {
    this.focused = true;
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createShell() {
  const form = new FakeHTMLElement();
  const messageInput = new FakeHTMLElement();
  const subjectInput = new FakeHTMLElement();
  const statusEl = new FakeHTMLElement();
  const closeBtn = new FakeHTMLElement();
  const cancelBtn = new FakeHTMLElement();

  const shell = new FakeHTMLElement({
    querySelector(selector) {
      return {
        ".contact-admin-form": form,
        "#contactAdminMessage": messageInput,
        "#contactAdminSubject": subjectInput,
        "#contactAdminStatus": statusEl,
        ".module-info-close": closeBtn,
        ".contact-admin-cancel": cancelBtn
      }[selector] || null;
    }
  });

  return {
    shell,
    form,
    messageInput,
    subjectInput,
    statusEl,
    closeBtn,
    cancelBtn
  };
}

describe("contact admin runtime", () => {
  it("opens the subscriber contact modal and saves urgent messages locally", async () => {
    const overlay = new FakeHTMLElement();
    const docListeners = {};
    const { shell, form, messageInput, subjectInput } = createShell();
    const closeModulePopupActive = vi.fn();
    const setCloseModulePopupActive = vi.fn();
    const setDashActionStatus = vi.fn();
    const showManageToast = vi.fn();
    const storage = {
      getItem: vi.fn(() => "[]"),
      setItem: vi.fn()
    };

    const runtime = createContactAdminRuntime({
      doc: {
        createElement: vi.fn(() => shell),
        addEventListener: vi.fn((type, handler) => {
          docListeners[type] = handler;
        }),
        removeEventListener: vi.fn((type) => {
          delete docListeners[type];
        })
      },
      localStorageImpl: storage,
      contactAdminMessagesStorageKey: "contactAdminMessages",
      getUser: () => ({ id: "sub_1", name: "Morgan Blake", email: "morgan@example.com" }),
      getUserRole: () => "subscriber",
      getCloseModulePopupActive: () => closeModulePopupActive,
      setCloseModulePopupActive,
      ensureManageModalOverlay: () => overlay,
      setDashActionStatus,
      showManageToast
    });

    runtime.openContactAdminModal();

    expect(closeModulePopupActive).toHaveBeenCalled();
    expect(overlay.style.display).toBe("flex");
    expect(messageInput.focused).toBe(true);

    subjectInput.value = "Urgent login issue";
    messageInput.value = "I cannot access the dashboard.";

    await form.dispatch("submit", {
      preventDefault() {}
    });

    expect(storage.setItem).toHaveBeenCalledWith(
      "contactAdminMessages",
      expect.stringContaining("\"subject\":\"Urgent login issue\"")
    );
    expect(setDashActionStatus).toHaveBeenCalledWith("Emergency message sent to admin. Usually responds within 24hrs.");
    expect(showManageToast).toHaveBeenCalledWith("Emergency message sent to admin.");
    expect(overlay.style.display).toBe("none");
    expect(setCloseModulePopupActive).toHaveBeenCalled();
  });

  it("shows a validation error when the subscriber submits an empty urgent message", async () => {
    const overlay = new FakeHTMLElement();
    const { shell, form, messageInput, statusEl } = createShell();

    const runtime = createContactAdminRuntime({
      doc: {
        createElement: vi.fn(() => shell),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      },
      localStorageImpl: {
        getItem: vi.fn(() => "[]"),
        setItem: vi.fn()
      },
      contactAdminMessagesStorageKey: "contactAdminMessages",
      getUser: () => ({ id: "sub_1", email: "morgan@example.com" }),
      getUserRole: () => "subscriber",
      getCloseModulePopupActive: () => null,
      setCloseModulePopupActive: vi.fn(),
      ensureManageModalOverlay: () => overlay,
      setDashActionStatus: vi.fn(),
      showManageToast: vi.fn()
    });

    runtime.openContactAdminModal();

    messageInput.value = "";
    await form.dispatch("submit", {
      preventDefault() {}
    });

    expect(statusEl.textContent).toBe("Please write a message before sending.");
    expect(statusEl.classList.contains("is-error")).toBe(true);
    expect(messageInput.focused).toBe(true);
  });
});
