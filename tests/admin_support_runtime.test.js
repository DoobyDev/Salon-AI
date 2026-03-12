import { describe, expect, it, vi } from "vitest";
import { createAdminSupportRuntime } from "../public/dashboard-admin-support.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.innerHTML = "";
    this.textContent = "";
    this.className = "";
    this.value = "";
    this.disabled = false;
    this.listeners = {};
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
}

globalThis.HTMLElement = FakeHTMLElement;

function createElement(initial = {}) {
  return new FakeHTMLElement(initial);
}

function makeAccount(overrides = {}) {
  return {
    id: "acct_subscriber_1",
    role: "subscriber",
    name: "Morgan Blake",
    email: "morgan@example.com",
    business: {
      id: "biz_1",
      name: "North Lane Studio",
      city: "Leeds"
    },
    stats: {
      bookingCount: 14,
      revenue: 840,
      planLabel: "starter",
      lastBookingAt: "2026-03-10T09:00:00.000Z"
    },
    recentVisits: [],
    ...overrides
  };
}

function createRuntimeHarness() {
  let cache = [];
  let selectedId = "";
  let timerId = null;
  let managedBusinessId = "biz_1";

  const adminAccountSearchForm = createElement();
  const adminAccountSearchInput = createElement({ value: "" });
  const adminAccountsTable = createElement();
  const adminAccountDetail = createElement();
  const adminAccountEditForm = createElement();
  const adminEditName = createElement();
  const adminEditEmail = createElement();
  const adminEditBusinessName = createElement();
  const adminAccountEditMessage = createElement();
  const accountingBookingExportBtn = createElement();
  const accountingPlatformExportBtn = createElement();
  const adminBusinessSelect = createElement({ value: "" });
  const subscriberCalendarSection = { scrollIntoView: vi.fn() };

  const setDashActionStatus = vi.fn();
  const setAccountingStatus = vi.fn();
  const loadAdminBusinessOptions = vi.fn().mockResolvedValue(undefined);
  const reloadAdminManagedDashboard = vi.fn().mockResolvedValue(undefined);
  const syncAdminBusinessQueryParam = vi.fn();
  const renderModuleNavigator = vi.fn();
  const openInteractiveModulePopup = vi.fn();

  const fetchImpl = vi.fn();
  const win = {
    clearTimeout: vi.fn(),
    setTimeout: vi.fn((fn) => {
      fn();
      return 1;
    }),
    location: {
      origin: "http://localhost",
      href: "http://localhost/dashboard?role=admin"
    },
    URL: {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn()
    }
  };
  const doc = {
    body: {
      appendChild: vi.fn()
    },
    createElement: vi.fn(() => ({
      click: vi.fn(),
      remove: vi.fn()
    }))
  };

  const runtime = createAdminSupportRuntime({
    win,
    doc,
    fetchImpl,
    getUserRole: () => "admin",
    headers: () => ({ Authorization: "Bearer test" }),
    escapeHtml: (value) => String(value ?? ""),
    formatDateShort: (value) => String(value || "").slice(0, 10),
    formatMoney: (value) => `GBP ${Number(value || 0)}`,
    openManageForm: vi.fn(),
    loadAdminBusinessOptions,
    reloadAdminManagedDashboard,
    setDashActionStatus,
    syncAdminBusinessQueryParam,
    renderModuleNavigator,
    getCloseModulePopupActive: () => null,
    openInteractiveModulePopup,
    canManageBusinessModules: () => true,
    setAccountingStatus,
    getManagedBusinessId: () => managedBusinessId,
    setManagedBusinessId: (value) => {
      managedBusinessId = String(value || "").trim();
    },
    adminBusinessSelect,
    subscriberCalendarSection,
    adminAccountSearchForm,
    adminAccountSearchInput,
    adminAccountsTable,
    adminAccountDetail,
    adminAccountEditForm,
    adminEditName,
    adminEditEmail,
    adminEditBusinessName,
    adminAccountEditMessage,
    accountingBookingExportBtn,
    accountingPlatformExportBtn,
    withManagedBusiness: (path) => path,
    getAdminAccountSupportResultsCache: () => cache,
    setAdminAccountSupportResultsCache: (value) => {
      cache = Array.isArray(value) ? value : [];
    },
    getAdminAccountSupportSelectedId: () => selectedId,
    setAdminAccountSupportSelectedId: (value) => {
      selectedId = String(value || "").trim();
    },
    getAdminAccountSupportSearchTimerId: () => timerId,
    setAdminAccountSupportSearchTimerId: (value) => {
      timerId = value ?? null;
    }
  });

  return {
    runtime,
    fetchImpl,
    adminAccountSearchForm,
    adminAccountSearchInput,
    adminAccountsTable,
    adminAccountDetail,
    adminAccountEditForm,
    adminEditName,
    adminEditEmail,
    adminEditBusinessName,
    adminAccountEditMessage,
    accountingBookingExportBtn,
    accountingPlatformExportBtn,
    adminBusinessSelect,
    subscriberCalendarSection,
    setDashActionStatus,
    setAccountingStatus,
    loadAdminBusinessOptions,
    reloadAdminManagedDashboard,
    syncAdminBusinessQueryParam,
    renderModuleNavigator,
    doc,
    win
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("admin support runtime", () => {
  it("loads and renders the rewired admin accounts panel on bind", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [makeAccount()] })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    expect(harness.fetchImpl).toHaveBeenCalledWith("/api/admin/accounts", { headers: { Authorization: "Bearer test" } });
    expect(harness.adminAccountsTable.innerHTML).toContain("Morgan Blake");
    expect(harness.adminAccountDetail.innerHTML).toContain("North Lane Studio");
    expect(harness.adminEditName.value).toBe("Morgan Blake");
    expect(harness.adminEditBusinessName.value).toBe("North Lane Studio");
  });

  it("falls back to mock admin account results when live search is empty", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [] })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    expect(harness.adminAccountsTable.innerHTML).toContain("Jade Mercer");
    expect(harness.adminAccountDetail.innerHTML).toContain("Luna Locks Studio");
    expect(harness.adminAccountEditMessage.textContent).toBe("Showing mock account results so the admin search panel stays populated.");
  });

  it("keeps managed actions visible when subscriber account strings need normalization", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accounts: [
          makeAccount({
            role: " Subscriber ",
            business: {
              id: " biz_1 ",
              name: "North Lane Studio",
              city: "Leeds"
            }
          })
        ]
      })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    expect(harness.adminAccountDetail.innerHTML).toContain('data-admin-account-action="open-dashboard"');
    expect(harness.adminAccountDetail.innerHTML).toContain('data-admin-account-action="open-profile"');
    expect(harness.adminEditBusinessName.disabled).toBe(false);
  });

  it("updates subscriber accounts inline and refreshes the managed dashboard when editing the selected business", async () => {
    const harness = createRuntimeHarness();
    const updated = makeAccount({
      name: "Morgan Updated",
      email: "updated@example.com",
      business: {
        id: "biz_1",
        name: "Updated Studio",
        city: "Leeds"
      }
    });

    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [makeAccount()] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ account: updated })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [updated] })
      });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    harness.adminEditName.value = "Morgan Updated";
    harness.adminEditEmail.value = "updated@example.com";
    harness.adminEditBusinessName.value = "Updated Studio";

    await harness.adminAccountEditForm.dispatch("submit", {
      preventDefault() {}
    });

    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/admin/accounts/acct_subscriber_1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "Morgan Updated",
          email: "updated@example.com",
          businessName: "Updated Studio"
        })
      })
    );
    expect(harness.loadAdminBusinessOptions).toHaveBeenCalled();
    expect(harness.reloadAdminManagedDashboard).toHaveBeenCalled();
    expect(harness.adminAccountEditMessage.textContent).toBe("Account saved.");
    expect(harness.adminAccountDetail.innerHTML).toContain("Morgan Updated");
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Subscriber account updated.");
  });

  it("opens the subscriber preview dashboard from the current admin account card", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [makeAccount()] })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    await harness.adminAccountDetail.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector === "[data-admin-account-action]") {
            const actionButton = new FakeHTMLElement();
            actionButton.getAttribute = (name) => (name === "data-admin-account-action" ? "open-dashboard" : "");
            return actionButton;
          }
          return null;
        }
      })
    });

    expect(harness.adminBusinessSelect.value).toBe("biz_1");
    expect(harness.win.location.href).toBe("/dashboard?role=subscriber&adminPreview=1&businessId=biz_1");
    expect(harness.reloadAdminManagedDashboard).not.toHaveBeenCalled();
    expect(harness.renderModuleNavigator).not.toHaveBeenCalled();
    expect(harness.subscriberCalendarSection.scrollIntoView).not.toHaveBeenCalled();
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Opening Morgan Blake dashboard preview.");
  });

  it("opens the subscriber preview dashboard when clicking a result row", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [makeAccount()] })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    await harness.adminAccountsTable.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector === "[data-admin-account-id]") {
            const row = new FakeHTMLElement();
            row.getAttribute = (name) => (name === "data-admin-account-id" ? "acct_subscriber_1" : "");
            return row;
          }
          return null;
        }
      })
    });

    expect(harness.win.location.href).toBe("/dashboard?role=subscriber&adminPreview=1&businessId=biz_1");
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Opening Morgan Blake dashboard preview.");
  });

  it("opens the customer preview dashboard from the current admin account card", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accounts: [
          makeAccount({
            id: "acct_customer_1",
            role: "customer",
            name: "Ava Hart",
            email: "ava@example.com",
            business: null,
            stats: {
              visitCount: 4,
              upcomingCount: 1,
              linkedBusinesses: 2
            }
          })
        ]
      })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    await harness.adminAccountDetail.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector === "[data-admin-account-action]") {
            const actionButton = new FakeHTMLElement();
            actionButton.getAttribute = (name) => (name === "data-admin-account-action" ? "open-dashboard" : "");
            return actionButton;
          }
          return null;
        }
      })
    });

    expect(harness.win.location.href).toBe("/dashboard?role=customer&adminPreview=1&customerEmail=ava%40example.com&customerName=Ava+Hart");
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Opening Ava Hart dashboard preview.");
  });

  it("submits admin account searches against the current query", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [makeAccount()] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [makeAccount({ id: "acct_subscriber_2", name: "Jamie Stone" })] })
      });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    harness.adminAccountSearchInput.value = "jamie";

    await harness.adminAccountSearchForm.dispatch("submit", {
      preventDefault() {}
    });

    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/admin/accounts?query=jamie",
      { headers: { Authorization: "Bearer test" } }
    );
    expect(harness.adminAccountsTable.innerHTML).toContain("Jamie Stone");
  });

  it("exports booking accounting CSVs from the current admin support runtime", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [makeAccount()] })
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get(name) {
            return name === "content-disposition" ? 'attachment; filename="bookings.csv"' : null;
          }
        },
        blob: async () => ({ size: 32 })
      });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    await harness.accountingBookingExportBtn.dispatch("click");

    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/accounting-integrations/export?scope=business&format=csv",
      { headers: { Authorization: "Bearer test" } }
    );
    expect(harness.doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(harness.doc.createElement).toHaveBeenCalledWith("a");
    expect(harness.win.URL.createObjectURL).toHaveBeenCalled();
    expect(harness.win.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    expect(harness.setAccountingStatus).toHaveBeenCalledWith("Booking accounting CSV exported.");
    expect(harness.accountingBookingExportBtn.disabled).toBe(false);
  });

  it("opens the subscriber business profile popup from the current admin account card", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [makeAccount()] })
    });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    await harness.adminAccountDetail.dispatch("click", {
      target: new FakeHTMLElement({
        closest(selector) {
          if (selector === "[data-admin-account-action]") {
            const actionButton = new FakeHTMLElement();
            actionButton.getAttribute = (name) => (name === "data-admin-account-action" ? "open-profile" : "");
            return actionButton;
          }
          return null;
        }
      })
    });

    expect(harness.adminBusinessSelect.value).toBe("biz_1");
    expect(harness.syncAdminBusinessQueryParam).toHaveBeenCalled();
    expect(harness.reloadAdminManagedDashboard).toHaveBeenCalled();
    expect(harness.renderModuleNavigator).not.toHaveBeenCalled();
  });

  it("exports platform accounting CSVs without requiring a managed business selection", async () => {
    const harness = createRuntimeHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accounts: [makeAccount()] })
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get(name) {
            return name === "content-disposition" ? 'attachment; filename="platform.csv"' : null;
          }
        },
        blob: async () => ({ size: 48 })
      });

    harness.runtime.bindAdminSupportEvents();
    await flushAsyncWork();

    harness.adminBusinessSelect.value = "";

    await harness.accountingPlatformExportBtn.dispatch("click");

    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/accounting-integrations/export?scope=platform&format=csv",
      { headers: { Authorization: "Bearer test" } }
    );
    expect(harness.setAccountingStatus).toHaveBeenCalledWith("Platform revenue CSV exported.");
    expect(harness.accountingPlatformExportBtn.disabled).toBe(false);
  });
});
