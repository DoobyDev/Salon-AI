import { buildAdminNotificationLexiPrompt, evaluateAdminNotificationHealth } from "./dashboard-admin-notification-health.js";

const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";

const $ = (id) => document.getElementById(id);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  roleButtons: $$("[data-role-switch]"),
  logout: $("dashboardLogoutBtn"),
  brandRole: $("dashboardBrandRole"),
  kicker: $("dashboardKicker"),
  title: $("dashboardTitle"),
  description: $("dashboardDescription"),
  businessPill: $("dashboardBusinessPill"),
  headerAddBooking: $("headerAddBookingBtn"),
  headerAskLexi: $("headerAskLexiBtn"),
  headerExport: $("headerExportBtn"),
  subscriberDashboard: $("subscriberDashboard"),
  subscriberOnboardingCard: $("subscriberOnboardingCard"),
  subscriberOnboardingContent: $("subscriberOnboardingContent"),
  customerDashboard: $("customerDashboard"),
  customerOnboardingCard: $("customerOnboardingCard"),
  customerOnboardingContent: $("customerOnboardingContent"),
  adminDashboard: $("adminDashboard"),
  adminOnboardingCard: $("adminOnboardingCard"),
  adminOnboardingContent: $("adminOnboardingContent"),
  subscriberBookingsMetric: $("subscriberBookingsMetric"),
  subscriberBookingsMeta: $("subscriberBookingsMeta"),
  subscriberRevenueMetric: $("subscriberRevenueMetric"),
  subscriberRevenueMeta: $("subscriberRevenueMeta"),
  subscriberLexiMetric: $("subscriberLexiMetric"),
  subscriberLexiMeta: $("subscriberLexiMeta"),
  subscriberCoverageMetric: $("subscriberCoverageMetric"),
  subscriberCoverageMeta: $("subscriberCoverageMeta"),
  subscriberOpsList: $("subscriberOpsList"),
  subscriberCustomerSearchForm: $("subscriberCustomerSearchForm"),
  subscriberCustomerSearchInput: $("subscriberCustomerSearchInput"),
  subscriberCustomerTable: $("subscriberCustomerTable"),
  subscriberCustomerDetail: $("subscriberCustomerDetail"),
  calendarWeekdays: $("calendarWeekdays"),
  calendarGrid: $("calendarGrid"),
  calendarMonthLabel: $("calendarMonthLabel"),
  calendarPrevBtn: $("calendarPrevBtn"),
  calendarNextBtn: $("calendarNextBtn"),
  calendarTodayBtn: $("calendarTodayBtn"),
  selectedDayTitle: $("selectedDayTitle"),
  selectedDayMeta: $("selectedDayMeta"),
  selectedDayFilters: $("selectedDayFilters"),
  selectedDayViews: $("selectedDayViews"),
  selectedDayStatusPill: $("selectedDayStatusPill"),
  selectedDayBookingCount: $("selectedDayBookingCount"),
  selectedDayRevenue: $("selectedDayRevenue"),
  selectedDayCoverageCard: $("selectedDayCoverageCard"),
  selectedDayAgenda: $("selectedDayAgenda"),
  selectedDayAddBookingBtn: $("selectedDayAddBookingBtn"),
  selectedDayAskLexiBtn: $("selectedDayAskLexiBtn"),
  revenueTimeframeSelect: $("revenueTimeframeSelect"),
  revenueRefreshBtn: $("revenueRefreshBtn"),
  revenueRangeValue: $("revenueRangeValue"),
  revenueRangeMeta: $("revenueRangeMeta"),
  revenueCancelRate: $("revenueCancelRate"),
  revenueCancelMeta: $("revenueCancelMeta"),
  profitValue: $("profitValue"),
  profitMeta: $("profitMeta"),
  breakevenValue: $("breakevenValue"),
  breakevenMeta: $("breakevenMeta"),
  revenueBars: $("revenueBars"),
  checkoutHubSection: $("checkoutHubSection"),
  checkoutMembershipMetric: $("checkoutMembershipMetric"),
  checkoutMembershipMeta: $("checkoutMembershipMeta"),
  checkoutPackageMetric: $("checkoutPackageMetric"),
  checkoutPackageMeta: $("checkoutPackageMeta"),
  checkoutGiftCardMetric: $("checkoutGiftCardMetric"),
  checkoutGiftCardMeta: $("checkoutGiftCardMeta"),
  checkoutRetailMetric: $("checkoutRetailMetric"),
  checkoutRetailMeta: $("checkoutRetailMeta"),
  checkoutOffersList: $("checkoutOffersList"),
  checkoutRetailList: $("checkoutRetailList"),
  giftCardIssueForm: $("giftCardIssueForm"),
  giftCardPurchaserInput: $("giftCardPurchaserInput"),
  giftCardRecipientInput: $("giftCardRecipientInput"),
  giftCardBalanceInput: $("giftCardBalanceInput"),
  giftCardExpiryInput: $("giftCardExpiryInput"),
  giftCardIssueMessage: $("giftCardIssueMessage"),
  checkoutGuidanceCard: $("checkoutGuidanceCard"),
  recoveryLateCancelsMetric: $("recoveryLateCancelsMetric"),
  recoveryLateCancelsMeta: $("recoveryLateCancelsMeta"),
  recoveryHighRiskMetric: $("recoveryHighRiskMetric"),
  recoveryHighRiskMeta: $("recoveryHighRiskMeta"),
  recoveryRebookingMetric: $("recoveryRebookingMetric"),
  recoveryRebookingMeta: $("recoveryRebookingMeta"),
  recoveryWaitlistMetric: $("recoveryWaitlistMetric"),
  recoveryWaitlistMeta: $("recoveryWaitlistMeta"),
  recoveryPriorityList: $("recoveryPriorityList"),
  recoveryActionList: $("recoveryActionList"),
  recoveryDetailCard: $("recoveryDetailCard"),
  recoveryMessage: $("recoveryMessage"),
  accountingExportBtn: $("accountingExportBtn"),
  channelList: $("channelList"),
  integrationList: $("integrationList"),
  teamList: $("teamList"),
  teamPlannerMeta: $("teamPlannerMeta"),
  teamPlannerGrid: $("teamPlannerGrid"),
  teamPlannerEditor: $("teamPlannerEditor"),
  teamPlannerMessage: $("teamPlannerMessage"),
  teamPlannerPrevBtn: $("teamPlannerPrevBtn"),
  teamPlannerCurrentBtn: $("teamPlannerCurrentBtn"),
  teamPlannerNextBtn: $("teamPlannerNextBtn"),
  teamPlannerDiscardBtn: $("teamPlannerDiscardBtn"),
  teamPlannerResetBtn: $("teamPlannerResetBtn"),
  teamPlannerSaveBtn: $("teamPlannerSaveBtn"),
  integrationConnectForm: $("integrationConnectForm"),
  integrationProvider: $("integrationProvider"),
  integrationAccountLabel: $("integrationAccountLabel"),
  integrationSyncMode: $("integrationSyncMode"),
  subscriberSegmentsList: $("subscriberSegmentsList"),
  subscriberSegmentDetail: $("subscriberSegmentDetail"),
  subscriberCampaignForm: $("subscriberCampaignForm"),
  subscriberCampaignMessage: $("subscriberCampaignMessage"),
  subscriberCampaignMessageState: $("subscriberCampaignMessageState"),
  messageQueueMetric: $("messageQueueMetric"),
  messageQueueMeta: $("messageQueueMeta"),
  messageRebookingMetric: $("messageRebookingMetric"),
  messageRebookingMeta: $("messageRebookingMeta"),
  messageRiskMetric: $("messageRiskMetric"),
  messageRiskMeta: $("messageRiskMeta"),
  messageWaitlistMetric: $("messageWaitlistMetric"),
  messageWaitlistMeta: $("messageWaitlistMeta"),
  commReminderMetric: $("commReminderMetric"),
  commReminderMeta: $("commReminderMeta"),
  commConfirmedMetric: $("commConfirmedMetric"),
  commConfirmedMeta: $("commConfirmedMeta"),
  commRebookingMetric: $("commRebookingMetric"),
  commRebookingMeta: $("commRebookingMeta"),
  commReadyMetric: $("commReadyMetric"),
  commReadyMeta: $("commReadyMeta"),
  commCoverageMetric: $("commCoverageMetric"),
  commCoverageMeta: $("commCoverageMeta"),
  commDeliveryMetric: $("commDeliveryMetric"),
  commDeliveryMeta: $("commDeliveryMeta"),
  commFailedMetric: $("commFailedMetric"),
  commFailedMeta: $("commFailedMeta"),
  commRecentList: $("commRecentList"),
  commDueSoonList: $("commDueSoonList"),
  commGuidanceCard: $("commGuidanceCard"),
  commSettingsForm: $("commSettingsForm"),
  commLiveRemindersEnabled: $("commLiveRemindersEnabled"),
  commChannelPreference: $("commChannelPreference"),
  commReminderLeadHours: $("commReminderLeadHours"),
  commManualFallbackEnabled: $("commManualFallbackEnabled"),
  commSettingsMessage: $("commSettingsMessage"),
  commSettingsDetail: $("commSettingsDetail"),
  subscriberMessageQueue: $("subscriberMessageQueue"),
  subscriberMessageDetail: $("subscriberMessageDetail"),
  subscriberMessageBoardState: $("subscriberMessageBoardState"),
  waitlistTotalMetric: $("waitlistTotalMetric"),
  waitlistTotalMeta: $("waitlistTotalMeta"),
  waitlistWaitingMetric: $("waitlistWaitingMetric"),
  waitlistWaitingMeta: $("waitlistWaitingMeta"),
  waitlistContactedMetric: $("waitlistContactedMetric"),
  waitlistContactedMeta: $("waitlistContactedMeta"),
  waitlistBookedMetric: $("waitlistBookedMetric"),
  waitlistBookedMeta: $("waitlistBookedMeta"),
  waitlistForm: $("waitlistForm"),
  waitlistCustomerName: $("waitlistCustomerName"),
  waitlistCustomerPhone: $("waitlistCustomerPhone"),
  waitlistCustomerEmail: $("waitlistCustomerEmail"),
  waitlistService: $("waitlistService"),
  waitlistPreferredDate: $("waitlistPreferredDate"),
  waitlistPreferredTime: $("waitlistPreferredTime"),
  waitlistNotes: $("waitlistNotes"),
  waitlistMessage: $("waitlistMessage"),
  waitlistEntries: $("waitlistEntries"),
  quickBookingForm: $("quickBookingForm"),
  quickBookingCustomerName: $("quickBookingCustomerName"),
  quickBookingCustomerPhone: $("quickBookingCustomerPhone"),
  quickBookingCustomerEmail: $("quickBookingCustomerEmail"),
  quickBookingService: $("quickBookingService"),
  quickBookingStylist: $("quickBookingStylist"),
  quickBookingDate: $("quickBookingDate"),
  quickBookingTime: $("quickBookingTime"),
  quickBookingNotes: $("quickBookingNotes"),
  quickBookingMessage: $("quickBookingMessage"),
  openQuickBookingBtn: $("openQuickBookingBtn"),
  quickBookingModal: $("quickBookingModal"),
  quickBookingBackdrop: $("quickBookingBackdrop"),
  quickBookingCloseBtn: $("quickBookingCloseBtn"),
  quickBookingSummary: $("quickBookingSummary"),
  quickBookingPreview: $("quickBookingPreview"),
  quickBookingSuggestions: $("quickBookingSuggestions"),
  quickBookingDaySuggestions: $("quickBookingDaySuggestions"),
  quickBookingModalMessage: $("quickBookingModalMessage"),
  customerTotalBookings: $("customerTotalBookings"),
  customerBookingsMeta: $("customerBookingsMeta"),
  customerUpcomingBookings: $("customerUpcomingBookings"),
  customerLoyaltyPoints: $("customerLoyaltyPoints"),
  customerAskLexiBtn: $("customerAskLexiBtn"),
  customerNextBookingCard: $("customerNextBookingCard"),
  customerBookingsList: $("customerBookingsList"),
  customerSavedSalons: $("customerSavedSalons"),
  customerRebookingPrompts: $("customerRebookingPrompts"),
  customerOffersList: $("customerOffersList"),
  customerGiftCards: $("customerGiftCards"),
  customerAftercareList: $("customerAftercareList"),
  adminBusinessesMetric: $("adminBusinessesMetric"),
  adminBusinessesMeta: $("adminBusinessesMeta"),
  adminSubscribersMetric: $("adminSubscribersMetric"),
  adminSubscribersMeta: $("adminSubscribersMeta"),
  adminCustomersMetric: $("adminCustomersMetric"),
  adminCustomersMeta: $("adminCustomersMeta"),
  adminBookingsMetric: $("adminBookingsMetric"),
  adminBookingsMeta: $("adminBookingsMeta"),
  adminMrrMetric: $("adminMrrMetric"),
  adminMrrMeta: $("adminMrrMeta"),
  adminRevenuePeriodMetric: $("adminRevenuePeriodMetric"),
  adminRevenuePeriodMeta: $("adminRevenuePeriodMeta"),
  adminSubscriptionCancelMetric: $("adminSubscriptionCancelMetric"),
  adminSubscriptionCancelMeta: $("adminSubscriptionCancelMeta"),
  adminBookingCancelMetric: $("adminBookingCancelMetric"),
  adminBookingCancelMeta: $("adminBookingCancelMeta"),
  adminActivePlanMetric: $("adminActivePlanMetric"),
  adminActivePlanMeta: $("adminActivePlanMeta"),
  adminInactivePlanMetric: $("adminInactivePlanMetric"),
  adminInactivePlanMeta: $("adminInactivePlanMeta"),
  adminTopPlanMetric: $("adminTopPlanMetric"),
  adminTopPlanMeta: $("adminTopPlanMeta"),
  adminQuietActiveMetric: $("adminQuietActiveMetric"),
  adminQuietActiveMeta: $("adminQuietActiveMeta"),
  adminPlanMixList: $("adminPlanMixList"),
  adminSubscriptionHealthList: $("adminSubscriptionHealthList"),
  adminRenewalSoonMetric: $("adminRenewalSoonMetric"),
  adminRenewalSoonMeta: $("adminRenewalSoonMeta"),
  adminRenewalMonthMetric: $("adminRenewalMonthMetric"),
  adminRenewalMonthMeta: $("adminRenewalMonthMeta"),
  adminBillingAttentionMetric: $("adminBillingAttentionMetric"),
  adminBillingAttentionMeta: $("adminBillingAttentionMeta"),
  adminBillingList: $("adminBillingList"),
  adminNotifIssueMetric: $("adminNotifIssueMetric"),
  adminNotifIssueMeta: $("adminNotifIssueMeta"),
  adminNotifFailedMetric: $("adminNotifFailedMetric"),
  adminNotifFailedMeta: $("adminNotifFailedMeta"),
  adminNotifSentMetric: $("adminNotifSentMetric"),
  adminNotifSentMeta: $("adminNotifSentMeta"),
  adminNotifList: $("adminNotifList"),
  adminAlertCriticalMetric: $("adminAlertCriticalMetric"),
  adminAlertCriticalMeta: $("adminAlertCriticalMeta"),
  adminAlertQuietMetric: $("adminAlertQuietMetric"),
  adminAlertQuietMeta: $("adminAlertQuietMeta"),
  adminAlertCancelMetric: $("adminAlertCancelMetric"),
  adminAlertCancelMeta: $("adminAlertCancelMeta"),
  adminAlertPlanMetric: $("adminAlertPlanMetric"),
  adminAlertPlanMeta: $("adminAlertPlanMeta"),
  adminAlertList: $("adminAlertList"),
  adminRevenueChart: $("adminRevenueChart"),
  adminBusinessTable: $("adminBusinessTable"),
  adminBusinessDetail: $("adminBusinessDetail"),
  adminAccountSearchForm: $("adminAccountSearchForm"),
  adminAccountSearchInput: $("adminAccountSearchInput"),
  adminAccountsTable: $("adminAccountsTable"),
  adminAccountDetail: $("adminAccountDetail"),
  adminAccountEditForm: $("adminAccountEditForm"),
  adminEditName: $("adminEditName"),
  adminEditEmail: $("adminEditEmail"),
  adminEditBusinessName: $("adminEditBusinessName"),
  adminAccountEditMessage: $("adminAccountEditMessage"),
  adminExportBtn: $("adminExportBtn"),
  serviceDayModal: $("serviceDayModal"),
  serviceDayBackdrop: $("serviceDayBackdrop"),
  serviceDayCloseBtn: $("serviceDayCloseBtn"),
  serviceDayBookingSummary: $("serviceDayBookingSummary"),
  serviceDayStatePreview: $("serviceDayStatePreview"),
  serviceDayVisitSummary: $("serviceDayVisitSummary"),
  serviceDayRebookBtn: $("serviceDayRebookBtn"),
  serviceDayCheckoutBtn: $("serviceDayCheckoutBtn"),
  serviceDayCheckoutMeta: $("serviceDayCheckoutMeta"),
  serviceDayForm: $("serviceDayForm"),
  serviceDayStateInput: $("serviceDayStateInput"),
  serviceDayNotesInput: $("serviceDayNotesInput"),
  serviceDayAftercareInput: $("serviceDayAftercareInput"),
  serviceDayMessage: $("serviceDayMessage"),
  rescheduleModal: $("rescheduleModal"),
  rescheduleBackdrop: $("rescheduleBackdrop"),
  rescheduleCloseBtn: $("rescheduleCloseBtn"),
  rescheduleForm: $("rescheduleForm"),
  rescheduleBookingSummary: $("rescheduleBookingSummary"),
  rescheduleDateInput: $("rescheduleDateInput"),
  rescheduleTimeInput: $("rescheduleTimeInput"),
  rescheduleMessage: $("rescheduleMessage"),
  lexiFab: $("dashboardLexiFab"),
  lexiDrawer: $("dashboardLexiDrawer"),
  lexiClose: $("dashboardLexiCloseBtn"),
  lexiThread: $("subscriberAssistantThread"),
  lexiForm: $("subscriberAssistantForm"),
  lexiInput: $("subscriberAssistantInput"),
  lexiPromptButtons: $$("[data-lexi-prompt]")
};

const state = {
  token: sessionStorage.getItem(AUTH_TOKEN_KEY) || "",
  user: readSessionUser(),
  activeRole: "subscriber",
  business: null,
  dashboard: null,
  bookings: [],
  liveRevenue: null,
  profitability: null,
  attribution: null,
  commercialControls: null,
  staff: null,
  staffWeekStart: "",
  staffRotaDraft: null,
  selectedTeamPlannerCell: null,
  integrations: null,
  crmSegments: null,
  selectedSegmentLead: null,
  waitlist: null,
  customerRecords: null,
  subscriberCustomers: [],
  subscriberCustomerQuery: "",
  selectedSubscriberCustomerKey: "",
  selectedSubscriberMessageKey: "",
  adminBusinesses: [],
  selectedAdminBusinessId: "",
  adminAccounts: [],
  selectedAdminAccountId: "",
  serviceDayBookingId: "",
  rescheduleBookingId: "",
  rescheduleRole: "",
  bookingPrefillSource: "",
  quickBookingSuggestionsData: null,
  quickBookingSuggestionsKey: "",
  selectedDayFilter: "all",
  selectedDayView: "timeline",
  selectedRecoveryItem: null,
  monthCursor: startOfMonth(new Date()),
  selectedDate: toDateKey(new Date())
};

function readSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );
}

function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatDateLong(value) {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function parseDateValue(value) {
  if (!value) return null;
  const normalized = typeof value === "string" && value.includes("T") ? value : `${value}T12:00:00`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function wholeDaysUntil(value) {
  const d = parseDateValue(value);
  if (!d) return null;
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((target.getTime() - startOfToday().getTime()) / 86400000);
}

function describeRenewalWindow(daysUntil) {
  if (daysUntil === null) return "No renewal date saved";
  if (daysUntil < 0) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"} overdue`;
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `Due in ${daysUntil} days`;
}

function buildBusinessBillingState(business) {
  const status = String(business?.subscription?.status || "inactive").trim().toLowerCase();
  const plan = String(business?.subscription?.plan || "starter").trim().toLowerCase() || "starter";
  const renewalDate = business?.subscription?.currentPeriodEnd || null;
  const daysUntilRenewal = wholeDaysUntil(renewalDate);
  let label = "Needs billing review";
  let tone = "status-negative";

  if (status === "active") {
    if (daysUntilRenewal === null) {
      label = "Active with no renewal date";
      tone = "status-neutral";
    } else if (daysUntilRenewal < 0) {
      label = "Renewal overdue";
      tone = "status-negative";
    } else if (daysUntilRenewal <= 14) {
      label = "Renewing soon";
      tone = "status-neutral";
    } else {
      label = "Billing looks stable";
      tone = "status-positive";
    }
  } else if (status === "trialing") {
    label = "Trial still running";
    tone = "status-neutral";
  }

  return {
    status,
    plan,
    renewalDate,
    daysUntilRenewal,
    renewalLabel: describeRenewalWindow(daysUntilRenewal),
    label,
    tone
  };
}

function headers(isJson = true) {
  const out = {};
  if (isJson) out["Content-Type"] = "application/json";
  if (state.token) out.Authorization = `Bearer ${state.token}`;
  return out;
}

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) } });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (response.status === 401) {
    clearSession();
    window.location.href = "/auth";
    throw new Error("Session expired.");
  }
  if (!response.ok) throw new Error((typeof data === "string" ? data : data?.error) || "Request failed.");
  return data;
}

function appendLexiMessage(role, text) {
  if (!els.lexiThread) return;
  const node = document.createElement("article");
  node.className = `assistant-message ${role === "user" ? "is-user" : role === "system" ? "is-system" : "is-assistant"}`;
  node.textContent = String(text || "");
  els.lexiThread.appendChild(node);
  els.lexiThread.scrollTop = els.lexiThread.scrollHeight;
}

function removeLexiSystemMessage() {
  const nodes = Array.from(els.lexiThread?.querySelectorAll(".is-system") || []);
  const last = nodes[nodes.length - 1];
  if (last) last.remove();
}

function openLexi(prefill = "") {
  if (!els.lexiDrawer) return;
  els.lexiDrawer.hidden = false;
  if (!els.lexiThread.childElementCount) {
    appendLexiMessage("assistant", "Hello, I'm Lexi. Ask me about bookings, revenue, diary gaps, or how to use the app.");
  }
  els.lexiInput.value = String(prefill || "");
  els.lexiInput.focus();
}

function buildSubscriberLexiContext() {
  const selectedCustomer = state.subscriberCustomers.find((row) => row.key === state.selectedSubscriberCustomerKey) || null;
  const selectedMessageTask = buildSubscriberMessageTasks().find((row) => row.key === state.selectedSubscriberMessageKey) || null;
  const selectedRecovery =
    state.selectedRecoveryItem?.type === "risk"
      ? (Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : []).find(
          (row) => String(row.bookingId || row.id || "") === state.selectedRecoveryItem?.id
        ) || null
      : state.selectedRecoveryItem?.type === "waitlist"
        ? (Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : []).find((row) => String(row.id || "") === state.selectedRecoveryItem?.id) || null
        : null;
  const bookingDraftName = String(els.quickBookingCustomerName?.value || "").trim();
  const bookingDraftPhone = String(els.quickBookingCustomerPhone?.value || "").trim();
  const bookingDraftEmail = String(els.quickBookingCustomerEmail?.value || "").trim();
  const bookingDraftService = String(els.quickBookingService?.value || "").trim();
  const bookingDraftDate = String(els.quickBookingDate?.value || "").trim();
  const bookingDraftTime = String(els.quickBookingTime?.value || "").trim();
  const bookingDraftNotes = String(els.quickBookingNotes?.value || "").trim();
  const bookingDraftRecord = getCustomerRecordForDraft({
    customerName: bookingDraftName,
    customerPhone: bookingDraftPhone,
    customerEmail: bookingDraftEmail
  });

  return {
    selectedDate: state.selectedDate,
    selectedDayCoverage: buildSelectedDayCoverageSummary(state.selectedDate, bookingsForDate(state.selectedDate)),
    selectedCustomer: selectedCustomer
      ? {
          name: selectedCustomer.customerName,
          lastService: selectedCustomer.lastService || "",
          daysSinceLastVisit: selectedCustomer.daysSinceLastVisit,
          nextBooking: selectedCustomer.nextBooking
            ? {
                service: selectedCustomer.nextBooking.service,
                date: selectedCustomer.nextBooking.date,
                time: selectedCustomer.nextBooking.time
              }
            : null,
          record: selectedCustomer.customerRecord
            ? {
                allergies: selectedCustomer.customerRecord.allergies,
                formulaNotes: selectedCustomer.customerRecord.formulaNotes,
                consultationNotes: selectedCustomer.customerRecord.consultationNotes,
                visitPrepNotes: selectedCustomer.customerRecord.visitPrepNotes,
                preferredStylist: selectedCustomer.customerRecord.preferredStylist,
                patchTestRequired: Boolean(selectedCustomer.customerRecord.patchTestRequired)
              }
            : null
        }
      : null,
    selectedRecovery: selectedRecovery
      ? {
          type: state.selectedRecoveryItem?.type || "",
          customerName: selectedRecovery.customerName || "",
          service: selectedRecovery.service || "",
          date: selectedRecovery.date || selectedRecovery.preferredDate || "",
          time: selectedRecovery.time || selectedRecovery.preferredTime || "",
          riskLevel: selectedRecovery.riskLevel || "",
          reasons: Array.isArray(selectedRecovery.reasons) ? selectedRecovery.reasons.slice(0, 3) : []
        }
      : null,
    selectedMessageTask: selectedMessageTask
      ? {
          type: selectedMessageTask.type,
          customerName: selectedMessageTask.customerName,
          service: selectedMessageTask.service || "",
          summary: selectedMessageTask.summary || "",
          message: selectedMessageTask.message || ""
        }
      : null,
    bookingDraft: bookingDraftName || bookingDraftService || bookingDraftDate || bookingDraftTime
      ? {
          customerName: bookingDraftName,
          service: bookingDraftService,
          date: bookingDraftDate,
          time: bookingDraftTime,
          notes: bookingDraftNotes,
          record: bookingDraftRecord
            ? {
                allergies: bookingDraftRecord.allergies,
                formulaNotes: bookingDraftRecord.formulaNotes,
                consultationNotes: bookingDraftRecord.consultationNotes,
                visitPrepNotes: bookingDraftRecord.visitPrepNotes,
                preferredStylist: bookingDraftRecord.preferredStylist,
                patchTestRequired: Boolean(bookingDraftRecord.patchTestRequired)
              }
            : null
        }
      : null,
    communications: state.dashboard?.communications?.readiness
      ? {
          status: state.dashboard.communications.readiness.status || "",
          label: state.dashboard.communications.readiness.label || "",
          summary: state.dashboard.communications.readiness.summary || "",
          upcomingBookings: Number(state.dashboard.communications.readiness.upcomingBookings || 0),
          reachableUpcoming: Number(state.dashboard.communications.readiness.reachableUpcoming || 0),
          missingContactUpcoming: Number(state.dashboard.communications.readiness.missingContactUpcoming || 0),
          contactCoveragePct: Number(state.dashboard.communications.readiness.contactCoveragePct || 0),
          availableChannels: Array.isArray(state.dashboard.communications.readiness.availableChannels)
            ? state.dashboard.communications.readiness.availableChannels.slice(0, 3)
            : [],
          issues: Array.isArray(state.dashboard.communications.readiness.issues)
            ? state.dashboard.communications.readiness.issues.slice(0, 3)
            : [],
          nextSteps: Array.isArray(state.dashboard.communications.readiness.nextSteps)
            ? state.dashboard.communications.readiness.nextSteps.slice(0, 3)
            : []
        }
      : null
  };
}

