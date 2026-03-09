import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import Stripe from "stripe";
import { getNotificationProviderStatus, sendBookingNotifications } from "./src/services/notifications.js";
import { createAccountingIntegrationsService } from "./src/services/accounting_integrations.js";
import { createAccountingLiveRevenueHandlers } from "./src/services/accounting_live_revenue_handlers.js";
import { createAdminAccountSupportService } from "./src/services/admin_account_support.js";
import { createAdminPlatformHandlers } from "./src/services/admin_platform_handlers.js";
import { createAdminCopilotService } from "./src/services/admin_copilot.js";
import { createAppRuntimeConfig } from "./src/services/app_runtime_config.js";
import {
  adminPlanPriceMap,
  bookingDateRegex,
  bookingTimeRegex,
  cancellationPolicy,
  defaultPageSize,
  maxPageSize,
  subscriberMonthlyFeeGbp,
  subscriberYearlyFeeGbp,
  supportedAccountingProviders,
  supportedCommercialStatus,
  supportedGiftCardStatus,
  supportedMembershipCycles,
  supportedShipmentStatus,
  supportedShiftDays,
  supportedStaffAvailability,
  supportedStaffRotaShift,
  supportedStaffRotaStatus,
  supportedWaitlistStatus,
  yearlyDiscountPercent
} from "./src/services/app_constants.js";
import { createAppFileStores } from "./src/services/app_file_stores.js";
import { registerApplicationRoutes } from "./src/services/application_route_registration.js";
import { createAuthUtils } from "./src/services/auth_utils.js";
import { createAuthRouteHandlers } from "./src/services/auth_route_handlers.js";
import { createBusinessAvailabilityService } from "./src/services/business_availability.js";
import { createBookingCapacityService } from "./src/services/booking_capacity.js";
import { createBookingRouteHandlers } from "./src/services/booking_route_handlers.js";
import { createBillingEventService } from "./src/services/billing_events.js";
import { createBillingWebhookHandlers } from "./src/services/billing_webhook_handlers.js";
import { createBusinessReportQueueService } from "./src/services/business_report_queue.js";
import { createBusinessReportsAccountingHandlers } from "./src/services/business_reports_accounting_handlers.js";
import {
  businessTypeSearchValues,
  createBusinessProfileInputUtils,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType,
  normalizeBusinessType,
  parseHours
} from "./src/services/business_profile_defaults.js";
import { createBookingTimeUtils } from "./src/services/booking_time_utils.js";
import { createBusinessProfileService } from "./src/services/business_profile.js";
import { createBusinessProfileHandlers } from "./src/services/business_profile_handlers.js";
import { createCommercialControlsService } from "./src/services/commercial_controls.js";
import { createCommercialControlsHandlers } from "./src/services/commercial_controls_handlers.js";
import { createCopilotRouteHandlers } from "./src/services/copilot_route_handlers.js";
import {
  formatDisplayDateGb,
  formatDisplayDateWithWeekdayGb,
  formatLexiBookingDate,
  formatLexiSlotLabelForDisplay,
  slotLabel,
  toUserTimeDisplay
} from "./src/services/display_formatting.js";
import { createLiveRevenueAnalyticsService } from "./src/services/live_revenue_analytics.js";
import { createLexiDemoSeedService } from "./src/services/lexi_demo_seed.js";
import { createLexiRealtimeSupportService } from "./src/services/lexi_realtime_support.js";
import { createLexiRealtimeRouteHandlers } from "./src/services/lexi_realtime_route_handlers.js";
import { createAdminAppUsageService } from "./src/services/admin_app_usage.js";
import { isLexiRestrictedDataRequest, lexiRestrictedDataReply } from "./src/services/lexi_restrictions.js";
import { normalizeLexiReplyText } from "./src/services/lexi_text.js";
import { createPayPalBillingService } from "./src/services/paypal_billing.js";
import { createPlatformRouteHandlers } from "./src/services/platform_route_handlers.js";
import { createPublicBusinessProfileService } from "./src/services/public_business_profiles.js";
import { createPublicBusinessRouteHandlers } from "./src/services/public_business_route_handlers.js";
import { buildPublicLexiSystemPrompt } from "./src/services/public_lexi_prompt.js";
import { createPublicLexiBookingService } from "./src/services/public_lexi_booking.js";
import { createPublicChatContextService } from "./src/services/public_chat_context.js";
import { createPublicChatErrorService } from "./src/services/public_chat_error.js";
import { createPublicChatHandler } from "./src/services/public_chat_handler.js";
import { createPublicChatPromptService } from "./src/services/public_chat_prompt.js";
import { createPublicChatRouteService } from "./src/services/public_chat_route.js";
import { getPublicChatToolDefinitions } from "./src/services/public_chat_tool_definitions.js";
import { createPublicChatToolsService } from "./src/services/public_chat_tools.js";
import { createPublicLexiConversationService } from "./src/services/public_lexi_conversation.js";
import { createPublicLexiContextualService } from "./src/services/public_lexi_contextual.js";
import { createPublicLexiFallbackService } from "./src/services/public_lexi_fallback.js";
import { createPublicLexiFaqService } from "./src/services/public_lexi_faq.js";
import { createPublicLexiDiscoveryService } from "./src/services/public_lexi_discovery.js";
import { createPublicLexiIntroService } from "./src/services/public_lexi_intro.js";
import {
  extractLexiIntroducedName,
  extractLexiRequestedService,
  extractLexiTimeFromQuestion,
  formatCurrencyGBP,
  isLexiAppQuestion,
  isLexiPublicAvailabilityQuestion,
  isLexiSalonBeautyQuestion,
  nextDateForWeekday,
  normalizeLexiTypos,
  resolveLexiDateKeyFromQuestion,
  weekdayFromText
} from "./src/services/public_lexi_helpers.js";
import { createPublicLexiMemoryService } from "./src/services/public_lexi_memory.js";
import { createPublicLexiParsingService } from "./src/services/public_lexi_parsing.js";
import { createPublicBusinessSearchService } from "./src/services/public_business_search.js";
import { createOpenAiQuotaCircuitUtils } from "./src/services/openai_quota_circuit.js";
import { createRequestAuthContextUtils } from "./src/services/request_auth_context.js";
import { assertSecureRuntimeSettings, createAuditLogWriter } from "./src/services/runtime_security_audit.js";
import { createPaginationCacheUtils } from "./src/services/pagination_cache_utils.js";
import { createRevenueProfitabilityService } from "./src/services/revenue_profitability.js";
import { createRequestContextUtils } from "./src/services/request_context_utils.js";
import { createCrmSegmentsService } from "./src/services/crm_segments.js";
import { createCustomerRecordsService } from "./src/services/customer_records.js";
import { createCustomerRecordHandlers } from "./src/services/customer_record_handlers.js";
import { createReminderSettingsService } from "./src/services/reminder_settings.js";
import { createReminderDispatchService } from "./src/services/reminder_dispatch.js";
import { createRevenueProfitabilityHandlers } from "./src/services/revenue_profitability_handlers.js";
import { createRuntimeBootstrapService, createUnavailablePrisma } from "./src/services/runtime_bootstrap.js";
import { applyServerMiddleware, createServerLimiters } from "./src/services/server_middleware.js";
import { createSocialMediaService } from "./src/services/social_media.js";
import { createStaffRosterService } from "./src/services/staff_roster.js";
import { createStaffRosterHandlers } from "./src/services/staff_roster_handlers.js";
import { createSubscriberCopilotService } from "./src/services/subscriber_copilot.js";
import { createSubscriberBillingHandlers } from "./src/services/subscriber_billing_handlers.js";
import { createSubscriberDashboardHandler } from "./src/services/subscriber_dashboard_handler.js";
import { isValidEmail, isValidOptionalHttpUrl, isValidPhone, parseBooleanInput } from "./src/services/validation_utils.js";
import { createWaitlistService } from "./src/services/waitlist.js";
import { createWaitlistHandlers } from "./src/services/waitlist_handlers.js";
import {
  clearCachePrefix,
  closeRedis,
  getJson,
  getRedisUrl,
  incrementRateLimit,
  isRedisEnabled,
  safeConnect,
  setJson
} from "./src/infrastructure/redis_runtime.js";
import { createDistributedRateLimiter } from "./src/infrastructure/distributed_rate_limit.js";
import { createEngagementRouteHandlers } from "./src/services/engagement_route_handlers.js";
import { createJobRuntime } from "./src/infrastructure/jobs.js";

