// Commercial, revenue, and profitability local form/list bindings.
export function createBusinessControlsEventsRuntime(deps) {
  const {
    getManageModeEnabled,
    isDashboardManagerRole,
    openManageForm,
    openManageConfirm,
    showManageToast,
    upsertMembership,
    upsertPackage,
    issueGiftCard,
    redeemGiftCard,
    upsertMerchItem,
    saveRevenueChannelSpend,
    upsertPayrollInput,
    removePayrollInput,
    upsertProfitabilityCosts,
    setCommercialStatus,
    setMerchStatus,
    setRevenueStatus,
    setProfitabilityStatus,
    getProfitabilityPayload,
    membershipForm,
    membershipNameInput,
    membershipPriceInput,
    membershipCycleInput,
    membershipBenefitsInput,
    packageForm,
    packageNameInput,
    packagePriceInput,
    packageSessionsInput,
    giftCardForm,
    giftPurchaserInput,
    giftRecipientInput,
    giftBalanceInput,
    giftExpiresInput,
    merchImageFileInput,
    merchForm,
    merchNameInput,
    merchPriceInput,
    merchInventoryInput,
    merchImageUrlInput,
    merchDescriptionInput,
    merchShippingInput,
    merchShippingCostInput,
    getMerchImageUploadData,
    setMerchImageUploadData,
    giftCardList,
    revenueSpendForm,
    revenueChannelInput,
    revenueSpendInput,
    profitPayrollForm,
    profitStaffNameInput,
    profitStaffRoleInput,
    profitStaffHoursInput,
    profitStaffRateInput,
    profitStaffBonusInput,
    profitPayrollList,
    profitCostsForm,
    profitRentInput,
    profitUtilitiesInput,
    profitSoftwareInput,
    profitOtherInput,
    profitCogsPercentInput
  } = deps || {};

  function bindBusinessControlsEvents() {
    membershipForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = String(membershipNameInput?.value || "").trim();
      const price = Number(membershipPriceInput?.value || 0);
      const billingCycle = String(membershipCycleInput?.value || "monthly").trim().toLowerCase();
      const benefits = String(membershipBenefitsInput?.value || "").trim();
      if (!name) return setCommercialStatus?.("Membership name is required.", true);
      if (!Number.isFinite(price) || price < 0) return setCommercialStatus?.("Membership price must be valid.", true);
      try {
        setCommercialStatus?.("Saving membership...");
        await upsertMembership?.({ name, price, billingCycle, benefits, status: "active" });
        if (membershipNameInput) membershipNameInput.value = "";
        if (membershipPriceInput) membershipPriceInput.value = "";
        if (membershipBenefitsInput) membershipBenefitsInput.value = "";
        setCommercialStatus?.("Membership saved.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
      }
    });

    packageForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = String(packageNameInput?.value || "").trim();
      const price = Number(packagePriceInput?.value || 0);
      const sessionCount = Math.floor(Number(packageSessionsInput?.value || 0));
      if (!name) return setCommercialStatus?.("Package name is required.", true);
      if (!Number.isFinite(price) || price < 0) return setCommercialStatus?.("Package price must be valid.", true);
      if (!Number.isInteger(sessionCount) || sessionCount <= 0) return setCommercialStatus?.("Package sessions must be greater than zero.", true);
      try {
        setCommercialStatus?.("Saving package...");
        await upsertPackage?.({ name, price, sessionCount, status: "active" });
        if (packageNameInput) packageNameInput.value = "";
        if (packagePriceInput) packagePriceInput.value = "";
        if (packageSessionsInput) packageSessionsInput.value = "";
        setCommercialStatus?.("Package saved.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
      }
    });

    giftCardForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const purchaserName = String(giftPurchaserInput?.value || "").trim();
      const recipientName = String(giftRecipientInput?.value || "").trim();
      const initialBalance = Number(giftBalanceInput?.value || 0);
      const expiresAt = String(giftExpiresInput?.value || "").trim();
      if (!purchaserName || !recipientName) return setCommercialStatus?.("Purchaser and recipient names are required.", true);
      if (!Number.isFinite(initialBalance) || initialBalance <= 0) return setCommercialStatus?.("Gift-card balance must be greater than zero.", true);
      try {
        setCommercialStatus?.("Issuing gift card...");
        await issueGiftCard?.({ purchaserName, recipientName, initialBalance, expiresAt });
        if (giftPurchaserInput) giftPurchaserInput.value = "";
        if (giftRecipientInput) giftRecipientInput.value = "";
        if (giftBalanceInput) giftBalanceInput.value = "";
        if (giftExpiresInput) giftExpiresInput.value = "";
        setCommercialStatus?.("Gift card issued.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
      }
    });

    merchImageFileInput?.addEventListener("change", async () => {
      const file = merchImageFileInput.files?.[0];
      setMerchImageUploadData?.("");
      if (!file) return;
      try {
        const uploadData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Could not read the image file."));
          reader.readAsDataURL(file);
        });
        setMerchImageUploadData?.(uploadData);
        setMerchStatus?.("Product image added and ready to save.");
      } catch (error) {
        setMerchImageUploadData?.("");
        setMerchStatus?.(error.message, true);
      }
    });

    merchForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = String(merchNameInput?.value || "").trim();
      const salePrice = Number(merchPriceInput?.value || 0);
      const inventory = Math.floor(Number(merchInventoryInput?.value || 0));
      const imageUrl = String(merchImageUrlInput?.value || "").trim() || String(getMerchImageUploadData?.() || "");
      const description = String(merchDescriptionInput?.value || "").trim();
      const shippingAvailable = String(merchShippingInput?.value || "true").trim();
      const shippingCost = Number(merchShippingCostInput?.value || 0);
      if (!name) return setMerchStatus?.("Product name is required.", true);
      if (!description) return setMerchStatus?.("Product description is required.", true);
      if (!Number.isFinite(salePrice) || salePrice < 0) return setMerchStatus?.("Sale price must be valid.", true);
      if (!Number.isInteger(inventory) || inventory < 0) return setMerchStatus?.("Inventory must be zero or higher.", true);
      if (!Number.isFinite(shippingCost) || shippingCost < 0) return setMerchStatus?.("Shipping cost must be valid.", true);
      try {
        setMerchStatus?.("Saving product...");
        await upsertMerchItem?.({ name, salePrice, inventory, imageUrl, description, shippingAvailable, shippingCost, status: "active" });
        if (merchNameInput) merchNameInput.value = "";
        if (merchPriceInput) merchPriceInput.value = "";
        if (merchInventoryInput) merchInventoryInput.value = "";
        if (merchImageUrlInput) merchImageUrlInput.value = "";
        if (merchImageFileInput) merchImageFileInput.value = "";
        if (merchDescriptionInput) merchDescriptionInput.value = "";
        if (merchShippingInput) merchShippingInput.value = "true";
        if (merchShippingCostInput) merchShippingCostInput.value = "";
        setMerchImageUploadData?.("");
        setMerchStatus?.("Product saved.");
      } catch (error) {
        setMerchStatus?.(error.message, true);
      }
    });

    giftCardList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("commercial-redeem-gift")) return;
      const giftCardId = String(target.getAttribute("data-gift-card-id") || "").trim();
      if (!giftCardId) return;
      const values = await openManageForm?.({
        title: "Redeem Gift Card",
        submitLabel: "Redeem",
        fields: [{ id: "amount", label: "Redeem Amount", type: "number", required: true, value: "0" }]
      });
      if (!values) return;
      const amount = Number(values.amount || 0);
      if (!Number.isFinite(amount) || amount <= 0) return setCommercialStatus?.("Redeem amount must be greater than zero.", true);
      try {
        setCommercialStatus?.("Applying gift-card redemption...");
        await redeemGiftCard?.(giftCardId, amount);
        setCommercialStatus?.("Gift-card balance updated.");
        showManageToast?.("Gift-card balance updated.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
    });

    revenueSpendForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const channel = String(revenueChannelInput?.value || "").trim();
      const spend = Number(revenueSpendInput?.value || 0);
      if (!channel) return setRevenueStatus?.("Channel is required.", true);
      if (!Number.isFinite(spend) || spend < 0) return setRevenueStatus?.("Spend must be a valid number >= 0.", true);
      try {
        setRevenueStatus?.("Saving channel spend...");
        await saveRevenueChannelSpend?.({ channel, spend });
        if (revenueSpendInput) revenueSpendInput.value = "";
        setRevenueStatus?.("Channel spend saved.");
      } catch (error) {
        setRevenueStatus?.(error.message, true);
      }
    });

    profitPayrollForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const staffName = String(profitStaffNameInput?.value || "").trim();
      const role = String(profitStaffRoleInput?.value || "").trim();
      const hours = Number(profitStaffHoursInput?.value || 0);
      const hourlyRate = Number(profitStaffRateInput?.value || 0);
      const bonus = Number(profitStaffBonusInput?.value || 0);
      if (!staffName) return setProfitabilityStatus?.("Staff name is required.", true);
      if (!Number.isFinite(hours) || hours < 0 || !Number.isFinite(hourlyRate) || hourlyRate < 0 || !Number.isFinite(bonus) || bonus < 0) {
        return setProfitabilityStatus?.("Payroll values must be valid numbers >= 0.", true);
      }
      try {
        setProfitabilityStatus?.("Saving payroll entry...");
        await upsertPayrollInput?.({ staffName, role, hours, hourlyRate, bonus });
        if (profitStaffNameInput) profitStaffNameInput.value = "";
        if (profitStaffRoleInput) profitStaffRoleInput.value = "";
        if (profitStaffHoursInput) profitStaffHoursInput.value = "";
        if (profitStaffRateInput) profitStaffRateInput.value = "";
        if (profitStaffBonusInput) profitStaffBonusInput.value = "";
        setProfitabilityStatus?.("Payroll entry saved.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
      }
    });

    profitPayrollList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const entryId = String(target.getAttribute("data-entry-id") || "").trim();
      if (!entryId) return;
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) return;
      if (!target.classList.contains("profit-remove-payroll") && !target.classList.contains("profit-edit-payroll")) return;
      try {
        if (target.classList.contains("profit-edit-payroll")) {
          const entries = Array.isArray(getProfitabilityPayload?.()?.payrollEntries) ? getProfitabilityPayload().payrollEntries : [];
          const entry = entries.find((row) => String(row?.id || "") === entryId);
          if (!entry) return;
          const values = await openManageForm?.({
            title: "Edit Payroll Entry",
            submitLabel: "Save",
            fields: [
              { id: "staffName", label: "Staff Name", required: true, value: entry.staffName || "" },
              { id: "role", label: "Role", value: entry.role || "" },
              { id: "hours", label: "Hours", type: "number", value: String(entry.hours || 0), required: true },
              { id: "hourlyRate", label: "Hourly Rate", type: "number", value: String(entry.hourlyRate || 0), required: true },
              { id: "bonus", label: "Bonus", type: "number", value: String(entry.bonus || 0) }
            ]
          });
          if (!values) return;
          const hours = Number(values.hours || 0);
          const hourlyRate = Number(values.hourlyRate || 0);
          const bonus = Number(values.bonus || 0);
          if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return;
          setProfitabilityStatus?.("Updating payroll entry...");
          await upsertPayrollInput?.({ id: entryId, staffName: values.staffName, role: values.role, hours, hourlyRate, bonus });
          setProfitabilityStatus?.("Payroll entry updated.");
          showManageToast?.("Payroll entry updated.");
          return;
        }
        const confirmed = await openManageConfirm?.({
          title: "Delete Payroll Entry",
          message: "Remove this payroll entry?",
          confirmLabel: "Delete"
        });
        if (!confirmed) return;
        setProfitabilityStatus?.("Removing payroll entry...");
        await removePayrollInput?.(entryId);
        setProfitabilityStatus?.("Payroll entry removed.");
        showManageToast?.("Payroll entry deleted.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
      }
    });

    profitCostsForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rent = Number(profitRentInput?.value || 0);
      const utilities = Number(profitUtilitiesInput?.value || 0);
      const software = Number(profitSoftwareInput?.value || 0);
      const other = Number(profitOtherInput?.value || 0);
      const cogsPercent = Number(profitCogsPercentInput?.value || 0);
      const values = [rent, utilities, software, other, cogsPercent];
      if (values.some((value) => !Number.isFinite(value) || value < 0)) {
        return setProfitabilityStatus?.("Cost values must be valid numbers >= 0.", true);
      }
      if (cogsPercent > 95) return setProfitabilityStatus?.("COGS percent must be 95 or less.", true);
      try {
        setProfitabilityStatus?.("Saving cost inputs...");
        await upsertProfitabilityCosts?.({ rent, utilities, software, other, cogsPercent });
        setProfitabilityStatus?.("Cost inputs saved.");
      } catch (error) {
        setProfitabilityStatus?.(error.message, true);
      }
    });
  }

  return {
    bindBusinessControlsEvents
  };
}