function buildAdminLexiContext() {
  const selectedBusiness = state.adminBusinesses.find((row) => row.id === state.selectedAdminBusinessId) || null;
  const alerts = buildAdminBusinessAlerts(state.adminBusinesses);
  const topAlerts = alerts.slice(0, 5).map((alert) => ({
    businessId: alert.id,
    businessName: alert.name,
    label: alert.label,
    reasons: alert.reasons.slice(0, 2),
    severity: alert.severity
  }));

  return {
    selectedBusiness: selectedBusiness
      ? (() => {
          const notificationHealth = evaluateAdminNotificationHealth(selectedBusiness);
          return {
            id: selectedBusiness.id,
            name: selectedBusiness.name,
            healthLabel: selectedBusiness.stats?.healthLabel || "",
            upcomingBookings: Number(selectedBusiness.stats?.upcomingBookings || 0),
            cancelledBookings: Number(selectedBusiness.stats?.cancelledBookings || 0),
            bookingCount: Number(selectedBusiness.stats?.bookingCount || 0),
            revenue: Number(selectedBusiness.stats?.revenue || 0),
            subscriptionStatus: selectedBusiness.subscription?.status || "",
            plan: selectedBusiness.subscription?.plan || "",
            notificationHealth: {
              status: notificationHealth.status,
              summary: notificationHealth.summary,
              sent: notificationHealth.sent,
              failed: notificationHealth.failed,
              issues: notificationHealth.issues.slice(0, 3),
              nextSteps: notificationHealth.nextSteps.slice(0, 3)
            }
          };
        })()
      : null,
    alerts: topAlerts
  };
}

function closeLexi() {
  if (els.lexiDrawer) els.lexiDrawer.hidden = true;
}

async function sendLexi(question) {
  const text = String(question || "").trim();
  if (!text) return;
  appendLexiMessage("user", text);
  appendLexiMessage("system", "Lexi is checking that now.");
  try {
    let data;
    if (state.activeRole === "customer") {
      data = await api("/api/chat", { method: "POST", body: JSON.stringify({ message: text, history: [] }) });
    } else {
      const endpoint = state.activeRole === "admin" ? "/api/admin/copilot" : "/api/copilot/subscriber";
      data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(
          state.activeRole === "subscriber"
            ? { question: text, context: buildSubscriberLexiContext() }
            : state.activeRole === "admin"
              ? { question: text, context: buildAdminLexiContext() }
              : { question: text }
        )
      });
    }
    removeLexiSystemMessage();
    appendLexiMessage("assistant", String(data?.answer || data?.reply || "No reply available."));
  } catch (error) {
    removeLexiSystemMessage();
    appendLexiMessage("assistant", error?.message || "Lexi is unavailable right now.");
  }
}

function setRoleState() {
  els.roleButtons.forEach((button) => {
    const role = String(button.dataset.roleSwitch || "");
    const allowed = role === state.user?.role || (state.user?.role === "admin" && ["subscriber", "customer", "admin"].includes(role));
    button.classList.toggle("is-active", role === state.activeRole);
    button.disabled = !allowed;
  });
}

function switchVisibleDashboard(role) {
  state.activeRole = role;
  els.subscriberDashboard.hidden = role !== "subscriber";
  els.customerDashboard.hidden = role !== "customer";
  els.adminDashboard.hidden = role !== "admin";
  document.body.dataset.role = role;
  const copy = {
    subscriber: ["Subscriber control room", "Salon operator workspace", "Lexi Control Center", "Your booking diary, revenue visibility, team coverage, accounting export, and Ask Lexi actions in one place."],
    customer: ["Customer booking space", "Customer workspace", "My Appointments", "Review upcoming visits, recent appointments, and your customer activity in one place."],
    admin: ["Platform operations", "Admin workspace", "Platform Watch", "Track businesses, subscribers, bookings, and export platform analytics from one admin view."]
  }[role];
  els.brandRole.textContent = copy[0];
  els.kicker.textContent = copy[1];
  els.title.textContent = copy[2];
  els.description.textContent = copy[3];
  if (els.headerAddBooking) els.headerAddBooking.disabled = role !== "subscriber";
  if (els.headerExport) els.headerExport.disabled = role === "customer";
  setRoleState();
}

function bookingsForDate(dateKey) {
  return state.bookings
    .filter((booking) => String(booking.date || "") === dateKey)
    .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
}

function customerKeyForBooking(booking) {
  const email = String(booking?.customerEmail || "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = String(booking?.customerPhone || "").trim();
  if (phone) return `phone:${phone}`;
  return `name:${String(booking?.customerName || "guest").trim().toLowerCase()}`;
}

function customerKeyFromContactDraft({ customerName = "", customerEmail = "", customerPhone = "" } = {}) {
  const email = String(customerEmail || "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = String(customerPhone || "").trim();
  if (phone) return `phone:${phone}`;
  return `name:${String(customerName || "guest").trim().toLowerCase()}`;
}

function getCustomerRecordForDraft({ customerName = "", customerEmail = "", customerPhone = "" } = {}) {
  const customerKey = customerKeyFromContactDraft({ customerName, customerEmail, customerPhone });
  return (Array.isArray(state.customerRecords?.records) ? state.customerRecords.records : []).find((row) => row.customerKey === customerKey) || null;
}

function serviceNeedsConsultation(serviceName) {
  const text = String(serviceName || "").trim().toLowerCase();
  return /(balayage|highlights?|ombre|colour correction|color correction|extensions?|keratin|bridal|consultation|smoothing)/.test(text);
}

function serviceNeedsPatchTest(serviceName) {
  const text = String(serviceName || "").trim().toLowerCase();
  return /(balayage|highlights?|colour|color|tint|toner|bleach|lighten|keratin)/.test(text);
}

function getServiceByName(serviceName) {
  const serviceOptions = Array.isArray(state.business?.business?.services) ? state.business.business.services : [];
  return serviceOptions.find((row) => String(row.name || "").trim() === String(serviceName || "").trim()) || null;
}

function getServiceDurationMin(serviceName) {
  return Math.max(5, Number(getServiceByName(serviceName)?.durationMin || 45));
}

function buildBookingStartMs(date, time) {
  return new Date(`${String(date || "").trim()}T${String(time || "00:00").trim()}:00`).getTime();
}

function buildBookingEndMs(date, time, durationMin) {
  return buildBookingStartMs(date, time) + Math.max(5, Number(durationMin || 45)) * 60 * 1000;
}

function bookingsOverlap(first, second) {
  return first.startMs < second.endMs && second.startMs < first.endMs;
}

function parseBookingNotesMeta(notes) {
  const text = String(notes || "").trim();
  if (!text) {
    return {
      stylistName: "",
      serviceState: "",
      serviceNotes: "",
      aftercareNotes: "",
      cleanNotes: ""
    };
  }
  const lines = text.split(/\r?\n/);
  const meta = {
    stylistName: "",
    serviceState: "",
    serviceNotes: "",
    aftercareNotes: "",
    cleanNotes: ""
  };
  let bodyStart = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = String(lines[index] || "").trim();
    const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (!match) {
      bodyStart = index;
      break;
    }
    const label = String(match[1] || "").trim().toLowerCase();
    const value = String(match[2] || "").trim();
    if (label === "stylist") meta.stylistName = value;
    if (label === "servicestate") meta.serviceState = value;
    if (label === "servicenotes") meta.serviceNotes = value;
    if (label === "aftercare") meta.aftercareNotes = value;
    bodyStart = index + 1;
  }
  meta.cleanNotes = lines.slice(bodyStart).join("\n").trim();
  return meta;
}

function buildBookingNotesPayload({ stylistName = "", serviceState = "", serviceNotes = "", aftercareNotes = "", userNotes = "" } = {}) {
  const cleanStylist = String(stylistName || "").trim();
  const cleanServiceState = String(serviceState || "").trim();
  const cleanServiceNotes = String(serviceNotes || "").trim();
  const cleanAftercareNotes = String(aftercareNotes || "").trim();
  const cleanNotes = String(userNotes || "").trim();
  return [
    cleanStylist ? `[Stylist] ${cleanStylist}` : "",
    cleanServiceState ? `[ServiceState] ${cleanServiceState}` : "",
    cleanServiceNotes ? `[ServiceNotes] ${cleanServiceNotes}` : "",
    cleanAftercareNotes ? `[Aftercare] ${cleanAftercareNotes}` : "",
    cleanNotes
  ]
    .filter(Boolean)
    .join("\n");
}

function bookingStylistName(booking) {
  return parseBookingNotesMeta(booking?.notes || "").stylistName;
}

function bookingServiceState(booking) {
  const status = String(booking?.status || "").trim().toLowerCase();
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  const noteState = String(parseBookingNotesMeta(booking?.notes || "").serviceState || "").trim().toLowerCase();
  return noteState || "confirmed";
}

function buildSelectedDayCoverageSummary(dateKey, dayRows = []) {
  const liveRows = Array.isArray(dayRows) ? dayRows.filter((row) => String(row.status || "").toLowerCase() !== "cancelled") : [];
  const dateWeekStart = weekStartFromDateKey(dateKey);
  const loadedWeekStart = String(state.staff?.rotaWeek?.weekStart || "").trim();
  const rotaDayKey = rotaDayKeyFromDateKey(dateKey);
  const weekMatches = loadedWeekStart === dateWeekStart;
  const members = Array.isArray(state.staff?.members) ? state.staff.members : [];
  const cells = weekMatches && state.staff?.rotaWeek?.cells && typeof state.staff.rotaWeek.cells === "object" ? state.staff.rotaWeek.cells : {};
  const scheduledMembers = members.filter((member) => {
    const cell = cells?.[member.id]?.[rotaDayKey] || null;
    const fallbackScheduled = Array.isArray(member.shiftDays) && member.shiftDays.includes(rotaDayKey);
    const status = cell?.status || (fallbackScheduled ? "scheduled" : "off");
    return ["scheduled", "available", "covering"].includes(status);
  }).length;
  const assignedBookings = liveRows.filter((booking) => bookingStylistName(booking)).length;
  const unassignedBookings = liveRows.length - assignedBookings;
  const conflictCount = liveRows.filter((booking) => {
    const stylistName = bookingStylistName(booking);
    return stylistName
      ? buildStylistConflictSummary({
          date: booking.date,
          time: booking.time,
          serviceName: booking.service,
          stylistName,
          excludeBookingId: booking.id
        }).length > 0
      : false;
  }).length;
  const pressureLabel =
    !liveRows.length
      ? "No live diary pressure"
      : weekMatches && scheduledMembers === 0
        ? "No team cover planned"
        : weekMatches && assignedBookings > scheduledMembers
          ? "Under-covered day"
          : unassignedBookings > 0
            ? "Bookings still need assigning"
            : conflictCount > 0
              ? "Stylist clashes to review"
              : "Coverage looks workable";
  const pressureTone =
    pressureLabel === "Coverage looks workable" || pressureLabel === "No live diary pressure"
      ? "status-positive"
      : pressureLabel === "Bookings still need assigning"
        ? "status-neutral"
        : "status-negative";
  return {
    weekMatches,
    scheduledMembers,
    assignedBookings,
    unassignedBookings,
    conflictCount,
    pressureLabel,
    pressureTone
  };
}

function buildStylistConflictSummary({ date, time, serviceName, stylistName, excludeBookingId = "" } = {}) {
  const cleanStylist = String(stylistName || "").trim();
  if (!date || !time || !serviceName || !cleanStylist) return [];
  const draft = {
    startMs: buildBookingStartMs(date, time),
    endMs: buildBookingEndMs(date, time, getServiceDurationMin(serviceName))
  };
  if (Number.isNaN(draft.startMs) || Number.isNaN(draft.endMs)) return [];

  return state.bookings
    .filter((booking) => String(booking.status || "").toLowerCase() !== "cancelled")
    .filter((booking) => String(booking.date || "") === date)
    .filter((booking) => String(booking.id || "") !== String(excludeBookingId || ""))
    .filter((booking) => bookingStylistName(booking) === cleanStylist)
    .filter((booking) =>
      bookingsOverlap(draft, {
        startMs: buildBookingStartMs(booking.date, booking.time),
        endMs: buildBookingEndMs(booking.date, booking.time, getServiceDurationMin(booking.service))
      })
    )
    .map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      service: booking.service,
      time: booking.time
    }));
}

function renderQuickBookingStylistOptions() {
  if (!els.quickBookingStylist) return;
  const members = Array.isArray(state.staff?.members) ? state.staff.members : [];
  els.quickBookingStylist.innerHTML = [
    '<option value="">No stylist assigned yet</option>',
    ...members.map((member) => `<option value="${escapeHtml(member.name || "")}">${escapeHtml(member.name || "Stylist")} - ${escapeHtml(cap((member.availability || "off_duty").replaceAll("_", " ")))}</option>`)
  ].join("");
}

function renderWeekdays() {
  if (!els.calendarWeekdays || els.calendarWeekdays.childElementCount) return;
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((label) => {
    const div = document.createElement("div");
    div.textContent = label;
    els.calendarWeekdays.appendChild(div);
  });
}

function renderCalendar() {
  if (!els.calendarGrid || !els.calendarMonthLabel) return;
  const monthStart = state.monthCursor;
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - mondayOffset);
  els.calendarMonthLabel.textContent = monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  els.calendarGrid.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const dateKey = toDateKey(date);
    const rows = bookingsForDate(dateKey);
    const revenue = rows
      .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row.price || 0), 0);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    if (date.getMonth() !== monthStart.getMonth()) button.classList.add("is-outside");
    if (dateKey === state.selectedDate) button.classList.add("is-selected");
    if (dateKey === toDateKey(new Date())) button.classList.add("is-today");
    button.innerHTML = `
      <div class="calendar-day-number">
        <span>${date.getDate()}</span>
        ${rows.length ? `<span class="calendar-pill">${rows.length}</span>` : ""}
      </div>
      <div class="calendar-day-summary">
        <span>${rows.length ? `${rows.length} booking${rows.length === 1 ? "" : "s"}` : "No bookings"}</span>
        <span>${rows.length ? escapeHtml(currency(revenue)) : "Open day"}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      state.selectedDate = dateKey;
      renderCalendar();
      renderSelectedDay();
    });
    els.calendarGrid.appendChild(button);
  }

  if (state.selectedDate < toDateKey(gridStart) || state.selectedDate > toDateKey(monthEnd)) {
    state.selectedDate = toDateKey(monthStart);
  }
}

function renderSelectedDay() {
  if (!els.selectedDayAgenda) return;
  const rows = bookingsForDate(state.selectedDate);
  const liveRows = rows.filter((row) => String(row.status || "").toLowerCase() !== "cancelled");
  const cancelledRows = rows.filter((row) => String(row.status || "").toLowerCase() === "cancelled");
  const revenue = liveRows.reduce((sum, row) => sum + Number(row.price || 0), 0);
  els.selectedDayTitle.textContent = formatDateLong(state.selectedDate);
  els.selectedDayMeta.textContent = rows.length ? `${rows.length} booking${rows.length === 1 ? "" : "s"} scheduled.` : "No bookings scheduled yet.";
  els.selectedDayBookingCount.textContent = String(rows.length);
  els.selectedDayRevenue.textContent = currency(revenue);
  if (els.selectedDayStatusPill) {
    const dateInFuture = new Date(`${state.selectedDate}T12:00:00`).getTime() >= new Date().setHours(0, 0, 0, 0);
    if (!rows.length && dateInFuture) {
      els.selectedDayStatusPill.textContent = "Open day with room to fill";
      els.selectedDayStatusPill.className = "status-pill status-neutral";
    } else if (cancelledRows.length && cancelledRows.length === rows.length) {
      els.selectedDayStatusPill.textContent = "Only cancellations on this day";
      els.selectedDayStatusPill.className = "status-pill status-negative";
    } else if (cancelledRows.length) {
      els.selectedDayStatusPill.textContent = `${cancelledRows.length} cancelled booking${cancelledRows.length === 1 ? "" : "s"} need attention`;
      els.selectedDayStatusPill.className = "status-pill status-negative";
    } else if (liveRows.length >= 5) {
      els.selectedDayStatusPill.textContent = "Busy working day";
      els.selectedDayStatusPill.className = "status-pill status-positive";
    } else if (liveRows.length > 0) {
      els.selectedDayStatusPill.textContent = "Light day with room for more";
      els.selectedDayStatusPill.className = "status-pill status-neutral";
    } else {
      els.selectedDayStatusPill.textContent = "No live bookings on this day";
      els.selectedDayStatusPill.className = "status-pill status-neutral";
    }
  }
  if (els.selectedDayCoverageCard) {
    const coverage = buildSelectedDayCoverageSummary(state.selectedDate, rows);
    els.selectedDayCoverageCard.innerHTML = `
      <article class="detail-card">
        <strong>Coverage check</strong>
        <small class="${coverage.pressureTone}">${escapeHtml(coverage.pressureLabel)}</small>
        <small>${escapeHtml(coverage.weekMatches ? `${coverage.scheduledMembers} team member${coverage.scheduledMembers === 1 ? "" : "s"} planned for this day.` : "Open this week in the planner to inspect rota cover for this date.")}</small>
        <small>${escapeHtml(`${coverage.assignedBookings} assigned booking${coverage.assignedBookings === 1 ? "" : "s"}, ${coverage.unassignedBookings} unassigned.`)}</small>
        <small>${escapeHtml(coverage.conflictCount ? `${coverage.conflictCount} booking${coverage.conflictCount === 1 ? "" : "s"} have a stylist clash to review.` : "No stylist clashes are flagged right now.")}</small>
      </article>
    `;
  }

  const filterMap = {
    all: rows,
    live: liveRows,
    cancelled: cancelledRows,
    gaps: rows.length ? [] : []
  };
  const visibleRows = filterMap[state.selectedDayFilter] || rows;

  if (state.selectedDayFilter === "gaps") {
    els.selectedDayAgenda.innerHTML = `
      <div class="empty-state">
        ${
          rows.length
            ? "This day already has bookings. Use the All or Live filter to review them."
            : "This day is open. Use Add booking, suggested times, or Ask Lexi to fill it quickly."
        }
      </div>
    `;
    return;
  }

  if (!visibleRows.length) {
    const emptyMessage =
      state.selectedDayFilter === "cancelled"
        ? "No cancelled bookings on this day."
        : state.selectedDayFilter === "live"
          ? "No live bookings on this day."
          : "No appointments yet. Use Add booking or ask Lexi to fill the gap.";
    els.selectedDayAgenda.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  if (state.selectedDayView === "stylist") {
    const groups = new Map();
    visibleRows.forEach((booking) => {
      const stylistName = bookingStylistName(booking) || "Unassigned";
      const current = groups.get(stylistName) || [];
      current.push(booking);
      groups.set(stylistName, current);
    });

    els.selectedDayAgenda.innerHTML = Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([stylistName, bookings]) => {
        const rosterMember = (Array.isArray(state.staff?.members) ? state.staff.members : []).find((row) => String(row.name || "").trim() === stylistName) || null;
        const totalRevenue = bookings
          .filter((booking) => String(booking.status || "").toLowerCase() !== "cancelled")
          .reduce((sum, booking) => sum + Number(booking.price || 0), 0);
        const items = bookings
          .map((booking) => {
            const status = String(booking.status || "").toLowerCase();
            const serviceState = bookingServiceState(booking);
            const cleanNotes = parseBookingNotesMeta(booking.notes || "").cleanNotes;
            return `
              <article class="agenda-item">
                <div class="agenda-item-meta">
                  <strong>${escapeHtml(booking.time || "")} - ${escapeHtml(booking.customerName || "Guest")}</strong>
                  <span class="${serviceStateTone(serviceState)}">${escapeHtml(serviceStateLabel(serviceState))}</span>
                </div>
                <small>${escapeHtml(booking.service || "Service")} - ${escapeHtml(currency(booking.price || 0))}</small>
                ${cleanNotes ? `<small>${escapeHtml(cleanNotes)}</small>` : ""}
                <div class="agenda-item-actions">
                  ${status === "cancelled" ? "" : `<button type="button" data-booking-action="service-day" data-booking-id="${escapeHtml(booking.id || "")}">Service day</button>`}
                  ${status === "cancelled" || status === "completed" ? "" : `<button type="button" data-booking-action="reschedule" data-booking-id="${escapeHtml(booking.id || "")}">Reschedule</button>`}
                  ${status === "completed" || status === "cancelled" ? "" : `<button type="button" data-booking-action="cancel" data-booking-id="${escapeHtml(booking.id || "")}">Cancel</button>`}
                </div>
              </article>
            `;
          })
          .join("");

        return `
          <section class="stylist-day-group">
            <div class="stylist-day-group-head">
              <div>
                <strong>${escapeHtml(stylistName)}</strong>
                <small>${escapeHtml(rosterMember ? cap(String(rosterMember.availability || "off_duty").replaceAll("_", " ")) : stylistName === "Unassigned" ? "Needs assignment" : "Not in current roster")}</small>
              </div>
              <div>
                <small>${escapeHtml(String(bookings.length))} booking${bookings.length === 1 ? "" : "s"}</small>
                <small>${escapeHtml(currency(totalRevenue))}</small>
              </div>
            </div>
            <div class="agenda-list">${items}</div>
          </section>
        `;
      })
      .join("");
    return;
  }

  els.selectedDayAgenda.innerHTML = visibleRows
    .map((booking) => {
      const status = String(booking.status || "").toLowerCase();
      const serviceState = bookingServiceState(booking);
      const stylistName = bookingStylistName(booking);
      const stylistConflicts = stylistName
        ? buildStylistConflictSummary({
            date: booking.date,
            time: booking.time,
            serviceName: booking.service,
            stylistName,
            excludeBookingId: booking.id
          })
        : [];
      const cleanNotes = parseBookingNotesMeta(booking.notes || "").cleanNotes;
      return `
        <article class="agenda-item">
          <div class="agenda-item-meta">
            <strong>${escapeHtml(booking.time || "")} - ${escapeHtml(booking.customerName || "Guest")}</strong>
            <span class="${serviceStateTone(serviceState)}">${escapeHtml(serviceStateLabel(serviceState))}</span>
          </div>
          <small>${escapeHtml(booking.service || "Service")} - ${escapeHtml(currency(booking.price || 0))}</small>
          <small>${escapeHtml(stylistName || "No stylist assigned yet")}${stylistConflicts.length ? ` - ${escapeHtml("Stylist clash to review")}` : ""}</small>
          <small>${escapeHtml(booking.customerPhone || "")}${booking.customerEmail ? ` - ${escapeHtml(booking.customerEmail)}` : ""}</small>
          ${cleanNotes ? `<small>${escapeHtml(cleanNotes)}</small>` : ""}
          <div class="agenda-item-actions">
            ${status === "cancelled" ? "" : `<button type="button" data-booking-action="service-day" data-booking-id="${escapeHtml(booking.id || "")}">Service day</button>`}
            ${status === "cancelled" || status === "completed" ? "" : `<button type="button" data-booking-action="reschedule" data-booking-id="${escapeHtml(booking.id || "")}">Reschedule</button>`}
            ${status === "completed" || status === "cancelled" ? "" : `<button type="button" data-booking-action="cancel" data-booking-id="${escapeHtml(booking.id || "")}">Cancel</button>`}
          </div>
        </article>
      `;
    })
    .join("");
}

function countOnDuty() {
  const members = Array.isArray(state.staff?.members) ? state.staff.members : [];
  return members.filter((member) => String(member.availability || "").toLowerCase() === "on_duty").length;
}

function renderSubscriberMetrics() {
  const d = state.dashboard;
  if (!d) return;
  const dueSoonCount = Array.isArray(d.communications?.dueSoon) ? d.communications.dueSoon.length : 0;
  const teamCount = Array.isArray(state.staff?.members) ? state.staff.members.length : 0;
  const onDutyCount = countOnDuty();
  els.subscriberBookingsMetric.textContent = String(d.commandCenter?.today?.totalBookings || 0);
  els.subscriberBookingsMeta.textContent = `${d.commandCenter?.today?.confirmedBookings || 0} confirmed today`;
  els.subscriberRevenueMetric.textContent = currency(d.commandCenter?.today?.estimatedRevenue || 0);
  els.subscriberRevenueMeta.textContent = `${d.commandCenter?.today?.lastMinuteCancellations || 0} late cancellations`;
  els.subscriberLexiMetric.textContent = String(dueSoonCount);
  els.subscriberLexiMeta.textContent = dueSoonCount
    ? `${dueSoonCount} reminder${dueSoonCount === 1 ? "" : "s"} due in the next 24 hours`
    : "No automated reminders due in the next 24 hours";
  els.subscriberCoverageMetric.textContent = String(onDutyCount);
  els.subscriberCoverageMeta.textContent = teamCount
    ? `${teamCount} team member${teamCount === 1 ? "" : "s"} on the roster`
    : "No team members added yet";

  const actions = [
    ...(Array.isArray(d.commandCenter?.recommendedActions) ? d.commandCenter.recommendedActions.map((row) => [row.label, row.detail]) : []),
    ...(Array.isArray(d.operationsInsights?.noShowRisk)
      ? d.operationsInsights.noShowRisk.slice(0, 2).map((row) => [`No-show risk: ${row.customerName}`, `${row.service} at ${row.time}. ${row.reasons?.[0] || "Needs proactive confirmation."}`])
      : []),
    ...(Array.isArray(d.operationsInsights?.rebookingPrompts)
      ? d.operationsInsights.rebookingPrompts.slice(0, 2).map((row) => [`Rebooking: ${row.customerName}`, row.suggestedMessage])
      : [])
  ];

  els.subscriberOpsList.innerHTML = actions.length
    ? actions.map(([title, body]) => `<article class="ops-item"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`).join("")
    : '<div class="empty-state">No urgent actions. Lexi will surface anything that needs attention.</div>';
}

function renderSubscriberOnboarding() {
  if (!els.subscriberOnboardingCard || !els.subscriberOnboardingContent) return;
  const hasBookings = Array.isArray(state.bookings) && state.bookings.length > 0;
  const hasCustomers = Array.isArray(state.subscriberCustomers) && state.subscriberCustomers.length > 0;
  const hasTeam = Array.isArray(state.staff?.members) && state.staff.members.length > 0;
  const hasOffers =
    getActiveCommercialRows("memberships").length ||
    getActiveCommercialRows("packages").length ||
    getActiveCommercialRows("merch").length;
  const needsSetup = !hasBookings || !hasCustomers || !hasTeam || !hasOffers;

  if (!needsSetup) {
    els.subscriberOnboardingCard.hidden = true;
    return;
  }

  els.subscriberOnboardingCard.hidden = false;
  const steps = [
    {
      done: hasBookings,
      title: "Start using the diary",
      detail: hasBookings ? "Your diary already has bookings running through it." : "Add the first booking so the diary, recovery tools, and revenue views come alive."
    },
    {
      done: hasCustomers,
      title: "Build customer history",
      detail: hasCustomers ? "Customer records are already building from your bookings." : "As bookings come in, customer history, rebooking prompts, and notes will start filling up."
    },
    {
      done: hasTeam,
      title: "Set up your rota",
      detail: hasTeam ? "Your team planner is ready to help with coverage and styling assignments." : "Add team members so Lexi can spot cover gaps and stylist clashes properly."
    },
    {
      done: hasOffers,
      title: "Make checkout stronger",
      detail: hasOffers ? "Your checkout hub already has offers or retail to work with." : "Set up a membership, package, or retail product so checkout becomes a repeat-revenue moment."
    }
  ];

  els.subscriberOnboardingContent.innerHTML = `
    <div class="insight-grid insight-grid-two">
      <div class="insight-panel">
        <h3>Your first setup steps</h3>
        <div class="channel-list">
          ${steps
            .map(
              (step) => `
                <article class="channel-row">
                  <div>
                    <strong>${escapeHtml(step.title)}</strong>
                    <small>${escapeHtml(step.detail)}</small>
                  </div>
                  <div>
                    <small class="${step.done ? "status-positive" : "status-neutral"}">${step.done ? "Done" : "Next"}</small>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="insight-panel">
        <h3>Quick actions</h3>
        <div class="agenda-item-actions">
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="add-booking">Add first booking</button>
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="open-checkout">Open checkout hub</button>
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="ask-lexi-subscriber">Ask Lexi what to set up</button>
        </div>
        <small>Lexi can guide a salon owner through setup in plain language.</small>
      </div>
    </div>
  `;
}

function buildSubscriberCustomers() {
  const nowMs = Date.now();
  const groups = new Map();
  state.bookings.forEach((booking) => {
    const key = customerKeyForBooking(booking);
    const current =
      groups.get(key) ||
      {
        key,
        customerName: String(booking.customerName || "Client").trim(),
        customerEmail: String(booking.customerEmail || "").trim().toLowerCase(),
        customerPhone: String(booking.customerPhone || "").trim(),
        bookings: [],
        spend: 0,
        cancelledCount: 0,
        services: new Set(),
        nextBooking: null,
        lastVisit: null
      };

    current.bookings.push(booking);
    current.services.add(String(booking.service || "").trim());
    if (String(booking.status || "").toLowerCase() === "cancelled") {
      current.cancelledCount += 1;
    } else {
      current.spend += Number(booking.price || 0);
    }

    const startsAt = new Date(`${booking.date}T${booking.time || "00:00"}:00`).getTime();
    if (!Number.isNaN(startsAt)) {
      if (startsAt >= nowMs && String(booking.status || "").toLowerCase() === "confirmed") {
        if (!current.nextBooking || startsAt < current.nextBooking.startsAt) {
          current.nextBooking = { ...booking, startsAt };
        }
      }
      if (startsAt < nowMs && String(booking.status || "").toLowerCase() !== "cancelled") {
        if (!current.lastVisit || startsAt > current.lastVisit.startsAt) {
          current.lastVisit = { ...booking, startsAt };
        }
      }
    }

    groups.set(key, current);
  });

  const prompts = Array.isArray(state.dashboard?.operationsInsights?.rebookingPrompts) ? state.dashboard.operationsInsights.rebookingPrompts : [];
  const customerRecords = Array.isArray(state.customerRecords?.records) ? state.customerRecords.records : [];
  return Array.from(groups.values())
    .map((customer) => {
      const prompt = prompts.find((row) => row.customerKey === customer.key) || null;
      const record = customerRecords.find((row) => row.customerKey === customer.key) || null;
      const visits = customer.bookings.filter((row) => String(row.status || "").toLowerCase() !== "cancelled").length;
      const daysSinceLastVisit = customer.lastVisit
        ? Math.floor((nowMs - customer.lastVisit.startsAt) / (1000 * 60 * 60 * 24))
        : null;
      return {
        ...customer,
        spend: Number(customer.spend.toFixed(2)),
        visits,
        services: Array.from(customer.services).filter(Boolean),
        daysSinceLastVisit,
        suggestedMessage: prompt?.suggestedMessage || "",
        lastService: prompt?.lastService || customer.lastVisit?.service || "",
        customerRecord: record
      };
    })
    .sort((a, b) => (b.nextBooking ? 1 : 0) - (a.nextBooking ? 1 : 0) || b.visits - a.visits || b.spend - a.spend);
}

function filteredSubscriberCustomers() {
  const query = String(state.subscriberCustomerQuery || "").trim().toLowerCase();
  if (!query) return state.subscriberCustomers;
  return state.subscriberCustomers.filter((customer) =>
    [customer.customerName, customer.customerEmail, customer.customerPhone, ...(customer.services || [])]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

function renderSubscriberCustomerTable() {
  if (!els.subscriberCustomerTable) return;
  const customers = filteredSubscriberCustomers();
  els.subscriberCustomerTable.innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
            <article class="admin-row ${customer.key === state.selectedSubscriberCustomerKey ? "is-selected" : ""}" data-subscriber-customer-key="${escapeHtml(
              customer.key || ""
            )}">
              <div>
                <strong>${escapeHtml(customer.customerName || "Client")}</strong>
                <small>${escapeHtml(customer.customerEmail || customer.customerPhone || "No contact saved")}</small>
              </div>
              <div>
                <strong>${escapeHtml(String(customer.visits || 0))}</strong>
                <small>completed visits</small>
              </div>
              <div>
                <strong>${escapeHtml(currency(customer.spend || 0))}</strong>
                <small>lifetime spend</small>
              </div>
              <div>
                <strong>${escapeHtml(customer.nextBooking ? formatDateLong(customer.nextBooking.date || "") : "No booking")}</strong>
                <small>${escapeHtml(customer.nextBooking ? `${customer.nextBooking.time || ""} booked` : customer.daysSinceLastVisit !== null ? `${customer.daysSinceLastVisit} days since last visit` : "New contact")}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No customers match that search yet.</div>';
}

function renderSubscriberCustomerDetail() {
  if (!els.subscriberCustomerDetail) return;
  const customer = state.subscriberCustomers.find((row) => row.key === state.selectedSubscriberCustomerKey) || null;
  if (!customer) {
    els.subscriberCustomerDetail.innerHTML = '<div class="empty-state">Select a customer to review their history and next step.</div>';
    return;
  }

  const recentBookings = [...customer.bookings]
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
    .slice(0, 4);
  const record = customer.customerRecord || null;
  const nextStep = customer.nextBooking
    ? `They already have ${customer.nextBooking.service} booked on ${formatDateLong(customer.nextBooking.date || "")} at ${customer.nextBooking.time || ""}.`
    : customer.suggestedMessage || "No follow-up prompt yet. Ask Lexi to suggest the best next move.";

  els.subscriberCustomerDetail.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(customer.customerName || "Client")}</strong>
      <small>${escapeHtml(customer.customerEmail || "No email saved")}</small>
      <small>${escapeHtml(customer.customerPhone || "No phone saved")}</small>
    </article>
    <article class="detail-card">
      <strong>Customer snapshot</strong>
      <small>${escapeHtml(String(customer.visits || 0))} completed visits</small>
      <small>${escapeHtml(currency(customer.spend || 0))} total spend</small>
      <small>${escapeHtml(String(customer.cancelledCount || 0))} cancelled bookings</small>
      <small>${escapeHtml(customer.daysSinceLastVisit !== null ? `${customer.daysSinceLastVisit} days since last visit` : "No completed visit yet")}</small>
    </article>
    <article class="detail-card">
      <strong>Services they book</strong>
      ${
        customer.services.length
          ? customer.services.map((service) => `<small>${escapeHtml(service)}</small>`).join("")
          : "<small>No services recorded yet.</small>"
      }
    </article>
    <article class="detail-card">
      <strong>Next step</strong>
      <small>${escapeHtml(nextStep)}</small>
      <div class="agenda-item-actions">
        <button type="button" data-subscriber-customer-action="book-again" data-subscriber-customer-key="${escapeHtml(customer.key || "")}">Book again</button>
        <button type="button" data-subscriber-customer-action="waitlist" data-subscriber-customer-key="${escapeHtml(customer.key || "")}">Add to waitlist</button>
        <button type="button" data-subscriber-customer-action="lexi" data-subscriber-customer-key="${escapeHtml(customer.key || "")}">Ask Lexi</button>
      </div>
    </article>
    <article class="detail-card">
      <strong>Client record</strong>
      <small>${escapeHtml(record?.allergies ? `Allergies or sensitivities: ${record.allergies}` : "No allergy or sensitivity notes saved yet.")}</small>
      <small>${escapeHtml(record?.formulaNotes ? `Colour formula: ${record.formulaNotes}` : "No colour formula saved yet.")}</small>
      <small>${escapeHtml(record?.visitPrepNotes ? `Visit prep: ${record.visitPrepNotes}` : "No visit-prep notes saved yet.")}</small>
      <small>${escapeHtml(record?.patchTestRequired ? "Patch test required before colour services." : "Patch test not currently flagged.")}</small>
    </article>
    <article class="detail-card">
      <strong>Edit client record</strong>
      <form class="compact-form" data-subscriber-customer-record-form="${escapeHtml(customer.key || "")}">
        <input type="text" name="preferredStylist" value="${escapeHtml(record?.preferredStylist || "")}" placeholder="Preferred stylist" />
        <textarea name="allergies" rows="2" placeholder="Allergies or sensitivities">${escapeHtml(record?.allergies || "")}</textarea>
        <textarea name="formulaNotes" rows="3" placeholder="Colour formula or technical notes">${escapeHtml(record?.formulaNotes || "")}</textarea>
        <textarea name="consultationNotes" rows="3" placeholder="Consultation notes">${escapeHtml(record?.consultationNotes || "")}</textarea>
        <textarea name="visitPrepNotes" rows="3" placeholder="Visit prep and aftercare notes">${escapeHtml(record?.visitPrepNotes || "")}</textarea>
        <label class="checkbox-line">
          <input type="checkbox" name="patchTestRequired" ${record?.patchTestRequired ? "checked" : ""} />
          Patch test required
        </label>
        <button class="btn btn-ghost btn-small" type="submit">Save client record</button>
      </form>
      <p class="form-message" data-subscriber-customer-record-state="${escapeHtml(customer.key || "")}"></p>
    </article>
    <article class="detail-card">
      <strong>Recent booking history</strong>
      ${
        recentBookings.length
          ? recentBookings
              .map(
                (booking) =>
                  `<small>${escapeHtml(formatDateLong(booking.date || ""))} - ${escapeHtml(booking.service || "Service")} - ${escapeHtml(
                    booking.time || ""
                  )} - ${escapeHtml(cap(booking.status || ""))}</small>`
              )
              .join("")
          : "<small>No booking history yet.</small>"
      }
    </article>
  `;
}

function renderRevenue() {
  if (!state.liveRevenue || !state.profitability) return;
  const live = state.liveRevenue;
  const profit = state.profitability.summary || {};
  els.revenueRangeValue.textContent = currency(live.cards?.todayRevenue || 0);
  els.revenueRangeMeta.textContent = `${live.cards?.todayBookings || 0} bookings in selected range`;
  els.revenueCancelRate.textContent = `${Number(live.gauges?.cancellationRatePct || 0).toFixed(1)}%`;
  els.revenueCancelMeta.textContent = `${currency(live.cards?.todayCancelledRevenue || 0)} cancelled value`;
  els.profitValue.textContent = currency(profit.estimatedProfit || 0);
  els.profitMeta.textContent = `${profit.profitMarginPercent ?? 0}% margin`;
  els.breakevenValue.textContent = currency(profit.breakevenRevenue || 0);
  els.breakevenMeta.textContent = `${currency(profit.totalCosts || 0)} total costs`;

  const bars = Array.isArray(live.stream?.hourly) ? live.stream.hourly : [];
  const max = Math.max(...bars.map((row) => Number(row.revenue || 0)), 1);
  els.revenueBars.innerHTML = bars.length
    ? bars
        .map((row) => {
          const pct = Math.max(6, Math.round((Number(row.revenue || 0) / max) * 100));
          return `
            <article class="chart-bar">
              <div class="chart-bar-track"><div class="chart-bar-fill" style="height:${pct}%"></div></div>
              <div class="chart-bar-label">${escapeHtml(row.label || "")}</div>
              <div class="chart-bar-label">${escapeHtml(currency(row.revenue || 0))}</div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No revenue bars are available for this range yet.</div>';
}

