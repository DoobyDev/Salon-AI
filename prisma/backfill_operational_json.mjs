import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dryRun = process.argv.includes("--dry-run");

const supportedAccountingProviders = ["quickbooks", "xero", "freshbooks", "sage"];

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDate(value, fallback = new Date()) {
  return toDateOrNull(value) || fallback;
}

async function readJson(filename) {
  try {
    const raw = await readFile(path.join(dataDir, filename), "utf8");
    const parsed = JSON.parse(raw);
    return asObject(parsed);
  } catch {
    return {};
  }
}

function normalizeShiftDays(value) {
  const allowed = new Set(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
  const rows = Array.isArray(value) ? value : [];
  return rows.map((v) => String(v || "").trim().toLowerCase()).filter((v, i, arr) => allowed.has(v) && arr.indexOf(v) === i);
}

function summarize(name, stats) {
  console.log(`${name}:`, stats);
}

async function main() {
  const [
    waitlistJson,
    staffJson,
    commercialJson,
    revenueJson,
    profitabilityJson,
    socialJson,
    accountingJson,
    reportQueueJson
  ] = await Promise.all([
    readJson("waitlist.json"),
    readJson("staff_roster.json"),
    readJson("commercial_controls.json"),
    readJson("revenue_spend.json"),
    readJson("profitability_inputs.json"),
    readJson("social_media.json"),
    readJson("accounting_integrations.json"),
    readJson("business_report_email_queue.json")
  ]);

  const businessIdsInFiles = new Set([
    ...Object.keys(waitlistJson),
    ...Object.keys(staffJson),
    ...Object.keys(commercialJson),
    ...Object.keys(revenueJson),
    ...Object.keys(profitabilityJson),
    ...Object.keys(socialJson),
    ...Object.keys(accountingJson),
    ...Object.keys(reportQueueJson)
  ]);

  const existingBusinesses = await prisma.business.findMany({
    where: { id: { in: [...businessIdsInFiles] } },
    select: { id: true }
  });
  const validBusinessIds = new Set(existingBusinesses.map((b) => b.id));
  const skippedBusinesses = [...businessIdsInFiles].filter((id) => !validBusinessIds.has(id));

  const stats = {
    businessesInFiles: businessIdsInFiles.size,
    businessesMatched: validBusinessIds.size,
    businessesSkippedMissingInDb: skippedBusinesses.length
  };
  summarize("business_scope", stats);
  console.log("mode:", dryRun ? "dry-run (no writes)" : "write");
  if (skippedBusinesses.length) {
    console.log("Skipped business IDs not found in DB (sample):", skippedBusinesses.slice(0, 20));
  }

  // Waitlist
  {
    let inserted = 0;
    for (const businessId of validBusinessIds) {
      const entries = asArray(waitlistJson?.[businessId]?.entries);
      if (!dryRun) {
        await prisma.waitlistEntry.deleteMany({ where: { businessId } });
      }
      const rows = entries
        .map((item) => {
          const id = String(item?.id || "").trim();
          const customerName = String(item?.customerName || "").trim();
          if (!id || !customerName) return null;
          return {
            id,
            businessId,
            customerName,
            customerPhone: String(item?.customerPhone || "").trim(),
            customerEmail: String(item?.customerEmail || "").trim().toLowerCase() || null,
            service: String(item?.service || "").trim(),
            preferredDate: String(item?.preferredDate || "").trim() || null,
            preferredTime: String(item?.preferredTime || "").trim() || null,
            status: String(item?.status || "waiting").trim().toLowerCase() || "waiting",
            notes: String(item?.notes || "").trim() || null,
            lastActionAt: toDateOrNull(item?.lastActionAt),
            createdAt: toDate(item?.createdAt),
            updatedAt: toDate(item?.updatedAt)
          };
        })
        .filter(Boolean);
      if (rows.length) {
        if (!dryRun) {
          await prisma.waitlistEntry.createMany({ data: rows });
        }
        inserted += rows.length;
      }
    }
    summarize("waitlist", { inserted });
  }

  // Staff roster
  {
    let membersInserted = 0;
    let rotaWeeksInserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(staffJson?.[businessId]);
      if (!dryRun) {
        await prisma.staffRosterMember.deleteMany({ where: { businessId } });
        await prisma.staffRotaWeek.deleteMany({ where: { businessId } });
      }

      const members = asArray(record.members)
        .map((m) => {
          const id = String(m?.id || "").trim();
          const name = String(m?.name || "").trim();
          if (!id || !name) return null;
          return {
            id,
            businessId,
            name,
            role: String(m?.role || "staff").trim() || "staff",
            availability: String(m?.availability || "off_duty").trim().toLowerCase() || "off_duty",
            shiftDays: normalizeShiftDays(m?.shiftDays),
            createdAt: toDate(m?.updatedAt),
            updatedAt: toDate(m?.updatedAt)
          };
        })
        .filter(Boolean);
      if (members.length) {
        if (!dryRun) {
          await prisma.staffRosterMember.createMany({ data: members });
        }
        membersInserted += members.length;
      }

      const rotaWeeks = Object.entries(asObject(record.rotaWeeks))
        .map(([weekStart, week]) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(String(weekStart || ""))) return null;
          const source = asObject(week);
          return {
            id: randomUUID(),
            businessId,
            weekStart: String(weekStart),
            cells: asObject(source.cells),
            sicknessLogs: asArray(source.sicknessLogs),
            createdAt: toDate(source.updatedAt),
            updatedAt: toDate(source.updatedAt)
          };
        })
        .filter(Boolean);
      if (rotaWeeks.length) {
        if (!dryRun) {
          await prisma.staffRotaWeek.createMany({ data: rotaWeeks });
        }
        rotaWeeksInserted += rotaWeeks.length;
      }
    }
    summarize("staff_roster", { membersInserted, rotaWeeksInserted });
  }

  // Commercial controls
  {
    let membershipsInserted = 0;
    let packagesInserted = 0;
    let giftCardsInserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(commercialJson?.[businessId]);
      if (!dryRun) {
        await prisma.commercialMembership.deleteMany({ where: { businessId } });
        await prisma.commercialPackage.deleteMany({ where: { businessId } });
        await prisma.commercialGiftCard.deleteMany({ where: { businessId } });
      }

      const memberships = asArray(record.memberships)
        .map((m) => {
          const id = String(m?.id || "").trim();
          const name = String(m?.name || "").trim();
          if (!id || !name) return null;
          return {
            id,
            businessId,
            name,
            price: Number(m?.price || 0),
            billingCycle: String(m?.billingCycle || "monthly").trim().toLowerCase() || "monthly",
            status: String(m?.status || "active").trim().toLowerCase() || "active",
            benefits: String(m?.benefits || "").trim(),
            createdAt: toDate(m?.updatedAt),
            updatedAt: toDate(m?.updatedAt)
          };
        })
        .filter(Boolean);
      if (memberships.length) {
        if (!dryRun) {
          await prisma.commercialMembership.createMany({ data: memberships });
        }
        membershipsInserted += memberships.length;
      }

      const packages = asArray(record.packages)
        .map((p) => {
          const id = String(p?.id || "").trim();
          const name = String(p?.name || "").trim();
          if (!id || !name) return null;
          return {
            id,
            businessId,
            name,
            price: Number(p?.price || 0),
            sessionCount: Math.max(1, Math.floor(Number(p?.sessionCount || 1))),
            remainingSessions: Math.max(0, Math.floor(Number(p?.remainingSessions || 0))),
            status: String(p?.status || "active").trim().toLowerCase() || "active",
            createdAt: toDate(p?.updatedAt),
            updatedAt: toDate(p?.updatedAt)
          };
        })
        .filter(Boolean);
      if (packages.length) {
        if (!dryRun) {
          await prisma.commercialPackage.createMany({ data: packages });
        }
        packagesInserted += packages.length;
      }

      const giftCards = asArray(record.giftCards)
        .map((g) => {
          const id = String(g?.id || "").trim();
          const code = String(g?.code || "").trim();
          if (!id || !code) return null;
          return {
            id,
            businessId,
            code,
            purchaserName: String(g?.purchaserName || "").trim(),
            recipientName: String(g?.recipientName || "").trim(),
            initialBalance: Number(g?.initialBalance || 0),
            remainingBalance: Number((g?.remainingBalance ?? g?.initialBalance) || 0),
            status: String(g?.status || "active").trim().toLowerCase() || "active",
            issuedAt: toDate(g?.issuedAt),
            expiresAt: toDateOrNull(g?.expiresAt),
            createdAt: toDate(g?.issuedAt),
            updatedAt: toDate(g?.updatedAt || g?.issuedAt)
          };
        })
        .filter(Boolean);
      if (giftCards.length) {
        if (!dryRun) {
          await prisma.commercialGiftCard.createMany({ data: giftCards });
        }
        giftCardsInserted += giftCards.length;
      }
    }
    summarize("commercial_controls", { membershipsInserted, packagesInserted, giftCardsInserted });
  }

  // Revenue spend
  {
    let inserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(revenueJson?.[businessId]);
      if (!dryRun) {
        await prisma.revenueSpendChannel.deleteMany({ where: { businessId } });
      }
      const rows = Object.entries(record)
        .map(([channel, spend]) => {
          const cleanChannel = String(channel || "").trim().toLowerCase();
          if (!cleanChannel) return null;
          const spendValue = Number(spend || 0);
          if (!Number.isFinite(spendValue) || spendValue < 0) return null;
          return {
            id: `${businessId}:${cleanChannel}`,
            businessId,
            channel: cleanChannel,
            spend: spendValue
          };
        })
        .filter(Boolean);
      if (rows.length) {
        if (!dryRun) {
          await prisma.revenueSpendChannel.createMany({ data: rows });
        }
        inserted += rows.length;
      }
    }
    summarize("revenue_spend", { inserted });
  }

  // Profitability inputs
  {
    let payrollInserted = 0;
    let configsUpserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(profitabilityJson?.[businessId]);
      if (!dryRun) {
        await prisma.profitabilityPayrollEntry.deleteMany({ where: { businessId } });
      }

      const payrollRows = asArray(record.payrollEntries)
        .map((e) => {
          const id = String(e?.id || "").trim();
          const staffName = String(e?.staffName || "").trim();
          if (!id || !staffName) return null;
          return {
            id,
            businessId,
            staffName,
            role: String(e?.role || "").trim(),
            hours: Number(e?.hours || 0),
            hourlyRate: Number(e?.hourlyRate || 0),
            bonus: Number(e?.bonus || 0),
            createdAt: toDate(e?.updatedAt),
            updatedAt: toDate(e?.updatedAt)
          };
        })
        .filter(Boolean);
      if (payrollRows.length) {
        if (!dryRun) {
          await prisma.profitabilityPayrollEntry.createMany({ data: payrollRows });
        }
        payrollInserted += payrollRows.length;
      }

      const fixedCosts = asObject(record.fixedCosts);
      if (!dryRun) {
        await prisma.profitabilityConfig.upsert({
          where: { businessId },
          update: {
            rent: Number(fixedCosts.rent || 0),
            utilities: Number(fixedCosts.utilities || 0),
            software: Number(fixedCosts.software || 0),
            other: Number(fixedCosts.other || 0),
            cogsPercent: Number(record.cogsPercent || 0)
          },
          create: {
            businessId,
            rent: Number(fixedCosts.rent || 0),
            utilities: Number(fixedCosts.utilities || 0),
            software: Number(fixedCosts.software || 0),
            other: Number(fixedCosts.other || 0),
            cogsPercent: Number(record.cogsPercent || 0)
          }
        });
      }
      configsUpserted += 1;
    }
    summarize("profitability_inputs", { payrollInserted, configsUpserted });
  }

  // Social media extras
  {
    let upserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(socialJson?.[businessId]);
      if (!Object.keys(record).length) continue;
      if (!dryRun) {
        await prisma.socialMediaProfile.upsert({
          where: { businessId },
          update: {
            customSocial: String(record.customSocial || ""),
            socialImageUrl: String(record.socialImageUrl || "")
          },
          create: {
            businessId,
            customSocial: String(record.customSocial || ""),
            socialImageUrl: String(record.socialImageUrl || "")
          }
        });
      }
      upserted += 1;
    }
    summarize("social_media_extras", { upserted });
  }

  // Accounting integrations
  {
    let inserted = 0;
    for (const businessId of validBusinessIds) {
      const record = asObject(accountingJson?.[businessId]);
      if (!dryRun) {
        await prisma.accountingIntegration.deleteMany({ where: { businessId } });
      }
      const rows = Object.entries(record)
        .map(([provider, item]) => {
          const p = String(provider || "").trim().toLowerCase();
          if (!supportedAccountingProviders.includes(p)) return null;
          const row = asObject(item);
          return {
            id: `${businessId}:${p}`,
            businessId,
            provider: p,
            status: String(row.status || "not_connected"),
            accountLabel: String(row.accountLabel || ""),
            syncMode: String(row.syncMode || "daily"),
            connectedAt: toDateOrNull(row.connectedAt),
            createdAt: toDate(row.updatedAt),
            updatedAt: toDate(row.updatedAt)
          };
        })
        .filter(Boolean);
      if (rows.length) {
        if (!dryRun) {
          await prisma.accountingIntegration.createMany({ data: rows });
        }
        inserted += rows.length;
      }
    }
    summarize("accounting_integrations", { inserted });
  }

  // Business report email queue
  {
    let inserted = 0;
    for (const businessId of validBusinessIds) {
      const items = asArray(reportQueueJson?.[businessId]);
      if (!dryRun) {
        await prisma.businessReportEmailQueueItem.deleteMany({ where: { businessId } });
      }
      const rows = items
        .map((item) => {
          const id = String(item?.id || "").trim();
          const recipientEmail = String(item?.recipientEmail || "").trim().toLowerCase();
          if (!id || !recipientEmail) return null;
          return {
            id,
            businessId,
            recipientEmail,
            subject: String(item?.subject || "").trim() || `Business Report (${new Date().toISOString().slice(0, 10)})`,
            note: String(item?.note || "").trim(),
            report: item?.report && typeof item.report === "object" ? item.report : {},
            queuedAt: toDate(item?.queuedAt),
            status: String(item?.status || "queued").trim() || "queued",
            requestedBy: item?.requestedBy && typeof item.requestedBy === "object" ? item.requestedBy : {},
            createdAt: toDate(item?.queuedAt),
            updatedAt: toDate(item?.queuedAt)
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.queuedAt - a.queuedAt)
        .slice(0, 100);
      if (rows.length) {
        if (!dryRun) {
          await prisma.businessReportEmailQueueItem.createMany({ data: rows });
        }
        inserted += rows.length;
      }
    }
    summarize("business_report_email_queue", { inserted });
  }

  console.log(`Operational JSON backfill complete (${dryRun ? "dry-run" : "write"} mode).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Backfill failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
