// Small shared copilot list-render helper.
export function createDashboardCopilotUiRuntime({ doc = document } = {}) {
  function renderCopilotList(el, items, emptyText) {
    if (!el) return;
    const rows = Array.isArray(items) ? items.filter(Boolean) : [];
    el.innerHTML = "";
    if (!rows.length) {
      const li = doc.createElement("li");
      li.textContent = emptyText;
      el.appendChild(li);
      return;
    }
    rows.forEach((item) => {
      const li = doc.createElement("li");
      li.textContent = String(item);
      el.appendChild(li);
    });
  }

  return {
    renderCopilotList
  };
}
