import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAccountingIntegrationsRuntime } from "../public/dashboard-accounting-integrations.js";

function createElement(initial = {}) {
  return {
    innerHTML: "",
    value: "",
    listeners: {},
    children: [],
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    appendChild(child) {
      this.children.push(child);
    },
    focus: vi.fn(),
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    },
    ...initial
  };
}

describe("accounting integrations runtime", () => {
  const originalDocument = globalThis.document;

  beforeEach(() => {
    globalThis.document = {
      createElement: vi.fn(() => ({ className: "", innerHTML: "" }))
    };
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    vi.restoreAllMocks();
  });

  function createHarness() {
    let accountingRows = [];
    const fetchImpl = vi.fn();
    const renderAccountingLiveRevenue = vi.fn().mockResolvedValue(undefined);
    const renderBusinessGrowthPanel = vi.fn();
    const setAccountingStatus = vi.fn();
    const accountingIntegrationsList = createElement();
    const accountingConnectForm = createElement();
    const accountingProvider = createElement({ value: "xero" });
    const accountingAccountLabel = createElement({ value: "Main Ledger" });
    const accountingSyncMode = createElement({ value: "daily" });

    const runtime = createAccountingIntegrationsRuntime({
      fetchImpl,
      canManageBusinessModules: () => true,
      withManagedBusiness: (path) => path,
      headers: () => ({ Authorization: "Bearer test" }),
      formatProviderLabel: (provider) => String(provider || "").toUpperCase(),
      formatDateTime: (value) => String(value || "never"),
      renderAccountingLiveRevenue,
      renderBusinessGrowthPanel,
      setAccountingStatus,
      getAccountingRows: () => accountingRows,
      setAccountingRows: (value) => {
        accountingRows = Array.isArray(value) ? value : [];
      },
      accountingIntegrationsList,
      accountingConnectForm,
      accountingProvider,
      accountingAccountLabel,
      accountingSyncMode
    });

    return {
      runtime,
      fetchImpl,
      renderAccountingLiveRevenue,
      renderBusinessGrowthPanel,
      setAccountingStatus,
      accountingIntegrationsList,
      accountingConnectForm,
      accountingProvider,
      accountingAccountLabel,
      accountingSyncMode,
      getAccountingRows: () => accountingRows,
      setAccountingRows: (value) => {
        accountingRows = value;
      }
    };
  }

  it("renders empty and connected provider states", () => {
    const harness = createHarness();

    harness.runtime.renderAccountingIntegrations();
    expect(harness.accountingIntegrationsList.innerHTML).toContain("No providers available.");

    harness.accountingIntegrationsList.innerHTML = "";
    harness.accountingIntegrationsList.children = [];
    harness.setAccountingRows([
      {
        provider: "xero",
        status: "connected",
        accountLabel: "Main Ledger",
        syncMode: "daily",
        updatedAt: "2026-03-10T12:00:00.000Z"
      },
      {
        provider: "sage",
        status: "not_connected",
        accountLabel: "",
        syncMode: "weekly",
        updatedAt: "2026-03-11T12:00:00.000Z"
      }
    ]);

    harness.runtime.renderAccountingIntegrations();

    expect(globalThis.document.createElement).toHaveBeenCalledTimes(2);
    expect(harness.accountingIntegrationsList.children).toHaveLength(2);
    expect(harness.accountingIntegrationsList.children[0].innerHTML).toContain("Connected");
    expect(harness.accountingIntegrationsList.children[0].innerHTML).toContain("accounting-edit-provider");
    expect(harness.accountingIntegrationsList.children[1].innerHTML).toContain("accounting-connect-provider");
  });

  it("loads accounting integrations and refreshes dependent panels", async () => {
    const harness = createHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        providers: [{ provider: "xero", status: "connected", accountLabel: "Main Ledger", syncMode: "daily" }]
      })
    });

    await harness.runtime.loadAccountingIntegrations();

    expect(harness.fetchImpl).toHaveBeenCalledWith("/api/accounting-integrations", {
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.getAccountingRows()).toEqual([
      { provider: "xero", status: "connected", accountLabel: "Main Ledger", syncMode: "daily" }
    ]);
    expect(harness.renderAccountingLiveRevenue).toHaveBeenCalledWith({ silent: true });
    expect(harness.renderBusinessGrowthPanel).toHaveBeenCalled();
  });

  it("connects and disconnects accounting providers through the runtime methods", async () => {
    const harness = createHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          providers: [{ provider: "xero", status: "connected", accountLabel: "Main Ledger", syncMode: "daily" }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          providers: [{ provider: "xero", status: "not_connected", accountLabel: "", syncMode: "daily" }]
        })
      });

    await harness.runtime.connectAccountingIntegration("xero", "Main Ledger", "daily");
    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      1,
      "/api/accounting-integrations/connect",
      {
        method: "POST",
        headers: { Authorization: "Bearer test" },
        body: JSON.stringify({ provider: "xero", accountLabel: "Main Ledger", syncMode: "daily" })
      }
    );
    expect(harness.renderBusinessGrowthPanel).toHaveBeenCalledTimes(1);

    await harness.runtime.disconnectAccountingIntegration("xero");
    expect(harness.fetchImpl).toHaveBeenNthCalledWith(
      2,
      "/api/accounting-integrations/xero/disconnect",
      {
        method: "POST",
        headers: { Authorization: "Bearer test" }
      }
    );
    expect(harness.getAccountingRows()[0].status).toBe("not_connected");
    expect(harness.renderBusinessGrowthPanel).toHaveBeenCalledTimes(2);
  });

  it("submits provider links from the local connect form", async () => {
    const harness = createHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        providers: [{ provider: "xero", status: "connected", accountLabel: "Main Ledger", syncMode: "daily" }]
      })
    });

    harness.runtime.bindAccountingIntegrationEvents();
    await harness.accountingConnectForm.dispatch("submit", {
      preventDefault() {}
    });

    expect(harness.setAccountingStatus).toHaveBeenCalledWith("Linking provider...");
    expect(harness.setAccountingStatus).toHaveBeenCalledWith("XERO linked successfully.");
    expect(harness.accountingAccountLabel.value).toBe("");
  });
});