if (!process.env.DATABASE_URL && process.env.DATABASE_URL_POOLER) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_POOLER;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const app = express();
const insecureJwtSecret = "dev-insecure-change-me";
const readCache = new Map();
const {
  port,
  jwtSecret,
  openAiKey,
  stripeWebhookSecret,
  paypalClientId,
  paypalClientSecret,
  paypalEnv,
  paypalWebhookId,
  appUrl,
  corsOrigin,
  openai,
  stripe
} = createAppRuntimeConfig({
  OpenAI,
  Stripe,
  insecureJwtSecret
});
const openAiQuotaCooldownMs = 10 * 60 * 1000;
const openAiQuotaLogThrottleMs = 60 * 1000;
// Shared in-memory circuit state prevents repeated quota failures from hammering OpenAI on fallback-worthy paths.
const openAiQuotaCircuitState = {
  disabledUntil: 0,
  lastLogAt: 0,
  reason: ""
};
const prisma = createUnavailablePrisma();
let jobRuntime = null;
let runtimeReadyPromise = null;
let reminderDispatchService = null;
const appFileStores = createAppFileStores({ baseDir: __dirname });
const paypalBillingService = createPayPalBillingService({
  clientId: paypalClientId,
  clientSecret: paypalClientSecret,
  env: paypalEnv,
  webhookId: paypalWebhookId,
  appUrl,
  monthlyPlanId: process.env.PAYPAL_PLAN_ID_MONTHLY || "",
  yearlyPlanId: process.env.PAYPAL_PLAN_ID_YEARLY || "",
  fetchImpl: fetch
});

