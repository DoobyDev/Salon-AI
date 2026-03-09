// Remaining booking and staff manage actions extracted from the global dashboard click handler.
export function createManageCoreActionsRuntime(deps) {
  const {
    openManageForm,
    showManageToast,
    getManagedBusinessId,
    getUserBusinessId,
    getUserRole,
    createBooking,
    loadBookings,
    shouldRenderTopMetricsGrid,
    clearMetricsGrid,
    loadMetrics,
    upsertStaffMember,
    setStaffStatus
  } = deps || {};

  async function handleManageCoreClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddBooking") {
      const businessId = String(getManagedBusinessId?.() || getUserBusinessId?.() || "").trim();
      if (!businessId) {
        showManageToast?.("No business selected for booking creation.", "error");
        return true;
      }
      const values = await openManageForm?.({
        title: "Add Booking",
        submitLabel: "Create Booking",
        fields: [
          { id: "customerName", label: "Customer Name", required: true },
          { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+12025550111" },
          { id: "customerEmail", label: "Customer Email" },
          { id: "service", label: "Service", required: true },
          { id: "date", label: "Date", type: "date", required: true },
          { id: "time", label: "Time", type: "time", required: true }
        ]
      });
      if (!values) return true;
      try {
        await createBooking?.({ businessId, ...values });
        await loadBookings?.({ append: false });
        if (getUserRole?.() !== "customer") {
          if (shouldRenderTopMetricsGrid?.()) clearMetricsGrid?.();
          await loadMetrics?.();
        }
        showManageToast?.("Booking created.");
      } catch (error) {
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageAddStaff") {
      const values = await openManageForm?.({
        title: "Add Staff Member",
        submitLabel: "Save Staff",
        fields: [
          { id: "name", label: "Name", required: true },
          { id: "role", label: "Role", value: "stylist" },
          { id: "availability", label: "Availability", value: "on_duty" },
          { id: "shiftDays", label: "Shift Days (comma-separated)" }
        ]
      });
      if (!values) return true;
      try {
        await upsertStaffMember?.({
          name: values.name,
          role: values.role,
          availability: values.availability,
          shiftDays: String(values.shiftDays || "")
            .split(",")
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean)
        });
        showManageToast?.("Staff member added.");
      } catch (error) {
        setStaffStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageCoreClick
  };
}
