// Admin managed-business option loading and dashboard reload orchestration.
export function createAdminBusinessLoadingRuntime(deps) {
  const {
    getUserRole,
    headers,
    adminBusinessSelect,
    getAdminBusinessParam,
    getManagedBusinessId,
    setManagedBusinessId,
    getAdminBusinessOptions,
    setAdminBusinessOptions,
    setAdminBusinessStatus,
    renderAdminBusinessSelect,
    renderAdminManagedBusinessSummary,
    filteredAdminBusinessOptions,
    syncAdminBusinessQueryParam,
    shouldRenderTopMetricsGrid,
    metricsGrid,
    resetBookingsCursor,
    updateLoadMoreState,
    loadMetrics,
    loadBookings,
    loadBillingSummary,
    loadBusinessProfile,
    loadSocialMediaLinks,
    loadAccountingIntegrations,
    loadStaffRoster,
    loadWaitlist,
    loadCrmSegments,
    loadCommercialControls,
    loadRevenueAttribution,
    loadProfitabilitySummary
  } = deps || {};

  async function loadAdminBusinessOptions() {
    if (getUserRole?.() !== "admin") return;
    const res = await fetch("/api/admin/businesses", { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load businesses.");
    const rows = Array.isArray(data.businesses) ? data.businesses : [];
    setAdminBusinessOptions?.(rows);
    if (!adminBusinessSelect) return;

    if (!rows.length) {
      setManagedBusinessId?.("");
      setAdminBusinessStatus?.("No businesses available.", true);
      renderAdminBusinessSelect?.([]);
      renderAdminManagedBusinessSummary?.();
      return;
    }

    const currentBusinessId = String(getManagedBusinessId?.() || "").trim();
    const adminBusinessParam = String(getAdminBusinessParam?.() || "").trim();
    const selected =
      rows.find((business) => business.id === currentBusinessId)?.id ||
      rows.find((business) => business.id === adminBusinessParam)?.id ||
      rows[0].id;

    setManagedBusinessId?.(String(selected || "").trim());
    renderAdminBusinessSelect?.(filteredAdminBusinessOptions?.());
    syncAdminBusinessQueryParam?.();
    const selectedName = rows.find((business) => business.id === getManagedBusinessId?.())?.name;
    setAdminBusinessStatus?.(`Viewing ${selectedName || "selected business"}.`);
    renderAdminManagedBusinessSummary?.();
  }

  async function reloadAdminManagedDashboard() {
    if (getUserRole?.() !== "admin") return;
    if (shouldRenderTopMetricsGrid?.() && metricsGrid) metricsGrid.innerHTML = "";
    resetBookingsCursor?.();
    updateLoadMoreState?.(false);
    setAdminBusinessStatus?.("Loading business dashboard...");
    if (adminBusinessSelect) adminBusinessSelect.disabled = true;
    try {
      const tasks = [
        loadMetrics?.(),
        loadBookings?.({ append: false }),
        loadBillingSummary?.(),
        loadBusinessProfile?.(),
        loadSocialMediaLinks?.(),
        loadAccountingIntegrations?.(),
        loadStaffRoster?.(),
        loadWaitlist?.(),
        loadCrmSegments?.(),
        loadCommercialControls?.(),
        loadRevenueAttribution?.(),
        loadProfitabilitySummary?.()
      ];
      const settled = await Promise.allSettled(tasks);
      const hasError = settled.some((result) => result.status === "rejected");
      if (hasError) {
        setAdminBusinessStatus?.("Loaded with some errors. Check module status notes.", true);
        return;
      }
      const selectedName = (Array.isArray(getAdminBusinessOptions?.()) ? getAdminBusinessOptions?.() : []).find(
        (business) => business.id === getManagedBusinessId?.()
      )?.name;
      setAdminBusinessStatus?.(`Viewing ${selectedName || "selected business"}.`);
      renderAdminManagedBusinessSummary?.();
    } finally {
      if (adminBusinessSelect) adminBusinessSelect.disabled = false;
    }
  }

  return {
    loadAdminBusinessOptions,
    reloadAdminManagedDashboard
  };
}