const {
  isOpenAiQuotaCircuitActive,
  markOpenAiQuotaCircuit,
  clearOpenAiQuotaCircuit,
  shouldLogOpenAiQuotaError
} = createOpenAiQuotaCircuitUtils({
  openAiQuotaCircuit: openAiQuotaCircuitState,
  cooldownMs: openAiQuotaCooldownMs,
  logThrottleMs: openAiQuotaLogThrottleMs
});

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

const {
  parsePageSize,
  encodeCursor,
  decodeCursor,
  makeCacheKey,
  getCached,
  setCached,
  clearReadCache
} = createPaginationCacheUtils({
  defaultPageSize,
  maxPageSize,
  readCache,
  getJson,
  setJson,
  clearCachePrefix
});

const {
  isValidDateTimeParts,
  normalizeBookingDateTime,
  parseOpenHours,
  addMinutesToTime,
  timeToMinutes,
  dayKeyFromDate,
  bookingStartsAtMs,
  isBookingSlotInPast,
  normalizeBookingStatusValue
} = createBookingTimeUtils({
  bookingDateRegex,
  bookingTimeRegex
});

const {
  normalizeBusinessHoursInput,
  normalizeBusinessServicesInput
} = createBusinessProfileInputUtils({
  parseOpenHours,
  timeToMinutes
});

const writeAuditEntry = createAuditLogWriter({ prisma });
async function processBookingNotificationDelivery(payload) {
  const businessId = payload?.booking?.businessId || payload?.businessId || null;
  const reminderSettings = businessId ? await reminderSettingsService.getReminderSettingsForBusiness(businessId) : null;
  const result = await sendBookingNotifications({
    ...payload,
    reminderSettings
  });
  const channels = Array.isArray(result?.channels) ? result.channels : [];
  await Promise.all(
    channels.map((row) =>
      writeAuditEntry({
        actorRole: "system",
        action: "notification.delivery",
        entityType: "notification",
        entityId: payload?.booking?.id || null,
        metadata: {
          businessId: payload?.booking?.businessId || null,
          bookingId: payload?.booking?.id || null,
          channel: row.channel || "unknown",
          outcome: row.outcome || "unknown",
          reason: row.reason || null,
          deliveryType: String(payload?.deliveryType || "booking_confirmation"),
          reminderSettings: reminderSettings
            ? {
                liveRemindersEnabled: reminderSettings.liveRemindersEnabled !== false,
                channelPreference: reminderSettings.channelPreference || "auto",
                reminderLeadHours: Number(reminderSettings.reminderLeadHours || 24),
                manualFallbackEnabled: reminderSettings.manualFallbackEnabled !== false
              }
            : null
        }
      })
    )
  );
  return result;
}
// Only enforce hard runtime safety gates in production; local/dev keeps explicit insecure defaults for bootstrapping.
const enforceRuntimeSecurity = () =>
  assertSecureRuntimeSettings({
    nodeEnv: process.env.NODE_ENV,
    jwtSecret,
    insecureJwtSecret,
    corsOrigin
  });

