import { describe, expect, it, vi } from "vitest";
import { createAccountSessionControlsRuntime } from "../public/dashboard-account-session-controls.js";

function createElement(initial = {}) {
  return {
    checked: false,
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    },
    ...initial
  };
}

describe("account session controls runtime", () => {
  it("clears auth/session state and returns to the homepage on logout", async () => {
    const logoutBtn = createElement();
    const storage = { removeItem: vi.fn() };
    const session = { removeItem: vi.fn() };
    const win = { location: { href: "/dashboard" } };

    const runtime = createAccountSessionControlsRuntime({
      win,
      storage,
      session,
      authTokenKey: "authToken",
      authUserKey: "authUser",
      subscriptionAutoRenewPrefStorageKey: "billing:autoRenew",
      setDashActionStatus: vi.fn(),
      logoutBtn,
      subscriptionAutoRenewToggle: createElement()
    });

    runtime.bindAccountSessionControlsEvents();
    await logoutBtn.dispatch("click");

    expect(session.removeItem).toHaveBeenCalledWith("authToken");
    expect(session.removeItem).toHaveBeenCalledWith("authUser");
    expect(storage.removeItem).toHaveBeenCalledWith("authToken");
    expect(storage.removeItem).toHaveBeenCalledWith("authUser");
    expect(storage.removeItem).toHaveBeenCalledWith("salonTheme");
    expect(win.location.href).toBe("/");
  });

  it("stores the device auto-renew preference and reports success", async () => {
    const subscriptionAutoRenewToggle = createElement({ checked: true });
    const storage = { setItem: vi.fn(), removeItem: vi.fn() };
    const setDashActionStatus = vi.fn();

    const runtime = createAccountSessionControlsRuntime({
      win: { location: { href: "/" } },
      storage,
      session: { removeItem: vi.fn() },
      authTokenKey: "authToken",
      authUserKey: "authUser",
      subscriptionAutoRenewPrefStorageKey: "billing:autoRenew",
      setDashActionStatus,
      logoutBtn: createElement(),
      subscriptionAutoRenewToggle
    });

    runtime.bindAccountSessionControlsEvents();
    await subscriptionAutoRenewToggle.dispatch("change");

    expect(storage.setItem).toHaveBeenCalledWith("billing:autoRenew", "on");
    expect(setDashActionStatus).toHaveBeenCalledWith(
      "Auto renew preference saved for this device. Use Manage Billing to apply billing-account changes."
    );
  });
});
