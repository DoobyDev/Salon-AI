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
import { sendBookingNotifications } from "./src/services/notifications.js";
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
import { createJobRuntime } from "./src/infrastructure/jobs.js";

if (process.env.DATABASE_URL_POOLER) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_POOLER;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const insecureJwtSecret = "dev-insecure-change-me";
const bookingDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const bookingTimeRegex = /^\d{2}:\d{2}$/;
const readCache = new Map();
const maxPageSize = 100;
const defaultPageSize = 25;

const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || insecureJwtSecret;
const openAiKey = process.env.OPENAI_API_KEY || "";
const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const paypalClientId = String(process.env.PAYPAL_CLIENT_ID || "").trim();
const paypalClientSecret = String(process.env.PAYPAL_CLIENT_SECRET || "").trim();
const paypalEnv = String(process.env.PAYPAL_ENV || "sandbox").trim().toLowerCase();
const paypalWebhookId = String(process.env.PAYPAL_WEBHOOK_ID || "").trim();
const appUrl = process.env.APP_URL || `http://localhost:${port}`;
const configuredCorsOrigin = String(process.env.CORS_ORIGIN || "").trim();
const corsOrigin = configuredCorsOrigin || (process.env.NODE_ENV === "production" ? appUrl : "*");
const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const OPENAI_QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
const OPENAI_QUOTA_LOG_THROTTLE_MS = 60 * 1000;
const openAiQuotaCircuit = {
  disabledUntil: 0,
  lastLogAt: 0,
  reason: ""
};
let prisma = createUnavailablePrisma();
let jobRuntime = null;
let runtimeReadyPromise = null;
const accountingIntegrationFile = path.join(__dirname, "data", "accounting_integrations.json");
const staffRosterFile = path.join(__dirname, "data", "staff_roster.json");
const waitlistFile = path.join(__dirname, "data", "waitlist.json");
const commercialControlsFile = path.join(__dirname, "data", "commercial_controls.json");
const revenueSpendFile = path.join(__dirname, "data", "revenue_spend.json");
const profitabilityInputsFile = path.join(__dirname, "data", "profitability_inputs.json");
const socialMediaFile = path.join(__dirname, "data", "social_media.json");
const businessReportQueueFile = path.join(__dirname, "data", "business_report_email_queue.json");
const supportedAccountingProviders = ["quickbooks", "xero", "freshbooks", "sage"];
const supportedStaffAvailability = new Set(["on_duty", "off_duty"]);
const supportedShiftDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const supportedStaffRotaStatus = new Set(["scheduled", "available", "off", "sick", "covering"]);
const supportedStaffRotaShift = new Set(["full", "am", "pm"]);
const supportedWaitlistStatus = new Set(["waiting", "contacted", "booked", "cancelled"]);
const supportedMembershipCycles = new Set(["weekly", "monthly", "quarterly", "yearly"]);
const supportedCommercialStatus = new Set(["active", "inactive"]);
const supportedGiftCardStatus = new Set(["active", "redeemed", "expired", "cancelled"]);

function createUnavailablePrisma() {
  const reject = async () => {
    throw new Error("Prisma is not initialized. Run: npm run prisma:generate");
  };
  const model = new Proxy({}, { get: () => reject });
  const models = {};
  return new Proxy(models, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return model;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

async function initPrisma() {
  try {
    const mod = await import("@prisma/client");
    const client = new mod.PrismaClient();
    await client.$connect();
    return client;
  } catch (error) {
    if (process.env.SHOW_PRISMA_ERRORS === "true") {
      console.error("Prisma initialization failed:", error.message);
    }
    return createUnavailablePrisma();
  }
}

async function assertDatabaseSchemaReady() {
  try {
    await prisma.business.findFirst({
      select: {
        id: true,
        websiteUrl: true
      }
    });
  } catch (error) {
    if (error?.code === "P2022") {
      throw new Error(
        "Database schema is out of sync (missing column). Run `npx prisma db push` or `npm run prisma:migrate`."
      );
    }
    throw error;
  }
}

function getPayPalBaseUrl() {
  return paypalEnv === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function isPayPalConfigured() {
  return Boolean(paypalClientId && paypalClientSecret);
}

function isOpenAiQuotaCircuitActive() {
  return Date.now() < Number(openAiQuotaCircuit.disabledUntil || 0);
}

function markOpenAiQuotaCircuit(reason = "insufficient_quota") {
  openAiQuotaCircuit.disabledUntil = Date.now() + OPENAI_QUOTA_COOLDOWN_MS;
  openAiQuotaCircuit.reason = String(reason || "insufficient_quota");
}

function clearOpenAiQuotaCircuit() {
  openAiQuotaCircuit.disabledUntil = 0;
  openAiQuotaCircuit.reason = "";
}

function shouldLogOpenAiQuotaError() {
  const now = Date.now();
  if (now - Number(openAiQuotaCircuit.lastLogAt || 0) < OPENAI_QUOTA_LOG_THROTTLE_MS) {
    return false;
  }
  openAiQuotaCircuit.lastLogAt = now;
  return true;
}

async function createPayPalAccessToken() {
  if (!isPayPalConfigured()) {
    throw new Error("PayPal is not configured.");
  }

  const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64");
  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const data = await res.json();
  if (!res.ok) {
    const details = Array.isArray(data?.details) ? data.details.map((item) => item?.issue).filter(Boolean).join(", ") : "";
    throw new Error(details || data?.error_description || "Unable to authorize with PayPal.");
  }
  const token = String(data?.access_token || "").trim();
  if (!token) throw new Error("PayPal access token missing.");
  return token;
}

async function createPayPalSubscriptionSession({ planId, businessId, userId, userEmail, billingCycle }) {
  const accessToken = await createPayPalAccessToken();
  const res = await fetch(`${getPayPalBaseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: `${businessId}:${userId}:${billingCycle}`,
      subscriber: {
        email_address: userEmail
      },
      application_context: {
        brand_name: "Salon AI",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/dashboard.html?billing=success&provider=paypal`,
        cancel_url: `${appUrl}/dashboard.html?billing=cancel&provider=paypal`
      }
    })
  });
  const data = await res.json();
  if (!res.ok) {
    const details = Array.isArray(data?.details) ? data.details.map((item) => item?.issue).filter(Boolean).join(", ") : "";
    throw new Error(details || data?.message || "Unable to create PayPal subscription.");
  }

  const links = Array.isArray(data?.links) ? data.links : [];
  const approveUrl = String(links.find((link) => link?.rel === "approve")?.href || "").trim();
  if (!approveUrl) throw new Error("PayPal approval link missing.");
  return {
    approvalUrl: approveUrl,
    subscriptionId: String(data?.id || "").trim()
  };
}

function parsePayPalCustomId(customId) {
  const raw = String(customId || "").trim();
  if (!raw.includes(":")) return { businessId: raw, userId: "", billingCycle: "" };
  const [businessId, userId = "", billingCycle = ""] = raw.split(":");
  return {
    businessId: String(businessId || "").trim(),
    userId: String(userId || "").trim(),
    billingCycle: String(billingCycle || "").trim().toLowerCase()
  };
}

function inferBillingCycleFromPayPalPlan(planId) {
  const raw = String(planId || "").trim();
  if (!raw) return "";
  const monthlyPlanId = String(process.env.PAYPAL_PLAN_ID_MONTHLY || "").trim();
  const yearlyPlanId = String(process.env.PAYPAL_PLAN_ID_YEARLY || "").trim();
  if (raw && raw === yearlyPlanId) return "yearly";
  if (raw && raw === monthlyPlanId) return "monthly";
  return "";
}

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function verifyPayPalWebhookSignature(payload, headers) {
  if (!paypalWebhookId) return true;
  const transmissionId = String(headers["paypal-transmission-id"] || "").trim();
  const transmissionTime = String(headers["paypal-transmission-time"] || "").trim();
  const certUrl = String(headers["paypal-cert-url"] || "").trim();
  const authAlgo = String(headers["paypal-auth-algo"] || "").trim();
  const transmissionSig = String(headers["paypal-transmission-sig"] || "").trim();
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false;

  const accessToken = await createPayPalAccessToken();
  const verifyRes = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: paypalWebhookId,
      webhook_event: payload
    })
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) return false;
  return String(verifyData?.verification_status || "").toUpperCase() === "SUCCESS";
}

async function processPayPalBillingWebhookEvent(paypalEvent = {}) {
  const eventType = String(paypalEvent?.event_type || "").trim().toUpperCase();
  const resource = paypalEvent?.resource && typeof paypalEvent.resource === "object" ? paypalEvent.resource : {};
  if (!eventType || !resource || typeof resource !== "object") return;

  const custom = parsePayPalCustomId(resource.custom_id);
  const businessId = custom.businessId;
  if (!businessId) return;

  const resourceStatus = String(resource.status || "").trim().toUpperCase();
  const billingCycle = custom.billingCycle || inferBillingCycleFromPayPalPlan(resource.plan_id) || "monthly";
  const periodEndIso = toIsoOrNull(resource?.billing_info?.next_billing_time);
  const cancelledEventTypes = new Set([
    "BILLING.SUBSCRIPTION.CANCELLED",
    "BILLING.SUBSCRIPTION.SUSPENDED",
    "BILLING.SUBSCRIPTION.EXPIRED"
  ]);

  const status = (cancelledEventTypes.has(eventType) || ["CANCELLED", "SUSPENDED", "EXPIRED"].includes(resourceStatus))
    ? "cancelled"
    : "active";
  const nextPeriodEnd = status === "active" ? periodEndIso : null;

  await prisma.subscription.upsert({
    where: { businessId },
    update: {
      status,
      plan: billingCycle,
      currentPeriodEnd: nextPeriodEnd ? new Date(nextPeriodEnd) : null
    },
    create: {
      businessId,
      status,
      plan: billingCycle,
      currentPeriodEnd: nextPeriodEnd ? new Date(nextPeriodEnd) : null
    }
  });
  clearReadCache();

  await writeAuditLog({
    actorId: custom.userId || null,
    actorRole: "system",
    action: status === "active" ? "billing.subscription_activated" : "billing.subscription_cancelled",
    entityType: "subscription",
    entityId: businessId,
    metadata: {
      provider: "paypal",
      eventType,
      paypalSubscriptionId: String(resource.id || "").trim() || null,
      billingCycle
    }
  });
}

async function initializeRuntime() {
  if (runtimeReadyPromise) return runtimeReadyPromise;
  runtimeReadyPromise = (async () => {
    prisma = await initPrisma();
    await assertDatabaseSchemaReady();
    await safeConnect();
    try {
      await ensureLexiDemoSubscribedBusinesses();
    } catch (error) {
      console.error("Lexi demo seed failed:", error?.message || error);
    }
    jobRuntime = createJobRuntime({
      redisUrl: isRedisEnabled() ? getRedisUrl() : "",
      handlers: {
        onNotification: async (payload) => {
          await sendBookingNotifications(payload);
        },
        onBillingEvent: async (payload) => {
          await processBillingEvent(payload);
        }
      }
    });
  })();
  return runtimeReadyPromise;
}

async function syncAdminFromEnv() {
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!adminEmail || !adminPassword) return;

  try {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "admin",
        name: "Platform Admin",
        passwordHash: await bcrypt.hash(adminPassword, 10)
      },
      create: {
        role: "admin",
        name: "Platform Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10)
      }
    });
  } catch (error) {
    console.error("Admin credential sync failed:", error.message);
  }
}

const cancellationPolicy = {
  hoursWindow: 24,
  feeRule: "Fee applies only if cancelled within 24 hours of appointment time."
};

const adminPlanPriceMap = {
  starter: 9.99,
  pro: 9.99,
  enterprise: 9.99,
  monthly: 9.99,
  yearly: 99.99
};
const subscriberMonthlyFeeGbp = 9.99;
const subscriberYearlyFeeGbp = 99.99;
const yearlyDiscountPercent = Number((((subscriberMonthlyFeeGbp * 12 - subscriberYearlyFeeGbp) / (subscriberMonthlyFeeGbp * 12)) * 100).toFixed(1));

function toCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function normalizeLiveTimeframe(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (raw === "7d" || raw === "7days" || raw === "week") return "7d";
  if (raw === "30d" || raw === "30days" || raw === "month") return "30d";
  return "today";
}

function normalizeBusinessType(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (["hair_salon", "hair salon", "hair", "salon", "women salon", "unisex salon"].includes(raw)) return "hair_salon";
  if (["barbershop", "barber shop", "barber", "mens salon"].includes(raw)) return "barbershop";
  if (["beauty_salon", "beauty salon", "beauty", "spa", "nails", "lash", "lashes", "brows", "skincare"].includes(raw)) return "beauty_salon";
  if (["hybrid", "hair_beauty", "hair-beauty", "hair&beauty", "hair and beauty", "both"].includes(raw)) return "hair_salon";
  return "hair_salon";
}

function businessTypeSearchValues(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "hair_salon") return ["hair_salon", "hair", "salon"];
  if (normalized === "barbershop") return ["barbershop", "barber"];
  if (normalized === "beauty_salon") return ["beauty_salon", "beauty"];
  return ["hair_salon", "barbershop", "beauty_salon", "hair", "salon", "barber", "beauty"];
}

function defaultServicesByBusinessType(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "beauty_salon") {
    return [
      { name: "Signature Facial", durationMin: 60, price: 95 },
      { name: "Brow Shaping", durationMin: 30, price: 35 },
      { name: "Gel Manicure", durationMin: 45, price: 45 }
    ];
  }
  if (normalized === "barbershop") {
    return [
      { name: "Skin Fade", durationMin: 40, price: 55 },
      { name: "Classic Cut", durationMin: 35, price: 45 },
      { name: "Beard Trim", durationMin: 30, price: 30 }
    ];
  }
  return [
    { name: "Haircut", durationMin: 45, price: 60 },
    { name: "Blowout", durationMin: 45, price: 55 },
    { name: "Color Refresh", durationMin: 90, price: 120 }
  ];
}

function defaultHoursByBusinessType(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "barbershop") {
    return {
      monday: "09:00-19:00",
      tuesday: "09:00-19:00",
      wednesday: "09:00-19:00",
      thursday: "09:00-20:00",
      friday: "09:00-20:00",
      saturday: "10:00-18:00",
      sunday: "Closed"
    };
  }
  if (normalized === "beauty_salon") {
    return {
      monday: "10:00-18:00",
      tuesday: "10:00-18:00",
      wednesday: "10:00-18:00",
      thursday: "10:00-19:00",
      friday: "10:00-19:00",
      saturday: "09:00-17:00",
      sunday: "Closed"
    };
  }
  return {
    monday: "09:00-18:00",
    tuesday: "09:00-18:00",
    wednesday: "09:00-18:00",
    thursday: "09:00-20:00",
    friday: "09:00-20:00",
    saturday: "09:00-17:00",
    sunday: "Closed"
  };
}

function defaultDescriptionByBusinessType(type, businessName) {
  const normalized = normalizeBusinessType(type);
  const name = String(businessName || "This business").trim();
  if (normalized === "barbershop") {
    return `${name} is a modern barbershop powered by Hair & Beauty AI Receptionist.`;
  }
  if (normalized === "beauty_salon") {
    return `${name} is a professional beauty salon powered by Hair & Beauty AI Receptionist.`;
  }
  return `${name} is a premium hair salon powered by Hair & Beauty AI Receptionist.`;
}

function buildLexiDemoSeedBusinesses() {
  return [
    {
      name: "North Lane Studio",
      type: "hair_salon",
      city: "Chester",
      country: "UK",
      postcode: "CH1 2AB",
      address: "12 North Lane, Chester",
      phone: "+44 1244 100201",
      email: "hello@northlanestudio.demo",
      websiteUrl: "https://northlanestudio.demo",
      rating: 4.9
    },
    {
      name: "Dockside Fade Co",
      type: "barbershop",
      city: "Liverpool",
      country: "UK",
      postcode: "L1 4DX",
      address: "88 Dockside Street, Liverpool",
      phone: "+44 151 200 3401",
      email: "bookings@docksidefade.demo",
      websiteUrl: "https://docksidefade.demo",
      rating: 4.8
    },
    {
      name: "Willow Beauty Rooms",
      type: "beauty_salon",
      city: "Manchester",
      country: "UK",
      postcode: "M2 5PL",
      address: "24 Willow Arcade, Manchester",
      phone: "+44 161 555 0192",
      email: "hello@willowbeauty.demo",
      websiteUrl: "https://willowbeauty.demo",
      rating: 4.7
    },
    {
      name: "Crown & Curl Collective",
      type: "hair_salon",
      city: "Leeds",
      country: "UK",
      postcode: "LS1 6TR",
      address: "6 Crown Court, Leeds",
      phone: "+44 113 700 4821",
      email: "team@crownandcurl.demo",
      websiteUrl: "https://crownandcurl.demo",
      rating: 4.9
    },
    {
      name: "Harbour Glow Beauty",
      type: "beauty_salon",
      city: "Bristol",
      country: "UK",
      postcode: "BS1 5AA",
      address: "31 Harbour View, Bristol",
      phone: "+44 117 330 8810",
      email: "appointments@harbourglow.demo",
      websiteUrl: "https://harbourglow.demo",
      rating: 4.8
    }
  ];
}

function buildLexiDemoSeedBookings({ business, services }) {
  const safeServices = Array.isArray(services) ? services : [];
  if (!business?.id || !safeServices.length) return [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monday = nextDateForWeekday(1, new Date());
  const friday = nextDateForWeekday(5, new Date());
  const dates = [tomorrow, monday, friday].map((d) => d.toISOString().slice(0, 10));
  const customerNames = ["Ava Reed", "Daniel Moss", "Chloe Hart", "Sam Turner", "Mia Blake"];
  return dates.map((dateKey, index) => {
    const service = safeServices[index % safeServices.length];
    return {
      businessId: business.id,
      businessName: business.name,
      customerName: customerNames[index % customerNames.length],
      customerPhone: `+44 7000 000${index + 1}${String(business.name.length % 9)}`,
      customerEmail: `demo${index + 1}.${business.id.slice(-4)}@example.test`,
      service: String(service.name || "Appointment"),
      price: Number(service.price || 0),
      date: dateKey,
      time: index === 0 ? "10:00" : index === 1 ? "13:00" : "16:00",
      status: index === 2 ? "confirmed" : "confirmed",
      source: "manual",
      notes: "Demo seed booking"
    };
  });
}

async function ensureLexiDemoSubscribedBusinesses() {
  const forceSeed = String(process.env.FORCE_LEXI_DEMO_SEED || "").trim().toLowerCase() === "true";
  const activeCount = await prisma.subscription.count({
    where: { status: { in: ["active", "trialing", "trial", "past_due"] } }
  });
  const searchableSubscribedCount = await prisma.business.count({
    where: {
      subscription: {
        is: { status: { in: ["active", "trialing", "trial", "past_due"] } }
      }
    }
  });
  if (searchableSubscribedCount >= 3 && !forceSeed) {
    console.log(`Lexi demo seed skipped (found ${searchableSubscribedCount} subscribed businesses, ${activeCount} active/trial subscriptions).`);
    return;
  }

  const slhRows = await prisma.business.findMany({
    where: { name: { contains: "slh cuts", mode: "insensitive" } },
    select: { id: true }
  });
  const deletedSlh = slhRows.length
    ? await prisma.business.deleteMany({
        where: { id: { in: slhRows.map((row) => row.id) } }
      })
    : { count: 0 };

  const seedBusinesses = buildLexiDemoSeedBusinesses();
  for (const row of seedBusinesses) {
    const existing = await prisma.business.findFirst({
      where: { name: { contains: row.name, mode: "insensitive" } },
      include: { services: true }
    });
    const businessType = normalizeBusinessType(row.type);
    const business = existing
      ? await prisma.business.update({
          where: { id: existing.id },
          data: {
            type: businessType,
            phone: row.phone,
            email: row.email,
            city: row.city,
            country: row.country,
            postcode: row.postcode,
            address: row.address,
            rating: row.rating,
            description: defaultDescriptionByBusinessType(businessType, row.name),
            websiteUrl: row.websiteUrl,
            websiteTitle: row.name,
            websiteSummary: `${row.name} accepts bookings through Lexi AI Receptionist.`,
            hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType))
          }
        })
      : await prisma.business.create({
          data: {
            name: row.name,
            type: businessType,
            phone: row.phone,
            email: row.email,
            city: row.city,
            country: row.country,
            postcode: row.postcode,
            address: row.address,
            rating: row.rating,
            description: defaultDescriptionByBusinessType(businessType, row.name),
            websiteUrl: row.websiteUrl,
            websiteTitle: row.name,
            websiteSummary: `${row.name} accepts bookings through Lexi AI Receptionist.`,
            hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType))
          }
        });

    const servicesSeed = defaultServicesByBusinessType(businessType);
    await prisma.service.deleteMany({ where: { businessId: business.id } });
    if (servicesSeed.length) {
      await prisma.service.createMany({
        data: servicesSeed.map((serviceRow) => ({
          businessId: business.id,
          name: serviceRow.name,
          durationMin: Number(serviceRow.durationMin || 45),
          price: Number(serviceRow.price || 0)
        }))
      });
    }

    await prisma.subscription.upsert({
      where: { businessId: business.id },
      update: {
        status: "active",
        plan: "pro",
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      },
      create: {
        businessId: business.id,
        status: "active",
        plan: "pro",
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });

    const bookingCount = await prisma.booking.count({ where: { businessId: business.id } });
    if (bookingCount === 0) {
      const refreshedServices = await prisma.service.findMany({ where: { businessId: business.id }, orderBy: [{ createdAt: "asc" }, { name: "asc" }] });
      const demoBookings = buildLexiDemoSeedBookings({ business, services: refreshedServices });
      if (demoBookings.length) {
        await prisma.booking.createMany({ data: demoBookings });
      }
    }
  }
  clearReadCache();
  console.log(`Lexi demo subscriber seed ready (${seedBusinesses.length} businesses${deletedSlh.count ? `, removed ${deletedSlh.count} SLH Cuts record(s)` : ""}; previous active/trial subscriptions: ${activeCount}, searchable subscribed businesses: ${searchableSubscribedCount}).`);
}

function buildAdminRevenueAnalyticsCsv(payload, generatedAtIso = new Date().toISOString()) {
  const summary = payload?.summary || {};
  const monthly = Array.isArray(payload?.monthly) ? payload.monthly : [];
  const lines = [
    "section,metric,value",
    `summary,generated_at,${toCsvCell(generatedAtIso)}`,
    `summary,active_subscriptions,${toCsvCell(summary.activeSubscriptions || 0)}`,
    `summary,estimated_mrr,${toCsvCell(summary.estimatedMrr || 0)}`,
    `summary,average_plan_value,${toCsvCell(summary.avgPlanValue || 0)}`,
    `summary,period_months,${toCsvCell(summary.periodMonths || 0)}`,
    `summary,estimated_revenue_in_period,${toCsvCell(summary.estimatedRevenueInPeriod || 0)}`,
    `summary,subscription_cancellations_in_period,${toCsvCell(summary.subscriptionCancellationsInPeriod || 0)}`,
    `summary,booking_cancellations_in_period,${toCsvCell(summary.bookingCancellationsInPeriod || 0)}`,
    "",
    "monthly,month_key,month_label,subscription_activations,subscription_cancellations,booking_cancellations,estimated_subscription_revenue"
  ];
  monthly.forEach((row) => {
    lines.push(
      [
        "monthly",
        toCsvCell(row.key || ""),
        toCsvCell(row.label || ""),
        toCsvCell(row.subscriptionActivations || 0),
        toCsvCell(row.subscriptionCancellations || 0),
        toCsvCell(row.bookingCancellations || 0),
        toCsvCell(row.estimatedSubscriptionRevenue || 0)
      ].join(",")
    );
  });
  return `${lines.join("\n")}\n`;
}

function buildBusinessAccountingBookingsCsv({ businessName = "", businessId = "", bookings = [] }, generatedAtIso = new Date().toISOString()) {
  const rows = Array.isArray(bookings) ? bookings : [];
  const totalBookings = rows.length;
  const cancelledBookings = rows.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
  const nonCancelledBookings = rows.filter((row) => String(row.status || "").toLowerCase() !== "cancelled").length;
  const grossRevenue = rows.reduce((sum, row) => sum + Number(row.price || 0), 0);
  const realizedRevenue = rows
    .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, row) => sum + Number(row.price || 0), 0);
  const lines = [
    "section,metric,value",
    `summary,generated_at,${toCsvCell(generatedAtIso)}`,
    `summary,business_id,${toCsvCell(businessId)}`,
    `summary,business_name,${toCsvCell(businessName)}`,
    `summary,total_bookings,${toCsvCell(totalBookings)}`,
    `summary,non_cancelled_bookings,${toCsvCell(nonCancelledBookings)}`,
    `summary,cancelled_bookings,${toCsvCell(cancelledBookings)}`,
    `summary,gross_revenue,${toCsvCell(Number(grossRevenue.toFixed(2)))}`,
    `summary,realized_revenue,${toCsvCell(Number(realizedRevenue.toFixed(2)))}`,
    "",
    "bookings,booking_id,date,time,status,service,price,customer_name,customer_email,customer_phone,source,created_at,updated_at"
  ];
  rows.forEach((row) => {
    lines.push(
      [
        "bookings",
        toCsvCell(row.id || ""),
        toCsvCell(row.date || ""),
        toCsvCell(row.time || ""),
        toCsvCell(row.status || ""),
        toCsvCell(row.service || ""),
        toCsvCell(Number(row.price || 0)),
        toCsvCell(row.customerName || ""),
        toCsvCell(row.customerEmail || ""),
        toCsvCell(row.customerPhone || ""),
        toCsvCell(row.source || ""),
        toCsvCell(row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        toCsvCell(row.updatedAt ? new Date(row.updatedAt).toISOString() : "")
      ].join(",")
    );
  });
  return `${lines.join("\n")}\n`;
}

async function computeBusinessLiveRevenueSnapshot(businessId, timeframe = "today", options = {}) {
  const safeTimeframe = normalizeLiveTimeframe(timeframe);
  const now = new Date();
  const nowIso = now.toISOString();
  const inputFrom = String(options?.from || "").trim();
  const inputTo = String(options?.to || "").trim();
  const customRangeRequested = bookingDateRegex.test(inputFrom) && bookingDateRegex.test(inputTo) && inputFrom <= inputTo;
  const daysInRange = customRangeRequested ? 0 : safeTimeframe === "30d" ? 30 : safeTimeframe === "7d" ? 7 : 1;
  const rangeStart = customRangeRequested
    ? new Date(`${inputFrom}T00:00:00Z`)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysInRange - 1));
  const rangeEnd = customRangeRequested ? new Date(`${inputTo}T23:59:59Z`) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const effectiveDaysInRange = customRangeRequested
    ? Math.max(1, Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : daysInRange;
  const rangeStartKey = rangeStart.toISOString().slice(0, 10);
  const rangeEndKey = rangeEnd.toISOString().slice(0, 10);
  const hourlyWindowStart = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const lastHourStart = new Date(now.getTime() - 60 * 60 * 1000);
  const lastFifteenMinStart = new Date(now.getTime() - 15 * 60 * 1000);
  const dailyTarget = Number(process.env.ACCOUNTING_DAILY_REVENUE_TARGET || 2000);
  const rangeTarget = Math.max(1, dailyTarget * effectiveDaysInRange);

  const [bookingsRange, bookingsHourly] = await Promise.all([
    prisma.booking.findMany({
      where: {
        businessId,
        date: {
          gte: rangeStartKey,
          lte: rangeEndKey
        }
      },
      select: {
        id: true,
        date: true,
        status: true,
        price: true,
        createdAt: true
      }
    }),
    prisma.booking.findMany({
      where: {
        businessId,
        createdAt: {
          gte: hourlyWindowStart
        }
      },
      select: {
        id: true,
        status: true,
        price: true,
        createdAt: true
      }
    })
  ]);

  const dailyMap = new Map();
  for (let i = 0; i < effectiveDaysInRange; i += 1) {
    const d = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, {
      date: key,
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
      revenue: 0,
      cancellations: 0,
      bookings: 0
    });
  }

  let periodRevenue = 0;
  let periodCancellationRevenue = 0;
  let periodBookings = 0;
  let periodCancellations = 0;

  bookingsRange.forEach((booking) => {
    const rowKey = String(booking.date || "");
    const slot = dailyMap.get(rowKey);
    if (!slot) return;
    const price = Number(booking.price || 0);
    const isCancelled = String(booking.status || "").toLowerCase() === "cancelled";
    slot.bookings += 1;
    periodBookings += 1;
    if (isCancelled) {
      slot.cancellations += 1;
      periodCancellations += 1;
      periodCancellationRevenue += price;
      return;
    }
    slot.revenue += price;
    periodRevenue += price;
  });

  const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 5, 0, 0, 0);
  const hourlyBuckets = [];
  const hourlyLookup = new Map();
  for (let i = 0; i < 6; i += 1) {
    const t = new Date(hourStart.getTime() + i * 60 * 60 * 1000);
    const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} ${String(
      t.getHours()
    ).padStart(2, "0")}:00`;
    const row = {
      key,
      label: t.toLocaleTimeString("en-US", { hour: "numeric" }),
      revenue: 0,
      cancellations: 0,
      bookings: 0
    };
    hourlyBuckets.push(row);
    hourlyLookup.set(key, row);
  }

  let lastHourRevenue = 0;
  let last15MinRevenue = 0;
  let lastHourBookings = 0;

  bookingsHourly.forEach((booking) => {
    const createdAt = new Date(booking.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(
      createdAt.getDate()
    ).padStart(2, "0")} ${String(createdAt.getHours()).padStart(2, "0")}:00`;
    const slot = hourlyLookup.get(key);
    const price = Number(booking.price || 0);
    const isCancelled = String(booking.status || "").toLowerCase() === "cancelled";
    if (slot) {
      slot.bookings += 1;
      if (isCancelled) {
        slot.cancellations += 1;
      } else {
        slot.revenue += price;
      }
    }
    if (!isCancelled && createdAt >= lastHourStart) {
      lastHourRevenue += price;
      lastHourBookings += 1;
    }
    if (!isCancelled && createdAt >= lastFifteenMinStart) {
      last15MinRevenue += price;
    }
  });

  const dailyRows = Array.from(dailyMap.values()).map((row) => ({
    ...row,
    revenue: Number(row.revenue.toFixed(2))
  }));
  let flowRows = [];
  if (safeTimeframe === "today") {
    flowRows = hourlyBuckets.map((row) => ({
      ...row,
      revenue: Number(row.revenue.toFixed(2))
    }));
  } else if (safeTimeframe === "7d" && !customRangeRequested) {
    flowRows = dailyRows;
  } else {
    const groupSize = 3;
    for (let i = 0; i < dailyRows.length; i += groupSize) {
      const chunk = dailyRows.slice(i, i + groupSize);
      const start = chunk[0];
      const end = chunk[chunk.length - 1];
      flowRows.push({
        key: `${start.date}_${end.date}`,
        label: `${start.label}-${end.label.split(" ").slice(-1)[0]}`,
        revenue: Number(chunk.reduce((sum, row) => sum + Number(row.revenue || 0), 0).toFixed(2)),
        cancellations: chunk.reduce((sum, row) => sum + Number(row.cancellations || 0), 0),
        bookings: chunk.reduce((sum, row) => sum + Number(row.bookings || 0), 0)
      });
    }
  }

  const cancellationRate = periodBookings > 0 ? (periodCancellations / periodBookings) * 100 : 0;
  const targetProgress = rangeTarget > 0 ? (periodRevenue / rangeTarget) * 100 : 0;

  return {
    mode: "business",
    timeframe: customRangeRequested ? "custom" : safeTimeframe,
    range: {
      from: rangeStartKey,
      to: rangeEndKey
    },
    generatedAt: nowIso,
    refreshIntervalSec: 15,
    cards: {
      todayRevenue: Number(periodRevenue.toFixed(2)),
      todayCancelledRevenue: Number(periodCancellationRevenue.toFixed(2)),
      todayBookings: periodBookings,
      todayCancellations: periodCancellations,
      lastHourRevenue: Number(lastHourRevenue.toFixed(2)),
      last15MinRevenue: Number(last15MinRevenue.toFixed(2)),
      lastHourBookings
    },
    gauges: {
      dailyTarget: Number(rangeTarget.toFixed(2)),
      targetProgressPct: Number(Math.min(999, Math.max(0, targetProgress)).toFixed(1)),
      cancellationRatePct: Number(Math.max(0, cancellationRate).toFixed(1))
    },
    stream: {
      hourly: flowRows,
      weekly: dailyRows
    }
  };
}

