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

  function setInputValue(id, value) {
    const node = document.getElementById(id);
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
      node.value = String(value ?? "");
    }
  }

  function getAuthHeaders() {
    const token = String(
      window.sessionStorage.getItem("salon_ai_token") ||
      window.localStorage.getItem("salon_ai_token") ||
      ""
    ).trim();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  function getBusinessHoursPayload() {
    return {
      monday: getInputValue("businessHoursMonday") || "Closed",
      tuesday: getInputValue("businessHoursTuesday") || "Closed",
      wednesday: getInputValue("businessHoursWednesday") || "Closed",
      thursday: getInputValue("businessHoursThursday") || "Closed",
      friday: getInputValue("businessHoursFriday") || "Closed",
      saturday: getInputValue("businessHoursSaturday") || "Closed",
      sunday: getInputValue("businessHoursSunday") || "Closed"
    };
  }

  function formatServicesForEditor(rows = []) {
    return (Array.isArray(rows) ? rows : [])
      .map((row) => `${String(row?.name || "").trim()} | ${Number(row?.durationMin || 0)} | ${Number(row?.price || 0)}`)
      .filter((line) => !line.startsWith(" | "))
      .join("\n");
  }

  function parseServiceEditorText(value) {
    const lines = String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const services = lines.map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 3) throw new Error("Service format must be: Name | DurationMin | Price");
      const [name, durationRaw, priceRaw] = parts;
      const durationMin = Number(durationRaw);
      const price = Number(priceRaw);
      if (!name || !Number.isFinite(durationMin) || durationMin < 5 || !Number.isFinite(price) || price < 0) {
        throw new Error("Each service requires a valid name, duration (>=5), and price (>=0).");
      }
      return { name, durationMin, price };
    });
    if (!services.length) throw new Error("Add at least one service.");
    return services;
  }

  function applyBusinessProfileSnapshot(profile = {}) {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    setInputValue("businessProfileName", safeProfile.name || "");
    setInputValue("businessProfileType", safeProfile.type || "hair_salon");
    setInputValue("businessProfilePhone", safeProfile.phone || "");
    setInputValue("businessProfileEmail", safeProfile.email || "");
    setInputValue("businessProfileCity", safeProfile.city || "");
    setInputValue("businessProfileCountry", safeProfile.country || "");
    setInputValue("businessProfilePostcode", safeProfile.postcode || "");
    setInputValue("businessProfileAddress", safeProfile.address || "");
    setInputValue("businessProfileDescription", safeProfile.description || "");
    setInputValue("businessProfileWebsiteUrl", safeProfile.websiteUrl || "");
    setInputValue("businessProfileWebsiteTitle", safeProfile.websiteTitle || "");
    setInputValue("businessProfileWebsiteSummary", safeProfile.websiteSummary || "");
    setInputValue("businessProfileWebsiteImageUrl", safeProfile.websiteImageUrl || "");
    setInputValue("businessProfileServices", formatServicesForEditor(safeProfile.services || []));
    const hours = safeProfile.hours && typeof safeProfile.hours === "object" ? safeProfile.hours : {};
    setInputValue("businessHoursMonday", hours.monday || "Closed");
    setInputValue("businessHoursTuesday", hours.tuesday || "Closed");
    setInputValue("businessHoursWednesday", hours.wednesday || "Closed");
    setInputValue("businessHoursThursday", hours.thursday || "Closed");
    setInputValue("businessHoursFriday", hours.friday || "Closed");
    setInputValue("businessHoursSaturday", hours.saturday || "Closed");
    setInputValue("businessHoursSunday", hours.sunday || "Closed");
  }

  async function saveSubscriberBusinessProfile(payload) {
    const response = await window.fetch("/api/businesses/me/profile", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Unable to save business profile.");
    applyBusinessProfileSnapshot(data?.business || {});
    return data?.business || {};
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

  function getSubscriberBusinessProfilePreview(snapshot = {}) {
    const profile = snapshot && typeof snapshot === "object" ? snapshot : {};
    return {
      ...profile,
      businessName: profile.businessName || "Lexi Luxe Studio",
      businessType: profile.businessType || "hair_salon",
      businessEmail: profile.businessEmail || "hello@lexiluxestudio.co.uk",
      phone: profile.phone || "+44 20 7946 0958",
      address: profile.address || "18 Rose Lane",
      city: profile.city || "London",
      country: profile.country || "United Kingdom",
      postcode: profile.postcode || "SW1A 1AA",
      description: profile.description || "A modern salon space focused on colour, styling, and calm front-desk service.",
      websiteUrl: profile.websiteUrl || "https://www.lexiluxestudio.co.uk",
      websiteTitle: profile.websiteTitle || "Lexi Luxe Studio",
      websiteSummary: profile.websiteSummary || "Luxury hair appointments, colour work, and styling with a polished customer experience."
    };
  }

  function getSubscriberBusinessProfileFormValues(snapshot = {}) {
    const profile = snapshot && typeof snapshot === "object" ? snapshot : {};
    return {
      businessName: profile.businessName || "",
      businessType: profile.businessType || "hair_salon",
      businessEmail: profile.businessEmail || "",
      phone: profile.phone || "",
      city: profile.city || "",
      country: profile.country || "",
      postcode: profile.postcode || "",
      address: profile.address || "",
      description: profile.description || "",
      websiteUrl: profile.websiteUrl || "",
      websiteSummary: profile.websiteSummary || ""
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
              </div>
              <p class="section-copy business-hub-modal-editor-copy" id="businessHubModalEditorCopy"></p>
              <p class="business-hub-modal-editor-feedback" id="businessHubModalEditorFeedback" hidden></p>
              <form class="compact-form" id="businessHubModalEditorForm">
                <div class="business-hub-modal-editor-fields" id="businessHubModalEditorFields"></div>
                <div class="business-hub-modal-editor-actions">
                  <button class="btn btn-small" type="submit" id="businessHubModalSaveBtn">Save updates</button>
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
    const editorFeedback = modal.querySelector("#businessHubModalEditorFeedback");
    const editorFields = modal.querySelector("#businessHubModalEditorFields");
    const editorForm = modal.querySelector("#businessHubModalEditorForm");
    const saveBtn = modal.querySelector("#businessHubModalSaveBtn");
    const itemTitle = String(item?.title || item?.mod?.label || "Business area");
    const roleLabel = role === "admin" ? "admin" : "subscriber";
    const isBusinessProfileCard = item?.key === "business_profile";
    const isEditableBusinessProfileCard = isBusinessProfileCard && role === "subscriber";

    modal.classList.toggle("business-hub-modal-simple-form", Boolean(isEditableBusinessProfileCard));

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
      if (highlightKicker) highlightKicker.textContent = "Business information";
      if (highlightTitle) highlightTitle.textContent = "Keep your business details current";
      if (summary) {
        summary.textContent = "View and update the core business information your dashboard and customer profile rely on.";
      }
      if (highlightBody instanceof HTMLElement) {
        highlightBody.innerHTML = `
          <div class="business-hub-simple-note">
            <strong>${escapeHtml(profile.businessName || "Your business")}</strong>
            <p>Use this form to keep your business name, contact details, address, and website information up to date.</p>
          </div>
        `;
      }
      if (infoHeading) infoHeading.textContent = "Current details";
      if (jobsHeading) jobsHeading.textContent = "What this updates";
      if (infoList) {
        infoList.innerHTML = renderInfoList([
          `Business name: ${profile.businessName || "Not added yet"}`,
          `Business email: ${profile.businessEmail || "Not added yet"}`,
          `Phone number: ${profile.phone || "Not added yet"}`,
          `Address: ${[profile.address, profile.city, profile.postcode, profile.country].filter(Boolean).join(", ") || "Not added yet"}`
        ]);
      }
      if (jobsList) {
        jobsList.innerHTML = renderInfoList([
          "Your business profile details used across the dashboard",
          "Customer-facing contact and website information",
          "The salon description and summary shown in profile areas"
        ]);
      }
      if (outcomesList) {
        outcomesList.innerHTML = renderInfoList([
          "Keep the business profile accurate",
          "Reduce mismatched contact details",
          "Make it easier to update core information quickly"
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
        if (editorFeedback instanceof HTMLElement) {
          editorFeedback.hidden = true;
          editorFeedback.textContent = "";
          editorFeedback.dataset.state = "";
        }
        if (editorKicker) {
          editorKicker.textContent = role === "admin" ? "Admin editing" : "Subscriber editing";
        }
        if (editorHeading) {
          editorHeading.textContent = isEditableBusinessProfileCard ? "Business information" : `Update ${itemTitle}`;
        }
        if (editorCopy) {
          editorCopy.textContent = isEditableBusinessProfileCard
            ? "Review the business information here, then click Edit if you want to make changes."
            : `Save private ${roleLabel} notes, updates, and next actions for ${itemTitle.toLowerCase()}.`;
        }
        if (isEditableBusinessProfileCard) {
          const snapshot = getSubscriberBusinessProfileSnapshot();
          const profilePreview = getSubscriberBusinessProfilePreview(snapshot);
          const profileForm = getSubscriberBusinessProfileFormValues(snapshot);
          editorFields.innerHTML = `
            <div class="business-hub-info-toolbar">
              <button class="btn btn-small" type="button" id="businessHubInfoEditBtn">Edit</button>
            </div>
            <div class="business-hub-modal-editor-grid">
              <label class="business-hub-modal-editor-field">
                <span>Business name</span>
                <input name="businessName" type="text" value="${escapeHtml(profileForm.businessName)}" placeholder="${escapeHtml(profilePreview.businessName || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Business type</span>
                <select name="businessType" disabled>
                  <option value="hair_salon"${profileForm.businessType === "hair_salon" ? " selected" : ""}>Hair Salon</option>
                  <option value="barbershop"${profileForm.businessType === "barbershop" ? " selected" : ""}>Barbershop</option>
                  <option value="beauty_salon"${profileForm.businessType === "beauty_salon" ? " selected" : ""}>Beauty Salon</option>
                </select>
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Business email</span>
                <input name="businessEmail" type="email" value="${escapeHtml(profileForm.businessEmail)}" placeholder="${escapeHtml(profilePreview.businessEmail || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Phone number</span>
                <input name="phone" type="text" value="${escapeHtml(profileForm.phone)}" placeholder="${escapeHtml(profilePreview.phone || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field">
                <span>City</span>
                <input name="city" type="text" value="${escapeHtml(profileForm.city)}" placeholder="${escapeHtml(profilePreview.city || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Country</span>
                <input name="country" type="text" value="${escapeHtml(profileForm.country)}" placeholder="${escapeHtml(profilePreview.country || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Postcode</span>
                <input name="postcode" type="text" value="${escapeHtml(profileForm.postcode)}" placeholder="${escapeHtml(profilePreview.postcode || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field business-hub-modal-editor-field-wide">
                <span>Address</span>
                <input name="address" type="text" value="${escapeHtml(profileForm.address)}" placeholder="${escapeHtml(profilePreview.address || "")}" required readonly />
              </label>
              <label class="business-hub-modal-editor-field business-hub-modal-editor-field-wide">
                <span>Business description</span>
                <textarea name="description" rows="4" placeholder="${escapeHtml(profilePreview.description || "Describe the business customers should recognise.")}" readonly>${escapeHtml(profileForm.description)}</textarea>
              </label>
              <label class="business-hub-modal-editor-field">
                <span>Website URL</span>
                <input name="websiteUrl" type="url" value="${escapeHtml(profileForm.websiteUrl)}" placeholder="${escapeHtml(profilePreview.websiteUrl || "")}" readonly />
              </label>
              <label class="business-hub-modal-editor-field business-hub-modal-editor-field-wide">
                <span>Website summary</span>
                <textarea name="websiteSummary" rows="3" placeholder="${escapeHtml(profilePreview.websiteSummary || "Short customer-facing summary for search and profile cards.")}" readonly>${escapeHtml(profileForm.websiteSummary)}</textarea>
              </label>
            </div>
          `;
          const editBtn = editorFields.querySelector("#businessHubInfoEditBtn");
          const readOnlyInputs = Array.from(editorFields.querySelectorAll("input[readonly], textarea[readonly]"));
          const disabledSelects = Array.from(editorFields.querySelectorAll("select:disabled"));
          if (saveBtn instanceof HTMLButtonElement) {
            saveBtn.disabled = true;
          }
          if (editBtn instanceof HTMLButtonElement) {
            editBtn.addEventListener("click", () => {
              readOnlyInputs.forEach((input) => input.removeAttribute("readonly"));
              disabledSelects.forEach((select) => select.removeAttribute("disabled"));
              editBtn.hidden = true;
              if (saveBtn instanceof HTMLButtonElement) {
                saveBtn.disabled = false;
              }
              if (editorHeading) editorHeading.textContent = "Edit business information";
              if (editorCopy) editorCopy.textContent = "Update the details below and save when you are ready.";
              if (editorFeedback instanceof HTMLElement) {
                editorFeedback.hidden = false;
                editorFeedback.dataset.state = "info";
                editorFeedback.textContent = "Example fallback text is only shown as a guide. Add your real business details before saving.";
              }
            });
          }
          editorForm.onsubmit = async (event) => {
            event.preventDefault();
            if (!(editorForm instanceof HTMLFormElement)) return;
            try {
              if (saveBtn instanceof HTMLButtonElement) {
                saveBtn.disabled = true;
                saveBtn.textContent = "Saving...";
              }
              const formData = new FormData(editorForm);
              await saveSubscriberBusinessProfile({
                name: String(formData.get("businessName") || "").trim(),
                type: String(formData.get("businessType") || "hair_salon").trim(),
                phone: String(formData.get("phone") || "").trim(),
                email: String(formData.get("businessEmail") || "").trim(),
                city: String(formData.get("city") || "").trim(),
                country: String(formData.get("country") || "").trim(),
                postcode: String(formData.get("postcode") || "").trim(),
                address: String(formData.get("address") || "").trim(),
                description: String(formData.get("description") || "").trim(),
                websiteUrl: String(formData.get("websiteUrl") || "").trim(),
                websiteTitle: snapshot.websiteTitle || String(formData.get("businessName") || "").trim(),
                websiteSummary: String(formData.get("websiteSummary") || "").trim(),
                websiteImageUrl: snapshot.websiteImageUrl || snapshot.socialImageUrl || "",
                hours: getBusinessHoursPayload(),
                services: parseServiceEditorText(getInputValue("businessProfileServices"))
              });
              if (editorHeading) editorHeading.textContent = "Business information";
              if (editorCopy) {
                editorCopy.textContent = "Review the business information here, then click Edit if you want to make changes.";
              }
              if (editorFeedback instanceof HTMLElement) {
                editorFeedback.hidden = false;
                editorFeedback.dataset.state = "success";
                editorFeedback.textContent = "Business information saved.";
              }
              openBusinessHubModal(item);
            } catch (error) {
              if (editorFeedback instanceof HTMLElement) {
                editorFeedback.hidden = false;
                editorFeedback.dataset.state = "error";
                editorFeedback.textContent = error?.message || "Unable to save business information.";
              }
            } finally {
              if (saveBtn instanceof HTMLButtonElement) {
                saveBtn.textContent = "Save updates";
                if (!modal.hidden) {
                  saveBtn.disabled = false;
                }
              }
            }
          };
        } else {
          if (saveBtn instanceof HTMLButtonElement) {
            saveBtn.disabled = false;
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
          };
        }
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
