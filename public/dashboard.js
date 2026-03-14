import { applyDashboardRoleLayoutVisibility } from "./dashboard-layout.js?v=20260312-admin1";
import { getBusinessHubModulesForRole } from "./dashboard-business-hub.js?v=20260313-admin6";
import { createModuleUsageRuntime } from "./dashboard-module-usage.js";
import { createModuleStatusRuntime } from "./dashboard-module-status.js";
import { createModuleCatalogRuntime } from "./dashboard-module-catalog.js";
import { createModuleDefinitionsRuntime } from "./dashboard-module-definitions.js";
import { createModulePopupSupportRuntime } from "./dashboard-module-popup-support.js";
import { createModuleGroupingRuntime } from "./dashboard-module-groups.js";
import { getModuleBusinessJobProfile } from "./dashboard-module-profile.js";
import { getModulePopupSnapshotItems } from "./dashboard-module-snapshots.js";
import { createModuleRoutingRuntime } from "./dashboard-module-routing.js";
import { moduleLexiNarrativeProfile as getModuleLexiNarrativeProfile, moduleOpsCategoryLabel as getModuleOpsCategoryLabel } from "./dashboard-module-narrative.js";
import { createModuleLexiBriefRuntime } from "./dashboard-module-lexi-brief.js";
import { createModuleLexiPanelRuntime } from "./dashboard-module-lexi-panel.js";
import { getModuleOperatorBlueprint } from "./dashboard-module-operator-blueprint.js";
import { createModuleActionRuntime } from "./dashboard-module-actions.js";
import { createOpenCloseChecklistRuntime } from "./dashboard-open-close-checklist.js";
import { createModuleWorkboardRuntime } from "./dashboard-module-workboard.js";
import { createModulePopupRuntime } from "./dashboard-module-popups.js";
import { createModuleClickRouterRuntime } from "./dashboard-module-click-router.js";
import { createModuleNavigationRuntime } from "./dashboard-module-navigation.js";
import { createDashboardRoutingUiSupportRuntime } from "./dashboard-routing-ui-support.js?v=20260312-admin1";
import { createDashboardRequestUtilsRuntime } from "./dashboard-request-utils.js?v=20260312-admin1";
import { createDashboardSharedUtilsRuntime } from "./dashboard-shared-utils.js";
import { createDashboardPreferencesRuntime } from "./dashboard-preferences-runtime.js";
import { createDashboardRoleChromeRuntime } from "./dashboard-role-chrome.js?v=20260312-admin1";
import { createDashboardStatusUtilsRuntime } from "./dashboard-status-utils.js";
import { createDashboardStartupRuntime } from "./dashboard-startup-runtime.js";
import { createBookingFilterRuntime } from "./dashboard-booking-filters.js";
import { createCalendarDayWorkspaceRuntime } from "./dashboard-calendar-day-workspace.js";
import { createManageCrmActionsRuntime } from "./dashboard-manage-crm-actions.js";
import { createManageSocialActionsRuntime } from "./dashboard-manage-social-actions.js";
import { createMockDashboardRuntime } from "./dashboard-mock-runtime.js";
import { fallbackText as t } from "./dashboard-text.js";
import {
  MANAGE_MODE_STORAGE_KEY,
  DASHBOARD_DEMO_FILL_MODE_STORAGE_KEY,
  DASHBOARD_DEMO_FILL_SESSION_KEY,
  SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY,
  CONTACT_ADMIN_MESSAGES_STORAGE_KEY,
  STAFF_ROTA_OVERRIDES_STORAGE_KEY,
  OPEN_CLOSE_CHECKLIST_STORAGE_KEY,
  HUB_AUTOROUTINES_STORAGE_KEY,
  DASHBOARD_INLINE_EDIT_STORAGE_KEY,
  EXECUTIVE_PULSE_SNAPSHOTS_STORAGE_KEY,
  DashboardSpeechRecognition,
  STAFF_ROTA_DAYS
} from "./dashboard-constants.js";
import { createAccountingLiveRuntime } from "./dashboard-accounting-live.js";
import { createAccountingLiveControlsRuntime } from "./dashboard-accounting-live-controls.js";
import { createAccountingIntegrationsRuntime } from "./dashboard-accounting-integrations.js";
import { createAccountSessionControlsRuntime } from "./dashboard-account-session-controls.js";
import { createDashboardSessionControlsRuntime } from "./dashboard-session-controls.js";
import { createDashboardManageModeRuntime } from "./dashboard-manage-mode.js";
import { createBillingControlsRuntime } from "./dashboard-billing-controls.js";
import { createContactAdminRuntime } from "./dashboard-contact-admin.js";
import { createSubscriberBillingRuntime } from "./dashboard-subscriber-billing.js";
import { createManageAccountingActionsRuntime } from "./dashboard-manage-accounting-actions.js";
import { createManageCommercialActionsRuntime } from "./dashboard-manage-commercial-actions.js";
import { createManageCoreActionsRuntime } from "./dashboard-manage-core-actions.js";
import { createManageDispatcherRuntime } from "./dashboard-manage-dispatcher.js";
import { createManagedSectionActionsRuntime } from "./dashboard-managed-section-actions.js";
import { createManageUiRuntime } from "./dashboard-manage-ui.js";
import { createLexiPendingRemindersRuntime } from "./dashboard-lexi-pending-reminders.js";
import { createManageRevenueProfitabilityActionsRuntime } from "./dashboard-manage-revenue-profitability-actions.js";
import { createManageWaitlistActionsRuntime } from "./dashboard-manage-waitlist-actions.js";
import { createCommandCenterRuntime } from "./dashboard-command-center.js";
import { createCalendarDayUtilsRuntime } from "./dashboard-calendar-day-utils.js";
import { createCalendarPulseRuntime } from "./dashboard-calendar-pulse.js?v=20260314-calendar2";
import { createExecutivePulseUtilsRuntime } from "./dashboard-executive-pulse-utils.js";
import { createCalendarDiaryRuntime } from "./dashboard-calendar-diary.js";
import { createWorkspaceStarRuntime } from "./dashboard-workspace-star.js";
import { createBusinessProfileRuntime } from "./dashboard-business-profile.js";
import { createAdminSupportRuntime } from "./dashboard-admin-support.js?v=20260312-admin1";
import { createAdminBusinessRuntime } from "./dashboard-admin-business-runtime.js";
import { createAdminBusinessLoadingRuntime } from "./dashboard-admin-business-loading.js";
import { createAdminPlatformRuntime } from "./dashboard-admin-platform.js?v=20260313-admin2";
import { createAdminHubRuntime } from "./dashboard-admin-hub.js?v=20260313-admin11";
import { createBusinessReportingRuntime } from "./dashboard-business-reporting.js";
import { createBusinessGrowthPanelRuntime } from "./dashboard-business-growth-panel.js";
import { createBusinessControlsRuntime } from "./dashboard-business-controls-runtime.js";
import { createBusinessControlsEventsRuntime } from "./dashboard-business-controls-events.js";
import { createMerchAnalyticsRuntime } from "./dashboard-merch-analytics.js";
import { createBookingsRuntime } from "./dashboard-bookings-runtime.js";
import { createOperationsRuntime } from "./dashboard-operations-runtime.js";
import { createStaffRotaUiRuntime } from "./dashboard-staff-rota-ui.js";
import { createStaffRosterControlsRuntime } from "./dashboard-staff-roster-controls.js";
import { createStaffRosterRuntime } from "./dashboard-staff-roster-runtime.js";
import { createStaffDateUtilsRuntime } from "./dashboard-staff-date-utils.js";
import { createStaffRotaWeekRuntime } from "./dashboard-staff-rota-week.js";
import { createStaffRotaCoreRuntime } from "./dashboard-staff-rota-core.js";
import { clearServiceWorkerState } from "./pwa-runtime.js";
import {
  parseShiftDaysInput as parseStaffShiftDaysInput,
  formatDateKey as formatStaffDateKey,
  normalizeStaffCellStatus as normalizeStaffRotaCellStatus,
  normalizeStaffShiftType as normalizeStaffRotaShiftType,
  roleLabel as getStaffRoleLabel,
  getStaffStatusLabel as getStaffRotaStatusLabel,
  getStaffStatusDotColor as getStaffRotaStatusDotColor,
  getStaffInitials as getStaffRosterInitials,
  nextStaffCellStatus as getNextStaffCellStatus,
  getStaffShiftLabel as getStaffRotaShiftLabel
} from "./dashboard-staff-utils.js";
import {
  parseWaitlistDateTime as parseWaitlistDateTimeInput,
  buildWaitlistRecoveryPrefillDateTime as buildWaitlistRecoveryDateTime
} from "./dashboard-waitlist-utils.js";

clearServiceWorkerState();

const params = new URLSearchParams(window.location.search);
// Dashboard mock/demo mode is disabled to preserve a stable live layout.
const isMockMode = false;
const roleParam = String(params.get("role") || "").trim().toLowerCase();
const adminBusinessParam = String(params.get("businessId") || "").trim();
const adminPageParam = String(params.get("adminPage") || "").trim().toLowerCase();
const previewCustomerEmailParam = String(params.get("customerEmail") || "").trim().toLowerCase();
const previewCustomerNameParam = String(params.get("customerName") || "").trim();

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
const authRole = String(user.role || "").trim().toLowerCase();
const isAdminPreview = authRole === "admin" && (roleParam === "subscriber" || roleParam === "customer");
if (isAdminPreview) {
  user.role = roleParam;
  if (roleParam === "subscriber" && adminBusinessParam) {
    user.businessId = adminBusinessParam;
  }
  if (roleParam === "customer") {
    if (previewCustomerEmailParam) user.email = previewCustomerEmailParam;
    if (previewCustomerNameParam) user.name = previewCustomerNameParam;
  }
}
const currentRole = String(user.role || "").trim().toLowerCase();
if (document.body) {
  document.body.setAttribute("data-role", currentRole);
}

function maybeShowFreeSubscriberWelcomePopup() {
  if (currentRole !== "subscriber") return;
  const shouldShow = Boolean(user?.showFreeSubscriberWelcome || user?.freeSubscriberLifetime);
  const email = String(user?.email || "").trim().toLowerCase();
  if (!shouldShow || !email || document.getElementById("freeSubscriberWelcomeModal")) return;
  const storageKey = `salon_ai_free_subscriber_welcome_seen:${email}`;
  if (localStorage.getItem(storageKey) === "1") return;

  const overlay = document.createElement("section");
  overlay.className = "lexi-modal";
  overlay.id = "freeSubscriberWelcomeModal";
  overlay.innerHTML = `
    <div class="lexi-modal-backdrop" data-free-subscriber-welcome-close></div>
    <div class="lexi-modal-card" role="dialog" aria-modal="true" aria-labelledby="freeSubscriberWelcomeTitle">
      <div class="lexi-modal-head">
        <div>
          <p class="kicker">Welcome</p>
          <h2 id="freeSubscriberWelcomeTitle">Your lifetime free subscriber account is active</h2>
        </div>
        <button class="btn btn-ghost btn-small" type="button" data-free-subscriber-welcome-close>Close</button>
      </div>
      <p class="section-copy">
        This subscriber account has been approved for a complimentary lifetime free plan because it is linked to your promoter email address.
      </p>
      <button class="btn" type="button" data-free-subscriber-welcome-close>Continue</button>
    </div>
  `;
  const close = () => {
    localStorage.setItem(storageKey, "1");
    user.showFreeSubscriberWelcome = false;
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    overlay.remove();
  };
  overlay.querySelectorAll("[data-free-subscriber-welcome-close]").forEach((node) => node.addEventListener("click", close));
  document.body.appendChild(overlay);
}

maybeShowFreeSubscriberWelcomePopup();

