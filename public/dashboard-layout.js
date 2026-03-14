// Role-based section visibility orchestration for dashboard boot and refresh paths.
export function applyDashboardRoleLayoutVisibility(ctx) {
  const {
    role,
    hideSection,
    showSection,
    subscriberDashboard,
    customerDashboard,
    adminDashboard,
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
    adminCopilotSection,
    accountingPlatformExportBtn,
    adminPlatformSection,
    frontDeskSection,
    bookingOperationsSection,
    metricsGrid,
    bookingStatus,
    setActiveStatusChip,
    dashIdentityBlock,
    initializeCustomerExperience,
    subscriberFullDemoModeSection
  } = ctx;

  const hideSections = (sections = []) => {
    sections.forEach((sectionEl) => hideSection(sectionEl));
  };

  hideSection(subscriberDashboard);
  hideSection(customerDashboard);
  hideSection(adminDashboard);

  if (role === "subscriber") {
    showSection(subscriberDashboard);
  } else if (role === "customer") {
    showSection(customerDashboard);
  } else if (role === "admin") {
    showSection(adminDashboard);
  }

  const subscriberSecondarySections = [
    subscriberExecutivePulseSection,
    subscriberCopilotSection,
    subscriberCommandCenterSection,
    staffRosterSection,
    waitlistSection,
    operationsInsightsSection,
    crmSection,
    commercialSection,
    merchSection,
    revenueAttributionSection,
    profitabilitySection,
    subscriberSubscriptionSection,
    first7DaysSnapshotSection,
    metricsGrid
  ];
  const customerSections = [
    customerJourneyActionsSection
  ];
  const customerSecondarySections = [
    customerJourneyActionsSection,
    frontDeskSection
  ];
  const businessWorkspaceSections = [
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
    profitabilitySection
  ];

  const hideSubscriberSecondarySections = () => {
    hideSections(subscriberSecondarySections);
  };

  const hideCustomerSecondarySections = () => {
    hideSections(customerSecondarySections);
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
    hideSections(businessWorkspaceSections);
    if (bookingSort) bookingSort.value = "newest";
  }
  if (role !== "customer") {
    hideSections(customerSections);
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
    hideSections([
      bookingOperationsSection,
      businessProfileSection,
      socialMediaSection,
      accountingIntegrationsSection,
      revenueAttributionSection,
      profitabilitySection,
      adminCopilotSection,
      subscriberSubscriptionSection,
      first7DaysSnapshotSection
    ]);
    initializeCustomerExperience();
  }
  if (role === "subscriber") {
    hideSubscriberSecondarySections();
    showSection(subscriberExecutivePulseSection);
    showSection(bookingOperationsSection);
    hideSection(businessGrowthSection);
  }
  // Full demo lab remains intentionally hidden in current UX direction.
  hideSection(subscriberFullDemoModeSection);
}