const { signToken: issueAuthToken, authRequired, requireRole } = createAuthUtils({
  jwt,
  jwtSecret
});
const { registerSubscriberHandler, registerCustomerHandler, loginHandler } = createAuthRouteHandlers({
  prisma,
  bcrypt,
  signToken: issueAuthToken,
  clearReadCache,
  writeAuditLog: writeAuditEntry,
  isValidEmail,
  isValidPhone,
  isValidOptionalHttpUrl,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType
});

const {
  canMutateBooking: canModifyBooking,
  getCorsOptions: buildCorsOptions,
  resolveManagedBusinessId: resolveScopedBusinessId
} = createRequestContextUtils({
  corsOrigin,
  prisma
});

const accountingIntegrationDirectoryService = createAccountingIntegrationsService({
  getPrisma: () => prisma,
  supportedAccountingProviders,
  readAccountingIntegrationsFile: appFileStores.accountingIntegrations.read,
  writeAccountingIntegrationsFile: appFileStores.accountingIntegrations.write
});
const businessReportEmailQueueService = createBusinessReportQueueService({
  getPrisma: () => prisma,
  readBusinessReportQueueFile: appFileStores.businessReportQueue.read,
  writeBusinessReportQueueFile: appFileStores.businessReportQueue.write
});
const {
  businessReportEmailHandler,
  accountingIntegrationsListHandler,
  accountingIntegrationsConnectHandler,
  accountingIntegrationsDisconnectHandler
} = createBusinessReportsAccountingHandlers({
  resolveManagedBusinessId: resolveScopedBusinessId,
  isValidEmail,
  randomUUID,
  businessReportQueueService: businessReportEmailQueueService,
  writeAuditLog: writeAuditEntry,
  accountingIntegrationsService: accountingIntegrationDirectoryService,
  supportedAccountingProviders
});

const commercialControlsService = createCommercialControlsService({
  getPrisma: () => prisma,
  readCommercialControlsFile: appFileStores.commercialControls.read,
  writeCommercialControlsFile: appFileStores.commercialControls.write,
  supportedMembershipCycles,
  supportedCommercialStatus,
  supportedGiftCardStatus,
  supportedShipmentStatus,
  randomUuid: randomUUID
});
const reminderSettingsService = createReminderSettingsService({
  readReminderSettingsFile: appFileStores.reminderSettings.read,
  writeReminderSettingsFile: appFileStores.reminderSettings.write
});
const {
  commercialControlsHandler,
  upsertMembershipHandler,
  upsertPackageHandler,
  issueGiftCardHandler,
  redeemGiftCardHandler,
  upsertMerchHandler,
  createMerchShipmentHandler
} = createCommercialControlsHandlers({
  resolveManagedBusinessId: resolveScopedBusinessId,
  commercialControlsService,
  supportedMembershipCycles,
  supportedCommercialStatus,
  supportedShipmentStatus,
  randomUUID,
  parseBooleanInput,
  writeAuditLog: writeAuditEntry
});

const staffRosterService = createStaffRosterService({
  getPrisma: () => prisma,
  readStaffRosterFile: appFileStores.staffRoster.read,
  writeStaffRosterFile: appFileStores.staffRoster.write,
  supportedShiftDays,
  supportedStaffAvailability,
  supportedStaffRotaStatus,
  supportedStaffRotaShift,
  bookingDateRegex,
  randomUuid: randomUUID
});
const {
  staffRosterHandler,
  upsertStaffRosterHandler,
  updateStaffAvailabilityHandler,
  deleteStaffRosterHandler,
  staffRotaWeekHandler,
  bulkUpdateStaffRotaHandler,
  resetStaffRotaHandler
} = createStaffRosterHandlers({
  resolveManagedBusinessId: resolveScopedBusinessId,
  staffRosterService,
  supportedStaffAvailability,
  writeAuditLog: writeAuditEntry,
  randomUUID
});

const businessSocialMediaStoreService = createSocialMediaService({
  getPrisma: () => prisma,
  readSocialMediaFile: appFileStores.socialMedia.read,
  writeSocialMediaFile: appFileStores.socialMedia.write
});

const subscriberBusinessProfileService = createBusinessProfileService({
  getPrisma: () => prisma,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType,
  parseHours,
  normalizeBusinessHoursInput,
  normalizeBusinessServicesInput
});
let businessProfileGetHandler;
let businessProfileSaveHandler;
let businessBookingSuggestionsHandler;
let applyBusinessTemplateHandler;
let businessSocialMediaGetHandler;
let businessSocialMediaSaveHandler;
let businessReminderSettingsGetHandler;
let businessReminderSettingsSaveHandler;