async function computePlatformLiveRevenueSnapshot(timeframe = "today", options = {}) {
  const safeTimeframe = normalizeLiveTimeframe(timeframe);
  const inputFrom = String(options?.from || "").trim();
  const inputTo = String(options?.to || "").trim();
  const customRangeRequested = bookingDateRegex.test(inputFrom) && bookingDateRegex.test(inputTo) && inputFrom <= inputTo;
  let monthCount = safeTimeframe === "30d" ? 6 : safeTimeframe === "7d" ? 3 : 1;
  if (customRangeRequested) {
    const fromDate = new Date(`${inputFrom}T00:00:00Z`);
    const toDate = new Date(`${inputTo}T23:59:59Z`);
    const months =
      (toDate.getUTCFullYear() - fromDate.getUTCFullYear()) * 12 +
      (toDate.getUTCMonth() - fromDate.getUTCMonth()) +
      1;
    monthCount = Math.max(1, Math.min(24, months));
  }
  const payload = await computeAdminRevenueAnalytics(monthCount);
  const monthly = Array.isArray(payload?.monthly) ? payload.monthly : [];
  const summary = payload?.summary || {};
  const nowIso = new Date().toISOString();
  const latest = monthly.length ? monthly[monthly.length - 1] : null;
  const previous = monthly.length > 1 ? monthly[monthly.length - 2] : null;
  const estimatedMrr = Number(summary.estimatedMrr || 0);
  const mrrGoal = Math.max(1, Number((estimatedMrr * 1.12).toFixed(2)));
  const subCancellationRate = Number(summary.activeSubscriptions || 0)
    ? (Number(summary.subscriptionCancellationsInPeriod || 0) / Number(summary.activeSubscriptions || 1)) * 100
    : 0;

  return {
    mode: "platform",
    timeframe: customRangeRequested ? "custom" : safeTimeframe,
    range: customRangeRequested ? { from: inputFrom, to: inputTo } : null,
    generatedAt: nowIso,
    refreshIntervalSec: 15,
    cards: {
      todayRevenue: Number(estimatedMrr.toFixed(2)),
      todayCancelledRevenue: Number(summary.estimatedRevenueInPeriod || 0),
      todayBookings: Number(summary.subscriptionCancellationsInPeriod || 0),
      todayCancellations: Number(summary.bookingCancellationsInPeriod || 0),
      lastHourRevenue: Number(latest?.estimatedSubscriptionRevenue || 0),
      last15MinRevenue: Number(previous?.estimatedSubscriptionRevenue || 0),
      lastHourBookings: Number(latest?.subscriptionActivations || 0)
    },
    gauges: {
      dailyTarget: Number(mrrGoal.toFixed(2)),
      targetProgressPct: Number(((estimatedMrr / mrrGoal) * 100).toFixed(1)),
      cancellationRatePct: Number(Math.max(0, subCancellationRate).toFixed(1))
    },
    stream: {
      hourly: monthly.map((row) => ({
        key: row.key,
        label: row.label,
        revenue: Number(row.estimatedSubscriptionRevenue || 0),
        cancellations: Number((row.subscriptionCancellations || 0) + (row.bookingCancellations || 0))
      })),
      weekly: []
    }
  };
}

async function computeAdminRevenueAnalytics(monthCount = 6) {
  const safeMonthCount = Math.max(1, Math.min(24, Number(monthCount) || 6));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - (safeMonthCount - 1), 1);

  const monthKeys = [];
  const monthLabels = [];
  for (let i = 0; i < safeMonthCount; i += 1) {
    const slot = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1);
    const key = `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
    monthLabels.push(slot.toLocaleString("en-US", { month: "short", year: "numeric" }));
  }

  const [activeSubs, auditRows, cancelledBookings] = await Promise.all([
    prisma.subscription.findMany({ select: { plan: true, status: true } }),
    prisma.auditLog.findMany({
      where: {
        action: {
          in: ["billing.subscription_activated", "billing.subscription_cancelled"]
        },
        createdAt: { gte: rangeStart }
      },
      select: { action: true, createdAt: true }
    }),
    prisma.booking.findMany({
      where: {
        status: "cancelled",
        updatedAt: { gte: rangeStart }
      },
      select: { updatedAt: true }
    })
  ]);

  const monthly = monthKeys.map((key, index) => ({
    key,
    label: monthLabels[index],
    subscriptionActivations: 0,
    subscriptionCancellations: 0,
    bookingCancellations: 0,
    estimatedSubscriptionRevenue: 0
  }));
  const monthLookup = Object.fromEntries(monthly.map((entry) => [entry.key, entry]));

  auditRows.forEach((row) => {
    const dt = new Date(row.createdAt);
    if (Number.isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const slot = monthLookup[key];
    if (!slot) return;
    if (row.action === "billing.subscription_activated") slot.subscriptionActivations += 1;
    if (row.action === "billing.subscription_cancelled") slot.subscriptionCancellations += 1;
  });

  cancelledBookings.forEach((row) => {
    const dt = new Date(row.updatedAt);
    if (Number.isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const slot = monthLookup[key];
    if (!slot) return;
    slot.bookingCancellations += 1;
  });

  const activeSubscriptions = activeSubs.filter((row) => String(row.status || "").toLowerCase() === "active");
  const estimatedMrr = activeSubscriptions.reduce((sum, row) => {
    const planKey = String(row.plan || "starter").trim().toLowerCase();
    return sum + Number(adminPlanPriceMap[planKey] || adminPlanPriceMap.starter);
  }, 0);
  const activeCount = activeSubscriptions.length;
  const avgPlanValue = activeCount > 0 ? estimatedMrr / activeCount : adminPlanPriceMap.starter;

  const netDeltaAcrossRange = monthly.reduce(
    (sum, row) => sum + row.subscriptionActivations - row.subscriptionCancellations,
    0
  );
  let estimatedActiveInMonth = Math.max(0, activeCount - netDeltaAcrossRange);
  monthly.forEach((row) => {
    estimatedActiveInMonth = Math.max(
      0,
      estimatedActiveInMonth + row.subscriptionActivations - row.subscriptionCancellations
    );
    row.estimatedSubscriptionRevenue = Number((estimatedActiveInMonth * avgPlanValue).toFixed(2));
  });

  const totals = monthly.reduce(
    (acc, row) => ({
      estimatedSubscriptionRevenue: acc.estimatedSubscriptionRevenue + row.estimatedSubscriptionRevenue,
      subscriptionCancellations: acc.subscriptionCancellations + row.subscriptionCancellations,
      bookingCancellations: acc.bookingCancellations + row.bookingCancellations
    }),
    { estimatedSubscriptionRevenue: 0, subscriptionCancellations: 0, bookingCancellations: 0 }
  );

  return {
    summary: {
      activeSubscriptions: activeCount,
      estimatedMrr: Number(estimatedMrr.toFixed(2)),
      avgPlanValue: Number(avgPlanValue.toFixed(2)),
      periodMonths: safeMonthCount,
      estimatedRevenueInPeriod: Number(totals.estimatedSubscriptionRevenue.toFixed(2)),
      subscriptionCancellationsInPeriod: totals.subscriptionCancellations,
      bookingCancellationsInPeriod: totals.bookingCancellations
    },
    monthly,
    note: "Estimated subscription revenue uses subscription status and plan-value mapping."
  };
}

function parseHours(hoursJson) {
  try {
    return JSON.parse(hoursJson);
  } catch {
    return {};
  }
}

function normalizeBusinessHoursInput(input) {
  const source = input && typeof input === "object" ? input : {};
  const keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const normalized = {};
  for (const key of keys) {
    const raw = String(source[key] || "Closed").trim();
    if (!raw || raw.toLowerCase() === "closed") {
      normalized[key] = "Closed";
      continue;
    }
    const parsed = parseOpenHours(raw);
    if (!parsed) {
      throw new Error(`Invalid hours for ${key}. Use HH:MM-HH:MM or Closed.`);
    }
    if (timeToMinutes(parsed.close) <= timeToMinutes(parsed.open)) {
      throw new Error(`Invalid hours for ${key}. Closing time must be after opening time.`);
    }
    normalized[key] = `${parsed.open}-${parsed.close}`;
  }
  return normalized;
}

function normalizeBusinessServicesInput(input) {
  const source = Array.isArray(input) ? input : [];
  const rows = source
    .map((row) => ({
      name: String(row?.name || "").trim(),
      durationMin: Number(row?.durationMin || 0),
      price: Number(row?.price || 0)
    }))
    .filter((row) => row.name);
  if (!rows.length) throw new Error("At least one service is required.");
  const invalid = rows.find((row) => !Number.isFinite(row.durationMin) || row.durationMin < 5 || !Number.isFinite(row.price) || row.price < 0);
  if (invalid) throw new Error("Each service must include a valid name, duration (>=5), and price (>=0).");
  return rows;
}

function parsePageSize(input, fallback = defaultPageSize) {
  const n = Number(input);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), maxPageSize);
}

function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(value) {
  if (!value) return null;
  try {
    const raw = Buffer.from(String(value), "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function makeCacheKey(parts) {
  return parts.map((part) => String(part)).join("|");
}

async function getCached(key) {
  const item = readCache.get(key);
  if (item && Date.now() <= item.expiresAt) {
    return item.value;
  }
  if (item && Date.now() > item.expiresAt) {
    readCache.delete(key);
  }
  const redisValue = await getJson(`cache:${key}`);
  if (!redisValue) return null;
  readCache.set(key, { value: redisValue, expiresAt: Date.now() + 5_000 });
  return redisValue;
}

async function setCached(key, value, ttlMs = 15_000) {
  readCache.set(key, {
    value,
    expiresAt: Date.now() + Math.max(1_000, ttlMs)
  });
  await setJson(`cache:${key}`, value, ttlMs);
}

function clearReadCache() {
  readCache.clear();
  clearCachePrefix("cache:").catch(() => {});
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[+\d][\d\s().-]{6,24}$/.test(phone);
}

function isValidDateTimeParts(date, time) {
  if (!bookingDateRegex.test(date) || !bookingTimeRegex.test(time)) return false;
  const parsed = new Date(`${date}T${time}:00Z`);
  return !Number.isNaN(parsed.getTime());
}

function normalizeBookingDateTime(dateInput, timeInput) {
  const date = String(dateInput || "").trim();
  const time = String(timeInput || "").trim();
  if (isValidDateTimeParts(date, time)) {
    return { date, time };
  }

  const merged = `${date} ${time}`.trim();
  const parsed = new Date(merged);
  if (Number.isNaN(parsed.getTime())) return null;

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");

  const normalized = { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
  return isValidDateTimeParts(normalized.date, normalized.time) ? normalized : null;
}

function parseOpenHours(value) {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned || cleaned === "closed") return null;
  const [openRaw, closeRaw] = value.split("-");
  if (!openRaw || !closeRaw) return null;
  const open = openRaw.trim();
  const close = closeRaw.trim();
  if (!bookingTimeRegex.test(open) || !bookingTimeRegex.test(close)) return null;
  return { open, close };
}

function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(":").map((v) => Number(v));
  const total = h * 60 + m + minutes;
  const nextH = Math.floor(total / 60);
  const nextM = total % 60;
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
}

function toUserTimeDisplay(time24h) {
  const [hourRaw, minuteRaw] = time24h.split(":").map((v) => Number(v));
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour12 = hourRaw % 12 || 12;
  return `${hour12}:${String(minuteRaw).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map((v) => Number(v));
  return h * 60 + m;
}

function dayKeyFromDate(date) {
  const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[date.getDay()];
}

function slotLabel(date, time) {
  return `${date} ${toUserTimeDisplay(time)}`;
}

function formatDisplayDateGb(value, options = {}) {
  if (!value) return "";
  const raw = String(value || "").trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-GB", options);
}

