import { describe, expect, it } from "vitest";
import { createModuleDefinitionsRuntime } from "../public/dashboard-module-definitions.js";

class FakeHTMLElement {}

globalThis.HTMLElement = FakeHTMLElement;

describe("module definitions runtime", () => {
  it("normalizes module config with inferred popup defaults and cadence", () => {
    const runtime = createModuleDefinitionsRuntime({
      getUserRole: () => "subscriber"
    });

    const normalized = runtime.normalizeModuleConfig({
      key: "calendar",
      section: new FakeHTMLElement(),
      howItHelps: "Manage the diary."
    });

    expect(normalized.popupMode).toBe("interactive");
    expect(normalized.popupSize).toBe("large");
    expect(normalized.cadence).toBe("Use daily");
    expect(normalized.navSummary).toBe("Manage the diary.");
  });

  it("builds role-specific module definitions for customer and subscriber/admin roles", () => {
    const customerRuntime = createModuleDefinitionsRuntime({
      getUserRole: () => "customer",
      customerSearchSection: new FakeHTMLElement(),
      customerReceptionSection: new FakeHTMLElement(),
      customerSlotsSection: new FakeHTMLElement(),
      customerHistorySection: new FakeHTMLElement(),
      customerAnalyticsSection: new FakeHTMLElement()
    });
    const subscriberRuntime = createModuleDefinitionsRuntime({
      getUserRole: () => "subscriber",
      subscriberExecutivePulseSection: new FakeHTMLElement(),
      subscriberSubscriptionSection: new FakeHTMLElement(),
      frontDeskSection: new FakeHTMLElement(),
      subscriberCommandCenterSection: new FakeHTMLElement(),
      businessGrowthSection: new FakeHTMLElement(),
      first7DaysSnapshotSection: new FakeHTMLElement(),
      businessProfileSection: new FakeHTMLElement(),
      bookingOperationsSection: new FakeHTMLElement(),
      subscriberCalendarSection: new FakeHTMLElement(),
      accountingIntegrationsSection: new FakeHTMLElement(),
      staffRosterSection: new FakeHTMLElement(),
      waitlistSection: new FakeHTMLElement(),
      operationsInsightsSection: new FakeHTMLElement(),
      crmSection: new FakeHTMLElement(),
      commercialSection: new FakeHTMLElement(),
      merchSection: new FakeHTMLElement(),
      revenueAttributionSection: new FakeHTMLElement(),
      profitabilitySection: new FakeHTMLElement(),
      socialMediaSection: new FakeHTMLElement()
    });

    const customerModules = customerRuntime.moduleDefinitionsForRole();
    const subscriberModules = subscriberRuntime.moduleDefinitionsForRole();

    expect(customerModules.some((mod) => mod.key === "customer_chat")).toBe(true);
    expect(subscriberModules.some((mod) => mod.key === "calendar")).toBe(true);
    expect(subscriberModules.some((mod) => mod.key === "home" && mod.startHere)).toBe(true);
  });
});