const lexiDemoSeedService = createLexiDemoSeedService({
  getPrisma: () => prisma,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType,
  nextDateForWeekday,
  clearReadCache,
  forceSeedEnv: process.env.FORCE_LEXI_DEMO_SEED || ""
});

const adminUsageAnalyticsService = createAdminAppUsageService({
  getPrisma: () => prisma
});

const adminAccountPayloadService = createAdminAccountSupportService({
  getPrisma: () => prisma,
  normalizeBookingDateTime
});

const adminCopilotService = createAdminCopilotService({
  getPrisma: () => prisma,
  openai,
  stripeConfigured: Boolean(stripe),
  paypalConfigured: Boolean(paypalClientId && paypalClientSecret),
  getRedisUrl,
  isRedisEnabled,
  resolveManagedBusinessId: resolveScopedBusinessId,
  normalizeLexiTypos,
  normalizeLexiReplyText,
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
});

const subscriberCopilotService = createSubscriberCopilotService({
  getPrisma: () => prisma,
  openai,
  resolveManagedBusinessId: resolveScopedBusinessId,
  normalizeLexiTypos,
  normalizeLexiReplyText,
  stripeConfigured: Boolean(stripe),
  paypalConfigured: Boolean(paypalClientId && paypalClientSecret),
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
});
const {
  subscriberBillingSummaryHandler,
  createCheckoutSessionHandler,
  createPaypalSubscriptionHandler,
  createPortalSessionHandler
} = createSubscriberBillingHandlers({
  prisma,
  stripe,
  appUrl,
  clearReadCache,
  writeAuditLog: writeAuditEntry,
  paypalBillingService,
  resolveManagedBusinessId: resolveScopedBusinessId,
  subscriberMonthlyFeeGbp,
  subscriberYearlyFeeGbp,
  yearlyDiscountPercent
});
const { subscriberCopilotHandler, adminCopilotHandler } = createCopilotRouteHandlers({
  isLexiRestrictedDataRequest,
  lexiRestrictedDataReply,
  subscriberCopilotService,
  adminCopilotService,
  writeAuditLog: writeAuditEntry
});
const subscriberDashboardHandler = createSubscriberDashboardHandler({
  prisma,
  resolveManagedBusinessId: resolveScopedBusinessId,
  normalizeBookingDateTime,
  getNotificationProviderStatus,
  reminderSettingsService
});
reminderDispatchService = createReminderDispatchService({
  getPrisma: () => prisma,
  reminderSettingsService,
  normalizeBookingDateTime,
  processBookingNotificationDelivery
});

const publicBusinessProfileMapperService = createPublicBusinessProfileService({
  parseHours
});

const businessAvailabilityQueryService = createBusinessAvailabilityService({
  prisma,
  parseHours,
  normalizeBookingDateTime,
  parseOpenHours,
  addMinutesToTime,
  timeToMinutes,
  dayKeyFromDate,
  slotLabel
});

const {
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness,
  mapBusiness: mapPublicBusinessSummary,
  isSlotWithinBusinessHours: isSlotWithinBusinessSchedule
} = businessAvailabilityQueryService;
const { searchBusinessesHandler, publicBusinessDetailHandler } = createPublicBusinessRouteHandlers({
  prisma,
  parsePageSize,
  decodeCursor,
  encodeCursor,
  businessTypeSearchValues,
  makeCacheKey,
  getCached,
  setCached,
  mapBusiness: mapPublicBusinessSummary,
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness
});

const { getSlotCapacityForBusinessDate, isSlotAtCapacity } = createBookingCapacityService({
  prisma,
  staffRosterService,
  dayKeyFromDate
});
({
  businessProfileGetHandler,
  businessProfileSaveHandler,
  businessBookingSuggestionsHandler,
  applyBusinessTemplateHandler,
  businessSocialMediaGetHandler,
  businessSocialMediaSaveHandler,
  businessReminderSettingsGetHandler,
  businessReminderSettingsSaveHandler
} = createBusinessProfileHandlers({
  prisma,
  resolveManagedBusinessId: resolveScopedBusinessId,
  businessProfileService: subscriberBusinessProfileService,
  socialMediaService: businessSocialMediaStoreService,
  reminderSettingsService,
  normalizeBusinessType,
  isValidEmail,
  isValidPhone,
  isValidOptionalHttpUrl,
  normalizeBookingDateTime,
  parseOpenHours,
  addMinutesToTime,
  timeToMinutes,
  dayKeyFromDate,
  isBookingSlotInPast,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  clearReadCache,
  writeAuditLog: writeAuditEntry
}));
const {
  createBookingHandler,
  publicDemoBookingsHandler,
  adminBookingsHandler,
  myBookingsHandler,
  cancelBookingHandler,
  rescheduleBookingHandler,
  updateBookingServiceStateHandler
} = createBookingRouteHandlers({
  prisma,
  parsePageSize,
  decodeCursor,
  encodeCursor,
  makeCacheKey,
  getCached,
  setCached,
  isValidPhone,
  isValidEmail,
  normalizeBookingDateTime,
  isBookingSlotInPast,
  isSlotWithinBusinessHours: isSlotWithinBusinessSchedule,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  jobRuntime,
  clearReadCache,
  writeAuditLog: writeAuditEntry,
  canMutateBooking: canModifyBooking,
  normalizeBookingStatusValue
});

