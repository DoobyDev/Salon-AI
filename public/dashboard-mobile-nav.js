// Mobile bottom navigation runtime.
export function createDashboardMobileNavRuntime(deps) {
  const {
    doc = document,
    win = window,
    mobileBottomNav,
    mobileQuickSheetOverlay,
    mobileQuickSheetClose,
    getCurrentRole,
    getUserRole,
    todayDateKeyLocal,
    openQuickCreateBookingFromMobile,
    returnToDashboardHomeView,
    focusModuleByKey,
    openCalendarDayWorkspace,
    openDashboardLexiForCurrentRole,
    showManageToast
  } = deps || {};

  function visibleMobileNavButtons() {
    if (!mobileBottomNav) return [];
    return Array.from(mobileBottomNav.querySelectorAll(".mobile-bottom-nav-item")).filter((button) => {
      if (!(button instanceof HTMLElement)) return false;
      return getComputedStyle(button).display !== "none";
    });
  }

  function setActiveMobileNavButtonBySection(sectionId) {
    const safeId = String(sectionId || "").trim();
    visibleMobileNavButtons().forEach((button) => {
      const target = String(button.getAttribute("data-mobile-nav-section") || "").trim();
      button.classList.toggle("is-active", Boolean(safeId && target === safeId));
    });
  }

  function initializeMobileBottomNav() {
    if (!mobileBottomNav) return;

    const closeMobileQuickSheet = () => {
      if (!(mobileQuickSheetOverlay instanceof HTMLElement)) return;
      mobileQuickSheetOverlay.classList.remove("is-open");
      mobileQuickSheetOverlay.setAttribute("aria-hidden", "true");
    };

    const openMobileQuickSheet = () => {
      if (!(mobileQuickSheetOverlay instanceof HTMLElement)) return;
      mobileQuickSheetOverlay.classList.add("is-open");
      mobileQuickSheetOverlay.setAttribute("aria-hidden", "false");
      mobileQuickSheetClose?.focus();
    };

    mobileQuickSheetClose?.addEventListener("click", closeMobileQuickSheet);
    mobileQuickSheetOverlay?.addEventListener("click", async (event) => {
      if (event.target === mobileQuickSheetOverlay) closeMobileQuickSheet();
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileQuickSheet();
    });
    mobileQuickSheetOverlay?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const actionBtn = target.closest("[data-mobile-quick-action]");
      if (!(actionBtn instanceof HTMLElement)) return;
      const action = String(actionBtn.getAttribute("data-mobile-quick-action") || "").trim();
      closeMobileQuickSheet();
      if (!action) return;
      if (action === "home") {
        returnToDashboardHomeView?.();
        setActiveMobileNavButtonBySection("dashboardOverviewSection");
        return;
      }
      if (action === "today") {
        const todayKey = todayDateKeyLocal?.();
        focusModuleByKey?.("calendar");
        setActiveMobileNavButtonBySection("subscriberCalendarSection");
        win.setTimeout(() => {
          openCalendarDayWorkspace?.(todayKey);
        }, 180);
        return;
      }
      if (action === "new-booking") {
        try {
          await openQuickCreateBookingFromMobile?.();
          setActiveMobileNavButtonBySection("bookingOperationsSection");
        } catch (error) {
          showManageToast?.(error?.message || "Could not open new booking.", "error");
        }
        return;
      }
      if (action === "calendar") {
        focusModuleByKey?.("calendar");
        setActiveMobileNavButtonBySection("subscriberCalendarSection");
        return;
      }
      if (action === "bookings") {
        focusModuleByKey?.("booking_ops");
        setActiveMobileNavButtonBySection("bookingOperationsSection");
        return;
      }
      if (action === "waitlist") {
        focusModuleByKey?.("waitlist");
        setActiveMobileNavButtonBySection("bookingOperationsSection");
        return;
      }
      if (action === "copilot") {
        openDashboardLexiForCurrentRole?.(null, "booking_diary");
        setActiveMobileNavButtonBySection(getUserRole?.() === "admin" ? "subscriberExecutivePulseSection" : "subscriberCalendarSection");
        return;
      }
      if (action === "hub") {
        doc.getElementById("businessGrowthSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveMobileNavButtonBySection("businessGrowthSection");
      }
    });

    mobileBottomNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest(".mobile-bottom-nav-item");
      if (!(button instanceof HTMLElement)) return;
      const navAction = String(button.getAttribute("data-mobile-nav-action") || "").trim();
      if (navAction === "quick-sheet") {
        openMobileQuickSheet();
        return;
      }

      const sectionId = String(button.getAttribute("data-mobile-nav-section") || "").trim();
      const moduleKey = String(button.getAttribute("data-mobile-nav-module") || "").trim();

      if (moduleKey && (getUserRole?.() === "subscriber" || getUserRole?.() === "admin")) {
        if (moduleKey === "home") {
          returnToDashboardHomeView?.();
        } else {
          focusModuleByKey?.(moduleKey);
        }
      } else if (sectionId) {
        const section = doc.getElementById(sectionId);
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setActiveMobileNavButtonBySection(sectionId || "dashboardOverviewSection");
    });

    const sectionsByRole = {
      customer: [
        "dashboardOverviewSection",
        "customerSearchSection",
        "customerReceptionSection",
        "customerSlotsSection",
        "customerHistorySection"
      ],
      subscriber: [
        "dashboardOverviewSection",
        "subscriberCalendarSection",
        "businessGrowthSection",
        "bookingOperationsSection"
      ],
      admin: [
        "dashboardOverviewSection",
        "subscriberCalendarSection",
        "subscriberExecutivePulseSection",
        "businessGrowthSection",
        "bookingOperationsSection"
      ]
    };

    const observerSectionIds = sectionsByRole[getCurrentRole?.()] || [];
    if ("IntersectionObserver" in win && observerSectionIds.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = visibleEntries[0];
          if (top?.target instanceof HTMLElement) {
            setActiveMobileNavButtonBySection(top.target.id);
          }
        },
        {
          root: null,
          rootMargin: "-20% 0px -55% 0px",
          threshold: [0.2, 0.35, 0.55]
        }
      );
      observerSectionIds.forEach((id) => {
        const el = doc.getElementById(id);
        if (el) observer.observe(el);
      });
    }

    setActiveMobileNavButtonBySection("dashboardOverviewSection");
  }

  return {
    visibleMobileNavButtons,
    setActiveMobileNavButtonBySection,
    initializeMobileBottomNav
  };
}