function formatDisplayDateWithWeekdayGb(value) {
  return formatDisplayDateGb(value, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatLexiSlotLabelForDisplay(slot) {
  const raw = String(slot || "").trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
  if (!match) return raw;
  return `${formatDisplayDateGb(match[1], { day: "2-digit", month: "2-digit", year: "numeric" })} ${match[2]}`;
}

function assertSecureRuntimeSettings() {
  if (process.env.NODE_ENV !== "production") return;
  if (!jwtSecret || jwtSecret === insecureJwtSecret) {
    throw new Error("JWT_SECRET is insecure. Set a strong production value.");
  }
  if (corsOrigin === "*") {
    throw new Error("CORS_ORIGIN cannot be '*' in production.");
  }
}

async function writeAuditLog({ actorId = null, actorRole = null, action, entityType, entityId = null, metadata = null }) {
  if (!action || !entityType) return;
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch {
    // Audit writes should never break primary request flow.
  }
}

function canMutateBooking(req, booking) {
  if (!req.auth || !booking) return false;
  if (req.auth.role === "admin") return true;
  if (req.auth.role === "subscriber" && req.auth.businessId && req.auth.businessId === booking.businessId) return true;
  if (req.auth.role === "customer" && req.auth.email && req.auth.email === booking.customerEmail) return true;
  return false;
}

function bookingStartsAtMs(date, time) {
  const normalized = normalizeBookingDateTime(date, time);
  if (!normalized) return null;
  const parsed = new Date(`${normalized.date}T${normalized.time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function isBookingSlotInPast(date, time, graceMinutes = 2) {
  const startsAt = bookingStartsAtMs(date, time);
  if (!Number.isFinite(startsAt)) return false;
  return startsAt < (Date.now() - Math.max(0, Number(graceMinutes || 0)) * 60_000);
}

function normalizeBookingStatusValue(status) {
  return String(status || "").trim().toLowerCase();
}

async function getAvailableSlotsForBusiness(business, daysAhead = 4) {
  const hours = parseHours(business.hoursJson);
  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
      status: "confirmed"
    },
    select: { date: true, time: true }
  });
  const reserved = new Set(
    bookings
      .map((b) => normalizeBookingDateTime(b.date, b.time))
      .filter(Boolean)
      .map((b) => `${b.date}|${b.time}`)
  );

  const now = new Date();
  const nowIsoDate = now.toISOString().slice(0, 10);
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const output = [];

  for (let i = 0; i <= daysAhead; i += 1) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + i);
    const date = dateObj.toISOString().slice(0, 10);
    const dayKey = dayKeyFromDate(dateObj);
    const dayHours = parseOpenHours(hours[dayKey]);
    if (!dayHours) continue;

    const minServiceDuration = business.services.reduce((min, service) => Math.min(min, Number(service.durationMin || 45)), 45);
    const closeLimit = addMinutesToTime(dayHours.close, -minServiceDuration);
    let cursor = dayHours.open;

    while (timeToMinutes(cursor) <= timeToMinutes(closeLimit)) {
      if (!(date === nowIsoDate && timeToMinutes(cursor) <= timeToMinutes(nowTime))) {
        const key = `${date}|${cursor}`;
        if (!reserved.has(key)) {
          output.push(slotLabel(date, cursor));
        }
      }
      cursor = addMinutesToTime(cursor, 30);
    }
  }
  return output.slice(0, 24);
}

function getCorsOptions() {
  if (corsOrigin === "*") return { origin: true };
  const allowed = corsOrigin.split(",").map((v) => v.trim()).filter(Boolean);
  return {
    origin: (origin, callback) => {
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked"));
    }
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, businessId: user.businessId || null },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing bearer token." });
  try {
    req.auth = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Forbidden for this role." });
    }
    return next();
  };
}

async function resolveManagedBusinessId(req) {
  if (!req.auth) return "";
  if (req.auth.role === "subscriber") return String(req.auth.businessId || "").trim();
  if (req.auth.role !== "admin") return "";

  const fromQuery = String(req.query?.businessId || "").trim();
  if (fromQuery) return fromQuery;
  const fromBody = String(req.body?.businessId || "").trim();
  if (fromBody) return fromBody;
  const fromHeader = String(req.headers["x-business-id"] || "").trim();
  if (fromHeader) return fromHeader;

  const fallbackBusiness = await prisma.business.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });
  return String(fallbackBusiness?.id || "").trim();
}

function mapBusiness(business, options = {}) {
  const { includeSlots = true, availableSlots = [] } = options;
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    phone: business.phone,
    email: business.email,
    rating: business.rating,
    description: business.description,
    websiteUrl: business.websiteUrl || null,
    websiteTitle: business.websiteTitle || null,
    websiteSummary: business.websiteSummary || null,
    websiteImageUrl: business.websiteImageUrl || null,
    socialFacebook: business.socialFacebook || null,
    socialInstagram: business.socialInstagram || null,
    socialTwitter: business.socialTwitter || null,
    socialLinkedin: business.socialLinkedin || null,
    socialTiktok: business.socialTiktok || null,
    location: {
      city: business.city,
      country: business.country,
      postcode: business.postcode,
      address: business.address
    },
    hours: parseHours(business.hoursJson),
    services: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.durationMin,
      price: s.price
    })),
    availableSlots: includeSlots ? availableSlots : []
  };
}

async function readAccountingIntegrationsFile() {
  try {
    const raw = await readFile(accountingIntegrationFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeAccountingIntegrationsFile(payload) {
  await mkdir(path.dirname(accountingIntegrationFile), { recursive: true });
  await writeFile(accountingIntegrationFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readStaffRosterFile() {
  try {
    const raw = await readFile(staffRosterFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeStaffRosterFile(payload) {
  await mkdir(path.dirname(staffRosterFile), { recursive: true });
  await writeFile(staffRosterFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readWaitlistFile() {
  try {
    const raw = await readFile(waitlistFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeWaitlistFile(payload) {
  await mkdir(path.dirname(waitlistFile), { recursive: true });
  await writeFile(waitlistFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readCommercialControlsFile() {
  try {
    const raw = await readFile(commercialControlsFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeCommercialControlsFile(payload) {
  await mkdir(path.dirname(commercialControlsFile), { recursive: true });
  await writeFile(commercialControlsFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readRevenueSpendFile() {
  try {
    const raw = await readFile(revenueSpendFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeRevenueSpendFile(payload) {
  await mkdir(path.dirname(revenueSpendFile), { recursive: true });
  await writeFile(revenueSpendFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readProfitabilityInputsFile() {
  try {
    const raw = await readFile(profitabilityInputsFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeProfitabilityInputsFile(payload) {
  await mkdir(path.dirname(profitabilityInputsFile), { recursive: true });
  await writeFile(profitabilityInputsFile, JSON.stringify(payload, null, 2), "utf8");
}

async function readSocialMediaFile() {
  try {
    const raw = await readFile(socialMediaFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function readBusinessReportQueueFile() {
  try {
    const raw = await readFile(businessReportQueueFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeBusinessReportQueueFile(payload) {
  await mkdir(path.dirname(businessReportQueueFile), { recursive: true });
  await writeFile(businessReportQueueFile, JSON.stringify(payload, null, 2), "utf8");
}

function isPrismaBusinessReportQueueStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("businessreport") || msg.includes("business report");
}

async function enqueueBusinessReportEmailRequest(item) {
  const model = prisma?.businessReportEmailQueueItem;
  if (
    model &&
    typeof model.create === "function" &&
    typeof model.findMany === "function" &&
    typeof model.deleteMany === "function"
  ) {
    try {
      await model.create({
        data: {
          id: item.id,
          businessId: item.businessId,
          recipientEmail: item.recipientEmail,
          subject: item.subject,
          note: item.note || "",
          report: item.report || {},
          queuedAt: new Date(item.queuedAt),
          status: item.status || "queued",
          requestedBy: item.requestedBy || {}
        }
      });

      const rows = await model.findMany({
        where: { businessId: item.businessId },
        orderBy: [{ queuedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        select: { id: true },
        skip: 100
      });
      if (rows.length) {
        await model.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      }
      return;
    } catch (error) {
      if (!isPrismaBusinessReportQueueStorageUnavailable(error)) throw error;
    }
  }

  const queue = await readBusinessReportQueueFile();
  const businessQueue = Array.isArray(queue?.[item.businessId]) ? queue[item.businessId] : [];
  queue[item.businessId] = [item, ...businessQueue].slice(0, 100);
  await writeBusinessReportQueueFile(queue);
}

async function writeSocialMediaFile(payload) {
  await mkdir(path.dirname(socialMediaFile), { recursive: true });
  await writeFile(socialMediaFile, JSON.stringify(payload, null, 2), "utf8");
}

function isPrismaSocialMediaStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("social");
}

async function loadSocialMediaExtras(businessId) {
  const model = prisma?.socialMediaProfile;
  if (model && typeof model.findUnique === "function") {
    try {
      const row = await model.findUnique({ where: { businessId } });
      if (row) {
        return {
          customSocial: String(row.customSocial || ""),
          socialImageUrl: String(row.socialImageUrl || "")
        };
      }
      return { customSocial: "", socialImageUrl: "" };
    } catch (error) {
      if (!isPrismaSocialMediaStorageUnavailable(error)) throw error;
    }
  }

  const all = await readSocialMediaFile();
  const scoped = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  return {
    customSocial: String(scoped.customSocial || ""),
    socialImageUrl: String(scoped.socialImageUrl || "")
  };
}

async function saveSocialMediaExtras(businessId, payload) {
  const next = {
    customSocial: String(payload?.customSocial || "").trim(),
    socialImageUrl: String(payload?.socialImageUrl || "").trim()
  };

  const model = prisma?.socialMediaProfile;
  if (model && typeof model.upsert === "function") {
    try {
      await model.upsert({
        where: { businessId },
        update: {
          customSocial: next.customSocial || "",
          socialImageUrl: next.socialImageUrl || ""
        },
        create: {
          businessId,
          customSocial: next.customSocial || "",
          socialImageUrl: next.socialImageUrl || ""
        }
      });
      return next;
    } catch (error) {
      if (!isPrismaSocialMediaStorageUnavailable(error)) throw error;
    }
  }

  const all = await readSocialMediaFile();
  all[businessId] = {
    ...next,
    updatedAt: new Date().toISOString()
  };
  await writeSocialMediaFile(all);
  return next;
}

function isValidOptionalHttpUrl(value) {
  const input = String(value || "").trim();
  if (!input) return true;
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeRevenueChannel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "direct";
  if (raw === "manual") return "direct";
  if (raw === "ai") return "ai_assistant";
  return raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "direct";
}

function formatRevenueChannelLabel(channel) {
  return String(channel || "direct")
    .split("_")
    .filter(Boolean)
    .map((chunk) => chunk.slice(0, 1).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function normalizeRevenueSpendRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  const out = {};
  Object.entries(source).forEach(([channelRaw, spendRaw]) => {
    const channel = normalizeRevenueChannel(channelRaw);
    const spend = Number(spendRaw || 0);
    if (!Number.isFinite(spend) || spend < 0) return;
    out[channel] = Number(spend.toFixed(2));
  });
  return out;
}

function computeRevenueAttribution(bookings, spendRecord = {}) {
  const spendByChannel = normalizeRevenueSpendRecord(spendRecord);
  const channelRollup = new Map();

  const ensureChannel = (channel) => {
    if (!channelRollup.has(channel)) {
      channelRollup.set(channel, {
        channel,
        label: formatRevenueChannelLabel(channel),
        bookings: 0,
        revenue: 0,
        cancelledBookings: 0,
        spend: Number(spendByChannel[channel] || 0)
      });
    }
    return channelRollup.get(channel);
  };

  (Array.isArray(bookings) ? bookings : []).forEach((booking) => {
    const channel = normalizeRevenueChannel(booking?.source || "direct");
    const row = ensureChannel(channel);
    if (String(booking?.status || "").toLowerCase() === "cancelled") {
      row.cancelledBookings += 1;
      return;
    }
    row.bookings += 1;
    row.revenue += Number(booking?.price || 0);
  });

  Object.keys(spendByChannel).forEach((channel) => {
    const row = ensureChannel(channel);
    row.spend = Number(spendByChannel[channel] || 0);
  });

  const rows = Array.from(channelRollup.values());
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  const totalSpend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
  const totalBookings = rows.reduce((sum, row) => sum + Number(row.bookings || 0), 0);

  const channels = rows
    .map((row) => {
      const sharePercent = totalBookings ? Number(((row.bookings / totalBookings) * 100).toFixed(1)) : 0;
      const roiPercent = row.spend > 0 ? Number((((row.revenue - row.spend) / row.spend) * 100).toFixed(1)) : null;
      return {
        channel: row.channel,
        label: row.label,
        bookings: row.bookings,
        cancelledBookings: row.cancelledBookings,
        revenue: Number(row.revenue.toFixed(2)),
        spend: Number(row.spend.toFixed(2)),
        sharePercent,
        roiPercent
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);

  const bestRevenueChannel = channels[0]?.channel || null;
  const roiEligible = channels.filter((row) => typeof row.roiPercent === "number");
  const bestRoiChannel = roiEligible.sort((a, b) => b.roiPercent - a.roiPercent)[0]?.channel || null;

  return {
    channels,
    summary: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalSpend: Number(totalSpend.toFixed(2)),
      totalAttributedBookings: totalBookings,
      blendedRoiPercent: totalSpend > 0 ? Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1)) : null,
      bestRevenueChannel,
      bestRoiChannel
    }
  };
}

function normalizeProfitabilityRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  const payrollEntries = (Array.isArray(source.payrollEntries) ? source.payrollEntries : [])
    .map((entry) => {
      const hours = Number(entry?.hours || 0);
      const hourlyRate = Number(entry?.hourlyRate || 0);
      const bonus = Number(entry?.bonus || 0);
      return {
        id: String(entry?.id || "").trim(),
        staffName: String(entry?.staffName || "").trim(),
        role: String(entry?.role || "").trim(),
        hours: Number.isFinite(hours) && hours >= 0 ? Number(hours.toFixed(2)) : 0,
        hourlyRate: Number.isFinite(hourlyRate) && hourlyRate >= 0 ? Number(hourlyRate.toFixed(2)) : 0,
        bonus: Number.isFinite(bonus) && bonus >= 0 ? Number(bonus.toFixed(2)) : 0,
        updatedAt: entry?.updatedAt || null
      };
    })
    .filter((entry) => entry.id && entry.staffName);
  const fixedCostsRaw = source.fixedCosts && typeof source.fixedCosts === "object" ? source.fixedCosts : {};
  const fixedCosts = {
    rent: Math.max(0, Number(fixedCostsRaw.rent || 0)),
    utilities: Math.max(0, Number(fixedCostsRaw.utilities || 0)),
    software: Math.max(0, Number(fixedCostsRaw.software || 0)),
    other: Math.max(0, Number(fixedCostsRaw.other || 0))
  };
  const cogsPercentRaw = Number(source.cogsPercent || 0);
  const cogsPercent = Number.isFinite(cogsPercentRaw)
    ? Math.min(95, Math.max(0, Number(cogsPercentRaw.toFixed(2))))
    : 0;
  return {
    payrollEntries,
    fixedCosts: {
      rent: Number(fixedCosts.rent.toFixed(2)),
      utilities: Number(fixedCosts.utilities.toFixed(2)),
      software: Number(fixedCosts.software.toFixed(2)),
      other: Number(fixedCosts.other.toFixed(2))
    },
    cogsPercent
  };
}

function computeProfitabilitySummary(bookings, record) {
  const normalized = normalizeProfitabilityRecord(record);
  const bookingRows = (Array.isArray(bookings) ? bookings : []).filter(
    (booking) => String(booking?.status || "").toLowerCase() !== "cancelled"
  );
  const grossRevenue = bookingRows.reduce((sum, booking) => sum + Number(booking?.price || 0), 0);
  const bookingCount = bookingRows.length;
  const averageTicket = bookingCount ? grossRevenue / bookingCount : 0;
  const payrollTotal = normalized.payrollEntries.reduce(
    (sum, entry) => sum + Number(entry.hours || 0) * Number(entry.hourlyRate || 0) + Number(entry.bonus || 0),
    0
  );
  const fixedCostsTotal = Object.values(normalized.fixedCosts).reduce((sum, value) => sum + Number(value || 0), 0);
  const cogsAmount = grossRevenue * (normalized.cogsPercent / 100);
  const totalCosts = payrollTotal + fixedCostsTotal + cogsAmount;
  const estimatedProfit = grossRevenue - totalCosts;
  const profitMarginPercent = grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : null;
  const breakevenRevenue =
    normalized.cogsPercent >= 100
      ? null
      : (payrollTotal + fixedCostsTotal) / Math.max(0.01, 1 - normalized.cogsPercent / 100);

  return {
    payrollEntries: normalized.payrollEntries,
    fixedCosts: normalized.fixedCosts,
    cogsPercent: normalized.cogsPercent,
    summary: {
      grossRevenue: Number(grossRevenue.toFixed(2)),
      nonCancelledBookings: bookingCount,
      averageTicket: Number(averageTicket.toFixed(2)),
      payrollTotal: Number(payrollTotal.toFixed(2)),
      fixedCostsTotal: Number(fixedCostsTotal.toFixed(2)),
      cogsAmount: Number(cogsAmount.toFixed(2)),
      totalCosts: Number(totalCosts.toFixed(2)),
      estimatedProfit: Number(estimatedProfit.toFixed(2)),
      profitMarginPercent: profitMarginPercent === null ? null : Number(profitMarginPercent.toFixed(1)),
      breakevenRevenue: breakevenRevenue === null ? null : Number(breakevenRevenue.toFixed(2))
    }
  };
}

function isPrismaRevenueProfitabilityStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("revenue") || msg.includes("profitability");
}

async function loadRevenueSpendRecordFromPrisma(businessId) {
  const model = prisma?.revenueSpendChannel;
  if (!model || typeof model.findMany !== "function") return null;
  try {
    const rows = await model.findMany({
      where: { businessId },
      orderBy: [{ channel: "asc" }]
    });
    const record = {};
    rows.forEach((row) => {
      const channel = normalizeRevenueChannel(row?.channel);
      if (!channel) return;
      record[channel] = Number(Number(row?.spend || 0).toFixed(2));
    });
    return normalizeRevenueSpendRecord(record);
  } catch (error) {
    if (isPrismaRevenueProfitabilityStorageUnavailable(error)) return null;
    throw error;
  }
}

async function loadRevenueSpendRecord(businessId) {
  const dbRecord = await loadRevenueSpendRecordFromPrisma(businessId);
  if (dbRecord) return dbRecord;
  const all = await readRevenueSpendFile();
  return normalizeRevenueSpendRecord(all?.[businessId]);
}

async function saveRevenueSpendRecord(businessId, record) {
  const normalized = normalizeRevenueSpendRecord(record);
  const model = prisma?.revenueSpendChannel;
  if (model && typeof model.deleteMany === "function" && typeof model.createMany === "function") {
    try {
      await model.deleteMany({ where: { businessId } });
      const rows = Object.entries(normalized).map(([channel, spend]) => ({
        id: `${businessId}:${channel}`,
        businessId,
        channel,
        spend: Number(spend || 0)
      }));
      if (rows.length) {
        await model.createMany({ data: rows });
      }
      return normalized;
    } catch (error) {
      if (!isPrismaRevenueProfitabilityStorageUnavailable(error)) throw error;
    }
  }
  const all = await readRevenueSpendFile();
  all[businessId] = normalized;
  await writeRevenueSpendFile(all);
  return normalized;
}

async function loadProfitabilityRecordFromPrisma(businessId) {
  const payrollModel = prisma?.profitabilityPayrollEntry;
  const configModel = prisma?.profitabilityConfig;
  if (!payrollModel || !configModel || typeof payrollModel.findMany !== "function" || typeof configModel.findUnique !== "function") {
    return null;
  }
  try {
    const [payrollRows, config] = await Promise.all([
      payrollModel.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
      configModel.findUnique({ where: { businessId } })
    ]);
    return normalizeProfitabilityRecord({
      payrollEntries: payrollRows.map((row) => ({
        id: String(row?.id || "").trim(),
        staffName: String(row?.staffName || "").trim(),
        role: String(row?.role || "").trim(),
        hours: Number(row?.hours || 0),
        hourlyRate: Number(row?.hourlyRate || 0),
        bonus: Number(row?.bonus || 0),
        updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
      })),
      fixedCosts: {
        rent: Number(config?.rent || 0),
        utilities: Number(config?.utilities || 0),
        software: Number(config?.software || 0),
        other: Number(config?.other || 0)
      },
      cogsPercent: Number(config?.cogsPercent || 0)
    });
  } catch (error) {
    if (isPrismaRevenueProfitabilityStorageUnavailable(error)) return null;
    throw error;
  }
}

async function loadProfitabilityRecord(businessId) {
  const dbRecord = await loadProfitabilityRecordFromPrisma(businessId);
  if (dbRecord) return dbRecord;
  const all = await readProfitabilityInputsFile();
  return normalizeProfitabilityRecord(all?.[businessId]);
}

async function saveProfitabilityRecord(businessId, record) {
  const normalized = normalizeProfitabilityRecord(record);
  const payrollModel = prisma?.profitabilityPayrollEntry;
  const configModel = prisma?.profitabilityConfig;
  if (
    payrollModel &&
    configModel &&
    typeof payrollModel.deleteMany === "function" &&
    typeof payrollModel.createMany === "function" &&
    typeof configModel.upsert === "function"
  ) {
    try {
      await payrollModel.deleteMany({ where: { businessId } });
      if (normalized.payrollEntries.length) {
        await payrollModel.createMany({
          data: normalized.payrollEntries.map((entry) => ({
            id: entry.id,
            businessId,
            staffName: entry.staffName,
            role: entry.role || "",
            hours: Number(entry.hours || 0),
            hourlyRate: Number(entry.hourlyRate || 0),
            bonus: Number(entry.bonus || 0)
          }))
        });
      }

      await configModel.upsert({
        where: { businessId },
        update: {
          rent: Number(normalized.fixedCosts.rent || 0),
          utilities: Number(normalized.fixedCosts.utilities || 0),
          software: Number(normalized.fixedCosts.software || 0),
          other: Number(normalized.fixedCosts.other || 0),
          cogsPercent: Number(normalized.cogsPercent || 0)
        },
        create: {
          businessId,
          rent: Number(normalized.fixedCosts.rent || 0),
          utilities: Number(normalized.fixedCosts.utilities || 0),
          software: Number(normalized.fixedCosts.software || 0),
          other: Number(normalized.fixedCosts.other || 0),
          cogsPercent: Number(normalized.cogsPercent || 0)
        }
      });
      return normalized;
    } catch (error) {
      if (!isPrismaRevenueProfitabilityStorageUnavailable(error)) throw error;
    }
  }

  const all = await readProfitabilityInputsFile();
  all[businessId] = normalized;
  await writeProfitabilityInputsFile(all);
  return normalized;
}

function normalizeCommercialRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  const memberships = (Array.isArray(source.memberships) ? source.memberships : [])
    .map((item) => {
      const price = Number(item?.price || 0);
      const billingCycle = String(item?.billingCycle || "monthly").trim().toLowerCase();
      const status = String(item?.status || "active").trim().toLowerCase();
      return {
        id: String(item?.id || "").trim(),
        name: String(item?.name || "").trim(),
        price: Number.isFinite(price) ? Number(price.toFixed(2)) : 0,
        billingCycle: supportedMembershipCycles.has(billingCycle) ? billingCycle : "monthly",
        status: supportedCommercialStatus.has(status) ? status : "active",
        benefits: String(item?.benefits || "").trim(),
        updatedAt: item?.updatedAt || null
      };
    })
    .filter((item) => item.id && item.name);

  const packages = (Array.isArray(source.packages) ? source.packages : [])
    .map((item) => {
      const price = Number(item?.price || 0);
      const sessionCount = Math.max(1, Math.floor(Number(item?.sessionCount || 1)));
      const remainingSessions = Math.max(
        0,
        Math.min(sessionCount, Math.floor(Number(item?.remainingSessions ?? sessionCount)))
      );
      const status = String(item?.status || "active").trim().toLowerCase();
      return {
        id: String(item?.id || "").trim(),
        name: String(item?.name || "").trim(),
        price: Number.isFinite(price) ? Number(price.toFixed(2)) : 0,
        sessionCount,
        remainingSessions,
        status: supportedCommercialStatus.has(status) ? status : "active",
        updatedAt: item?.updatedAt || null
      };
    })
    .filter((item) => item.id && item.name);

  const giftCards = (Array.isArray(source.giftCards) ? source.giftCards : [])
    .map((item) => {
      const initialBalance = Math.max(0, Number(item?.initialBalance || 0));
      const remainingBalance = Math.max(0, Number(item?.remainingBalance ?? initialBalance));
      const status = String(item?.status || "active").trim().toLowerCase();
      return {
        id: String(item?.id || "").trim(),
        code: String(item?.code || "").trim(),
        purchaserName: String(item?.purchaserName || "").trim(),
        recipientName: String(item?.recipientName || "").trim(),
        initialBalance: Number(initialBalance.toFixed(2)),
        remainingBalance: Number(remainingBalance.toFixed(2)),
        status:
          remainingBalance <= 0
            ? "redeemed"
            : supportedGiftCardStatus.has(status)
              ? status
              : "active",
        issuedAt: item?.issuedAt || null,
        expiresAt: item?.expiresAt || null,
        updatedAt: item?.updatedAt || null
      };
    })
    .filter((item) => item.id && item.code);

  return { memberships, packages, giftCards };
}

function summarizeCommercialRecord(record) {
  const normalized = normalizeCommercialRecord(record);
  const outstandingGiftBalance = normalized.giftCards
    .filter((gift) => gift.status === "active")
    .reduce((sum, gift) => sum + Number(gift.remainingBalance || 0), 0);
  return {
    activeMemberships: normalized.memberships.filter((m) => m.status === "active").length,
    activePackages: normalized.packages.filter((p) => p.status === "active").length,
    activeGiftCards: normalized.giftCards.filter((g) => g.status === "active").length,
    outstandingGiftBalance: Number(outstandingGiftBalance.toFixed(2))
  };
}

function hasPrismaCommercialControlModels() {
  return Boolean(
    prisma?.commercialMembership &&
    prisma?.commercialPackage &&
    prisma?.commercialGiftCard &&
    typeof prisma.commercialMembership.findMany === "function" &&
    typeof prisma.commercialMembership.deleteMany === "function" &&
    typeof prisma.commercialMembership.createMany === "function" &&
    typeof prisma.commercialPackage.findMany === "function" &&
    typeof prisma.commercialPackage.deleteMany === "function" &&
    typeof prisma.commercialPackage.createMany === "function" &&
    typeof prisma.commercialGiftCard.findMany === "function" &&
    typeof prisma.commercialGiftCard.deleteMany === "function" &&
    typeof prisma.commercialGiftCard.createMany === "function"
  );
}

function isPrismaCommercialStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("commercial");
}

function mapCommercialMembershipDbRow(row) {
  return {
    id: String(row?.id || "").trim(),
    name: String(row?.name || "").trim(),
    price: Number(Number(row?.price || 0).toFixed(2)),
    billingCycle: String(row?.billingCycle || "monthly").trim().toLowerCase(),
    status: String(row?.status || "active").trim().toLowerCase(),
    benefits: String(row?.benefits || "").trim(),
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
  };
}

function mapCommercialPackageDbRow(row) {
  return {
    id: String(row?.id || "").trim(),
    name: String(row?.name || "").trim(),
    price: Number(Number(row?.price || 0).toFixed(2)),
    sessionCount: Math.floor(Number(row?.sessionCount || 1)),
    remainingSessions: Math.floor(Number(row?.remainingSessions || 0)),
    status: String(row?.status || "active").trim().toLowerCase(),
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
  };
}

function mapCommercialGiftCardDbRow(row) {
  return {
    id: String(row?.id || "").trim(),
    code: String(row?.code || "").trim(),
    purchaserName: String(row?.purchaserName || "").trim(),
    recipientName: String(row?.recipientName || "").trim(),
    initialBalance: Number(Number(row?.initialBalance || 0).toFixed(2)),
    remainingBalance: Number(Number(row?.remainingBalance || 0).toFixed(2)),
    status: String(row?.status || "active").trim().toLowerCase(),
    issuedAt: row?.issuedAt ? new Date(row.issuedAt).toISOString() : null,
    expiresAt: row?.expiresAt ? new Date(row.expiresAt).toISOString() : null,
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
  };
}

async function loadCommercialRecordFromPrisma(businessId) {
  if (!hasPrismaCommercialControlModels()) return null;
  try {
    const [memberships, packages, giftCards] = await Promise.all([
      prisma.commercialMembership.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
      prisma.commercialPackage.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
      prisma.commercialGiftCard.findMany({ where: { businessId }, orderBy: [{ issuedAt: "asc" }, { id: "asc" }] })
    ]);
    return normalizeCommercialRecord({
      memberships: memberships.map(mapCommercialMembershipDbRow),
      packages: packages.map(mapCommercialPackageDbRow),
      giftCards: giftCards.map(mapCommercialGiftCardDbRow)
    });
  } catch (error) {
    if (isPrismaCommercialStorageUnavailable(error)) return null;
    throw error;
  }
}

async function loadCommercialRecord(businessId) {
  const dbRecord = await loadCommercialRecordFromPrisma(businessId);
  if (dbRecord) return dbRecord;
  const all = await readCommercialControlsFile();
  return normalizeCommercialRecord(all?.[businessId]);
}

async function saveCommercialRecord(businessId, record) {
  const normalized = normalizeCommercialRecord(record);

  if (hasPrismaCommercialControlModels()) {
    try {
      await prisma.commercialMembership.deleteMany({ where: { businessId } });
      if (normalized.memberships.length) {
        await prisma.commercialMembership.createMany({
          data: normalized.memberships.map((row) => ({
            id: row.id,
            businessId,
            name: row.name,
            price: Number(row.price || 0),
            billingCycle: row.billingCycle,
            status: row.status,
            benefits: row.benefits || ""
          }))
        });
      }

      await prisma.commercialPackage.deleteMany({ where: { businessId } });
      if (normalized.packages.length) {
        await prisma.commercialPackage.createMany({
          data: normalized.packages.map((row) => ({
            id: row.id,
            businessId,
            name: row.name,
            price: Number(row.price || 0),
            sessionCount: Math.floor(Number(row.sessionCount || 1)),
            remainingSessions: Math.floor(Number(row.remainingSessions || 0)),
            status: row.status
          }))
        });
      }

      await prisma.commercialGiftCard.deleteMany({ where: { businessId } });
      if (normalized.giftCards.length) {
        await prisma.commercialGiftCard.createMany({
          data: normalized.giftCards.map((row) => ({
            id: row.id,
            businessId,
            code: row.code,
            purchaserName: row.purchaserName,
            recipientName: row.recipientName,
            initialBalance: Number(row.initialBalance || 0),
            remainingBalance: Number(row.remainingBalance || 0),
            status: row.status,
            issuedAt: row.issuedAt ? new Date(row.issuedAt) : new Date(),
            expiresAt: row.expiresAt ? new Date(row.expiresAt) : null
          }))
        });
      }

      return normalized;
    } catch (error) {
      if (!isPrismaCommercialStorageUnavailable(error)) throw error;
    }
  }

  const all = await readCommercialControlsFile();
  all[businessId] = normalized;
  await writeCommercialControlsFile(all);
  return normalized;
}

function normalizeWaitlistRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return source
    .map((item) => ({
      id: String(item?.id || "").trim(),
      customerName: String(item?.customerName || "").trim(),
      customerPhone: String(item?.customerPhone || "").trim(),
      customerEmail: String(item?.customerEmail || "").trim().toLowerCase(),
      service: String(item?.service || "").trim(),
      preferredDate: String(item?.preferredDate || "").trim(),
      preferredTime: String(item?.preferredTime || "").trim(),
      status: supportedWaitlistStatus.has(String(item?.status || "").trim()) ? String(item.status) : "waiting",
      notes: String(item?.notes || "").trim(),
      createdAt: item?.createdAt || null,
      updatedAt: item?.updatedAt || null,
      lastActionAt: item?.lastActionAt || null
    }))
    .filter((item) => item.id && item.customerName);
}

function summarizeWaitlist(rows) {
  const entries = normalizeWaitlistRows(rows);
  const waiting = entries.filter((e) => e.status === "waiting").length;
  const contacted = entries.filter((e) => e.status === "contacted").length;
  const booked = entries.filter((e) => e.status === "booked").length;
  return {
    totalEntries: entries.length,
    waitingCount: waiting,
    contactedCount: contacted,
    bookedCount: booked
  };
}

function hasPrismaWaitlistModel() {
  const model = prisma?.waitlistEntry;
  return Boolean(
    model &&
    typeof model.findMany === "function" &&
    typeof model.findUnique === "function" &&
    typeof model.create === "function" &&
    typeof model.update === "function" &&
    typeof model.delete === "function"
  );
}

function isPrismaWaitlistStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("waitlist") && (msg.includes("does not exist") || msg.includes("unknown") || msg.includes("table"));
}

function mapWaitlistDbRow(row) {
  if (!row || typeof row !== "object") return null;
  return {
    id: String(row.id || "").trim(),
    customerName: String(row.customerName || "").trim(),
    customerPhone: String(row.customerPhone || "").trim(),
    customerEmail: String(row.customerEmail || "").trim().toLowerCase(),
    service: String(row.service || "").trim(),
    preferredDate: String(row.preferredDate || "").trim(),
    preferredTime: String(row.preferredTime || "").trim(),
    status: supportedWaitlistStatus.has(String(row.status || "").trim()) ? String(row.status) : "waiting",
    notes: String(row.notes || "").trim(),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    lastActionAt: row.lastActionAt ? new Date(row.lastActionAt).toISOString() : null
  };
}

async function listWaitlistEntriesForBusiness(businessId) {
  if (!hasPrismaWaitlistModel()) return null;
  try {
    const rows = await prisma.waitlistEntry.findMany({
      where: { businessId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }]
    });
    return normalizeWaitlistRows(rows.map(mapWaitlistDbRow));
  } catch (error) {
    if (isPrismaWaitlistStorageUnavailable(error)) return null;
    throw error;
  }
}

async function getWaitlistEntriesForBusiness(businessId) {
  const dbRows = await listWaitlistEntriesForBusiness(businessId);
  if (dbRows) return dbRows;
  const all = await readWaitlistFile();
  return normalizeWaitlistRows(all?.[businessId]?.entries || []);
}

async function upsertWaitlistEntryForBusiness(businessId, payload) {
  if (hasPrismaWaitlistModel()) {
    try {
      const existing = await prisma.waitlistEntry.findUnique({ where: { id: payload.id } });
      if (existing && existing.businessId !== businessId) {
        throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
      }
      const row = existing
        ? await prisma.waitlistEntry.update({
          where: { id: payload.id },
          data: {
            customerName: payload.customerName,
            customerPhone: payload.customerPhone || "",
            customerEmail: payload.customerEmail || null,
            service: payload.service || "",
            preferredDate: payload.preferredDate || null,
            preferredTime: payload.preferredTime || null,
            notes: payload.notes || null,
            status: "waiting"
          }
        })
        : await prisma.waitlistEntry.create({
          data: {
            id: payload.id,
            businessId,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone || "",
            customerEmail: payload.customerEmail || null,
            service: payload.service || "",
            preferredDate: payload.preferredDate || null,
            preferredTime: payload.preferredTime || null,
            notes: payload.notes || null,
            status: "waiting",
            lastActionAt: null
          }
        });
      const entries = await listWaitlistEntriesForBusiness(businessId);
      return { entry: mapWaitlistDbRow(row), entries: entries || [] };
    } catch (error) {
      if (error?.statusCode) throw error;
      if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
    }
  }

  const all = await readWaitlistFile();
  const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  const entries = normalizeWaitlistRows(businessRecord.entries || []);
  const index = entries.findIndex((item) => item.id === payload.id);
  const now = new Date().toISOString();
  const next = {
    id: payload.id,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    service: payload.service,
    preferredDate: payload.preferredDate,
    preferredTime: payload.preferredTime,
    notes: payload.notes,
    status: "waiting",
    createdAt: index >= 0 ? entries[index].createdAt || now : now,
    updatedAt: now,
    lastActionAt: index >= 0 ? entries[index].lastActionAt || null : null
  };
  if (index >= 0) entries[index] = next;
  else entries.push(next);
  businessRecord.entries = entries;
  all[businessId] = businessRecord;
  await writeWaitlistFile(all);
  return { entry: next, entries };
}

async function markWaitlistEntryContactedForBusiness(businessId, entryId) {
  if (hasPrismaWaitlistModel()) {
    try {
      const existing = await prisma.waitlistEntry.findUnique({ where: { id: entryId } });
      if (!existing || existing.businessId !== businessId) {
        throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
      }
      const row = await prisma.waitlistEntry.update({
        where: { id: entryId },
        data: {
          status: "contacted",
          lastActionAt: new Date()
        }
      });
      const entries = await listWaitlistEntriesForBusiness(businessId);
      return { entry: mapWaitlistDbRow(row), entries: entries || [] };
    } catch (error) {
      if (error?.statusCode) throw error;
      if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
    }
  }

  const all = await readWaitlistFile();
  const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  const entries = normalizeWaitlistRows(businessRecord.entries || []);
  const index = entries.findIndex((item) => item.id === entryId);
  if (index < 0) {
    throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
  }
  const now = new Date().toISOString();
  entries[index] = {
    ...entries[index],
    status: "contacted",
    updatedAt: now,
    lastActionAt: now
  };
  businessRecord.entries = entries;
  all[businessId] = businessRecord;
  await writeWaitlistFile(all);
  return { entry: entries[index], entries };
}

async function deleteWaitlistEntryForBusiness(businessId, entryId) {
  if (hasPrismaWaitlistModel()) {
    try {
      const existing = await prisma.waitlistEntry.findUnique({ where: { id: entryId } });
      if (!existing || existing.businessId !== businessId) {
        throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
      }
      await prisma.waitlistEntry.delete({ where: { id: entryId } });
      const entries = await listWaitlistEntriesForBusiness(businessId);
      return { entries: entries || [] };
    } catch (error) {
      if (error?.statusCode) throw error;
      if (!isPrismaWaitlistStorageUnavailable(error)) throw error;
    }
  }

  const all = await readWaitlistFile();
  const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  const entries = normalizeWaitlistRows(businessRecord.entries || []);
  const filtered = entries.filter((item) => item.id !== entryId);
  if (filtered.length === entries.length) {
    throw Object.assign(new Error("Waitlist entry not found."), { statusCode: 404 });
  }
  businessRecord.entries = filtered;
  all[businessId] = businessRecord;
  await writeWaitlistFile(all);
  return { entries: filtered };
}

function customerKeyFromBooking(booking) {
  const email = String(booking?.customerEmail || "").trim().toLowerCase();
  const phone = String(booking?.customerPhone || "").trim();
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `name:${String(booking?.customerName || "guest").trim().toLowerCase()}`;
}

function buildCrmSegments(bookings) {
  const nowMs = Date.now();
  const rollups = new Map();

  bookings.forEach((booking) => {
    const key = customerKeyFromBooking(booking);
    if (!rollups.has(key)) {
      rollups.set(key, {
        customerKey: key,
        customerName: String(booking.customerName || "Client").trim(),
        customerEmail: String(booking.customerEmail || "").trim().toLowerCase(),
        customerPhone: String(booking.customerPhone || "").trim(),
        totalSpend: 0,
        visitCount: 0,
        cancelledCount: 0,
        upcomingConfirmed: 0,
        lastVisitAt: null,
        lastService: ""
      });
    }
    const row = rollups.get(key);
    const normalized = normalizeBookingDateTime(booking.date, booking.time);
    const startsAt = normalized ? new Date(`${normalized.date}T${normalized.time}:00`).getTime() : null;
    const validStart = Number.isFinite(startsAt) ? startsAt : null;

    if (booking.status === "cancelled") {
      row.cancelledCount += 1;
    } else {
      row.visitCount += 1;
      row.totalSpend += Number(booking.price || 0);
      if (validStart && validStart > nowMs && booking.status === "confirmed") {
        row.upcomingConfirmed += 1;
      }
      if (validStart && validStart <= nowMs) {
        if (!row.lastVisitAt || validStart > row.lastVisitAt) {
          row.lastVisitAt = validStart;
          row.lastService = String(booking.service || "").trim();
        }
      }
    }
  });

  const customers = Array.from(rollups.values()).map((row) => {
    const daysSinceLastVisit = row.lastVisitAt ? Math.floor((nowMs - row.lastVisitAt) / (1000 * 60 * 60 * 24)) : null;
    const totalAppointments = row.visitCount + row.cancelledCount;
    const cancellationRate = totalAppointments ? row.cancelledCount / totalAppointments : 0;
    return {
      ...row,
      totalSpend: Number(row.totalSpend.toFixed(2)),
      daysSinceLastVisit,
      cancellationRate: Number((cancellationRate * 100).toFixed(1))
    };
  });

  const toLead = (customer, message) => ({
    customerKey: customer.customerKey,
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    customerPhone: customer.customerPhone,
    daysSinceLastVisit: customer.daysSinceLastVisit,
    totalSpend: customer.totalSpend,
    message
  });

  const highValueLapsed = customers
    .filter((c) => c.totalSpend >= 250 && (c.daysSinceLastVisit || 0) >= 35 && c.upcomingConfirmed === 0)
    .map((c) =>
      toLead(
        c,
        `Hi ${c.customerName}, we miss seeing you. Enjoy a loyalty priority slot this week for your next visit.`
      )
    );

  const atRiskCancellers = customers
    .filter((c) => c.visitCount + c.cancelledCount >= 3 && c.cancellationRate >= 30 && c.upcomingConfirmed === 0)
    .map((c) =>
      toLead(
        c,
        `Hi ${c.customerName}, we can reserve a flexible slot and send reminders so your next appointment is easier to keep.`
      )
    );

  const vipRegulars = customers
    .filter((c) => c.totalSpend >= 400 && c.visitCount >= 5 && (c.daysSinceLastVisit || 0) <= 35)
    .map((c) =>
      toLead(
        c,
        `Hi ${c.customerName}, as one of our VIP clients, you have priority access to premium appointments this week.`
      )
    );

  const newClients = customers
    .filter((c) => c.visitCount === 1 && (c.daysSinceLastVisit || 0) <= 21 && c.upcomingConfirmed === 0)
    .map((c) =>
      toLead(
        c,
        `Hi ${c.customerName}, thanks for visiting us. We would love to welcome you back with a tailored follow-up appointment.`
      )
    );

  return {
    segments: [
      { id: "high_value_lapsed", label: "High-Value Lapsed", leads: highValueLapsed },
      { id: "at_risk_cancellers", label: "At-Risk Cancellers", leads: atRiskCancellers },
      { id: "vip_regulars", label: "VIP Regulars", leads: vipRegulars },
      { id: "new_clients_followup", label: "New Client Follow-Up", leads: newClients }
    ],
    summary: {
      totalCustomers: customers.length,
      actionableLeads: highValueLapsed.length + atRiskCancellers.length + vipRegulars.length + newClients.length
    }
  };
}

function normalizeShiftDays(input) {
  const values = Array.isArray(input) ? input : String(input || "").split(",");
  const normalized = values
    .map((v) => String(v || "").trim().toLowerCase())
    .filter((v) => supportedShiftDays.includes(v));
  return Array.from(new Set(normalized));
}

function summarizeStaffRoster(members) {
  const todayKey = supportedShiftDays[new Date().getDay()];
  const onDuty = members.filter((m) => m.availability === "on_duty");
  const scheduledToday = members.filter((m) => Array.isArray(m.shiftDays) && m.shiftDays.includes(todayKey));
  return {
    totalMembers: members.length,
    onDutyCount: onDuty.length,
    offDutyCount: members.length - onDuty.length,
    scheduledTodayCount: scheduledToday.length,
    estimatedChairCapacityToday: onDuty.length * 6
  };
}

function normalizeStaffMembers(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return source
    .map((item) => ({
      id: String(item?.id || "").trim(),
      name: String(item?.name || "").trim(),
      role: String(item?.role || "staff").trim(),
      availability: supportedStaffAvailability.has(String(item?.availability || "").trim())
        ? String(item.availability)
        : "off_duty",
      shiftDays: normalizeShiftDays(item?.shiftDays),
      updatedAt: item?.updatedAt || null
    }))
    .filter((item) => item.id && item.name);
}

function normalizeWeekStartKey(input) {
  const value = String(input || "").trim();
  return bookingDateRegex.test(value) ? value : "";
}

function currentWeekStartKey() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = base.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + mondayOffset);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeStaffRotaShift(value) {
  const raw = String(value || "").trim().toLowerCase();
  return supportedStaffRotaShift.has(raw) ? raw : "full";
}

function normalizeStaffRotaStatus(value) {
  const raw = String(value || "").trim().toLowerCase();
  return supportedStaffRotaStatus.has(raw) ? raw : "off";
}

function normalizeStaffRotaDayKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  return supportedShiftDays.includes(raw) ? raw : "";
}

function normalizeStaffRotaCell(cell) {
  if (!cell || typeof cell !== "object") return null;
  return {
    status: normalizeStaffRotaStatus(cell.status),
    shift: normalizeStaffRotaShift(cell.shift),
    updatedAt: typeof cell.updatedAt === "string" ? cell.updatedAt : null,
    updatedByRole: typeof cell.updatedByRole === "string" ? String(cell.updatedByRole) : null
  };
}

function normalizeStaffRotaWeek(rawWeek) {
  const source = rawWeek && typeof rawWeek === "object" ? rawWeek : {};
  const rawCells = source.cells && typeof source.cells === "object" ? source.cells : {};
  const cells = {};
  Object.entries(rawCells).forEach(([staffId, dayMap]) => {
    const normalizedStaffId = String(staffId || "").trim();
    if (!normalizedStaffId || !dayMap || typeof dayMap !== "object") return;
    const normalizedDayMap = {};
    Object.entries(dayMap).forEach(([dayKey, cell]) => {
      const normalizedDay = normalizeStaffRotaDayKey(dayKey);
      if (!normalizedDay) return;
      const normalizedCell = normalizeStaffRotaCell(cell);
      if (!normalizedCell) return;
      normalizedDayMap[normalizedDay] = normalizedCell;
    });
    if (Object.keys(normalizedDayMap).length) cells[normalizedStaffId] = normalizedDayMap;
  });
  const sicknessLogs = Array.isArray(source.sicknessLogs)
    ? source.sicknessLogs
        .map((entry) => ({
          id: String(entry?.id || "").trim() || randomUUID(),
          staffId: String(entry?.staffId || "").trim(),
          staffName: String(entry?.staffName || "").trim(),
          day: normalizeStaffRotaDayKey(entry?.day),
          shift: normalizeStaffRotaShift(entry?.shift),
          replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
          weekStart: normalizeWeekStartKey(entry?.weekStart) || null,
          reportedAt: typeof entry?.reportedAt === "string" ? entry.reportedAt : null,
          actorId: typeof entry?.actorId === "string" ? entry.actorId : null,
          actorRole: typeof entry?.actorRole === "string" ? entry.actorRole : null
        }))
        .filter((entry) => entry.staffId && entry.day)
    : [];
  return {
    cells,
    sicknessLogs,
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null
  };
}

function getNormalizedStaffBusinessRecord(all, businessId) {
  const raw = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
  return {
    ...raw,
    members: normalizeStaffMembers(raw.members || []),
    rotaWeeks:
      raw.rotaWeeks && typeof raw.rotaWeeks === "object"
        ? Object.fromEntries(
            Object.entries(raw.rotaWeeks)
              .map(([weekKey, week]) => [normalizeWeekStartKey(weekKey), normalizeStaffRotaWeek(week)])
              .filter(([weekKey]) => Boolean(weekKey))
          )
        : {}
  };
}

function getStaffRotaWeekPayload(businessRecord, weekStart) {
  const key = normalizeWeekStartKey(weekStart) || currentWeekStartKey();
  const week = normalizeStaffRotaWeek(businessRecord?.rotaWeeks?.[key]);
  return { weekStart: key, ...week };
}

function buildStaffRosterResponse(businessRecord, options = {}) {
  const members = normalizeStaffMembers(businessRecord?.members || []);
  const response = {
    members,
    summary: summarizeStaffRoster(members)
  };
  if (options.includeRotaWeek) {
    Object.assign(response, {
      rotaWeek: getStaffRotaWeekPayload(businessRecord, options.weekStart)
    });
  }
  return response;
}

function hasPrismaStaffRosterModels() {
  const memberModel = prisma?.staffRosterMember;
  const weekModel = prisma?.staffRotaWeek;
  return Boolean(
    memberModel &&
    weekModel &&
    typeof memberModel.findMany === "function" &&
    typeof memberModel.deleteMany === "function" &&
    typeof memberModel.createMany === "function" &&
    typeof weekModel.findMany === "function" &&
    typeof weekModel.deleteMany === "function" &&
    typeof weekModel.createMany === "function"
  );
}

function isPrismaStaffRosterStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("staffroster") || msg.includes("staff rota") || msg.includes("staffrosta") || msg.includes("staffrota");
}

function mapStaffRosterMemberDbRow(row) {
  return {
    id: String(row?.id || "").trim(),
    name: String(row?.name || "").trim(),
    role: String(row?.role || "staff").trim(),
    availability: String(row?.availability || "off_duty").trim().toLowerCase(),
    shiftDays: Array.isArray(row?.shiftDays) ? row.shiftDays : [],
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
  };
}

function mapStaffRotaWeekDbRow(row) {
  return {
    cells: row?.cells && typeof row.cells === "object" ? row.cells : {},
    sicknessLogs: Array.isArray(row?.sicknessLogs) ? row.sicknessLogs : [],
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
  };
}

async function loadStaffBusinessRecordFromPrisma(businessId) {
  if (!hasPrismaStaffRosterModels()) return null;
  try {
    const [memberRows, weekRows] = await Promise.all([
      prisma.staffRosterMember.findMany({
        where: { businessId },
        orderBy: [{ updatedAt: "asc" }, { id: "asc" }]
      }),
      prisma.staffRotaWeek.findMany({
        where: { businessId },
        orderBy: [{ weekStart: "asc" }]
      })
    ]);
    const rotaWeeks = {};
    weekRows.forEach((row) => {
      const key = normalizeWeekStartKey(row?.weekStart);
      if (!key) return;
      rotaWeeks[key] = normalizeStaffRotaWeek(mapStaffRotaWeekDbRow(row));
    });
    return {
      members: normalizeStaffMembers(memberRows.map(mapStaffRosterMemberDbRow)),
      rotaWeeks
    };
  } catch (error) {
    if (isPrismaStaffRosterStorageUnavailable(error)) return null;
    throw error;
  }
}

async function loadStaffBusinessRecord(businessId) {
  const dbRecord = await loadStaffBusinessRecordFromPrisma(businessId);
  if (dbRecord) return dbRecord;
  const all = await readStaffRosterFile();
  return getNormalizedStaffBusinessRecord(all, businessId);
}

async function saveStaffBusinessRecord(businessId, businessRecord) {
  const normalized = {
    members: normalizeStaffMembers(businessRecord?.members || []),
    rotaWeeks:
      businessRecord?.rotaWeeks && typeof businessRecord.rotaWeeks === "object"
        ? Object.fromEntries(
          Object.entries(businessRecord.rotaWeeks)
            .map(([weekKey, week]) => [normalizeWeekStartKey(weekKey), normalizeStaffRotaWeek(week)])
            .filter(([weekKey]) => Boolean(weekKey))
        )
        : {}
  };

  if (hasPrismaStaffRosterModels()) {
    try {
      const memberData = normalized.members.map((member) => ({
        id: member.id,
        businessId,
        name: member.name,
        role: member.role || "staff",
        availability: member.availability || "off_duty",
        shiftDays: member.shiftDays || []
      }));
      const weekData = Object.entries(normalized.rotaWeeks).map(([weekStart, week]) => ({
        id: randomUUID(),
        businessId,
        weekStart,
        cells: week?.cells && typeof week.cells === "object" ? week.cells : {},
        sicknessLogs: Array.isArray(week?.sicknessLogs) ? week.sicknessLogs : []
      }));

      await prisma.staffRosterMember.deleteMany({ where: { businessId } });
      if (memberData.length) await prisma.staffRosterMember.createMany({ data: memberData });

      await prisma.staffRotaWeek.deleteMany({ where: { businessId } });
      if (weekData.length) await prisma.staffRotaWeek.createMany({ data: weekData });
      return normalized;
    } catch (error) {
      if (!isPrismaStaffRosterStorageUnavailable(error)) throw error;
    }
  }

  const all = await readStaffRosterFile();
  all[businessId] = normalized;
  await writeStaffRosterFile(all);
  return normalized;
}

function isSlotWithinBusinessHours(business, date, time, durationMin = 45) {
  const dateObj = new Date(`${date}T12:00:00`);
  if (Number.isNaN(dateObj.getTime())) return false;
  const dayKey = dayKeyFromDate(dateObj);
  const hours = parseHours(business?.hoursJson || "{}");
  const dayHours = parseOpenHours(hours[dayKey]);
  if (!dayHours) return false;
  const start = timeToMinutes(time);
  const end = start + Math.max(5, Number(durationMin || 45));
  return start >= timeToMinutes(dayHours.open) && end <= timeToMinutes(dayHours.close);
}

async function getSlotCapacityForBusinessDate(businessId, date) {
  if (!businessId || !date) return 1;
  const businessRecord = await loadStaffBusinessRecord(businessId);
  const members = normalizeStaffMembers(businessRecord?.members || []);
  if (!members.length) return 1;
  const dateObj = new Date(`${date}T12:00:00`);
  const dayKey = Number.isNaN(dateObj.getTime()) ? null : dayKeyFromDate(dateObj);
  const active = members.filter((member) => {
    if (member.availability !== "on_duty") return false;
    if (!dayKey) return true;
    if (!Array.isArray(member.shiftDays) || member.shiftDays.length === 0) return true;
    return member.shiftDays.includes(dayKey);
  });
  return Math.max(1, active.length);
}

async function isSlotAtCapacity({ businessId, date, time, capacity, excludeBookingId = "" }) {
  const maxCapacity = Math.max(1, Number(capacity || 1));
  const where = {
    businessId,
    date,
    time,
    status: "confirmed",
    ...(excludeBookingId ? { id: { not: excludeBookingId } } : {})
  };
  if (maxCapacity <= 1) {
    const found = await prisma.booking.findFirst({ where });
    return Boolean(found);
  }
  const rows = await prisma.booking.findMany({
    where,
    take: maxCapacity,
    select: { id: true }
  });
  return rows.length >= maxCapacity;
}

function normalizeAccountingProvider(input) {
  const provider = String(input || "").trim().toLowerCase();
  return supportedAccountingProviders.includes(provider) ? provider : "";
}

function summarizeBusinessAccountingIntegrations(businessRecord = {}) {
  return supportedAccountingProviders.map((provider) => {
    const item = businessRecord?.[provider];
    return {
      provider,
      status: item?.status === "connected" ? "connected" : "not_connected",
      connected: item?.status === "connected",
      accountLabel: String(item?.accountLabel || ""),
      syncMode: String(item?.syncMode || "daily"),
      connectedAt: item?.connectedAt || null,
      updatedAt: item?.updatedAt || null
    };
  });
}

function isPrismaAccountingIntegrationsStorageUnavailable(error) {
  const code = String(error?.code || "").trim();
  if (code === "P2021" || code === "P2022") return true;
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("prisma is not initialized")) return true;
  return msg.includes("accounting") || msg.includes("integration");
}

async function loadAccountingIntegrationsRecordFromPrisma(businessId) {
  const model = prisma?.accountingIntegration;
  if (!model || typeof model.findMany !== "function") return null;
  try {
    const rows = await model.findMany({
      where: { businessId },
      orderBy: [{ provider: "asc" }]
    });
    const record = {};
    rows.forEach((row) => {
      const provider = normalizeAccountingProvider(row?.provider);
      if (!provider) return;
      record[provider] = {
        provider,
        status: String(row?.status || "not_connected"),
        accountLabel: String(row?.accountLabel || ""),
        syncMode: String(row?.syncMode || "daily"),
        connectedAt: row?.connectedAt ? new Date(row.connectedAt).toISOString() : null,
        updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
      };
    });
    return record;
  } catch (error) {
    if (isPrismaAccountingIntegrationsStorageUnavailable(error)) return null;
    throw error;
  }
}

async function loadAccountingIntegrationsRecord(businessId) {
  const dbRecord = await loadAccountingIntegrationsRecordFromPrisma(businessId);
  if (dbRecord) return dbRecord;
  const all = await readAccountingIntegrationsFile();
  return all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
}

async function saveAccountingIntegrationsRecord(businessId, record) {
  const normalized = {};
  summarizeBusinessAccountingIntegrations(record).forEach((row) => {
    normalized[row.provider] = {
      provider: row.provider,
      status: row.status,
      accountLabel: row.accountLabel,
      syncMode: row.syncMode,
      connectedAt: row.connectedAt,
      updatedAt: row.updatedAt
    };
  });

  const model = prisma?.accountingIntegration;
  if (model && typeof model.deleteMany === "function" && typeof model.createMany === "function") {
    try {
      await model.deleteMany({ where: { businessId } });
      const rows = Object.values(normalized).map((row) => ({
        id: `${businessId}:${row.provider}`,
        businessId,
        provider: row.provider,
        status: String(row.status || "not_connected"),
        accountLabel: String(row.accountLabel || ""),
        syncMode: String(row.syncMode || "daily"),
        connectedAt: row.connectedAt ? new Date(row.connectedAt) : null
      }));
      if (rows.length) {
        await model.createMany({ data: rows });
      }
      return normalized;
    } catch (error) {
      if (!isPrismaAccountingIntegrationsStorageUnavailable(error)) throw error;
    }
  }

  const all = await readAccountingIntegrationsFile();
  all[businessId] = normalized;
  await writeAccountingIntegrationsFile(all);
  return normalized;
}

async function processBillingEvent(event) {
  if (!event?.type) return;
  if (event.provider === "paypal") {
    const paypalEvent = event.data?.object || {};
    await processPayPalBillingWebhookEvent(paypalEvent);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    const businessId = session.metadata?.businessId;
    if (businessId) {
      await prisma.subscription.upsert({
        where: { businessId },
        update: {
          stripeCustomerId: session.customer?.toString() || null,
          stripeSubscription: session.subscription?.toString() || null,
          status: "active"
        },
        create: {
          businessId,
          stripeCustomerId: session.customer?.toString() || null,
          stripeSubscription: session.subscription?.toString() || null,
          status: "active",
          plan: "pro"
        }
      });
      clearReadCache();
      await writeAuditLog({
        actorRole: "system",
        action: "billing.subscription_activated",
        entityType: "subscription",
        entityId: businessId,
        metadata: { eventType: event.type }
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data?.object || {};
    await prisma.subscription.updateMany({
      where: { stripeSubscription: subscription.id },
      data: { status: "cancelled" }
    });
    clearReadCache();
    await writeAuditLog({
      actorRole: "system",
      action: "billing.subscription_cancelled",
      entityType: "subscription",
      entityId: subscription.id,
      metadata: { eventType: event.type }
    });
  }
}

jobRuntime = createJobRuntime({
  redisUrl: "",
  handlers: {
    onNotification: async (payload) => {
      await sendBookingNotifications(payload);
    },
    onBillingEvent: async (payload) => {
      await processBillingEvent(payload);
    }
  }
});

function rateKeyByIp(req) {
  return String(req.headers["x-forwarded-for"] || req.ip || "unknown").split(",")[0].trim();
}

function rateKeyByUserOrIp(req) {
  return req.auth?.sub ? `user:${req.auth.sub}` : `ip:${rateKeyByIp(req)}`;
}

const apiLimiter = createDistributedRateLimiter({
  name: "api",
  windowMs: 15 * 60 * 1000,
  max: 250,
  keyFn: rateKeyByIp,
  incrementRateLimit
});

const authLimiter = createDistributedRateLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000,
  max: 35,
  keyFn: rateKeyByIp,
  incrementRateLimit
});

const bookingLimiter = createDistributedRateLimiter({
  name: "booking",
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyFn: rateKeyByUserOrIp,
  incrementRateLimit
});

const chatLimiter = createDistributedRateLimiter({
  name: "chat",
  windowMs: 10 * 60 * 1000,
  max: 50,
  keyFn: rateKeyByUserOrIp,
  incrementRateLimit
});

app.use(helmet());
app.use(cors(getCorsOptions()));
app.use(compression());

app.post("/api/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) return res.status(400).send("Stripe not configured");
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") return res.status(400).send("Missing signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook signature invalid: ${err.message}`);
  }

  await jobRuntime.enqueueBillingEvent(event);
  return res.json({ received: true, queued: jobRuntime.enabled });
});

