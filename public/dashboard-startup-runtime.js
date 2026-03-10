// Dashboard startup orchestration for initial binding and first-render flow.
export function createDashboardStartupRuntime(deps) {
  const {
    getUserRole,
    accountingLiveTimeframe,
    initializeUiDensity,
    initializeManageMode,
    setupManagedSectionActions,
    setAccountingTimeframe,
    startAccountingLiveStream,
    enforceDashboardRoleLayoutVisibility,
    initializeModuleNavigator,
    renderBusinessGrowthPanel,
    initializeMobileBottomNav,
    bindModuleClickRouter,
    bindCustomerInteractionEvents,
    bindCustomerLexiCalendarEvents,
    bindManageDispatcher,
    bindCommandCenterEvents,
    bindCalendarPulseEvents,
    updateBookingRangeControls,
    renderSubscriberCalendar,
    renderBusinessAiWorkspace,
    scheduleCalendarTodayRefresh,
    renderExecutivePulse,
    renderWorkspaceStarPanel,
    bindWorkspaceStarEvents,
    bindBusinessCopilotEvents,
    bindAiLaunchControls,
    bindCalendarLexiEvents,
    bindAccountingIntegrationEvents,
    bindStaffRosterControlsEvents,
    subscriberAiQuickRoutines,
    adminAiQuickRoutines,
    loadAdminBusinessOptions,
    loadAdminPlatformOverview,
    setAdminBusinessStatus,
    loadMetrics,
    shouldRenderTopMetricsGrid,
    metricsGrid,
    setDashActionStatus,
    loadBookings,
    bookingsList,
    loadBillingSummary,
    billingLiveBanner,
    loadBusinessProfile,
    setBusinessProfileStatus,
    loadSocialMediaLinks,
    socialMediaPreview,
    loadAccountingIntegrations,
    setAccountingStatus,
    loadStaffRoster,
    setStaffStatus,
    loadWaitlist,
    setWaitlistStatus,
    loadCrmSegments,
    setCrmStatus,
    loadCommercialControls,
    setCommercialStatus,
    loadRevenueAttribution,
    setRevenueStatus,
    loadProfitabilitySummary,
    setProfitabilityStatus
  } = deps || {};

  function runDashboardStartup() {
    initializeUiDensity?.();
    initializeManageMode?.();
    setupManagedSectionActions?.();
    setAccountingTimeframe?.(accountingLiveTimeframe, { reload: false });
    startAccountingLiveStream?.();

    // Keep role-driven section visibility centralized in dashboard-layout.js; startup should not override it per role.
    enforceDashboardRoleLayoutVisibility?.();
    initializeModuleNavigator?.();
    renderBusinessGrowthPanel?.();
    initializeMobileBottomNav?.();
    bindModuleClickRouter?.();
    bindCustomerInteractionEvents?.();
    bindCustomerLexiCalendarEvents?.();
    bindManageDispatcher?.();

    bindCommandCenterEvents?.();
    bindCalendarPulseEvents?.();

    if (getUserRole?.() === "subscriber" || getUserRole?.() === "admin") {
      updateBookingRangeControls?.();
      renderSubscriberCalendar?.();
      renderBusinessAiWorkspace?.("subscriber");
      renderBusinessAiWorkspace?.("admin");
      scheduleCalendarTodayRefresh?.();
      renderExecutivePulse?.();
      renderWorkspaceStarPanel?.();
    }
    bindWorkspaceStarEvents?.();
    bindBusinessCopilotEvents?.();
    bindAiLaunchControls?.({
      subscriberAiQuickRoutines,
      adminAiQuickRoutines
    });
    bindCalendarLexiEvents?.();
    bindAccountingIntegrationEvents?.();
    bindStaffRosterControlsEvents?.();
  }

  async function runInitialDashboardLoads() {
    if (getUserRole?.() === "admin") {
      try {
        await loadAdminBusinessOptions?.();
        await loadAdminPlatformOverview?.();
      } catch (error) {
        setAdminBusinessStatus?.(error.message, true);
      }
    }

    if (getUserRole?.() !== "customer") {
      loadMetrics?.().catch((error) => {
        if (shouldRenderTopMetricsGrid?.() && metricsGrid) {
          metricsGrid.innerHTML = `<article class="dash-card"><p>${error.message}</p></article>`;
        } else {
          setDashActionStatus?.(error.message, true);
        }
      });
    }

    loadBookings?.({ append: false }).catch((error) => {
      if (bookingsList) {
        bookingsList.innerHTML = `<li>${error.message}</li>`;
      }
    });

    if (!(getUserRole?.() === "subscriber" || getUserRole?.() === "admin")) return;

    loadBillingSummary?.()
      .then(() => {
        renderBusinessGrowthPanel?.();
      })
      .catch((error) => {
        if (billingLiveBanner) billingLiveBanner.textContent = error.message;
      });

    loadBusinessProfile?.().catch((error) => {
      setBusinessProfileStatus?.(error.message, true);
    });

    loadSocialMediaLinks?.().catch((error) => {
      if (socialMediaPreview) {
        socialMediaPreview.innerHTML = `<p>${error.message}</p>`;
      }
    });

    loadAccountingIntegrations?.().catch((error) => {
      setAccountingStatus?.(error.message, true);
    });

    loadStaffRoster?.().catch((error) => {
      setStaffStatus?.(error.message, true);
    });

    loadWaitlist?.().catch((error) => {
      setWaitlistStatus?.(error.message, true);
    });

    loadCrmSegments?.().catch((error) => {
      setCrmStatus?.(error.message, true);
    });

    loadCommercialControls?.().catch((error) => {
      setCommercialStatus?.(error.message, true);
    });

    loadRevenueAttribution?.().catch((error) => {
      setRevenueStatus?.(error.message, true);
    });

    loadProfitabilitySummary?.().catch((error) => {
      setProfitabilityStatus?.(error.message, true);
    });
  }

  return {
    runDashboardStartup,
    runInitialDashboardLoads
  };
}
