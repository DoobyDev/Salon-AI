// Accounting integrations rendering, data loading, and local bindings.
export function createAccountingIntegrationsRuntime(deps) {
  const {
    fetchImpl = fetch,
    canManageBusinessModules,
    withManagedBusiness,
    headers,
    formatProviderLabel,
    formatDateTime,
    renderAccountingLiveRevenue,
    renderBusinessGrowthPanel,
    setAccountingStatus,
    getAccountingRows,
    setAccountingRows,
    accountingIntegrationsList,
    accountingConnectForm,
    accountingProvider,
    accountingAccountLabel,
    accountingSyncMode
  } = deps || {};

  function renderAccountingIntegrations() {
    if (!accountingIntegrationsList) return;
    accountingIntegrationsList.innerHTML = "";
    const accountingRows = Array.isArray(getAccountingRows?.()) ? getAccountingRows() : [];
    if (!accountingRows.length) {
      accountingIntegrationsList.innerHTML = "<p class='accounting-note'>No providers available.</p>";
      return;
    }

    accountingRows.forEach((row) => {
      const connected = row.status === "connected" || row.connected === true;
      const card = document.createElement("article");
      card.className = `integration-card${connected ? " connected" : ""}`;
      card.innerHTML = `
        <div class="integration-top">
          <strong>${formatProviderLabel?.(row.provider)}</strong>
          <span class="integration-status ${connected ? "connected" : ""}">
            ${connected ? "Connected" : "Not connected"}
          </span>
        </div>
        <p class="integration-meta">Account: ${row.accountLabel || "Not linked"}</p>
        <p class="integration-meta">Sync mode: ${row.syncMode || "daily"}</p>
        <p class="integration-meta">Last updated: ${formatDateTime?.(row.updatedAt || row.connectedAt)}</p>
        <div class="integration-actions">
          ${
            connected
              ? `
                  <button class="btn btn-ghost manage-only accounting-edit-provider" type="button" data-provider="${row.provider}" data-account-label="${String(row.accountLabel || "").replaceAll('"', "&quot;")}" data-sync-mode="${row.syncMode || "daily"}">Edit</button>
                  <button class="btn btn-ghost manage-only accounting-delete-provider" type="button" data-provider="${row.provider}">Delete</button>
                `
              : `<button class="btn btn-ghost manage-only accounting-connect-provider" type="button" data-provider="${row.provider}">Add</button>`
          }
        </div>
      `;
      accountingIntegrationsList.appendChild(card);
    });
  }

  async function loadAccountingIntegrations() {
    if (!canManageBusinessModules?.()) {
      renderAccountingLiveRevenue?.();
      return;
    }
    const res = await fetchImpl(withManagedBusiness?.("/api/accounting-integrations"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load accounting integrations.");
    setAccountingRows?.(Array.isArray(data.providers) ? data.providers : []);
    renderAccountingIntegrations();
    await renderAccountingLiveRevenue?.({ silent: true });
    renderBusinessGrowthPanel?.();
  }

  async function connectAccountingIntegration(provider, accountLabel, syncMode) {
    const res = await fetchImpl(withManagedBusiness?.("/api/accounting-integrations/connect"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ provider, accountLabel, syncMode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to connect provider.");
    setAccountingRows?.(Array.isArray(data.providers) ? data.providers : getAccountingRows?.());
    renderAccountingIntegrations();
    renderBusinessGrowthPanel?.();
  }

  async function disconnectAccountingIntegration(provider) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/accounting-integrations/${encodeURIComponent(provider)}/disconnect`), {
      method: "POST",
      headers: headers?.()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to disconnect provider.");
    setAccountingRows?.(Array.isArray(data.providers) ? data.providers : getAccountingRows?.());
    renderAccountingIntegrations();
    renderBusinessGrowthPanel?.();
  }

  function bindAccountingIntegrationEvents() {
    accountingConnectForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const provider = String(accountingProvider?.value || "").trim();
      const accountLabel = String(accountingAccountLabel?.value || "").trim();
      const syncMode = String(accountingSyncMode?.value || "daily").trim();
      if (!provider || !accountLabel) {
        setAccountingStatus?.("Provider and account label are required.", true);
        return;
      }
      try {
        setAccountingStatus?.("Linking provider...");
        await connectAccountingIntegration(provider, accountLabel, syncMode);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} linked successfully.`);
        if (accountingAccountLabel) accountingAccountLabel.value = "";
      } catch (error) {
        setAccountingStatus?.(error.message, true);
      }
    });

    accountingIntegrationsList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const provider = String(target.getAttribute("data-provider") || "").trim();
      if (!provider) return;

      if (target.classList.contains("prefill-accounting")) {
        if (accountingProvider) accountingProvider.value = provider;
        if (accountingAccountLabel) accountingAccountLabel.focus();
        return;
      }

      if (!target.classList.contains("disconnect-accounting")) return;
      try {
        setAccountingStatus?.(`Disconnecting ${formatProviderLabel?.(provider)}...`);
        await disconnectAccountingIntegration(provider);
        setAccountingStatus?.(`${formatProviderLabel?.(provider)} disconnected.`);
      } catch (error) {
        setAccountingStatus?.(error.message, true);
      }
    });
  }

  return {
    renderAccountingIntegrations,
    loadAccountingIntegrations,
    connectAccountingIntegration,
    disconnectAccountingIntegration,
    bindAccountingIntegrationEvents
  };
}
