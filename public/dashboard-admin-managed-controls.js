// Admin-managed dashboard shortcut controls.
export function createAdminManagedControlsRuntime(deps) {
  const {
    getUserRole,
    getManagedBusinessId,
    getAdminBusinessOptions,
    showSection,
    openInteractiveModulePopup,
    openBusinessAiChatPopup,
    subscriberCalendarSection,
    businessGrowthSection,
    adminManagedOpenCalendarBtn,
    adminManagedOpenHubBtn,
    adminManagedOpenProfileBtn,
    adminManagedAskLexiBtn,
    adminCopilotInput,
    adminCopilotForm
  } = deps || {};

  function bindAdminManagedControlsEvents() {
    adminManagedOpenCalendarBtn?.addEventListener("click", () => {
      if (getUserRole?.() !== "admin" || !getManagedBusinessId?.()) return;
      showSection?.(subscriberCalendarSection);
      subscriberCalendarSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    adminManagedOpenHubBtn?.addEventListener("click", () => {
      if (getUserRole?.() !== "admin" || !getManagedBusinessId?.()) return;
      showSection?.(businessGrowthSection);
      businessGrowthSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    adminManagedOpenProfileBtn?.addEventListener("click", () => {
      if (getUserRole?.() !== "admin" || !getManagedBusinessId?.()) return;
      openInteractiveModulePopup?.("business_information");
    });

    adminManagedAskLexiBtn?.addEventListener("click", () => {
      if (getUserRole?.() !== "admin") return;
      const managedBusinessId = String(getManagedBusinessId?.() || "").trim();
      const business = (Array.isArray(getAdminBusinessOptions?.()) ? getAdminBusinessOptions() : []).find(
        (row) => String(row?.id || "") === managedBusinessId
      );
      const name = String(business?.name || "the selected managed business").trim();
      if (adminCopilotInput) {
        adminCopilotInput.value = `Review ${name}. Tell me the top admin support actions, revenue risks, booking issues, and setup items I should check first.`;
      }
      openBusinessAiChatPopup?.("admin", { trigger: adminManagedAskLexiBtn });
      adminCopilotForm?.requestSubmit();
    });
  }

  return {
    bindAdminManagedControlsEvents
  };
}