function renderRecoveryView() {
  const lateCancels = Number(state.dashboard?.commandCenter?.today?.lastMinuteCancellations || 0);
  const noShowRisk = Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : [];
  const rebookingPrompts = Array.isArray(state.dashboard?.operationsInsights?.rebookingPrompts) ? state.dashboard.operationsInsights.rebookingPrompts : [];
  const waitlistEntries = Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : [];
  const highRisk = noShowRisk.filter((row) => String(row.riskLevel || "").toLowerCase() === "high");
  const readyWaitlist = waitlistEntries.filter((row) => String(row.status || "").toLowerCase() === "waiting");

  if (els.recoveryLateCancelsMetric) els.recoveryLateCancelsMetric.textContent = String(lateCancels);
  if (els.recoveryLateCancelsMeta) {
    els.recoveryLateCancelsMeta.textContent = lateCancels ? "Same-day lost slots to backfill" : "No same-day cancellations right now";
  }
  if (els.recoveryHighRiskMetric) els.recoveryHighRiskMetric.textContent = String(highRisk.length);
  if (els.recoveryHighRiskMeta) {
    els.recoveryHighRiskMeta.textContent = highRisk.length ? "Bookings that need proactive confirmation" : "No high-risk bookings flagged";
  }
  if (els.recoveryRebookingMetric) els.recoveryRebookingMetric.textContent = String(rebookingPrompts.length);
  if (els.recoveryWaitlistMetric) els.recoveryWaitlistMetric.textContent = String(readyWaitlist.length);

  if (els.recoveryPriorityList) {
    const priorityRows = [
      ...highRisk.slice(0, 3).map(
        (row) => `
          <article class="channel-row ${state.selectedRecoveryItem?.type === "risk" && state.selectedRecoveryItem?.id === String(row.bookingId || row.id || "") ? "is-selected" : ""}" data-recovery-select-type="risk" data-recovery-select-id="${escapeHtml(String(row.bookingId || row.id || ""))}">
            <div>
              <strong>${escapeHtml(row.customerName || "Customer")}</strong>
              <small>${escapeHtml(row.service || "Service")} on ${escapeHtml(formatDateLong(row.date || ""))} at ${escapeHtml(row.time || "")}</small>
            </div>
            <div>
              <small>${escapeHtml(cap(row.riskLevel || "high"))} risk</small>
              <div class="agenda-item-actions">
                <button type="button" data-recovery-lexi="${escapeHtml(row.bookingId || row.id || "")}">Ask Lexi</button>
                <button type="button" data-recovery-open-day="${escapeHtml(row.date || "")}">Open day</button>
              </div>
            </div>
          </article>
        `
      ),
      ...readyWaitlist.slice(0, 3).map(
        (row) => `
          <article class="channel-row ${state.selectedRecoveryItem?.type === "waitlist" && state.selectedRecoveryItem?.id === String(row.id || "") ? "is-selected" : ""}" data-recovery-select-type="waitlist" data-recovery-select-id="${escapeHtml(String(row.id || ""))}">
            <div>
              <strong>${escapeHtml(row.customerName || "Client")}</strong>
              <small>${escapeHtml(row.service || "Service")} wanted ${escapeHtml(row.preferredDate || "soon")} ${escapeHtml(row.preferredTime || "")}</small>
            </div>
            <div>
              <small>Waitlist ready</small>
              <div class="agenda-item-actions">
                <button type="button" data-recovery-book-waitlist="${escapeHtml(row.id || "")}">Book slot</button>
                <button type="button" data-recovery-contact-waitlist="${escapeHtml(row.id || "")}">Mark contacted</button>
              </div>
            </div>
          </article>
        `
      )
    ];
    els.recoveryPriorityList.innerHTML = priorityRows.length
      ? priorityRows.join("")
      : '<div class="empty-state">No urgent recovery items right now.</div>';
  }

  if (els.recoveryActionList) {
    const actions = [
      lateCancels
        ? ["Backfill today", `${lateCancels} late cancellation${lateCancels === 1 ? "" : "s"} today. Check the waitlist and offer the nearest free times.`]
        : null,
      highRisk.length
        ? ["Confirm risky bookings", `${highRisk.length} high-risk booking${highRisk.length === 1 ? "" : "s"} need a reminder or quick confirmation.`]
        : null,
      rebookingPrompts.length
        ? ["Bring clients back in", `${rebookingPrompts.length} client${rebookingPrompts.length === 1 ? "" : "s"} are ready for a rebooking message.`]
        : null,
      readyWaitlist.length
        ? ["Use the waitlist", `${readyWaitlist.length} person${readyWaitlist.length === 1 ? "" : "s"} can help fill open slots.`]
        : null
    ].filter(Boolean);

    els.recoveryActionList.innerHTML = actions.length
      ? actions
          .map(
            ([title, body]) => `
              <article class="ops-item">
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(body)}</p>
                <button class="btn btn-ghost btn-small" type="button" data-recovery-action="${escapeHtml(title)}">Open</button>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">Recovery pressure is low right now. Lexi will surface the next issue when it appears.</div>';
  }

  renderRecoveryDetail(highRisk, readyWaitlist);
}

function renderAttribution() {
  const channels = Array.isArray(state.attribution?.channels) ? state.attribution.channels : [];
  els.channelList.innerHTML = channels.length
    ? channels
        .map(
          (row) => `
            <article class="channel-row">
              <div>
                <strong>${escapeHtml(row.label || row.channel || "Channel")}</strong>
                <small>${escapeHtml(String(row.bookings || 0))} bookings - ${escapeHtml(currency(row.spend || 0))} spend</small>
              </div>
              <div>
                <strong>${escapeHtml(currency(row.revenue || 0))}</strong>
                <small>${row.roiPercent === null ? "No ROI yet" : `${escapeHtml(String(row.roiPercent))}% ROI`}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No attribution data is available yet.</div>';
}

function renderIntegrations() {
  const providers = Array.isArray(state.integrations?.providers) ? state.integrations.providers : [];
  els.integrationList.innerHTML = providers.length
    ? providers
        .map(
          (row) => `
            <article class="integration-card">
              <div>
                <strong>${escapeHtml(cap(row.provider || ""))}</strong>
                <small>${row.connected ? `Connected as ${escapeHtml(row.accountLabel || "linked account")}` : "Not connected"}</small>
              </div>
              <div class="integration-card-actions">
                <small>${escapeHtml(row.syncMode || "daily")} sync</small>
                ${row.connected ? `<button type="button" data-disconnect-provider="${escapeHtml(row.provider || "")}">Disconnect</button>` : ""}
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No accounting integrations configured yet.</div>';
}

function renderTeam() {
  const members = Array.isArray(state.staff?.members) ? state.staff.members : [];
  els.teamList.innerHTML = members.length
    ? members
        .map(
          (row) => `
            <article class="team-row">
              <div>
                <strong>${escapeHtml(row.name || "Staff member")}</strong>
                <small>${escapeHtml(row.role || "staff")} - ${escapeHtml(row.availability || "off_duty")}</small>
              </div>
              <div><strong>${Array.isArray(row.shiftDays) ? row.shiftDays.length : 0} days</strong></div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No staff roster has been configured yet.</div>';
}

function renderTeamPlanner() {
  if (!els.teamPlannerGrid || !els.teamPlannerMeta || !els.teamPlannerEditor) return;
  const members = Array.isArray(state.staff?.members) ? state.staff.members : [];
  const week = state.staff?.rotaWeek || null;
  const weekStart = String(state.staffWeekStart || week?.weekStart || "").trim();
  if (!members.length) {
    els.teamPlannerMeta.textContent = "Add staff members to start planning the week.";
    els.teamPlannerGrid.innerHTML = '<div class="empty-state">No team members are available for weekly planning yet.</div>';
    els.teamPlannerEditor.innerHTML = '<small>Select a team member and day to edit the rota.</small>';
    return;
  }
  if (!weekStart) {
    els.teamPlannerMeta.textContent = "No weekly rota is available yet.";
    els.teamPlannerGrid.innerHTML = '<div class="empty-state">Weekly rota data is not available yet.</div>';
    els.teamPlannerEditor.innerHTML = '<small>Select a team member and day to edit the rota.</small>';
    return;
  }

  const dayLabels = Array.from({ length: 7 }, (_, index) => dayLabelFromWeekStart(weekStart, index));
  ensureSelectedTeamPlannerCell(members);
  const sicknessLogs = Array.isArray(week?.sicknessLogs) ? week.sicknessLogs : [];
  const sicknessCount = sicknessLogs.length;
  els.teamPlannerMeta.textContent = `Week starting ${formatDateLong(weekStart)}${sicknessCount ? ` - ${sicknessCount} sickness log${sicknessCount === 1 ? "" : "s"}` : ""}.`;

  const header = `
    <article class="team-planner-row is-head">
      <div class="team-planner-name">Team member</div>
      ${dayLabels.map((day) => `<div class="team-planner-cell"><strong>${escapeHtml(day.short)}</strong><small>${escapeHtml(day.day)}</small></div>`).join("")}
    </article>
  `;

  const rows = members
    .map((member) => {
      const dayCells = dayLabels
        .map((day, index) => {
          const rotaDayKey = rotaDayKeyFromIndex(index);
          const rotaCell = getDraftRotaCell(member.id, rotaDayKey, member);
          const status = rotaCell?.status || "off";
          const shift = rotaCell?.shift || (status === "off" ? "" : "full");
          const isSelected =
            state.selectedTeamPlannerCell?.staffId === member.id && state.selectedTeamPlannerCell?.dayKey === rotaDayKey;
          return `
            <button type="button" class="team-planner-cell ${isSelected ? "is-selected" : ""}" data-team-planner-staff-id="${escapeHtml(member.id || "")}" data-team-planner-day="${escapeHtml(rotaDayKey)}">
              <span class="team-planner-status is-${escapeHtml(status)}">${escapeHtml(cap(status))}</span>
              <small>${escapeHtml(shift ? cap(shift) : "No shift")}</small>
            </button>
          `;
        })
        .join("");
      return `
        <article class="team-planner-row">
          <div class="team-planner-name">
            <strong>${escapeHtml(member.name || "Team member")}</strong>
            <small>${escapeHtml(member.role || "staff")}</small>
          </div>
          ${dayCells}
        </article>
      `;
    })
    .join("");

  els.teamPlannerGrid.innerHTML = header + rows;

  const selectedMember = members.find((member) => member.id === state.selectedTeamPlannerCell?.staffId) || null;
  const selectedDayKey = String(state.selectedTeamPlannerCell?.dayKey || "").trim();
  const selectedDayIndex = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(selectedDayKey);
  const selectedDay = selectedDayIndex >= 0 ? dayLabelFromWeekStart(weekStart, selectedDayIndex) : null;
  const selectedCell = selectedMember && selectedDayKey ? getDraftRotaCell(selectedMember.id, selectedDayKey, selectedMember) : null;
  if (!selectedMember || !selectedCell || !selectedDay) {
    els.teamPlannerEditor.innerHTML = "<small>Select a planner cell to edit the rota for that day.</small>";
    return;
  }
  els.teamPlannerEditor.innerHTML = `
    <strong>${escapeHtml(selectedMember.name || "Team member")}</strong>
    <small>${escapeHtml(selectedMember.role || "staff")} - ${escapeHtml(selectedDay.short)} ${escapeHtml(selectedDay.day)}</small>
    <small>Current status: ${escapeHtml(cap(selectedCell.status || "off"))}${selectedCell.shift ? ` - ${escapeHtml(cap(selectedCell.shift))}` : ""}</small>
    <div class="agenda-filter-row">
      ${["scheduled", "available", "off", "sick", "covering"]
        .map(
          (status) =>
            `<button class="btn btn-ghost btn-small ${selectedCell.status === status ? "is-active" : ""}" type="button" data-team-planner-status="${escapeHtml(
              status
            )}">${escapeHtml(cap(status))}</button>`
        )
        .join("")}
    </div>
    <div class="agenda-filter-row">
      ${["full", "am", "pm"]
        .map(
          (shift) =>
            `<button class="btn btn-ghost btn-small ${selectedCell.shift === shift ? "is-active" : ""}" type="button" data-team-planner-shift="${escapeHtml(
              shift
            )}">${escapeHtml(cap(shift))}</button>`
        )
        .join("")}
    </div>
  `;
}

function renderServiceOptions() {
  const services = Array.isArray(state.business?.business?.services) ? state.business.business.services : [];
  els.quickBookingService.innerHTML = services.length
    ? services
        .map(
          (service) =>
            `<option value="${escapeHtml(service.name)}">${escapeHtml(service.name)} - ${escapeHtml(currency(service.price || 0))} - ${escapeHtml(String(service.durationMin || 0))} min</option>`
        )
        .join("")
    : '<option value="">No services configured</option>';
}

function setBookingMessage(text, mode = "neutral") {
  els.quickBookingMessage.textContent = String(text || "");
  els.quickBookingMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
  if (els.quickBookingModalMessage) {
    els.quickBookingModalMessage.textContent = String(text || "");
    els.quickBookingModalMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
  }
}

function setCampaignMessage(text, mode = "neutral") {
  if (!els.subscriberCampaignMessageState) return;
  els.subscriberCampaignMessageState.textContent = String(text || "");
  els.subscriberCampaignMessageState.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setSubscriberMessageBoardState(text, mode = "neutral") {
  if (!els.subscriberMessageBoardState) return;
  els.subscriberMessageBoardState.textContent = String(text || "");
  els.subscriberMessageBoardState.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setCustomerRecordMessage(customerKey, text, mode = "neutral") {
  const node = els.subscriberCustomerDetail?.querySelector(`[data-subscriber-customer-record-state="${customerKey}"]`);
  if (!(node instanceof HTMLElement)) return;
  node.textContent = String(text || "");
  node.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setWaitlistMessage(text, mode = "neutral") {
  if (!els.waitlistMessage) return;
  els.waitlistMessage.textContent = String(text || "");
  els.waitlistMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setRescheduleMessage(text, mode = "neutral") {
  if (!els.rescheduleMessage) return;
  els.rescheduleMessage.textContent = String(text || "");
  els.rescheduleMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function serviceStateLabel(value) {
  const stateValue = String(value || "").trim().toLowerCase();
  if (stateValue === "checked_in") return "Checked in";
  if (stateValue === "in_progress") return "In progress";
  if (stateValue === "completed") return "Completed";
  if (stateValue === "cancelled") return "Cancelled";
  return "Confirmed";
}

function serviceStateTone(value) {
  const stateValue = String(value || "").trim().toLowerCase();
  if (stateValue === "completed") return "status-positive";
  if (stateValue === "checked_in" || stateValue === "in_progress") return "status-neutral";
  if (stateValue === "cancelled") return "status-negative";
  return "status-positive";
}

function setServiceDayMessage(text, mode = "neutral") {
  if (!els.serviceDayMessage) return;
  els.serviceDayMessage.textContent = String(text || "");
  els.serviceDayMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setGiftCardIssueMessage(text, mode = "neutral") {
  if (!els.giftCardIssueMessage) return;
  els.giftCardIssueMessage.textContent = String(text || "");
  els.giftCardIssueMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function getActiveCommercialRows(type) {
  const rows = Array.isArray(state.commercialControls?.[type]) ? state.commercialControls[type] : [];
  return rows.filter((row) => String(row.status || "").trim().toLowerCase() === "active");
}

function selectedServiceDayBooking() {
  return state.bookings.find((row) => String(row.id || "") === String(state.serviceDayBookingId || "")) || null;
}

function prefillRebookFromBooking(booking, daysToAdd = 42) {
  if (!booking) return;
  const meta = parseBookingNotesMeta(booking.notes || "");
  state.bookingPrefillSource = "checkout";
  if (els.quickBookingCustomerName) els.quickBookingCustomerName.value = String(booking.customerName || "");
  if (els.quickBookingCustomerPhone) els.quickBookingCustomerPhone.value = String(booking.customerPhone || "");
  if (els.quickBookingCustomerEmail) els.quickBookingCustomerEmail.value = String(booking.customerEmail || "");
  if (els.quickBookingService) els.quickBookingService.value = String(booking.service || "");
  if (els.quickBookingStylist) els.quickBookingStylist.value = String(meta.stylistName || "");
  if (els.quickBookingDate) els.quickBookingDate.value = addDaysToDateKey(String(booking.date || state.selectedDate), daysToAdd);
  if (els.quickBookingTime) els.quickBookingTime.value = String(booking.time || "10:00");
  if (els.quickBookingNotes) {
    els.quickBookingNotes.value = [meta.aftercareNotes ? `Follow-up from last visit: ${meta.aftercareNotes}` : "", meta.cleanNotes || ""]
      .filter(Boolean)
      .join("\n");
  }
  renderQuickBookingPreview();
  refreshQuickBookingSuggestions();
  openQuickBookingModal();
}

function setRecoveryMessage(text, mode = "neutral") {
  if (!els.recoveryMessage) return;
  els.recoveryMessage.textContent = String(text || "");
  els.recoveryMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function setTeamPlannerMessage(text, mode = "neutral") {
  if (!els.teamPlannerMessage) return;
  els.teamPlannerMessage.textContent = String(text || "");
  els.teamPlannerMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function cap(value) {
  const text = String(value || "").trim();
  return text ? text.slice(0, 1).toUpperCase() + text.slice(1) : "";
}

function buildRiskReminderMessage(booking) {
  if (!booking) return "";
  return `Hi ${booking.customerName || "there"}, just confirming your ${booking.service || "appointment"} on ${formatDateLong(
    booking.date || ""
  )} at ${booking.time || ""}. Please reply if you need to change anything.`;
}

function updateSelectedRecoveryItem(highRisk = [], readyWaitlist = []) {
  const selected = state.selectedRecoveryItem;
  const selectedStillExists =
    selected &&
    ((selected.type === "risk" && highRisk.some((row) => String(row.bookingId || row.id || "") === selected.id)) ||
      (selected.type === "waitlist" && readyWaitlist.some((row) => String(row.id || "") === selected.id)));

  if (selectedStillExists) return;

  if (highRisk.length) {
    state.selectedRecoveryItem = {
      type: "risk",
      id: String(highRisk[0].bookingId || highRisk[0].id || "")
    };
    return;
  }

  if (readyWaitlist.length) {
    state.selectedRecoveryItem = {
      type: "waitlist",
      id: String(readyWaitlist[0].id || "")
    };
    return;
  }

  state.selectedRecoveryItem = null;
}

function renderRecoveryDetail(highRisk = [], readyWaitlist = []) {
  if (!els.recoveryDetailCard) return;
  updateSelectedRecoveryItem(highRisk, readyWaitlist);

  if (!state.selectedRecoveryItem) {
    els.recoveryDetailCard.innerHTML = '<div class="empty-state">Nothing urgent is selected right now.</div>';
    return;
  }

  if (state.selectedRecoveryItem.type === "risk") {
    const booking =
      highRisk.find((row) => String(row.bookingId || row.id || "") === state.selectedRecoveryItem.id) || highRisk[0] || null;
    if (!booking) {
      els.recoveryDetailCard.innerHTML = '<div class="empty-state">No high-risk bookings are available right now.</div>';
      return;
    }
    const reminderMessage = buildRiskReminderMessage(booking);
    els.recoveryDetailCard.innerHTML = `
      <article class="detail-card">
        <strong>${escapeHtml(booking.customerName || "Customer")}</strong>
        <small>${escapeHtml(booking.service || "Service")} on ${escapeHtml(formatDateLong(booking.date || ""))} at ${escapeHtml(booking.time || "")}</small>
        <small>${escapeHtml(String(booking.riskScore || 0))}/100 risk score</small>
        <small>${escapeHtml((booking.reasons || []).join(" ") || "Needs a quick reminder before the appointment.")}</small>
      </article>
      <article class="detail-card">
        <strong>Suggested reminder</strong>
        <small>${escapeHtml(reminderMessage)}</small>
        <div class="agenda-item-actions">
          <button type="button" data-recovery-copy-reminder="${escapeHtml(String(booking.bookingId || booking.id || ""))}">Copy reminder</button>
          <button type="button" data-recovery-mark-action="reminder_sent" data-recovery-booking-id="${escapeHtml(
            String(booking.bookingId || booking.id || "")
          )}">Reminder sent</button>
          <button type="button" data-recovery-mark-action="confirmed" data-recovery-booking-id="${escapeHtml(
            String(booking.bookingId || booking.id || "")
          )}">Marked confirmed</button>
        </div>
      </article>
    `;
    return;
  }

  const entry = readyWaitlist.find((row) => String(row.id || "") === state.selectedRecoveryItem.id) || readyWaitlist[0] || null;
  if (!entry) {
    els.recoveryDetailCard.innerHTML = '<div class="empty-state">No waitlist recovery item is available right now.</div>';
    return;
  }
  els.recoveryDetailCard.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(entry.customerName || "Client")}</strong>
      <small>${escapeHtml(entry.service || "Service")} requested</small>
      <small>${escapeHtml(entry.preferredDate || "Flexible date")} ${escapeHtml(entry.preferredTime || "")}</small>
      <small>${escapeHtml(entry.customerPhone || entry.customerEmail || "No contact saved")}</small>
    </article>
    <article class="detail-card">
      <strong>Suggested next step</strong>
      <small>Offer the nearest open slot and move quickly while demand is warm.</small>
      <div class="agenda-item-actions">
        <button type="button" data-recovery-book-waitlist="${escapeHtml(String(entry.id || ""))}">Book slot</button>
        <button type="button" data-recovery-contact-waitlist="${escapeHtml(String(entry.id || ""))}">Mark contacted</button>
      </div>
    </article>
  `;
}