app.post("/api/billing/paypal-webhook", express.json({ limit: "1mb" }), async (req, res) => {
  if (!isPayPalConfigured()) return res.status(400).send("PayPal not configured");
  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const eventType = String(payload?.event_type || "").trim();
  if (!eventType) return res.status(400).send("Missing PayPal event type");

  let signatureValid = false;
  try {
    signatureValid = await verifyPayPalWebhookSignature(payload, req.headers);
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) return res.status(400).send("PayPal webhook signature invalid");

  await jobRuntime.enqueueBillingEvent({
    provider: "paypal",
    type: eventType,
    data: {
      object: payload
    }
  });
  return res.json({ received: true, queued: jobRuntime.enabled });
});

app.use(express.json({ limit: "1mb" }));
app.use(
  "/api",
  apiLimiter
);
app.use(express.static(path.join(__dirname, "public"), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    const normalizedPath = String(filePath || "").replace(/\\/g, "/");
    if (
      normalizedPath.endsWith("/index.html") ||
      normalizedPath.endsWith("/dashboard.html") ||
      normalizedPath.endsWith("/auth.html") ||
      normalizedPath.endsWith("/sw.js") ||
      normalizedPath.endsWith("/manifest.webmanifest")
    ) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return;
    }

    if (
      normalizedPath.endsWith("/styles.css") ||
      normalizedPath.endsWith("/app.js") ||
      normalizedPath.endsWith("/dashboard.js") ||
      normalizedPath.endsWith("/auth.js") ||
      normalizedPath.endsWith("/theme-toggle.js")
    ) {
      res.setHeader("Cache-Control", "no-cache, must-revalidate");
      return;
    }

    res.setHeader("Cache-Control", "public, max-age=86400");
  }
}));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/readyz", async (_req, res) => {
  let prismaReady = false;
  let prismaError = "";

  try {
    await prisma.user.findFirst({ select: { id: true } });
    prismaReady = true;
  } catch (error) {
    prismaError = String(error?.message || "prisma unavailable");
  }

  const payload = {
    status: prismaReady ? "ready" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      prisma: prismaReady,
      redis: isRedisEnabled(),
      queues: jobRuntime ? (jobRuntime.enabled ? "redis" : "inline") : "not_initialized"
    }
  };

  if (!prismaReady && prismaError) {
    payload.checks.prismaError = prismaError;
  }

  return res.status(prismaReady ? 200 : 503).json(payload);
});

app.get("/api/config", async (_req, res) => {
  const cacheKey = "config:v1";
  const cached = await getCached(cacheKey);
  if (cached) return res.json(cached);

  const featured = await prisma.business.findFirst({ include: { services: true } });
  const featuredSlots = featured ? await getAvailableSlotsForBusiness(featured) : [];
  const payload = {
    llmEnabled: Boolean(openai),
    cancellationPolicy,
    featuredBusiness: featured ? mapBusiness(featured, { includeSlots: true, availableSlots: featuredSlots }) : null
  };
  await setCached(cacheKey, payload, 20_000);
  res.json(payload);
});

app.post("/api/auth/register/subscriber", authLimiter, async (req, res) => {
  const payload = req.body || {};
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const businessName = String(payload.businessName || "").trim();
  const city = String(payload.city || "").trim();
  const country = String(payload.country || "").trim();
  const postcode = String(payload.postcode || "").trim();
  const phone = String(payload.phone || "").trim();
  const businessType = normalizeBusinessType(payload.businessType);
  const websiteUrl = String(payload.websiteUrl || "").trim();
  const teamSize = String(payload.teamSize || "").trim();
  const primaryGoal = String(payload.primaryGoal || "").trim();
  const setupNotes = String(payload.setupNotes || "").trim();
  const paymentConsentAccepted = Boolean(payload.paymentConsentAccepted);

  if (!name || !email || !password || !businessName || !city || !country || !postcode || !phone) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });
  if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format." });
  if (!isValidOptionalHttpUrl(websiteUrl)) return res.status(400).json({ error: "Invalid website URL." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already exists." });

  const business = await prisma.business.create({
    data: {
      name: businessName,
      type: businessType,
      phone,
      email,
        city,
        country,
        postcode,
        address: `${city} City Centre`,
        description: defaultDescriptionByBusinessType(businessType, businessName),
        websiteUrl: websiteUrl || null,
        websiteTitle: payload.websiteTitle || null,
        websiteSummary: payload.websiteSummary || null,
        websiteImageUrl: payload.websiteImageUrl || null,
        hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType)),
        services: {
          create: defaultServicesByBusinessType(businessType)
        }
    }
  });

  const user = await prisma.user.create({
    data: {
      role: "subscriber",
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      businessId: business.id
    }
  });

  const token = signToken(user);
  clearReadCache();
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: "auth.register_subscriber",
    entityType: "user",
    entityId: user.id,
    metadata: {
      businessId: business.id,
      onboarding: {
        websiteUrl: websiteUrl || null,
        teamSize: teamSize || null,
        primaryGoal: primaryGoal || null,
        setupNotes: setupNotes || null,
        paymentConsentAccepted
      }
    }
  });
  return res.status(201).json({ token, user: { id: user.id, role: user.role, email: user.email } });
});

app.post("/api/auth/register/customer", authLimiter, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const phone = String(req.body?.phone || "").trim();
  const city = String(req.body?.city || "").trim();
  const preferredService = String(req.body?.preferredService || "").trim();
  const notes = String(req.body?.notes || "").trim();
  const paymentConsentAccepted = Boolean(req.body?.paymentConsentAccepted);
  const termsAccepted = Boolean(req.body?.termsAccepted);
  const updatesOptIn = Boolean(req.body?.updatesOptIn);
  if (!name || !email || !password) return res.status(400).json({ error: "Missing required fields." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });
  if (phone && !isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already exists." });

  const user = await prisma.user.create({
    data: {
      role: "customer",
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10)
    }
  });

  const token = signToken(user);
  clearReadCache();
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: "auth.register_customer",
    entityType: "user",
    entityId: user.id,
    metadata: {
      onboarding: {
        phone: phone || null,
        city: city || null,
        preferredService: preferredService || null,
        notes: notes || null,
        paymentConsentAccepted,
        termsAccepted,
        updatesOptIn
      }
    }
  });
  return res.status(201).json({ token, user: { id: user.id, role: user.role, email: user.email } });
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const requestedRole = String(req.body?.requestedRole || "").trim().toLowerCase();
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await writeAuditLog({
      actorRole: "anonymous",
      action: "auth.login_failed",
      entityType: "user",
      metadata: { email }
    });
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login_failed",
      entityType: "user",
      entityId: user.id
    });
    return res.status(401).json({ error: "Invalid credentials." });
  }

  let effectiveRole = user.role;
  let effectiveBusinessId = user.businessId || null;
  const canRoleSwitch = user.role === "admin" && ["admin", "subscriber", "customer"].includes(requestedRole);
  if (canRoleSwitch) {
    effectiveRole = requestedRole;
  }
  if (effectiveRole === "subscriber" && !effectiveBusinessId) {
    const fallbackBusiness = await prisma.business.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" }
    });
    effectiveBusinessId = fallbackBusiness?.id || null;
  }

  if (effectiveRole === "subscriber" && !effectiveBusinessId) {
    return res.status(400).json({ error: "No business available for subscriber login." });
  }

  const sessionUser = {
    ...user,
    role: effectiveRole,
    businessId: effectiveBusinessId
  };
  const token = signToken(sessionUser);
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: "auth.login_success",
    entityType: "user",
    entityId: user.id,
    metadata: {
      requestedRole: requestedRole || null,
      effectiveRole,
      roleSwitched: canRoleSwitch
    }
  });
  return res.json({
    token,
    user: {
      id: user.id,
      role: effectiveRole,
      email: user.email,
      businessId: effectiveBusinessId,
      name: user.name
    }
  });
});

app.get("/api/search/businesses", async (req, res) => {
  const name = String(req.query.name || "");
  const location = String(req.query.location || "");
  const postcode = String(req.query.postcode || "");
  const phone = String(req.query.phone || "");
  const businessType = String(req.query.businessType || "");
  const includeSlots = String(req.query.includeSlots || "").trim() === "1";
  const limit = parsePageSize(req.query.limit, 25);
  const cursorPayload = decodeCursor(req.query.cursor);
  const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
  const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";

  const filterAnd = [
    name ? { name: { contains: name, mode: "insensitive" } } : {},
    postcode ? { postcode: { contains: postcode, mode: "insensitive" } } : {},
    phone ? { phone: { contains: phone, mode: "insensitive" } } : {},
    businessType ? { type: { in: businessTypeSearchValues(businessType) } } : {},
    location
      ? {
          OR: [
            { city: { contains: location, mode: "insensitive" } },
            { country: { contains: location, mode: "insensitive" } }
          ]
        }
      : {}
  ];

  if (cursorDate && cursorId) {
    filterAnd.push({
      OR: [
        { createdAt: { lt: cursorDate } },
        { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
      ]
    });
  }

  const cacheKey = makeCacheKey([
    "search:v2",
    name,
    location,
    postcode,
    phone,
    businessType,
    includeSlots ? "slots" : "noslots",
    limit,
    req.query.cursor || ""
  ]);
  if (!includeSlots) {
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached);
  }

  const businesses = await prisma.business.findMany({
    where: { AND: filterAnd },
    include: { services: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1
  });

  const hasMore = businesses.length > limit;
  const pageRows = businesses.slice(0, limit);
  const mapped = includeSlots
    ? await Promise.all(
        pageRows.map(async (b) => mapBusiness(b, { includeSlots: true, availableSlots: await getAvailableSlotsForBusiness(b) }))
      )
    : pageRows.map((b) => mapBusiness(b, { includeSlots: false }));
  const last = pageRows[pageRows.length - 1];
  const nextCursor = hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null;

  const payload = {
    results: mapped,
    pagination: {
      limit,
      hasMore,
      nextCursor
    }
  };
  if (!includeSlots) await setCached(cacheKey, payload, 15_000);
  return res.json(payload);
});

app.get("/api/businesses/:businessId", async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { id: req.params.businessId },
    include: { services: true }
  });
  if (!business) return res.status(404).json({ error: "Business not found." });
  const slots = await getAvailableSlotsForBusiness(business);
  return res.json({ business: mapBusiness(business, { includeSlots: true, availableSlots: slots }) });
});

app.get("/api/businesses/me/profile", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] } }
  });
  if (!business) return res.status(404).json({ error: "Business not found." });

  return res.json({
    business: {
      id: business.id,
      name: business.name,
      type: normalizeBusinessType(business.type),
      phone: String(business.phone || ""),
      email: String(business.email || ""),
      city: String(business.city || ""),
      country: String(business.country || ""),
      postcode: String(business.postcode || ""),
      address: String(business.address || ""),
      description: String(business.description || ""),
      websiteUrl: String(business.websiteUrl || ""),
      websiteTitle: String(business.websiteTitle || ""),
      websiteSummary: String(business.websiteSummary || ""),
      websiteImageUrl: String(business.websiteImageUrl || ""),
      hours: normalizeBusinessHoursInput(parseHours(business.hoursJson)),
      services: business.services.map((row) => ({
        name: String(row.name || ""),
        durationMin: Number(row.durationMin || 0),
        price: Number(row.price || 0)
      }))
    }
  });
});

app.post("/api/businesses/me/profile", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const payload = req.body || {};
  const name = String(payload.name || "").trim();
  const type = normalizeBusinessType(payload.type);
  const phone = String(payload.phone || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const city = String(payload.city || "").trim();
  const country = String(payload.country || "").trim();
  const postcode = String(payload.postcode || "").trim();
  const address = String(payload.address || "").trim();
  const description = String(payload.description || "").trim();
  const websiteUrl = String(payload.websiteUrl || "").trim();
  const websiteTitle = String(payload.websiteTitle || "").trim();
  const websiteSummary = String(payload.websiteSummary || "").trim();
  const websiteImageUrl = String(payload.websiteImageUrl || "").trim();

  if (!name || !phone || !email || !city || !country || !postcode || !address) {
    return res.status(400).json({ error: "Missing required business profile fields." });
  }
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid business email format." });
  if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid business phone format." });
  if (!isValidOptionalHttpUrl(websiteUrl)) return res.status(400).json({ error: "Invalid website URL." });
  if (!isValidOptionalHttpUrl(websiteImageUrl)) return res.status(400).json({ error: "Invalid website image URL." });

  let normalizedHours = {};
  let normalizedServices = [];
  try {
    normalizedHours = normalizeBusinessHoursInput(payload.hours);
    normalizedServices = normalizeBusinessServicesInput(payload.services);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid business profile payload." });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
  if (!business) return res.status(404).json({ error: "Business not found." });

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id: businessId },
      data: {
        name,
        type,
        phone,
        email,
        city,
        country,
        postcode,
        address,
        description: description || defaultDescriptionByBusinessType(type, name),
        websiteUrl: websiteUrl || null,
        websiteTitle: websiteTitle || null,
        websiteSummary: websiteSummary || null,
        websiteImageUrl: websiteImageUrl || null,
        hoursJson: JSON.stringify(normalizedHours)
      }
    });
    await tx.service.deleteMany({ where: { businessId } });
    await tx.service.createMany({
      data: normalizedServices.map((row) => ({
        businessId,
        name: row.name,
        durationMin: row.durationMin,
        price: row.price
      }))
    });
  });

  const updated = await prisma.business.findUnique({
    where: { id: businessId },
    include: { services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] } }
  });

  clearReadCache();
  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "business.profile_updated",
    entityType: "business",
    entityId: businessId,
    metadata: { businessId, type, serviceCount: normalizedServices.length }
  });

  return res.json({
    business: {
      id: updated.id,
      name: updated.name,
      type: normalizeBusinessType(updated.type),
      phone: String(updated.phone || ""),
      email: String(updated.email || ""),
      city: String(updated.city || ""),
      country: String(updated.country || ""),
      postcode: String(updated.postcode || ""),
      address: String(updated.address || ""),
      description: String(updated.description || ""),
      websiteUrl: String(updated.websiteUrl || ""),
      websiteTitle: String(updated.websiteTitle || ""),
      websiteSummary: String(updated.websiteSummary || ""),
      websiteImageUrl: String(updated.websiteImageUrl || ""),
      hours: normalizeBusinessHoursInput(parseHours(updated.hoursJson)),
      services: updated.services.map((row) => ({
        name: String(row.name || ""),
        durationMin: Number(row.durationMin || 0),
        price: Number(row.price || 0)
      }))
    }
  });
});