const publicLexiMemoryService = createPublicLexiMemoryService({
  formatLexiBookingDate
});

const publicLexiParsingService = createPublicLexiParsingService({
  normalizeLexiTypos,
  extractLexiIntroducedName
});

const publicLexiBookingService = createPublicLexiBookingService({
  normalizeLexiTypos,
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness,
  formatLexiSlotLabelForDisplay
});

const publicBusinessSearchService = createPublicBusinessSearchService({
  getPrisma: () => prisma,
  businessTypeSearchValues,
  mapPublicBusinessProfile: publicBusinessProfileMapperService.mapPublicBusinessProfile
});

const publicLexiDiscoveryService = createPublicLexiDiscoveryService({
  searchPublicSubscribedBusinesses: (...args) => publicBusinessSearchService.searchPublicSubscribedBusinesses(...args),
  extractLexiLocationHint: publicLexiParsingService.extractLexiLocationHint,
  inferBusinessTypeFromLexiService: publicLexiParsingService.inferBusinessTypeFromLexiService
});
const publicLexiIntroService = createPublicLexiIntroService();
const publicLexiConversationService = createPublicLexiConversationService({
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness
});
const publicLexiFaqReplyService = createPublicLexiFaqService();
const publicLexiContextualReplyService = createPublicLexiContextualService({
  getPrisma: () => prisma,
  publicBusinessSearchService,
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness,
  isLexiSalonInfoIntent: publicLexiBookingService.isLexiSalonInfoIntent
});
const publicLexiFallbackReplyService = createPublicLexiFallbackService({
  normalizeLexiTypos,
  normalizeLexiReplyText,
  extractLexiIntroducedName,
  extractLexiRequestedService,
  extractLexiTimeFromQuestion,
  resolveLexiDateKeyFromQuestion,
  publicLexiMemoryService,
  publicLexiParsingService,
  publicLexiIntroService,
  publicLexiDiscoveryService,
  publicLexiBookingService,
  publicLexiConversationService,
  publicLexiContextualService: publicLexiContextualReplyService,
  publicLexiFaqService: publicLexiFaqReplyService
});
const publicChatContextService = createPublicChatContextService({
  getPrisma: () => prisma,
  isLexiAppQuestion,
  extractLexiRequestedService,
  publicLexiParsingService,
  publicBusinessSearchService
});
const publicChatToolsService = createPublicChatToolsService({
  getPrisma: () => prisma,
  publicBusinessSearchService,
  publicBusinessProfileService: publicBusinessProfileMapperService,
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness,
  normalizeBookingDateTime,
  isValidPhone,
  isValidEmail,
  isSlotWithinBusinessHours: isSlotWithinBusinessSchedule,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  clearReadCache,
  jobRuntime,
  writeAuditLog: writeAuditEntry
});
const publicChatMessagePromptService = createPublicChatPromptService({
  buildPublicLexiSystemPrompt,
  mapBusiness: mapPublicBusinessSummary
});
const publicChatRequestService = createPublicChatRouteService({
  openai,
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  isOpenAiQuotaCircuitActive,
  clearOpenAiQuotaCircuit,
  normalizeLexiReplyText,
  formatDisplayDateWithWeekdayGb,
  isLexiRestrictedDataRequest,
  lexiRestrictedDataReply,
  publicLexiMemoryService,
  publicChatContextService,
  publicLexiFallbackService: publicLexiFallbackReplyService,
  writeAuditLog: writeAuditEntry,
  getPublicChatToolDefinitions,
  publicChatPromptService: publicChatMessagePromptService,
  publicChatToolsService
});
const publicChatFailureService = createPublicChatErrorService({
  shouldLogOpenAiQuotaError,
  markOpenAiQuotaCircuit,
  buildPublicLexiFallbackReplySafe: (...args) => publicLexiFallbackReplyService.buildFallbackReplySafe(...args)
});
const publicChatHandler = createPublicChatHandler({
  publicChatRouteService: publicChatRequestService,
  publicChatErrorService: publicChatFailureService,
  publicLexiMemoryService
});
const { rateKeyByIp, rateKeyByUserOrIp, getOptionalAuth } = createRequestAuthContextUtils({
  jwt,
  jwtSecret
});

