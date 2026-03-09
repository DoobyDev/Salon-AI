// Admin managed-business filtering, select rendering, and summary helpers.
export function createAdminBusinessRuntime(deps) {
  const {
    getUserRole,
    getManagedBusinessId,
    setManagedBusinessId,
    getAdminBusinessOptions,
    normalizeText,
    adminBusinessSearch,
    adminBusinessSelect,
    adminBusinessStatus,
    adminManagedBusinessLabel,
    adminManagedBusinessMeta
  } = deps || {};

  function setAdminBusinessStatus(message, isError = false) {
    if (!adminBusinessStatus) return;
    adminBusinessStatus.textContent = message || "";
    adminBusinessStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function filteredAdminBusinessOptions() {
    const query = normalizeText?.(adminBusinessSearch?.value || "");
    const adminBusinessOptions = Array.isArray(getAdminBusinessOptions?.()) ? getAdminBusinessOptions() : [];
    if (!query) return adminBusinessOptions.slice();
    return adminBusinessOptions.filter((business) => {
      const blob = [
        business?.name,
        business?.type,
        business?.city,
        business?.country
      ].map((value) => normalizeText?.(value)).join(" ");
      return blob.includes(query);
    });
  }

  function renderAdminBusinessSelect(options = getAdminBusinessOptions?.(), { syncState = true } = {}) {
    if (!adminBusinessSelect) return;
    const rows = Array.isArray(options) ? options : [];
    const previousValue = String(getManagedBusinessId?.() || adminBusinessSelect.value || "").trim();
    adminBusinessSelect.innerHTML = "";
    rows.forEach((business) => {
      const option = document.createElement("option");
      option.value = String(business.id || "");
      const location = [business.city, business.country].filter(Boolean).join(", ");
      option.textContent = location ? `${business.name} (${location})` : String(business.name || "Unnamed business");
      adminBusinessSelect.appendChild(option);
    });
    const selected = rows.find((business) => String(business.id || "") === previousValue) || rows[0] || null;
    if (!selected) return;
    if (syncState) {
      setManagedBusinessId?.(String(selected.id || "").trim());
      adminBusinessSelect.value = String(getManagedBusinessId?.() || "").trim();
      return;
    }
    adminBusinessSelect.value = String(selected.id || "").trim();
  }

  function renderAdminManagedBusinessSummary() {
    if (getUserRole?.() !== "admin") return;
    const adminBusinessOptions = Array.isArray(getAdminBusinessOptions?.()) ? getAdminBusinessOptions() : [];
    const business = adminBusinessOptions.find((row) => String(row?.id || "") === String(getManagedBusinessId?.() || "").trim()) || null;
    if (adminManagedBusinessLabel) {
      adminManagedBusinessLabel.textContent = business?.name || "No business selected";
    }
    if (!adminManagedBusinessMeta) return;
    if (!business) {
      adminManagedBusinessMeta.textContent = "Select a subscriber business to load its diary, business hub, profile, and support tools.";
      return;
    }
    const bits = [business.type, business.city, business.country].filter(Boolean);
    adminManagedBusinessMeta.textContent = bits.length
      ? `${bits.join(" | ")} | Admin can open and edit the managed business tools below.`
      : "Admin can open and edit the managed business tools below.";
  }

  return {
    setAdminBusinessStatus,
    filteredAdminBusinessOptions,
    renderAdminBusinessSelect,
    renderAdminManagedBusinessSummary
  };
}