app.post("/api/businesses/me/profile/apply-template", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const requestedType = normalizeBusinessType(req.body?.type);
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true }
  });
  if (!business) return res.status(404).json({ error: "Business not found." });

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id: businessId },
      data: {
        type: requestedType,
        description: defaultDescriptionByBusinessType(requestedType, business.name),
        hoursJson: JSON.stringify(defaultHoursByBusinessType(requestedType))
      }
    });
    await tx.service.deleteMany({ where: { businessId } });
    await tx.service.createMany({
      data: defaultServicesByBusinessType(requestedType).map((row) => ({
        businessId,
        name: row.name,
        durationMin: row.durationMin,
        price: row.price
      }))
    });
  });

  const updated = await prisma.business.findUnique({
    where: { id: businessId },
    include: { services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] } }
  });

  clearReadCache();
  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "business.template_applied",
    entityType: "business",
    entityId: businessId,
    metadata: { businessId, type: requestedType }
  });

  return res.json({
    business: {
      id: updated.id,
      name: updated.name,
      type: normalizeBusinessType(updated.type),
      phone: String(updated.phone || ""),
      email: String(updated.email || ""),
      city: String(updated.city || ""),
      country: String(updated.country || ""),
      postcode: String(updated.postcode || ""),
      address: String(updated.address || ""),
      description: String(updated.description || ""),
      websiteUrl: String(updated.websiteUrl || ""),
      websiteTitle: String(updated.websiteTitle || ""),
      websiteSummary: String(updated.websiteSummary || ""),
      websiteImageUrl: String(updated.websiteImageUrl || ""),
      hours: normalizeBusinessHoursInput(parseHours(updated.hoursJson)),
      services: updated.services.map((row) => ({
        name: String(row.name || ""),
        durationMin: Number(row.durationMin || 0),
        price: Number(row.price || 0)
      }))
    }
  });
});

app.get("/api/businesses/me/social-media", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      socialFacebook: true,
      socialInstagram: true,
      socialTwitter: true,
      socialLinkedin: true,
      socialTiktok: true
    }
  });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const scoped = await loadSocialMediaExtras(businessId);
  return res.json({
    socialFacebook: String(business.socialFacebook || ""),
    socialInstagram: String(business.socialInstagram || ""),
    socialTwitter: String(business.socialTwitter || ""),
    socialLinkedin: String(business.socialLinkedin || ""),
    socialTiktok: String(business.socialTiktok || ""),
    customSocial: scoped.customSocial,
    socialImageUrl: scoped.socialImageUrl
  });
});

app.post("/api/businesses/me/social-media", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const socialFacebook = String(req.body?.socialFacebook || "").trim();
  const socialInstagram = String(req.body?.socialInstagram || "").trim();
  const socialTwitter = String(req.body?.socialTwitter || "").trim();
  const socialLinkedin = String(req.body?.socialLinkedin || "").trim();
  const socialTiktok = String(req.body?.socialTiktok || "").trim();
  const customSocial = String(req.body?.customSocial || "").trim();
  const socialImageUrl = String(req.body?.socialImageUrl || "").trim();

  const invalid = [
    { label: "Facebook", value: socialFacebook },
    { label: "Instagram", value: socialInstagram },
    { label: "Twitter", value: socialTwitter },
    { label: "LinkedIn", value: socialLinkedin },
    { label: "TikTok", value: socialTiktok },
    { label: "Other", value: customSocial },
    { label: "Image URL", value: socialImageUrl }
  ].find((item) => !isValidOptionalHttpUrl(item.value));
  if (invalid) return res.status(400).json({ error: `Invalid ${invalid.label} URL.` });

  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
  if (!business) return res.status(404).json({ error: "Business not found." });

  await prisma.business.update({
    where: { id: businessId },
    data: {
      socialFacebook: socialFacebook || null,
      socialInstagram: socialInstagram || null,
      socialTwitter: socialTwitter || null,
      socialLinkedin: socialLinkedin || null,
      socialTiktok: socialTiktok || null
    }
  });

  await saveSocialMediaExtras(businessId, { customSocial, socialImageUrl });
  clearReadCache();

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "business.social_media_updated",
    entityType: "business",
    entityId: businessId,
    metadata: { businessId }
  });

  return res.json({
    socialFacebook,
    socialInstagram,
    socialTwitter,
    socialLinkedin,
    socialTiktok,
    customSocial,
    socialImageUrl
  });
});

app.post("/api/bookings", bookingLimiter, async (req, res) => {
  const businessId = String(req.body?.businessId || "").trim();
  const customerName = String(req.body?.customerName || "").trim();
  const customerPhone = String(req.body?.customerPhone || "").trim();
  const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
  const service = String(req.body?.service || "").trim();
  const date = String(req.body?.date || "").trim();
  const time = String(req.body?.time || "").trim();

  if (!businessId || !customerName || !customerPhone || !service || !date || !time) {
    return res.status(400).json({ error: "Missing booking fields." });
  }
  if (!isValidPhone(customerPhone)) return res.status(400).json({ error: "Invalid customer phone format." });
  if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: "Invalid customer email format." });

  const normalized = normalizeBookingDateTime(date, time);
  if (!normalized) return res.status(400).json({ error: "Invalid date/time format." });
  if (isBookingSlotInPast(normalized.date, normalized.time)) {
    return res.status(400).json({ error: "Bookings must be scheduled for a future time." });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId }, include: { services: true } });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const svc = business.services.find((s) => s.name.toLowerCase() === service.toLowerCase());
  if (!svc) return res.status(400).json({ error: "Selected service is not offered by this business." });
  const durationMin = Math.max(5, Number(svc.durationMin || 45));
  if (!isSlotWithinBusinessHours(business, normalized.date, normalized.time, durationMin)) {
    return res.status(400).json({ error: "Selected slot is outside operating hours for this service duration." });
  }
  const capacity = await getSlotCapacityForBusinessDate(businessId, normalized.date);
  const atCapacity = await isSlotAtCapacity({
    businessId,
    date: normalized.date,
    time: normalized.time,
    capacity
  });
  if (atCapacity) return res.status(409).json({ error: "Selected slot reached staff capacity." });
  const booking = await prisma.booking.create({
    data: {
      businessId,
      businessName: business.name,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      service,
      price: svc.price,
      date: normalized.date,
      time: normalized.time,
      status: "confirmed",
      source: "manual"
    }
  });

  await jobRuntime.enqueueNotification({
    businessName: business.name,
    booking,
    customerEmail: customerEmail || "",
    customerPhone
  });
  clearReadCache();
  await writeAuditLog({
    actorRole: "anonymous",
    action: "booking.created_manual",
    entityType: "booking",
    entityId: booking.id,
    metadata: { businessId: booking.businessId }
  });

  return res.status(201).json({ booking });
});

app.get("/api/bookings/public-demo", async (_req, res) => {
  const limit = parsePageSize(_req.query.limit, 20);
  const cursorPayload = decodeCursor(_req.query.cursor);
  const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
  const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
  const where = [{ status: "confirmed" }];
  if (cursorDate && cursorId) {
    where.push({
      OR: [
        { createdAt: { lt: cursorDate } },
        { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
      ]
    });
  }

  const cacheKey = makeCacheKey(["public-demo:v2", limit, _req.query.cursor || ""]);
  const cached = await getCached(cacheKey);
  if (cached) return res.json(cached);

  const bookings = await prisma.booking.findMany({
    where: { AND: where },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      customerName: true,
      service: true,
      date: true,
      time: true,
      businessName: true,
      createdAt: true
    }
  });
  const hasMore = bookings.length > limit;
  const pageRows = bookings.slice(0, limit);
  const sanitized = pageRows.map((b) => ({
    ...b,
    customerName: `${String(b.customerName || "").slice(0, 1)}***`
  }));
  const last = pageRows[pageRows.length - 1];
  const payload = {
    bookings: sanitized.map(({ createdAt, ...rest }) => rest),
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
    }
  };
  await setCached(cacheKey, payload, 10_000);
  return res.json(payload);
});

app.get("/api/bookings", authRequired, requireRole("admin"), async (req, res) => {
  const limit = parsePageSize(req.query.limit, 50);
  const cursorPayload = decodeCursor(req.query.cursor);
  const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
  const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
  const where = [];
  if (cursorDate && cursorId) {
    where.push({
      OR: [
        { createdAt: { lt: cursorDate } },
        { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
      ]
    });
  }
  const bookings = await prisma.booking.findMany({
    where: where.length ? { AND: where } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1
  });
  const hasMore = bookings.length > limit;
  const pageRows = bookings.slice(0, limit);
  const last = pageRows[pageRows.length - 1];
  return res.json({
    bookings: pageRows,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
    }
  });
});

app.get("/api/me/bookings", authRequired, async (req, res) => {
  const limit = parsePageSize(req.query.limit, 50);
  const cursorPayload = decodeCursor(req.query.cursor);
  const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
  const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";
  const adminBusinessId = String(req.query.businessId || "").trim();
  const filterAnd = [];

  if (req.auth.role === "subscriber") {
    filterAnd.push({ businessId: req.auth.businessId || "" });
  } else if (req.auth.role === "admin" && adminBusinessId) {
    filterAnd.push({ businessId: adminBusinessId });
  } else if (req.auth.role === "customer") {
    filterAnd.push({ customerEmail: req.auth.email || "" });
  }
  if (cursorDate && cursorId) {
    filterAnd.push({
      OR: [
        { createdAt: { lt: cursorDate } },
        { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
      ]
    });
  }

  const bookings = await prisma.booking.findMany({
    where: filterAnd.length ? { AND: filterAnd } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1
  });
  const hasMore = bookings.length > limit;
  const pageRows = bookings.slice(0, limit);
  const last = pageRows[pageRows.length - 1];
  return res.json({
    bookings: pageRows,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null
    }
  });
});

app.patch("/api/bookings/:bookingId/cancel", authRequired, bookingLimiter, async (req, res) => {
  const bookingId = String(req.params.bookingId || "").trim();
  if (!bookingId) return res.status(400).json({ error: "Booking ID is required." });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (!canMutateBooking(req, booking)) return res.status(403).json({ error: "Forbidden." });
  const bookingStatus = normalizeBookingStatusValue(booking.status);
  if (bookingStatus === "cancelled") return res.status(400).json({ error: "Booking is already cancelled." });
  if (bookingStatus === "completed") return res.status(400).json({ error: "Completed bookings cannot be cancelled." });

  const normalized = normalizeBookingDateTime(booking.date, booking.time);
  const now = Date.now();
  let feeApplied = false;
  if (normalized) {
    const appointmentTime = new Date(`${normalized.date}T${normalized.time}:00`);
    const diffHours = (appointmentTime.getTime() - now) / (1000 * 60 * 60);
    feeApplied = diffHours < cancellationPolicy.hoursWindow;
  }

  const cancelled = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled" }
  });
  clearReadCache();
  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "booking.cancelled",
    entityType: "booking",
    entityId: cancelled.id,
    metadata: { feeApplied }
  });

  return res.json({
    booking: cancelled,
    policy: {
      hoursWindow: cancellationPolicy.hoursWindow,
      feeApplied
    }
  });
});

app.patch("/api/bookings/:bookingId/reschedule", authRequired, bookingLimiter, async (req, res) => {
  const bookingId = String(req.params.bookingId || "").trim();
  const date = String(req.body?.date || "").trim();
  const time = String(req.body?.time || "").trim();
  if (!bookingId || !date || !time) return res.status(400).json({ error: "Booking ID, date, and time are required." });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (!canMutateBooking(req, booking)) return res.status(403).json({ error: "Forbidden." });
  const bookingStatus = normalizeBookingStatusValue(booking.status);
  if (bookingStatus === "cancelled") return res.status(400).json({ error: "Cancelled bookings cannot be rescheduled." });
  if (bookingStatus === "completed") return res.status(400).json({ error: "Completed bookings cannot be rescheduled." });
  const business = await prisma.business.findUnique({
    where: { id: booking.businessId },
    include: { services: true }
  });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const normalized = normalizeBookingDateTime(date, time);
  if (!normalized) return res.status(400).json({ error: "Invalid date/time format." });
  if (normalized.date === String(booking.date || "").trim() && normalized.time === String(booking.time || "").trim()) {
    return res.status(400).json({ error: "Booking is already scheduled for that date and time." });
  }
  if (isBookingSlotInPast(normalized.date, normalized.time)) {
    return res.status(400).json({ error: "Rescheduled time must be in the future." });
  }
  const svc = business.services.find((serviceRow) => serviceRow.name.toLowerCase() === String(booking.service || "").toLowerCase());
  const durationMin = Math.max(5, Number(svc?.durationMin || 45));
  if (!isSlotWithinBusinessHours(business, normalized.date, normalized.time, durationMin)) {
    return res.status(400).json({ error: "Selected slot is outside operating hours for this service duration." });
  }

  const capacity = await getSlotCapacityForBusinessDate(booking.businessId, normalized.date);
  const conflict = await isSlotAtCapacity({
    businessId: booking.businessId,
    date: normalized.date,
    time: normalized.time,
    capacity,
    excludeBookingId: booking.id
  });
  if (conflict) return res.status(409).json({ error: "Selected slot reached staff capacity." });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      date: normalized.date,
      time: normalized.time
    }
  });
  clearReadCache();

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "booking.rescheduled",
    entityType: "booking",
    entityId: updated.id,
    metadata: { from: { date: booking.date, time: booking.time }, to: normalized }
  });

  return res.json({ booking: updated });
});

app.get("/api/dashboard/admin", authRequired, requireRole("admin"), async (_req, res) => {
  const [businesses, users, bookings, cancelled] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "cancelled" } })
  ]);

  return res.json({
    analytics: {
      totalBusinesses: businesses,
      totalUsers: users,
      totalBookings: bookings,
      cancelledBookings: cancelled,
      conversionRate: bookings ? Number((((bookings - cancelled) / bookings) * 100).toFixed(1)) : 0
    }
  });
});

app.get("/api/dashboard/admin/revenue-analytics", authRequired, requireRole("admin"), async (_req, res) => {
  const payload = await computeAdminRevenueAnalytics(6);
  return res.json(payload);
});

app.get("/api/dashboard/admin/revenue-analytics/export", authRequired, requireRole("admin"), async (req, res) => {
  const format = String(req.query?.format || "csv").trim().toLowerCase();
  if (format !== "csv") {
    return res.status(400).json({ error: "Only csv export format is currently supported." });
  }

  const payload = await computeAdminRevenueAnalytics(6);
  const generatedAt = new Date().toISOString();
  const csv = buildAdminRevenueAnalyticsCsv(payload, generatedAt);
  const fileDate = generatedAt.slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"admin_revenue_analytics_${fileDate}.csv\"`);
  return res.status(200).send(csv);
});

app.get("/api/admin/businesses", authRequired, requireRole("admin"), async (_req, res) => {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      country: true
    },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }]
  });

  return res.json({
    businesses: businesses.map((business) => ({
      id: business.id,
      name: business.name,
      type: business.type,
      city: business.city || "",
      country: business.country || ""
    }))
  });
});

function buildAdminCopilotHeuristicResponse(question, snapshot) {
  const q = String(question || "").trim();
  const qLower = normalizeLexiTypos(q.toLowerCase());
  const findings = [];
  const suggestedFixes = [];
  const platform = snapshot?.platform || {};
  const health = snapshot?.health || {};
  const scope = snapshot?.managedBusiness || null;
  const cancelRate = Number(platform.cancelRatePct || 0);
  const looksLikeAdminDiagnostics = /admin|platform|diagnostic|diagnostics|scope|subscriber|billing|bookings|calendar|cancell|accounting|redis|prisma|api|server|dashboard|managed business|business/i.test(q);
  const looksLikeRealtimeGeneral = /weather|temperature|forecast|news|stock|price of|traffic/i.test(qLower);

  if (!looksLikeAdminDiagnostics) {
    const generalAnswer = looksLikeRealtimeGeneral
      ? "I can help with salon and business planning, but I don’t have live weather lookup in this chat yet. If you tell me your city, I can still suggest how weather usually affects walk-ins, cancellations, and demand."
      : "Yes, I can help with general salon, barber, beauty, and business questions here, and I can also use admin or managed-business context when your question is about the dashboard.";
    return {
      answer: generalAnswer,
      findings: [
        scope?.selected
          ? `Managed business context is available (${scope.name || "selected business"}) if you want business-specific guidance.`
          : "No managed business is selected right now, but general guidance is still available."
      ],
      suggestedFixes: [
        "Ask your general question directly (services, products, client experience, operations ideas, etc.).",
        "For business-specific diagnostics, mention the dashboard/module or the managed business issue you want checked."
      ]
    };
  }

  if (!health.prismaReady) {
    findings.push("Database diagnostics are partially unavailable because Prisma queries failed.");
    suggestedFixes.push("Verify Prisma client generation and database connectivity, then retry the copilot query.");
  }
  if (!health.openaiConfigured) {
    findings.push("OpenAI API is not configured for enhanced copilot reasoning.");
    suggestedFixes.push("Set OPENAI_API_KEY on the server environment to enable richer copilot responses.");
  }
  if (cancelRate >= 12) {
    findings.push(`Platform cancellation rate is elevated (${cancelRate.toFixed(1)}%).`);
    suggestedFixes.push("Review cancellation workflows, reminder timing, and waitlist backfill usage across active businesses.");
  }
  if (health.redisConfigured && !health.redisEnabled) {
    findings.push("Redis URL is configured but runtime is using inline fallback queues/cache behavior.");
    suggestedFixes.push("Confirm Redis connectivity and runtime startup logs so queue-backed features run as expected.");
  }
  if ((/subscriber|business|scope/i.test(q) || q.length < 8) && !scope?.selected) {
    findings.push("No managed business scope is selected for this admin session.");
    suggestedFixes.push("Select a managed business in the admin scope dropdown for business-specific diagnostics.");
  }
  if (!findings.length) {
    findings.push("No obvious platform-wide configuration red flags were detected in the sanitized snapshot.");
    suggestedFixes.push("Use a more specific question (billing, bookings, calendar, cancellations, accounting, admin scope) for targeted diagnostics.");
  }

  const answerParts = [
    "Here’s a quick admin summary based on the current platform snapshot.",
    scope?.selected
      ? `I also included checks for ${scope.name || "the selected business"}.`
      : "No managed business is selected, so this is a platform-level view.",
    findings.length ? `Main thing to look at: ${findings[0]}` : ""
  ].filter(Boolean);

  return {
    answer: answerParts.join(" "),
    findings: findings.slice(0, 6),
    suggestedFixes: suggestedFixes.slice(0, 6)
  };
}

async function buildAdminCopilotSnapshot(req) {
  const snapshot = {
    platform: {
      businesses: null,
      users: null,
      bookings: null,
      cancelledBookings: null,
      cancelRatePct: null
    },
    managedBusiness: {
      selected: false,
      id: null,
      name: "",
      bookings: null,
      cancelledBookings: null,
      users: null
    },
    health: {
      prismaReady: true,
      openaiConfigured: Boolean(openai),
      stripeConfigured: Boolean(stripe),
      paypalConfigured: Boolean(paypalClientId && paypalClientSecret),
      redisConfigured: Boolean(getRedisUrl()),
      redisEnabled: isRedisEnabled(),
      nodeEnv: process.env.NODE_ENV || "development",
      uptimeMinutes: Math.round(process.uptime() / 60)
    }
  };

  try {
    const [businesses, users, bookings, cancelled] = await Promise.all([
      prisma.business.count(),
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "cancelled" } })
    ]);
    snapshot.platform = {
      businesses,
      users,
      bookings,
      cancelledBookings: cancelled,
      cancelRatePct: bookings ? Number(((cancelled / bookings) * 100).toFixed(1)) : 0
    };
  } catch {
    snapshot.health.prismaReady = false;
  }

  try {
    const businessId = await resolveManagedBusinessId(req);
    if (businessId) {
      const [business, bookings, cancelledBookings, users] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } }),
        prisma.booking.count({ where: { businessId } }),
        prisma.booking.count({ where: { businessId, status: "cancelled" } }),
        prisma.user.count({ where: { businessId } })
      ]);
      snapshot.managedBusiness = {
        selected: Boolean(businessId),
        id: businessId,
        name: business?.name || "",
        bookings,
        cancelledBookings,
        users
      };
    }
  } catch {
    snapshot.health.prismaReady = false;
  }

  return snapshot;
}

async function buildAdminCopilotResponse({ question, snapshot }) {
  const base = buildAdminCopilotHeuristicResponse(question, snapshot);
  if (!openai) return { ...base, answer: normalizeLexiReplyText(base.answer, { maxSentences: 2, maxChars: 320 }) };
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 280,
      messages: [
        {
          role: "system",
          content:
            "You are Lexi, the lead AI receptionist and operations assistant for a salon SaaS admin dashboard. You are the star front-desk assistant in this product: fast, accurate, confident, polished, and easy to talk to. You can answer broad questions like a ChatGPT-style assistant, including salon/barber/beauty/business guidance and app how-to questions, and you can also answer admin/platform/managed-business diagnostics questions using the provided sanitized snapshot. Use the snapshot only when relevant. Follow GDPR/UK GDPR and data-protection principles: data minimization, least disclosure, and purpose limitation. Do not request or reveal secrets, personal data, payment credentials, tokens, or security-sensitive details. Never share business data publicly or present internal dashboard data as public information. You may explain app features, modules, workflows, and how the platform works, but do not disclose personal user/customer/subscriber data in chat. If the question is general and not about the admin dashboard or a managed business, answer it directly and do not force diagnostics language. Return JSON with keys: answer (string), findings (array of strings), suggestedFixes (array of strings). For general questions, findings/suggestedFixes can be short practical bullets. Style rules: answer the user's question immediately in the first sentence, keep answers tight by default (usually 1-2 short sentences, maximum 4 unless they ask for detail), use plain everyday language, and ask at most one follow-up question when needed. Sound like a calm, experienced salon owner or front-desk manager who knows the business inside out. Be premium, reassuring, solution-oriented, and human. No long preambles. Avoid robotic phrasing like 'I reviewed a snapshot' unless the user explicitly asks for a report."
        },
        {
          role: "user",
          content: JSON.stringify({ question, snapshot, heuristic: base })
        }
      ]
    });
    const raw = String(completion.choices?.[0]?.message?.content || "").trim();
    const parsed = JSON.parse(raw);
    return {
      answer: normalizeLexiReplyText(String(parsed?.answer || base.answer), { maxSentences: 2, maxChars: 320 }),
      findings: Array.isArray(parsed?.findings) ? parsed.findings.slice(0, 6).map(String) : base.findings,
      suggestedFixes: Array.isArray(parsed?.suggestedFixes) ? parsed.suggestedFixes.slice(0, 6).map(String) : base.suggestedFixes
    };
  } catch {
    return { ...base, answer: normalizeLexiReplyText(base.answer, { maxSentences: 2, maxChars: 320 }) };
  }
}

function isLexiRestrictedDataRequest(question, options = {}) {
  const q = String(question || "").toLowerCase();
  if (!q) return false;
  const role = String(options.role || "public").toLowerCase();
  const isAdmin = role === "admin";
  const secretTerms = /(api key|openai key|secret key|token|access token|refresh token|jwt|password|passwd|credentials?|env file|\.env|database url|connection string|stripe secret|paypal secret)/i;
  const rawDumpTerms = /(dump|export|list|show|give me|send me|reveal|print).*(all )?(users|customers|emails|phone numbers|addresses|bookings|messages|chat logs|payment details|cards?|bank details)/i;
  const fullPiiTerms = /(all|raw|full).*(customer|user|subscriber).*(email|phone|address|password|dob|date of birth|card|bank|payment|personal data|pii)|(?:customer|user|subscriber).*(password|card|bank|payment credentials?)/i;
  const internalsTerms = /(server logs|audit logs|internal logs|raw database|db records|admin credentials|system prompt|prompt instructions)/i;
  if (secretTerms.test(q) || rawDumpTerms.test(q) || fullPiiTerms.test(q) || internalsTerms.test(q)) return true;
  if (!isAdmin) {
    const subscriberPiiTerms = /(customer|user|subscriber).*(email|phone|address|personal data|pii)/i;
    if (subscriberPiiTerms.test(q)) return true;
  }
  return false;
}

function lexiRestrictedDataReply(scopeLabel = "this chat", options = {}) {
  const role = String(options.role || "public").toLowerCase();
  if (role === "admin") {
    return `I can help with admin diagnostics and support guidance, but I can’t share secrets, credentials, raw data dumps, full personal data exports, or internal system prompts/logs in Lexi chat. Ask for summaries, trends, or an authorized support lookup instead.`;
  }
  return `I can help with general questions, salon/business guidance, and how to use the app, but I can’t share private ${scopeLabel} data, personal user/customer information, credentials, or internal system details.`;
}

function normalizeLexiReplyText(text, options = {}) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const maxSentences = Math.max(1, Number(options.maxSentences || 2));
  const maxChars = Math.max(80, Number(options.maxChars || 320));
  const sentences = raw.match(/[^.!?]+[.!?]?/g) || [raw];
  let compact = sentences
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxSentences)
    .join(" ")
    .trim();
  if (compact.length > maxChars) compact = `${compact.slice(0, maxChars - 1).trimEnd()}...`;
  return compact
    .replace(/^I reviewed (?:your|the) snapshot[, ]*/i, "")
    .replace(/^Based on (?:your|the) snapshot[, ]*/i, "")
    .trim();
}

function nextDateForWeekday(weekdayIndex, fromDate = new Date()) {
  const base = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diff = (weekdayIndex - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return base;
}

function weekdayFromText(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  const map = [
    ["sunday", 0],
    ["monday", 1],
    ["tuesday", 2],
    ["wednesday", 3],
    ["thursday", 4],
    ["friday", 5],
    ["saturday", 6]
  ];
  const hit = map.find(([name]) => q.includes(name));
  return hit ? hit[1] : null;
}

function normalizeLexiTypos(text) {
  let q = String(text || "").toLowerCase();
  const aliases = [
    ["moday", "monday"],
    ["monay", "monday"],
    ["monda", "monday"],
    ["tuseday", "tuesday"],
    ["tuesay", "tuesday"],
    ["wednsday", "wednesday"],
    ["wedesday", "wednesday"],
    ["wensday", "wednesday"],
    ["thurday", "thursday"],
    ["thrusday", "thursday"],
    ["thurdsay", "thursday"],
    ["frday", "friday"],
    ["saterday", "saturday"],
    ["satarday", "saturday"],
    ["sundey", "sunday"],
    ["tomorow", "tomorrow"],
    ["tommorow", "tomorrow"],
    ["avaiable", "available"],
    ["availble", "available"],
    ["avialable", "available"],
    ["availabilty", "availability"],
    ["slto", "slot"],
    ["sltos", "slots"],
    ["bokking", "booking"],
    ["boooking", "booking"],
    ["bookng", "booking"],
    ["appoinment", "appointment"],
    ["calender", "calendar"],
    ["dashbord", "dashboard"],
    ["deashboard", "dashboard"],
    ["subcriber", "subscriber"],
    ["recptionist", "receptionist"],
    ["renenue", "revenue"]
  ];
  for (const [wrong, correct] of aliases) {
    q = q.replaceAll(wrong, correct);
  }
  return q;
}

function extractLexiIntroducedName(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  const match = raw.match(/\b(?:i am|i'm|im|my name is)\s+([a-z][a-z'-]{1,24})\b/i);
  if (!match) return "";
  const name = String(match[1] || "").trim();
  if (!name) return "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}`;
}

function extractLexiTimeFromQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  if (!q) return "";
  const ampmMatch = q.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampmMatch) {
    const hour = Number(ampmMatch[1]);
    const minute = String(ampmMatch[2] || "00").padStart(2, "0");
    return `${hour}:${minute}${ampmMatch[3]}`;
  }
  const twentyFourMatch = q.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourMatch) {
    return `${twentyFourMatch[1]}:${twentyFourMatch[2]}`;
  }
  return "";
}

function isLexiAppQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  if (!q) return false;
  return /(app|lexi|dashboard|signup|sign up|register|login|log in|\bbook\b|booking|bookings|appointment|calendar|diary|waitlist|module|modules|subscriber|customer|admin|receptionist|front desk|feature|features|demo mode|notifications?|confirm|confirmation|gdpr|privacy|data protection|billing|plan|subscription|how .*work|what can .*do|find .*salon|find .*barber|find .*beauty|search .*salon|search .*barber|search .*beauty|subscribed businesses?)/.test(q);
}

function isLexiPublicAvailabilityQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  return /(available|availability|slots?|space)/.test(q) && /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2}|\bnext\b)/.test(q);
}

function isLexiSalonBeautyQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  return /(hair|salon|barber|barbershop|beauty|facial|nails?|lash|lashes|brow|brows|fade|beard|blowout|silk press|keratin|brazilian blowout|perm|relaxer|extensions?|balayage|ombre|highlight|color correction|root touch|toner|scalp|deep conditioning|bridal|updo|waxing|makeup|aftercare|shampoo|conditioner|heat protectant|serum|pomade|clay|mousse|gel|texture spray)/.test(q);
}

function formatCurrencyGBP(amount) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(amount || 0));
}

function resolveLexiDateKeyFromQuestion(question, now = new Date()) {
  const q = normalizeLexiTypos(String(question || "").toLowerCase());
  if (/\btomorrow\b/.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (/\btoday\b/.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString().slice(0, 10);
  }
  const explicit = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (explicit) return explicit[1];
  const natural = q.match(/\b(?:(mon|monday|tue|tues|tuesday|wed|weds|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(\d{4}))?\b/);
  if (natural) {
    const dayNum = Number(natural[2]);
    const monthToken = String(natural[3] || "").slice(0, 3);
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const monthIndex = monthMap[monthToken];
    if (Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 31 && Number.isInteger(monthIndex)) {
      let year = Number(natural[4] || new Date(now).getFullYear());
      let candidate = new Date(year, monthIndex, dayNum);
      if (Number.isNaN(candidate.getTime()) || candidate.getMonth() !== monthIndex || candidate.getDate() !== dayNum) {
        candidate = null;
      }
      if (candidate && !natural[4]) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (candidate < today) {
          candidate = new Date(year + 1, monthIndex, dayNum);
        }
      }
      if (candidate && !Number.isNaN(candidate.getTime())) {
        return candidate.toISOString().slice(0, 10);
      }
    }
  }
  const weekday = weekdayFromText(q);
  if (weekday !== null) return nextDateForWeekday(weekday, now).toISOString().slice(0, 10);
  return "";
}

function isPublicSubscriptionStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return ["active", "trialing", "trial", "past_due"].includes(normalized);
}

function mapPublicBusinessProfile(business) {
  if (!business) return null;
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    city: business.city,
    country: business.country,
    postcode: business.postcode,
    address: business.address,
    rating: Number(business.rating || 0),
    description: business.description || "",
    phone: business.phone || "",
    email: business.email || "",
    websiteUrl: business.websiteUrl || null,
    websiteTitle: business.websiteTitle || null,
    websiteSummary: business.websiteSummary || null,
    hours: parseHours(business.hoursJson),
    services: Array.isArray(business.services)
      ? business.services.map((s) => ({ name: s.name, durationMin: Number(s.durationMin || 0), price: Number(s.price || 0) }))
      : []
  };
}