function focusQuickBookingForCustomer(customer) {
  if (!customer || !els.quickBookingForm) return;
  state.bookingPrefillSource = "customer";
  const record = customer.customerRecord || null;
  if (els.quickBookingCustomerName) els.quickBookingCustomerName.value = String(customer.customerName || "");
  if (els.quickBookingCustomerPhone) els.quickBookingCustomerPhone.value = String(customer.customerPhone || "");
  if (els.quickBookingCustomerEmail) els.quickBookingCustomerEmail.value = String(customer.customerEmail || "");
  if (els.quickBookingService) {
    const targetService = String(customer.lastService || customer.services?.[0] || "").trim();
    if (targetService) {
      const option = Array.from(els.quickBookingService.options || []).find((row) => String(row.value || "").trim() === targetService);
      if (option) els.quickBookingService.value = targetService;
    }
  }
  if (els.quickBookingStylist) els.quickBookingStylist.value = String(record?.preferredStylist || "");
  if (els.quickBookingDate) els.quickBookingDate.value = state.selectedDate;
  if (els.quickBookingTime) els.quickBookingTime.value = "10:00";
  if (els.quickBookingNotes) {
    els.quickBookingNotes.value = [record?.visitPrepNotes, record?.patchTestRequired ? "Check patch test before confirming." : ""].filter(Boolean).join(" ");
  }
  openQuickBookingModal();
  renderQuickBookingPreview();
  setBookingMessage(`Booking form prepared for ${customer.customerName || "this customer"}.`);
}

function focusQuickBookingDraft(draft = {}) {
  if (!els.quickBookingForm) return;
  state.bookingPrefillSource = "recovery";
  const record = getCustomerRecordForDraft(draft);
  if (els.quickBookingCustomerName) els.quickBookingCustomerName.value = String(draft.customerName || "");
  if (els.quickBookingCustomerPhone) els.quickBookingCustomerPhone.value = String(draft.customerPhone || "");
  if (els.quickBookingCustomerEmail) els.quickBookingCustomerEmail.value = String(draft.customerEmail || "");
  if (els.quickBookingService) {
    const targetService = String(draft.service || "").trim();
    if (!targetService) {
      els.quickBookingService.selectedIndex = 0;
    } else {
      const option = Array.from(els.quickBookingService.options || []).find((row) => String(row.value || "").trim() === targetService);
      if (option) {
        els.quickBookingService.value = targetService;
      }
    }
  }
  if (els.quickBookingStylist) els.quickBookingStylist.value = String(draft.stylistName || record?.preferredStylist || "");
  if (els.quickBookingDate) els.quickBookingDate.value = String(draft.date || state.selectedDate || "");
  if (els.quickBookingTime) els.quickBookingTime.value = String(draft.time || "10:00");
  if (els.quickBookingNotes) {
    els.quickBookingNotes.value = String(draft.notes || [record?.visitPrepNotes, record?.patchTestRequired ? "Check patch test before confirming." : ""].filter(Boolean).join(" "));
  }
  openQuickBookingModal();
  renderQuickBookingPreview();
  setBookingMessage(`Booking form prepared for ${draft.customerName || "this client"}.`);
}

