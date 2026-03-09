// Shared support helpers used by module info/workspace popups.
export function createModulePopupSupportRuntime(deps) {
  const {
    escapeHtml,
    moduleBusinessJobProfile,
    moduleOperationalStatus,
    moduleUsageSummary,
    getModulePopupSnapshotItems,
    getPopupSnapshotContext
  } = deps || {};

  function renderModulePurposeStrip(mod) {
    const job = moduleBusinessJobProfile?.(mod) || {};
    const status = moduleOperationalStatus?.(mod) || {};
    const usage = moduleUsageSummary?.(mod) || {};
    return `
      <section class="module-purpose-strip" aria-label="Module purpose and status">
        <div class="module-purpose-grid">
          <article class="module-purpose-item">
            <p>Module Job</p>
            <strong>${escapeHtml?.(job.job || "")}</strong>
            <small>${escapeHtml?.(job.outcome || "")}</small>
          </article>
          <article class="module-purpose-item">
            <p>Status</p>
            <strong>${escapeHtml?.(status.label || "Available")}</strong>
            <small>${escapeHtml?.(status.note || "Module is ready to use.")}</small>
          </article>
          <article class="module-purpose-item">
            <p>Required Action</p>
            <strong>${escapeHtml?.(job.requiredAction || "")}</strong>
            <small>${escapeHtml?.(usage.detail || usage.label || "Use this module regularly to keep data current.")}</small>
          </article>
        </div>
      </section>
    `;
  }

  function modulePopupSnapshotItems(mod) {
    return getModulePopupSnapshotItems?.(mod, getPopupSnapshotContext?.() || {});
  }

  return {
    renderModulePurposeStrip,
    modulePopupSnapshotItems
  };
}