async function searchPublicSubscribedBusinesses({ query = "", location = "", service = "", businessType = "", limit = 5 } = {}) {
  const q = String(query || "").trim();
  const loc = String(location || "").trim();
  const svc = String(service || "").trim();
  const type = String(businessType || "").trim();
  const take = Math.min(10, Math.max(1, Number(limit || 5)));
  const andFilters = [];
  if (q) {
    andFilters.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    });
  }
  if (loc) {
    andFilters.push({
      OR: [
        { city: { contains: loc, mode: "insensitive" } },
        { country: { contains: loc, mode: "insensitive" } },
        { postcode: { contains: loc, mode: "insensitive" } }
      ]
    });
  }
  if (type) {
    andFilters.push({ type: { in: businessTypeSearchValues(type) } });
  }
  if (svc) {
    andFilters.push({
      services: { some: { name: { contains: svc, mode: "insensitive" } } }
    });
  }

  const rows = await prisma.business.findMany({
    where: {
      AND: andFilters,
      subscription: {
        is: {
          status: { in: ["active", "trialing", "trial", "past_due"] }
        }
      }
    },
    include: {
      services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] },
      subscription: true
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take
  });
  return rows.map(mapPublicBusinessProfile);
}

async function buildPublicLexiFallbackReply(message, business, history = []) {
  const q = String(message || "").trim();
  const qLower = normalizeLexiTypos(q.toLowerCase());
  const bizName = String(business?.name || "the salon").trim() || "the salon";
  const services = Array.isArray(business?.services) ? business.services.slice(0, 6) : [];
  const serviceNames = services.map((s) => String(s?.name || "").trim()).filter(Boolean);
  const serviceExamples = serviceNames.length ? serviceNames.slice(0, 4).join(", ") : "haircuts, colour, barber services, and beauty treatments";
  const safeHistory = Array.isArray(history) ? history : [];
  const priorMessages = safeHistory
    .filter((entry) => entry && typeof entry.content === "string" && (entry.role === "user" || entry.role === "assistant"))
    .slice(-8);
  const lastAssistantText = String([...priorMessages].reverse().find((entry) => entry.role === "assistant")?.content || "");
  const recentUserText = priorMessages
    .filter((entry) => entry.role === "user")
    .slice(-4)
    .map((entry) => String(entry.content || ""))
    .join(" ");
  const introducedName = extractLexiIntroducedName(q);
  const currentDateKey = resolveLexiDateKeyFromQuestion(qLower);
  const currentTimeHint = extractLexiTimeFromQuestion(qLower);
  const recentDateKey = currentDateKey || resolveLexiDateKeyFromQuestion(recentUserText);
  const recentTimeHint = currentTimeHint || extractLexiTimeFromQuestion(recentUserText);

  if (!introducedName && /^(hi|hello|hey|hiya|hey lexi|hi lexi)\b/.test(qLower)) {
    return "Hi, I'm Lexi. Lovely to hear from you. How can I help today?";
  }
  if (false && !q) {
    return "Hi, I'm Lexi. I can answer questions about the app, how bookings work, what each dashboard/module does, and how to use Lexi. I can't share personal data.";
  }
  if (false && /^(hi|hello|hey|hiya|hey lexi|hi lexi)\b/.test(qLower)) {
    return "Hi, I'm Lexi. I can explain this app's features, bookings flow, dashboards, and how Lexi helps your business. I can't share personal data or private account information. What would you like to know?";
  }

  if (!q) {
    return "Hi, I'm Lexi. How can I help today?";
  }
  if (!introducedName && /^(hi|hello|hey|hiya|hey lexi|hi lexi)\b/.test(qLower)) {
    return "Hi, I'm Lexi. How can I help today?";
  }
  if (introducedName) {
    const displayName = introducedName.charAt(0).toUpperCase() + introducedName.slice(1);
    return `Hi ${displayName}, lovely to meet you. How can I help today?`;
  }
  const shortReplyWordCount = q.split(/\s+/).filter(Boolean).length;
  if (shortReplyWordCount > 0 && shortReplyWordCount <= 6 && lastAssistantText) {
    const lastAssistantLower = normalizeLexiTypos(lastAssistantText.toLowerCase());
    if (/(which one|which business|tell me which one|what business)/.test(lastAssistantLower)) {
      return `Perfect, ${q} sounds good. What day or date would you like? I’ll check the available slots for you.`;
    }
    if (/(what service|which service can i book|what service would you like)/.test(lastAssistantLower)) {
      if (recentTimeHint && !recentDateKey) {
        return `Great, ${recentTimeHint} sounds good. What day or date would you like?`;
      }
      if (recentDateKey && !recentTimeHint) {
        return "Great, and what time would suit you best?";
      }
      if (recentDateKey && recentTimeHint) {
        return `Perfect. I’ve got ${recentTimeHint} on ${formatDisplayDateGb(recentDateKey, { day: "2-digit", month: "2-digit", year: "numeric" })}. What service would you like to book?`;
      }
      return "Great choice. What day or date would you like, and roughly what time suits you best?";
    }
    if (/(what day|which day|what date|tell me the day|tell me the date)/.test(lastAssistantLower)) {
      if (currentDateKey && recentTimeHint) {
        const labelDate = formatDisplayDateWithWeekdayGb(currentDateKey);
        return `Perfect, ${labelDate} at ${recentTimeHint}. What service would you like to book?`;
      }
      return "Perfect. What time would suit you best? I’ll check the best options for you.";
    }
    if (/(what time|which time|what time suits you best|tell me the time)/.test(lastAssistantLower)) {
      if (recentTimeHint && recentDateKey) {
        const labelDate = formatDisplayDateWithWeekdayGb(recentDateKey);
        return `Perfect, ${labelDate} at ${recentTimeHint}. What service would you like to book?`;
      }
    }
  }
  if (business?.id && shortReplyWordCount > 0 && shortReplyWordCount <= 6 && /(\bbest\b|\bthat\b|\byes\b|\byeah\b|\bok\b|\bokay\b|\bsure\b|\bworks\b|\bnorth\b|\bsouth\b|\beast\b|\bwest\b)/.test(qLower)) {
    return `Perfect, ${bizName} sounds great. What service would you like, and what day and time would suit you best?`;
  }
  if (!isLexiAppQuestion(qLower) && !isLexiPublicAvailabilityQuestion(qLower) && !isLexiSalonBeautyQuestion(qLower) && !/(today'?s date|what day is it|what('s| is)?\s+the\s+date|what('s| is)?\s+the\s+time|current time|time is it)/i.test(qLower)) {
    return "Ask me anything public-facing about salons, services, bookings, or how the app works. I just can't share private or personal data in chat.";
  }
  if (/(find|search|show).*(salon|barber|barbershop|beauty)/.test(qLower)) {
    const locationMatch = q.match(/\b(?:in|near)\s+([a-zA-Z\s'-]{2,40})$/i);
    const location = locationMatch ? String(locationMatch[1] || "").trim() : "";
    const typeMatch = qLower.includes("barber")
      ? "barber"
      : qLower.includes("beauty")
        ? "beauty"
        : "salon";
    const results = await searchPublicSubscribedBusinesses({ location, businessType: typeMatch, limit: 5 });
    if (!results.length) {
      return `I couldn't find any subscribed ${typeMatch} businesses${location ? ` near ${location}` : ""} right now. Try another area, or tell me the service you want and I'll search that way.`;
    }
    const lines = results.slice(0, 4).map((b) => `${b.name} (${b.city})${b.services?.length ? ` - services include ${b.services.slice(0, 2).map((s) => s.name).join(", ")}` : ""}`);
    return `I found ${results.length} subscribed ${typeMatch} business${results.length === 1 ? "" : "es"}${location ? ` near ${location}` : ""}: ${lines.join(" | ")}. Tell me which one you'd like, and I'll check availability.`;
  }
  if (/(show|tell me|give me).*(info|information|details).*(for|about)\s+/.test(qLower) || /(about)\s+[a-z0-9\s'&-]+$/.test(qLower)) {
    const aboutMatch = q.match(/(?:for|about)\s+([a-z0-9\s'&.-]{2,60})$/i);
    const targetName = String(aboutMatch?.[1] || "").trim();
    if (targetName) {
      const matches = await searchPublicSubscribedBusinesses({ query: targetName, limit: 3 });
      const exact = matches.find((b) => String(b.name || "").toLowerCase() === targetName.toLowerCase()) || matches[0];
      if (exact) {
        const servicePreview = (exact.services || []).slice(0, 4).map((s) => s.name).join(", ");
        return `${exact.name} is a subscribed ${exact.type} business in ${exact.city}. ${exact.description || ""}${servicePreview ? ` Services include ${servicePreview}.` : ""} ${exact.phone ? `Phone: ${exact.phone}.` : ""}${exact.websiteUrl ? ` Website: ${exact.websiteUrl}.` : ""} Ask me to check available slots if you'd like to book.`;
      }
    }
  }
  if (/\bbook\b/.test(qLower) && /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})\b/.test(qLower)) {
    let targetBusiness = business;
    const atMatch = q.match(/\bat\s+([a-z0-9\s'&.-]{2,50})/i);
    const requestedName = String(atMatch?.[1] || "").trim();
    if (requestedName) {
      const found = await prisma.business.findFirst({
        where: {
          name: { contains: requestedName, mode: "insensitive" },
          subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
        },
        include: { services: true, subscription: true },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
      });
      if (found) targetBusiness = found;
    }
    if (!targetBusiness?.id) {
      return "Tell me the salon, barber, or beauty business name and I'll check the best slots for the day you want.";
    }
    const dateKey = resolveLexiDateKeyFromQuestion(qLower);
    if (!dateKey) {
      return `I can help you book at ${targetBusiness.name}. Tell me the day or date you want (for example tomorrow, Monday, or 2026-02-24) and I'll check slots.`;
    }
    const slots = await getAvailableSlotsForBusiness(targetBusiness, 14);
    const filtered = slots.filter((slot) => String(slot).startsWith(dateKey)).slice(0, 8);
    const labelDate = formatDisplayDateWithWeekdayGb(dateKey);
    const filteredDisplay = filtered.map(formatLexiSlotLabelForDisplay);
    if (!filtered.length) {
      return `I can’t see any available slots for ${targetBusiness.name} on ${labelDate}. If you want, I can check another day or help you find another subscribed business.`;
    }
    return `Yes, you can book at ${targetBusiness.name} on ${labelDate}. Available slots I can see are: ${filteredDisplay.join(", ")}. Tell me your service and preferred time, and I can help you book it.`;
  }
  if (/(are there|any|do you have).*(booking|bookings).*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\bbookings?\s+for\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(qLower)) {
    const weekday = weekdayFromText(qLower);
    if (weekday !== null && business?.id) {
      const target = nextDateForWeekday(weekday);
      const dateKey = target.toISOString().slice(0, 10);
      const rows = await prisma.booking.findMany({
        where: { businessId: business.id, date: dateKey },
        select: { status: true, time: true, service: true },
        orderBy: { time: "asc" }
      });
      const active = rows.filter((r) => String(r.status || "").toLowerCase() !== "cancelled");
      const cancelled = rows.length - active.length;
      const label = formatDisplayDateWithWeekdayGb(dateKey);
      if (!rows.length) {
        return `I can’t see any bookings for ${bizName} on ${label} yet. If you want, I can help you check availability or suggest a good time to book.`;
      }
      const preview = active.slice(0, 3).map((r) => `${String(r.time || "").slice(0, 5)} ${r.service || "appointment"}`).filter(Boolean).join(", ");
      return `Yes, ${bizName} has ${rows.length} booking${rows.length === 1 ? "" : "s"} on ${label}${cancelled ? ` (${cancelled} cancelled)` : ""}. ${preview ? `The first bookings I can see are: ${preview}.` : ""}`;
    }
  }
  if (/(available|availability|slots?|space).*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\b(slots?|space)\s+for\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(qLower)) {
    const weekday = weekdayFromText(qLower);
    if (weekday !== null && business?.id) {
      const target = nextDateForWeekday(weekday);
      const dateKey = target.toISOString().slice(0, 10);
      const slots = await getAvailableSlotsForBusiness(business, 14);
      const filtered = slots.filter((slot) => String(slot).startsWith(dateKey)).slice(0, 8);
      const label = formatDisplayDateWithWeekdayGb(dateKey);
      const filteredDisplay = filtered.map(formatLexiSlotLabelForDisplay);
      if (!filtered.length) {
        return `I can’t see any available slots for ${bizName} on ${label} right now. If you want, I can check another day.`;
      }
      return `Yes, there are available slots for ${bizName} on ${label}. Here are some times: ${filteredDisplay.join(", ")}.`;
    }
  }
  if (/(today'?s|today).*(revenue|renenue|takings|sales)|\b(revenue|renenue|takings|sales)\b.*\btoday\b/.test(qLower)) {
    if (business?.id) {
      const todayKey = new Date().toISOString().slice(0, 10);
      const rows = await prisma.booking.findMany({
        where: { businessId: business.id, date: todayKey },
        select: { status: true, price: true, service: true }
      });
      const completedOrConfirmed = rows.filter((r) => {
        const status = String(r.status || "").toLowerCase();
        return status === "confirmed" || status === "completed";
      });
      const cancelled = rows.filter((r) => String(r.status || "").toLowerCase() === "cancelled").length;
      const revenue = completedOrConfirmed.reduce((sum, row) => sum + Number(row.price || 0), 0);
      if (!rows.length) {
        return `I can’t see any bookings for ${bizName} today yet, so there’s no booking revenue recorded for today right now.`;
      }
      return `For ${bizName} today, I can see ${rows.length} booking${rows.length === 1 ? "" : "s"}${cancelled ? ` (${cancelled} cancelled)` : ""} and an estimated booking revenue of ${formatCurrencyGBP(revenue)} from confirmed/completed appointments.`;
    }
    return "I can help with today’s revenue/takings, but I need a business context to check booking-based revenue.";
  }
  if (/(book|booking|appointment|slot|availability|available time|what time)/.test(qLower)) {
    return `Lovely. What service would you like at ${bizName}, and what day and time would suit you best? Once I have that, I'll check the best options for you.`;
  }
  if (/(service|services|do you do|what do you offer|treatment)/.test(qLower)) {
    return `${bizName} offers services like ${serviceExamples}. Tell me the result you're after and I'll point you to the best option.`;
  }
  if (/(price|cost|how much|pricing)/.test(qLower)) {
    return "Prices can vary depending on the service, hair length or density, and the time needed, so I won't guess if exact pricing isn't listed. Tell me what you're considering and I'll explain what usually affects the price.";
  }
  if (/(policy|deposit|late|cancellation|cancelation|no show|no-show|grace period)/.test(qLower)) {
    return "Most salons have policies around deposits, late arrivals, cancellations, and no-shows. Tell me which one you want to check and I'll walk you through it clearly.";
  }
  if (/(don'?t know what i want|not sure what i want|unsure what i want|recommend.*service|what should i get)/.test(qLower)) {
    return "Let's narrow it down. Tell me your goal, how much upkeep you want, and any recent colour or chemical history, and I'll suggest a few strong options.";
  }
  if (/(open|opening hours|hours|closing time|when are you open)/.test(qLower)) {
    return `I can help with opening-hours questions for ${bizName} if the business profile includes them. If you don’t see the hours listed yet, I can still help you plan the best day/time to book.`;
  }
  if (/(shampoo|conditioner|product|aftercare|hair mask|styling product|sulfate|ingredients)/.test(qLower)) {
    return "Yes, I can help with product and aftercare questions. Tell me your hair type (for example curly, fine, colour-treated, dry, oily scalp) and what you’re trying to improve, and I’ll give practical guidance.";
  }
  if (/(skin|allergy|reaction|medical|rash|infection|burn)/.test(qLower)) {
    return "I can give general beauty and aftercare guidance, but I can’t give medical advice. If you describe the treatment type and what happened, I can suggest safe next steps and when to contact a qualified professional.";
  }
  if (/(how does this app work|how to use|dashboard|lexi|subscriber|customer|admin|what can this app do|app features|how does lexi work)/.test(qLower)) {
    return "Lexi handles booking support, salon questions, and front-desk guidance, while the app gives different tools to customers, subscribers, and admins. If you want, tell me which part you want explained and I'll keep it simple.";
  }
  if (/(weather|forecast|temperature)/.test(qLower)) {
    return "I don’t have live weather lookup in free fallback mode, but if you tell me your city, I can suggest how weather usually affects walk-ins, cancellations, and demand planning for salons and barbershops.";
  }

  return "Tell me what you need, and I'll keep it simple. If you're booking, just send the service, date, and time you want.";
}

async function buildPublicLexiFallbackReplySafe(message, business, history = []) {
  try {
    return normalizeLexiReplyText(await buildPublicLexiFallbackReply(message, business, history), { maxSentences: 2, maxChars: 320 });
  } catch (error) {
    console.error("Lexi fallback reply error:", error?.message || error);
    return "I can still help. I hit a temporary issue just now, so ask again or tell me the service and date you want.";
  }
}

function buildPublicLexiSystemPrompt(business) {
  const businessName = String(business?.name || "this salon").trim() || "this salon";
  return `You are Ask Lexi, the elite AI Salon Manager, Beauty Consultant, and Booking Manager for ${businessName}.

Identity:
- You represent a premium hair salon, barbershop, and beauty clinic experience.
- You are warm, confident, knowledgeable, highly efficient, and commercially aware.
- You behave like an exceptional front-desk manager with over 10 years of salon and beauty experience.

Core objectives:
- greet customers professionally
- understand what service or result they want
- answer salon, barber, beauty, and booking questions clearly
- answer questions about hair salons, barbershops, beauty salons, and specific treatments with practical confidence
- guide customers toward the best treatment for their needs
- check live availability using tools
- offer 2-3 suitable appointment times
- collect booking details required to complete a booking
- confirm appointments clearly only after tool success
- handle rescheduling, cancellations, and policy questions calmly
- suggest relevant add-ons or aftercare only when genuinely helpful

Expertise:
- women's cuts and styling
- men's cuts, fades, beard work
- balayage, ombre, highlights, root work, toner, colour correction
- keratin, smoothing, blow dries, extensions, bridal styling
- brows, lashes, waxing, facials, beauty treatments
- beauty treatment suitability, timing, maintenance, and aftercare
- face shapes, haircut suitability, maintenance expectations
- hair textures and curl patterns from 1A to 4C
- aftercare and premium salon product guidance

Consultation rules:
- Ask clarifying questions before recommending when information is missing.
- Never guess on services, prices, timing, suitability, or availability.
- Keep replies concise by default and sound natural, premium, and human.
- Take control of the booking flow without overwhelming the customer.
- Answer the user's actual question first, then guide the next step.
- Avoid robotic wording and avoid saying "I think" or "maybe" unless real uncertainty exists.
- Write like a real receptionist speaking to one customer, not like a help centre article.
- Use contractions naturally when they fit.
- Prefer warm, specific phrasing over generic assistant language.
- Vary sentence openings so replies do not sound templated.
- If the customer is casual, match that warmth while staying polished.
- On simple questions, sound effortless and direct rather than overly structured.

Booking flow protocol:
- confirm the service first
- confirm preferred stylist only if relevant
- confirm preferred day/date
- check availability with tools
- offer 2-3 suitable slots
- collect full name and phone as required, and email if useful
- repeat the appointment details clearly
- confirm the booking only after create_booking succeeds
- if the requested time is unavailable, offer the closest strong alternatives and stay positive

Upselling logic:
- upsells must feel helpful, not pushy
- suggest useful add-ons like toner with highlights, bond repair with lightening, deep conditioning with a cut, beard treatment with barber services, or brow tint with brow wax
- only suggest an add-on when it clearly improves the result, maintenance, or service outcome

Edge-case handling:
- if the customer is unhappy, respond with empathy and offer a practical next step
- if they ask price, use profile or tool-backed pricing only; if exact pricing is unavailable, explain what affects the final price
- if they are unsure, guide them with smart consultation questions
- if they want to cancel or reschedule, explain the next step and any applicable policy
- if they ask broader salon, barber, beauty, or treatment questions that do not require private data, answer them directly instead of forcing the chat back to booking

Hard constraints:
- this public Lexi chat may use public business information, open availability, and booking tools only
- never invent unavailable services, prices, times, staff, policies, or booking outcomes
- use search_public_businesses when the customer needs a business search
- use get_business_public_profile when the customer asks about a specific business
- use check_available_slots when the customer asks for live times
- use create_booking only when required details are complete
- never confirm a booking before tool success
- never reveal personal customer data, protected business data, payment credentials, secrets, or internal system details
- follow GDPR/UK GDPR principles: data minimization, least disclosure, and purpose limitation
- avoid medical claims; for medical or allergy-risk issues, give safe general guidance and suggest a qualified professional when appropriate

Voice and tone:
- speak naturally in short clear sentences
- sound like a polished salon receptionist and beauty consultant
- be confident and decisive without sounding robotic or pushy
- no long preambles and no generic capability dump on simple greetings
- avoid phrases like "I can help with", "absolutely", "certainly", or "please type your question" unless they genuinely fit
- when suggesting the next step, make it feel like a natural continuation of the conversation`;
}

function buildSubscriberCopilotHeuristicResponse(question, snapshot) {
  const q = String(question || "").trim();
  const qLower = normalizeLexiTypos(q.toLowerCase());
  const business = snapshot?.business || {};
  const bookings = snapshot?.bookings || {};
  const findings = [];
  const suggestedActions = [];
  const cancelRate = Number(bookings.cancelRatePct || 0);
  const upcoming7d = Number(bookings.upcoming7d || 0);
  const total = Number(bookings.total || 0);

  if (!business.id) {
    return {
      answer: "Subscriber Copilot could not detect a business context for this session.",
      findings: ["No business scope is available for the current subscriber session."],
      suggestedActions: ["Sign in again or contact support if your subscriber account is not linked to a business."]
    };
  }
  const looksGeneral = /weather|forecast|temperature|news|trend|marketing idea|product|ingredients|aftercare|shampoo|conditioner|hair type|skin care|beauty advice|how does this app work|how to use/i.test(qLower);
  const looksBusinessSpecific = /booking|calendar|diary|staff|capacity|waitlist|cancel|revenue|finance|crm|retention|dashboard|business/i.test(qLower);
  if (looksGeneral && !looksBusinessSpecific) {
    return {
      answer: /weather|forecast|temperature/i.test(qLower)
        ? "I can help with salon and business planning, but I don’t have live weather lookup in fallback mode. If you tell me your city, I can still suggest how weather usually affects bookings, walk-ins, and cancellation patterns."
        : "Yes, I can help with that. Ask me your salon, barber, beauty, product, aftercare, or app-use question and I’ll answer in plain language. I can also use your business dashboard context when you want business-specific advice.",
      findings: [
        `Business context is available for ${business.name || "your business"} if you want advice tailored to your salon.`,
        "Protected customer and business data is not shared in Lexi chat."
      ],
      suggestedActions: [
        "Ask your question directly in plain language.",
        "If you want business-specific advice, mention the module or issue (for example bookings, cancellations, staff cover, or growth)."
      ]
    };
  }

  if (total === 0) {
    findings.push("No bookings are currently recorded for this business.");
    suggestedActions.push("Review front-desk profile, services, and booking flow; then test a booking end-to-end from the customer side.");
  }
  if (cancelRate >= 12) {
    findings.push(`Cancellation rate is elevated at ${cancelRate.toFixed(1)}%.`);
    suggestedActions.push("Prioritize reminder timing, waitlist backfill, and same-day recovery offers to reduce lost slots.");
  }
  if (upcoming7d <= 5 && total > 0) {
    findings.push(`Upcoming 7-day booking volume is light (${upcoming7d} bookings).`);
    suggestedActions.push("Run a short rebooking campaign for recent customers and promote off-peak slots.");
  }
  if (!findings.length) {
    findings.push("Booking and operations snapshot looks stable based on current sanitized metrics.");
    suggestedActions.push("Focus on repeat-booking prompts, upsells, and reducing operational friction during peak windows.");
  }

  if (/waitlist|cancel/i.test(q) && cancelRate < 5) {
    findings.push("Cancellation pressure appears relatively controlled in the current snapshot.");
    suggestedActions.push("Keep waitlist workflows active so last-minute gaps are still recoverable during busy periods.");
  }
  if (/staff|capacity/i.test(q)) {
    suggestedActions.push("Use the calendar + booking operations filters to compare peak booking days against roster coverage.");
  }

  const topicLabel =
    /staff|capacity|rota|cover/.test(qLower) ? "staffing and capacity" :
    /waitlist|cancel|gap|backfill/.test(qLower) ? "cancellations and waitlist recovery" :
    /revenue|takings|money|cash|profit|finance/.test(qLower) ? "revenue and finance signals" :
    /calendar|diary|week|month|day|slot/.test(qLower) ? "calendar and booking load" :
    /review|referral|campaign|crm|retention|growth|social/.test(qLower) ? "growth and retention opportunities" :
    "business operations";
  const leadFinding = findings[0] || "Current booking and operations signals were reviewed.";
  const leadAction = suggestedActions[0] || "Open the relevant module and work through the highest-impact action first.";

  return {
    answer: `I checked ${topicLabel} for ${business.name || "your business"}. The main thing I can see is: ${leadFinding} Best next step: ${leadAction}`,
    findings: findings.slice(0, 6),
    suggestedActions: suggestedActions.slice(0, 6)
  };
}

async function buildSubscriberCopilotSnapshot(req) {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) {
    return {
      business: { id: null, name: "", type: "" },
      bookings: { total: 0, cancelled: 0, confirmed: 0, completed: 0, upcoming7d: 0, cancelRatePct: 0 },
      health: {
        openaiConfigured: Boolean(openai),
        accountingSignalsAvailable: Boolean(stripe || paypalClientId)
      }
    };
  }

  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  const fromKey = from.toISOString().slice(0, 10);
  const toKey = to.toISOString().slice(0, 10);

  const [business, total, cancelled, confirmed, completed, upcoming7d] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true, type: true } }),
    prisma.booking.count({ where: { businessId } }),
    prisma.booking.count({ where: { businessId, status: "cancelled" } }),
    prisma.booking.count({ where: { businessId, status: "confirmed" } }),
    prisma.booking.count({ where: { businessId, status: "completed" } }),
    prisma.booking.count({ where: { businessId, date: { gte: fromKey, lte: toKey }, status: "confirmed" } })
  ]);

  return {
    business: {
      id: business?.id || businessId,
      name: business?.name || "",
      type: business?.type || ""
    },
    bookings: {
      total,
      cancelled,
      confirmed,
      completed,
      upcoming7d,
      cancelRatePct: total ? Number(((cancelled / total) * 100).toFixed(1)) : 0
    },
    health: {
      openaiConfigured: Boolean(openai),
      accountingSignalsAvailable: Boolean(stripe || paypalClientId)
    }
  };
}

async function buildSubscriberCopilotResponse({ question, snapshot }) {
  const base = buildSubscriberCopilotHeuristicResponse(question, snapshot);
  if (!openai) return { ...base, answer: normalizeLexiReplyText(base.answer, { maxSentences: 2, maxChars: 320 }) };
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 280,
      messages: [
        {
          role: "system",
          content:
            "You are Lexi, the lead AI receptionist and business copilot for a salon SaaS dashboard. You are the star front-desk assistant in this product: fast, accurate, confident, polished, and natural. You can answer broad questions like a ChatGPT-style assistant, including hair salon, barbershop, beauty salon, treatment, operations, pricing, staffing, cancellation, finance, and app how-to questions, and you can also answer subscriber business/dashboard questions using the provided sanitized snapshot. Use the snapshot only when it is relevant to the user's question. Follow GDPR/UK GDPR and data-protection principles: data minimization, least disclosure, and purpose limitation. Do not reveal personal customer data, payment credentials, auth/security secrets, or platform-internal sensitive details. Never share subscriber business data publicly or treat internal dashboard data as public information. You may explain app features, modules, workflows, booking logic, and how Lexi works, but do not disclose personal data in chat. If the question is general and not about the subscriber's business, answer it directly and do not force dashboard analysis. Return JSON with keys: answer (string), findings (array of strings), suggestedActions (array of strings). For general questions, findings/suggestedActions can still be short practical bullets. Style rules: answer first, keep it concise by default (usually 1-2 short sentences, maximum 4 unless asked for depth), sound like a premium receptionist and experienced salon owner/operator (not a report engine), and ask at most one follow-up question when needed. Use clear everyday language. No long preambles. Do not repeat capability lists in simple greetings. Be strong on pricing, policy, staffing, revenue, and operational guidance when relevant, and suggest tasteful upsells only when clearly relevant. Avoid robotic phrases like 'I reviewed your snapshot' unless the user asks for an analysis/report."
        },
        {
          role: "user",
          content: JSON.stringify({ question, snapshot, heuristic: base })
        }
      ]
    });
    const raw = String(completion.choices?.[0]?.message?.content || "").trim();
    const parsed = JSON.parse(raw);
    return {
      answer: normalizeLexiReplyText(String(parsed?.answer || base.answer), { maxSentences: 2, maxChars: 320 }),
      findings: Array.isArray(parsed?.findings) ? parsed.findings.slice(0, 6).map(String) : base.findings,
      suggestedActions: Array.isArray(parsed?.suggestedActions) ? parsed.suggestedActions.slice(0, 6).map(String) : base.suggestedActions
    };
  } catch {
    return { ...base, answer: normalizeLexiReplyText(base.answer, { maxSentences: 2, maxChars: 320 }) };
  }
}

app.post("/api/copilot/subscriber", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const question = String(req.body?.question || "").trim();
  if (!question) return res.status(400).json({ error: "Question is required." });
  if (question.length > 1200) return res.status(400).json({ error: "Question is too long." });
  if (isLexiRestrictedDataRequest(question, { role: "subscriber" })) {
    return res.json({
      answer: lexiRestrictedDataReply("subscriber dashboard", { role: "subscriber" }),
      findings: ["Private customer/user/business data and secrets are protected."],
      suggestedActions: [
        "Ask for a summary, guidance, or operational recommendation instead of raw personal data.",
        "Use role-based dashboard tools for authorized work without exposing protected data."
      ],
      snapshot: null
    });
  }
  try {
    const snapshot = await buildSubscriberCopilotSnapshot(req);
    if (!snapshot?.business?.id) {
      return res.status(400).json({ error: "No business scope available for subscriber copilot." });
    }
    const copilot = await buildSubscriberCopilotResponse({ question, snapshot });
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "subscriber.copilot_query",
      entityType: "system",
      metadata: {
        questionLength: question.length,
        businessId: snapshot.business.id
      }
    });
    return res.json({
      answer: copilot.answer,
      findings: copilot.findings,
      suggestedActions: copilot.suggestedActions,
      snapshot
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Subscriber copilot unavailable." });
  }
});

app.post("/api/admin/copilot", authRequired, requireRole("admin"), async (req, res) => {
  const question = String(req.body?.question || "").trim();
  if (!question) return res.status(400).json({ error: "Question is required." });
  if (question.length > 1200) return res.status(400).json({ error: "Question is too long." });
  if (isLexiRestrictedDataRequest(question, { role: "admin" })) {
    return res.json({
      answer: lexiRestrictedDataReply("admin/platform", { role: "admin" }),
      findings: ["Protected data, credentials, and internal system details are not disclosed in Lexi chat."],
      suggestedFixes: [
        "Ask for diagnostics summaries, trends, or recommended actions instead of raw protected data.",
        "Use approved admin tools and role-based access workflows for authorized support tasks."
      ],
      snapshot: null
    });
  }

  try {
    const snapshot = await buildAdminCopilotSnapshot(req);
    const copilot = await buildAdminCopilotResponse({ question, snapshot });
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "admin.copilot_query",
      entityType: "system",
      metadata: {
        questionLength: question.length,
        hasManagedBusinessScope: Boolean(snapshot?.managedBusiness?.selected)
      }
    });
    return res.json({
      answer: copilot.answer,
      findings: copilot.findings,
      suggestedFixes: copilot.suggestedFixes,
      snapshot
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Admin copilot unavailable." });
  }
});

app.get("/api/dashboard/subscriber", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const bookings = await prisma.booking.findMany({ where: { businessId } });
  const revenue = bookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const next7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  const normalized = bookings
    .map((booking) => {
      const dateTime = normalizeBookingDateTime(booking.date, booking.time);
      if (!dateTime) return null;
      const startsAt = new Date(`${dateTime.date}T${dateTime.time}:00`);
      if (Number.isNaN(startsAt.getTime())) return null;
      return {
        ...booking,
        normalizedDate: dateTime.date,
        startsAt
      };
    })
    .filter(Boolean);

  const todayBookings = normalized.filter((b) => b.normalizedDate === today);
  const todayConfirmed = todayBookings.filter((b) => b.status === "confirmed");
  const lateCancellations = normalized.filter((b) => {
    if (b.status !== "cancelled") return false;
    return b.startsAt >= todayStart && b.startsAt < tomorrowStart;
  });

  const next7Confirmed = normalized.filter((b) => {
    if (b.status !== "confirmed") return false;
    return b.startsAt >= todayStart && b.startsAt < next7Days;
  });

  const noShowRate = bookings.length
    ? Number(((bookings.filter((b) => b.status === "cancelled").length / bookings.length) * 100).toFixed(1))
    : 0;

  const recommendedActions = [];
  if (lateCancellations.length > 0) {
    recommendedActions.push({
      id: "fill-cancellations",
      label: "Fill cancellation gaps",
      detail: `${lateCancellations.length} last-minute cancellation${lateCancellations.length === 1 ? "" : "s"} today.`
    });
  }
  if (todayConfirmed.length < 3) {
    recommendedActions.push({
      id: "boost-today-demand",
      label: "Boost today's demand",
      detail: "Low confirmed bookings today. Send a same-day offer to recent clients."
    });
  }
  if (noShowRate >= 10) {
    recommendedActions.push({
      id: "tighten-confirmations",
      label: "Tighten confirmations",
      detail: `No-show/cancelled rate is ${noShowRate}%. Enable reminder cadence and deposit prompts.`
    });
  }
  if (!recommendedActions.length) {
    recommendedActions.push({
      id: "maintain-momentum",
      label: "Maintain momentum",
      detail: "Today looks healthy. Focus on upsells and rebooking at checkout."
    });
  }

  const nowMs = now.getTime();
  const customerKeyFor = (booking) => {
    const email = String(booking.customerEmail || "").trim().toLowerCase();
    const phone = String(booking.customerPhone || "").trim();
    if (email) return `email:${email}`;
    if (phone) return `phone:${phone}`;
    return `name:${String(booking.customerName || "guest").trim().toLowerCase()}`;
  };

  const noShowRisk = normalized
    .filter((booking) => booking.status === "confirmed" && booking.startsAt.getTime() > nowMs)
    .map((booking) => {
      const history = normalized.filter(
        (candidate) =>
          customerKeyFor(candidate) === customerKeyFor(booking) && candidate.startsAt.getTime() < booking.startsAt.getTime()
      );
      const historyCount = history.length;
      const cancelledCount = history.filter((candidate) => candidate.status === "cancelled").length;
      const cancellationRate = historyCount ? cancelledCount / historyCount : 0;
      const leadHours = (booking.startsAt.getTime() - nowMs) / (1000 * 60 * 60);

      let score = 5;
      const reasons = [];
      if (leadHours <= 6) {
        score += 35;
        reasons.push("Very short lead time.");
      } else if (leadHours <= 24) {
        score += 22;
        reasons.push("Booking is within 24 hours.");
      } else if (leadHours <= 48) {
        score += 12;
        reasons.push("Booking is within 48 hours.");
      }
      if (cancellationRate >= 0.5) {
        score += 35;
        reasons.push("High previous cancellation rate.");
      } else if (cancellationRate >= 0.25) {
        score += 22;
        reasons.push("Moderate previous cancellation rate.");
      } else if (cancellationRate >= 0.1) {
        score += 10;
        reasons.push("Some previous cancellations.");
      }
      const price = Number(booking.price || 0);
      if (price >= 100) {
        score += 5;
        reasons.push("High-value appointment.");
      }

      const riskScore = Math.min(99, Math.max(0, Math.round(score)));
      const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
      return {
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone || "",
        customerEmail: booking.customerEmail || "",
        service: booking.service,
        date: booking.normalizedDate,
        time: booking.time,
        riskScore,
        riskLevel,
        reasons
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  const groupedByCustomer = new Map();
  normalized.forEach((booking) => {
    const key = customerKeyFor(booking);
    const current = groupedByCustomer.get(key) || [];
    current.push(booking);
    groupedByCustomer.set(key, current);
  });

  const rebookingPrompts = [];
  groupedByCustomer.forEach((entries, customerKey) => {
    const nonCancelledPast = entries.filter((row) => row.status !== "cancelled" && row.startsAt.getTime() < nowMs);
    if (!nonCancelledPast.length) return;
    const hasFutureConfirmed = entries.some((row) => row.status === "confirmed" && row.startsAt.getTime() > nowMs);
    if (hasFutureConfirmed) return;

    nonCancelledPast.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
    const lastVisit = nonCancelledPast[0];
    const daysSince = Math.floor((nowMs - lastVisit.startsAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 28) return;
    const customerName = String(lastVisit.customerName || "Client").trim();
    const serviceName = String(lastVisit.service || "a service").trim();
    rebookingPrompts.push({
      customerKey,
      customerName,
      customerPhone: lastVisit.customerPhone || "",
      customerEmail: lastVisit.customerEmail || "",
      lastService: serviceName,
      daysSinceLastVisit: daysSince,
      suggestedMessage: `Hi ${customerName}, it has been ${daysSince} days since your ${serviceName}. We have new availability this week and would love to book your next visit.`
    });
  });
  rebookingPrompts.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);

  const aiConversations = await prisma.auditLog.count({
    where: {
      entityType: "chat",
      actorRole: "anonymous",
      metadata: { contains: businessId }
    }
  });
  return res.json({
    analytics: {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
      cancellationCount: bookings.filter((b) => b.status === "cancelled").length,
      estimatedRevenue: revenue,
      aiConversations
    },
    commandCenter: {
      today: {
        totalBookings: todayBookings.length,
        confirmedBookings: todayConfirmed.length,
        estimatedRevenue: Number(todayConfirmed.reduce((sum, b) => sum + Number(b.price || 0), 0).toFixed(2)),
        lastMinuteCancellations: lateCancellations.length
      },
      next7Days: {
        confirmedBookings: next7Confirmed.length,
        estimatedRevenue: Number(next7Confirmed.reduce((sum, b) => sum + Number(b.price || 0), 0).toFixed(2))
      },
      serviceHealth: {
        cancellationRate: noShowRate
      },
      recommendedActions
    },
    operationsInsights: {
      noShowRisk,
      rebookingPrompts: rebookingPrompts.slice(0, 10),
      summary: {
        highRiskCount: noShowRisk.filter((row) => row.riskLevel === "high").length,
        rebookingCandidates: rebookingPrompts.length
      }
    }
  });
});

app.post("/api/operations/rebooking/mark-sent", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const customerKey = String(req.body?.customerKey || "").trim();
  const customerName = String(req.body?.customerName || "").trim();
  const service = String(req.body?.service || "").trim();
  if (!customerKey) return res.status(400).json({ error: "Customer key is required." });

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "rebooking.prompt_sent",
    entityType: "rebooking",
    entityId: customerKey,
    metadata: { businessId, customerName, service }
  });

  return res.json({ ok: true });
});

