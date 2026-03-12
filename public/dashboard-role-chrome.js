// Dashboard title/identity/admin-scope chrome initialization.
export function createDashboardRoleChromeRuntime(deps) {
  const {
    getCurrentRole,
    getUser,
    getAdminBusinessParam,
    setManagedBusinessId,
    hideSection,
    showSection,
    dashboardBrandRole,
    dashboardKicker,
    dashboardTitle,
    dashboardDescription,
    dashboardBusinessPill,
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

    if (dashboardBrandRole) {
      if (currentRole === "admin") {
        dashboardBrandRole.textContent = "Admin control room";
      } else if (currentRole === "customer") {
        dashboardBrandRole.textContent = "Customer dashboard";
      } else {
        dashboardBrandRole.textContent = "Subscriber control room";
      }
    }

    if (dashboardKicker) {
      if (currentRole === "admin") {
        dashboardKicker.textContent = "Platform operations workspace";
      } else if (currentRole === "customer") {
        dashboardKicker.textContent = "Customer booking workspace";
      } else {
        dashboardKicker.textContent = "Salon operator workspace";
      }
    }

    if (dashboardTitle) {
      if (currentRole === "admin") {
        dashboardTitle.textContent = "Admin Control Center";
      } else if (currentRole === "customer") {
        dashboardTitle.textContent = "Your Booking Dashboard";
      } else {
        dashboardTitle.textContent = "Lexi Control Center";
      }
    }

    if (dashboardDescription) {
      if (currentRole === "admin") {
        dashboardDescription.textContent = "Search accounts, open live dashboard previews, track app revenue, and watch platform status from one admin workspace.";
      } else if (currentRole === "customer") {
        dashboardDescription.textContent = "Track upcoming appointments, revisit past visits, and use Ask Lexi to plan your next booking.";
      } else {
        dashboardDescription.textContent = "Your diary, customers, takings, reminders, and Ask Lexi in one clear workspace.";
      }
    }

    if (dashboardBusinessPill) {
      if (currentRole === "admin") {
        dashboardBusinessPill.textContent = "Admin workspace active";
      } else if (currentRole === "customer") {
        dashboardBusinessPill.textContent = "Customer workspace active";
      } else {
        dashboardBusinessPill.textContent = "Loading workspace...";
      }
    }

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