const moduleUsageRuntime = createModuleUsageRuntime({
  getRole: () => user?.role
});
const dashboardSharedUtilsRuntime = createDashboardSharedUtilsRuntime();
const formatMoney = (...args) => dashboardSharedUtilsRuntime.formatMoney(...args);
const formatDateTime = (...args) => dashboardSharedUtilsRuntime.formatDateTime(...args);
const formatProviderLabel = (...args) => dashboardSharedUtilsRuntime.formatProviderLabel(...args);
const parseBookingDate = (...args) => dashboardSharedUtilsRuntime.parseBookingDate(...args);
const pad2 = (...args) => dashboardSharedUtilsRuntime.pad2(...args);
const toDateKey = (...args) => dashboardSharedUtilsRuntime.toDateKey(...args);
const todayDateKeyLocal = (...args) => dashboardSharedUtilsRuntime.todayDateKeyLocal(...args);
const writeToClipboard = (...args) => dashboardSharedUtilsRuntime.writeToClipboard(...args);
const initializeUiDensity = (...args) => dashboardPreferencesRuntime.initializeUiDensity(...args);
const dashboardBrandRole = document.getElementById("dashboardBrandRole");
const dashboardKicker = document.getElementById("dashboardKicker");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardDescription = document.getElementById("dashboardDescription");
const dashboardBusinessPill = document.getElementById("dashboardBusinessPill");
const dashActionStatus = document.getElementById("dashActionStatus");
const demoModeToggle = document.getElementById("demoModeToggle");
const subscriberDashboard = document.getElementById("subscriberDashboard");
const customerDashboard = document.getElementById("customerDashboard");
const adminDashboard = document.getElementById("adminDashboard");
const dashboardPreferencesRuntime = createDashboardPreferencesRuntime({
  dashActionStatus,
  demoModeToggle,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  currentRole,
  demoFillSessionKey: DASHBOARD_DEMO_FILL_SESSION_KEY,
  demoFillModeStorageKey: DASHBOARD_DEMO_FILL_MODE_STORAGE_KEY,
  getDashboardDemoFillModeEnabled: () => dashboardDemoFillModeEnabled,
  setDashboardDemoFillModeEnabled: (value) => {
    dashboardDemoFillModeEnabled = Boolean(value);
  },
  isMockMode,
  token,
  userRaw,
  getManagedBusinessId: () => managedBusinessId
});
const manageUiRuntime = createManageUiRuntime();
const {
  ensureManageToastStack,
  showManageToast,
  ensureManageModalOverlay,
  escapeHtml,
  openManageForm,
  openManageConfirm
} = manageUiRuntime;
const lexiPendingRemindersRuntime = createLexiPendingRemindersRuntime({
  getUserRole: () => user?.role,
  getBookingRows: () => bookingRows,
  isPendingConfirmationStatus: (status) => bookingsRuntime.isPendingConfirmationStatus(status),
  escapeHtml,
  showManageToast,
  getLexiPendingReminderTimerId: () => lexiPendingReminderTimerId,
  setLexiPendingReminderTimerId: (value) => {
    lexiPendingReminderTimerId = value ?? null;
  },
  getLexiPendingSnoozeUntil: () => lexiPendingSnoozeUntil,
  setLexiPendingSnoozeUntil: (value) => {
    lexiPendingSnoozeUntil = Number(value || 0);
  },
  getLexiPendingLastPopupSignature: () => lexiPendingLastPopupSignature,
  setLexiPendingLastPopupSignature: (value) => {
    lexiPendingLastPopupSignature = String(value || "");
  },
  getLexiPendingLastToastAt: () => lexiPendingLastToastAt,
  setLexiPendingLastToastAt: (value) => {
    lexiPendingLastToastAt = Number(value || 0);
  },
  setBookingStatusValue: (value) => {
    if (bookingStatus) bookingStatus.value = value;
  },
  setActiveStatusChip: (status) => bookingsRuntime.setActiveStatusChip(status),
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  bookingOperationsSection,
  bookingTools,
  bookingsList
});

