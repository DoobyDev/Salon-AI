// Business profile and social link setup runtime.
export function createBusinessProfileRuntime(deps) {
  const {
    win = window,
    doc = document,
    fetchImpl = fetch,
    canManageBusinessModules,
    withManagedBusiness,
    headers,
    renderBusinessGrowthPanel,
    setDashActionStatus,
    showManageToast,
    escapeHtml,
    socialMediaForm,
    facebookInput,
    instagramInput,
    twitterInput,
    linkedinInput,
    tiktokInput,
    customSocialInput,
    socialImageInput,
    socialMediaPreview,
    businessProfileOpenSetup,
    businessProfileSetupOverlay,
    businessProfileSetupClose,
    businessProfileSetupCancel,
    businessProfileForm,
    businessProfileStatus,
    businessProfileName,
    businessProfileType,
    businessProfilePhone,
    businessProfileEmail,
    businessProfileCity,
    businessProfileCountry,
    businessProfilePostcode,
    businessProfileAddress,
    businessProfileDescription,
    businessProfileWebsiteUrl,
    businessProfileWebsiteTitle,
    businessProfileWebsiteSummary,
    businessProfileWebsiteImageUrl,
    businessHoursMonday,
    businessHoursTuesday,
    businessHoursWednesday,
    businessHoursThursday,
    businessHoursFriday,
    businessHoursSaturday,
    businessHoursSunday,
    businessProfileServices,
    businessProfileApplyTemplate
  } = deps || {};

  function renderSocialMediaPreview(data) {
    if (!socialMediaPreview) return;
    socialMediaPreview.innerHTML = "";
    const icons = {
      Facebook: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>",
      Instagram: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>",
      Twitter: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#1DA1F2' d='M22.46 6c-.77.35-1.6.59-2.46.69a4.28 4.28 0 0 0 1.88-2.36c-.83.49-1.75.85-2.72 1.04A4.27 4.27 0 0 0 16.11 4c-2.36 0-4.28 1.92-4.28 4.28c0 .34.04.67.11.98C7.69 8.98 4.07 7.1 1.64 4.16c-.37.64-.58 1.38-.58 2.17c0 1.5.76 2.83 1.92 3.61c-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25c-.36.1-.74.16-1.13.16c-.28 0-.54-.03-.8-.08c.54 1.68 2.1 2.9 3.95 2.93c-1.45 1.14-3.28 1.82-5.27 1.82c-.34 0-.67-.02-1-.06c1.88 1.21 4.12 1.92 6.53 1.92c7.84 0 12.13-6.5 12.13-12.13c0-.18-.01-.36-.02-.54c.83-.6 1.55-1.34 2.12-2.19z'/></svg>",
      LinkedIn: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#0077B5' d='M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-2.5v-8.75h2.5v8.75zm-1.25-10.25c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zm13 10.25h-2.5v-4.25c0-1.02-.02-2.33-1.42-2.33c-1.42 0-1.64 1.11-1.64 2.25v4.33h-2.5v-8.75h2.4v1.19h.03c.33-.63 1.13-1.29 2.33-1.29c2.5 0 2.96 1.64 2.96 3.77v5.08zm-10.25-8.75h-2.5v8.75h2.5v-8.75zm-1.25-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z'/></svg>",
      TikTok: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#000000' d='M12.5 2v14.5c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-2.21 1.79-4 4-4c.34 0 .67.04 1 .09V2h3zm7.5 7c-1.1 0-2-.9-2-2V2h-3v7c0 2.21 1.79 4 4 4c.34 0 .67-.04 1-.09V9z'/></svg>"
    };
    const links = [
      { key: "socialFacebook", label: "Facebook", value: data.socialFacebook },
      { key: "socialInstagram", label: "Instagram", value: data.socialInstagram },
      { key: "socialTwitter", label: "Twitter", value: data.socialTwitter },
      { key: "socialLinkedin", label: "LinkedIn", value: data.socialLinkedin },
      { key: "socialTiktok", label: "TikTok", value: data.socialTiktok },
      { key: "customSocial", label: "Other", value: data.customSocial }
    ];
    links.forEach((item) => {
      if (item.value) {
        const div = doc.createElement("div");
        div.innerHTML = `
        ${icons[item.label] || ""} <strong>${item.label}:</strong> <a href="${item.value}" target="_blank">${item.value}</a>
        <span class="manage-only" style="margin-left:0.45rem;">
          <button class="btn btn-ghost social-edit-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}" data-social-value="${item.value.replaceAll('"', "&quot;")}">Edit</button>
          <button class="btn btn-ghost social-delete-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}">Delete</button>
        </span>
      `;
        socialMediaPreview.appendChild(div);
      }
    });
    if (data.socialImageUrl) {
      const img = doc.createElement("img");
      img.src = data.socialImageUrl;
      img.alt = "Social Media Image";
      img.style.maxWidth = "120px";
      img.style.marginTop = "0.5rem";
      socialMediaPreview.appendChild(img);
      const imageActions = doc.createElement("div");
      imageActions.className = "manage-only";
      imageActions.style.marginTop = "0.45rem";
      imageActions.innerHTML =
        '<button class="btn btn-ghost social-clear-image" type="button">Delete Image</button>';
      socialMediaPreview.appendChild(imageActions);
    }
  }

  function setSocialMediaFormValues(data) {
    if (facebookInput) facebookInput.value = String(data?.socialFacebook || "");
    if (instagramInput) instagramInput.value = String(data?.socialInstagram || "");
    if (twitterInput) twitterInput.value = String(data?.socialTwitter || "");
    if (linkedinInput) linkedinInput.value = String(data?.socialLinkedin || "");
    if (tiktokInput) tiktokInput.value = String(data?.socialTiktok || "");
    if (customSocialInput) customSocialInput.value = String(data?.customSocial || "");
    if (socialImageInput) socialImageInput.value = String(data?.socialImageUrl || "");
  }

  function validateHttpUrl(url) {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function loadSocialMediaLinks() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/businesses/me/social-media"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load social media links.");
    setSocialMediaFormValues(data);
    renderSocialMediaPreview(data);
    renderBusinessGrowthPanel?.();
  }

  function collectSocialMediaPayloadFromInputs() {
    return {
      socialFacebook: String(facebookInput?.value || "").trim(),
      socialInstagram: String(instagramInput?.value || "").trim(),
      socialTwitter: String(twitterInput?.value || "").trim(),
      socialLinkedin: String(linkedinInput?.value || "").trim(),
      socialTiktok: String(tiktokInput?.value || "").trim(),
      customSocial: String(customSocialInput?.value || "").trim(),
      socialImageUrl: String(socialImageInput?.value || "").trim()
    };
  }

  function validateSocialPayload(payload) {
    const fields = [
      { name: "Facebook", value: payload.socialFacebook },
      { name: "Instagram", value: payload.socialInstagram },
      { name: "Twitter", value: payload.socialTwitter },
      { name: "LinkedIn", value: payload.socialLinkedin },
      { name: "TikTok", value: payload.socialTiktok },
      { name: "Other", value: payload.customSocial },
      { name: "Image URL", value: payload.socialImageUrl }
    ];
    for (const field of fields) {
      if (field.value && !validateHttpUrl(field.value)) {
        throw new Error(`Invalid URL for ${field.name}. Please enter a valid link.`);
      }
    }
  }

  async function saveSocialMediaLinks(payload) {
    validateSocialPayload(payload);
    const res = await fetchImpl(withManagedBusiness?.("/api/businesses/me/social-media"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save social media.");
    setSocialMediaFormValues(data);
    renderSocialMediaPreview(data);
    renderBusinessGrowthPanel?.();
  }

  function setBusinessProfileStatus(message, isError = false) {
    if (!businessProfileStatus) return;
    businessProfileStatus.textContent = String(message || "");
    businessProfileStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function openBusinessProfileSetupModal() {
    if (!businessProfileSetupOverlay) return;
    businessProfileSetupOverlay.classList.add("is-open");
    businessProfileSetupOverlay.setAttribute("aria-hidden", "false");
    win.requestAnimationFrame(() => businessProfileName?.focus());
  }

  function closeBusinessProfileSetupModal() {
    if (!businessProfileSetupOverlay) return;
    businessProfileSetupOverlay.classList.remove("is-open");
    businessProfileSetupOverlay.setAttribute("aria-hidden", "true");
    businessProfileOpenSetup?.focus();
  }

  function formatServicesForEditor(rows = []) {
    return (Array.isArray(rows) ? rows : [])
      .map((row) => `${String(row.name || "").trim()} | ${Number(row.durationMin || 0)} | ${Number(row.price || 0)}`)
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
      if (parts.length < 3) {
        throw new Error("Service format must be: Name | DurationMin | Price");
      }
      const [name, durationRaw, priceRaw] = parts;
      const durationMin = Number(durationRaw);
      const price = Number(priceRaw);
      if (!name || !Number.isFinite(durationMin) || durationMin < 5 || !Number.isFinite(price) || price < 0) {
        throw new Error("Each service requires a valid name, duration (>=5), and price (>=0).");
      }
      return { name, durationMin, price };
    });
    if (!services.length) {
      throw new Error("Add at least one service.");
    }
    return services;
  }

  function getBusinessHoursPayload() {
    return {
      monday: String(businessHoursMonday?.value || "").trim() || "Closed",
      tuesday: String(businessHoursTuesday?.value || "").trim() || "Closed",
      wednesday: String(businessHoursWednesday?.value || "").trim() || "Closed",
      thursday: String(businessHoursThursday?.value || "").trim() || "Closed",
      friday: String(businessHoursFriday?.value || "").trim() || "Closed",
      saturday: String(businessHoursSaturday?.value || "").trim() || "Closed",
      sunday: String(businessHoursSunday?.value || "").trim() || "Closed"
    };
  }

  function setBusinessProfileFormValues(profile) {
    const business = profile && typeof profile === "object" ? profile : {};
    if (businessProfileName) businessProfileName.value = String(business.name || "");
    if (businessProfileType) businessProfileType.value = String(business.type || "hair_salon");
    if (businessProfilePhone) businessProfilePhone.value = String(business.phone || "");
    if (businessProfileEmail) businessProfileEmail.value = String(business.email || "");
    if (businessProfileCity) businessProfileCity.value = String(business.city || "");
    if (businessProfileCountry) businessProfileCountry.value = String(business.country || "");
    if (businessProfilePostcode) businessProfilePostcode.value = String(business.postcode || "");
    if (businessProfileAddress) businessProfileAddress.value = String(business.address || "");
    if (businessProfileDescription) businessProfileDescription.value = String(business.description || "");
    if (businessProfileWebsiteUrl) businessProfileWebsiteUrl.value = String(business.websiteUrl || "");
    if (businessProfileWebsiteTitle) businessProfileWebsiteTitle.value = String(business.websiteTitle || "");
    if (businessProfileWebsiteSummary) businessProfileWebsiteSummary.value = String(business.websiteSummary || "");
    if (businessProfileWebsiteImageUrl) businessProfileWebsiteImageUrl.value = String(business.websiteImageUrl || "");
    const hours = business.hours && typeof business.hours === "object" ? business.hours : {};
    if (businessHoursMonday) businessHoursMonday.value = String(hours.monday || "Closed");
    if (businessHoursTuesday) businessHoursTuesday.value = String(hours.tuesday || "Closed");
    if (businessHoursWednesday) businessHoursWednesday.value = String(hours.wednesday || "Closed");
    if (businessHoursThursday) businessHoursThursday.value = String(hours.thursday || "Closed");
    if (businessHoursFriday) businessHoursFriday.value = String(hours.friday || "Closed");
    if (businessHoursSaturday) businessHoursSaturday.value = String(hours.saturday || "Closed");
    if (businessHoursSunday) businessHoursSunday.value = String(hours.sunday || "Closed");
    if (businessProfileServices) businessProfileServices.value = formatServicesForEditor(business.services || []);

    if (business.name) doc.getElementById("frontDeskBusinessName").textContent = String(business.name);
    if (typeof business.description === "string") doc.getElementById("frontDeskDescription").textContent = business.description || "Business description goes here.";
    const serviceShell = doc.getElementById("frontDeskServices");
    if (serviceShell) {
      serviceShell.innerHTML = "";
      (Array.isArray(business.services) ? business.services : []).slice(0, 6).forEach((svc) => {
        const div = doc.createElement("div");
        div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
        div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${escapeHtml?.(svc.name || "Service")}</span> <span style='color:var(--muted);'>&#163;${Number(svc.price || 0)} | ${Number(svc.durationMin || 0)}min</span>`;
        serviceShell.appendChild(div);
      });
    }
  }

  async function loadBusinessProfile() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/businesses/me/profile"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load business profile.");
    setBusinessProfileFormValues(data.business || {});
    renderBusinessGrowthPanel?.();
  }

  async function saveBusinessProfile(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/businesses/me/profile"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save business profile.");
    setBusinessProfileFormValues(data.business || {});
    renderBusinessGrowthPanel?.();
  }

  async function applyBusinessTemplate(type) {
    const res = await fetchImpl(withManagedBusiness?.("/api/businesses/me/profile/apply-template"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ type: String(type || "").trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to apply template.");
    setBusinessProfileFormValues(data.business || {});
    renderBusinessGrowthPanel?.();
  }

  function bindBusinessProfileEvents() {
    socialMediaForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        setDashActionStatus?.("Saving social links...");
        await saveSocialMediaLinks(collectSocialMediaPayloadFromInputs());
        setDashActionStatus?.("Social links saved.");
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    businessProfileOpenSetup?.addEventListener("click", () => {
      if (!canManageBusinessModules?.()) return;
      openBusinessProfileSetupModal();
    });
    businessProfileSetupClose?.addEventListener("click", closeBusinessProfileSetupModal);
    businessProfileSetupCancel?.addEventListener("click", closeBusinessProfileSetupModal);
    businessProfileSetupOverlay?.addEventListener("click", (event) => {
      if (event.target === businessProfileSetupOverlay) closeBusinessProfileSetupModal();
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (businessProfileSetupOverlay?.classList.contains("is-open")) closeBusinessProfileSetupModal();
    });

    businessProfileForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!canManageBusinessModules?.()) return;
      setBusinessProfileStatus("Saving business profile...");
      try {
        const services = parseServiceEditorText(String(businessProfileServices?.value || ""));
        await saveBusinessProfile({
          name: String(businessProfileName?.value || "").trim(),
          type: String(businessProfileType?.value || "hair_salon").trim(),
          phone: String(businessProfilePhone?.value || "").trim(),
          email: String(businessProfileEmail?.value || "").trim(),
          city: String(businessProfileCity?.value || "").trim(),
          country: String(businessProfileCountry?.value || "").trim(),
          postcode: String(businessProfilePostcode?.value || "").trim(),
          address: String(businessProfileAddress?.value || "").trim(),
          description: String(businessProfileDescription?.value || "").trim(),
          websiteUrl: String(businessProfileWebsiteUrl?.value || "").trim(),
          websiteTitle: String(businessProfileWebsiteTitle?.value || "").trim(),
          websiteSummary: String(businessProfileWebsiteSummary?.value || "").trim(),
          websiteImageUrl: String(businessProfileWebsiteImageUrl?.value || "").trim(),
          hours: getBusinessHoursPayload(),
          services
        });
        setBusinessProfileStatus("Business profile saved.");
        showManageToast?.("Business profile saved.");
      } catch (error) {
        setBusinessProfileStatus(error.message, true);
      }
    });

    businessProfileApplyTemplate?.addEventListener("click", async () => {
      if (!canManageBusinessModules?.()) return;
      const templateType = String(businessProfileType?.value || "hair_salon").trim();
      const confirmed = win.confirm(
        "Reset to selected template defaults now?\n\nThis will replace:\n- Business type\n- Description\n- Opening hours\n- Services list\n\nIt will NOT change your name, phone, email, location, or website fields."
      );
      if (!confirmed) return;
      setBusinessProfileStatus("Applying template...");
      try {
        await applyBusinessTemplate(templateType);
        setBusinessProfileStatus("Template applied. Services and hours were updated.");
        showManageToast?.("Template applied.");
      } catch (error) {
        setBusinessProfileStatus(error.message, true);
      }
    });
  }

  return {
    renderSocialMediaPreview,
    setSocialMediaFormValues,
    validateHttpUrl,
    loadSocialMediaLinks,
    collectSocialMediaPayloadFromInputs,
    validateSocialPayload,
    saveSocialMediaLinks,
    setBusinessProfileStatus,
    openBusinessProfileSetupModal,
    closeBusinessProfileSetupModal,
    formatServicesForEditor,
    parseServiceEditorText,
    getBusinessHoursPayload,
    setBusinessProfileFormValues,
    loadBusinessProfile,
    saveBusinessProfile,
    applyBusinessTemplate,
    bindBusinessProfileEvents
  };
}
