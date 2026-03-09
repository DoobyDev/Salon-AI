// Business Hub popup/card runtime with injected dashboard dependencies.
export function createBusinessHubRuntime({
  doc = document,
  businessHubCardsGrid,
  getBusinessHubModules,
  moduleDefinitionByKey,
  moduleOperationalStatus,
  renderModuleStatusPill,
  escapeHtml,
  markModuleUsed,
  ensureManageModalOverlay,
  getCloseModulePopupActive,
  setCloseModulePopupActive,
  openLexiModuleAssist,
  setWorkspaceBackButtonVisible,
  focusModuleByKey
}) {
  function openBusinessHubModulePopup(moduleKey) {
    const hubCard = getBusinessHubModules().find((item) => item.key === moduleKey);
    const mod = hubCard?.mod || moduleDefinitionByKey(moduleKey);
    if (!hubCard || !mod) return;
    markModuleUsed(mod.key, "open");
    if (typeof getCloseModulePopupActive() === "function") getCloseModulePopupActive()();

    const overlay = ensureManageModalOverlay();
    overlay.innerHTML = "";
    overlay.style.display = "flex";

    const shell = doc.createElement("section");
    shell.className = "module-info-modal size-medium business-hub-popup-modal";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "businessHubModulePopupTitle");

    const roleLabel = "Business Hub workspace";
    const status = moduleOperationalStatus(mod);
    const features = (Array.isArray(mod.features) ? mod.features : [])
      .filter(Boolean)
      .slice(0, 3)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("") || "<li>Open the workspace to review and manage this business area.</li>";
    const information = (Array.isArray(hubCard.information) ? hubCard.information : [])
      .filter(Boolean)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("") || features;
    const jobs = (Array.isArray(hubCard.jobs) ? hubCard.jobs : [])
      .filter(Boolean)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("") || features;
    const outcomes = (Array.isArray(hubCard.outcomes) ? hubCard.outcomes : [])
      .filter(Boolean)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("") || features;

    shell.innerHTML = `
    <div class="module-info-modal-head">
      <div>
        <h3 id="businessHubModulePopupTitle">${escapeHtml(hubCard.title)}</h3>
        <div class="module-info-modal-meta">
          <span class="module-chip">${escapeHtml(roleLabel)}</span>
          <span class="module-chip">${escapeHtml(hubCard.kicker)}</span>
          <span class="module-chip module-chip-status ${status.tone === "good" ? "is-good" : status.tone === "attention" ? "is-attention" : "is-setup"}">${escapeHtml(status.label || "Available")}</span>
        </div>
      </div>
      <button type="button" class="module-info-close" aria-label="Close business hub popup">x</button>
    </div>
    <div class="module-info-scroll">
      <section class="module-info-pane">
        <h4>What This Covers</h4>
        <p>${escapeHtml(hubCard.summary)}</p>
      </section>
      <section class="module-info-pane">
        <h4>Information In This Module</h4>
        <ul class="module-info-feature-list">${information}</ul>
      </section>
      <section class="module-info-pane">
        <h4>Jobs This Module Handles</h4>
        <ul class="module-info-feature-list">${jobs}</ul>
      </section>
      <section class="module-info-pane">
        <h4>Why It Matters To The Business</h4>
        <ul class="module-info-feature-list">${outcomes}</ul>
      </section>
      <section class="module-info-pane">
        <h4>Inside This Module</h4>
        <ul class="module-info-feature-list">${features}</ul>
      </section>
    </div>
    <div class="module-info-actions">
      <small class="module-info-hint">Press Esc or click outside to close.</small>
      <button type="button" class="btn btn-ghost hub-popup-close-btn">Close</button>
      <button type="button" class="btn ask-lexi-btn hub-popup-lexi-btn">Ask Lexi</button>
      <button type="button" class="btn hub-popup-open-btn">Open Module</button>
    </div>
  `;

    overlay.appendChild(shell);

    const close = () => {
      if (typeof getCloseModulePopupActive() !== "function") return;
      doc.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("click", onOverlayClick);
      overlay.style.display = "none";
      overlay.innerHTML = "";
      setCloseModulePopupActive(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    const onOverlayClick = (event) => {
      if (event.target === overlay) close();
    };

    setCloseModulePopupActive(close);
    doc.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("click", onOverlayClick);
    shell.querySelector(".module-info-close")?.addEventListener("click", close);
    shell.querySelector(".hub-popup-close-btn")?.addEventListener("click", close);
    shell.querySelector(".hub-popup-lexi-btn")?.addEventListener("click", () => {
      openLexiModuleAssist(mod, { trigger: shell.querySelector(".hub-popup-lexi-btn") });
    });
    shell.querySelector(".hub-popup-open-btn")?.addEventListener("click", () => {
      close();
      setWorkspaceBackButtonVisible(mod.key !== "home");
      focusModuleByKey(mod.key);
    });

    const closeButton = shell.querySelector(".module-info-close");
    if (closeButton instanceof HTMLElement) closeButton.focus();
  }

  function buildBusinessHubCardButton(item) {
    const { mod } = item;
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "module-card";
    btn.setAttribute("data-business-hub-key", item.key);
    const status = moduleOperationalStatus(mod);
    btn.innerHTML = `
    <strong>${escapeHtml(item.title)}</strong>
    <small class="module-card-summary">${escapeHtml(item.summary)}</small>
    <div class="module-card-meta">
      <span class="module-card-pill accent">${escapeHtml(item.kicker)}</span>
      ${renderModuleStatusPill(status, { compact: true })}
    </div>
    <small class="module-card-usage">Opens a simple popup with module info, Lexi help, and the full workspace.</small>
  `;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openBusinessHubModulePopup(item.key);
    });
    return btn;
  }

  function renderBusinessHubCards() {
    if (!businessHubCardsGrid) return;
    const cards = getBusinessHubModules();
    businessHubCardsGrid.innerHTML = "";
    cards.forEach((item) => {
      businessHubCardsGrid.appendChild(buildBusinessHubCardButton(item));
    });
  }

  return {
    openBusinessHubModulePopup,
    renderBusinessHubCards
  };
}
