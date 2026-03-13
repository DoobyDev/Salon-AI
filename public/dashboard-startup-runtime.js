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
    bindModuleClickRouter,
    bindManageDispatcher,
    bindCalendarPulseEvents,
    updateBookingRangeControls,
    renderSubscriberCalendar,
    scheduleCalendarTodayRefresh,
    bindCalendarLexiEvents,
    bindAccountingIntegrationEvents,
    bindStaffRosterControlsEvents,
    loadAdminBusinessOptions,
    loadAdminPlatformOverview,
    setAdminBusinessStatus,
    loadMetrics,
    shouldRenderTopMetricsGrid,
    metricsGrid,
    setDashActionStatus,
    loadBookings,
    bookingsList
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
    bindModuleClickRouter?.();
    bindManageDispatcher?.();

    bindCalendarPulseEvents?.();

    if (getUserRole?.() === "subscriber" || getUserRole?.() === "admin") {
      updateBookingRangeControls?.();
      renderSubscriberCalendar?.();
      scheduleCalendarTodayRefresh?.();
    }
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
  }

  return {
    runDashboardStartup,
    runInitialDashboardLoads
  };
}
