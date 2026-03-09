// Dashboard title/identity/admin-scope chrome initialization.
export function createDashboardRoleChromeRuntime(deps) {
  const {
    getCurrentRole,
    getUser,
    getAdminBusinessParam,
    setManagedBusinessId,
    hideSection,
    showSection,
    dashTitle,
    dashUser,
    dashRoleHint,
    dashActionStatus,
    adminBusinessScope,
    dashIdentityBlock,
    dashboardOverviewSection
  } = deps || {};

  function initializeDashboardRoleChrome() {
    const currentRole = String(getCurrentRole?.() || "").trim().toLowerCase();
    const user = getUser?.() || {};

    if (dashTitle) {
      if (currentRole === "subscriber") {
        dashTitle.textContent = "Subscriber Dashboard";
      } else if (currentRole === "admin") {
        dashTitle.textContent = "Admin Dashboard";
      } else if (currentRole === "customer") {
        dashTitle.textContent = "Customer Dashboard";
      } else {
        dashTitle.textContent = `${String(currentRole || "user").toUpperCase()} Dashboard`;
      }
    }

    if (dashUser) {
      if (currentRole === "subscriber" || currentRole === "admin") {
        dashUser.textContent = "";
        hideSection?.(dashUser);
      } else {
        dashUser.textContent = `${user.name || "User"} (${user.email || "unknown"})`;
        hideSection?.(dashUser);
      }
    }

    if (dashRoleHint) {
      if (currentRole === "customer") {
        dashRoleHint.textContent = "Use Search, ask the AI receptionist, then pick a slot. You can also track upcoming bookings and past visits here.";
      } else if (currentRole === "subscriber") {
        dashRoleHint.textContent = "Start with one business area, sort what matters most, then move on. It keeps the day easier to manage.";
      } else if (currentRole === "admin") {
        dashRoleHint.textContent = "Switch business view, check platform health, and keep an eye on cancellations, billing movement, and subscriber activity.";
      } else {
        dashRoleHint.textContent = "";
      }
    }

    if (currentRole === "subscriber") {
      setManagedBusinessId?.(String(user.businessId || "").trim());
    } else if (currentRole === "admin") {
      setManagedBusinessId?.(String(getAdminBusinessParam?.() || "").trim());
      if (adminBusinessScope) {
        adminBusinessScope.style.display = "inline-flex";
      }
    }

    hideSection?.(dashRoleHint);
    hideSection?.(dashActionStatus);
    hideSection?.(adminBusinessScope);
    if (currentRole === "admin") {
      showSection?.(adminBusinessScope);
    }
    showSection?.(dashIdentityBlock);
    dashboardOverviewSection?.classList.remove("actions-only");
  }

  return {
    initializeDashboardRoleChrome
  };
}
