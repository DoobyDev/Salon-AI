export function createAdminHubRuntime(deps) {
  const {
    getUserRole,
    getAdminPage,
    escapeHtml,
    getBusinessHubModules
  } = deps || {};

  function renderInfoList(list = []) {
    const rows = Array.isArray(list) ? list : [];
    if (!rows.length) return '<li>No detail available yet.</li>';
    return rows.map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("");
  }

  function renderAdminBusinessHub(adminBusinessHubGrid, adminHubDetailSection, refs = {}) {
    if (getUserRole?.() !== "admin") return;
    const items = Array.isArray(getBusinessHubModules?.()) ? getBusinessHubModules?.() : [];
    const selectedKey = String(getAdminPage?.() || "").trim().toLowerCase();

    if (adminBusinessHubGrid) {
      adminBusinessHubGrid.innerHTML = items.map((item) => {
        const key = String(item?.key || "").trim();
        const href = `/dashboard?role=admin&adminPage=${encodeURIComponent(key)}#adminHubDetailSection`;
        const selectedClass = key === selectedKey ? " is-selected" : "";
        return `
          <a class="admin-hub-card${selectedClass}" href="${href}">
            <p>${escapeHtml(String(item?.kicker || "Business hub"))}</p>
            <strong>${escapeHtml(String(item?.title || item?.mod?.label || "Hub area"))}</strong>
            <small>${escapeHtml(String(item?.summary || item?.mod?.howItHelps || ""))}</small>
            <span>Open page</span>
          </a>
        `;
      }).join("");
    }

    if (!adminHubDetailSection) return;
    const selected = items.find((item) => String(item?.key || "").trim().toLowerCase() === selectedKey) || null;
    if (!selected) {
      adminHubDetailSection.hidden = true;
      adminHubDetailSection.style.display = "none";
      return;
    }

    const {
      adminHubDetailKicker,
      adminHubDetailTitle,
      adminHubDetailSummary,
      adminHubDetailInfoList,
      adminHubDetailJobsList,
      adminHubDetailOutcomesList
    } = refs;

    if (adminHubDetailKicker) adminHubDetailKicker.textContent = String(selected?.kicker || "Business hub");
    if (adminHubDetailTitle) adminHubDetailTitle.textContent = String(selected?.title || selected?.mod?.label || "Business hub detail");
    if (adminHubDetailSummary) adminHubDetailSummary.textContent = String(selected?.summary || selected?.mod?.howItHelps || "");
    if (adminHubDetailInfoList) adminHubDetailInfoList.innerHTML = renderInfoList(selected?.information);
    if (adminHubDetailJobsList) adminHubDetailJobsList.innerHTML = renderInfoList(selected?.jobs);
    if (adminHubDetailOutcomesList) adminHubDetailOutcomesList.innerHTML = renderInfoList(selected?.outcomes);

    adminHubDetailSection.hidden = false;
    adminHubDetailSection.style.display = "";
  }

  return {
    renderAdminBusinessHub
  };
}
