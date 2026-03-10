import { describe, expect, it, vi } from "vitest";
import { createBusinessGrowthPanelRuntime } from "../public/dashboard-business-growth-panel.js";
import { BUSINESS_HUB_CARD_CONFIG, getBusinessHubModulesForRole } from "../public/dashboard-business-hub.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    Object.assign(this, initial);
  }

  appendChild(child) {
    this.children.push(child);
  }
}

describe("business growth panel runtime", () => {
  it("renders subscriber business hub growth, onboarding, and first-week summary", () => {
    const growthNodes = {
      businessGrowthSection: new FakeHTMLElement(),
      businessHubIntro: new FakeHTMLElement(),
      billingLiveBanner: new FakeHTMLElement(),
      billingLiveMeta: new FakeHTMLElement(),
      yearlySavingsLine: new FakeHTMLElement(),
      onboardingSummaryList: new FakeHTMLElement(),
      onboardingQuickActionsList: new FakeHTMLElement(),
      onboardingStatusList: new FakeHTMLElement(),
      onboardingChecklist: new FakeHTMLElement(),
      first7DaysGrid: new FakeHTMLElement()
    };
    const showSection = vi.fn();
    const renderBusinessHubCards = vi.fn();
    const businessHubKicker = new FakeHTMLElement();
    const businessHubTitle = new FakeHTMLElement();

    globalThis.document = {
      getElementById: vi.fn((id) => {
        if (id === "businessHubKicker") return businessHubKicker;
        if (id === "businessHubTitle") return businessHubTitle;
        return null;
      }),
      createElement: vi.fn(() => new FakeHTMLElement())
    };

    const runtime = createBusinessGrowthPanelRuntime({
      getUserRole: () => "subscriber",
      hideSection: vi.fn(),
      showSection,
      renderBusinessHubCards,
      formatDateShort: (value) => `DATE:${value}`,
      formatMoney: (value) => `GBP ${Number(value || 0).toFixed(2)}`,
      escapeHtml: (value) => String(value || ""),
      getBillingSummary: () => ({
        status: "active",
        planLabel: "Subscriber Monthly",
        currentPeriodEnd: "2026-04-10",
        yearlyDiscountPercent: 16.7,
        monthlyFee: 9.99,
        yearlyFee: 99.99
      }),
      getBusinessProfileName: () => ({ value: "Salon Prime" }),
      getBusinessProfilePhone: () => ({ value: "07111111111" }),
      getBusinessProfileEmail: () => ({ value: "hello@salonprime.test" }),
      getBusinessProfileServices: () => ({ value: "Cut\nColour\nBlow Dry" }),
      getBusinessHoursInputs: () => Array.from({ length: 7 }, (_, index) => ({ value: `09:0${index}` })),
      getSocialInputs: () => [{ value: "https://instagram.com/salonprime" }],
      getAccountingRows: () => [{ connected: true }],
      getBookingRows: () => [
        { createdAt: new Date().toISOString(), date: "2026-03-10", time: "09:00", status: "completed", price: 45 },
        { createdAt: new Date().toISOString(), date: "2026-03-10", time: "11:00", status: "cancelled", price: 30 }
      ],
      getStaffRosterRows: () => [{ id: "s1" }, { id: "s2" }],
      getWaitlistRows: () => [{ id: "w1" }],
      ...growthNodes
    });

    runtime.renderBusinessGrowthPanel();

    expect(showSection).toHaveBeenCalledWith(growthNodes.businessGrowthSection);
    expect(renderBusinessHubCards).toHaveBeenCalled();
    expect(businessHubKicker.textContent).toBe("Business Hub workspace");
    expect(businessHubTitle.textContent).toBe("Business Hub");
    expect(growthNodes.billingLiveBanner.textContent).toContain("Subscriber Monthly");
    expect(growthNodes.billingLiveMeta.textContent).toBe("Next renewal: DATE:2026-04-10");
    expect(growthNodes.onboardingSummaryList.children).toHaveLength(1);
    expect(growthNodes.onboardingQuickActionsList.children).toHaveLength(1);
    expect(growthNodes.onboardingStatusList.children).toHaveLength(1);
    expect(growthNodes.onboardingChecklist.children.length).toBeGreaterThan(0);
    expect(growthNodes.first7DaysGrid.children).toHaveLength(4);
  });

  it("hides the growth panel for unsupported roles", () => {
    const hideSection = vi.fn();
    const section = new FakeHTMLElement();

    const runtime = createBusinessGrowthPanelRuntime({
      getUserRole: () => "customer",
      hideSection,
      showSection: vi.fn(),
      businessGrowthSection: section
    });

    runtime.renderBusinessGrowthPanel();

    expect(hideSection).toHaveBeenCalledWith(section);
  });
});

describe("business hub config", () => {
  it("returns role-filtered module cards using the catalog lookup", () => {
    const moduleDefinitionByKey = (key) => ({ key, label: key.toUpperCase() });

    const subscriberModules = getBusinessHubModulesForRole({
      role: "subscriber",
      moduleDefinitionByKey
    });
    const customerModules = getBusinessHubModulesForRole({
      role: "customer",
      moduleDefinitionByKey
    });

    expect(BUSINESS_HUB_CARD_CONFIG.length).toBeGreaterThan(0);
    expect(subscriberModules).toHaveLength(BUSINESS_HUB_CARD_CONFIG.length);
    expect(subscriberModules[0].mod.label).toBe(subscriberModules[0].key.toUpperCase());
    expect(customerModules).toEqual([]);
  });
});
