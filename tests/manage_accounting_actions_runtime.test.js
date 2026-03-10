import { describe, expect, it, vi } from "vitest";
import { createManageAccountingActionsRuntime } from "../public/dashboard-manage-accounting-actions.js";

class FakeHTMLElement {
  constructor({ id = "", classes = [], attrs = {} } = {}) {
    this.id = id;
    this.attrs = attrs;
    this.classList = {
      contains: (name) => classes.includes(name)
    };
  }

  getAttribute(name) {
    return this.attrs[name] ?? "";
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createHarness(overrides = {}) {
  const openManageForm = vi.fn();
  const openManageConfirm = vi.fn();
  const showManageToast = vi.fn();
  const setAccountingStatus = vi.fn();
  const connectAccountingIntegration = vi.fn().mockResolvedValue(undefined);
  const disconnectAccountingIntegration = vi.fn().mockResolvedValue(undefined);
  let accountingRows = overrides.accountingRows || [
    { provider: "xero", status: "connected" },
    { provider: "quickbooks", connected: true }
  ];

  const runtime = createManageAccountingActionsRuntime({
    openManageForm,
    openManageConfirm,
    showManageToast,
    getAccountingRows: () => accountingRows,
    setAccountingStatus,
    formatProviderLabel: (provider) => {
      const value = String(provider || "").trim();
      return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Provider";
    },
    connectAccountingIntegration,
    disconnectAccountingIntegration,
    accountingProvider: { value: "quickbooks" },
    accountingAccountLabel: { value: "Main Ledger" },
    accountingSyncMode: { value: "daily" }
  });

  return {
    runtime,
    openManageForm,
    openManageConfirm,
    showManageToast,
    setAccountingStatus,
    connectAccountingIntegration,
    disconnectAccountingIntegration,
    setAccountingRows(nextRows) {
      accountingRows = nextRows;
    }
  };
}

describe("manage accounting actions runtime", () => {
  it("adds an accounting integration from the manage add button", async () => {
    const harness = createHarness();
    harness.openManageForm.mockResolvedValue({
      provider: "xero",
      accountLabel: "Salon Ledger",
      syncMode: "hourly"
    });

    const handled = await harness.runtime.handleManageAccountingClick(
      new FakeHTMLElement({ id: "manageAddAccountingIntegration" })
    );

    expect(handled).toBe(true);
    expect(harness.connectAccountingIntegration).toHaveBeenCalledWith("xero", "Salon Ledger", "hourly");
    expect(harness.setAccountingStatus).toHaveBeenLastCalledWith("Xero linked successfully.");
    expect(harness.showManageToast).toHaveBeenCalledWith("Accounting integration added.");
  });

  it("edits an existing accounting integration from the rendered provider button", async () => {
    const harness = createHarness();
    harness.openManageForm.mockResolvedValue({
      accountLabel: "Updated Ledger",
      syncMode: "weekly"
    });

    const handled = await harness.runtime.handleManageAccountingClick(
      new FakeHTMLElement({
        classes: ["accounting-edit-provider"],
        attrs: {
          "data-provider": "xero",
          "data-account-label": "Main Ledger",
          "data-sync-mode": "daily"
        }
      })
    );

    expect(handled).toBe(true);
    expect(harness.connectAccountingIntegration).toHaveBeenCalledWith("xero", "Updated Ledger", "weekly");
    expect(harness.setAccountingStatus).toHaveBeenLastCalledWith("Xero updated.");
    expect(harness.showManageToast).toHaveBeenCalledWith("Accounting integration updated.");
  });

  it("deletes a single accounting integration after confirmation", async () => {
    const harness = createHarness();
    harness.openManageConfirm.mockResolvedValue(true);

    const handled = await harness.runtime.handleManageAccountingClick(
      new FakeHTMLElement({
        classes: ["accounting-delete-provider"],
        attrs: {
          "data-provider": "quickbooks"
        }
      })
    );

    expect(handled).toBe(true);
    expect(harness.disconnectAccountingIntegration).toHaveBeenCalledWith("quickbooks");
    expect(harness.setAccountingStatus).toHaveBeenLastCalledWith("Quickbooks disconnected.");
    expect(harness.showManageToast).toHaveBeenCalledWith("Accounting integration deleted.");
  });

  it("disconnects all connected providers from the manage bulk-delete action", async () => {
    const harness = createHarness();
    harness.openManageConfirm.mockResolvedValue(true);

    const handled = await harness.runtime.handleManageAccountingClick(
      new FakeHTMLElement({ id: "manageDisconnectAllAccounting" })
    );

    expect(handled).toBe(true);
    expect(harness.disconnectAccountingIntegration).toHaveBeenNthCalledWith(1, "xero");
    expect(harness.disconnectAccountingIntegration).toHaveBeenNthCalledWith(2, "quickbooks");
    expect(harness.setAccountingStatus).toHaveBeenLastCalledWith("All integrations disconnected.");
    expect(harness.showManageToast).toHaveBeenCalledWith("All accounting integrations deleted.");
  });
});
