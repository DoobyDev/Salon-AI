// Small dashboard routing/UI helpers shared across module navigation flows.
export function createDashboardRoutingUiSupportRuntime(deps) {
  const {
    win = window,
    doc = document,
    getUserRole,
    getManagedBusinessId,
    metricsGrid,
    getAdminAccountSupportResultsCache,
    loadAdminAccountSupport,
    setDashActionStatus,
    renderAdminAccountSupportModule,
    renderOperationsInsights,
    renderCrmSegments,
    renderCommercialControls,
    renderRevenueAttribution,
    renderProfitabilitySummary
  } = deps || {};

  function syncAdminBusinessQueryParam() {
    if (getUserRole?.() !== "admin") return;
    const url = new URL(win.location.href);
    const managedBusinessId = String(getManagedBusinessId?.() || "").trim();
    if (managedBusinessId) {
      url.searchParams.set("businessId", managedBusinessId);
    } else {
      url.searchParams.delete("businessId");
    }
    const target = `${url.pathname}${url.search}${url.hash}`;
    win.history.replaceState({}, "", target);
  }

  function addMetric(label, value) {
    if (!metricsGrid) return;
    const card = doc.createElement("article");
    card.className = "dash-card";
    card.innerHTML = `<p>${label}</p><strong>${value}</strong>`;
    metricsGrid.appendChild(card);
  }

  function hideSection(sectionEl) {
    if (sectionEl) {
      sectionEl.style.display = "none";
    }
  }

  function showSection(sectionEl) {
    if (sectionEl) {
      sectionEl.style.display = "";
    }
  }

  function renderPopupOnlyBusinessModule(moduleKey) {
    switch (String(moduleKey || "").trim()) {
      case "account_support":
        if (!(Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : []).length) {
          loadAdminAccountSupport?.().catch((error) => {
            setDashActionStatus?.(error?.message || "Unable to load account support.", true);
          });
        }
        renderAdminAccountSupportModule?.();
        break;
      case "cancellations":
      case "operations":
        renderOperationsInsights?.();
        break;
      case "crm":
      case "client_retention":
        renderCrmSegments?.();
        break;
      case "commercial":
      case "offers_packages":
        renderCommercialControls?.();
        break;
      case "revenue":
        renderRevenueAttribution?.();
        break;
      case "profitability":
      case "finance_targets":
        renderProfitabilitySummary?.();
        break;
      default:
        break;
    }
  }

  return {
    syncAdminBusinessQueryParam,
    addMetric,
    hideSection,
    showSection,
    renderPopupOnlyBusinessModule
  };
}
