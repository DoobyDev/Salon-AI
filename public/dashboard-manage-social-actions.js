// Managed social-link actions extracted from the global dashboard click handler.
export function createManageSocialActionsRuntime(deps) {
  const {
    openManageForm,
    openManageConfirm,
    showManageToast,
    collectSocialMediaPayloadFromInputs,
    saveSocialMediaLinks
  } = deps || {};

  async function handleManageSocialClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddSocialLink") {
      const values = await openManageForm?.({
        title: "Add Social Link",
        submitLabel: "Add Link",
        fields: [
          { id: "label", label: "Platform", value: "Facebook" },
          { id: "link", label: "Profile URL", required: true }
        ]
      });
      if (!values) return true;
      const label = String(values.label || "").trim().toLowerCase();
      const link = String(values.link || "").trim();
      if (!link) return true;
      const payload = collectSocialMediaPayloadFromInputs?.() || {};
      const fieldByLabel = {
        facebook: "socialFacebook",
        instagram: "socialInstagram",
        twitter: "socialTwitter",
        linkedin: "socialLinkedin",
        tiktok: "socialTiktok",
        other: "customSocial"
      };
      const key = fieldByLabel[label] || "customSocial";
      payload[key] = link;
      try {
        await saveSocialMediaLinks?.(payload);
        showManageToast?.("Social link added.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageClearSocialLinks") {
      const confirmed = await openManageConfirm?.({
        title: "Delete Social Links",
        message: "Remove all social links and image?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      try {
        await saveSocialMediaLinks?.({
          socialFacebook: "",
          socialInstagram: "",
          socialTwitter: "",
          socialLinkedin: "",
          socialTiktok: "",
          customSocial: "",
          socialImageUrl: ""
        });
        showManageToast?.("Social links deleted.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("social-edit-link")) {
      const key = String(target.getAttribute("data-social-key") || "").trim();
      if (!key) return true;
      const current = String(target.getAttribute("data-social-value") || "").trim();
      const values = await openManageForm?.({
        title: "Edit Social Link",
        submitLabel: "Save",
        fields: [{ id: "url", label: "Profile URL", required: true, value: current }]
      });
      if (!values) return true;
      const next = String(values.url || "").trim();
      if (!next) return true;
      const payload = collectSocialMediaPayloadFromInputs?.() || {};
      payload[key] = next;
      try {
        await saveSocialMediaLinks?.(payload);
        showManageToast?.("Social link updated.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("social-delete-link")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Social Link",
        message: "Remove this social link?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const key = String(target.getAttribute("data-social-key") || "").trim();
      if (!key) return true;
      const payload = collectSocialMediaPayloadFromInputs?.() || {};
      payload[key] = "";
      try {
        await saveSocialMediaLinks?.(payload);
        showManageToast?.("Social link deleted.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("social-clear-image")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Social Image",
        message: "Remove social profile image?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const payload = collectSocialMediaPayloadFromInputs?.() || {};
      payload.socialImageUrl = "";
      try {
        await saveSocialMediaLinks?.(payload);
        showManageToast?.("Social image deleted.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageSocialClick
  };
}
