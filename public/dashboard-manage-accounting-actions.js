// Managed accounting integration actions extracted from the global dashboard click handler.
export function createManageAccountingActionsRuntime(deps) {
  const {
    openManageForm,
    openManageConfirm,
    showManageToast,
    getAccountingRows,
    setAccountingStatus,
    formatProviderLabel,
    connectAccountingIntegration,
    disconnectAccountingIntegration,
    accountingProvider,
    accountingAccountLabel,
    accountingSyncMode
  } = deps || {};

  async function handleManageAccountingClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddAccountingIntegration") {
      const values = await openManageForm?.({
        title: "Add Accounting Integration",
        submitLabel: "Save",
        fields: [
          { id: "provider", label: "Provider", value: String(accountingProvider?.value || "quickbooks"), required: true },
          { id: "accountLabel", label: "Account Label", value: String(accountingAccountLabel?.value || "Main Ledger"), required: true },
          { id: "syncMode", label: "Sync Mode", value: String(accountingSyncMode?.value || "daily"), required: true }
        ]
      });
      if (!values) return true;
      const provider = String(values.provider || "quickbooks").trim().toLowerCase();
      const accountLabel = String(values.accountLabel || "").trim();
      const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
      if (!provider || !accountLabel) return true;
      try {
        setAccountingStatus?.("Linking provider...");
        await connectAccountingIntegration?.(provider, accountLabel, syncMode);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} linked successfully.`);
        showManageToast?.("Accounting integration added.");
      } catch (error) {
        setAccountingStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageDisconnectAllAccounting") {
      const confirmed = await openManageConfirm?.({
        title: "Delete All Integrations",
        message: "Disconnect all connected accounting integrations?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const connectedProviders = (Array.isArray(getAccountingRows?.()) ? getAccountingRows() : [])
        .filter((row) => row.status === "connected" || row.connected === true)
        .map((row) => String(row.provider || "").trim())
        .filter(Boolean);
      if (!connectedProviders.length) return true;
      try {
        for (const provider of connectedProviders) {
          await disconnectAccountingIntegration?.(provider);
        }
        setAccountingStatus?.("All integrations disconnected.");
        showManageToast?.("All accounting integrations deleted.");
      } catch (error) {
        setAccountingStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("accounting-connect-provider")) {
      const provider = String(target.getAttribute("data-provider") || "").trim();
      if (!provider) return true;
      const values = await openManageForm?.({
        title: "Add Integration",
        submitLabel: "Save",
        fields: [
          { id: "accountLabel", label: "Account Label", value: "Main Ledger", required: true },
          { id: "syncMode", label: "Sync Mode", value: "daily", required: true }
        ]
      });
      if (!values) return true;
      const accountLabel = String(values.accountLabel || "").trim();
      const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
      if (!accountLabel) return true;
      try {
        setAccountingStatus?.("Linking provider...");
        await connectAccountingIntegration?.(provider, accountLabel, syncMode);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} linked successfully.`);
        showManageToast?.("Accounting integration added.");
      } catch (error) {
        setAccountingStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("accounting-edit-provider")) {
      const provider = String(target.getAttribute("data-provider") || "").trim();
      if (!provider) return true;
      const currentLabel = String(target.getAttribute("data-account-label") || "").trim();
      const currentSync = String(target.getAttribute("data-sync-mode") || "daily").trim();
      const values = await openManageForm?.({
        title: "Edit Integration",
        submitLabel: "Save",
        fields: [
          { id: "accountLabel", label: "Account Label", value: currentLabel || "Main Ledger", required: true },
          { id: "syncMode", label: "Sync Mode", value: currentSync || "daily", required: true }
        ]
      });
      if (!values) return true;
      const accountLabel = String(values.accountLabel || "").trim();
      const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
      if (!accountLabel) return true;
      try {
        setAccountingStatus?.("Updating integration...");
        await connectAccountingIntegration?.(provider, accountLabel, syncMode);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} updated.`);
        showManageToast?.("Accounting integration updated.");
      } catch (error) {
        setAccountingStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("accounting-delete-provider")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Integration",
        message: "Disconnect this accounting integration?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const provider = String(target.getAttribute("data-provider") || "").trim();
      if (!provider) return true;
      try {
        setAccountingStatus?.(`Disconnecting ${formatProviderLabel?.(provider)}...`);
        await disconnectAccountingIntegration?.(provider);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} disconnected.`);
        showManageToast?.("Accounting integration deleted.");
      } catch (error) {
        setAccountingStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageAccountingClick
  };
}
