function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function endOfCurrentMonthIso(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return date.toISOString();
}

function normalizeStore(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const entries = Array.isArray(source.entries) ? source.entries : [];
  return {
    entries: entries
      .map((row) => ({
        email: normalizeEmail(row?.email),
        active: row?.active !== false,
        grantedAt: String(row?.grantedAt || ""),
        revokedAt: row?.revokedAt ? String(row.revokedAt) : null,
        linkedUserId: row?.linkedUserId ? String(row.linkedUserId) : null,
        linkedBusinessId: row?.linkedBusinessId ? String(row.linkedBusinessId) : null,
        appliedAt: row?.appliedAt ? String(row.appliedAt) : null
      }))
      .filter((row) => row.email)
  };
}

export function createFreeSubscriberAccessService({
  readFreeSubscriberAccessFile,
  writeFreeSubscriberAccessFile,
  getPrisma,
  writeAuditLog
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function readStore() {
    return normalizeStore(await readFreeSubscriberAccessFile?.());
  }

  async function writeStore(payload) {
    const normalized = normalizeStore(payload);
    await writeFreeSubscriberAccessFile?.(normalized);
    return normalized;
  }

  async function listEntries() {
    const prisma = prismaClient();
    const store = await readStore();
    const entries = await Promise.all(
      store.entries.map(async (entry) => {
        const user = prisma
          ? await prisma.user.findUnique({
              where: { email: entry.email },
              select: {
                id: true,
                name: true,
                email: true,
                businessId: true,
                business: {
                  select: {
                    name: true,
                    subscription: {
                      select: {
                        status: true,
                        plan: true,
                        currentPeriodEnd: true
                      }
                    }
                  }
                }
              }
            })
          : null;
        return {
          ...entry,
          user: user
            ? {
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                businessId: user.businessId || null,
                businessName: user.business?.name || "",
                subscriptionStatus: user.business?.subscription?.status || "",
                subscriptionPlan: user.business?.subscription?.plan || "",
                currentPeriodEnd: user.business?.subscription?.currentPeriodEnd || null
              }
            : null
        };
      })
    );

    return entries.sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")));
  }

  async function countActiveEntries() {
    const store = await readStore();
    return store.entries.filter((entry) => entry.active).length;
  }

  async function isGranted(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return false;
    const store = await readStore();
    return store.entries.some((entry) => entry.active && entry.email === normalizedEmail);
  }

  async function ensureSubscriberFreePlanByEmail(email, metadata = {}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return { granted: false, updated: false };
    const prisma = prismaClient();
    if (!prisma) return { granted: false, updated: false };
    const granted = await isGranted(normalizedEmail);
    if (!granted) return { granted: false, updated: false };

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true, businessId: true }
    });
    if (!user || String(user.role || "").trim().toLowerCase() !== "subscriber" || !user.businessId) {
      return { granted: true, updated: false };
    }

    await prisma.subscription.upsert({
      where: { businessId: user.businessId },
      create: {
        businessId: user.businessId,
        status: "active",
        plan: "lifetime_free",
        currentPeriodEnd: new Date(endOfCurrentMonthIso())
      },
      update: {
        status: "active",
        plan: "lifetime_free",
        currentPeriodEnd: new Date(endOfCurrentMonthIso())
      }
    });

    const store = await readStore();
    const nextEntries = store.entries.map((entry) =>
      entry.email === normalizedEmail
        ? {
            ...entry,
            linkedUserId: user.id,
            linkedBusinessId: user.businessId,
            appliedAt: new Date().toISOString()
          }
        : entry
    );
    await writeStore({ entries: nextEntries });

    await writeAuditLog?.({
      actorId: metadata.actorId || user.id,
      actorRole: metadata.actorRole || "system",
      action: "admin.free_subscriber_applied",
      entityType: "subscription",
      entityId: user.businessId,
      metadata: {
        email: normalizedEmail,
        businessId: user.businessId
      }
    });

    return { granted: true, updated: true, businessId: user.businessId, userId: user.id };
  }

  async function grantEmail(email, metadata = {}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    const store = await readStore();
    const nowIso = new Date().toISOString();
    const existing = store.entries.find((entry) => entry.email === normalizedEmail);
    const nextEntries = existing
      ? store.entries.map((entry) =>
          entry.email === normalizedEmail
            ? {
                ...entry,
                active: true,
                grantedAt: entry.grantedAt || nowIso,
                revokedAt: null
              }
            : entry
        )
      : [
          ...store.entries,
          {
            email: normalizedEmail,
            active: true,
            grantedAt: nowIso,
            revokedAt: null,
            linkedUserId: null,
            linkedBusinessId: null,
            appliedAt: null
          }
        ];
    await writeStore({ entries: nextEntries });
    await ensureSubscriberFreePlanByEmail(normalizedEmail, metadata);
    await writeAuditLog?.({
      actorId: metadata.actorId || null,
      actorRole: metadata.actorRole || "admin",
      action: "admin.free_subscriber_granted",
      entityType: "free_subscriber_access",
      entityId: normalizedEmail,
      metadata: { email: normalizedEmail }
    });
    return listEntries();
  }

  async function revokeEmail(email, metadata = {}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    const prisma = prismaClient();
    const store = await readStore();
    const nowIso = new Date().toISOString();
    const existing = store.entries.find((entry) => entry.email === normalizedEmail);
    if (!existing) return listEntries();
    const nextEntries = store.entries.map((entry) =>
      entry.email === normalizedEmail
        ? {
            ...entry,
            active: false,
            revokedAt: nowIso
          }
        : entry
    );
    await writeStore({ entries: nextEntries });

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, role: true, businessId: true }
      });
      if (user && String(user.role || "").trim().toLowerCase() === "subscriber" && user.businessId) {
        await prisma.subscription.upsert({
          where: { businessId: user.businessId },
          create: {
            businessId: user.businessId,
            status: "active",
            plan: "free_ending",
            currentPeriodEnd: new Date(endOfCurrentMonthIso())
          },
          update: {
            status: "active",
            plan: "free_ending",
            currentPeriodEnd: new Date(endOfCurrentMonthIso())
          }
        });
      }
    }

    await writeAuditLog?.({
      actorId: metadata.actorId || null,
      actorRole: metadata.actorRole || "admin",
      action: "admin.free_subscriber_revoked",
      entityType: "free_subscriber_access",
      entityId: normalizedEmail,
      metadata: { email: normalizedEmail, renewAtMonthEnd: true }
    });
    return listEntries();
  }

  return {
    listEntries,
    countActiveEntries,
    isGranted,
    grantEmail,
    revokeEmail,
    ensureSubscriberFreePlanByEmail,
    endOfCurrentMonthIso
  };
}
