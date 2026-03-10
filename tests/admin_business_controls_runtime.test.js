import { describe, expect, it, vi } from "vitest";
import { createAdminBusinessControlsRuntime } from "../public/dashboard-admin-business-controls.js";

function createElement(initial = {}) {
  return {
    value: "",
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    },
    ...initial
  };
}

describe("admin business controls runtime", () => {
  it("filters managed businesses and updates the status message during search", async () => {
    const adminBusinessSearch = createElement({ value: "north" });
    const renderAdminBusinessSelect = vi.fn();
    const setAdminBusinessStatus = vi.fn();
    const renderAdminManagedBusinessSummary = vi.fn();

    const runtime = createAdminBusinessControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "biz_1",
      setManagedBusinessId: vi.fn(),
      getAdminBusinessOptions: () => [
        { id: "biz_1", name: "North Lane Studio" },
        { id: "biz_2", name: "Glow Works" }
      ],
      filteredAdminBusinessOptions: () => [{ id: "biz_1", name: "North Lane Studio" }],
      renderAdminBusinessSelect,
      setAdminBusinessStatus,
      renderAdminManagedBusinessSummary,
      syncAdminBusinessQueryParam: vi.fn(),
      reloadAdminManagedDashboard: vi.fn(),
      adminBusinessSearch,
      adminBusinessSelect: createElement()
    });

    runtime.bindAdminBusinessControlsEvents();
    await adminBusinessSearch.dispatch("input");

    expect(renderAdminBusinessSelect).toHaveBeenCalledWith([{ id: "biz_1", name: "North Lane Studio" }], { syncState: false });
    expect(setAdminBusinessStatus).toHaveBeenCalledWith("Viewing North Lane Studio. Filtered 1 result.", false);
    expect(renderAdminManagedBusinessSummary).toHaveBeenCalled();
  });

  it("switches the managed business and reloads the admin managed dashboard", async () => {
    const adminBusinessSelect = createElement({ value: "biz_2" });
    const setManagedBusinessId = vi.fn();
    const syncAdminBusinessQueryParam = vi.fn();
    const reloadAdminManagedDashboard = vi.fn().mockResolvedValue(undefined);

    const runtime = createAdminBusinessControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "biz_1",
      setManagedBusinessId,
      getAdminBusinessOptions: () => [],
      filteredAdminBusinessOptions: () => [],
      renderAdminBusinessSelect: vi.fn(),
      setAdminBusinessStatus: vi.fn(),
      renderAdminManagedBusinessSummary: vi.fn(),
      syncAdminBusinessQueryParam,
      reloadAdminManagedDashboard,
      adminBusinessSearch: createElement(),
      adminBusinessSelect
    });

    runtime.bindAdminBusinessControlsEvents();
    await adminBusinessSelect.dispatch("change");

    expect(setManagedBusinessId).toHaveBeenCalledWith("biz_2");
    expect(syncAdminBusinessQueryParam).toHaveBeenCalled();
    expect(reloadAdminManagedDashboard).toHaveBeenCalled();
  });

  it("reports no matches when the current admin business filter is empty", async () => {
    const adminBusinessSearch = createElement({ value: "zzz" });
    const setAdminBusinessStatus = vi.fn();

    const runtime = createAdminBusinessControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "biz_1",
      setManagedBusinessId: vi.fn(),
      getAdminBusinessOptions: () => [{ id: "biz_1", name: "North Lane Studio" }],
      filteredAdminBusinessOptions: () => [],
      renderAdminBusinessSelect: vi.fn(),
      setAdminBusinessStatus,
      renderAdminManagedBusinessSummary: vi.fn(),
      syncAdminBusinessQueryParam: vi.fn(),
      reloadAdminManagedDashboard: vi.fn(),
      adminBusinessSearch,
      adminBusinessSelect: createElement()
    });

    runtime.bindAdminBusinessControlsEvents();
    await adminBusinessSearch.dispatch("input");

    expect(setAdminBusinessStatus).toHaveBeenCalledWith("No matching businesses found.", true);
  });
});
