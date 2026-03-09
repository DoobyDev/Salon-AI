// Managed waitlist actions extracted from the global dashboard click handler.
export function createManageWaitlistActionsRuntime(deps) {
  const {
    openManageForm,
    showManageToast,
    upsertWaitlistEntry,
    setWaitlistStatus
  } = deps || {};

  async function handleManageWaitlistClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddWaitlist") {
      const values = await openManageForm?.({
        title: "Add Waitlist Entry",
        submitLabel: "Save Entry",
        fields: [
          { id: "customerName", label: "Customer Name", required: true },
          { id: "customerPhone", label: "Customer Phone" },
          { id: "customerEmail", label: "Customer Email" },
          { id: "service", label: "Service Preference" },
          { id: "preferredDate", label: "Preferred Date", type: "date" },
          { id: "preferredTime", label: "Preferred Time", type: "time" }
        ]
      });
      if (!values) return true;
      try {
        await upsertWaitlistEntry?.({
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: String(values.customerEmail || "").toLowerCase(),
          service: values.service,
          preferredDate: values.preferredDate,
          preferredTime: values.preferredTime
        });
        showManageToast?.("Waitlist entry added.");
      } catch (error) {
        setWaitlistStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageWaitlistClick
  };
}
