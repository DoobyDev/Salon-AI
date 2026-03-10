import { describe, expect, it, vi } from "vitest";
import { createBusinessControlsRuntime } from "../public/dashboard-business-controls-runtime.js";

class FakeHTMLElement {
  constructor(initial = {}) {
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
    this.value = "";
    Object.assign(this, initial);
  }

  appendChild(child) {
    this.children.push(child);
  }
}

globalThis.document = {
  createElement: vi.fn(() => new FakeHTMLElement())
};

describe("business controls runtime", () => {
  it("renders commercial and merch controls from the managed payload", () => {
    const commercialSection = new FakeHTMLElement();
    const commercialSummaryCards = new FakeHTMLElement();
    const membershipList = new FakeHTMLElement();
    const packageList = new FakeHTMLElement();
    const giftCardList = new FakeHTMLElement();
    const merchSection = new FakeHTMLElement();
    const merchSummaryCards = new FakeHTMLElement();
    const merchList = new FakeHTMLElement();
    const showSection = vi.fn();

    const runtime = createBusinessControlsRuntime({
      canManageBusinessModules: () => true,
      isPopupMountedBusinessSection: () => true,
      hideSection: vi.fn(),
      showSection,
      formatMoney: (value) => `GBP ${Number(value).toFixed(2)}`,
      escapeHtml: (value) => String(value || ""),
      formatDateTime: (value) => `FMT:${value}`,
      getCommercialPayload: () => ({
        summary: {
          activeMemberships: 1,
          activePackages: 1,
          activeGiftCards: 1,
          outstandingGiftBalance: 35,
          activeMerchItems: 1,
          pendingMerchShipments: 1,
          shippableMerchItems: 1,
          merchCatalogValue: 55
        },
        memberships: [{ id: "m1", name: "VIP", price: 45, billingCycle: "monthly", status: "active", benefits: "Priority slots" }],
        packages: [{ id: "p1", name: "Colour Bundle", price: 120, remainingSessions: 3, sessionCount: 4, status: "active" }],
        giftCards: [{ id: "g1", code: "GC-100", recipientName: "Taylor", remainingBalance: 35, initialBalance: 50, status: "active", issuedAt: "2026-03-10T09:00:00Z", expiresAt: "" }],
        merch: [{
          id: "me1",
          name: "Shampoo",
          salePrice: 22,
          inventory: 5,
          imageUrl: "/img.png",
          description: "Salon retail",
          shippingAvailable: true,
          shippingCost: 4,
          status: "active",
          shipments: [{ customerName: "Jamie", status: "in_transit", trackingRef: "TRACK-1" }]
        }]
      }),
      commercialSection,
      commercialSummaryCards,
      membershipList,
      packageList,
      giftCardList,
      merchSection,
      merchSummaryCards,
      merchList
    });

    runtime.renderCommercialControls();
    runtime.renderMerchControls();

    expect(showSection).toHaveBeenCalledWith(commercialSection);
    expect(showSection).toHaveBeenCalledWith(merchSection);
    expect(commercialSummaryCards.children).toHaveLength(6);
    expect(membershipList.children[0].innerHTML).toContain("VIP");
    expect(packageList.children[0].innerHTML).toContain("Colour Bundle");
    expect(giftCardList.children[0].innerHTML).toContain("GC-100");
    expect(merchSummaryCards.children).toHaveLength(4);
    expect(merchList.children[0].innerHTML).toContain("Latest shipment: Jamie - In Transit - Tracking: TRACK-1");
  });

  it("renders empty-state fallbacks and hides inaccessible sections", () => {
    const hideSection = vi.fn();
    const commercialSection = new FakeHTMLElement();
    const merchSection = new FakeHTMLElement();
    const revenueAttributionSection = new FakeHTMLElement();
    const profitabilitySection = new FakeHTMLElement();

    const runtime = createBusinessControlsRuntime({
      canManageBusinessModules: () => false,
      isPopupMountedBusinessSection: () => false,
      hideSection,
      showSection: vi.fn(),
      formatMoney: (value) => `GBP ${Number(value).toFixed(2)}`,
      escapeHtml: (value) => String(value || ""),
      formatDateTime: (value) => String(value || ""),
      getCommercialPayload: () => ({}),
      getRevenueAttributionPayload: () => ({}),
      getProfitabilityPayload: () => ({}),
      commercialSection,
      commercialSummaryCards: new FakeHTMLElement(),
      membershipList: new FakeHTMLElement(),
      packageList: new FakeHTMLElement(),
      giftCardList: new FakeHTMLElement(),
      merchSection,
      merchSummaryCards: new FakeHTMLElement(),
      merchList: new FakeHTMLElement(),
      revenueAttributionSection,
      revenueSummaryCards: new FakeHTMLElement(),
      revenueChannelList: new FakeHTMLElement(),
      profitabilitySection,
      profitSummaryCards: new FakeHTMLElement(),
      profitPayrollList: new FakeHTMLElement()
    });

    runtime.renderCommercialControls();
    runtime.renderMerchControls();
    runtime.renderRevenueAttribution();
    runtime.renderProfitabilitySummary();

    expect(hideSection).toHaveBeenCalledWith(commercialSection);
    expect(hideSection).toHaveBeenCalledWith(merchSection);
    expect(hideSection).toHaveBeenCalledWith(revenueAttributionSection);
    expect(hideSection).toHaveBeenCalledWith(profitabilitySection);
  });

  it("applies fetched payloads and renders subscriber revenue and profitability fallbacks", () => {
    let commercialPayload = {};
    let revenuePayload = {};
    let profitabilityPayload = {};
    const revenueChannelList = new FakeHTMLElement();
    const profitPayrollList = new FakeHTMLElement();

    const runtime = createBusinessControlsRuntime({
      canManageBusinessModules: () => true,
      isPopupMountedBusinessSection: () => true,
      hideSection: vi.fn(),
      showSection: vi.fn(),
      formatMoney: (value) => `GBP ${Number(value).toFixed(2)}`,
      escapeHtml: (value) => String(value || ""),
      formatDateTime: (value) => String(value || ""),
      getUserRole: () => "subscriber",
      getCommercialPayload: () => commercialPayload,
      setCommercialPayload: (value) => {
        commercialPayload = value;
      },
      getRevenueAttributionPayload: () => revenuePayload,
      setRevenueAttributionPayload: (value) => {
        revenuePayload = value;
      },
      getProfitabilityPayload: () => profitabilityPayload,
      setProfitabilityPayload: (value) => {
        profitabilityPayload = value;
      },
      commercialSection: new FakeHTMLElement(),
      commercialSummaryCards: new FakeHTMLElement(),
      membershipList: new FakeHTMLElement(),
      packageList: new FakeHTMLElement(),
      giftCardList: new FakeHTMLElement(),
      merchSection: new FakeHTMLElement(),
      merchSummaryCards: new FakeHTMLElement(),
      merchList: new FakeHTMLElement(),
      revenueAttributionSection: new FakeHTMLElement(),
      revenueSummaryCards: new FakeHTMLElement(),
      revenueChannelList,
      profitabilitySection: new FakeHTMLElement(),
      profitSummaryCards: new FakeHTMLElement(),
      profitPayrollList,
      renderExecutivePulse: vi.fn()
    });

    runtime.applyCommercialPayload({
      memberships: [{ id: "m1" }],
      packages: [{ id: "p1" }],
      giftCards: [{ id: "g1" }],
      merch: [{ id: "me1" }],
      summary: { activeMemberships: 1 }
    });
    runtime.applyRevenueAttributionPayload({ channels: [], summary: {} });
    runtime.applyProfitabilityPayload({ payrollEntries: [], fixedCosts: {}, cogsPercent: 0, summary: {} });

    expect(commercialPayload.memberships).toHaveLength(1);
    expect(revenueChannelList.children).toHaveLength(4);
    expect(revenueChannelList.children[0].innerHTML).toContain("Instagram");
    expect(profitPayrollList.innerHTML).toContain("Clean slate");
  });
});