function focusWaitlistForCustomer(customer) {
  if (!customer || !els.waitlistForm) return;
  if (els.waitlistCustomerName) els.waitlistCustomerName.value = String(customer.customerName || "");
  if (els.waitlistCustomerPhone) els.waitlistCustomerPhone.value = String(customer.customerPhone || "");
  if (els.waitlistCustomerEmail) els.waitlistCustomerEmail.value = String(customer.customerEmail || "");
  if (els.waitlistService) els.waitlistService.value = String(customer.lastService || customer.services?.[0] || "");
  if (els.waitlistPreferredDate) els.waitlistPreferredDate.value = state.selectedDate;
  if (els.waitlistPreferredTime) els.waitlistPreferredTime.value = "";
  if (els.waitlistNotes) {
    els.waitlistNotes.value = customer.nextBooking
      ? `Customer already has ${customer.nextBooking.service} booked on ${customer.nextBooking.date} at ${customer.nextBooking.time}.`
      : "Added from customer view for quick follow-up.";
  }
  setWaitlistMessage(`Waitlist form prepared for ${customer.customerName || "this customer"}.`);
  els.waitlistForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setSelectedDayFilter(filter) {
  state.selectedDayFilter = filter;
  els.selectedDayFilters?.querySelectorAll("[data-day-filter]").forEach((row) => {
    row.classList.toggle("is-active", row.getAttribute("data-day-filter") === filter);
  });
}

function setSelectedDayView(view) {
  state.selectedDayView = view;
  els.selectedDayViews?.querySelectorAll("[data-day-view]").forEach((row) => {
    row.classList.toggle("is-active", row.getAttribute("data-day-view") === view);
  });
}

function focusCampaignForCustomer(customerKey) {
  const segments = Array.isArray(state.crmSegments?.segments) ? state.crmSegments.segments : [];
  for (const segment of segments) {
    const lead = Array.isArray(segment.leads) ? segment.leads.find((row) => row.customerKey === customerKey) : null;
    if (lead) {
      state.selectedSegmentLead = { segmentId: segment.id, customerKey };
      renderSegments();
      setCampaignMessage(`Follow-up prepared for ${lead.customerName || "this client"}.`);
      els.subscriberCampaignForm?.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
  }
  return false;
}

function renderSegments() {
  const segments = Array.isArray(state.crmSegments?.segments) ? state.crmSegments.segments : [];
  if (!els.subscriberSegmentsList || !els.subscriberSegmentDetail) return;

  els.subscriberSegmentsList.innerHTML = segments.length
    ? segments
        .map((segment) => {
          const leads = Array.isArray(segment.leads) ? segment.leads : [];
          const firstLead = leads[0] || null;
          const selected =
            state.selectedSegmentLead &&
            state.selectedSegmentLead.segmentId === segment.id &&
            state.selectedSegmentLead.customerKey === firstLead?.customerKey;
          return `
            <article class="ops-item ${selected ? "is-selected" : ""}" data-segment-id="${escapeHtml(segment.id || "")}" data-customer-key="${escapeHtml(firstLead?.customerKey || "")}">
              <strong>${escapeHtml(segment.label || "Group")}</strong>
              <p>${escapeHtml(String(leads.length))} people in this group.</p>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No follow-up groups are available yet.</div>';

  if (!state.selectedSegmentLead && segments.length) {
    const firstSegment = segments.find((segment) => Array.isArray(segment.leads) && segment.leads.length);
    if (firstSegment) {
      state.selectedSegmentLead = {
        segmentId: firstSegment.id,
        customerKey: firstSegment.leads[0].customerKey
      };
    }
  }

  const selectedSegment = segments.find((segment) => segment.id === state.selectedSegmentLead?.segmentId) || null;
  const selectedLead = selectedSegment?.leads?.find((lead) => lead.customerKey === state.selectedSegmentLead?.customerKey) || null;

  els.subscriberSegmentDetail.innerHTML = selectedLead
    ? `
        <article class="detail-card">
          <strong>${escapeHtml(selectedLead.customerName || "Client")}</strong>
          <small>${escapeHtml(selectedSegment?.label || "Follow-up group")}</small>
          <small>${escapeHtml(String(selectedLead.daysSinceLastVisit ?? ""))} days since last visit - ${escapeHtml(currency(selectedLead.totalSpend || 0))} total spend</small>
        </article>
        <article class="detail-card">
          <strong>Suggested message</strong>
          <small>${escapeHtml(selectedLead.message || "")}</small>
        </article>
      `
    : '<div class="empty-state">Choose a follow-up group to see a suggested message.</div>';

  if (els.subscriberCampaignMessage) {
    els.subscriberCampaignMessage.value = selectedLead?.message || "";
  }
}

function renderWaitlist() {
  const summary = state.waitlist?.summary || {};
  const entries = Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : [];
  if (els.waitlistTotalMetric) els.waitlistTotalMetric.textContent = String(summary.totalEntries || 0);
  if (els.waitlistTotalMeta) els.waitlistTotalMeta.textContent = entries.length ? "People still interested in booking" : "No waitlist entries yet";
  if (els.waitlistWaitingMetric) els.waitlistWaitingMetric.textContent = String(summary.waitingCount || 0);
  if (els.waitlistContactedMetric) els.waitlistContactedMetric.textContent = String(summary.contactedCount || 0);
  if (els.waitlistBookedMetric) els.waitlistBookedMetric.textContent = String(summary.bookedCount || 0);

  if (!els.waitlistEntries) return;
  els.waitlistEntries.innerHTML = entries.length
    ? entries
        .map(
          (entry) => `
            <article class="channel-row">
              <div>
                <strong>${escapeHtml(entry.customerName || "Client")}</strong>
                <small>${escapeHtml(entry.service || "Service")} - ${escapeHtml(entry.preferredDate || "Flexible")} ${escapeHtml(entry.preferredTime || "")}</small>
              </div>
              <div class="agenda-item-actions">
                <small>${escapeHtml(entry.status || "waiting")}</small>
                ${entry.status === "waiting" ? `<button type="button" data-waitlist-contact="${escapeHtml(entry.id || "")}">Mark contacted</button>` : ""}
                <button type="button" data-waitlist-delete="${escapeHtml(entry.id || "")}">Remove</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No one is on the waitlist yet.</div>';

  renderSubscriberMessagingBoard();
}

function renderCheckoutHub() {
  const memberships = getActiveCommercialRows("memberships");
  const packages = getActiveCommercialRows("packages");
  const giftCards = getActiveCommercialRows("giftCards");
  const merch = getActiveCommercialRows("merch");
  const summary = state.commercialControls?.summary || {};
  const activeBooking = selectedServiceDayBooking();

  if (els.checkoutMembershipMetric) els.checkoutMembershipMetric.textContent = String(summary.activeMemberships || memberships.length || 0);
  if (els.checkoutMembershipMeta) {
    els.checkoutMembershipMeta.textContent = memberships.length
      ? `${memberships[0].name}${memberships.length > 1 ? ` + ${memberships.length - 1} more` : ""}`
      : "No active memberships are set up yet";
  }
  if (els.checkoutPackageMetric) els.checkoutPackageMetric.textContent = String(summary.activePackages || packages.length || 0);
  if (els.checkoutPackageMeta) {
    els.checkoutPackageMeta.textContent = packages.length
      ? `${packages[0].name}${packages.length > 1 ? ` + ${packages.length - 1} more` : ""}`
      : "No active packages are set up yet";
  }
  if (els.checkoutGiftCardMetric) els.checkoutGiftCardMetric.textContent = String(summary.activeGiftCards || giftCards.length || 0);
  if (els.checkoutGiftCardMeta) {
    els.checkoutGiftCardMeta.textContent = giftCards.length
      ? `${currency(summary.outstandingGiftBalance || 0)} still active across issued gift cards`
      : "No active gift cards are currently outstanding";
  }
  if (els.checkoutRetailMetric) els.checkoutRetailMetric.textContent = String(summary.activeMerchItems || merch.length || 0);
  if (els.checkoutRetailMeta) {
    els.checkoutRetailMeta.textContent = merch.length
      ? `${merch.filter((item) => Number(item.inventory || 0) > 0).length} product${merch.filter((item) => Number(item.inventory || 0) > 0).length === 1 ? "" : "s"} in stock`
      : "No retail products are live yet";
  }

  if (els.checkoutOffersList) {
    const offerRows = [
      ...memberships.slice(0, 3).map((row) => ({
        kind: "Membership",
        title: row.name,
        detail: `${currency(row.price || 0)} / ${row.billingCycle || "month"}`,
        meta: row.benefits || "Recurring visit support"
      })),
      ...packages.slice(0, 3).map((row) => ({
        kind: "Package",
        title: row.name,
        detail: `${currency(row.price || 0)} for ${row.sessionCount || 0} session${row.sessionCount === 1 ? "" : "s"}`,
        meta: `${row.remainingSessions || 0} session${row.remainingSessions === 1 ? "" : "s"} remaining`
      }))
    ];
    els.checkoutOffersList.innerHTML = offerRows.length
      ? offerRows
          .map(
            (row) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(row.title)}</strong>
                  <small>${escapeHtml(row.kind)} - ${escapeHtml(row.detail)}</small>
                </div>
                <div>
                  <small>${escapeHtml(row.meta)}</small>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">Set up memberships or packages to give the team stronger checkout options.</div>';
  }

  if (els.checkoutRetailList) {
    const retailRows = [
      ...merch.slice(0, 4).map((row) => ({
        type: "retail",
        id: row.id,
        title: row.name,
        detail: `${currency(row.salePrice || 0)}${Number(row.inventory || 0) > 0 ? ` - ${row.inventory} in stock` : " - out of stock"}`,
        meta: row.description || "Retail recommendation"
      })),
      ...giftCards.slice(0, 2).map((row) => ({
        type: "gift-card",
        id: row.id,
        title: `Gift card ${row.code || ""}`.trim(),
        detail: `${currency(row.remainingBalance || 0)} remaining`,
        meta: `For ${row.recipientName || "recipient"}`
      }))
    ];
    els.checkoutRetailList.innerHTML = retailRows.length
      ? retailRows
          .map(
            (row) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(row.title)}</strong>
                  <small>${escapeHtml(row.detail)}</small>
                </div>
                <div class="agenda-item-actions">
                  <small>${escapeHtml(row.meta)}</small>
                  ${
                    row.type === "retail"
                      ? `<button type="button" data-checkout-retail-name="${escapeHtml(row.title)}">Use in aftercare</button>`
                      : ""
                  }
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No retail or gift-card items are active yet.</div>';
  }

  if (els.checkoutGuidanceCard) {
    if (activeBooking) {
      const serviceState = bookingServiceState(activeBooking);
      const recommendedRetail = merch[0] || null;
      els.checkoutGuidanceCard.innerHTML = `
        <article class="detail-card">
          <strong>${escapeHtml(activeBooking.customerName || "Client")}</strong>
          <small>${escapeHtml(activeBooking.service || "Service")} - ${escapeHtml(serviceStateLabel(serviceState))}</small>
          <small>${
            serviceState === "completed"
              ? "Best next move: rebook now while the visit is fresh and recommend one retail or package add-on."
              : "Once the service is complete, use rebook and retail actions here to protect retention."
          }</small>
          <div class="agenda-item-actions">
            <button type="button" data-checkout-action="rebook-current">Rebook next visit</button>
            <button type="button" data-checkout-action="lexi-current">Ask Lexi</button>
          </div>
          <small>${escapeHtml(
            recommendedRetail ? `Suggested retail prompt: recommend ${recommendedRetail.name} in the aftercare notes.` : "No active retail products yet."
          )}</small>
        </article>
      `;
    } else {
      els.checkoutGuidanceCard.innerHTML = `
        <article class="detail-card">
          <strong>Checkout flow</strong>
          <small>Open Service day on a live booking, complete the visit, then rebook the next appointment from here.</small>
          <small>Retail recommendations can also be pushed into the aftercare notes from the product list.</small>
        </article>
      `;
    }
  }
}

function buildSubscriberMessageTasks() {
  const noShowRisk = Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : [];
  const rebookingPrompts = Array.isArray(state.dashboard?.operationsInsights?.rebookingPrompts) ? state.dashboard.operationsInsights.rebookingPrompts : [];
  const waitlistEntries = Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : [];
  const readyWaitlist = waitlistEntries.filter((row) => String(row.status || "").toLowerCase() === "waiting");

  return [
    ...rebookingPrompts.slice(0, 4).map((row) => ({
      key: `rebooking:${row.customerKey}`,
      type: "rebooking",
      priority: 1,
      customerKey: row.customerKey,
      customerName: row.customerName,
      service: row.lastService,
      title: `Rebook ${row.customerName || "client"}`,
      summary: `${row.daysSinceLastVisit || 0} days since last visit`,
      message: row.suggestedMessage || `Hi ${row.customerName || "there"}, we have fresh availability if you would like to book your next visit.`,
      meta: "Bring this client back in"
    })),
    ...noShowRisk
      .filter((row) => String(row.riskLevel || "").toLowerCase() === "high")
      .slice(0, 4)
      .map((row) => ({
        key: `risk:${row.bookingId || row.id}`,
        type: "risk",
        priority: 2,
        bookingId: String(row.bookingId || row.id || ""),
        customerName: row.customerName,
        service: row.service,
        date: row.date,
        time: row.time,
        title: `Confirm ${row.customerName || "booking"}`,
        summary: `${row.service || "Service"} on ${formatDateLong(row.date || "")} at ${row.time || ""}`,
        message: buildRiskReminderMessage(row),
        meta: `${cap(row.riskLevel || "high")} risk`
      })),
    ...readyWaitlist.slice(0, 4).map((row) => ({
      key: `waitlist:${row.id}`,
      type: "waitlist",
      priority: 3,
      entryId: String(row.id || ""),
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      customerEmail: row.customerEmail,
      service: row.service,
      date: row.preferredDate,
      time: row.preferredTime,
      title: `Offer a slot to ${row.customerName || "client"}`,
      summary: `${row.service || "Service"} wanted ${row.preferredDate || "soon"} ${row.preferredTime || ""}`.trim(),
      message: `Hi ${row.customerName || "there"}, a slot has opened for ${row.service || "your requested service"}. Reply if you would like me to hold it for you.`,
      meta: "Waitlist ready"
    }))
  ].sort((a, b) => a.priority - b.priority);
}

function renderSubscriberMessagingBoard() {
  if (!els.subscriberMessageQueue || !els.subscriberMessageDetail) return;
  const tasks = buildSubscriberMessageTasks();
  if (!state.selectedSubscriberMessageKey || !tasks.some((task) => task.key === state.selectedSubscriberMessageKey)) {
    state.selectedSubscriberMessageKey = tasks.length ? tasks[0].key : "";
  }
  const selected = tasks.find((task) => task.key === state.selectedSubscriberMessageKey) || null;

  if (els.messageQueueMetric) els.messageQueueMetric.textContent = String(tasks.length);
  if (els.messageQueueMeta) els.messageQueueMeta.textContent = tasks.length ? "People or bookings ready for outreach" : "No messages need action right now";
  if (els.messageRebookingMetric) els.messageRebookingMetric.textContent = String(tasks.filter((task) => task.type === "rebooking").length);
  if (els.messageRiskMetric) els.messageRiskMetric.textContent = String(tasks.filter((task) => task.type === "risk").length);
  if (els.messageWaitlistMetric) els.messageWaitlistMetric.textContent = String(tasks.filter((task) => task.type === "waitlist").length);

  els.subscriberMessageQueue.innerHTML = tasks.length
    ? tasks
        .map(
          (task) => `
            <article class="channel-row ${task.key === state.selectedSubscriberMessageKey ? "is-selected" : ""}" data-message-task-key="${escapeHtml(task.key)}">
              <div>
                <strong>${escapeHtml(task.title)}</strong>
                <small>${escapeHtml(task.summary)}</small>
              </div>
              <div>
                <small>${escapeHtml(task.meta)}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No message queue right now. Lexi will surface the next outreach opportunity when it appears.</div>';

  if (!selected) {
    els.subscriberMessageDetail.innerHTML = '<div class="empty-state">Select a message task to see the recommended wording and next action.</div>';
    return;
  }

  const actionButtons =
    selected.type === "rebooking"
      ? `
          <button type="button" data-message-action="load-follow-up" data-message-task-key="${escapeHtml(selected.key)}">Load follow-up</button>
          <button type="button" data-message-action="ask-lexi" data-message-task-key="${escapeHtml(selected.key)}">Ask Lexi</button>
        `
      : selected.type === "risk"
        ? `
            <button type="button" data-message-action="copy-message" data-message-task-key="${escapeHtml(selected.key)}">Copy reminder</button>
            <button type="button" data-message-action="open-recovery" data-message-task-key="${escapeHtml(selected.key)}">Open recovery</button>
          `
        : `
            <button type="button" data-message-action="copy-message" data-message-task-key="${escapeHtml(selected.key)}">Copy offer</button>
            <button type="button" data-message-action="book-slot" data-message-task-key="${escapeHtml(selected.key)}">Book slot</button>
          `;

  els.subscriberMessageDetail.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(selected.customerName || "Client")}</strong>
      <small>${escapeHtml(selected.summary)}</small>
      <small>${escapeHtml(selected.meta)}</small>
    </article>
    <article class="detail-card">
      <strong>Recommended message</strong>
      <small>${escapeHtml(selected.message)}</small>
      <div class="agenda-item-actions">
        ${actionButtons}
      </div>
    </article>
  `;
}

function renderCommunicationStatus() {
  const summary = state.dashboard?.communications?.summary || {};
  const recent = Array.isArray(state.dashboard?.communications?.recent) ? state.dashboard.communications.recent : [];
  const dueSoon = Array.isArray(state.dashboard?.communications?.dueSoon) ? state.dashboard.communications.dueSoon : [];
  const readiness = state.dashboard?.communications?.readiness || {};
  const reminderCount = Number(summary.remindersLogged || 0);
  const confirmedCount = Number(summary.confirmationsLogged || 0);
  const rebookingCount = Number(summary.rebookingLogged || 0);
  const readyLabel = String(readiness.label || "Checking setup");
  const coveragePct = Number(readiness.contactCoveragePct || 0);
  const reachableUpcoming = Number(readiness.reachableUpcoming || 0);
  const upcomingBookings = Number(readiness.upcomingBookings || 0);
  const deliveryCount = Number(summary.notificationsSent || 0);
  const failedCount = Number(summary.notificationsFailed || 0);
  const confirmationDeliveryCount = Number(summary.confirmationNotificationsSent || 0);
  const scheduledReminderSentCount = Number(summary.scheduledReminderNotificationsSent || 0);
  const scheduledReminderFailedCount = Number(summary.scheduledReminderNotificationsFailed || 0);

  if (els.commReminderMetric) els.commReminderMetric.textContent = String(reminderCount);
  if (els.commReminderMeta) {
    els.commReminderMeta.textContent = reminderCount
      ? `${reminderCount} reminder action${reminderCount === 1 ? "" : "s"} logged in the last 30 days`
      : "No reminder activity logged in the last 30 days";
  }
  if (els.commConfirmedMetric) els.commConfirmedMetric.textContent = String(confirmedCount);
  if (els.commConfirmedMeta) {
    els.commConfirmedMeta.textContent = confirmedCount
      ? `${confirmedCount} booking confirmation${confirmedCount === 1 ? "" : "s"} marked`
      : "No booking confirmations have been marked yet";
  }
  if (els.commRebookingMetric) els.commRebookingMetric.textContent = String(rebookingCount);
  if (els.commRebookingMeta) {
    els.commRebookingMeta.textContent = rebookingCount
      ? `${rebookingCount} rebooking prompt${rebookingCount === 1 ? "" : "s"} marked as sent`
      : "No rebooking prompts have been marked as sent yet";
  }
  if (els.commReadyMetric) els.commReadyMetric.textContent = readyLabel;
  if (els.commReadyMeta) {
    els.commReadyMeta.textContent = String(readiness.summary || "Checking reminder setup and live delivery activity.");
  }
  if (els.commCoverageMetric) els.commCoverageMetric.textContent = `${coveragePct}%`;
  if (els.commCoverageMeta) {
    els.commCoverageMeta.textContent = upcomingBookings
      ? `${reachableUpcoming} of ${upcomingBookings} upcoming booking${upcomingBookings === 1 ? "" : "s"} have contact details`
      : "No upcoming confirmed bookings need contact checks yet";
  }
  if (els.commDeliveryMetric) els.commDeliveryMetric.textContent = String(deliveryCount);
  if (els.commDeliveryMeta) {
    els.commDeliveryMeta.textContent = deliveryCount
      ? `${confirmationDeliveryCount} confirmation${confirmationDeliveryCount === 1 ? "" : "s"} and ${scheduledReminderSentCount} timed reminder${scheduledReminderSentCount === 1 ? "" : "s"} sent`
      : "No live delivery records have been logged yet";
  }
  if (els.commFailedMetric) els.commFailedMetric.textContent = String(failedCount);
  if (els.commFailedMeta) {
    els.commFailedMeta.textContent = failedCount
      ? `${scheduledReminderFailedCount} timed reminder failure${scheduledReminderFailedCount === 1 ? "" : "s"} and ${Math.max(
          0,
          failedCount - scheduledReminderFailedCount
        )} other delivery issue${failedCount - scheduledReminderFailedCount === 1 ? "" : "s"} recorded`
      : "No failed delivery attempts have been logged";
  }

  if (els.commRecentList) {
    const labelFor = (action, metadata) => {
      if (action === "booking.reminder_marked") return "Reminder logged";
      if (action === "booking.confirmation_marked") return "Booking confirmed";
      if (action === "rebooking.prompt_sent") return "Rebooking sent";
      if (action === "notification.delivery") {
        return String(metadata?.deliveryType || "") === "scheduled_reminder" ? "Timed reminder delivery" : "Booking confirmation delivery";
      }
      return "Communication update";
    };
    els.commRecentList.innerHTML = recent.length
      ? recent
          .slice(0, 8)
          .map((row) => `
            <article class="channel-row">
              <div>
                <strong>${escapeHtml(labelFor(String(row.action || ""), row.metadata || {}))}</strong>
                <small>${escapeHtml(new Date(row.createdAt).toLocaleString("en-GB"))}</small>
              </div>
              <div>
                <small>${escapeHtml(
                  String(row.action || "") === "notification.delivery"
                    ? `${cap(String(row.metadata?.channel || "unknown"))} ${String(row.metadata?.outcome || "recorded")} ${
                        String(row.metadata?.deliveryType || "") === "scheduled_reminder" ? "- scheduled reminder" : "- booking confirmation"
                      }`
                    : String(row.action || "").includes("rebooking")
                      ? "Retention work"
                      : "Booking follow-up"
                )}</small>
              </div>
            </article>
          `)
          .join("")
      : '<div class="empty-state">No communication actions have been logged yet. Mark reminders, confirmations, or rebooking sends to see them here.</div>';
  }

  if (els.commDueSoonList) {
    const dueLabel = (hoursUntilDue) => {
      const hours = Number(hoursUntilDue || 0);
      if (hours <= 0) return "Due now";
      if (hours < 1) return "Due within 1 hour";
      if (hours < 2) return "Due within 2 hours";
      if (hours < 24) return `Due in ${Math.round(hours)} hours`;
      return "Due later";
    };
    els.commDueSoonList.innerHTML = dueSoon.length
      ? dueSoon
          .map(
            (row) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(row.customerName || "Client")} - ${escapeHtml(row.service || "Service")}</strong>
                  <small>${escapeHtml(`${formatDateLong(row.date || "")} at ${row.time || ""}`)}</small>
                </div>
                <div>
                  <small>${escapeHtml(dueLabel(row.hoursUntilDue))}</small>
                  <small>${escapeHtml(
                    row.reachable
                      ? `${row.hasPhone ? "Phone" : ""}${row.hasPhone && row.hasEmail ? " + " : ""}${row.hasEmail ? "Email" : ""} ready`
                      : "No contact details saved"
                  )}</small>
                  <div class="inline-actions">
                    <button type="button" data-comm-due-action="open-day" data-comm-due-date="${escapeHtml(row.date || "")}">Open day</button>
                    <button type="button" data-comm-due-action="lexi" data-comm-due-booking-id="${escapeHtml(row.bookingId || "")}">Ask Lexi</button>
                    <button type="button" data-comm-due-action="customer" data-comm-due-customer-name="${escapeHtml(
                      row.customerName || ""
                    )}" data-comm-due-email="${escapeHtml(row.customerEmail || "")}" data-comm-due-phone="${escapeHtml(row.customerPhone || "")}">Customer</button>
                  </div>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No automated reminders are due in the next 24 hours.</div>';
  }

  if (els.commGuidanceCard) {
    const total = reminderCount + confirmedCount + rebookingCount + deliveryCount + failedCount;
    const channels = Array.isArray(readiness.availableChannels) ? readiness.availableChannels : [];
    const issues = Array.isArray(readiness.issues) ? readiness.issues : [];
    const nextSteps = Array.isArray(readiness.nextSteps) ? readiness.nextSteps : [];
    els.commGuidanceCard.innerHTML = `
      <article class="detail-card">
        <strong>${escapeHtml(String(readiness.summary || (total ? "Communication activity is being tracked" : "Start logging communication actions")))}</strong>
        <small>${escapeHtml(
          channels.length
            ? `Live channels available: ${channels.join(" and ")}.`
            : "No live sending channel is configured yet."
        )}</small>
        ${issues.map((item) => `<small>${escapeHtml(item)}</small>`).join("")}
        ${nextSteps.map((item) => `<small>${escapeHtml(`Next step: ${item}`)}</small>`).join("")}
        <div class="agenda-item-actions">
          <button type="button" data-communication-action="open-recovery">Open recovery</button>
          <button type="button" data-communication-action="open-messages">Open messaging board</button>
          <button type="button" data-communication-action="ask-lexi">Ask Lexi what to fix</button>
        </div>
      </article>
    `;
  }

  renderCommunicationSettings(readiness);
}

function focusSubscriberCustomerFromContact({ customerName = "", customerEmail = "", customerPhone = "" } = {}) {
  const key = customerKeyFromContactDraft({ customerName, customerEmail, customerPhone });
  const customer = state.subscriberCustomers.find((row) => row.key === key) || null;
  if (!customer) return null;
  state.selectedSubscriberCustomerKey = customer.key;
  renderSubscriberCustomerTable();
  renderSubscriberCustomerDetail();
  els.subscriberCustomerDetail?.scrollIntoView({ behavior: "smooth", block: "start" });
  return customer;
}

function communicationDueSoonAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("[data-comm-due-action]");
  if (!(button instanceof HTMLElement)) return;
  const action = String(button.getAttribute("data-comm-due-action") || "").trim();
  if (!action) return;

  if (action === "open-day") {
    const date = String(button.getAttribute("data-comm-due-date") || "").trim();
    if (!date) return;
    state.selectedDate = date;
    setSelectedDayFilter("all");
    renderCalendar();
    renderSelectedDay();
    els.selectedDayAgenda?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "customer") {
    const customer = focusSubscriberCustomerFromContact({
      customerName: String(button.getAttribute("data-comm-due-customer-name") || "").trim(),
      customerEmail: String(button.getAttribute("data-comm-due-email") || "").trim(),
      customerPhone: String(button.getAttribute("data-comm-due-phone") || "").trim()
    });
    if (!customer) {
      openLexi("Help me identify the right customer record for an upcoming reminder and tell me what details I should fix before it sends.");
    }
    return;
  }

  if (action === "lexi") {
    const bookingId = String(button.getAttribute("data-comm-due-booking-id") || "").trim();
    const row = (Array.isArray(state.dashboard?.communications?.dueSoon) ? state.dashboard.communications.dueSoon : []).find(
      (item) => String(item.bookingId || "") === bookingId
    );
    if (!row) return;
    openLexi(
      `Help me review this upcoming reminder for ${row.customerName || "this customer"}. ${row.service || "Appointment"} is on ${row.date} at ${
        row.time || ""
      }. Reminder is ${Number(row.hoursUntilDue || 0) <= 0 ? "due now" : `due in about ${Math.max(1, Math.round(Number(row.hoursUntilDue || 0)))} hours`}. ${
        row.reachable ? "Contact details are available." : "Contact details are missing."
      }`
    );
  }
}

function renderCommunicationSettings(readiness = {}) {
  const settings = readiness?.settings || {};
  if (els.commLiveRemindersEnabled) {
    els.commLiveRemindersEnabled.value = String(settings.liveRemindersEnabled === false ? "false" : "true");
  }
  if (els.commChannelPreference) {
    els.commChannelPreference.value = String(settings.channelPreference || "auto");
  }
  if (els.commReminderLeadHours) {
    els.commReminderLeadHours.value = String(Number(settings.reminderLeadHours || 24));
  }
  if (els.commManualFallbackEnabled) {
    els.commManualFallbackEnabled.value = String(settings.manualFallbackEnabled === false ? "false" : "true");
  }
  if (!els.commSettingsDetail) return;

  const liveEnabled = settings.liveRemindersEnabled !== false;
  const channelLabel =
    settings.channelPreference === "sms"
      ? "Prefer SMS"
      : settings.channelPreference === "email"
        ? "Prefer email"
        : settings.channelPreference === "manual"
          ? "Manual follow-up only"
          : "Best available channel";
  const fallbackLabel = settings.manualFallbackEnabled === false ? "Manual fallback is off." : "Manual fallback is on.";
  const issues = Array.isArray(readiness.issues) ? readiness.issues : [];

  els.commSettingsDetail.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(liveEnabled ? "Live reminders are enabled" : "Live reminders are switched off")}</strong>
      <small>${escapeHtml(`${channelLabel}. Reminder timing: ${Number(settings.reminderLeadHours || 24)} hour(s) before the appointment.`)}</small>
      <small>${escapeHtml(fallbackLabel)}</small>
      ${issues.slice(0, 2).map((item) => `<small>${escapeHtml(item)}</small>`).join("")}
    </article>
  `;
}

function isFutureBooking(booking) {
  const date = String(booking?.date || "").trim();
  const time = String(booking?.time || "00:00").trim();
  const dt = new Date(`${date}T${time}:00`);
  return !Number.isNaN(dt.getTime()) && dt.getTime() > Date.now();
}

function renderCustomerNextBooking(bookings) {
  if (!els.customerNextBookingCard) return;
  const nextBooking = bookings
    .filter((booking) => String(booking.status || "").toLowerCase() === "confirmed" && isFutureBooking(booking))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];

  if (!nextBooking) {
    els.customerNextBookingCard.innerHTML = '<div class="empty-state">No upcoming appointment yet. Ask Lexi to help you book your next visit.</div>';
    return;
  }

  els.customerNextBookingCard.innerHTML = `
    <div class="customer-next-booking-grid">
      <article>
        <span class="kicker">Service</span>
        <strong>${escapeHtml(nextBooking.service || "Service")}</strong>
      </article>
      <article>
        <span class="kicker">When</span>
        <strong>${escapeHtml(formatDateLong(nextBooking.date || ""))}</strong>
        <small>${escapeHtml(nextBooking.time || "")}</small>
      </article>
      <article>
        <span class="kicker">Where</span>
        <strong>${escapeHtml(nextBooking.businessName || "Salon")}</strong>
        <small>${escapeHtml(currency(nextBooking.price || 0))}</small>
      </article>
    </div>
    <div class="customer-next-booking-actions">
      <button class="btn btn-ghost btn-small" type="button" data-customer-booking-action="reschedule" data-booking-id="${escapeHtml(nextBooking.id || "")}">Reschedule</button>
      <button class="btn btn-ghost btn-small" type="button" data-customer-booking-action="cancel" data-booking-id="${escapeHtml(nextBooking.id || "")}">Cancel</button>
      <button class="btn btn-ghost btn-small" type="button" data-customer-booking-action="lexi" data-booking-id="${escapeHtml(nextBooking.id || "")}">Ask Lexi</button>
    </div>
  `;
}

function renderCustomerInsights(bookings, analytics = {}) {
  if (!els.customerSavedSalons || !els.customerRebookingPrompts) return;
  const grouped = new Map();
  bookings.forEach((booking) => {
    const key = String(booking.businessId || booking.businessName || "").trim();
    if (!key) return;
    const current = grouped.get(key) || {
      businessId: String(booking.businessId || "").trim(),
      businessName: String(booking.businessName || "Salon").trim(),
      visits: 0,
      spend: 0,
      lastDate: ""
    };
    current.visits += 1;
    if (String(booking.status || "").toLowerCase() !== "cancelled") current.spend += Number(booking.price || 0);
    if (!current.lastDate || String(booking.date || "") > current.lastDate) current.lastDate = String(booking.date || "");
    grouped.set(key, current);
  });

  const salons = Array.from(grouped.values()).sort((a, b) => b.visits - a.visits || b.spend - a.spend);
  els.customerSavedSalons.innerHTML = salons.length
    ? salons
        .slice(0, 6)
        .map(
          (salon) => `
            <article class="channel-row">
              <div>
                <strong>${escapeHtml(salon.businessName)}</strong>
                <small>${escapeHtml(String(salon.visits))} visits - ${escapeHtml(currency(salon.spend))} spent</small>
              </div>
              <div>
                <small>${salon.lastDate ? `Last visit ${escapeHtml(formatDateLong(salon.lastDate))}` : "No visit history"}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No salon relationships have been built yet.</div>';

  const today = new Date();
  const prompts = bookings
    .filter((booking) => String(booking.status || "").toLowerCase() !== "cancelled")
    .map((booking) => {
      const dt = new Date(`${booking.date}T${booking.time || "00:00"}:00`);
      const daysAgo = Number.isNaN(dt.getTime()) ? -1 : Math.floor((today.getTime() - dt.getTime()) / 86400000);
      return {
        businessId: String(booking.businessId || "").trim(),
        businessName: String(booking.businessName || "Salon").trim(),
        service: String(booking.service || "service").trim(),
        daysAgo
      };
    })
    .filter((row) => row.daysAgo >= 28)
    .sort((a, b) => b.daysAgo - a.daysAgo);

  els.customerRebookingPrompts.innerHTML = prompts.length
    ? prompts
        .slice(0, 4)
        .map(
          (row) => `
            <article class="ops-item">
              <strong>${escapeHtml(row.businessName)}</strong>
              <p>It has been ${escapeHtml(String(row.daysAgo))} days since your ${escapeHtml(row.service)}. Ask Lexi to find your next slot.</p>
              <div class="agenda-item-actions">
                <button type="button" data-customer-care-action="rebook" data-business-name="${escapeHtml(row.businessName)}" data-service="${escapeHtml(
                  row.service
                )}" data-days-ago="${escapeHtml(String(row.daysAgo))}">Book with Lexi</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No rebooking prompts yet. Once enough time passes after a visit, Lexi will surface them here.</div>';
  const insightCounts = {
    salonsCount: salons.length,
    promptCount: prompts.length
  };

  if (els.customerOffersList) {
    const offers = Array.isArray(analytics.customerCare?.offersByBusiness) ? analytics.customerCare.offersByBusiness : [];
    els.customerOffersList.innerHTML = offers.length
      ? offers
          .slice(0, 4)
          .map(
            (offer) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(offer.businessName || "Salon")}</strong>
                  <small>${escapeHtml(
                    [
                      ...(Array.isArray(offer.memberships) ? offer.memberships.map((row) => `${row.name} membership`) : []),
                      ...(Array.isArray(offer.packages) ? offer.packages.map((row) => `${row.name} package`) : []),
                      ...(Array.isArray(offer.merch) ? offer.merch.slice(0, 1).map((row) => `${row.name} retail`) : [])
                    ]
                      .slice(0, 3)
                .join(" - ") || "Offers available"
                  )}</small>
                </div>
                <div class="agenda-item-actions">
                  <small>${escapeHtml(
                    `${Array.isArray(offer.memberships) ? offer.memberships.length : 0} memberships, ${Array.isArray(offer.packages) ? offer.packages.length : 0} packages`
                  )}</small>
                  <button type="button" data-customer-care-action="offer" data-business-name="${escapeHtml(offer.businessName || "Salon")}">Ask about offers</button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No salon offers are visible on your account yet.</div>';
  }

  if (els.customerGiftCards) {
    const giftCards = Array.isArray(analytics.customerCare?.giftCards) ? analytics.customerCare.giftCards : [];
    els.customerGiftCards.innerHTML = giftCards.length
      ? giftCards
          .map(
            (row) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(row.businessName || "Salon")}</strong>
                  <small>${escapeHtml(`Code ${row.code || ""}`)}</small>
                </div>
                <div class="agenda-item-actions">
                  <small>${escapeHtml(currency(row.remainingBalance || 0))}</small>
                  <small>${escapeHtml(row.expiresAt ? `Expires ${formatDateLong(String(row.expiresAt).slice(0, 10))}` : "No expiry saved")}</small>
                  <button type="button" data-customer-care-action="gift-card" data-business-name="${escapeHtml(
                    row.businessName || "Salon"
                  )}" data-gift-code="${escapeHtml(row.code || "")}" data-balance="${escapeHtml(currency(row.remainingBalance || 0))}">Use at booking</button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No active gift cards matching your account name were found yet.</div>';
  }

  if (els.customerAftercareList) {
    const aftercare = Array.isArray(analytics.customerCare?.aftercareHistory) ? analytics.customerCare.aftercareHistory : [];
    els.customerAftercareList.innerHTML = aftercare.length
      ? aftercare
          .map(
            (row) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(row.service || "Service")} - ${escapeHtml(row.businessName || "Salon")}</strong>
                  <small>${escapeHtml(row.date ? formatDateLong(row.date) : "Completed visit")}</small>
                </div>
                <div class="agenda-item-actions">
                  <small>${escapeHtml(row.aftercareNotes || row.bookingNotes || "No follow-up notes saved")}</small>
                  <button type="button" data-customer-care-action="aftercare" data-business-name="${escapeHtml(
                    row.businessName || "Salon"
                  )}" data-service="${escapeHtml(row.service || "Service")}" data-aftercare="${escapeHtml(row.aftercareNotes || row.bookingNotes || "")}">Ask Lexi about this</button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">Aftercare notes will appear here once a completed visit includes them.</div>';
  }
  return insightCounts;
}

function renderCustomerOnboarding(analytics = {}, bookings = []) {
  if (!els.customerOnboardingCard || !els.customerOnboardingContent) return;
  const hasBookings = Array.isArray(bookings) && bookings.length > 0;
  const hasUpcoming = Number(analytics.analytics?.upcomingBookings || 0) > 0;
  const hasOffers = Number(analytics.analytics?.availableOfferBusinesses || 0) > 0;
  const hasAftercare = Array.isArray(analytics.customerCare?.aftercareHistory) && analytics.customerCare.aftercareHistory.length > 0;
  const needsGuide = !hasBookings || !hasUpcoming || !hasOffers || !hasAftercare;

  if (!needsGuide) {
    els.customerOnboardingCard.hidden = true;
    return;
  }

  els.customerOnboardingCard.hidden = false;
  const steps = [
    {
      done: hasBookings,
      title: "Keep your booking history in one place",
      detail: hasBookings ? "Your appointments are already linked to this account." : "Once you book through the app, your appointment history will start appearing here."
    },
    {
      done: hasUpcoming,
      title: "Manage your next visit",
      detail: hasUpcoming ? "You already have an upcoming appointment you can manage here." : "Use Ask Lexi to find your next appointment and book without calling the salon."
    },
    {
      done: hasOffers,
      title: "See what your salons offer",
      detail: hasOffers ? "This dashboard is already showing live offers from salons you use." : "Once salons add memberships, packages, or retail, those offers will appear here."
    },
    {
      done: hasAftercare,
      title: "Use your aftercare notes",
      detail: hasAftercare ? "You already have aftercare guidance saved from a completed visit." : "After completed visits, aftercare notes can be stored here so you do not lose the advice."
    }
  ];

  els.customerOnboardingContent.innerHTML = `
    <div class="insight-grid insight-grid-two">
      <div class="insight-panel">
        <h3>What this dashboard does</h3>
        <div class="channel-list">
          ${steps
            .map(
              (step) => `
                <article class="channel-row">
                  <div>
                    <strong>${escapeHtml(step.title)}</strong>
                    <small>${escapeHtml(step.detail)}</small>
                  </div>
                  <div>
                    <small class="${step.done ? "status-positive" : "status-neutral"}">${step.done ? "Live" : "Coming in as you use the app"}</small>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="insight-panel">
        <h3>Quick actions</h3>
        <div class="agenda-item-actions">
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="customer-book">Book with Lexi</button>
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="customer-help">Ask how this works</button>
        </div>
        <small>Lexi can book, explain aftercare, or help you use gift cards and offers.</small>
      </div>
    </div>
  `;
}

function renderAdminRevenue(payload) {
  const summary = payload?.summary || {};
  const monthly = Array.isArray(payload?.monthly) ? payload.monthly : [];
  els.adminMrrMetric.textContent = currency(summary.estimatedMrr || 0);
  els.adminMrrMeta.textContent = `${summary.activeSubscriptions || 0} active subscriptions`;
  els.adminRevenuePeriodMetric.textContent = currency(summary.estimatedRevenueInPeriod || 0);
  els.adminRevenuePeriodMeta.textContent = `${summary.periodMonths || 0} month view`;
  els.adminSubscriptionCancelMetric.textContent = String(summary.subscriptionCancellationsInPeriod || 0);
  els.adminSubscriptionCancelMeta.textContent = "Subscriber churn in tracked period";
  els.adminBookingCancelMetric.textContent = String(summary.bookingCancellationsInPeriod || 0);
  els.adminBookingCancelMeta.textContent = "Booking cancellations across the platform";

  if (!els.adminRevenueChart) return;
  if (!monthly.length) {
    els.adminRevenueChart.innerHTML = '<div class="empty-state">No platform revenue series available yet.</div>';
    return;
  }
  const max = Math.max(...monthly.map((row) => Number(row.estimatedSubscriptionRevenue || 0)), 1);
  els.adminRevenueChart.innerHTML = monthly
    .map((row) => {
      const pct = Math.max(8, Math.round((Number(row.estimatedSubscriptionRevenue || 0) / max) * 100));
      return `
        <article class="chart-bar">
          <div class="chart-bar-track"><div class="chart-bar-fill" style="height:${pct}%"></div></div>
          <div class="chart-bar-label">${escapeHtml(row.label || "")}</div>
          <div class="chart-bar-label">${escapeHtml(currency(row.estimatedSubscriptionRevenue || 0))}</div>
        </article>
      `;
    })
    .join("");
}

function buildAdminBusinessAlerts(businesses = []) {
  return businesses
    .map((business) => {
      const bookingCount = Number(business.stats?.bookingCount || 0);
      const upcomingBookings = Number(business.stats?.upcomingBookings || 0);
      const cancelledBookings = Number(business.stats?.cancelledBookings || 0);
      const cancelRate = bookingCount ? Number(((cancelledBookings / bookingCount) * 100).toFixed(1)) : 0;
      const planInactive = String(business.subscription?.status || "").trim().toLowerCase() !== "active";
      const reasons = [];
      let severity = 0;

      if (planInactive) {
        reasons.push("Subscription is not active.");
        severity += 3;
      }
      if (bookingCount <= 5) {
        reasons.push("Very low total booking activity.");
        severity += 2;
      }
      if (upcomingBookings === 0) {
        reasons.push("No upcoming bookings are visible.");
        severity += 2;
      } else if (upcomingBookings <= 3) {
        reasons.push("Upcoming booking load is light.");
        severity += 1;
      }
      if (cancelRate >= 25) {
        reasons.push(`Cancellation pressure is high at ${cancelRate}%.`);
        severity += 2;
      } else if (cancelRate >= 12) {
        reasons.push(`Cancellation pressure is elevated at ${cancelRate}%.`);
        severity += 1;
      }
      if (String(business.stats?.healthLabel || "").toLowerCase().includes("needs attention")) {
        severity += 1;
      }

      if (!reasons.length) return null;
      const label = severity >= 5 ? "Needs fast review" : severity >= 3 ? "Watch closely" : "Light risk";
      const tone = severity >= 5 ? "status-negative" : severity >= 3 ? "status-neutral" : "status-positive";
      return {
        id: business.id,
        name: business.name,
        reasons,
        severity,
        label,
        tone,
        upcomingBookings,
        bookingCount,
        cancelRate
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.severity - a.severity || a.upcomingBookings - b.upcomingBookings || a.bookingCount - b.bookingCount);
}

function renderAdminAlerts(businesses = []) {
  if (!els.adminAlertList) return;
  const alerts = buildAdminBusinessAlerts(businesses);
  const critical = alerts.filter((alert) => alert.severity >= 5).length;
  const quiet = alerts.filter((alert) => alert.upcomingBookings <= 3).length;
  const cancelPressure = alerts.filter((alert) => alert.cancelRate >= 12).length;
  const planIssues = alerts.filter((alert) => alert.reasons.some((reason) => /subscription/i.test(reason))).length;

  if (els.adminAlertCriticalMetric) els.adminAlertCriticalMetric.textContent = String(critical);
  if (els.adminAlertQuietMetric) els.adminAlertQuietMetric.textContent = String(quiet);
  if (els.adminAlertCancelMetric) els.adminAlertCancelMetric.textContent = String(cancelPressure);
  if (els.adminAlertPlanMetric) els.adminAlertPlanMetric.textContent = String(planIssues);

  els.adminAlertList.innerHTML = alerts.length
    ? alerts
        .slice(0, 8)
        .map(
          (alert) => `
            <article class="channel-row" data-admin-alert-business-id="${escapeHtml(alert.id || "")}">
              <div>
                <strong>${escapeHtml(alert.name || "Business")}</strong>
                <small>${escapeHtml(alert.reasons[0] || "Needs review")}</small>
              </div>
              <div>
                <small class="${escapeHtml(alert.tone)}">${escapeHtml(alert.label)}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No cross-business operational alerts are active right now.</div>';
}

function renderAdminSubscriptionHealth(businesses = []) {
  const rows = Array.isArray(businesses) ? businesses : [];
  const active = rows.filter((business) => String(business.subscription?.status || "").trim().toLowerCase() === "active");
  const inactive = rows.length - active.length;
  const quietActives = active.filter((business) => Number(business.stats?.upcomingBookings || 0) <= 3);
  const planCounts = new Map();
  const healthCounts = new Map();

  rows.forEach((business) => {
    const plan = String(business.subscription?.plan || "starter").trim().toLowerCase() || "starter";
    planCounts.set(plan, (planCounts.get(plan) || 0) + 1);
    const health = String(business.stats?.healthLabel || "Needs attention").trim() || "Needs attention";
    healthCounts.set(health, (healthCounts.get(health) || 0) + 1);
  });

  const topPlanEntry = Array.from(planCounts.entries()).sort((a, b) => b[1] - a[1])[0] || ["starter", 0];

  if (els.adminActivePlanMetric) els.adminActivePlanMetric.textContent = String(active.length);
  if (els.adminActivePlanMeta) els.adminActivePlanMeta.textContent = `${active.length} subscriber business${active.length === 1 ? "" : "es"} currently active`;
  if (els.adminInactivePlanMetric) els.adminInactivePlanMetric.textContent = String(inactive);
  if (els.adminInactivePlanMeta) {
    els.adminInactivePlanMeta.textContent = inactive
      ? `${inactive} business${inactive === 1 ? "" : "es"} need subscription review`
      : "No inactive subscriber plans are showing right now";
  }
  if (els.adminTopPlanMetric) els.adminTopPlanMetric.textContent = cap(topPlanEntry[0]);
  if (els.adminTopPlanMeta) els.adminTopPlanMeta.textContent = `${topPlanEntry[1]} business${topPlanEntry[1] === 1 ? "" : "es"} on this plan`;
  if (els.adminQuietActiveMetric) els.adminQuietActiveMetric.textContent = String(quietActives.length);
  if (els.adminQuietActiveMeta) {
    els.adminQuietActiveMeta.textContent = quietActives.length
      ? `${quietActives.length} active business${quietActives.length === 1 ? "" : "es"} look commercially quiet`
      : "Active businesses currently show workable upcoming demand";
  }

  if (els.adminPlanMixList) {
    const planRows = Array.from(planCounts.entries()).sort((a, b) => b[1] - a[1]);
    els.adminPlanMixList.innerHTML = planRows.length
      ? planRows
          .map(
            ([plan, count]) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(cap(plan))}</strong>
                  <small>${escapeHtml(String(count))} subscriber business${count === 1 ? "" : "es"}</small>
                </div>
                <div>
                  <small>${escapeHtml(plan === topPlanEntry[0] ? "Most common" : "Plan mix")}</small>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No subscription plans are visible yet.</div>';
  }

  if (els.adminSubscriptionHealthList) {
    const healthRows = Array.from(healthCounts.entries()).sort((a, b) => b[1] - a[1]);
    els.adminSubscriptionHealthList.innerHTML = healthRows.length
      ? healthRows
          .map(
            ([label, count]) => `
              <article class="channel-row">
                <div>
                  <strong>${escapeHtml(label)}</strong>
                  <small>${escapeHtml(String(count))} business${count === 1 ? "" : "es"}</small>
                </div>
                <div>
                  <small>${escapeHtml(label.toLowerCase().includes("quiet") || label.toLowerCase().includes("attention") ? "Needs review" : "Healthy mix")}</small>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">No subscriber health mix is available yet.</div>';
  }
}

function renderAdminBillingWatch(businesses = []) {
  const rows = Array.isArray(businesses) ? businesses : [];
  const states = rows.map((business) => ({
    business,
    billing: buildBusinessBillingState(business)
  }));
  const renewingSoon = states.filter(
    ({ billing }) => billing.status === "active" && billing.daysUntilRenewal !== null && billing.daysUntilRenewal >= 0 && billing.daysUntilRenewal <= 14
  );
  const renewingThisMonth = states.filter(
    ({ billing }) => billing.status === "active" && billing.daysUntilRenewal !== null && billing.daysUntilRenewal >= 0 && billing.daysUntilRenewal <= 30
  );
  const needsAttention = states.filter(
    ({ billing }) => billing.status !== "active" || billing.daysUntilRenewal === null || billing.daysUntilRenewal < 0
  );
  const ranked = [...states].sort((a, b) => {
    const aScore = a.billing.status !== "active" ? -1000 : a.billing.daysUntilRenewal ?? 9999;
    const bScore = b.billing.status !== "active" ? -1000 : b.billing.daysUntilRenewal ?? 9999;
    return aScore - bScore;
  });

  if (els.adminRenewalSoonMetric) els.adminRenewalSoonMetric.textContent = String(renewingSoon.length);
  if (els.adminRenewalSoonMeta) {
    els.adminRenewalSoonMeta.textContent = renewingSoon.length
      ? `${renewingSoon.length} active business${renewingSoon.length === 1 ? "" : "es"} renew in the next 14 days`
      : "No active subscriber renewals are due in the next 14 days";
  }
  if (els.adminRenewalMonthMetric) els.adminRenewalMonthMetric.textContent = String(renewingThisMonth.length);
  if (els.adminRenewalMonthMeta) {
    els.adminRenewalMonthMeta.textContent = renewingThisMonth.length
      ? `${renewingThisMonth.length} active business${renewingThisMonth.length === 1 ? "" : "es"} renew in the next 30 days`
      : "No active subscriber renewals are due in the next 30 days";
  }
  if (els.adminBillingAttentionMetric) els.adminBillingAttentionMetric.textContent = String(needsAttention.length);
  if (els.adminBillingAttentionMeta) {
    els.adminBillingAttentionMeta.textContent = needsAttention.length
      ? `${needsAttention.length} business${needsAttention.length === 1 ? "" : "es"} need billing review or follow-up`
      : "No subscriber plans currently need billing attention";
  }

  if (!els.adminBillingList) return;
  els.adminBillingList.innerHTML = ranked.length
    ? ranked
        .slice(0, 8)
        .map(
          ({ business, billing }) => `
            <article class="channel-row" data-admin-billing-business-id="${escapeHtml(business.id || "")}">
              <div>
                <strong>${escapeHtml(business.name || "Business")}</strong>
                <small>${escapeHtml(cap(billing.plan))} plan - ${escapeHtml(cap(billing.status || "inactive"))}</small>
              </div>
              <div>
                <small class="${escapeHtml(billing.tone)}">${escapeHtml(billing.label)}</small>
                <small>${escapeHtml(
                  billing.renewalDate ? `${billing.renewalLabel} (${formatDateLong(String(billing.renewalDate).slice(0, 10))})` : billing.renewalLabel
                )}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No billing watch items are available right now.</div>';
}

function renderAdminNotificationHealth(businesses = []) {
  const rows = Array.isArray(businesses) ? businesses : [];
  const failingBusinesses = rows.filter((business) => Number(business.stats?.notificationFailedCount || 0) > 0);
  const totalFailed = rows.reduce((sum, business) => sum + Number(business.stats?.notificationFailedCount || 0), 0);
  const totalSent = rows.reduce((sum, business) => sum + Number(business.stats?.notificationSentCount || 0), 0);

  if (els.adminNotifIssueMetric) els.adminNotifIssueMetric.textContent = String(failingBusinesses.length);
  if (els.adminNotifIssueMeta) {
    els.adminNotifIssueMeta.textContent = failingBusinesses.length
      ? `${failingBusinesses.length} business${failingBusinesses.length === 1 ? "" : "es"} have recent delivery failures`
      : "No delivery issues were logged in the recent period";
  }
  if (els.adminNotifFailedMetric) els.adminNotifFailedMetric.textContent = String(totalFailed);
  if (els.adminNotifFailedMeta) {
    els.adminNotifFailedMeta.textContent = totalFailed
      ? `${totalFailed} SMS or email channel failure${totalFailed === 1 ? "" : "s"} logged`
      : "No failed notification sends were logged";
  }
  if (els.adminNotifSentMetric) els.adminNotifSentMetric.textContent = String(totalSent);
  if (els.adminNotifSentMeta) {
    els.adminNotifSentMeta.textContent = totalSent
      ? `${totalSent} notification delivery success${totalSent === 1 ? "" : "es"} recorded`
      : "No successful notification sends were logged yet";
  }

  if (!els.adminNotifList) return;
  els.adminNotifList.innerHTML = failingBusinesses.length
    ? failingBusinesses
        .sort((a, b) => Number(b.stats?.notificationFailedCount || 0) - Number(a.stats?.notificationFailedCount || 0))
        .slice(0, 8)
        .map((business) => {
          const health = evaluateAdminNotificationHealth(business);
          const toneClass = health.status === "critical"
            ? "status-negative"
            : health.status === "warning"
              ? "status-warning"
              : "status-neutral";
          const statusLabel = health.status === "critical"
            ? "Urgent review"
            : health.status === "warning"
              ? "Needs review"
              : "Watch";
          const nextCheck = String(health.nextSteps?.[0] || "").trim();
          return `
            <article class="channel-row" data-admin-notif-business-id="${escapeHtml(business.id || "")}">
              <div>
                <strong>${escapeHtml(business.name || "Business")}</strong>
                <small>${escapeHtml(
                  `${Number(business.stats?.notificationFailedCount || 0)} failed, ${Number(business.stats?.notificationSentCount || 0)} sent`
                )}</small>
                <small>${escapeHtml(health.summary)}</small>
                ${nextCheck ? `<small>${escapeHtml(`Next check: ${nextCheck}`)}</small>` : ""}
              </div>
              <div>
                <small class="${toneClass}">${escapeHtml(statusLabel)}</small>
                <div class="inline-actions">
                  <button type="button" data-admin-notif-action="open" data-admin-notif-business-id="${escapeHtml(business.id || "")}">Open salon</button>
                  <button type="button" data-admin-notif-action="lexi" data-admin-notif-business-id="${escapeHtml(business.id || "")}">Ask Lexi</button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No cross-business notification failures are showing right now.</div>';
}

function selectAdminBusiness(businessId, { scroll = false } = {}) {
  const id = String(businessId || "").trim();
  if (!id) return null;
  const business = state.adminBusinesses.find((row) => String(row.id || "") === id) || null;
  if (!business) return null;
  state.selectedAdminBusinessId = id;
  renderAdminBusinesses(state.adminBusinesses);
  renderAdminBusinessDetail();
  if (scroll) {
    els.adminBusinessDetail?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return business;
}

function openServiceDayModal(booking) {
  if (!booking || !els.serviceDayModal) return;
  const meta = parseBookingNotesMeta(booking.notes || "");
  const serviceState = bookingServiceState(booking);
  state.serviceDayBookingId = String(booking.id || "");
  if (els.serviceDayBookingSummary) {
    els.serviceDayBookingSummary.textContent = `${booking.customerName || "Customer"} - ${booking.service || "Service"} on ${formatDateLong(
      booking.date || state.selectedDate
    )} at ${booking.time || ""}.`;
  }
  if (els.serviceDayStateInput) els.serviceDayStateInput.value = serviceState === "cancelled" ? "confirmed" : serviceState;
  if (els.serviceDayStatePreview) {
    els.serviceDayStatePreview.textContent = `Current stage: ${serviceStateLabel(serviceState)}`;
    els.serviceDayStatePreview.className = serviceStateTone(serviceState);
  }
  if (els.serviceDayVisitSummary) {
    const summary = [
      meta.serviceNotes ? `Visit notes: ${meta.serviceNotes}` : "",
      meta.aftercareNotes ? `Aftercare: ${meta.aftercareNotes}` : "",
      meta.cleanNotes ? `Booking notes: ${meta.cleanNotes}` : ""
    ].filter(Boolean);
    els.serviceDayVisitSummary.textContent = summary.join(" ") || "No visit notes saved yet.";
  }
  if (els.serviceDayNotesInput) els.serviceDayNotesInput.value = String(meta.serviceNotes || "");
  if (els.serviceDayAftercareInput) els.serviceDayAftercareInput.value = String(meta.aftercareNotes || "");
  if (els.serviceDayCheckoutMeta) {
    const topMembership = getActiveCommercialRows("memberships")[0];
    const topPackage = getActiveCommercialRows("packages")[0];
    const topRetail = getActiveCommercialRows("merch")[0];
    els.serviceDayCheckoutMeta.textContent = [
      topMembership ? `Membership live: ${topMembership.name}.` : "",
      topPackage ? `Package live: ${topPackage.name}.` : "",
      topRetail ? `Retail prompt: ${topRetail.name}.` : ""
    ].filter(Boolean).join(" ") || "Use this after the service to rebook and recommend the right offer or retail product.";
  }
  setServiceDayMessage("");
  els.serviceDayModal.hidden = false;
}

function closeServiceDayModal() {
  state.serviceDayBookingId = "";
  if (els.serviceDayForm) els.serviceDayForm.reset();
  if (els.serviceDayModal) els.serviceDayModal.hidden = true;
  setServiceDayMessage("");
}

function openRescheduleModal(booking, role) {
  if (!booking || !els.rescheduleModal) return;
  state.rescheduleBookingId = String(booking.id || "");
  state.rescheduleRole = String(role || "");
  if (els.rescheduleBookingSummary) {
    els.rescheduleBookingSummary.textContent =
      role === "customer"
        ? `Move your ${booking.service} appointment on ${formatDateLong(booking.date || "")} at ${booking.time || ""}.`
        : `Move ${booking.customerName}'s ${booking.service} booking on ${formatDateLong(booking.date || "")} at ${booking.time || ""}.`;
  }
  if (els.rescheduleDateInput) els.rescheduleDateInput.value = String(booking.date || state.selectedDate);
  if (els.rescheduleTimeInput) els.rescheduleTimeInput.value = String(booking.time || "10:00");
  setRescheduleMessage("");
  els.rescheduleModal.hidden = false;
}

function closeRescheduleModal() {
  state.rescheduleBookingId = "";
  state.rescheduleRole = "";
  setRescheduleMessage("");
  if (els.rescheduleForm) els.rescheduleForm.reset();
  if (els.rescheduleModal) els.rescheduleModal.hidden = true;
}

function resetQuickBookingDraft() {
  state.bookingPrefillSource = "";
  if (els.quickBookingForm) els.quickBookingForm.reset();
  if (els.quickBookingDate) els.quickBookingDate.value = state.selectedDate;
  if (els.quickBookingTime) els.quickBookingTime.value = "10:00";
  if (els.quickBookingStylist) els.quickBookingStylist.value = "";
}

function renderQuickBookingPreview() {
  if (!els.quickBookingPreview || !els.quickBookingSummary) return;
  const customerName = String(els.quickBookingCustomerName?.value || "").trim();
  const phone = String(els.quickBookingCustomerPhone?.value || "").trim();
  const email = String(els.quickBookingCustomerEmail?.value || "").trim();
  const service = String(els.quickBookingService?.value || "").trim();
  const stylistName = String(els.quickBookingStylist?.value || "").trim();
  const date = String(els.quickBookingDate?.value || "").trim();
  const time = String(els.quickBookingTime?.value || "").trim();
  const notes = String(els.quickBookingNotes?.value || "").trim();
  const selectedService = getServiceByName(service);
  const customerRecord = getCustomerRecordForDraft({ customerName, customerEmail: email, customerPhone: phone });
  const needsConsultation = serviceNeedsConsultation(service);
  const needsPatchTest = serviceNeedsPatchTest(service) || Boolean(customerRecord?.patchTestRequired);
  const stylistMember = (Array.isArray(state.staff?.members) ? state.staff.members : []).find((row) => String(row.name || "").trim() === stylistName) || null;
  const stylistConflicts = buildStylistConflictSummary({ date, time, serviceName: service, stylistName });
  const prepGuidance = [
    customerRecord?.preferredStylist ? `Preferred stylist: ${customerRecord.preferredStylist}` : "",
    needsConsultation ? "Consultation recommended before confirming a major change service." : "",
    needsPatchTest ? "Patch test should be checked before colour-based services." : "",
    customerRecord?.allergies ? `Allergy or sensitivity note: ${customerRecord.allergies}` : "",
    customerRecord?.formulaNotes ? `Formula note: ${customerRecord.formulaNotes}` : "",
    customerRecord?.consultationNotes ? `Consultation note: ${customerRecord.consultationNotes}` : "",
    customerRecord?.visitPrepNotes ? `Visit prep: ${customerRecord.visitPrepNotes}` : ""
  ].filter(Boolean);

  if (state.bookingPrefillSource === "customer") {
    els.quickBookingSummary.textContent = "This booking was started from a customer profile. Check the service and appointment time before confirming.";
  } else if (prepGuidance.length) {
    els.quickBookingSummary.textContent = "This booking includes saved client guidance. Review the prep notes before confirming the appointment.";
  } else {
    els.quickBookingSummary.textContent = "Add the customer, choose the service, and confirm the appointment time.";
  }

  els.quickBookingPreview.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(customerName || "Customer details")}</strong>
      <small>${escapeHtml(phone || "Add a phone number")}</small>
      <small>${escapeHtml(email || "Email is optional")}</small>
    </article>
    <article class="detail-card">
      <strong>${escapeHtml(service || "Choose a service")}</strong>
      <small>${selectedService ? `${escapeHtml(currency(selectedService.price || 0))} - ${escapeHtml(String(selectedService.durationMin || 0))} min` : "Pick from your live services"}</small>
      <small>${escapeHtml(date ? formatDateLong(date) : "Choose a date")}${time ? ` at ${escapeHtml(time)}` : ""}</small>
    </article>
    <article class="detail-card">
      <strong>Stylist assignment</strong>
      <small>${escapeHtml(stylistName || "No stylist assigned yet")}</small>
      <small>${escapeHtml(stylistMember ? `Team status: ${cap(String(stylistMember.availability || "off_duty").replaceAll("_", " "))}` : stylistName ? "Stylist not found in current team roster" : "Assign a stylist to check clashes by person.")}</small>
      <small>${escapeHtml(stylistConflicts.length ? `${stylistConflicts.length} overlapping booking${stylistConflicts.length === 1 ? "" : "s"} found for this stylist.` : "No overlapping booking found for this stylist and service duration.")}</small>
    </article>
    <article class="detail-card">
      <strong>Notes</strong>
      <small>${escapeHtml(notes || "No booking notes added.")}</small>
    </article>
    <article class="detail-card">
      <strong>Service-day guidance</strong>
      ${
        prepGuidance.length
          ? prepGuidance.map((item) => `<small>${escapeHtml(item)}</small>`).join("")
          : "<small>No saved prep or consultation guidance for this booking yet.</small>"
      }
    </article>
  `;
}

function parseOpenHoursValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text || text === "closed") return null;
  const [open, close] = String(value || "").split("-").map((part) => String(part || "").trim());
  if (!open || !close) return null;
  return { open, close };
}

function timeToMinutesLocal(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map((value) => Number(value));
  return hours * 60 + minutes;
}

function minutesToTimeLocal(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function dayKeyFromDateLocal(date) {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date(`${date}T12:00:00`).getDay()] || "";
}

function addDaysToDateKey(date, daysToAdd) {
  const base = new Date(`${date}T12:00:00`);
  base.setDate(base.getDate() + Number(daysToAdd || 0));
  return toDateKey(base);
}

function addWeeksToDateKey(date, weeksToAdd) {
  return addDaysToDateKey(date, Number(weeksToAdd || 0) * 7);
}

function dayLabelFromWeekStart(weekStart, index) {
  const dateKey = addDaysToDateKey(weekStart, index);
  const date = new Date(`${dateKey}T12:00:00`);
  return {
    key: dateKey,
    short: date.toLocaleDateString("en-GB", { weekday: "short" }),
    day: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  };
}

function rotaDayKeyFromIndex(index) {
  return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][index] || "";
}

function rotaDayKeyFromDateKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()] || "";
}

function weekStartFromDateKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + mondayOffset);
  return toDateKey(base);
}

function cloneRotaWeek(week) {
  const source = week && typeof week === "object" ? week : {};
  return {
    weekStart: String(source.weekStart || "").trim(),
    cells: JSON.parse(JSON.stringify(source.cells && typeof source.cells === "object" ? source.cells : {})),
    sicknessLogs: Array.isArray(source.sicknessLogs) ? [...source.sicknessLogs] : [],
    updatedAt: source.updatedAt || null
  };
}

function getDraftRotaCell(staffId, dayKey, member) {
  const draft = state.staffRotaDraft && typeof state.staffRotaDraft === "object" ? state.staffRotaDraft : {};
  const source = draft.cells && typeof draft.cells === "object" ? draft.cells : {};
  const cell = source?.[staffId]?.[dayKey] || null;
  if (cell) return cell;
  const fallbackScheduled = Array.isArray(member?.shiftDays) && member.shiftDays.includes(dayKey);
  return {
    status: fallbackScheduled ? "scheduled" : "off",
    shift: fallbackScheduled ? "full" : "",
    updatedAt: null,
    updatedByRole: null
  };
}

function ensureSelectedTeamPlannerCell(members) {
  if (
    state.selectedTeamPlannerCell?.staffId &&
    members.some((member) => member.id === state.selectedTeamPlannerCell.staffId) &&
    state.selectedTeamPlannerCell?.dayKey
  ) {
    return;
  }
  const firstMember = members[0] || null;
  state.selectedTeamPlannerCell = firstMember ? { staffId: firstMember.id, dayKey: "mon" } : null;
}

function upsertDraftRotaCell(staffId, dayKey, patch) {
  if (!state.staffRotaDraft || typeof state.staffRotaDraft !== "object") return;
  if (!state.staffRotaDraft.cells || typeof state.staffRotaDraft.cells !== "object") state.staffRotaDraft.cells = {};
  if (!state.staffRotaDraft.cells[staffId] || typeof state.staffRotaDraft.cells[staffId] !== "object") state.staffRotaDraft.cells[staffId] = {};
  const current = state.staffRotaDraft.cells[staffId][dayKey] || { status: "off", shift: "", updatedAt: null, updatedByRole: null };
  state.staffRotaDraft.cells[staffId][dayKey] = {
    ...current,
    ...patch
  };
}

function buildSuggestedTimesForDate(date, service) {
  const hoursMap = state.business?.business?.hours || {};
  const dayKey = dayKeyFromDateLocal(date);
  const openHours = parseOpenHoursValue(hoursMap?.[dayKey]);
  if (!openHours) return { closed: true, suggestions: [] };

  const duration = Math.max(5, Number(service?.durationMin || 45));
  const openMin = timeToMinutesLocal(openHours.open);
  const closeMin = timeToMinutesLocal(openHours.close);
  const lastStart = closeMin - duration;
  const capacityEstimate = Math.max(1, countOnDuty() || Math.min(3, Math.max(1, (state.staff?.members || []).length || 1)));
  const suggestions = [];

  for (let cursor = openMin; cursor <= lastStart; cursor += 30) {
    const time = minutesToTimeLocal(cursor);
    const inPast = isFutureBooking({ date, time, status: "confirmed" }) === false;
    if (inPast) continue;
    const bookingCount = state.bookings.filter(
      (booking) =>
        String(booking.date || "") === date &&
        String(booking.time || "") === time &&
        String(booking.status || "").toLowerCase() !== "cancelled"
    ).length;
    if (bookingCount >= capacityEstimate) continue;
    suggestions.push(time);
    if (suggestions.length >= 6) break;
  }

  return { closed: false, suggestions };
}

function renderQuickBookingSuggestions() {
  if (!els.quickBookingSuggestions || !els.quickBookingDaySuggestions) return;
  const serviceName = String(els.quickBookingService?.value || "").trim();
  const date = String(els.quickBookingDate?.value || "").trim();
  const services = Array.isArray(state.business?.business?.services) ? state.business.business.services : [];
  const service = services.find((row) => String(row.name || "").trim() === serviceName) || null;
  if (!date || !service) {
    els.quickBookingSuggestions.innerHTML = '<span class="empty-state">Choose a service and date to see suggested times.</span>';
    els.quickBookingDaySuggestions.innerHTML = '<span class="empty-state">Choose a service and date to see nearby day options.</span>';
    return;
  }
  const requestKey = `${serviceName}|${date}`;
  const apiPayload = state.quickBookingSuggestionsKey === requestKey ? state.quickBookingSuggestionsData : null;
  const currentDay = apiPayload?.currentDay || buildSuggestedTimesForDate(date, service);
  const suggestions = Array.isArray(currentDay?.suggestions) ? currentDay.suggestions : [];

  els.quickBookingSuggestions.innerHTML = suggestions.length
    ? suggestions
        .map(
          (time) =>
            `<button class="prompt-chip" type="button" data-quick-booking-time="${escapeHtml(time)}">${escapeHtml(time)}</button>`
        )
        .join("")
    : `<span class="empty-state">${
        currentDay.closed ? "This business is closed on that day." : "No simple suggestions for that day. Try another date or enter a time manually."
      }</span>`;

  const nearbyDays = Array.isArray(apiPayload?.nearbyDays) && apiPayload.nearbyDays.length
    ? apiPayload.nearbyDays.map((day) => ({
        date: day.date,
        firstTime: Array.isArray(day.suggestions) ? day.suggestions[0] : "",
        count: Array.isArray(day.suggestions) ? day.suggestions.length : 0
      }))
    : (() => {
        const fallbackDays = [];
        for (let offset = 1; offset <= 7; offset += 1) {
          const candidateDate = addDaysToDateKey(date, offset);
          const candidate = buildSuggestedTimesForDate(candidateDate, service);
          if (candidate.closed || !candidate.suggestions.length) continue;
          fallbackDays.push({
            date: candidateDate,
            firstTime: candidate.suggestions[0],
            count: candidate.suggestions.length
          });
          if (fallbackDays.length >= 4) break;
        }
        return fallbackDays;
      })();

  els.quickBookingDaySuggestions.innerHTML = nearbyDays.length
    ? nearbyDays
        .map(
          (day) =>
            `<button class="prompt-chip" type="button" data-quick-booking-date="${escapeHtml(day.date)}">${escapeHtml(
              formatDateLong(day.date)
            )} - ${escapeHtml(day.firstTime)}${day.count > 1 ? ` +${escapeHtml(String(day.count - 1))} more` : ""}</button>`
        )
        .join("")
    : '<span class="empty-state">No better nearby day found yet. Try a later date or enter a time manually.</span>';
}

async function refreshQuickBookingSuggestions() {
  if (!els.quickBookingSuggestions || !els.quickBookingDaySuggestions) return;
  const serviceName = String(els.quickBookingService?.value || "").trim();
  const date = String(els.quickBookingDate?.value || "").trim();
  if (!serviceName || !date) {
    state.quickBookingSuggestionsKey = "";
    state.quickBookingSuggestionsData = null;
    renderQuickBookingSuggestions();
    return;
  }

  const requestKey = `${serviceName}|${date}`;
  state.quickBookingSuggestionsKey = requestKey;
  els.quickBookingSuggestions.innerHTML = '<span class="empty-state">Loading suggested times...</span>';
  els.quickBookingDaySuggestions.innerHTML = '<span class="empty-state">Checking nearby day options...</span>';
  try {
    const payload = await api(
      `/api/businesses/me/booking-suggestions?service=${encodeURIComponent(serviceName)}&date=${encodeURIComponent(date)}`
    );
    if (state.quickBookingSuggestionsKey !== requestKey) return;
    state.quickBookingSuggestionsData = payload;
  } catch {
    if (state.quickBookingSuggestionsKey !== requestKey) return;
    state.quickBookingSuggestionsData = null;
  }
  renderQuickBookingSuggestions();
}

function openQuickBookingModal() {
  if (!els.quickBookingModal) return;
  renderQuickBookingPreview();
  refreshQuickBookingSuggestions();
  els.quickBookingModal.hidden = false;
}

function closeQuickBookingModal() {
  if (els.quickBookingModal) els.quickBookingModal.hidden = true;
}

function renderAdminBusinesses(businesses) {
  if (!els.adminBusinessTable) return;
  els.adminBusinessTable.innerHTML = Array.isArray(businesses) && businesses.length
    ? businesses
        .map(
          (business) => `
            <article class="admin-row ${business.id === state.selectedAdminBusinessId ? "is-selected" : ""}" data-admin-business-id="${escapeHtml(
              business.id || ""
            )}">
              <div>
                <strong>${escapeHtml(business.name || "Business")}</strong>
                <small>${escapeHtml(business.owner?.name || "No owner linked yet")}</small>
              </div>
              <div>
                <strong>${escapeHtml(cap(business.type || ""))}</strong>
                <small>${escapeHtml(business.subscription?.plan || "no plan")}</small>
              </div>
              <div>
                <strong>${escapeHtml(String(business.stats?.bookingCount || 0))}</strong>
                <small>total bookings</small>
              </div>
              <div>
                <strong>${escapeHtml(currency(business.stats?.revenue || 0))}</strong>
                <small>${escapeHtml(business.city || "")}${business.country ? `, ${escapeHtml(business.country)}` : ""}</small>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No businesses available.</div>';
}

function renderAdminBusinessDetail() {
  if (!els.adminBusinessDetail) return;
  const business = state.adminBusinesses.find((row) => row.id === state.selectedAdminBusinessId) || null;
  if (!business) {
    els.adminBusinessDetail.innerHTML = '<div class="empty-state">Select a business to review it.</div>';
    return;
  }

  const recentBookings = Array.isArray(business.recentBookings) ? business.recentBookings : [];
  const services = Array.isArray(business.services) ? business.services : [];
  const location = [business.address, business.city, business.postcode, business.country].filter(Boolean).join(", ");
  const planLabel = business.subscription?.plan ? cap(business.subscription.plan) : "No plan";
  const statusLabel = business.subscription?.status ? cap(business.subscription.status) : "Inactive";
  const billing = buildBusinessBillingState(business);
  const notificationHealth = evaluateAdminNotificationHealth(business);

  els.adminBusinessDetail.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(business.name || "Business")}</strong>
      <small>${escapeHtml(cap(business.type || ""))}</small>
      <small>${escapeHtml(business.stats?.healthLabel || "No health signal yet")}</small>
    </article>
    <article class="detail-card">
      <strong>Owner and plan</strong>
      <small>${escapeHtml(business.owner?.name || "No owner linked yet")}</small>
      <small>${escapeHtml(business.owner?.email || business.email || "No email saved")}</small>
      <small>${escapeHtml(`${planLabel} plan - ${statusLabel}`)}</small>
      <small class="${escapeHtml(billing.tone)}">${escapeHtml(billing.label)}</small>
    </article>
    <article class="detail-card">
      <strong>Business snapshot</strong>
      <small>${escapeHtml(String(business.stats?.customerCount || 0))} known customers</small>
      <small>${escapeHtml(String(business.stats?.serviceCount || 0))} services live</small>
      <small>${escapeHtml(String(business.stats?.upcomingBookings || 0))} upcoming bookings</small>
      <small>${escapeHtml(String(business.stats?.cancelledBookings || 0))} cancelled bookings</small>
    </article>
    <article class="detail-card">
      <strong>Notification delivery</strong>
      <small>${escapeHtml(`${String(business.stats?.notificationSentCount || 0)} successful sends logged`)}</small>
      <small>${escapeHtml(`${String(business.stats?.notificationFailedCount || 0)} failed channel deliveries logged`)}</small>
      <small>${escapeHtml(notificationHealth.summary)}</small>
      ${notificationHealth.issues.map((item) => `<small>${escapeHtml(item)}</small>`).join("")}
      ${notificationHealth.nextSteps.map((item) => `<small>${escapeHtml(`Next check: ${item}`)}</small>`).join("")}
      <div class="inline-actions">
        <button type="button" data-admin-detail-action="notif-open" data-admin-business-id="${escapeHtml(business.id || "")}">Keep this salon open</button>
        <button type="button" data-admin-detail-action="notif-checks" data-admin-business-id="${escapeHtml(business.id || "")}">What should I check?</button>
        <button type="button" data-admin-detail-action="notif-lexi" data-admin-business-id="${escapeHtml(business.id || "")}">Ask Lexi to fix it</button>
      </div>
    </article>
    <article class="detail-card">
      <strong>Billing and renewal</strong>
      <small>${escapeHtml(`${planLabel} plan - ${statusLabel}`)}</small>
      <small>${escapeHtml(
        billing.renewalDate ? `Renewal date: ${formatDateLong(String(billing.renewalDate).slice(0, 10))}` : "Renewal date not saved yet"
      )}</small>
      <small class="${escapeHtml(billing.tone)}">${escapeHtml(billing.renewalLabel)}</small>
    </article>
    <article class="detail-card">
      <strong>Contact and location</strong>
      <small>${escapeHtml(business.phone || "No phone saved")}</small>
      <small>${escapeHtml(location || "No address saved")}</small>
      <small>${escapeHtml(`Rating ${Number(business.rating || 0).toFixed(1)}`)}</small>
    </article>
    <article class="detail-card">
      <strong>Main services</strong>
      ${
        services.length
          ? services.map((service) => `<small>${escapeHtml(service.name || "Service")}</small>`).join("")
          : "<small>No services saved yet.</small>"
      }
    </article>
    <article class="detail-card">
      <strong>Recent bookings</strong>
      ${
        recentBookings.length
          ? recentBookings
              .map(
                (booking) =>
                  `<small>${escapeHtml(booking.customerName || "Customer")} - ${escapeHtml(booking.service || "Service")} - ${escapeHtml(
                    formatDateLong(booking.date || "")
                  )} at ${escapeHtml(booking.time || "")} - ${escapeHtml(cap(booking.status || ""))}</small>`
              )
              .join("")
          : "<small>No recent bookings yet.</small>"
      }
    </article>
  `;
}

function renderAdminAccounts(accounts) {
  if (!els.adminAccountsTable) return;
  els.adminAccountsTable.innerHTML = Array.isArray(accounts) && accounts.length
    ? accounts
        .map((account) => `
          <article class="admin-row ${account.id === state.selectedAdminAccountId ? "is-selected" : ""}" data-admin-account-id="${escapeHtml(account.id || "")}">
            <div>
              <strong>${escapeHtml(account.name || "Account")}</strong>
              <small>${escapeHtml(account.email || "")}</small>
            </div>
            <div>
              <strong>${escapeHtml(cap(account.role || ""))}</strong>
              <small>${escapeHtml(account.business?.name || account.business?.city || "No linked business")}</small>
            </div>
            <div>
              <strong>${escapeHtml(String(account.stats?.bookingCount ?? account.stats?.visitCount ?? 0))}</strong>
              <small>${account.role === "subscriber" ? "bookings" : "visits"}</small>
            </div>
            <div>
              <strong>${
                account.role === "subscriber"
                  ? escapeHtml(currency(account.stats?.revenue || 0))
                  : escapeHtml(String(account.stats?.upcomingCount || 0))
              }</strong>
              <small>${account.role === "subscriber" ? escapeHtml(account.stats?.planLabel || "no plan") : "upcoming bookings"}</small>
            </div>
          </article>
        `)
        .join("")
    : '<div class="empty-state">No matching accounts found.</div>';
}

function setAdminAccountMessage(text, mode = "neutral") {
  if (!els.adminAccountEditMessage) return;
  els.adminAccountEditMessage.textContent = String(text || "");
  els.adminAccountEditMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
}

function renderAdminAccountDetail() {
  if (!els.adminAccountDetail) return;
  const account = state.adminAccounts.find((row) => row.id === state.selectedAdminAccountId) || null;
  if (!account) {
    els.adminAccountDetail.innerHTML = '<div class="empty-state">Select an account to review and edit it.</div>';
    if (els.adminEditName) els.adminEditName.value = "";
    if (els.adminEditEmail) els.adminEditEmail.value = "";
    if (els.adminEditBusinessName) els.adminEditBusinessName.value = "";
    return;
  }

  const recentVisits = Array.isArray(account.recentVisits) ? account.recentVisits : [];
  const statsPrimary =
    account.role === "subscriber"
      ? `${String(account.stats?.bookingCount || 0)} bookings - ${currency(account.stats?.revenue || 0)} revenue`
      : `${String(account.stats?.visitCount || 0)} visits - ${String(account.stats?.upcomingCount || 0)} upcoming`;
  const statsSecondary =
    account.role === "subscriber"
      ? `${account.stats?.planLabel || "no plan"} - ${account.business?.city || "no city"}`
      : `${String(account.stats?.linkedBusinesses || 0)} linked salons`;

  els.adminAccountDetail.innerHTML = `
    <article class="detail-card">
      <strong>${escapeHtml(account.name || "Account")}</strong>
      <small>${escapeHtml(account.email || "")}</small>
      <small>${escapeHtml(cap(account.role || ""))}${account.business?.name ? ` - ${escapeHtml(account.business.name)}` : ""}</small>
    </article>
    <article class="detail-card">
      <strong>Activity</strong>
      <small>${escapeHtml(statsPrimary)}</small>
      <small>${escapeHtml(statsSecondary)}</small>
    </article>
    <article class="detail-card">
      <strong>Recent activity</strong>
      ${
        recentVisits.length
          ? recentVisits
              .slice(0, 4)
              .map(
                (visit) =>
                  `<small>${escapeHtml(visit.service || "Service")} - ${escapeHtml(visit.businessName || "Salon")} - ${escapeHtml(
                    formatDateLong(visit.date || "")
                  )}</small>`
              )
              .join("")
          : `<small>${escapeHtml(account.stats?.lastBookingAt ? new Date(account.stats.lastBookingAt).toLocaleString("en-GB") : "No recent activity available.")}</small>`
      }
    </article>
  `;

  if (els.adminEditName) els.adminEditName.value = String(account.name || "");
  if (els.adminEditEmail) els.adminEditEmail.value = String(account.email || "");
  if (els.adminEditBusinessName) {
    els.adminEditBusinessName.value = String(account.business?.name || "");
    els.adminEditBusinessName.disabled = account.role !== "subscriber";
  }
}

function renderAdminOnboarding() {
  if (!els.adminOnboardingCard || !els.adminOnboardingContent) return;
  const businessCount = Array.isArray(state.adminBusinesses) ? state.adminBusinesses.length : 0;
  const alertCount = buildAdminBusinessAlerts(state.adminBusinesses || []).length;
  const accountCount = Array.isArray(state.adminAccounts) ? state.adminAccounts.length : 0;
  const needsGuide = true;

  if (!needsGuide) {
    els.adminOnboardingCard.hidden = true;
    return;
  }

  els.adminOnboardingCard.hidden = false;
  els.adminOnboardingContent.innerHTML = `
    <div class="insight-grid insight-grid-two">
      <div class="insight-panel">
        <h3>What this control room is for</h3>
        <div class="channel-list">
          <article class="channel-row">
            <div>
              <strong>Watch app revenue and subscription health</strong>
              <small>Use the finance and billing cards to see how the app itself is performing.</small>
            </div>
            <div><small class="status-positive">Live</small></div>
          </article>
          <article class="channel-row">
            <div>
              <strong>Spot which salons need attention</strong>
              <small>${escapeHtml(String(alertCount))} current cross-business alert${alertCount === 1 ? "" : "s"} are visible from the admin view.</small>
            </div>
            <div><small class="status-positive">Live</small></div>
          </article>
          <article class="channel-row">
            <div>
              <strong>Review businesses and accounts</strong>
              <small>${escapeHtml(String(businessCount))} businesses and ${escapeHtml(String(accountCount))} accounts are available to review from here.</small>
            </div>
            <div><small class="status-positive">Live</small></div>
          </article>
        </div>
      </div>
      <div class="insight-panel">
        <h3>Quick actions</h3>
        <div class="agenda-item-actions">
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="admin-alerts">Review alerts</button>
          <button class="btn btn-ghost btn-small" type="button" data-onboarding-action="admin-lexi">Ask Lexi what needs attention</button>
        </div>
        <small>The admin dashboard is for running the platform, monitoring subscriber health, and seeing app revenue.</small>
      </div>
    </div>
  `;
}

async function loadSubscriber() {
  const timeframe = String(els.revenueTimeframeSelect?.value || "today");
  const staffWeekStart = state.staffWeekStart || "";
  const [business, dashboard, bookingsPayload, liveRevenue, profitability, attribution, commercialControls, staff, integrations, crmSegments, waitlist, customerRecords] = await Promise.all([
    api("/api/businesses/me/profile"),
    api("/api/dashboard/subscriber"),
    api("/api/me/bookings?limit=200"),
    api(`/api/accounting-integrations/live-revenue?timeframe=${encodeURIComponent(timeframe)}`),
    api("/api/profitability-summary"),
    api("/api/revenue-attribution"),
    api("/api/commercial-controls"),
    api(`/api/staff-roster${staffWeekStart ? `?weekStart=${encodeURIComponent(staffWeekStart)}` : ""}`),
    api("/api/accounting-integrations"),
    api("/api/crm/segments"),
    api("/api/waitlist"),
    api("/api/customer-records")
  ]);

  state.business = business;
  state.dashboard = dashboard;
  state.bookings = Array.isArray(bookingsPayload?.bookings) ? bookingsPayload.bookings : [];
  state.liveRevenue = liveRevenue;
  state.profitability = profitability;
  state.attribution = attribution;
  state.commercialControls = commercialControls;
  state.staff = staff;
  state.staffWeekStart = String(staff?.rotaWeek?.weekStart || state.staffWeekStart || "");
  state.staffRotaDraft = cloneRotaWeek(staff?.rotaWeek || {});
  state.integrations = integrations;
  state.crmSegments = crmSegments;
  state.waitlist = waitlist;
  state.customerRecords = customerRecords;
  state.subscriberCustomers = buildSubscriberCustomers();
  if (!state.selectedSubscriberCustomerKey && state.subscriberCustomers.length) {
    state.selectedSubscriberCustomerKey = String(state.subscriberCustomers[0].key || "");
  }
  if (state.selectedSubscriberCustomerKey && !state.subscriberCustomers.some((customer) => customer.key === state.selectedSubscriberCustomerKey)) {
    state.selectedSubscriberCustomerKey = state.subscriberCustomers.length ? String(state.subscriberCustomers[0].key || "") : "";
  }

  els.businessPill.textContent = state.business?.business?.name || "Subscriber workspace";
  renderServiceOptions();
  renderQuickBookingStylistOptions();
  renderSubscriberOnboarding();
  renderSubscriberMetrics();
  renderRecoveryView();
  renderCommunicationStatus();
  renderSubscriberCustomerTable();
  renderSubscriberCustomerDetail();
  renderCalendar();
  renderSelectedDay();
  renderRevenue();
  renderAttribution();
  renderCheckoutHub();
  renderIntegrations();
  renderTeam();
  renderTeamPlanner();
  renderSegments();
  renderSubscriberMessagingBoard();
  renderWaitlist();
}

async function loadCustomer() {
  const [analytics, bookingsPayload] = await Promise.all([api("/api/dashboard/customer"), api("/api/me/bookings?limit=100")]);
  const bookings = Array.isArray(bookingsPayload?.bookings) ? bookingsPayload.bookings : [];
  state.bookings = bookings;
  els.businessPill.textContent = state.user?.name || "Customer account";
  els.customerTotalBookings.textContent = String(analytics.analytics?.totalBookings || 0);
  els.customerBookingsMeta.textContent = `${analytics.analytics?.savedBusinesses || 0} salons used${customerInsights.promptCount ? ` - ${customerInsights.promptCount} ready to rebook` : ""}`;
  els.customerUpcomingBookings.textContent = String(analytics.analytics?.upcomingBookings || 0);
  els.customerLoyaltyPoints.textContent = "0";
  renderCustomerOnboarding(analytics, bookings);
  renderCustomerNextBooking(bookings);
  const customerInsights = renderCustomerInsights(bookings, analytics) || {};
  els.customerLoyaltyPoints.textContent = String(customerInsights.promptCount || 0);
  els.customerBookingsList.innerHTML = bookings.length
    ? bookings
        .map(
          (row) => `
            <article class="agenda-item">
              <strong>${escapeHtml(row.service || "Service")} - ${escapeHtml(formatDateLong(row.date || ""))}</strong>
              <small>${escapeHtml(row.time || "")} - ${escapeHtml(row.businessName || "Salon")} - ${escapeHtml(String(row.status || ""))}</small>
              <div class="agenda-item-actions">
                <button type="button" data-customer-booking-action="reschedule" data-booking-id="${escapeHtml(row.id || "")}">Reschedule</button>
                <button type="button" data-customer-booking-action="cancel" data-booking-id="${escapeHtml(row.id || "")}">Cancel</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No bookings are linked to this customer account yet.</div>';
}

async function loadAdmin() {
  const [analytics, businessesPayload, revenueAnalytics, accountsPayload] = await Promise.all([
    api("/api/dashboard/admin"),
    api("/api/admin/businesses"),
    api("/api/dashboard/admin/revenue-analytics"),
    api("/api/admin/accounts")
  ]);
  const businesses = Array.isArray(businessesPayload?.businesses) ? businessesPayload.businesses : [];
  const accounts = Array.isArray(accountsPayload?.accounts) ? accountsPayload.accounts : [];
  state.adminBusinesses = businesses;
  if (!state.selectedAdminBusinessId && businesses.length) state.selectedAdminBusinessId = String(businesses[0].id || "");
  if (state.selectedAdminBusinessId && !businesses.some((business) => business.id === state.selectedAdminBusinessId)) {
    state.selectedAdminBusinessId = businesses.length ? String(businesses[0].id || "") : "";
  }
  state.adminAccounts = accounts;
  if (!state.selectedAdminAccountId && accounts.length) state.selectedAdminAccountId = String(accounts[0].id || "");
  if (state.selectedAdminAccountId && !accounts.some((account) => account.id === state.selectedAdminAccountId)) {
    state.selectedAdminAccountId = accounts.length ? String(accounts[0].id || "") : "";
  }
  els.businessPill.textContent = "Platform operations";
  els.adminBusinessesMetric.textContent = String(analytics.analytics?.totalBusinesses || 0);
  els.adminBusinessesMeta.textContent = `${businesses.length} listed businesses`;
  els.adminSubscribersMetric.textContent = String(analytics.analytics?.totalSubscribers || 0);
  els.adminSubscribersMeta.textContent = `${analytics.analytics?.subscriberSignupsThisMonth || 0} new this month`;
  els.adminCustomersMetric.textContent = String(analytics.analytics?.totalCustomers || 0);
  els.adminCustomersMeta.textContent = `${analytics.analytics?.customerSignupsThisMonth || 0} new this month`;
  els.adminBookingsMetric.textContent = String(analytics.analytics?.totalBookings || 0);
  els.adminBookingsMeta.textContent = `${analytics.analytics?.todayBookings || 0} today`;
  renderAdminBusinesses(businesses);
  renderAdminBusinessDetail();
  renderAdminRevenue(revenueAnalytics);
  renderAdminAlerts(businesses);
  renderAdminSubscriptionHealth(businesses);
  renderAdminBillingWatch(businesses);
  renderAdminNotificationHealth(businesses);
  renderAdminOnboarding();
  renderAdminAccounts(accounts);
  renderAdminAccountDetail();
}

async function refreshActiveRole() {
  if (state.activeRole === "subscriber") return loadSubscriber();
  if (state.activeRole === "customer") return loadCustomer();
  return loadAdmin();
}

async function bookingAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-booking-action") || "").trim();
  const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
  if (!action || !bookingId) return;
  const booking = state.bookings.find((row) => String(row.id || "") === bookingId);
  if (!booking) return;

  try {
    if (action === "service-day") {
      return openServiceDayModal(booking);
    }
    if (action === "cancel") {
      if (!window.confirm(`Cancel ${booking.customerName}'s ${booking.service} booking?`)) return;
      await api(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: "PATCH" });
    }
    if (action === "reschedule") {
      return openRescheduleModal(booking, "subscriber");
    }
    await loadSubscriber();
  } catch (error) {
    window.alert(error?.message || "Booking update failed.");
  }
}

async function customerBookingAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-customer-booking-action") || "").trim();
  const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
  if (!action) return;

  if (action === "lexi") {
    const booking = state.bookings.find((row) => String(row.id || "") === bookingId);
    return openLexi(
      booking
        ? `I need help with my ${booking.service} booking on ${booking.date} at ${booking.time}.`
        : "I need help with my booking."
    );
  }

  const booking = state.bookings.find((row) => String(row.id || "") === bookingId);
  if (!booking) return;

  try {
    if (action === "cancel") {
      if (!window.confirm(`Cancel your ${booking.service} booking on ${booking.date} at ${booking.time}?`)) return;
      await api(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: "PATCH" });
    }
    if (action === "reschedule") {
      return openRescheduleModal(booking, "customer");
    }
    await loadCustomer();
  } catch (error) {
    window.alert(error?.message || "Booking update failed.");
  }
}

function customerCareAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-customer-care-action") || "").trim();
  if (!action) return;

  if (action === "rebook") {
    const businessName = String(target.getAttribute("data-business-name") || "").trim();
    const service = String(target.getAttribute("data-service") || "").trim();
    const daysAgo = String(target.getAttribute("data-days-ago") || "").trim();
    return openLexi(`Help me book my next ${service || "appointment"} with ${businessName || "this salon"}. It has been ${daysAgo || "a while"} days since my last visit.`);
  }

  if (action === "offer") {
    const businessName = String(target.getAttribute("data-business-name") || "").trim();
    return openLexi(`Show me the best membership, package, or retail option from ${businessName || "this salon"} and help me decide what is worth booking next.`);
  }

  if (action === "gift-card") {
    const businessName = String(target.getAttribute("data-business-name") || "").trim();
    const giftCode = String(target.getAttribute("data-gift-code") || "").trim();
    const balance = String(target.getAttribute("data-balance") || "").trim();
    return openLexi(`I want to book with ${businessName || "this salon"} and use gift card ${giftCode || ""}. The remaining balance shows as ${balance || "available"}. Help me use it on my next booking.`);
  }

  if (action === "aftercare") {
    const businessName = String(target.getAttribute("data-business-name") || "").trim();
    const service = String(target.getAttribute("data-service") || "").trim();
    const aftercare = String(target.getAttribute("data-aftercare") || "").trim();
    return openLexi(`Explain my aftercare for ${service || "my last visit"} from ${businessName || "my salon"} in simple terms: ${aftercare}`);
  }
}

function onboardingAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-onboarding-action") || "").trim();
  if (!action) return;

  if (action === "add-booking") {
    openQuickBookingModal();
    return;
  }
  if (action === "open-checkout") {
    els.checkoutHubSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "ask-lexi-subscriber") {
    openLexi("Walk me through the most important setup steps for this salon dashboard.");
    return;
  }
  if (action === "customer-book") {
    openLexi("Help me book my next salon appointment and explain how this dashboard works.");
    return;
  }
  if (action === "customer-help") {
    openLexi("Explain what I can do in my customer dashboard in plain language.");
    return;
  }
  if (action === "admin-alerts") {
    els.adminAlertList?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "admin-lexi") {
    openLexi("Which businesses need attention first, and what should I do next as admin?");
  }
}

function communicationAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-communication-action") || "").trim();
  if (!action) return;
  if (action === "open-recovery") {
    els.recoveryPriorityList?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "open-messages") {
    els.subscriberMessageQueue?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "ask-lexi") {
    const readiness = state.dashboard?.communications?.readiness || {};
    openLexi(
      `Help me improve reminder setup for this salon. Current status: ${readiness.label || "unknown"}. ${readiness.summary || ""} Contact coverage: ${Number(
        readiness.contactCoveragePct || 0
      )}% of upcoming bookings.`
    );
  }
}

