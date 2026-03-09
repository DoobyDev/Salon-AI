export function registerApplicationRoutes({
  app,
  healthHandler,
  readinessHandler,
  configHandler,
  lexiAvatarConfigHandler,
  lexiRealtimeSessionHandler,
  lexiAvatarSessionHandler,
  lexiAvatarSessionStopHandler,
  authLimiter,
  registerSubscriberHandler,
  registerCustomerHandler,
  loginHandler,
  searchBusinessesHandler,
  publicBusinessDetailHandler,
  authRequired,
  requireRole,
  businessProfileGetHandler,
  businessProfileSaveHandler,
  businessBookingSuggestionsHandler,
  applyBusinessTemplateHandler,
  businessSocialMediaGetHandler,
  businessSocialMediaSaveHandler,
  businessReminderSettingsGetHandler,
  businessReminderSettingsSaveHandler,
  bookingLimiter,
  createBookingHandler,
  publicDemoBookingsHandler,
  adminBookingsHandler,
  myBookingsHandler,
  cancelBookingHandler,
  rescheduleBookingHandler,
  updateBookingServiceStateHandler,
  adminDashboardHandler,
  adminRevenueAnalyticsHandler,
  adminRevenueAnalyticsExportHandler,
  adminBusinessesHandler,
  adminAccountsHandler,
  adminAccountUpdateHandler,
  subscriberCopilotHandler,
  adminCopilotHandler,
  subscriberDashboardHandler,
  recoveryActionMarkHandler,
  rebookingMarkSentHandler,
  customerDashboardHandler,
  crmSegmentsHandler,
  crmCampaignSendHandler,
  commercialControlsHandler,
  upsertMembershipHandler,
  upsertPackageHandler,
  issueGiftCardHandler,
  redeemGiftCardHandler,
  upsertMerchHandler,
  createMerchShipmentHandler,
  revenueAttributionHandler,
  revenueAttributionSpendHandler,
  profitabilitySummaryHandler,
  upsertProfitabilityPayrollHandler,
  deleteProfitabilityPayrollHandler,
  upsertProfitabilityCostsHandler,
  liveRevenueHandler,
  accountingExportHandler,
  businessReportEmailHandler,
  accountingIntegrationsListHandler,
  accountingIntegrationsConnectHandler,
  accountingIntegrationsDisconnectHandler,
  staffRosterHandler,
  upsertStaffRosterHandler,
  updateStaffAvailabilityHandler,
  deleteStaffRosterHandler,
  staffRotaWeekHandler,
  bulkUpdateStaffRotaHandler,
  resetStaffRotaHandler,
  waitlistHandler,
  upsertWaitlistHandler,
  waitlistBackfillHandler,
  deleteWaitlistHandler,
  customerRecordsListHandler,
  customerRecordsUpsertHandler,
  subscriberBillingSummaryHandler,
  createCheckoutSessionHandler,
  createPaypalSubscriptionHandler,
  createPortalSessionHandler,
  chatLimiter,
  publicChatHandler,
  authPageHandler,
  dashboardPageHandler
} = {}) {
  app.get("/health", healthHandler);
  app.get("/readyz", readinessHandler);
  app.get("/api/config", configHandler);

  app.get("/api/lexi/avatar-config", lexiAvatarConfigHandler);
  app.post("/api/lexi/realtime/session", lexiRealtimeSessionHandler);
  app.post("/api/lexi/avatar/session", lexiAvatarSessionHandler);
  app.post("/api/lexi/avatar/session/stop", lexiAvatarSessionStopHandler);

  app.post("/api/auth/register/subscriber", authLimiter, registerSubscriberHandler);
  app.post("/api/auth/register/customer", authLimiter, registerCustomerHandler);
  app.post("/api/auth/login", authLimiter, loginHandler);

  app.get("/api/search/businesses", searchBusinessesHandler);
  app.get("/api/businesses/:businessId", publicBusinessDetailHandler);
  app.get("/api/businesses/me/profile", authRequired, requireRole("subscriber", "admin"), businessProfileGetHandler);
  app.post("/api/businesses/me/profile", authRequired, requireRole("subscriber", "admin"), businessProfileSaveHandler);
  app.get("/api/businesses/me/booking-suggestions", authRequired, requireRole("subscriber", "admin"), businessBookingSuggestionsHandler);
  app.post("/api/businesses/me/profile/apply-template", authRequired, requireRole("subscriber", "admin"), applyBusinessTemplateHandler);
  app.get("/api/businesses/me/social-media", authRequired, requireRole("subscriber", "admin"), businessSocialMediaGetHandler);
  app.post("/api/businesses/me/social-media", authRequired, requireRole("subscriber", "admin"), businessSocialMediaSaveHandler);
  app.get("/api/businesses/me/reminder-settings", authRequired, requireRole("subscriber", "admin"), businessReminderSettingsGetHandler);
  app.post("/api/businesses/me/reminder-settings", authRequired, requireRole("subscriber", "admin"), businessReminderSettingsSaveHandler);

  app.post("/api/bookings", bookingLimiter, createBookingHandler);
  app.get("/api/bookings/public-demo", publicDemoBookingsHandler);
  app.get("/api/bookings", authRequired, requireRole("admin"), adminBookingsHandler);
  app.get("/api/me/bookings", authRequired, myBookingsHandler);
  app.patch("/api/bookings/:bookingId/cancel", authRequired, bookingLimiter, cancelBookingHandler);
  app.patch("/api/bookings/:bookingId/reschedule", authRequired, bookingLimiter, rescheduleBookingHandler);
  app.patch("/api/bookings/:bookingId/service-state", authRequired, bookingLimiter, requireRole("subscriber", "admin"), updateBookingServiceStateHandler);

  app.get("/api/dashboard/admin", authRequired, requireRole("admin"), adminDashboardHandler);
  app.get("/api/dashboard/admin/revenue-analytics", authRequired, requireRole("admin"), adminRevenueAnalyticsHandler);
  app.get("/api/dashboard/admin/revenue-analytics/export", authRequired, requireRole("admin"), adminRevenueAnalyticsExportHandler);
  app.get("/api/admin/businesses", authRequired, requireRole("admin"), adminBusinessesHandler);
  app.get("/api/admin/accounts", authRequired, requireRole("admin"), adminAccountsHandler);
  app.patch("/api/admin/accounts/:userId", authRequired, requireRole("admin"), adminAccountUpdateHandler);

  app.post("/api/copilot/subscriber", authRequired, requireRole("subscriber", "admin"), subscriberCopilotHandler);
  app.post("/api/admin/copilot", authRequired, requireRole("admin"), adminCopilotHandler);
  app.get("/api/dashboard/subscriber", authRequired, requireRole("subscriber", "admin"), subscriberDashboardHandler);
  app.post("/api/operations/recovery/mark-action", authRequired, requireRole("subscriber", "admin"), recoveryActionMarkHandler);
  app.post("/api/operations/rebooking/mark-sent", authRequired, requireRole("subscriber", "admin"), rebookingMarkSentHandler);
  app.get("/api/dashboard/customer", authRequired, requireRole("customer"), customerDashboardHandler);
  app.get("/api/crm/segments", authRequired, requireRole("subscriber", "admin"), crmSegmentsHandler);
  app.post("/api/crm/campaigns/send", authRequired, requireRole("subscriber", "admin"), crmCampaignSendHandler);

  app.get("/api/commercial-controls", authRequired, requireRole("subscriber", "admin"), commercialControlsHandler);
  app.post("/api/commercial-controls/memberships/upsert", authRequired, requireRole("subscriber", "admin"), upsertMembershipHandler);
  app.post("/api/commercial-controls/packages/upsert", authRequired, requireRole("subscriber", "admin"), upsertPackageHandler);
  app.post("/api/commercial-controls/gift-cards/issue", authRequired, requireRole("subscriber", "admin"), issueGiftCardHandler);
  app.post("/api/commercial-controls/gift-cards/:giftCardId/redeem", authRequired, requireRole("subscriber", "admin"), redeemGiftCardHandler);
  app.post("/api/commercial-controls/merch/upsert", authRequired, requireRole("subscriber", "admin"), upsertMerchHandler);
  app.post("/api/commercial-controls/merch/:merchId/ship", authRequired, requireRole("subscriber", "admin"), createMerchShipmentHandler);

  app.get("/api/revenue-attribution", authRequired, requireRole("subscriber", "admin"), revenueAttributionHandler);
  app.post("/api/revenue-attribution/spend", authRequired, requireRole("subscriber", "admin"), revenueAttributionSpendHandler);
  app.get("/api/profitability-summary", authRequired, requireRole("subscriber", "admin"), profitabilitySummaryHandler);
  app.post("/api/profitability/payroll/upsert", authRequired, requireRole("subscriber", "admin"), upsertProfitabilityPayrollHandler);
  app.delete("/api/profitability/payroll/:entryId", authRequired, requireRole("subscriber", "admin"), deleteProfitabilityPayrollHandler);
  app.post("/api/profitability/costs/upsert", authRequired, requireRole("subscriber", "admin"), upsertProfitabilityCostsHandler);

  app.get("/api/accounting-integrations/live-revenue", authRequired, requireRole("subscriber", "admin"), liveRevenueHandler);
  app.get("/api/accounting-integrations/export", authRequired, requireRole("subscriber", "admin"), accountingExportHandler);
  app.post("/api/business-reports/email", authRequired, requireRole("subscriber", "admin"), businessReportEmailHandler);
  app.get("/api/accounting-integrations", authRequired, requireRole("subscriber", "admin"), accountingIntegrationsListHandler);
  app.post("/api/accounting-integrations/connect", authRequired, requireRole("subscriber", "admin"), accountingIntegrationsConnectHandler);
  app.post("/api/accounting-integrations/:provider/disconnect", authRequired, requireRole("subscriber", "admin"), accountingIntegrationsDisconnectHandler);

  app.get("/api/staff-roster", authRequired, requireRole("subscriber", "admin"), staffRosterHandler);
  app.post("/api/staff-roster/upsert", authRequired, requireRole("subscriber", "admin"), upsertStaffRosterHandler);
  app.post("/api/staff-roster/:staffId/availability", authRequired, requireRole("subscriber", "admin"), updateStaffAvailabilityHandler);
  app.delete("/api/staff-roster/:staffId", authRequired, requireRole("subscriber", "admin"), deleteStaffRosterHandler);
  app.get("/api/staff-roster/rota", authRequired, requireRole("subscriber", "admin"), staffRotaWeekHandler);
  app.post("/api/staff-roster/rota/bulk", authRequired, requireRole("subscriber", "admin"), bulkUpdateStaffRotaHandler);
  app.post("/api/staff-roster/rota/reset", authRequired, requireRole("subscriber", "admin"), resetStaffRotaHandler);

  app.get("/api/waitlist", authRequired, requireRole("subscriber", "admin"), waitlistHandler);
  app.post("/api/waitlist/upsert", authRequired, requireRole("subscriber", "admin"), upsertWaitlistHandler);
  app.post("/api/waitlist/:entryId/backfill", authRequired, requireRole("subscriber", "admin"), waitlistBackfillHandler);
  app.delete("/api/waitlist/:entryId", authRequired, requireRole("subscriber", "admin"), deleteWaitlistHandler);
  app.get("/api/customer-records", authRequired, requireRole("subscriber", "admin"), customerRecordsListHandler);
  app.post("/api/customer-records/upsert", authRequired, requireRole("subscriber", "admin"), customerRecordsUpsertHandler);

  app.get("/api/billing/subscriber-summary", authRequired, requireRole("subscriber", "admin"), subscriberBillingSummaryHandler);
  app.post("/api/billing/create-checkout-session", authRequired, requireRole("subscriber"), createCheckoutSessionHandler);
  app.post("/api/billing/create-paypal-subscription", authRequired, requireRole("subscriber"), createPaypalSubscriptionHandler);
  app.post("/api/billing/create-portal-session", authRequired, requireRole("subscriber"), createPortalSessionHandler);

  app.post("/api/chat", chatLimiter, publicChatHandler);

  app.get("/auth", authPageHandler);
  app.get("/dashboard", dashboardPageHandler);
}
