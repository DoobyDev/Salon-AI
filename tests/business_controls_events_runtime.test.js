import { describe, expect, it, vi } from "vitest";
import { createBusinessControlsEventsRuntime } from "../public/dashboard-business-controls-events.js";

class FakeClassList {
  constructor(classes = []) {
    this.classes = new Set(classes);
  }

  contains(name) {
    return this.classes.has(name);
  }
}

class FakeHTMLElement {
  constructor(initial = {}) {
    this.listeners = {};
    this.value = "";
    this.files = [];
    this.attrs = {};
    this.classList = new FakeClassList(initial.classes || []);
    Object.assign(this, initial);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  async dispatch(type, event = {}) {
    const handler = this.listeners[type];
    if (!handler) return undefined;
    return handler(event);
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }
}

globalThis.HTMLElement = FakeHTMLElement;
globalThis.FileReader = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = "";
  }

  readAsDataURL(file) {
    if (file.failRead) {
      this.onerror?.();
      return;
    }
    this.result = `data:${file.name}`;
    this.onload?.();
  }
};

function fakeSubmitEvent() {
  return {
    preventDefault: vi.fn()
  };
}

describe("business controls events runtime", () => {
  it("validates and submits membership plus revenue forms", async () => {
    const membershipForm = new FakeHTMLElement();
    const membershipNameInput = new FakeHTMLElement({ value: "VIP" });
    const membershipPriceInput = new FakeHTMLElement({ value: "45" });
    const membershipCycleInput = new FakeHTMLElement({ value: "Monthly" });
    const membershipBenefitsInput = new FakeHTMLElement({ value: "Priority slots" });
    const revenueSpendForm = new FakeHTMLElement();
    const revenueChannelInput = new FakeHTMLElement({ value: "instagram" });
    const revenueSpendInput = new FakeHTMLElement({ value: "120" });
    const upsertMembership = vi.fn().mockResolvedValue(undefined);
    const saveRevenueChannelSpend = vi.fn().mockResolvedValue(undefined);
    const setCommercialStatus = vi.fn();
    const setRevenueStatus = vi.fn();

    const runtime = createBusinessControlsEventsRuntime({
      upsertMembership,
      saveRevenueChannelSpend,
      setCommercialStatus,
      setRevenueStatus,
      membershipForm,
      membershipNameInput,
      membershipPriceInput,
      membershipCycleInput,
      membershipBenefitsInput,
      revenueSpendForm,
      revenueChannelInput,
      revenueSpendInput
    });

    runtime.bindBusinessControlsEvents();

    await membershipForm.dispatch("submit", fakeSubmitEvent());
    expect(upsertMembership).toHaveBeenCalledWith({
      name: "VIP",
      price: 45,
      billingCycle: "monthly",
      benefits: "Priority slots",
      status: "active"
    });
    expect(membershipNameInput.value).toBe("");
    expect(setCommercialStatus).toHaveBeenLastCalledWith("Membership saved.");

    await revenueSpendForm.dispatch("submit", fakeSubmitEvent());
    expect(saveRevenueChannelSpend).toHaveBeenCalledWith({ channel: "instagram", spend: 120 });
    expect(revenueSpendInput.value).toBe("");
    expect(setRevenueStatus).toHaveBeenLastCalledWith("Channel spend saved.");
  });

  it("handles merch image upload and merch save validation", async () => {
    const merchImageFileInput = new FakeHTMLElement({
      files: [{ name: "product.png" }]
    });
    const merchForm = new FakeHTMLElement();
    const merchNameInput = new FakeHTMLElement({ value: "Shampoo" });
    const merchPriceInput = new FakeHTMLElement({ value: "22" });
    const merchInventoryInput = new FakeHTMLElement({ value: "6" });
    const merchImageUrlInput = new FakeHTMLElement({ value: "" });
    const merchDescriptionInput = new FakeHTMLElement({ value: "Retail bottle" });
    const merchShippingInput = new FakeHTMLElement({ value: "true" });
    const merchShippingCostInput = new FakeHTMLElement({ value: "4" });
    let uploadData = "";
    const upsertMerchItem = vi.fn().mockResolvedValue(undefined);
    const setMerchStatus = vi.fn();

    const runtime = createBusinessControlsEventsRuntime({
      merchImageFileInput,
      merchForm,
      merchNameInput,
      merchPriceInput,
      merchInventoryInput,
      merchImageUrlInput,
      merchDescriptionInput,
      merchShippingInput,
      merchShippingCostInput,
      getMerchImageUploadData: () => uploadData,
      setMerchImageUploadData: (value) => {
        uploadData = value;
      },
      upsertMerchItem,
      setMerchStatus
    });

    runtime.bindBusinessControlsEvents();

    await merchImageFileInput.dispatch("change");
    expect(uploadData).toBe("data:product.png");
    expect(setMerchStatus).toHaveBeenLastCalledWith("Product image added and ready to save.");

    await merchForm.dispatch("submit", fakeSubmitEvent());
    expect(upsertMerchItem).toHaveBeenCalledWith({
      name: "Shampoo",
      salePrice: 22,
      inventory: 6,
      imageUrl: "data:product.png",
      description: "Retail bottle",
      shippingAvailable: "true",
      shippingCost: 4,
      status: "active"
    });
    expect(uploadData).toBe("");
    expect(merchNameInput.value).toBe("");
    expect(setMerchStatus).toHaveBeenLastCalledWith("Product saved.");
  });

  it("redeems gift cards and edits/removes payroll entries through managed actions", async () => {
    const giftCardList = new FakeHTMLElement();
    const profitPayrollList = new FakeHTMLElement();
    const openManageForm = vi.fn()
      .mockResolvedValueOnce({ amount: "15" })
      .mockResolvedValueOnce({ staffName: "Sam", role: "stylist", hours: "36", hourlyRate: "18", bonus: "20" });
    const openManageConfirm = vi.fn().mockResolvedValue(true);
    const redeemGiftCard = vi.fn().mockResolvedValue(undefined);
    const upsertPayrollInput = vi.fn().mockResolvedValue(undefined);
    const removePayrollInput = vi.fn().mockResolvedValue(undefined);
    const setCommercialStatus = vi.fn();
    const setProfitabilityStatus = vi.fn();
    const showManageToast = vi.fn();

    const runtime = createBusinessControlsEventsRuntime({
      getManageModeEnabled: () => true,
      isDashboardManagerRole: () => true,
      openManageForm,
      openManageConfirm,
      showManageToast,
      redeemGiftCard,
      upsertPayrollInput,
      removePayrollInput,
      setCommercialStatus,
      setProfitabilityStatus,
      getProfitabilityPayload: () => ({
        payrollEntries: [{ id: "pay_1", staffName: "Sam", role: "stylist", hours: 35, hourlyRate: 17, bonus: 0 }]
      }),
      giftCardList,
      profitPayrollList
    });

    runtime.bindBusinessControlsEvents();

    const redeemTarget = new FakeHTMLElement({ classes: ["commercial-redeem-gift"] });
    redeemTarget.setAttribute("data-gift-card-id", "gift_1");
    await giftCardList.dispatch("click", { target: redeemTarget });
    expect(redeemGiftCard).toHaveBeenCalledWith("gift_1", 15);
    expect(setCommercialStatus).toHaveBeenLastCalledWith("Gift-card balance updated.");
    expect(showManageToast).toHaveBeenCalledWith("Gift-card balance updated.");

    const editTarget = new FakeHTMLElement({ classes: ["profit-edit-payroll"] });
    editTarget.setAttribute("data-entry-id", "pay_1");
    await profitPayrollList.dispatch("click", { target: editTarget });
    expect(upsertPayrollInput).toHaveBeenCalledWith({
      id: "pay_1",
      staffName: "Sam",
      role: "stylist",
      hours: 36,
      hourlyRate: 18,
      bonus: 20
    });
    expect(showManageToast).toHaveBeenCalledWith("Payroll entry updated.");

    const removeTarget = new FakeHTMLElement({ classes: ["profit-remove-payroll"] });
    removeTarget.setAttribute("data-entry-id", "pay_1");
    await profitPayrollList.dispatch("click", { target: removeTarget });
    expect(removePayrollInput).toHaveBeenCalledWith("pay_1");
    expect(showManageToast).toHaveBeenCalledWith("Payroll entry deleted.");
  });
});