const lexiRealtimeBrokerService = createLexiRealtimeSupportService({
  prisma,
  openai,
  openAiKey,
  buildPublicLexiSystemPrompt
});

const {
  buildLexiAvatarConfig,
  createHeyGenAvatarSession,
  startHeyGenAvatarSession,
  stopHeyGenAvatarSession,
  buildLexiRealtimeInstructions,
  resolveLexiRealtimeBusiness,
  createOpenAiRealtimeClientSecret
} = lexiRealtimeBrokerService;
const {
  lexiAvatarConfigHandler,
  lexiRealtimeSessionHandler,
  lexiAvatarSessionHandler,
  lexiAvatarSessionStopHandler
} = createLexiRealtimeRouteHandlers({
  openai,
  getOptionalAuth,
  buildLexiAvatarConfig,
  buildLexiRealtimeInstructions,
  resolveLexiRealtimeBusiness,
  createOpenAiRealtimeClientSecret,
  createHeyGenAvatarSession,
  startHeyGenAvatarSession,
  stopHeyGenAvatarSession
});

const billingEventService = createBillingEventService({
  getPrisma: () => prisma,
  paypalBillingService,
  clearReadCache,
  writeAuditLog: writeAuditEntry
});
const { initializeRuntime, syncAdminFromEnv, shutdownRuntime } = createRuntimeBootstrapService({
  getPrisma: () => prisma,
  setPrisma: (value) => {
    prisma.__setClient(value);
  },
  getJobRuntime: () => jobRuntime,
  setJobRuntime: (value) => {
    jobRuntime = value;
  },
  getRuntimeReadyPromise: () => runtimeReadyPromise,
  setRuntimeReadyPromise: (value) => {
    runtimeReadyPromise = value;
  },
  safeConnect,
  closeRedis,
  getRedisUrl,
  isRedisEnabled,
  createJobRuntime,
  sendBookingNotifications: processBookingNotificationDelivery,
  billingEventService,
  lexiDemoSeedService,
  bcrypt
});
const { stripeBillingWebhookHandler, paypalBillingWebhookHandler } = createBillingWebhookHandlers({
  stripe,
  stripeWebhookSecret,
  paypalBillingService,
  jobRuntime
});
const {
  healthHandler,
  readinessHandler,
  configHandler,
  authPageHandler,
  dashboardPageHandler
} = createPlatformRouteHandlers({
  // These handlers read live runtime state, so keep them composed from the current in-memory references here.
  prisma,
  isRedisEnabled,
  jobRuntime,
  getCached,
  setCached,
  getAvailableSlotsForBusiness: listAvailableSlotsForBusiness,
  mapBusiness: mapPublicBusinessSummary,
  openai,
  cancellationPolicy,
  publicDir
});

const liveRevenueAnalyticsService = createLiveRevenueAnalyticsService({
  getPrisma: () => prisma,
  bookingDateRegex,
  toCsvCell: escapeCsvCell,
  adminPlanPriceMap,
  dailyRevenueTarget: Number(process.env.ACCOUNTING_DAILY_REVENUE_TARGET || 2000)
});
const {
  adminDashboardHandler,
  adminRevenueAnalyticsHandler,
  adminRevenueAnalyticsExportHandler,
  adminBusinessesHandler,
  adminAccountsHandler,
  adminAccountUpdateHandler
} = createAdminPlatformHandlers({
  prisma,
  adminAppUsageService: adminUsageAnalyticsService,
  liveRevenueAnalyticsService,
  adminAccountSupportService: adminAccountPayloadService,
  isValidEmail,
  writeAuditLog: writeAuditEntry
});
const { liveRevenueHandler, accountingExportHandler } = createAccountingLiveRevenueHandlers({
  bookingDateRegex,
  liveRevenueAnalyticsService,
  resolveManagedBusinessId: resolveScopedBusinessId,
  prisma
});

