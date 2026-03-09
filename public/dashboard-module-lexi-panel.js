// Lexi brief panel HTML renderer for module popups.
export function createModuleLexiPanelRuntime({
  getUserRole,
  buildModuleLexiBriefModel,
  moduleOperatorBlueprint,
  escapeHtml
}) {
  function renderModuleLexiBriefPanel(mod, blueprint, options = {}) {
    const role = String(getUserRole?.() || "").trim().toLowerCase();
    if (!mod || !(role === "subscriber" || role === "admin")) return "";
    const brief = buildModuleLexiBriefModel(mod, blueprint || moduleOperatorBlueprint(mod));
    if (!brief) return "";
    const compact = options.compact === true;
    const askLabel = "Ask Lexi";
    const statusClass = brief.statusTone === "attention" ? "is-attention" : brief.statusTone === "active" ? "is-active" : "is-baseline";
    const roleItems = [
      ["Unique Role", brief.roleSummary],
      ["Business Value", brief.impactSummary],
      ["Cadence", `${brief.cadence} • ${brief.category}`]
    ];
    const liveItems = brief.snapshots.length
      ? brief.snapshots.map((line, index) => [`Live Signal ${index + 1}`, line])
      : [["Live Signal", "No live metrics loaded yet. Lexi will use setup data and defaults until activity appears."]];
    const lexiItems = brief.lexiNow.map((line, index) => [index === 0 ? "Now" : index === 1 ? "Automation" : "Next", line]);
    return `
    <section class="module-lexi-brief${compact ? " is-compact" : ""}" aria-label="Lexi module brief">
      <div class="module-lexi-brief-head">
        <div>
          <p class="module-lexi-kicker">Lexi • ${escapeHtml(compact ? "Module Assist" : "Business Module Brief")}</p>
          <h4>${escapeHtml(mod.label)}</h4>
          <p>${escapeHtml(compact
            ? "Lexi is embedded in this module so you can get fast guidance, AI routines, and focused next steps without leaving the popup."
            : "This module has a unique business role. Lexi explains what it is doing now, how it helps the business, and what to do next.")}</p>
        </div>
        <div class="module-lexi-status-stack">
          <span class="module-lexi-status-pill ${statusClass}">${escapeHtml(brief.statusLabel)}</span>
          <span class="module-chip muted">${escapeHtml(brief.confidence)}% • ${escapeHtml(brief.modeLabel)}</span>
        </div>
      </div>
      <div class="module-lexi-brief-grid">
        <section class="module-lexi-brief-card">
          <h5>Module Role</h5>
          <ul class="module-lexi-brief-list">
            ${roleItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-lexi-brief-card">
          <h5>Current Business Impact</h5>
          <ul class="module-lexi-brief-list">
            ${liveItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-lexi-brief-card">
          <h5>What Lexi Is Working On</h5>
          <ul class="module-lexi-brief-list">
            ${lexiItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
      </div>
      <div class="module-lexi-brief-actions">
        <button type="button" class="btn module-lexi-assist-btn" data-lexi-module-assist="1">${escapeHtml(askLabel)}</button>
      </div>
      ${!compact && brief.features.length ? `
      <div class="module-lexi-brief-foot">
        <strong>Module strengths:</strong>
        <span>${brief.features.map((feature) => escapeHtml(feature)).join(" • ")}</span>
      </div>` : ""}
    </section>
  `;
  }

  return {
    renderModuleLexiBriefPanel
  };
}
