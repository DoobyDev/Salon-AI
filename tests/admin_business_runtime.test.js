import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminBusinessRuntime } from "../public/dashboard-admin-business-runtime.js";
import { createAdminBusinessLoadingRuntime } from "../public/dashboard-admin-business-loading.js";

function createElement(initial = {}) {
  return {
    value: "",
    innerHTML: "",
    textContent: "",
    style: {},
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    ...initial
  };
}

describe("admin business runtime", () => {
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.document = {
      createElement: vi.fn(() => ({ value: "", textContent: "" }))
    };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("filters business options, renders the select, and updates the summary", () => {
    let managedBusinessId = "biz_1";
    const adminBusinessOptions = [
      { id: "biz_1", name: "North Lane Studio", type: "Salon", city: "Leeds", country: "UK" },
      { id: "biz_2", name: "Glow Works", type: "Barber", city: "York", country: "UK" }
    ];
    const adminBusinessSearch = createElement({ value: "north" });
    const adminBusinessSelect = createElement();
    const adminBusinessStatus = createElement();
    const adminManagedBusinessLabel = createElement();
    const adminManagedBusinessMeta = createElement();

    const runtime = createAdminBusinessRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => managedBusinessId,
      setManagedBusinessId: (value) => {
        managedBusinessId = value;
      },
      getAdminBusinessOptions: () => adminBusinessOptions,
      normalizeText: (value) => String(value || "").trim().toLowerCase(),
      adminBusinessSearch,
      adminBusinessSelect,
      adminBusinessStatus,
      adminManagedBusinessLabel,
      adminManagedBusinessMeta
    });

    expect(runtime.filteredAdminBusinessOptions()).toEqual([adminBusinessOptions[0]]);

    runtime.renderAdminBusinessSelect(adminBusinessOptions);
    expect(adminBusinessSelect.children).toHaveLength(2);
    expect(managedBusinessId).toBe("biz_1");

    runtime.setAdminBusinessStatus("Viewing North Lane Studio.");
    expect(adminBusinessStatus.textContent).toBe("Viewing North Lane Studio.");
    expect(adminBusinessStatus.style.color).toBe("var(--muted)");

    runtime.renderAdminManagedBusinessSummary();
    expect(adminManagedBusinessLabel.textContent).toBe("North Lane Studio");
    expect(adminManagedBusinessMeta.textContent).toContain("Salon | Leeds | UK");
  });

  it("loads admin business options and reloads the managed dashboard orchestration", async () => {
    let managedBusinessId = "";
    let adminBusinessOptions = [];
    const adminBusinessSelect = createElement({ disabled: false });
    const setAdminBusinessStatus = vi.fn();
    const renderAdminBusinessSelect = vi.fn();
    const renderAdminManagedBusinessSummary = vi.fn();
    const syncAdminBusinessQueryParam = vi.fn();
    const metricsGrid = createElement({ innerHTML: "stale" });
    const resetBookingsCursor = vi.fn();
    const updateLoadMoreState = vi.fn();
    const loadMetrics = vi.fn().mockResolvedValue(undefined);
    const loadBookings = vi.fn().mockResolvedValue(undefined);
    const loadBillingSummary = vi.fn().mockResolvedValue(undefined);
    const loadBusinessProfile = vi.fn().mockResolvedValue(undefined);
    const loadSocialMediaLinks = vi.fn().mockResolvedValue(undefined);
    const loadAccountingIntegrations = vi.fn().mockResolvedValue(undefined);
    const loadStaffRoster = vi.fn().mockResolvedValue(undefined);
    const loadWaitlist = vi.fn().mockResolvedValue(undefined);
    const loadCrmSegments = vi.fn().mockResolvedValue(undefined);
    const loadCommercialControls = vi.fn().mockResolvedValue(undefined);
    const loadRevenueAttribution = vi.fn().mockResolvedValue(undefined);
    const loadProfitabilitySummary = vi.fn().mockResolvedValue(undefined);

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        businesses: [
          { id: "biz_1", name: "North Lane Studio" },
          { id: "biz_2", name: "Glow Works" }
        ]
      })
    });

    const runtime = createAdminBusinessLoadingRuntime({
      getUserRole: () => "admin",
      headers: () => ({ Authorization: "Bearer test" }),
      adminBusinessSelect,
      getAdminBusinessParam: () => "biz_2",
      getManagedBusinessId: () => managedBusinessId,
      setManagedBusinessId: (value) => {
        managedBusinessId = value;
      },
      getAdminBusinessOptions: () => adminBusinessOptions,
      setAdminBusinessOptions: (value) => {
        adminBusinessOptions = value;
      },
      setAdminBusinessStatus,
      renderAdminBusinessSelect,
      renderAdminManagedBusinessSummary,
      filteredAdminBusinessOptions: () => adminBusinessOptions,
      syncAdminBusinessQueryParam,
      shouldRenderTopMetricsGrid: () => true,
      metricsGrid,
      resetBookingsCursor,
      updateLoadMoreState,
      loadMetrics,
      loadBookings,
      loadBillingSummary,
      loadBusinessProfile,
      loadSocialMediaLinks,
      loadAccountingIntegrations,
      loadStaffRoster,
      loadWaitlist,
      loadCrmSegments,
      loadCommercialControls,
      loadRevenueAttribution,
      loadProfitabilitySummary
    });

    await runtime.loadAdminBusinessOptions();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/admin/businesses", {
      headers: { Authorization: "Bearer test" }
    });
    expect(managedBusinessId).toBe("biz_2");
    expect(renderAdminBusinessSelect).toHaveBeenCalledWith(adminBusinessOptions);
    expect(syncAdminBusinessQueryParam).toHaveBeenCalled();

    await runtime.reloadAdminManagedDashboard();

    expect(metricsGrid.innerHTML).toBe("");
    expect(resetBookingsCursor).toHaveBeenCalled();
    expect(updateLoadMoreState).toHaveBeenCalledWith(false);
    expect(loadBookings).toHaveBeenCalledWith({ append: false });
    expect(loadProfitabilitySummary).toHaveBeenCalled();
    expect(setAdminBusinessStatus).toHaveBeenCalledWith("Viewing Glow Works.");
    expect(adminBusinessSelect.disabled).toBe(false);
  });
});