const revenueProfitabilityService = createRevenueProfitabilityService({
  getPrisma: () => prisma,
  readRevenueSpendFile: appFileStores.revenueSpend.read,
  writeRevenueSpendFile: appFileStores.revenueSpend.write,
  readProfitabilityInputsFile: appFileStores.profitabilityInputs.read,
  writeProfitabilityInputsFile: appFileStores.profitabilityInputs.write
});

const waitlistService = createWaitlistService({
  getPrisma: () => prisma,
  supportedWaitlistStatus,
  readWaitlistFile: appFileStores.waitlist.read,
  writeWaitlistFile: appFileStores.waitlist.write
});
const customerRecordsService = createCustomerRecordsService({
  readCustomerRecordsFile: appFileStores.customerRecords.read,
  writeCustomerRecordsFile: appFileStores.customerRecords.write
});
const {
  waitlistHandler,
  upsertWaitlistHandler,
  waitlistBackfillHandler,
  deleteWaitlistHandler
} = createWaitlistHandlers({
  prisma,
  resolveManagedBusinessId: resolveScopedBusinessId,
  waitlistService,
  randomUUID,
  isValidPhone,
  isValidEmail,
  normalizeBookingDateTime,
  writeAuditLog: writeAuditEntry
});
const {
  customerRecordsListHandler,
  customerRecordsUpsertHandler
} = createCustomerRecordHandlers({
  resolveManagedBusinessId: resolveScopedBusinessId,
  customerRecordsService,
  writeAuditLog: writeAuditEntry
});

const { customerKeyFromBooking, buildCrmSegments } = createCrmSegmentsService({
  normalizeBookingDateTime
});
const {
  recoveryActionMarkHandler,
  rebookingMarkSentHandler,
  customerDashboardHandler,
  crmSegmentsHandler,
  crmCampaignSendHandler
} = createEngagementRouteHandlers({
  prisma,
  resolveManagedBusinessId: resolveScopedBusinessId,
  writeAuditLog: writeAuditEntry,
  buildCrmSegments,
  commercialControlsService
});
const {
  revenueAttributionHandler,
  revenueAttributionSpendHandler,
  profitabilitySummaryHandler,
  upsertProfitabilityPayrollHandler,
  deleteProfitabilityPayrollHandler,
  upsertProfitabilityCostsHandler
} = createRevenueProfitabilityHandlers({
  prisma,
  resolveManagedBusinessId: resolveScopedBusinessId,
  revenueProfitabilityService,
  randomUUID,
  writeAuditLog: writeAuditEntry
});

// Start with an inline/no-Redis runtime so handlers can enqueue work safely before full runtime init.
jobRuntime = createJobRuntime({
  redisUrl: "",
  handlers: {
    onNotification: async (payload) => {
      await processBookingNotificationDelivery(payload);
    },
    onBillingEvent: async (payload) => {
      await billingEventService.processBillingEvent(payload);
    }
  }
});

const { apiLimiter, authLimiter, bookingLimiter, chatLimiter } = createServerLimiters({
  createDistributedRateLimiter,
  rateKeyByIp,
  rateKeyByUserOrIp,
  incrementRateLimit
});

applyServerMiddleware({
  app,
  express,
  helmet,
  cors,
  compression,
  getCorsOptions: buildCorsOptions,
  publicDir,
  apiLimiter,
  stripeBillingWebhookHandler,
  paypalBillingWebhookHandler
});

registerApplicationRoutes({
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
});

app.use((err, _req, res, _next) => {
  if (err?.code === "P2022") {
    return res.status(500).json({
      error: "Database schema mismatch. Run `npx prisma db push` or `npm run prisma:migrate`."
    });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error." });
});

export { app, prisma, initializeRuntime };

process.on("SIGINT", async () => {
  reminderDispatchService?.stop();
  await shutdownRuntime();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  reminderDispatchService?.stop();
  await shutdownRuntime();
  process.exit(0);
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  enforceRuntimeSecurity();
  await initializeRuntime();
  await syncAdminFromEnv();
  reminderDispatchService?.start();
  const server = app.listen(port, () => {
    console.log(`Salon AI running on http://localhost:${port}`);
    console.log(`Background queues: ${jobRuntime?.enabled ? "enabled (Redis)" : "inline fallback"}`);
  });
  server.on("error", (error) => {
    if (error?.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other process or start with a different PORT value.`);
      return;
    }
    console.error("Server startup failed:", error?.message || error);
  });
}









