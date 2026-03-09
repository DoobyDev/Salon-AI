// Module info/workspace popup runtime.
export function createModulePopupRuntime(deps) {
  const {
    doc = document,
    moduleDefinitionByKey,
    markModuleUsed,
    ensureManageModalOverlay,
    getCloseModulePopupActive,
    setCloseModulePopupActive,
    escapeHtml,
    modulePopupSnapshotItems,
    isPinnedBusinessModule,
    getActiveModuleKey,
    getUserRole,
    moduleOperationalStatus,
    moduleOperatorBlueprint,
    renderOpeningClosingChecklistPanel,
    renderModuleWorkboardPanel,
    renderModuleLexiBriefPanel,
    renderModulePurposeStrip,
    openLexiModuleAssist,
    runModuleOperatorAction,
    setDashActionStatus,
    openBusinessAiChatPopup,
    loadHubAutoRoutinePrefs,
    saveHubAutoRoutinePrefs,
    showManageToast,
    bindOpeningClosingChecklistPanel,
    setWorkspaceBackButtonVisible,
    focusModuleByKey,
    returnToDashboardHomeView,
    isPopupOnlyBusinessModuleKey,
    renderPopupOnlyBusinessModule
  } = deps || {};

  function roleLabelForUser(role) {
    if (role === "admin") return "Admin area";
    if (role === "subscriber") return "Salon owner area";
    return "Customer area";
  }

  function openModuleInfoModal(moduleKey) {
    const mod = moduleDefinitionByKey?.(moduleKey);
    if (!mod) return;
    markModuleUsed?.(mod.key, "open");
    if (typeof getCloseModulePopupActive?.() === "function") {
      getCloseModulePopupActive()?.();
    }
    const overlay = ensureManageModalOverlay?.();
    if (!overlay) return;
    overlay.innerHTML = "";
    overlay.style.display = "flex";

    const shell = doc.createElement("section");
    shell.className = `module-info-modal size-${escapeHtml(String(mod.popupSize || "medium").toLowerCase())}`;
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "moduleInfoModalTitle");

    const featureItems = Array.isArray(mod.features) && mod.features.length
      ? mod.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")
      : "<li>Use this module to work on one part of the business without losing sight of the bigger picture.</li>";
    const snapshotItems = (modulePopupSnapshotItems?.(mod) || [])
      .filter(Boolean)
      .slice(0, 3)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    const isPinned = isPinnedBusinessModule?.(mod);
    const isActive = mod.key === getActiveModuleKey?.();
    const userRole = String(getUserRole?.() || "").trim().toLowerCase();
    const roleLabel = roleLabelForUser(userRole);
    const moduleStatus = moduleOperationalStatus?.(mod) || {};
    const operator = moduleOperatorBlueprint?.(mod) || {};
    const canUseLexiAssist = userRole === "subscriber" || userRole === "admin";
    const isCustomerMinimal = userRole === "customer";
    const operatorActionButtons = (Array.isArray(operator.quickActions) ? operator.quickActions : [])
      .slice(0, isCustomerMinimal ? 1 : 3)
      .map((action) => `
      <button
        type="button"
        class="btn ${action.variant === "primary" ? "" : "btn-ghost"} module-operator-btn"
        data-operator-action="${escapeHtml(action.id)}"
        ${action.moduleKey ? `data-target-module="${escapeHtml(action.moduleKey)}"` : ""}>
        ${escapeHtml(action.label)}
      </button>
    `)
      .join("");
    const operatorActionButtonsHtml = (userRole === "subscriber" || userRole === "admin")
      ? ""
      : operatorActionButtons;
    const operatorSignalCards = isCustomerMinimal
      ? ""
      : `
      <div class="module-operator-signal-grid">
        <article class="module-operator-signal">
          <p>AI Focus</p>
          <strong>${escapeHtml(operator.focus || "Prioritize the next best action.")}</strong>
        </article>
        <article class="module-operator-signal">
          <p>Business Impact</p>
          <strong>${escapeHtml(operator.impact || "Keeps this workflow moving with less manual effort.")}</strong>
        </article>
        <article class="module-operator-signal">
          <p>Confidence</p>
          <strong>${escapeHtml(String(operator.confidence || 90))}% - ${escapeHtml(operator.modeLabel || "AI assist")}</strong>
        </article>
      </div>`;
    const operatorNextSteps = Array.isArray(operator.nextSteps) && operator.nextSteps.length
      ? operator.nextSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "";
    const customOperatorPanelHtml = mod.key === "opening_closing_checklist"
      ? renderOpeningClosingChecklistPanel?.(mod) || ""
      : "";
    const workboardPanelHtml = renderModuleWorkboardPanel?.(mod, operator) || "";
    const lexiBriefPanelHtml = renderModuleLexiBriefPanel?.(mod, operator) || "";
    const purposeStripHtml = renderModulePurposeStrip?.(mod) || "";

    shell.innerHTML = `
    <div class="module-info-modal-head">
      <div>
        <h3 id="moduleInfoModalTitle">${escapeHtml(mod.label)}</h3>
        <div class="module-info-modal-meta">
          <span class="module-chip">${escapeHtml(roleLabel)}</span>
          ${isPinned ? '<span class="module-chip">Pinned</span>' : ""}
          <span class="module-chip module-chip-status ${moduleStatus.tone === "good" ? "is-good" : moduleStatus.tone === "attention" ? "is-attention" : "is-setup"}">${escapeHtml(moduleStatus.label || "Available")}</span>
          <span class="module-chip muted">${isActive ? "Currently active" : "Preview mode"}</span>
        </div>
      </div>
      <button type="button" class="module-info-close" aria-label="Close module information">x</button>
    </div>
    ${purposeStripHtml}
    <section class="module-operator-hero${isCustomerMinimal ? " is-minimal" : ""}">
      <div class="module-operator-headline">
        <p class="module-operator-label">${isCustomerMinimal ? "AI Guide" : "AI Operator"}</p>
        <h4>${escapeHtml(isCustomerMinimal ? "Minimal help, next-step focus" : "Autonomous daily workflow assistant")}</h4>
        <p>${escapeHtml(operator.modeSummary || "AI-led help for this workflow.")}</p>
      </div>
      ${operatorSignalCards}
      ${operatorNextSteps ? `
      <div class="module-operator-next">
        <h5>${isCustomerMinimal ? "Next Step" : "What AI Will Do"}</h5>
        <ul class="module-info-feature-list">${operatorNextSteps}</ul>
      </div>` : ""}
      ${operatorActionButtonsHtml ? `<div class="module-operator-actions">${operatorActionButtonsHtml}</div>` : ""}
    </section>
    <div class="module-info-scroll">
      ${lexiBriefPanelHtml}
      ${workboardPanelHtml}
      ${customOperatorPanelHtml}
      <section class="module-info-pane">
        <h4>Module Role In The Business</h4>
        <p>${escapeHtml(mod.navSummary || mod.howItHelps || "Helps you manage this part of the business day-to-day.")}</p>
        <p style="margin-top:0.45rem;">${escapeHtml(mod.howItWorks || "Open this module and use the controls to manage this area of your dashboard.")}</p>
      </section>
      <section class="module-info-pane">
        <h4>How This Module Helps</h4>
        <ul class="module-info-feature-list">${featureItems}</ul>
      </section>
      ${snapshotItems ? `
      <section class="module-info-pane">
        <h4>Current Live Contribution</h4>
        <ul class="module-info-feature-list">${snapshotItems}</ul>
      </section>` : ""}
    </div>
    <div class="module-info-actions">
      <small class="module-info-hint">Press Esc or click outside to close.</small>
      <button type="button" class="btn btn-ghost module-info-dashboard-btn">Back to Dashboard</button>
      <button type="button" class="btn btn-ghost module-info-close-btn">Close</button>
      ${canUseLexiAssist ? '<button type="button" class="btn ask-lexi-btn module-info-lexi-btn">Ask Lexi</button>' : ""}
      <button type="button" class="btn module-info-open-btn">${isActive ? "Open Current Module" : "Open Module"}</button>
    </div>
  `;

    overlay.appendChild(shell);

    const close = () => {
      if (typeof getCloseModulePopupActive?.() !== "function") return;
      doc.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("click", onOverlayClick);
      overlay.style.display = "none";
      overlay.innerHTML = "";
      setCloseModulePopupActive?.(null);
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

    setCloseModulePopupActive?.(close);
    doc.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("click", onOverlayClick);
    shell.querySelector(".module-info-close")?.addEventListener("click", close);
    shell.querySelector(".module-info-dashboard-btn")?.addEventListener("click", () => {
      close();
      returnToDashboardHomeView?.();
    });
    shell.querySelector(".module-info-close-btn")?.addEventListener("click", close);
    shell.querySelector(".module-info-lexi-btn")?.addEventListener("click", () => {
      openLexiModuleAssist?.(mod, { trigger: shell.querySelector(".module-info-lexi-btn"), blueprint: operator });
    });
    shell.querySelectorAll(".module-operator-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        const actionId = String(btn.getAttribute("data-operator-action") || "").trim();
        const targetModule = String(btn.getAttribute("data-target-module") || "").trim();
        runModuleOperatorAction?.(actionId, mod, { close, blueprint: operator, moduleKey: targetModule }).catch((error) => {
          setDashActionStatus?.(error.message || "Could not run that AI action right now.", true);
        });
      });
    });
    shell.querySelectorAll("[data-lexi-module-assist]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        openLexiModuleAssist?.(mod, { trigger: btn, blueprint: operator });
      });
    });
    shell.querySelectorAll("[data-lexi-open-chat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        if (!(userRole === "subscriber" || userRole === "admin")) return;
        openBusinessAiChatPopup?.(userRole === "admin" ? "admin" : "subscriber", { trigger: btn });
        setDashActionStatus?.(`Lexi chat opened for ${mod.label}.`);
      });
    });
    shell.querySelectorAll("[data-hub-auto-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        const key = String(btn.getAttribute("data-hub-auto-toggle") || "").trim();
        if (!key) return;
        const prefs = loadHubAutoRoutinePrefs?.() || {};
        prefs[key] = !(prefs[key] === true);
        saveHubAutoRoutinePrefs?.(prefs);
        showManageToast?.(`${prefs[key] ? "Auto enabled" : "Auto disabled"}.`);
        openModuleInfoModal(mod.key);
      });
    });
    if (mod.key === "opening_closing_checklist") {
      bindOpeningClosingChecklistPanel?.(shell, mod);
    }
    shell.querySelector(".module-info-open-btn")?.addEventListener("click", () => {
      setWorkspaceBackButtonVisible?.(mod.key !== "home");
      focusModuleByKey?.(mod.key);
      close();
    });

    const closeButton = shell.querySelector(".module-info-close");
    if (closeButton instanceof HTMLElement) closeButton.focus();
  }

  function openInteractiveModulePopup(moduleKey) {
    const mod = moduleDefinitionByKey?.(moduleKey);
    if (!mod) return;
    markModuleUsed?.(mod.key, "open");
    if (!(mod.section instanceof HTMLElement)) {
      openModuleInfoModal(moduleKey);
      return;
    }
    if (typeof getCloseModulePopupActive?.() === "function") {
      getCloseModulePopupActive()?.();
    }

    const overlay = ensureManageModalOverlay?.();
    if (!overlay) return;
    overlay.innerHTML = "";
    overlay.style.display = "flex";

    const shell = doc.createElement("section");
    shell.className = `module-workspace-modal size-${escapeHtml(String(mod.popupSize || "large").toLowerCase())}`;
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "moduleWorkspaceModalTitle");

    const isPinned = isPinnedBusinessModule?.(mod);
    const userRole = String(getUserRole?.() || "").trim().toLowerCase();
    const roleLabel = userRole === "admin" ? "Admin area" : "Salon owner area";
    const moduleStatus = moduleOperationalStatus?.(mod) || {};
    const operator = moduleOperatorBlueprint?.(mod) || {};
    const canUseLexiAssist = userRole === "subscriber" || userRole === "admin";
    const lexiWorkspaceBriefHtml = renderModuleLexiBriefPanel?.(mod, operator, { compact: true }) || "";
    const purposeStripHtml = renderModulePurposeStrip?.(mod) || "";
    shell.innerHTML = `
    <div class="module-workspace-head">
      <div>
        <h3 id="moduleWorkspaceModalTitle">${escapeHtml(mod.label)}</h3>
        <div class="module-info-modal-meta">
          <span class="module-chip">${escapeHtml(roleLabel)}</span>
          ${isPinned ? '<span class="module-chip">Pinned</span>' : ""}
          <span class="module-chip module-chip-status ${moduleStatus.tone === "good" ? "is-good" : moduleStatus.tone === "attention" ? "is-attention" : "is-setup"}">${escapeHtml(moduleStatus.label || "Available")}</span>
          <span class="module-chip muted">Quick working view</span>
        </div>
        <p class="module-workspace-summary">${escapeHtml(mod.howItWorks || mod.howItHelps || "Use this module in a focused pop-up view.")}</p>
      </div>
      <button type="button" class="module-info-close" aria-label="Close module popup">x</button>
    </div>
    <div class="module-workspace-body">${purposeStripHtml}${lexiWorkspaceBriefHtml}</div>
    <div class="module-workspace-actions">
      <small class="module-info-hint">Press Esc or click outside to close.</small>
      <button type="button" class="btn btn-ghost module-workspace-dashboard-btn">Back to Dashboard</button>
      <button type="button" class="btn btn-ghost module-workspace-close-btn">Close</button>
      ${canUseLexiAssist ? '<button type="button" class="btn ask-lexi-btn module-workspace-lexi-btn">Ask Lexi</button>' : ""}
      <button type="button" class="btn module-workspace-open-btn">Open Full View</button>
    </div>
  `;
    overlay.appendChild(shell);

    const body = shell.querySelector(".module-workspace-body");
    const originalParent = mod.section.parentNode;
    const placeholder = doc.createElement("div");
    placeholder.style.display = "none";
    const previousDisplay = mod.section.style.display;
    const hadMountedClass = mod.section.classList.contains("module-popup-mounted");
    if (originalParent) {
      originalParent.insertBefore(placeholder, mod.section);
    }
    mod.section.style.display = "";
    mod.section.classList.add("module-popup-mounted");
    body?.appendChild(mod.section);
    if (isPopupOnlyBusinessModuleKey?.(mod.key)) {
      renderPopupOnlyBusinessModule?.(mod.key);
    }

    const close = () => {
      if (typeof getCloseModulePopupActive?.() !== "function") return;
      doc.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("click", onOverlayClick);
      try {
        if (placeholder.parentNode && mod.section) {
          placeholder.parentNode.insertBefore(mod.section, placeholder);
          placeholder.remove();
        }
        if (!hadMountedClass) mod.section.classList.remove("module-popup-mounted");
        mod.section.style.display = previousDisplay;
      } catch {
        // Ignore restore issues and let next render normalize state.
      }
      overlay.style.display = "none";
      overlay.innerHTML = "";
      setCloseModulePopupActive?.(null);
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

    setCloseModulePopupActive?.(close);
    doc.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("click", onOverlayClick);
    shell.querySelector(".module-info-close")?.addEventListener("click", close);
    shell.querySelector(".module-workspace-dashboard-btn")?.addEventListener("click", () => {
      close();
      returnToDashboardHomeView?.();
    });
    shell.querySelector(".module-workspace-close-btn")?.addEventListener("click", close);
    shell.querySelector(".module-workspace-lexi-btn")?.addEventListener("click", () => {
      openLexiModuleAssist?.(mod, { trigger: shell.querySelector(".module-workspace-lexi-btn"), blueprint: operator });
    });
    shell.querySelectorAll(".module-operator-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        const actionId = String(btn.getAttribute("data-operator-action") || "").trim();
        if (!actionId) return;
        runModuleOperatorAction?.(actionId, mod, { close, blueprint: operator }).catch((error) => {
          setDashActionStatus?.(error.message || "Could not run that Lexi action right now.", true);
        });
      });
    });
    shell.querySelectorAll("[data-lexi-module-assist]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        openLexiModuleAssist?.(mod, { trigger: btn, blueprint: operator });
      });
    });
    shell.querySelectorAll("[data-lexi-open-chat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!(btn instanceof HTMLElement)) return;
        if (!(userRole === "subscriber" || userRole === "admin")) return;
        openBusinessAiChatPopup?.(userRole === "admin" ? "admin" : "subscriber", { trigger: btn });
        setDashActionStatus?.(`Lexi chat opened for ${mod.label}.`);
      });
    });
    shell.querySelector(".module-workspace-open-btn")?.addEventListener("click", () => {
      close();
      setWorkspaceBackButtonVisible?.(mod.key !== "home");
      focusModuleByKey?.(mod.key);
    });
    const closeButton = shell.querySelector(".module-info-close");
    if (closeButton instanceof HTMLElement) closeButton.focus();
  }

  return {
    openModuleInfoModal,
    openInteractiveModulePopup
  };
}
