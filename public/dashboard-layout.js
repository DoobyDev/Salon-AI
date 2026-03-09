// Role-based section visibility orchestration for dashboard boot and refresh paths.
export function applyDashboardRoleLayoutVisibility(ctx) {
  const {
    role,
    hideSection,
    showSection,
    adminAccountSupportSection,
    contactAdminBtn,
    subscriptionQuickPanel,
    subscriberSubscriptionSection,
    first7DaysSnapshotSection,
    subscriptionBillingCycle,
    subscriptionBillingProvider,
    startBilling,
    manageBilling,
    businessGrowthSection,
    subscriberExecutivePulseSection,
    subscriberCopilotSection,
    businessProfileSection,
    socialMediaSection,
    accountingIntegrationsSection,
    subscriberCommandCenterSection,
    staffRosterSection,
    waitlistSection,
    operationsInsightsSection,
    crmSection,
    commercialSection,
    merchSection,
    revenueAttributionSection,
    profitabilitySection,
    bookingSort,
    customerJourneyActionsSection,
    customerSearchSection,
    customerReceptionSection,
    customerLexiCalendarSection,
    customerSlotsSection,
    customerHistorySection,
    customerAnalyticsSection,
    adminCopilotSection,
    accountingPlatformExportBtn,
    adminPlatformSection,
    frontDeskSection,
    bookingOperationsSection,
    metricsGrid,
    dashboardQuickActionsSection,
    subscriberCalendarSection,
    bookingStatus,
    setActiveStatusChip,
    dashIdentityBlock,
    adminBusinessScope,
    initializeCustomerExperience,
    subscriberFullDemoModeSection
  } = ctx;

  const hideSubscriberSecondarySections = () => {
    hideSection(subscriberExecutivePulseSection);
    hideSection(subscriberCopilotSection);
    hideSection(subscriberCommandCenterSection);
    hideSection(staffRosterSection);
    hideSection(waitlistSection);
    hideSection(operationsInsightsSection);
    hideSection(crmSection);
    hideSection(commercialSection);
    hideSection(merchSection);
    hideSection(revenueAttributionSection);
    hideSection(profitabilitySection);
    hideSection(subscriberSubscriptionSection);
    hideSection(first7DaysSnapshotSection);
    hideSection(metricsGrid);
  };

  const hideCustomerSecondarySections = () => {
    hideSection(customerJourneyActionsSection);
    hideSection(customerAnalyticsSection);
    hideSection(frontDeskSection);
  };

  hideSection(adminAccountSupportSection);
  if (role !== "subscriber") {
    hideSection(contactAdminBtn);
    if (subscriptionQuickPanel) subscriptionQuickPanel.style.display = "none";
    hideSection(subscriberSubscriptionSection);
    hideSection(first7DaysSnapshotSection);
    if (subscriptionBillingCycle) subscriptionBillingCycle.style.display = "none";
    if (subscriptionBillingProvider) subscriptionBillingProvider.style.display = "none";
    if (startBilling) startBilling.style.display = "none";
    if (manageBilling) manageBilling.style.display = "none";
  }
  if (role !== "subscriber" && role !== "admin") {
    hideSection(businessGrowthSection);
    hideSection(subscriberExecutivePulseSection);
    hideSection(subscriberCopilotSection);
    hideSection(businessProfileSection);
    hideSection(socialMediaSection);
    hideSection(accountingIntegrationsSection);
    hideSection(subscriberCommandCenterSection);
    hideSection(staffRosterSection);
    hideSection(waitlistSection);
    hideSection(operationsInsightsSection);
    hideSection(crmSection);
    hideSection(commercialSection);
    hideSection(merchSection);
    hideSection(revenueAttributionSection);
    hideSection(profitabilitySection);
    if (bookingSort) bookingSort.value = "newest";
  }
  if (role !== "customer") {
    hideSection(customerJourneyActionsSection);
    hideSection(customerSearchSection);
    hideSection(customerReceptionSection);
    hideSection(customerLexiCalendarSection);
    hideSection(customerSlotsSection);
    hideSection(customerHistorySection);
    hideSection(customerAnalyticsSection);
  }
  if (role !== "admin") {
    hideSection(adminCopilotSection);
    hideSection(accountingPlatformExportBtn);
    hideSection(adminPlatformSection);
  }
  if (role !== "subscriber") {
    hideSection(subscriberCopilotSection);
  }
  if (role === "subscriber" || role === "admin") {
    hideSection(frontDeskSection);
  }
  if (role === "subscriber" || role === "admin") {
    hideSubscriberSecondarySections();
  }
  if (role === "admin") {
    hideSection(contactAdminBtn);
    hideSection(dashboardQuickActionsSection);
    hideSection(subscriberCalendarSection);
    hideSection(bookingOperationsSection);
    hideSection(businessGrowthSection);
    hideSection(adminCopilotSection);
    showSection(adminPlatformSection);
  }
  if (role === "customer") {
    if (bookingStatus) bookingStatus.value = "all";
    setActiveStatusChip("all");
    showSection(dashIdentityBlock);
    hideSubscriberSecondarySections();
    hideCustomerSecondarySections();
    hideSection(subscriberCalendarSection);
    hideSection(bookingOperationsSection);
    hideSection(businessProfileSection);
    hideSection(socialMediaSection);
    hideSection(accountingIntegrationsSection);
    hideSection(revenueAttributionSection);
    hideSection(profitabilitySection);
    hideSection(adminBusinessScope);
    hideSection(adminCopilotSection);
    hideSection(subscriberSubscriptionSection);
    hideSection(first7DaysSnapshotSection);
    initializeCustomerExperience();
  }
  if (role === "subscriber") {
    hideSubscriberSecondarySections();
    showSection(dashboardQuickActionsSection);
    showSection(subscriberCalendarSection);
    showSection(bookingOperationsSection);
    hideSection(businessGrowthSection);
  }
  // Full demo lab remains intentionally hidden in current UX direction.
  hideSection(subscriberFullDemoModeSection);
}
