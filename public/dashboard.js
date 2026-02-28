const params = new URLSearchParams(window.location.search);
// Dashboard mock/demo mode is disabled to preserve a stable live layout.
const isMockMode = false;
const roleParam = String(params.get("role") || "").trim().toLowerCase();
const adminBusinessParam = String(params.get("businessId") || "").trim();

const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";
const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
const userRaw = sessionStorage.getItem(AUTH_USER_KEY);

if (!isMockMode && (!token || !userRaw)) {
  window.location.href = "/auth";
}

const mockRole = roleParam || "subscriber";
const user = isMockMode
  ? {
      id: "mock-user-1",
      role: mockRole,
      name: "Morgan Blake",
      email: "morgan@lumenstudio.example"
    }
  : JSON.parse(userRaw || "{}");
const currentRole = String(user.role || "").trim().toLowerCase();
if (document.body) {
  document.body.setAttribute("data-role", currentRole);
}

const dashTitle = document.getElementById("dashTitle");
const dashUser = document.getElementById("dashUser");
const dashRoleHint = document.getElementById("dashRoleHint");
const dashActionStatus = document.getElementById("dashActionStatus");
const dashboardOverviewSection = document.getElementById("dashboardOverviewSection");
const dashIdentityBlock = dashTitle?.parentElement || null;
const frontDeskSection = document.getElementById("frontDeskSection");
const customerSearchSection = document.getElementById("customerSearchSection");
const customerSearchForm = document.getElementById("customerSearchForm");
const customerSearchQuery = document.getElementById("customerSearchQuery");
const customerSearchService = document.getElementById("customerSearchService");
const customerSearchBusinessType = document.getElementById("customerSearchBusinessType");
const customerSearchLocation = document.getElementById("customerSearchLocation");
const customerSearchRating = document.getElementById("customerSearchRating");
const customerSearchDate = document.getElementById("customerSearchDate");
const customerSearchReset = document.getElementById("customerSearchReset");
const customerSearchResults = document.getElementById("customerSearchResults");
const customerReceptionSection = document.getElementById("customerReceptionSection");
const customerReceptionMessages = document.getElementById("customerReceptionMessages");
const customerReceptionForm = document.getElementById("customerReceptionForm");
const customerReceptionInput = document.getElementById("customerReceptionInput");
const customerChatGuideHint = document.getElementById("customerChatGuideHint");
const customerLexiLaunchBtn = document.getElementById("customerLexiLaunchBtn");
const customerLexiLaunchBookingBtn = document.getElementById("customerLexiLaunchBookingBtn");
const customerLexiCalendarSection = document.getElementById("customerLexiCalendarSection");
const customerLexiPlannerMeta = document.getElementById("customerLexiPlannerMeta");
const customerLexiStaffLegend = document.getElementById("customerLexiStaffLegend");
const customerLexiAskNextBest = document.getElementById("customerLexiAskNextBest");
const customerLexiCalendarMonth = document.getElementById("customerLexiCalendarMonth");
const customerLexiCalendarMeta = document.getElementById("customerLexiCalendarMeta");
const customerLexiCalendarGrid = document.getElementById("customerLexiCalendarGrid");
const customerLexiCalendarViewTabs = document.getElementById("customerLexiCalendarViewTabs");
const customerLexiCalendarPrev = document.getElementById("customerLexiCalendarPrev");
const customerLexiCalendarNext = document.getElementById("customerLexiCalendarNext");
const customerLexiDaySummary = document.getElementById("customerLexiDaySummary");
const customerSlotsSection = document.getElementById("customerSlotsSection");
const customerSelectedSalonLabel = document.getElementById("customerSelectedSalonLabel");
const customerSalonContact = document.getElementById("customerSalonContact");
const customerAvailableSlots = document.getElementById("customerAvailableSlots");
const customerHistorySection = document.getElementById("customerHistorySection");
const customerBookingHistory = document.getElementById("customerBookingHistory");
const customerAnalyticsSection = document.getElementById("customerAnalyticsSection");
const customerAnalyticsGrid = document.getElementById("customerAnalyticsGrid");
const metricsGrid = document.getElementById("metricsGrid");
const subscriberCommandCenterSection = document.getElementById("subscriberCommandCenterSection");
const commandCenterCards = document.getElementById("commandCenterCards");
const commandCenterActions = document.getElementById("commandCenterActions");
const commandCenterStatus = document.getElementById("commandCenterStatus");
const bookingsList = document.getElementById("bookings");
const bookingSearch = document.getElementById("bookingSearch");
const bookingStatus = document.getElementById("bookingStatus");
const bookingSort = document.getElementById("bookingSort");
const statusChips = document.getElementById("statusChips");
const bookingTools = document.getElementById("bookingTools");
const bookingPendingBanner = document.getElementById("bookingPendingBanner");
const bookingOperationsSection = bookingTools?.closest("section") || null;
const bookingRangeToolbar = document.getElementById("bookingRangeToolbar");
const bookingRangeToday = document.getElementById("bookingRangeToday");
const bookingRangeWeek = document.getElementById("bookingRangeWeek");
const bookingRangeMonth = document.getElementById("bookingRangeMonth");
const bookingRangeClear = document.getElementById("bookingRangeClear");
const bookingCalendarSelectionStatus = document.getElementById("bookingCalendarSelectionStatus");
const businessGrowthSection = document.getElementById("businessGrowthSection");
const hubCommandSignalGrid = document.getElementById("hubCommandSignalGrid");
const hubReportStatusPill = document.getElementById("hubReportStatusPill");
const hubPrintReportBtn = document.getElementById("hubPrintReportBtn");
const hubEmailReportBtn = document.getElementById("hubEmailReportBtn");
const hubReportHighlights = document.getElementById("hubReportHighlights");
const hubReportStatusText = document.getElementById("hubReportStatusText");
const hubPriorityList = document.getElementById("hubPriorityList");
const hubAutoRoutines = document.getElementById("hubAutoRoutines");
const hubRunPrioritySweepBtn = document.getElementById("hubRunPrioritySweepBtn");
const subscriberLexiQuickOpenButtons = Array.from(document.querySelectorAll("[data-open-subscriber-lexi]"));
const billingLiveBanner = document.getElementById("billingLiveBanner");
const billingLiveMeta = document.getElementById("billingLiveMeta");
const yearlySavingsLine = document.getElementById("yearlySavingsLine");
const subscriberSubscriptionSection = document.getElementById("subscriberSubscriptionSection");
const onboardingSummaryList = document.getElementById("onboardingSummaryList");
const onboardingQuickActionsList = document.getElementById("onboardingQuickActionsList");
const onboardingStatusList = document.getElementById("onboardingStatusList");
const onboardingChecklist = document.getElementById("onboardingChecklist");
const first7DaysGrid = document.getElementById("first7DaysGrid");
const first7DaysSnapshotSection = document.getElementById("first7DaysSnapshotSection");
const moduleNavigatorSection = document.getElementById("moduleNavigatorSection");
const moduleNavigatorIntro = document.getElementById("moduleNavigatorIntro");
const moduleCards = document.getElementById("moduleCards");
const moduleDetails = document.getElementById("moduleDetails");
const dashboardQuickActionsSection = document.getElementById("dashboardQuickActionsSection");
const subscriberFullDemoModeSection = document.getElementById("subscriberFullDemoModeSection");
const subscriberFullDemoModeSummary = document.getElementById("subscriberFullDemoModeSummary");
const subscriberFullDemoModeModules = document.getElementById("subscriberFullDemoModeModules");
const subscriberDemoCustomerAccounts = document.getElementById("subscriberDemoCustomerAccounts");
const subscriberDemoSubscriberAccounts = document.getElementById("subscriberDemoSubscriberAccounts");
const subscriberFullDemoLaunchers = document.getElementById("subscriberFullDemoLaunchers");
const workspaceBackToDashboardBtn = document.getElementById("workspaceBackToDashboardBtn");
const workspaceStarPanel = document.getElementById("workspaceStarPanel");
const workspaceStarSummary = document.getElementById("workspaceStarSummary");
const workspaceStarAskLexiBtn = document.getElementById("workspaceStarAskLexiBtn");
const workspaceStarOpenCalendarBtn = document.getElementById("workspaceStarOpenCalendarBtn");
const workspaceStarCalendarFocus = document.getElementById("workspaceStarCalendarFocus");
const workspaceStarCalendarNote = document.getElementById("workspaceStarCalendarNote");
const workspaceStarTodayCount = document.getElementById("workspaceStarTodayCount");
const workspaceStarTodayRevenue = document.getElementById("workspaceStarTodayRevenue");
const workspaceStarLexiPrompt = document.getElementById("workspaceStarLexiPrompt");
const workspaceStarLexiHint = document.getElementById("workspaceStarLexiHint");
const mobileBottomNav = document.getElementById("mobileBottomNav");
const mobileQuickSheetOverlay = document.getElementById("mobileQuickSheetOverlay");
const mobileQuickSheetClose = document.getElementById("mobileQuickSheetClose");
const loadMoreBookingsBtn = document.getElementById("loadMoreBookings");
const bookingsCountLabel = document.getElementById("bookingsCountLabel");
const subscriberCalendarSection = document.getElementById("subscriberCalendarSection");
const bookingCalendarGrid = document.getElementById("bookingCalendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarLegend = document.getElementById("calendarLegend");
const bookingCalendarStaffLegend = document.getElementById("bookingCalendarStaffLegend");
const calendarFeatureMeta = document.getElementById("calendarFeatureMeta");
const calendarFeatureStats = document.getElementById("calendarFeatureStats");
const calendarSelectedDaySummary = document.getElementById("calendarSelectedDaySummary");
const calendarLexiCommandDeck = document.getElementById("calendarLexiCommandDeck");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const subscriberExecutivePulseSection = document.getElementById("subscriberExecutivePulseSection");
const executivePulseSubtitle = document.getElementById("executivePulseSubtitle");
const executivePulseSignals = document.getElementById("executivePulseSignals");
const executivePulseGauges = document.getElementById("executivePulseGauges");
const executivePulseBars = document.getElementById("executivePulseBars");
const executivePulseActions = document.getElementById("executivePulseActions");
const executivePulseRangeTabs = document.getElementById("executivePulseRangeTabs");
const executivePulseRangeMeta = document.getElementById("executivePulseRangeMeta");
const executivePulseSaveSnapshotBtn = document.getElementById("executivePulseSaveSnapshotBtn");
const executivePulseFinanceWindowLabel = document.getElementById("executivePulseFinanceWindowLabel");
const executivePulseFinanceStats = document.getElementById("executivePulseFinanceStats");
const executivePulseRevenueChart = document.getElementById("executivePulseRevenueChart");
const executivePulseRevenueChartNote = document.getElementById("executivePulseRevenueChartNote");
const executivePulseProfitChart = document.getElementById("executivePulseProfitChart");
const executivePulseProfitChartNote = document.getElementById("executivePulseProfitChartNote");
const executivePulseSnapshotList = document.getElementById("executivePulseSnapshotList");
const subscriberCopilotSection = document.getElementById("subscriberCopilotSection");
const subscriberCopilotForm = document.getElementById("subscriberCopilotForm");
const subscriberCopilotInput = document.getElementById("subscriberCopilotInput");
const subscriberCopilotSend = document.getElementById("subscriberCopilotSend");
const subscriberCopilotClear = document.getElementById("subscriberCopilotClear");
const subscriberCopilotAnswer = document.getElementById("subscriberCopilotAnswer");
const subscriberCopilotFindings = document.getElementById("subscriberCopilotFindings");
const subscriberCopilotFixes = document.getElementById("subscriberCopilotFixes");
const subscriberCopilotSnapshot = document.getElementById("subscriberCopilotSnapshot");
const subscriberCopilotLinks = document.getElementById("subscriberCopilotLinks");
const subscriberBusinessAiContext = document.getElementById("subscriberBusinessAiContext");
const subscriberAiScopeChips = document.getElementById("subscriberAiScopeChips");
const subscriberAiQuickRoutines = document.getElementById("subscriberAiQuickRoutines");
const subscriberCopilotOpenPopup = document.getElementById("subscriberCopilotOpenPopup");
const subscriberCopilotPopup = document.getElementById("subscriberCopilotPopup");
const subscriberCopilotPopupClose = document.getElementById("subscriberCopilotPopupClose");
const subscriberCopilotMessages = document.getElementById("subscriberCopilotMessages");
const adminCopilotSection = document.getElementById("adminCopilotSection");
const adminCopilotForm = document.getElementById("adminCopilotForm");
const adminCopilotInput = document.getElementById("adminCopilotInput");
const adminCopilotSend = document.getElementById("adminCopilotSend");
const adminCopilotClear = document.getElementById("adminCopilotClear");
const adminCopilotAnswer = document.getElementById("adminCopilotAnswer");
const adminCopilotFindings = document.getElementById("adminCopilotFindings");
const adminCopilotFixes = document.getElementById("adminCopilotFixes");
const adminBusinessAiContext = document.getElementById("adminBusinessAiContext");
const adminAiScopeChips = document.getElementById("adminAiScopeChips");
const adminAiQuickRoutines = document.getElementById("adminAiQuickRoutines");
const adminCopilotOpenPopup = document.getElementById("adminCopilotOpenPopup");
const adminCopilotPopup = document.getElementById("adminCopilotPopup");
const adminCopilotPopupClose = document.getElementById("adminCopilotPopupClose");
const adminCopilotMessages = document.getElementById("adminCopilotMessages");
const accountingIntegrationsSection = document.getElementById("accountingIntegrationsSection");
const accountingConnectForm = document.getElementById("accountingConnectForm");
const accountingProvider = document.getElementById("accountingProvider");
const accountingAccountLabel = document.getElementById("accountingAccountLabel");
const accountingSyncMode = document.getElementById("accountingSyncMode");
const accountingStatusNote = document.getElementById("accountingStatusNote");
const accountingIntegrationsList = document.getElementById("accountingIntegrationsList");
const accountingLivePanel = document.getElementById("accountingLivePanel");
const accountingLiveCards = document.getElementById("accountingLiveCards");
const accountingLiveGauges = document.getElementById("accountingLiveGauges");
const accountingLiveRevenueBars = document.getElementById("accountingLiveRevenueBars");
const accountingLiveCancelBars = document.getElementById("accountingLiveCancelBars");
const accountingLiveNote = document.getElementById("accountingLiveNote");
const accountingTimeframeSwitch = document.getElementById("accountingTimeframeSwitch");
const accountingTfToday = document.getElementById("accountingTfToday");
const accountingTf7d = document.getElementById("accountingTf7d");
const accountingTf30d = document.getElementById("accountingTf30d");
const accountingQuickFilterGroup = document.getElementById("accountingQuickFilterGroup");
const accountingQfWeek = document.getElementById("accountingQfWeek");
const accountingQfMonth = document.getElementById("accountingQfMonth");
const accountingCustomFrom = document.getElementById("accountingCustomFrom");
const accountingCustomTo = document.getElementById("accountingCustomTo");
const accountingCustomApply = document.getElementById("accountingCustomApply");
const logoutBtn = document.getElementById("logoutBtn");
const manageModeToggle = document.getElementById("manageModeToggle");
const contactAdminBtn = document.getElementById("contactAdminBtn");
const demoModeToggle = document.getElementById("demoModeToggle");
const uiDensityToggle = document.getElementById("uiDensityToggle");
const subscriptionBillingCycle = document.getElementById("subscriptionBillingCycle");
const subscriptionBillingProvider = document.getElementById("subscriptionBillingProvider");
const startBilling = document.getElementById("startBilling");
const manageBilling = document.getElementById("manageBilling");
const subscriptionQuickPanel = document.getElementById("subscriptionQuickPanel");
const connectStripeBillingBtn = document.getElementById("connectStripeBillingBtn");
const connectPayPalBillingBtn = document.getElementById("connectPayPalBillingBtn");
const subscriptionPaymentConnectNote = document.getElementById("subscriptionPaymentConnectNote");
const subscriptionCurrentPlanLabel = document.getElementById("subscriptionCurrentPlanLabel");
const subscriptionCurrentPlanMeta = document.getElementById("subscriptionCurrentPlanMeta");
const subscriptionAutoRenewToggle = document.getElementById("subscriptionAutoRenewToggle");
const adminBusinessScope = document.getElementById("adminBusinessScope");
const adminBusinessSelect = document.getElementById("adminBusinessSelect");
const adminBusinessStatus = document.getElementById("adminBusinessStatus");
const accountingBookingExportBtn = document.getElementById("accountingBookingExportBtn");
const accountingPlatformExportBtn = document.getElementById("accountingPlatformExportBtn");
let bookingRows = [];
let nextBookingsCursor = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let calendarTodayRefreshTimerId = null;
let bookingDateFilterLabel = "All dates";
let bookingDateFilterKeys = null;
let bookingDateFilterPreset = "";
let selectedCalendarDateKey = "";
let executivePulseRange = "day";
let latestExecutivePulseSnapshotDraft = null;
let accountingRows = [];
let accountingLivePayload = null;
let accountingLiveTimerId = null;
let accountingLiveTimeframe = "today";
let accountingLiveRangeFrom = "";
let accountingLiveRangeTo = "";
let accountingLiveQuickFilter = "";
let subscriberCommandCenter = null;
const EXECUTIVE_PULSE_SNAPSHOTS_STORAGE_KEY = "salon_ai_executive_pulse_snapshots";
let staffRosterRows = [];
let staffSummary = null;
let staffRotaSelectedMemberId = "";
let staffRotaWeekOffset = 0;
let staffRotaOverrides = {};
let staffRotaOverridesLoaded = false;
let staffRotaWeekLoading = false;
let staffRotaDragPaint = { active: false, seen: new Set() };
let waitlistRows = [];
let waitlistSummary = null;
let operationsInsights = null;
let crmSegmentsPayload = null;
let commercialPayload = null;
let revenueAttributionPayload = null;
let profitabilityPayload = null;
let managedBusinessId = "";
let adminBusinessOptions = [];
let customerSalonResults = [];
let openCopilotPopupRole = "";
let lastCopilotPopupTrigger = null;
let businessCopilotPopupHosts = { subscriber: null, admin: null };
let businessCopilotPopupPlaceholders = { subscriber: null, admin: null };
let selectedCustomerSalonId = "";
let customerReceptionTranscript = [];
let customerLexiCalendarMonthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let customerLexiSelectedDateKey = "";
let customerLexiCalendarView = "day";
let customerLexiPopupOpen = false;
let customerLexiPopupOverlay = null;
let customerLexiPopupContainer = null;
let customerLexiChatPlaceholder = null;
let customerLexiPopupLastFocus = null;
let customerLexiAvatarConfigPromise = null;
let customerLexiRealtimeSessionPromise = null;
let customerLexiRealtimeSession = null;
let customerLexiRealtimeConnection = null;
let customerLexiAvatarSessionPromise = null;
let customerLexiAvatarSession = null;
let customerLexiAvatarRoom = null;
let customerLexiLivekitScriptPromise = null;
let lexiPendingReminderTimerId = null;
let lexiPendingSnoozeUntil = 0;
let lexiPendingLastPopupSignature = "";
let lexiPendingLastToastAt = 0;
let activeModuleKey = "";
let closeModulePopupActive = null;
let billingSummary = null;
let dashboardDemoFillModeEnabled = false;
const MANAGE_MODE_STORAGE_KEY = "salon_ai_manage_mode_v1";
const DASHBOARD_THEME_MODE_STORAGE_KEY = "salon_ai_dashboard_theme_mode_v1";
const DASHBOARD_DEMO_FILL_MODE_STORAGE_KEY = "salon_ai_dashboard_demo_fill_mode_v1";
const DASHBOARD_DEMO_FILL_SESSION_KEY = "salon_ai_dashboard_demo_fill_session_v1";
const SHARED_THEME_STORAGE_KEY = "salonTheme";
const SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY = "salon_ai_subscription_autorenew_pref_v1";
const CONTACT_ADMIN_MESSAGES_STORAGE_KEY = "salon_ai_contact_admin_messages_v1";
const STAFF_ROTA_OVERRIDES_STORAGE_KEY = "salon_ai_staff_rota_overrides_v1";
const OPEN_CLOSE_CHECKLIST_STORAGE_KEY = "salon_ai_open_close_checklist_v1";
const HUB_AUTOROUTINES_STORAGE_KEY = "salon_ai_hub_autoroutines_v1";
const DASHBOARD_INLINE_EDIT_STORAGE_KEY = "salon_ai_dashboard_inline_edits_v1";
const STAFF_ROTA_DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" }
];
let manageModeEnabled = false;
let inlineEditObserver = null;
let inlineEditApplyTimerId = null;
let subscriberAiScope = "today";
let adminAiScope = "diagnostics";
const socialMediaSection = document.getElementById("socialMediaSection");
const socialMediaForm = document.getElementById("socialMediaForm");
const facebookInput = document.getElementById("facebookInput");
const instagramInput = document.getElementById("instagramInput");
const twitterInput = document.getElementById("twitterInput");
const linkedinInput = document.getElementById("linkedinInput");
const tiktokInput = document.getElementById("tiktokInput");
const customSocialInput = document.getElementById("customSocialInput");
const socialImageInput = document.getElementById("socialImageInput");
const socialMediaPreview = document.getElementById("socialMediaPreview");
const businessProfileSection = document.getElementById("businessProfileSection");
const businessProfileOpenSetup = document.getElementById("businessProfileOpenSetup");
const businessProfileSetupOverlay = document.getElementById("businessProfileSetupOverlay");
const businessProfileSetupClose = document.getElementById("businessProfileSetupClose");
const businessProfileSetupCancel = document.getElementById("businessProfileSetupCancel");
const businessProfileForm = document.getElementById("businessProfileForm");
const businessProfileStatus = document.getElementById("businessProfileStatus");
const businessProfileName = document.getElementById("businessProfileName");
const businessProfileType = document.getElementById("businessProfileType");
const businessProfilePhone = document.getElementById("businessProfilePhone");
const businessProfileEmail = document.getElementById("businessProfileEmail");
const businessProfileCity = document.getElementById("businessProfileCity");
const businessProfileCountry = document.getElementById("businessProfileCountry");
const businessProfilePostcode = document.getElementById("businessProfilePostcode");
const businessProfileAddress = document.getElementById("businessProfileAddress");
const businessProfileDescription = document.getElementById("businessProfileDescription");
const businessProfileWebsiteUrl = document.getElementById("businessProfileWebsiteUrl");
const businessProfileWebsiteTitle = document.getElementById("businessProfileWebsiteTitle");
const businessProfileWebsiteSummary = document.getElementById("businessProfileWebsiteSummary");
const businessProfileWebsiteImageUrl = document.getElementById("businessProfileWebsiteImageUrl");
const businessHoursMonday = document.getElementById("businessHoursMonday");
const businessHoursTuesday = document.getElementById("businessHoursTuesday");
const businessHoursWednesday = document.getElementById("businessHoursWednesday");
const businessHoursThursday = document.getElementById("businessHoursThursday");
const businessHoursFriday = document.getElementById("businessHoursFriday");
const businessHoursSaturday = document.getElementById("businessHoursSaturday");
const businessHoursSunday = document.getElementById("businessHoursSunday");
const businessProfileServices = document.getElementById("businessProfileServices");
const businessProfileApplyTemplate = document.getElementById("businessProfileApplyTemplate");
const staffRosterSection = document.getElementById("staffRosterSection");
const staffRosterForm = document.getElementById("staffRosterForm");
const staffNameInput = document.getElementById("staffNameInput");
const staffRoleInput = document.getElementById("staffRoleInput");
const staffAvailabilityInput = document.getElementById("staffAvailabilityInput");
const staffShiftDaysInput = document.getElementById("staffShiftDaysInput");
const staffSummaryCards = document.getElementById("staffSummaryCards");
const staffRosterList = document.getElementById("staffRosterList");
const staffStatusNote = document.getElementById("staffStatusNote");
const staffWeekPrevBtn = document.getElementById("staffWeekPrevBtn");
const staffWeekTodayBtn = document.getElementById("staffWeekTodayBtn");
const staffWeekNextBtn = document.getElementById("staffWeekNextBtn");
const staffWeekLabel = document.getElementById("staffWeekLabel");
const staffAutoCoverBtn = document.getElementById("staffAutoCoverBtn");
const staffClearWeekOverridesBtn = document.getElementById("staffClearWeekOverridesBtn");
const staffLoadDemoRotaBtn = document.getElementById("staffLoadDemoRotaBtn");
const staffRotaGrid = document.getElementById("staffRotaGrid");
const staffCoverageStrip = document.getElementById("staffCoverageStrip");
const staffCoverageAlerts = document.getElementById("staffCoverageAlerts");
const staffRotaHint = document.getElementById("staffRotaHint");
const staffBrushStatusSelect = document.getElementById("staffBrushStatusSelect");
const staffBrushShiftSelect = document.getElementById("staffBrushShiftSelect");
const staffColorLegend = document.getElementById("staffColorLegend");
const waitlistSection = document.getElementById("waitlistSection");
const waitlistForm = document.getElementById("waitlistForm");
const waitlistNameInput = document.getElementById("waitlistNameInput");
const waitlistPhoneInput = document.getElementById("waitlistPhoneInput");
const waitlistEmailInput = document.getElementById("waitlistEmailInput");
const waitlistServiceInput = document.getElementById("waitlistServiceInput");
const waitlistDateInput = document.getElementById("waitlistDateInput");
const waitlistSummaryCards = document.getElementById("waitlistSummaryCards");
const waitlistList = document.getElementById("waitlistList");
const waitlistStatusNote = document.getElementById("waitlistStatusNote");
const operationsInsightsSection = document.getElementById("operationsInsightsSection");
const noShowRiskList = document.getElementById("noShowRiskList");
const rebookingPromptList = document.getElementById("rebookingPromptList");
const operationsStatusNote = document.getElementById("operationsStatusNote");
const crmSection = document.getElementById("crmSection");
const crmSegmentsList = document.getElementById("crmSegmentsList");
const crmStatusNote = document.getElementById("crmStatusNote");
const commercialSection = document.getElementById("commercialSection");
const commercialSummaryCards = document.getElementById("commercialSummaryCards");
const membershipForm = document.getElementById("membershipForm");
const membershipNameInput = document.getElementById("membershipNameInput");
const membershipPriceInput = document.getElementById("membershipPriceInput");
const membershipCycleInput = document.getElementById("membershipCycleInput");
const membershipBenefitsInput = document.getElementById("membershipBenefitsInput");
const membershipList = document.getElementById("membershipList");
const packageForm = document.getElementById("packageForm");
const packageNameInput = document.getElementById("packageNameInput");
const packagePriceInput = document.getElementById("packagePriceInput");
const packageSessionsInput = document.getElementById("packageSessionsInput");
const packageList = document.getElementById("packageList");
const giftCardForm = document.getElementById("giftCardForm");
const giftPurchaserInput = document.getElementById("giftPurchaserInput");
const giftRecipientInput = document.getElementById("giftRecipientInput");
const giftBalanceInput = document.getElementById("giftBalanceInput");
const giftExpiresInput = document.getElementById("giftExpiresInput");
const giftCardList = document.getElementById("giftCardList");
const commercialStatusNote = document.getElementById("commercialStatusNote");
const revenueAttributionSection = document.getElementById("revenueAttributionSection");
const revenueSummaryCards = document.getElementById("revenueSummaryCards");
const revenueSpendForm = document.getElementById("revenueSpendForm");
const revenueChannelInput = document.getElementById("revenueChannelInput");
const revenueSpendInput = document.getElementById("revenueSpendInput");
const revenueChannelList = document.getElementById("revenueChannelList");
const revenueStatusNote = document.getElementById("revenueStatusNote");
const profitabilitySection = document.getElementById("profitabilitySection");
const profitSummaryCards = document.getElementById("profitSummaryCards");
const profitPayrollForm = document.getElementById("profitPayrollForm");
const profitStaffNameInput = document.getElementById("profitStaffNameInput");
const profitStaffRoleInput = document.getElementById("profitStaffRoleInput");
const profitStaffHoursInput = document.getElementById("profitStaffHoursInput");
const profitStaffRateInput = document.getElementById("profitStaffRateInput");
const profitStaffBonusInput = document.getElementById("profitStaffBonusInput");
const profitPayrollList = document.getElementById("profitPayrollList");
const profitCostsForm = document.getElementById("profitCostsForm");
const profitRentInput = document.getElementById("profitRentInput");
const profitUtilitiesInput = document.getElementById("profitUtilitiesInput");
const profitSoftwareInput = document.getElementById("profitSoftwareInput");
const profitOtherInput = document.getElementById("profitOtherInput");
const profitCogsPercentInput = document.getElementById("profitCogsPercentInput");
const profitStatusNote = document.getElementById("profitStatusNote");
// Mock data for Front Desk preview
const frontDeskMock = {
  logo: "/icons/barber.svg",
  name: "Glow Studio Salon",
  rating: "4.5/5",
  description: "Premium color and styling studio in central London.",
  social: [
    { label: "Facebook", url: "https://facebook.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>" },
    { label: "Instagram", url: "https://instagram.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>" }
  ],
  services: [
    { name: "Balayage", price: "£230", duration: "180min", image: "/icons/balayage.svg" },
    { name: "Blowout", price: "£50", duration: "45min", image: "/icons/blowout.svg" },
    { name: "Women's Haircut", price: "£85", duration: "60min", image: "/icons/haircut.svg" }
  ],
  reviews: [
    { text: "Amazing color and service!", rating: "5/5", author: "Ava T." },
    { text: "Best beauty business in London.", rating: "4/5", author: "Daniel R." }
  ],
  analytics: [
    { label: "Bookings", value: "128" },
    { label: "Revenue", value: "£14,920" },
    { label: "No-Show Rate", value: "3.6%" },
    { label: "Repeat Client Rate", value: "62%" }
  ],
  aiChat: "Hi, I'm Lexi. How can I help today?"
};

const customerSalonDirectory = [
  {
    id: "salon-urban-fade",
    name: "Urban Fade Studio",
    businessType: "barbershop",
    city: "Downtown",
    rating: 4.8,
    services: ["fade", "beard trim", "line up"],
    barbers: ["Marcus", "Jay", "Ivy"],
    specialists: ["Marcus", "Jay", "Ivy"],
    phone: "(555) 210-9901",
    email: "hello@urbanfade.example",
    address: "125 Main St, Downtown",
    availableSlots: ["2026-02-24 10:00", "2026-02-24 14:30", "2026-02-25 09:15"]
  },
  {
    id: "salon-luxe-color",
    name: "Luxe Color Loft",
    businessType: "hair_salon",
    city: "Midtown",
    rating: 4.7,
    services: ["balayage", "highlights", "blowout"],
    barbers: ["Amara", "Nina"],
    specialists: ["Amara", "Nina"],
    phone: "(555) 210-4410",
    email: "book@luxecolor.example",
    address: "42 Elm Ave, Midtown",
    availableSlots: ["2026-02-23 11:30", "2026-02-24 16:00", "2026-02-26 13:45"]
  },
  {
    id: "salon-classic-chair",
    name: "Classic Chair Barbers",
    businessType: "barbershop",
    city: "Uptown",
    rating: 4.4,
    services: ["skin fade", "buzz cut", "hot towel shave"],
    barbers: ["Devin", "Luis"],
    specialists: ["Devin", "Luis"],
    phone: "(555) 210-7788",
    email: "team@classicchair.example",
    address: "88 Pine Rd, Uptown",
    availableSlots: ["2026-02-22 15:00", "2026-02-23 09:45", "2026-02-25 12:30"]
  },
  {
    id: "salon-willow-style",
    name: "Willow Style House",
    businessType: "beauty_salon",
    city: "West End",
    rating: 4.6,
    services: ["brow shaping", "lash lift", "keratin treatment"],
    barbers: ["Tara", "Mila"],
    specialists: ["Tara", "Mila"],
    phone: "(555) 210-1266",
    email: "care@willowstyle.example",
    address: "9 Willow Ln, West End",
    availableSlots: ["2026-02-24 08:45", "2026-02-24 17:15", "2026-02-27 11:00"]
  }
];

const subscriberFullDemoModuleGuide = [
  { name: "Control Center", detail: "Fast links into the main parts of the salon so you can move quickly." },
  { name: "Booking Diary", detail: "Your booking calendar with Lexi support, staffing visibility, and clear busy-day signals." },
  { name: "Lexi Business Command AI", detail: "Your main Lexi workspace for bookings, staffing, planning, revenue protection, and growth actions." },
  { name: "Executive Pulse", detail: "A quick business health view with trends, key signals, and the priorities that need attention." },
  { name: "Booking Operations", detail: "Manage bookings, status changes, pending confirmations, and front-desk tasks in one place." },
  { name: "Waitlist Recovery", detail: "Fill cancellations faster using the waitlist and quick outreach actions." },
  { name: "Staff Rota & Capacity", detail: "Manage team availability, rota cover, and capacity across the week." },
  { name: "CRM & Campaigns", detail: "Run customer follow-ups, reactivation campaigns, and retention actions to drive repeat bookings." },
  { name: "Commercial Controls", detail: "Manage packages, memberships, and offers to increase repeat spend and customer value." },
  { name: "Accounting / Revenue / Profitability", detail: "Track takings, revenue signals, and profitability with realistic mock data in demo mode." }
];

const subscriberFullDemoMockCustomers = [
  { name: "Ava Thompson", email: "ava.thompson@example.com", phone: "+44 7700 900101", lastService: "Balayage + Toner", status: "Repeat client", nextVisit: "2026-02-28 11:30" },
  { name: "Daniel Ruiz", email: "daniel.ruiz@example.com", phone: "+44 7700 900102", lastService: "Skin Fade", status: "VIP regular", nextVisit: "2026-03-01 14:00" },
  { name: "Priya Nair", email: "priya.nair@example.com", phone: "+44 7700 900103", lastService: "Blowout", status: "At-risk rebook", nextVisit: "Pending request" },
  { name: "Chloe Martin", email: "chloe.martin@example.com", phone: "+44 7700 900104", lastService: "Keratin Treatment", status: "Upcoming confirmed", nextVisit: "2026-03-03 13:30" }
];

const subscriberFullDemoMockSubscribers = [
  { business: "Lumen Studio", type: "Hair Salon", location: "Manchester", plan: "Pro", status: "Active", lexi: "Enabled" },
  { business: "Urban Fade Studio", type: "Barbershop", location: "Liverpool", plan: "Pro", status: "Active", lexi: "Enabled" },
  { business: "Willow Style House", type: "Beauty Salon", location: "Leeds", plan: "Growth", status: "Trial", lexi: "Enabled" },
  { business: "Classic Chair Barbers", type: "Barbershop", location: "Birmingham", plan: "Starter", status: "Active", lexi: "Setup pending" }
];

function formatBusinessTypeLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "hair_salon") return "Hair Salon";
  if (normalized === "barbershop") return "Barbershop";
  if (normalized === "beauty_salon") return "Beauty Salon";
  return "General";
}

function renderFrontDeskMock() {
  document.getElementById("businessLogo").src = frontDeskMock.logo;
  document.getElementById("frontDeskBusinessName").textContent = frontDeskMock.name;
  document.getElementById("frontDeskRating").textContent = frontDeskMock.rating;
  document.getElementById("frontDeskDescription").textContent = frontDeskMock.description;
  const socialIcons = document.getElementById("frontDeskSocialIcons");
  socialIcons.innerHTML = "";
  frontDeskMock.social.forEach((s) => {
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.innerHTML = s.icon;
    a.title = s.label;
    socialIcons.appendChild(a);
  });
  const services = document.getElementById("frontDeskServices");
  services.innerHTML = "";
  frontDeskMock.services.forEach((svc) => {
    const div = document.createElement("div");
    div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
    div.innerHTML = `<img src='${svc.image}' alt='' style='width:32px;height:32px;border-radius:8px;background:#fff;' /> <span style='font-weight:600;color:var(--ink);'>${svc.name}</span> <span style='color:var(--muted);'>${svc.price} ? ${svc.duration}</span>`;
    services.appendChild(div);
  });
  const reviews = document.getElementById("frontDeskReviews");
  reviews.innerHTML = "";
  frontDeskMock.reviews.forEach((rev) => {
    const div = document.createElement("div");
    div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.5rem;";
    div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${rev.rating}</span> <span style='color:var(--muted);'>${rev.text}</span> <span style='color:#7cead8;'>- ${rev.author}</span>`;
    reviews.appendChild(div);
  });
  const analytics = document.getElementById("frontDeskAnalytics");
  analytics.innerHTML = "";
  frontDeskMock.analytics.forEach((stat) => {
    const div = document.createElement("div");
    div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${stat.label}:</span> <span style='color:var(--muted);'>${stat.value}</span>`;
    analytics.appendChild(div);
  });
  document.getElementById("frontDeskAIChat").textContent = frontDeskMock.aiChat;
}

window.addEventListener("DOMContentLoaded", renderFrontDeskMock);
function renderSocialMediaPreview(data) {
  if (!socialMediaPreview) return;
  socialMediaPreview.innerHTML = "";
  const icons = {
    Facebook: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>",
    Instagram: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>",
    Twitter: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#1DA1F2' d='M22.46 6c-.77.35-1.6.59-2.46.69a4.28 4.28 0 0 0 1.88-2.36c-.83.49-1.75.85-2.72 1.04A4.27 4.27 0 0 0 16.11 4c-2.36 0-4.28 1.92-4.28 4.28c0 .34.04.67.11.98C7.69 8.98 4.07 7.1 1.64 4.16c-.37.64-.58 1.38-.58 2.17c0 1.5.76 2.83 1.92 3.61c-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25c-.36.1-.74.16-1.13.16c-.28 0-.54-.03-.8-.08c.54 1.68 2.1 2.9 3.95 2.93c-1.45 1.14-3.28 1.82-5.27 1.82c-.34 0-.67-.02-1-.06c1.88 1.21 4.12 1.92 6.53 1.92c7.84 0 12.13-6.5 12.13-12.13c0-.18-.01-.36-.02-.54c.83-.6 1.55-1.34 2.12-2.19z'/></svg>",
    LinkedIn: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#0077B5' d='M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-2.5v-8.75h2.5v8.75zm-1.25-10.25c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zm13 10.25h-2.5v-4.25c0-1.02-.02-2.33-1.42-2.33c-1.42 0-1.64 1.11-1.64 2.25v4.33h-2.5v-8.75h2.4v1.19h.03c.33-.63 1.13-1.29 2.33-1.29c2.5 0 2.96 1.64 2.96 3.77v5.08zm-10.25-8.75h-2.5v8.75h2.5v-8.75zm-1.25-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z'/></svg>",
    TikTok: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#000000' d='M12.5 2v14.5c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-2.21 1.79-4 4-4c.34 0 .67.04 1 .09V2h3zm7.5 7c-1.1 0-2-.9-2-2V2h-3v7c0 2.21 1.79 4 4 4c.34 0 .67-.04 1-.09V9z'/></svg>"
  };
  const links = [
    { key: "socialFacebook", label: "Facebook", value: data.socialFacebook },
    { key: "socialInstagram", label: "Instagram", value: data.socialInstagram },
    { key: "socialTwitter", label: "Twitter", value: data.socialTwitter },
    { key: "socialLinkedin", label: "LinkedIn", value: data.socialLinkedin },
    { key: "socialTiktok", label: "TikTok", value: data.socialTiktok },
    { key: "customSocial", label: "Other", value: data.customSocial }
  ];
  links.forEach((item) => {
    if (item.value) {
      const div = document.createElement("div");
      div.innerHTML = `
        ${icons[item.label] || ""} <strong>${item.label}:</strong> <a href="${item.value}" target="_blank">${item.value}</a>
        <span class="manage-only" style="margin-left:0.45rem;">
          <button class="btn btn-ghost social-edit-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}" data-social-value="${item.value.replaceAll('"', "&quot;")}">Edit</button>
          <button class="btn btn-ghost social-delete-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}">Delete</button>
        </span>
      `;
      socialMediaPreview.appendChild(div);
    }
  });
  if (data.socialImageUrl) {
    const img = document.createElement("img");
    img.src = data.socialImageUrl;
    img.alt = "Social Media Image";
    img.style.maxWidth = "120px";
    img.style.marginTop = "0.5rem";
    socialMediaPreview.appendChild(img);
    const imageActions = document.createElement("div");
    imageActions.className = "manage-only";
    imageActions.style.marginTop = "0.45rem";
    imageActions.innerHTML =
      '<button class="btn btn-ghost social-clear-image" type="button">Delete Image</button>';
    socialMediaPreview.appendChild(imageActions);
  }
}

function setSocialMediaFormValues(data) {
  if (facebookInput) facebookInput.value = String(data?.socialFacebook || "");
  if (instagramInput) instagramInput.value = String(data?.socialInstagram || "");
  if (twitterInput) twitterInput.value = String(data?.socialTwitter || "");
  if (linkedinInput) linkedinInput.value = String(data?.socialLinkedin || "");
  if (tiktokInput) tiktokInput.value = String(data?.socialTiktok || "");
  if (customSocialInput) customSocialInput.value = String(data?.customSocial || "");
  if (socialImageInput) socialImageInput.value = String(data?.socialImageUrl || "");
}

function validateHttpUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function loadSocialMediaLinks() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/businesses/me/social-media"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load social media links.");
  setSocialMediaFormValues(data);
  renderSocialMediaPreview(data);
  renderBusinessGrowthPanel();
}

function collectSocialMediaPayloadFromInputs() {
  return {
    socialFacebook: String(facebookInput?.value || "").trim(),
    socialInstagram: String(instagramInput?.value || "").trim(),
    socialTwitter: String(twitterInput?.value || "").trim(),
    socialLinkedin: String(linkedinInput?.value || "").trim(),
    socialTiktok: String(tiktokInput?.value || "").trim(),
    customSocial: String(customSocialInput?.value || "").trim(),
    socialImageUrl: String(socialImageInput?.value || "").trim()
  };
}

function validateSocialPayload(payload) {
  const fields = [
    { name: "Facebook", value: payload.socialFacebook },
    { name: "Instagram", value: payload.socialInstagram },
    { name: "Twitter", value: payload.socialTwitter },
    { name: "LinkedIn", value: payload.socialLinkedin },
    { name: "TikTok", value: payload.socialTiktok },
    { name: "Other", value: payload.customSocial },
    { name: "Image URL", value: payload.socialImageUrl }
  ];
  for (const field of fields) {
    if (field.value && !validateHttpUrl(field.value)) {
      throw new Error(`Invalid URL for ${field.name}. Please enter a valid link.`);
    }
  }
}

async function saveSocialMediaLinks(payload) {
  validateSocialPayload(payload);
  const res = await fetch(withManagedBusiness("/api/businesses/me/social-media"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save social media.");
  setSocialMediaFormValues(data);
  renderSocialMediaPreview(data);
  renderBusinessGrowthPanel();
}

function setBusinessProfileStatus(message, isError = false) {
  if (!businessProfileStatus) return;
  businessProfileStatus.textContent = String(message || "");
  businessProfileStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function openBusinessProfileSetupModal() {
  if (!businessProfileSetupOverlay) return;
  businessProfileSetupOverlay.classList.add("is-open");
  businessProfileSetupOverlay.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => businessProfileName?.focus());
}

function closeBusinessProfileSetupModal() {
  if (!businessProfileSetupOverlay) return;
  businessProfileSetupOverlay.classList.remove("is-open");
  businessProfileSetupOverlay.setAttribute("aria-hidden", "true");
  businessProfileOpenSetup?.focus();
}

function formatServicesForEditor(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => `${String(row.name || "").trim()} | ${Number(row.durationMin || 0)} | ${Number(row.price || 0)}`)
    .filter((line) => !line.startsWith(" | "))
    .join("\n");
}

function parseServiceEditorText(value) {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const services = lines.map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 3) {
      throw new Error("Service format must be: Name ? DurationMin ? Price");
    }
    const [name, durationRaw, priceRaw] = parts;
    const durationMin = Number(durationRaw);
    const price = Number(priceRaw);
    if (!name || !Number.isFinite(durationMin) || durationMin < 5 || !Number.isFinite(price) || price < 0) {
      throw new Error("Each service requires a valid name, duration (>=5), and price (>=0).");
    }
    return { name, durationMin, price };
  });
  if (!services.length) {
    throw new Error("Add at least one service.");
  }
  return services;
}

function getBusinessHoursPayload() {
  return {
    monday: String(businessHoursMonday?.value || "").trim() || "Closed",
    tuesday: String(businessHoursTuesday?.value || "").trim() || "Closed",
    wednesday: String(businessHoursWednesday?.value || "").trim() || "Closed",
    thursday: String(businessHoursThursday?.value || "").trim() || "Closed",
    friday: String(businessHoursFriday?.value || "").trim() || "Closed",
    saturday: String(businessHoursSaturday?.value || "").trim() || "Closed",
    sunday: String(businessHoursSunday?.value || "").trim() || "Closed"
  };
}

function setBusinessProfileFormValues(profile) {
  const business = profile && typeof profile === "object" ? profile : {};
  if (businessProfileName) businessProfileName.value = String(business.name || "");
  if (businessProfileType) businessProfileType.value = String(business.type || "hair_salon");
  if (businessProfilePhone) businessProfilePhone.value = String(business.phone || "");
  if (businessProfileEmail) businessProfileEmail.value = String(business.email || "");
  if (businessProfileCity) businessProfileCity.value = String(business.city || "");
  if (businessProfileCountry) businessProfileCountry.value = String(business.country || "");
  if (businessProfilePostcode) businessProfilePostcode.value = String(business.postcode || "");
  if (businessProfileAddress) businessProfileAddress.value = String(business.address || "");
  if (businessProfileDescription) businessProfileDescription.value = String(business.description || "");
  if (businessProfileWebsiteUrl) businessProfileWebsiteUrl.value = String(business.websiteUrl || "");
  if (businessProfileWebsiteTitle) businessProfileWebsiteTitle.value = String(business.websiteTitle || "");
  if (businessProfileWebsiteSummary) businessProfileWebsiteSummary.value = String(business.websiteSummary || "");
  if (businessProfileWebsiteImageUrl) businessProfileWebsiteImageUrl.value = String(business.websiteImageUrl || "");
  const hours = business.hours && typeof business.hours === "object" ? business.hours : {};
  if (businessHoursMonday) businessHoursMonday.value = String(hours.monday || "Closed");
  if (businessHoursTuesday) businessHoursTuesday.value = String(hours.tuesday || "Closed");
  if (businessHoursWednesday) businessHoursWednesday.value = String(hours.wednesday || "Closed");
  if (businessHoursThursday) businessHoursThursday.value = String(hours.thursday || "Closed");
  if (businessHoursFriday) businessHoursFriday.value = String(hours.friday || "Closed");
  if (businessHoursSaturday) businessHoursSaturday.value = String(hours.saturday || "Closed");
  if (businessHoursSunday) businessHoursSunday.value = String(hours.sunday || "Closed");
  if (businessProfileServices) businessProfileServices.value = formatServicesForEditor(business.services || []);

  if (business.name) document.getElementById("frontDeskBusinessName").textContent = String(business.name);
  if (typeof business.description === "string") document.getElementById("frontDeskDescription").textContent = business.description || "Business description goes here.";
  const serviceShell = document.getElementById("frontDeskServices");
  if (serviceShell) {
    serviceShell.innerHTML = "";
    (Array.isArray(business.services) ? business.services : []).slice(0, 6).forEach((svc) => {
      const div = document.createElement("div");
      div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
      div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${escapeHtml(svc.name || "Service")}</span> <span style='color:var(--muted);'>£${Number(svc.price || 0)} ? ${Number(svc.durationMin || 0)}min</span>`;
      serviceShell.appendChild(div);
    });
  }
}

async function loadBusinessProfile() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load business profile.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

async function saveBusinessProfile(payload) {
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save business profile.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

async function applyBusinessTemplate(type) {
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile/apply-template"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ type: String(type || "").trim() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to apply template.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

socialMediaForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setDashActionStatus("Saving social links...");
    await saveSocialMediaLinks(collectSocialMediaPayloadFromInputs());
    setDashActionStatus("Social links saved.");
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

businessProfileOpenSetup?.addEventListener("click", () => {
  if (!canManageBusinessModules()) return;
  openBusinessProfileSetupModal();
});
businessProfileSetupClose?.addEventListener("click", closeBusinessProfileSetupModal);
businessProfileSetupCancel?.addEventListener("click", closeBusinessProfileSetupModal);
businessProfileSetupOverlay?.addEventListener("click", (event) => {
  if (event.target === businessProfileSetupOverlay) closeBusinessProfileSetupModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (businessProfileSetupOverlay?.classList.contains("is-open")) closeBusinessProfileSetupModal();
});

businessProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageBusinessModules()) return;
  setBusinessProfileStatus("Saving business profile...");
  try {
    const services = parseServiceEditorText(String(businessProfileServices?.value || ""));
    await saveBusinessProfile({
      name: String(businessProfileName?.value || "").trim(),
      type: String(businessProfileType?.value || "hair_salon").trim(),
      phone: String(businessProfilePhone?.value || "").trim(),
      email: String(businessProfileEmail?.value || "").trim(),
      city: String(businessProfileCity?.value || "").trim(),
      country: String(businessProfileCountry?.value || "").trim(),
      postcode: String(businessProfilePostcode?.value || "").trim(),
      address: String(businessProfileAddress?.value || "").trim(),
      description: String(businessProfileDescription?.value || "").trim(),
      websiteUrl: String(businessProfileWebsiteUrl?.value || "").trim(),
      websiteTitle: String(businessProfileWebsiteTitle?.value || "").trim(),
      websiteSummary: String(businessProfileWebsiteSummary?.value || "").trim(),
      websiteImageUrl: String(businessProfileWebsiteImageUrl?.value || "").trim(),
      hours: getBusinessHoursPayload(),
      services
    });
    setBusinessProfileStatus("Business profile saved.");
    showManageToast("Business profile saved.");
  } catch (error) {
    setBusinessProfileStatus(error.message, true);
  }
});

businessProfileApplyTemplate?.addEventListener("click", async () => {
  if (!canManageBusinessModules()) return;
  const templateType = String(businessProfileType?.value || "hair_salon").trim();
  const confirmed = window.confirm(
    "Reset to selected template defaults now?\n\nThis will replace:\n- Business type\n- Description\n- Opening hours\n- Services list\n\nIt will NOT change your name, phone, email, location, or website fields."
  );
  if (!confirmed) return;
  setBusinessProfileStatus("Applying template...");
  try {
    await applyBusinessTemplate(templateType);
    setBusinessProfileStatus("Template applied. Services and hours were updated.");
    showManageToast("Template applied.");
  } catch (error) {
    setBusinessProfileStatus(error.message, true);
  }
});
if (currentRole === "subscriber") {
  dashTitle.textContent = "Subscriber Dashboard";
} else if (currentRole === "admin") {
  dashTitle.textContent = "Admin Dashboard";
} else if (currentRole === "customer") {
  dashTitle.textContent = "Customer Dashboard";
} else {
  dashTitle.textContent = `${String(currentRole || "user").toUpperCase()} Dashboard`;
}
if (currentRole === "subscriber" || currentRole === "admin") {
  dashUser.textContent = "";
  hideSection(dashUser);
} else {
  dashUser.textContent = `${user.name || "User"} (${user.email || "unknown"})`;
  hideSection(dashUser);
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
  managedBusinessId = String(user.businessId || "").trim();
} else if (currentRole === "admin") {
  managedBusinessId = adminBusinessParam;
  if (adminBusinessScope) {
    adminBusinessScope.style.display = "inline-flex";
  }
}

hideSection(dashRoleHint);
hideSection(dashActionStatus);
hideSection(adminBusinessScope);
showSection(dashIdentityBlock);
dashboardOverviewSection?.classList.remove("actions-only");

function headers() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function isSubscriberCleanSlate() {
  return user.role === "subscriber" && bookingRows.length === 0;
}

let dashActionTimerId = null;
function setDashActionStatus(message, isError = false, autoClearMs = 4200) {
  if (!dashActionStatus) return;
  dashActionStatus.textContent = String(message || "").trim();
  dashActionStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
  if (dashActionTimerId) {
    window.clearTimeout(dashActionTimerId);
    dashActionTimerId = null;
  }
  if (!dashActionStatus.textContent || autoClearMs <= 0) return;
  dashActionTimerId = window.setTimeout(() => {
    if (dashActionStatus) dashActionStatus.textContent = "";
    dashActionTimerId = null;
  }, autoClearMs);
}

function refreshDemoModeToggle() {
  if (!demoModeToggle) return;
  hideSection(demoModeToggle);
}

function loadDashboardDemoFillPreference() {
  if (!(currentRole === "subscriber" || currentRole === "admin")) return false;
  try {
    const active = sessionStorage.getItem(`${DASHBOARD_DEMO_FILL_SESSION_KEY}:${currentRole}`) === "on";
    localStorage.removeItem(`${DASHBOARD_DEMO_FILL_MODE_STORAGE_KEY}:${currentRole}`);
    return active;
  } catch {
    // Ignore storage errors.
    return false;
  }
}

function setDashboardDemoFillPreference(enabled) {
  dashboardDemoFillModeEnabled = Boolean(enabled) && !isMockMode && (currentRole === "subscriber" || currentRole === "admin");
  try {
    sessionStorage.setItem(`${DASHBOARD_DEMO_FILL_SESSION_KEY}:${currentRole}`, dashboardDemoFillModeEnabled ? "on" : "off");
  } catch {
    // Ignore storage errors.
  }
  refreshDemoModeToggle();
}

function isDashboardDemoDataModeActive() {
  return Boolean(isMockMode || dashboardDemoFillModeEnabled);
}

function navigateWithDemoMode(nextEnabled) {
  const enableDemo = Boolean(nextEnabled);
  if (!enableDemo && (!token || !userRaw)) {
    setDashActionStatus("Sign in first to exit demo mode.", true);
    return;
  }
  const url = new URL(window.location.href);
  if (enableDemo) {
    url.searchParams.set("mock", "1");
    url.searchParams.set("role", currentRole || "subscriber");
    if (currentRole === "admin" && String(managedBusinessId || "").trim()) {
      url.searchParams.set("businessId", String(managedBusinessId || "").trim());
    }
  } else {
    url.searchParams.delete("mock");
    url.searchParams.delete("role");
  }
  window.location.href = `${url.pathname}${url.search}${url.hash}`;
}

function renderCopilotList(el, items, emptyText) {
  if (!el) return;
  const rows = Array.isArray(items) ? items.filter(Boolean) : [];
  el.innerHTML = "";
  if (!rows.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    el.appendChild(li);
    return;
  }
  rows.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = String(item);
    el.appendChild(li);
  });
}

function renderSubscriberCopilotSnapshot(snapshot) {
  if (!subscriberCopilotSnapshot) return;
  const business = snapshot?.business || {};
  const bookings = snapshot?.bookings || {};
  const health = snapshot?.health || {};
  const cards = [
    { label: "Business", value: business.name || "Current business" },
    { label: "Type", value: business.type || "n/a" },
    { label: "Total Bookings", value: bookings.total ?? "n/a" },
    { label: "Cancelled", value: bookings.cancelled ?? "n/a" },
    { label: "Cancellation Rate", value: typeof bookings.cancelRatePct === "number" ? `${bookings.cancelRatePct}%` : "n/a" },
    { label: "Upcoming (7d)", value: bookings.upcoming7d ?? "n/a" },
    { label: "AI Service", value: health.openaiConfigured ? "Connected" : "Not connected" },
    { label: "Accounting Feed", value: health.accountingSignalsAvailable ? "Live" : "Not loaded" }
  ];
  subscriberCopilotSnapshot.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(String(card.value))}</strong>`;
    subscriberCopilotSnapshot.appendChild(article);
  });
}

function subscriberCopilotLinkCandidates() {
  return [
    { key: "command_center", label: "Command Center", keywords: ["priority", "focus", "today", "urgent", "what should i focus", "plan today"] },
    { key: "calendar", label: "Calendar", keywords: ["calendar", "diary", "day", "week", "month", "slot", "availability"] },
    { key: "booking_ops", label: "Booking Operations", keywords: ["booking", "bookings", "appointment", "appointments", "reschedule", "rescheduling", "change booking", "booking status"] },
    { key: "waitlist", label: "Waitlist", keywords: ["waitlist", "cancel", "cancellation", "backfill", "fill slot", "empty chair"] },
    { key: "staff", label: "Staff & Capacity", keywords: ["staff", "team", "capacity", "cover", "shift", "workload"] },
    { key: "operations", label: "No-Show & Rebooking", keywords: ["no-show", "noshow", "rebook", "rebooking", "missed appointments"] },
    { key: "crm", label: "CRM & Campaigns", keywords: ["crm", "campaign", "retention", "reactivation", "follow-up", "repeat bookings", "repeat clients"] },
    { key: "commercial", label: "Memberships & Packages", keywords: ["membership", "memberships", "package", "packages", "bundle", "gift card", "offer"] },
    { key: "accounting", label: "Accounting", keywords: ["accounting", "takings", "payout", "bookkeeping", "export", "reconcile"] },
    { key: "revenue", label: "Revenue Attribution", keywords: ["revenue", "roi", "channel", "marketing", "ads", "spend"] },
    { key: "profitability", label: "Profitability & Payroll", keywords: ["profit", "margin", "payroll", "break-even", "costs"] }
  ];
}

function renderSubscriberCopilotLinks(links) {
  if (!subscriberCopilotLinks) return;
  const rows = Array.isArray(links) ? links.filter(Boolean) : [];
  subscriberCopilotLinks.innerHTML = "";
  subscriberCopilotLinks.classList.remove("is-visible");
  if (!rows.length) return;

  const label = document.createElement("span");
  label.className = "copilot-answer-links-label";
  label.textContent = "Open this in your dashboard:";
  subscriberCopilotLinks.appendChild(label);

  rows.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost";
    button.setAttribute("data-module-jump", String(item.key || ""));
    button.textContent = String(item.label || "Open");
    subscriberCopilotLinks.appendChild(button);
  });

  subscriberCopilotLinks.classList.add("is-visible");
}

function buildSubscriberCopilotLinks(payload, question = "") {
  const searchableParts = [
    question,
    payload?.answer,
    ...(Array.isArray(payload?.findings) ? payload.findings : []),
    ...(Array.isArray(payload?.suggestedActions) ? payload.suggestedActions : []),
    ...(Array.isArray(payload?.suggestedFixes) ? payload.suggestedFixes : [])
  ]
    .filter(Boolean)
    .map((part) => String(part).toLowerCase());

  const haystack = searchableParts.join(" \n ");
  const picked = [];
  const seen = new Set();
  const candidates = subscriberCopilotLinkCandidates();

  candidates.forEach((candidate) => {
    if (seen.has(candidate.key)) return;
    if (!moduleDefinitionByKey(candidate.key)) return;
    const hit = candidate.keywords.some((word) => haystack.includes(word));
    if (!hit) return;
    picked.push({ key: candidate.key, label: candidate.label });
    seen.add(candidate.key);
  });

  if (!picked.length) {
    ["command_center", "calendar", "booking_ops"].forEach((key) => {
      if (seen.has(key)) return;
      const mod = moduleDefinitionByKey(key);
      if (!mod) return;
      picked.push({ key, label: mod.label });
      seen.add(key);
    });
  }

  return picked.slice(0, 4);
}

function copilotPopupRefs(role) {
  if (role === "admin") {
    return {
      overlay: adminCopilotPopup,
      input: adminCopilotInput,
      messages: adminCopilotMessages,
      answer: adminCopilotAnswer,
      openBtn: adminCopilotOpenPopup,
      closeBtn: adminCopilotPopupClose
    };
  }
  return {
    overlay: subscriberCopilotPopup,
    input: subscriberCopilotInput,
    messages: subscriberCopilotMessages,
    answer: subscriberCopilotAnswer,
    openBtn: subscriberCopilotOpenPopup,
    closeBtn: subscriberCopilotPopupClose
  };
}

function appendCopilotChatMessage(role, kind, text, options = {}) {
  const refs = copilotPopupRefs(role);
  if (!refs.messages) return null;
  const row = document.createElement("article");
  row.className = `copilot-chat-message is-${kind}${options.pending ? " is-pending" : ""}`;

  const meta = document.createElement("div");
  meta.className = "copilot-chat-message-meta";
  meta.textContent = kind === "user" ? "You" : "Lexi";

  const bubble = document.createElement("div");
  bubble.className = "copilot-chat-bubble";
  bubble.textContent = String(text || "");

  row.append(meta, bubble);
  refs.messages.appendChild(row);
  refs.messages.scrollTop = refs.messages.scrollHeight;
  return { row, bubble };
}

function ensureCopilotChatSeed(role) {
  const refs = copilotPopupRefs(role);
  if (!refs.messages || refs.messages.childElementCount > 0) return;
  appendCopilotChatMessage(role, "assistant", String(refs.answer?.textContent || "Ask Lexi a question and I'll help."));
}

function resetCopilotChat(role, introText) {
  const refs = copilotPopupRefs(role);
  if (refs.messages) refs.messages.innerHTML = "";
  appendCopilotChatMessage(role, "assistant", introText);
}

function ensureBusinessAiPopupHost(role) {
  const current = businessCopilotPopupHosts[role];
  if (current instanceof HTMLElement) return current;
  const host = document.createElement("div");
  host.className = "copilot-chat-popup-overlay";
  host.setAttribute("aria-hidden", "true");
  host.addEventListener("click", (event) => {
    if (event.target === host) closeBusinessAiChatPopup(role);
  });
  businessCopilotPopupHosts[role] = host;
  return host;
}

function openBusinessAiChatPopup(role, options = {}) {
  const refs = copilotPopupRefs(role);
  if (!refs.overlay) return;
  const popupCard = refs.overlay.querySelector(".copilot-chat-popup");
  if (!(popupCard instanceof HTMLElement)) return;
  const host = ensureBusinessAiPopupHost(role);
  if (!(host instanceof HTMLElement)) return;
  if (!businessCopilotPopupPlaceholders[role]) {
    businessCopilotPopupPlaceholders[role] = document.createElement("div");
    businessCopilotPopupPlaceholders[role].className = "home-lexi-chat-placeholder";
  }
  const placeholder = businessCopilotPopupPlaceholders[role];
  if (popupCard.parentNode && popupCard.parentNode !== host) {
    popupCard.parentNode.insertBefore(placeholder, popupCard);
  }
  if (host.parentElement !== document.body) {
    document.body.appendChild(host);
  }
  host.appendChild(popupCard);
  host.classList.add("is-open");
  host.setAttribute("aria-hidden", "false");
  document.body.classList.add("home-lexi-popup-open");
  openCopilotPopupRole = role;
  if (options.trigger instanceof HTMLElement) {
    lastCopilotPopupTrigger = options.trigger;
  }
  if (typeof options.prompt === "string" && options.prompt.trim()) {
    setBusinessAiPrompt(role, options.prompt);
  }
  ensureCopilotChatSeed(role);
  if (options.focusInput !== false) {
    window.requestAnimationFrame(() => refs.input?.focus());
  }
}

function closeBusinessAiChatPopup(role) {
  const refs = copilotPopupRefs(role);
  if (!refs.overlay) return;
  const host = businessCopilotPopupHosts[role];
  const popupCard = (host instanceof HTMLElement ? host.querySelector(".copilot-chat-popup") : null)
    || refs.overlay.querySelector(".copilot-chat-popup");
  const placeholder = businessCopilotPopupPlaceholders[role];
  if (host instanceof HTMLElement) {
    host.classList.remove("is-open");
    host.setAttribute("aria-hidden", "true");
  }
  if (popupCard instanceof HTMLElement && placeholder?.parentNode) {
    placeholder.parentNode.insertBefore(popupCard, placeholder);
    placeholder.remove();
  }
  document.body.classList.remove("home-lexi-popup-open");
  if (openCopilotPopupRole === role) {
    openCopilotPopupRole = "";
    if (lastCopilotPopupTrigger instanceof HTMLElement) {
      lastCopilotPopupTrigger.focus();
    }
    lastCopilotPopupTrigger = null;
  }
}

function renderSubscriberCopilotResponse(payload, options = {}) {
  if (subscriberCopilotAnswer) {
    subscriberCopilotAnswer.textContent = String(payload?.answer || "No reply came back yet.");
  }
  renderSubscriberCopilotLinks(buildSubscriberCopilotLinks(payload, options.question));
}

function renderAdminCopilotResponse(payload) {
  if (adminCopilotAnswer) {
    adminCopilotAnswer.textContent = String(payload?.answer || "No reply came back yet.");
  }
  renderCopilotList(adminCopilotFindings, payload?.findings, "No findings.");
  renderCopilotList(adminCopilotFixes, payload?.suggestedFixes, "No suggested fixes.");
}

function selectedCalendarDateSummary() {
  const dateKey = String(selectedCalendarDateKey || "").trim();
  if (!dateKey) return null;
  const date = parseBookingDate(dateKey);
  if (!date) return null;
  const rows = bookingRows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === dateKey : false;
  });
  const cancelled = rows.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
  const completed = rows.filter((row) => String(row?.status || "").toLowerCase() === "completed").length;
  const revenue = rows
    .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const staff = getStaffWorkingForDate(date);
  return {
    dateKey,
    label: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    bookings: rows.length,
    cancelled,
    completed,
    revenue,
    staffCount: staff.length,
    staffNames: staff.map((s) => s.name).slice(0, 6)
  };
}

function businessAiContextString(role) {
  const selected = selectedCalendarDateSummary();
  const today = todayDateKeyLocal();
  const todayRows = bookingRows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === today : false;
  });
  const todayCancelled = todayRows.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
  const todayRevenue = todayRows
    .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const workingToday = getStaffWorkingForDate(new Date()).length;
  const waitlistCount = Array.isArray(waitlistRows) ? waitlistRows.length : 0;
  const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
  const accountingConnected = (Array.isArray(accountingRows) ? accountingRows : []).filter((row) => row?.connected || row?.status === "connected").length;
  const scope = role === "admin" ? adminAiScope : subscriberAiScope;
  const parts = [
    `Scope: ${scope}`,
    `Today: ${todayRows.length} bookings, ${todayCancelled} cancelled, revenue signal ${formatMoney(todayRevenue)}, ${workingToday} staff on rota`,
    `Waitlist: ${waitlistCount} entries`,
    `No-show risks: ${noShowRiskCount}`,
    `Accounting: ${accountingConnected ? `${accountingConnected} connection(s) live` : "not connected"}`
  ];
  if (selected) {
    parts.push(
      `Selected day (${selected.dateKey}): ${selected.bookings} bookings, ${selected.cancelled} cancelled, ${selected.staffCount} staff, revenue ${formatMoney(selected.revenue)}`
    );
  }
  if (role === "admin" && managedBusinessId) {
    parts.unshift(`Managed business: ${managedBusinessId}`);
  }
  return parts.join(" | ");
}

function renderBusinessAiWorkspace(role) {
  const isAdmin = role === "admin";
  const contextEl = isAdmin ? adminBusinessAiContext : subscriberBusinessAiContext;
  const scopeWrap = isAdmin ? adminAiScopeChips : subscriberAiScopeChips;
  if (!(contextEl instanceof HTMLElement)) return;

  const selected = selectedCalendarDateSummary();
  const today = todayDateKeyLocal();
  const todayCount = bookingRows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === today : false;
  }).length;
  const waitlistCount = Array.isArray(waitlistRows) ? waitlistRows.length : 0;
  const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
  const staffToday = getStaffWorkingForDate(new Date()).length;
  const revenueToday = bookingRows
    .filter((row) => {
      const dt = parseBookingDate(row?.date);
      return dt ? toDateKey(dt) === today && String(row?.status || "").toLowerCase() !== "cancelled" : false;
    })
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  contextEl.innerHTML = `
    <strong>${isAdmin ? "Managed Business AI Context" : "Business AI Context"}</strong><br />
    ${isAdmin ? "Diagnostics and subscriber support recommendations" : "Operational and growth recommendations for your salon"} •
    Today: <strong>${todayCount}</strong> bookings • <strong>${staffToday}</strong> staff •
    Waitlist <strong>${waitlistCount}</strong> • No-show risks <strong>${noShowRiskCount}</strong> •
    Revenue signal <strong>${escapeHtml(formatMoney(revenueToday))}</strong>
    ${selected ? `<br />Selected day: <strong>${escapeHtml(selected.label)}</strong> (${escapeHtml(selected.dateKey)}) • ${selected.bookings} bookings • ${selected.staffCount} staff${selected.staffNames.length ? ` • ${escapeHtml(selected.staffNames.join(", "))}` : ""}` : `<br />Select a day in the Booking Diary to let AI focus on that specific date.`}
  `;

  if (scopeWrap) {
    const currentScope = isAdmin ? adminAiScope : subscriberAiScope;
    scopeWrap.querySelectorAll(".ai-scope-chip").forEach((btn) => {
      if (!(btn instanceof HTMLElement)) return;
      btn.classList.toggle("is-active", String(btn.getAttribute("data-ai-scope") || "") === currentScope);
    });
  }
}

function copilotPromptWithBusinessContext(role, question) {
  const q = String(question || "").trim();
  if (!q) return "";
  const context = businessAiContextString(role);
  return `${q}\n\nOptional business context (use only if relevant to the question):\n${context}`;
}

function setBusinessAiPrompt(role, prompt) {
  const text = String(prompt || "").trim();
  if (!text) return;
  if (role === "admin") {
    if (adminCopilotInput) adminCopilotInput.value = text;
    adminCopilotInput?.focus();
  } else {
    if (subscriberCopilotInput) subscriberCopilotInput.value = text;
    subscriberCopilotInput?.focus();
  }
}

function renderCalendarFeatureSidebar(summary) {
  if (calendarFeatureMeta) {
    const monthLabel = String(summary?.monthLabel || "This month");
    const selected = summary?.selectedDay || null;
    calendarFeatureMeta.innerHTML = `
      <strong>${escapeHtml(monthLabel)} Diary View</strong><br />
      ${escapeHtml(String(summary?.monthlyBookings || 0))} bookings across ${escapeHtml(String(summary?.activeDays || 0))} active day${Number(summary?.activeDays || 0) === 1 ? "" : "s"} •
      ${escapeHtml(String(summary?.staffLegendCount || 0))} staff in rota legend
      ${selected ? `<br />Selected: <strong>${escapeHtml(selected.label)}</strong> (${escapeHtml(selected.dateKey)})` : `<br />Click a date to spotlight staffing and booking detail for that day.`}
    `;
  }
  if (calendarFeatureStats) {
    const cards = [
      {
        label: "Month Bookings",
        value: String(summary?.monthlyBookings || 0),
        note: `${summary?.activeDays || 0} active days`
      },
      {
        label: "Avg / Active Day",
        value: String(summary?.activeDays ? Number((Number(summary.monthlyBookings || 0) / Math.max(1, Number(summary.activeDays || 0))).toFixed(1)) : 0),
        note: "booking density"
      },
      {
        label: "Rota Staff",
        value: String(summary?.staffLegendCount || 0),
        note: "visible this month"
      },
      {
        label: "Selected Revenue",
        value: selectedCalendarDateKey ? formatMoney(Number(summary?.selectedDay?.revenue || 0)) : "—",
        note: selectedCalendarDateKey ? `${summary?.selectedDay?.bookings || 0} bookings` : "pick a day"
      }
    ];
    calendarFeatureStats.innerHTML = cards.map((card) => `
      <article>
        <p>${escapeHtml(card.label)}</p>
        <strong>${escapeHtml(card.value)}</strong>
        <small>${escapeHtml(card.note)}</small>
      </article>
    `).join("");
  }
  if (calendarSelectedDaySummary) {
    const selected = summary?.selectedDay || null;
    if (!selected) {
      calendarSelectedDaySummary.innerHTML = `
        <h3>Selected Day Summary</h3>
        <p>Click a date to view bookings, staffing cover, and revenue context for that day. Lexi will also update the business chat context automatically.</p>
      `;
      return;
    }
    const staffNames = Array.isArray(selected.staffNames) ? selected.staffNames : [];
    calendarSelectedDaySummary.innerHTML = `
      <h3>Selected Day Summary</h3>
      <p><strong>${escapeHtml(selected.label)}</strong> (${escapeHtml(selected.dateKey)})</p>
      <ul class="calendar-selected-day-list">
        <li><strong>${escapeHtml(String(selected.bookings))} booking${selected.bookings === 1 ? "" : "s"}</strong><small>${escapeHtml(String(selected.completed || 0))} completed • ${escapeHtml(String(selected.cancelled || 0))} cancelled</small></li>
        <li><strong>${escapeHtml(formatMoney(Number(selected.revenue || 0)))}</strong><small>Revenue signal for selected day</small></li>
        <li><strong>${escapeHtml(String(selected.staffCount || 0))} staff on rota</strong><small>${escapeHtml(staffNames.length ? staffNames.join(", ") : "No rota coverage set for selected day.")}</small></li>
      </ul>
    `;
  }
}

async function askSubscriberCopilot(question) {
  if (!(user.role === "subscriber" || user.role === "admin")) throw new Error("Subscriber copilot is unavailable.");
  const res = await fetch("/api/copilot/subscriber", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ question: String(question || "").trim() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Subscriber copilot is unavailable.");
  return data;
}

async function askAdminCopilot(question) {
  if (user.role !== "admin") throw new Error("Admin copilot is only available to admins.");
  const body = {
    question: String(question || "").trim()
  };
  if (managedBusinessId) body.businessId = managedBusinessId;
  const res = await fetch("/api/admin/copilot", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Admin copilot is unavailable.");
  return data;
}

function loadUiDensityPreference() {
  try {
    const value = String(localStorage.getItem(DASHBOARD_THEME_MODE_STORAGE_KEY) || "").trim().toLowerCase();
    if (value === "light" || value === "dark") return value;
    const sharedTheme = String(localStorage.getItem(SHARED_THEME_STORAGE_KEY) || "").trim().toLowerCase();
    if (sharedTheme === "classic") return "light";
    if (sharedTheme === "vibrant") return "dark";
  } catch {
    // ignore
  }
  return document.body?.classList.contains("dashboard-light-mode") ? "light" : "dark";
}

function setUiDensity(mode) {
  const next = String(mode || "").trim().toLowerCase() === "light" ? "light" : "dark";
  if (document.body) {
    document.body.classList.toggle("dashboard-light-mode", next === "light");
    // Keep dashboard theme isolated from the shared homepage/site theme system.
    document.body.classList.remove("theme-vibrant");
    document.body.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme-mode");
  }
  if (uiDensityToggle && uiDensityToggle.value !== next) {
    uiDensityToggle.value = next;
  }
  try {
    localStorage.setItem(DASHBOARD_THEME_MODE_STORAGE_KEY, next);
  } catch {
    // Ignore storage errors.
  }
}

function initializeUiDensity() {
  setUiDensity(loadUiDensityPreference());
}

dashboardDemoFillModeEnabled = loadDashboardDemoFillPreference();
refreshDemoModeToggle();
renderSubscriberFullDemoModePanel();
if (isDashboardDemoDataModeActive()) {
  setDashActionStatus("Demo mode is on. Data is simulated so you can explore and edit safely.", false, 0);
}

function canManageBusinessModules() {
  if (user.role === "subscriber") return true;
  if (user.role === "admin") return Boolean(String(managedBusinessId || "").trim());
  return false;
}

function withManagedBusiness(path) {
  if (user.role !== "admin") return path;
  const scope = String(managedBusinessId || "").trim();
  if (!scope) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}businessId=${encodeURIComponent(scope)}`;
}

function setAdminBusinessStatus(message, isError = false) {
  if (!adminBusinessStatus) return;
  adminBusinessStatus.textContent = message || "";
  adminBusinessStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseExportFileName(disposition, fallback = "accounting_export.csv") {
  const value = String(disposition || "");
  const match = value.match(/filename="?([^";]+)"?/i);
  return match?.[1] ? match[1] : fallback;
}

async function runAccountingExport(url, button, successMessage, options = {}) {
  const requireManagedBusiness = options.requireManagedBusiness !== false;
  if (requireManagedBusiness && !canManageBusinessModules()) {
    setAccountingStatus("Select a managed business before exporting accounting data.", true);
    return;
  }
  setAccountingStatus("Preparing accounting export...");
  if (button) button.disabled = true;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      let message = "Unable to export accounting CSV.";
      try {
        const data = await res.json();
        message = data.error || message;
      } catch {
        // Ignore parse error and keep fallback message.
      }
      throw new Error(message);
    }
    const fileName = parseExportFileName(res.headers.get("content-disposition"), "accounting_export.csv");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setAccountingStatus(successMessage || "Accounting CSV exported.");
  } catch (error) {
    setAccountingStatus(error.message, true);
  } finally {
    if (button) button.disabled = false;
  }
}

function loadHubAutoRoutinePrefs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HUB_AUTOROUTINES_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveHubAutoRoutinePrefs(value) {
  try {
    localStorage.setItem(HUB_AUTOROUTINES_STORAGE_KEY, JSON.stringify(value || {}));
  } catch {
    // Ignore localStorage errors.
  }
}

function businessHubCommandModel() {
  const now = new Date();
  const todayKey = todayDateKeyLocal();
  const next7Cutoff = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  const rows = Array.isArray(bookingRows) ? bookingRows : [];
  const todayBookings = rows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === todayKey : false;
  });
  const next7 = rows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    if (!dt) return false;
    const dayTs = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12).getTime();
    return dayTs >= new Date(new Date().setHours(0, 0, 0, 0)).getTime() && dayTs <= next7Cutoff;
  });
  const todayCancelled = todayBookings.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
  const todayRevenue = todayBookings
    .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const workingToday = getStaffWorkingForDate(new Date());
  const workingTomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getStaffWorkingForDate(d);
  })();
  const accountingConnected = (Array.isArray(accountingRows) ? accountingRows : []).filter((row) => row?.connected || row?.status === "connected").length;
  const waitlistCount = Array.isArray(waitlistRows) ? waitlistRows.length : 0;
  const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
  const rebookingPromptCount = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts.length : 0;
  const servicesCount = String(businessProfileServices?.value || "").split("\n").map((v) => v.trim()).filter(Boolean).length;
  const profileReady = Boolean(String(businessProfileName?.value || "").trim() && String(businessProfileEmail?.value || "").trim() && String(businessProfilePhone?.value || "").trim());
  const coverageRisk = todayBookings.length > 0 && workingToday.length === 0;
  const revenuePressure = todayCancelled >= 2 || noShowRiskCount >= 2;
  const setupGap = !profileReady || servicesCount < 3;
  const financeReady = accountingConnected > 0;
  const priorityItems = [
    coverageRisk
      ? { level: "critical", title: "Staff coverage gap today", note: "Bookings are in the diary but no rota cover is detected. Assign cover before opening.", action: "Open Staff Rota & Coverage", moduleKey: "staff" }
      : { level: "focus", title: "Confirm team cover for peak blocks", note: `${workingToday.length} staff scheduled today. Review AM/PM balance before the busiest slots.`, action: "Open Staff Rota & Coverage", moduleKey: "staff" },
    revenuePressure
      ? { level: "risk", title: "Protect today's revenue", note: `${todayCancelled} cancellations and ${noShowRiskCount} no-show risks flagged. Use waitlist and service recovery.`, action: "Open Waitlist Recovery", moduleKey: "waitlist" }
      : { level: "focus", title: "Use quiet windows for growth", note: "Diary pressure looks manageable. Queue review requests and referral outreach for completed clients.", action: "Open Reviews & Reputation", moduleKey: "reviews_reputation" },
    financeReady
      ? { level: "focus", title: "Close takings cleanly", note: `${accountingConnected} accounting connection${accountingConnected === 1 ? "" : "s"} active. Prepare a daily/weekly export or reconciliation note.`, action: "Open Accounting", moduleKey: "accounting" }
      : { level: "risk", title: "Accounting feed not connected", note: "Daily takings and reconciliation will need manual checks until a provider is connected.", action: "Open Accounting", moduleKey: "accounting" },
    setupGap
      ? { level: "risk", title: "Business profile still incomplete", note: `Profile ${profileReady ? "ready" : "missing contact details"} • ${servicesCount} services listed. Finish setup to improve booking conversion.`, action: "Open Business Profile", moduleKey: "business_profile" }
      : { level: "focus", title: "Launch setup is in good shape", note: "Use the Business Hub workspaces for daily operations, growth and finance actions.", action: "Open Business Hub", moduleKey: "home" }
  ];
  const signalCards = [
    {
      label: "Today Load",
      value: String(todayBookings.length),
      note: `${todayCancelled} cancelled • ${next7.length} in next 7 days`
    },
    {
      label: "Team Cover",
      value: String(workingToday.length),
      note: `${workingTomorrow.length} scheduled tomorrow`
    },
    {
      label: "Waitlist Ready",
      value: String(waitlistCount),
      note: `${rebookingPromptCount} recovery/rebooking prompts`
    },
    {
      label: "Takings Signal",
      value: formatMoney(todayRevenue),
      note: financeReady ? "Accounting feed live" : "Manual finance review"
    }
  ];
  const autoRoutines = [
    {
      key: "openingSweep",
      label: "Opening Sweep",
      note: "Prioritize staff cover, diary pressure and no-show risks before trade starts."
    },
    {
      key: "waitlistBackfill",
      label: "Waitlist Backfill",
      note: "Flag cancellations and stage same-day waitlist recovery prompts."
    },
    {
      key: "closeDayPack",
      label: "Close-Day Pack",
      note: "Prepare takings summary, follow-up actions and tomorrow staffing checks."
    }
  ];
  const reportHighlights = [
    `Bookings: ${rows.length} total • ${todayBookings.length} today • ${next7.length} within 7 days`,
    `Operations: ${workingToday.length} staff on rota today • ${waitlistCount} waitlist entries • ${noShowRiskCount} no-show risks`,
    `Finance: Today revenue signal ${formatMoney(todayRevenue)}${financeReady ? " • accounting connected" : " • accounting not connected"}`,
    `Setup: ${profileReady ? "Profile ready" : "Profile needs contact details"} • ${servicesCount} services listed`
  ];
  const healthScore = Math.max(35, Math.min(99, 100 - (coverageRisk ? 20 : 0) - (revenuePressure ? 12 : 0) - (setupGap ? 10 : 0) - (!financeReady ? 8 : 0)));
  return {
    generatedAt: new Date().toISOString(),
    todayKey,
    signalCards,
    priorityItems,
    autoRoutines,
    reportHighlights,
    summary: {
      bookingsTotal: rows.length,
      todayBookings: todayBookings.length,
      next7Bookings: next7.length,
      todayCancelled,
      todayRevenue,
      staffToday: workingToday.length,
      waitlistCount,
      noShowRiskCount,
      accountingConnected,
      healthScore
    }
  };
}

function renderBusinessHubCommandDeck() {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const model = businessHubCommandModel();
  if (hubCommandSignalGrid) {
    hubCommandSignalGrid.innerHTML = "";
    model.signalCards.forEach((card) => {
      const article = document.createElement("article");
      article.className = "hub-command-signal";
      article.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.note)}</small>`;
      hubCommandSignalGrid.appendChild(article);
    });
  }
  if (hubReportHighlights) {
    hubReportHighlights.innerHTML = "";
    model.reportHighlights.forEach((line) => {
      const li = document.createElement("li");
      li.className = "is-focus";
      li.innerHTML = `<strong>${escapeHtml(line.split(":")[0] || "Report")}</strong><small>${escapeHtml(line)}</small>`;
      hubReportHighlights.appendChild(li);
    });
  }
  if (hubPriorityList) {
    hubPriorityList.innerHTML = "";
    model.priorityItems.forEach((item) => {
      const li = document.createElement("li");
      li.className = item.level === "critical" ? "is-critical" : item.level === "risk" ? "is-risk" : "is-focus";
      li.innerHTML = `
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.note)}</small>
        <div style="margin-top:0.25rem;display:flex;gap:0.35rem;flex-wrap:wrap;">
          <button type="button" class="btn btn-ghost" data-module-jump="${escapeHtml(item.moduleKey || "home")}" style="min-height:30px;padding:0.2rem 0.45rem;font-size:0.68rem;">${escapeHtml(item.action || "Open")}</button>
        </div>
      `;
      hubPriorityList.appendChild(li);
    });
  }
  if (hubAutoRoutines) {
    const prefs = loadHubAutoRoutinePrefs();
    hubAutoRoutines.innerHTML = "";
    model.autoRoutines.forEach((item) => {
      const enabled = prefs[item.key] === true;
      const row = document.createElement("div");
      row.className = "hub-auto-routine";
      row.innerHTML = `
        <div class="hub-auto-routine-copy">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.note)}</small>
        </div>
        <button type="button" class="btn btn-ghost" data-hub-auto-toggle="${escapeHtml(item.key)}" aria-pressed="${enabled ? "true" : "false"}">${enabled ? "Auto On" : "Auto Off"}</button>
      `;
      hubAutoRoutines.appendChild(row);
    });
  }
  if (hubReportStatusPill) {
    hubReportStatusPill.textContent = `${model.summary.healthScore}% ready`;
    hubReportStatusPill.classList.remove("muted");
  }
  if (hubReportStatusText) {
    hubReportStatusText.textContent = `Health score ${model.summary.healthScore}% • ${model.summary.todayBookings} bookings today • ${model.summary.staffToday} staff on rota today • ${model.summary.waitlistCount} waitlist entries.`;
  }
}

function buildBusinessReportPayload() {
  const model = businessHubCommandModel();
  const profileName = String(businessProfileName?.value || "").trim() || String(user.name || "Salon Business");
  const profileEmail = String(businessProfileEmail?.value || user.email || "").trim();
  const profilePhone = String(businessProfilePhone?.value || "").trim();
  const services = String(businessProfileServices?.value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
  const staffList = (Array.isArray(staffRosterRows) ? staffRosterRows : []).slice(0, 20).map((member) => ({
    name: String(member?.name || "Staff"),
    role: String(member?.role || "team"),
    availability: String(member?.availability || "unknown")
  }));
  const bookingsRecent = (Array.isArray(bookingRows) ? bookingRows : []).slice(0, 25).map((row) => ({
    date: String(row?.date || ""),
    time: String(row?.time || ""),
    customerName: String(row?.customerName || "Client"),
    service: String(row?.service || ""),
    status: String(row?.status || "pending"),
    price: Number(row?.price || 0)
  }));
  return {
    generatedAt: new Date().toISOString(),
    reportDate: todayDateKeyLocal(),
    role: String(user.role || ""),
    business: {
      id: String(managedBusinessId || user.businessId || ""),
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      city: String(businessProfileCity?.value || ""),
      country: String(businessProfileCountry?.value || "")
    },
    summary: model.summary,
    signals: model.signalCards,
    priorities: model.priorityItems,
    reportHighlights: model.reportHighlights,
    services,
    staffList,
    bookingsRecent
  };
}

function buildBusinessReportHtml(payload) {
  const p = payload || {};
  const summary = p.summary || {};
  const business = p.business || {};
  const fmtMoney = (value) => formatMoney(Number(value || 0));
  const rows = Array.isArray(p.bookingsRecent) ? p.bookingsRecent : [];
  const priorities = Array.isArray(p.priorities) ? p.priorities : [];
  const services = Array.isArray(p.services) ? p.services : [];
  const staffList = Array.isArray(p.staffList) ? p.staffList : [];
  return `<!doctype html>
  <html><head><meta charset="utf-8" />
  <title>${escapeHtml(String(business.name || "Salon"))} - Business Report</title>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;margin:22px;color:#1f2430;background:#fff}
    h1,h2,h3{margin:0;color:#151823}
    p{margin:0;color:#4e5463;line-height:1.4}
    .head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border:1px solid #e7e8ee;border-radius:14px;padding:14px}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
    .card{border:1px solid #e7e8ee;border-radius:12px;padding:10px;background:#fafbff}
    .card p{font-size:12px;text-transform:uppercase;letter-spacing:.04em}
    .card strong{display:block;margin-top:4px;font-size:18px;color:#1e2431}
    .section{margin-top:14px;border:1px solid #ececf2;border-radius:14px;padding:12px}
    ul{margin:8px 0 0;padding-left:18px}
    li{margin:0 0 6px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
    th,td{border-bottom:1px solid #ececf2;padding:7px 6px;text-align:left;vertical-align:top}
    th{color:#4f5666;font-weight:600;background:#fafbff}
    .muted{color:#6a7180}
    @media print {.section,.head,.card{break-inside:avoid}}
  </style></head><body>
    <div class="head">
      <div>
        <h1>${escapeHtml(String(business.name || "Salon Business"))} - Business Report</h1>
        <p>${escapeHtml(String(business.city || ""))}${business.city && business.country ? ", " : ""}${escapeHtml(String(business.country || ""))}</p>
        <p>${escapeHtml(String(business.phone || ""))}${business.phone && business.email ? " • " : ""}${escapeHtml(String(business.email || ""))}</p>
      </div>
      <div style="text-align:right">
        <p><strong style="font-size:13px;color:#1f2430;">Generated</strong></p>
        <p>${escapeHtml(new Date(p.generatedAt || Date.now()).toLocaleString("en-GB"))}</p>
        <p class="muted">Role: ${escapeHtml(String(p.role || ""))}</p>
      </div>
    </div>
    <div class="grid">
      <div class="card"><p>Today Bookings</p><strong>${escapeHtml(String(summary.todayBookings ?? 0))}</strong></div>
      <div class="card"><p>Next 7 Days</p><strong>${escapeHtml(String(summary.next7Bookings ?? 0))}</strong></div>
      <div class="card"><p>Today Revenue</p><strong>${escapeHtml(fmtMoney(summary.todayRevenue))}</strong></div>
      <div class="card"><p>Health Score</p><strong>${escapeHtml(String(summary.healthScore ?? 0))}%</strong></div>
    </div>
    <section class="section">
      <h2 style="font-size:15px;">AI Priorities</h2>
      <ul>${priorities.map((item) => `<li><strong>${escapeHtml(String(item?.title || ""))}</strong><br><span class="muted">${escapeHtml(String(item?.note || ""))}</span></li>`).join("") || "<li class='muted'>No priorities available.</li>"}</ul>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Business Highlights</h2>
      <ul>${(Array.isArray(p.reportHighlights) ? p.reportHighlights : []).map((line) => `<li>${escapeHtml(String(line || ""))}</li>`).join("") || "<li class='muted'>No highlights available.</li>"}</ul>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Team & Services Snapshot</h2>
      <table><thead><tr><th>Staff</th><th>Role</th><th>Availability</th></tr></thead><tbody>
      ${staffList.map((s) => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.role)}</td><td>${escapeHtml(s.availability)}</td></tr>`).join("") || "<tr><td colspan='3' class='muted'>No staff loaded.</td></tr>"}
      </tbody></table>
      <p style="margin-top:8px"><strong style="font-size:13px;color:#1f2430;">Services</strong></p>
      <p class="muted">${services.length ? escapeHtml(services.join(" • ")) : "No services listed yet."}</p>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Recent Bookings</h2>
      <table><thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Service</th><th>Status</th><th>Price</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.time)}</td><td>${escapeHtml(r.customerName)}</td><td>${escapeHtml(r.service)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(fmtMoney(r.price))}</td></tr>`).join("") || "<tr><td colspan='6' class='muted'>No bookings available.</td></tr>"}
      </tbody></table>
    </section>
  </body></html>`;
}

function openPrintWindowWithHtml(html) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=980,height=760");
  if (!win) {
    setDashActionStatus("Popup blocked. Allow popups to print the report.", true);
    return false;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  window.setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      // Ignore print issues.
    }
  }, 220);
  return true;
}

async function printBusinessReportPdf() {
  const payload = buildBusinessReportPayload();
  const html = buildBusinessReportHtml(payload);
  const opened = openPrintWindowWithHtml(html);
  if (!opened) return;
  setDashActionStatus("Print dialog opened. Choose Save as PDF to create a business report PDF.");
  if (hubReportStatusPill) {
    hubReportStatusPill.textContent = "Print opened";
    hubReportStatusPill.classList.add("muted");
  }
}

async function queueBusinessReportEmail(recipientEmail, note = "") {
  const payload = buildBusinessReportPayload();
  const body = {
    recipientEmail: String(recipientEmail || "").trim(),
    subject: `${payload.business?.name || "Salon"} Business Report (${payload.reportDate})`,
    note: String(note || "").trim(),
    report: payload
  };
  if (isDashboardDemoDataModeActive()) {
    try {
      const key = "salon_ai_demo_report_emails_v1";
      const rows = JSON.parse(localStorage.getItem(key) || "[]");
      const next = Array.isArray(rows) ? rows : [];
      next.unshift({ id: `demo_report_${Date.now()}`, ...body, queuedAt: new Date().toISOString(), status: "queued_demo" });
      localStorage.setItem(key, JSON.stringify(next.slice(0, 40)));
      return { queued: true, status: "queued_demo" };
    } catch {
      throw new Error("Could not queue demo report email on this device.");
    }
  }
  const res = await fetch(withManagedBusiness("/api/business-reports/email"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not queue business report email.");
  return data;
}

async function openBusinessReportEmailFlow() {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const values = await openManageForm({
    title: "Email Business Report",
    submitLabel: "Queue Email",
    fields: [
      { id: "recipientEmail", label: "Recipient Email", type: "email", required: true, value: String(user.email || "") },
      { id: "note", label: "Message Note", type: "textarea", placeholder: "Optional note for the recipient (e.g. weekly review before payroll)." }
    ]
  });
  if (!values) return;
  const recipientEmail = String(values.recipientEmail || "").trim();
  const note = String(values.note || "").trim();
  if (!recipientEmail) {
    setDashActionStatus("Recipient email is required.", true);
    return;
  }
  if (hubReportStatusPill) {
    hubReportStatusPill.textContent = "Queueing...";
    hubReportStatusPill.classList.add("muted");
  }
  try {
    const data = await queueBusinessReportEmail(recipientEmail, note);
    const queueMsg = data?.deliveryMode === "smtp" ? "Email sent." : "Email queued.";
    if (hubReportStatusPill) {
      hubReportStatusPill.textContent = data?.deliveryMode === "smtp" ? "Sent" : "Queued";
      hubReportStatusPill.classList.add("muted");
    }
    if (hubReportStatusText) {
      hubReportStatusText.textContent = `${queueMsg} Recipient: ${recipientEmail}. ${data?.queuedAt ? `Queued ${new Date(data.queuedAt).toLocaleString("en-GB")}.` : ""}`;
    }
    setDashActionStatus(`Business report ${data?.deliveryMode === "smtp" ? "sent" : "queued"} for email delivery.`);
    showManageToast(data?.deliveryMode === "smtp" ? "Business report sent." : "Business report queued.");
  } catch (error) {
    if (hubReportStatusPill) hubReportStatusPill.textContent = "Error";
    setDashActionStatus(error.message || "Could not queue business report email.", true);
  }
}

function syncAdminBusinessQueryParam() {
  if (user.role !== "admin") return;
  const url = new URL(window.location.href);
  if (managedBusinessId) {
    url.searchParams.set("businessId", managedBusinessId);
  } else {
    url.searchParams.delete("businessId");
  }
  const target = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", target);
}

function addMetric(label, value) {
  const card = document.createElement("article");
  card.className = "dash-card";
  card.innerHTML = `<p>${label}</p><strong>${value}</strong>`;
  metricsGrid.appendChild(card);
}

function hideSection(sectionEl) {
  if (sectionEl) {
    sectionEl.style.display = "none";
  }
}

function showSection(sectionEl) {
  if (sectionEl) {
    sectionEl.style.display = "";
  }
}

function isPopupOnlyBusinessModuleKey(moduleKey) {
  return [
    "operations",
    "crm",
    "client_retention",
    "commercial",
    "offers_packages",
    "revenue",
    "profitability",
    "finance_targets"
  ].includes(String(moduleKey || "").trim());
}

function isPopupMountedBusinessSection(sectionEl) {
  return sectionEl instanceof HTMLElement && sectionEl.classList.contains("module-popup-mounted");
}

function renderPopupOnlyBusinessModule(moduleKey) {
  switch (String(moduleKey || "").trim()) {
    case "operations":
      renderOperationsInsights();
      break;
    case "crm":
    case "client_retention":
      renderCrmSegments();
      break;
    case "commercial":
    case "offers_packages":
      renderCommercialControls();
      break;
    case "revenue":
      renderRevenueAttribution();
      break;
    case "profitability":
    case "finance_targets":
      renderProfitabilitySummary();
      break;
    default:
      break;
  }
}

function renderSubscriberFullDemoModePanel() {
  // Hidden for now; demo mode should focus on showing live-like mock data inside modules/panels.
  hideSection(subscriberFullDemoModeSection);
}

function enforceDashboardRoleLayoutVisibility() {
  if (user.role !== "subscriber") {
    hideSection(contactAdminBtn);
    if (subscriptionQuickPanel) subscriptionQuickPanel.style.display = "none";
    hideSection(subscriberSubscriptionSection);
    hideSection(first7DaysSnapshotSection);
    if (subscriptionBillingCycle) subscriptionBillingCycle.style.display = "none";
    if (subscriptionBillingProvider) subscriptionBillingProvider.style.display = "none";
    if (startBilling) startBilling.style.display = "none";
    if (manageBilling) manageBilling.style.display = "none";
  }
  if (user.role !== "subscriber" && user.role !== "admin") {
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
    hideSection(revenueAttributionSection);
    hideSection(profitabilitySection);
  }
  if (user.role !== "customer") {
    hideSection(customerSearchSection);
    hideSection(customerReceptionSection);
    hideSection(customerLexiCalendarSection);
    hideSection(customerSlotsSection);
    hideSection(customerHistorySection);
    hideSection(customerAnalyticsSection);
  }
  if (user.role !== "admin") {
    hideSection(adminCopilotSection);
    hideSection(accountingPlatformExportBtn);
  }
  if (user.role !== "subscriber") {
    hideSection(subscriberCopilotSection);
  }
  if (user.role === "subscriber" || user.role === "admin") {
    hideSection(metricsGrid);
  }
  if (user.role === "customer") {
    showSection(dashIdentityBlock);
    hideSection(frontDeskSection);
    hideSection(subscriberExecutivePulseSection);
    hideSection(subscriberCopilotSection);
    hideSection(subscriberCalendarSection);
    hideSection(bookingOperationsSection);
    hideSection(metricsGrid);
    hideSection(businessProfileSection);
    hideSection(socialMediaSection);
    hideSection(accountingIntegrationsSection);
    hideSection(subscriberCommandCenterSection);
    hideSection(staffRosterSection);
    hideSection(waitlistSection);
    hideSection(revenueAttributionSection);
    hideSection(profitabilitySection);
    hideSection(adminBusinessScope);
    hideSection(adminCopilotSection);
    hideSection(subscriberSubscriptionSection);
    hideSection(first7DaysSnapshotSection);
  }
  renderSubscriberFullDemoModePanel();
}

function saveLocalAdminContactMessage(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem(CONTACT_ADMIN_MESSAGES_STORAGE_KEY) || "[]");
    const rows = Array.isArray(existing) ? existing : [];
    rows.unshift(payload);
    localStorage.setItem(CONTACT_ADMIN_MESSAGES_STORAGE_KEY, JSON.stringify(rows.slice(0, 200)));
    return true;
  } catch {
    return false;
  }
}

function openContactAdminModal() {
  if (user.role !== "subscriber") return;
  if (typeof closeModulePopupActive === "function") {
    closeModulePopupActive();
  }
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";

  const shell = document.createElement("section");
  shell.className = "contact-admin-modal";
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-labelledby", "contactAdminModalTitle");
  shell.innerHTML = `
    <div class="contact-admin-modal-head">
      <div>
        <h3 id="contactAdminModalTitle">Emergency Admin Contact</h3>
        <p>Use this only for urgent issues that need admin support (for example access problems or a critical dashboard issue).</p>
      </div>
      <button type="button" class="module-info-close" aria-label="Close contact admin window">x</button>
    </div>
    <p class="contact-admin-note">Urgent messages only. We usually reply within 24 hours.</p>
    <form class="contact-admin-form" novalidate>
      <input id="contactAdminSubject" type="text" maxlength="120" placeholder="Subject (e.g. Urgent login issue)" />
      <textarea id="contactAdminMessage" required maxlength="2000" placeholder="Describe the urgent issue and what you need help with..."></textarea>
      <p class="contact-admin-status" id="contactAdminStatus" aria-live="polite"></p>
      <div class="contact-admin-actions">
        <small>For urgent issues only.</small>
        <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
          <button type="button" class="btn btn-ghost contact-admin-cancel">Close</button>
          <button type="submit" class="btn contact-admin-send">Send Message</button>
        </div>
      </div>
    </form>
  `;
  overlay.appendChild(shell);

  const form = shell.querySelector(".contact-admin-form");
  const messageInput = shell.querySelector("#contactAdminMessage");
  const subjectInput = shell.querySelector("#contactAdminSubject");
  const statusEl = shell.querySelector("#contactAdminStatus");

  const close = () => {
    if (typeof closeModulePopupActive !== "function") return;
    document.removeEventListener("keydown", onKeyDown);
    overlay.removeEventListener("click", onOverlayClick);
    overlay.style.display = "none";
    overlay.innerHTML = "";
    closeModulePopupActive = null;
  };

  const setStatus = (message, isError = false) => {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.textContent = String(message || "");
    statusEl.classList.toggle("is-error", Boolean(isError));
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const onOverlayClick = (event) => {
    if (event.target === overlay) close();
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = String(messageInput?.value || "").trim();
    const subject = String(subjectInput?.value || "").trim();
    if (!message) {
      setStatus("Please write a message before sending.", true);
      messageInput?.focus();
      return;
    }

    const payload = {
      id: `msg_${Date.now()}`,
      fromUserId: String(user.id || ""),
      fromName: String(user.name || user.email || "Subscriber"),
      fromEmail: String(user.email || ""),
      role: "subscriber",
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: "new"
    };

    const saved = saveLocalAdminContactMessage(payload);
    if (!saved) {
      setStatus("Could not save your message on this device. Please try again.", true);
      return;
    }

    setDashActionStatus("Emergency message sent to admin. Usually responds within 24hrs.");
    showManageToast("Emergency message sent to admin.");
    close();
  });

  closeModulePopupActive = close;
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", onOverlayClick);
  shell.querySelector(".module-info-close")?.addEventListener("click", close);
  shell.querySelector(".contact-admin-cancel")?.addEventListener("click", close);

  if (messageInput instanceof HTMLElement) messageInput.focus();
}

function shouldRenderTopMetricsGrid() {
  return !(user.role === "subscriber" || user.role === "admin");
}

function formatDateShort(value) {
  if (!value) return "N/A";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleDateString("en-GB");
}

function normalizeModuleConfig(mod) {
  if (!mod || typeof mod !== "object") return null;
  const hasSection = mod.section instanceof HTMLElement;
  const key = String(mod.key || "");
  const inferredCadence = (() => {
    if (key === "home") return "Start here";
    if (["command_center", "booking_ops", "calendar", "waitlist", "staff", "overview"].includes(key)) return "Use daily";
    if (["revenue", "profitability", "commercial", "accounting", "crm", "social", "frontdesk", "business_profile"].includes(key)) return "Weekly check";
    return "Use daily";
  })();
  return {
    popupMode: hasSection ? "interactive" : "info",
    popupSize: hasSection ? "large" : "medium",
    enabled: true,
    cadence: inferredCadence,
    startHere: key === "home",
    navSummary: String(mod.howItHelps || mod.howItWorks || "").trim(),
    ...mod
  };
}

function moduleDefinitionsForRole() {
  if (user.role === "customer") {
    return [
      {
        key: "customer_search",
        section: customerSearchSection,
        label: "Business Search",
        features: ["Advanced filters", "Business type targeting", "Rating/date match"],
        howItWorks: "Filter by service, location, rating, date, and business type.",
        howItHelps: "Find the best local option faster and reduce booking friction."
      },
      {
        key: "customer_chat",
        section: customerReceptionSection,
        label: "AI Receptionist",
        features: ["Live AI receptionist", "Service Q&A", "Booking guidance"],
        howItWorks: "Ask the AI receptionist for slots, services, and contact details.",
        howItHelps: "Get answers instantly and convert intent into booked appointments."
      },
      {
        key: "customer_slots",
        section: customerSlotsSection,
        label: "Slots and Contact",
        features: ["Available time slots", "Phone/email visibility", "Selected business context"],
        howItWorks: "View live slot windows and contact info for selected businesses.",
        howItHelps: "Speed up decision-making and reduce drop-off before booking."
      },
      {
        key: "customer_history",
        section: customerHistorySection,
        label: "Visit and Booking History",
        features: ["Past visits", "Upcoming bookings", "Single timeline view"],
        howItWorks: "Track previous and upcoming appointments in one place.",
        howItHelps: "Improves rebooking confidence and customer retention."
      },
      {
        key: "customer_analytics",
        section: customerAnalyticsSection,
        label: "Personal Analytics",
        features: ["Booking trends", "Completion/cancel view", "Personal-only metrics"],
        howItWorks: "Summarizes completion, cancellations, and activity trends.",
        howItHelps: "Gives customers a simple view of personal booking behavior."
      }
    ].map(normalizeModuleConfig).filter((mod) => mod?.enabled !== false);
  }

  if (user.role === "subscriber" || user.role === "admin") {
    const modules = [
      {
        key: "home",
        section: subscriberExecutivePulseSection,
        label: "Home",
        hideInNavigator: true,
        popupMode: "interactive",
        popupSize: "large",
        cadence: "Start here",
        startHere: true,
        navSummary: "Open your daily control view with priorities, bookings, staffing pressure, and revenue signals.",
        features: ["Today’s priorities", "Bookings and revenue pulse", "Quick action focus"],
        howItWorks: "Pulls together the main numbers, alerts, and priorities you need to run the day.",
        howItHelps: "Gives you a clear starting point before you jump into bookings, staffing, or finance."
      },
      {
        key: "subscription_plan",
        section: subscriberSubscriptionSection,
        label: "Live Subscription Plan",
        popupMode: "interactive",
        popupSize: "medium",
        cadence: "Monthly check",
        navSummary: "Review your current plan status, next renewal date, and update billing settings.",
        features: ["Current plan status", "Renewal timing", "Change plan and billing management"],
        howItWorks: "Shows your current subscription summary and links to plan changes or billing management actions.",
        howItHelps: "Keeps plan and renewal details easy to find without opening the full business growth panel."
      },
      {
        key: "owner_summary",
        section: subscriberExecutivePulseSection,
        label: "Owner Summary",
        popupSize: "large",
        cadence: "Start here",
        navSummary: "Get a quick owner-level view of priorities, pressure points, and what needs attention next.",
        features: ["Owner-level overview", "Priority focus", "Business pulse"],
        howItWorks: "Shows a simplified executive view of what matters most right now.",
        howItHelps: "Helps owners check the business quickly without digging through every module."
      },
      {
        key: "frontdesk",
        section: frontDeskSection,
        label: "Front Desk Profile",
        popupSize: "large",
        navSummary: "Review how your salon profile and service presentation look to clients.",
        features: ["Public profile preview", "Service menu presentation", "Trust-building details"],
        howItWorks: "Shows what clients see: your profile, services, reviews, and front desk presentation.",
        howItHelps: "Helps you keep your booking experience polished and consistent."
      },
      {
        key: "command_center",
        section: subscriberCommandCenterSection,
        label: "Command Center",
        popupMode: "interactive",
        popupSize: "medium",
        cadence: "Use daily",
        navSummary: "See what needs attention first today, plus pressure points coming up this week.",
        features: ["Today’s priority list", "Next 7 days outlook", "Risk alerts"],
        howItWorks: "Brings together today’s key tasks and upcoming booking/revenue pressure points.",
        howItHelps: "Shows your team what to deal with first so the day runs smoother."
      },
      {
        key: "business_growth_status",
        section: businessGrowthSection,
        label: "Business Growth Status",
        popupSize: "large",
        cadence: "Weekly check",
        navSummary: "Check onboarding progress, billing status, and early business performance in one place.",
        features: ["Billing status", "Onboarding progress", "First-week performance"],
        howItWorks: "Brings together plan status, setup checklist progress, and early performance signals.",
        howItHelps: "Keeps setup and subscription progress visible so nothing important gets missed."
      },
      {
        key: "first_7_days_snapshot",
        section: first7DaysSnapshotSection,
        label: "First 7 Days Snapshot",
        popupMode: "interactive",
        popupSize: "medium",
        cadence: "Daily check",
        navSummary: "Quick view of bookings, completions, cancellations, and revenue for your recent first-week trend.",
        features: ["Bookings count", "Completed vs cancelled", "Revenue snapshot"],
        howItWorks: "Summarizes recent booking and revenue activity into a compact startup snapshot.",
        howItHelps: "Helps you track early momentum and spot issues quickly."
      },
      {
        key: "business_profile",
        section: businessProfileSection,
        label: "Business Profile",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Update your salon details, opening hours, and service menu so clients book the right thing.",
        features: ["Edit business details", "Update services and hours", "Profile setup tools"],
        howItWorks: "Update your salon details, service list, opening hours, and profile setup.",
        howItHelps: "Keeps your booking info accurate so clients can book with confidence."
      },
      {
        key: "booking_ops",
        section: bookingOperationsSection,
        label: "Booking Operations",
        popupSize: "xl",
        cadence: "Use daily",
        navSummary: "Handle booking changes, status updates, and reschedules without jumping between screens.",
        features: ["Search and filters", "Status updates", "Reschedule and manage bookings"],
        howItWorks: "Find bookings quickly, update statuses, and manage changes from one place.",
        howItHelps: "Cuts front desk admin time and helps keep the diary under control."
      },
      {
        key: "reschedules_changes",
        section: bookingOperationsSection,
        label: "Reschedules & Changes",
        popupSize: "xl",
        cadence: "Use daily",
        navSummary: "Focus on moved, changed, or updated appointments without scanning the full booking list.",
        features: ["Reschedule workflow", "Booking updates", "Change handling"],
        howItWorks: "Uses the booking workspace for schedule changes and client updates.",
        howItHelps: "Helps the team process changes quickly during busy periods."
      },
      {
        key: "calendar",
        section: subscriberCalendarSection,
        label: "Calendar",
        popupMode: "interactive",
        popupSize: "large",
        cadence: "Use daily",
        navSummary: "See busy days at a glance so you can plan cover and spot pressure before it builds.",
        features: ["Monthly bookings view", "Busy-day visibility", "Staffing planning support"],
        howItWorks: "Shows how busy each day looks across the month using your booking data.",
        howItHelps: "Makes it easier to spot busy days and plan cover before it gets stressful."
      },
      {
        key: "accounting",
        section: accountingIntegrationsSection,
        label: "Accounting",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Track revenue activity and exports for your books and provider reconciliation.",
        features: ["Revenue feed", "Provider connections", "CSV exports"],
        howItWorks: "Connect your providers, track revenue activity, and export files for accounts.",
        howItHelps: "Saves admin time and gives you a clearer view of what the business is taking in."
      },
      {
        key: "daily_takings",
        section: accountingIntegrationsSection,
        label: "Daily Takings",
        popupSize: "xl",
        cadence: "Use daily",
        navSummary: "Check daily revenue movement and cashflow signals without opening full reports.",
        features: ["Daily revenue view", "Recent revenue flow", "Quick finance check"],
        howItWorks: "Uses the accounting workspace with a day-focused revenue view.",
        howItHelps: "Makes daily money checks faster for owners and managers."
      },
      {
        key: "staff",
        section: staffRosterSection,
        label: "Staff and Capacity",
        popupSize: "large",
        cadence: "Use daily",
        navSummary: "Match team cover to demand so the day runs smoothly and you avoid overbooking.",
        features: ["Team availability", "Shift coverage", "Capacity planning"],
        howItWorks: "Manage staff availability and match cover to expected demand.",
        howItHelps: "Helps prevent overbooking and keeps service running smoothly."
      },
      {
        key: "capacity_planner",
        section: staffRosterSection,
        label: "Capacity Planner",
        popupSize: "large",
        cadence: "Use daily",
        navSummary: "Plan cover around your busiest times and upcoming bookings.",
        features: ["Capacity view", "Shift planning", "Demand matching"],
        howItWorks: "Uses the staffing workspace to focus on coverage and capacity planning.",
        howItHelps: "Helps avoid pressure points before they impact service."
      },
      {
        key: "waitlist",
        section: waitlistSection,
        label: "Waitlist",
        popupMode: "interactive",
        popupSize: "large",
        cadence: "Use daily",
        navSummary: "Refill cancelled appointments quickly using your waitlist and recovery workflow.",
        features: ["Capture missed demand", "Backfill cancelled slots", "Recovery workflows"],
        howItWorks: "Add clients to the waitlist and use it to refill cancelled appointments faster.",
        howItHelps: "Helps recover income when clients cancel at short notice."
      },
      {
        key: "operations",
        section: operationsInsightsSection,
        label: "No-Show and Rebooking",
        popupSize: "large",
        cadence: "Use daily",
        navSummary: "Spot no-show risks and rebooking opportunities before they turn into empty chairs.",
        features: ["No-show risk checks", "Rebooking prompts", "Priority outreach list"],
        howItWorks: "Highlights bookings at risk and clients who are due a rebooking message.",
        howItHelps: "Helps keep chairs full and improves repeat bookings."
      },
      {
        key: "crm",
        section: crmSection,
        label: "CRM and Campaigns",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Plan client follow-up and reactivation campaigns using useful customer segments.",
        features: ["Client segments", "Campaign ideas", "Retention targeting"],
        howItWorks: "Groups clients into useful segments and suggests campaign-ready actions.",
        howItHelps: "Makes follow-up and reactivation marketing easier to run consistently."
      },
      {
        key: "client_retention",
        section: crmSection,
        label: "Client Retention",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Focus on keeping clients coming back with rebooking and follow-up actions.",
        features: ["Retention focus", "Rebooking prompts", "Follow-up planning"],
        howItWorks: "Uses the CRM workspace with a retention-first workflow.",
        howItHelps: "Improves repeat visits and client lifetime value."
      },
      {
        key: "commercial",
        section: commercialSection,
        label: "Memberships and Packages",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Manage memberships, bundles, and gift cards to support repeat spend and cash flow.",
        features: ["Membership plans", "Service bundles", "Gift card setup"],
        howItWorks: "Manage memberships, packages, and gift cards from one place.",
        howItHelps: "Supports repeat spend and steadier cash flow."
      },
      {
        key: "offers_packages",
        section: commercialSection,
        label: "Offers & Packages",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Manage value offers and service packages that support repeat spend.",
        features: ["Package offers", "Promotion-ready bundles", "Repeat spend support"],
        howItWorks: "Uses the commercial workspace to manage bundles and package offers.",
        howItHelps: "Makes it easier to create offers that support retention and revenue."
      },
      {
        key: "revenue",
        section: revenueAttributionSection,
        label: "Revenue Attribution",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "See which channels are actually bringing bookings and a return on your spend.",
        features: ["Channel tracking", "Spend vs takings", "ROI comparison"],
        howItWorks: "Tracks which channels bring bookings, revenue, and return on spend.",
        howItHelps: "Helps you put your marketing budget where it is actually working."
      },
      {
        key: "finance_targets",
        section: profitabilitySection,
        label: "Finance Targets",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Track break-even and target progress to keep decisions tied to real business goals.",
        features: ["Break-even tracking", "Target checks", "Decision support"],
        howItWorks: "Uses profitability tools to review targets, margin pressure, and break-even.",
        howItHelps: "Keeps financial decisions grounded in clear targets."
      },
      {
        key: "profitability",
        section: profitabilitySection,
        label: "Profitability and Payroll",
        popupSize: "xl",
        cadence: "Weekly check",
        navSummary: "Understand margin, payroll impact, and break-even so you can make better decisions.",
        features: ["Payroll inputs", "Cost planning", "Profit and break-even view"],
        howItWorks: "Combines payroll and business costs to estimate margin and break-even.",
        howItHelps: "Shows what is really driving profit so you can make better decisions."
      },
      {
        key: "social",
        section: socialMediaSection,
        label: "Social Presence",
        popupSize: "large",
        cadence: "Weekly check",
        navSummary: "Keep your social links and profile details tidy so your brand looks consistent.",
        features: ["Social links", "Profile consistency", "Brand visibility support"],
        howItWorks: "Keep your social links and profile details updated in one place.",
        howItHelps: "Makes your brand look more consistent and helps clients trust what they see."
      },
      {
        key: "opening_closing_checklist",
        label: "Opening & Closing Checklist",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Use daily",
        navSummary: "Run a consistent open/close routine so bookings, tills, and team handover stay tidy.",
        features: ["Open checklist", "Close checklist", "Shift handover routine"],
        howItWorks: "Provides a structured checklist for opening tasks, closing tasks, and end-of-day handover.",
        howItHelps: "Reduces missed setup steps and keeps operations more consistent day to day."
      },
      {
        key: "service_recovery_playbook",
        label: "Service Recovery",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Use daily",
        navSummary: "Handle complaints, rework requests, and goodwill actions with a clear response playbook.",
        features: ["Issue triage", "Response templates", "Follow-up actions"],
        howItWorks: "Shows a structured workflow for handling service issues, rebooking fixes, and client follow-up.",
        howItHelps: "Helps protect reviews and retention when something goes wrong."
      },
      {
        key: "reviews_reputation",
        label: "Reviews & Reputation",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Weekly check",
        navSummary: "Track review quality and response habits to keep your brand trust high.",
        features: ["Review monitoring", "Response routine", "Reputation health"],
        howItWorks: "Organizes a weekly review-response workflow and highlights reputation habits to maintain.",
        howItHelps: "Supports conversion and repeat bookings by keeping trust signals strong."
      },
      {
        key: "referrals_partnerships",
        label: "Referrals & Partnerships",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Weekly check",
        navSummary: "Plan referral offers and local partnerships that can bring in repeat local demand.",
        features: ["Referral ideas", "Partner outreach", "Offer tracking prompts"],
        howItWorks: "Provides a simple framework for referral campaigns and local partner promotions.",
        howItHelps: "Creates additional growth channels beyond your normal booking flow."
      },
      {
        key: "cashflow_forecast",
        label: "Cashflow Forecast",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Weekly check",
        navSummary: "Estimate short-term cash pressure using bookings, payroll timing, and fixed costs.",
        features: ["7-30 day view", "Cash pressure prompts", "Planning checks"],
        howItWorks: "Guides a short-range cashflow review using takings, payout timing, and cost commitments.",
        howItHelps: "Helps you spot pressure early and avoid reactive decisions."
      },
      {
        key: "payout_reconciliation",
        label: "Payout Reconciliation",
        popupMode: "info",
        popupSize: "medium",
        cadence: "Weekly check",
        navSummary: "Reconcile provider payouts, exports, and expected takings before issues snowball.",
        features: ["Payout checks", "Mismatch review", "Export reconciliation"],
        howItWorks: "Outlines a routine for comparing provider payouts against booking and accounting exports.",
        howItHelps: "Reduces finance surprises and makes month-end checks faster."
      }
    ];
    if (user.role === "subscriber") {
      modules.unshift({
        key: "subscriber_copilot",
        section: subscriberCopilotSection,
        label: "Subscriber Copilot",
        popupMode: "interactive",
        popupSize: "medium",
        cadence: "Use daily",
        navSummary: "Ask for practical guidance on bookings, cancellations, waitlist recovery, and daily priorities.",
        features: ["Operations Q&A", "Suggested actions", "Business snapshot"],
        howItWorks: "Ask for guidance using safe booking and business summary data.",
        howItHelps: "Helps you decide what to focus on next without digging through every module."
      });
    }
    if (user.role === "admin") {
      modules.unshift({
        key: "admin_copilot",
        section: adminCopilotSection,
        label: "Admin Copilot",
        popupMode: "interactive",
        popupSize: "medium",
        cadence: "Use daily",
        navSummary: "Run diagnostics and get suggested fixes without exposing private data or secrets.",
        features: ["Diagnostics Q&A", "Safe platform snapshot", "Suggested fixes"],
        howItWorks: "Ask platform and subscriber-ops questions to get a diagnosis summary and recommended fixes.",
        howItHelps: "Speeds up troubleshooting without exposing secrets or personal data."
      });
    }
    return modules.map(normalizeModuleConfig).filter((mod) => mod?.enabled !== false);
  }
  return [];
}

function moduleGroupForRole(mod) {
  if (!mod || !mod.key) return "Modules";
  const key = String(mod.key);
  const map = {
    admin_copilot: "Copilot",
    subscriber_copilot: "Copilot",
    home: "Home",
    subscription_plan: "Home",
    owner_summary: "Home",
    overview: "Home",
    command_center: "Home",
    calendar: "Home",
    business_growth_status: "Home",
    first_7_days_snapshot: "Home",
    frontdesk: "Growth",
    business_profile: "Growth",
    crm: "Growth",
    client_retention: "Growth",
    offers_packages: "Growth",
    social: "Growth",
    reviews_reputation: "Growth",
    referrals_partnerships: "Growth",
    booking_ops: "Operations",
    reschedules_changes: "Operations",
    staff: "Operations",
    capacity_planner: "Operations",
    waitlist: "Operations",
    operations: "Operations",
    opening_closing_checklist: "Operations",
    service_recovery_playbook: "Operations",
    accounting: "Finance",
    daily_takings: "Finance",
    revenue: "Finance",
    finance_targets: "Finance",
    profitability: "Finance",
    commercial: "Finance",
    cashflow_forecast: "Finance",
    payout_reconciliation: "Finance"
  };
  return map[key] || "Modules";
}

function groupedModulesForCurrentRole() {
  const modules = moduleDefinitionsForRole().filter((mod) => mod && mod.hideInNavigator !== true);
  const groupOrder = ["Home", "Copilot", "Operations", "Growth", "Finance", "Modules"];
  const groups = new Map();
  modules.forEach((mod) => {
    const group = moduleGroupForRole(mod);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(mod);
  });
  return groupOrder
    .filter((group) => groups.has(group))
    .map((group) => ({ group, modules: groups.get(group) }));
}

function formatModuleGroupHeading(groupName) {
  const group = String(groupName || "").trim();
  if (!group) return "MODULES";
  return group;
}

function renderModuleNavigator() {
  if (!moduleNavigatorSection || !moduleCards || !moduleDetails) return;
  const grouped = groupedModulesForCurrentRole();
  const modules = grouped.flatMap((entry) => entry.modules);
  if (!modules.length) {
    hideSection(moduleNavigatorSection);
    return;
  }
  showSection(moduleNavigatorSection);
  if (moduleNavigatorIntro) {
    moduleNavigatorIntro.textContent = user.role === "customer"
      ? "Move between customer tools here."
      : "Open a workspace and go straight to the task.";
  }

  moduleCards.innerHTML = "";
  grouped.forEach(({ group, modules: groupModules }) => {
    const wrapper = document.createElement("section");
    wrapper.className = "module-group";
    wrapper.innerHTML = `<header class="module-group-head"><h3>${escapeHtml(formatModuleGroupHeading(group))}</h3></header>`;
    const grid = document.createElement("div");
    grid.className = "module-group-grid";
    groupModules.forEach((mod) => {
      const isPinned = isPinnedBusinessModule(mod);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `module-card${mod.key === activeModuleKey ? " active" : ""}`;
      btn.setAttribute("data-module-key", mod.key);
      const status = moduleOperationalStatus(mod);
      const summaryText = String(mod.navSummary || mod.howItHelps || mod.howItWorks || status.note || "").trim();
      const cadenceClass = String(mod.cadence || "").toLowerCase().replace(/\s+/g, "-");
      const usage = moduleUsageSummary(mod);
      const usageText = usage.label === "Not used yet" ? "Open when you need it." : (usage.detail || usage.label);
      btn.innerHTML = `
        <strong>${mod.label}</strong>
        <small class="module-card-summary">${escapeHtml(summaryText)}</small>
        <div class="module-card-meta">
          ${isPinned ? '<span class="module-card-pill accent">Pinned</span>' : ""}
          ${mod.startHere ? '<span class="module-card-pill accent">Start here</span>' : ""}
          <span class="module-card-pill ${cadenceClass.includes("weekly") ? "soft" : ""}">${escapeHtml(mod.cadence || "Use daily")}</span>
          ${renderModuleStatusPill(status, { compact: true })}
        </div>
        <small class="module-card-usage">${escapeHtml(usageText)}</small>
      `;
      grid.appendChild(btn);
    });
    wrapper.appendChild(grid);
    moduleCards.appendChild(wrapper);
  });

  const active = modules.find((mod) => mod.key === activeModuleKey) || modules[0];
  activeModuleKey = active.key;
  hideSection(moduleDetails);
  moduleDetails.innerHTML = "";
}

function moduleDefinitionByKey(moduleKey) {
  const key = String(moduleKey || "").trim();
  if (!key) return null;
  return moduleDefinitionsForRole().find((mod) => mod.key === key) || null;
}

function moduleUsesInteractivePopup(mod) {
  if (!mod) return false;
  return String(mod.popupMode || "info").toLowerCase() === "interactive";
}

function moduleUsesInfoPopup(mod) {
  if (!mod) return false;
  return String(mod.popupMode || "info").toLowerCase() === "info";
}

function moduleUsageStorageKey() {
  return `dashboard:module-usage:v1:${String(user?.role || "guest")}`;
}

function loadModuleUsageMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(moduleUsageStorageKey()) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveModuleUsageMap(map) {
  try {
    localStorage.setItem(moduleUsageStorageKey(), JSON.stringify(map || {}));
  } catch {
    // Ignore localStorage errors.
  }
}

function markModuleUsed(moduleKey, mode = "open") {
  const key = String(moduleKey || "").trim();
  if (!key) return;
  const map = loadModuleUsageMap();
  const prev = map[key] && typeof map[key] === "object" ? map[key] : {};
  map[key] = {
    opens: Math.max(0, Number(prev.opens || 0)) + (mode === "open" ? 1 : 0),
    focuses: Math.max(0, Number(prev.focuses || 0)) + (mode === "focus" ? 1 : 0),
    lastMode: mode,
    lastUsedAt: new Date().toISOString()
  };
  saveModuleUsageMap(map);
}

function moduleUsageSummary(mod) {
  const key = String(mod?.key || "").trim();
  const row = loadModuleUsageMap()[key];
  if (!row || !row.lastUsedAt) {
    return { label: "Not used yet", detail: "Open this popup to start using it today." };
  }
  const ts = new Date(row.lastUsedAt);
  const timeLabel = Number.isFinite(ts.getTime()) ? ts.toLocaleString("en-GB") : "Recently";
  const opens = Number(row.opens || 0);
  return {
    label: opens > 0 ? `${opens} popup open${opens === 1 ? "" : "s"}` : "Viewed in dashboard",
    detail: `Last used ${timeLabel}`
  };
}

function moduleBusinessJobProfile(mod) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "Module").trim();
  const byKey = {
    home: {
      job: "Run the day from one control view",
      outcome: "Priorities, pressure points, and next actions stay visible.",
      requiredAction: "Review the top priority cards before opening other modules."
    },
    owner_summary: {
      job: "Give the owner a fast business read",
      outcome: "The owner can decide what needs attention in under 2 minutes.",
      requiredAction: "Check the top 3 priorities and delegate one action."
    },
    command_center: {
      job: "Turn signals into actions",
      outcome: "The team gets a ranked action queue instead of guessing.",
      requiredAction: "Work from the first action card and clear blockers."
    },
    booking_ops: {
      job: "Manage bookings and booking statuses",
      outcome: "The diary stays accurate and clients get the right updates.",
      requiredAction: "Confirm pending bookings and resolve status changes."
    },
    calendar: {
      job: "Control the diary and daily schedule",
      outcome: "Appointments are visible, organized, and easy to adjust.",
      requiredAction: "Review today/tomorrow capacity and resolve clashes."
    },
    waitlist: {
      job: "Recover cancelled slots",
      outcome: "Empty gaps are turned into rebooked revenue opportunities.",
      requiredAction: "Contact the best-fit waitlist clients when a slot opens."
    },
    staff: {
      job: "Manage staff availability and rota cover",
      outcome: "Booking capacity reflects who is actually working.",
      requiredAction: "Confirm on-duty coverage for peak booking periods."
    },
    commercial: {
      job: "Control memberships, packages, and gift cards",
      outcome: "Recurring and prepaid revenue products stay usable and accurate.",
      requiredAction: "Keep offers active and balances/statuses up to date."
    },
    revenue: {
      job: "Track channel performance",
      outcome: "You can see which channels produce bookings and revenue.",
      requiredAction: "Review spend and adjust low-performing channels."
    },
    profitability: {
      job: "Protect margins",
      outcome: "Payroll, costs, and revenue can be reviewed together.",
      requiredAction: "Update payroll/cost inputs before reading profit signals."
    },
    accounting: {
      job: "Connect and reconcile finance systems",
      outcome: "Takings and exports are easier to reconcile accurately.",
      requiredAction: "Connect a provider or run an export/reconciliation check."
    },
    social: {
      job: "Keep social presence current",
      outcome: "Clients see up-to-date links and branding touchpoints.",
      requiredAction: "Add or review social links and profile media."
    },
    frontdesk: {
      job: "Polish the public-facing profile",
      outcome: "Clients get a clearer, more trustworthy booking experience.",
      requiredAction: "Review services, contact details, and profile presentation."
    },
    business_profile: {
      job: "Complete business setup",
      outcome: "The salon is ready for bookings with accurate core details.",
      requiredAction: "Finish contact details, services, and opening hours."
    },
    subscriber_copilot: {
      job: "Use Lexi for owner-side decisions",
      outcome: "You get fast guidance on bookings, ops, growth, and risks.",
      requiredAction: "Ask Lexi for the next best actions for today."
    },
    admin_copilot: {
      job: "Use Lexi for platform diagnostics",
      outcome: "Admin checks become faster with guided troubleshooting.",
      requiredAction: "Ask Lexi a specific diagnostics question."
    }
  };
  if (byKey[key]) return byKey[key];
  if (/lexi|copilot|chat/i.test(`${key} ${label}`)) {
    return {
      job: "Guide the user to the next action",
      outcome: "Questions turn into clear actions without leaving the workflow.",
      requiredAction: "Ask one focused question and apply the answer."
    };
  }
  if (/calendar|booking|waitlist|reschedule|operations/i.test(`${key} ${label}`)) {
    return {
      job: "Keep front-desk operations flowing",
      outcome: "Bookings and follow-up actions stay organized and current.",
      requiredAction: "Review exceptions first, then complete routine updates."
    };
  }
  if (/revenue|profit|account|cash|finance/i.test(`${key} ${label}`)) {
    return {
      job: "Turn numbers into decisions",
      outcome: "Finance signals are visible and easier to act on.",
      requiredAction: "Update missing inputs and review the latest summary."
    };
  }
  return {
    job: `Manage ${label}`,
    outcome: "This part of the business stays maintained and usable.",
    requiredAction: "Review the current status and complete the main action."
  };
}

function moduleOperationalStatus(mod) {
  const key = String(mod?.key || "").trim();
  const profileName = String(businessProfileName?.value || "").trim();
  const servicesCount = String(businessProfileServices?.value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const socialCount = [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput]
    .filter((input) => Boolean(String(input?.value || "").trim())).length;
  const bookingCount = Array.isArray(bookingRows) ? bookingRows.length : 0;
  const pendingBookings = Array.isArray(bookingRows)
    ? bookingRows.filter((row) => ["pending", "pending_confirmation", "awaiting_confirmation"].includes(String(row?.status || "").toLowerCase())).length
    : 0;
  const connectedAccounting = Array.isArray(accountingRows)
    ? accountingRows.filter((row) => String(row?.status || "").toLowerCase() === "connected" || row?.connected === true).length
    : 0;

  const ready = (label, note) => ({ label, note, tone: "good" });
  const attention = (label, note) => ({ label, note, tone: "attention" });
  const setup = (label, note) => ({ label, note, tone: "setup" });

  switch (key) {
    case "business_profile":
      return profileName && servicesCount > 0
        ? ready("Configured", `${servicesCount} services listed and profile details present.`)
        : setup("Needs Setup", "Add business details and services to improve booking conversion.");
    case "staff":
      return Array.isArray(staffRosterRows) && staffRosterRows.length
        ? ready("Live", `${staffRosterRows.length} staff records available for capacity planning.`)
        : setup("Needs Setup", "Add staff and rota coverage so booking capacity reflects reality.");
    case "waitlist":
      return Array.isArray(waitlistRows) && waitlistRows.length
        ? ready("Live", `${waitlistRows.length} waitlist entries are ready for slot recovery.`)
        : setup("Ready To Set Up", "Add waitlist clients so cancellations can be recovered quickly.");
    case "accounting":
      return connectedAccounting > 0
        ? ready("Connected", `${connectedAccounting} accounting integration${connectedAccounting === 1 ? "" : "s"} connected.`)
        : attention("Needs Connection", "Connect accounting to reduce manual reconciliation work.");
    case "commercial":
      return commercialPayload
        ? ready("Live", "Memberships/packages/gift cards are available in this module.")
        : setup("Needs Setup", "Create memberships, packages, or gift cards before selling them.");
    case "revenue":
      return revenueAttributionPayload
        ? ready("Live", `Revenue attribution is using ${bookingCount} booking${bookingCount === 1 ? "" : "s"} of context.`)
        : setup("Needs Data", "Add spend tracking to compare channels properly.");
    case "profitability":
      return profitabilityPayload
        ? ready("Live", "Profitability summary is available with current inputs.")
        : setup("Needs Inputs", "Add payroll and costs to make profit signals meaningful.");
    case "social":
      return socialCount > 0
        ? ready("Configured", `${socialCount} social link${socialCount === 1 ? "" : "s"} configured.`)
        : setup("Needs Setup", "Add social links and profile media for trust and discovery.");
    case "booking_ops":
      return pendingBookings > 0
        ? attention("Action Needed", `${pendingBookings} booking confirmation${pendingBookings === 1 ? "" : "s"} need attention.`)
        : ready("Live", `${bookingCount} booking${bookingCount === 1 ? "" : "s"} loaded.`);
    case "calendar":
      return ready("Live", `${bookingCount} booking${bookingCount === 1 ? "" : "s"} mapped to calendar context.`);
    case "subscriber_copilot":
    case "admin_copilot":
      return ready("Ready", "Lexi is available for guided actions and module help.");
    default:
      if (mod?.startHere) return ready("Start Here", "Use this first to decide what to work on next.");
      return ready("Available", "Module is ready to use.");
  }
}

function renderModuleStatusPill(status, options = {}) {
  const s = status || {};
  const compact = options.compact === true;
  const cls = s.tone === "good" ? "is-good" : s.tone === "attention" ? "is-attention" : s.tone === "setup" ? "is-setup" : "";
  return `<span class="module-card-status ${cls}${compact ? " is-compact" : ""}">${escapeHtml(String(s.label || "Available"))}</span>`;
}

function renderModulePurposeStrip(mod) {
  const job = moduleBusinessJobProfile(mod);
  const status = moduleOperationalStatus(mod);
  const usage = moduleUsageSummary(mod);
  return `
    <section class="module-purpose-strip" aria-label="Module purpose and status">
      <div class="module-purpose-grid">
        <article class="module-purpose-item">
          <p>Module Job</p>
          <strong>${escapeHtml(job.job)}</strong>
          <small>${escapeHtml(job.outcome)}</small>
        </article>
        <article class="module-purpose-item">
          <p>Status</p>
          <strong>${escapeHtml(status.label || "Available")}</strong>
          <small>${escapeHtml(status.note || "Module is ready to use.")}</small>
        </article>
        <article class="module-purpose-item">
          <p>Required Action</p>
          <strong>${escapeHtml(job.requiredAction)}</strong>
          <small>${escapeHtml(usage.detail || usage.label || "Use this module regularly to keep data current.")}</small>
        </article>
      </div>
    </section>
  `;
}

function modulePopupSnapshotItems(mod) {
  if (!mod) return [];
  const key = String(mod.key || "");
  const servicesCount = String(businessProfileServices?.value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const configuredSocialCount = [
    facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput
  ].filter((input) => Boolean(String(input?.value || "").trim())).length;
  const baseBookingCounts = {
    total: bookingRows.length,
    cancelled: bookingRows.filter((row) => String(row?.status || "").toLowerCase().includes("cancel")).length,
    upcoming: bookingRows.filter((row) => {
      const when = new Date(row?.startAt || row?.date || row?.appointmentAt || "");
      return Number.isFinite(when.getTime()) && when.getTime() >= Date.now();
    }).length
  };
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const statusText = (row) => String(row?.status || "").toLowerCase();
  const bookingDateValue = (row) => {
    const direct = new Date(row?.startAt || row?.appointmentAt || row?.date || "");
    if (Number.isFinite(direct.getTime())) return direct;
    const datePart = String(row?.date || "").trim();
    const timePart = String(row?.time || "00:00").slice(0, 5);
    const fallback = new Date(datePart ? `${datePart}T${timePart}:00` : "");
    return fallback;
  };
  const pendingConfirmationCount = bookingRows.filter((row) => {
    const status = statusText(row);
    return status === "pending" || status === "pending_confirmation" || status === "awaiting_confirmation";
  }).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = todayStart.getTime() + dayMs;
  const todayBookings = bookingRows.filter((row) => {
    const when = bookingDateValue(row).getTime();
    return Number.isFinite(when) && when >= todayStart.getTime() && when < todayEnd;
  });
  const thisMonthBusyDays = new Set(
    bookingRows
      .map((row) => bookingDateValue(row))
      .filter((date) => Number.isFinite(date.getTime()))
      .filter((date) => date.getMonth() === calendarCurrentMonth.getMonth() && date.getFullYear() === calendarCurrentMonth.getFullYear())
      .map((date) => date.toISOString().slice(0, 10))
  ).size;
  const rescheduleSignals = bookingRows.filter((row) => {
    const status = statusText(row);
    if (status.includes("resched") || status.includes("change")) return true;
    if (row?.rescheduledAt || row?.previousStartAt || row?.previousDate || row?.oldDate) return true;
    const createdTs = new Date(row?.createdAt || "").getTime();
    const updatedTs = new Date(row?.updatedAt || "").getTime();
    return Number.isFinite(createdTs) && Number.isFinite(updatedTs) && updatedTs - createdTs > 5 * 60 * 1000;
  }).length;
  const todayTakings = todayBookings
    .filter((row) => !statusText(row).includes("cancel"))
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const todayCompletedCount = todayBookings.filter((row) => statusText(row) === "completed").length;
  const todayPendingCount = todayBookings.filter((row) => {
    const status = statusText(row);
    return status === "pending" || status === "pending_confirmation" || status === "awaiting_confirmation";
  }).length;

  switch (key) {
    case "overview":
      return [
        `Visible KPI cards: ${metricsGrid?.children?.length ?? 0}`,
        `Bookings loaded: ${baseBookingCounts.total}`,
        `Current role: ${user.role || "unknown"}`
      ];
    case "subscription_plan":
      return [
        `Current plan: ${String(billingSummary?.planLabel || subscriptionCurrentPlanLabel?.textContent || "Subscriber").trim() || "Subscriber"}`,
        `Status: ${String(billingSummary?.status || "active").trim() || "active"}`,
        `${String(billingSummary?.currentPeriodEnd ? `Next renewal: ${formatDateShort(billingSummary.currentPeriodEnd)}` : "Next renewal: Not available yet")}`
      ];
    case "first_7_days_snapshot":
      {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const recent = bookingRows.filter((row) => {
          const ts = new Date(row.createdAt || `${row.date || ""}T${String(row.time || "00:00").slice(0, 5)}:00`).getTime();
          return Number.isFinite(ts) && ts >= sevenDaysAgo;
        });
        const bookings = recent.length;
        const completed = recent.filter((row) => String(row.status || "").toLowerCase() === "completed").length;
        const cancelled = recent.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
        const revenue = recent
          .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
          .reduce((sum, row) => sum + Number(row.price || 0), 0);
        const completionRate = bookings ? Math.round((completed / bookings) * 100) : 0;
        const cancelRate = bookings ? Math.round((cancelled / bookings) * 100) : 0;
        const avgTicket = completed > 0 ? revenue / completed : bookings > cancelled ? revenue / Math.max(1, bookings - cancelled) : 0;
        return [
          `Last 7 days: ${bookings} bookings ? ${completed} completed ? ${cancelled} cancelled`,
          `Rates: ${completionRate}% completion ? ${cancelRate}% cancellation`,
          `Revenue snapshot: ${formatMoney(revenue)} total ? Avg ticket ${formatMoney(avgTicket)}`
        ];
      }
    case "command_center":
      return [
        `Action cards loaded: ${commandCenterCards?.children?.length ?? 0}`,
        `Action queue items: ${commandCenterActions?.children?.length ?? 0}`,
        `Daily action status: ${String(commandCenterStatus?.textContent || "Waiting for today's activity").trim() || "Waiting for today's activity"}`
      ];
    case "business_profile":
      return [
        `Business name: ${String(businessProfileName?.value || "Not set yet").trim() || "Not set yet"}`,
        `Services listed: ${servicesCount}`,
        `Hours configured: ${[
          businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday
        ].filter((input) => Boolean(String(input?.value || "").trim())).length}/7 days`
      ];
    case "booking_ops":
      return [
        `Bookings loaded: ${baseBookingCounts.total}`,
        `Pending confirmations: ${pendingConfirmationCount} ? Cancelled: ${baseBookingCounts.cancelled}`,
        `Active date filter: ${bookingDateFilterLabel || "All dates"}`
      ];
    case "reschedules_changes":
      return [
        `Reschedule/change signals: ${rescheduleSignals}`,
        `Pending confirmations needing review: ${pendingConfirmationCount}`,
        `Use Booking Operations popup actions to review and update changed appointments`
      ];
    case "calendar":
      return [
        `Viewing month: ${String(calendarMonthLabel?.textContent || "Current month").trim()}`,
        `Busy days this month: ${thisMonthBusyDays}`,
        `Selected day: ${selectedCalendarDateKey || "None"} ? Bookings mapped: ${baseBookingCounts.total}`
      ];
    case "accounting":
      return [
        `Accounting connections: ${accountingRows.length}`,
        `Live accounting feed: ${accountingLivePayload ? "Live" : "Waiting for data"}`,
        `Current timeframe: ${String(accountingLiveTimeframe || "today").toUpperCase()}`
      ];
    case "staff":
      return [
        `Staff records: ${staffRosterRows.length}`,
        `Team summary: ${staffSummary ? "Live" : "Waiting for team data"}`,
        `Capacity planning source: ${baseBookingCounts.upcoming} upcoming bookings`
      ];
    case "waitlist":
      return [
        `Waitlist entries: ${waitlistRows.length}`,
        `Waitlist summary: ${waitlistSummary ? "Live" : "Waiting for entries"}`,
        `Recovery opportunity cue: ${baseBookingCounts.cancelled} cancellations in loaded bookings`
      ];
    case "daily_takings":
      return [
        `Today bookings in diary: ${todayBookings.length}`,
        `Today takings snapshot: ${formatMoney(todayTakings)} ? Completed: ${todayCompletedCount}`,
        `Awaiting confirmation today: ${todayPendingCount}`
      ];
    case "operations":
      return [
        `No-show & rebooking view: ${operationsInsights ? "Live" : "Waiting for booking patterns"}`,
        `At-risk workflow support: Enabled`,
        `Booking base for risk checks: ${baseBookingCounts.total} loaded`
      ];
    case "crm":
      return [
        `Client segments: ${crmSegmentsPayload ? "Live" : "Waiting for data"}`,
        `Campaign planning source: ${baseBookingCounts.total} bookings`,
        `Reactivation support: Available`
      ];
    case "commercial":
      return [
        `Memberships & packages: ${commercialPayload ? "Live" : "Waiting for setup"}`,
        `Subscription summary: ${billingSummary ? "Live" : "Waiting for billing data"}`,
        `Recurring income tools: Available`
      ];
    case "revenue":
      return [
        `Revenue channel tracking: ${revenueAttributionPayload ? "Live" : "Waiting for tracked data"}`,
        `Bookings contributing to revenue view: ${baseBookingCounts.total}`,
        `Channel ROI analysis: Available`
      ];
    case "profitability":
      return [
        `Profit model: ${profitabilityPayload ? "Live" : "Waiting for costs and payroll"}`,
        `Payroll & cost review: Available`,
        `Margin planning view: Available`
      ];
    case "social":
      return [
        `Configured social links: ${configuredSocialCount}`,
        `Profile visibility support: Active`,
        `Brand tools: Available`
      ];
    case "frontdesk":
      return [
        `Front desk profile name: ${String(businessProfileName?.value || "Not set").trim() || "Not set"}`,
        `Social links connected: ${configuredSocialCount}`,
        `Public-facing profile controls: Available`
      ];
    case "subscriber_copilot":
      return [
        `Copilot scope: Salon day-to-day support only`,
        `Booking summary source: ${baseBookingCounts.total} loaded bookings`,
        `Privacy mode: Sanitized summaries only`
      ];
    case "admin_copilot":
      return [
        `Copilot scope: Platform checks + subscriber support`,
        `Privacy mode: Sanitized summaries only`,
        `Suggested fixes: On (read-only guidance)`
      ];
    default:
      return [
        `Module role: ${user.role || "unknown"}`,
        `Loaded bookings context: ${baseBookingCounts.total}`,
        `Open this module for full controls and details`
      ];
  }
}

function isPinnedBusinessModule(mod) {
  if (!mod || !mod.key) return false;
  if (!(user.role === "subscriber" || user.role === "admin")) return false;
  const key = String(mod.key || "");
  if (key === "calendar") return true;
  if (user.role === "subscriber" && key === "subscriber_copilot") return true;
  if (user.role === "admin" && key === "admin_copilot") return true;
  return false;
}

function moduleOperatorBlueprint(mod) {
  if (!mod) return null;
  const key = String(mod.key || "").trim();
  const roleArea = user.role === "admin" ? "admin" : user.role === "subscriber" ? "subscriber" : "customer";
  const shared = {
    confidence: roleArea === "customer" ? 88 : 94,
    modeLabel: roleArea === "customer" ? "Guided assist" : "Autopilot assist",
    modeSummary: roleArea === "customer"
      ? "Keeps booking steps simple and only shows what you need next."
      : "Surfaces exceptions first, recommends actions, and keeps routine work lightweight.",
    focus: "Review this area and take the next best action.",
    impact: "Keeps the day moving with fewer manual checks.",
    nextSteps: [
      "Review the AI summary before making changes.",
      "Use one-tap actions for the most common routine tasks.",
      "Open the full module only when you need detailed controls."
    ],
    quickActions: []
  };

  const byKey = {
    opening_closing_checklist: {
      focus: "Run opening or closing routines with exception-only prompts.",
      impact: "Reduces missed setup/close tasks and improves handover consistency.",
      nextSteps: [
        "Run Opening Setup and review only flagged issues.",
        "Confirm staffing/diary readiness for the day.",
        "Log close-of-day checks when trade finishes."
      ],
      quickActions: [
        { id: "simulate_opening", label: "Run Opening Setup", variant: "primary" },
        { id: "simulate_closing", label: "Run Closing Routine", variant: "ghost" }
      ]
    },
    service_recovery_playbook: {
      focus: "Handle issues quickly with AI-guided recovery steps and follow-up prompts.",
      impact: "Protects reviews and retention when appointments go wrong.",
      nextSteps: [
        "Triage the issue severity and choose a response path.",
        "Generate a recovery offer or follow-up message.",
        "Track outcome and rebooking opportunity."
      ],
      quickActions: [
        { id: "draft_recovery_message", label: "Draft Recovery Message", variant: "primary" },
        { id: "copy_playbook", label: "Copy Playbook Steps", variant: "ghost" }
      ]
    },
    reviews_reputation: {
      focus: "Prioritize reviews needing replies and maintain response consistency.",
      impact: "Improves trust signals and conversion from profile views.",
      nextSteps: [
        "Review urgent/negative feedback first.",
        "Draft response in your preferred tone.",
        "Queue review requests for happy clients."
      ],
      quickActions: [
        { id: "draft_review_response", label: "Draft Reply", variant: "primary" },
        { id: "queue_review_requests", label: "Queue Requests", variant: "ghost" }
      ]
    },
    referrals_partnerships: {
      focus: "Set up repeatable referral and local partner campaigns with minimal admin.",
      impact: "Adds growth channels without relying only on paid traffic.",
      nextSteps: [
        "Pick a referral offer structure.",
        "Select local partner targets.",
        "Track weekly outreach and conversions."
      ],
      quickActions: [
        { id: "generate_referral_offer", label: "Generate Referral Offer", variant: "primary" },
        { id: "open_related_module", label: "Open Growth Module", variant: "ghost", moduleKey: "crm" }
      ]
    },
    cashflow_forecast: {
      focus: "Predict short-term cash pressure and show actions before it becomes urgent.",
      impact: "Improves planning and reduces reactive spending decisions.",
      nextSteps: [
        "Review next 7-30 day takings and outgoings assumptions.",
        "Flag payroll or cost-pressure dates.",
        "Plan mitigation actions before the pressure date."
      ],
      quickActions: [
        { id: "simulate_forecast", label: "Run Forecast", variant: "primary" },
        { id: "open_related_module", label: "Open Finance Targets", variant: "ghost", moduleKey: "finance_targets" }
      ]
    },
    payout_reconciliation: {
      focus: "Compare expected takings with provider payouts and highlight mismatches.",
      impact: "Catches payout/export issues earlier and speeds up reconciliation.",
      nextSteps: [
        "Run payout mismatch check.",
        "Review flagged rows and reconcile notes.",
        "Export or mark reviewed."
      ],
      quickActions: [
        { id: "simulate_reconcile", label: "Run Reconciliation Check", variant: "primary" },
        { id: "open_related_module", label: "Open Accounting", variant: "ghost", moduleKey: "accounting" }
      ]
    }
  };

  const roleDefaults = roleArea === "customer"
    ? {
        confidence: 86,
        modeLabel: "Guided booking",
        modeSummary: "Minimal prompts and next steps so booking stays simple.",
        focus: "Show the next step needed to complete a booking or check details.",
        impact: "Reduces friction and keeps the customer flow fast.",
        nextSteps: ["Check the summary.", "Open the tool.", "Complete the task."],
        quickActions: [{ id: "open_module", label: "Open Tool", variant: "primary" }]
      }
    : {
        quickActions: [
          { id: "simulate_ai_run", label: "Run AI Routine", variant: "primary" },
          { id: "open_module", label: "Open Working View", variant: "ghost" }
        ]
      };

  const merged = {
    ...shared,
    ...roleDefaults,
    ...(byKey[key] || {}),
    quickActions: (byKey[key]?.quickActions && byKey[key].quickActions.length)
      ? byKey[key].quickActions
      : (roleDefaults.quickActions || shared.quickActions)
  };
  return merged;
}

function moduleOpsCategoryLabel(mod) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "").trim();
  const haystack = `${key} ${label}`;
  if (/account|revenue|profit|cash|payout|finance|payroll|takings/i.test(haystack)) return "Finance Ops";
  if (/crm|review|referral|growth|social|commercial|membership|package|retention/i.test(haystack)) return "Growth Ops";
  if (/staff|rota|capacity/i.test(haystack)) return "Team Ops";
  if (/booking|calendar|waitlist|reschedule|frontdesk|operations/i.test(haystack)) return "Front Desk Ops";
  return "Business Ops";
}

function moduleLexiNarrativeProfile(mod, blueprint, snapshots = []) {
  const key = String(mod?.key || "").trim();
  const label = String(mod?.label || "this module").trim();
  const firstSignal = snapshots[0] || "";
  const focus = String(blueprint?.focus || "").trim();
  const nextSteps = Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps.filter(Boolean) : [];

  const fallback = {
    roleSummary: String(mod?.navSummary || mod?.howItWorks || `Supports ${label} workflows for the business.`).trim(),
    impactSummary: String(mod?.howItHelps || `Helps the business run ${label} with less manual admin and clearer decisions.`).trim(),
    lexiNow: [
      focus ? `Lexi is prioritizing: ${focus}` : `Lexi is monitoring ${label} for risks and opportunities.`,
      `Lexi is checking live signals, exceptions, and changes before recommending actions.`,
      nextSteps[0] ? `Lexi is preparing your next move: ${nextSteps[0]}` : `Lexi is preparing your next best actions for this module.`
    ],
    askPrompt: `Review my ${label} module and give me the best next actions, risks, and quick wins for today.`
  };

  switch (key) {
    case "home":
    case "owner_summary":
      return {
        roleSummary: "This is the leadership control view for the day. It combines priorities, revenue pressure, booking load, and operational signals so you can decide what matters first.",
        impactSummary: "It reduces decision fatigue by surfacing the most urgent business actions before you jump into individual modules.",
        lexiNow: [
          "Lexi is ranking today’s priorities across bookings, staffing, and revenue pressure.",
          "Lexi is watching for exceptions that could disrupt trade (gaps, overbooked periods, no-show risk, pending confirmations).",
          "Lexi is preparing a practical action sequence for the next 1-3 hours."
        ],
        askPrompt: "Review my Home/Owner Summary and tell me the top priorities for today, what to do first, and what can wait."
      };
    case "command_center":
      return {
        roleSummary: "Command Center is your action queue. It turns dashboard signals into operational tasks the team can execute quickly.",
        impactSummary: "It helps the front desk and managers move faster by converting data into a clear list of what to do next.",
        lexiNow: [
          "Lexi is sorting today’s action queue by urgency and business impact.",
          "Lexi is checking upcoming pressure points in the next 7 days so you can act before they become problems.",
          "Lexi is drafting one-tap routines for routine tasks and leaving exceptions for human decisions."
        ],
        askPrompt: "Review Command Center and give me a prioritized action list for today and this week."
      };
    case "booking_ops":
      return {
        roleSummary: "Booking Operations is the front-desk control module for appointment management, status updates, and booking changes.",
        impactSummary: "It protects diary accuracy, reduces admin time, and keeps customer communication and booking status aligned.",
        lexiNow: [
          "Lexi is checking pending confirmations, cancellations, and status mismatches in the booking list.",
          "Lexi is identifying booking changes that need fast action to protect diary flow and revenue.",
          "Lexi is preparing the next best booking-admin actions for your team."
        ],
        askPrompt: "Review Booking Operations and tell me what bookings need attention first, including pending confirmations and risky changes."
      };
    case "reschedules_changes":
      return {
        roleSummary: "Reschedules & Changes is a focused lens on moved, edited, and updated appointments so the team can process changes without scanning the full diary.",
        impactSummary: "It reduces front-desk friction during busy periods and helps prevent missed changes or client miscommunication.",
        lexiNow: [
          "Lexi is filtering for changed appointments and reschedule signals that need review.",
          "Lexi is checking whether moved bookings create gaps, overlaps, or staffing pressure.",
          "Lexi is preparing follow-up actions to confirm updates and stabilize the diary."
        ],
        askPrompt: "Review Reschedules and Changes and tell me which moved bookings need follow-up or diary adjustments."
      };
    case "calendar":
      return {
        roleSummary: "Calendar is the diary planning view. It shows demand patterns across days so you can spot pressure, gaps, and staffing needs early.",
        impactSummary: "It helps the business plan ahead, protect service quality, and improve schedule efficiency across the week and month.",
        lexiNow: [
          "Lexi is scanning the diary for busy days, open gaps, and uneven load across the month.",
          "Lexi is checking selected-day pressure against available team capacity.",
          "Lexi is preparing planning suggestions for cover, gap recovery, and front-desk prep."
        ],
        askPrompt: "Review my Calendar and tell me where I have pressure, gaps, and planning opportunities this week."
      };
    case "staff":
    case "capacity_planner":
      return {
        roleSummary: key === "capacity_planner"
          ? "Capacity Planner focuses on matching team cover to booking demand so the diary can absorb busy periods without overloading the team."
          : "Staff and Capacity manages team availability, rota visibility, and cover planning against booking demand.",
        impactSummary: "It improves service delivery by balancing demand with available staff and reducing overbooking or underused hours.",
        lexiNow: [
          "Lexi is comparing booking load to team coverage for the selected dates.",
          "Lexi is flagging capacity pressure, idle gaps, and rota mismatch risks.",
          "Lexi is preparing staffing and scheduling recommendations to protect the day."
        ],
        askPrompt: "Review staff coverage and capacity, then tell me what rota or scheduling changes would improve the diary."
      };
    case "waitlist":
      return {
        roleSummary: "Waitlist is the slot-recovery module. It turns cancellations and gaps into rebooking opportunities using ready-to-contact clients.",
        impactSummary: "It helps protect revenue and utilization by filling empty chair time faster.",
        lexiNow: [
          "Lexi is matching cancellations and gaps to waitlist demand by service and timing.",
          "Lexi is ranking the best recovery opportunities based on likely conversion and fit.",
          "Lexi is preparing outreach prompts and recovery actions for the front desk."
        ],
        askPrompt: "Review the waitlist and tell me which gaps I can backfill first to recover revenue."
      };
    case "operations":
      return {
        roleSummary: "No-Show & Rebooking focuses on attendance risk, missed appointments, and rebooking recovery workflows.",
        impactSummary: "It helps reduce revenue leakage by catching patterns early and improving rebooking follow-through.",
        lexiNow: [
          "Lexi is tracking no-show and cancellation patterns that affect diary reliability.",
          "Lexi is surfacing rebooking opportunities and recovery prompts for at-risk clients.",
          "Lexi is preparing actions to reduce repeat no-show impact."
        ],
        askPrompt: "Review no-show and rebooking risks and tell me the best recovery actions for today."
      };
    case "accounting":
    case "daily_takings":
      return {
        roleSummary: key === "daily_takings"
          ? "Daily Takings is the cashflow check for today’s trading activity, giving a fast view of money movement without opening full reports."
          : "Accounting manages finance feeds, exports, and reconciliation-ready revenue activity for bookkeeping and owner review.",
        impactSummary: "It improves financial visibility by keeping takings, exports, and finance checks accessible during daily operations.",
        lexiNow: [
          key === "daily_takings"
            ? "Lexi is checking today’s completed bookings, cancellations, and pending confirmations against takings."
            : "Lexi is checking connected finance feeds and export/reconciliation readiness.",
          "Lexi is looking for anomalies, missing data, or timing gaps that may affect finance accuracy.",
          "Lexi is preparing the next finance checks and a clean summary for the owner."
        ],
        askPrompt: key === "daily_takings"
          ? "Review Daily Takings and tell me today’s revenue picture, risks, and any finance follow-ups I should do."
          : "Review Accounting and tell me what is live, what needs reconciliation, and what finance tasks I should do next."
      };
    case "revenue":
    case "finance_targets":
    case "profitability":
    case "cashflow_forecast":
    case "payout_reconciliation":
      return {
        roleSummary:
          key === "revenue" ? "Revenue Attribution shows which channels and activities are driving bookings and income." :
          key === "finance_targets" ? "Finance Targets turns revenue and cost goals into a measurable business plan for the team." :
          key === "profitability" ? "Profitability & Payroll balances takings, costs, and payroll to protect margin." :
          key === "cashflow_forecast" ? "Cashflow Forecast predicts short-term pressure dates and helps plan mitigations before they become urgent." :
          "Payout Reconciliation compares expected takings and provider payouts to catch mismatches quickly.",
        impactSummary:
          key === "revenue" ? "It helps the business spend and market smarter by showing what actually converts into revenue." :
          key === "finance_targets" ? "It keeps the business focused on measurable weekly and monthly targets instead of reactive decisions." :
          key === "profitability" ? "It helps protect margin by making payroll and cost pressure visible before profit slips." :
          key === "cashflow_forecast" ? "It improves confidence in short-term planning by showing likely pressure points and response options." :
          "It reduces finance admin and payout errors by making mismatches visible early.",
        lexiNow: [
          key === "revenue"
            ? "Lexi is checking channel contribution, booking volume, and ROI signals."
            : key === "finance_targets"
              ? "Lexi is checking progress against targets and highlighting gaps to target."
              : key === "profitability"
                ? "Lexi is checking margin pressure from payroll, costs, and booking mix."
                : key === "cashflow_forecast"
                  ? "Lexi is modelling short-term cash pressure dates and assumptions."
                  : "Lexi is scanning payout records for mismatch patterns and reconciliation exceptions.",
          "Lexi is isolating the biggest drivers affecting finance performance right now.",
          "Lexi is preparing recommended actions to improve control, margin, or cash confidence."
        ],
        askPrompt: `Review ${label} and give me the most important finance actions, risks, and opportunities right now.`
      };
    case "crm":
    case "client_retention":
    case "commercial":
    case "offers_packages":
    case "reviews_reputation":
    case "referrals_partnerships":
    case "social":
      return {
        roleSummary:
          key === "crm" ? "CRM & Campaigns manages client segments, follow-ups, and outreach planning to drive repeat bookings." :
          key === "client_retention" ? "Client Retention focuses on keeping clients coming back through reactivation and repeat-booking strategies." :
          key === "commercial" ? "Memberships & Packages manages recurring revenue offers, bundles, and client-value products." :
          key === "offers_packages" ? "Offers & Packages focuses on promotional structures and package design to increase bookings and spend." :
          key === "reviews_reputation" ? "Reviews & Reputation manages review responses, brand tone, and trust-building follow-up." :
          key === "referrals_partnerships" ? "Referrals & Partnerships drives local growth through referrals, partnerships, and repeatable offers." :
          "Social & Brand helps keep your public profile and channels consistent with the salon experience.",
        impactSummary:
          key === "crm" ? "It improves repeat bookings by turning client data into targeted, timely follow-up actions." :
          key === "client_retention" ? "It protects lifetime value by catching churn risk and creating rebooking opportunities." :
          key === "commercial" ? "It increases recurring and prepaid revenue through structured offers clients can understand easily." :
          key === "offers_packages" ? "It helps fill gaps and increase ticket value with stronger package and offer planning." :
          key === "reviews_reputation" ? "It improves trust and conversion by keeping responses fast, calm, and consistent." :
          key === "referrals_partnerships" ? "It adds new client growth channels without relying only on ads." :
          "It supports better conversion by keeping brand visibility and profile presentation polished.",
        lexiNow: [
          key === "reviews_reputation"
            ? "Lexi is prioritizing review replies and drafting responses in your brand tone."
            : key === "social"
              ? "Lexi is checking brand/profile completeness and social link readiness."
              : "Lexi is checking growth signals, client behavior patterns, and offer opportunities.",
          key === "client_retention"
            ? "Lexi is identifying at-risk clients and likely rebooking prompts."
            : key === "commercial" || key === "offers_packages"
              ? "Lexi is comparing offers/packages against booking gaps and spend opportunities."
              : "Lexi is identifying the highest-impact outreach or growth actions to run next.",
          "Lexi is preparing a practical campaign, response, or offer action plan for the team."
        ],
        askPrompt: `Review ${label} and tell me the best growth/retention actions Lexi should run next for this business.`
      };
    case "business_profile":
    case "frontdesk":
    case "business_growth_status":
    case "first_7_days_snapshot":
    case "subscription_plan":
      return {
        roleSummary:
          key === "business_profile" ? "Business Profile is the source of truth for salon details, services, opening hours, and booking-facing information." :
          key === "frontdesk" ? "Front Desk Profile shows how the business appears to clients and supports a polished booking experience." :
          key === "business_growth_status" ? "Business Growth Status combines setup, billing, and early performance into a single progress view." :
          key === "first_7_days_snapshot" ? "First 7 Days Snapshot tracks early booking and revenue momentum so you can spot startup issues quickly." :
          "Live Subscription Plan manages plan status, billing state, and renewal timing for the account.",
        impactSummary:
          key === "business_profile" ? "It improves booking accuracy and trust by keeping customer-facing business details correct." :
          key === "frontdesk" ? "It increases conversion confidence by showing a cleaner, more complete customer-facing experience." :
          key === "business_growth_status" ? "It keeps setup and commercial readiness visible so the business reaches a stable go-live faster." :
          key === "first_7_days_snapshot" ? "It helps owners measure momentum and respond early to cancellations or weak conversion." :
          "It prevents billing surprises and keeps subscription decisions easy to manage.",
        lexiNow: [
          key === "business_profile"
            ? "Lexi is checking profile completeness, service clarity, and booking-facing details."
            : key === "frontdesk"
              ? "Lexi is reviewing customer-facing presentation, trust details, and service visibility."
              : key === "subscription_plan"
                ? "Lexi is checking billing status, plan details, and renewal timing."
                : "Lexi is checking progress signals and setup/commercial readiness.",
          firstSignal ? `Lexi is using current module signals: ${firstSignal}` : "Lexi is using live module data and setup signals to prioritize improvements.",
          "Lexi is preparing the next improvements that will most improve readiness, trust, or momentum."
        ],
        askPrompt: `Review ${label} and tell me what to improve first to strengthen setup, trust, and business performance.`
      };
    case "opening_closing_checklist":
      return {
        roleSummary: "Opening & Closing Checklist runs repeatable startup and shutdown routines with AI prioritization so key tasks aren’t missed.",
        impactSummary: "It improves consistency, handover quality, and operational readiness across busy salon days.",
        lexiNow: [
          "Lexi is checking today’s opening/closing readiness using bookings, staffing, and exception signals.",
          "Lexi is auto-completing safe routine checks and leaving risk items for review.",
          "Lexi is prioritizing exceptions so the team handles the highest-impact issues first."
        ],
        askPrompt: "Review Opening and Closing Checklist readiness and tell me what should be handled first today."
      };
    case "service_recovery_playbook":
      return {
        roleSummary: "Service Recovery Playbook helps the team respond quickly to problems with AI-guided recovery messaging and rebooking options.",
        impactSummary: "It protects reviews, trust, and future revenue by handling service issues professionally and consistently.",
        lexiNow: [
          "Lexi is triaging service issues and prioritizing the most urgent recovery cases.",
          "Lexi is drafting recovery responses and rebooking options that match the issue severity.",
          "Lexi is tracking follow-up actions to improve outcomes and retention."
        ],
        askPrompt: "Review the Service Recovery Playbook and tell me which recovery cases need action first and what Lexi should send."
      };
    default:
      return fallback;
  }
}

function moduleLexiAssistQuestion(mod, blueprint) {
  if (!mod) return "Review this module and tell me the best next actions.";
  const snapshots = modulePopupSnapshotItems(mod).filter(Boolean).slice(0, 2);
  const custom = moduleLexiNarrativeProfile(mod, blueprint, snapshots);
  if (custom?.askPrompt) return String(custom.askPrompt).trim();
  const focus = String(blueprint?.focus || "").trim();
  const nextStep = String(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps[0] || "" : "").trim();
  const parts = [
    `Review my ${mod.label} module for today.`,
    focus ? `Focus on: ${focus}` : "",
    snapshots.length ? `Current signals: ${snapshots.join(" ? ")}` : "",
    nextStep ? `Give me the best next actions and quick wins, starting with: ${nextStep}` : "Give me the best next actions and quick wins."
  ].filter(Boolean);
  return parts.join(" ");
}

function buildModuleLexiBriefModel(mod, blueprint) {
  if (!mod) return null;
  const snapshots = modulePopupSnapshotItems(mod).filter(Boolean).slice(0, 4);
  const customNarrative = moduleLexiNarrativeProfile(mod, blueprint, snapshots);
  const category = moduleOpsCategoryLabel(mod);
  const autoPrefs = loadHubAutoRoutinePrefs();
  const key = String(mod.key || "").trim();
  const monitorOn = autoPrefs[`${key}:monitor`] !== false;
  const prepOn = autoPrefs[`${key}:prep`] === true;
  const reportOn = autoPrefs[`${key}:report`] !== false;
  const features = Array.isArray(mod.features) ? mod.features.filter(Boolean).slice(0, 3) : [];
  const nextSteps = Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps.filter(Boolean).slice(0, 3) : [];
  const roleSummary = String(customNarrative?.roleSummary || mod.navSummary || mod.howItWorks || mod.howItHelps || "Supports a key part of day-to-day salon operations.").trim();
  const impactSummary = String(customNarrative?.impactSummary || mod.howItHelps || "Helps the business run more consistently with less manual admin.").trim();
  const statusTone = snapshots.some((line) => /waiting|not set|none|unavailable/i.test(line))
    ? "attention"
    : snapshots.length
      ? "active"
      : "baseline";
  const statusLabel = statusTone === "attention"
    ? "Needs setup / review"
    : statusTone === "active"
      ? "Live and contributing"
      : "Ready to activate";
  return {
    category,
    roleSummary,
    impactSummary,
    statusTone,
    statusLabel,
    snapshots,
    features,
    nextSteps,
    lexiNow: [
      ...(Array.isArray(customNarrative?.lexiNow) && customNarrative.lexiNow.length
        ? customNarrative.lexiNow.slice(0, 1)
        : [blueprint?.focus ? `Priority focus: ${blueprint.focus}` : `Priority focus: Keep ${mod.label} moving with exception-first review.`]),
      `Automation: Monitor ${monitorOn ? "On" : "Off"} ? Prep ${prepOn ? "On" : "Off"} ? Report ${reportOn ? "On" : "Off"}`,
      ...(Array.isArray(customNarrative?.lexiNow) && customNarrative.lexiNow.length > 1
        ? customNarrative.lexiNow.slice(1, 3)
        : [nextSteps[0] ? `Next task: ${nextSteps[0]}` : `Next task: Open the workspace and complete the highest-impact action first.`])
    ].filter(Boolean).slice(0, 3),
    cadence: String(mod.cadence || "Use daily").trim(),
    confidence: Number(blueprint?.confidence || 90),
    modeLabel: String(blueprint?.modeLabel || "AI assist").trim()
  };
}

function renderModuleLexiBriefPanel(mod, blueprint, options = {}) {
  if (!mod || !(user.role === "subscriber" || user.role === "admin")) return "";
  const brief = buildModuleLexiBriefModel(mod, blueprint || moduleOperatorBlueprint(mod));
  if (!brief) return "";
  const compact = options.compact === true;
  const askLabel = "Ask Lexi";
  const statusClass = brief.statusTone === "attention" ? "is-attention" : brief.statusTone === "active" ? "is-active" : "is-baseline";
  const roleItems = [
    ["Unique Role", brief.roleSummary],
    ["Business Value", brief.impactSummary],
    ["Cadence", `${brief.cadence} • ${brief.category}`]
  ];
  const liveItems = brief.snapshots.length
    ? brief.snapshots.map((line, index) => [`Live Signal ${index + 1}`, line])
    : [["Live Signal", "No live metrics loaded yet. Lexi will use setup data and defaults until activity appears."]];
  const lexiItems = brief.lexiNow.map((line, index) => [index === 0 ? "Now" : index === 1 ? "Automation" : "Next", line]);
  return `
    <section class="module-lexi-brief${compact ? " is-compact" : ""}" aria-label="Lexi module brief">
      <div class="module-lexi-brief-head">
        <div>
          <p class="module-lexi-kicker">Lexi ? ${escapeHtml(compact ? "Module Assist" : "Business Module Brief")}</p>
          <h4>${escapeHtml(mod.label)}</h4>
          <p>${escapeHtml(compact
            ? "Lexi is embedded in this module so you can get fast guidance, AI routines, and focused next steps without leaving the popup."
            : "This module has a unique business role. Lexi explains what it is doing now, how it helps the business, and what to do next.")}</p>
        </div>
        <div class="module-lexi-status-stack">
          <span class="module-lexi-status-pill ${statusClass}">${escapeHtml(brief.statusLabel)}</span>
          <span class="module-chip muted">${escapeHtml(brief.confidence)}% • ${escapeHtml(brief.modeLabel)}</span>
        </div>
      </div>
      <div class="module-lexi-brief-grid">
        <section class="module-lexi-brief-card">
          <h5>Module Role</h5>
          <ul class="module-lexi-brief-list">
            ${roleItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-lexi-brief-card">
          <h5>Current Business Impact</h5>
          <ul class="module-lexi-brief-list">
            ${liveItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-lexi-brief-card">
          <h5>What Lexi Is Working On</h5>
          <ul class="module-lexi-brief-list">
            ${lexiItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
      </div>
      <div class="module-lexi-brief-actions">
        <button type="button" class="btn module-lexi-assist-btn" data-lexi-module-assist="1">${escapeHtml(askLabel)}</button>
      </div>
      ${!compact && brief.features.length ? `
      <div class="module-lexi-brief-foot">
        <strong>Module strengths:</strong>
        <span>${brief.features.map((feature) => escapeHtml(feature)).join(" • ")}</span>
      </div>` : ""}
    </section>
  `;
}

function openLexiModuleAssist(mod, options = {}) {
  if (!mod || !(user.role === "subscriber" || user.role === "admin")) return;
  const role = user.role === "admin" ? "admin" : "subscriber";
  const blueprint = options.blueprint || moduleOperatorBlueprint(mod);
  const refs = copilotPopupRefs(role);
  const suggested = String(options.question || moduleLexiAssistQuestion(mod, blueprint)).trim();
  if (refs.input) {
    refs.input.value = "";
    refs.input.placeholder = `Ask Lexi about ${mod.label}...`;
    refs.input.setAttribute("data-lexi-suggested-question", suggested);
  }
  openBusinessAiChatPopup(role, { trigger: options.trigger, focusInput: true });
  resetCopilotChat(role, "Hi, what can I help you with?");
  setDashActionStatus(`Lexi chat opened for ${mod.label}. Close Lexi to return to this module popup.`);
}

async function runModuleOperatorAction(actionId, mod, options = {}) {
  const action = String(actionId || "").trim();
  if (!action || !mod) return;
  const blueprint = options.blueprint || moduleOperatorBlueprint(mod);
  const label = mod.label || "Module";

  if (action === "open_module") {
    setWorkspaceBackButtonVisible(mod.key !== "home");
    focusModuleByKey(mod.key);
    options.close?.();
    return;
  }
  if (action === "open_related_module") {
    const targetKey = String(options.moduleKey || "").trim() || "home";
    setWorkspaceBackButtonVisible(targetKey !== "home");
    focusModuleByKey(targetKey);
    options.close?.();
    return;
  }

  const cannedMessages = {
    simulate_ai_run: `${label}: AI routine prepared a prioritized action plan and flagged only exceptions.`,
    simulate_opening: `${label}: Opening setup run completed. Team readiness, bookings, and priority checks are ready.`,
    simulate_closing: `${label}: Closing routine staged. Cash-up, diary review, and handover reminders prepared.`,
    draft_recovery_message: `${label}: Recovery message drafted with apology, rebooking option, and follow-up note.`,
    copy_playbook: `${label}: Recovery playbook copied for quick use.`,
    draft_review_response: `${label}: Review response drafted in a calm, professional tone.`,
    queue_review_requests: `${label}: Review request queue prepared for completed happy clients.`,
    generate_referral_offer: `${label}: Referral offer draft generated with local-partner variant.`,
    simulate_forecast: `${label}: Forecast run complete. Short-term pressure dates and actions highlighted.`,
    simulate_reconcile: `${label}: Reconciliation scan complete. Mismatch checks and review points prepared.`
  };

  if (action === "copy_playbook") {
    const text = [
      `${label} - AI Playbook`,
      ...(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps : []),
      "",
      `Focus: ${blueprint?.focus || ""}`,
      `Impact: ${blueprint?.impact || ""}`
    ].join("\n");
    const copied = await writeToClipboard(text);
    showManageToast(copied ? "Playbook copied." : "Clipboard unavailable.", copied ? undefined : "error");
    setDashActionStatus(copied ? "Playbook copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
    return;
  }

  const msg = cannedMessages[action] || `${label}: AI assistant prepared the next best actions for this workflow.`;
  setDashActionStatus(msg);
  showManageToast(msg.length > 96 ? `${label}: AI routine ready.` : msg);
}

function loadOpenCloseChecklistState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OPEN_CLOSE_CHECKLIST_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOpenCloseChecklistState(state) {
  try {
    localStorage.setItem(OPEN_CLOSE_CHECKLIST_STORAGE_KEY, JSON.stringify(state || {}));
  } catch {
    // ignore storage failures
  }
}

function openingClosingChecklistModel() {
  const todayKey = todayDateKeyLocal();
  const bookingsToday = bookingRows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === todayKey : false;
  });
  const todayCancelled = bookingsToday.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
  const todayCompleted = bookingsToday.filter((row) => String(row?.status || "").toLowerCase() === "completed").length;
  const todayPending = bookingsToday.length - todayCompleted - todayCancelled;
  const workingToday = getStaffWorkingForDate(new Date());
  const noShowRisks = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
  const rebookingPrompts = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts.length : 0;
  const connectedAccounting = (Array.isArray(accountingRows) ? accountingRows : []).filter((row) => row?.connected || row?.status === "connected").length;
  const waitlistCount = Array.isArray(waitlistRows) ? waitlistRows.length : 0;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const workingTomorrow = getStaffWorkingForDate(tomorrow);
  const tomorrowKey = toDateKey(tomorrow);
  const tomorrowBookings = bookingRows.filter((row) => {
    const dt = parseBookingDate(row?.date);
    return dt ? toDateKey(dt) === tomorrowKey : false;
  }).length;

  const openingItems = [
    { id: "open_team_cover", label: "Confirm team cover for today", hint: `${workingToday.length} staff scheduled`, status: workingToday.length ? "ready" : "risk" },
    { id: "open_diary_check", label: "Review today diary load", hint: `${bookingsToday.length} bookings (${todayPending} still active)`, status: bookingsToday.length ? "ready" : "watch" },
    { id: "open_risk_scan", label: "Check no-show / rebooking signals", hint: `${noShowRisks} no-show risks • ${rebookingPrompts} rebooking prompts`, status: noShowRisks ? "risk" : "ready" },
    { id: "open_waitlist_readiness", label: "Prepare waitlist recovery", hint: `${waitlistCount} waitlist entries ready`, status: waitlistCount ? "ready" : "watch" },
    { id: "open_finance_feed", label: "Confirm takings/accounting feed", hint: `${connectedAccounting} accounting connection${connectedAccounting === 1 ? "" : "s"} live`, status: connectedAccounting ? "ready" : "risk" }
  ];
  const closingItems = [
    { id: "close_booking_reconcile", label: "Review completed vs cancelled bookings", hint: `${todayCompleted} completed • ${todayCancelled} cancelled`, status: todayCancelled ? "watch" : "ready" },
    { id: "close_recovery_queue", label: "Queue service recovery / rebooking follow-up", hint: `${todayCancelled + noShowRisks} follow-up opportunities`, status: todayCancelled + noShowRisks ? "watch" : "ready" },
    { id: "close_takings_export", label: "Export or note daily takings", hint: connectedAccounting ? "Accounting feed available" : "Manual review recommended", status: connectedAccounting ? "ready" : "risk" },
    { id: "close_tomorrow_staffing", label: "Check tomorrow staffing cover", hint: `${workingTomorrow.length} staff • ${tomorrowBookings} bookings tomorrow`, status: workingTomorrow.length ? "ready" : "risk" },
    { id: "close_handover_notes", label: "Log handover notes for team", hint: "Capture issues, VIP clients, and follow-ups", status: "watch" }
  ];

  const exceptionFeed = [];
  if (!workingToday.length) exceptionFeed.push({ level: "critical", text: "No staff rota coverage set for today." });
  if (noShowRisks > 0) exceptionFeed.push({ level: "risk", text: `${noShowRisks} booking${noShowRisks === 1 ? "" : "s"} flagged as no-show risk.` });
  if (!connectedAccounting) exceptionFeed.push({ level: "warning", text: "Accounting connection is not live. Daily takings may need manual review." });
  if (todayCancelled > 0 && waitlistCount === 0) exceptionFeed.push({ level: "warning", text: "Cancellations detected but no waitlist entries available for recovery." });
  if (!workingTomorrow.length && tomorrowBookings > 0) exceptionFeed.push({ level: "critical", text: "Tomorrow has bookings but no rota cover is set." });
  if (!exceptionFeed.length) exceptionFeed.push({ level: "good", text: "No major exceptions detected. Routine checks should be quick today." });

  return {
    todayKey,
    bookingsToday: bookingsToday.length,
    workingToday: workingToday.length,
    noShowRisks,
    waitlistCount,
    connectedAccounting,
    openingItems,
    closingItems,
    exceptionFeed
  };
}

function renderOpeningClosingChecklistPanel(mod) {
  const model = openingClosingChecklistModel();
  const allState = loadOpenCloseChecklistState();
  const state = allState[model.todayKey] && typeof allState[model.todayKey] === "object" ? allState[model.todayKey] : {};
  const checked = state.checked && typeof state.checked === "object" ? state.checked : {};
  const auto = state.auto && typeof state.auto === "object" ? state.auto : { opening: false, closing: false };
  const completionFor = (items) => {
    if (!items.length) return 0;
    const done = items.filter((item) => checked[item.id] === true).length;
    return Math.round((done / items.length) * 100);
  };
  const openingProgress = completionFor(model.openingItems);
  const closingProgress = completionFor(model.closingItems);

  const renderChecklistRows = (items, lane) => items.map((item) => {
    const isChecked = checked[item.id] === true;
    const statusClass = item.status === "risk" ? "is-risk" : item.status === "watch" ? "is-watch" : "is-ready";
    return `
      <button type="button" class="openclose-check-item ${isChecked ? "is-complete" : ""} ${statusClass}" data-openclose-toggle="${escapeHtml(item.id)}" data-openclose-lane="${escapeHtml(lane)}">
        <span class="openclose-check-indicator" aria-hidden="true">${isChecked ? "✓" : ""}</span>
        <span class="openclose-check-copy">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.hint)}</small>
        </span>
      </button>
    `;
  }).join("");

  const exceptionRows = model.exceptionFeed.map((item) => `
    <li class="openclose-exception ${item.level === "critical" ? "is-critical" : item.level === "risk" ? "is-risk" : item.level === "warning" ? "is-warning" : "is-good"}">
      <strong>${item.level === "good" ? "Stable" : item.level === "critical" ? "Critical" : item.level === "risk" ? "Risk" : "Warning"}</strong>
      <small>${escapeHtml(item.text)}</small>
    </li>
  `).join("");

  return `
    <section class="module-openclose-shell" data-openclose-root="1" data-openclose-date="${escapeHtml(model.todayKey)}">
      <div class="module-openclose-top">
        <article class="module-openclose-kpi">
          <p>Today Bookings</p>
          <strong>${model.bookingsToday}</strong>
          <small>${model.waitlistCount} waitlist • ${model.noShowRisks} no-show risks</small>
        </article>
        <article class="module-openclose-kpi">
          <p>Staff Cover</p>
          <strong>${model.workingToday}</strong>
          <small>${model.workingToday ? "Rota coverage detected" : "No rota coverage set"}</small>
        </article>
        <article class="module-openclose-kpi">
          <p>Automation Readiness</p>
          <strong>${model.connectedAccounting ? "High" : "Medium"}</strong>
          <small>${model.connectedAccounting} accounting feeds connected</small>
        </article>
      </div>
      <div class="module-openclose-grid">
        <section class="module-openclose-lane" data-openclose-lane-shell="opening">
          <div class="module-openclose-lane-head">
            <div>
              <h5>Opening Run</h5>
              <p>${openingProgress}% complete</p>
            </div>
            <div class="module-openclose-lane-actions">
              <button type="button" class="btn btn-ghost" data-openclose-run="opening">AI Run</button>
              <button type="button" class="btn btn-ghost" data-openclose-auto="opening" aria-pressed="${auto.opening ? "true" : "false"}">${auto.opening ? "Auto On" : "Auto Off"}</button>
            </div>
          </div>
          <div class="module-openclose-progress"><span style="width:${openingProgress}%"></span></div>
          <div class="module-openclose-list">${renderChecklistRows(model.openingItems, "opening")}</div>
        </section>
        <section class="module-openclose-lane" data-openclose-lane-shell="closing">
          <div class="module-openclose-lane-head">
            <div>
              <h5>Closing Run</h5>
              <p>${closingProgress}% complete</p>
            </div>
            <div class="module-openclose-lane-actions">
              <button type="button" class="btn btn-ghost" data-openclose-run="closing">AI Run</button>
              <button type="button" class="btn btn-ghost" data-openclose-auto="closing" aria-pressed="${auto.closing ? "true" : "false"}">${auto.closing ? "Auto On" : "Auto Off"}</button>
            </div>
          </div>
          <div class="module-openclose-progress"><span style="width:${closingProgress}%"></span></div>
          <div class="module-openclose-list">${renderChecklistRows(model.closingItems, "closing")}</div>
        </section>
      </div>
      <section class="module-openclose-exceptions">
        <div class="module-openclose-exceptions-head">
          <h5>Exception Feed</h5>
          <button type="button" class="btn btn-ghost" data-openclose-run="exceptions">AI Prioritize</button>
        </div>
        <ul>${exceptionRows}</ul>
      </section>
    </section>
  `;
}

function bindOpeningClosingChecklistPanel(shell, mod) {
  const root = shell.querySelector("[data-openclose-root='1']");
  if (!(root instanceof HTMLElement)) return;
  const persist = (mutator) => {
    const all = loadOpenCloseChecklistState();
    const dateKey = String(root.getAttribute("data-openclose-date") || todayDateKeyLocal()).trim();
    const current = all[dateKey] && typeof all[dateKey] === "object" ? all[dateKey] : {};
    const next = {
      checked: current.checked && typeof current.checked === "object" ? { ...current.checked } : {},
      auto: current.auto && typeof current.auto === "object" ? { opening: !!current.auto.opening, closing: !!current.auto.closing } : { opening: false, closing: false }
    };
    mutator(next);
    all[dateKey] = next;
    saveOpenCloseChecklistState(all);
  };

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const toggle = target.closest("[data-openclose-toggle]");
    if (toggle instanceof HTMLElement) {
      const itemId = String(toggle.getAttribute("data-openclose-toggle") || "").trim();
      if (!itemId) return;
      persist((next) => {
        next.checked[itemId] = !(next.checked[itemId] === true);
      });
      showManageToast("Checklist updated.");
      setDashActionStatus("Opening & Closing checklist updated.");
      openModuleInfoModal(mod.key);
      return;
    }
    const autoBtn = target.closest("[data-openclose-auto]");
    if (autoBtn instanceof HTMLElement) {
      const lane = String(autoBtn.getAttribute("data-openclose-auto") || "").trim().toLowerCase();
      if (!(lane === "opening" || lane === "closing")) return;
      persist((next) => {
        next.auto[lane] = !next.auto[lane];
      });
      setDashActionStatus(`${lane === "opening" ? "Opening" : "Closing"} autopilot ${autoBtn.getAttribute("aria-pressed") === "true" ? "disabled" : "enabled"}.`);
      openModuleInfoModal(mod.key);
      return;
    }
    const runBtn = target.closest("[data-openclose-run]");
    if (runBtn instanceof HTMLElement) {
      const lane = String(runBtn.getAttribute("data-openclose-run") || "").trim().toLowerCase();
      const model = openingClosingChecklistModel();
      if (lane === "opening" || lane === "closing") {
        const items = lane === "opening" ? model.openingItems : model.closingItems;
        persist((next) => {
          items.forEach((item) => {
            if (item.status === "risk") return;
            next.checked[item.id] = true;
          });
        });
        const label = lane === "opening" ? "Opening" : "Closing";
        setDashActionStatus(`${label} AI run completed. Safe routine steps were checked and exceptions left for review.`);
        showManageToast(`${label} AI run complete.`);
        openModuleInfoModal(mod.key);
        return;
      }
      if (lane === "exceptions") {
        setDashActionStatus("AI prioritized exception feed. Focus critical items first, then warnings.");
        showManageToast("Exception feed prioritized.");
      }
    }
  });
}

function renderModuleWorkboardPanel(mod, blueprint) {
  if (!mod) return "";
  const isCustomerMinimal = user.role === "customer";
  if (isCustomerMinimal) {
    return `
      <section class="module-workboard" aria-label="AI next-step workboard">
        <div class="module-workboard-head">
          <div>
            <h5>Quick Next Step</h5>
            <p>Minimal customer view: fast next action and only the details needed to complete the booking task.</p>
          </div>
        </div>
        <div class="module-workboard-grid">
          <section class="module-workboard-pane">
            <h6>AI Guide</h6>
            <ul class="module-workboard-list">
              <li><strong>Ask one question at a time</strong><small>Services, availability, contact info, or booking guidance.</small></li>
              <li><strong>Use one-tap actions</strong><small>Open the exact tool instead of browsing the whole dashboard.</small></li>
            </ul>
          </section>
          <section class="module-workboard-pane">
            <h6>What Happens Next</h6>
            <ul class="module-workboard-list">
              ${(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps : []).slice(0, 3).map((step) => `<li><strong>${escapeHtml(step)}</strong><small>Customer flow stays minimal and focused.</small></li>`).join("")}
            </ul>
          </section>
        </div>
      </section>
    `;
  }

  const key = String(mod.key || "").trim();
  const categoryLabel = /account|revenue|profit|cash|payout|finance|payroll/i.test(`${key} ${mod.label}`) ? "Finance Ops"
    : /crm|review|referral|growth|social|commercial|membership|package/i.test(`${key} ${mod.label}`) ? "Growth Ops"
      : "Operations";
  const watchItems = (() => {
    if (key === "service_recovery_playbook") {
      return [
        ["Complaint risk", "Cancelled/no-show appointments, repeat complaints, and same-client friction patterns."],
        ["Recovery queue", "AI-generated apology, recovery offer and rebooking prompts ready for approval."],
        ["Outcome tracking", "Logs who was contacted, accepted offer, and rebooked."]
      ];
    }
    if (key === "cashflow_forecast") {
      return [
        ["Pressure dates", "Next 7/14/30 day periods where takings may not cover payroll or fixed costs."],
        ["Revenue assumptions", "Bookings in diary, completion rates and cancellation risk impact."],
        ["Mitigation options", "Push waitlist, run offer, tighten costs, or shift payroll timing."]
      ];
    }
    if (key === "payout_reconciliation") {
      return [
        ["Expected vs paid", "Compare booking takings, provider fees and actual payouts."],
        ["Mismatch alerts", "Flag gaps that need a note or export for accounting review."],
        ["Audit trail", "Mark reviewed and keep clean reconciliation notes."]
      ];
    }
    if (/review|reputation/i.test(key)) {
      return [
        ["Reply priority", "Negative/urgent reviews first, then neutral, then praise replies."],
        ["Brand tone draft", "AI writes responses in your chosen tone and service style."],
        ["Review request list", "Suggests happy clients to ask after completed appointments."]
      ];
    }
    return [
      ["Exceptions first", "Flags issues that need decisions so routine tasks stay lightweight."],
      ["One-tap routines", "Use AI actions to prep checks, drafts or recovery steps quickly."],
      ["Report-ready output", "Capture a clean summary for owner/admin review when needed."]
    ];
  })();
  const taskItems = (() => {
    if (key === "service_recovery_playbook") {
      return [
        ["Triage issue", "Tag severity, service type, and whether a response is needed today."],
        ["Draft recovery", "Generate message + offer + rebooking windows."],
        ["Confirm follow-up", "Set reminder and mark ownership for team/admin."]
      ];
    }
    if (key === "cashflow_forecast") {
      return [
        ["Run forecast", "Estimate 7/14/30 day takings and pressure points."],
        ["Check payroll pressure", "Compare payroll/costs against upcoming booking income."],
        ["Plan action", "Choose an offer, waitlist push, or spend reduction."]
      ];
    }
    if (key === "payout_reconciliation") {
      return [
        ["Run mismatch scan", "Highlight provider payout differences and likely causes."],
        ["Reconcile notes", "Add notes for fees, refunds or payout delays."],
        ["Export for accounts", "Prepare a clean handoff for bookkeeper/accountant."]
      ];
    }
    return [
      ["Review AI summary", blueprint?.focus || "Check what the AI surfaced first."],
      ["Run one-tap action", "Use quick actions to stage or complete common tasks."],
      ["Open full workspace", "Move into the interactive module only if deeper edits are needed."]
    ];
  })();
  const automationRows = [
    { key: `${key}:monitor`, label: "AI Monitor", note: `Tracks ${categoryLabel.toLowerCase()} signals and exceptions.`, defaultOn: true },
    { key: `${key}:prep`, label: "AI Prep", note: "Prepares drafts/checklists before you open the full module.", defaultOn: false },
    { key: `${key}:report`, label: "Report Include", note: "Include this module's summary in business PDF/email reports.", defaultOn: true }
  ];
  const autoPrefs = loadHubAutoRoutinePrefs();
  const reportReady = [
    `Useful for ${categoryLabel.toLowerCase()} handovers and owner/admin reviews.`,
    "Print to PDF or queue email from the Business Hub Report Center.",
    "Use popup notes + AI actions to keep an audit trail of what was changed."
  ];
  return `
    <section class="module-workboard" aria-label="AI workboard">
      <div class="module-workboard-head">
        <div>
          <h5>AI Workboard - ${escapeHtml(categoryLabel)}</h5>
          <p>Built for daily salon operations: exception-first, one-tap routines, and report-ready outputs without forcing full-screen admin work.</p>
        </div>
        <span class="module-chip muted">${escapeHtml(String(mod.cadence || "Use daily"))}</span>
      </div>
      <div class="module-workboard-grid">
        <section class="module-workboard-pane">
          <h6>What AI Watches</h6>
          <ul class="module-workboard-list">
            ${watchItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-workboard-pane">
          <h6>Daily Actions</h6>
          <ul class="module-workboard-list">
            ${taskItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
      </div>
      <section class="module-workboard-pane">
        <h6>Autopilot Modes</h6>
        <div class="module-workboard-automation">
          ${automationRows.map((row) => {
            const enabled = autoPrefs[row.key] === undefined ? row.defaultOn : autoPrefs[row.key] === true;
            return `
              <div class="module-workboard-automation-row">
                <div class="module-workboard-automation-copy">
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.note)}</small>
                </div>
                <button type="button" class="btn btn-ghost" data-hub-auto-toggle="${escapeHtml(row.key)}" aria-pressed="${enabled ? "true" : "false"}">${enabled ? "Auto On" : "Auto Off"}</button>
              </div>`;
          }).join("")}
        </div>
      </section>
      <section class="module-workboard-pane">
        <h6>Business Output</h6>
        <ul class="module-workboard-list">
          ${reportReady.map((line) => `<li><strong>${escapeHtml(line)}</strong><small>Useful for running and managing a salon with less manual admin.</small></li>`).join("")}
        </ul>
      </section>
    </section>
  `;
}

function openModuleInfoModal(moduleKey) {
  const mod = moduleDefinitionByKey(moduleKey);
  if (!mod) return;
  markModuleUsed(mod.key, "open");
  if (typeof closeModulePopupActive === "function") {
    closeModulePopupActive();
  }
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";

  const shell = document.createElement("section");
  shell.className = `module-info-modal size-${escapeHtml(String(mod.popupSize || "medium").toLowerCase())}`;
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-labelledby", "moduleInfoModalTitle");

  const featureItems = Array.isArray(mod.features) && mod.features.length
    ? mod.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")
    : "<li>Use this module to work on one part of the business without losing sight of the bigger picture.</li>";
  const snapshotItems = modulePopupSnapshotItems(mod)
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const isPinned = isPinnedBusinessModule(mod);
  const isActive = mod.key === activeModuleKey;
  const roleLabel = user.role === "admin" ? "Admin area" : user.role === "subscriber" ? "Salon owner area" : "Customer area";
  const moduleStatus = moduleOperationalStatus(mod);
  const operator = moduleOperatorBlueprint(mod);
  const isCustomerMinimal = user.role === "customer";
  const operatorActionButtons = (Array.isArray(operator?.quickActions) ? operator.quickActions : [])
    .slice(0, isCustomerMinimal ? 1 : 3)
    .map((action) => `
      <button
        type="button"
        class="btn ${action.variant === "primary" ? "" : "btn-ghost"} module-operator-btn"
        data-operator-action="${escapeHtml(action.id)}"
        ${action.moduleKey ? `data-target-module="${escapeHtml(action.moduleKey)}"` : ""}>
        ${escapeHtml(action.label)}
      </button>
    `)
    .join("");
  const operatorActionButtonsHtml = (user.role === "subscriber" || user.role === "admin")
    ? ""
    : operatorActionButtons;
  const operatorSignalCards = isCustomerMinimal
    ? ""
    : `
      <div class="module-operator-signal-grid">
        <article class="module-operator-signal">
          <p>AI Focus</p>
          <strong>${escapeHtml(operator?.focus || "Prioritize the next best action.")}</strong>
        </article>
        <article class="module-operator-signal">
          <p>Business Impact</p>
          <strong>${escapeHtml(operator?.impact || "Keeps this workflow moving with less manual effort.")}</strong>
        </article>
        <article class="module-operator-signal">
          <p>Confidence</p>
          <strong>${escapeHtml(String(operator?.confidence || 90))}% • ${escapeHtml(operator?.modeLabel || "AI assist")}</strong>
        </article>
      </div>`;
  const operatorNextSteps = Array.isArray(operator?.nextSteps) && operator.nextSteps.length
    ? operator.nextSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "";
  const customOperatorPanelHtml = mod.key === "opening_closing_checklist"
    ? renderOpeningClosingChecklistPanel(mod)
    : "";
  const workboardPanelHtml = renderModuleWorkboardPanel(mod, operator);
  const lexiBriefPanelHtml = renderModuleLexiBriefPanel(mod, operator);
  const purposeStripHtml = renderModulePurposeStrip(mod);

  shell.innerHTML = `
    <div class="module-info-modal-head">
      <div>
        <h3 id="moduleInfoModalTitle">${escapeHtml(mod.label)}</h3>
        <div class="module-info-modal-meta">
          <span class="module-chip">${escapeHtml(roleLabel)}</span>
          ${isPinned ? '<span class="module-chip">Pinned</span>' : ""}
          <span class="module-chip module-chip-status ${moduleStatus.tone === "good" ? "is-good" : moduleStatus.tone === "attention" ? "is-attention" : "is-setup"}">${escapeHtml(moduleStatus.label || "Available")}</span>
          <span class="module-chip muted">${isActive ? "Currently active" : "Preview mode"}</span>
        </div>
      </div>
      <button type="button" class="module-info-close" aria-label="Close module information">x</button>
    </div>
    ${purposeStripHtml}
    <section class="module-operator-hero${isCustomerMinimal ? " is-minimal" : ""}">
      <div class="module-operator-headline">
        <p class="module-operator-label">${isCustomerMinimal ? "AI Guide" : "AI Operator"}</p>
        <h4>${escapeHtml(isCustomerMinimal ? "Minimal help, next-step focus" : "Autonomous daily workflow assistant")}</h4>
        <p>${escapeHtml(operator?.modeSummary || "AI-led help for this workflow.")}</p>
      </div>
      ${operatorSignalCards}
      ${operatorNextSteps ? `
      <div class="module-operator-next">
        <h5>${isCustomerMinimal ? "Next Step" : "What AI Will Do"}</h5>
        <ul class="module-info-feature-list">${operatorNextSteps}</ul>
      </div>` : ""}
      ${operatorActionButtonsHtml ? `<div class="module-operator-actions">${operatorActionButtonsHtml}</div>` : ""}
    </section>
    <div class="module-info-scroll">
      ${lexiBriefPanelHtml}
      ${workboardPanelHtml}
      ${customOperatorPanelHtml}
      <section class="module-info-pane">
        <h4>Module Role In The Business</h4>
        <p>${escapeHtml(mod.navSummary || mod.howItHelps || "Helps you manage this part of the business day-to-day.")}</p>
        <p style="margin-top:0.45rem;">${escapeHtml(mod.howItWorks || "Open this module and use the controls to manage this area of your dashboard.")}</p>
      </section>
      <section class="module-info-pane">
        <h4>How This Module Helps</h4>
        <ul class="module-info-feature-list">${featureItems}</ul>
      </section>
      ${snapshotItems ? `
      <section class="module-info-pane">
        <h4>Current Live Contribution</h4>
        <ul class="module-info-feature-list">${snapshotItems}</ul>
      </section>` : ""}
    </div>
    <div class="module-info-actions">
      <small class="module-info-hint">Press Esc or click outside to close.</small>
      <button type="button" class="btn btn-ghost module-info-dashboard-btn">Back to Dashboard</button>
      <button type="button" class="btn btn-ghost module-info-close-btn">Close</button>
      <button type="button" class="btn module-info-open-btn">${isActive ? "Open Current Module" : "Open Module"}</button>
    </div>
  `;

  overlay.appendChild(shell);

  const close = () => {
    if (typeof closeModulePopupActive !== "function") return;
    document.removeEventListener("keydown", onKeyDown);
    overlay.removeEventListener("click", onOverlayClick);
    overlay.style.display = "none";
    overlay.innerHTML = "";
    closeModulePopupActive = null;
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const onOverlayClick = (event) => {
    if (event.target === overlay) close();
  };

  closeModulePopupActive = close;
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", onOverlayClick);
  shell.querySelector(".module-info-close")?.addEventListener("click", close);
  shell.querySelector(".module-info-dashboard-btn")?.addEventListener("click", () => {
    close();
    returnToDashboardHomeView();
  });
  shell.querySelector(".module-info-close-btn")?.addEventListener("click", close);
  shell.querySelectorAll(".module-operator-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      const actionId = String(btn.getAttribute("data-operator-action") || "").trim();
      const targetModule = String(btn.getAttribute("data-target-module") || "").trim();
      runModuleOperatorAction(actionId, mod, { close, blueprint: operator, moduleKey: targetModule }).catch((error) => {
        setDashActionStatus(error.message || "Could not run that AI action right now.", true);
      });
    });
  });
  shell.querySelectorAll("[data-lexi-module-assist]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      openLexiModuleAssist(mod, { trigger: btn, blueprint: operator });
    });
  });
  shell.querySelectorAll("[data-lexi-open-chat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      if (!(user.role === "subscriber" || user.role === "admin")) return;
      openBusinessAiChatPopup(user.role === "admin" ? "admin" : "subscriber", { trigger: btn });
      setDashActionStatus(`Lexi chat opened for ${mod.label}.`);
    });
  });
  shell.querySelectorAll("[data-hub-auto-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      const key = String(btn.getAttribute("data-hub-auto-toggle") || "").trim();
      if (!key) return;
      const prefs = loadHubAutoRoutinePrefs();
      prefs[key] = !(prefs[key] === true);
      saveHubAutoRoutinePrefs(prefs);
      showManageToast(`${prefs[key] ? "Auto enabled" : "Auto disabled"}.`);
      openModuleInfoModal(mod.key);
    });
  });
  if (mod.key === "opening_closing_checklist") {
    bindOpeningClosingChecklistPanel(shell, mod);
  }
  shell.querySelector(".module-info-open-btn")?.addEventListener("click", () => {
    setWorkspaceBackButtonVisible(mod.key !== "home");
    focusModuleByKey(mod.key);
    close();
  });

  const closeButton = shell.querySelector(".module-info-close");
  if (closeButton instanceof HTMLElement) closeButton.focus();
}

function openInteractiveModulePopup(moduleKey) {
  const mod = moduleDefinitionByKey(moduleKey);
  if (!mod) return;
  markModuleUsed(mod.key, "open");
  if (!(mod.section instanceof HTMLElement)) {
    openModuleInfoModal(moduleKey);
    return;
  }
  if (typeof closeModulePopupActive === "function") {
    closeModulePopupActive();
  }

  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";

  const shell = document.createElement("section");
  shell.className = `module-workspace-modal size-${escapeHtml(String(mod.popupSize || "large").toLowerCase())}`;
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-labelledby", "moduleWorkspaceModalTitle");

  const isPinned = isPinnedBusinessModule(mod);
  const roleLabel = user.role === "admin" ? "Admin area" : "Salon owner area";
  const moduleStatus = moduleOperationalStatus(mod);
  const operator = moduleOperatorBlueprint(mod);
  const lexiWorkspaceBriefHtml = renderModuleLexiBriefPanel(mod, operator, { compact: true });
  const purposeStripHtml = renderModulePurposeStrip(mod);
  shell.innerHTML = `
    <div class="module-workspace-head">
      <div>
        <h3 id="moduleWorkspaceModalTitle">${escapeHtml(mod.label)}</h3>
        <div class="module-info-modal-meta">
          <span class="module-chip">${escapeHtml(roleLabel)}</span>
          ${isPinned ? '<span class="module-chip">Pinned</span>' : ""}
          <span class="module-chip module-chip-status ${moduleStatus.tone === "good" ? "is-good" : moduleStatus.tone === "attention" ? "is-attention" : "is-setup"}">${escapeHtml(moduleStatus.label || "Available")}</span>
          <span class="module-chip muted">Quick working view</span>
        </div>
        <p class="module-workspace-summary">${escapeHtml(mod.howItWorks || mod.howItHelps || "Use this module in a focused pop-up view.")}</p>
      </div>
      <button type="button" class="module-info-close" aria-label="Close module popup">x</button>
    </div>
    <div class="module-workspace-body">${purposeStripHtml}${lexiWorkspaceBriefHtml}</div>
    <div class="module-workspace-actions">
      <small class="module-info-hint">Press Esc or click outside to close.</small>
      <button type="button" class="btn btn-ghost module-workspace-dashboard-btn">Back to Dashboard</button>
      <button type="button" class="btn btn-ghost module-workspace-close-btn">Close</button>
      <button type="button" class="btn module-workspace-open-btn">Open Full View</button>
    </div>
  `;
  overlay.appendChild(shell);

  const body = shell.querySelector(".module-workspace-body");
  const originalParent = mod.section.parentNode;
  const placeholder = document.createElement("div");
  placeholder.style.display = "none";
  const previousDisplay = mod.section.style.display;
  const hadMountedClass = mod.section.classList.contains("module-popup-mounted");
  if (originalParent) {
    originalParent.insertBefore(placeholder, mod.section);
  }
  mod.section.style.display = "";
  mod.section.classList.add("module-popup-mounted");
  body?.appendChild(mod.section);
  if (isPopupOnlyBusinessModuleKey(mod.key)) {
    renderPopupOnlyBusinessModule(mod.key);
  }

  const close = () => {
    if (typeof closeModulePopupActive !== "function") return;
    document.removeEventListener("keydown", onKeyDown);
    overlay.removeEventListener("click", onOverlayClick);
    try {
      if (placeholder.parentNode && mod.section) {
        placeholder.parentNode.insertBefore(mod.section, placeholder);
        placeholder.remove();
      }
      if (!hadMountedClass) mod.section.classList.remove("module-popup-mounted");
      mod.section.style.display = previousDisplay;
    } catch {
      // Ignore restore issues and let next render normalize state.
    }
    overlay.style.display = "none";
    overlay.innerHTML = "";
    closeModulePopupActive = null;
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const onOverlayClick = (event) => {
    if (event.target === overlay) close();
  };

  closeModulePopupActive = close;
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", onOverlayClick);
  shell.querySelector(".module-info-close")?.addEventListener("click", close);
  shell.querySelector(".module-workspace-dashboard-btn")?.addEventListener("click", () => {
    close();
    returnToDashboardHomeView();
  });
  shell.querySelector(".module-workspace-close-btn")?.addEventListener("click", close);
  shell.querySelectorAll(".module-operator-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      const actionId = String(btn.getAttribute("data-operator-action") || "").trim();
      if (!actionId) return;
      runModuleOperatorAction(actionId, mod, { close, blueprint: operator }).catch((error) => {
        setDashActionStatus(error.message || "Could not run that Lexi action right now.", true);
      });
    });
  });
  shell.querySelectorAll("[data-lexi-module-assist]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      openLexiModuleAssist(mod, { trigger: btn, blueprint: operator });
    });
  });
  shell.querySelectorAll("[data-lexi-open-chat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!(btn instanceof HTMLElement)) return;
      if (!(user.role === "subscriber" || user.role === "admin")) return;
      openBusinessAiChatPopup(user.role === "admin" ? "admin" : "subscriber", { trigger: btn });
      setDashActionStatus(`Lexi chat opened for ${mod.label}.`);
    });
  });
  shell.querySelector(".module-workspace-open-btn")?.addEventListener("click", () => {
    close();
    setWorkspaceBackButtonVisible(mod.key !== "home");
    focusModuleByKey(mod.key);
  });
  const closeButton = shell.querySelector(".module-info-close");
  if (closeButton instanceof HTMLElement) closeButton.focus();
}

function focusModuleByKey(moduleKey) {
  const key = String(moduleKey || "").trim();
  if (!key) return;
  markModuleUsed(key, "focus");
  const modules = moduleDefinitionsForRole().filter((mod) => Boolean(mod.section));
  const found = modules.find((mod) => mod.key === key);
  if (!found) return;
  activeModuleKey = found.key;
  if (isPopupOnlyBusinessModuleKey(found.key)) {
    applyModuleVisibility();
    openInteractiveModulePopup(found.key);
    return;
  }
  applyModuleVisibility();
  found.section?.classList.remove("panel-focus");
  void found.section?.offsetWidth;
  found.section?.classList.add("panel-focus");
  window.setTimeout(() => {
    found.section?.classList.remove("panel-focus");
  }, 700);
  found.section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setWorkspaceBackButtonVisible(isVisible) {
  if (!(workspaceBackToDashboardBtn instanceof HTMLElement)) return;
  workspaceBackToDashboardBtn.classList.toggle("is-visible", Boolean(isVisible));
}

function returnToDashboardHomeView() {
  setWorkspaceBackButtonVisible(false);
  focusModuleByKey("home");
  dashboardQuickActionsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function todayDateKeyLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function openQuickCreateBookingFromMobile() {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  if (!manageModeEnabled) {
    showManageToast("Turn on Edit Mode to add a booking.", "error");
    focusModuleByKey("booking_ops");
    return;
  }
  const businessId = String(managedBusinessId || user.businessId || "").trim();
  if (!businessId) {
    showManageToast("No business selected yet.", "error");
    return;
  }
  const defaultDate = todayDateKeyLocal();
  const values = await openManageForm({
    title: `Add Booking (${defaultDate})`,
    submitLabel: "Create Booking",
    fields: [
      { id: "customerName", label: "Customer Name", required: true },
      { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+447700900123" },
      { id: "customerEmail", label: "Customer Email" },
      { id: "service", label: "Service", required: true },
      { id: "date", label: "Date", type: "date", required: true, value: defaultDate },
      { id: "time", label: "Time", type: "time", required: true }
    ]
  });
  if (!values) return;
  await createBooking({ businessId, ...values });
  await refreshBookingsAfterDayPopupMutation();
  showManageToast("Booking created.");
  focusModuleByKey("booking_ops");
}

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
  document.addEventListener("keydown", (event) => {
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
      returnToDashboardHomeView();
      setActiveMobileNavButtonBySection("dashboardOverviewSection");
      return;
    }
    if (action === "today") {
      const todayKey = todayDateKeyLocal();
      focusModuleByKey("calendar");
      setActiveMobileNavButtonBySection("subscriberCalendarSection");
      window.setTimeout(() => {
        openCalendarDayWorkspace(todayKey);
      }, 180);
      return;
    }
    if (action === "new-booking") {
      try {
        await openQuickCreateBookingFromMobile();
        setActiveMobileNavButtonBySection("bookingOperationsSection");
      } catch (error) {
        showManageToast(error?.message || "Could not open new booking.", "error");
      }
      return;
    }
    if (action === "calendar") {
      focusModuleByKey("calendar");
      setActiveMobileNavButtonBySection("subscriberCalendarSection");
      return;
    }
    if (action === "bookings") {
      focusModuleByKey("booking_ops");
      setActiveMobileNavButtonBySection("bookingOperationsSection");
      return;
    }
    if (action === "waitlist") {
      focusModuleByKey("waitlist");
      setActiveMobileNavButtonBySection("bookingOperationsSection");
      return;
    }
    if (action === "copilot") {
      const copilotKey = user.role === "admin" ? "admin_copilot" : "subscriber_copilot";
      const copilotSectionId = user.role === "admin" ? "adminCopilotSection" : "subscriberCopilotSection";
      focusModuleByKey(copilotKey);
      setActiveMobileNavButtonBySection(copilotSectionId);
      return;
    }
    if (action === "hub") {
      document.getElementById("businessGrowthSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    if (moduleKey && (user.role === "subscriber" || user.role === "admin")) {
      if (moduleKey === "home") {
        returnToDashboardHomeView();
      } else {
        focusModuleByKey(moduleKey);
      }
    } else if (sectionId) {
      const section = document.getElementById(sectionId);
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
      "subscriberCopilotSection",
      "businessGrowthSection",
      "bookingOperationsSection"
    ],
    admin: [
      "dashboardOverviewSection",
      "subscriberCalendarSection",
      "adminCopilotSection",
      "businessGrowthSection",
      "bookingOperationsSection"
    ]
  };

  const observerSectionIds = sectionsByRole[currentRole] || [];
  if ("IntersectionObserver" in window && observerSectionIds.length) {
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
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  setActiveMobileNavButtonBySection("dashboardOverviewSection");
}

function applyModuleVisibility() {
  const modules = groupedModulesForCurrentRole().flatMap((entry) => entry.modules);
  const sectionModules = modules.filter((mod) => Boolean(mod?.section));
  if (!sectionModules.length) return;
  const active = sectionModules.find((mod) => mod.key === activeModuleKey) || sectionModules[0];
  activeModuleKey = active.key;
  sectionModules.forEach((mod) => {
    if (isPopupOnlyBusinessModuleKey(mod.key)) hideSection(mod.section);
    else if (mod.key === active.key || isPinnedBusinessModule(mod)) showSection(mod.section);
    else hideSection(mod.section);
  });
  renderModuleNavigator();
}

function initializeModuleNavigator() {
  const modules = groupedModulesForCurrentRole().flatMap((entry) => entry.modules);
  const sectionModules = modules.filter((mod) => Boolean(mod?.section));
  if (!modules.length) {
    hideSection(moduleNavigatorSection);
    return;
  }
  if (!activeModuleKey || !sectionModules.some((mod) => mod.key === activeModuleKey)) {
    activeModuleKey = (sectionModules.find((mod) => mod.startHere) || sectionModules[0] || modules[0]).key;
  }
  applyModuleVisibility();
  moduleCards?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest("[data-module-key]");
    if (!(card instanceof HTMLElement)) return;
    const next = String(card.getAttribute("data-module-key") || "").trim();
    if (!next) return;
    const mod = moduleDefinitionByKey(next);
    if (!mod) return;
    if (moduleUsesInteractivePopup(mod)) {
      openInteractiveModulePopup(next);
      return;
    }
    if (moduleUsesInfoPopup(mod)) {
      openModuleInfoModal(next);
      return;
    }
    focusModuleByKey(next);
  });
}

function renderBusinessGrowthPanel() {
  if (!(user.role === "subscriber" || user.role === "admin")) {
    hideSection(businessGrowthSection);
    return;
  }
  showSection(businessGrowthSection);
  renderBusinessHubCommandDeck();

  if (billingLiveBanner) {
    const status = String(billingSummary?.status || "inactive").toLowerCase();
    const plan = String(billingSummary?.planLabel || "Subscriber");
    billingLiveBanner.textContent = `Plan: ${plan} (${status})`;
  }
  if (billingLiveMeta) {
    const renewal = billingSummary?.currentPeriodEnd
      ? `Next renewal: ${formatDateShort(billingSummary.currentPeriodEnd)}`
      : "Next renewal: Not available yet";
    billingLiveMeta.textContent = renewal;
  }
  if (yearlySavingsLine) {
    const pct = Number(billingSummary?.yearlyDiscountPercent || 16.7).toFixed(1);
    const savePerYear = Number((Number(billingSummary?.monthlyFee || 9.99) * 12 - Number(billingSummary?.yearlyFee || 99.99)).toFixed(2));
    yearlySavingsLine.textContent = `Yearly billing saves £${savePerYear} per year (${pct}% off).`;
  }

  if (onboardingChecklist || onboardingSummaryList || onboardingQuickActionsList || onboardingStatusList) {
    const profileDone = Boolean(String(businessProfileName?.value || "").trim() && String(businessProfilePhone?.value || "").trim() && String(businessProfileEmail?.value || "").trim());
    const servicesCount = String(businessProfileServices?.value || "").split("\n").map((line) => line.trim()).filter(Boolean).length;
    const servicesDone = servicesCount >= 3;
    const hoursDone = [businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday]
      .every((input) => Boolean(String(input?.value || "").trim()));
    const socialDone = [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput]
      .some((input) => Boolean(String(input?.value || "").trim()));
    const accountingDone = accountingRows.some((row) => row?.connected);
    const bookingsDone = bookingRows.length > 0;
    const staffCount = Array.isArray(staffRosterRows) ? staffRosterRows.length : 0;
    const waitlistCount = Array.isArray(waitlistRows) ? waitlistRows.length : 0;
    const socialCount = [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput]
      .filter((input) => Boolean(String(input?.value || "").trim())).length;
    const configuredHoursCount = [businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday]
      .filter((input) => Boolean(String(input?.value || "").trim())).length;

    const items = [
      {
        label: "Finish your business profile",
        note: "Add your salon name, contact details and email so everything is ready for clients.",
        ok: profileDone,
        moduleKey: "business_profile"
      },
      {
        label: "Set up your service menu",
        note: `Add at least 3 services with prices and timings (currently ${servicesCount}).`,
        ok: servicesDone,
        moduleKey: "business_profile"
      },
      {
        label: "Set your opening hours",
        note: "Fill in your weekly opening hours so availability and planning work properly.",
        ok: hoursDone,
        moduleKey: "business_profile"
      },
      {
        label: "Add your social links",
        note: "Connect at least one social profile to build trust and make your brand look complete.",
        ok: socialDone,
        moduleKey: "social"
      },
      {
        label: "Connect accounting",
        note: "Link your accounting provider to start tracking takings and exports in one place.",
        ok: accountingDone,
        moduleKey: "accounting"
      },
      {
        label: "Get your first booking",
        note: "Once a booking comes in, your calendar, reports and daily signals start filling up.",
        ok: bookingsDone,
        moduleKey: "frontdesk"
      }
    ];
    const completeCount = items.filter((item) => item.ok).length;
    const completionPct = Math.round((completeCount / Math.max(items.length, 1)) * 100);
    const nextPending = items.find((item) => !item.ok) || null;
    if (onboardingSummaryList) onboardingSummaryList.innerHTML = "";
    if (onboardingQuickActionsList) onboardingQuickActionsList.innerHTML = "";
    if (onboardingStatusList) onboardingStatusList.innerHTML = "";
    if (onboardingChecklist) onboardingChecklist.innerHTML = "";
    const legacySingleListMode = !onboardingSummaryList && !onboardingQuickActionsList && !onboardingStatusList;
    const summaryTarget = onboardingSummaryList || onboardingChecklist;
    const quickActionsTarget = onboardingQuickActionsList || (legacySingleListMode ? onboardingChecklist : null);
    const setupStatusTarget = onboardingStatusList || (legacySingleListMode ? onboardingChecklist : null);
    const checklistTarget = onboardingChecklist;
    const summary = document.createElement("li");
    summary.className = "onboarding-summary";
    summary.innerHTML = `
      <div class="onboarding-summary-head">
        <div>
          <strong>${completeCount}/${items.length} setup steps complete</strong>
          <small>${completeCount === items.length ? "Your salon setup is looking strong." : "Work through these steps for a clean, professional launch."}</small>
        </div>
        <span class="onboarding-score-pill">${completionPct}% ready</span>
      </div>
      <div class="onboarding-progress-track" aria-hidden="true">
        <div class="onboarding-progress-fill" style="--onboarding-progress:${completionPct}%;"></div>
      </div>
      <div class="onboarding-summary-note">
        ${escapeHtml(nextPending ? `Next best step: ${nextPending.label}.` : "Everything on the launch checklist is done. Keep an eye on your first-week bookings and revenue signals.")}
      </div>
    `;
    if (summaryTarget) summaryTarget.appendChild(summary);

    const quickActions = document.createElement("li");
    quickActions.className = "onboarding-step";
    quickActions.innerHTML = `
      <div class="onboarding-step-head">
        <span class="onboarding-step-title">Business Setup Hub</span>
        <span class="onboarding-badge done">Quick setup</span>
      </div>
      <div class="onboarding-step-note">Use these shortcuts to set up your team, hours, services, and the key parts of your dashboard faster.</div>
      <div class="onboarding-quick-actions">
        <button class="onboarding-quick-btn" type="button" data-module-jump="business_profile">
          <strong>Business Profile</strong>
          <small>Name, contact details, services and opening hours</small>
        </button>
        <button class="onboarding-quick-btn" type="button" data-module-jump="staff">
          <strong>Team Setup</strong>
          <small>Add staff and set up your working cover</small>
        </button>
        <button class="onboarding-quick-btn" type="button" data-module-jump="frontdesk">
          <strong>Front Desk View</strong>
          <small>Check how your salon looks to clients</small>
        </button>
        <button class="onboarding-quick-btn" type="button" data-module-jump="social">
          <strong>Social & Brand</strong>
          <small>Add links and make your profile look complete</small>
        </button>
        <button class="onboarding-quick-btn" type="button" data-module-jump="accounting">
          <strong>Takings & Accounts</strong>
          <small>Connect accounting and review revenue tracking</small>
        </button>
        <button class="onboarding-quick-btn" type="button" data-module-jump="commercial">
          <strong>Packages & Memberships</strong>
          <small>Set up offers, bundles and gift cards</small>
        </button>
      </div>
    `;
    if (quickActionsTarget) quickActionsTarget.appendChild(quickActions);

    const setupStatus = document.createElement("li");
    setupStatus.className = "onboarding-step";
    setupStatus.innerHTML = `
      <div class="onboarding-step-head">
        <span class="onboarding-step-title">Status</span>
        <span class="onboarding-badge ${completeCount === items.length ? "done" : "pending"}">${completeCount === items.length ? "Ready" : "In progress"}</span>
      </div>
      <div class="onboarding-setup-grid">
        <article class="onboarding-setup-card">
          <p>Team Members</p>
          <strong>${staffCount}</strong>
          <small>${staffCount ? "Your team is showing in the dashboard." : "Add your first staff member to start planning cover."}</small>
        </article>
        <article class="onboarding-setup-card">
          <p>Working Days Set</p>
          <strong>${configuredHoursCount}/7</strong>
          <small>${configuredHoursCount === 7 ? "Weekly hours are set." : "Fill in all 7 days so your availability is accurate."}</small>
        </article>
        <article class="onboarding-setup-card">
          <p>Services Listed</p>
          <strong>${servicesCount}</strong>
          <small>${servicesCount ? "Service menu is starting to take shape." : "Add services with pricing and timing."}</small>
        </article>
        <article class="onboarding-setup-card">
          <p>Social Links</p>
          <strong>${socialCount}</strong>
          <small>${socialCount ? "Your profile looks more complete to clients." : "Add at least one social link for trust."}</small>
        </article>
        <article class="onboarding-setup-card">
          <p>Waitlist Entries</p>
          <strong>${waitlistCount}</strong>
          <small>${waitlistCount ? "You can use these to fill cancellations." : "Add waitlist names once clients ask for full slots."}</small>
        </article>
        <article class="onboarding-setup-card">
          <p>Bookings Received</p>
          <strong>${bookingRows.length}</strong>
          <small>${bookingRows.length ? "Your diary and reports are now feeding data." : "Your diary, gauges and reports will fill as bookings come in."}</small>
        </article>
      </div>
    `;
    if (setupStatusTarget) setupStatusTarget.appendChild(setupStatus);

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = `onboarding-step${item.ok ? " is-done" : ""}`;
      li.innerHTML = `
        <div class="onboarding-step-head">
          <span class="onboarding-step-title">${index + 1}. ${escapeHtml(item.label)}</span>
          <span class="onboarding-badge ${item.ok ? "done" : "pending"}">${item.ok ? "Done" : "To do"}</span>
        </div>
        <div class="onboarding-step-note">${escapeHtml(item.note || "")}</div>
        <div class="onboarding-step-actions">
          <span class="onboarding-summary-note">${item.ok ? "Looks good. You can review it anytime." : "Open this area to complete the step."}</span>
          <button class="btn btn-ghost" type="button" data-module-jump="${item.moduleKey}" style="padding:0.25rem 0.55rem;font-size:0.72rem;">${item.ok ? "Review" : "Open"}</button>
        </div>
      `;
      if (checklistTarget) checklistTarget.appendChild(li);
    });
  }

  if (first7DaysGrid) {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recent = bookingRows.filter((row) => {
      const ts = new Date(row.createdAt || `${row.date || ""}T${String(row.time || "00:00").slice(0, 5)}:00`).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgo;
    });
    const bookings = recent.length;
    const completed = recent.filter((row) => String(row.status || "").toLowerCase() === "completed").length;
    const cancelled = recent.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
    const revenue = recent
      .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row.price || 0), 0);
    const cards = [
      { label: "Bookings", value: String(bookings) },
      { label: "Completed", value: String(completed) },
      { label: "Cancelled", value: String(cancelled) },
      { label: "Revenue", value: formatMoney(revenue) }
    ];
    first7DaysGrid.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      first7DaysGrid.appendChild(article);
    });
  }
}

function isDashboardManagerRole() {
  return user.role === "subscriber" || user.role === "admin";
}

function loadManageModePreference() {
  try {
    return localStorage.getItem(MANAGE_MODE_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function setManageMode(enabled) {
  manageModeEnabled = Boolean(enabled);
  if (document.body) {
    document.body.setAttribute("data-manage-mode", manageModeEnabled ? "on" : "off");
  }
  if (manageModeToggle) {
    manageModeToggle.textContent = `Edit Mode: ${manageModeEnabled ? "On" : "Off"}`;
    manageModeToggle.setAttribute("aria-pressed", manageModeEnabled ? "true" : "false");
  }
  try {
    localStorage.setItem(MANAGE_MODE_STORAGE_KEY, manageModeEnabled ? "on" : "off");
  } catch {
    // Ignore storage errors.
  }
  if (staffRosterSection) {
    renderStaffSummary();
    renderStaffRoster();
  }
}

function initializeManageMode() {
  // Edit Mode is disabled across dashboards.
  if (manageModeToggle) hideSection(manageModeToggle);
  setManageMode(false);
}

function ensureManageToastStack() {
  let stack = document.getElementById("manageToastStack");
  if (stack) return stack;
  stack = document.createElement("div");
  stack.id = "manageToastStack";
  stack.className = "manage-toast-stack";
  document.body.appendChild(stack);
  return stack;
}

function showManageToast(message, type = "success") {
  const text = String(message || "").trim();
  if (!text) return;
  const stack = ensureManageToastStack();
  const toast = document.createElement("div");
  toast.className = `manage-toast${type === "error" ? " error" : ""}`;
  toast.textContent = text;
  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function ensureManageModalOverlay() {
  let overlay = document.getElementById("manageModalOverlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "manageModalOverlay";
  overlay.className = "manage-modal-overlay";
  document.body.appendChild(overlay);
  return overlay;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ensureLexiPendingPopup() {
  let popup = document.getElementById("lexiPendingPopup");
  if (popup) return popup;
  popup = document.createElement("section");
  popup.id = "lexiPendingPopup";
  popup.className = "lexi-pending-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-live", "polite");
  popup.setAttribute("aria-label", "Lexi pending booking reminder");
  popup.innerHTML = `
    <div class="lexi-pending-popup-media">
      <p class="lexi-pending-popup-label">Lexi | AI Receptionist</p>
      <h3 class="lexi-pending-popup-title">Booking request pending confirmation</h3>
    </div>
    <div class="lexi-pending-popup-body">
      <div class="lexi-pending-popup-details" id="lexiPendingPopupDetails">
        <strong>Waiting for subscriber confirmation</strong>
        <small>Open Booking Operations to confirm or decline the request.</small>
      </div>
      <div class="lexi-pending-popup-actions">
        <button type="button" class="btn" data-lexi-pending-action="review">Review Pending Bookings</button>
        <button type="button" class="btn btn-ghost" data-lexi-pending-action="snooze">Snooze 5 min</button>
        <button type="button" class="btn btn-ghost" data-lexi-pending-action="dismiss">Dismiss</button>
      </div>
    </div>
  `;
  popup.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-lexi-pending-action]") : null;
    if (!target) return;
    const action = String(target.getAttribute("data-lexi-pending-action") || "");
    if (action === "review") {
      openLexiPendingBookingsReview();
      hideLexiPendingPopup();
      return;
    }
    if (action === "snooze") {
      lexiPendingSnoozeUntil = Date.now() + (5 * 60 * 1000);
      hideLexiPendingPopup();
      showManageToast("Lexi reminders snoozed for 5 minutes.");
      return;
    }
    hideLexiPendingPopup();
  });
  document.body.appendChild(popup);
  return popup;
}

function hideLexiPendingPopup() {
  const popup = document.getElementById("lexiPendingPopup");
  if (!popup) return;
  popup.classList.remove("is-open");
}

function getPendingConfirmationBookings() {
  return bookingRows.filter((row) => isPendingConfirmationStatus(row?.status));
}

function buildLexiPendingSignature(rows) {
  return rows
    .map((row) => [row?.id, row?.date, row?.time, row?.status].map((v) => String(v || "")).join("|"))
    .sort()
    .join("||");
}

function updateLexiPendingPopupContent(rows = []) {
  const popup = ensureLexiPendingPopup();
  const details = popup.querySelector("#lexiPendingPopupDetails");
  if (!details) return;
  const count = rows.length;
  const first = rows[0] || {};
  if (!count) {
    details.innerHTML = "<strong>No pending bookings</strong><small>You're all caught up.</small>";
    return;
  }
  const firstLine = `${first.customerName || "Customer"} | ${first.service || "Service"} | ${first.date || "N/A"} ${first.time || ""}`.trim();
  details.innerHTML = `
    <strong>${count} pending booking${count === 1 ? "" : "s"} waiting for confirmation</strong>
    <small>${escapeHtml(firstLine)}${count > 1 ? ` • +${count - 1} more` : ""}</small>
  `;
}

function showLexiPendingPopup(rows = [], options = {}) {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  if (!rows.length) return;
  if (!options.force && Date.now() < lexiPendingSnoozeUntil) return;
  updateLexiPendingPopupContent(rows);
  const popup = ensureLexiPendingPopup();
  popup.classList.add("is-open");
}

function openLexiPendingBookingsReview() {
  if (bookingStatus) bookingStatus.value = "pending";
  setActiveStatusChip("pending");
  applyBookingFilters();
  (bookingOperationsSection || bookingTools || bookingsList)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function stopLexiPendingReminderLoop() {
  if (lexiPendingReminderTimerId) {
    window.clearInterval(lexiPendingReminderTimerId);
    lexiPendingReminderTimerId = null;
  }
}

function ensureLexiPendingReminderLoop() {
  if (lexiPendingReminderTimerId) return;
  lexiPendingReminderTimerId = window.setInterval(() => {
    const pendingRows = getPendingConfirmationBookings();
    if (!pendingRows.length) {
      stopLexiPendingReminderLoop();
      hideLexiPendingPopup();
      return;
    }
    if (Date.now() < lexiPendingSnoozeUntil) return;
    const now = Date.now();
    if (now - lexiPendingLastToastAt >= 60000) {
      const count = pendingRows.length;
      showManageToast(`Lexi: ${count} pending booking${count === 1 ? "" : "s"} still waiting for confirmation.`);
      lexiPendingLastToastAt = now;
    }
  }, 15000);
}

function syncLexiPendingReminders() {
  if (!(user.role === "subscriber" || user.role === "admin")) {
    stopLexiPendingReminderLoop();
    hideLexiPendingPopup();
    return;
  }
  const pendingRows = getPendingConfirmationBookings();
  updateLexiPendingPopupContent(pendingRows);
  if (!pendingRows.length) {
    lexiPendingLastPopupSignature = "";
    lexiPendingSnoozeUntil = 0;
    stopLexiPendingReminderLoop();
    hideLexiPendingPopup();
    return;
  }
  ensureLexiPendingReminderLoop();
  const signature = buildLexiPendingSignature(pendingRows);
  if (signature !== lexiPendingLastPopupSignature) {
    lexiPendingLastPopupSignature = signature;
    lexiPendingSnoozeUntil = 0;
    showLexiPendingPopup(pendingRows, { force: true });
    lexiPendingLastToastAt = 0;
    return;
  }
}

async function openManageForm({ title, fields = [], submitLabel = "Save" } = {}) {
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";
  const form = document.createElement("form");
  form.className = "manage-modal";
  form.innerHTML = `
    <h3>${escapeHtml(title || "Manage Item")}</h3>
    <div class="manage-modal-grid"></div>
    <div class="manage-modal-actions">
      <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
      <button type="submit" class="btn">${escapeHtml(submitLabel)}</button>
    </div>
  `;
  const grid = form.querySelector(".manage-modal-grid");
  fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.setAttribute("for", `manage-field-${field.id}`);
    const label = document.createElement("span");
    label.textContent = field.label || field.id;
    wrapper.appendChild(label);
    let control;
    const type = String(field.type || "text").toLowerCase();
    if (type === "select") {
      control = document.createElement("select");
      (field.options || []).forEach((option) => {
        const op = document.createElement("option");
        op.value = String(option.value);
        op.textContent = String(option.label);
        if (String(option.value) === String(field.value || "")) op.selected = true;
        control.appendChild(op);
      });
    } else if (type === "textarea") {
      control = document.createElement("textarea");
      control.rows = Number(field.rows || 3);
      control.value = String(field.value || "");
    } else {
      control = document.createElement("input");
      control.type = type;
      control.value = String(field.value || "");
      if (field.placeholder) control.placeholder = String(field.placeholder);
    }
    control.id = `manage-field-${field.id}`;
    control.name = field.id;
    if (field.required) control.required = true;
    wrapper.appendChild(control);
    grid?.appendChild(wrapper);
  });
  overlay.appendChild(form);
  const firstControl = form.querySelector("input,select,textarea");
  if (firstControl instanceof HTMLElement) firstControl.focus();

  return new Promise((resolve) => {
    const close = (result) => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      resolve(result);
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = {};
      fields.forEach((field) => {
        const el = form.querySelector(`[name="${field.id}"]`);
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          values[field.id] = String(el.value || "").trim();
        }
      });
      close(values);
    });
    const cancel = form.querySelector(".manage-modal-cancel");
    cancel?.addEventListener("click", () => close(null));
    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) close(null);
      },
      { once: true }
    );
  });
}

async function openManageConfirm({ title, message, confirmLabel = "Confirm" } = {}) {
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";
  const shell = document.createElement("div");
  shell.className = "manage-modal";
  shell.innerHTML = `
    <h3>${escapeHtml(title || "Confirm Action")}</h3>
    <p style="margin:0;color:var(--muted);">${escapeHtml(message || "Please confirm this action.")}</p>
    <div class="manage-modal-actions">
      <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
      <button type="button" class="btn manage-modal-confirm">${escapeHtml(confirmLabel)}</button>
    </div>
  `;
  overlay.appendChild(shell);
  return new Promise((resolve) => {
    const close = (result) => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      resolve(result);
    };
    shell.querySelector(".manage-modal-cancel")?.addEventListener("click", () => close(false));
    shell.querySelector(".manage-modal-confirm")?.addEventListener("click", () => close(true));
    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) close(false);
      },
      { once: true }
    );
  });
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);
}

function setCommandCenterStatus(message, isError = false) {
  if (!commandCenterStatus) return;
  commandCenterStatus.textContent = message || "";
  commandCenterStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function focusBookingOperations() {
  const section = bookingTools || bookingsList;
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function writeToClipboard(text) {
  if (!navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function runCommandCenterAction(actionId) {
  if (!actionId) return;
  if (!bookingStatus || !bookingSort) return;

  if (actionId === "fill-cancellations") {
    bookingStatus.value = "cancelled";
    setActiveStatusChip("cancelled");
    applyBookingFilters();
    (waitlistSection || bookingTools || bookingsList)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCommandCenterStatus("Showing cancelled bookings and opening waitlist tools for fast backfill.");
    return;
  }

  if (actionId === "boost-today-demand") {
    const offerTemplate = "Same-day availability just opened up. Reply now to reserve your slot.";
    const copied = await writeToClipboard(offerTemplate);
    bookingStatus.value = "all";
    setActiveStatusChip("all");
    bookingSort.value = "newest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus(
      copied
        ? "Campaign template copied. Use it for SMS/email blast now."
        : "Campaign idea ready: Send a same-day availability offer to recent clients."
    );
    return;
  }

  if (actionId === "tighten-confirmations") {
    bookingStatus.value = "confirmed";
    setActiveStatusChip("confirmed");
    bookingSort.value = "newest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus("Focused on confirmed bookings. Prioritize reminders for today's appointments.");
    return;
  }

  if (actionId === "maintain-momentum") {
    bookingStatus.value = "confirmed";
    setActiveStatusChip("confirmed");
    bookingSort.value = "oldest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus("Stable day. Focus your team on rebooking and upsells at checkout.");
  }
}

function renderCommandCenter() {
  if (!subscriberCommandCenterSection || !commandCenterCards || !commandCenterActions) return;
  if (!(user.role === "subscriber" || user.role === "admin")) {
    subscriberCommandCenterSection.style.display = "none";
    return;
  }

  const data = subscriberCommandCenter || {
    today: { totalBookings: 0, confirmedBookings: 0, estimatedRevenue: 0, lastMinuteCancellations: 0 },
    next7Days: { confirmedBookings: 0, estimatedRevenue: 0 },
    serviceHealth: { cancellationRate: 0 },
    recommendedActions: [{ label: "Load bookings", detail: "No command-center data yet." }]
  };

  const cards = [
    { label: "Today", value: data.today?.totalBookings ?? 0 },
    { label: "Revenue", value: formatMoney(data.today?.estimatedRevenue ?? 0) },
    { label: "Next 7 Days", value: data.next7Days?.confirmedBookings ?? 0 },
    { label: "Risk", value: `${Number(data.serviceHealth?.cancellationRate || 0).toFixed(1)}%` }
  ];

  commandCenterCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "command-card";
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    commandCenterCards.appendChild(article);
  });

  const actions = Array.isArray(data.recommendedActions) ? data.recommendedActions : [];
  commandCenterActions.innerHTML = "";
  actions.slice(0, 3).forEach((action) => {
    const li = document.createElement("li");
    const actionId = String(action.id || "").trim();
    li.innerHTML = `
      <div><strong>${action.label || "Action"}</strong></div>
      <small>${action.detail || ""}</small>
      <div class="action-controls">
        <button class="btn btn-ghost command-action-run" type="button" data-action-id="${actionId}">Open</button>
      </div>
    `;
    commandCenterActions.appendChild(li);
  });
  setCommandCenterStatus(actions.length ? "Start with the first action and keep the day moving." : "No priority actions yet.");
  renderExecutivePulse();
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(dateValue) {
  return `${dateValue.getFullYear()}-${pad2(dateValue.getMonth() + 1)}-${pad2(dateValue.getDate())}`;
}

function getExecutivePulseScopeKey() {
  const safeFrontDeskBusinessId =
    typeof frontDeskBusiness !== "undefined" && frontDeskBusiness && typeof frontDeskBusiness === "object"
      ? String(frontDeskBusiness.id || "").trim()
      : "";
  const businessId =
    String(managedBusinessId || safeFrontDeskBusinessId || "").trim() ||
    (isMockMode ? "mock-business" : "no-business");
  return `${String(user.role || "subscriber").toLowerCase()}:${businessId}`;
}

function getExecutivePulseSnapshotStorageKey() {
  return `${EXECUTIVE_PULSE_SNAPSHOTS_STORAGE_KEY}:${getExecutivePulseScopeKey()}`;
}

function readExecutivePulseSnapshots() {
  try {
    const rows = JSON.parse(localStorage.getItem(getExecutivePulseSnapshotStorageKey()) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeExecutivePulseSnapshots(rows) {
  try {
    localStorage.setItem(getExecutivePulseSnapshotStorageKey(), JSON.stringify(Array.isArray(rows) ? rows.slice(0, 20) : []));
  } catch {
    // Ignore localStorage errors.
  }
}

function getExecutivePulseRangeConfig(range = "day") {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return { key: "year", label: "This year", chartLabel: "Monthly trend", start, end, groupBy: "month", bucketCount: 12 };
  }
  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { key: "month", label: "This month", chartLabel: "Weekly trend", start, end, groupBy: "week", bucketCount: 8 };
  }
  if (range === "week") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    return { key: "week", label: "Last 7 days", chartLabel: "Daily trend", start, end, groupBy: "day", bucketCount: 7 };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const workingHours = getExecutivePulseWorkingHoursForDate(start);
  const hourStartMin = Number.isFinite(workingHours?.startMinutes) ? workingHours.startMinutes : 8 * 60;
  const hourEndMin = Number.isFinite(workingHours?.endMinutes) ? workingHours.endMinutes : 20 * 60;
  const bucketCount = Math.max(1, Math.min(16, Math.ceil((hourEndMin - hourStartMin) / 60)));
  return {
    key: "day",
    label: "Today",
    chartLabel: "Hourly flow",
    start,
    end,
    groupBy: "hour",
    bucketCount,
    hourStartMin,
    hourEndMin
  };
}

function getExecutiveRowRevenueEstimate(row) {
  const candidates = [row?.price, row?.amount, row?.total, row?.estimatedPrice, row?.servicePrice];
  for (const value of candidates) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return 0;
}

function parseFlexibleHourTextToMinutes(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  const simple24h = raw.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (simple24h) {
    const h = Number(simple24h[1]);
    const m = Number(simple24h[2] || 0);
    if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) return h * 60 + m;
  }
  const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampm) {
    const baseHour = Number(ampm[1]);
    const mins = Number(ampm[2] || 0);
    if (!Number.isFinite(baseHour) || !Number.isFinite(mins) || baseHour < 1 || baseHour > 12 || mins < 0 || mins > 59) return null;
    const suffix = ampm[3];
    const h24 = suffix === "pm" ? (baseHour % 12) + 12 : baseHour % 12;
    return h24 * 60 + mins;
  }
  return null;
}

function parseBusinessHoursRangeToMinutes(value) {
  const raw = String(value || "").trim();
  if (!raw || /closed/i.test(raw)) return null;
  const normalized = raw
    .replace(/[–—]/g, "-")
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, " ")
    .trim();
  const parts = normalized.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const startMinutes = parseFlexibleHourTextToMinutes(parts[0]);
  const endMinutes = parseFlexibleHourTextToMinutes(parts[1]);
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return null;
  if (endMinutes <= startMinutes) return null;
  return { startMinutes, endMinutes };
}

function getExecutivePulseWorkingHoursForDate(dateValue) {
  const dt = dateValue instanceof Date ? dateValue : new Date();
  const weekdayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayKey = weekdayKeys[dt.getDay()] || "monday";
  const safeFrontDeskBusinessHours =
    typeof frontDeskBusiness !== "undefined" && frontDeskBusiness && typeof frontDeskBusiness === "object"
      ? frontDeskBusiness.hours
      : null;
  const hourSources = [
    safeFrontDeskBusinessHours
  ];
  for (const source of hourSources) {
    if (!source || typeof source !== "object") continue;
    const parsed = parseBusinessHoursRangeToMinutes(source[dayKey]);
    if (parsed) return parsed;
  }
  const inputMap = {
    monday: businessHoursMonday,
    tuesday: businessHoursTuesday,
    wednesday: businessHoursWednesday,
    thursday: businessHoursThursday,
    friday: businessHoursFriday,
    saturday: businessHoursSaturday,
    sunday: businessHoursSunday
  };
  return parseBusinessHoursRangeToMinutes(inputMap[dayKey]?.value || "");
}

function parseExecutiveBookingRowTimeMinutes(row) {
  const raw = String(row?.time || "").trim();
  if (!raw) return null;
  const parsed24h = parseTimeToMinutes(raw);
  if (Number.isFinite(parsed24h)) return parsed24h;
  const parsedFlexible = parseFlexibleHourTextToMinutes(raw);
  if (Number.isFinite(parsedFlexible)) return parsedFlexible;
  const loose = raw.match(/^(\d{1,2})/);
  if (loose) {
    const hour = Number(loose[1]);
    if (Number.isFinite(hour) && hour >= 0 && hour <= 23) return hour * 60;
  }
  return null;
}

function getExecutivePulseBuckets(rows, rangeConfig, profitMarginPct) {
  const marginFactor = Math.max(0, Math.min(0.95, Number.isFinite(profitMarginPct) ? profitMarginPct / 100 : 0.35));
  const buckets = [];
  const map = new Map();
  const addBucket = (key, label) => {
    if (!map.has(key)) {
      const bucket = { key, label, bookings: 0, confirmed: 0, cancelled: 0, revenue: 0, profit: 0 };
      map.set(key, bucket);
      buckets.push(bucket);
    }
    return map.get(key);
  };

  if (rangeConfig.groupBy === "hour") {
    const hourStartMin = Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 8 * 60;
    const hourEndMin = Number.isFinite(rangeConfig.hourEndMin) ? rangeConfig.hourEndMin : 20 * 60;
    for (let mins = hourStartMin; mins < hourEndMin; mins += 60) {
      const hourKey = `h-${Math.floor(mins / 60)}`;
      const label = formatMinutesToTime(mins).replace(":00 ", "").replace(" AM", "a").replace(" PM", "p");
      addBucket(hourKey, label);
    }
  }

  rows.forEach((row) => {
    const dt = parseBookingDate(row?.date);
    if (!dt) return;
    if (dt < rangeConfig.start || dt > rangeConfig.end) return;
    let key = "";
    let label = "";
    if (rangeConfig.groupBy === "month") {
      key = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}`;
      label = dt.toLocaleDateString("en-GB", { month: "short" });
    } else if (rangeConfig.groupBy === "week") {
      const weekStart = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - dt.getDay());
      key = `w-${toDateKey(weekStart)}`;
      label = weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    } else if (rangeConfig.groupBy === "day") {
      key = toDateKey(dt);
      label = dt.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    } else {
      const rowMinutes = parseExecutiveBookingRowTimeMinutes(row);
      const fallbackMinutes = Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 12 * 60;
      const clampedMinutes = Math.max(
        Number.isFinite(rangeConfig.hourStartMin) ? rangeConfig.hourStartMin : 0,
        Math.min(
          Number.isFinite(rangeConfig.hourEndMin) ? Math.max((rangeConfig.hourEndMin || 60) - 1, 0) : (23 * 60 + 59),
          Number.isFinite(rowMinutes) ? rowMinutes : fallbackMinutes
        )
      );
      const hourStart = Math.floor(clampedMinutes / 60) * 60;
      key = `h-${Math.floor(hourStart / 60)}`;
      label = formatMinutesToTime(hourStart).replace(":00 ", "").replace(" AM", "a").replace(" PM", "p");
    }
    const status = String(row?.status || "").toLowerCase();
    const bucket = addBucket(key, label);
    bucket.bookings += 1;
    if (status === "cancelled") bucket.cancelled += 1;
    if (status === "confirmed" || status === "completed") bucket.confirmed += 1;
    const revenue = status === "cancelled" ? 0 : getExecutiveRowRevenueEstimate(row);
    bucket.revenue += revenue;
    bucket.profit += revenue * marginFactor;
  });

  if (rangeConfig.groupBy !== "hour") {
    buckets.sort((a, b) => String(a.key).localeCompare(String(b.key)));
    if (buckets.length > rangeConfig.bucketCount) return buckets.slice(-rangeConfig.bucketCount);
  }
  return buckets.slice(0, rangeConfig.bucketCount);
}

function renderExecutivePulseMiniBars(container, buckets, valueKey, { emptyText = "No data yet" } = {}) {
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(buckets) || !buckets.length) {
    container.innerHTML = `<small style="color:var(--muted);grid-column:1 / -1;">${escapeHtml(emptyText)}</small>`;
    return;
  }
  const maxValue = Math.max(1, ...buckets.map((b) => Number(b?.[valueKey] || 0)));
  buckets.forEach((bucket) => {
    const value = Number(bucket?.[valueKey] || 0);
    const height = Math.max(6, Math.round((value / maxValue) * 92));
    const col = document.createElement("div");
    col.className = "executive-mini-bar-col";
    col.innerHTML = `
      <div class="executive-mini-bar" style="--exec-mini-bar-height:${height}px" title="${escapeHtml(bucket.label)}: ${escapeHtml(String(Math.round(value)))}"></div>
      <small>${escapeHtml(String(bucket.label))}</small>
    `;
    container.appendChild(col);
  });
}

function renderExecutivePulseSnapshotsList(items) {
  if (!executivePulseSnapshotList) return;
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) {
    executivePulseSnapshotList.innerHTML = `<div class="executive-snapshot-empty">Save an Executive Pulse snapshot to keep a quick performance checkpoint for later reviews.</div>`;
    return;
  }
  executivePulseSnapshotList.innerHTML = "";
  rows.slice(0, 10).forEach((item) => {
    const wrapper = document.createElement("article");
    wrapper.className = "executive-snapshot-item";
    const savedAt = item?.savedAt ? formatDateTime(item.savedAt) : "Unknown";
    wrapper.innerHTML = `
      <div class="executive-snapshot-item-head">
        <strong>${escapeHtml(String(item.rangeLabel || "Snapshot"))}</strong>
        <small>${escapeHtml(String(savedAt))}</small>
      </div>
      <p>${escapeHtml(String(item.headline || "Performance snapshot saved."))}</p>
      <ul>
        <li>Revenue: ${escapeHtml(String(item.revenue || "£0.00"))}</li>
        <li>Profit: ${escapeHtml(String(item.profit || "£0.00"))}</li>
        <li>Bookings: ${escapeHtml(String(item.bookings || 0))} (${escapeHtml(String(item.confirmed || 0))} confirmed)</li>
        <li>Cancellations: ${escapeHtml(String(item.cancelled || 0))} (${escapeHtml(String(item.cancelRate || "0%"))})</li>
      </ul>
    `;
    executivePulseSnapshotList.appendChild(wrapper);
  });
}

function parseBookingDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const safe = new Date(`${raw}T12:00:00`);
    return Number.isNaN(safe.getTime()) ? null : safe;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function updateBookingRangeControls() {
  const buttonMap = [
    [bookingRangeToday, "today"],
    [bookingRangeWeek, "week"],
    [bookingRangeMonth, "month"],
    [bookingRangeClear, ""]
  ];
  buttonMap.forEach(([button, preset]) => {
    if (!button) return;
    const active = preset ? bookingDateFilterPreset === preset : !bookingDateFilterPreset && !selectedCalendarDateKey && !bookingDateFilterKeys;
    button.classList.toggle("active", active);
  });
  if (bookingCalendarSelectionStatus) {
    bookingCalendarSelectionStatus.textContent = `Calendar filter: ${bookingDateFilterLabel || "All dates"}`;
  }
}

function setBookingDateFilter({ keys = null, label = "All dates", preset = "", selectedDateKey = "" } = {}) {
  bookingDateFilterKeys = keys instanceof Set && keys.size ? keys : null;
  bookingDateFilterLabel = label || "All dates";
  bookingDateFilterPreset = preset || "";
  selectedCalendarDateKey = selectedDateKey || "";
  updateBookingRangeControls();
}

function dateKeyRangeForPreset(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "today") {
    return { from: today, to: today, label: "Today" };
  }
  if (preset === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: start, to: end, label: "This Week" };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: start, to: end, label: "This Month" };
  }
  return null;
}

function makeDateKeySet(from, to) {
  if (!(from instanceof Date) || !(to instanceof Date)) return null;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;
  const keys = new Set();
  const cursor = new Date(start);
  while (cursor <= end) {
    keys.add(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function applyBookingDatePreset(preset) {
  const range = dateKeyRangeForPreset(preset);
  if (!range) {
    setBookingDateFilter({ keys: null, label: "All dates" });
    applyBookingFilters();
    renderSubscriberCalendar();
    return;
  }
  const keys = makeDateKeySet(range.from, range.to);
  setBookingDateFilter({ keys, label: range.label, preset, selectedDateKey: "" });
  applyBookingFilters();
  renderSubscriberCalendar();
}

function renderExecutivePulse() {
  if (!subscriberExecutivePulseSection || !executivePulseSignals || !executivePulseGauges || !executivePulseBars || !executivePulseActions) return;
  if (!(user.role === "subscriber" || user.role === "admin")) {
    hideSection(subscriberExecutivePulseSection);
    return;
  }
  showSection(subscriberExecutivePulseSection);

  const rangeConfig = getExecutivePulseRangeConfig(executivePulseRange);
  const allRows = Array.isArray(bookingRows) ? bookingRows : [];
  const rowsInRange = allRows.filter((row) => {
    const d = parseBookingDate(row?.date);
    return d && d >= rangeConfig.start && d <= rangeConfig.end;
  });
  const statusOf = (row) => String(row?.status || "").toLowerCase();
  const bookingCount = rowsInRange.length;
  const confirmedCount = rowsInRange.filter((row) => ["confirmed", "completed"].includes(statusOf(row))).length;
  const completedCount = rowsInRange.filter((row) => statusOf(row) === "completed").length;
  const cancelledCount = rowsInRange.filter((row) => statusOf(row) === "cancelled").length;
  const pendingCount = rowsInRange.filter((row) => isPendingConfirmationStatus(row?.status)).length;
  const cancelRate = bookingCount ? (cancelledCount / bookingCount) * 100 : 0;
  const revenue = rowsInRange.reduce((sum, row) => sum + (statusOf(row) === "cancelled" ? 0 : getExecutiveRowRevenueEstimate(row)), 0);
  const avgTicket = bookingCount ? revenue / Math.max(1, confirmedCount || bookingCount - cancelledCount || 1) : 0;
  const cancellationValue = rowsInRange
    .filter((row) => statusOf(row) === "cancelled")
    .reduce((sum, row) => sum + getExecutiveRowRevenueEstimate(row), 0);
  const marginPct = Number(profitabilityPayload?.summary?.profitMarginPercent || 35);
  const estimatedProfit = revenue * Math.max(0, Math.min(0.95, marginPct / 100));
  const todayKey = toDateKey(new Date());
  const todayRows = allRows.filter((row) => String(row?.date || "").trim() === todayKey);
  const todayRevenue = todayRows.reduce((sum, row) => sum + (statusOf(row) === "cancelled" ? 0 : getExecutiveRowRevenueEstimate(row)), 0);
  const selectedRows = selectedCalendarDateKey ? allRows.filter((row) => String(row?.date || "").trim() === selectedCalendarDateKey) : [];
  const buckets = getExecutivePulseBuckets(rowsInRange, rangeConfig, marginPct);

  executivePulseRangeTabs?.querySelectorAll("button[data-exec-range]").forEach((btn) => {
    const key = String(btn.getAttribute("data-exec-range") || "");
    const active = key === executivePulseRange;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (executivePulseRangeMeta) executivePulseRangeMeta.textContent = `${rangeConfig.label} - ${bookingCount} bookings`;
  if (executivePulseSubtitle) {
    const roleLabel = user.role === "admin" ? "Admin view" : "Owner view";
    executivePulseSubtitle.textContent = `${roleLabel}: quick read for ${rangeConfig.label.toLowerCase()} bookings, cancellations, revenue and next steps.`;
  }
  if (executivePulseFinanceWindowLabel) executivePulseFinanceWindowLabel.textContent = `${rangeConfig.label} finance and booking summary`;

  const signalCards = [
    { label: rangeConfig.key === "day" ? "Today Bookings" : `${rangeConfig.label} Bookings`, value: String(bookingCount), delta: `${confirmedCount} confirmed/completed`, down: false },
    { label: "Revenue", value: formatMoney(revenue), delta: `${formatMoney(avgTicket)} avg ticket`, down: false },
    { label: "Cancellation Rate", value: `${cancelRate.toFixed(1)}%`, delta: `${cancelledCount} cancelled`, down: cancelRate >= 10 },
    { label: "Pending Confirmations", value: String(pendingCount), delta: pendingCount ? "Front desk follow-up needed" : "No pending confirmations", down: pendingCount > 0 }
  ];
  executivePulseSignals.innerHTML = "";
  signalCards.forEach((card) => {
    const el = document.createElement("article");
    el.className = "executive-signal-card";
    el.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(card.value)}</strong><small class="${card.down ? "down" : ""}">${escapeHtml(card.delta)}</small>`;
    executivePulseSignals.appendChild(el);
  });

  const completionPct = bookingCount ? Math.round((completedCount / bookingCount) * 100) : 0;
  const confirmationPct = bookingCount ? Math.round((confirmedCount / bookingCount) * 100) : 0;
  const cancelPct = bookingCount ? Math.round((cancelledCount / bookingCount) * 100) : 0;
  const gaugeCards = [
    { label: "Completed", value: `${completionPct}%`, progress: completionPct, sub: `${completedCount} completed` },
    { label: "Confirmed Mix", value: `${confirmationPct}%`, progress: confirmationPct, sub: `${confirmedCount} confirmed/completed` },
    { label: "Cancellation Pressure", value: `${cancelPct}%`, progress: cancelPct, sub: `${formatMoney(cancellationValue)} at risk` }
  ];
  executivePulseGauges.innerHTML = "";
  gaugeCards.forEach((g) => {
    const card = document.createElement("article");
    card.className = "executive-gauge";
    card.innerHTML = `
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, Number(g.progress || 0)))}">
        <span>${escapeHtml(g.value)}</span>
      </div>
      <div class="executive-gauge-label">${escapeHtml(g.label)}</div>
      <div class="executive-gauge-sub">${escapeHtml(g.sub)}</div>
    `;
    executivePulseGauges.appendChild(card);
  });

  executivePulseBars.innerHTML = "";
  if (!buckets.length) {
    executivePulseBars.innerHTML = `<small style="color:var(--muted);grid-column:1 / -1;">No booking activity in ${escapeHtml(rangeConfig.label.toLowerCase())} yet.</small>`;
  } else {
    const maxBucket = Math.max(1, ...buckets.map((b) => Number(b.bookings || 0)));
    buckets.forEach((bucket) => {
      const count = Number(bucket.bookings || 0);
      const height = Math.max(10, Math.round((count / maxBucket) * 110));
      const col = document.createElement("article");
      col.className = "executive-bar-col";
      col.innerHTML = `
        <div class="executive-bar" style="--exec-bar-height:${height}px" title="${escapeHtml(String(bucket.label))}: ${count} bookings"></div>
        <small>${escapeHtml(String(bucket.label))}</small>
        <small>${count}</small>
      `;
      executivePulseBars.appendChild(col);
    });
  }

  const actionItems = [];
  if (pendingCount > 0) actionItems.push({ title: "Confirm bookings", detail: `${pendingCount} booking${pendingCount === 1 ? "" : "s"} need confirmation or a callback.` });
  if (cancelRate >= 10) actionItems.push({ title: "Refill cancellations", detail: "Use Waitlist Recovery and reminder follow-up to refill lost slots quickly." });
  if (selectedCalendarDateKey) {
    actionItems.push({ title: "Work selected day", detail: `${selectedCalendarDateKey} is selected (${selectedRows.length} bookings). Ask Lexi for a short action plan.` });
  } else {
    actionItems.push({ title: "Pick a day", detail: "Select a date in the diary to sync Booking Operations and Lexi guidance." });
  }
  if (!actionItems.length) actionItems.push({ title: "Steady flow", detail: "No urgent issues. Focus on service quality, rebooking, and filling quiet windows." });
  executivePulseActions.innerHTML = "";
  actionItems.slice(0, 4).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small>`;
    executivePulseActions.appendChild(li);
  });

  if (executivePulseFinanceStats) {
    const cards = [
      { label: `${rangeConfig.label} Revenue`, value: formatMoney(revenue), meta: `${bookingCount} bookings`, tone: "positive" },
      { label: "Estimated Profit", value: formatMoney(estimatedProfit), meta: `${Math.round(marginPct)}% margin signal`, tone: estimatedProfit < 0 ? "negative" : "neutral" },
      { label: "Today Revenue", value: formatMoney(todayRevenue), meta: `${todayRows.length} today bookings`, tone: "neutral" },
      { label: "Cancellation Risk", value: formatMoney(cancellationValue), meta: `${cancelledCount} cancelled in range`, tone: cancelledCount ? "negative" : "neutral" }
    ];
    executivePulseFinanceStats.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.className = `executive-finance-stat ${card.tone || "neutral"}`;
      article.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.meta)}</small>`;
      executivePulseFinanceStats.appendChild(article);
    });
  }

  if (executivePulseRevenueChartNote) executivePulseRevenueChartNote.textContent = rangeConfig.chartLabel;
  if (executivePulseProfitChartNote) executivePulseProfitChartNote.textContent = rangeConfig.chartLabel;
  renderExecutivePulseMiniBars(executivePulseRevenueChart, buckets, "revenue", { emptyText: "No revenue data in this range yet." });
  renderExecutivePulseMiniBars(executivePulseProfitChart, buckets, "profit", { emptyText: "No profit signal yet." });

  latestExecutivePulseSnapshotDraft = {
    range: rangeConfig.key,
    rangeLabel: rangeConfig.label,
    headline: `${rangeConfig.label} pulse summary`,
    revenue: formatMoney(revenue),
    profit: formatMoney(estimatedProfit),
    bookings: bookingCount,
    confirmed: confirmedCount,
    cancelled: cancelledCount,
    cancelRate: `${cancelRate.toFixed(1)}%`
  };
  renderExecutivePulseSnapshotsList(readExecutivePulseSnapshots());
}
function renderWorkspaceStarPanel() {
  if (!workspaceStarPanel) return;
  const isBizRole = user.role === "subscriber" || user.role === "admin";
  workspaceStarPanel.style.display = isBizRole ? "" : "none";
  if (!isBizRole) return;

  const todayKey = toDateKey(new Date());
  const todayRows = bookingRows.filter((row) => String(row?.date || "").trim() === todayKey);
  const todayRevenue = todayRows
    .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const selectedRows = selectedCalendarDateKey
    ? bookingRows.filter((row) => String(row?.date || "").trim() === selectedCalendarDateKey)
    : [];
  const pendingCount = bookingRows.filter((row) => isPendingConfirmationStatus(row?.status)).length;
  const selectedCount = selectedRows.length;
  const selectedRevenue = selectedRows
    .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const monthLabel = String(calendarMonthLabel?.textContent || "Current month").trim();
  const todayDiaryLabel = workspaceStarPanel.querySelector(".workspace-star-card:nth-child(2) p");
  if (todayDiaryLabel) todayDiaryLabel.textContent = "Today's Diary";

  if (workspaceStarCalendarFocus) {
    workspaceStarCalendarFocus.textContent = selectedCalendarDateKey
      ? `${selectedCalendarDateKey} selected`
      : `${monthLabel} diary view`;
  }
  if (workspaceStarCalendarNote) {
    workspaceStarCalendarNote.textContent = selectedCalendarDateKey
      ? `${selectedCount} booking${selectedCount === 1 ? "" : "s"} - ${formatMoney(selectedRevenue)} in view`
      : "Pick a day in the calendar to sync Booking Operations and Lexi guidance.";
  }
  if (workspaceStarTodayCount) {
    workspaceStarTodayCount.textContent = `${todayRows.length} booking${todayRows.length === 1 ? "" : "s"} today`;
  }
  if (workspaceStarTodayRevenue) {
    workspaceStarTodayRevenue.textContent = `Revenue snapshot: ${formatMoney(todayRevenue)}`;
  }
  if (workspaceStarLexiPrompt) {
    workspaceStarLexiPrompt.textContent = selectedCalendarDateKey
      ? `Review ${selectedCalendarDateKey} and tell me what needs attention first.`
      : "Review today’s diary and tell me the next 3 front-desk actions.";
  }
  if (workspaceStarLexiHint) {
    workspaceStarLexiHint.textContent = pendingCount > 0
      ? `${pendingCount} pending confirmation${pendingCount === 1 ? "" : "s"} detected.`
      : "Short, direct actions for the front desk.";
  }
  if (workspaceStarSummary) {
    workspaceStarSummary.textContent = selectedCalendarDateKey
      ? `Calendar day filter is active for ${selectedCalendarDateKey}. Ask Lexi for quick actions, rebooking priorities, or confirmation follow-up.`
      : "Start with the diary, then ask Lexi for the shortest action plan for bookings, cancellations, and confirmations.";
  }
  if (workspaceStarLexiPrompt) {
    workspaceStarLexiPrompt.textContent = selectedCalendarDateKey
      ? `Review ${selectedCalendarDateKey} and tell me what needs attention first.`
      : "Review today's diary and tell me the next 3 front-desk actions.";
  }
  if (workspaceStarSummary) {
    workspaceStarSummary.textContent = selectedCalendarDateKey
      ? `Calendar day filter is active for ${selectedCalendarDateKey}. Ask Lexi for quick actions, rebooking priorities or confirmation follow-up.`
      : "Start with the diary, then ask Lexi for the shortest action plan for bookings, cancellations and confirmations.";
  }
}

function dashboardLexiPromptForSource(source) {
  const key = String(source || "").trim().toLowerCase();
  if (key === "booking_diary") return "Review my booking diary and tell me what needs attention first.";
  if (key === "daily_workspace") return "What should I focus on today in the business?";
  if (key === "executive_pulse") return "Give me a simple executive summary for today, this week, and this month.";
  if (key === "hub_setup") return "Walk me through the most important business setup tasks next.";
  if (key === "business_modules") return "Which business module should I use next and why?";
  return "";
}

function openDashboardLexiForCurrentRole(trigger, source = "") {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const lexiRole = user.role === "admin" ? "admin" : "subscriber";
  openBusinessAiChatPopup(lexiRole, {
    trigger: trigger instanceof HTMLElement ? trigger : null,
    focusInput: true,
    prompt: dashboardLexiPromptForSource(source)
  });
}

function openDashboardLexiForRole(role, source = "", trigger = null) {
  const requestedRole = String(role || "").trim().toLowerCase();
  const normalizedRole = requestedRole === "current"
    ? (user.role === "admin" ? "admin" : "subscriber")
    : (requestedRole === "admin" ? "admin" : "subscriber");
  if (normalizedRole === "admin" && user.role !== "admin") return;
  if (normalizedRole === "subscriber" && !(user.role === "subscriber" || user.role === "admin")) return;
  openBusinessAiChatPopup(normalizedRole, {
    trigger: trigger instanceof HTMLElement ? trigger : null,
    focusInput: true,
    prompt: dashboardLexiPromptForSource(source)
  });
}

window.openDashboardLexiForRole = (role, source = "", triggerId = "") => {
  const trigger = triggerId ? document.getElementById(String(triggerId || "").trim()) : null;
  openDashboardLexiForRole(role, source, trigger);
};

function renderSubscriberCalendar() {
  if (!bookingCalendarGrid || !calendarMonthLabel || !calendarLegend) return;

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    firstDay
  );
  calendarMonthLabel.textContent = monthLabel;

  const bookingCountByDate = new Map();
  bookingRows.forEach((booking) => {
    const bookingDate = parseBookingDate(booking.date);
    if (!bookingDate) return;
    const key = toDateKey(bookingDate);
    bookingCountByDate.set(key, (bookingCountByDate.get(key) || 0) + 1);
  });

  let monthStaffLegendCount = 0;
  if (bookingCalendarStaffLegend) {
    const monthStaffMap = new Map();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, month, d);
      getStaffWorkingForDate(date).forEach((staff) => {
        if (!monthStaffMap.has(staff.id)) monthStaffMap.set(staff.id, staff);
      });
    }
    const chips = Array.from(monthStaffMap.values())
      .slice(0, 10)
      .map((staff) => `
        <span class="calendar-staff-chip" title="${escapeHtml(staff.name)}">
          <span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(staff.color)}">${escapeHtml(getStaffInitials(staff.name))}</span>
          <span>${escapeHtml(staff.name)}</span>
        </span>
      `);
    if (monthStaffMap.size > 10) {
      chips.push(`<span class="calendar-staff-chip">+${monthStaffMap.size - 10} more staff</span>`);
    }
    bookingCalendarStaffLegend.innerHTML = chips.join("");
    monthStaffLegendCount = monthStaffMap.size;
  }

  bookingCalendarGrid.innerHTML = "";
  const todayKey = toDateKey(new Date());
  const weekdayOffset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < weekdayOffset; i += 1) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day empty";
    bookingCalendarGrid.appendChild(spacer);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let monthlyBookings = 0;
  let activeDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDate = new Date(year, month, day);
    const key = toDateKey(currentDate);
    const count = bookingCountByDate.get(key) || 0;
    const staffWorking = getStaffWorkingForDate(currentDate);
    if (count > 0) {
      monthlyBookings += count;
      activeDays += 1;
    }

    const visibleStaffDots = staffWorking.slice(0, 4);
    const extraStaffCount = Math.max(0, staffWorking.length - visibleStaffDots.length);
    const staffTitle = staffWorking.length
      ? `Working staff: ${staffWorking.map((item) => item.name).join(", ")}`
      : "No rota coverage set";
    const cell = document.createElement("article");
    const selected = selectedCalendarDateKey && selectedCalendarDateKey === key;
    const isToday = key === todayKey;
    cell.className = `calendar-day${count > 0 ? " has-bookings" : ""}${selected ? " selected" : ""}${isToday ? " is-today" : ""}`;
    cell.dataset.dateKey = key;
    cell.innerHTML = `
      <button class="calendar-day-btn" type="button" data-date-key="${key}" aria-label="${key}: ${count} booking${count === 1 ? "" : "s"}">
        <strong>${day}</strong>
        <small class="calendar-day-count${count > 0 ? "" : " is-empty"}">${count > 0 ? String(count) : ""}</small>
        <span class="calendar-day-staff-dots" title="${escapeHtml(staffTitle)}" aria-label="${escapeHtml(staffTitle)}">
          ${visibleStaffDots
            .map(
              (item) =>
                `<span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(item.color)}" title="${escapeHtml(item.name)}">${escapeHtml(
                  getStaffInitials(item.name)
                )}</span>`
            )
            .join("")}
          ${extraStaffCount > 0 ? `<span class="calendar-day-staff-more">+${extraStaffCount}</span>` : ""}
        </span>
      </button>
    `;
    bookingCalendarGrid.appendChild(cell);
  }

  calendarLegend.textContent =
    monthlyBookings > 0
      ? `${monthlyBookings} bookings across ${activeDays} day${activeDays === 1 ? "" : "s"} this month.`
      : "No bookings in the diary this month yet.";
  renderCalendarFeatureSidebarLexi({
    monthLabel,
    monthlyBookings,
    activeDays,
    staffLegendCount: monthStaffLegendCount,
    selectedDay: selectedCalendarDateSummary()
  });
  updateBookingRangeControls();
  renderBusinessAiWorkspace("subscriber");
  renderBusinessAiWorkspace("admin");
  renderWorkspaceStarPanel();
}

function scheduleCalendarTodayRefresh() {
  if (calendarTodayRefreshTimerId) {
    window.clearTimeout(calendarTodayRefreshTimerId);
    calendarTodayRefreshTimerId = null;
  }
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
  const delayMs = Math.max(1000, nextMidnight.getTime() - now.getTime());
  calendarTodayRefreshTimerId = window.setTimeout(() => {
    renderSubscriberCalendar();
    scheduleCalendarTodayRefresh();
  }, delayMs);
}

function getRotaDayKeyFromDate(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDay();
  if (day === 0) return "sun";
  return STAFF_ROTA_DAYS[day - 1]?.key || "";
}

function getRotaWeekStartKeyForDate(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return formatDateKey(d);
}

function getStaffWorkingForDate(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return [];
  if (!staffRotaOverridesLoaded) loadStaffRotaOverrides();
  const dayKey = getRotaDayKeyFromDate(dateObj);
  const weekKey = getRotaWeekStartKeyForDate(dateObj);
  if (!dayKey || !weekKey) return [];
  const week = staffRotaOverrides?.[weekKey];
  const weekCells = week?.cells && typeof week.cells === "object" ? week.cells : {};
  return (Array.isArray(staffRosterRows) ? staffRosterRows : [])
    .map((member) => {
      const memberId = getStaffMemberId(member);
      if (!memberId) return null;
      const overrideCell = weekCells?.[memberId]?.[dayKey];
      let status = "";
      if (overrideCell && typeof overrideCell === "object") {
        status = normalizeStaffCellStatus(overrideCell.status);
      } else if (typeof overrideCell === "string") {
        status = normalizeStaffCellStatus(overrideCell);
      } else {
        status = getBaseStaffDayStatus(member, dayKey);
      }
      if (!(status === "scheduled" || status === "covering")) return null;
      return {
        id: memberId,
        name: String(member.name || "Staff"),
        color: getStaffColorForId(memberId),
        status
      };
    })
    .filter(Boolean);
}

function parseDateKeyToDate(dateKey) {
  const raw = String(dateKey || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getBookingsForDateKey(dateKey) {
  return bookingRows
    .filter((row) => {
      const d = parseBookingDate(row?.date);
      return d ? toDateKey(d) === dateKey : false;
    })
    .sort((a, b) => {
      const aTime = String(a?.time || "");
      const bTime = String(b?.time || "");
      if (aTime !== bTime) return aTime.localeCompare(bTime);
      return String(a?.createdAt || "").localeCompare(String(b?.createdAt || ""));
    });
}

function statusChipClass(status) {
  const normalized = normalizeText(status);
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("complete")) return "completed";
  if (normalized.includes("confirm")) return "confirmed";
  return "";
}

function formatCalendarDayTitle(dateKey) {
  const dt = parseDateKeyToDate(dateKey);
  if (!dt) return dateKey;
  return dt.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function parseTimeToMinutes(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null;
  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
  return hours * 60 + mins;
}

function formatMinutesToTime(totalMinutes) {
  const mins = Number(totalMinutes);
  if (!Number.isFinite(mins)) return "n/a";
  const clamped = Math.max(0, Math.round(mins));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = ((hours + 11) % 12) + 1;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function summarizeCalendarDaySchedule(rows = []) {
  const slots = rows
    .map((row) => ({ row, minutes: parseTimeToMinutes(row?.time) }))
    .filter((entry) => Number.isFinite(entry.minutes))
    .sort((a, b) => a.minutes - b.minutes);

  if (!slots.length) {
    return {
      earliest: null,
      latest: null,
      largestGapMins: null,
      gapCount: 0,
      busiestHourLabel: null
    };
  }

  let largestGapMins = 0;
  let gapCount = 0;
  for (let i = 1; i < slots.length; i += 1) {
    const gap = slots[i].minutes - slots[i - 1].minutes;
    if (gap >= 45) {
      gapCount += 1;
      largestGapMins = Math.max(largestGapMins, gap);
    }
  }

  const byHour = new Map();
  slots.forEach((entry) => {
    const hour = Math.floor(entry.minutes / 60);
    byHour.set(hour, (byHour.get(hour) || 0) + 1);
  });
  const busiestHour = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0] || null;
  const busiestHourLabel = busiestHour
    ? `${formatMinutesToTime(busiestHour[0] * 60)}-${formatMinutesToTime(busiestHour[0] * 60 + 59)} (${busiestHour[1]})`
    : null;

  return {
    earliest: slots[0].minutes,
    latest: slots[slots.length - 1].minutes,
    largestGapMins: largestGapMins || null,
    gapCount,
    busiestHourLabel
  };
}

function getServicePriceLookupForDashboard() {
  try {
    const services = parseServiceEditorText(String(businessProfileServices?.value || ""));
    const lookup = new Map();
    services.forEach((svc) => {
      const name = String(svc?.name || "").trim().toLowerCase();
      const price = Number(svc?.price || 0);
      if (name && Number.isFinite(price) && price >= 0) lookup.set(name, price);
    });
    return lookup;
  } catch {
    return new Map();
  }
}

function estimateBookingRevenueValue(row, servicePriceLookup = new Map()) {
  const directCandidates = [row?.price, row?.amount, row?.total, row?.estimatedRevenue];
  for (const candidate of directCandidates) {
    const num = Number(candidate);
    if (Number.isFinite(num) && num >= 0) return { value: num, source: "direct" };
  }
  const serviceName = String(row?.service || "").trim().toLowerCase();
  if (!serviceName) return { value: 0, source: "missing" };
  if (servicePriceLookup.has(serviceName)) {
    return { value: Number(servicePriceLookup.get(serviceName) || 0), source: "service" };
  }
  for (const [name, price] of servicePriceLookup.entries()) {
    if (serviceName.includes(name) || name.includes(serviceName)) {
      return { value: Number(price || 0), source: "service" };
    }
  }
  return { value: 0, source: "missing" };
}

function summarizeCalendarDayRevenue(rows = []) {
  const servicePriceLookup = getServicePriceLookupForDashboard();
  const summary = {
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    estimatedCount: 0,
    missingCount: 0
  };
  rows.forEach((row) => {
    const estimate = estimateBookingRevenueValue(row, servicePriceLookup);
    const amount = Number(estimate.value || 0);
    if (estimate.source === "service") summary.estimatedCount += 1;
    if (estimate.source === "missing") summary.missingCount += 1;
    summary.total += amount;
    const status = normalizeText(row?.status);
    if (status.includes("cancel")) summary.cancelled += amount;
    else if (status.includes("complete")) summary.completed += amount;
    else if (status.includes("confirm")) summary.confirmed += amount;
    else summary.confirmed += amount;
  });
  return summary;
}

async function refreshBookingsAfterDayPopupMutation() {
  if (isDashboardDemoDataModeActive()) {
    applyBookingFilters();
    renderSubscriberCalendar();
    renderExecutivePulse();
    return;
  }
  if (shouldRenderTopMetricsGrid() && metricsGrid) metricsGrid.innerHTML = "";
  const tasks = [loadBookings({ append: false })];
  if (user.role !== "customer") tasks.push(loadMetrics());
  await Promise.all(tasks);
}

async function openCalendarDayWorkspace(dateKey) {
  const safeDateKey = String(dateKey || "").trim();
  if (!safeDateKey) return;
  if (typeof closeModulePopupActive === "function") {
    closeModulePopupActive();
  }

  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";

  const shell = document.createElement("section");
  shell.className = "calendar-day-modal";
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-labelledby", "calendarDayModalTitle");
  overlay.appendChild(shell);

  const canManage = isDashboardManagerRole() && manageModeEnabled;
  const businessId = String(managedBusinessId || user.businessId || "").trim();

  const close = () => {
    if (typeof closeModulePopupActive !== "function") return;
    document.removeEventListener("keydown", onKeyDown);
    overlay.removeEventListener("click", onOverlayClick);
    overlay.style.display = "none";
    overlay.innerHTML = "";
    closeModulePopupActive = null;
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const onOverlayClick = (event) => {
    if (event.target === overlay) close();
  };

  closeModulePopupActive = close;
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", onOverlayClick);

  const renderDayPopup = () => {
    const rows = getBookingsForDateKey(safeDateKey);
    const total = rows.length;
    const cancelled = rows.filter((row) => normalizeText(row?.status).includes("cancel")).length;
    const confirmed = rows.filter((row) => normalizeText(row?.status) === "confirmed").length;
    const completed = rows.filter((row) => normalizeText(row?.status) === "completed").length;
    const serviceCounts = new Map();
    rows.forEach((row) => {
      const name = String(row?.service || "Service").trim() || "Service";
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    });
    const topServiceEntry = Array.from(serviceCounts.entries()).sort((a, b) => b[1] - a[1])[0] || null;
    const scheduleSummary = summarizeCalendarDaySchedule(rows);
    const revenueSummary = summarizeCalendarDayRevenue(rows);
    const revenueTarget = Math.max(250, Math.round(Math.max(revenueSummary.total, 1) * 1.25 / 10) * 10);
    const revenueProgressPct = revenueTarget > 0 ? Math.min(100, Math.round((revenueSummary.total / revenueTarget) * 100)) : 0;
    const cancelledRevenuePct = revenueSummary.total > 0 ? Math.round((revenueSummary.cancelled / revenueSummary.total) * 100) : 0;
    const completedRevenuePct = revenueSummary.total > 0 ? Math.round((revenueSummary.completed / revenueSummary.total) * 100) : 0;
    const useRevenuePreview = total > 0 && revenueSummary.total <= 0;
    const previewRevenueTotal = Math.max(280, total * 85);
    const previewCancelled = cancelled > 0 ? Math.round(previewRevenueTotal * 0.18) : Math.round(previewRevenueTotal * 0.08);
    const previewCompleted = completed > 0 ? Math.round(previewRevenueTotal * 0.42) : Math.round(previewRevenueTotal * 0.26);
    const previewConfirmed = Math.max(0, previewRevenueTotal - previewCompleted - previewCancelled);
    const revenueDisplay = useRevenuePreview
      ? {
          total: previewRevenueTotal,
          confirmed: previewConfirmed,
          completed: previewCompleted,
          cancelled: previewCancelled,
          target: Math.round(previewRevenueTotal * 1.2 / 10) * 10,
          progressPct: 83,
          cancelledPct: Math.round((previewCancelled / Math.max(previewRevenueTotal, 1)) * 100),
          completedPct: Math.round((previewCompleted / Math.max(previewRevenueTotal, 1)) * 100)
        }
      : {
          total: revenueSummary.total,
          confirmed: revenueSummary.confirmed,
          completed: revenueSummary.completed,
          cancelled: revenueSummary.cancelled,
          target: revenueTarget,
          progressPct: revenueProgressPct,
          cancelledPct: cancelledRevenuePct,
          completedPct: completedRevenuePct
        };

    const bookingCards = rows.length
      ? rows.map((row) => {
          const status = String(row?.status || "pending").trim() || "pending";
          const chipClass = statusChipClass(status);
          const customer = String(row?.customerName || "Customer").trim() || "Customer";
          const service = String(row?.service || "Service").trim() || "Service";
          const bookingId = String(row?.id || "");
          const canEditThis = canManage && bookingId && !normalizeText(status).includes("cancel");
          const canRecoverThis = canManage && bookingId && normalizeText(status).includes("cancel");
          const contactBits = [String(row?.customerPhone || "").trim(), String(row?.customerEmail || "").trim()].filter(Boolean);
          const businessName = String(row?.businessName || "").trim();
          return `
            <li class="calendar-day-booking-card">
              <div class="calendar-day-booking-head">
                <div>
                  <strong>${escapeHtml(row?.time || "Time not set")} - ${escapeHtml(customer)}</strong>
                  <small>${escapeHtml(service)}</small>
                </div>
                <span class="calendar-day-booking-chip ${chipClass}">${escapeHtml(status)}</span>
              </div>
              <div class="calendar-day-booking-meta">
                ${contactBits.length ? `<span>${escapeHtml(contactBits.join(" ? "))}</span>` : "<span>No customer contact saved.</span>"}
                ${businessName ? `<span>${escapeHtml(businessName)}</span>` : ""}
                ${row?.createdAt ? `<span>Created ${escapeHtml(formatDateTime(row.createdAt))}</span>` : ""}
              </div>
              <div class="calendar-day-booking-actions">
                <button class="btn btn-ghost" type="button" data-day-popup-action="open-bookings">Open Booking Operations</button>
                <button class="btn btn-ghost" type="button" data-day-popup-action="edit-booking" data-booking-id="${escapeHtml(bookingId)}" ${canEditThis ? "" : "disabled"}>Edit</button>
                <button class="btn btn-ghost" type="button" data-day-popup-action="delete-booking" data-booking-id="${escapeHtml(bookingId)}" ${canEditThis ? "" : "disabled"}>Delete</button>
                ${canRecoverThis ? `<button class="btn btn-ghost" type="button" data-day-popup-action="recover-slot" data-booking-id="${escapeHtml(bookingId)}">Recover Slot</button>` : ""}
              </div>
            </li>
          `;
        }).join("")
      : `<li class="calendar-day-empty">No bookings in the diary for this day yet.</li>`;

    const helperNote = canManage
      ? "Add, edit, or cancel bookings from this day view. Changes sync back into the dashboard."
      : isDashboardManagerRole()
        ? "Enable Edit Mode to add, edit, or delete bookings from this day view."
        : "This is a read-only day view. Open Booking Operations to review more detail.";
    const scheduleSignalItems = [
      scheduleSummary.earliest != null ? `First booking: ${formatMinutesToTime(scheduleSummary.earliest)}` : "First booking: not set",
      scheduleSummary.latest != null ? `Last booking: ${formatMinutesToTime(scheduleSummary.latest)}` : "Last booking: not set",
      scheduleSummary.busiestHourLabel ? `Peak hour: ${scheduleSummary.busiestHourLabel}` : "Peak hour: not enough bookings yet",
      scheduleSummary.largestGapMins != null
        ? `Largest open gap: ${scheduleSummary.largestGapMins} mins (${scheduleSummary.gapCount} gap${scheduleSummary.gapCount === 1 ? "" : "s"} to fill)`
        : "Open gaps: no major gaps (45+ mins) in loaded bookings"
    ];
    const revenueSignalItems = [
      {
        label: "Estimated Day Revenue",
        value: formatMoney(revenueDisplay.total),
        meterClass: "",
        widthPct: revenueDisplay.progressPct,
        meta: `${revenueDisplay.progressPct}% of day target (${formatMoney(revenueDisplay.target)})${useRevenuePreview ? " ? preview" : ""}`
      },
      {
        label: "Confirmed / Pending Value",
        value: formatMoney(revenueDisplay.confirmed),
        meterClass: "confirmed",
        widthPct: revenueDisplay.total > 0 ? Math.round((revenueDisplay.confirmed / revenueDisplay.total) * 100) : 0,
        meta: revenueDisplay.total > 0 ? `${Math.round((revenueDisplay.confirmed / revenueDisplay.total) * 100)}% of loaded day value${useRevenuePreview ? " (preview)" : ""}` : "No booking value yet"
      },
      {
        label: "Completed Value",
        value: formatMoney(revenueDisplay.completed),
        meterClass: "completed",
        widthPct: revenueDisplay.completedPct,
        meta: revenueDisplay.total > 0 ? `${revenueDisplay.completedPct}% of loaded day value${useRevenuePreview ? " (preview)" : ""}` : "No completed booking value yet"
      },
      {
        label: "Cancelled Value Risk",
        value: formatMoney(revenueDisplay.cancelled),
        meterClass: "cancelled",
        widthPct: revenueDisplay.cancelledPct,
        meta: revenueDisplay.cancelled > 0 ? `${revenueDisplay.cancelledPct}% at risk on this day${useRevenuePreview ? " (preview)" : ""}` : "No cancelled value in loaded day bookings"
      }
    ];
    const daySummaryText = [
      `${formatCalendarDayTitle(safeDateKey)}`,
      `Total bookings: ${total}`,
      `Confirmed: ${confirmed}`,
      `Cancelled: ${cancelled}`,
      `Completed: ${completed}`,
      `Estimated day revenue: ${formatMoney(revenueDisplay.total)}${useRevenuePreview ? " (preview estimate)" : ""}`,
      `Cancelled value risk: ${formatMoney(revenueDisplay.cancelled)}${useRevenuePreview ? " (preview estimate)" : ""}`,
      topServiceEntry ? `Top service: ${topServiceEntry[0]} (${topServiceEntry[1]})` : "Top service: none yet",
      scheduleSignalItems[0],
      scheduleSignalItems[1],
      scheduleSignalItems[2],
      scheduleSignalItems[3]
    ].join("\n");

    shell.innerHTML = `
      <div class="calendar-day-modal-head">
        <div>
          <h3 id="calendarDayModalTitle">${escapeHtml(formatCalendarDayTitle(safeDateKey))}</h3>
          <p>Review the day at a glance, check bookings, and manage schedule changes without leaving the calendar.</p>
          <div class="module-info-modal-meta">
            <span class="module-chip">Calendar day workspace</span>
            <span class="module-chip muted">${escapeHtml(safeDateKey)}</span>
            ${selectedCalendarDateKey === safeDateKey ? '<span class="module-chip muted">Day filter active</span>' : ""}
          </div>
        </div>
        <button type="button" class="module-info-close" aria-label="Close day workspace">x</button>
      </div>
      <div class="calendar-day-modal-body">
        <section class="calendar-day-summary-grid" aria-label="Day summary">
          <article class="calendar-day-stat"><p>Total bookings</p><strong>${total}</strong></article>
          <article class="calendar-day-stat"><p>Confirmed</p><strong>${confirmed}</strong></article>
          <article class="calendar-day-stat"><p>Cancelled</p><strong>${cancelled}</strong></article>
          <article class="calendar-day-stat"><p>Completed</p><strong>${completed}</strong></article>
        </section>
        <section class="calendar-day-layout">
          <div class="calendar-day-pane">
            <div class="calendar-day-actions-row">
              <button class="btn" type="button" data-day-popup-action="add-booking" ${canManage && businessId ? "" : "disabled"}>Add Booking</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="open-bookings">Open Booking Operations</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="open-waitlist">Waitlist Recovery</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="clear-filter">Clear Day Filter</button>
            </div>
            <p class="calendar-day-list-note">${escapeHtml(helperNote)}</p>
            <ul class="calendar-day-booking-list">${bookingCards}</ul>
          </div>
          <aside class="calendar-day-pane">
            <h4>Day Summary</h4>
            <p>${total ? `You have ${total} booking${total === 1 ? "" : "s"} scheduled for this day.` : "No bookings scheduled yet for this day."}</p>
            <div class="module-info-feature-list">
              <li>${escapeHtml(topServiceEntry ? `Most booked service: ${topServiceEntry[0]} (${topServiceEntry[1]})` : "Most booked service: none yet")}</li>
              <li>${escapeHtml(cancelled ? `${cancelled} cancellation${cancelled === 1 ? "" : "s"} on this day. Check waitlist recovery if needed.` : "No cancellations on this day in the loaded bookings.")}</li>
              <li>${escapeHtml(selectedCalendarDateKey === safeDateKey ? "Booking Operations is filtered to this day right now." : "Clicking a date also updates your booking filters for faster follow-up.")}</li>
            </div>
            <h4 style="margin-top:0.15rem;">Schedule Signals</h4>
            <div class="module-info-feature-list">
              ${scheduleSignalItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </div>
            <h4 style="margin-top:0.15rem;">Day Revenue Signals</h4>
            <div class="calendar-day-revenue-gauges">
              ${revenueSignalItems.map((item) => `
                <article class="calendar-day-revenue-gauge">
                  <div class="calendar-day-revenue-gauge-top">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </div>
                  <div class="calendar-day-revenue-meter ${escapeHtml(item.meterClass)}" style="--day-gauge-width:${Math.max(0, Math.min(100, Number(item.widthPct || 0)))}%;">
                    <i aria-hidden="true"></i>
                  </div>
                  <div class="calendar-day-revenue-note">${escapeHtml(item.meta)}</div>
                </article>
              `).join("")}
            </div>
            ${useRevenuePreview ? `
              <p class="calendar-day-revenue-note">
                Preview revenue signals are shown because this day has bookings without saved prices yet. Add service prices or priced bookings to see real values.
              </p>
            ` : ""}
            ${!useRevenuePreview && total === 0 ? `
              <p class="calendar-day-revenue-note">
                New day / clean slate: revenue signals stay visible and start at zero until bookings are added.
              </p>
            ` : ""}
            ${(revenueSummary.estimatedCount > 0 || revenueSummary.missingCount > 0) ? `
              <p class="calendar-day-revenue-note">
                ${escapeHtml(
                  `${revenueSummary.estimatedCount ? `${revenueSummary.estimatedCount} booking value estimate${revenueSummary.estimatedCount === 1 ? "" : "s"} used from your service price list.` : ""}${revenueSummary.estimatedCount && revenueSummary.missingCount ? " " : ""}${revenueSummary.missingCount ? `${revenueSummary.missingCount} booking${revenueSummary.missingCount === 1 ? "" : "s"} have no price estimate yet.` : ""}`
                )}
              </p>
            ` : ""}
            <h4 style="margin-top:0.15rem;">Quick Links</h4>
            <div class="calendar-day-actions-row">
              <button class="btn btn-ghost" type="button" data-module-jump="calendar">Calendar</button>
              <button class="btn btn-ghost" type="button" data-module-jump="booking_ops">Booking Operations</button>
              <button class="btn btn-ghost" type="button" data-module-jump="waitlist">Waitlist</button>
            </div>
            <h4 style="margin-top:0.15rem;">Quick Actions</h4>
            <div class="calendar-day-actions-row">
              <button class="btn btn-ghost" type="button" data-day-popup-action="ask-copilot">Ask Copilot About This Day</button>
              <button class="btn btn-ghost" type="button" data-day-popup-action="copy-summary" data-summary="${escapeHtml(daySummaryText)}">Copy Day Summary</button>
            </div>
          </aside>
        </section>
      </div>
      <div class="module-workspace-actions">
        <small class="module-info-hint">Press Esc or click outside to close.</small>
        <button type="button" class="btn btn-ghost calendar-day-dashboard-btn">Back to Dashboard</button>
        <button type="button" class="btn btn-ghost calendar-day-close-btn">Close</button>
      </div>
    `;

    shell.querySelector(".module-info-close")?.addEventListener("click", close);
    shell.querySelector(".calendar-day-dashboard-btn")?.addEventListener("click", () => {
      close();
      returnToDashboardHomeView();
    });
    shell.querySelector(".calendar-day-close-btn")?.addEventListener("click", close);

    shell.querySelectorAll("[data-day-popup-action]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLElement)) return;
        const action = String(target.getAttribute("data-day-popup-action") || "").trim();
        const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
        try {
          if (action === "open-bookings") {
            close();
            focusModuleByKey("booking_ops");
            return;
          }
          if (action === "open-waitlist") {
            close();
            focusModuleByKey("waitlist");
            setWaitlistStatus(`Waitlist recovery view opened for ${safeDateKey}. Review cancellations and contact best-fit clients.`);
            return;
          }
          if (action === "recover-slot" && bookingId) {
            const booking = rows.find((row) => String(row?.id || "").trim() === bookingId);
            close();
            if (stageWaitlistRecoveryFromBooking(booking)) {
              showManageToast("Waitlist recovery form pre-filled from cancelled booking.");
            }
            return;
          }
          if (action === "clear-filter") {
            setBookingDateFilter({ keys: null, label: "All dates" });
            applyBookingFilters();
            renderSubscriberCalendar();
            renderDayPopup();
            return;
          }
          if (action === "ask-copilot") {
            const copilotKey = user.role === "admin" ? "admin_copilot" : "subscriber_copilot";
            const questionText = user.role === "admin"
              ? `Review ${safeDateKey}. What should I check for issues, cancellations, staffing pressure, or follow-up today?`
              : `Review ${safeDateKey}. What should I focus on today for bookings, cancellations, staffing pressure, waitlist recovery, and revenue?`;
            if (user.role === "admin" && adminCopilotInput) adminCopilotInput.value = questionText;
            if (user.role !== "admin" && subscriberCopilotInput) subscriberCopilotInput.value = questionText;
            close();
            focusModuleByKey(copilotKey);
            window.setTimeout(() => {
              const input = user.role === "admin" ? adminCopilotInput : subscriberCopilotInput;
              if (input instanceof HTMLElement) input.focus();
            }, 160);
            return;
          }
          if (action === "copy-summary") {
            const summary = String(target.getAttribute("data-summary") || "").trim();
            if (!summary) return;
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(summary);
              } else {
                throw new Error("Clipboard unavailable");
              }
              showManageToast("Day summary copied.");
            } catch {
              showManageToast("Could not copy summary on this device.", "error");
            }
            return;
          }
          if (action === "add-booking") {
            if (!canManage || !businessId) return;
            close();
            const values = await openManageForm({
              title: `Add Booking (${safeDateKey})`,
              submitLabel: "Create Booking",
              fields: [
                { id: "customerName", label: "Customer Name", required: true },
                { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+12025550111" },
                { id: "customerEmail", label: "Customer Email" },
                { id: "service", label: "Service", required: true },
                { id: "date", label: "Date", type: "date", required: true, value: safeDateKey },
                { id: "time", label: "Time", type: "time", required: true }
              ]
            });
            if (!values) {
              openCalendarDayWorkspace(safeDateKey);
              return;
            }
            await createBooking({ businessId, ...values });
            await refreshBookingsAfterDayPopupMutation();
            showManageToast("Booking created.");
            openCalendarDayWorkspace(safeDateKey);
            return;
          }
          if (action === "edit-booking" && bookingId) {
            if (!canManage) return;
            close();
            await rescheduleBooking(bookingId);
            await refreshBookingsAfterDayPopupMutation();
            showManageToast("Booking updated.");
            openCalendarDayWorkspace(safeDateKey);
            return;
          }
          if (action === "delete-booking" && bookingId) {
            if (!canManage) return;
            close();
            const confirmed = await openManageConfirm({
              title: "Delete Booking",
              message: "Cancel this booking for the selected day?",
              confirmLabel: "Delete"
            });
            if (confirmed) {
              await cancelBooking(bookingId);
              await refreshBookingsAfterDayPopupMutation();
              showManageToast("Booking deleted.");
            }
            openCalendarDayWorkspace(safeDateKey);
          }
        } catch (error) {
          showManageToast(error?.message || "Could not complete booking action.", "error");
          openCalendarDayWorkspace(safeDateKey);
        }
      });
    });

    shell.querySelectorAll("[data-module-jump]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLElement)) return;
        const next = String(target.getAttribute("data-module-jump") || "").trim();
        if (!next) return;
        close();
        focusModuleByKey(next);
      });
    });
  };

  renderDayPopup();
  const closeButton = shell.querySelector(".module-info-close");
  if (closeButton instanceof HTMLElement) closeButton.focus();
}

function getSelectedCustomerSalon() {
  const fromResults = customerSalonResults.find((salon) => salon.id === selectedCustomerSalonId);
  if (fromResults) return fromResults;
  return customerSalonDirectory.find((salon) => salon.id === selectedCustomerSalonId) || null;
}

function renderCustomerSearchResults() {
  if (!customerSearchResults) return;
  customerSearchResults.innerHTML = "";
  if (!customerSalonResults.length) {
    customerSearchResults.innerHTML = "<li>No businesses match those filters yet. Try widening your search a little.</li>";
    return;
  }
  customerSalonResults.forEach((salon) => {
    const isSelected = salon.id === selectedCustomerSalonId;
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${salon.name}</strong><br />
        <small>${salon.city} | ${formatBusinessTypeLabel(salon.businessType)} | Rating ${salon.rating.toFixed(1)} | ${salon.services.join(", ")}</small>
      </div>
      <button class="btn ${isSelected ? "" : "btn-ghost"} customer-select-salon" type="button" data-salon-id="${salon.id}">
        ${isSelected ? "Selected" : "Select"}
      </button>
    `;
    customerSearchResults.appendChild(item);
  });
}

function renderCustomerSelectedSalon() {
  const salon = getSelectedCustomerSalon();
  if (customerSelectedSalonLabel) {
    customerSelectedSalonLabel.textContent = salon
      ? `${salon.name} in ${salon.city}`
      : "Choose a business from the search results.";
  }
  if (customerSalonContact) {
    customerSalonContact.innerHTML = salon
      ? `<strong>Contact</strong><br /><small>${salon.phone} | ${salon.email}<br />${salon.address}</small>`
      : "<small>Choose a business to see contact details and availability.</small>";
  }
  if (customerAvailableSlots) {
    customerAvailableSlots.innerHTML = "";
    if (!salon) {
      customerAvailableSlots.innerHTML = "<li>Choose a business to see available booking times.</li>";
      renderCustomerLexiCalendar();
      return;
    }
    if (!Array.isArray(salon.availableSlots) || !salon.availableSlots.length) {
      customerAvailableSlots.innerHTML = "<li>There are no open slots showing right now.</li>";
      renderCustomerLexiCalendar();
      return;
    }
    salon.availableSlots.forEach((slot) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${slot}</strong><br /><small>Ask Lexi to help you request this slot.</small>`;
      customerAvailableSlots.appendChild(li);
    });
  }
  renderCustomerLexiCalendar();
}

function runCustomerSalonSearch() {
  const query = normalizeText(customerSearchQuery?.value);
  const service = normalizeText(customerSearchService?.value);
  const businessType = normalizeText(customerSearchBusinessType?.value);
  const location = normalizeText(customerSearchLocation?.value);
  const minRating = Number(customerSearchRating?.value || 0);
  const desiredDate = String(customerSearchDate?.value || "").trim();

  customerSalonResults = customerSalonDirectory.filter((salon) => {
    if (Number.isFinite(minRating) && minRating > 0 && salon.rating < minRating) return false;
    if (location && !normalizeText(salon.city).includes(location)) return false;
    if (service) {
      const hasService = salon.services.some((entry) => normalizeText(entry).includes(service));
      if (!hasService) return false;
    }
    if (businessType) {
      if (normalizeText(salon.businessType) !== businessType) return false;
    }
    if (query) {
      const specialistList = Array.isArray(salon.specialists) && salon.specialists.length ? salon.specialists : (salon.barbers || []);
      const blob = [salon.name, salon.city, ...salon.services, ...specialistList].map((entry) => normalizeText(entry)).join(" ");
      if (!blob.includes(query)) return false;
    }
    if (desiredDate) {
      const hasDateMatch = salon.availableSlots.some((slot) => String(slot).startsWith(desiredDate));
      if (!hasDateMatch) return false;
    }
    return true;
  });

  if (!customerSalonResults.some((salon) => salon.id === selectedCustomerSalonId)) {
    selectedCustomerSalonId = customerSalonResults[0]?.id || "";
  }
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
}

function renderCustomerReceptionChat() {
  if (!customerReceptionMessages) return;
  customerReceptionMessages.innerHTML = "";
  customerReceptionTranscript.forEach((entry) => {
    const msg = document.createElement("div");
    msg.className = `customer-chat-msg ${entry.role === "user" ? "user" : "ai"}`;
    msg.textContent = entry.text;
    customerReceptionMessages.appendChild(msg);
  });
  customerReceptionMessages.scrollTop = customerReceptionMessages.scrollHeight;
}

function normalizeCustomerLexiTypos(text) {
  let message = normalizeText(text);
  const aliases = [
    ["moday", "monday"],
    ["monay", "monday"],
    ["wednsday", "wednesday"],
    ["thurday", "thursday"],
    ["thrusday", "thursday"],
    ["frday", "friday"],
    ["saterday", "saturday"],
    ["sundey", "sunday"],
    ["tomorow", "tomorrow"],
    ["tommorow", "tomorrow"],
    ["avaiable", "available"],
    ["availble", "available"],
    ["avialable", "available"],
    ["availabilty", "availability"],
    ["bokking", "booking"],
    ["bookng", "booking"],
    ["appoinment", "appointment"],
    ["calender", "calendar"],
    ["dashbord", "dashboard"],
    ["subcriber", "subscriber"],
    ["renenue", "revenue"]
  ];
  aliases.forEach(([wrong, correct]) => {
    message = message.replaceAll(wrong, correct);
  });
  return message;
}

function getReceptionReply(inputText) {
  const message = normalizeCustomerLexiTypos(inputText);
  const salon = getSelectedCustomerSalon();
  if (!message) return "Tell me what you're looking for and I'll guide you from there.";
  if (/(password|api key|token|secret|all customers|customer list|phone numbers|emails|addresses|personal data|private data)/.test(message)) {
    return "I can help with bookings and app questions, but I can't share private account or personal data.";
  }
  if (/(how does this app work|what can lexi do|what can the app do|dashboard|module|modules|subscriber|admin|customer dashboard|demo mode|booking confirmation|pending booking|notification|notifications|how .*work|gdpr|privacy|data protection|lexi)/.test(message)) {
    return "Lexi helps with services, availability, bookings, and front-desk questions, while the app gives salon owners control over the diary, staff, and business side. If you want, I can explain a specific part instead of the whole system.";
  }
  if (/(find|search).*(salon|barber|beauty)|business search/.test(message)) {
    return "Use the search filters to narrow it down by name, service, area, rating, or date. Once you've picked a business, I'll help with services, slots, and the booking.";
  }
  if (message.includes("slot") || message.includes("available") || message.includes("book")) {
    if (!salon) return "Pick a business first and I'll help you check the best slots.";
    if (message.includes("confirm")) {
      return "You can request the booking from the slots shown here. Some businesses confirm manually first, so you'll get a confirmation once the salon approves it.";
    }
    const nextSlot = salon.availableSlots[0];
    return nextSlot
      ? `${salon.name} has availability at ${nextSlot}. If you want, I can help you pick the best time around that.`
      : `${salon.name} doesn't have any open slots listed right now.`;
  }
  if (message.includes("phone") || message.includes("email") || message.includes("contact")) {
    if (!salon) return "Pick a business first and I'll show you the contact details.";
    return `You can reach ${salon.name} at ${salon.phone} or ${salon.email}.`;
  }
  if (message.includes("service")) {
    if (!salon) return "Pick a business first and I'll run through the services with you.";
    return `${salon.name} offers ${salon.services.join(", ")}. Tell me the result you want and I'll point you to the best option.`;
  }
  if (/(policy|deposit|late|cancellation|cancelation|no show|no-show)/.test(message)) {
    return "I can walk you through deposits, late arrivals, cancellations, or no-show policy. Tell me which part you want to check.";
  }
  if (message.includes("calendar") || message.includes("planner")) {
    return "The booking calendar lets you compare day, week, and month availability and work out the best time to book.";
  }
  if (message.includes("bookings") || message.includes("appointment")) {
    return "I can help you with booking questions, open slots, services, contact details, and how confirmation works in the app.";
  }
  return "Ask me about services, open times, booking help, policies, or how the app works, and I'll keep it simple.";
}

function parseCustomerSlotEntry(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const [datePart, timePart = ""] = raw.split(/\s+/);
  const parsedDate = parseBookingDate(datePart);
  if (!parsedDate) return null;
  return {
    raw,
    dateKey: toDateKey(parsedDate),
    time: timePart || raw,
    date: parsedDate
  };
}

function getCustomerLexiCalendarDataset() {
  const salon = getSelectedCustomerSalon();
  const bookingsByDate = new Map();
  const slotsByDate = new Map();
  const upcomingBookings = [];

  (Array.isArray(bookingRows) ? bookingRows : []).forEach((row) => {
    const dateObj = parseBookingDate(row?.date);
    if (!dateObj) return;
    const dateKey = toDateKey(dateObj);
    const list = bookingsByDate.get(dateKey) || [];
    list.push(row);
    bookingsByDate.set(dateKey, list);
    upcomingBookings.push({ row, dateObj, dateKey });
  });

  (Array.isArray(salon?.availableSlots) ? salon.availableSlots : []).forEach((slot) => {
    const parsed = parseCustomerSlotEntry(slot);
    if (!parsed) return;
    const list = slotsByDate.get(parsed.dateKey) || [];
    list.push(parsed);
    slotsByDate.set(parsed.dateKey, list);
  });

  return { salon, bookingsByDate, slotsByDate, upcomingBookings };
}

function appendCustomerLexiChat(prompt, fallbackReply = "") {
  const text = String(prompt || "").trim();
  if (!text) return;
  customerReceptionTranscript.push({ role: "user", text });
  customerReceptionTranscript.push({ role: "ai", text: String(fallbackReply || getReceptionReply(text)).trim() || "Tell me what you'd like to book and I'll help you narrow it down." });
  renderCustomerReceptionChat();
}

function queueCustomerLexiPrompt(prompt) {
  const text = String(prompt || "").trim();
  if (!text) return;
  if (customerReceptionInput) customerReceptionInput.value = text;
  appendCustomerLexiChat(text);
  updateCustomerChatGuideHint();
}

function appendCustomerLexiGuidance(text) {
  const message = String(text || "").trim();
  if (!message) return;
  customerReceptionTranscript.push({ role: "ai", text: message });
  renderCustomerReceptionChat();
}

function ensureCustomerLexiPopup() {
  if (customerLexiPopupOverlay && customerLexiPopupContainer) {
    return { overlay: customerLexiPopupOverlay, container: customerLexiPopupContainer };
  }
  const overlay = document.createElement("div");
  overlay.className = "home-lexi-popup-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <section class="home-lexi-popup" role="dialog" aria-modal="true" aria-labelledby="customerLexiPopupTitle">
      <div class="home-lexi-popup-head">
        <div>
          <p class="home-lexi-popup-kicker">Lexi Chat</p>
          <h3 id="customerLexiPopupTitle">Ask Lexi</h3>
          <p>Focused booking help, recommendations, and day-to-day customer guidance.</p>
        </div>
        <button type="button" class="home-lexi-popup-close" aria-label="Close Lexi chat popup">x</button>
      </div>
      <div class="home-lexi-popup-body">
        <section class="lexi-avatar-shell" data-avatar-state="idle" aria-label="Lexi live assistant">
          <div class="lexi-avatar-stage">
            <video id="customerLexiAvatarVideo" class="lexi-avatar-video" playsinline autoplay muted></video>
            <div class="lexi-avatar-figure">
              <div class="lexi-avatar-orb" aria-hidden="true"></div>
              <div class="lexi-avatar-label">
                <strong id="customerLexiAvatarTitle">Lexi live assistant</strong>
                <small id="customerLexiAvatarStatus">Customer booking mode is ready. Voice avatar can be connected here next.</small>
              </div>
            </div>
          </div>
          <div class="lexi-avatar-meta">
            <div class="lexi-avatar-chip-row">
              <span class="lexi-avatar-chip" id="customerLexiAvatarModeChip">Text + booking</span>
              <span class="lexi-avatar-chip" id="customerLexiAvatarProviderChip">Provider pending</span>
              <span class="lexi-avatar-chip" id="customerLexiAvatarReadyChip">Avatar offline</span>
            </div>
            <div class="lexi-avatar-note">
              <strong>Lexi focus</strong>
              <p id="customerLexiAvatarNote">Ask about services, timings, recommendations, aftercare, and move into booking from this one popup.</p>
            </div>
            <div class="lexi-avatar-transcript">
              <strong>Live status</strong>
              <p id="customerLexiAvatarTranscript">Text fallback is active now. Voice and avatar streaming can be connected here without changing the customer journey.</p>
            </div>
            <div class="lexi-avatar-actions">
              <button class="btn" id="customerLexiVoiceBtn" type="button" disabled>Voice Coming Soon</button>
              <button class="btn btn-ghost" id="customerLexiMuteBtn" type="button" disabled>Mute</button>
            </div>
          </div>
        </section>
        <div class="home-lexi-popup-chat-slot"></div>
      </div>
    </section>
  `;
  document.body.appendChild(overlay);
  const container = overlay.querySelector(".home-lexi-popup-chat-slot");
  overlay.querySelector(".home-lexi-popup-close")?.addEventListener("click", closeCustomerLexiPopup);
  overlay.querySelector("#customerLexiVoiceBtn")?.addEventListener("click", startCustomerLexiVoicePreparation);
  overlay.querySelector("#customerLexiMuteBtn")?.addEventListener("click", () => {
    const connection = customerLexiRealtimeConnection;
    if (!connection) return;
    connection.muted = !connection.muted;
    connection.audioElement.muted = connection.muted;
    const muteBtn = overlay.querySelector("#customerLexiMuteBtn");
    if (muteBtn instanceof HTMLButtonElement) {
      muteBtn.textContent = connection.muted ? "Unmute" : "Mute";
    }
    updateCustomerLexiTranscript(connection.muted ? "Lexi audio muted for this popup." : "Lexi audio unmuted.");
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeCustomerLexiPopup();
  });
  customerLexiPopupOverlay = overlay;
  customerLexiPopupContainer = container;
  return { overlay, container };
}

function setCustomerLexiAvatarPanelState(state, status, transcript) {
  const shell = customerLexiPopupOverlay?.querySelector(".lexi-avatar-shell");
  if (shell instanceof HTMLElement) shell.setAttribute("data-avatar-state", state);
  const statusNode = customerLexiPopupOverlay?.querySelector("#customerLexiAvatarStatus");
  const transcriptNode = customerLexiPopupOverlay?.querySelector("#customerLexiAvatarTranscript");
  if (statusNode) statusNode.textContent = status;
  if (transcriptNode) transcriptNode.textContent = transcript;
}

async function loadCustomerLexiAvatarConfig() {
  if (customerLexiAvatarConfigPromise) return customerLexiAvatarConfigPromise;
  customerLexiAvatarConfigPromise = fetch("/api/lexi/avatar-config?scope=customer")
    .then(async (response) => {
      if (!response.ok) throw new Error(`Avatar config request failed: ${response.status}`);
      return response.json();
    })
    .catch(() => ({
      avatarEnabled: false,
      realtimeEnabled: false,
      provider: "pending",
      voiceProvider: "text",
      displayName: "Lexi",
      supportMode: "customer",
      transcriptMode: "text_fallback"
    }));
  return customerLexiAvatarConfigPromise;
}

async function requestCustomerLexiRealtimeSession() {
  if (customerLexiRealtimeSessionPromise) return customerLexiRealtimeSessionPromise;
  const requestHeaders = {
    "Content-Type": "application/json"
  };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  customerLexiRealtimeSessionPromise = fetch("/api/lexi/realtime/session", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      scope: "customer",
      businessId: selectedCustomerSalonId || ""
    })
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(data?.error || `Realtime session request failed: ${response.status}`).trim());
      }
      customerLexiRealtimeSession = data;
      return data;
    })
    .finally(() => {
      customerLexiRealtimeSessionPromise = null;
    });
  return customerLexiRealtimeSessionPromise;
}

function getCustomerLexiAvatarVideo() {
  return customerLexiPopupOverlay?.querySelector("#customerLexiAvatarVideo") || null;
}

function setCustomerLexiAvatarVideoActive(active) {
  const video = getCustomerLexiAvatarVideo();
  const stage = customerLexiPopupOverlay?.querySelector(".lexi-avatar-stage");
  if (video instanceof HTMLVideoElement) {
    video.classList.toggle("is-active", Boolean(active));
  }
  if (stage instanceof HTMLElement) {
    stage.classList.toggle("has-video", Boolean(active));
  }
}

async function loadCustomerLivekitClient() {
  if (window.LivekitClient?.Room) return window.LivekitClient;
  if (customerLexiLivekitScriptPromise) return customerLexiLivekitScriptPromise;
  customerLexiLivekitScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-livekit-client="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.LivekitClient), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load LiveKit client.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js";
    script.async = true;
    script.setAttribute("data-livekit-client", "true");
    script.addEventListener("load", () => resolve(window.LivekitClient), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load LiveKit client.")), { once: true });
    document.head.appendChild(script);
  });
  return customerLexiLivekitScriptPromise;
}

async function requestCustomerLexiAvatarSession() {
  if (customerLexiAvatarSessionPromise) return customerLexiAvatarSessionPromise;
  const requestHeaders = {
    "Content-Type": "application/json"
  };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  customerLexiAvatarSessionPromise = fetch("/api/lexi/avatar/session", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      scope: "customer",
      businessId: selectedCustomerSalonId || ""
    })
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(data?.error || `Avatar session request failed: ${response.status}`).trim());
      }
      customerLexiAvatarSession = data;
      return data;
    })
    .finally(() => {
      customerLexiAvatarSessionPromise = null;
    });
  return customerLexiAvatarSessionPromise;
}

async function connectCustomerLexiAvatarSession() {
  const config = await loadCustomerLexiAvatarConfig();
  if (config.provider !== "heygen" || !config.avatarSessionReady) return false;
  const avatarData = await requestCustomerLexiAvatarSession();
  if (!avatarData.sessionReady) {
    updateCustomerLexiTranscript(avatarData.message || "Avatar session is not ready yet.");
    return false;
  }
  const livekit = await loadCustomerLivekitClient();
  if (!livekit?.Room) throw new Error("LiveKit client did not load correctly.");
  if (customerLexiAvatarRoom) return true;

  const room = new livekit.Room();
  room.on(livekit.RoomEvent.TrackSubscribed, (track) => {
    if (track.kind !== "video") return;
    const video = getCustomerLexiAvatarVideo();
    if (!(video instanceof HTMLVideoElement)) return;
    track.attach(video);
    video.muted = true;
    video.play().catch(() => {});
    setCustomerLexiAvatarVideoActive(true);
  });
  room.on(livekit.RoomEvent.Disconnected, () => {
    setCustomerLexiAvatarVideoActive(false);
    customerLexiAvatarRoom = null;
  });
  await room.connect(String(avatarData.session?.livekitUrl || ""), String(avatarData.session?.livekitAccessToken || ""));
  customerLexiAvatarRoom = room;
  updateCustomerLexiTranscript("Lexi avatar connected. Voice replies will play through the popup audio.");
  return true;
}

function extractCustomerLexiRealtimeText(response) {
  const outputs = Array.isArray(response?.output) ? response.output : [];
  const content = outputs.flatMap((item) => Array.isArray(item?.content) ? item.content : []);
  for (const part of content) {
    const transcript = String(part?.transcript || part?.text || "").trim();
    if (transcript) return transcript;
  }
  return "";
}

function updateCustomerLexiTranscript(text) {
  const transcriptNode = customerLexiPopupOverlay?.querySelector("#customerLexiAvatarTranscript");
  if (transcriptNode) transcriptNode.textContent = text;
}

function resetCustomerLexiVoiceControls(label = "Prepare Voice", enabled = true) {
  const voiceBtn = customerLexiPopupOverlay?.querySelector("#customerLexiVoiceBtn");
  const muteBtn = customerLexiPopupOverlay?.querySelector("#customerLexiMuteBtn");
  if (voiceBtn instanceof HTMLButtonElement) {
    voiceBtn.disabled = !enabled;
    voiceBtn.textContent = label;
  }
  if (muteBtn instanceof HTMLButtonElement) {
    muteBtn.disabled = !enabled;
    muteBtn.textContent = "Mute";
  }
}

function cleanupCustomerLexiRealtimeConnection() {
  const connection = customerLexiRealtimeConnection;
  if (!connection) return;
  try {
    connection.dataChannel?.close();
  } catch {}
  try {
    connection.peerConnection?.getSenders()?.forEach((sender) => sender.track?.stop());
  } catch {}
  try {
    connection.mediaStream?.getTracks()?.forEach((track) => track.stop());
  } catch {}
  try {
    connection.peerConnection?.close();
  } catch {}
  try {
    if (connection.audioElement) {
      connection.audioElement.pause();
      connection.audioElement.srcObject = null;
    }
  } catch {}
  customerLexiRealtimeConnection = null;
}

async function cleanupCustomerLexiAvatarSession() {
  try {
    await customerLexiAvatarRoom?.disconnect?.();
  } catch {}
  customerLexiAvatarRoom = null;
  const video = getCustomerLexiAvatarVideo();
  if (video instanceof HTMLVideoElement) {
    try {
      video.pause();
      video.srcObject = null;
    } catch {}
  }
  setCustomerLexiAvatarVideoActive(false);
  const sessionId = String(customerLexiAvatarSession?.session?.sessionId || "").trim();
  const sessionToken = String(customerLexiAvatarSession?.session?.sessionToken || "").trim();
  customerLexiAvatarSession = null;
  if (!sessionId || !sessionToken) return;
  try {
    await fetch("/api/lexi/avatar/session/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sessionId, sessionToken })
    });
  } catch {}
}

function handleCustomerLexiRealtimeEvent(event) {
  const eventType = String(event?.type || "").trim();
  if (!eventType) return;

  if (eventType === "input_audio_buffer.speech_started") {
    setCustomerLexiAvatarPanelState("listening", "Lexi is listening.", "Speak naturally. Lexi will respond as soon as you finish.");
    return;
  }
  if (eventType === "input_audio_buffer.speech_stopped") {
    setCustomerLexiAvatarPanelState("thinking", "Lexi is thinking.", "Your request is being turned into Lexi's next reply.");
    return;
  }
  if (eventType === "conversation.item.input_audio_transcription.completed") {
    const transcript = String(event?.transcript || "").trim();
    if (transcript) updateCustomerLexiTranscript(`You: ${transcript}`);
    return;
  }
  if (eventType === "response.created") {
    setCustomerLexiAvatarPanelState("thinking", "Lexi is preparing her reply.", "Lexi is turning what she heard into the next step.");
    return;
  }
  if (eventType === "response.done") {
    const text = extractCustomerLexiRealtimeText(event?.response);
    if (text) {
      setCustomerLexiAvatarPanelState("speaking", "Lexi is replying live.", `Lexi: ${text}`);
      return;
    }
  }
  if (eventType === "error") {
    const message = String(event?.error?.message || "Realtime session error.").trim();
    setCustomerLexiAvatarPanelState("speaking", "Lexi hit a realtime error.", message);
    setDashActionStatus(message, true, 3200);
  }
}

async function connectCustomerLexiRealtimeSession(sessionPayload) {
  const session = sessionPayload?.session || {};
  const clientSecret = String(session.clientSecret || "").trim();
  const model = String(session.model || "").trim();
  if (!clientSecret || !model) {
    throw new Error("Realtime session details are incomplete.");
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") {
    throw new Error("This browser does not support live Lexi voice mode.");
  }

  cleanupCustomerLexiRealtimeConnection();

  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const peerConnection = new RTCPeerConnection();
  const audioElement = new Audio();
  audioElement.autoplay = true;
  audioElement.playsInline = true;

  peerConnection.ontrack = (event) => {
    const [remoteStream] = event.streams;
    if (remoteStream) {
      audioElement.srcObject = remoteStream;
    }
  };
  peerConnection.onconnectionstatechange = () => {
    const state = String(peerConnection.connectionState || "").trim();
    if (state === "connected") {
      setCustomerLexiAvatarPanelState("listening", "Lexi is live and listening.", "Talk naturally. Lexi will answer out loud and keep the booking moving.");
      resetCustomerLexiVoiceControls("End Voice", true);
      setDashActionStatus("Lexi voice is live.", false, 2200);
    } else if (state === "failed" || state === "disconnected" || state === "closed") {
      cleanupCustomerLexiRealtimeConnection();
      resetCustomerLexiVoiceControls("Prepare Voice", true);
      setCustomerLexiAvatarPanelState("speaking", "Lexi voice session ended.", "Text chat is still available in this popup.");
    }
  };

  mediaStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, mediaStream);
  });

  const dataChannel = peerConnection.createDataChannel("oai-events");
  dataChannel.addEventListener("message", (event) => {
    try {
      handleCustomerLexiRealtimeEvent(JSON.parse(String(event.data || "{}")));
    } catch {}
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const response = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/sdp"
    },
    body: offer.sdp || ""
  });
  const answerSdp = await response.text();
  if (!response.ok) {
    throw new Error(answerSdp || "Unable to complete the Lexi realtime connection.");
  }
  await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });

  customerLexiRealtimeConnection = {
    peerConnection,
    dataChannel,
    mediaStream,
    audioElement,
    muted: false
  };
}

async function hydrateCustomerLexiAvatarPanel() {
  if (!customerLexiPopupOverlay) return;
  setCustomerLexiAvatarPanelState(
    "thinking",
    "Lexi is loading her live assistant profile.",
    "Checking avatar, voice, and realtime readiness for customer guidance."
  );
  const config = await loadCustomerLexiAvatarConfig();
  const titleNode = customerLexiPopupOverlay.querySelector("#customerLexiAvatarTitle");
  const modeChip = customerLexiPopupOverlay.querySelector("#customerLexiAvatarModeChip");
  const providerChip = customerLexiPopupOverlay.querySelector("#customerLexiAvatarProviderChip");
  const readyChip = customerLexiPopupOverlay.querySelector("#customerLexiAvatarReadyChip");
  const noteNode = customerLexiPopupOverlay.querySelector("#customerLexiAvatarNote");
  const voiceBtn = customerLexiPopupOverlay.querySelector("#customerLexiVoiceBtn");
  const muteBtn = customerLexiPopupOverlay.querySelector("#customerLexiMuteBtn");
  const salon = getSelectedCustomerSalon();

  if (titleNode) titleNode.textContent = `${config.displayName || "Lexi"} live assistant`;
  if (modeChip) modeChip.textContent = config.realtimeEnabled ? "Voice + booking" : "Text + booking";
  if (providerChip) providerChip.textContent = `Avatar ${config.providerLabel || config.provider || "pending"}`;
  if (readyChip) {
    readyChip.textContent = config.sessionEndpointReady ? "Realtime ready" : (config.avatarEnabled ? "Avatar ready" : "Avatar pending");
    readyChip.classList.toggle("is-live", Boolean(config.sessionEndpointReady || config.avatarEnabled));
  }
  if (noteNode) {
    noteNode.textContent = salon
      ? `Ask about services, timings, availability, or aftercare for ${salon.name}, and Lexi can guide the booking from here.`
      : "Pick a business, then ask about services, timings, recommendations, aftercare, or booking help from this popup.";
  }
  if (voiceBtn instanceof HTMLButtonElement) {
    voiceBtn.disabled = !config.sessionEndpointReady;
    voiceBtn.textContent = config.sessionEndpointReady ? "Prepare Voice" : "Voice Coming Soon";
  }
  if (muteBtn instanceof HTMLButtonElement) {
    muteBtn.disabled = !config.sessionEndpointReady;
  }
  setCustomerLexiAvatarPanelState(
    config.sessionEndpointReady ? "idle" : "speaking",
    config.sessionEndpointReady
      ? "Lexi can prepare a live realtime voice session from this popup."
      : "Text booking mode is live now. Add realtime server config to activate live voice from this popup.",
    config.sessionEndpointReady
      ? "Press Prepare Voice and the popup will request a brokered Lexi session for this business context."
      : "The customer flow stays simple: one popup, one assistant, with voice added into the same surface once the server can mint realtime sessions."
  );
}

async function startCustomerLexiVoicePreparation() {
  if (customerLexiRealtimeConnection) {
    cleanupCustomerLexiRealtimeConnection();
    cleanupCustomerLexiAvatarSession();
    resetCustomerLexiVoiceControls("Prepare Voice", true);
    setCustomerLexiAvatarPanelState("idle", "Lexi voice session ended.", "Text chat is still available in this popup.");
    setDashActionStatus("Lexi voice disconnected.", false, 2200);
    return;
  }
  const voiceBtn = customerLexiPopupOverlay?.querySelector("#customerLexiVoiceBtn");
  try {
    if (voiceBtn instanceof HTMLButtonElement) {
      voiceBtn.disabled = true;
      voiceBtn.textContent = "Preparing...";
    }
    setCustomerLexiAvatarPanelState(
      "thinking",
      "Lexi is preparing a realtime voice session.",
      "Requesting a short-lived client secret from the server."
    );
    const data = await requestCustomerLexiRealtimeSession();
    const readyChip = customerLexiPopupOverlay?.querySelector("#customerLexiAvatarReadyChip");
    if (readyChip) {
      readyChip.textContent = data.sessionReady ? "Session ready" : "Session pending";
      readyChip.classList.toggle("is-live", Boolean(data.sessionReady));
    }
    if (!data.sessionReady) {
      resetCustomerLexiVoiceControls("Prepare Voice", true);
      setCustomerLexiAvatarPanelState(
        "speaking",
        data.message || "Lexi voice session updated.",
        "The server responded, but a live session is not ready yet."
      );
      setDashActionStatus(data.message || "Lexi voice session is not ready yet.", true, 2600);
      return;
    }
    await connectCustomerLexiRealtimeSession(data);
    try {
      await connectCustomerLexiAvatarSession();
    } catch (avatarError) {
      updateCustomerLexiTranscript(avatarError instanceof Error ? avatarError.message : "Lexi avatar could not connect, but voice is still available.");
    }
    setCustomerLexiAvatarPanelState(
      "thinking",
      data.message || "Lexi voice session updated.",
      `OpenAI Realtime session ready for ${data.session?.model || "Lexi"} using the ${data.session?.voice || "default"} voice. Establishing the live connection now.`
    );
    setDashActionStatus("Lexi voice session prepared.", false, 2200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare a Lexi voice session right now.";
    cleanupCustomerLexiRealtimeConnection();
    cleanupCustomerLexiAvatarSession();
    if (voiceBtn instanceof HTMLButtonElement) {
      voiceBtn.disabled = false;
      voiceBtn.textContent = "Prepare Voice";
    }
    const readyChip = customerLexiPopupOverlay?.querySelector("#customerLexiAvatarReadyChip");
    if (readyChip) {
      readyChip.textContent = "Session error";
      readyChip.classList.remove("is-live");
    }
    setCustomerLexiAvatarPanelState("speaking", "Lexi could not prepare the voice session.", message);
    setDashActionStatus(message, true, 3200);
  }
}

function openCustomerLexiPopup() {
  const customerChatShell = customerReceptionSection?.querySelector(".customer-chat-shell") || null;
  if (!(customerChatShell instanceof HTMLElement)) {
    customerReceptionSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    customerReceptionInput?.focus();
    return;
  }
  const { overlay, container } = ensureCustomerLexiPopup();
  if (!(container instanceof HTMLElement)) return;
  if (!customerLexiChatPlaceholder) {
    customerLexiChatPlaceholder = document.createElement("div");
    customerLexiChatPlaceholder.className = "home-lexi-chat-placeholder";
  }
  if (customerChatShell.parentNode && customerChatShell.parentNode !== container) {
    customerChatShell.parentNode.insertBefore(customerLexiChatPlaceholder, customerChatShell);
  }
  customerChatShell.classList.remove("customer-chat-inline-hidden");
  customerLexiPopupLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  container.appendChild(customerChatShell);
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("home-lexi-popup-open");
  customerLexiPopupOpen = true;
  hydrateCustomerLexiAvatarPanel();
  customerReceptionInput?.focus();
}

function closeCustomerLexiPopup() {
  if (!customerLexiPopupOpen) return;
  cleanupCustomerLexiRealtimeConnection();
  cleanupCustomerLexiAvatarSession();
  resetCustomerLexiVoiceControls("Prepare Voice", true);
  const customerChatShell = customerReceptionSection?.querySelector(".customer-chat-shell") || null;
  if (customerLexiChatPlaceholder?.parentNode && customerChatShell instanceof HTMLElement) {
    customerLexiChatPlaceholder.parentNode.insertBefore(customerChatShell, customerLexiChatPlaceholder);
    customerLexiChatPlaceholder.remove();
  }
  customerChatShell?.classList.add("customer-chat-inline-hidden");
  if (customerLexiPopupOverlay) {
    customerLexiPopupOverlay.classList.remove("is-open");
    customerLexiPopupOverlay.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("home-lexi-popup-open");
  customerLexiPopupOpen = false;
  if (customerLexiPopupLastFocus instanceof HTMLElement && document.contains(customerLexiPopupLastFocus)) {
    customerLexiPopupLastFocus.focus();
  }
  customerLexiPopupLastFocus = null;
}

function updateCustomerChatGuideHint() {
  if (!customerChatGuideHint) return;
  const salon = getSelectedCustomerSalon();
  if (!salon) {
    customerChatGuideHint.textContent = "Choose a business first for more accurate booking guidance.";
    return;
  }
  customerChatGuideHint.textContent = `Lexi is ready to guide bookings, services, and available times for ${salon.name}.`;
}

function buildCustomerLexiPlannerPrompt(action, payload = {}) {
  const salonName = payload.salonName || "the selected salon";
  const dateLabel = payload.dateLabel || "the selected day";
  if (action === "week-plan") {
    return `Review the week around ${dateLabel} at ${salonName}. Show me the best booking options, busy days, and easier days to book.`;
  }
  if (action === "month-plan") {
    return `Review this month at ${salonName} and recommend the best dates and times to book based on the available slots shown.`;
  }
  if (action === "day-slots") {
    return `What are the best available slots on ${dateLabel} at ${salonName}?`;
  }
  if (action === "day-booking") {
    return `Help me plan ${dateLabel} at ${salonName}. Which time should I choose based on availability?`;
  }
  return `Recommend my next best booking slot at ${salonName} based on available times and a convenient day.`;
}

function getCustomerLexiTeamMembers(salon) {
  const names = Array.from(
    new Set(
      [
        ...(Array.isArray(salon?.specialists) ? salon.specialists : []),
        ...(Array.isArray(salon?.barbers) ? salon.barbers : [])
      ]
        .map((name) => String(name || "").trim())
        .filter(Boolean)
    )
  );
  return names.map((name) => ({
    name,
    color: getStaffColorForId(`customer:${String(salon?.id || "salon")}:${name.toLowerCase()}`)
  }));
}

function renderCustomerLexiStaffLegend(salon) {
  if (!customerLexiStaffLegend) return;
  const teamMembers = getCustomerLexiTeamMembers(salon);
  if (!teamMembers.length) {
    customerLexiStaffLegend.innerHTML = '<span class="calendar-staff-chip">No team names listed yet</span>';
    return;
  }
  customerLexiStaffLegend.innerHTML = teamMembers
    .slice(0, 8)
    .map((member) => {
      return `
        <span class="calendar-staff-chip">
          <span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(member.color)}">${escapeHtml(getStaffInitials(member.name))}</span>
          ${escapeHtml(member.name)}
        </span>
      `;
    })
    .join("");
}

function getWeekStartFromDateKey(dateKey) {
  const dateObj = parseBookingDate(dateKey);
  if (!dateObj) return null;
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const weekday = d.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

function renderCustomerLexiDaySummary(dataset) {
  if (!customerLexiDaySummary) return;
  const teamMembers = getCustomerLexiTeamMembers(dataset.salon);
  const dateKey = String(customerLexiSelectedDateKey || "").trim();
  if (!dateKey) {
    customerLexiDaySummary.innerHTML = `
      <h3>Selected Day</h3>
      <p>Choose a date to see your bookings, open slots, and quick Lexi booking help.</p>
    `;
    return;
  }
  const bookingRowsForDay = dataset.bookingsByDate.get(dateKey) || [];
  const slotsForDay = dataset.slotsByDate.get(dateKey) || [];
  const dateObj = parseBookingDate(dateKey);
  const dateLabel = dateObj
    ? dateObj.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : dateKey;
  const salonName = dataset.salon?.name || "Selected salon";
  if (customerLexiCalendarView === "week") {
    const weekStart = getWeekStartFromDateKey(dateKey);
    const weekDays = weekStart
      ? Array.from({ length: 7 }, (_, index) => {
          const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
          const key = toDateKey(d);
          return {
            key,
            label: d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" }),
            bookings: (dataset.bookingsByDate.get(key) || []).length,
            slots: (dataset.slotsByDate.get(key) || []).length
          };
        })
      : [];
    const totalWeekBookings = weekDays.reduce((sum, item) => sum + item.bookings, 0);
    const totalWeekSlots = weekDays.reduce((sum, item) => sum + item.slots, 0);
    customerLexiDaySummary.innerHTML = `
      <h3>Week View</h3>
      <p><strong>${escapeHtml(salonName)}</strong><br />Weekly booking and availability overview around ${escapeHtml(dateLabel)}.</p>
      <ul class="customer-lexi-summary-list">
        <li><strong>${totalWeekBookings} booking${totalWeekBookings === 1 ? "" : "s"} this week</strong><small>From your saved bookings in this dashboard</small></li>
        <li><strong>${totalWeekSlots} open slot${totalWeekSlots === 1 ? "" : "s"} showing</strong><small>Current slots visible for the selected salon</small></li>
        <li><strong>${teamMembers.length} team member${teamMembers.length === 1 ? "" : "s"}</strong><small>${escapeHtml(teamMembers.length ? teamMembers.map((m) => m.name).join(", ") : "No staff names listed")}</small></li>
      </ul>
      <ul class="customer-lexi-summary-list">
        ${weekDays
          .map(
            (item) => `<li><strong>${escapeHtml(item.label)}</strong><small>${item.bookings} booking${item.bookings === 1 ? "" : "s"} • ${item.slots} slot${item.slots === 1 ? "" : "s"} • ${escapeHtml(teamMembers.length ? `${teamMembers.length} staff listed` : "No staff listed")}</small></li>`
          )
          .join("")}
      </ul>
      <div class="customer-lexi-summary-actions">
        <button type="button" class="btn btn-ghost" data-customer-lexi-action="week-plan" data-date-key="${escapeHtml(dateKey)}" data-date-label="${escapeHtml(dateLabel)}">Ask Lexi to review this week</button>
        <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
      </div>
    `;
    return;
  }
  if (customerLexiCalendarView === "month") {
    const monthPrefix = dateKey.slice(0, 8);
    const monthlySlotDays = Array.from(dataset.slotsByDate.entries())
      .filter(([key]) => String(key).startsWith(monthPrefix))
      .map(([key, slots]) => ({ key, count: slots.length }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
      .slice(0, 5);
    const monthBookings = Array.from(dataset.bookingsByDate.entries())
      .filter(([key]) => String(key).startsWith(monthPrefix))
      .reduce((sum, [, rows]) => sum + rows.length, 0);
    const monthSlots = Array.from(dataset.slotsByDate.entries())
      .filter(([key]) => String(key).startsWith(monthPrefix))
      .reduce((sum, [, slots]) => sum + slots.length, 0);
    customerLexiDaySummary.innerHTML = `
      <h3>Month View</h3>
      <p><strong>${escapeHtml(salonName)}</strong><br />Monthly booking and availability summary for ${escapeHtml(dateKey.slice(0, 7))}.</p>
      <ul class="customer-lexi-summary-list">
        <li><strong>${monthBookings} booking${monthBookings === 1 ? "" : "s"}</strong><small>Your bookings saved this month</small></li>
        <li><strong>${monthSlots} open slot${monthSlots === 1 ? "" : "s"}</strong><small>Visible slots this month for the selected salon</small></li>
        <li><strong>${teamMembers.length} staff listed</strong><small>${escapeHtml(teamMembers.length ? teamMembers.map((m) => m.name).join(", ") : "No staff names listed")}</small></li>
      </ul>
      <ul class="customer-lexi-summary-list">
        ${
          monthlySlotDays.length
            ? monthlySlotDays
                .map((item) => `<li><strong>${escapeHtml(item.key)}</strong><small>${item.count} slot${item.count === 1 ? "" : "s"} visible</small></li>`)
                .join("")
            : '<li><strong>No visible slot-heavy dates yet</strong><small>Select another salon or month to compare availability.</small></li>'
        }
      </ul>
      <div class="customer-lexi-summary-actions">
        <button type="button" class="btn btn-ghost" data-customer-lexi-action="month-plan" data-date-key="${escapeHtml(dateKey)}" data-date-label="${escapeHtml(dateLabel)}">Ask Lexi to review this month</button>
        <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
      </div>
    `;
    return;
  }
  customerLexiDaySummary.innerHTML = `
    <h3>Selected Day</h3>
    <p><strong>${escapeHtml(dateLabel)}</strong><br />Lexi is comparing your plans with ${escapeHtml(salonName)} availability.</p>
    <ul class="customer-lexi-summary-list">
      <li><strong>${bookingRowsForDay.length} personal booking${bookingRowsForDay.length === 1 ? "" : "s"}</strong><small>${bookingRowsForDay.length ? "Your bookings saved in this dashboard" : "No personal bookings saved for this day"}</small></li>
      <li><strong>${slotsForDay.length} salon slot${slotsForDay.length === 1 ? "" : "s"} showing</strong><small>${slotsForDay.length ? escapeHtml(slotsForDay.slice(0, 3).map((slot) => slot.time).join(", ")) : "No open slots listed for this date"}</small></li>
      <li><strong>${escapeHtml(salonName)}</strong><small>${escapeHtml(formatBusinessTypeLabel(dataset.salon?.businessType || ""))}${dataset.salon?.city ? ` • ${escapeHtml(dataset.salon.city)}` : ""} • ${escapeHtml(teamMembers.length ? `${teamMembers.length} staff listed` : "No staff listed")}</small></li>
    </ul>
    <div class="customer-lexi-summary-actions">
      <button type="button" class="btn btn-ghost" data-customer-lexi-action="day-slots" data-date-key="${escapeHtml(dateKey)}" data-date-label="${escapeHtml(dateLabel)}">Ask Lexi about this day's best slots</button>
      <button type="button" class="btn btn-ghost" data-customer-lexi-action="day-booking" data-date-key="${escapeHtml(dateKey)}" data-date-label="${escapeHtml(dateLabel)}">Let Lexi help me choose a time</button>
      <button type="button" class="btn" data-customer-lexi-action="jump-slots">Open available slots list</button>
    </div>
  `;
}

function renderCustomerLexiCalendar() {
  if (user.role !== "customer") return;
  if (!customerLexiCalendarGrid || !customerLexiCalendarMonth || !customerLexiCalendarMeta) return;

  const dataset = getCustomerLexiCalendarDataset();
  const teamMembers = getCustomerLexiTeamMembers(dataset.salon);
  const monthDate = new Date(customerLexiCalendarMonthCursor.getFullYear(), customerLexiCalendarMonthCursor.getMonth(), 1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  customerLexiCalendarMonth.textContent = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const monthStartWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = todayDateKeyLocal();
  const monthPrefix = `${year}-${pad2(month + 1)}-`;

  let monthSlotCount = 0;
  let monthBookingCount = 0;
  dataset.slotsByDate.forEach((slots, key) => { if (String(key).startsWith(monthPrefix)) monthSlotCount += slots.length; });
  dataset.bookingsByDate.forEach((rows, key) => { if (String(key).startsWith(monthPrefix)) monthBookingCount += rows.length; });

  if (!customerLexiSelectedDateKey || !String(customerLexiSelectedDateKey).startsWith(monthPrefix)) {
    const firstUsefulDate = Array.from(new Set([...dataset.slotsByDate.keys(), ...dataset.bookingsByDate.keys()]))
      .filter((key) => String(key).startsWith(monthPrefix))
      .sort()[0];
    customerLexiSelectedDateKey = firstUsefulDate || (todayKey.startsWith(monthPrefix) ? todayKey : `${monthPrefix}01`);
  }

  customerLexiCalendarMeta.innerHTML = `
    <strong>${escapeHtml(dataset.salon?.name || "Select a salon")}</strong><br />
    ${monthSlotCount} open slot${monthSlotCount === 1 ? "" : "s"} shown this month • ${monthBookingCount} personal booking${monthBookingCount === 1 ? "" : "s"} in your diary • View: ${escapeHtml(customerLexiCalendarView)}
  `;
  if (customerLexiPlannerMeta) {
    customerLexiPlannerMeta.textContent = dataset.salon
      ? `Lexi can compare your bookings with ${dataset.salon.name}'s available times and help you choose a better slot.`
      : "Choose a salon and Lexi will compare your schedule with that salon's open times.";
  }
  renderCustomerLexiStaffLegend(dataset.salon);

  customerLexiCalendarGrid.innerHTML = "";
  for (let i = 0; i < monthStartWeekday; i += 1) {
    const empty = document.createElement("article");
    empty.className = "customer-lexi-day empty";
    empty.innerHTML = '<button type="button" class="customer-lexi-day-btn" disabled aria-hidden="true"></button>';
    customerLexiCalendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthPrefix}${pad2(day)}`;
    const slots = dataset.slotsByDate.get(dateKey) || [];
    const bookings = dataset.bookingsByDate.get(dateKey) || [];
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === customerLexiSelectedDateKey;
    const cell = document.createElement("article");
    cell.className = `customer-lexi-day${slots.length ? " has-slots" : ""}${bookings.length ? " has-booking" : ""}${isToday ? " is-today" : ""}${isSelected ? " selected" : ""}`;
    cell.dataset.dateKey = dateKey;
    cell.innerHTML = `
      <button class="customer-lexi-day-btn" type="button" data-date-key="${dateKey}" aria-label="${dateKey}: ${slots.length} slot${slots.length === 1 ? "" : "s"}, ${bookings.length} booking${bookings.length === 1 ? "" : "s"}">
        <strong>${day}</strong>
        <span class="customer-lexi-day-signals">
          ${slots.length ? `<span class="slots-pill">${slots.length} slot${slots.length === 1 ? "" : "s"}</span>` : ""}
          ${bookings.length ? `<span class="booked-pill">${bookings.length} booked</span>` : ""}
        </span>
        <span class="customer-lexi-day-team" aria-hidden="true">
          ${
            (slots.length || bookings.length) && teamMembers.length
              ? teamMembers
                  .slice(0, 3)
                  .map((member) => `<span class="calendar-day-staff-dot" style="--staff-color:${escapeHtml(member.color)}" title="${escapeHtml(member.name)}"></span>`)
                  .join("")
              : ""
          }
        </span>
      </button>
    `;
    customerLexiCalendarGrid.appendChild(cell);
  }

  if (customerLexiCalendarViewTabs) {
    customerLexiCalendarViewTabs.querySelectorAll(".customer-lexi-view-tab").forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      const nextView = String(button.getAttribute("data-customer-lexi-view") || "").trim().toLowerCase();
      button.classList.toggle("is-active", nextView === customerLexiCalendarView);
      button.setAttribute("aria-selected", nextView === customerLexiCalendarView ? "true" : "false");
    });
  }

  renderCustomerLexiDaySummary(dataset);
}

function renderCustomerBookingHistory(rows = []) {
  if (!customerBookingHistory) return;
  customerBookingHistory.innerHTML = "";
  if (!rows.length) {
    customerBookingHistory.innerHTML = "<li>No visits booked yet.</li>";
    return;
  }
  const sorted = rows
    .slice()
    .sort((a, b) => `${b.date || ""} ${b.time || ""}`.localeCompare(`${a.date || ""} ${a.time || ""}`));
  const now = new Date();
  sorted.forEach((row) => {
    const bookingDate = parseBookingDate(row.date);
    const isPast = bookingDate ? bookingDate < now : false;
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${row.businessName || "Business"} | ${row.service || "Service"}</strong><br />
      <small>${row.date || "N/A"} at ${row.time || "N/A"} ? ${row.status || "unknown"} ? ${isPast ? "Past visit" : "Upcoming booking"}</small>
    `;
    customerBookingHistory.appendChild(li);
  });
}

function renderCustomerAnalytics(rows = []) {
  if (!customerAnalyticsGrid) return;
  customerAnalyticsGrid.innerHTML = "";
  const total = rows.length;
  const completed = rows.filter((row) => normalizeText(row.status) === "completed").length;
  const cancelled = rows.filter((row) => normalizeText(row.status) === "cancelled").length;
  const upcoming = rows.filter((row) => {
    const date = parseBookingDate(row.date);
    return date && date >= new Date() && normalizeText(row.status) !== "cancelled";
  }).length;
  const uniqueSalons = new Set(rows.map((row) => normalizeText(row.businessName)).filter(Boolean)).size;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const cards = [
    { label: "Total Bookings", value: String(total) },
    { label: "Completed Visits", value: String(completed) },
    { label: "Upcoming Bookings", value: String(upcoming) },
    { label: "Cancellation Count", value: String(cancelled) },
    { label: "Completion Rate", value: `${completionRate}%` },
    { label: "Businesses Visited", value: String(uniqueSalons) }
  ];
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "dash-card";
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    customerAnalyticsGrid.appendChild(article);
  });
}

function refreshCustomerDashboard() {
  if (user.role !== "customer") return;
  renderCustomerBookingHistory(bookingRows);
  renderCustomerAnalytics(bookingRows);
  renderCustomerLexiCalendar();
}

function initializeCustomerExperience() {
  if (user.role !== "customer") return;
  customerSalonResults = customerSalonDirectory.slice();
  selectedCustomerSalonId = customerSalonResults[0]?.id || "";
  customerLexiCalendarMonthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  customerLexiSelectedDateKey = "";
  customerReceptionTranscript = [
    {
      role: "ai",
        text: "Hi, I'm Lexi. How can I help today?"
    }
  ];
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
  renderCustomerReceptionChat();
  refreshCustomerDashboard();
}

function formatProviderLabel(value) {
  const provider = String(value || "").trim().toLowerCase();
  const map = {
    quickbooks: "QuickBooks",
    xero: "Xero",
    freshbooks: "FreshBooks",
    sage: "Sage"
  };
  return map[provider] || provider;
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function setAccountingStatus(message, isError = false) {
  if (!accountingStatusNote) return;
  accountingStatusNote.textContent = message || "";
  accountingStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function setAccountingLiveNote(message, isError = false) {
  if (!accountingLiveNote) return;
  accountingLiveNote.textContent = message || "";
  accountingLiveNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function formatRelativeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "just now";
  const diffSec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function timeframeLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "7d") return "Last 7 Days";
  if (key === "30d") return "Last 30 Days";
  if (key === "custom") return "Custom Range";
  return "Today";
}

function setAccountingTimeframe(nextTimeframe, { reload = true } = {}) {
  const safe = nextTimeframe === "7d" || nextTimeframe === "30d" ? nextTimeframe : "today";
  accountingLiveTimeframe = safe;
  setQuickFilterVisualState("");
  accountingLiveRangeFrom = "";
  accountingLiveRangeTo = "";
  if (accountingCustomFrom) accountingCustomFrom.value = "";
  if (accountingCustomTo) accountingCustomTo.value = "";
  const buttons = [accountingTfToday, accountingTf7d, accountingTf30d];
  buttons.forEach((btn) => {
    if (!btn) return;
    const active = String(btn.getAttribute("data-timeframe") || "") === safe;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (reload) {
    loadAccountingLiveRevenue().catch(() => {});
  }
}

function setQuickFilterVisualState(key) {
  accountingLiveQuickFilter = key || "";
  const entries = [
    [accountingQfWeek, "week"],
    [accountingQfMonth, "month"]
  ];
  entries.forEach(([btn, id]) => {
    if (!btn) return;
    btn.classList.toggle("active", accountingLiveQuickFilter === id);
  });
  if (accountingLiveQuickFilter) {
    [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
      if (!btn) return;
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
  }
}

function setAccountingLiveRange(from, to, { reload = true } = {}) {
  accountingLiveRangeFrom = String(from || "").trim();
  accountingLiveRangeTo = String(to || "").trim();
  if (accountingCustomFrom) accountingCustomFrom.value = accountingLiveRangeFrom;
  if (accountingCustomTo) accountingCustomTo.value = accountingLiveRangeTo;
  if (reload) {
    loadAccountingLiveRevenue().catch(() => {});
  }
}

function getThisWeekRange() {
  const now = new Date();
  const weekday = now.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return { from, to };
}

function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return { from, to };
}

function renderAccountingLiveRevenue() {
  if (
    !accountingLivePanel ||
    !accountingLiveCards ||
    !accountingLiveGauges ||
    !accountingLiveRevenueBars ||
    !accountingLiveCancelBars
  ) return;
  if (!isDashboardManagerRole()) {
    accountingLivePanel.style.display = "none";
    return;
  }

  accountingLivePanel.style.display = "";
  const mode = String(accountingLivePayload?.mode || "business");
  const timeframe = String(accountingLivePayload?.timeframe || accountingLiveTimeframe || "today");
  const rangeFrom = String(accountingLivePayload?.range?.from || "");
  const rangeTo = String(accountingLivePayload?.range?.to || "");
  const periodText = timeframe === "custom" && rangeFrom && rangeTo ? `${rangeFrom} to ${rangeTo}` : timeframeLabel(timeframe);
  if (timeframe !== accountingLiveTimeframe) {
    accountingLiveTimeframe = timeframe === "7d" || timeframe === "30d" ? timeframe : "today";
    [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
      if (!btn) return;
      const active = String(btn.getAttribute("data-timeframe") || "") === accountingLiveTimeframe;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  if (timeframe === "custom" && rangeFrom && rangeTo) {
    setQuickFilterVisualState(accountingLiveQuickFilter || "custom");
    if (accountingCustomFrom) accountingCustomFrom.value = rangeFrom;
    if (accountingCustomTo) accountingCustomTo.value = rangeTo;
    accountingLiveRangeFrom = rangeFrom;
    accountingLiveRangeTo = rangeTo;
  }
  const cards = accountingLivePayload?.cards || {};
  const gauges = accountingLivePayload?.gauges || {};
  const hourlyRows = Array.isArray(accountingLivePayload?.stream?.hourly) ? accountingLivePayload.stream.hourly : [];
  const weeklyRows = Array.isArray(accountingLivePayload?.stream?.weekly) ? accountingLivePayload.stream.weekly : [];

  accountingLiveCards.innerHTML = "";
  const cardRows = mode === "platform"
    ? [
        { label: `Estimated MRR (${periodText})`, value: formatMoney(cards.todayRevenue || 0) },
        { label: `Estimated Revenue (${periodText})`, value: formatMoney(cards.todayCancelledRevenue || 0) },
        { label: "Subscription Cancellations", value: String(cards.todayBookings || 0) },
        { label: "Booking Cancellations", value: String(cards.todayCancellations || 0) }
      ]
    : [
        { label: `${periodText} Revenue`, value: formatMoney(cards.todayRevenue || 0) },
        { label: "Last 60m Revenue", value: formatMoney(cards.lastHourRevenue || 0) },
        { label: "Last 15m Revenue", value: formatMoney(cards.last15MinRevenue || 0) },
        { label: `${periodText} Cancellations`, value: String(cards.todayCancellations || 0) }
      ];
  cardRows.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    accountingLiveCards.appendChild(article);
  });

  const targetProgress = Number(gauges.targetProgressPct || 0);
  const cancellationRate = Number(gauges.cancellationRatePct || 0);
  accountingLiveGauges.innerHTML = `
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, targetProgress))}">
        <span>${Math.round(targetProgress)}%</span>
      </div>
      <small>${mode === "platform" ? "MRR goal progress" : "Daily target progress"} (${formatMoney(gauges.dailyTarget || 0)} target)</small>
    </article>
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, cancellationRate))}">
        <span>${Math.round(cancellationRate)}%</span>
      </div>
      <small>${mode === "platform" ? "Subscription churn signal" : "Cancellation rate today"}</small>
    </article>
  `;

  let flowRows = hourlyRows.length ? hourlyRows : weeklyRows.slice(-6);
  if (!flowRows.length && (user.role === "subscriber" || user.role === "admin")) {
    const labels = mode === "platform"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM"];
    flowRows = labels.map((label) => ({ label, revenue: 0, cancellations: 0 }));
  }
  const maxRevenue = Math.max(1, ...flowRows.map((row) => Number(row.revenue || 0)));
  accountingLiveRevenueBars.innerHTML = "";
  flowRows.forEach((row) => {
    const height = Math.max(8, Math.round((Number(row.revenue || 0) / maxRevenue) * 108));
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `
      <div class="live-bar revenue" style="--bar-height:${height}px"></div>
      <small>${escapeHtml(row.label || "")}</small>
      <small>${escapeHtml(formatMoney(row.revenue || 0))}</small>
    `;
    accountingLiveRevenueBars.appendChild(col);
  });

  const maxCancels = Math.max(1, ...flowRows.map((row) => Number(row.cancellations || 0)));
  accountingLiveCancelBars.innerHTML = "";
  flowRows.forEach((row) => {
    const height = Math.max(8, Math.round((Number(row.cancellations || 0) / maxCancels) * 108));
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `
      <div class="live-bar cancel" style="--bar-height:${height}px"></div>
      <small>${escapeHtml(row.label || "")}</small>
      <small>${Number(row.cancellations || 0)}</small>
    `;
    accountingLiveCancelBars.appendChild(col);
  });

  const stamp = formatRelativeTime(accountingLivePayload?.generatedAt);
  const scopeText = mode === "platform" ? "Platform" : "Business";
  if (!accountingLivePayload && user.role === "subscriber") {
    setAccountingLiveNote(`${scopeText} live revenue is ready for a clean start. Gauges and graphs will fill as bookings and revenue data come in.`);
  } else {
    setAccountingLiveNote(
      `${scopeText} live sync (${periodText}) ${stamp}. Auto-refresh every ${Number(accountingLivePayload?.refreshIntervalSec || 15)}s.`
    );
  }
  renderExecutivePulse();
}

async function loadAccountingLiveRevenue({ silent = false } = {}) {
  if (isDashboardDemoDataModeActive()) {
    if (accountingLivePayload && typeof accountingLivePayload === "object") {
      accountingLivePayload.timeframe = accountingLiveRangeFrom && accountingLiveRangeTo ? "custom" : accountingLiveTimeframe;
      accountingLivePayload.range = accountingLiveRangeFrom && accountingLiveRangeTo
        ? { from: accountingLiveRangeFrom, to: accountingLiveRangeTo }
        : undefined;
      accountingLivePayload.generatedAt = new Date().toISOString();
    }
    renderAccountingLiveRevenue();
    return;
  }
  try {
    const params = new URLSearchParams();
    params.set("timeframe", accountingLiveRangeFrom && accountingLiveRangeTo ? "custom" : accountingLiveTimeframe || "today");
    if (accountingLiveRangeFrom && accountingLiveRangeTo) {
      params.set("from", accountingLiveRangeFrom);
      params.set("to", accountingLiveRangeTo);
    }
    let endpoint = "";
    if (canManageBusinessModules()) {
      params.set("scope", "business");
      endpoint = withManagedBusiness(`/api/accounting-integrations/live-revenue?${params.toString()}`);
    } else if (user.role === "admin") {
      params.set("scope", "platform");
      endpoint = `/api/accounting-integrations/live-revenue?${params.toString()}`;
    }
    if (!endpoint) {
      renderAccountingLiveRevenue();
      return;
    }
    const res = await fetch(endpoint, { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load live accounting revenue.");
    accountingLivePayload = data || null;
    renderAccountingLiveRevenue();
  } catch (error) {
    if (!silent) setAccountingStatus(error.message, true);
    setAccountingLiveNote(error.message, true);
  }
}

function startAccountingLiveStream() {
  if (accountingLiveTimerId) {
    window.clearInterval(accountingLiveTimerId);
    accountingLiveTimerId = null;
  }
  if (!isDashboardManagerRole()) return;
  if (isDashboardDemoDataModeActive()) {
    renderAccountingLiveRevenue();
    return;
  }
  loadAccountingLiveRevenue().catch(() => {});
  accountingLiveTimerId = window.setInterval(() => {
    loadAccountingLiveRevenue({ silent: true }).catch(() => {});
  }, 15000);
}

function setStaffStatus(message, isError = false) {
  if (!staffStatusNote) return;
  staffStatusNote.textContent = message || "";
  staffStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseShiftDaysInput(raw) {
  return String(raw || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function loadStaffRotaOverrides() {
  // Legacy local cache loader retained for mock mode and offline fallback.
  try {
    const parsed = JSON.parse(localStorage.getItem(STAFF_ROTA_OVERRIDES_STORAGE_KEY) || "{}");
    staffRotaOverrides = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    staffRotaOverrides = {};
  }
  staffRotaOverridesLoaded = true;
}

function saveStaffRotaOverrides() {
  try {
    localStorage.setItem(STAFF_ROTA_OVERRIDES_STORAGE_KEY, JSON.stringify(staffRotaOverrides || {}));
  } catch {
    // ignore storage failures
  }
}

function getStaffWeekStartDate() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayIndex = base.getDay();
  const mondayDiff = dayIndex === 0 ? -6 : 1 - dayIndex;
  base.setDate(base.getDate() + mondayDiff + staffRotaWeekOffset * 7);
  base.setHours(0, 0, 0, 0);
  return base;
}

function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getStaffWeekKey() {
  return formatDateKey(getStaffWeekStartDate());
}

function getStaffWeekMeta() {
  const weekStart = getStaffWeekStartDate();
  return STAFF_ROTA_DAYS.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      ...day,
      date,
      dateLabel: `${date.getDate()}/${date.getMonth() + 1}`,
      longLabel: date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
    };
  });
}

function formatStaffWeekRange() {
  const days = getStaffWeekMeta();
  const start = days[0]?.date;
  const end = days[6]?.date;
  if (!start || !end) return "This Week";
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-GB", { month: sameMonth ? undefined : "short", day: "numeric" });
  return `${startLabel} - ${endLabel}`;
}

function normalizeIncomingRotaWeek(payload) {
  const weekStart = String(payload?.weekStart || "").trim() || getStaffWeekKey();
  const rawCells = payload?.cells && typeof payload.cells === "object" ? payload.cells : {};
  const cells = {};
  Object.entries(rawCells).forEach(([staffId, dayMap]) => {
    const id = String(staffId || "").trim();
    if (!id || !dayMap || typeof dayMap !== "object") return;
    const nextDayMap = {};
    Object.entries(dayMap).forEach(([dayKey, cell]) => {
      const dk = String(dayKey || "").trim().toLowerCase();
      if (!STAFF_ROTA_DAYS.some((d) => d.key === dk)) return;
      if (cell && typeof cell === "object") {
        nextDayMap[dk] = {
          status: normalizeStaffCellStatus(cell.status),
          shift: normalizeStaffShiftType(cell.shift)
        };
      } else if (typeof cell === "string") {
        nextDayMap[dk] = {
          status: normalizeStaffCellStatus(cell),
          shift: "full"
        };
      }
    });
    if (Object.keys(nextDayMap).length) cells[id] = nextDayMap;
  });
  const sicknessLogs = Array.isArray(payload?.sicknessLogs)
    ? payload.sicknessLogs
        .map((entry) => ({
          id: String(entry?.id || "").trim() || "",
          staffId: String(entry?.staffId || "").trim(),
          staffName: String(entry?.staffName || "").trim(),
          day: String(entry?.day || "").trim().toLowerCase(),
          shift: normalizeStaffShiftType(entry?.shift),
          replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
          weekStart: String(entry?.weekStart || weekStart).trim(),
          reportedAt: String(entry?.reportedAt || "").trim() || null
        }))
        .filter((entry) => entry.staffId && STAFF_ROTA_DAYS.some((d) => d.key === entry.day))
    : [];
  return { weekStart, cells, sicknessLogs, updatedAt: payload?.updatedAt || null };
}

async function loadStaffRotaWeek({ silent = false } = {}) {
  const weekKey = getStaffWeekKey();
  if (isDashboardDemoDataModeActive()) {
    if (!staffRotaOverridesLoaded) loadStaffRotaOverrides();
    if (!staffRotaOverrides[weekKey]) {
      staffRotaOverrides[weekKey] = { cells: {}, sicknessLogs: [], updatedAt: null };
      saveStaffRotaOverrides();
    }
    return staffRotaOverrides[weekKey];
  }
  if (staffRotaWeekLoading) return staffRotaOverrides?.[weekKey] || null;
  staffRotaWeekLoading = true;
  try {
    const res = await fetch(withManagedBusiness(`/api/staff-roster/rota?weekStart=${encodeURIComponent(weekKey)}`), {
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load rota week.");
    const normalized = normalizeIncomingRotaWeek(data);
    if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
    staffRotaOverrides[normalized.weekStart] = normalized;
    staffRotaOverridesLoaded = true;
    saveStaffRotaOverrides();
    return normalized;
  } catch (error) {
    if (!silent) setStaffStatus(error.message, true);
    if (!staffRotaOverridesLoaded) loadStaffRotaOverrides();
    return staffRotaOverrides?.[weekKey] || null;
  } finally {
    staffRotaWeekLoading = false;
  }
}

async function persistStaffRotaBulk({ updates = [], sicknessLogs = [] } = {}) {
  const weekStart = getStaffWeekKey();
  const normalizedUpdates = (Array.isArray(updates) ? updates : [])
    .map((item) => ({
      staffId: String(item?.staffId || "").trim(),
      day: String(item?.day || "").trim().toLowerCase(),
      status: normalizeStaffCellStatus(item?.status),
      shift: normalizeStaffShiftType(item?.shift)
    }))
    .filter((item) => item.staffId && STAFF_ROTA_DAYS.some((d) => d.key === item.day));
  const normalizedLogs = (Array.isArray(sicknessLogs) ? sicknessLogs : [])
    .map((item) => ({
      staffId: String(item?.staffId || "").trim(),
      staffName: String(item?.staffName || "").trim(),
      day: String(item?.day || "").trim().toLowerCase(),
      shift: normalizeStaffShiftType(item?.shift),
      replacementMode: String(item?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest"
    }))
    .filter((item) => item.staffId && STAFF_ROTA_DAYS.some((d) => d.key === item.day));

  if (isDashboardDemoDataModeActive()) {
    if (!staffRotaOverridesLoaded) loadStaffRotaOverrides();
    const bucket = getStaffWeekOverridesBucket(true);
    if (bucket) {
      normalizedUpdates.forEach((item) => {
        if (!bucket.cells[item.staffId]) bucket.cells[item.staffId] = {};
        bucket.cells[item.staffId][item.day] = { status: item.status, shift: item.shift };
      });
      if (!Array.isArray(bucket.sicknessLogs)) bucket.sicknessLogs = [];
      normalizedLogs.forEach((log) => {
        bucket.sicknessLogs.push({
          id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          ...log,
          weekStart,
          reportedAt: new Date().toISOString()
        });
      });
      bucket.updatedAt = new Date().toISOString();
      saveStaffRotaOverrides();
    }
    return getStaffWeekOverridesBucket();
  }

  const res = await fetch(withManagedBusiness("/api/staff-roster/rota/bulk"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ weekStart, updates: normalizedUpdates, sicknessLogs: normalizedLogs })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save rota changes.");
  const normalized = normalizeIncomingRotaWeek(data);
  if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
  staffRotaOverrides[weekStart] = normalized;
  staffRotaOverridesLoaded = true;
  saveStaffRotaOverrides();
  return normalized;
}

async function resetStaffRotaWeekRemote() {
  const weekStart = getStaffWeekKey();
  if (isDashboardDemoDataModeActive()) {
    clearStaffWeekOverrides();
    return;
  }
  const res = await fetch(withManagedBusiness("/api/staff-roster/rota/reset"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ weekStart })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to reset rota week.");
  const normalized = normalizeIncomingRotaWeek(data);
  if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
  staffRotaOverrides[weekStart] = normalized;
  staffRotaOverridesLoaded = true;
  saveStaffRotaOverrides();
}

function normalizeStaffCellStatus(value) {
  const v = String(value || "").trim().toLowerCase();
  if (["scheduled", "available", "off", "sick", "covering"].includes(v)) return v;
  return "off";
}

function normalizeStaffShiftType(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "am" || v === "pm" || v === "full") return v;
  return "full";
}

function getStaffMemberId(member) {
  return String(member?.id || member?.name || "").trim();
}

function getStaffWeekOverridesBucket(createIfMissing = false) {
  const weekKey = getStaffWeekKey();
  if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
  if (!staffRotaOverrides[weekKey] && createIfMissing) {
    staffRotaOverrides[weekKey] = { cells: {}, sicknessLogs: [], updatedAt: null };
  }
  return staffRotaOverrides[weekKey] || null;
}

function getStaffMemberWeekOverrides(memberId, createIfMissing = false) {
  const bucket = getStaffWeekOverridesBucket(createIfMissing);
  if (!bucket) return null;
  if (!bucket.cells || typeof bucket.cells !== "object") bucket.cells = {};
  if (!bucket.cells[memberId] && createIfMissing) bucket.cells[memberId] = {};
  return bucket.cells[memberId] || null;
}

function getBaseStaffDayStatus(member, dayKey) {
  const shiftDays = Array.isArray(member?.shiftDays)
    ? member.shiftDays.map((d) => String(d || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const scheduled = shiftDays.includes(String(dayKey || "").toLowerCase());
  if (scheduled) return member?.availability === "off_duty" ? "off" : "scheduled";
  return member?.availability === "on_duty" ? "available" : "off";
}

function getStaffDayState(member, dayKey) {
  const memberId = getStaffMemberId(member);
  const overrides = memberId ? getStaffMemberWeekOverrides(memberId) : null;
  const override = overrides ? overrides[String(dayKey || "").toLowerCase()] : null;
  if (override && typeof override === "object") {
    return {
      status: normalizeStaffCellStatus(override.status),
      shift: normalizeStaffShiftType(override.shift)
    };
  }
  if (typeof override === "string" && override) {
    return {
      status: normalizeStaffCellStatus(override),
      shift: "full"
    };
  }
  return {
    status: getBaseStaffDayStatus(member, dayKey),
    shift: "full"
  };
}

function getStaffDayStatus(member, dayKey) {
  return getStaffDayState(member, dayKey).status;
}

function getStaffDayShift(member, dayKey) {
  return getStaffDayState(member, dayKey).shift;
}

function setStaffDayState(memberId, dayKey, { status, shift } = {}) {
  const nextStatus = normalizeStaffCellStatus(status);
  const nextShift = normalizeStaffShiftType(shift);
  const bucket = getStaffMemberWeekOverrides(memberId, true);
  if (!bucket) return;
  bucket[String(dayKey || "").toLowerCase()] = { status: nextStatus, shift: nextShift };
  saveStaffRotaOverrides();
}

function setStaffDayStatus(memberId, dayKey, status) {
  setStaffDayState(memberId, dayKey, { status, shift: "full" });
}

function clearStaffWeekOverrides() {
  const weekKey = getStaffWeekKey();
  if (staffRotaOverrides && staffRotaOverrides[weekKey]) {
    delete staffRotaOverrides[weekKey];
    saveStaffRotaOverrides();
  }
}

function pruneStaffRotaOverridesForCurrentRoster() {
  const validIds = new Set((Array.isArray(staffRosterRows) ? staffRosterRows : []).map((m) => getStaffMemberId(m)).filter(Boolean));
  if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") return;
  let changed = false;
  Object.keys(staffRotaOverrides).forEach((weekKey) => {
    const week = staffRotaOverrides[weekKey];
    if (!week || typeof week !== "object") {
      delete staffRotaOverrides[weekKey];
      changed = true;
      return;
    }
    const cells = week.cells && typeof week.cells === "object" ? week.cells : {};
    Object.keys(cells).forEach((memberId) => {
      if (!validIds.has(memberId)) {
        delete cells[memberId];
        changed = true;
      }
    });
    week.cells = cells;
    if (Array.isArray(week.sicknessLogs)) {
      const before = week.sicknessLogs.length;
      week.sicknessLogs = week.sicknessLogs.filter((entry) => validIds.has(String(entry?.staffId || "")));
      if (week.sicknessLogs.length !== before) changed = true;
    } else {
      week.sicknessLogs = [];
    }
    if (!Object.keys(week.cells).length && (!week.sicknessLogs || !week.sicknessLogs.length)) {
      delete staffRotaOverrides[weekKey];
      changed = true;
    }
  });
  if (changed) saveStaffRotaOverrides();
}

function roleLabel(value) {
  return String(value || "staff")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getStaffStatusLabel(status) {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "available":
      return "Available";
    case "sick":
      return "Sick";
    case "covering":
      return "Covering";
    default:
      return "Off";
  }
}

function getStaffStatusDotColor(status) {
  switch (status) {
    case "scheduled":
      return "#7cead8";
    case "available":
      return "#6db9ff";
    case "sick":
      return "#ff949c";
    case "covering":
      return "#ffcb6b";
    default:
      return "#7d8697";
  }
}

function getStaffColorForId(staffId) {
  const id = String(staffId || "").trim();
  if (!id) return "#7cead8";
  const palette = [
    "#ff7aa8", "#6db9ff", "#7cead8", "#b891ff", "#ffc35c", "#5ad0ff", "#b7df5a", "#f091ff",
    "#ff9a6a", "#88a9ff", "#5fd8a7", "#d79b5a", "#ff6f91", "#4cb5ff", "#45d7c0", "#9b7cff",
    "#f7b84b", "#33c8ff", "#9ad94a", "#df77ff", "#ff8652", "#7397ff", "#43c98f", "#c58a45",
    "#ff5fbe", "#58a6ff", "#3fdcc8", "#a98dff", "#ffd166", "#4fd1c5", "#a3e635", "#e879f9"
  ];

  const knownIds = new Set([id]);
  (Array.isArray(staffRosterRows) ? staffRosterRows : []).forEach((member) => {
    const memberId = String(getStaffMemberId(member) || "").trim();
    if (memberId) knownIds.add(memberId);
  });

  const orderedIds = Array.from(knownIds).sort();
  const usedPaletteSlots = new Set();
  const assigned = new Map();

  orderedIds.forEach((staffKey, orderIndex) => {
    let hash = 0;
    for (let i = 0; i < staffKey.length; i += 1) {
      hash = (hash * 31 + staffKey.charCodeAt(i)) | 0;
    }
    let paletteIndex = Math.abs(hash) % palette.length;
    let guard = 0;
    while (usedPaletteSlots.has(paletteIndex) && guard < palette.length) {
      paletteIndex = (paletteIndex + 1) % palette.length;
      guard += 1;
    }

    if (guard < palette.length) {
      usedPaletteSlots.add(paletteIndex);
      assigned.set(staffKey, palette[paletteIndex]);
      return;
    }

    // Fallback for unusually large teams: generate additional distinct colors deterministically.
    const hue = (orderIndex * 137.508) % 360;
    const sat = 76;
    const light = 64 - ((Math.floor(orderIndex / palette.length) % 3) * 7);
    assigned.set(staffKey, `hsl(${hue.toFixed(1)}deg ${sat}% ${light}%)`);
  });

  return assigned.get(id) || palette[0];
}

function getStaffInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function nextStaffCellStatus(current) {
  const cycle = ["scheduled", "available", "off", "sick", "covering"];
  const index = cycle.indexOf(normalizeStaffCellStatus(current));
  return cycle[(index + 1) % cycle.length];
}

function getStaffShiftLabel(shift) {
  const value = normalizeStaffShiftType(shift);
  if (value === "am") return "AM";
  if (value === "pm") return "PM";
  return "Full";
}

function buildStaffRotaSnapshot() {
  if (!staffRotaOverridesLoaded) loadStaffRotaOverrides();
  const weekDays = getStaffWeekMeta();
  const members = Array.isArray(staffRosterRows) ? staffRosterRows : [];
  const weekBucket = getStaffWeekOverridesBucket(false);
  const rows = members.map((member) => ({
    member,
    memberId: getStaffMemberId(member),
    days: weekDays.map((d) => {
      const state = getStaffDayState(member, d.key);
      return { ...d, status: state.status, shift: state.shift };
    })
  }));
  const dayStats = weekDays.map((day) => {
    let scheduled = 0;
    let available = 0;
    let off = 0;
    let sick = 0;
    let covering = 0;
    rows.forEach((row) => {
      const status = row.days.find((d) => d.key === day.key)?.status || "off";
      if (status === "scheduled") scheduled += 1;
      else if (status === "available") available += 1;
      else if (status === "sick") sick += 1;
      else if (status === "covering") covering += 1;
      else off += 1;
    });
    const isWeekend = day.key === "sat" || day.key === "sun";
    const target = isWeekend ? 3 : 2;
    const activeCoverage = scheduled + covering;
    const gap = Math.max(0, target - activeCoverage);
    return { ...day, scheduled, available, off, sick, covering, target, activeCoverage, gap };
  });
  return {
    weekDays,
    rows,
    dayStats,
    sicknessLogs: Array.isArray(weekBucket?.sicknessLogs) ? weekBucket.sicknessLogs : []
  };
}

function findCoverCandidatesForDay(dayKey, excludedMemberId = "") {
  const candidates = [];
  (Array.isArray(staffRosterRows) ? staffRosterRows : []).forEach((member) => {
    const memberId = getStaffMemberId(member);
    if (!memberId || memberId === excludedMemberId) return;
    const status = getStaffDayStatus(member, dayKey);
    if (status === "available" || status === "scheduled") {
      candidates.push({
        id: memberId,
        name: member.name || "Staff",
        role: roleLabel(member.role),
        status
      });
    }
  });
  return candidates;
}

function renderStaffSummary() {
  if (!staffSummaryCards) return;
  const snapshot = buildStaffRotaSnapshot();
  const totalMembers = snapshot.rows.length;
  const onDutyCount = snapshot.rows.filter((row) => row.member?.availability === "on_duty").length;
  const offDutyCount = Math.max(0, totalMembers - onDutyCount);
  const totalSickCalls = snapshot.dayStats.reduce((sum, day) => sum + day.sick, 0);
  const totalCovering = snapshot.dayStats.reduce((sum, day) => sum + day.covering, 0);
  const capacityRiskDays = snapshot.dayStats.filter((day) => day.gap > 0).length;
  const cards = [
    { label: "Team Members", value: totalMembers },
    { label: "Available Team", value: onDutyCount },
    { label: "Off Duty", value: offDutyCount },
    { label: "Sick Calls (Week)", value: totalSickCalls },
    { label: "Cover Actions", value: totalCovering + (capacityRiskDays ? ` / ${capacityRiskDays} risk` : "") }
  ];
  staffSummaryCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    staffSummaryCards.appendChild(article);
  });
}

function renderStaffRoster() {
  if (!staffRosterList) return;
  const snapshot = buildStaffRotaSnapshot();
  if (staffWeekLabel) staffWeekLabel.textContent = formatStaffWeekRange();
  if (staffRotaHint) {
    staffRotaHint.textContent = manageModeEnabled
      ? "Paint rota cells with the Status + Shift controls. Drag across the grid to fill multiple cells."
      : "Switch Edit Mode on to paint rota cells, mark sickness, and auto-fill cover.";
  }
  staffRosterList.innerHTML = "";
  if (!snapshot.rows.length) {
    staffRosterList.innerHTML =
      "<li><div class='staff-meta'><strong>No team members added yet.</strong><br /><small>Add your team here so you can plan cover and capacity properly.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='staff' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Team Setup</button></div></li>";
    if (staffRotaGrid) {
      staffRotaGrid.innerHTML = `
        <div class="staff-rota-col-head"><strong>Staff</strong><small>Rota</small></div>
        ${snapshot.weekDays.map((d) => `<div class="staff-rota-col-head"><strong>${escapeHtml(d.label)}</strong><small>${escapeHtml(d.dateLabel)}</small></div>`).join("")}
      `;
    }
    if (staffCoverageStrip) staffCoverageStrip.innerHTML = "";
    if (staffCoverageAlerts) {
      staffCoverageAlerts.innerHTML = "<li><strong>Coverage planner ready.</strong><small>Add employees and assign rota days to see daily capacity and sickness cover suggestions.</small></li>";
    }
    return;
  }
  if (!snapshot.rows.some((row) => row.memberId === staffRotaSelectedMemberId)) {
    staffRotaSelectedMemberId = snapshot.rows[0]?.memberId || "";
  }
  snapshot.rows.forEach((row) => {
    const member = row.member;
    const li = document.createElement("li");
    const staffColor = getStaffColorForId(row.memberId);
    li.style.setProperty("--staff-color", staffColor);
    const days = Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(", ") : "No rota days";
    const sickDays = row.days.filter((d) => d.status === "sick").map((d) => d.label).join(", ");
    if (row.memberId === staffRotaSelectedMemberId) li.classList.add("is-selected");
    li.innerHTML = `
      <div class="staff-meta">
        <div class="staff-meta-line">
          <strong>${escapeHtml(member.name || "Staff Member")}</strong>
          <span class="staff-role-pill"><span class="staff-color-dot"></span>${escapeHtml(roleLabel(member.role))}</span>
        </div>
        <small>${member.availability === "on_duty" ? "Available for scheduling" : "Off-duty profile"} • Base rota: ${escapeHtml(days)}</small>
        <small>${sickDays ? `Sick call flagged: ${escapeHtml(sickDays)}` : "No sickness alerts this week."}</small>
      </div>
      <div class="staff-actions">
        <button class="btn btn-ghost staff-select" type="button" data-id="${member.id}">Focus</button>
        <button class="btn btn-ghost manage-only staff-sick" type="button" data-id="${member.id}">Report Sick</button>
        <button class="btn btn-ghost manage-only staff-toggle" type="button" data-id="${member.id}" data-next="${
      member.availability === "on_duty" ? "off_duty" : "on_duty"
    }">
          ${member.availability === "on_duty" ? "Set Off Duty" : "Set Available"}
        </button>
        <button class="btn btn-ghost manage-only staff-edit" type="button" data-id="${member.id}">Edit</button>
        <button class="btn btn-ghost manage-only staff-remove" type="button" data-id="${member.id}">Delete</button>
      </div>
    `;
    staffRosterList.appendChild(li);
  });

  if (staffRotaGrid) {
    const pieces = [];
    snapshot.weekDays.forEach((d) => {
      const stat = snapshot.dayStats.find((s) => s.key === d.key);
      pieces.push(
        `<div class="staff-rota-col-head">
          <strong>${escapeHtml(d.label)}</strong>
          <small>${escapeHtml(d.dateLabel)} • ${stat ? `${stat.activeCoverage}/${stat.target}` : "0/0"}</small>
        </div>`
      );
    });
    snapshot.weekDays.forEach((d) => {
      const workingDots = [];
      snapshot.rows.forEach((row) => {
        const day = row.days.find((entry) => entry.key === d.key);
        if (!day) return;
        const isWorking = day.status === "scheduled" || day.status === "covering";
        if (!isWorking) return;
        const staffColor = getStaffColorForId(row.memberId);
        const statusLabel = getStaffStatusLabel(day.status);
        const shiftLabel = getStaffShiftLabel(day.shift);
        workingDots.push(
          `<button
            class="staff-rota-dot-btn${row.memberId === staffRotaSelectedMemberId ? " is-selected" : ""}"
            type="button"
            style="--staff-color:${escapeHtml(staffColor)};"
            data-id="${escapeHtml(row.memberId)}"
            data-day="${escapeHtml(day.key)}"
            data-status="${escapeHtml(day.status)}"
            data-shift="${escapeHtml(day.shift || "full")}"
            title="${escapeHtml(`${row.member.name || "Staff"} • ${shiftLabel}`)}"
            aria-label="${escapeHtml(`${row.member.name || "Staff"} ${day.longLabel} ${statusLabel} ${shiftLabel}`)}">
            ${escapeHtml(getStaffInitials(row.member.name || "Staff"))}
          </button>`
        );
      });
      pieces.push(`
        <div class="staff-rota-day-cell" data-day="${escapeHtml(d.key)}" aria-label="${escapeHtml(`${d.label} working staff`)}">
          <div class="staff-rota-day-dots">
            ${workingDots.join("") || `<span class="staff-rota-day-empty">No cover</span>`}
          </div>
        </div>
      `);
    });
    staffRotaGrid.innerHTML = pieces.join("");
  }

  if (staffColorLegend) {
    const chips = snapshot.rows.slice(0, 8).map((row) => {
      const color = getStaffColorForId(row.memberId);
      return `<span class="staff-color-chip" style="--staff-color:${escapeHtml(color)};"><span class="staff-color-dot"></span>${escapeHtml(row.member.name || "Staff")}</span>`;
    });
    if (snapshot.rows.length > 8) {
      chips.push(`<span class="staff-color-chip">+${snapshot.rows.length - 8} more</span>`);
    }
    staffColorLegend.innerHTML = chips.join("");
  }

  if (staffCoverageStrip) {
    staffCoverageStrip.innerHTML = snapshot.dayStats.map((day) => {
      const cls = day.gap > 1 ? "staff-capacity-pill is-risk" : day.gap === 1 || day.sick > 0 ? "staff-capacity-pill is-warning" : "staff-capacity-pill";
      return `
        <div class="${cls}">
          <small>${escapeHtml(day.label)} ${escapeHtml(day.dateLabel)}</small>
          <strong>${day.activeCoverage}/${day.target} covered</strong>
          <small>${day.sick ? `${day.sick} sick` : day.available ? `${day.available} backup` : "No backup"}</small>
        </div>
      `;
    }).join("");
  }

  if (staffCoverageAlerts) {
    const alerts = [];
    snapshot.dayStats.forEach((day) => {
      if (day.sick > 0) {
        alerts.push({
          title: `${day.label}: sickness cover needed`,
          detail: day.gap > 0
            ? `Capacity short by ${day.gap}. Use Auto-fill Cover or assign a replacement manually.`
            : `Coverage remains stable, but confirm replacements for ${day.sick} sickness alert${day.sick > 1 ? "s" : ""}.`
        });
      } else if (day.gap > 0) {
        alerts.push({
          title: `${day.label}: capacity risk`,
          detail: `Roster is short by ${day.gap}. Move an available team member or add cover.`
        });
      }
    });
    if (!alerts.length) {
      alerts.push({
        title: "Rota healthy this week",
        detail: "No uncovered days detected. You can still use the grid to adjust shifts or pre-plan sickness cover."
      });
    }
    if (Array.isArray(snapshot.sicknessLogs) && snapshot.sicknessLogs.length) {
      const recent = snapshot.sicknessLogs.slice(-2).reverse();
      recent.forEach((log) => {
        alerts.unshift({
          title: `${log.staffName || "Staff"} sickness logged (${String(log.day || "").toUpperCase()})`,
          detail: `${getStaffShiftLabel(log.shift)} shift • ${log.replacementMode === "auto" ? "auto-cover attempted" : "manual cover review pending"}`
        });
      });
    }
    if (staffRotaSelectedMemberId) {
      const selected = snapshot.rows.find((row) => row.memberId === staffRotaSelectedMemberId);
      if (selected) {
        const sickCells = selected.days.filter((d) => d.status === "sick");
        if (sickCells.length) {
          alerts.unshift({
            title: `${selected.member.name} flagged sick`,
            detail: `Affected days: ${sickCells.map((d) => d.label).join(", ")}. Suggested cover appears inside red rota cells.`
          });
        }
      }
    }
    staffCoverageAlerts.innerHTML = alerts.slice(0, 5).map((alert) => `
      <li>
        <strong>${escapeHtml(alert.title)}</strong>
        <small>${escapeHtml(alert.detail)}</small>
      </li>
    `).join("");
  }
  renderSubscriberCalendar();
}

function applyStaffRosterPayload(data) {
  staffRosterRows = Array.isArray(data?.members) ? data.members : [];
  staffSummary = data?.summary || null;
  if (data?.rotaWeek) {
    const normalizedWeek = normalizeIncomingRotaWeek(data.rotaWeek);
    if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
    staffRotaOverrides[normalizedWeek.weekStart] = normalizedWeek;
    staffRotaOverridesLoaded = true;
    saveStaffRotaOverrides();
  }
  if (!staffRotaSelectedMemberId && staffRosterRows.length) {
    staffRotaSelectedMemberId = getStaffMemberId(staffRosterRows[0]);
  }
  pruneStaffRotaOverridesForCurrentRoster();
  renderStaffSummary();
  renderStaffRoster();
}

async function loadStaffRoster() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness(`/api/staff-roster?weekStart=${encodeURIComponent(getStaffWeekKey())}`), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load staff roster.");
  applyStaffRosterPayload(data);
}

async function upsertStaffMember(payload) {
  const res = await fetch(withManagedBusiness("/api/staff-roster/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...payload, weekStart: getStaffWeekKey() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save staff member.");
  applyStaffRosterPayload(data);
}

async function updateStaffAvailability(staffId, availability) {
  const res = await fetch(withManagedBusiness(`/api/staff-roster/${encodeURIComponent(staffId)}/availability`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ availability, weekStart: getStaffWeekKey() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to update staff availability.");
  applyStaffRosterPayload(data);
}

async function removeStaffMember(staffId) {
  const res = await fetch(withManagedBusiness(`/api/staff-roster/${encodeURIComponent(staffId)}?weekStart=${encodeURIComponent(getStaffWeekKey())}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove staff member.");
  applyStaffRosterPayload(data);
}

function getCurrentRotaBrush() {
  return {
    status: normalizeStaffCellStatus(staffBrushStatusSelect?.value || "scheduled"),
    shift: normalizeStaffShiftType(staffBrushShiftSelect?.value || "full")
  };
}

async function applyStaffRotaUpdates(updates = [], { sicknessLogs = [], silent = false } = {}) {
  const normalizedUpdates = (Array.isArray(updates) ? updates : [])
    .map((u) => ({
      staffId: String(u?.staffId || "").trim(),
      day: String(u?.day || "").trim().toLowerCase(),
      status: normalizeStaffCellStatus(u?.status),
      shift: normalizeStaffShiftType(u?.shift)
    }))
    .filter((u) => u.staffId && STAFF_ROTA_DAYS.some((d) => d.key === u.day));
  if (!normalizedUpdates.length && !(Array.isArray(sicknessLogs) && sicknessLogs.length)) return 0;
  normalizedUpdates.forEach((u) => setStaffDayState(u.staffId, u.day, { status: u.status, shift: u.shift }));
  renderStaffSummary();
  renderStaffRoster();
  try {
    await persistStaffRotaBulk({ updates: normalizedUpdates, sicknessLogs });
  } catch (error) {
    if (!silent) setStaffStatus(error.message, true);
    throw error;
  }
  return normalizedUpdates.length;
}

function loadStaffDemoRotaPreview() {
  const demoMembers = [
    { id: "demo-s1", name: "Ava Stone", role: "stylist", availability: "on_duty", shiftDays: ["mon", "tue", "wed", "fri"] },
    { id: "demo-s2", name: "Mia Brooks", role: "colorist", availability: "on_duty", shiftDays: ["tue", "wed", "thu", "sat"] },
    { id: "demo-s3", name: "Noah Reed", role: "barber", availability: "on_duty", shiftDays: ["mon", "thu", "fri", "sat"] },
    { id: "demo-s4", name: "Luca Hayes", role: "receptionist", availability: "on_duty", shiftDays: ["mon", "tue", "wed", "thu", "fri"] },
    { id: "demo-s5", name: "Ella Quinn", role: "esthetician", availability: "off_duty", shiftDays: ["sat", "sun"] }
  ].map((m) => ({ ...m, updatedAt: new Date().toISOString() }));

  const weekKey = getStaffWeekKey();
  if (!staffRotaOverrides || typeof staffRotaOverrides !== "object") staffRotaOverrides = {};
  staffRotaOverrides[weekKey] = {
    cells: {
      "demo-s1": {
        mon: { status: "scheduled", shift: "full" },
        tue: { status: "scheduled", shift: "am" },
        wed: { status: "sick", shift: "full" },
        fri: { status: "scheduled", shift: "pm" }
      },
      "demo-s2": {
        tue: { status: "scheduled", shift: "pm" },
        wed: { status: "covering", shift: "full" },
        thu: { status: "scheduled", shift: "full" },
        sat: { status: "scheduled", shift: "full" }
      },
      "demo-s3": {
        mon: { status: "scheduled", shift: "full" },
        thu: { status: "available", shift: "full" },
        fri: { status: "scheduled", shift: "full" },
        sat: { status: "scheduled", shift: "am" }
      },
      "demo-s4": {
        mon: { status: "scheduled", shift: "full" },
        tue: { status: "scheduled", shift: "full" },
        wed: { status: "scheduled", shift: "full" },
        thu: { status: "scheduled", shift: "full" },
        fri: { status: "scheduled", shift: "full" }
      },
      "demo-s5": {
        sat: { status: "scheduled", shift: "pm" },
        sun: { status: "available", shift: "am" }
      }
    },
    sicknessLogs: [
      {
        id: `demo-log-${weekKey}`,
        staffId: "demo-s1",
        staffName: "Ava Stone",
        day: "wed",
        shift: "full",
        replacementMode: "auto",
        weekStart: weekKey,
        reportedAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };
  staffRotaOverridesLoaded = true;
  saveStaffRotaOverrides();

  staffRosterRows = demoMembers;
  staffSummary = {
    totalMembers: demoMembers.length,
    onDutyCount: demoMembers.filter((m) => m.availability === "on_duty").length,
    offDutyCount: demoMembers.filter((m) => m.availability !== "on_duty").length,
    scheduledTodayCount: 3,
    estimatedChairCapacityToday: 18
  };
  staffRotaSelectedMemberId = "demo-s1";
  renderStaffSummary();
  renderStaffRoster();
  renderSubscriberCalendar();
  setStaffStatus("Demo rota preview loaded (local preview only).");
}

async function promptStaffSickReport(staffId) {
  const member = staffRosterRows.find((row) => String(row.id || "") === String(staffId || ""));
  if (!member) return false;
  const values = await openManageForm({
    title: "Record Staff Sickness",
    submitLabel: "Apply",
    fields: [
      {
        id: "day",
        label: "Sickness applies to",
        type: "select",
        value: "today",
        options: [
          { value: "today", label: "Today" },
          { value: "all_scheduled", label: "All scheduled days this week" },
          ...STAFF_ROTA_DAYS.map((day) => ({ value: day.key, label: `${day.label} (${day.key.toUpperCase()})` }))
        ]
      },
      {
        id: "replace",
        label: "Try cover action",
        type: "select",
        value: "suggest",
        options: [
          { value: "suggest", label: "Suggest cover only" },
          { value: "auto", label: "Auto-assign cover where possible" }
        ]
      },
      {
        id: "shift",
        label: "Shift",
        type: "select",
        value: "full",
        options: [
          { value: "full", label: "Full day" },
          { value: "am", label: "AM" },
          { value: "pm", label: "PM" }
        ]
      }
    ]
  });
  if (!values) return false;
  const todayIndex = new Date().getDay();
  const todayKey = todayIndex === 0 ? "sun" : STAFF_ROTA_DAYS[todayIndex - 1]?.key || "mon";
  const selectedDay = String(values.day || "today").trim().toLowerCase();
  let targetDays = [];
  if (selectedDay === "today") {
    targetDays = [todayKey];
  } else if (selectedDay === "all_scheduled") {
    targetDays = STAFF_ROTA_DAYS.map((d) => d.key).filter((dayKey) => {
      const status = getStaffDayStatus(member, dayKey);
      return status === "scheduled" || status === "covering";
    });
  } else {
    targetDays = [selectedDay];
  }
  if (!targetDays.length) {
    setStaffStatus("No scheduled shifts found to mark as sick for this week.", true);
    return false;
  }
  const shift = normalizeStaffShiftType(values.shift || "full");
  const updates = targetDays.map((dayKey) => ({ staffId, day: dayKey, status: "sick", shift }));
  staffRotaSelectedMemberId = String(staffId || "").trim();
  const replacementMode = String(values.replace || "").trim().toLowerCase() === "auto" ? "auto" : "suggest";
  const sicknessLogs = targetDays.map((dayKey) => ({
    staffId,
    staffName: member.name || "Staff",
    day: dayKey,
    shift,
    replacementMode
  }));
  await applyStaffRotaUpdates(updates, { sicknessLogs, silent: true });
  if (replacementMode === "auto") {
    await applyAutoCoverForWeek({ onlyDays: targetDays, forMemberId: staffId, silent: true });
  }
  return true;
}

async function applyAutoCoverForWeek({ onlyDays = null, forMemberId = "", silent = false } = {}) {
  const targetDaySet = Array.isArray(onlyDays) && onlyDays.length ? new Set(onlyDays.map((d) => String(d || "").trim().toLowerCase())) : null;
  const updates = [];
  let assignments = 0;
  (Array.isArray(staffRosterRows) ? staffRosterRows : []).forEach((member) => {
    const memberId = getStaffMemberId(member);
    if (!memberId) return;
    if (forMemberId && memberId !== String(forMemberId)) return;
    STAFF_ROTA_DAYS.forEach((day) => {
      if (targetDaySet && !targetDaySet.has(day.key)) return;
      const status = getStaffDayStatus(member, day.key);
      if (status !== "sick") return;
      const candidates = findCoverCandidatesForDay(day.key, memberId);
      const chosen = candidates.find((c) => c.status === "available") || candidates[0];
      if (!chosen) return;
      const chosenMember = staffRosterRows.find((row) => getStaffMemberId(row) === chosen.id);
      const shift = chosenMember ? getStaffDayShift(chosenMember, day.key) : "full";
      updates.push({ staffId: chosen.id, day: day.key, status: "covering", shift });
      assignments += 1;
    });
  });
  if (updates.length) {
    await applyStaffRotaUpdates(updates, { silent: true });
  }
  if (!silent) {
    if (assignments) {
      setStaffStatus(`Auto-fill cover assigned ${assignments} replacement shift${assignments > 1 ? "s" : ""}.`);
      showManageToast(`Assigned ${assignments} cover shift${assignments > 1 ? "s" : ""}.`);
    } else {
      setStaffStatus("No sickness gaps found or no available cover to assign.");
    }
  }
  return assignments;
}

function setWaitlistStatus(message, isError = false) {
  if (!waitlistStatusNote) return;
  waitlistStatusNote.textContent = message || "";
  waitlistStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseWaitlistDateTime(raw) {
  const value = String(raw || "").trim();
  if (!value) return { preferredDate: "", preferredTime: "" };
  const dateTime = new Date(value);
  if (Number.isNaN(dateTime.getTime())) return null;
  const yyyy = dateTime.getFullYear();
  const mm = String(dateTime.getMonth() + 1).padStart(2, "0");
  const dd = String(dateTime.getDate()).padStart(2, "0");
  const hh = String(dateTime.getHours()).padStart(2, "0");
  const min = String(dateTime.getMinutes()).padStart(2, "0");
  return { preferredDate: `${yyyy}-${mm}-${dd}`, preferredTime: `${hh}:${min}` };
}

function buildWaitlistRecoveryPrefillDateTime(booking) {
  const date = String(booking?.date || "").trim();
  const time = String(booking?.time || "").trim();
  if (!date) return "";
  return time ? `${date} ${time}` : date;
}

function stageWaitlistRecoveryFromBooking(sourceBooking, options = {}) {
  const booking = sourceBooking && typeof sourceBooking === "object"
    ? sourceBooking
    : bookingRows.find((row) => String(row?.id || "").trim() === String(sourceBooking || "").trim());
  if (!booking) {
    setWaitlistStatus("Could not find that booking to stage waitlist recovery.", true);
    return false;
  }
  if (waitlistNameInput) waitlistNameInput.value = String(booking.customerName || "").trim();
  if (waitlistPhoneInput) waitlistPhoneInput.value = String(booking.customerPhone || "").trim();
  if (waitlistEmailInput) waitlistEmailInput.value = String(booking.customerEmail || "").trim().toLowerCase();
  if (waitlistServiceInput) waitlistServiceInput.value = String(booking.service || "").trim();
  if (waitlistDateInput) waitlistDateInput.value = buildWaitlistRecoveryPrefillDateTime(booking);
  const wasCancelled = normalizeText(booking?.status).includes("cancel");
  setWaitlistStatus(
    wasCancelled
      ? "Waitlist recovery pre-filled from the cancelled booking. Review and save to start outreach."
      : "Waitlist form pre-filled from the selected booking. Review and save if this customer wants another slot."
  );
  if (options.focusModule !== false) {
    focusModuleByKey("waitlist");
    waitlistSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      if (waitlistNameInput instanceof HTMLElement) waitlistNameInput.focus();
    }, 140);
  }
  return true;
}

function renderWaitlistSummary() {
  if (!waitlistSummaryCards) return;
  const summary = waitlistSummary || { totalEntries: 0, waitingCount: 0, contactedCount: 0, bookedCount: 0 };
  const cards = [
    { label: "Waitlist Entries", value: summary.totalEntries || 0 },
    { label: "Waiting", value: summary.waitingCount || 0 },
    { label: "Contacted/Booked", value: (summary.contactedCount || 0) + (summary.bookedCount || 0) }
  ];
  waitlistSummaryCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    waitlistSummaryCards.appendChild(article);
  });
}

function renderWaitlist() {
  if (!waitlistList) return;
  waitlistList.innerHTML = "";
  if (!waitlistRows.length) {
    waitlistList.innerHTML =
      "<li><div class='waitlist-meta'><strong>No waitlist names added yet.</strong><br /><small>Add interested clients here so you can fill cancellations faster.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='waitlist' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Waitlist</button></div></li>";
    return;
  }
  waitlistRows.forEach((entry) => {
    const preferred =
      entry.preferredDate && entry.preferredTime ? `${entry.preferredDate} ${entry.preferredTime}` : "Flexible";
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="waitlist-meta">
        <strong>${entry.customerName} (${entry.status})</strong><br />
        <small>${entry.service || "Any service"} | ${preferred} | ${entry.customerPhone || entry.customerEmail || "No contact"}</small>
      </div>
      <div class="waitlist-actions">
        <button class="btn btn-ghost manage-only waitlist-backfill" type="button" data-id="${entry.id}" ${
      entry.status === "waiting" ? "" : "disabled"
    }>Edit Status</button>
        <button class="btn btn-ghost manage-only waitlist-edit" type="button" data-id="${entry.id}">Edit</button>
        <button class="btn btn-ghost manage-only waitlist-remove" type="button" data-id="${entry.id}">Delete</button>
      </div>
    `;
    waitlistList.appendChild(li);
  });
}

function applyWaitlistPayload(data) {
  waitlistRows = Array.isArray(data?.entries) ? data.entries : [];
  waitlistSummary = data?.summary || null;
  renderWaitlistSummary();
  renderWaitlist();
}

async function loadWaitlist() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/waitlist"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load waitlist.");
  applyWaitlistPayload(data);
}

async function upsertWaitlistEntry(payload) {
  const res = await fetch(withManagedBusiness("/api/waitlist/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save waitlist entry.");
  applyWaitlistPayload(data);
}

async function markWaitlistContacted(entryId) {
  const res = await fetch(withManagedBusiness(`/api/waitlist/${encodeURIComponent(entryId)}/backfill`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to update waitlist entry.");
  applyWaitlistPayload(data);
}

async function removeWaitlistEntry(entryId) {
  const res = await fetch(withManagedBusiness(`/api/waitlist/${encodeURIComponent(entryId)}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove waitlist entry.");
  applyWaitlistPayload(data);
}

function setOperationsStatus(message, isError = false) {
  if (!operationsStatusNote) return;
  operationsStatusNote.textContent = message || "";
  operationsStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function setCrmStatus(message, isError = false) {
  if (!crmStatusNote) return;
  crmStatusNote.textContent = message || "";
  crmStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

async function markRebookingPromptSent(payload) {
  const res = await fetch(withManagedBusiness("/api/operations/rebooking/mark-sent"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to mark rebooking prompt as sent.");
  return data;
}

function renderOperationsInsights() {
  if (!operationsInsightsSection || !noShowRiskList || !rebookingPromptList) return;
  if (!canManageBusinessModules() || !isPopupMountedBusinessSection(operationsInsightsSection)) {
    hideSection(operationsInsightsSection);
    return;
  }
  showSection(operationsInsightsSection);

  const riskRows = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk : [];
  const promptRows = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts : [];

  noShowRiskList.innerHTML = "";
  if (!riskRows.length) {
    noShowRiskList.innerHTML = "<li><small>No high-risk bookings right now.</small></li>";
  } else {
    riskRows.forEach((row) => {
      const item = document.createElement("li");
      const reasonText = Array.isArray(row.reasons) ? row.reasons.join(" ") : "";
      item.innerHTML = `
        <strong>${row.customerName} - ${row.service}</strong>
        <small>${row.date} ${row.time} ? Risk: ${row.riskLevel} (${row.riskScore})</small>
        <small>${reasonText}</small>
        <div class="ops-actions">
          <button class="btn btn-ghost ops-send-reminder" type="button" data-booking-id="${row.bookingId}" data-customer-name="${row.customerName}" data-service="${row.service}">Mark Reminder Sent</button>
        </div>
      `;
      noShowRiskList.appendChild(item);
    });
  }

  rebookingPromptList.innerHTML = "";
  if (!promptRows.length) {
    rebookingPromptList.innerHTML = "<li><small>No rebooking candidates right now.</small></li>";
  } else {
    promptRows.forEach((row) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${row.customerName}</strong>
        <small>${row.daysSinceLastVisit} days since ${row.lastService}</small>
        <small>${row.suggestedMessage}</small>
        <div class="ops-actions">
          <button class="btn btn-ghost ops-copy-rebooking" type="button" data-message="${row.suggestedMessage.replaceAll('"', "&quot;")}">Copy Prompt</button>
          <button class="btn btn-ghost ops-mark-rebooking" type="button" data-customer-key="${row.customerKey}" data-customer-name="${row.customerName}" data-service="${row.lastService}">Mark Sent</button>
        </div>
      `;
      rebookingPromptList.appendChild(item);
    });
  }
}

function renderCrmSegments() {
  if (!crmSection || !crmSegmentsList) return;
  if (!canManageBusinessModules() || !isPopupMountedBusinessSection(crmSection)) {
    hideSection(crmSection);
    return;
  }
  showSection(crmSection);

  const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
  crmSegmentsList.innerHTML = "";

  if (!segments.length) {
    crmSegmentsList.innerHTML = "<li><small>No client segments yet. They will appear here as booking history builds up.</small></li>";
    return;
  }

  segments.forEach((segment) => {
    const leads = Array.isArray(segment?.leads) ? segment.leads : [];
    const firstLead = leads[0] || null;
    const sampleMessage = String(firstLead?.message || "").trim();
    const sampleCustomerKey = String(firstLead?.customerKey || "").trim();
    const sampleCustomerName = String(firstLead?.customerName || "").trim();
    const segmentId = String(segment?.id || "").trim();
    const leadCount = leads.length;
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <strong>${segment.label || "Segment"}</strong>
      <small>${leadCount} ${leadCount === 1 ? "lead" : "leads"} ready for outreach.</small>
      <small>${sampleMessage || "No suggested message yet."}</small>
      <div class="crm-actions">
        <button class="btn btn-ghost crm-copy-message" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Copy Template</button>
        <button class="btn btn-ghost crm-mark-sent" type="button" data-segment-id="${segmentId}" data-customer-key="${sampleCustomerKey}" data-customer-name="${sampleCustomerName}" data-message="${sampleMessage.replaceAll('"', "&quot;")}" ${
      sampleCustomerKey ? "" : "disabled"
    }>Mark Campaign Sent</button>
        <button class="btn btn-ghost manage-only crm-edit-template" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Edit</button>
        <button class="btn btn-ghost manage-only crm-delete-segment" type="button" data-segment-id="${segmentId}">Delete</button>
      </div>
    `;
    crmSegmentsList.appendChild(listItem);
  });
}

async function loadCrmSegments() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/crm/segments"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load CRM segments.");
  crmSegmentsPayload = data;
  renderCrmSegments();
}

async function sendCrmCampaign(payload) {
  const res = await fetch(withManagedBusiness("/api/crm/campaigns/send"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save CRM campaign activity.");
  return data;
}

function setCommercialStatus(message, isError = false) {
  if (!commercialStatusNote) return;
  commercialStatusNote.textContent = message || "";
  commercialStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function renderCommercialControls() {
  if (!commercialSection || !commercialSummaryCards || !membershipList || !packageList || !giftCardList) return;
  if (!canManageBusinessModules() || !isPopupMountedBusinessSection(commercialSection)) {
    hideSection(commercialSection);
    return;
  }
  showSection(commercialSection);

  const summary = commercialPayload?.summary || {};
  const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
  const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
  const giftCards = Array.isArray(commercialPayload?.giftCards) ? commercialPayload.giftCards : [];

  commercialSummaryCards.innerHTML = "";
  [
    { label: "Active Memberships", value: String(summary.activeMemberships || 0) },
    { label: "Active Packages", value: String(summary.activePackages || 0) },
    { label: "Active Gift Cards", value: String(summary.activeGiftCards || 0) },
    { label: "Outstanding Gift Balance", value: formatMoney(summary.outstandingGiftBalance || 0) }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    commercialSummaryCards.appendChild(article);
  });

  membershipList.innerHTML = "";
  if (!memberships.length) {
    membershipList.innerHTML = "<li><small>No membership plans set up yet.</small></li>";
  } else {
      memberships.forEach((plan) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${plan.name}</strong>
          <small>${formatMoney(plan.price)} / ${plan.billingCycle} (${plan.status})</small>
          <small>${plan.benefits || "No benefits text set."}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-membership" type="button" data-membership-id="${plan.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-membership" type="button" data-membership-id="${plan.id}">Delete</button>
          </div>
        `;
        membershipList.appendChild(li);
      });
    }

  packageList.innerHTML = "";
  if (!packages.length) {
    packageList.innerHTML = "<li><small>No service packages set up yet.</small></li>";
  } else {
      packages.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${item.name}</strong>
          <small>${formatMoney(item.price)} ? Sessions: ${item.remainingSessions}/${item.sessionCount}</small>
          <small>Status: ${item.status}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-package" type="button" data-package-id="${item.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-package" type="button" data-package-id="${item.id}">Delete</button>
          </div>
        `;
        packageList.appendChild(li);
      });
    }

  giftCardList.innerHTML = "";
  if (!giftCards.length) {
    giftCardList.innerHTML = "<li><small>No gift cards issued yet.</small></li>";
  } else {
    giftCards.forEach((gift) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${gift.code} - ${gift.recipientName}</strong>
        <small>Balance: ${formatMoney(gift.remainingBalance)} / ${formatMoney(gift.initialBalance)} (${gift.status})</small>
        <small>Issued: ${formatDateTime(gift.issuedAt)} ? Expires: ${gift.expiresAt ? formatDateTime(gift.expiresAt) : "Not set"}</small>
        <div class="commercial-actions">
          <button class="btn btn-ghost commercial-redeem-gift" type="button" data-gift-card-id="${gift.id}" ${
        gift.status === "active" ? "" : "disabled"
      }>Redeem Amount</button>
        </div>
      `;
      giftCardList.appendChild(li);
    });
  }
}

function applyCommercialPayload(data) {
  commercialPayload = {
    memberships: Array.isArray(data?.memberships) ? data.memberships : [],
    packages: Array.isArray(data?.packages) ? data.packages : [],
    giftCards: Array.isArray(data?.giftCards) ? data.giftCards : [],
    summary: data?.summary || null
  };
  renderCommercialControls();
}

async function loadCommercialControls() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/commercial-controls"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load commercial controls.");
  applyCommercialPayload(data);
}

async function upsertMembership(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/memberships/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save membership.");
  applyCommercialPayload(data);
}

async function upsertPackage(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/packages/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save package.");
  applyCommercialPayload(data);
}

async function issueGiftCard(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/gift-cards/issue"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to issue gift card.");
  applyCommercialPayload(data);
}

async function redeemGiftCard(giftCardId, amount) {
  const res = await fetch(withManagedBusiness(`/api/commercial-controls/gift-cards/${encodeURIComponent(giftCardId)}/redeem`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ amount })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to redeem gift card.");
  applyCommercialPayload(data);
}

function setRevenueStatus(message, isError = false) {
  if (!revenueStatusNote) return;
  revenueStatusNote.textContent = message || "";
  revenueStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function toChannelLabel(channel) {
  return String(channel || "direct")
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderRevenueAttribution() {
  if (!revenueAttributionSection || !revenueSummaryCards || !revenueChannelList) return;
  if (!canManageBusinessModules() || !isPopupMountedBusinessSection(revenueAttributionSection)) {
    hideSection(revenueAttributionSection);
    return;
  }
  showSection(revenueAttributionSection);
  const summary = revenueAttributionPayload?.summary || {};
  const channels = Array.isArray(revenueAttributionPayload?.channels) ? revenueAttributionPayload.channels : [];

  revenueSummaryCards.innerHTML = "";
  [
    { label: "Attributed Revenue", value: formatMoney(summary.totalRevenue || 0) },
    { label: "Channel Spend", value: formatMoney(summary.totalSpend || 0) },
    {
      label: "Blended ROI",
      value: typeof summary.blendedRoiPercent === "number" ? `${summary.blendedRoiPercent}%` : "0%"
    },
    { label: "Best Revenue Channel", value: summary.bestRevenueChannel ? toChannelLabel(summary.bestRevenueChannel) : "None yet" }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    revenueSummaryCards.appendChild(article);
  });

  revenueChannelList.innerHTML = "";
  if (!channels.length) {
    const placeholderChannels = ["Instagram", "Google", "Walk-in"];
    placeholderChannels.forEach((label) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${label}</strong>
        <small>Bookings: 0 ? Revenue: ${formatMoney(0)} ? Spend: ${formatMoney(0)}</small>
        <small>ROI: 0% ? Share: 0% ? Cancelled: 0</small>
        <div class="commercial-actions manage-only">
          <button class="btn btn-ghost" type="button" data-module-jump="revenue">Open</button>
        </div>
      `;
      revenueChannelList.appendChild(li);
    });
    if (user.role === "subscriber") {
      const li = document.createElement("li");
      li.innerHTML = "<small>Clean slate: channel performance will populate after bookings and spend are tracked.</small>";
      revenueChannelList.appendChild(li);
    }
    return;
  }
  channels.forEach((row) => {
    const roiText = typeof row.roiPercent === "number" ? `${row.roiPercent}%` : "n/a";
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${row.label || toChannelLabel(row.channel)}</strong>
      <small>Bookings: ${row.bookings} ? Revenue: ${formatMoney(row.revenue)} ? Spend: ${formatMoney(row.spend)}</small>
      <small>ROI: ${roiText} ? Share: ${row.sharePercent}% ? Cancelled: ${row.cancelledBookings || 0}</small>
      <div class="commercial-actions manage-only">
        <button class="btn btn-ghost revenue-edit-spend" type="button" data-channel="${row.channel}" data-spend="${row.spend}">Edit</button>
        <button class="btn btn-ghost revenue-delete-spend" type="button" data-channel="${row.channel}">Delete</button>
      </div>
    `;
    revenueChannelList.appendChild(li);
  });
  renderExecutivePulse();
}

function applyRevenueAttributionPayload(data) {
  revenueAttributionPayload = data || { channels: [], summary: null };
  renderRevenueAttribution();
}

async function loadRevenueAttribution() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/revenue-attribution"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load revenue attribution.");
  applyRevenueAttributionPayload(data);
}

async function saveRevenueChannelSpend(payload) {
  const res = await fetch(withManagedBusiness("/api/revenue-attribution/spend"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save channel spend.");
  applyRevenueAttributionPayload(data);
}

function setProfitabilityStatus(message, isError = false) {
  if (!profitStatusNote) return;
  profitStatusNote.textContent = message || "";
  profitStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function renderProfitabilitySummary() {
  if (!profitabilitySection || !profitSummaryCards || !profitPayrollList) return;
  if (!canManageBusinessModules() || !isPopupMountedBusinessSection(profitabilitySection)) {
    hideSection(profitabilitySection);
    return;
  }
  showSection(profitabilitySection);
  const summary = profitabilityPayload?.summary || {};
  const payrollEntries = Array.isArray(profitabilityPayload?.payrollEntries) ? profitabilityPayload.payrollEntries : [];
  const fixedCosts = profitabilityPayload?.fixedCosts || {};
  const cogsPercent = Number(profitabilityPayload?.cogsPercent || 0);

  profitSummaryCards.innerHTML = "";
  [
    { label: "Gross Revenue", value: formatMoney(summary.grossRevenue || 0) },
    { label: "Total Costs", value: formatMoney(summary.totalCosts || 0) },
    { label: "Estimated Profit", value: formatMoney(summary.estimatedProfit || 0) },
    {
      label: "Profit Margin",
      value: typeof summary.profitMarginPercent === "number" ? `${summary.profitMarginPercent}%` : "0%"
    },
    { label: "Break-even Revenue", value: summary.breakevenRevenue === null ? formatMoney(0) : formatMoney(summary.breakevenRevenue) }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    profitSummaryCards.appendChild(article);
  });

  profitPayrollList.innerHTML = "";
  if (!payrollEntries.length) {
    profitPayrollList.innerHTML = `<li><small>${user.role === "subscriber" ? "Clean slate: payroll and fixed costs start at zero until you add them." : "No payroll entries yet. Add payroll to get realistic profit projections."}</small><br /><button class='btn btn-ghost' type='button' data-module-jump='profitability' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Profitability</button></li>`;
  } else {
    payrollEntries.forEach((entry) => {
      const total = Number(entry.hours || 0) * Number(entry.hourlyRate || 0) + Number(entry.bonus || 0);
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${entry.staffName}${entry.role ? ` (${entry.role})` : ""}</strong>
        <small>${entry.hours}h x ${formatMoney(entry.hourlyRate)} + bonus ${formatMoney(entry.bonus || 0)}</small>
        <small>Total payroll cost: ${formatMoney(total)}</small>
        <div class="profit-actions">
          <button class="btn btn-ghost manage-only profit-edit-payroll" type="button" data-entry-id="${entry.id}">Edit</button>
          <button class="btn btn-ghost manage-only profit-remove-payroll" type="button" data-entry-id="${entry.id}">Delete</button>
        </div>
      `;
      profitPayrollList.appendChild(li);
    });
  }

  if (profitRentInput) profitRentInput.value = String(fixedCosts.rent || "");
  if (profitUtilitiesInput) profitUtilitiesInput.value = String(fixedCosts.utilities || "");
  if (profitSoftwareInput) profitSoftwareInput.value = String(fixedCosts.software || "");
  if (profitOtherInput) profitOtherInput.value = String(fixedCosts.other || "");
  if (profitCogsPercentInput) profitCogsPercentInput.value = String(cogsPercent || "");
  renderExecutivePulse();
}

function applyProfitabilityPayload(data) {
  profitabilityPayload = data || { payrollEntries: [], fixedCosts: {}, cogsPercent: 0, summary: null };
  renderProfitabilitySummary();
}

async function loadProfitabilitySummary() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/profitability-summary"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load profitability summary.");
  applyProfitabilityPayload(data);
}

async function upsertPayrollInput(payload) {
  const res = await fetch(withManagedBusiness("/api/profitability/payroll/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save payroll entry.");
  applyProfitabilityPayload(data);
}

async function removePayrollInput(entryId) {
  const res = await fetch(withManagedBusiness(`/api/profitability/payroll/${encodeURIComponent(entryId)}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove payroll entry.");
  applyProfitabilityPayload(data);
}

async function upsertProfitabilityCosts(payload) {
  const res = await fetch(withManagedBusiness("/api/profitability/costs/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save cost inputs.");
  applyProfitabilityPayload(data);
}

function renderAccountingIntegrations() {
  if (!accountingIntegrationsList) return;
  accountingIntegrationsList.innerHTML = "";
  if (!accountingRows.length) {
    accountingIntegrationsList.innerHTML = "<p class='accounting-note'>No providers available.</p>";
    return;
  }

  accountingRows.forEach((row) => {
    const connected = row.status === "connected" || row.connected === true;
    const card = document.createElement("article");
    card.className = `integration-card${connected ? " connected" : ""}`;
    card.innerHTML = `
      <div class="integration-top">
        <strong>${formatProviderLabel(row.provider)}</strong>
        <span class="integration-status ${connected ? "connected" : ""}">
          ${connected ? "Connected" : "Not connected"}
        </span>
      </div>
      <p class="integration-meta">Account: ${row.accountLabel || "Not linked"}</p>
      <p class="integration-meta">Sync mode: ${row.syncMode || "daily"}</p>
      <p class="integration-meta">Last updated: ${formatDateTime(row.updatedAt || row.connectedAt)}</p>
      <div class="integration-actions">
        ${
          connected
            ? `
                <button class="btn btn-ghost manage-only accounting-edit-provider" type="button" data-provider="${row.provider}" data-account-label="${String(row.accountLabel || "").replaceAll('"', "&quot;")}" data-sync-mode="${row.syncMode || "daily"}">Edit</button>
                <button class="btn btn-ghost manage-only accounting-delete-provider" type="button" data-provider="${row.provider}">Delete</button>
              `
            : `<button class="btn btn-ghost manage-only accounting-connect-provider" type="button" data-provider="${row.provider}">Add</button>`
        }
      </div>
    `;
    accountingIntegrationsList.appendChild(card);
  });
}

async function loadAccountingIntegrations() {
  if (!canManageBusinessModules()) {
    renderAccountingLiveRevenue();
    return;
  }
  const res = await fetch(withManagedBusiness("/api/accounting-integrations"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load accounting integrations.");
  accountingRows = Array.isArray(data.providers) ? data.providers : [];
  renderAccountingIntegrations();
  await loadAccountingLiveRevenue({ silent: true });
  renderBusinessGrowthPanel();
}

async function connectAccountingIntegration(provider, accountLabel, syncMode) {
  const res = await fetch(withManagedBusiness("/api/accounting-integrations/connect"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ provider, accountLabel, syncMode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to connect provider.");
  accountingRows = Array.isArray(data.providers) ? data.providers : accountingRows;
  renderAccountingIntegrations();
  renderBusinessGrowthPanel();
}

async function disconnectAccountingIntegration(provider) {
  const res = await fetch(withManagedBusiness(`/api/accounting-integrations/${encodeURIComponent(provider)}/disconnect`), {
    method: "POST",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to disconnect provider.");
  accountingRows = Array.isArray(data.providers) ? data.providers : accountingRows;
  renderAccountingIntegrations();
  renderBusinessGrowthPanel();
}

async function createBooking(payload) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to create booking.");
  return data.booking;
}

function setupManagedSectionActions() {
  if (!isDashboardManagerRole()) return;

  if (bookingOperationsSection && !document.getElementById("bookingManageRow")) {
    const row = document.createElement("div");
    row.id = "bookingManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddBooking" class="btn btn-ghost" type="button">Add Booking</button>';
    const heading = bookingOperationsSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      bookingOperationsSection.prepend(row);
    }
  }

  if (staffRosterSection && !document.getElementById("staffManageRow")) {
    const row = document.createElement("div");
    row.id = "staffManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddStaff" class="btn btn-ghost" type="button">Add Staff</button>';
    const heading = staffRosterSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      staffRosterSection.prepend(row);
    }
  }

  if (waitlistSection && !document.getElementById("waitlistManageRow")) {
    const row = document.createElement("div");
    row.id = "waitlistManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddWaitlist" class="btn btn-ghost" type="button">Add Waitlist Entry</button>';
    const heading = waitlistSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      waitlistSection.prepend(row);
    }
  }

  if (socialMediaSection && !document.getElementById("socialManageRow")) {
    const row = document.createElement("div");
    row.id = "socialManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddSocialLink" class="btn btn-ghost" type="button">Add Social Link</button><button id="manageClearSocialLinks" class="btn btn-ghost" type="button">Delete All Links</button>';
    const heading = socialMediaSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      socialMediaSection.prepend(row);
    }
  }

  if (crmSection && !document.getElementById("crmManageRow")) {
    const row = document.createElement("div");
    row.id = "crmManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddCrmCampaign" class="btn btn-ghost" type="button">Add Campaign Activity</button>';
    const heading = crmSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      crmSection.prepend(row);
    }
  }

  if (commercialSection && !document.getElementById("commercialManageRow")) {
    const row = document.createElement("div");
    row.id = "commercialManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddMembership" class="btn btn-ghost" type="button">Add Membership</button><button id="manageAddPackage" class="btn btn-ghost" type="button">Add Package</button><button id="manageAddGiftCard" class="btn btn-ghost" type="button">Add Gift Card</button>';
    const heading = commercialSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      commercialSection.prepend(row);
    }
  }

  if (accountingIntegrationsSection && !document.getElementById("accountingManageRow")) {
    const row = document.createElement("div");
    row.id = "accountingManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddAccountingIntegration" class="btn btn-ghost" type="button">Add Integration</button><button id="manageDisconnectAllAccounting" class="btn btn-ghost" type="button">Delete All Integrations</button>';
    const heading = accountingIntegrationsSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      accountingIntegrationsSection.prepend(row);
    }
  }

  if (revenueAttributionSection && !document.getElementById("revenueManageRow")) {
    const row = document.createElement("div");
    row.id = "revenueManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddRevenueSpend" class="btn btn-ghost" type="button">Add Spend</button>';
    const heading = revenueAttributionSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      revenueAttributionSection.prepend(row);
    }
  }

  if (profitabilitySection && !document.getElementById("profitManageRow")) {
    const row = document.createElement("div");
    row.id = "profitManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddPayrollEntry" class="btn btn-ghost" type="button">Add Payroll</button><button id="manageEditCostInputs" class="btn btn-ghost" type="button">Edit Costs</button><button id="manageDeleteCostInputs" class="btn btn-ghost" type="button">Delete Costs</button>';
    const heading = profitabilitySection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      profitabilitySection.prepend(row);
    }
  }
}

function renderBookings(bookings) {
  bookingsList.innerHTML = "";
  if (!bookings.length) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>No bookings yet.</strong><br />
        <small style="color:var(--muted);">Try the AI receptionist flow or share your booking link to get your first appointment.</small>
      </div>
      <div style="margin-top:0.45rem;">
        <button class="btn btn-ghost" type="button" data-module-jump="frontdesk" style="padding:0.32rem 0.65rem;font-size:0.75rem;">Open Front Desk</button>
      </div>
    `;
    bookingsList.appendChild(li);
    return;
  }
  bookings.forEach((b) => {
    const pendingConfirmation = isPendingConfirmationStatus(b?.status);
    const statusLabel = formatBookingStatusLabel(b?.status);
    const isCancelled = normalizeText(b?.status) === "cancelled";
    const li = document.createElement("li");
    if (pendingConfirmation) li.classList.add("booking-row-pending");
    li.innerHTML = `
      <div class="booking-row-head">
        <div>
          <strong>${escapeHtml(b.customerName || "Customer")}</strong><br />
          <small>${escapeHtml(b.service || "Service")} on ${escapeHtml(b.date || "N/A")} at ${escapeHtml(b.time || "N/A")}</small>
        </div>
        <span class="booking-status-badge ${pendingConfirmation ? "pending" : ""}">${escapeHtml(statusLabel)}</span>
      </div>
      ${pendingConfirmation ? '<div class="booking-pending-note">Subscriber action required: confirm or contact the customer with an alternative slot.</div>' : ""}
      <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
        <button class="btn btn-ghost manage-only cancel-booking" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>Delete</button>
        <button class="btn btn-ghost manage-only reschedule-booking" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>Edit</button>
        ${isCancelled ? `<button class="btn btn-ghost manage-only recover-booking-slot" data-id="${b.id}">Recover Slot</button>` : ""}
      </div>
    `;
    bookingsList.appendChild(li);
  });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isPendingConfirmationStatus(status) {
  const value = normalizeText(status);
  return value === "pending" || value === "pending_confirmation" || value === "awaiting_confirmation";
}

function formatBookingStatusLabel(status) {
  const value = normalizeText(status);
  if (isPendingConfirmationStatus(value)) return "Pending Confirmation";
  if (!value) return "Unknown";
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFilteredBookings() {
  const query = normalizeText(bookingSearch?.value);
  const statusFilter = normalizeText(bookingStatus?.value || "all");
  const sortMode = normalizeText(bookingSort?.value || "newest");

  let rows = bookingRows.slice();
  if (bookingDateFilterKeys instanceof Set && bookingDateFilterKeys.size) {
    rows = rows.filter((b) => {
      const d = parseBookingDate(b?.date);
      return d ? bookingDateFilterKeys.has(toDateKey(d)) : false;
    });
  }
  if (statusFilter !== "all") {
    rows = rows.filter((b) => {
      const rowStatus = normalizeText(b.status);
      if (statusFilter === "pending") return isPendingConfirmationStatus(rowStatus);
      return rowStatus === statusFilter;
    });
  }
  if (query) {
    rows = rows.filter((b) => {
      const blob = [
        b.customerName,
        b.service,
        b.date,
        b.time,
        b.status,
        b.businessName
      ]
        .map((v) => normalizeText(v))
        .join(" ");
      return blob.includes(query);
    });
  }

  if (sortMode === "oldest") {
    rows.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  } else if (sortMode === "status") {
    rows.sort((a, b) => normalizeText(a.status).localeCompare(normalizeText(b.status)));
  } else {
    rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  return rows;
}

function applyBookingFilters() {
  const filtered = getFilteredBookings();
  renderBookings(filtered);
  updatePendingBookingBanner();
  syncLexiPendingReminders();
  if (bookingsCountLabel) {
    bookingsCountLabel.textContent = `Showing ${filtered.length} of ${bookingRows.length} loaded bookings${bookingDateFilterLabel && bookingDateFilterLabel !== "All dates" ? ` (${bookingDateFilterLabel})` : ""}`;
  }
  refreshCustomerDashboard();
  renderExecutivePulse();
}

function updatePendingBookingBanner() {
  if (!bookingPendingBanner) return;
  if (!(user.role === "subscriber" || user.role === "admin")) {
    bookingPendingBanner.hidden = true;
    return;
  }
  const pendingRows = bookingRows.filter((row) => isPendingConfirmationStatus(row?.status));
  if (!pendingRows.length) {
    bookingPendingBanner.hidden = true;
    return;
  }
  bookingPendingBanner.hidden = false;
  const strong = bookingPendingBanner.querySelector("strong");
  const small = bookingPendingBanner.querySelector("small");
  if (strong) {
    strong.textContent = `${pendingRows.length} pending booking${pendingRows.length === 1 ? "" : "s"} need confirmation`;
  }
  if (small) {
    small.textContent = "Review pending requests in Booking Operations and confirm them before the customer is notified.";
  }
}

function setActiveStatusChip(status) {
  if (!statusChips) return;
  const chips = Array.from(statusChips.querySelectorAll(".status-chip"));
  chips.forEach((chip) => {
    const chipStatus = chip.getAttribute("data-status");
    chip.classList.toggle("active", chipStatus === status);
  });
}

async function cancelBooking(bookingId) {
  if (isDashboardDemoDataModeActive()) {
    bookingRows = bookingRows.map((row) => (row.id === bookingId ? { ...row, status: "cancelled" } : row));
    return;
  }
  const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to cancel booking.");
}

async function rescheduleBooking(bookingId) {
  const values = await openManageForm({
    title: "Edit Booking",
    submitLabel: "Save",
    fields: [
      { id: "date", label: "New Date", type: "date", required: true },
      { id: "time", label: "New Time", type: "time", required: true }
    ]
  });
  if (!values) return;

  if (isDashboardDemoDataModeActive()) {
    bookingRows = bookingRows.map((row) =>
      row.id === bookingId ? { ...row, date: values.date.trim(), time: values.time.trim() } : row
    );
    return;
  }

  const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ date: values.date.trim(), time: values.time.trim() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to reschedule booking.");
}

async function loadAdminBusinessOptions() {
  if (user.role !== "admin") return;
  const res = await fetch("/api/admin/businesses", { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load businesses.");
  const rows = Array.isArray(data.businesses) ? data.businesses : [];
  adminBusinessOptions = rows;
  if (!adminBusinessSelect) return;

  adminBusinessSelect.innerHTML = "";
  rows.forEach((business) => {
    const option = document.createElement("option");
    option.value = String(business.id || "");
    const location = [business.city, business.country].filter(Boolean).join(", ");
    option.textContent = location ? `${business.name} (${location})` : String(business.name || "Unnamed business");
    adminBusinessSelect.appendChild(option);
  });

  if (!rows.length) {
    managedBusinessId = "";
    setAdminBusinessStatus("No businesses available.", true);
    return;
  }

  const selected =
    rows.find((business) => business.id === managedBusinessId)?.id ||
    rows.find((business) => business.id === adminBusinessParam)?.id ||
    rows[0].id;

  managedBusinessId = String(selected || "").trim();
  adminBusinessSelect.value = managedBusinessId;
  syncAdminBusinessQueryParam();
  setAdminBusinessStatus(`Viewing ${rows.find((business) => business.id === managedBusinessId)?.name || "selected business"}.`);
}

async function reloadAdminManagedDashboard() {
  if (user.role !== "admin") return;
  if (shouldRenderTopMetricsGrid() && metricsGrid) metricsGrid.innerHTML = "";
  nextBookingsCursor = null;
  updateLoadMoreState(false);
  setAdminBusinessStatus("Loading business dashboard...");
  if (adminBusinessSelect) adminBusinessSelect.disabled = true;
  try {
    const tasks = [
      loadMetrics(),
      loadBookings({ append: false }),
      loadBillingSummary(),
      loadBusinessProfile(),
      loadSocialMediaLinks(),
      loadAccountingIntegrations(),
      loadStaffRoster(),
      loadWaitlist(),
      loadCrmSegments(),
      loadCommercialControls(),
      loadRevenueAttribution(),
      loadProfitabilitySummary()
    ];
    const settled = await Promise.allSettled(tasks);
    const hasError = settled.some((result) => result.status === "rejected");
    if (hasError) {
      setAdminBusinessStatus("Loaded with some errors. Check module status notes.", true);
      return;
    }
    const selectedName = adminBusinessOptions.find((business) => business.id === managedBusinessId)?.name;
    setAdminBusinessStatus(`Viewing ${selectedName || "selected business"}.`);
  } finally {
    if (adminBusinessSelect) adminBusinessSelect.disabled = false;
  }
}

async function loadMetrics() {
  if (user.role === "admin") {
    if (!managedBusinessId) {
      subscriberCommandCenter = null;
      operationsInsights = null;
      renderCommandCenter();
      renderOperationsInsights();
      return;
    }

    const managedRes = await fetch(withManagedBusiness("/api/dashboard/subscriber"), { headers: headers() });
    const managedData = await managedRes.json();
    if (!managedRes.ok) throw new Error(managedData.error || "Unable to load managed business metrics.");
    subscriberCommandCenter = managedData.commandCenter || null;
    renderCommandCenter();
    operationsInsights = managedData.operationsInsights || null;
    renderOperationsInsights();
    return;
  }

  const endpoint = `/api/dashboard/${user.role}`;
  const res = await fetch(endpoint, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load dashboard metrics.");
  const analytics = data.analytics || {};
  if (user.role === "subscriber") {
    subscriberCommandCenter = data.commandCenter || null;
    renderCommandCenter();
    operationsInsights = data.operationsInsights || null;
    renderOperationsInsights();
  }
  if (shouldRenderTopMetricsGrid()) {
    Object.entries(analytics).forEach(([k, v]) => addMetric(k, v));
  }
}

async function loadBillingSummary() {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const res = await fetch(withManagedBusiness("/api/billing/subscriber-summary"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load billing summary.");
  billingSummary = data || null;
  renderSubscriberBillingControls();
}

function inferBillingCycleFromSummary(summary) {
  const explicit = String(summary?.billingCycle || summary?.interval || "").trim().toLowerCase();
  if (explicit === "monthly" || explicit === "yearly") return explicit;
  if (explicit === "month" || explicit === "monthly_plan") return "monthly";
  if (explicit === "year" || explicit === "annual" || explicit === "yearly_plan") return "yearly";
  const planLabel = String(summary?.planLabel || "").trim().toLowerCase();
  if (planLabel.includes("year")) return "yearly";
  if (planLabel.includes("month")) return "monthly";
  return String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase() || "monthly";
}

function inferBillingProviderFromSummary(summary) {
  const explicit = String(summary?.provider || "").trim().toLowerCase();
  if (explicit === "stripe" || explicit === "paypal") return explicit;
  if (summary?.hasStripeCustomer || summary?.hasStripeSubscription) return "stripe";
  const status = String(summary?.status || "").trim().toLowerCase();
  if (status === "active" || status === "trialing" || status === "past_due") return "paypal";
  return String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase() || "stripe";
}

function getAutoRenewFromSummary(summary) {
  if (typeof summary?.autoRenew === "boolean") return summary.autoRenew;
  if (typeof summary?.cancelAtPeriodEnd === "boolean") return !summary.cancelAtPeriodEnd;
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY);
    if (stored === "on") return true;
    if (stored === "off") return false;
  } catch {
    // Ignore storage errors and use default.
  }
  return true;
}

function renderSubscriberBillingControls() {
  if (user.role !== "subscriber") return;
  const planLabel = String(billingSummary?.planLabel || "Subscriber Monthly").trim() || "Subscriber Monthly";
  const status = String(billingSummary?.status || "active").trim().toLowerCase();
  const renewalText = billingSummary?.currentPeriodEnd
    ? `Next renewal: ${formatDateShort(billingSummary.currentPeriodEnd)}`
    : "Next renewal: Not available yet";
  const statusLabel = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Active";

  if (subscriptionCurrentPlanLabel) {
    subscriptionCurrentPlanLabel.textContent = planLabel;
  }
  if (subscriptionCurrentPlanMeta) {
    subscriptionCurrentPlanMeta.textContent = `${statusLabel} | ${renewalText}`;
  }
  if (subscriptionBillingCycle) {
    const inferredCycle = inferBillingCycleFromSummary(billingSummary);
    if (inferredCycle === "monthly" || inferredCycle === "yearly") {
      subscriptionBillingCycle.value = inferredCycle;
    }
  }
  if (subscriptionBillingProvider) {
    const inferredProvider = inferBillingProviderFromSummary(billingSummary);
    if (inferredProvider === "stripe" || inferredProvider === "paypal") {
      subscriptionBillingProvider.value = inferredProvider;
    }
  }
  if (startBilling) {
    startBilling.textContent = "Change Plan";
  }
  if (subscriptionPaymentConnectNote) {
    const hasBilling = status === "active" || status === "trialing" || status === "past_due";
    subscriptionPaymentConnectNote.textContent = hasBilling
      ? "Need to switch or reconnect providers? Use Connect Stripe / Connect PayPal to open a secure provider flow."
      : "Connect a payment provider to activate secure subscriber billing and manage refunds through Stripe or PayPal.";
  }
  if (subscriptionAutoRenewToggle) {
    subscriptionAutoRenewToggle.checked = getAutoRenewFromSummary(billingSummary);
    subscriptionAutoRenewToggle.title = "Use Manage Billing to apply auto-renew settings with your payment provider.";
  }
}

async function openBillingCheckoutForProvider(provider) {
  const nextProvider = String(provider || "").trim().toLowerCase();
  if (nextProvider !== "stripe" && nextProvider !== "paypal") {
    throw new Error("Unsupported billing provider.");
  }
  if (subscriptionBillingProvider) subscriptionBillingProvider.value = nextProvider;
  if (nextProvider === "paypal") {
    await createPayPalCheckout();
    return;
  }
  await createCheckout();
}

function updateLoadMoreState(isLoading = false) {
  if (!loadMoreBookingsBtn) return;
  if (nextBookingsCursor) {
    loadMoreBookingsBtn.style.display = "inline-flex";
    loadMoreBookingsBtn.disabled = isLoading;
    loadMoreBookingsBtn.textContent = isLoading ? "Loading..." : "Load More";
  } else {
    loadMoreBookingsBtn.style.display = "none";
  }
}

async function loadBookings({ append = false } = {}) {
  const params = new URLSearchParams({ limit: "50" });
  if (user.role === "admin" && managedBusinessId) {
    params.set("businessId", managedBusinessId);
  }
  if (append && nextBookingsCursor) params.set("cursor", nextBookingsCursor);
  const res = await fetch(`/api/me/bookings?${params.toString()}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load bookings.");
  const rows = Array.isArray(data.bookings) ? data.bookings : [];
  if (user.role === "admin" && !managedBusinessId) {
    managedBusinessId = String(rows.find((row) => row?.businessId)?.businessId || "").trim();
  }
  bookingRows = append ? bookingRows.concat(rows) : rows;
  nextBookingsCursor = data?.pagination?.nextCursor || null;
  updateLoadMoreState(false);
  applyBookingFilters();
  renderSubscriberCalendar();
  renderBusinessGrowthPanel();
}

async function createCheckout() {
  const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
  if (billingProvider === "paypal") {
    await createPayPalCheckout();
    return;
  }
  const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
  const res = await fetch("/api/billing/create-checkout-session", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ billingCycle })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Billing session failed.");
  if (data.url) window.location.href = data.url;
}

async function createPayPalCheckout() {
  const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
  const res = await fetch("/api/billing/create-paypal-subscription", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ billingCycle })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "PayPal session failed.");
  if (data.url) window.location.href = data.url;
}

async function createPortal() {
  const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
  if (billingProvider === "paypal") {
    throw new Error("PayPal billing changes are managed in your PayPal account.");
  }
  const res = await fetch("/api/billing/create-portal-session", {
    method: "POST",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Portal session failed.");
  if (data.url) window.location.href = data.url;
}

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(DASHBOARD_THEME_MODE_STORAGE_KEY);
  localStorage.removeItem(SHARED_THEME_STORAGE_KEY);
  window.location.href = "/";
});

startBilling.addEventListener("click", async () => {
  if (isDashboardDemoDataModeActive()) {
    setDashActionStatus("Mock mode: billing checkout is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening secure checkout...");
    await createCheckout();
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

manageBilling.addEventListener("click", async () => {
  if (isDashboardDemoDataModeActive()) {
    setDashActionStatus("Mock mode: billing portal is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening billing portal...");
    await createPortal();
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

connectStripeBillingBtn?.addEventListener("click", async () => {
  if (user.role !== "subscriber") return;
  if (isDashboardDemoDataModeActive()) {
    setDashActionStatus("Mock mode: Stripe connect is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening secure Stripe billing setup...");
    await openBillingCheckoutForProvider("stripe");
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

connectPayPalBillingBtn?.addEventListener("click", async () => {
  if (user.role !== "subscriber") return;
  if (isDashboardDemoDataModeActive()) {
    setDashActionStatus("Mock mode: PayPal connect is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening secure PayPal billing setup...");
    await openBillingCheckoutForProvider("paypal");
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

contactAdminBtn?.addEventListener("click", () => {
  if (user.role !== "subscriber") return;
  openContactAdminModal();
});

hubPrintReportBtn?.addEventListener("click", async () => {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  await printBusinessReportPdf();
});

hubEmailReportBtn?.addEventListener("click", async () => {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  await openBusinessReportEmailFlow();
});

hubRunPrioritySweepBtn?.addEventListener("click", () => {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  setDashActionStatus("AI sweep complete: priorities reordered for staffing, booking risk and finance readiness.");
  showManageToast("AI priority sweep complete.");
  renderBusinessHubCommandDeck();
});

hubAutoRoutines?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const btn = target.closest("[data-hub-auto-toggle]");
  if (!(btn instanceof HTMLElement)) return;
  const key = String(btn.getAttribute("data-hub-auto-toggle") || "").trim();
  if (!key) return;
  const prefs = loadHubAutoRoutinePrefs();
  prefs[key] = !(prefs[key] === true);
  saveHubAutoRoutinePrefs(prefs);
  renderBusinessHubCommandDeck();
  setDashActionStatus(`${key} ${prefs[key] ? "automation enabled" : "automation disabled"} for this device.`);
});

subscriptionAutoRenewToggle?.addEventListener("change", () => {
  try {
    localStorage.setItem(
      SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY,
      subscriptionAutoRenewToggle.checked ? "on" : "off"
    );
  } catch {
    // Ignore localStorage errors.
  }
  setDashActionStatus("Auto renew preference saved for this device. Use Manage Billing to apply billing-account changes.");
});

bookingsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const bookingId = target.getAttribute("data-id");
  if (!bookingId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;

  try {
    if (target.classList.contains("recover-booking-slot")) {
      const booking = bookingRows.find((row) => String(row?.id || "") === String(bookingId || ""));
      if (stageWaitlistRecoveryFromBooking(booking)) {
        showManageToast("Waitlist recovery form pre-filled.");
      }
      return;
    }
    if (target.classList.contains("cancel-booking")) {
      const confirmed = await openManageConfirm({
        title: "Delete Booking",
        message: "Cancel this booking?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      await cancelBooking(bookingId);
      showManageToast("Booking deleted.");
    }
    if (target.classList.contains("reschedule-booking")) {
      await rescheduleBooking(bookingId);
      showManageToast("Booking updated.");
    }
    if (isDashboardDemoDataModeActive()) {
      applyBookingFilters();
      renderSubscriberCalendar();
      return;
    }
    if (shouldRenderTopMetricsGrid() && metricsGrid) metricsGrid.innerHTML = "";
    await Promise.all([loadMetrics(), loadBookings({ append: false })]);
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

loadMoreBookingsBtn?.addEventListener("click", async () => {
  if (!nextBookingsCursor) return;
  try {
    updateLoadMoreState(true);
    await loadBookings({ append: true });
  } catch (error) {
    updateLoadMoreState(false);
    setDashActionStatus(error.message, true);
  }
});

adminBusinessSelect?.addEventListener("change", async () => {
  if (user.role !== "admin") return;
  const nextBusinessId = String(adminBusinessSelect.value || "").trim();
  if (!nextBusinessId || nextBusinessId === managedBusinessId) return;
  managedBusinessId = nextBusinessId;
  syncAdminBusinessQueryParam();
  await reloadAdminManagedDashboard();
});

manageModeToggle?.addEventListener("click", () => {
  if (!isDashboardManagerRole()) return;
  setManageMode(!manageModeEnabled);
  showManageToast(`Edit Mode ${manageModeEnabled ? "enabled" : "disabled"}.`);
});

demoModeToggle?.addEventListener("click", () => {
  setDashActionStatus("Demo Mode has been removed from dashboards.", true);
});

uiDensityToggle?.addEventListener("change", () => {
  setUiDensity(uiDensityToggle.value);
});

accountingBookingExportBtn?.addEventListener("click", async () => {
  await runAccountingExport(
    withManagedBusiness("/api/accounting-integrations/export?scope=business&format=csv"),
    accountingBookingExportBtn,
    "Booking accounting CSV exported.",
    { requireManagedBusiness: true }
  );
});

accountingPlatformExportBtn?.addEventListener("click", async () => {
  await runAccountingExport(
    "/api/accounting-integrations/export?scope=platform&format=csv",
    accountingPlatformExportBtn,
    "Platform revenue CSV exported.",
    { requireManagedBusiness: false }
  );
});

accountingTimeframeSwitch?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const timeframe = String(target.getAttribute("data-timeframe") || "").trim().toLowerCase();
  if (!timeframe) return;
  setAccountingTimeframe(timeframe, { reload: true });
});

accountingQfWeek?.addEventListener("click", () => {
  const range = getThisWeekRange();
  setQuickFilterVisualState("week");
  setAccountingLiveRange(range.from, range.to, { reload: true });
});

accountingQfMonth?.addEventListener("click", () => {
  const range = getThisMonthRange();
  setQuickFilterVisualState("month");
  setAccountingLiveRange(range.from, range.to, { reload: true });
});

accountingCustomApply?.addEventListener("click", () => {
  const from = String(accountingCustomFrom?.value || "").trim();
  const to = String(accountingCustomTo?.value || "").trim();
  if (!from || !to) {
    setAccountingLiveNote("Select both start and end dates for custom range.", true);
    return;
  }
  if (from > to) {
    setAccountingLiveNote("Custom range is invalid: start date must be before end date.", true);
    return;
  }
  setQuickFilterVisualState("custom");
  setAccountingLiveRange(from, to, { reload: true });
});

initializeUiDensity();
initializeManageMode();
setupManagedSectionActions();
setAccountingTimeframe(accountingLiveTimeframe, { reload: false });
startAccountingLiveStream();

window.addEventListener("beforeunload", () => {
  if (accountingLiveTimerId) {
    window.clearInterval(accountingLiveTimerId);
    accountingLiveTimerId = null;
  }
});

if (user.role !== "subscriber") {
  hideSection(contactAdminBtn);
  if (subscriptionQuickPanel) subscriptionQuickPanel.style.display = "none";
  hideSection(subscriberSubscriptionSection);
  hideSection(first7DaysSnapshotSection);
  if (subscriptionBillingCycle) subscriptionBillingCycle.style.display = "none";
  if (subscriptionBillingProvider) subscriptionBillingProvider.style.display = "none";
  startBilling.style.display = "none";
  manageBilling.style.display = "none";
}
if (user.role !== "subscriber" && user.role !== "admin") {
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
  hideSection(revenueAttributionSection);
  hideSection(profitabilitySection);
}
if (user.role !== "customer") {
  hideSection(customerSearchSection);
  hideSection(customerReceptionSection);
  hideSection(customerLexiCalendarSection);
  hideSection(customerSlotsSection);
  hideSection(customerHistorySection);
  hideSection(customerAnalyticsSection);
}
if (user.role === "subscriber" || user.role === "admin") {
  hideSection(frontDeskSection);
}
if (user.role !== "admin") {
  hideSection(adminCopilotSection);
  hideSection(accountingPlatformExportBtn);
}
if (user.role !== "subscriber") {
  hideSection(subscriberCopilotSection);
}
if (user.role === "admin") {
  hideSection(subscriberCalendarSection);
  hideSection(businessGrowthSection);
  hideSection(subscriberExecutivePulseSection);
  hideSection(businessProfileSection);
  hideSection(socialMediaSection);
  hideSection(accountingIntegrationsSection);
  hideSection(subscriberCommandCenterSection);
  hideSection(staffRosterSection);
  hideSection(waitlistSection);
  hideSection(operationsInsightsSection);
  hideSection(crmSection);
  hideSection(commercialSection);
  hideSection(revenueAttributionSection);
  hideSection(profitabilitySection);
  hideSection(subscriberSubscriptionSection);
  hideSection(first7DaysSnapshotSection);
  hideSection(bookingOperationsSection);
  hideSection(contactAdminBtn);
}
if (user.role === "subscriber" || user.role === "admin") {
  hideSection(metricsGrid);
}
if (user.role === "customer") {
  bookingStatus.value = "all";
  setActiveStatusChip("all");
  showSection(dashIdentityBlock);
  hideSection(frontDeskSection);
  hideSection(subscriberExecutivePulseSection);
  hideSection(subscriberCopilotSection);
  hideSection(subscriberCalendarSection);
  hideSection(bookingOperationsSection);
  hideSection(metricsGrid);
  hideSection(businessProfileSection);
  hideSection(socialMediaSection);
  hideSection(accountingIntegrationsSection);
  hideSection(subscriberCommandCenterSection);
  hideSection(staffRosterSection);
  hideSection(waitlistSection);
  hideSection(revenueAttributionSection);
  hideSection(profitabilitySection);
  hideSection(adminBusinessScope);
  hideSection(adminCopilotSection);
  hideSection(subscriberSubscriptionSection);
  hideSection(first7DaysSnapshotSection);
  initializeCustomerExperience();
}
if (user.role !== "subscriber" && user.role !== "admin") {
  bookingSort.value = "newest";
}
initializeModuleNavigator();
renderBusinessGrowthPanel();
initializeMobileBottomNav();
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const backBtn = target.closest("#workspaceBackToDashboardBtn");
  if (backBtn instanceof HTMLElement) {
    setWorkspaceBackButtonVisible(false);
    focusModuleByKey("home");
    dashboardQuickActionsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const trigger = target.closest("[data-module-jump]");
  const popupTrigger = target.closest("[data-module-popup]");
  if (popupTrigger instanceof HTMLElement) {
    const popupKey = String(popupTrigger.getAttribute("data-module-popup") || "").trim();
    if (!popupKey) return;
    const popupMod = moduleDefinitionByKey(popupKey);
    if (!popupMod) return;
    if (moduleUsesInteractivePopup(popupMod)) {
      openInteractiveModulePopup(popupKey);
      return;
    }
    if (moduleUsesInfoPopup(popupMod)) {
      openModuleInfoModal(popupKey);
      return;
    }
    focusModuleByKey(popupKey);
    return;
  }
  if (!(trigger instanceof HTMLElement)) return;
  const next = String(trigger.getAttribute("data-module-jump") || "").trim();
  if (!next) return;
  if (dashboardQuickActionsSection?.contains(trigger)) {
    const mod = moduleDefinitionByKey(next);
    if (mod) {
      if (moduleUsesInteractivePopup(mod)) {
        openInteractiveModulePopup(next);
        return;
      }
      if (moduleUsesInfoPopup(mod)) {
        openModuleInfoModal(next);
        return;
      }
    }
    setWorkspaceBackButtonVisible(next !== "home");
  }
  focusModuleByKey(next);
});
bookingSearch?.addEventListener("input", applyBookingFilters);
bookingStatus?.addEventListener("change", () => {
  setActiveStatusChip(bookingStatus.value);
  applyBookingFilters();
});
bookingSort?.addEventListener("change", applyBookingFilters);

customerSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runCustomerSalonSearch();
});

customerSearchReset?.addEventListener("click", () => {
  if (customerSearchQuery) customerSearchQuery.value = "";
  if (customerSearchService) customerSearchService.value = "";
  if (customerSearchBusinessType) customerSearchBusinessType.value = "";
  if (customerSearchLocation) customerSearchLocation.value = "";
  if (customerSearchRating) customerSearchRating.value = "";
  if (customerSearchDate) customerSearchDate.value = "";
  runCustomerSalonSearch();
});

customerSearchResults?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("customer-select-salon")) return;
  const salonId = String(target.getAttribute("data-salon-id") || "").trim();
  if (!salonId) return;
  selectedCustomerSalonId = salonId;
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
  const salon = getSelectedCustomerSalon();
  if (salon) {
    appendCustomerLexiGuidance(`I've loaded ${salon.name}. Ask me about services, the best time to book, or let me help you choose a slot.`);
    updateCustomerChatGuideHint();
  }
});

customerReceptionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = String(customerReceptionInput?.value || "").trim();
  if (!text) return;
  customerReceptionTranscript.push({ role: "user", text });
  customerReceptionTranscript.push({ role: "ai", text: getReceptionReply(text) });
  if (customerReceptionInput) customerReceptionInput.value = "";
  updateCustomerChatGuideHint();
  renderCustomerReceptionChat();
});

customerLexiCalendarPrev?.addEventListener("click", () => {
  customerLexiCalendarMonthCursor = new Date(customerLexiCalendarMonthCursor.getFullYear(), customerLexiCalendarMonthCursor.getMonth() - 1, 1);
  renderCustomerLexiCalendar();
});

customerLexiCalendarNext?.addEventListener("click", () => {
  customerLexiCalendarMonthCursor = new Date(customerLexiCalendarMonthCursor.getFullYear(), customerLexiCalendarMonthCursor.getMonth() + 1, 1);
  renderCustomerLexiCalendar();
});

customerLexiCalendarGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest(".customer-lexi-day-btn");
  if (!(button instanceof HTMLElement) || button.hasAttribute("disabled")) return;
  const dateKey = String(button.getAttribute("data-date-key") || "").trim();
  if (!dateKey) return;
  customerLexiSelectedDateKey = dateKey;
  renderCustomerLexiCalendar();
});

customerLexiCalendarViewTabs?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest(".customer-lexi-view-tab");
  if (!(button instanceof HTMLElement)) return;
  const nextView = String(button.getAttribute("data-customer-lexi-view") || "").trim().toLowerCase();
  if (!["day", "week", "month"].includes(nextView)) return;
  customerLexiCalendarView = nextView;
  renderCustomerLexiCalendar();
});

customerLexiAskNextBest?.addEventListener("click", () => {
  const salon = getSelectedCustomerSalon();
  const prompt = buildCustomerLexiPlannerPrompt("next-best", { salonName: salon?.name || "the selected salon" });
  queueCustomerLexiPrompt(prompt);
  openCustomerLexiPopup();
});

customerLexiDaySummary?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionButton = target.closest("[data-customer-lexi-action]");
  if (!(actionButton instanceof HTMLElement)) return;
  const action = String(actionButton.getAttribute("data-customer-lexi-action") || "").trim();
  if (!action) return;
  if (action === "jump-slots") {
    customerSlotsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const salon = getSelectedCustomerSalon();
  const dateKey = String(actionButton.getAttribute("data-date-key") || customerLexiSelectedDateKey || "").trim();
  const dateLabel = String(actionButton.getAttribute("data-date-label") || dateKey).trim();
  const prompt = buildCustomerLexiPlannerPrompt(action, { salonName: salon?.name || "the selected salon", dateKey, dateLabel });
  queueCustomerLexiPrompt(prompt);
  openCustomerLexiPopup();
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;

  if (target.id === "manageAddBooking") {
    const businessId = String(managedBusinessId || user.businessId || "").trim();
    if (!businessId) {
      showManageToast("No business selected for booking creation.", "error");
      return;
    }
    const values = await openManageForm({
      title: "Add Booking",
      submitLabel: "Create Booking",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+12025550111" },
        { id: "customerEmail", label: "Customer Email" },
        { id: "service", label: "Service", required: true },
        { id: "date", label: "Date", type: "date", required: true },
        { id: "time", label: "Time", type: "time", required: true }
      ]
    });
    if (!values) return;
    try {
      await createBooking({ businessId, ...values });
      await loadBookings({ append: false });
      if (user.role !== "customer") {
        if (shouldRenderTopMetricsGrid() && metricsGrid) metricsGrid.innerHTML = "";
        await loadMetrics();
      }
      showManageToast("Booking created.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddStaff") {
    const values = await openManageForm({
      title: "Add Staff Member",
      submitLabel: "Save Staff",
      fields: [
        { id: "name", label: "Name", required: true },
        { id: "role", label: "Role", value: "stylist" },
        { id: "availability", label: "Availability", value: "on_duty" },
        { id: "shiftDays", label: "Shift Days (comma-separated)" }
      ]
    });
    if (!values) return;
    try {
      await upsertStaffMember({
        name: values.name,
        role: values.role,
        availability: values.availability,
        shiftDays: String(values.shiftDays || "")
          .split(",")
          .map((value) => String(value || "").trim().toLowerCase())
          .filter(Boolean)
      });
      showManageToast("Staff member added.");
    } catch (error) {
      setStaffStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddWaitlist") {
    const values = await openManageForm({
      title: "Add Waitlist Entry",
      submitLabel: "Save Entry",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone" },
        { id: "customerEmail", label: "Customer Email" },
        { id: "service", label: "Service Preference" },
        { id: "preferredDate", label: "Preferred Date", type: "date" },
        { id: "preferredTime", label: "Preferred Time", type: "time" }
      ]
    });
    if (!values) return;
    try {
      await upsertWaitlistEntry({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: String(values.customerEmail || "").toLowerCase(),
        service: values.service,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime
      });
      showManageToast("Waitlist entry added.");
    } catch (error) {
      setWaitlistStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddSocialLink") {
    const values = await openManageForm({
      title: "Add Social Link",
      submitLabel: "Add Link",
      fields: [
        { id: "label", label: "Platform", value: "Facebook" },
        { id: "link", label: "Profile URL", required: true }
      ]
    });
    if (!values) return;
    const label = String(values.label || "").trim().toLowerCase();
    const link = String(values.link || "").trim();
    if (!link) return;
    const payload = collectSocialMediaPayloadFromInputs();
    const fieldByLabel = {
      facebook: "socialFacebook",
      instagram: "socialInstagram",
      twitter: "socialTwitter",
      linkedin: "socialLinkedin",
      tiktok: "socialTiktok",
      other: "customSocial"
    };
    const key = fieldByLabel[label] || "customSocial";
    payload[key] = link;
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link added.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageClearSocialLinks") {
    const confirmed = await openManageConfirm({
      title: "Delete Social Links",
      message: "Remove all social links and image?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    try {
      await saveSocialMediaLinks({
        socialFacebook: "",
        socialInstagram: "",
        socialTwitter: "",
        socialLinkedin: "",
        socialTiktok: "",
        customSocial: "",
        socialImageUrl: ""
      });
      showManageToast("Social links deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-edit-link")) {
    const key = String(target.getAttribute("data-social-key") || "").trim();
    if (!key) return;
    const current = String(target.getAttribute("data-social-value") || "").trim();
    const values = await openManageForm({
      title: "Edit Social Link",
      submitLabel: "Save",
      fields: [{ id: "url", label: "Profile URL", required: true, value: current }]
    });
    if (!values) return;
    const next = String(values.url || "").trim();
    if (!next) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload[key] = next;
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link updated.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-delete-link")) {
    const confirmed = await openManageConfirm({
      title: "Delete Social Link",
      message: "Remove this social link?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const key = String(target.getAttribute("data-social-key") || "").trim();
    if (!key) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload[key] = "";
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-clear-image")) {
    const confirmed = await openManageConfirm({
      title: "Delete Social Image",
      message: "Remove social profile image?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload.socialImageUrl = "";
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social image deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddCrmCampaign") {
    const values = await openManageForm({
      title: "Add CRM Campaign Activity",
      submitLabel: "Save",
      fields: [
        { id: "segmentId", label: "Segment ID", required: true, value: "high_value_lapsed" },
        { id: "customerKey", label: "Customer Key", required: true },
        { id: "customerName", label: "Customer Name" },
        { id: "message", label: "Campaign Message", type: "textarea", required: true }
      ]
    });
    if (!values) return;
    const segmentId = String(values.segmentId || "").trim();
    const customerKey = String(values.customerKey || "").trim();
    const customerName = String(values.customerName || "").trim();
    const message = String(values.message || "").trim();
    if (!segmentId || !customerKey || !message) return;
    try {
      setCrmStatus("Saving campaign activity...");
      await sendCrmCampaign({ segmentId, customerKey, customerName, message, channel: "manual" });
      setCrmStatus("Campaign activity saved.");
      showManageToast("CRM campaign activity added.");
    } catch (error) {
      setCrmStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("crm-edit-template")) {
    const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
    const currentMessage = String(target.getAttribute("data-message") || "").trim();
    if (!segmentId) return;
    const values = await openManageForm({
      title: "Edit CRM Template",
      submitLabel: "Save",
      fields: [{ id: "message", label: "Template Message", type: "textarea", required: true, value: currentMessage }]
    });
    if (!values) return;
    const nextMessage = String(values.message || "").trim();
    if (!nextMessage) return;
    const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
    const segment = segments.find((row) => String(row?.id || "") === segmentId);
    if (!segment) return;
    const leads = Array.isArray(segment.leads) ? segment.leads.slice() : [];
    if (!leads.length) {
      leads.push({ customerKey: "", customerName: "", message: nextMessage });
    } else {
      leads[0] = { ...leads[0], message: nextMessage };
    }
    segment.leads = leads;
    renderCrmSegments();
    setCrmStatus("Template updated in this session.");
    showManageToast("CRM template updated.");
    return;
  }

  if (target.classList.contains("crm-delete-segment")) {
    const confirmed = await openManageConfirm({
      title: "Delete CRM Segment",
      message: "Remove this segment from dashboard view?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
    if (!segmentId) return;
    const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
    crmSegmentsPayload = {
      ...(crmSegmentsPayload || {}),
      segments: segments.filter((row) => String(row?.id || "") !== segmentId)
    };
    renderCrmSegments();
    setCrmStatus("Segment removed from dashboard view.");
    showManageToast("CRM segment deleted.");
    return;
  }

  if (target.id === "manageAddMembership") {
    const values = await openManageForm({
      title: "Add Membership",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Membership Name", required: true },
        { id: "price", label: "Price", type: "number", required: true, value: "0" },
        { id: "billingCycle", label: "Billing Cycle", value: "monthly" },
        { id: "benefits", label: "Benefits" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const billingCycle = String(values.billingCycle || "monthly").trim();
    const benefits = String(values.benefits || "").trim();
    try {
      setCommercialStatus("Saving membership...");
      await upsertMembership({ name, price, billingCycle, benefits, status: "active" });
      setCommercialStatus("Membership saved.");
      showManageToast("Membership added.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddPackage") {
    const values = await openManageForm({
      title: "Add Package",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Package Name", required: true },
        { id: "price", label: "Price", type: "number", required: true, value: "0" },
        { id: "sessionCount", label: "Session Count", type: "number", required: true, value: "1" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const sessionCount = Number(values.sessionCount || 1);
    try {
      setCommercialStatus("Saving package...");
      await upsertPackage({ name, price, sessionCount, status: "active" });
      setCommercialStatus("Package saved.");
      showManageToast("Package added.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddGiftCard") {
    const values = await openManageForm({
      title: "Issue Gift Card",
      submitLabel: "Issue",
      fields: [
        { id: "purchaserName", label: "Purchaser Name", required: true },
        { id: "recipientName", label: "Recipient Name", required: true },
        { id: "initialBalance", label: "Initial Balance", type: "number", required: true, value: "0" },
        { id: "expiresAt", label: "Expiry Date", type: "date" }
      ]
    });
    if (!values) return;
    const purchaserName = String(values.purchaserName || "").trim();
    const recipientName = String(values.recipientName || "").trim();
    const initialBalance = Number(values.initialBalance || 0);
    const expiresAt = String(values.expiresAt || "").trim();
    if (!purchaserName || !recipientName || !Number.isFinite(initialBalance) || initialBalance <= 0) return;
    try {
      setCommercialStatus("Issuing gift card...");
      await issueGiftCard({ purchaserName, recipientName, initialBalance, expiresAt });
      setCommercialStatus("Gift card issued.");
      showManageToast("Gift card issued.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-edit-membership")) {
    const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
    if (!membershipId) return;
    const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
    const membership = memberships.find((row) => String(row?.id || "") === membershipId);
    if (!membership) return;
    const values = await openManageForm({
      title: "Edit Membership",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Membership Name", required: true, value: membership.name || "" },
        { id: "price", label: "Price", type: "number", required: true, value: String(membership.price || 0) },
        { id: "billingCycle", label: "Billing Cycle", value: membership.billingCycle || "monthly" },
        { id: "benefits", label: "Benefits", value: membership.benefits || "" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const billingCycle = String(values.billingCycle || "monthly").trim();
    const benefits = String(values.benefits || "").trim();
    try {
      setCommercialStatus("Updating membership...");
      await upsertMembership({ id: membershipId, name, price, billingCycle, benefits, status: membership.status || "active" });
      setCommercialStatus("Membership updated.");
      showManageToast("Membership updated.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-delete-membership")) {
    const confirmed = await openManageConfirm({
      title: "Delete Membership",
      message: "Set this membership to inactive?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
    if (!membershipId) return;
    const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
    const membership = memberships.find((row) => String(row?.id || "") === membershipId);
    if (!membership) return;
    try {
      setCommercialStatus("Deactivating membership...");
      await upsertMembership({
        id: membershipId,
        name: membership.name,
        price: Number(membership.price || 0),
        billingCycle: membership.billingCycle || "monthly",
        benefits: membership.benefits || "",
        status: "inactive"
      });
      setCommercialStatus("Membership deactivated.");
      showManageToast("Membership deleted.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-edit-package")) {
    const packageId = String(target.getAttribute("data-package-id") || "").trim();
    if (!packageId) return;
    const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
    const packageRow = packages.find((row) => String(row?.id || "") === packageId);
    if (!packageRow) return;
    const values = await openManageForm({
      title: "Edit Package",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Package Name", required: true, value: packageRow.name || "" },
        { id: "price", label: "Price", type: "number", required: true, value: String(packageRow.price || 0) },
        { id: "sessionCount", label: "Session Count", type: "number", required: true, value: String(packageRow.sessionCount || 1) }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const sessionCount = Number(values.sessionCount || 1);
    try {
      setCommercialStatus("Updating package...");
      await upsertPackage({ id: packageId, name, price, sessionCount, status: packageRow.status || "active" });
      setCommercialStatus("Package updated.");
      showManageToast("Package updated.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-delete-package")) {
    const confirmed = await openManageConfirm({
      title: "Delete Package",
      message: "Set this package to inactive?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const packageId = String(target.getAttribute("data-package-id") || "").trim();
    if (!packageId) return;
    const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
    const packageRow = packages.find((row) => String(row?.id || "") === packageId);
    if (!packageRow) return;
    try {
      setCommercialStatus("Deactivating package...");
      await upsertPackage({
        id: packageId,
        name: packageRow.name,
        price: Number(packageRow.price || 0),
        sessionCount: Number(packageRow.sessionCount || 1),
        status: "inactive"
      });
      setCommercialStatus("Package deactivated.");
      showManageToast("Package deleted.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddAccountingIntegration") {
    const values = await openManageForm({
      title: "Add Accounting Integration",
      submitLabel: "Save",
      fields: [
        { id: "provider", label: "Provider", value: String(accountingProvider?.value || "quickbooks"), required: true },
        { id: "accountLabel", label: "Account Label", value: String(accountingAccountLabel?.value || "Main Ledger"), required: true },
        { id: "syncMode", label: "Sync Mode", value: String(accountingSyncMode?.value || "daily"), required: true }
      ]
    });
    if (!values) return;
    const provider = String(values.provider || "quickbooks").trim().toLowerCase();
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!provider || !accountLabel) return;
    try {
      setAccountingStatus("Linking provider...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
      showManageToast("Accounting integration added.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageDisconnectAllAccounting") {
    const confirmed = await openManageConfirm({
      title: "Delete All Integrations",
      message: "Disconnect all connected accounting integrations?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const connectedProviders = accountingRows
      .filter((row) => row.status === "connected" || row.connected === true)
      .map((row) => String(row.provider || "").trim())
      .filter(Boolean);
    if (!connectedProviders.length) return;
    try {
      for (const provider of connectedProviders) {
        await disconnectAccountingIntegration(provider);
      }
      setAccountingStatus("All integrations disconnected.");
      showManageToast("All accounting integrations deleted.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-connect-provider")) {
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    const values = await openManageForm({
      title: "Add Integration",
      submitLabel: "Save",
      fields: [
        { id: "accountLabel", label: "Account Label", value: "Main Ledger", required: true },
        { id: "syncMode", label: "Sync Mode", value: "daily", required: true }
      ]
    });
    if (!values) return;
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!accountLabel) return;
    try {
      setAccountingStatus("Linking provider...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
      showManageToast("Accounting integration added.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-edit-provider")) {
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    const currentLabel = String(target.getAttribute("data-account-label") || "").trim();
    const currentSync = String(target.getAttribute("data-sync-mode") || "daily").trim();
    const values = await openManageForm({
      title: "Edit Integration",
      submitLabel: "Save",
      fields: [
        { id: "accountLabel", label: "Account Label", value: currentLabel || "Main Ledger", required: true },
        { id: "syncMode", label: "Sync Mode", value: currentSync || "daily", required: true }
      ]
    });
    if (!values) return;
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!accountLabel) return;
    try {
      setAccountingStatus("Updating integration...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} updated.`);
      showManageToast("Accounting integration updated.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-delete-provider")) {
    const confirmed = await openManageConfirm({
      title: "Delete Integration",
      message: "Disconnect this accounting integration?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    try {
      setAccountingStatus(`Disconnecting ${formatProviderLabel(provider)}...`);
      await disconnectAccountingIntegration(provider);
      setAccountingStatus(`${formatProviderLabel(provider)} disconnected.`);
      showManageToast("Accounting integration deleted.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddRevenueSpend") {
    const values = await openManageForm({
      title: "Add Revenue Spend",
      submitLabel: "Save",
      fields: [
        { id: "channel", label: "Channel", value: "direct", required: true },
        { id: "spend", label: "Spend", type: "number", value: "0", required: true }
      ]
    });
    if (!values) return;
    const channel = String(values.channel || "").trim().toLowerCase();
    const spend = Number(values.spend || 0);
    if (!channel || !Number.isFinite(spend) || spend < 0) return;
    try {
      setRevenueStatus("Saving channel spend...");
      await saveRevenueChannelSpend({ channel, spend });
      setRevenueStatus("Channel spend saved.");
      showManageToast("Revenue spend added.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("revenue-edit-spend")) {
    const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
    const currentSpend = Number(target.getAttribute("data-spend") || 0);
    if (!channel) return;
    const values = await openManageForm({
      title: "Edit Revenue Spend",
      submitLabel: "Save",
      fields: [{ id: "spend", label: "Spend", type: "number", value: String(currentSpend), required: true }]
    });
    if (!values) return;
    const spend = Number(values.spend || currentSpend);
    if (!Number.isFinite(spend) || spend < 0) return;
    try {
      setRevenueStatus("Updating channel spend...");
      await saveRevenueChannelSpend({ channel, spend });
      setRevenueStatus("Channel spend updated.");
      showManageToast("Revenue spend updated.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("revenue-delete-spend")) {
    const confirmed = await openManageConfirm({
      title: "Delete Revenue Spend",
      message: "Set this channel spend to zero?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
    if (!channel) return;
    try {
      setRevenueStatus("Removing channel spend...");
      await saveRevenueChannelSpend({ channel, spend: 0 });
      setRevenueStatus("Channel spend removed.");
      showManageToast("Revenue spend deleted.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddPayrollEntry") {
    const values = await openManageForm({
      title: "Add Payroll Entry",
      submitLabel: "Save",
      fields: [
        { id: "staffName", label: "Staff Name", required: true },
        { id: "role", label: "Role" },
        { id: "hours", label: "Hours", type: "number", required: true, value: "0" },
        { id: "hourlyRate", label: "Hourly Rate", type: "number", required: true, value: "0" },
        { id: "bonus", label: "Bonus", type: "number", value: "0" }
      ]
    });
    if (!values) return;
    const staffName = String(values.staffName || "").trim();
    if (!staffName) return;
    const role = String(values.role || "").trim();
    const hours = Number(values.hours || 0);
    const hourlyRate = Number(values.hourlyRate || 0);
    const bonus = Number(values.bonus || 0);
    if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return;
    try {
      setProfitabilityStatus("Saving payroll entry...");
      await upsertPayrollInput({ staffName, role, hours, hourlyRate, bonus });
      setProfitabilityStatus("Payroll entry saved.");
      showManageToast("Payroll entry added.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageEditCostInputs") {
    const values = await openManageForm({
      title: "Edit Cost Inputs",
      submitLabel: "Save",
      fields: [
        { id: "rent", label: "Rent", type: "number", value: String(profitRentInput?.value || 0) },
        { id: "utilities", label: "Utilities", type: "number", value: String(profitUtilitiesInput?.value || 0) },
        { id: "software", label: "Software", type: "number", value: String(profitSoftwareInput?.value || 0) },
        { id: "other", label: "Other Fixed Costs", type: "number", value: String(profitOtherInput?.value || 0) },
        { id: "cogsPercent", label: "COGS %", type: "number", value: String(profitCogsPercentInput?.value || 0) }
      ]
    });
    if (!values) return;
    const rent = Number(values.rent || 0);
    const utilities = Number(values.utilities || 0);
    const software = Number(values.software || 0);
    const other = Number(values.other || 0);
    const cogsPercent = Number(values.cogsPercent || 0);
    if ([rent, utilities, software, other, cogsPercent].some((value) => !Number.isFinite(value) || value < 0) || cogsPercent > 95) return;
    try {
      setProfitabilityStatus("Saving cost inputs...");
      await upsertProfitabilityCosts({ rent, utilities, software, other, cogsPercent });
      setProfitabilityStatus("Cost inputs saved.");
      showManageToast("Cost inputs updated.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageDeleteCostInputs") {
    const confirmed = await openManageConfirm({
      title: "Delete Cost Inputs",
      message: "Reset all cost inputs to zero?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    try {
      setProfitabilityStatus("Removing cost inputs...");
      await upsertProfitabilityCosts({ rent: 0, utilities: 0, software: 0, other: 0, cogsPercent: 0 });
      setProfitabilityStatus("Cost inputs removed.");
      showManageToast("Cost inputs deleted.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }
});

statusChips?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("status-chip")) return;
  const status = target.getAttribute("data-status");
  if (!status) return;
  bookingStatus.value = status;
  setActiveStatusChip(status);
  applyBookingFilters();
});

commandCenterActions?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("command-action-run")) return;
  const actionId = target.getAttribute("data-action-id");
  runCommandCenterAction(actionId).catch(() => {
    setCommandCenterStatus("Could not run this action right now.", true);
  });
});

calendarPrev?.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderSubscriberCalendar();
});

calendarNext?.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderSubscriberCalendar();
});

bookingCalendarGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest(".calendar-day-btn");
  if (!(button instanceof HTMLElement)) return;
  const dateKey = String(button.getAttribute("data-date-key") || "").trim();
  if (!dateKey) return;
  setBookingDateFilter({
    keys: new Set([dateKey]),
    label: `Selected ${dateKey}`,
    selectedDateKey: dateKey
  });
  if (bookingSearch && !bookingSearch.value) {
    focusBookingOperations();
  }
  applyBookingFilters();
  renderSubscriberCalendar();
  renderBusinessAiWorkspace("subscriber");
  renderBusinessAiWorkspace("admin");
  openCalendarDayWorkspace(dateKey);
});

bookingRangeToday?.addEventListener("click", () => applyBookingDatePreset("today"));
bookingRangeWeek?.addEventListener("click", () => applyBookingDatePreset("week"));
bookingRangeMonth?.addEventListener("click", () => applyBookingDatePreset("month"));
bookingRangeClear?.addEventListener("click", () => applyBookingDatePreset(""));

if (user.role === "subscriber" || user.role === "admin") {
  updateBookingRangeControls();
  renderSubscriberCalendar();
  renderBusinessAiWorkspace("subscriber");
  renderBusinessAiWorkspace("admin");
  scheduleCalendarTodayRefresh();
  renderExecutivePulse();
  renderWorkspaceStarPanel();
}

workspaceStarAskLexiBtn?.addEventListener("click", (event) => {
  openDashboardLexiForCurrentRole(event.currentTarget, "daily_workspace");
});

workspaceStarOpenCalendarBtn?.addEventListener("click", () => {
  focusModuleByKey("calendar");
});

subscriberCopilotOpenPopup?.addEventListener("click", (event) => {
  openDashboardLexiForCurrentRole(event.currentTarget, "daily_workspace");
});
executivePulseRangeTabs?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const nextRange = String(target.getAttribute("data-exec-range") || "").trim().toLowerCase();
  if (!["day", "week", "month", "year"].includes(nextRange)) return;
  if (executivePulseRange === nextRange) return;
  executivePulseRange = nextRange;
  renderExecutivePulse();
});
executivePulseSaveSnapshotBtn?.addEventListener("click", () => {
  if (!latestExecutivePulseSnapshotDraft) {
    showToast("Executive Pulse is still loading.");
    return;
  }
  const rows = readExecutivePulseSnapshots();
  const next = [{ ...latestExecutivePulseSnapshotDraft, savedAt: new Date().toISOString() }, ...rows];
  writeExecutivePulseSnapshots(next);
  renderExecutivePulseSnapshotsList(next);
  showToast(`Executive Pulse snapshot saved (${latestExecutivePulseSnapshotDraft.rangeLabel}).`);
});
subscriberLexiQuickOpenButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const source = String(btn.getAttribute("data-open-subscriber-lexi") || "").trim();
    openDashboardLexiForCurrentRole(event.currentTarget, source);
  });
});
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const dashboardLexiButton = target.closest("[data-open-subscriber-lexi], #subscriberCopilotOpenPopup, #adminCopilotOpenPopup, #workspaceStarAskLexiBtn");
  if (dashboardLexiButton instanceof HTMLElement) {
    const source = String(dashboardLexiButton.getAttribute("data-open-subscriber-lexi") || "daily_workspace").trim();
    if (user.role === "subscriber" || user.role === "admin") {
      event.preventDefault();
      openDashboardLexiForCurrentRole(dashboardLexiButton, source);
      return;
    }
  }
  const lexiLink = target.closest('a[href="#customerReceptionSection"]');
  if (!(lexiLink instanceof HTMLElement)) return;
  if (user.role !== "customer") return;
  event.preventDefault();
  openCustomerLexiPopup();
});
customerLexiLaunchBtn?.addEventListener("click", () => {
  openCustomerLexiPopup();
});
customerLexiLaunchBookingBtn?.addEventListener("click", () => {
  queueCustomerLexiPrompt("Help me book this week.");
  openCustomerLexiPopup();
});
subscriberCopilotPopupClose?.addEventListener("click", () => closeBusinessAiChatPopup("subscriber"));
subscriberCopilotPopup?.addEventListener("click", (event) => {
  if (event.target === subscriberCopilotPopup) closeBusinessAiChatPopup("subscriber");
});

adminCopilotOpenPopup?.addEventListener("click", (event) => {
  openDashboardLexiForCurrentRole(event.currentTarget, "daily_workspace");
});
adminCopilotPopupClose?.addEventListener("click", () => closeBusinessAiChatPopup("admin"));
adminCopilotPopup?.addEventListener("click", (event) => {
  if (event.target === adminCopilotPopup) closeBusinessAiChatPopup("admin");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !openCopilotPopupRole) return;
  closeBusinessAiChatPopup(openCopilotPopupRole);
});

adminCopilotForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (user.role !== "admin") return;
  const question = String(adminCopilotInput?.value || "").trim();
  if (!question) return;
  if (adminCopilotInput) adminCopilotInput.value = "";
  openBusinessAiChatPopup("admin", { focusInput: false });
  appendCopilotChatMessage("admin", "user", question);
  const pending = appendCopilotChatMessage("admin", "assistant", "Give me a moment while I check platform health and pull together the key fixes.", { pending: true });
  if (adminCopilotSend) adminCopilotSend.disabled = true;
  if (adminCopilotAnswer) adminCopilotAnswer.textContent = "Give me a moment while I check platform health and pull together the key fixes.";
  try {
    const payload = await askAdminCopilot(copilotPromptWithBusinessContext("admin", question));
    renderAdminCopilotResponse(payload);
    if (pending?.bubble) {
      pending.bubble.textContent = String(payload?.answer || "No reply came back yet.");
      pending.row?.classList.remove("is-pending");
    }
  } catch (error) {
    const fallback = {
      answer: error.message || "I couldn't complete that admin Lexi check just now.",
      findings: ["I couldn't complete that admin request right now."],
      suggestedFixes: ["Check the AI service setup and server logs, then try again."],
      snapshot: null
    };
    renderAdminCopilotResponse(fallback);
    if (pending?.bubble) {
      pending.bubble.textContent = String(fallback.answer || "I couldn't complete that admin Lexi check just now.");
      pending.row?.classList.remove("is-pending");
    }
  } finally {
    if (adminCopilotSend) adminCopilotSend.disabled = false;
  }
});

adminCopilotClear?.addEventListener("click", () => {
  if (adminCopilotInput) adminCopilotInput.value = "";
  resetCopilotChat("admin", "Ask Lexi about admin checks, managed businesses, bookings, or general salon, barber, and beauty questions.");
  renderAdminCopilotResponse({
    answer: "Ask Lexi about admin checks, managed businesses, bookings, or general salon, barber, and beauty questions.",
    findings: [],
    suggestedFixes: [],
    snapshot: null
  });
});

[customerReceptionInput, adminCopilotInput, subscriberCopilotInput].forEach((input) => {
  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    const form = input.closest("form");
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  });
});

subscriberCopilotForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const question = String(subscriberCopilotInput?.value || "").trim();
  if (!question) return;
  if (subscriberCopilotInput) subscriberCopilotInput.value = "";
  openBusinessAiChatPopup("subscriber", { focusInput: false });
  appendCopilotChatMessage("subscriber", "user", question);
  const pending = appendCopilotChatMessage("subscriber", "assistant", "Give me a moment while I check today's bookings and business signals so I can give you clear advice.", { pending: true });
  if (subscriberCopilotSend) subscriberCopilotSend.disabled = true;
  if (subscriberCopilotAnswer) subscriberCopilotAnswer.textContent = "Give me a moment while I check today's bookings and business signals so I can give you clear advice.";
  try {
    const payload = await askSubscriberCopilot(copilotPromptWithBusinessContext("subscriber", question));
    renderSubscriberCopilotResponse(payload, { question });
    if (pending?.bubble) {
      pending.bubble.textContent = String(payload?.answer || "No reply came back yet.");
      pending.row?.classList.remove("is-pending");
    }
  } catch (error) {
    const fallback = {
      answer: error.message || "I couldn't complete that Lexi check just now.",
      findings: ["I couldn't complete that request right now."],
      suggestedActions: ["Check the server logs and AI service setup, then try again."],
      snapshot: null
    };
    renderSubscriberCopilotResponse(fallback, { question });
    if (pending?.bubble) {
      pending.bubble.textContent = String(fallback.answer || "I couldn't complete that Lexi check just now.");
      pending.row?.classList.remove("is-pending");
    }
  } finally {
    if (subscriberCopilotSend) subscriberCopilotSend.disabled = false;
  }
});

subscriberCopilotClear?.addEventListener("click", () => {
  if (subscriberCopilotInput) subscriberCopilotInput.value = "";
  resetCopilotChat("subscriber", "Ask Lexi about your dashboard, bookings, services, products, or day-to-day salon questions.");
  renderSubscriberCopilotResponse({
    answer: "Ask Lexi about your dashboard, bookings, services, products, or day-to-day salon questions.",
    findings: [],
    suggestedActions: [],
    snapshot: null
  }, { question: "" });
});

subscriberAiScopeChips?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const chip = target.closest(".ai-scope-chip");
  if (!(chip instanceof HTMLElement)) return;
  const scope = String(chip.getAttribute("data-ai-scope") || "").trim().toLowerCase();
  if (!scope) return;
  subscriberAiScope = scope;
  const examples = {
    today: "What should I focus on first today to reduce cancellations and increase revenue?",
    calendar: "Review my diary this week and tell me where I have pressure, gaps and opportunities.",
    staff: "Check staffing cover and capacity. What changes should I make today?",
    revenue: "How can I protect today's revenue and improve the next 7 days?",
    growth: "What growth action should I run today for repeat bookings and reviews?"
  };
  if (subscriberCopilotInput) subscriberCopilotInput.placeholder = examples[scope] || examples.today;
  renderBusinessAiWorkspace("subscriber");
});

adminAiScopeChips?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const chip = target.closest(".ai-scope-chip");
  if (!(chip instanceof HTMLElement)) return;
  const scope = String(chip.getAttribute("data-ai-scope") || "").trim().toLowerCase();
  if (!scope) return;
  adminAiScope = scope;
  const examples = {
    diagnostics: "Run a diagnostics sweep and tell me the top issues to check first.",
    calendar: "Review this managed business calendar and flag operational risks for the next 7 days.",
    staff: "Check staffing and capacity risk for this managed business and suggest actions.",
    revenue: "Check cancellations and takings. What should the subscriber focus on first?",
    risk: "What are the highest business risks right now and what should be escalated?"
  };
  if (adminCopilotInput) adminCopilotInput.placeholder = examples[scope] || examples.diagnostics;
  renderBusinessAiWorkspace("admin");
});

function bindAiRoutineButtons(container, role) {
  container?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".ai-routine-btn");
    if (!(button instanceof HTMLElement)) return;
    const prompt = String(button.getAttribute("data-ai-prompt") || "").trim();
    if (!prompt) return;
    setBusinessAiPrompt(role, prompt);
    openBusinessAiChatPopup(role, { focusInput: false });
    if (role === "admin") {
      adminCopilotForm?.requestSubmit();
    } else {
      subscriberCopilotForm?.requestSubmit();
    }
  });
}

// Override the earlier renderer with richer Lexi-focused calendar command UI.
function renderCalendarFeatureSidebarLexi(summary) {
  const monthBookings = Number(summary?.monthlyBookings || 0);
  const activeDays = Number(summary?.activeDays || 0);
  const staffLegendCount = Number(summary?.staffLegendCount || 0);
  const selected = summary?.selectedDay || null;
  const avgPerActiveDay = activeDays ? Number((monthBookings / Math.max(1, activeDays)).toFixed(1)) : 0;
  const monthlyPressure =
    monthBookings >= 120 ? "High volume month" : monthBookings >= 60 ? "Steady trading month" : monthBookings > 0 ? "Light booking month" : "Open capacity month";
  const densityTone =
    avgPerActiveDay >= 8 ? "Pressure watch" : avgPerActiveDay >= 4 ? "Balanced flow" : avgPerActiveDay > 0 ? "Capacity available" : "No density yet";
  const selectedPressure =
    selected && Number(selected.bookings || 0) >= 10
      ? "Peak day"
      : selected && Number(selected.bookings || 0) >= 5
        ? "Busy day"
        : selected && Number(selected.bookings || 0) > 0
          ? "Open capacity"
          : "No bookings";

  if (calendarFeatureMeta) {
    const monthLabel = String(summary?.monthLabel || "This month");
    calendarFeatureMeta.innerHTML = `
      <div class="calendar-feature-meta-head">
        <p class="calendar-feature-meta-kicker">Lexi Diary Readout</p>
        <strong>${escapeHtml(monthLabel)} Calendar Command</strong>
      </div>
      <p class="calendar-feature-meta-copy">
        ${escapeHtml(String(monthBookings))} bookings across ${escapeHtml(String(activeDays))} active day${activeDays === 1 ? "" : "s"} and ${escapeHtml(
      String(staffLegendCount)
    )} rota staff in view.
      </p>
      <div class="calendar-lexi-badges" aria-label="Lexi calendar signals">
        <span>${escapeHtml(monthlyPressure)}</span>
        <span>${escapeHtml(densityTone)}</span>
        <span>${escapeHtml(selected ? `Selected: ${selectedPressure}` : "Select a day for spotlight")}</span>
      </div>
      ${
        selected
          ? `<p class="calendar-feature-meta-copy">Selected: <strong>${escapeHtml(selected.label)}</strong> (${escapeHtml(selected.dateKey)})</p>`
          : `<p class="calendar-feature-meta-copy">Click a date to spotlight staffing, bookings, and revenue context for Lexi.</p>`
      }
    `;
  }

  if (calendarFeatureStats) {
    const cards = [
      {
        label: "Month Bookings",
        value: String(monthBookings),
        note: `${activeDays} active days`,
        tone: monthBookings >= 100 ? "hot" : monthBookings >= 40 ? "balanced" : "open"
      },
      {
        label: "Avg / Active Day",
        value: String(avgPerActiveDay),
        note: densityTone,
        tone: avgPerActiveDay >= 8 ? "hot" : avgPerActiveDay >= 4 ? "balanced" : "open"
      },
      {
        label: "Rota Staff",
        value: String(staffLegendCount),
        note: "visible this month",
        tone: "neutral"
      },
      {
        label: "Selected Revenue",
        value: selectedCalendarDateKey ? formatMoney(Number(summary?.selectedDay?.revenue || 0)) : "-",
        note: selectedCalendarDateKey ? `${summary?.selectedDay?.bookings || 0} bookings` : "pick a day",
        tone: selectedCalendarDateKey && Number(summary?.selectedDay?.revenue || 0) > 0 ? "balanced" : "neutral"
      }
    ];
    calendarFeatureStats.innerHTML = cards
      .map(
        (card) => `
      <article class="calendar-stat-card calendar-stat-card-${escapeHtml(card.tone || "neutral")}">
        <p>${escapeHtml(card.label)}</p>
        <strong>${escapeHtml(card.value)}</strong>
        <small>${escapeHtml(card.note)}</small>
      </article>
    `
      )
      .join("");
  }

  if (calendarLexiCommandDeck) {
    const selectedDateLabel = selected ? `${selected.label} (${selected.dateKey})` : "Select a date";
    const selectedBookings = Number(selected?.bookings || 0);
    const selectedRevenue = Number(selected?.revenue || 0);
    const priorityHeadline = !selected
      ? "Choose a date to unlock Lexi actions"
      : selectedBookings >= 8
        ? "High-pressure day: prioritize flow and delays"
        : selectedBookings >= 4
          ? "Balanced day: tighten timing and fill gaps"
          : "Open-capacity day: focus on rebooking and upsell";
    const fillGapNote = !selected
      ? "Lexi will highlight gap recovery and same-day opportunities after a date is selected."
      : selectedBookings > 0
        ? `Lexi can map cancellations, rebooking opportunities, and waitlist recovery around ${selectedDateLabel}.`
        : `Lexi can build a same-day fill plan for ${selectedDateLabel} and suggest outreach timing.`;
    const commsNote = !selected
      ? "Customer messaging prompts and front desk scripts will appear for the selected day."
      : `Generate booking reminders, delay scripts, and front desk handoff notes for ${selectedDateLabel}.`;
    calendarLexiCommandDeck.innerHTML = `
      <div class="calendar-lexi-command-card">
        <p class="calendar-lexi-command-kicker">Lexi Priority</p>
        <h4>${escapeHtml(priorityHeadline)}</h4>
        <p>${escapeHtml(
          selected
            ? `${selectedDateLabel} • ${selectedBookings} booking${selectedBookings === 1 ? "" : "s"} • Revenue signal ${formatMoney(selectedRevenue)}`
            : "Use the diary to spotlight a day, then launch a Lexi planning routine straight from the calendar."
        )}</p>
        ${
          selected
            ? `<button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="plan-day" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">Ask Lexi for the day plan</button>`
            : `<button type="button" class="btn btn-ghost" disabled>Ask Lexi for the day plan</button>`
        }
      </div>
      <div class="calendar-lexi-command-card">
        <p class="calendar-lexi-command-kicker">Gap Recovery</p>
        <h4>${escapeHtml(selected ? "Recover booking gaps before they cost revenue" : "Select a day to run gap recovery")}</h4>
        <p>${escapeHtml(fillGapNote)}</p>
        ${
          selected
            ? `<button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="fill-gaps" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">Find booking gaps</button>`
            : `<button type="button" class="btn btn-ghost" disabled>Find booking gaps</button>`
        }
      </div>
      <div class="calendar-lexi-command-card">
        <p class="calendar-lexi-command-kicker">Front Desk Prep</p>
        <h4>${escapeHtml(selected ? "Prep team timing and customer communication" : "Select a day to prep the front desk")}</h4>
        <p>${escapeHtml(commsNote)}</p>
        ${
          selected
            ? `<button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="staff-brief" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">Prep staff + front desk</button>`
            : `<button type="button" class="btn btn-ghost" disabled>Prep staff + front desk</button>`
        }
      </div>
    `;
  }

  if (calendarSelectedDaySummary) {
    if (!selected) {
      calendarSelectedDaySummary.innerHTML = `
        <div class="calendar-spotlight-head">
          <h3>Selected Day Summary</h3>
          <span class="calendar-spotlight-tag">Waiting for date</span>
        </div>
        <p>Click a date to view bookings, staffing cover and revenue context for that day. Lexi will use it in the Business AI workspace automatically.</p>
        <div class="calendar-lexi-actions" aria-label="Lexi day actions">
          <button type="button" class="btn btn-ghost calendar-lexi-action is-disabled" disabled>Ask Lexi to plan the day</button>
          <button type="button" class="btn btn-ghost calendar-lexi-action is-disabled" disabled>Find booking gaps</button>
        </div>
      `;
      return;
    }

    const staffNames = Array.isArray(selected.staffNames) ? selected.staffNames : [];
    const selectedDateLabel = `${selected.label} (${selected.dateKey})`;
    const selectedBookings = Number(selected.bookings || 0);
    const selectedRevenue = Number(selected.revenue || 0);
    const selectedTag = selectedBookings >= 10 ? "Peak day" : selectedBookings >= 5 ? "Busy day" : selectedBookings > 0 ? "Open capacity" : "No bookings";

    calendarSelectedDaySummary.innerHTML = `
      <div class="calendar-spotlight-head">
        <h3>Selected Day Summary</h3>
        <span class="calendar-spotlight-tag">${escapeHtml(selectedTag)}</span>
      </div>
      <p><strong>${escapeHtml(selectedDateLabel)}</strong></p>
      <ul class="calendar-selected-day-list">
        <li><strong>${escapeHtml(String(selectedBookings))} booking${selectedBookings === 1 ? "" : "s"}</strong><small>${escapeHtml(
      String(selected.completed || 0)
    )} completed • ${escapeHtml(String(selected.cancelled || 0))} cancelled</small></li>
        <li><strong>${escapeHtml(formatMoney(selectedRevenue))}</strong><small>Revenue signal for selected day</small></li>
        <li><strong>${escapeHtml(String(selected.staffCount || 0))} staff on rota</strong><small>${escapeHtml(
      staffNames.length ? staffNames.join(", ") : "No rota coverage set for selected day."
    )}</small></li>
      </ul>
      <div class="calendar-lexi-actions" aria-label="Lexi day actions">
        <button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="plan-day" data-date-key="${escapeHtml(
          selected.dateKey
        )}" data-date-label="${escapeHtml(selected.label)}">Ask Lexi to plan this day</button>
        <button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="fill-gaps" data-date-key="${escapeHtml(
          selected.dateKey
        )}" data-date-label="${escapeHtml(selected.label)}">Find booking gaps</button>
        <button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="staff-brief" data-date-key="${escapeHtml(
          selected.dateKey
        )}" data-date-label="${escapeHtml(selected.label)}">Prep staff + front desk</button>
      </div>
    `;
  }
}

function buildLexiCalendarPrompt(action, dateLabel, dateKey) {
  const safeDateLabel = String(dateLabel || dateKey || "the selected day").trim();
  const safeDateKey = String(dateKey || "").trim();
  if (action === "fill-gaps") {
    return `Review ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""} and show me booking gaps, rebooking opportunities, and same-day recovery actions.`;
  }
  if (action === "staff-brief") {
    return `Prepare a front desk and staff briefing for ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""}. Include pressure points, likely delays, and customer communication advice.`;
  }
  return `Plan ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""} for me. Prioritize bookings, gaps, staffing coverage, and revenue protection actions.`;
}

function launchLexiCalendarActionFromButton(actionButton) {
  if (!(actionButton instanceof HTMLElement) || actionButton.hasAttribute("disabled")) return;
  const action = String(actionButton.getAttribute("data-lexi-calendar-action") || "plan-day");
  const dateKey = String(actionButton.getAttribute("data-date-key") || "").trim();
  const dateLabel = String(actionButton.getAttribute("data-date-label") || "").trim();
  const role = user.role === "admin" ? "admin" : "subscriber";
  const prompt = buildLexiCalendarPrompt(action, dateLabel, dateKey);
  const targetSection = role === "admin" ? adminCopilotSection : subscriberCopilotSection;

  setBusinessAiPrompt(role, prompt);
  targetSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  openBusinessAiChatPopup(role, { focusInput: false });
  if (role === "admin") {
    adminCopilotForm?.requestSubmit();
  } else {
    subscriberCopilotForm?.requestSubmit();
  }
  showToast(`Lexi is reviewing ${dateLabel || dateKey || "the selected day"}.`);
}

bindAiRoutineButtons(subscriberAiQuickRoutines, "subscriber");
bindAiRoutineButtons(adminAiQuickRoutines, "admin");

calendarSelectedDaySummary?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionButton = target.closest(".calendar-lexi-action");
  if (!(actionButton instanceof HTMLElement)) return;
  launchLexiCalendarActionFromButton(actionButton);
});

calendarLexiCommandDeck?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionButton = target.closest(".calendar-lexi-action");
  if (!(actionButton instanceof HTMLElement)) return;
  launchLexiCalendarActionFromButton(actionButton);
});

accountingConnectForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const provider = String(accountingProvider?.value || "").trim();
  const accountLabel = String(accountingAccountLabel?.value || "").trim();
  const syncMode = String(accountingSyncMode?.value || "daily").trim();
  if (!provider || !accountLabel) {
    setAccountingStatus("Provider and account label are required.", true);
    return;
  }
  try {
    setAccountingStatus("Linking provider...");
    await connectAccountingIntegration(provider, accountLabel, syncMode);
    setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
    if (accountingAccountLabel) accountingAccountLabel.value = "";
  } catch (error) {
    setAccountingStatus(error.message, true);
  }
});

accountingIntegrationsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const provider = String(target.getAttribute("data-provider") || "").trim();
  if (!provider) return;

  if (target.classList.contains("prefill-accounting")) {
    if (accountingProvider) accountingProvider.value = provider;
    if (accountingAccountLabel) accountingAccountLabel.focus();
    return;
  }

  if (!target.classList.contains("disconnect-accounting")) return;
  try {
    setAccountingStatus(`Disconnecting ${formatProviderLabel(provider)}...`);
    await disconnectAccountingIntegration(provider);
    setAccountingStatus(`${formatProviderLabel(provider)} disconnected.`);
  } catch (error) {
    setAccountingStatus(error.message, true);
  }
});

staffRosterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(staffNameInput?.value || "").trim();
  const role = String(staffRoleInput?.value || "staff").trim();
  const availability = String(staffAvailabilityInput?.value || "off_duty").trim();
  const shiftDays = parseShiftDaysInput(staffShiftDaysInput?.value || "");
  if (!name) {
    setStaffStatus("Staff name is required.", true);
    return;
  }
  try {
    setStaffStatus("Saving staff member...");
    await upsertStaffMember({ name, role, availability, shiftDays });
    if (staffNameInput) staffNameInput.value = "";
    if (staffShiftDaysInput) staffShiftDaysInput.value = "";
    setStaffStatus("Staff member saved.");
  } catch (error) {
    setStaffStatus(error.message, true);
  }
});

async function loadAndRenderStaffRotaWeek() {
  await loadStaffRotaWeek({ silent: true });
  renderStaffSummary();
  renderStaffRoster();
}

async function openStaffDayQuickAssign(dayKey) {
  const normalizedDayKey = String(dayKey || "").trim().toLowerCase();
  if (!STAFF_ROTA_DAYS.some((d) => d.key === normalizedDayKey)) return;
  const snapshot = buildStaffRotaSnapshot();
  const dayMeta = snapshot.weekDays.find((d) => d.key === normalizedDayKey);
  const staffOptions = snapshot.rows.map((row) => ({
    value: row.memberId,
    label: `${row.member?.name || "Staff"} (${roleLabel(row.member?.role)})`
  }));
  if (!staffOptions.length) {
    setStaffStatus("Add staff members first before assigning day cover.", true);
    return;
  }
  const values = await openManageForm({
    title: `Assign Staff • ${dayMeta?.label || normalizedDayKey.toUpperCase()}${dayMeta?.dateLabel ? ` (${dayMeta.dateLabel})` : ""}`,
    submitLabel: "Assign",
    fields: [
      { id: "staffId", label: "Staff Member", type: "select", required: true, value: staffRotaSelectedMemberId || staffOptions[0].value, options: staffOptions },
      {
        id: "status",
        label: "Assignment",
        type: "select",
        required: true,
        value: "scheduled",
        options: [
          { value: "scheduled", label: "Scheduled" },
          { value: "covering", label: "Covering" },
          { value: "available", label: "Available (standby)" },
          { value: "off", label: "Off (remove from day)" },
          { value: "sick", label: "Sick" }
        ]
      },
      {
        id: "shift",
        label: "Shift",
        type: "select",
        required: true,
        value: "full",
        options: [
          { value: "full", label: "Full Day" },
          { value: "am", label: "AM" },
          { value: "pm", label: "PM" }
        ]
      }
    ]
  });
  if (!values) return;
  const staffId = String(values.staffId || "").trim();
  if (!staffId) return;
  const status = normalizeStaffCellStatus(values.status || "scheduled");
  const shift = normalizeStaffShiftType(values.shift || "full");
  staffRotaSelectedMemberId = staffId;
  try {
    await applyStaffRotaUpdates([{ staffId, day: normalizedDayKey, status, shift }], { silent: true });
    const assignedName = snapshot.rows.find((row) => row.memberId === staffId)?.member?.name || "Staff";
    setStaffStatus(`${assignedName} updated for ${dayMeta?.label || normalizedDayKey.toUpperCase()}.`);
    showManageToast("Day assignment updated.");
  } catch (error) {
    setStaffStatus(error.message, true);
  }
}

function stageStaffRotaPaint(cell, updatesMap) {
  if (!(cell instanceof HTMLElement)) return;
  const staffId = String(cell.getAttribute("data-id") || "").trim();
  const dayKey = String(cell.getAttribute("data-day") || "").trim().toLowerCase();
  if (!staffId || !dayKey) return;
  const brush = getCurrentRotaBrush();
  staffRotaSelectedMemberId = staffId;
  setStaffDayState(staffId, dayKey, brush);
  updatesMap.set(`${staffId}:${dayKey}`, { staffId, day: dayKey, status: brush.status, shift: brush.shift });
  renderStaffSummary();
  renderStaffRoster();
}

async function flushStaffRotaDragPaint() {
  if (!staffRotaDragPaint.active) return;
  const updates = Array.from(staffRotaDragPaint.updates?.values?.() || []);
  staffRotaDragPaint.active = false;
  staffRotaDragPaint.seen = new Set();
  staffRotaDragPaint.updates = new Map();
  if (!updates.length) return;
  try {
    await applyStaffRotaUpdates(updates, { silent: true });
    setStaffStatus(`Rota updated (${updates.length} cell${updates.length > 1 ? "s" : ""}).`);
  } catch (error) {
    setStaffStatus(error.message, true);
  }
}

staffWeekPrevBtn?.addEventListener("click", async () => {
  staffRotaWeekOffset -= 1;
  await loadAndRenderStaffRotaWeek();
});

staffWeekTodayBtn?.addEventListener("click", async () => {
  staffRotaWeekOffset = 0;
  await loadAndRenderStaffRotaWeek();
});

staffWeekNextBtn?.addEventListener("click", async () => {
  staffRotaWeekOffset += 1;
  await loadAndRenderStaffRotaWeek();
});

staffAutoCoverBtn?.addEventListener("click", async () => {
  if (!isDashboardManagerRole() || !manageModeEnabled) {
    setStaffStatus("Turn Edit Mode on to auto-fill sickness cover.", true);
    return;
  }
  await applyAutoCoverForWeek();
});

staffLoadDemoRotaBtn?.addEventListener("click", () => {
  loadStaffDemoRotaPreview();
  showManageToast("Demo rota loaded.");
});

staffClearWeekOverridesBtn?.addEventListener("click", async () => {
  if (!isDashboardManagerRole() || !manageModeEnabled) {
    setStaffStatus("Turn Edit Mode on to reset rota changes.", true);
    return;
  }
  const confirmed = await openManageConfirm({
    title: "Reset Weekly Rota Edits",
    message: "Clear all rota status changes for the selected week (including sickness and cover flags)?",
    confirmLabel: "Reset Week"
  });
  if (!confirmed) return;
  try {
    await resetStaffRotaWeekRemote();
    renderStaffSummary();
    renderStaffRoster();
    setStaffStatus("Weekly rota changes reset.");
  } catch (error) {
    setStaffStatus(error.message, true);
  }
});

staffRotaGrid?.addEventListener("pointerdown", (event) => {
  const target = event.target;
  const cell = target instanceof HTMLElement ? target.closest(".staff-rota-cell, .staff-rota-dot-btn") : null;
  if (!(cell instanceof HTMLElement)) return;
  const staffId = String(cell.getAttribute("data-id") || "").trim();
  if (staffId) staffRotaSelectedMemberId = staffId;
  if (!isDashboardManagerRole() || !manageModeEnabled) {
    renderStaffRoster();
    setStaffStatus("Turn Edit Mode on to update rota cells.", true);
    return;
  }
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    // Allow native scroll/gesture behavior inside the popup on touch devices.
    return;
  }
  if (typeof event.button === "number" && event.button !== 0) return;
  event.preventDefault();
  staffRotaDragPaint.active = true;
  staffRotaDragPaint.seen = new Set();
  staffRotaDragPaint.updates = new Map();
  const firstKey = `${String(cell.getAttribute("data-id") || "").trim()}:${String(cell.getAttribute("data-day") || "").trim().toLowerCase()}`;
  if (firstKey) staffRotaDragPaint.seen.add(firstKey);
  stageStaffRotaPaint(cell, staffRotaDragPaint.updates);
});

staffRotaGrid?.addEventListener("pointerover", (event) => {
  if (!staffRotaDragPaint.active) return;
  const target = event.target;
  const cell = target instanceof HTMLElement ? target.closest(".staff-rota-cell, .staff-rota-dot-btn") : null;
  if (!(cell instanceof HTMLElement)) return;
  const key = `${String(cell.getAttribute("data-id") || "").trim()}:${String(cell.getAttribute("data-day") || "").trim().toLowerCase()}`;
  if (!key || staffRotaDragPaint.seen.has(key)) return;
  staffRotaDragPaint.seen.add(key);
  stageStaffRotaPaint(cell, staffRotaDragPaint.updates);
});

document.addEventListener("pointerup", () => {
  flushStaffRotaDragPaint().catch(() => {});
});

staffRotaGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const cell = target.closest(".staff-rota-cell, .staff-rota-dot-btn");
  if (cell instanceof HTMLElement) {
    const staffId = String(cell.getAttribute("data-id") || "").trim();
    if (!staffId) return;
    staffRotaSelectedMemberId = staffId;
    if (!manageModeEnabled) renderStaffRoster();
    return;
  }
  const dayCell = target.closest(".staff-rota-day-cell");
  if (!(dayCell instanceof HTMLElement)) return;
  const dayKey = String(dayCell.getAttribute("data-day") || "").trim().toLowerCase();
  if (!dayKey) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) {
    setStaffStatus("Turn Edit Mode on to assign staff for a day.", true);
    return;
  }
  openStaffDayQuickAssign(dayKey).catch((error) => {
    setStaffStatus(error.message, true);
  });
});

staffRosterList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const staffId = String(target.getAttribute("data-id") || "").trim();
  if (!staffId) return;
  try {
    if (target.classList.contains("staff-select")) {
      staffRotaSelectedMemberId = staffId;
      renderStaffRoster();
      return;
    }
    if (target.classList.contains("staff-sick")) {
      if (!isDashboardManagerRole() || !manageModeEnabled) {
        setStaffStatus("Turn Edit Mode on to record staff sickness.", true);
        return;
      }
      const applied = await promptStaffSickReport(staffId);
      if (applied) {
        setStaffStatus("Sickness alert added to rota and coverage planner updated.");
        showManageToast("Sickness alert added.");
      }
      return;
    }
    if (!isDashboardManagerRole() || !manageModeEnabled) return;
    if (target.classList.contains("staff-edit")) {
      const member = staffRosterRows.find((row) => String(row.id || "") === staffId);
      if (!member) return;
      const values = await openManageForm({
        title: "Edit Staff Member",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Name", required: true, value: member.name || "" },
          { id: "role", label: "Role", value: member.role || "staff" },
          { id: "availability", label: "Availability", value: member.availability || "off_duty" },
          {
            id: "shiftDays",
            label: "Shift days comma-separated",
            value: Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(",") : ""
          }
        ]
      });
      if (!values) return;
      setStaffStatus("Saving staff member...");
      await upsertStaffMember({
        id: staffId,
        name: values.name,
        role: values.role,
        availability: values.availability,
        shiftDays: String(values.shiftDays || "")
          .split(",")
          .map((value) => String(value || "").trim().toLowerCase())
          .filter(Boolean)
      });
      setStaffStatus("Staff member updated.");
      showManageToast("Staff member updated.");
      return;
    }
    if (target.classList.contains("staff-toggle")) {
      const next = String(target.getAttribute("data-next") || "off_duty").trim();
      setStaffStatus("Updating availability...");
      await updateStaffAvailability(staffId, next);
      setStaffStatus("Availability updated.");
      return;
    }
    if (target.classList.contains("staff-remove")) {
      const confirmed = await openManageConfirm({
        title: "Delete Staff Member",
        message: "Remove this staff member?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      setStaffStatus("Removing staff member...");
      await removeStaffMember(staffId);
      if (staffRotaSelectedMemberId === staffId) {
        staffRotaSelectedMemberId = getStaffMemberId(staffRosterRows[0] || null);
      }
      setStaffStatus("Staff member removed.");
      showManageToast("Staff member deleted.");
    }
  } catch (error) {
    setStaffStatus(error.message, true);
  }
});

waitlistForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const customerName = String(waitlistNameInput?.value || "").trim();
  const customerPhone = String(waitlistPhoneInput?.value || "").trim();
  const customerEmail = String(waitlistEmailInput?.value || "").trim().toLowerCase();
  const service = String(waitlistServiceInput?.value || "").trim();
  const preferred = parseWaitlistDateTime(waitlistDateInput?.value || "");
  if (!customerName) {
    setWaitlistStatus("Customer name is required.", true);
    return;
  }
  if (!customerPhone && !customerEmail) {
    setWaitlistStatus("Phone or email is required.", true);
    return;
  }
  if (waitlistDateInput?.value && !preferred) {
    setWaitlistStatus("Preferred date/time is invalid. Use a valid date/time.", true);
    return;
  }
  try {
    setWaitlistStatus("Saving waitlist entry...");
    await upsertWaitlistEntry({
      customerName,
      customerPhone,
      customerEmail,
      service,
      preferredDate: preferred?.preferredDate || "",
      preferredTime: preferred?.preferredTime || "",
      notes: ""
    });
    if (waitlistNameInput) waitlistNameInput.value = "";
    if (waitlistPhoneInput) waitlistPhoneInput.value = "";
    if (waitlistEmailInput) waitlistEmailInput.value = "";
    if (waitlistServiceInput) waitlistServiceInput.value = "";
    if (waitlistDateInput) waitlistDateInput.value = "";
    setWaitlistStatus("Waitlist entry saved.");
  } catch (error) {
    setWaitlistStatus(error.message, true);
  }
});

waitlistList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const entryId = String(target.getAttribute("data-id") || "").trim();
  if (!entryId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;
  try {
    if (target.classList.contains("waitlist-edit")) {
      const entry = waitlistRows.find((row) => String(row.id || "") === entryId);
      if (!entry) return;
      const values = await openManageForm({
        title: "Edit Waitlist Entry",
        submitLabel: "Save",
        fields: [
          { id: "customerName", label: "Customer Name", required: true, value: entry.customerName || "" },
          { id: "customerPhone", label: "Customer Phone", value: entry.customerPhone || "" },
          { id: "customerEmail", label: "Customer Email", value: entry.customerEmail || "" },
          { id: "service", label: "Service", value: entry.service || "" },
          { id: "preferredDate", label: "Preferred Date", type: "date", value: entry.preferredDate || "" },
          { id: "preferredTime", label: "Preferred Time", type: "time", value: entry.preferredTime || "" }
        ]
      });
      if (!values) return;
      setWaitlistStatus("Saving waitlist entry...");
      await upsertWaitlistEntry({
        id: entryId,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: String(values.customerEmail || "").toLowerCase(),
        service: values.service,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime
      });
      setWaitlistStatus("Waitlist entry updated.");
      showManageToast("Waitlist entry updated.");
      return;
    }
    if (target.classList.contains("waitlist-backfill")) {
      setWaitlistStatus("Marking waitlist entry as contacted...");
      await markWaitlistContacted(entryId);
      setWaitlistStatus("Waitlist entry marked as contacted.");
      return;
    }
    if (target.classList.contains("waitlist-remove")) {
      const confirmed = await openManageConfirm({
        title: "Delete Waitlist Entry",
        message: "Remove this waitlist entry?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      setWaitlistStatus("Removing waitlist entry...");
      await removeWaitlistEntry(entryId);
      setWaitlistStatus("Waitlist entry removed.");
      showManageToast("Waitlist entry deleted.");
    }
  } catch (error) {
    setWaitlistStatus(error.message, true);
  }
});

noShowRiskList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("ops-send-reminder")) return;
  const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const service = String(target.getAttribute("data-service") || "").trim();
  if (!bookingId) return;
  try {
    setOperationsStatus("Saving reminder activity...");
    await markRebookingPromptSent({ customerKey: `booking:${bookingId}`, customerName, service });
    setOperationsStatus("Reminder activity logged.");
  } catch (error) {
    setOperationsStatus(error.message, true);
  }
});

rebookingPromptList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("ops-copy-rebooking")) {
    const message = String(target.getAttribute("data-message") || "").trim();
    if (!message) return;
    const copied = await writeToClipboard(message);
    setOperationsStatus(copied ? "Rebooking prompt copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
    return;
  }

  if (!target.classList.contains("ops-mark-rebooking")) return;
  const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const service = String(target.getAttribute("data-service") || "").trim();
  if (!customerKey) return;
  try {
    setOperationsStatus("Saving rebooking activity...");
    await markRebookingPromptSent({ customerKey, customerName, service });
    setOperationsStatus("Rebooking prompt marked as sent.");
  } catch (error) {
    setOperationsStatus(error.message, true);
  }
});

crmSegmentsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("crm-copy-message")) {
    const message = String(target.getAttribute("data-message") || "").trim();
    if (!message) return;
    const copied = await writeToClipboard(message);
    setCrmStatus(copied ? "Campaign template copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
    return;
  }

  if (!target.classList.contains("crm-mark-sent")) return;
  const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
  const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const message = String(target.getAttribute("data-message") || "").trim();
  if (!segmentId || !customerKey || !message) return;
  try {
    setCrmStatus("Saving campaign activity...");
    await sendCrmCampaign({
      segmentId,
      customerKey,
      customerName,
      message,
      channel: "manual"
    });
    setCrmStatus("Campaign activity marked as sent.");
  } catch (error) {
    setCrmStatus(error.message, true);
  }
});

membershipForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(membershipNameInput?.value || "").trim();
  const price = Number(membershipPriceInput?.value || 0);
  const billingCycle = String(membershipCycleInput?.value || "monthly").trim().toLowerCase();
  const benefits = String(membershipBenefitsInput?.value || "").trim();
  if (!name) {
    setCommercialStatus("Membership name is required.", true);
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    setCommercialStatus("Membership price must be valid.", true);
    return;
  }
  try {
    setCommercialStatus("Saving membership...");
    await upsertMembership({ name, price, billingCycle, benefits, status: "active" });
    if (membershipNameInput) membershipNameInput.value = "";
    if (membershipPriceInput) membershipPriceInput.value = "";
    if (membershipBenefitsInput) membershipBenefitsInput.value = "";
    setCommercialStatus("Membership saved.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

packageForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(packageNameInput?.value || "").trim();
  const price = Number(packagePriceInput?.value || 0);
  const sessionCount = Math.floor(Number(packageSessionsInput?.value || 0));
  if (!name) {
    setCommercialStatus("Package name is required.", true);
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    setCommercialStatus("Package price must be valid.", true);
    return;
  }
  if (!Number.isInteger(sessionCount) || sessionCount <= 0) {
    setCommercialStatus("Package sessions must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Saving package...");
    await upsertPackage({ name, price, sessionCount, status: "active" });
    if (packageNameInput) packageNameInput.value = "";
    if (packagePriceInput) packagePriceInput.value = "";
    if (packageSessionsInput) packageSessionsInput.value = "";
    setCommercialStatus("Package saved.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

giftCardForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const purchaserName = String(giftPurchaserInput?.value || "").trim();
  const recipientName = String(giftRecipientInput?.value || "").trim();
  const initialBalance = Number(giftBalanceInput?.value || 0);
  const expiresAt = String(giftExpiresInput?.value || "").trim();
  if (!purchaserName || !recipientName) {
    setCommercialStatus("Purchaser and recipient names are required.", true);
    return;
  }
  if (!Number.isFinite(initialBalance) || initialBalance <= 0) {
    setCommercialStatus("Gift-card balance must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Issuing gift card...");
    await issueGiftCard({ purchaserName, recipientName, initialBalance, expiresAt });
    if (giftPurchaserInput) giftPurchaserInput.value = "";
    if (giftRecipientInput) giftRecipientInput.value = "";
    if (giftBalanceInput) giftBalanceInput.value = "";
    if (giftExpiresInput) giftExpiresInput.value = "";
    setCommercialStatus("Gift card issued.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

giftCardList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("commercial-redeem-gift")) return;
  const giftCardId = String(target.getAttribute("data-gift-card-id") || "").trim();
  if (!giftCardId) return;
  const values = await openManageForm({
    title: "Redeem Gift Card",
    submitLabel: "Redeem",
    fields: [{ id: "amount", label: "Redeem Amount", type: "number", required: true, value: "0" }]
  });
  if (!values) return;
  const amount = Number(values.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    setCommercialStatus("Redeem amount must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Applying gift-card redemption...");
    await redeemGiftCard(giftCardId, amount);
    setCommercialStatus("Gift-card balance updated.");
    showManageToast("Gift-card balance updated.");
  } catch (error) {
    setCommercialStatus(error.message, true);
    showManageToast(error.message, "error");
  }
});

revenueSpendForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const channel = String(revenueChannelInput?.value || "").trim();
  const spend = Number(revenueSpendInput?.value || 0);
  if (!channel) {
    setRevenueStatus("Channel is required.", true);
    return;
  }
  if (!Number.isFinite(spend) || spend < 0) {
    setRevenueStatus("Spend must be a valid number >= 0.", true);
    return;
  }
  try {
    setRevenueStatus("Saving channel spend...");
    await saveRevenueChannelSpend({ channel, spend });
    if (revenueSpendInput) revenueSpendInput.value = "";
    setRevenueStatus("Channel spend saved.");
  } catch (error) {
    setRevenueStatus(error.message, true);
  }
});

profitPayrollForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const staffName = String(profitStaffNameInput?.value || "").trim();
  const role = String(profitStaffRoleInput?.value || "").trim();
  const hours = Number(profitStaffHoursInput?.value || 0);
  const hourlyRate = Number(profitStaffRateInput?.value || 0);
  const bonus = Number(profitStaffBonusInput?.value || 0);
  if (!staffName) {
    setProfitabilityStatus("Staff name is required.", true);
    return;
  }
  if (!Number.isFinite(hours) || hours < 0 || !Number.isFinite(hourlyRate) || hourlyRate < 0 || !Number.isFinite(bonus) || bonus < 0) {
    setProfitabilityStatus("Payroll values must be valid numbers >= 0.", true);
    return;
  }
  try {
    setProfitabilityStatus("Saving payroll entry...");
    await upsertPayrollInput({ staffName, role, hours, hourlyRate, bonus });
    if (profitStaffNameInput) profitStaffNameInput.value = "";
    if (profitStaffRoleInput) profitStaffRoleInput.value = "";
    if (profitStaffHoursInput) profitStaffHoursInput.value = "";
    if (profitStaffRateInput) profitStaffRateInput.value = "";
    if (profitStaffBonusInput) profitStaffBonusInput.value = "";
    setProfitabilityStatus("Payroll entry saved.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

profitPayrollList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const entryId = String(target.getAttribute("data-entry-id") || "").trim();
  if (!entryId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;
  if (!target.classList.contains("profit-remove-payroll") && !target.classList.contains("profit-edit-payroll")) return;
  try {
    if (target.classList.contains("profit-edit-payroll")) {
      const entries = Array.isArray(profitabilityPayload?.payrollEntries) ? profitabilityPayload.payrollEntries : [];
      const entry = entries.find((row) => String(row?.id || "") === entryId);
      if (!entry) return;
      const values = await openManageForm({
        title: "Edit Payroll Entry",
        submitLabel: "Save",
        fields: [
          { id: "staffName", label: "Staff Name", required: true, value: entry.staffName || "" },
          { id: "role", label: "Role", value: entry.role || "" },
          { id: "hours", label: "Hours", type: "number", value: String(entry.hours || 0), required: true },
          { id: "hourlyRate", label: "Hourly Rate", type: "number", value: String(entry.hourlyRate || 0), required: true },
          { id: "bonus", label: "Bonus", type: "number", value: String(entry.bonus || 0) }
        ]
      });
      if (!values) return;
      const hours = Number(values.hours || 0);
      const hourlyRate = Number(values.hourlyRate || 0);
      const bonus = Number(values.bonus || 0);
      if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return;
      setProfitabilityStatus("Updating payroll entry...");
      await upsertPayrollInput({
        id: entryId,
        staffName: values.staffName,
        role: values.role,
        hours,
        hourlyRate,
        bonus
      });
      setProfitabilityStatus("Payroll entry updated.");
      showManageToast("Payroll entry updated.");
      return;
    }
    const confirmed = await openManageConfirm({
      title: "Delete Payroll Entry",
      message: "Remove this payroll entry?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    setProfitabilityStatus("Removing payroll entry...");
    await removePayrollInput(entryId);
    setProfitabilityStatus("Payroll entry removed.");
    showManageToast("Payroll entry deleted.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

profitCostsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rent = Number(profitRentInput?.value || 0);
  const utilities = Number(profitUtilitiesInput?.value || 0);
  const software = Number(profitSoftwareInput?.value || 0);
  const other = Number(profitOtherInput?.value || 0);
  const cogsPercent = Number(profitCogsPercentInput?.value || 0);
  const values = [rent, utilities, software, other, cogsPercent];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    setProfitabilityStatus("Cost values must be valid numbers >= 0.", true);
    return;
  }
  if (cogsPercent > 95) {
    setProfitabilityStatus("COGS percent must be 95 or less.", true);
    return;
  }
  try {
    setProfitabilityStatus("Saving cost inputs...");
    await upsertProfitabilityCosts({ rent, utilities, software, other, cogsPercent });
    setProfitabilityStatus("Cost inputs saved.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

function loadMockDashboard() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const mm = String(thisMonth).padStart(2, "0");

  billingSummary = {
    planLabel: "Pro Monthly",
    status: "active",
    billingCycle: "monthly",
    currentPeriodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 24).toISOString(),
    monthlyFee: 49.99,
    yearlyFee: 499.99,
    yearlyDiscountPercent: 16.7,
    autoRenew: true
  };
  if (user.role === "admin") {
    const mockAdminBusinessId = String(managedBusinessId || "mock-admin-biz-lumen").trim();
    managedBusinessId = mockAdminBusinessId;
    adminBusinessOptions = [
      {
        id: mockAdminBusinessId,
        name: "Lumen Studio",
        city: "Manchester",
        country: "United Kingdom"
      },
      {
        id: "mock-admin-biz-north-lane",
        name: "North Lane Studio",
        city: "Chester",
        country: "United Kingdom"
      },
      {
        id: "mock-admin-biz-river-and-rose",
        name: "River & Rose Salon",
        city: "Liverpool",
        country: "United Kingdom"
      },
      {
        id: "mock-admin-biz-crown-barber",
        name: "Crown Barber Co.",
        city: "Leeds",
        country: "United Kingdom"
      },
      {
        id: "mock-admin-biz-atelier-beauty",
        name: "Atelier Beauty Rooms",
        city: "Birmingham",
        country: "United Kingdom"
      }
    ];
    if (adminBusinessSelect) {
      adminBusinessSelect.innerHTML = "";
      adminBusinessOptions.forEach((business) => {
        const option = document.createElement("option");
        option.value = String(business.id || "");
        const location = [business.city, business.country].filter(Boolean).join(", ");
        option.textContent = location ? `${business.name} (${location})` : String(business.name || "Unnamed business");
        adminBusinessSelect.appendChild(option);
      });
      adminBusinessSelect.value = managedBusinessId;
    }
    setAdminBusinessStatus(`Viewing ${adminBusinessOptions.find((b) => b.id === managedBusinessId)?.name || "selected business"} (mock data).`);
  }
  renderSubscriberBillingControls();

  setBusinessProfileFormValues({
    name: "Lumen Studio",
    type: "hair_salon",
    phone: "+44 161 555 0101",
    email: "hello@lumenstudio.example",
    city: "Manchester",
    country: "United Kingdom",
    postcode: "M1 2AB",
    address: "18 King Street, Manchester",
    description: "Modern salon offering color, styling, and front-desk AI booking support with Lexi.",
    websiteUrl: "https://lumenstudio.example",
    websiteTitle: "Lumen Studio",
    websiteSummary: "Premium color and styling salon with AI-assisted bookings and fast front-desk support.",
    websiteImageUrl: "/Salon_AI_IMG.png",
    hours: {
      monday: "09:00 - 18:00",
      tuesday: "09:00 - 18:00",
      wednesday: "09:00 - 19:00",
      thursday: "09:00 - 19:00",
      friday: "09:00 - 19:00",
      saturday: "08:30 - 17:00",
      sunday: "Closed"
    },
    services: [
      { name: "Cut + Blowdry", durationMin: 60, price: 55 },
      { name: "Balayage + Toner", durationMin: 150, price: 145 },
      { name: "Gloss + Blowdry", durationMin: 75, price: 68 },
      { name: "Keratin Treatment", durationMin: 120, price: 160 }
    ]
  });
  setBusinessProfileStatus("Mock business profile loaded.");

  const mockSocial = {
    socialFacebook: "https://facebook.com/lumenstudio.example",
    socialInstagram: "https://instagram.com/lumenstudio.example",
    socialTwitter: "",
    socialLinkedin: "",
    socialTiktok: "https://tiktok.com/@lumenstudio.example",
    customSocial: "https://linktr.ee/lumenstudio",
    socialImageUrl: "/Salon_AI_IMG.png"
  };
  setSocialMediaFormValues(mockSocial);
  renderSocialMediaPreview(mockSocial);

  metricsGrid.innerHTML = "";
  addMetric("monthlyBookings", "128");
  addMetric("monthlyRevenue", "£14,920");
  addMetric("noShowRate", "3.6%");
  addMetric("repeatClientRate", "62%");

  bookingRows = [
    { id: "b1", customerName: "Ava Thompson", service: "Balayage + Toner", date: `${year}-${mm}-06`, time: "10:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-01T10:30:00Z` },
    { id: "b2", customerName: "Daniel Ruiz", service: "Skin Fade", date: `${year}-${mm}-08`, time: "14:00", status: "completed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-02T11:00:00Z` },
    { id: "b2a", customerName: "Jade Carter", service: "Gloss + Blowdry", date: `${year}-${mm}-09`, time: "11:30", status: "pending_confirmation", businessName: "Lumen Studio", createdAt: `${year}-${mm}-02T15:20:00Z` },
    { id: "b3", customerName: "Priya Nair", service: "Blowout", date: `${year}-${mm}-12`, time: "16:15", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-03T12:00:00Z` },
    { id: "b4", customerName: "Mason Lee", service: "Beard Trim", date: `${year}-${mm}-15`, time: "09:45", status: "cancelled", businessName: "Lumen Studio", createdAt: `${year}-${mm}-04T12:10:00Z` },
    { id: "b5", customerName: "Chloe Martin", service: "Keratin Treatment", date: `${year}-${mm}-21`, time: "13:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-05T13:20:00Z` }
  ];
  nextBookingsCursor = null;
  updateLoadMoreState(false);
  applyBookingFilters();
  renderSubscriberCalendar();

  accountingRows = [
    { provider: "quickbooks", status: "connected", connected: true, accountLabel: "Main Ledger", syncMode: "daily", updatedAt: new Date(now.getTime() - 86400000).toISOString() },
    { provider: "xero", status: "not_connected", connected: false, accountLabel: "", syncMode: "weekly", updatedAt: null },
    { provider: "freshbooks", status: "not_connected", connected: false, accountLabel: "", syncMode: "manual", updatedAt: null }
  ];
  renderAccountingIntegrations();
  setAccountingStatus("Mock data loaded.");
  accountingLivePayload = {
    timeframe: accountingLiveTimeframe,
    generatedAt: new Date().toISOString(),
    refreshIntervalSec: 15,
    cards: {
      todayRevenue: 1860,
      todayCancelledRevenue: 190,
      todayBookings: 14,
      todayCancellations: 2,
      lastHourRevenue: 340,
      last15MinRevenue: 110,
      lastHourBookings: 3
    },
    gauges: {
      dailyTarget: 2500,
      targetProgressPct: 74.4,
      cancellationRatePct: 14.3
    },
    stream: {
      hourly: [
        { label: "9 AM", revenue: 180, cancellations: 0 },
        { label: "10 AM", revenue: 260, cancellations: 1 },
        { label: "11 AM", revenue: 320, cancellations: 0 },
        { label: "12 PM", revenue: 210, cancellations: 1 },
        { label: "1 PM", revenue: 410, cancellations: 0 },
        { label: "2 PM", revenue: 340, cancellations: 0 }
      ],
      weekly: []
    }
  };
  renderAccountingLiveRevenue();
  subscriberCommandCenter = {
    today: {
      totalBookings: 6,
      confirmedBookings: 5,
      estimatedRevenue: 860,
      lastMinuteCancellations: 1
    },
    next7Days: {
      confirmedBookings: 19,
      estimatedRevenue: 3240
    },
    serviceHealth: {
      cancellationRate: 7.2
    },
    recommendedActions: [
      { label: "Fill cancellation gaps", detail: "1 last-minute cancellation today. Offer waitlist slot." },
      { label: "Boost today's demand", detail: "Send same-day campaign to inactive clients." }
    ]
  };
  renderCommandCenter();
  staffRosterRows = [
    { id: "s1", name: "Jordan Miles", role: "stylist", availability: "on_duty", shiftDays: ["mon", "tue", "wed"] },
    { id: "s2", name: "Amira Cole", role: "stylist", availability: "on_duty", shiftDays: ["thu", "fri", "sat"] },
    { id: "s3", name: "Riley West", role: "receptionist", availability: "off_duty", shiftDays: ["mon", "fri"] }
  ];
  staffSummary = {
    totalMembers: 3,
    onDutyCount: 2,
    offDutyCount: 1,
    scheduledTodayCount: 2,
    estimatedChairCapacityToday: 12
  };
  renderStaffSummary();
  renderStaffRoster();
  setStaffStatus("Mock roster loaded.");
  waitlistRows = [
    {
      id: "w1",
      customerName: "Lina Patel",
      customerPhone: "+12025550111",
      customerEmail: "",
      service: "Skin Fade",
      preferredDate: "",
      preferredTime: "",
      status: "waiting"
    },
    {
      id: "w2",
      customerName: "Owen Price",
      customerPhone: "",
      customerEmail: "owen@example.com",
      service: "Blowout",
      preferredDate: "",
      preferredTime: "",
      status: "contacted"
    }
  ];
  waitlistSummary = {
    totalEntries: 2,
    waitingCount: 1,
    contactedCount: 1,
    bookedCount: 0
  };
  renderWaitlistSummary();
  renderWaitlist();
  setWaitlistStatus("Mock waitlist loaded.");
  operationsInsights = {
    noShowRisk: [
      {
        bookingId: "b4",
        customerName: "Mason Lee",
        service: "Beard Trim",
        date: `${year}-${mm}-15`,
        time: "09:45",
        riskScore: 74,
        riskLevel: "high",
        reasons: ["Very short lead time.", "Moderate previous cancellation rate."]
      }
    ],
    rebookingPrompts: [
      {
        customerKey: "email:owen@example.com",
        customerName: "Owen Price",
        lastService: "Blowout",
        daysSinceLastVisit: 36,
        suggestedMessage:
          "Hi Owen Price, it has been 36 days since your Blowout. We have new availability this week and would love to book your next visit."
      }
    ]
  };
  renderOperationsInsights();
  setOperationsStatus("Operations insights loaded.");
  crmSegmentsPayload = {
    summary: {
      totalCustomers: 14,
      actionableLeads: 4
    },
    segments: [
      {
        id: "high_value_lapsed",
        label: "High-Value Lapsed",
        leads: [
          {
            customerKey: "email:ava@example.com",
            customerName: "Ava Thompson",
            message: "Hi Ava Thompson, we miss seeing you. Enjoy a loyalty priority slot this week for your next visit."
          }
        ]
      },
      {
        id: "new_clients_followup",
        label: "New Client Follow-Up",
        leads: [
          {
            customerKey: "email:daniel@example.com",
            customerName: "Daniel Ruiz",
            message:
              "Hi Daniel Ruiz, thanks for visiting us. We would love to welcome you back with a tailored follow-up appointment."
          }
        ]
      }
    ]
  };
  renderCrmSegments();
  setCrmStatus("CRM segments loaded.");
  commercialPayload = {
    memberships: [
      {
        id: "m1",
        name: "Platinum Grooming Club",
        price: 79,
        billingCycle: "monthly",
        status: "active",
        benefits: "2 cuts + priority booking"
      }
    ],
    packages: [
      {
        id: "p1",
        name: "6x Blowout Bundle",
        price: 250,
        sessionCount: 6,
        remainingSessions: 4,
        status: "active"
      }
    ],
    giftCards: [
      {
        id: "g1",
        code: "GIFT-AB12CD34",
        purchaserName: "Lina Patel",
        recipientName: "Owen Price",
        initialBalance: 120,
        remainingBalance: 90,
        status: "active",
        issuedAt: new Date(now.getTime() - 172800000).toISOString(),
        expiresAt: null
      }
    ],
    summary: {
      activeMemberships: 1,
      activePackages: 1,
      activeGiftCards: 1,
      outstandingGiftBalance: 90
    }
  };
  renderCommercialControls();
  setCommercialStatus("Commercial controls loaded.");
  revenueAttributionPayload = {
    channels: [
      {
        channel: "direct",
        label: "Direct",
        bookings: 9,
        cancelledBookings: 1,
        revenue: 1260,
        spend: 120,
        sharePercent: 56.3,
        roiPercent: 950
      },
      {
        channel: "instagram",
        label: "Instagram",
        bookings: 4,
        cancelledBookings: 0,
        revenue: 580,
        spend: 220,
        sharePercent: 25,
        roiPercent: 163.6
      },
      {
        channel: "ai_assistant",
        label: "AI Assistant",
        bookings: 3,
        cancelledBookings: 0,
        revenue: 430,
        spend: 0,
        sharePercent: 18.7,
        roiPercent: null
      }
    ],
    summary: {
      totalRevenue: 2270,
      totalSpend: 340,
      totalAttributedBookings: 16,
      blendedRoiPercent: 567.6,
      bestRevenueChannel: "direct",
      bestRoiChannel: "direct"
    }
  };
  renderRevenueAttribution();
  setRevenueStatus("Revenue attribution loaded.");
  profitabilityPayload = {
    payrollEntries: [
      {
        id: "pr1",
        staffName: "Jordan Miles",
        role: "Barber",
        hours: 38,
        hourlyRate: 22,
        bonus: 75
      },
      {
        id: "pr2",
        staffName: "Amira Cole",
        role: "Stylist",
        hours: 34,
        hourlyRate: 24,
        bonus: 90
      }
    ],
    fixedCosts: {
      rent: 2200,
      utilities: 320,
      software: 210,
      other: 180
    },
    cogsPercent: 12,
    summary: {
      grossRevenue: 2270,
      nonCancelledBookings: 16,
      averageTicket: 141.88,
      payrollTotal: 1819,
      fixedCostsTotal: 2910,
      cogsAmount: 272.4,
      totalCosts: 5001.4,
      estimatedProfit: -2731.4,
      profitMarginPercent: -120.3,
      breakevenRevenue: 5373.86
    }
  };
  renderProfitabilitySummary();
  setProfitabilityStatus("Profitability summary loaded.");
  renderBusinessGrowthPanel();
  enforceDashboardRoleLayoutVisibility();
  renderExecutivePulse();
}

if (isMockMode || dashboardDemoFillModeEnabled) {
  loadMockDashboard();
} else {
  (async () => {
    if (user.role === "admin") {
      try {
        await loadAdminBusinessOptions();
      } catch (error) {
        setAdminBusinessStatus(error.message, true);
      }
    }

    if (user.role !== "customer") {
      loadMetrics().catch((error) => {
        if (shouldRenderTopMetricsGrid() && metricsGrid) {
          metricsGrid.innerHTML = `<article class="dash-card"><p>${error.message}</p></article>`;
        } else {
          setDashActionStatus(error.message, true);
        }
      });
    }

    loadBookings({ append: false }).catch((error) => {
      if (bookingsList) {
        bookingsList.innerHTML = `<li>${error.message}</li>`;
      }
    });

    if (user.role === "subscriber" || user.role === "admin") {
      loadBillingSummary()
        .then(() => {
          renderBusinessGrowthPanel();
        })
        .catch((error) => {
          if (billingLiveBanner) billingLiveBanner.textContent = error.message;
        });

      loadBusinessProfile().catch((error) => {
        setBusinessProfileStatus(error.message, true);
      });

      loadSocialMediaLinks().catch((error) => {
        if (socialMediaPreview) {
          socialMediaPreview.innerHTML = `<p>${error.message}</p>`;
        }
      });

      loadAccountingIntegrations().catch((error) => {
        setAccountingStatus(error.message, true);
      });

      loadStaffRoster().catch((error) => {
        setStaffStatus(error.message, true);
      });

      loadWaitlist().catch((error) => {
        setWaitlistStatus(error.message, true);
      });

      loadCrmSegments().catch((error) => {
        setCrmStatus(error.message, true);
      });

      loadCommercialControls().catch((error) => {
        setCommercialStatus(error.message, true);
      });

      loadRevenueAttribution().catch((error) => {
        setRevenueStatus(error.message, true);
      });

      loadProfitabilitySummary().catch((error) => {
        setProfitabilityStatus(error.message, true);
      });
    }
  })();
}








