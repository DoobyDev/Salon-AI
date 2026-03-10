import { describe, expect, it, vi } from "vitest";
import { createDashboardRoleChromeRuntime } from "../public/dashboard-role-chrome.js";

function createElement() {
  return {
    textContent: "",
    style: {},
    classList: {
      remove: vi.fn()
    }
  };
}

describe("dashboard role chrome runtime", () => {
  it("initializes subscriber chrome and managed business scope", () => {
    let managedBusinessId = "";
    const dashTitle = createElement();
    const dashUser = createElement();
    const dashRoleHint = createElement();
    const dashActionStatus = createElement();
    const adminBusinessScope = createElement();
    const dashIdentityBlock = createElement();
    const dashboardOverviewSection = createElement();
    const hideSection = vi.fn();
    const showSection = vi.fn();

    const runtime = createDashboardRoleChromeRuntime({
      getCurrentRole: () => "subscriber",
      getUser: () => ({ name: "Morgan", email: "morgan@example.com", businessId: "biz_1" }),
      getAdminBusinessParam: () => "",
      setManagedBusinessId: (value) => {
        managedBusinessId = value;
      },
      hideSection,
      showSection,
      dashTitle,
      dashUser,
      dashRoleHint,
      dashActionStatus,
      adminBusinessScope,
      dashIdentityBlock,
      dashboardOverviewSection
    });

    runtime.initializeDashboardRoleChrome();

    expect(dashTitle.textContent).toBe("Subscriber Dashboard");
    expect(dashRoleHint.textContent).toContain("Start with one business area");
    expect(managedBusinessId).toBe("biz_1");
    expect(showSection).toHaveBeenCalledWith(dashIdentityBlock);
    expect(dashboardOverviewSection.classList.remove).toHaveBeenCalledWith("actions-only");
  });

  it("initializes admin chrome and shows the admin business scope picker", () => {
    let managedBusinessId = "";
    const dashTitle = createElement();
    const dashRoleHint = createElement();
    const adminBusinessScope = createElement();
    const runtime = createDashboardRoleChromeRuntime({
      getCurrentRole: () => "admin",
      getUser: () => ({ name: "Admin", email: "admin@example.com" }),
      getAdminBusinessParam: () => "biz_2",
      setManagedBusinessId: (value) => {
        managedBusinessId = value;
      },
      hideSection: vi.fn(),
      showSection: vi.fn(),
      dashTitle,
      dashUser: createElement(),
      dashRoleHint,
      dashActionStatus: createElement(),
      adminBusinessScope,
      dashIdentityBlock: createElement(),
      dashboardOverviewSection: createElement()
    });

    runtime.initializeDashboardRoleChrome();

    expect(dashTitle.textContent).toBe("Admin Dashboard");
    expect(dashRoleHint.textContent).toContain("Switch business view");
    expect(managedBusinessId).toBe("biz_2");
    expect(adminBusinessScope.style.display).toBe("inline-flex");
  });
});
