// Admin managed-business search and selection controls.
export function createAdminBusinessControlsRuntime(deps) {
  const {
    getUserRole,
    getManagedBusinessId,
    setManagedBusinessId,
    getAdminBusinessOptions,
    filteredAdminBusinessOptions,
    renderAdminBusinessSelect,
    setAdminBusinessStatus,
    renderAdminManagedBusinessSummary,
    syncAdminBusinessQueryParam,
    reloadAdminManagedDashboard,
    adminBusinessSearch,
    adminBusinessSelect
  } = deps || {};

  function bindAdminBusinessControlsEvents() {
    adminBusinessSearch?.addEventListener("input", () => {
      if (getUserRole?.() !== "admin") return;
      const rows = filteredAdminBusinessOptions?.() || [];
      renderAdminBusinessSelect?.(rows, { syncState: false });
      const selectedName = (Array.isArray(getAdminBusinessOptions?.()) ? getAdminBusinessOptions() : []).find(
        (business) => business.id === getManagedBusinessId?.()
      )?.name;
      setAdminBusinessStatus?.(
        rows.length ? `Viewing ${selectedName || "selected business"}. Filtered ${rows.length} result${rows.length === 1 ? "" : "s"}.` : "No matching businesses found.",
        !rows.length
      );
      renderAdminManagedBusinessSummary?.();
    });

    adminBusinessSelect?.addEventListener("change", async () => {
      if (getUserRole?.() !== "admin") return;
      const nextBusinessId = String(adminBusinessSelect.value || "").trim();
      if (!nextBusinessId || nextBusinessId === getManagedBusinessId?.()) return;
      setManagedBusinessId?.(nextBusinessId);
      syncAdminBusinessQueryParam?.();
      await reloadAdminManagedDashboard?.();
    });
  }

  return {
    bindAdminBusinessControlsEvents
  };
}