app.get("/api/dashboard/customer", authRequired, requireRole("customer"), async (req, res) => {
  const bookings = await prisma.booking.findMany({ where: { customerEmail: req.auth.email || "" } });
  const savedBusinesses = new Set(bookings.map((b) => b.businessId)).size;
  return res.json({
    analytics: {
      totalBookings: bookings.length,
      upcomingBookings: bookings.filter((b) => b.status === "confirmed").length,
      savedBusinesses,
      loyaltyPoints: bookings.length * 25
    }
  });
});

app.get("/api/crm/segments", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const bookings = await prisma.booking.findMany({
    where: { businessId },
    orderBy: [{ createdAt: "desc" }]
  });
  const payload = buildCrmSegments(bookings);
  return res.json(payload);
});

app.post("/api/crm/campaigns/send", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const segmentId = String(req.body?.segmentId || "").trim();
  const customerKey = String(req.body?.customerKey || "").trim();
  const customerName = String(req.body?.customerName || "").trim();
  const message = String(req.body?.message || "").trim();
  const channel = String(req.body?.channel || "manual").trim().toLowerCase();
  if (!segmentId || !customerKey) return res.status(400).json({ error: "Segment and customer are required." });
  if (!message) return res.status(400).json({ error: "Campaign message is required." });

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "crm.campaign_sent",
    entityType: "crm_campaign",
    entityId: `${segmentId}:${customerKey}`,
    metadata: { businessId, segmentId, customerName, channel }
  });

  return res.json({ ok: true });
});

app.get("/api/commercial-controls", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const record = await loadCommercialRecord(businessId);
  return res.json({
    ...record,
    summary: summarizeCommercialRecord(record)
  });
});

app.post("/api/commercial-controls/memberships/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const id = String(req.body?.id || "").trim() || randomUUID();
  const name = String(req.body?.name || "").trim();
  const price = Number(req.body?.price || 0);
  const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
  const status = String(req.body?.status || "active").trim().toLowerCase();
  const benefits = String(req.body?.benefits || "").trim();
  if (!name) return res.status(400).json({ error: "Membership name is required." });
  if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Membership price must be valid." });
  if (!supportedMembershipCycles.has(billingCycle)) return res.status(400).json({ error: "Unsupported billing cycle." });
  if (!supportedCommercialStatus.has(status)) return res.status(400).json({ error: "Unsupported membership status." });

  const record = await loadCommercialRecord(businessId);
  const rows = Array.isArray(record.memberships) ? record.memberships : [];
  const index = rows.findIndex((item) => item.id === id);
  const next = {
    id,
    name,
    price: Number(price.toFixed(2)),
    billingCycle,
    status,
    benefits,
    updatedAt: new Date().toISOString()
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  record.memberships = rows;
  await saveCommercialRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "commercial.membership_upserted",
    entityType: "commercial",
    entityId: id,
    metadata: { businessId, billingCycle, status }
  });

  return res.json({
    membership: next,
    ...record,
    summary: summarizeCommercialRecord(record)
  });
});

app.post("/api/commercial-controls/packages/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const id = String(req.body?.id || "").trim() || randomUUID();
  const name = String(req.body?.name || "").trim();
  const price = Number(req.body?.price || 0);
  const sessionCount = Math.floor(Number(req.body?.sessionCount || 0));
  const remainingSessions = req.body?.remainingSessions === undefined
    ? sessionCount
    : Math.floor(Number(req.body?.remainingSessions || 0));
  const status = String(req.body?.status || "active").trim().toLowerCase();
  if (!name) return res.status(400).json({ error: "Package name is required." });
  if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Package price must be valid." });
  if (!Number.isInteger(sessionCount) || sessionCount <= 0) {
    return res.status(400).json({ error: "Session count must be greater than zero." });
  }
  if (!Number.isInteger(remainingSessions) || remainingSessions < 0 || remainingSessions > sessionCount) {
    return res.status(400).json({ error: "Remaining sessions must be between 0 and session count." });
  }
  if (!supportedCommercialStatus.has(status)) return res.status(400).json({ error: "Unsupported package status." });

  const record = await loadCommercialRecord(businessId);
  const rows = Array.isArray(record.packages) ? record.packages : [];
  const index = rows.findIndex((item) => item.id === id);
  const next = {
    id,
    name,
    price: Number(price.toFixed(2)),
    sessionCount,
    remainingSessions,
    status,
    updatedAt: new Date().toISOString()
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  record.packages = rows;
  await saveCommercialRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "commercial.package_upserted",
    entityType: "commercial",
    entityId: id,
    metadata: { businessId, sessionCount, status }
  });

  return res.json({
    package: next,
    ...record,
    summary: summarizeCommercialRecord(record)
  });
});

app.post("/api/commercial-controls/gift-cards/issue", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const purchaserName = String(req.body?.purchaserName || "").trim();
  const recipientName = String(req.body?.recipientName || "").trim();
  const initialBalance = Number(req.body?.initialBalance || 0);
  const codeInput = String(req.body?.code || "").trim().toUpperCase();
  const expiresAtInput = String(req.body?.expiresAt || "").trim();
  if (!purchaserName) return res.status(400).json({ error: "Purchaser name is required." });
  if (!recipientName) return res.status(400).json({ error: "Recipient name is required." });
  if (!Number.isFinite(initialBalance) || initialBalance <= 0) {
    return res.status(400).json({ error: "Gift card balance must be greater than zero." });
  }
  if (expiresAtInput && Number.isNaN(new Date(expiresAtInput).getTime())) {
    return res.status(400).json({ error: "Gift card expiry date is invalid." });
  }

  const record = await loadCommercialRecord(businessId);
  const rows = Array.isArray(record.giftCards) ? record.giftCards : [];
  const code = codeInput || `GIFT-${randomUUID().slice(0, 8).toUpperCase()}`;
  const id = randomUUID();
  const now = new Date().toISOString();
  const giftCard = {
    id,
    code,
    purchaserName,
    recipientName,
    initialBalance: Number(initialBalance.toFixed(2)),
    remainingBalance: Number(initialBalance.toFixed(2)),
    status: "active",
    issuedAt: now,
    expiresAt: expiresAtInput || null,
    updatedAt: now
  };
  rows.push(giftCard);
  record.giftCards = rows;
  await saveCommercialRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "commercial.gift_card_issued",
    entityType: "commercial",
    entityId: id,
    metadata: { businessId, code, initialBalance: giftCard.initialBalance }
  });

  return res.json({
    giftCard,
    ...record,
    summary: summarizeCommercialRecord(record)
  });
});

app.post(
  "/api/commercial-controls/gift-cards/:giftCardId/redeem",
  authRequired,
  requireRole("subscriber", "admin"),
  async (req, res) => {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const giftCardId = String(req.params.giftCardId || "").trim();
    if (!giftCardId) return res.status(400).json({ error: "Gift card id is required." });

    const amount = Number(req.body?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Redeem amount must be greater than zero." });
    }

    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.giftCards) ? record.giftCards : [];
    const index = rows.findIndex((item) => item.id === giftCardId);
    if (index < 0) return res.status(404).json({ error: "Gift card not found." });
    if (rows[index].status !== "active") {
      return res.status(400).json({ error: "Gift card is not active." });
    }
    if (amount > Number(rows[index].remainingBalance || 0)) {
      return res.status(400).json({ error: "Redeem amount exceeds remaining balance." });
    }

    const nextBalance = Number((Number(rows[index].remainingBalance || 0) - amount).toFixed(2));
    rows[index] = {
      ...rows[index],
      remainingBalance: nextBalance,
      status: nextBalance <= 0 ? "redeemed" : "active",
      updatedAt: new Date().toISOString()
    };
    record.giftCards = rows;
    await saveCommercialRecord(businessId, record);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.gift_card_redeemed",
      entityType: "commercial",
      entityId: giftCardId,
      metadata: { businessId, amount: Number(amount.toFixed(2)), remainingBalance: nextBalance }
    });

    return res.json({
      giftCard: rows[index],
      ...record,
      summary: summarizeCommercialRecord(record)
    });
  }
);

app.get("/api/revenue-attribution", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const [bookings, spendRecord] = await Promise.all([
    prisma.booking.findMany({ where: { businessId } }),
    loadRevenueSpendRecord(businessId)
  ]);
  return res.json(computeRevenueAttribution(bookings, spendRecord));
});

app.post("/api/revenue-attribution/spend", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const channel = normalizeRevenueChannel(req.body?.channel);
  const spend = Number(req.body?.spend);
  if (!channel) return res.status(400).json({ error: "Channel is required." });
  if (!Number.isFinite(spend) || spend < 0) return res.status(400).json({ error: "Spend must be a valid number >= 0." });

  const businessRecord = await loadRevenueSpendRecord(businessId);
  businessRecord[channel] = Number(spend.toFixed(2));
  await saveRevenueSpendRecord(businessId, businessRecord);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "revenue.channel_spend_updated",
    entityType: "revenue",
    entityId: `${businessId}:${channel}`,
    metadata: { businessId, channel, spend: businessRecord[channel] }
  });

  const bookings = await prisma.booking.findMany({ where: { businessId } });
  return res.json(computeRevenueAttribution(bookings, businessRecord));
});

app.get("/api/profitability-summary", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const [bookings, record] = await Promise.all([
    prisma.booking.findMany({ where: { businessId } }),
    loadProfitabilityRecord(businessId)
  ]);
  return res.json(computeProfitabilitySummary(bookings, record));
});

app.post("/api/profitability/payroll/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const id = String(req.body?.id || "").trim() || randomUUID();
  const staffName = String(req.body?.staffName || "").trim();
  const role = String(req.body?.role || "").trim();
  const hours = Number(req.body?.hours || 0);
  const hourlyRate = Number(req.body?.hourlyRate || 0);
  const bonus = Number(req.body?.bonus || 0);
  if (!staffName) return res.status(400).json({ error: "Staff name is required." });
  if (!Number.isFinite(hours) || hours < 0) return res.status(400).json({ error: "Hours must be a valid number >= 0." });
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    return res.status(400).json({ error: "Hourly rate must be a valid number >= 0." });
  }
  if (!Number.isFinite(bonus) || bonus < 0) return res.status(400).json({ error: "Bonus must be a valid number >= 0." });

  const record = await loadProfitabilityRecord(businessId);
  const rows = Array.isArray(record.payrollEntries) ? record.payrollEntries : [];
  const index = rows.findIndex((entry) => entry.id === id);
  const next = {
    id,
    staffName,
    role,
    hours: Number(hours.toFixed(2)),
    hourlyRate: Number(hourlyRate.toFixed(2)),
    bonus: Number(bonus.toFixed(2)),
    updatedAt: new Date().toISOString()
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  record.payrollEntries = rows;
  await saveProfitabilityRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "profitability.payroll_upserted",
    entityType: "profitability",
    entityId: id,
    metadata: { businessId, staffName, role }
  });

  const bookings = await prisma.booking.findMany({ where: { businessId } });
  const payload = computeProfitabilitySummary(bookings, record);
  return res.json({
    payrollEntry: next,
    ...payload
  });
});

app.delete("/api/profitability/payroll/:entryId", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const entryId = String(req.params.entryId || "").trim();
  if (!entryId) return res.status(400).json({ error: "Payroll entry id is required." });

  const record = await loadProfitabilityRecord(businessId);
  const rows = Array.isArray(record.payrollEntries) ? record.payrollEntries : [];
  const filtered = rows.filter((entry) => entry.id !== entryId);
  if (filtered.length === rows.length) return res.status(404).json({ error: "Payroll entry not found." });
  record.payrollEntries = filtered;
  await saveProfitabilityRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "profitability.payroll_removed",
    entityType: "profitability",
    entityId: entryId,
    metadata: { businessId }
  });

  const bookings = await prisma.booking.findMany({ where: { businessId } });
  return res.json(computeProfitabilitySummary(bookings, record));
});

app.post("/api/profitability/costs/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const rent = Number(req.body?.rent || 0);
  const utilities = Number(req.body?.utilities || 0);
  const software = Number(req.body?.software || 0);
  const other = Number(req.body?.other || 0);
  const cogsPercent = Number(req.body?.cogsPercent || 0);
  const values = [rent, utilities, software, other];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return res.status(400).json({ error: "Fixed costs must be valid numbers >= 0." });
  }
  if (!Number.isFinite(cogsPercent) || cogsPercent < 0 || cogsPercent > 95) {
    return res.status(400).json({ error: "COGS percent must be between 0 and 95." });
  }

  const record = await loadProfitabilityRecord(businessId);
  record.fixedCosts = {
    rent: Number(rent.toFixed(2)),
    utilities: Number(utilities.toFixed(2)),
    software: Number(software.toFixed(2)),
    other: Number(other.toFixed(2))
  };
  record.cogsPercent = Number(cogsPercent.toFixed(2));
  await saveProfitabilityRecord(businessId, record);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "profitability.costs_updated",
    entityType: "profitability",
    entityId: businessId,
    metadata: { businessId, ...record.fixedCosts, cogsPercent: record.cogsPercent }
  });

  const bookings = await prisma.booking.findMany({ where: { businessId } });
  return res.json(computeProfitabilitySummary(bookings, record));
});

app.get("/api/accounting-integrations/live-revenue", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const timeframe = normalizeLiveTimeframe(req.query?.timeframe);
  const from = String(req.query?.from || "").trim();
  const to = String(req.query?.to || "").trim();
  if ((from && !bookingDateRegex.test(from)) || (to && !bookingDateRegex.test(to))) {
    return res.status(400).json({ error: "Invalid date filter. Use YYYY-MM-DD." });
  }
  if (from && to) {
    if (from > to) return res.status(400).json({ error: "Invalid date range. 'from' must be before 'to'." });
    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T23:59:59Z`);
    const diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (!Number.isFinite(diffDays) || diffDays <= 0 || diffDays > 366) {
      return res.status(400).json({ error: "Date range must be between 1 and 366 days." });
    }
  }
  const scope = String(req.query?.scope || "business").trim().toLowerCase();
  if (scope === "platform") {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({ error: "Platform live revenue is restricted to admin." });
    }
    const platformPayload = await computePlatformLiveRevenueSnapshot(timeframe, { from, to });
    return res.json(platformPayload);
  }
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const payload = await computeBusinessLiveRevenueSnapshot(businessId, timeframe, { from, to });
  return res.json(payload);
});

app.get("/api/accounting-integrations/export", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const format = String(req.query?.format || "csv").trim().toLowerCase();
  if (format !== "csv") {
    return res.status(400).json({ error: "Only csv export format is currently supported." });
  }

  const scope = String(req.query?.scope || "business").trim().toLowerCase();
  const generatedAt = new Date().toISOString();

  if (scope === "platform") {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({ error: "Platform export is restricted to admin." });
    }
    const payload = await computeAdminRevenueAnalytics(6);
    const csv = buildAdminRevenueAnalyticsCsv(payload, generatedAt);
    const fileDate = generatedAt.slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"platform_revenue_analytics_${fileDate}.csv\"`);
    return res.status(200).send(csv);
  }

  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } });
  if (!business) return res.status(404).json({ error: "Business not found." });
  const bookings = await prisma.booking.findMany({
    where: { businessId },
    select: {
      id: true,
      date: true,
      time: true,
      status: true,
      service: true,
      price: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      source: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: [{ date: "desc" }, { time: "desc" }, { createdAt: "desc" }]
  });
  const csv = buildBusinessAccountingBookingsCsv(
    { businessName: String(business.name || ""), businessId: business.id, bookings },
    generatedAt
  );
  const safeBusinessName = String(business.name || "business")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "business";
  const fileDate = generatedAt.slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"${safeBusinessName}_bookings_accounting_${fileDate}.csv\"`);
  return res.status(200).send(csv);
});

app.post("/api/business-reports/email", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const recipientEmail = String(req.body?.recipientEmail || "").trim().toLowerCase();
  const subject = String(req.body?.subject || "").trim();
  const note = String(req.body?.note || "").trim();
  const report = req.body?.report && typeof req.body.report === "object" ? req.body.report : null;
  if (!recipientEmail) return res.status(400).json({ error: "Recipient email is required." });
  if (!isValidEmail(recipientEmail)) return res.status(400).json({ error: "Invalid recipient email format." });
  if (!report) return res.status(400).json({ error: "Report payload is required." });

  const queuedAt = new Date().toISOString();
  const item = {
    id: randomUUID(),
    businessId,
    recipientEmail,
    subject: subject || `Business Report (${queuedAt.slice(0, 10)})`,
    note,
    report,
    queuedAt,
    status: "queued",
    requestedBy: {
      userId: String(req.auth?.sub || ""),
      role: String(req.auth?.role || ""),
      email: String(req.auth?.email || "")
    }
  };
  await enqueueBusinessReportEmailRequest(item);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "business_report.email_queued",
    entityType: "business_report",
    entityId: item.id,
    metadata: { businessId, recipientEmail }
  });

  return res.json({
    ok: true,
    queued: true,
    deliveryMode: "queue",
    id: item.id,
    queuedAt
  });
});

app.get("/api/accounting-integrations", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const record = await loadAccountingIntegrationsRecord(businessId);
  return res.json({
    providers: summarizeBusinessAccountingIntegrations(record),
    supportedProviders: supportedAccountingProviders
  });
});

app.post("/api/accounting-integrations/connect", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const provider = normalizeAccountingProvider(req.body?.provider);
  const accountLabel = String(req.body?.accountLabel || "").trim();
  const syncMode = String(req.body?.syncMode || "daily").trim().toLowerCase();
  const allowedSyncModes = new Set(["daily", "weekly", "manual"]);
  if (!provider) return res.status(400).json({ error: "Unsupported provider." });
  if (!accountLabel) return res.status(400).json({ error: "Account label is required." });
  if (!allowedSyncModes.has(syncMode)) return res.status(400).json({ error: "Unsupported sync mode." });

  const businessRecord = await loadAccountingIntegrationsRecord(businessId);
  const now = new Date().toISOString();
  businessRecord[provider] = {
    provider,
    status: "connected",
    accountLabel,
    syncMode,
    connectedAt: businessRecord?.[provider]?.connectedAt || now,
    updatedAt: now
  };
  await saveAccountingIntegrationsRecord(businessId, businessRecord);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "integration.accounting_connected",
    entityType: "integration",
    entityId: `${businessId}:${provider}`,
    metadata: { provider, syncMode }
  });

  return res.json({
    provider: businessRecord[provider],
    providers: summarizeBusinessAccountingIntegrations(businessRecord)
  });
});

app.post(
  "/api/accounting-integrations/:provider/disconnect",
  authRequired,
  requireRole("subscriber", "admin"),
  async (req, res) => {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const provider = normalizeAccountingProvider(req.params.provider);
    if (!provider) return res.status(400).json({ error: "Unsupported provider." });

    const businessRecord = await loadAccountingIntegrationsRecord(businessId);
    const existing = businessRecord?.[provider];
    if (!existing || existing.status !== "connected") {
      return res.status(404).json({ error: "Provider is not connected for this business." });
    }

    const now = new Date().toISOString();
    businessRecord[provider] = {
      provider,
      status: "not_connected",
      accountLabel: "",
      syncMode: existing.syncMode || "daily",
      connectedAt: null,
      updatedAt: now
    };
    await saveAccountingIntegrationsRecord(businessId, businessRecord);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "integration.accounting_disconnected",
      entityType: "integration",
      entityId: `${businessId}:${provider}`,
      metadata: { provider }
    });

    return res.json({
      provider: businessRecord[provider],
      providers: summarizeBusinessAccountingIntegrations(businessRecord)
    });
  }
);

app.get("/api/staff-roster", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const businessRecord = await loadStaffBusinessRecord(businessId);
  return res.json(
    buildStaffRosterResponse(businessRecord, {
      includeRotaWeek: true,
      weekStart: req.query?.weekStart
    })
  );
});

app.post("/api/staff-roster/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const id = String(req.body?.id || "").trim() || randomUUID();
  const name = String(req.body?.name || "").trim();
  const role = String(req.body?.role || "staff").trim();
  const availability = String(req.body?.availability || "off_duty").trim().toLowerCase();
  const shiftDays = normalizeShiftDays(req.body?.shiftDays);
  if (!name) return res.status(400).json({ error: "Staff member name is required." });
  if (!supportedStaffAvailability.has(availability)) {
    return res.status(400).json({ error: "Invalid availability value." });
  }

  const businessRecord = await loadStaffBusinessRecord(businessId);
  const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
  const existingIndex = members.findIndex((member) => String(member?.id || "") === id);
  const nextMember = {
    id,
    name,
    role,
    availability,
    shiftDays,
    updatedAt: new Date().toISOString()
  };
  if (existingIndex >= 0) {
    members[existingIndex] = nextMember;
  } else {
    members.push(nextMember);
  }
  businessRecord.members = members;
  await saveStaffBusinessRecord(businessId, businessRecord);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "staff.roster_upserted",
    entityType: "staff",
    entityId: id,
    metadata: { businessId, availability }
  });

  const response = buildStaffRosterResponse(businessRecord, {
    includeRotaWeek: true,
    weekStart: req.body?.weekStart
  });
  return res.json({
    member: response.members.find((item) => item.id === id) || null,
    ...response
  });
});

