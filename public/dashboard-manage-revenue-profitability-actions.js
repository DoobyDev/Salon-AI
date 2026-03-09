// Managed revenue and profitability actions extracted from the global dashboard click handler.
export function createManageRevenueProfitabilityActionsRuntime(deps) {
  const {
    openManageForm,
    openManageConfirm,
    showManageToast,
    saveRevenueChannelSpend,
    setRevenueStatus,
    upsertPayrollInput,
    upsertProfitabilityCosts,
    setProfitabilityStatus,
    profitRentInput,
    profitUtilitiesInput,
    profitSoftwareInput,
    profitOtherInput,
    profitCogsPercentInput
  } = deps || {};

  async function handleManageRevenueProfitabilityClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddRevenueSpend") {
      const values = await openManageForm?.({
        title: "Add Revenue Spend",
        submitLabel: "Save",
        fields: [
          { id: "channel", label: "Channel", value: "direct", required: true },
          { id: "spend", label: "Spend", type: "number", value: "0", required: true }
        ]
      });
      if (!values) return true;
      const channel = String(values.channel || "").trim().toLowerCase();
      const spend = Number(values.spend || 0);
      if (!channel || !Number.isFinite(spend) || spend < 0) return true;
      try {
        setRevenueStatus?.("Saving channel spend...");
        await saveRevenueChannelSpend?.({ channel, spend });
        setRevenueStatus?.("Channel spend saved.");
        showManageToast?.("Revenue spend added.");
      } catch (error) {
        setRevenueStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("revenue-edit-spend")) {
      const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
      const currentSpend = Number(target.getAttribute("data-spend") || 0);
      if (!channel) return true;
      const values = await openManageForm?.({
        title: "Edit Revenue Spend",
        submitLabel: "Save",
        fields: [{ id: "spend", label: "Spend", type: "number", value: String(currentSpend), required: true }]
      });
      if (!values) return true;
      const spend = Number(values.spend || currentSpend);
      if (!Number.isFinite(spend) || spend < 0) return true;
      try {
        setRevenueStatus?.("Updating channel spend...");
        await saveRevenueChannelSpend?.({ channel, spend });
        setRevenueStatus?.("Channel spend updated.");
        showManageToast?.("Revenue spend updated.");
      } catch (error) {
        setRevenueStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("revenue-delete-spend")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Revenue Spend",
        message: "Set this channel spend to zero?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
      if (!channel) return true;
      try {
        setRevenueStatus?.("Removing channel spend...");
        await saveRevenueChannelSpend?.({ channel, spend: 0 });
        setRevenueStatus?.("Channel spend removed.");
        showManageToast?.("Revenue spend deleted.");
      } catch (error) {
        setRevenueStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageAddPayrollEntry") {
      const values = await openManageForm?.({
        title: "Add Payroll Entry",
        submitLabel: "Save",
        fields: [
          { id: "staffName", label: "Staff Name", required: true },
          { id: "role", label: "Role" },
          { id: "hours", label: "Hours", type: "number", required: true, value: "0" },
          { id: "hourlyRate", label: "Hourly Rate", type: "number", required: true, value: "0" },
          { id: "bonus", label: "Bonus", type: "number", value: "0" }
        ]
      });
      if (!values) return true;
      const staffName = String(values.staffName || "").trim();
      if (!staffName) return true;
      const role = String(values.role || "").trim();
      const hours = Number(values.hours || 0);
      const hourlyRate = Number(values.hourlyRate || 0);
      const bonus = Number(values.bonus || 0);
      if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return true;
      try {
        setProfitabilityStatus?.("Saving payroll entry...");
        await upsertPayrollInput?.({ staffName, role, hours, hourlyRate, bonus });
        setProfitabilityStatus?.("Payroll entry saved.");
        showManageToast?.("Payroll entry added.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageEditCostInputs") {
      const values = await openManageForm?.({
        title: "Edit Cost Inputs",
        submitLabel: "Save",
        fields: [
          { id: "rent", label: "Rent", type: "number", value: String(profitRentInput?.value || 0) },
          { id: "utilities", label: "Utilities", type: "number", value: String(profitUtilitiesInput?.value || 0) },
          { id: "software", label: "Software", type: "number", value: String(profitSoftwareInput?.value || 0) },
          { id: "other", label: "Other Fixed Costs", type: "number", value: String(profitOtherInput?.value || 0) },
          { id: "cogsPercent", label: "COGS %", type: "number", value: String(profitCogsPercentInput?.value || 0) }
        ]
      });
      if (!values) return true;
      const rent = Number(values.rent || 0);
      const utilities = Number(values.utilities || 0);
      const software = Number(values.software || 0);
      const other = Number(values.other || 0);
      const cogsPercent = Number(values.cogsPercent || 0);
      if ([rent, utilities, software, other, cogsPercent].some((value) => !Number.isFinite(value) || value < 0) || cogsPercent > 95) {
        return true;
      }
      try {
        setProfitabilityStatus?.("Saving cost inputs...");
        await upsertProfitabilityCosts?.({ rent, utilities, software, other, cogsPercent });
        setProfitabilityStatus?.("Cost inputs saved.");
        showManageToast?.("Cost inputs updated.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageDeleteCostInputs") {
      const confirmed = await openManageConfirm?.({
        title: "Delete Cost Inputs",
        message: "Reset all cost inputs to zero?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      try {
        setProfitabilityStatus?.("Removing cost inputs...");
        await upsertProfitabilityCosts?.({ rent: 0, utilities: 0, software: 0, other: 0, cogsPercent: 0 });
        setProfitabilityStatus?.("Cost inputs removed.");
        showManageToast?.("Cost inputs deleted.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageRevenueProfitabilityClick
  };
}
