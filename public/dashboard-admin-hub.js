export function createAdminHubRuntime(deps) {
  const {
    getUserRole,
    escapeHtml,
    getBusinessHubModules
  } = deps || {};
  const BUSINESS_HUB_DRAFTS_KEY_PREFIX = "business_hub_drafts_v2";

  function getDraftStorageKey(role) {
    const safeRole = role === "admin" ? "admin" : "subscriber";
    return `${BUSINESS_HUB_DRAFTS_KEY_PREFIX}_${safeRole}`;
  }

  function readDrafts(role) {
    try {
      const raw = window.localStorage.getItem(getDraftStorageKey(role));
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeDrafts(role, drafts) {
    try {
      window.localStorage.setItem(getDraftStorageKey(role), JSON.stringify(drafts || {}));
    } catch {
      // Ignore storage failures so the modal remains usable.
    }
  }

  function renderInfoList(list = []) {
    const rows = Array.isArray(list) ? list : [];
    if (!rows.length) return '<li>No detail available yet.</li>';
    return rows.map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("");
  }

  function readSessionUser() {
    try {
      const raw = window.sessionStorage.getItem("salon_ai_user");
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function getInputValue(id) {
    const node = document.getElementById(id);
    return node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement
      ? String(node.value || "").trim()
      : "";
  }

  function getSubscriberBusinessProfileSnapshot() {
    const sessionUser = readSessionUser();
    const services = getInputValue("businessProfileServices")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6);

    return {
      fullName: String(sessionUser?.name || "").trim(),
      signInEmail: String(sessionUser?.email || "").trim(),
      businessName: getInputValue("businessProfileName"),
      businessType: getInputValue("businessProfileType"),
      businessEmail: getInputValue("businessProfileEmail"),
      phone: getInputValue("businessProfilePhone"),
      address: getInputValue("businessProfileAddress"),
      city: getInputValue("businessProfileCity"),
      country: getInputValue("businessProfileCountry"),
      postcode: getInputValue("businessProfilePostcode"),
      description: getInputValue("businessProfileDescription"),
      websiteUrl: getInputValue("businessProfileWebsiteUrl"),
      websiteTitle: getInputValue("businessProfileWebsiteTitle"),
      websiteSummary: getInputValue("businessProfileWebsiteSummary"),
      websiteImageUrl: getInputValue("businessProfileWebsiteImageUrl"),
      socialImageUrl: getInputValue("socialImageInput"),
      services
    };
  }

  function ensureBusinessHubModal() {
    let modal = document.getElementById("businessHubInfoModal");
    if (modal) return modal;

    modal = document.createElement("section");
    modal.className = "lexi-modal business-hub-modal";
    modal.id = "businessHubInfoModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="lexi-modal-backdrop" data-business-hub-close></div>
      <div class="lexi-modal-card business-hub-modal-card" role="dialog" aria-modal="true" aria-labelledby="businessHubModalTitle">
        <div class="lexi-modal-head business-hub-modal-head">
          <div>
            <p class="kicker" id="businessHubModalKicker">Business hub</p>
            <h2 id="businessHubModalTitle">Business area</h2>
          </div>
          <button class="btn btn-ghost btn-small" type="button" data-business-hub-close>Close</button>
        </div>
        <p class="section-copy business-hub-modal-summary" id="businessHubModalSummary"></p>
        <div class="business-hub-modal-layout">
          <section class="insight-panel business-hub-modal-highlight">
            <p class="kicker" id="businessHubModalHighlightKicker">Why this matters</p>
            <h3 id="businessHubModalHighlightTitle">Business impact</h3>
            <div id="businessHubModalHighlightBody" hidden></div>
            <ul class="feature-list" id="businessHubModalOutcomesList"></ul>
          </section>
          <div class="business-hub-modal-panels">
            <section class="insight-panel">
              <h3 id="businessHubModalInfoHeading">What this page covers</h3>
              <ul class="feature-list" id="businessHubModalInfoList"></ul>
            </section>
            <section class="insight-panel">
              <h3 id="businessHubModalJobsHeading">Key admin jobs</h3>
              <ul class="feature-list" id="businessHubModalJobsList"></ul>
            </section>
            <section class="insight-panel business-hub-modal-editor" id="businessHubModalEditorPanel" hidden>
              <div class="section-head section-head-compact">
                <div>
                  <p class="kicker" id="businessHubModalEditorKicker">Business editing</p>
                  <h3 id="businessHubModalEditorHeading">Edit this area</h3>
                </div>
                <span class="status-pill status-neutral" id="businessHubModalEditorStatus">Private draft</span>
              </div>
              <p class="section-copy business-hub-modal-editor-copy" id="businessHubModalEditorCopy"></p>
              <div class="business-hub-modal-action-row" id="businessHubModalActionRow" hidden>
                <button class="btn btn-small" id="businessHubModalAskLexiBtn" type="button">Ask Lexi</button>
                <button class="btn btn-ghost btn-small" id="businessHubModalEditProfileBtn" type="button">Edit business info</button>
                <button class="btn btn-ghost btn-small" id="businessHubModalPasswordBtn" type="button">Change password</button>
              </div>
              <form class="compact-form" id="businessHubModalEditorForm">
                <div class="business-hub-modal-editor-fields" id="businessHubModalEditorFields"></div>
                <div class="business-hub-modal-editor-actions">
                  <button class="btn btn-small" type="submit">Save updates</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.hidden = true;
    };
    modal.querySelectorAll("[data-business-hub-close]").forEach((node) => node.addEventListener("click", close));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) close();
    });
    return modal;
  }

  function openBusinessHubModal(item) {
    if (!item) return;
    const modal = ensureBusinessHubModal();
    const role = String(getUserRole?.() || "").trim().toLowerCase();
    const kicker = modal.querySelector("#businessHubModalKicker");
    const highlightKicker = modal.querySelector("#businessHubModalHighlightKicker");
    const title = modal.querySelector("#businessHubModalTitle");
    const highlightTitle = modal.querySelector("#businessHubModalHighlightTitle");
    const highlightBody = modal.querySelector("#businessHubModalHighlightBody");
    const summary = modal.querySelector("#businessHubModalSummary");
    const infoHeading = modal.querySelector("#businessHubModalInfoHeading");
    const jobsHeading = modal.querySelector("#businessHubModalJobsHeading");
    const infoList = modal.querySelector("#businessHubModalInfoList");
    const jobsList = modal.querySelector("#businessHubModalJobsList");
    const outcomesList = modal.querySelector("#businessHubModalOutcomesList");
    const editorPanel = modal.querySelector("#businessHubModalEditorPanel");
    const editorKicker = modal.querySelector("#businessHubModalEditorKicker");
    const editorHeading = modal.querySelector("#businessHubModalEditorHeading");
    const editorCopy = modal.querySelector("#businessHubModalEditorCopy");
    const actionRow = modal.querySelector("#businessHubModalActionRow");
    const askLexiBtn = modal.querySelector("#businessHubModalAskLexiBtn");
    const editProfileBtn = modal.querySelector("#businessHubModalEditProfileBtn");
    const passwordBtn = modal.querySelector("#businessHubModalPasswordBtn");
    const editorFields = modal.querySelector("#businessHubModalEditorFields");
    const editorForm = modal.querySelector("#businessHubModalEditorForm");
    const editorStatus = modal.querySelector("#businessHubModalEditorStatus");
    const itemTitle = String(item?.title || item?.mod?.label || "Business area");
    const roleLabel = role === "admin" ? "admin" : "subscriber";
    const isBusinessProfileCard = item?.key === "business_profile";
    const canManagePassword = role === "subscriber" || role === "admin";
    const isEditableBusinessProfileCard = isBusinessProfileCard && canManagePassword;

    if (kicker) kicker.textContent = String(item?.kicker || "Business hub");
    if (highlightKicker) highlightKicker.textContent = `${itemTitle} priorities`;
    if (title) title.textContent = String(item?.title || item?.mod?.label || "Business area");
    if (highlightTitle) highlightTitle.textContent = String(item?.title || item?.mod?.label || "Business area");
    if (summary) summary.textContent = String(item?.summary || item?.mod?.howItHelps || "");
    if (infoHeading) infoHeading.textContent = `${itemTitle} focus`;
    if (jobsHeading) jobsHeading.textContent = role === "admin" ? `Admin actions for ${itemTitle}` : `Subscriber actions for ${itemTitle}`;
    if (highlightBody instanceof HTMLElement) {
      highlightBody.hidden = !isEditableBusinessProfileCard;
      highlightBody.innerHTML = "";
    }
    if (isEditableBusinessProfileCard) {
      const profile = getSubscriberBusinessProfileSnapshot();
      const heroImage = profile.websiteImageUrl || profile.socialImageUrl || "/3d-lexi.png";
      if (highlightKicker) highlightKicker.textContent = "Customer-facing profile preview";
      if (highlightTitle) highlightTitle.textContent = profile.businessName || "Your business profile";
      if (summary) {
        summary.textContent = profile.websiteSummary || profile.description || "This is the profile customers will use when they search for a salon, barber, or beauty business.";
      }
      if (highlightBody instanceof HTMLElement) {
        highlightBody.innerHTML = `
          <article class="business-profile-popup-preview">
            <img class="business-profile-popup-image" src="${escapeHtml(heroImage)}" alt="${escapeHtml(profile.businessName || "Business profile image")}" />
            <div class="business-profile-popup-copy">
              <strong>${escapeHtml(profile.websiteTitle || profile.businessName || "Business profile")}</strong>
              <p>${escapeHtml(profile.websiteSummary || profile.description || "Customer-facing business summary will appear here.")}</p>
              <span>${escapeHtml(profile.websiteUrl || "Add a website link so customers can jump straight to your brand.")}</span>
            </div>
          </article>
        `;
      }
      if (infoHeading) infoHeading.textContent = "Sign-in and business details";
      if (jobsHeading) jobsHeading.textContent = "What customers will see";
      if (infoList) {
        infoList.innerHTML = renderInfoList([
          `Business name: ${profile.businessName || "Not added yet"}`,
          `Full name: ${profile.fullName || "Not added yet"}`,
          `Sign-in email: ${profile.signInEmail || profile.businessEmail || "Not added yet"}`,
          `Business email: ${profile.businessEmail || "Not added yet"}`,
          `Phone number: ${profile.phone || "Not added yet"}`,
          `Address: ${[profile.address, profile.city, profile.postcode, profile.country].filter(Boolean).join(", ") || "Not added yet"}`
        ]);
      }
      if (jobsList) {
        jobsList.innerHTML = renderInfoList([
          `Business type: ${profile.businessType || "Not added yet"}`,
          `Website link: ${profile.websiteUrl || "Not linked yet"}`,
          `Website title: ${profile.websiteTitle || "Not added yet"}`,
          `Website summary: ${profile.websiteSummary || "Not added yet"}`,
          `Services shown to customers: ${profile.services.length ? profile.services.join("; ") : "No services added yet"}`,
          "Any uploaded website or social image should appear as the profile visual customers recognise."
        ]);
      }
      if (outcomesList) {
        outcomesList.innerHTML = renderInfoList([
          "Customers can recognise the salon quickly from its image, title, and summary.",
          "Search results can show a stronger, more complete business profile.",
          "Profile edits here should match the live business details the subscriber wants customers to trust."
        ]);
      }
    } else {
      if (infoList) infoList.innerHTML = renderInfoList(item?.information);
      if (jobsList) jobsList.innerHTML = renderInfoList(item?.jobs);
      if (outcomesList) outcomesList.innerHTML = renderInfoList(item?.outcomes);
    }
    if (editorPanel instanceof HTMLElement) {
      const canEdit = role === "subscriber" || role === "admin";
      editorPanel.hidden = !canEdit;
      if (canEdit && editorFields instanceof HTMLElement && editorForm instanceof HTMLFormElement) {
        const drafts = readDrafts(role);
        const currentDraft = drafts?.[item.key] && typeof drafts[item.key] === "object" ? drafts[item.key] : {};
        const fields = Array.isArray(item?.editFields) ? item.editFields : [];
        if (editorKicker) {
          editorKicker.textContent = role === "admin" ? "Admin editing" : "Subscriber editing";
        }
        if (editorHeading) {
          editorHeading.textContent = isEditableBusinessProfileCard ? "Manage this business profile" : `Update ${itemTitle}`;
        }
        if (editorCopy) {
          editorCopy.textContent = isEditableBusinessProfileCard
            ? "Review what customers will see, open your saved business profile details, and get help from Lexi for profile improvements."
            : `Save private ${roleLabel} notes, updates, and next actions for ${itemTitle.toLowerCase()}.`;
        }
        if (actionRow instanceof HTMLElement) {
          actionRow.hidden = !isEditableBusinessProfileCard;
        }
        if (isEditableBusinessProfileCard) {
          if (askLexiBtn instanceof HTMLButtonElement) {
            askLexiBtn.onclick = () => {
              window.openDashboardSharedLexiPopup?.({
                prompt: "Help me improve my business information profile so customers see the best version of my salon."
              });
            };
          }
          if (editProfileBtn instanceof HTMLButtonElement) {
            editProfileBtn.onclick = () => {
              document.getElementById("businessProfileOpenSetup")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            };
          }
          if (passwordBtn instanceof HTMLButtonElement) {
            passwordBtn.hidden = !canManagePassword;
            passwordBtn.onclick = () => {
              window.location.assign("/auth");
            };
          }
        } else if (passwordBtn instanceof HTMLButtonElement) {
          passwordBtn.hidden = true;
        }
        editorFields.innerHTML = fields.map((field) => {
          const fieldKey = String(field?.key || "").trim();
          const savedValue = String(currentDraft?.[fieldKey] || "");
          return `
            <label class="business-hub-modal-editor-field">
              <span>${escapeHtml(String(field?.label || "Notes"))}</span>
              <textarea name="${escapeHtml(fieldKey)}" rows="4" placeholder="${escapeHtml(String(field?.placeholder || ""))}">${escapeHtml(savedValue)}</textarea>
            </label>
          `;
        }).join("");
        editorForm.onsubmit = (event) => {
          event.preventDefault();
          const nextDrafts = readDrafts(role);
          nextDrafts[item.key] = fields.reduce((acc, field) => {
            const fieldKey = String(field?.key || "").trim();
            const input = editorForm.elements.namedItem(fieldKey);
            if (input instanceof HTMLTextAreaElement) {
              acc[fieldKey] = input.value.trim();
            }
            return acc;
          }, {});
          writeDrafts(role, nextDrafts);
          if (editorStatus) editorStatus.textContent = "Saved";
          window.setTimeout(() => {
            if (editorStatus) editorStatus.textContent = "Private draft";
          }, 1600);
        };
        if (editorStatus) editorStatus.textContent = "Private draft";
      } else if (editorFields instanceof HTMLElement) {
        editorFields.innerHTML = "";
      }
    }
    modal.hidden = false;
  }

  function bindBusinessHubGrid(grid, items = [], options = {}) {
    if (!(grid instanceof HTMLElement)) return;
    const safeItems = Array.isArray(items) ? items : [];
    const existingHandler = grid.__businessHubClickHandler;
    if (typeof existingHandler === "function") {
      grid.removeEventListener("click", existingHandler);
    }

    const clickHandler = (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-business-hub-key]") : null;
      if (!(target instanceof HTMLElement)) return;
      const moduleKey = String(target.getAttribute("data-business-hub-key") || "").trim();
      if (!moduleKey) return;
      event.preventDefault();
      const selected = safeItems.find((item) => String(item?.key || "").trim() === moduleKey) || null;
      if (!selected) return;
      if (typeof options.onCardClick === "function") {
        options.onCardClick(moduleKey, selected);
        return;
      }
      openBusinessHubModal(selected);
    };

    grid.addEventListener("click", clickHandler);
    grid.__businessHubClickHandler = clickHandler;
  }

  function renderAdminBusinessHub(adminBusinessHubGrid, adminHubDetailSection, refs = {}, options = {}) {
    const role = String(options.role || getUserRole?.() || "").trim().toLowerCase();
    if (!(role === "admin" || role === "subscriber")) return;
    const items = Array.isArray(getBusinessHubModules?.()) ? getBusinessHubModules?.() : [];

    if (adminBusinessHubGrid) {
      adminBusinessHubGrid.innerHTML = items.map((item) => {
        const key = String(item?.key || "").trim();
        return `
          <a class="admin-hub-card" href="#businessHubInfoModal" data-business-hub-key="${escapeHtml(key)}">
            <p>${escapeHtml(String(item?.kicker || "Business hub"))}</p>
            <strong>${escapeHtml(String(item?.title || item?.mod?.label || "Hub area"))}</strong>
            <small>${escapeHtml(String(item?.summary || item?.mod?.howItHelps || ""))}</small>
            <span>Open page</span>
          </a>
        `;
      }).join("");
      bindBusinessHubGrid(adminBusinessHubGrid, items, options);
    }

    if (adminHubDetailSection instanceof HTMLElement) {
      adminHubDetailSection.hidden = true;
      adminHubDetailSection.style.display = "none";
    }
  }

  return {
    bindBusinessHubGrid,
    renderAdminBusinessHub,
    openBusinessHubModal
  };
}