app.post("/api/staff-roster/:staffId/availability", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const staffId = String(req.params.staffId || "").trim();
  const availability = String(req.body?.availability || "").trim().toLowerCase();
  if (!staffId) return res.status(400).json({ error: "Staff member id is required." });
  if (!supportedStaffAvailability.has(availability)) {
    return res.status(400).json({ error: "Invalid availability value." });
  }

  const businessRecord = await loadStaffBusinessRecord(businessId);
  const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
  const index = members.findIndex((member) => String(member?.id || "") === staffId);
  if (index < 0) return res.status(404).json({ error: "Staff member not found." });
  members[index] = {
    ...members[index],
    availability,
    updatedAt: new Date().toISOString()
  };
  businessRecord.members = members;
  await saveStaffBusinessRecord(businessId, businessRecord);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "staff.availability_updated",
    entityType: "staff",
    entityId: staffId,
    metadata: { businessId, availability }
  });

  const response = buildStaffRosterResponse(businessRecord, {
    includeRotaWeek: true,
    weekStart: req.body?.weekStart
  });
  return res.json({
    member: response.members.find((item) => item.id === staffId) || null,
    ...response
  });
});

app.delete("/api/staff-roster/:staffId", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const staffId = String(req.params.staffId || "").trim();
  if (!staffId) return res.status(400).json({ error: "Staff member id is required." });

  const businessRecord = await loadStaffBusinessRecord(businessId);
  const members = Array.isArray(businessRecord.members) ? businessRecord.members : [];
  const filtered = members.filter((member) => String(member?.id || "") !== staffId);
  if (filtered.length === members.length) return res.status(404).json({ error: "Staff member not found." });
  businessRecord.members = filtered;
  await saveStaffBusinessRecord(businessId, businessRecord);

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "staff.removed",
    entityType: "staff",
    entityId: staffId,
    metadata: { businessId }
  });

  if (businessRecord.rotaWeeks && typeof businessRecord.rotaWeeks === "object") {
    Object.values(businessRecord.rotaWeeks).forEach((week) => {
      if (!week || typeof week !== "object") return;
      if (week.cells && typeof week.cells === "object") delete week.cells[staffId];
      if (Array.isArray(week.sicknessLogs)) {
        week.sicknessLogs = week.sicknessLogs.filter((entry) => String(entry?.staffId || "") !== staffId);
      }
    });
  }
  await saveStaffBusinessRecord(businessId, businessRecord);
  return res.json(
    buildStaffRosterResponse(businessRecord, {
      includeRotaWeek: true,
      weekStart: req.query?.weekStart
    })
  );
});

app.get("/api/staff-roster/rota", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const weekStart = normalizeWeekStartKey(req.query?.weekStart) || currentWeekStartKey();
  const businessRecord = await loadStaffBusinessRecord(businessId);
  return res.json(getStaffRotaWeekPayload(businessRecord, weekStart));
});

app.post("/api/staff-roster/rota/bulk", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const weekStart = normalizeWeekStartKey(req.body?.weekStart) || currentWeekStartKey();
  const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];
  const appendSicknessLogs = Array.isArray(req.body?.sicknessLogs) ? req.body.sicknessLogs : [];

  const businessRecord = await loadStaffBusinessRecord(businessId);
  const members = normalizeStaffMembers(businessRecord.members || []);
  const validIds = new Set(members.map((member) => String(member.id)));
  if (!businessRecord.rotaWeeks || typeof businessRecord.rotaWeeks !== "object") businessRecord.rotaWeeks = {};
  const week = normalizeStaffRotaWeek(businessRecord.rotaWeeks[weekStart]);
  if (!week.cells || typeof week.cells !== "object") week.cells = {};
  const now = new Date().toISOString();

  let applied = 0;
  updates.forEach((item) => {
    const staffId = String(item?.staffId || "").trim();
    const day = normalizeStaffRotaDayKey(item?.day);
    if (!staffId || !day || !validIds.has(staffId)) return;
    if (!week.cells[staffId] || typeof week.cells[staffId] !== "object") week.cells[staffId] = {};
    week.cells[staffId][day] = {
      status: normalizeStaffRotaStatus(item?.status),
      shift: normalizeStaffRotaShift(item?.shift),
      updatedAt: now,
      updatedByRole: String(req.auth.role || "")
    };
    applied += 1;
  });

  if (appendSicknessLogs.length) {
    const safeLogs = appendSicknessLogs
      .map((entry) => ({
        id: String(entry?.id || "").trim() || randomUUID(),
        staffId: String(entry?.staffId || "").trim(),
        staffName: String(entry?.staffName || "").trim(),
        day: normalizeStaffRotaDayKey(entry?.day),
        shift: normalizeStaffRotaShift(entry?.shift),
        replacementMode: String(entry?.replacementMode || "suggest").trim().toLowerCase() === "auto" ? "auto" : "suggest",
        weekStart,
        reportedAt: now,
        actorId: req.auth.sub,
        actorRole: req.auth.role
      }))
      .filter((entry) => entry.staffId && validIds.has(entry.staffId) && entry.day);
    week.sicknessLogs = [...(Array.isArray(week.sicknessLogs) ? week.sicknessLogs : []), ...safeLogs].slice(-100);
  }

  week.updatedAt = now;
  businessRecord.rotaWeeks[weekStart] = week;
  await saveStaffBusinessRecord(businessId, businessRecord);

  if (applied || appendSicknessLogs.length) {
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "staff.rota_bulk_updated",
      entityType: "staff_rota",
      entityId: `${businessId}:${weekStart}`,
      metadata: { businessId, weekStart, appliedUpdates: applied, sicknessLogs: appendSicknessLogs.length }
    });
  }

  return res.json(getStaffRotaWeekPayload(businessRecord, weekStart));
});

app.post("/api/staff-roster/rota/reset", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const weekStart = normalizeWeekStartKey(req.body?.weekStart) || currentWeekStartKey();
  const businessRecord = await loadStaffBusinessRecord(businessId);
  if (!businessRecord.rotaWeeks || typeof businessRecord.rotaWeeks !== "object") businessRecord.rotaWeeks = {};
  delete businessRecord.rotaWeeks[weekStart];
  await saveStaffBusinessRecord(businessId, businessRecord);
  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "staff.rota_week_reset",
    entityType: "staff_rota",
    entityId: `${businessId}:${weekStart}`,
    metadata: { businessId, weekStart }
  });
  return res.json(getStaffRotaWeekPayload(businessRecord, weekStart));
});

app.get("/api/waitlist", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const rows = await getWaitlistEntriesForBusiness(businessId);
  return res.json({
    entries: rows,
    summary: summarizeWaitlist(rows)
  });
});

app.post("/api/waitlist/upsert", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const id = String(req.body?.id || "").trim() || randomUUID();
  const customerName = String(req.body?.customerName || "").trim();
  const customerPhone = String(req.body?.customerPhone || "").trim();
  const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
  const service = String(req.body?.service || "").trim();
  const preferredDate = String(req.body?.preferredDate || "").trim();
  const preferredTime = String(req.body?.preferredTime || "").trim();
  const notes = String(req.body?.notes || "").trim();
  if (!customerName) return res.status(400).json({ error: "Customer name is required." });
  if (!customerPhone && !customerEmail) {
    return res.status(400).json({ error: "Phone or email is required." });
  }
  if (customerPhone && !isValidPhone(customerPhone)) return res.status(400).json({ error: "Invalid phone format." });
  if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: "Invalid email format." });
  if ((preferredDate && !preferredTime) || (!preferredDate && preferredTime)) {
    return res.status(400).json({ error: "Preferred date and time must be supplied together." });
  }
  if (preferredDate && preferredTime && !normalizeBookingDateTime(preferredDate, preferredTime)) {
    return res.status(400).json({ error: "Invalid preferred date/time." });
  }

  let saved;
  try {
    saved = await upsertWaitlistEntryForBusiness(businessId, {
      id,
      customerName,
      customerPhone,
      customerEmail,
      service,
      preferredDate,
      preferredTime,
      notes
    });
  } catch (error) {
    if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
    throw error;
  }

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "waitlist.upserted",
    entityType: "waitlist",
    entityId: id,
    metadata: { businessId, service }
  });

  return res.json({
    entry: saved.entry,
    entries: saved.entries,
    summary: summarizeWaitlist(saved.entries)
  });
});

app.post("/api/waitlist/:entryId/backfill", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const entryId = String(req.params.entryId || "").trim();
  if (!entryId) return res.status(400).json({ error: "Waitlist entry id is required." });

  const cancelledBookingId = String(req.body?.cancelledBookingId || "").trim();
  let cancelledBooking = null;
  if (cancelledBookingId) {
    cancelledBooking = await prisma.booking.findUnique({ where: { id: cancelledBookingId } });
    if (!cancelledBooking || cancelledBooking.businessId !== businessId || cancelledBooking.status !== "cancelled") {
      return res.status(400).json({ error: "Cancelled booking not found for this business." });
    }
  }

  let updated;
  try {
    updated = await markWaitlistEntryContactedForBusiness(businessId, entryId);
  } catch (error) {
    if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
    throw error;
  }

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "waitlist.backfill_contacted",
    entityType: "waitlist",
    entityId: entryId,
    metadata: {
      businessId,
      cancelledBookingId: cancelledBooking?.id || null,
      service: cancelledBooking?.service || updated.entry?.service || null
    }
  });

  return res.json({
    entry: updated.entry,
    entries: updated.entries,
    summary: summarizeWaitlist(updated.entries)
  });
});

app.delete("/api/waitlist/:entryId", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
  const entryId = String(req.params.entryId || "").trim();
  if (!entryId) return res.status(400).json({ error: "Waitlist entry id is required." });

  let deleted;
  try {
    deleted = await deleteWaitlistEntryForBusiness(businessId, entryId);
  } catch (error) {
    if (error?.statusCode === 404) return res.status(404).json({ error: "Waitlist entry not found." });
    throw error;
  }

  await writeAuditLog({
    actorId: req.auth.sub,
    actorRole: req.auth.role,
    action: "waitlist.removed",
    entityType: "waitlist",
    entityId: entryId,
    metadata: { businessId }
  });

  return res.json({
    entries: deleted.entries,
    summary: summarizeWaitlist(deleted.entries)
  });
});

app.get("/api/billing/subscriber-summary", authRequired, requireRole("subscriber", "admin"), async (req, res) => {
  const businessId = await resolveManagedBusinessId(req);
  if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const subscription = await prisma.subscription.findUnique({
    where: { businessId },
    select: {
      status: true,
      plan: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
      stripeSubscription: true
    }
  });

  const status = String(subscription?.status || "inactive").trim().toLowerCase();
  const plan = String(subscription?.plan || "starter").trim().toLowerCase();
  const planLabel = plan === "yearly" ? "Subscriber Yearly" : "Subscriber Monthly";
  const effectiveMonthlyOnYearly = Number((subscriberYearlyFeeGbp / 12).toFixed(2));
  const provider = subscription?.stripeCustomerId || subscription?.stripeSubscription
    ? "stripe"
    : status === "active" || status === "trialing" || status === "past_due"
      ? "paypal"
      : "";

  return res.json({
    status,
    plan,
    planLabel,
    provider,
    currentPeriodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString() : null,
    monthlyFee: subscriberMonthlyFeeGbp,
    yearlyFee: subscriberYearlyFeeGbp,
    yearlyDiscountPercent,
    effectiveMonthlyOnYearly,
    hasStripeCustomer: Boolean(subscription?.stripeCustomerId),
    hasStripeSubscription: Boolean(subscription?.stripeSubscription)
  });
});

app.post("/api/billing/create-checkout-session", authRequired, requireRole("subscriber"), async (req, res) => {
  if (!stripe) return res.status(400).json({ error: "Stripe not configured." });
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
  if (!user?.businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const business = await prisma.business.findUnique({ where: { id: user.businessId } });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
  if (!["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Billing cycle must be monthly or yearly." });
  }

  const monthlyPriceId = String(process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID || "").trim();
  const yearlyPriceId = String(process.env.STRIPE_PRICE_ID_YEARLY || "").trim();
  const bodyPriceId = String(req.body?.priceId || "").trim();
  const priceId =
    bodyPriceId ||
    (billingCycle === "yearly" ? yearlyPriceId : monthlyPriceId);
  if (!priceId) return res.status(400).json({ error: "Missing Stripe price ID." });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard.html?billing=success`,
    cancel_url: `${appUrl}/dashboard.html?billing=cancel`,
    metadata: {
      businessId: business.id,
      userId: user.id,
      billingCycle,
      monthlyFeeGbp: String(subscriberMonthlyFeeGbp),
      yearlyFeeGbp: String(subscriberYearlyFeeGbp),
      yearlyDiscountPercent: String(yearlyDiscountPercent)
    }
  });
  clearReadCache();
  await writeAuditLog({
    actorId: user.id,
    actorRole: "subscriber",
    action: "billing.checkout_session_created",
    entityType: "subscription",
    entityId: business.id
  });

  return res.json({ url: session.url });
});

app.post("/api/billing/create-paypal-subscription", authRequired, requireRole("subscriber"), async (req, res) => {
  if (!isPayPalConfigured()) return res.status(400).json({ error: "PayPal not configured." });
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
  if (!user?.businessId) return res.status(400).json({ error: "Subscriber business not found." });

  const business = await prisma.business.findUnique({ where: { id: user.businessId } });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
  if (!["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Billing cycle must be monthly or yearly." });
  }

  const monthlyPlanId = String(process.env.PAYPAL_PLAN_ID_MONTHLY || "").trim();
  const yearlyPlanId = String(process.env.PAYPAL_PLAN_ID_YEARLY || "").trim();
  const planId = billingCycle === "yearly" ? yearlyPlanId : monthlyPlanId;
  if (!planId) return res.status(400).json({ error: "Missing PayPal plan ID." });

  let session;
  try {
    session = await createPayPalSubscriptionSession({
      planId,
      businessId: business.id,
      userId: user.id,
      userEmail: user.email,
      billingCycle
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || "PayPal checkout failed." });
  }

  clearReadCache();
  await writeAuditLog({
    actorId: user.id,
    actorRole: "subscriber",
    action: "billing.paypal_subscription_created",
    entityType: "subscription",
    entityId: business.id,
    metadata: {
      billingCycle,
      provider: "paypal",
      paypalSubscriptionId: session.subscriptionId || null
    }
  });

  return res.json({ url: session.approvalUrl, subscriptionId: session.subscriptionId || null });
});

app.post("/api/billing/create-portal-session", authRequired, requireRole("subscriber"), async (req, res) => {
  if (!stripe) return res.status(400).json({ error: "Stripe not configured." });
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
  if (!user?.businessId) return res.status(400).json({ error: "Business not found." });
  const subscription = await prisma.subscription.findUnique({ where: { businessId: user.businessId } });
  if (!subscription?.stripeCustomerId) return res.status(400).json({ error: "No Stripe customer." });

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard.html`
  });
  clearReadCache();
  await writeAuditLog({
    actorId: user.id,
    actorRole: "subscriber",
    action: "billing.portal_session_created",
    entityType: "subscription",
    entityId: subscription.id
  });
  return res.json({ url: session.url });
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  let userMessage = "";
  let business = null;
  let history = [];
  try {
    userMessage = String(req.body?.message || "").trim();
    history = Array.isArray(req.body?.history) ? req.body.history : [];
    const businessId = String(req.body?.businessId || "").trim();
    const canUseOpenAi = Boolean(openai) && !isOpenAiQuotaCircuitActive();
    if (!userMessage) return res.status(400).json({ error: "Message is required." });
    if (isLexiRestrictedDataRequest(userMessage, { role: "public" })) {
      return res.json({
        reply: lexiRestrictedDataReply("app or business", { role: "public" })
      });
    }
    const userMessageLower = userMessage.toLowerCase();
    if (/(what('s| is)?\s+(the\s+)?date\b|today'?s date|what day is it)/i.test(userMessageLower)) {
      const now = new Date();
      const formattedDate = formatDisplayDateWithWeekdayGb(now.toISOString());
      return res.json({ reply: `Today is ${formattedDate}.` });
    }
    if (/(what('s| is)?\s+(the\s+)?time\b|current time|time is it)/i.test(userMessageLower)) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });
      return res.json({ reply: `The time is ${formattedTime}.` });
    }
    business = await prisma.business.findFirst({
      where: businessId
        ? {
            id: businessId,
            subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
          }
        : {
            subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
          },
      include: { services: true, subscription: true },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
    }) || (businessId ? null : (await prisma.business.findFirst({ include: { services: true, subscription: true } })));

    if (!business && !canUseOpenAi) {
      return res.json({
        reply: "Tell me the salon, barber, or beauty business name, or just send the area you want, and I'll look for subscribed businesses and available slots.",
        fallback: true,
        fallbackMode: isOpenAiQuotaCircuitActive() ? "quota" : "local"
      });
    }
    if (!business) {
      const shortFollowUp = userMessage.trim().split(/\s+/).filter(Boolean).length <= 5;
      const likelyBusinessNameOnly = shortFollowUp && !isLexiAppQuestion(userMessageLower) && !/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})/i.test(userMessageLower);
      if (likelyBusinessNameOnly) {
        const matches = await searchPublicSubscribedBusinesses({ query: userMessage, limit: 5 });
        if (matches.length) {
          const summary = matches.slice(0, 4).map((row) => `${row.name} (${row.city})`).join(" | ");
          return res.json({
            reply: `I found ${matches.length} subscribed business${matches.length === 1 ? "" : "es"} matching "${userMessage}": ${summary}. Tell me which one you want and what day or date, and I'll check available slots.`
          });
        }
        return res.json({
          reply: `I couldn't find a subscribed business matching "${userMessage}" right now. If you want, tell me the town or city and I'll search nearby salons, barbers, or beauty businesses.`
        });
      }
      const looksFinderOrAvailability = /(find|search|salon|barber|beauty|slot|availability|available|free space|book\b|booking|appointment)/i.test(userMessageLower);
      if (looksFinderOrAvailability) {
        return res.json({
          reply: "Start with the business name, for example SLH Cuts, or the area you want, and I'll look for subscribed businesses and available slots."
        });
      }
      return res.json({
        reply: "I can help with app questions and salon, barber, or beauty guidance right away. If you want availability or booking help, tell me a business name or location and I'll search for subscribed businesses."
      });
    }
    if (!canUseOpenAi) {
      return res.json({
        reply: await buildPublicLexiFallbackReplySafe(userMessage, business, history),
        fallback: true,
        fallbackMode: isOpenAiQuotaCircuitActive() ? "quota" : "local"
      });
    }
    await writeAuditLog({
      actorRole: "anonymous",
      action: "chat.request",
      entityType: "chat",
      metadata: { businessId: business.id }
    });

    const tools = [
      {
        type: "function",
        function: {
          name: "search_public_businesses",
          description: "Search subscribed salon, barber, or beauty businesses using public information only.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Business name or search phrase." },
              location: { type: "string", description: "City, postcode, or area." },
              service: { type: "string", description: "Optional service to search for." },
              business_type: { type: "string", description: "salon, barber, or beauty" },
              limit: { type: "number", description: "Max results 1-10" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_business_public_profile",
          description: "Get public profile information for a subscribed business by id or name.",
          parameters: {
            type: "object",
            properties: {
              business_id: { type: "string" },
              business_name: { type: "string" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_available_slots",
          description: "Check available booking slots for a business and optionally filter by date.",
          parameters: {
            type: "object",
            properties: {
              business_id: { type: "string" },
              date: { type: "string", description: "Optional date in YYYY-MM-DD format." },
              days_ahead: { type: "number", description: "Optional number of days ahead to search (1-14)." },
              limit: { type: "number", description: "Optional max number of slots to return (1-12)." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_booking",
          description: "Create a booking when required details are complete.",
          parameters: {
            type: "object",
            properties: {
              business_id: { type: "string" },
              guest_name: { type: "string" },
              service: { type: "string" },
              date: { type: "string" },
              time: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              notes: { type: "string" }
            },
            required: ["business_id", "guest_name", "service", "date", "time", "phone"]
          }
        }
      }
    ];

    const messages = [
      {
        role: "system",
        content: buildPublicLexiSystemPrompt(business)
      },
      { role: "system", content: `Business profile:\n${JSON.stringify(mapBusiness(business, { includeSlots: false }), null, 2)}` },
      ...history.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"),
      { role: "user", content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 280,
      messages,
      tools,
      tool_choice: "auto"
    });

    const choice = completion.choices?.[0]?.message;
    clearOpenAiQuotaCircuit();
    if (choice?.tool_calls?.length) {
      const call = choice.tool_calls[0];
      if (call.function?.name === "search_public_businesses") {
        const args = JSON.parse(call.function.arguments || "{}");
        const results = await searchPublicSubscribedBusinesses({
          query: String(args.query || "").trim(),
          location: String(args.location || "").trim(),
          service: String(args.service || "").trim(),
          businessType: String(args.business_type || "").trim(),
          limit: Number(args.limit || 5)
        });
        if (!results.length) {
          return res.json({ reply: "I couldn't find any subscribed businesses matching that search yet. Try another location, business name, or service." });
        }
        const summary = results.slice(0, 5).map((b) => {
          const servicesPreview = (b.services || []).slice(0, 3).map((s) => s.name).join(", ");
          return `${b.name} (${b.type}, ${b.city})${servicesPreview ? ` - ${servicesPreview}` : ""}`;
        }).join(" | ");
        return res.json({
          reply: `I found ${results.length} subscribed business${results.length === 1 ? "" : "es"}: ${summary}. Tell me which one you want, and I can check available slots.`,
          businesses: results
        });
      }
      if (call.function?.name === "get_business_public_profile") {
        const args = JSON.parse(call.function.arguments || "{}");
        const id = String(args.business_id || "").trim();
        const name = String(args.business_name || "").trim();
        const target = id
          ? await prisma.business.findUnique({
              where: { id },
              include: { services: true, subscription: true }
            })
          : (await prisma.business.findFirst({
              where: {
                name: { contains: name, mode: "insensitive" },
                subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
              },
              include: { services: true, subscription: true },
              orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
            }));
        if (!target || !isPublicSubscriptionStatus(target.subscription?.status)) {
          return res.json({ reply: "I couldn't find a subscribed business with that name. Try the business finder first and I can list matching businesses." });
        }
        const profile = mapPublicBusinessProfile(target);
        const servicePreview = profile.services.slice(0, 5).map((s) => `${s.name} (${s.durationMin} min${Number.isFinite(s.price) ? `, ${formatCurrencyGBP(s.price)}` : ""})`).join(", ");
        return res.json({
          reply: `${profile.name} is a ${profile.type} business in ${profile.city}. ${profile.description || ""}${servicePreview ? ` Services: ${servicePreview}.` : ""} ${profile.phone ? `Phone: ${profile.phone}.` : ""}${profile.websiteUrl ? ` Website: ${profile.websiteUrl}.` : ""} Ask me to check slots if you'd like to book.`,
          businessProfile: profile
        });
      }
      if (call.function?.name === "check_available_slots") {
        const args = JSON.parse(call.function.arguments || "{}");
        const targetBusinessId = String(args.business_id || business.id);
        const target = await prisma.business.findUnique({
          where: { id: targetBusinessId },
          include: { services: true, subscription: true }
        });
        if (!target) return res.status(404).json({ error: "Selected business not found." });
        if (!isPublicSubscriptionStatus(target.subscription?.status)) {
          return res.json({ reply: "I can only check slots for subscribed businesses in this public chat. Please choose a subscribed business first." });
        }
        const requestedDate = String(args.date || "").trim();
        const daysAheadRaw = Number(args.days_ahead);
        const limitRaw = Number(args.limit);
        const daysAhead = Number.isFinite(daysAheadRaw) ? Math.min(14, Math.max(1, Math.floor(daysAheadRaw))) : 4;
        const limit = Number.isFinite(limitRaw) ? Math.min(12, Math.max(1, Math.floor(limitRaw))) : 8;
        const slots = await getAvailableSlotsForBusiness(target, daysAhead);
        const filtered = requestedDate
          ? slots.filter((slot) => String(slot).startsWith(requestedDate))
          : slots;
        if (!filtered.length) {
          const scope = requestedDate ? ` on ${requestedDate}` : "";
          return res.json({ reply: `I couldn't find any available slots for ${target.name}${scope}. Would you like me to check another date?` });
        }
        const slotList = filtered.slice(0, limit).join(", ");
        return res.json({
          reply: requestedDate
            ? `Here are available slots for ${target.name} on ${requestedDate}: ${slotList}.`
            : `Here are the next available slots for ${target.name}: ${slotList}.`
        });
      }
      if (call.function?.name === "create_booking") {
        const args = JSON.parse(call.function.arguments || "{}");
        const targetBusinessId = String(args.business_id || business.id);
        const target = await prisma.business.findUnique({
          where: { id: targetBusinessId },
          include: { services: true, subscription: true }
        });
        if (!target) return res.status(404).json({ error: "Selected business not found." });
        if (!isPublicSubscriptionStatus(target.subscription?.status)) {
          return res.json({ reply: "I can only create bookings for subscribed businesses in this public chat." });
        }
        const normalized = normalizeBookingDateTime(args.date, args.time);
        if (!normalized) return res.status(400).json({ error: "Invalid date/time format from assistant." });
        if (!isValidPhone(String(args.phone || "").trim())) {
          return res.status(400).json({ error: "Invalid phone format from assistant." });
        }
        if (String(args.email || "").trim() && !isValidEmail(String(args.email || "").trim())) {
          return res.status(400).json({ error: "Invalid email format from assistant." });
        }

        const svc = target.services.find((s) => s.name.toLowerCase() === String(args.service || "").toLowerCase());
        if (!svc) return res.json({ reply: "That service is not available at this business. Please choose another service." });
        const durationMin = Math.max(5, Number(svc.durationMin || 45));
        if (!isSlotWithinBusinessHours(target, normalized.date, normalized.time, durationMin)) {
          return res.json({ reply: "That time falls outside operating hours for this service. Please choose another slot." });
        }
        const capacity = await getSlotCapacityForBusinessDate(target.id, normalized.date);
        const atCapacity = await isSlotAtCapacity({
          businessId: target.id,
          date: normalized.date,
          time: normalized.time,
          capacity
        });
        if (atCapacity) return res.json({ reply: "That slot has reached staff capacity. Please choose a different time." });
        const booking = await prisma.booking.create({
          data: {
            businessId: target.id,
            businessName: target.name,
            customerName: String(args.guest_name || "").trim(),
            customerPhone: String(args.phone || "").trim(),
            customerEmail: String(args.email || "").trim().toLowerCase() || null,
            service: String(args.service || "").trim(),
            price: svc.price,
            date: normalized.date,
            time: normalized.time,
            notes: String(args.notes || "").trim() || null,
            status: "confirmed",
            source: "ai"
          }
        });
        clearReadCache();

        await jobRuntime.enqueueNotification({
          businessName: target.name,
          booking,
          customerEmail: booking.customerEmail || "",
          customerPhone: booking.customerPhone
        });
        await writeAuditLog({
          actorRole: "ai",
          action: "booking.created_ai",
          entityType: "booking",
          entityId: booking.id,
          metadata: { businessId: target.id }
        });

        return res.json({
          reply: `You're all set at ${target.name}. ${booking.customerName} is confirmed for ${booking.service} on ${booking.date} at ${booking.time}. We look forward to seeing you.`,
          bookingCreated: true,
          booking
        });
      }
    }

    return res.json({ reply: normalizeLexiReplyText(choice?.content || "I can help you book an appointment.", { maxSentences: 2, maxChars: 320 }) });
  } catch (error) {
    const status = Number(error?.status || error?.code || 0);
    const code = String(error?.error?.code || error?.code || "");
    const message = String(error?.error?.message || error?.message || "");
    if (status === 429 || code === "insufficient_quota") {
      if (shouldLogOpenAiQuotaError()) {
        console.error("Chat error:", status || "", code || "", message || "");
      }
    } else {
      console.error("Chat error:", status || "", code || "", message || "");
    }
    const safePublicFallback = async () => {
      try {
        if (business) {
          return res.json({
            reply: await buildPublicLexiFallbackReplySafe(userMessage, business, history),
            fallback: true
          });
        }
      } catch (fallbackError) {
        console.error("Chat fallback error:", fallbackError?.message || fallbackError);
      }
      return res.json({
        reply: "I can answer questions about the app and how to use it, but I hit a temporary issue just now. Please try again.",
        fallback: true
      });
    };

    if (status === 429 || code === "insufficient_quota") {
      markOpenAiQuotaCircuit(code || "insufficient_quota");
      if (business) {
        return safePublicFallback();
      }
      return res.status(429).json({
        error: "OpenAI quota exceeded. Please add billing/credits in your OpenAI project."
      });
    }
    if (status === 401) {
      if (business) {
        return safePublicFallback();
      }
      return res.status(401).json({
        error: "OpenAI authentication failed. Check OPENAI_API_KEY in .env."
      });
    }
    if (business) {
      return safePublicFallback();
    }
    return res.status(500).json({ error: "Failed to process chat request." });
  }
});

app.get("/auth", (_req, res) => res.sendFile(path.join(__dirname, "public", "auth.html")));
app.get("/dashboard", (_req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

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

async function shutdownRuntime() {
  try {
    if (jobRuntime) await jobRuntime.close();
  } catch {
    // ignore
  }
  await closeRedis();
}

process.on("SIGINT", async () => {
  await shutdownRuntime();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdownRuntime();
  process.exit(0);
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertSecureRuntimeSettings();
  await initializeRuntime();
  await syncAdminFromEnv();
  app.listen(port, () => {
    console.log(`Salon AI running on http://localhost:${port}`);
    console.log(`Background queues: ${jobRuntime?.enabled ? "enabled (Redis)" : "inline fallback"}`);
  });
}