const dashTitle = document.getElementById("dashTitle");
const dashUser = document.getElementById("dashUser");
const dashRoleHint = document.getElementById("dashRoleHint");
const dashboardOverviewSection = document.getElementById("dashboardOverviewSection");
const dashIdentityBlock = dashTitle?.parentElement || null;
const frontDeskSection = document.getElementById("frontDeskSection");
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
const businessHubIntro = document.getElementById("businessHubIntro");
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
const loadMoreBookingsBtn = document.getElementById("loadMoreBookings");
const bookingsCountLabel = document.getElementById("bookingsCountLabel");
const bookingCalendarGrid = document.getElementById("bookingCalendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarLegend = document.getElementById("calendarLegend");
const calendarViewTabs = document.getElementById("calendarViewTabs");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const subscriberExecutivePulseSection = document.getElementById("subscriberExecutivePulseSection");
const executivePulseSubtitle = document.getElementById("executivePulseSubtitle");
const executivePulseTitle = document.getElementById("executivePulseTitle");
const executivePulseSignals = document.getElementById("executivePulseSignals");
const executivePulseGauges = document.getElementById("executivePulseGauges");
const executivePulseBars = document.getElementById("executivePulseBars");
const executivePulseStorylineTitle = document.getElementById("executivePulseStorylineTitle");
const executivePulseActions = document.getElementById("executivePulseActions");
const executivePulseRangeTabs = document.getElementById("executivePulseRangeTabs");
const executivePulseAdminMetricTabs = document.getElementById("executivePulseAdminMetricTabs");
const executivePulseRangeMeta = document.getElementById("executivePulseRangeMeta");
const executivePulseSaveSnapshotBtn = document.getElementById("executivePulseSaveSnapshotBtn");
const executivePulseFinanceTitle = document.getElementById("executivePulseFinanceTitle");
const executivePulseFinanceWindowLabel = document.getElementById("executivePulseFinanceWindowLabel");
const executivePulseFinanceStats = document.getElementById("executivePulseFinanceStats");
const executivePulseRevenueChart = document.getElementById("executivePulseRevenueChart");
const executivePulseRevenueChartNote = document.getElementById("executivePulseRevenueChartNote");
const executivePulseProfitChart = document.getElementById("executivePulseProfitChart");
const executivePulseProfitChartNote = document.getElementById("executivePulseProfitChartNote");
const executivePulseActionsTitle = document.getElementById("executivePulseActionsTitle");
const executivePulseActionsSubtitle = document.getElementById("executivePulseActionsSubtitle");
const executivePulseSnapshotList = document.getElementById("executivePulseSnapshotList");
const executivePulseSnapshotsTitle = document.getElementById("executivePulseSnapshotsTitle");
const executivePulseSnapshotsSubtitle = document.getElementById("executivePulseSnapshotsSubtitle");
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
const adminPlatformSection = document.getElementById("adminDashboard");
const adminPlatformMetricGrid = document.getElementById("adminPlatformMetricGrid");
const adminRevenueSummaryGrid = document.getElementById("adminRevenueSummaryGrid");
const adminRevenueMixChart = document.getElementById("adminRevenueMixChart");
const adminRevenueHealthGauge = document.getElementById("adminRevenueHealthGauge");
const adminRevenueYieldGauge = document.getElementById("adminRevenueYieldGauge");
const adminRevenueTrendGraph = document.getElementById("adminRevenueTrendGraph");
const adminRevenueMonthlyList = document.getElementById("adminRevenueMonthlyList");
const adminRevenueSignalList = document.getElementById("adminRevenueSignalList");
const adminRevenuePeriodPill = document.getElementById("adminRevenuePeriodPill");
const adminRevenueNote = document.getElementById("adminRevenueNote");
const adminPlatformExportBtn = document.getElementById("adminPlatformExportBtn");
const subscriberBusinessHubGrid = document.getElementById("subscriberBusinessHubGrid");
const adminBusinessHubGrid = document.getElementById("adminBusinessHubGrid");
const adminAccountSearchForm = document.getElementById("adminAccountSearchForm");
const adminAccountSearchInput = document.getElementById("adminAccountSearchInput");
const adminAccountsTable = document.getElementById("adminAccountsTable");
const adminAccountDetail = document.getElementById("adminAccountDetail");
const adminAccountEditForm = document.getElementById("adminAccountEditForm");
const adminEditName = document.getElementById("adminEditName");
const adminEditEmail = document.getElementById("adminEditEmail");
const adminEditBusinessName = document.getElementById("adminEditBusinessName");
const adminAccountEditMessage = document.getElementById("adminAccountEditMessage");
const adminAccountSupportSection = adminAccountSearchForm?.closest(".dashboard-card") || adminAccountsTable?.closest(".dashboard-card") || null;
const accountingBookingExportBtn = document.getElementById("accountingBookingExportBtn");
const accountingPlatformExportBtn = document.getElementById("accountingPlatformExportBtn");
let bookingRows = [];
let nextBookingsCursor = null;
let adminPlatformAnalytics = null;
let adminRevenueAnalytics = null;
let adminAccountSupportResultsCache = [];
let adminAccountSupportSelectedId = "";
let adminAccountSupportSearchTimerId = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let calendarTodayRefreshTimerId = null;
let bookingDateFilterLabel = "All dates";
let bookingDateFilterKeys = null;
let bookingDateFilterPreset = "";
let selectedCalendarDateKey = "";
let executivePulseRange = "day";
let executivePulseAdminMetricView = "bookings";
let latestExecutivePulseSnapshotDraft = null;
let accountingRows = [];
let accountingLivePayload = null;
let accountingLiveTimerId = null;
let accountingLiveTimeframe = "today";
let accountingLiveRangeFrom = "";
let accountingLiveRangeTo = "";
let accountingLiveQuickFilter = "";
let subscriberCommandCenter = null;
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
let merchImageUploadData = "";
let revenueAttributionPayload = null;
let profitabilityPayload = null;
let managedBusinessId = "";
let adminBusinessOptions = [];
let lexiPendingReminderTimerId = null;
let lexiPendingSnoozeUntil = 0;
let lexiPendingLastPopupSignature = "";
let lexiPendingLastToastAt = 0;
let activeModuleKey = "";
let closeModulePopupActive = null;
let billingSummary = null;
let dashboardDemoFillModeEnabled = false;
let manageModeEnabled = false;
let inlineEditObserver = null;
let inlineEditApplyTimerId = null;
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
const merchSection = document.getElementById("merchSection");
const merchSummaryCards = document.getElementById("merchSummaryCards");
const merchForm = document.getElementById("merchForm");
const merchNameInput = document.getElementById("merchNameInput");
const merchPriceInput = document.getElementById("merchPriceInput");
const merchInventoryInput = document.getElementById("merchInventoryInput");
const merchImageUrlInput = document.getElementById("merchImageUrlInput");
const merchImageFileInput = document.getElementById("merchImageFileInput");
const merchDescriptionInput = document.getElementById("merchDescriptionInput");
const merchShippingInput = document.getElementById("merchShippingInput");
const merchShippingCostInput = document.getElementById("merchShippingCostInput");
const merchList = document.getElementById("merchList");
const merchStatusNote = document.getElementById("merchStatusNote");
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
const calendarDayUtilsRuntime = createCalendarDayUtilsRuntime({
  parseServiceEditorText,
  getBusinessProfileServicesValue: () => businessProfileServices?.value,
  formatMoney,
  normalizeText: (value) => bookingsRuntime.normalizeText(value)
});
const commandCenterRuntime = createCommandCenterRuntime({
  getUserRole: () => user?.role,
  formatMoney,
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  setActiveStatusChip: (status) => bookingsRuntime.setActiveStatusChip(status),
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse(),
  commandCenterStatus,
  bookingTools,
  bookingsList,
  bookingStatus,
  bookingSort,
  waitlistSection,
  subscriberCommandCenterSection,
  commandCenterCards,
  commandCenterActions,
  getSubscriberCommandCenter: () => subscriberCommandCenter
});
const businessProfileRuntime = createBusinessProfileRuntime({
  canManageBusinessModules,
  withManagedBusiness,
  headers,
  renderBusinessGrowthPanel: () => businessGrowthPanelRuntime.renderBusinessGrowthPanel(),
  setDashActionStatus,
  showManageToast,
  escapeHtml,
  socialMediaForm,
  facebookInput,
  instagramInput,
  twitterInput,
  linkedinInput,
  tiktokInput,
  customSocialInput,
  socialImageInput,
  socialMediaPreview,
  businessProfileOpenSetup,
  businessProfileSetupOverlay,
  businessProfileSetupClose,
  businessProfileSetupCancel,
  businessProfileForm,
  businessProfileStatus,
  businessProfileName,
  businessProfileType,
  businessProfilePhone,
  businessProfileEmail,
  businessProfileCity,
  businessProfileCountry,
  businessProfilePostcode,
  businessProfileAddress,
  businessProfileDescription,
  businessProfileWebsiteUrl,
  businessProfileWebsiteTitle,
  businessProfileWebsiteSummary,
  businessProfileWebsiteImageUrl,
  businessHoursMonday,
  businessHoursTuesday,
  businessHoursWednesday,
  businessHoursThursday,
  businessHoursFriday,
  businessHoursSaturday,
  businessHoursSunday,
  businessProfileServices,
  businessProfileApplyTemplate
});
const manageSocialActionsRuntime = createManageSocialActionsRuntime({
  openManageForm,
  openManageConfirm,
  showManageToast,
  collectSocialMediaPayloadFromInputs: () => businessProfileRuntime.collectSocialMediaPayloadFromInputs(),
  saveSocialMediaLinks: (payload) => businessProfileRuntime.saveSocialMediaLinks(payload)
});
const loadSocialMediaLinks = (...args) => businessProfileRuntime.loadSocialMediaLinks(...args);
const parseServiceEditorText = (...args) => businessProfileRuntime.parseServiceEditorText(...args);
const setManagedBusinessIdValue = (value) => {
  managedBusinessId = String(value || "").trim();
};
const loadAdminBusinessOptionsForCurrentRole = () => adminBusinessLoadingRuntime.loadAdminBusinessOptions();
const reloadAdminManagedDashboardForCurrentRole = () => adminBusinessLoadingRuntime.reloadAdminManagedDashboard();
const setAdminBusinessStatusMessage = (message, isError = false) => {
  adminBusinessRuntime.setAdminBusinessStatus(message, isError);
};
const loadAdminPlatformOverviewForCurrentRole = () => adminPlatformRuntime.loadAdminPlatformOverview();

businessProfileRuntime.bindBusinessProfileEvents();
const dashboardRoleChromeRuntime = createDashboardRoleChromeRuntime({
  getCurrentRole: () => currentRole,
  getUser: () => user,
  getAdminBusinessParam: () => adminBusinessParam,
  setManagedBusinessId: setManagedBusinessIdValue,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  dashboardBrandRole,
  dashboardKicker,
  dashboardTitle,
  dashboardDescription,
  dashboardBusinessPill,
  dashTitle,
  dashUser,
  dashRoleHint,
  dashActionStatus,
  dashIdentityBlock,
  dashboardOverviewSection
});

dashboardRoleChromeRuntime.initializeDashboardRoleChrome();

const dashboardRequestUtilsRuntime = createDashboardRequestUtilsRuntime({
  getToken: () => token,
  getUserRole: () => user?.role,
  getAuthRole: () => authRole,
  getPreviewCustomerEmail: () => previewCustomerEmailParam,
  getManagedBusinessId: () => managedBusinessId
});
const headers = (...args) => dashboardRequestUtilsRuntime.headers(...args);
const withManagedBusiness = (...args) => dashboardRequestUtilsRuntime.withManagedBusiness(...args);
const withCustomerPreview = (...args) => dashboardRequestUtilsRuntime.withCustomerPreview(...args);
const canManageBusinessModules = (...args) => dashboardRequestUtilsRuntime.canManageBusinessModules(...args);

const dashboardStatusUtilsRuntime = createDashboardStatusUtilsRuntime({
  getUserRole: () => user?.role,
  getBookingRows: () => bookingRows,
  accountingStatusNote,
  accountingLiveNote
});
const formatDateShort = (...args) => dashboardStatusUtilsRuntime.formatDateShort(...args);
const shouldRenderTopMetricsGrid = (...args) => dashboardStatusUtilsRuntime.shouldRenderTopMetricsGrid(...args);
const setAccountingStatus = (...args) => dashboardStatusUtilsRuntime.setAccountingStatus(...args);
const setAccountingLiveNote = (...args) => dashboardStatusUtilsRuntime.setAccountingLiveNote(...args);
const setDashActionStatus = (...args) => dashboardPreferencesRuntime.setDashActionStatus(...args);
const isDashboardDemoDataModeActive = (...args) => dashboardPreferencesRuntime.isDashboardDemoDataModeActive(...args);
const loadBookings = (...args) => bookingsRuntime.loadBookings(...args);
const loadMetrics = (...args) => bookingsRuntime.loadMetrics(...args);
const isDashboardManagerRole = (...args) => dashboardManageModeRuntime.isDashboardManagerRole(...args);
const getManageModeEnabled = (...args) => manageModeEnabled;
const isManageModeEnabled = (...args) => manageModeEnabled;
const setStaffStatus = (...args) => staffRotaWeekRuntime.setStaffStatus(...args);
const setWaitlistStatus = (...args) => operationsRuntime.setWaitlistStatus(...args);
const setCrmStatus = (...args) => operationsRuntime.setCrmStatus(...args);
const renderCrmSegments = (...args) => operationsRuntime.renderCrmSegments(...args);
const sendCrmCampaign = (...args) => operationsRuntime.sendCrmCampaign(...args);
const upsertWaitlistEntry = (...args) => operationsRuntime.upsertWaitlistEntry(...args);

const openCalendarDiaryWalkIn = (...args) => calendarDiaryRuntime.openCalendarDiaryWalkIn(...args);
const openDashboardSharedLexiPopup = (role = "subscriber", options = {}) => {
  window.openDashboardSharedLexiPopup?.({
    ...options,
    role: String(role || "subscriber").trim().toLowerCase()
  });
};
const submitDashboardSharedLexiPrompt = () => {
  window.submitDashboardSharedLexiPrompt?.();
};
const resetDashboardSharedLexiPopup = (initialMessage = "") => {
  window.resetDashboardSharedLexiPopup?.(initialMessage);
};

dashboardDemoFillModeEnabled = dashboardPreferencesRuntime.loadDashboardDemoFillPreference();
dashboardPreferencesRuntime.refreshDemoModeToggle();
if (isDashboardDemoDataModeActive()) {
  setDashActionStatus("Demo mode is on. Data is simulated so you can explore and edit safely.", false, 0);
}

const adminBusinessRuntime = createAdminBusinessRuntime({
  getUserRole: () => user?.role,
  getManagedBusinessId: () => managedBusinessId,
  setManagedBusinessId: setManagedBusinessIdValue,
  getAdminBusinessOptions: () => adminBusinessOptions,
  normalizeText: (value) => bookingsRuntime.normalizeText(value)
});
const adminBusinessLoadingRuntime = createAdminBusinessLoadingRuntime({
  getUserRole: () => user?.role,
  headers,
  getAdminBusinessParam: () => adminBusinessParam,
  getManagedBusinessId: () => managedBusinessId,
  setManagedBusinessId: setManagedBusinessIdValue,
  getAdminBusinessOptions: () => adminBusinessOptions,
  setAdminBusinessOptions: (value) => {
    adminBusinessOptions = Array.isArray(value) ? value : [];
  },
  setAdminBusinessStatus: setAdminBusinessStatusMessage,
  renderAdminBusinessSelect: (options = adminBusinessOptions, { syncState = true } = {}) => {
    adminBusinessRuntime.renderAdminBusinessSelect(options, { syncState });
  },
  renderAdminManagedBusinessSummary: () => {
    adminBusinessRuntime.renderAdminManagedBusinessSummary();
  },
  filteredAdminBusinessOptions: () => adminBusinessRuntime.filteredAdminBusinessOptions(),
  syncAdminBusinessQueryParam: () => dashboardRoutingUiSupportRuntime.syncAdminBusinessQueryParam(),
  shouldRenderTopMetricsGrid,
  metricsGrid,
  resetBookingsCursor: () => {
    nextBookingsCursor = null;
  },
  updateLoadMoreState: (isLoading = false) => bookingsRuntime.updateLoadMoreState(isLoading),
  loadMetrics,
  loadBookings,
  loadBillingSummary,
  loadBusinessProfile,
  loadSocialMediaLinks,
  loadAccountingIntegrations,
  loadStaffRoster: () => staffRosterRuntime.loadStaffRoster(),
  loadWaitlist,
  loadCrmSegments,
  loadCommercialControls,
  loadRevenueAttribution,
  loadProfitabilitySummary
});

const adminPlatformRuntime = createAdminPlatformRuntime({
  getUserRole: () => user?.role,
  headers,
  escapeHtml,
  formatMoney,
  setDashActionStatus,
  renderAdminManagedBusinessSummary: () => {
    adminBusinessRuntime.renderAdminManagedBusinessSummary();
  },
  parseExportFileName: (disposition, fallback = "accounting_export.csv") => adminSupportRuntime.parseExportFileName(disposition, fallback),
  adminPlatformMetricGrid,
  adminRevenueSummaryGrid,
  adminRevenueMixChart,
  adminRevenueHealthGauge,
  adminRevenueYieldGauge,
  adminRevenueTrendGraph,
  adminRevenueMonthlyList,
  adminRevenueSignalList,
  adminRevenuePeriodPill,
  adminRevenueNote,
  adminPlatformExportBtn,
  getAdminPlatformAnalytics: () => adminPlatformAnalytics,
  setAdminPlatformAnalytics: (value) => {
    adminPlatformAnalytics = value ?? null;
  },
  getAdminRevenueAnalytics: () => adminRevenueAnalytics,
  setAdminRevenueAnalytics: (value) => {
    adminRevenueAnalytics = value ?? null;
  }
});

const adminSupportRuntime = createAdminSupportRuntime({
  getUserRole: () => user?.role,
  headers,
  escapeHtml,
  formatDateShort,
  formatMoney,
  openManageForm,
  loadAdminBusinessOptions: loadAdminBusinessOptionsForCurrentRole,
  reloadAdminManagedDashboard: reloadAdminManagedDashboardForCurrentRole,
  setDashActionStatus,
  syncAdminBusinessQueryParam: () => dashboardRoutingUiSupportRuntime.syncAdminBusinessQueryParam(),
  openInteractiveModulePopup,
  canManageBusinessModules,
  setAccountingStatus,
  getManagedBusinessId: () => managedBusinessId,
  setManagedBusinessId: setManagedBusinessIdValue,
  adminAccountSearchForm,
  adminAccountSearchInput,
  adminAccountsTable,
  adminAccountDetail,
  adminAccountEditForm,
  adminEditName,
  adminEditEmail,
  adminEditBusinessName,
  adminAccountEditMessage,
  accountingBookingExportBtn,
  accountingPlatformExportBtn,
  withManagedBusiness,
  getAdminAccountSupportResultsCache: () => adminAccountSupportResultsCache,
  setAdminAccountSupportResultsCache: (value) => {
    adminAccountSupportResultsCache = Array.isArray(value) ? value : [];
  },
  getAdminAccountSupportSelectedId: () => adminAccountSupportSelectedId,
  setAdminAccountSupportSelectedId: (value) => {
    adminAccountSupportSelectedId = String(value || "").trim();
  },
  getAdminAccountSupportSearchTimerId: () => adminAccountSupportSearchTimerId,
  setAdminAccountSupportSearchTimerId: (value) => {
    adminAccountSupportSearchTimerId = value ?? null;
  }
});
const businessReportingRuntime = createBusinessReportingRuntime({
  getUserRole: () => user?.role,
  getUserEmail: () => user?.email,
  getUserName: () => user?.name,
  getUserBusinessId: () => user?.businessId,
  getManagedBusinessId: () => managedBusinessId,
  headers,
  withManagedBusiness,
  formatMoney,
  escapeHtml,
  todayDateKeyLocal,
  parseBookingDate,
  toDateKey,
  getBookingRows: () => bookingRows,
  getStaffWorkingForDate: (dateObj) => staffDateUtilsRuntime.getStaffWorkingForDate(dateObj),
  getAccountingRows: () => accountingRows,
  getWaitlistRows: () => waitlistRows,
  getOperationsInsights: () => operationsInsights,
  getBusinessProfileServicesValue: () => businessProfileServices?.value,
  getBusinessProfileNameValue: () => businessProfileName?.value,
  getBusinessProfileEmailValue: () => businessProfileEmail?.value,
  getBusinessProfilePhoneValue: () => businessProfilePhone?.value,
  getBusinessProfileCityValue: () => businessProfileCity?.value,
  getBusinessProfileCountryValue: () => businessProfileCountry?.value,
  getStaffRosterRows: () => staffRosterRows,
  isDashboardDemoDataModeActive,
  openManageForm,
  setDashActionStatus,
  showManageToast,
  hubCommandSignalGrid,
  hubReportStatusPill,
  hubPrintReportBtn,
  hubEmailReportBtn,
  hubReportHighlights,
  hubReportStatusText,
  hubPriorityList,
  hubAutoRoutines,
  hubRunPrioritySweepBtn,
  localStorageKey: HUB_AUTOROUTINES_STORAGE_KEY
});
const businessGrowthPanelRuntime = createBusinessGrowthPanelRuntime({
  getUserRole: () => user?.role,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  formatDateShort,
  formatMoney,
  escapeHtml,
  businessGrowthSection,
  businessHubIntro,
  billingLiveBanner,
  billingLiveMeta,
  yearlySavingsLine,
  onboardingSummaryList,
  onboardingQuickActionsList,
  onboardingStatusList,
  onboardingChecklist,
  first7DaysGrid,
  getBillingSummary: () => billingSummary,
  getBusinessProfileName: () => businessProfileName,
  getBusinessProfilePhone: () => businessProfilePhone,
  getBusinessProfileEmail: () => businessProfileEmail,
  getBusinessProfileServices: () => businessProfileServices,
  getBusinessHoursInputs: () => [businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday],
  getSocialInputs: () => [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput],
  getAccountingRows: () => accountingRows,
  getBookingRows: () => bookingRows,
  getStaffRosterRows: () => staffRosterRows,
  getWaitlistRows: () => waitlistRows
});

const bookingsRuntime = createBookingsRuntime({
  getUserRole: () => user?.role,
  getManagedBusinessId: () => managedBusinessId,
  getPreviewCustomerEmail: () => previewCustomerEmailParam,
  headers,
  withManagedBusiness,
  withCustomerPreview,
  escapeHtml,
  parseBookingDate,
  toDateKey,
  openManageForm,
  openManageConfirm,
  setDashActionStatus,
  showManageToast,
  syncLexiPendingReminders: () => lexiPendingRemindersRuntime.syncLexiPendingReminders(),
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  renderBusinessGrowthPanel: () => businessGrowthPanelRuntime.renderBusinessGrowthPanel(),
  renderCommandCenter: () => commandCenterRuntime.renderCommandCenter(),
  renderOperationsInsights,
  stageWaitlistRecoveryFromBooking,
  shouldRenderTopMetricsGrid,
  isDashboardManagerRole,
  isManageModeEnabled,
  isDashboardDemoDataModeActive,
  addMetric: (label, value) => dashboardRoutingUiSupportRuntime.addMetric(label, value),
  bookingsList,
  bookingSearch,
  bookingStatus,
  bookingSort,
  statusChips,
  bookingPendingBanner,
  loadMoreBookingsBtn,
  bookingsCountLabel,
  metricsGrid,
  getBookingRows: () => bookingRows,
  setBookingRows: (value) => {
    bookingRows = Array.isArray(value) ? value : [];
  },
  getNextBookingsCursor: () => nextBookingsCursor,
  setNextBookingsCursor: (value) => {
    nextBookingsCursor = value ?? null;
  },
  getBookingDateFilterKeys: () => bookingDateFilterKeys,
  getBookingDateFilterLabel: () => bookingDateFilterLabel,
  getSubscriberCommandCenter: () => subscriberCommandCenter,
  setSubscriberCommandCenter: (value) => {
    subscriberCommandCenter = value ?? null;
  },
  getOperationsInsights: () => operationsInsights,
  setOperationsInsights: (value) => {
    operationsInsights = value ?? null;
  }
});

const dashboardRoutingUiSupportRuntime = createDashboardRoutingUiSupportRuntime({
  getUserRole: () => user?.role,
  getManagedBusinessId: () => managedBusinessId,
  metricsGrid,
  getAdminAccountSupportResultsCache: () => adminAccountSupportResultsCache,
  loadAdminAccountSupport: (query = adminAccountSearchInput?.value || "") => adminSupportRuntime.loadAdminAccountSupport(query),
  setDashActionStatus,
  renderAdminAccountSupportModule: () => adminSupportRuntime.renderAdminAccountSupportModule(),
  renderOperationsInsights,
  renderCrmSegments,
  renderCommercialControls,
  renderRevenueAttribution,
  renderProfitabilitySummary
});

const moduleRoutingRuntime = createModuleRoutingRuntime({
  getRole: () => user?.role
});

const enforceDashboardRoleLayoutVisibility = () => {
  applyDashboardRoleLayoutVisibility({
    role: user.role,
    hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
    showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
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
  });
};

const contactAdminRuntime = createContactAdminRuntime({
  contactAdminMessagesStorageKey: CONTACT_ADMIN_MESSAGES_STORAGE_KEY,
  getUser: () => user,
  getUserRole: () => user?.role,
  getCloseModulePopupActive: () => closeModulePopupActive,
  setCloseModulePopupActive: (value) => {
    closeModulePopupActive = value ?? null;
  },
  ensureManageModalOverlay,
  setDashActionStatus,
  showManageToast
});

const moduleDefinitionsRuntime = createModuleDefinitionsRuntime({
  getUserRole: () => user?.role,
  subscriberExecutivePulseSection,
  subscriberSubscriptionSection,
  frontDeskSection,
  subscriberCommandCenterSection,
  businessGrowthSection,
  first7DaysSnapshotSection,
  businessProfileSection,
  bookingOperationsSection,
  accountingIntegrationsSection,
  staffRosterSection,
  waitlistSection,
  operationsInsightsSection,
  crmSection,
  commercialSection,
  merchSection,
  revenueAttributionSection,
  profitabilitySection,
  socialMediaSection
});

const moduleGroupingRuntime = createModuleGroupingRuntime({
  getModulesForRole: () => moduleDefinitionsRuntime.moduleDefinitionsForRole(),
  getRole: () => user?.role
});

const moduleCatalogRuntime = createModuleCatalogRuntime({
  getModules: () => moduleDefinitionsRuntime.moduleDefinitionsForRole()
});
const moduleDefinitionByKey = (...args) => moduleCatalogRuntime.moduleDefinitionByKey(...args);
const moduleUsesInteractivePopup = (...args) => moduleCatalogRuntime.moduleUsesInteractivePopup(...args);
const moduleUsesInfoPopup = (...args) => moduleCatalogRuntime.moduleUsesInfoPopup(...args);

const adminHubRuntime = createAdminHubRuntime({
  getUserRole: () => user?.role,
  escapeHtml,
  getBusinessHubModules: () => getBusinessHubModulesForRole({
    role: "admin",
    moduleDefinitionByKey
  })
});
if (currentRole === "admin") {
  adminHubRuntime.renderAdminBusinessHub(adminBusinessHubGrid);
}

const moduleStatusRuntime = createModuleStatusRuntime({
  escapeHtml,
  getBusinessProfileName: () => businessProfileName?.value,
  getBusinessProfileServices: () => businessProfileServices?.value,
  getSocialInputs: () => [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput],
  getBookingRows: () => bookingRows,
  getAccountingRows: () => accountingRows,
  getAdminAccountSupportResults: () => adminAccountSupportResultsCache,
  getStaffRosterRows: () => staffRosterRows,
  getWaitlistRows: () => waitlistRows,
  getCommercialPayload: () => commercialPayload,
  getRevenueAttributionPayload: () => revenueAttributionPayload,
  getProfitabilityPayload: () => profitabilityPayload
});

const modulePopupSupportRuntime = createModulePopupSupportRuntime({
  escapeHtml,
  moduleBusinessJobProfile: (mod) => getModuleBusinessJobProfile(mod),
  moduleOperationalStatus: (mod) => moduleStatusRuntime.moduleOperationalStatus(mod),
  moduleUsageSummary: (mod) => moduleUsageRuntime.moduleUsageSummary(mod),
  getModulePopupSnapshotItems,
  getPopupSnapshotContext: () => ({
    userRole: user.role,
    businessProfileServicesValue: businessProfileServices?.value,
    socialInputs: [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput],
    bookingRows,
    calendarCurrentMonth,
    adminAccountSupportResultsCache,
    adminAccountSupportSelectedAccount: () => adminSupportRuntime.adminAccountSupportSelectedAccount(),
    metricsGrid,
    billingSummary,
    subscriptionCurrentPlanLabelText: subscriptionCurrentPlanLabel?.textContent,
    formatDateShort,
    formatMoney,
    commandCenterCards,
    commandCenterActions,
    commandCenterStatus,
    businessProfileNameValue: businessProfileName?.value,
    businessHours: [
      businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday
    ],
    bookingDateFilterLabel,
    calendarMonthLabelText: calendarMonthLabel?.textContent,
    selectedCalendarDateKey,
    accountingRows,
    accountingLivePayload,
    accountingLiveTimeframe,
    staffRosterRows,
    staffSummary,
    waitlistRows,
    waitlistSummary,
    operationsInsights,
    crmSegmentsPayload,
    commercialPayload,
    revenueAttributionPayload,
    profitabilityPayload
  })
});

const moduleLexiBriefRuntime = createModuleLexiBriefRuntime({
  modulePopupSnapshotItems: (mod) => modulePopupSupportRuntime.modulePopupSnapshotItems(mod),
  moduleLexiNarrativeProfile: (mod, blueprint, snapshots = []) => getModuleLexiNarrativeProfile(mod, blueprint, snapshots),
  moduleOpsCategoryLabel: (mod) => getModuleOpsCategoryLabel(mod),
  loadHubAutoRoutinePrefs: () => businessReportingRuntime.loadHubAutoRoutinePrefs()
});
const moduleLexiPanelRuntime = createModuleLexiPanelRuntime({
  getUserRole: () => user?.role,
  buildModuleLexiBriefModel: (mod, blueprint) => moduleLexiBriefRuntime.buildModuleLexiBriefModel(mod, blueprint),
  moduleOperatorBlueprint: (mod) => getModuleOperatorBlueprint(mod, user?.role),
  escapeHtml
});
const moduleActionRuntime = createModuleActionRuntime({
  getUserRole: () => user?.role,
  moduleOperatorBlueprint: (mod) => getModuleOperatorBlueprint(mod, user?.role),
  moduleLexiAssistQuestion: (mod, blueprint) => moduleLexiBriefRuntime.moduleLexiAssistQuestion(mod, blueprint),
  openBusinessAiChatPopup: openDashboardSharedLexiPopup,
  resetCopilotChat: (_role, initialMessage = "") => resetDashboardSharedLexiPopup(initialMessage),
  setDashActionStatus,
  setWorkspaceBackButtonVisible: (isVisible) => moduleNavigationRuntime.setWorkspaceBackButtonVisible(isVisible),
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey),
  writeToClipboard,
  showManageToast
});
const openCloseChecklistRuntime = createOpenCloseChecklistRuntime({
  storageKey: OPEN_CLOSE_CHECKLIST_STORAGE_KEY,
  todayDateKeyLocal,
  parseBookingDate,
  toDateKey,
  getStaffWorkingForDate,
  getBookingRows: () => bookingRows,
  getOperationsInsights: () => operationsInsights,
  getAccountingRows: () => accountingRows,
  getWaitlistRows: () => waitlistRows,
  escapeHtml,
  showManageToast,
  setDashActionStatus,
  openModuleInfoModal: (moduleKey) => modulePopupRuntime.openModuleInfoModal(moduleKey)
});
const moduleWorkboardRuntime = createModuleWorkboardRuntime({
  getUserRole: () => user?.role,
  escapeHtml,
  loadHubAutoRoutinePrefs: () => businessReportingRuntime.loadHubAutoRoutinePrefs()
});
const modulePopupRuntime = createModulePopupRuntime({
  moduleDefinitionByKey,
  markModuleUsed: (moduleKey, mode = "open") => moduleUsageRuntime.markModuleUsed(moduleKey, mode),
  ensureManageModalOverlay,
  getCloseModulePopupActive: () => closeModulePopupActive,
  setCloseModulePopupActive: (value) => {
    closeModulePopupActive = value;
  },
  escapeHtml,
  modulePopupSnapshotItems: (mod) => modulePopupSupportRuntime.modulePopupSnapshotItems(mod),
  isPinnedBusinessModule: (mod) => moduleRoutingRuntime.isPinnedBusinessModule(mod),
  getActiveModuleKey: () => activeModuleKey,
  getUserRole: () => user?.role,
  moduleOperationalStatus: (mod) => moduleStatusRuntime.moduleOperationalStatus(mod),
  moduleOperatorBlueprint: (mod) => getModuleOperatorBlueprint(mod, user?.role),
  renderOpeningClosingChecklistPanel: (mod) => openCloseChecklistRuntime.renderOpeningClosingChecklistPanel(mod),
  renderModuleWorkboardPanel: (mod, blueprint) => moduleWorkboardRuntime.renderModuleWorkboardPanel(mod, blueprint),
  renderModuleLexiBriefPanel: (mod, blueprint, options = {}) => moduleLexiPanelRuntime.renderModuleLexiBriefPanel(mod, blueprint, options),
  renderModulePurposeStrip: (mod) => modulePopupSupportRuntime.renderModulePurposeStrip(mod),
  openLexiModuleAssist: (mod, options = {}) => moduleActionRuntime.openLexiModuleAssist(mod, options),
  runModuleOperatorAction: (actionId, mod, options = {}) =>
    moduleActionRuntime.runModuleOperatorAction(actionId, mod, options),
  setDashActionStatus,
  openBusinessAiChatPopup: openDashboardSharedLexiPopup,
  loadHubAutoRoutinePrefs: () => businessReportingRuntime.loadHubAutoRoutinePrefs(),
  saveHubAutoRoutinePrefs: (value) => businessReportingRuntime.saveHubAutoRoutinePrefs(value),
  showManageToast,
  bindOpeningClosingChecklistPanel: (shell, mod) => openCloseChecklistRuntime.bindOpeningClosingChecklistPanel(shell, mod),
  setWorkspaceBackButtonVisible: (isVisible) => moduleNavigationRuntime.setWorkspaceBackButtonVisible(isVisible),
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey),
  returnToDashboardHomeView: () => moduleNavigationRuntime.returnToDashboardHomeView(),
  isPopupOnlyBusinessModuleKey: (moduleKey) => moduleRoutingRuntime.isPopupOnlyBusinessModuleKey(moduleKey),
  renderPopupOnlyBusinessModule: (moduleKey) => dashboardRoutingUiSupportRuntime.renderPopupOnlyBusinessModule(moduleKey)
});
if (subscriberBusinessHubGrid) {
  adminHubRuntime.bindBusinessHubGrid(
    subscriberBusinessHubGrid,
    getBusinessHubModulesForRole({
      role: "subscriber",
      moduleDefinitionByKey
    })
  );
}
const moduleNavigationRuntime = createModuleNavigationRuntime({
  getUserRole: () => user?.role,
  getActiveModuleKey: () => activeModuleKey,
  setActiveModuleKey: (value) => {
    activeModuleKey = String(value || "").trim();
  },
  groupedModulesForCurrentRole: () => moduleGroupingRuntime.groupedModulesForCurrentRole(),
  markModuleUsed: (moduleKey, mode = "focus") => moduleUsageRuntime.markModuleUsed(moduleKey, mode),
  isPopupOnlyBusinessModuleKey: (moduleKey) => moduleRoutingRuntime.isPopupOnlyBusinessModuleKey(moduleKey),
  openInteractiveModulePopup,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  isPinnedBusinessModule: (mod) => moduleRoutingRuntime.isPinnedBusinessModule(mod),
  renderModuleNavigator,
  workspaceBackToDashboardBtn,
  getManageModeEnabled,
  showManageToast,
  getManagedBusinessId: () => managedBusinessId,
  getUserBusinessId: () => user?.businessId,
  openManageForm,
  createBooking: (payload) => bookingsRuntime.createBooking(payload),
  refreshBookingsAfterDayPopupMutation: () => calendarDayWorkspaceRuntime.refreshBookingsAfterDayPopupMutation(),
  todayDateKeyLocal
});
const moduleClickRouterRuntime = createModuleClickRouterRuntime({
  returnToDashboardHomeView,
  moduleDefinitionByKey,
  moduleUsesInteractivePopup,
  moduleUsesInfoPopup,
  openInteractiveModulePopup: (moduleKey) => modulePopupRuntime.openInteractiveModulePopup(moduleKey),
  openModuleInfoModal: (moduleKey) => modulePopupRuntime.openModuleInfoModal(moduleKey),
  setWorkspaceBackButtonVisible: (isVisible) => moduleNavigationRuntime.setWorkspaceBackButtonVisible(isVisible),
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey)
});
const dashboardStartupRuntime = createDashboardStartupRuntime({
  getUserRole: () => user?.role,
  accountingLiveTimeframe,
  initializeUiDensity,
  initializeManageMode: () => dashboardManageModeRuntime.initializeManageMode(),
  setupManagedSectionActions: () => managedSectionActionsRuntime.setupManagedSectionActions(),
  setAccountingTimeframe,
  startAccountingLiveStream,
  enforceDashboardRoleLayoutVisibility,
  initializeModuleNavigator: () => moduleNavigationRuntime.initializeModuleNavigator(),
  bindModuleClickRouter: () => moduleClickRouterRuntime.bindModuleClickRouter(),
  bindManageDispatcher: () => manageDispatcherRuntime.bindManageDispatcher(),
  bindCalendarPulseEvents: () => calendarPulseRuntime.bindCalendarPulseEvents(),
  updateBookingRangeControls: () => bookingFilterRuntime.updateBookingRangeControls(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  scheduleCalendarTodayRefresh: () => calendarDiaryRuntime.scheduleCalendarTodayRefresh(),
  bindCalendarLexiEvents: () => {},
  bindAccountingIntegrationEvents: () => accountingIntegrationsRuntime.bindAccountingIntegrationEvents(),
  bindStaffRosterControlsEvents: () => staffRosterControlsRuntime.bindStaffRosterControlsEvents(),
  loadAdminBusinessOptions: loadAdminBusinessOptionsForCurrentRole,
  loadAdminPlatformOverview: loadAdminPlatformOverviewForCurrentRole,
  setAdminBusinessStatus: setAdminBusinessStatusMessage,
  loadMetrics,
  shouldRenderTopMetricsGrid,
  metricsGrid,
  setDashActionStatus,
  loadBookings,
  bookingsList
});
const bookingFilterRuntime = createBookingFilterRuntime({
  bookingRangeToday,
  bookingRangeWeek,
  bookingRangeMonth,
  bookingRangeClear,
  bookingCalendarSelectionStatus,
  getBookingDateFilterPreset: () => bookingDateFilterPreset,
  getSelectedCalendarDateKey: () => selectedCalendarDateKey,
  getBookingDateFilterKeys: () => bookingDateFilterKeys,
  getBookingDateFilterLabel: () => bookingDateFilterLabel,
  setBookingDateFilterState: ({ keys, label, preset, selectedDateKey }) => {
    bookingDateFilterKeys = keys;
    bookingDateFilterLabel = label;
    bookingDateFilterPreset = preset;
    selectedCalendarDateKey = selectedDateKey;
  },
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  toDateKey
});
const executivePulseUtilsRuntime = createExecutivePulseUtilsRuntime({
  getFrontDeskBusiness: () => (typeof frontDeskBusiness !== "undefined" ? frontDeskBusiness : null),
  getManagedBusinessId: () => managedBusinessId,
  getIsMockMode: () => isMockMode,
  getUserRole: () => user?.role,
  snapshotsStorageKey: EXECUTIVE_PULSE_SNAPSHOTS_STORAGE_KEY,
  getBookingRows: () => bookingRows,
  parseBookingDate,
  getBusinessHoursInputs: () => ({
    monday: businessHoursMonday,
    tuesday: businessHoursTuesday,
    wednesday: businessHoursWednesday,
    thursday: businessHoursThursday,
    friday: businessHoursFriday,
    saturday: businessHoursSaturday,
    sunday: businessHoursSunday
  }),
  parseTimeToMinutes: (value) => calendarDayUtilsRuntime.parseTimeToMinutes(value),
  formatMinutesToTime: (totalMinutes) => calendarDayUtilsRuntime.formatMinutesToTime(totalMinutes),
  toDateKey,
  pad2
});
const calendarPulseRuntime = createCalendarPulseRuntime({
  fetchImpl: fetch,
  getUserRole: () => user?.role,
  getUserBusinessId: () => user?.businessId,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  escapeHtml,
  formatMoney,
  formatDateTime,
  parseBookingDate,
  toDateKey,
  todayDateKeyLocal,
  isPendingConfirmationStatus: (status) => bookingsRuntime.isPendingConfirmationStatus(status),
  getExecutivePulseRangeConfig: (range = "day") => executivePulseUtilsRuntime.getExecutivePulseRangeConfig(range),
  getExecutiveRowRevenueEstimate: (row) => executivePulseUtilsRuntime.getExecutiveRowRevenueEstimate(row),
  getExecutivePulseBuckets: (rows, rangeConfig, profitMarginPct) =>
    executivePulseUtilsRuntime.getExecutivePulseBuckets(rows, rangeConfig, profitMarginPct),
  getBookingRows: () => bookingRows,
  getSelectedCalendarDateKey: () => selectedCalendarDateKey,
  getManagedBusinessId: () => managedBusinessId,
  getAdminPlatformAnalytics: () => adminPlatformAnalytics,
  getAdminRevenueAnalytics: () => adminRevenueAnalytics,
  getProfitabilityPayload: () => profitabilityPayload,
  computeSubscriberMerchAnalytics: () => merchAnalyticsRuntime.computeSubscriberMerchAnalytics(),
  getCalendarMonth: () => calendarMonth,
  setCalendarMonth: (value) => {
    calendarMonth = value instanceof Date ? value : new Date();
  },
  getExecutivePulseRange: () => executivePulseRange,
  setExecutivePulseRange: (value) => {
    executivePulseRange = String(value || "day").trim().toLowerCase();
  },
  getExecutivePulseAdminMetricView: () => executivePulseAdminMetricView,
  setExecutivePulseAdminMetricView: (value) => {
    executivePulseAdminMetricView = String(value || "bookings").trim().toLowerCase();
  },
  getLatestExecutivePulseSnapshotDraft: () => latestExecutivePulseSnapshotDraft,
  setLatestExecutivePulseSnapshotDraft: (value) => {
    latestExecutivePulseSnapshotDraft = value ?? null;
  },
  getStaffWorkingForDate: (dateObj) => staffDateUtilsRuntime.getStaffWorkingForDate(dateObj),
  getStaffInitials: getStaffRosterInitials,
  updateBookingRangeControls: () => bookingFilterRuntime.updateBookingRangeControls(),
  renderWorkspaceStarPanel: () => workspaceStarRuntime.renderWorkspaceStarPanel(),
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  focusBookingOperations: () => commandCenterRuntime.focusBookingOperations(),
  openCalendarDayWorkspace: (dateKey) => calendarDayWorkspaceRuntime.openCalendarDayWorkspace(dateKey),
  setBookingDateFilter: (options = {}) => bookingFilterRuntime.setBookingDateFilter(options),
  jumpToCalendarDate: (dateKey, options = {}) => calendarDiaryRuntime.jumpToCalendarDate(dateKey, options),
  openCalendarDiaryWalkIn,
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey),
  applyBookingDatePreset: (preset) => bookingFilterRuntime.applyBookingDatePreset(preset),
  readExecutivePulseSnapshots: () => executivePulseUtilsRuntime.readExecutivePulseSnapshots(),
  writeExecutivePulseSnapshots: (rows) => executivePulseUtilsRuntime.writeExecutivePulseSnapshots(rows),
  refreshBookingsAfterDayPopupMutation: () => calendarDayWorkspaceRuntime.refreshBookingsAfterDayPopupMutation(),
  openManageForm,
  headers: () => dashboardRequestUtilsRuntime.headers(),
  withManagedBusiness: (path) => dashboardRequestUtilsRuntime.withManagedBusiness(path),
  showToast,
  showManageToast,
  subscriberExecutivePulseSection,
  bookingCalendarGrid,
  calendarMonthLabel,
  calendarLegend,
  calendarPrev,
  calendarNext,
  bookingRangeToday,
  bookingRangeWeek,
  bookingRangeMonth,
  bookingRangeClear,
  bookingSearch,
  calendarViewTabs,
  executivePulseSubtitle,
  executivePulseTitle,
  executivePulseSignals,
  executivePulseGauges,
  executivePulseBars,
  executivePulseStorylineTitle,
  executivePulseActions,
  executivePulseRangeTabs,
  executivePulseAdminMetricTabs,
  executivePulseRangeMeta,
  executivePulseSaveSnapshotBtn,
  executivePulseFinanceTitle,
  executivePulseFinanceWindowLabel,
  executivePulseFinanceStats,
  executivePulseRevenueChart,
  executivePulseRevenueChartNote,
  executivePulseProfitChart,
  executivePulseProfitChartNote,
  executivePulseActionsTitle,
  executivePulseActionsSubtitle,
  executivePulseSnapshotList,
  executivePulseSnapshotsTitle,
  executivePulseSnapshotsSubtitle
});
const calendarDiaryRuntime = createCalendarDiaryRuntime({
  getUserRole: () => user?.role,
  getManageModeEnabled,
  getManagedBusinessId: () => managedBusinessId,
  getUserBusinessId: () => user?.businessId,
  getSelectedCalendarDateKey: () => selectedCalendarDateKey,
  getBookingRows: () => bookingRows,
  getStaffRosterRows: () => staffRosterRows,
  getCalendarMonth: () => calendarMonth,
  setCalendarMonth: (value) => {
    calendarMonth = value instanceof Date ? value : new Date();
  },
  getCalendarTodayRefreshTimerId: () => calendarTodayRefreshTimerId,
  setCalendarTodayRefreshTimerId: (value) => {
    calendarTodayRefreshTimerId = value ?? null;
  },
  getBusinessProfileServicesValue: () => businessProfileServices?.value,
  parseDateKeyToDate: (dateKey) => calendarDayUtilsRuntime.parseDateKeyToDate(dateKey),
  parseBookingDate,
  parseServiceEditorText,
  toDateKey,
  formatMoney,
  escapeHtml,
  getStaffWorkingForDate: (dateObj) => staffDateUtilsRuntime.getStaffWorkingForDate(dateObj),
  getStaffMemberId,
  summarizeCalendarDaySchedule: (rows = []) => calendarDayUtilsRuntime.summarizeCalendarDaySchedule(rows),
  setBookingDateFilter: (options = {}) => bookingFilterRuntime.setBookingDateFilter(options),
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  openCalendarDayWorkspace: (dateKey) => calendarDayWorkspaceRuntime.openCalendarDayWorkspace(dateKey),
  openManageForm,
  createBooking: (payload) => bookingsRuntime.createBooking(payload),
  refreshBookingsAfterDayPopupMutation: () => calendarDayWorkspaceRuntime.refreshBookingsAfterDayPopupMutation(),
  showManageToast,
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey)
});
const workspaceStarRuntime = createWorkspaceStarRuntime({
  getUserRole: () => user?.role,
  getBookingRows: () => bookingRows,
  getSelectedCalendarDateKey: () => selectedCalendarDateKey,
  toDateKey,
  formatMoney,
  isPendingConfirmationStatus: (status) => bookingsRuntime.isPendingConfirmationStatus(status),
  openBusinessAiChatPopup: openDashboardSharedLexiPopup,
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey),
  workspaceStarPanel,
  workspaceStarSummary,
  workspaceStarAskLexiBtn,
  workspaceStarOpenCalendarBtn,
  workspaceStarCalendarFocus,
  workspaceStarCalendarNote,
  workspaceStarTodayCount,
  workspaceStarTodayRevenue,
  workspaceStarLexiPrompt,
  workspaceStarLexiHint,
  calendarMonthLabel,
  subscriberLexiQuickOpenButtons
});
const calendarDayWorkspaceRuntime = createCalendarDayWorkspaceRuntime({
  ensureManageModalOverlay,
  getCloseModulePopupActive: () => closeModulePopupActive,
  setCloseModulePopupActive: (value) => {
    closeModulePopupActive = value;
  },
  isDashboardDemoDataModeActive,
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse(),
  shouldRenderTopMetricsGrid: () => dashboardStatusUtilsRuntime.shouldRenderTopMetricsGrid(),
  metricsGrid,
  loadBookings,
  loadMetrics,
  getUserRole: () => user?.role,
  isDashboardManagerRole,
  getManageModeEnabled,
  getManagedBusinessId: () => managedBusinessId,
  getUserBusinessId: () => user?.businessId,
  getBookingsForDateKey: (dateKey) => calendarDiaryRuntime.getBookingsForDateKey(dateKey),
  normalizeText: (value) => bookingsRuntime.normalizeText(value),
  summarizeCalendarDaySchedule: (rows = []) => calendarDayUtilsRuntime.summarizeCalendarDaySchedule(rows),
  summarizeCalendarDayRevenue: (rows = []) => calendarDayUtilsRuntime.summarizeCalendarDayRevenue(rows),
  statusChipClass: (status) => calendarDayUtilsRuntime.statusChipClass(status),
  formatDateTime,
  escapeHtml,
  formatMinutesToTime: (totalMinutes) => calendarDayUtilsRuntime.formatMinutesToTime(totalMinutes),
  formatMoney: (value) => dashboardSharedUtilsRuntime.formatMoney(value),
  formatCalendarDayTitle: (dateKey) => calendarDayUtilsRuntime.formatCalendarDayTitle(dateKey),
  getSelectedCalendarDateKey: () => selectedCalendarDateKey,
  returnToDashboardHomeView: () => moduleNavigationRuntime.returnToDashboardHomeView(),
  focusModuleByKey: (moduleKey) => moduleNavigationRuntime.focusModuleByKey(moduleKey),
  setWaitlistStatus,
  stageWaitlistRecoveryFromBooking: (sourceBooking, options = {}) =>
    operationsRuntime.stageWaitlistRecoveryFromBooking(sourceBooking, options),
  showManageToast,
  setBookingDateFilter: (options = {}) => bookingFilterRuntime.setBookingDateFilter(options),
  openBusinessAiChatPopup: openDashboardSharedLexiPopup,
  requestLexiSubmit: submitDashboardSharedLexiPrompt,
  openManageForm,
  createBooking: (payload) => bookingsRuntime.createBooking(payload),
  rescheduleBooking: (bookingId) => bookingsRuntime.rescheduleBooking(bookingId),
  openManageConfirm,
  cancelBooking: (bookingId) => bookingsRuntime.cancelBooking(bookingId)
});
const billingControlsRuntime = createBillingControlsRuntime({
  getUserRole: () => user?.role,
  isDashboardDemoDataModeActive,
  setDashActionStatus,
  createCheckout,
  createPortal,
  openBillingCheckoutForProvider,
  openContactAdminModal: () => contactAdminRuntime.openContactAdminModal(),
  startBilling,
  manageBilling,
  connectStripeBillingBtn,
  connectPayPalBillingBtn,
  contactAdminBtn
});
const subscriberBillingRuntime = createSubscriberBillingRuntime({
  getUserRole: () => user?.role,
  withManagedBusiness,
  headers,
  formatDateShort,
  getBillingSummary: () => billingSummary,
  setBillingSummary: (value) => {
    billingSummary = value || null;
  },
  subscriptionBillingCycle,
  subscriptionBillingProvider,
  subscriptionCurrentPlanLabel,
  subscriptionCurrentPlanMeta,
  subscriptionPaymentConnectNote,
  subscriptionAutoRenewToggle,
  startBilling,
  autoRenewStorageKey: SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY,
  navigateToUrl: (url) => {
    if (url) window.location.href = url;
  }
});
const accountingLiveControlsRuntime = createAccountingLiveControlsRuntime({
  setAccountingTimeframe: (nextTimeframe, options = {}) => accountingLiveRuntime.setAccountingTimeframe(nextTimeframe, options),
  setQuickFilterVisualState: (key) => accountingLiveRuntime.setQuickFilterVisualState(key),
  setAccountingLiveRange: (from, to, options = {}) => accountingLiveRuntime.setAccountingLiveRange(from, to, options),
  setAccountingLiveNote,
  getThisWeekRange: () => accountingLiveRuntime.getThisWeekRange(),
  getThisMonthRange: () => accountingLiveRuntime.getThisMonthRange(),
  accountingTimeframeSwitch,
  accountingQfWeek,
  accountingQfMonth,
  accountingCustomApply,
  accountingCustomFrom,
  accountingCustomTo
});
const accountSessionControlsRuntime = createAccountSessionControlsRuntime({
  authTokenKey: AUTH_TOKEN_KEY,
  authUserKey: AUTH_USER_KEY,
  subscriptionAutoRenewPrefStorageKey: SUBSCRIPTION_AUTORENEW_PREF_STORAGE_KEY,
  setDashActionStatus,
  logoutBtn,
  subscriptionAutoRenewToggle
});
accountSessionControlsRuntime.bindAccountSessionControlsEvents();
const dashboardSessionControlsRuntime = createDashboardSessionControlsRuntime({
  isDashboardManagerRole,
  getManageModeEnabled,
  setManageMode: (enabled) => dashboardManageModeRuntime.setManageMode(enabled),
  showManageToast,
  setDashActionStatus,
  getAccountingLiveTimerId: () => accountingLiveTimerId,
  setAccountingLiveTimerId: (value) => {
    accountingLiveTimerId = value ?? null;
  },
  manageModeToggle,
  demoModeToggle
});
const operationsRuntime = createOperationsRuntime({
  canManageBusinessModules,
  isPopupMountedBusinessSection: (sectionEl) => moduleRoutingRuntime.isPopupMountedBusinessSection(sectionEl),
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  withManagedBusiness,
  headers,
  parseWaitlistDateTimeInput,
  buildWaitlistRecoveryDateTime,
  normalizeText: (value) => bookingsRuntime.normalizeText(value),
  focusModuleByKey,
  isDashboardManagerRole,
  getManageModeEnabled,
  openManageForm,
  openManageConfirm,
  showManageToast,
  writeToClipboard,
  getBookingRows: () => bookingRows,
  getWaitlistRows: () => waitlistRows,
  setWaitlistRows: (value) => {
    waitlistRows = Array.isArray(value) ? value : [];
  },
  getWaitlistSummary: () => waitlistSummary,
  setWaitlistSummary: (value) => {
    waitlistSummary = value || null;
  },
  getOperationsInsights: () => operationsInsights,
  getCrmSegmentsPayload: () => crmSegmentsPayload,
  setCrmSegmentsPayload: (value) => {
    crmSegmentsPayload = value || null;
  },
  waitlistStatusNote,
  operationsStatusNote,
  crmStatusNote,
  waitlistSection,
  operationsInsightsSection,
  crmSection,
  waitlistSummaryCards,
  waitlistList,
  noShowRiskList,
  rebookingPromptList,
  crmSegmentsList,
  waitlistForm,
  waitlistNameInput,
  waitlistPhoneInput,
  waitlistEmailInput,
  waitlistServiceInput,
  waitlistDateInput
});
const manageCrmActionsRuntime = createManageCrmActionsRuntime({
  openManageForm,
  openManageConfirm,
  showManageToast,
  getCrmSegmentsPayload: () => crmSegmentsPayload,
  setCrmSegmentsPayload: (value) => {
    crmSegmentsPayload = value || null;
  },
  setCrmStatus,
  renderCrmSegments,
  sendCrmCampaign
});
const accountingIntegrationsRuntime = createAccountingIntegrationsRuntime({
  canManageBusinessModules,
  withManagedBusiness,
  headers,
  formatProviderLabel,
  formatDateTime,
  renderAccountingLiveRevenue: ({ silent = false } = {}) => accountingLiveRuntime.loadAccountingLiveRevenue({ silent }),
  renderBusinessGrowthPanel: () => businessGrowthPanelRuntime.renderBusinessGrowthPanel(),
  setAccountingStatus,
  getAccountingRows: () => accountingRows,
  setAccountingRows: (value) => {
    accountingRows = Array.isArray(value) ? value : [];
  },
  accountingIntegrationsList,
  accountingConnectForm,
  accountingProvider,
  accountingAccountLabel,
  accountingSyncMode
});
const manageAccountingActionsRuntime = createManageAccountingActionsRuntime({
  openManageForm,
  openManageConfirm,
  showManageToast,
  getAccountingRows: () => accountingRows,
  setAccountingStatus,
  formatProviderLabel,
  connectAccountingIntegration: (provider, accountLabel, syncMode) =>
    accountingIntegrationsRuntime.connectAccountingIntegration(provider, accountLabel, syncMode),
  disconnectAccountingIntegration: (provider) => accountingIntegrationsRuntime.disconnectAccountingIntegration(provider),
  accountingProvider,
  accountingAccountLabel,
  accountingSyncMode
});
const manageRevenueProfitabilityActionsRuntime = createManageRevenueProfitabilityActionsRuntime({
  openManageForm,
  openManageConfirm,
  showManageToast,
  saveRevenueChannelSpend: (payload) => businessControlsRuntime.saveRevenueChannelSpend(payload),
  setRevenueStatus: (message, isError = false) => businessControlsRuntime.setRevenueStatus(message, isError),
  upsertPayrollInput: (payload) => businessControlsRuntime.upsertPayrollInput(payload),
  upsertProfitabilityCosts: (payload) => businessControlsRuntime.upsertProfitabilityCosts(payload),
  setProfitabilityStatus: (message, isError = false) => businessControlsRuntime.setProfitabilityStatus(message, isError),
  profitRentInput,
  profitUtilitiesInput,
  profitSoftwareInput,
  profitOtherInput,
  profitCogsPercentInput
});
const manageCommercialActionsRuntime = createManageCommercialActionsRuntime({
  openManageForm,
  openManageConfirm,
  showManageToast,
  getCommercialPayload: () => commercialPayload,
  setCommercialStatus: (message, isError = false) => businessControlsRuntime.setCommercialStatus(message, isError),
  setMerchStatus: (message, isError = false) => businessControlsRuntime.setMerchStatus(message, isError),
  upsertMembership: (payload) => businessControlsRuntime.upsertMembership(payload),
  upsertPackage: (payload) => businessControlsRuntime.upsertPackage(payload),
  issueGiftCard: (payload) => businessControlsRuntime.issueGiftCard(payload),
  upsertMerchItem: (payload) => businessControlsRuntime.upsertMerchItem(payload),
  createMerchShipment: (merchId, payload) => businessControlsRuntime.createMerchShipment(merchId, payload),
  focusModuleByKey,
  merchNameInput
});
const manageWaitlistActionsRuntime = createManageWaitlistActionsRuntime({
  openManageForm,
  showManageToast,
  upsertWaitlistEntry,
  setWaitlistStatus
});
const manageCoreActionsRuntime = createManageCoreActionsRuntime({
  openManageForm,
  showManageToast,
  getManagedBusinessId: () => managedBusinessId,
  getUserBusinessId: () => user?.businessId,
  getUserRole: () => user?.role,
  createBooking: (payload) => bookingsRuntime.createBooking(payload),
  loadBookings,
  shouldRenderTopMetricsGrid,
  clearMetricsGrid: () => {
    if (metricsGrid) metricsGrid.innerHTML = "";
  },
  loadMetrics,
  upsertStaffMember: (payload) => staffRosterRuntime.upsertStaffMember(payload),
  setStaffStatus
});
const manageDispatcherRuntime = createManageDispatcherRuntime({
  getManageModeEnabled,
  isDashboardManagerRole,
  manageHandlers: [
    (target) => manageSocialActionsRuntime.handleManageSocialClick(target),
    (target) => manageCrmActionsRuntime.handleManageCrmClick(target),
    (target) => manageAccountingActionsRuntime.handleManageAccountingClick(target),
    (target) => manageRevenueProfitabilityActionsRuntime.handleManageRevenueProfitabilityClick(target),
    (target) => manageCommercialActionsRuntime.handleManageCommercialClick(target),
    (target) => manageWaitlistActionsRuntime.handleManageWaitlistClick(target),
    (target) => manageCoreActionsRuntime.handleManageCoreClick(target)
  ]
});
const managedSectionActionsRuntime = createManagedSectionActionsRuntime({
  isDashboardManagerRole,
  bookingOperationsSection,
  staffRosterSection,
  waitlistSection,
  socialMediaSection,
  crmSection,
  commercialSection,
  merchSection,
  accountingIntegrationsSection,
  revenueAttributionSection,
  profitabilitySection
});
const businessControlsRuntime = createBusinessControlsRuntime({
  canManageBusinessModules,
  isPopupMountedBusinessSection: (sectionEl) => moduleRoutingRuntime.isPopupMountedBusinessSection(sectionEl),
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  showSection: (sectionEl) => dashboardRoutingUiSupportRuntime.showSection(sectionEl),
  withManagedBusiness,
  headers,
  formatMoney,
  escapeHtml,
  formatDateTime,
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse(),
  getUserRole: () => user?.role,
  getCommercialPayload: () => commercialPayload,
  setCommercialPayload: (value) => {
    commercialPayload = value || null;
  },
  getRevenueAttributionPayload: () => revenueAttributionPayload,
  setRevenueAttributionPayload: (value) => {
    revenueAttributionPayload = value || null;
  },
  getProfitabilityPayload: () => profitabilityPayload,
  setProfitabilityPayload: (value) => {
    profitabilityPayload = value || null;
  },
  commercialSection,
  commercialSummaryCards,
  membershipList,
  packageList,
  giftCardList,
  merchSection,
  merchSummaryCards,
  merchList,
  revenueAttributionSection,
  revenueSummaryCards,
  revenueChannelList,
  profitabilitySection,
  profitSummaryCards,
  profitPayrollList,
  profitRentInput,
  profitUtilitiesInput,
  profitSoftwareInput,
  profitOtherInput,
  profitCogsPercentInput,
  commercialStatusNote,
  merchStatusNote,
  revenueStatusNote,
  profitStatusNote
});
const merchAnalyticsRuntime = createMerchAnalyticsRuntime({
  getCommercialPayload: () => commercialPayload
});
const businessControlsEventsRuntime = createBusinessControlsEventsRuntime({
  getManageModeEnabled,
  isDashboardManagerRole,
  openManageForm,
  openManageConfirm,
  showManageToast,
  upsertMembership: (payload) => businessControlsRuntime.upsertMembership(payload),
  upsertPackage: (payload) => businessControlsRuntime.upsertPackage(payload),
  issueGiftCard: (payload) => businessControlsRuntime.issueGiftCard(payload),
  redeemGiftCard: (giftCardId, amount) => businessControlsRuntime.redeemGiftCard(giftCardId, amount),
  upsertMerchItem: (payload) => businessControlsRuntime.upsertMerchItem(payload),
  saveRevenueChannelSpend: (payload) => businessControlsRuntime.saveRevenueChannelSpend(payload),
  upsertPayrollInput: (payload) => businessControlsRuntime.upsertPayrollInput(payload),
  removePayrollInput: (entryId) => businessControlsRuntime.removePayrollInput(entryId),
  upsertProfitabilityCosts: (payload) => businessControlsRuntime.upsertProfitabilityCosts(payload),
  setCommercialStatus: (message, isError = false) => businessControlsRuntime.setCommercialStatus(message, isError),
  setMerchStatus: (message, isError = false) => businessControlsRuntime.setMerchStatus(message, isError),
  setRevenueStatus: (message, isError = false) => businessControlsRuntime.setRevenueStatus(message, isError),
  setProfitabilityStatus: (message, isError = false) => businessControlsRuntime.setProfitabilityStatus(message, isError),
  getProfitabilityPayload: () => profitabilityPayload,
  membershipForm,
  membershipNameInput,
  membershipPriceInput,
  membershipCycleInput,
  membershipBenefitsInput,
  packageForm,
  packageNameInput,
  packagePriceInput,
  packageSessionsInput,
  giftCardForm,
  giftPurchaserInput,
  giftRecipientInput,
  giftBalanceInput,
  giftExpiresInput,
  merchImageFileInput,
  merchForm,
  merchNameInput,
  merchPriceInput,
  merchInventoryInput,
  merchImageUrlInput,
  merchDescriptionInput,
  merchShippingInput,
  merchShippingCostInput,
  getMerchImageUploadData: () => merchImageUploadData,
  setMerchImageUploadData: (value) => {
    merchImageUploadData = String(value || "");
  },
  giftCardList,
  revenueSpendForm,
  revenueChannelInput,
  revenueSpendInput,
  profitPayrollForm,
  profitStaffNameInput,
  profitStaffRoleInput,
  profitStaffHoursInput,
  profitStaffRateInput,
  profitStaffBonusInput,
  profitPayrollList,
  profitCostsForm,
  profitRentInput,
  profitUtilitiesInput,
  profitSoftwareInput,
  profitOtherInput,
  profitCogsPercentInput
});
const accountingLiveRuntime = createAccountingLiveRuntime({
  getUserRole: () => user?.role,
  isDashboardManagerRole,
  isDashboardDemoDataModeActive,
  canManageBusinessModules,
  withManagedBusiness,
  headers,
  formatMoney,
  escapeHtml,
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse(),
  setAccountingStatus,
  setAccountingLiveNote,
  accountingLivePanel,
  accountingLiveCards,
  accountingLiveGauges,
  accountingLiveRevenueBars,
  accountingLiveCancelBars,
  accountingTfToday,
  accountingTf7d,
  accountingTf30d,
  accountingQfWeek,
  accountingQfMonth,
  accountingCustomFrom,
  accountingCustomTo,
  getAccountingLiveTimeframe: () => accountingLiveTimeframe,
  setAccountingLiveTimeframe: (value) => {
    accountingLiveTimeframe = String(value || "").trim() || "today";
  },
  getAccountingLiveQuickFilter: () => accountingLiveQuickFilter,
  setAccountingLiveQuickFilter: (value) => {
    accountingLiveQuickFilter = String(value || "").trim();
  },
  getAccountingLiveRangeFrom: () => accountingLiveRangeFrom,
  setAccountingLiveRangeFrom: (value) => {
    accountingLiveRangeFrom = String(value || "").trim();
  },
  getAccountingLiveRangeTo: () => accountingLiveRangeTo,
  setAccountingLiveRangeTo: (value) => {
    accountingLiveRangeTo = String(value || "").trim();
  },
  getAccountingLivePayload: () => accountingLivePayload,
  setAccountingLivePayload: (value) => {
    accountingLivePayload = value || null;
  },
  getAccountingLiveTimerId: () => accountingLiveTimerId,
  setAccountingLiveTimerId: (value) => {
    accountingLiveTimerId = value || null;
  }
});
const staffRotaWeekRuntime = createStaffRotaWeekRuntime({
  STAFF_ROTA_OVERRIDES_STORAGE_KEY,
  STAFF_ROTA_DAYS,
  staffStatusNote,
  getStaffRotaWeekOffset: () => staffRotaWeekOffset,
  getStaffRotaOverrides: () => staffRotaOverrides,
  setStaffRotaOverrides: (value) => {
    staffRotaOverrides = value && typeof value === "object" ? value : {};
  },
  getStaffRotaOverridesLoaded: () => staffRotaOverridesLoaded,
  setStaffRotaOverridesLoaded: (value) => {
    staffRotaOverridesLoaded = Boolean(value);
  },
  getStaffRotaWeekLoading: () => staffRotaWeekLoading,
  setStaffRotaWeekLoading: (value) => {
    staffRotaWeekLoading = Boolean(value);
  },
  isDashboardDemoDataModeActive,
  withManagedBusiness,
  headers,
  normalizeStaffCellStatus: normalizeStaffRotaCellStatus,
  normalizeStaffShiftType: normalizeStaffRotaShiftType,
  getStaffWeekOverridesBucket: (createIfMissing = false) => staffRotaCoreRuntime.getStaffWeekOverridesBucket(createIfMissing),
  clearStaffWeekOverrides: () => staffRotaCoreRuntime.clearStaffWeekOverrides()
});
const staffRotaCoreRuntime = createStaffRotaCoreRuntime({
  STAFF_ROTA_DAYS,
  getStaffRotaOverrides: () => staffRotaOverrides,
  setStaffRotaOverrides: (value) => {
    staffRotaOverrides = value && typeof value === "object" ? value : {};
  },
  getStaffRotaOverridesLoaded: () => staffRotaOverridesLoaded,
  loadStaffRotaOverrides: () => staffRotaWeekRuntime.loadStaffRotaOverrides(),
  saveStaffRotaOverrides: () => staffRotaWeekRuntime.saveStaffRotaOverrides(),
  getStaffWeekKey: () => staffRotaWeekRuntime.getStaffWeekKey(),
  getStaffWeekMeta: () => staffRotaWeekRuntime.getStaffWeekMeta(),
  getStaffRosterRows: () => staffRosterRows,
  setStaffRosterRows: (value) => {
    staffRosterRows = Array.isArray(value) ? value : [];
  },
  setStaffSummary: (value) => {
    staffSummary = value || null;
  },
  setStaffRotaOverridesLoaded: (value) => {
    staffRotaOverridesLoaded = Boolean(value);
  },
  getStaffRotaSelectedMemberId: () => staffRotaSelectedMemberId,
  setStaffRotaSelectedMemberId: (value) => {
    staffRotaSelectedMemberId = String(value || "").trim();
  },
  normalizeStaffCellStatus: normalizeStaffRotaCellStatus,
  normalizeStaffShiftType: normalizeStaffRotaShiftType,
  getStaffRoleLabel,
  getStaffShiftLabel: getStaffRotaShiftLabel,
  renderStaffSummary: () => staffRosterRuntime.renderStaffSummary(),
  renderStaffRoster: () => staffRosterRuntime.renderStaffRoster(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  setStaffStatus,
  showManageToast,
  persistStaffRotaBulk: ({ updates = [], sicknessLogs = [] } = {}) =>
    staffRotaWeekRuntime.persistStaffRotaBulk({ updates, sicknessLogs }),
  openManageForm
});
const staffRotaUiRuntime = createStaffRotaUiRuntime({
  STAFF_ROTA_DAYS,
  roleLabel: getStaffRoleLabel,
  normalizeStaffCellStatus: normalizeStaffRotaCellStatus,
  normalizeStaffShiftType: normalizeStaffRotaShiftType,
  openManageForm,
  openManageConfirm,
  showManageToast,
  isDashboardManagerRole,
  getManageModeEnabled,
  loadStaffRotaWeek: ({ silent = false } = {}) => staffRotaWeekRuntime.loadStaffRotaWeek({ silent }),
  renderStaffSummary: () => staffRosterRuntime.renderStaffSummary(),
  renderStaffRoster: () => staffRosterRuntime.renderStaffRoster(),
  buildStaffRotaSnapshot: () => staffRotaCoreRuntime.buildStaffRotaSnapshot(),
  getCurrentRotaBrush: () =>
    staffRotaCoreRuntime.getCurrentRotaBrush({
      staffBrushStatusSelect,
      staffBrushShiftSelect
    }),
  setStaffDayState: (memberId, dayKey, { status, shift } = {}) =>
    staffRotaCoreRuntime.setStaffDayState(memberId, dayKey, { status, shift }),
  applyStaffRotaUpdates: (updates = [], { sicknessLogs = [], silent = false } = {}) =>
    staffRotaCoreRuntime.applyStaffRotaUpdates(updates, { sicknessLogs, silent }),
  applyAutoCoverForWeek: ({ onlyDays = null, forMemberId = "", silent = false } = {}) =>
    staffRotaCoreRuntime.applyAutoCoverForWeek({ onlyDays, forMemberId, silent }),
  loadStaffDemoRotaPreview: () => staffRotaCoreRuntime.loadStaffRotaPreview(),
  resetStaffRotaWeekRemote: () => staffRotaWeekRuntime.resetStaffRotaWeekRemote(),
  setStaffStatus,
  getStaffRotaSelectedMemberId: () => staffRotaSelectedMemberId,
  setStaffRotaSelectedMemberId: (value) => {
    staffRotaSelectedMemberId = String(value || "").trim();
  },
  getStaffRotaWeekOffset: () => staffRotaWeekOffset,
  setStaffRotaWeekOffset: (value) => {
    staffRotaWeekOffset = Number(value || 0);
  },
  getStaffRotaDragPaint: () => staffRotaDragPaint,
  setStaffRotaDragPaint: (value) => {
    staffRotaDragPaint = value && typeof value === "object" ? value : { active: false, seen: new Set(), updates: new Map() };
  },
  promptStaffSickReport: (staffId) => staffRotaCoreRuntime.promptStaffSickReport(staffId),
  getStaffRosterRows: () => staffRosterRows,
  upsertStaffMember: (payload) => staffRosterRuntime.upsertStaffMember(payload),
  updateStaffAvailability: (staffId, availability) => staffRosterRuntime.updateStaffAvailability(staffId, availability),
  removeStaffMember: (staffId) => staffRosterRuntime.removeStaffMember(staffId),
  getStaffMemberId: (member) => staffRotaCoreRuntime.getStaffMemberId(member),
  staffWeekPrevBtn,
  staffWeekTodayBtn,
  staffWeekNextBtn,
  staffAutoCoverBtn,
  staffLoadDemoRotaBtn,
  staffClearWeekOverridesBtn,
  staffRotaGrid,
  staffRosterList
});
const staffRosterControlsRuntime = createStaffRosterControlsRuntime({
  parseShiftDaysInput: (raw) => parseStaffShiftDaysInput(raw),
  setStaffStatus,
  upsertStaffMember: (payload) => staffRosterRuntime.upsertStaffMember(payload),
  staffRosterForm,
  staffNameInput,
  staffRoleInput,
  staffAvailabilityInput,
  staffShiftDaysInput
});
const staffRosterRuntime = createStaffRosterRuntime({
  canManageBusinessModules,
  withManagedBusiness,
  headers,
  escapeHtml,
  formatStaffWeekRange: () => staffRotaWeekRuntime.formatStaffWeekRange(),
  getManageModeEnabled,
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  buildStaffRotaSnapshot: () => staffRotaCoreRuntime.buildStaffRotaSnapshot(),
  getStaffColorForId: (staffId) => staffRotaCoreRuntime.getStaffColorForId(staffId),
  roleLabel: getStaffRoleLabel,
  getStaffStatusLabel: getStaffRotaStatusLabel,
  getStaffShiftLabel: getStaffRotaShiftLabel,
  getStaffInitials: getStaffRosterInitials,
  normalizeIncomingRotaWeek: (payload) => staffRotaWeekRuntime.normalizeIncomingRotaWeek(payload),
  saveStaffRotaOverrides: () => staffRotaWeekRuntime.saveStaffRotaOverrides(),
  getStaffMemberId: (member) => staffRotaCoreRuntime.getStaffMemberId(member),
  pruneStaffRotaOverridesForCurrentRoster: () => staffRotaCoreRuntime.pruneStaffRotaOverridesForCurrentRoster(),
  getStaffWeekKey: () => staffRotaWeekRuntime.getStaffWeekKey(),
  getStaffRotaSelectedMemberId: () => staffRotaSelectedMemberId,
  setStaffRotaSelectedMemberId: (value) => {
    staffRotaSelectedMemberId = String(value || "").trim();
  },
  getStaffRotaOverrides: () => staffRotaOverrides,
  setStaffRotaOverrides: (value) => {
    staffRotaOverrides = value && typeof value === "object" ? value : {};
  },
  setStaffRotaOverridesLoaded: (value) => {
    staffRotaOverridesLoaded = Boolean(value);
  },
  getStaffSummaryCards: () => staffSummaryCards,
  getStaffRosterList: () => staffRosterList,
  getStaffWeekLabel: () => staffWeekLabel,
  getStaffRotaHint: () => staffRotaHint,
  getStaffRotaGrid: () => staffRotaGrid,
  getStaffCoverageStrip: () => staffCoverageStrip,
  getStaffCoverageAlerts: () => staffCoverageAlerts,
  getStaffColorLegend: () => staffColorLegend,
  getStaffRosterRows: () => staffRosterRows,
  setStaffRosterRows: (value) => {
    staffRosterRows = Array.isArray(value) ? value : [];
  },
  setStaffSummary: (value) => {
    staffSummary = value || null;
  }
});
const staffDateUtilsRuntime = createStaffDateUtilsRuntime({
  staffRotaDays: STAFF_ROTA_DAYS,
  formatDateKey: formatStaffDateKey,
  getStaffRotaOverridesLoaded: () => staffRotaOverridesLoaded,
  loadStaffRotaOverrides: () => staffRotaWeekRuntime.loadStaffRotaOverrides(),
  getStaffRotaOverrides: () => staffRotaOverrides,
  getStaffRosterRows: () => staffRosterRows,
  getStaffMemberId: (member) => staffRotaCoreRuntime.getStaffMemberId(member),
  normalizeStaffCellStatus: normalizeStaffRotaCellStatus,
  getBaseStaffDayStatus: (member, dayKey) => staffRotaCoreRuntime.getBaseStaffDayStatus(member, dayKey),
  getStaffColorForId: (staffId) => staffRotaCoreRuntime.getStaffColorForId(staffId)
});

const dashboardManageModeRuntime = createDashboardManageModeRuntime({
  manageModeStorageKey: MANAGE_MODE_STORAGE_KEY,
  getUserRole: () => user?.role,
  getManageModeEnabled,
  setManageModeEnabled: (value) => {
    manageModeEnabled = Boolean(value);
  },
  manageModeToggle,
  hideSection: (sectionEl) => dashboardRoutingUiSupportRuntime.hideSection(sectionEl),
  renderStaffSummary: () => staffRosterRuntime.renderStaffSummary(),
  renderStaffRoster: () => staffRosterRuntime.renderStaffRoster(),
  staffRosterSection
});




billingControlsRuntime.bindBillingControlEvents();

businessReportingRuntime.bindBusinessReportingEvents();
bookingsRuntime.bindBookingEvents();

adminPlatformRuntime.bindAdminPlatformEvents();
adminSupportRuntime.bindAdminSupportEvents();
dashboardSessionControlsRuntime.bindDashboardSessionControls();
accountingLiveControlsRuntime.bindAccountingLiveControlsEvents();
dashboardStartupRuntime.runDashboardStartup();

staffRotaUiRuntime.bindStaffRotaUiEvents();

operationsRuntime.bindOperationsEvents();

businessControlsEventsRuntime.bindBusinessControlsEvents();

const mockDashboardRuntime = createMockDashboardRuntime({
  getUserRole: () => user?.role,
  getManagedBusinessId: () => managedBusinessId,
  setManagedBusinessId: setManagedBusinessIdValue,
  setAdminBusinessOptions: (value) => {
    adminBusinessOptions = Array.isArray(value) ? value : [];
  },
  setAdminBusinessStatus: setAdminBusinessStatusMessage,
  setBillingSummary: (value) => {
    billingSummary = value || null;
  },
  renderSubscriberBillingControls: () => subscriberBillingRuntime.renderSubscriberBillingControls(),
  setBusinessProfileFormValues: (profile) => businessProfileRuntime.setBusinessProfileFormValues(profile),
  setBusinessProfileStatus: (message, isError = false) => {
    businessProfileRuntime.setBusinessProfileStatus(message, isError);
  },
  setSocialMediaFormValues: (value) => {
    businessProfileRuntime.setSocialMediaFormValues(value);
  },
  renderSocialMediaPreview: (value) => businessProfileRuntime.renderSocialMediaPreview(value),
  clearMetricsGrid: () => {
    if (metricsGrid) metricsGrid.innerHTML = "";
  },
  addMetric: (label, value) => dashboardRoutingUiSupportRuntime.addMetric(label, value),
  setBookingRows: (value) => {
    bookingRows = Array.isArray(value) ? value : [];
  },
  setNextBookingsCursor: (value) => {
    nextBookingsCursor = value || null;
  },
  updateLoadMoreState: (isLoading = false) => bookingsRuntime.updateLoadMoreState(isLoading),
  applyBookingFilters: () => bookingsRuntime.applyBookingFilters(),
  renderSubscriberCalendar: () => calendarPulseRuntime.renderSubscriberCalendar(),
  setAccountingRows: (value) => {
    accountingRows = Array.isArray(value) ? value : [];
  },
  renderAccountingIntegrations: () => accountingIntegrationsRuntime.renderAccountingIntegrations(),
  setAccountingStatus,
  getAccountingLiveTimeframe: () => accountingLiveTimeframe,
  setAccountingLivePayload: (value) => {
    accountingLivePayload = value || null;
  },
  renderAccountingLiveRevenue: () => accountingLiveRuntime.renderAccountingLiveRevenue(),
  setSubscriberCommandCenter: (value) => {
    subscriberCommandCenter = value ?? null;
  },
  renderCommandCenter: () => commandCenterRuntime.renderCommandCenter(),
  setStaffRosterRows: (value) => {
    staffRosterRows = Array.isArray(value) ? value : [];
  },
  setStaffSummary: (value) => {
    staffSummary = value || null;
  },
  renderStaffSummary: () => staffRosterRuntime.renderStaffSummary(),
  renderStaffRoster: () => staffRosterRuntime.renderStaffRoster(),
  setStaffStatus,
  setWaitlistRows: (value) => {
    waitlistRows = Array.isArray(value) ? value : [];
  },
  setWaitlistSummary: (value) => {
    waitlistSummary = value || null;
  },
  renderWaitlistSummary: () => operationsRuntime.renderWaitlistSummary(),
  renderWaitlist: () => operationsRuntime.renderWaitlist(),
  setWaitlistStatus,
  setOperationsInsights: (value) => {
    operationsInsights = value ?? null;
  },
  renderOperationsInsights: () => operationsRuntime.renderOperationsInsights(),
  setOperationsStatus: (message, isError = false) => operationsRuntime.setOperationsStatus(message, isError),
  setCrmSegmentsPayload: (value) => {
    crmSegmentsPayload = value || null;
  },
  renderCrmSegments,
  setCrmStatus,
  setCommercialPayload: (value) => {
    commercialPayload = value || null;
  },
  renderCommercialControls: () => businessControlsRuntime.renderCommercialControls(),
  renderMerchControls: () => businessControlsRuntime.renderMerchControls(),
  setCommercialStatus: (message, isError = false) => businessControlsRuntime.setCommercialStatus(message, isError),
  setMerchStatus: (message, isError = false) => businessControlsRuntime.setMerchStatus(message, isError),
  setRevenueAttributionPayload: (value) => {
    revenueAttributionPayload = value || null;
  },
  renderRevenueAttribution: () => businessControlsRuntime.renderRevenueAttribution(),
  setRevenueStatus: (message, isError = false) => businessControlsRuntime.setRevenueStatus(message, isError),
  setProfitabilityPayload: (value) => {
    profitabilityPayload = value || null;
  },
  renderProfitabilitySummary: () => businessControlsRuntime.renderProfitabilitySummary(),
  setProfitabilityStatus: (message, isError = false) => businessControlsRuntime.setProfitabilityStatus(message, isError),
  renderBusinessGrowthPanel: () => businessGrowthPanelRuntime.renderBusinessGrowthPanel(),
  enforceDashboardRoleLayoutVisibility,
  renderExecutivePulse: () => calendarPulseRuntime.renderExecutivePulse()
});

if (isMockMode || dashboardDemoFillModeEnabled) {
  mockDashboardRuntime.loadMockDashboard();
} else {
  dashboardStartupRuntime.runInitialDashboardLoads();
}













