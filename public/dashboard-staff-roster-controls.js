// Staff roster form controls separate from rota grid interactions.
export function createStaffRosterControlsRuntime(deps) {
  const {
    parseShiftDaysInput,
    setStaffStatus,
    upsertStaffMember,
    staffRosterForm,
    staffNameInput,
    staffRoleInput,
    staffAvailabilityInput,
    staffShiftDaysInput
  } = deps || {};

  function bindStaffRosterControlsEvents() {
    staffRosterForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = String(staffNameInput?.value || "").trim();
      const role = String(staffRoleInput?.value || "staff").trim();
      const availability = String(staffAvailabilityInput?.value || "off_duty").trim();
      const shiftDays = parseShiftDaysInput?.(staffShiftDaysInput?.value || "");
      if (!name) {
        setStaffStatus?.("Staff name is required.", true);
        return;
      }
      try {
        setStaffStatus?.("Saving staff member...");
        await upsertStaffMember?.({ name, role, availability, shiftDays });
        if (staffNameInput) staffNameInput.value = "";
        if (staffShiftDaysInput) staffShiftDaysInput.value = "";
        setStaffStatus?.("Staff member saved.");
      } catch (error) {
        setStaffStatus?.(error.message, true);
      }
    });
  }

  return {
    bindStaffRosterControlsEvents
  };
}