async function saveCommunicationSettings(event) {
  event.preventDefault();
  if (!els.commSettingsMessage) return;
  setFormMessage(els.commSettingsMessage, "Saving reminder settings...", "muted");
  try {
    const payload = {
      liveRemindersEnabled: String(els.commLiveRemindersEnabled?.value || "true") === "true",
      channelPreference: String(els.commChannelPreference?.value || "auto"),
      reminderLeadHours: Number(els.commReminderLeadHours?.value || 24),
      manualFallbackEnabled: String(els.commManualFallbackEnabled?.value || "true") === "true"
    };
    await api("/api/businesses/me/reminder-settings", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.dashboard = await api("/api/dashboard/subscriber");
    renderCommunicationStatus();
    setFormMessage(els.commSettingsMessage, "Reminder settings saved.", "success");
  } catch (error) {
    setFormMessage(els.commSettingsMessage, error?.message || "Could not save reminder settings.", "error");
  }
}

async function downloadCsv(url, fileName) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${state.token}` } });
  if (response.status === 401) {
    clearSession();
    window.location.href = "/auth";
    return;
  }
  if (!response.ok) throw new Error("Export failed.");
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

els.roleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const role = String(button.dataset.roleSwitch || "").trim();
    if (!role || button.disabled || role === state.activeRole) return;
    const params = new URLSearchParams(window.location.search);
    params.set("role", role);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    switchVisibleDashboard(role);
    await refreshActiveRole();
  });
});

els.logout?.addEventListener("click", () => {
  clearSession();
  window.location.href = "/";
});

els.calendarPrevBtn?.addEventListener("click", () => {
  state.monthCursor = addMonths(state.monthCursor, -1);
  renderCalendar();
});

els.calendarNextBtn?.addEventListener("click", () => {
  state.monthCursor = addMonths(state.monthCursor, 1);
  renderCalendar();
});

els.calendarTodayBtn?.addEventListener("click", () => {
  state.monthCursor = startOfMonth(new Date());
  state.selectedDate = toDateKey(new Date());
  renderCalendar();
  renderSelectedDay();
});

els.selectedDayFilters?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("[data-day-filter]");
  if (!(button instanceof HTMLElement)) return;
  const filter = String(button.getAttribute("data-day-filter") || "").trim();
  if (!filter) return;
  setSelectedDayFilter(filter);
  renderSelectedDay();
});

els.selectedDayViews?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("[data-day-view]");
  if (!(button instanceof HTMLElement)) return;
  const view = String(button.getAttribute("data-day-view") || "").trim();
  if (!view) return;
  setSelectedDayView(view);
  renderSelectedDay();
});

els.selectedDayAgenda?.addEventListener("click", bookingAction);
els.customerBookingsList?.addEventListener("click", customerBookingAction);
els.customerNextBookingCard?.addEventListener("click", customerBookingAction);
els.customerRebookingPrompts?.addEventListener("click", customerCareAction);
els.customerOffersList?.addEventListener("click", customerCareAction);
els.customerGiftCards?.addEventListener("click", customerCareAction);
els.customerAftercareList?.addEventListener("click", customerCareAction);
els.commSettingsForm?.addEventListener("submit", saveCommunicationSettings);
els.subscriberOnboardingContent?.addEventListener("click", onboardingAction);
els.customerOnboardingContent?.addEventListener("click", onboardingAction);
els.adminOnboardingContent?.addEventListener("click", onboardingAction);
els.commGuidanceCard?.addEventListener("click", communicationAction);
els.commDueSoonList?.addEventListener("click", communicationDueSoonAction);

els.revenueRefreshBtn?.addEventListener("click", async () => {
  if (state.activeRole === "subscriber") await loadSubscriber();
});

els.teamPlannerPrevBtn?.addEventListener("click", async () => {
  state.staffWeekStart = addWeeksToDateKey(state.staffWeekStart || toDateKey(new Date()), -1);
  if (state.activeRole === "subscriber") await loadSubscriber();
});

els.teamPlannerCurrentBtn?.addEventListener("click", async () => {
  state.staffWeekStart = "";
  if (state.activeRole === "subscriber") await loadSubscriber();
});

els.teamPlannerNextBtn?.addEventListener("click", async () => {
  state.staffWeekStart = addWeeksToDateKey(state.staffWeekStart || toDateKey(new Date()), 1);
  if (state.activeRole === "subscriber") await loadSubscriber();
});

els.teamPlannerGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const cell = target.closest("[data-team-planner-staff-id]");
  if (!(cell instanceof HTMLElement)) return;
  const staffId = String(cell.getAttribute("data-team-planner-staff-id") || "").trim();
  const dayKey = String(cell.getAttribute("data-team-planner-day") || "").trim();
  if (!staffId || !dayKey) return;
  state.selectedTeamPlannerCell = { staffId, dayKey };
  renderTeamPlanner();
});

els.teamPlannerEditor?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const status = String(target.getAttribute("data-team-planner-status") || "").trim();
  const shift = String(target.getAttribute("data-team-planner-shift") || "").trim();
  const selected = state.selectedTeamPlannerCell;
  if (!selected?.staffId || !selected?.dayKey) return;

  if (status) {
    upsertDraftRotaCell(selected.staffId, selected.dayKey, {
      status,
      shift: status === "off" || status === "sick" ? "" : getDraftRotaCell(selected.staffId, selected.dayKey, {}).shift || "full"
    });
    renderTeamPlanner();
    setTeamPlannerMessage("Planner edit ready to save.");
    return;
  }

  if (shift) {
    const current = getDraftRotaCell(selected.staffId, selected.dayKey, {});
    upsertDraftRotaCell(selected.staffId, selected.dayKey, {
      status: current.status === "off" ? "scheduled" : current.status,
      shift
    });
    renderTeamPlanner();
    setTeamPlannerMessage("Planner edit ready to save.");
  }
});

els.teamPlannerDiscardBtn?.addEventListener("click", () => {
  state.staffRotaDraft = cloneRotaWeek(state.staff?.rotaWeek || {});
  setTeamPlannerMessage("Unsaved planner edits discarded.", "success");
  renderTeamPlanner();
});

els.teamPlannerResetBtn?.addEventListener("click", async () => {
  if (!window.confirm("Reset the saved rota for this whole week?")) return;
  try {
    setTeamPlannerMessage("Resetting saved week...");
    await api("/api/staff-roster/rota/reset", {
      method: "POST",
      body: JSON.stringify({ weekStart: state.staffWeekStart || state.staff?.rotaWeek?.weekStart || "" })
    });
    await loadSubscriber();
    setTeamPlannerMessage("Saved week reset.", "success");
  } catch (error) {
    setTeamPlannerMessage(error?.message || "Unable to reset saved week.", "error");
  }
});

els.teamPlannerSaveBtn?.addEventListener("click", async () => {
  const draft = state.staffRotaDraft;
  const weekStart = String(state.staffWeekStart || state.staff?.rotaWeek?.weekStart || "").trim();
  if (!draft || !weekStart) return;
  const cells = draft.cells && typeof draft.cells === "object" ? draft.cells : {};
  const updates = [];
  Object.entries(cells).forEach(([staffId, dayMap]) => {
    if (!dayMap || typeof dayMap !== "object") return;
    Object.entries(dayMap).forEach(([day, cell]) => {
      updates.push({
        staffId,
        day,
        status: String(cell?.status || "off"),
        shift: String(cell?.shift || "")
      });
    });
  });
  try {
    setTeamPlannerMessage("Saving weekly rota...");
    const payload = await api("/api/staff-roster/rota/bulk", {
      method: "POST",
      body: JSON.stringify({ weekStart, updates })
    });
    state.staff = {
      ...(state.staff || {}),
      rotaWeek: payload
    };
    state.staffRotaDraft = cloneRotaWeek(payload || {});
    state.staffWeekStart = String(payload?.weekStart || weekStart);
    renderTeamPlanner();
    setTeamPlannerMessage("Weekly rota saved.", "success");
  } catch (error) {
    setTeamPlannerMessage(error?.message || "Unable to save weekly rota.", "error");
  }
});

els.headerExport?.addEventListener("click", async () => {
  const url =
    state.activeRole === "admin"
      ? "/api/dashboard/admin/revenue-analytics/export?format=csv"
      : "/api/accounting-integrations/export?format=csv";
  const name = state.activeRole === "admin" ? "admin_revenue_analytics.csv" : "bookings_accounting_export.csv";
  await downloadCsv(url, name);
});

els.accountingExportBtn?.addEventListener("click", async () => {
  await downloadCsv("/api/accounting-integrations/export?format=csv", "bookings_accounting_export.csv");
});

els.adminExportBtn?.addEventListener("click", async () => {
  await downloadCsv("/api/dashboard/admin/revenue-analytics/export?format=csv", "admin_revenue_analytics.csv");
});

els.integrationConnectForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/accounting-integrations/connect", {
      method: "POST",
      body: JSON.stringify({
        provider: String(els.integrationProvider?.value || "").trim(),
        accountLabel: String(els.integrationAccountLabel?.value || "").trim() || "Primary account",
        syncMode: String(els.integrationSyncMode?.value || "daily").trim()
      })
    });
    els.integrationAccountLabel.value = "";
    await loadSubscriber();
  } catch (error) {
    window.alert(error?.message || "Integration connection failed.");
  }
});

els.integrationList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const provider = String(target.getAttribute("data-disconnect-provider") || "").trim();
  if (!provider) return;
  try {
    await api(`/api/accounting-integrations/${encodeURIComponent(provider)}/disconnect`, { method: "POST" });
    await loadSubscriber();
  } catch (error) {
    window.alert(error?.message || "Disconnect failed.");
  }
});

els.subscriberSegmentsList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-segment-id]");
  if (!(row instanceof HTMLElement)) return;
  const segmentId = String(row.getAttribute("data-segment-id") || "").trim();
  const customerKey = String(row.getAttribute("data-customer-key") || "").trim();
  if (!segmentId || !customerKey) return;
  state.selectedSegmentLead = { segmentId, customerKey };
  renderSegments();
  setCampaignMessage("");
});

els.subscriberMessageQueue?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-message-task-key]");
  if (!(row instanceof HTMLElement)) return;
  const key = String(row.getAttribute("data-message-task-key") || "").trim();
  if (!key) return;
  state.selectedSubscriberMessageKey = key;
  renderSubscriberMessagingBoard();
  setSubscriberMessageBoardState("");
});

els.subscriberMessageDetail?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-message-action") || "").trim();
  const key = String(target.getAttribute("data-message-task-key") || "").trim();
  if (!action || !key) return;
  const task = buildSubscriberMessageTasks().find((row) => row.key === key);
  if (!task) return;

  if (action === "copy-message") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(task.message);
        setSubscriberMessageBoardState("Message copied. You can paste it into SMS, WhatsApp, or email.", "success");
      } else {
        setSubscriberMessageBoardState(task.message, "success");
      }
    } catch {
      setSubscriberMessageBoardState(task.message, "success");
    }
    return;
  }

  if (action === "load-follow-up") {
    const found = focusCampaignForCustomer(task.customerKey);
    setSubscriberMessageBoardState(found ? "Follow-up section prepared for this client." : "No matching follow-up group was found.", found ? "success" : "error");
    return;
  }

  if (action === "ask-lexi") {
    openLexi(`Help me send the right rebooking message to ${task.customerName}. Their last service was ${task.service || "a visit"}, and the suggested message is: ${task.message}`);
    return;
  }

  if (action === "open-recovery") {
    if (task.bookingId) {
      state.selectedRecoveryItem = { type: "risk", id: task.bookingId };
      renderRecoveryView();
      els.recoveryDetailCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (action === "book-slot") {
    focusQuickBookingDraft({
      customerName: task.customerName,
      customerPhone: task.customerPhone,
      customerEmail: task.customerEmail,
      service: task.service,
      date: task.date || state.selectedDate,
      time: task.time || "10:00"
    });
  }
});

els.subscriberCampaignForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = state.selectedSegmentLead;
  if (!selected?.segmentId || !selected?.customerKey) return setCampaignMessage("Choose a follow-up group first.", "error");
  const segment = state.crmSegments?.segments?.find((row) => row.id === selected.segmentId);
  const lead = segment?.leads?.find((row) => row.customerKey === selected.customerKey);
  if (!lead) return setCampaignMessage("Choose a follow-up group first.", "error");
  setCampaignMessage("Saving follow-up...");
  try {
    await api("/api/crm/campaigns/send", {
      method: "POST",
      body: JSON.stringify({
        segmentId: selected.segmentId,
        customerKey: selected.customerKey,
        customerName: lead.customerName,
        message: String(els.subscriberCampaignMessage?.value || "").trim() || lead.message,
        channel: "manual"
      })
    });
    setCampaignMessage("Follow-up marked as sent.", "success");
  } catch (error) {
    setCampaignMessage(error?.message || "Unable to mark follow-up.", "error");
  }
});

els.waitlistForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setWaitlistMessage("Adding to waitlist...");
  try {
    const payload = await api("/api/waitlist/upsert", {
      method: "POST",
      body: JSON.stringify({
        customerName: String(els.waitlistCustomerName?.value || "").trim(),
        customerPhone: String(els.waitlistCustomerPhone?.value || "").trim(),
        customerEmail: String(els.waitlistCustomerEmail?.value || "").trim(),
        service: String(els.waitlistService?.value || "").trim(),
        preferredDate: String(els.waitlistPreferredDate?.value || "").trim(),
        preferredTime: String(els.waitlistPreferredTime?.value || "").trim(),
        notes: String(els.waitlistNotes?.value || "").trim()
      })
    });
    state.waitlist = payload;
    renderWaitlist();
    els.waitlistForm.reset();
    setWaitlistMessage("Added to waitlist.", "success");
  } catch (error) {
    setWaitlistMessage(error?.message || "Unable to add to waitlist.", "error");
  }
});

els.waitlistEntries?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const contactId = String(target.getAttribute("data-waitlist-contact") || "").trim();
  const deleteId = String(target.getAttribute("data-waitlist-delete") || "").trim();
  try {
    if (contactId) {
      const payload = await api(`/api/waitlist/${encodeURIComponent(contactId)}/backfill`, {
        method: "POST",
        body: JSON.stringify({})
      });
      state.waitlist = payload;
      renderWaitlist();
      return;
    }
    if (deleteId) {
      const payload = await api(`/api/waitlist/${encodeURIComponent(deleteId)}`, {
        method: "DELETE"
      });
      state.waitlist = payload;
      renderWaitlist();
    }
  } catch (error) {
    setWaitlistMessage(error?.message || "Unable to update waitlist.", "error");
  }
});

els.recoveryPriorityList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const selectedRow = target.closest("[data-recovery-select-id]");
  if (selectedRow instanceof HTMLElement) {
    const type = String(selectedRow.getAttribute("data-recovery-select-type") || "").trim();
    const id = String(selectedRow.getAttribute("data-recovery-select-id") || "").trim();
    if (type && id) {
      state.selectedRecoveryItem = { type, id };
      renderRecoveryView();
    }
  }
  const lexiId = String(target.getAttribute("data-recovery-lexi") || "").trim();
  const openDay = String(target.getAttribute("data-recovery-open-day") || "").trim();
  const waitlistBookingId = String(target.getAttribute("data-recovery-book-waitlist") || "").trim();
  const waitlistContactId = String(target.getAttribute("data-recovery-contact-waitlist") || "").trim();

  if (lexiId) {
    const bookings = Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : [];
    const booking = bookings.find((row) => String(row.bookingId || row.id || "") === lexiId);
    if (!booking) return;
    openLexi(
      `Help me protect this booking: ${booking.customerName || "Customer"} has a ${booking.riskLevel || "high"} no-show risk for ${
        booking.service || "their appointment"
      } on ${booking.date} at ${booking.time}. Give me the best next action.`
    );
    return;
  }

  if (openDay) {
    state.selectedDate = openDay;
    setSelectedDayFilter("all");
    renderCalendar();
    renderSelectedDay();
    els.selectedDayAgenda?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (waitlistBookingId) {
    const entry = (Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : []).find((row) => String(row.id || "") === waitlistBookingId);
    if (!entry) return;
    focusQuickBookingDraft({
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      customerEmail: entry.customerEmail,
      service: entry.service,
      date: entry.preferredDate || state.selectedDate,
      time: entry.preferredTime || "10:00"
    });
    return;
  }

  if (waitlistContactId) {
    try {
      const payload = await api(`/api/waitlist/${encodeURIComponent(waitlistContactId)}/backfill`, {
        method: "POST",
        body: JSON.stringify({})
      });
      state.waitlist = payload;
      renderWaitlist();
      renderRecoveryView();
      setWaitlistMessage("Waitlist entry marked as contacted.", "success");
    } catch (error) {
      setWaitlistMessage(error?.message || "Unable to update waitlist.", "error");
    }
  }
});

els.recoveryDetailCard?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const copyReminderId = String(target.getAttribute("data-recovery-copy-reminder") || "").trim();
  const markAction = String(target.getAttribute("data-recovery-mark-action") || "").trim();
  const bookingId = String(target.getAttribute("data-recovery-booking-id") || "").trim();
  const waitlistBookingId = String(target.getAttribute("data-recovery-book-waitlist") || "").trim();
  const waitlistContactId = String(target.getAttribute("data-recovery-contact-waitlist") || "").trim();

  if (copyReminderId) {
    const bookings = Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : [];
    const booking = bookings.find((row) => String(row.bookingId || row.id || "") === copyReminderId);
    if (!booking) return;
    const message = buildRiskReminderMessage(booking);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        setRecoveryMessage("Reminder copied. You can paste it into SMS, WhatsApp, or email.", "success");
      } else {
        setRecoveryMessage(message, "success");
      }
    } catch {
      setRecoveryMessage(message, "success");
    }
    return;
  }

  if (markAction && bookingId) {
    const bookings = Array.isArray(state.dashboard?.operationsInsights?.noShowRisk) ? state.dashboard.operationsInsights.noShowRisk : [];
    const booking = bookings.find((row) => String(row.bookingId || row.id || "") === bookingId);
    if (!booking) return;
    setRecoveryMessage(markAction === "confirmed" ? "Saving confirmation..." : "Saving reminder action...");
    try {
      await api("/api/operations/recovery/mark-action", {
        method: "POST",
        body: JSON.stringify({
          action: markAction,
          bookingId,
          customerName: booking.customerName,
          service: booking.service,
          date: booking.date,
          time: booking.time
        })
      });
      setRecoveryMessage(markAction === "confirmed" ? "Booking marked as confirmed." : "Reminder action saved.", "success");
    } catch (error) {
      setRecoveryMessage(error?.message || "Unable to save recovery action.", "error");
    }
    return;
  }

  if (waitlistBookingId) {
    const entry = (Array.isArray(state.waitlist?.entries) ? state.waitlist.entries : []).find((row) => String(row.id || "") === waitlistBookingId);
    if (!entry) return;
    focusQuickBookingDraft({
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      customerEmail: entry.customerEmail,
      service: entry.service,
      date: entry.preferredDate || state.selectedDate,
      time: entry.preferredTime || "10:00"
    });
    return;
  }

  if (waitlistContactId) {
    try {
      const payload = await api(`/api/waitlist/${encodeURIComponent(waitlistContactId)}/backfill`, {
        method: "POST",
        body: JSON.stringify({})
      });
      state.waitlist = payload;
      renderWaitlist();
      renderRecoveryView();
      setRecoveryMessage("Waitlist entry marked as contacted.", "success");
      setWaitlistMessage("Waitlist entry marked as contacted.", "success");
    } catch (error) {
      setRecoveryMessage(error?.message || "Unable to update waitlist.", "error");
    }
  }
});

els.recoveryActionList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-recovery-action") || "").trim();
  if (!action) return;

  if (action === "Backfill today") {
    state.selectedDate = toDateKey(new Date());
    setSelectedDayFilter("gaps");
    renderCalendar();
    renderSelectedDay();
    els.selectedDayAgenda?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "Confirm risky bookings") {
    openLexi("Give me a short action plan for confirming today's high-risk bookings and reducing no-shows.");
    return;
  }

  if (action === "Bring clients back in") {
    els.subscriberSegmentsList?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "Use the waitlist") {
    els.waitlistEntries?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

els.subscriberCustomerSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.subscriberCustomerQuery = String(els.subscriberCustomerSearchInput?.value || "").trim();
  const customers = filteredSubscriberCustomers();
  state.selectedSubscriberCustomerKey = customers.length ? String(customers[0].key || "") : "";
  renderSubscriberCustomerTable();
  renderSubscriberCustomerDetail();
});

els.subscriberCustomerTable?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-subscriber-customer-key]");
  if (!(row instanceof HTMLElement)) return;
  const customerKey = String(row.getAttribute("data-subscriber-customer-key") || "").trim();
  if (!customerKey) return;
  state.selectedSubscriberCustomerKey = customerKey;
  renderSubscriberCustomerTable();
  renderSubscriberCustomerDetail();
});

els.subscriberCustomerDetail?.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const customerKey = String(form.getAttribute("data-subscriber-customer-record-form") || "").trim();
  if (!customerKey) return;
  event.preventDefault();
  const customer = state.subscriberCustomers.find((row) => row.key === customerKey);
  if (!customer) return;
  setCustomerRecordMessage(customerKey, "Saving client record...");
  try {
    const formData = new FormData(form);
    const payload = await api("/api/customer-records/upsert", {
      method: "POST",
      body: JSON.stringify({
        customerKey,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        customerPhone: customer.customerPhone,
        preferredStylist: String(formData.get("preferredStylist") || "").trim(),
        allergies: String(formData.get("allergies") || "").trim(),
        formulaNotes: String(formData.get("formulaNotes") || "").trim(),
        consultationNotes: String(formData.get("consultationNotes") || "").trim(),
        visitPrepNotes: String(formData.get("visitPrepNotes") || "").trim(),
        patchTestRequired: formData.get("patchTestRequired") === "on"
      })
    });
    const nextRecords = Array.isArray(state.customerRecords?.records) ? [...state.customerRecords.records] : [];
    const nextRecord = payload?.record || null;
    const index = nextRecords.findIndex((row) => row.customerKey === customerKey);
    if (nextRecord) {
      if (index >= 0) nextRecords[index] = nextRecord;
      else nextRecords.push(nextRecord);
    }
    state.customerRecords = { records: nextRecords };
    state.subscriberCustomers = buildSubscriberCustomers();
    renderSubscriberCustomerTable();
    renderSubscriberCustomerDetail();
    setCustomerRecordMessage(customerKey, "Client record saved.", "success");
  } catch (error) {
    setCustomerRecordMessage(customerKey, error?.message || "Unable to save client record.", "error");
  }
});

els.subscriberCustomerDetail?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-subscriber-customer-action") || "").trim();
  const customerKey = String(target.getAttribute("data-subscriber-customer-key") || "").trim();
  if (!action || !customerKey) return;
  const customer = state.subscriberCustomers.find((row) => row.key === customerKey);
  if (!customer) return;

  if (action === "book-again") {
    focusQuickBookingForCustomer(customer);
    return;
  }
  if (action === "waitlist") {
    focusWaitlistForCustomer(customer);
    return;
  }
  if (action === "lexi") {
    const recordContext = customer.customerRecord
      ? ` Client record: ${[
          customer.customerRecord.allergies ? `allergies ${customer.customerRecord.allergies}` : "",
          customer.customerRecord.formulaNotes ? `formula ${customer.customerRecord.formulaNotes}` : "",
          customer.customerRecord.visitPrepNotes ? `prep ${customer.customerRecord.visitPrepNotes}` : "",
          customer.customerRecord.patchTestRequired ? "patch test required" : ""
        ]
          .filter(Boolean)
          .join(", ")}.`
      : "";
    const prompt = customer.nextBooking
      ? `Help me manage ${customer.customerName}'s upcoming ${customer.nextBooking.service} booking on ${customer.nextBooking.date} at ${customer.nextBooking.time}.${recordContext}`
      : `Help me rebook ${customer.customerName}. Their last service was ${customer.lastService || "a visit"}${customer.daysSinceLastVisit !== null ? ` ${customer.daysSinceLastVisit} days ago` : ""}.${recordContext}`;
    openLexi(prompt);
  }
});

els.adminBusinessTable?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-admin-business-id]");
  if (!(row instanceof HTMLElement)) return;
  const businessId = String(row.getAttribute("data-admin-business-id") || "").trim();
  if (!businessId) return;
  selectAdminBusiness(businessId);
});

els.adminAlertList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-admin-alert-business-id]");
  if (!(row instanceof HTMLElement)) return;
  const businessId = String(row.getAttribute("data-admin-alert-business-id") || "").trim();
  if (!businessId) return;
  selectAdminBusiness(businessId, { scroll: true });
});

els.adminBillingList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-admin-billing-business-id]");
  if (!(row instanceof HTMLElement)) return;
  const businessId = String(row.getAttribute("data-admin-billing-business-id") || "").trim();
  if (!businessId) return;
  selectAdminBusiness(businessId, { scroll: true });
});

els.adminNotifList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionButton = target.closest("[data-admin-notif-action]");
  if (actionButton instanceof HTMLElement) {
    const businessId = String(actionButton.getAttribute("data-admin-notif-business-id") || "").trim();
    const action = String(actionButton.getAttribute("data-admin-notif-action") || "").trim();
    const business = selectAdminBusiness(businessId, { scroll: action === "open" });
    if (!business) return;
    if (action === "lexi") {
      openLexi(buildAdminNotificationLexiPrompt(business, "fix"));
    }
    return;
  }
  const row = target.closest("[data-admin-notif-business-id]");
  if (!(row instanceof HTMLElement)) return;
  const businessId = String(row.getAttribute("data-admin-notif-business-id") || "").trim();
  if (!businessId) return;
  selectAdminBusiness(businessId, { scroll: true });
});

els.adminBusinessDetail?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("[data-admin-detail-action]");
  if (!(button instanceof HTMLElement)) return;
  const action = String(button.getAttribute("data-admin-detail-action") || "").trim();
  const businessId = String(button.getAttribute("data-admin-business-id") || "").trim();
  const business = selectAdminBusiness(businessId, { scroll: action === "notif-open" });
  if (!business) return;
  if (action === "notif-checks") {
    openLexi(buildAdminNotificationLexiPrompt(business, "checks"));
    return;
  }
  if (action === "notif-lexi") {
    openLexi(buildAdminNotificationLexiPrompt(business, "fix"));
  }
});

els.adminAccountsTable?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest("[data-admin-account-id]");
  if (!(row instanceof HTMLElement)) return;
  const accountId = String(row.getAttribute("data-admin-account-id") || "").trim();
  if (!accountId) return;
  state.selectedAdminAccountId = accountId;
  renderAdminAccounts(state.adminAccounts);
  renderAdminAccountDetail();
  setAdminAccountMessage("");
});

els.adminAccountSearchForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const query = String(els.adminAccountSearchInput?.value || "").trim();
    const payload = await api(`/api/admin/accounts${query ? `?query=${encodeURIComponent(query)}` : ""}`);
    const accounts = Array.isArray(payload?.accounts) ? payload.accounts : [];
    state.adminAccounts = accounts;
    state.selectedAdminAccountId = accounts.length ? String(accounts[0].id || "") : "";
    renderAdminAccounts(accounts);
    renderAdminAccountDetail();
  } catch (error) {
    window.alert(error?.message || "Account search failed.");
  }
});

els.adminAccountEditForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const accountId = String(state.selectedAdminAccountId || "").trim();
  if (!accountId) return setAdminAccountMessage("Select an account first.", "error");
  setAdminAccountMessage("Saving account...");
  try {
    const account = state.adminAccounts.find((row) => row.id === accountId);
    const payload = await api(`/api/admin/accounts/${encodeURIComponent(accountId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: String(els.adminEditName?.value || "").trim(),
        email: String(els.adminEditEmail?.value || "").trim(),
        businessName: account?.role === "subscriber" ? String(els.adminEditBusinessName?.value || "").trim() : ""
      })
    });
    const updated = payload?.account || null;
    if (updated) {
      state.adminAccounts = state.adminAccounts.map((row) => (row.id === updated.id ? updated : row));
      renderAdminAccounts(state.adminAccounts);
      renderAdminAccountDetail();
    }
    setAdminAccountMessage("Account updated successfully.", "success");
  } catch (error) {
    setAdminAccountMessage(error?.message || "Account update failed.", "error");
  }
});

els.rescheduleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const bookingId = String(state.rescheduleBookingId || "").trim();
  if (!bookingId) return setRescheduleMessage("Choose a booking first.", "error");
  const date = String(els.rescheduleDateInput?.value || "").trim();
  const time = String(els.rescheduleTimeInput?.value || "").trim();
  if (!date || !time) return setRescheduleMessage("Date and time are required.", "error");
  setRescheduleMessage("Saving booking change...");
  try {
    await api(`/api/bookings/${encodeURIComponent(bookingId)}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify({ date, time })
    });
    setRescheduleMessage("Booking moved successfully.", "success");
    const targetRole = state.rescheduleRole;
    if (targetRole === "customer") {
      await loadCustomer();
    } else {
      await loadSubscriber();
    }
    closeRescheduleModal();
  } catch (error) {
    setRescheduleMessage(error?.message || "Booking update failed.", "error");
  }
});

els.serviceDayModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const choice = String(target.getAttribute("data-service-state-choice") || "").trim();
  if (!choice) return;
  if (els.serviceDayStateInput) els.serviceDayStateInput.value = choice;
  if (els.serviceDayStatePreview) {
    els.serviceDayStatePreview.textContent = `Current stage: ${serviceStateLabel(choice)}`;
    els.serviceDayStatePreview.className = serviceStateTone(choice);
  }
});

els.serviceDayRebookBtn?.addEventListener("click", () => {
  const booking = selectedServiceDayBooking();
  if (!booking) return setServiceDayMessage("Open this from a booking first.", "error");
  prefillRebookFromBooking(booking);
});

els.serviceDayCheckoutBtn?.addEventListener("click", () => {
  els.checkoutHubSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.serviceDayForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const bookingId = String(state.serviceDayBookingId || "").trim();
  const serviceState = String(els.serviceDayStateInput?.value || "").trim().toLowerCase();
  const serviceNotes = String(els.serviceDayNotesInput?.value || "").trim();
  const aftercareNotes = String(els.serviceDayAftercareInput?.value || "").trim();
  if (!bookingId) return setServiceDayMessage("No booking selected.", "error");
  if (!serviceState) return setServiceDayMessage("Choose a service stage first.", "error");

  try {
    setServiceDayMessage("Saving service update...");
    await api(`/api/bookings/${encodeURIComponent(bookingId)}/service-state`, {
      method: "PATCH",
      body: JSON.stringify({ serviceState, serviceNotes, aftercareNotes })
    });
    closeServiceDayModal();
    await loadSubscriber();
  } catch (error) {
    setServiceDayMessage(error?.message || "Unable to save service update.", "error");
  }
});

els.checkoutRetailList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const retailName = String(target.getAttribute("data-checkout-retail-name") || "").trim();
  if (!retailName) return;
  if (els.serviceDayModal?.hidden !== false || !state.serviceDayBookingId) {
    return setGiftCardIssueMessage("Open Service day on a booking first if you want to push a product into aftercare.", "error");
  }
  const current = String(els.serviceDayAftercareInput?.value || "").trim();
  const nextLine = `Recommended retail: ${retailName}.`;
  if (els.serviceDayAftercareInput) {
    els.serviceDayAftercareInput.value = current ? `${current}\n${nextLine}` : nextLine;
  }
  setGiftCardIssueMessage(`${retailName} added to the aftercare notes for this visit.`, "success");
});

els.checkoutGuidanceCard?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = String(target.getAttribute("data-checkout-action") || "").trim();
  if (!action) return;
  const booking = selectedServiceDayBooking();
  if (!booking) return;
  if (action === "rebook-current") {
    prefillRebookFromBooking(booking);
    return;
  }
  if (action === "lexi-current") {
    openLexi(`Help me finish checkout for ${booking.customerName}. They have just had ${booking.service}, and I want the best rebook and retail suggestion.`);
  }
});

els.giftCardIssueForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setGiftCardIssueMessage("Issuing gift card...");
    await api("/api/commercial-controls/gift-cards/issue", {
      method: "POST",
      body: JSON.stringify({
        purchaserName: String(els.giftCardPurchaserInput?.value || "").trim(),
        recipientName: String(els.giftCardRecipientInput?.value || "").trim(),
        initialBalance: Number(els.giftCardBalanceInput?.value || 0),
        expiresAt: String(els.giftCardExpiryInput?.value || "").trim() || null
      })
    });
    if (els.giftCardIssueForm) els.giftCardIssueForm.reset();
    setGiftCardIssueMessage("Gift card issued.", "success");
    await loadSubscriber();
  } catch (error) {
    setGiftCardIssueMessage(error?.message || "Unable to issue gift card.", "error");
  }
});

els.serviceDayCloseBtn?.addEventListener("click", closeServiceDayModal);
els.serviceDayBackdrop?.addEventListener("click", closeServiceDayModal);

els.rescheduleCloseBtn?.addEventListener("click", closeRescheduleModal);
els.rescheduleBackdrop?.addEventListener("click", closeRescheduleModal);

els.quickBookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.business?.business?.id) return;
  setBookingMessage("Creating booking...");
  try {
    const stylistName = String(els.quickBookingStylist?.value || "").trim();
    const userNotes = String(els.quickBookingNotes?.value || "").trim();
    const stylistConflicts = buildStylistConflictSummary({
      date: String(els.quickBookingDate?.value || "").trim(),
      time: String(els.quickBookingTime?.value || "").trim(),
      serviceName: String(els.quickBookingService?.value || "").trim(),
      stylistName
    });
    if (stylistConflicts.length) {
      setBookingMessage(`This stylist already has an overlapping booking at ${stylistConflicts[0].time}. Choose another time or stylist.`, "error");
      return;
    }
    await api("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        businessId: state.business.business.id,
        customerName: String(els.quickBookingCustomerName?.value || "").trim(),
        customerPhone: String(els.quickBookingCustomerPhone?.value || "").trim(),
        customerEmail: String(els.quickBookingCustomerEmail?.value || "").trim(),
        service: String(els.quickBookingService?.value || "").trim(),
        date: String(els.quickBookingDate?.value || "").trim(),
        time: String(els.quickBookingTime?.value || "").trim(),
        notes: buildBookingNotesPayload({ stylistName, userNotes }),
        source: "manual"
      })
    });
    setBookingMessage("Booking created successfully.", "success");
    resetQuickBookingDraft();
    renderQuickBookingPreview();
    await loadSubscriber();
    closeQuickBookingModal();
  } catch (error) {
    setBookingMessage(error?.message || "Booking failed.", "error");
  }
});

els.lexiFab?.addEventListener("click", () => openLexi());
els.lexiClose?.addEventListener("click", closeLexi);
els.headerAskLexi?.addEventListener("click", () => openLexi());
els.selectedDayAskLexiBtn?.addEventListener("click", () => {
  const coverage = buildSelectedDayCoverageSummary(state.selectedDate, bookingsForDate(state.selectedDate));
  openLexi(`How can I improve this day's diary on ${state.selectedDate}? Current coverage: ${coverage.pressureLabel}.`);
});
els.customerAskLexiBtn?.addEventListener("click", () => openLexi("Help me manage my next booking."));

els.headerAddBooking?.addEventListener("click", () => {
  if (state.activeRole !== "subscriber") return openLexi("How do I create a booking from this role?");
  resetQuickBookingDraft();
  setBookingMessage("");
  openQuickBookingModal();
  els.quickBookingCustomerName.focus();
});

els.selectedDayAddBookingBtn?.addEventListener("click", () => {
  resetQuickBookingDraft();
  setBookingMessage(`Booking will be created for ${formatDateLong(state.selectedDate)}.`);
  openQuickBookingModal();
  els.quickBookingCustomerName.focus();
});

els.openQuickBookingBtn?.addEventListener("click", () => {
  resetQuickBookingDraft();
  setBookingMessage("");
  openQuickBookingModal();
  els.quickBookingCustomerName.focus();
});

[
  els.quickBookingCustomerName,
  els.quickBookingCustomerPhone,
  els.quickBookingCustomerEmail,
  els.quickBookingService,
  els.quickBookingStylist,
  els.quickBookingDate,
  els.quickBookingTime,
  els.quickBookingNotes
].forEach((element) => {
  element?.addEventListener("input", renderQuickBookingPreview);
  element?.addEventListener("change", renderQuickBookingPreview);
});

[els.quickBookingService, els.quickBookingDate].forEach((element) => {
  element?.addEventListener("input", refreshQuickBookingSuggestions);
  element?.addEventListener("change", refreshQuickBookingSuggestions);
});

els.quickBookingSuggestions?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const time = String(target.getAttribute("data-quick-booking-time") || "").trim();
  if (!time || !els.quickBookingTime) return;
  els.quickBookingTime.value = time;
  renderQuickBookingPreview();
});

els.quickBookingDaySuggestions?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const date = String(target.getAttribute("data-quick-booking-date") || "").trim();
  if (!date || !els.quickBookingDate) return;
  els.quickBookingDate.value = date;
  renderQuickBookingPreview();
});

els.quickBookingCloseBtn?.addEventListener("click", closeQuickBookingModal);
els.quickBookingBackdrop?.addEventListener("click", closeQuickBookingModal);

els.lexiForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = String(els.lexiInput?.value || "").trim();
  if (!question) return;
  els.lexiInput.value = "";
  await sendLexi(question);
});

els.lexiPromptButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const prompt = String(button.getAttribute("data-lexi-prompt") || "").trim();
    if (!prompt) return;
    openLexi(prompt);
    await sendLexi(prompt);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeLexi();
  closeRescheduleModal();
  closeQuickBookingModal();
});

async function init() {
  if (!state.token || !state.user?.role) {
    window.location.href = "/auth";
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const requested = String(params.get("role") || state.user.role).trim().toLowerCase();
  const allowed = requested === state.user.role || (state.user.role === "admin" && ["subscriber", "customer", "admin"].includes(requested))
    ? requested
    : state.user.role;
  renderWeekdays();
  els.quickBookingDate.value = state.selectedDate;
  els.quickBookingTime.value = "10:00";
  renderQuickBookingPreview();
  switchVisibleDashboard(allowed);
  await refreshActiveRole();
}

init().catch((error) => {
  window.alert(error?.message || "Dashboard failed to load.");
  clearSession();
  window.location.href = "/auth";
});
