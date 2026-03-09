export function createUnavailablePrisma() {
  // Stable proxy so services composed before runtime init still see the live client once it becomes available.
  const reject = async () => {
    throw new Error("Prisma is not initialized. Run: npm run prisma:generate");
  };
  const model = new Proxy({}, { get: () => reject });
  const state = {
    current: null
  };
  return new Proxy(state, {
    get(target, prop) {
      if (prop === "__setClient") {
        return (client) => {
          target.current = client || null;
        };
      }
      if (prop === "__isAvailable") {
        return Boolean(target.current);
      }
      if (prop === "__current") {
        return target.current;
      }
      if (target.current) {
        const value = target.current[prop];
        return typeof value === "function" ? value.bind(target.current) : value;
      }
      return model;
    },
    set(target, prop, value) {
      if (target.current) {
        target.current[prop] = value;
      } else {
        target[prop] = value;
      }
      return true;
    }
  });
}

export function createRuntimeBootstrapService({
  getPrisma,
  setPrisma,
  getJobRuntime,
  setJobRuntime,
  getRuntimeReadyPromise,
  setRuntimeReadyPromise,
  safeConnect,
  closeRedis,
  getRedisUrl,
  isRedisEnabled,
  createJobRuntime,
  sendBookingNotifications,
  billingEventService,
  lexiDemoSeedService,
  bcrypt
} = {}) {
  async function initPrisma() {
    try {
      const mod = await import("@prisma/client");
      const client = new mod.PrismaClient();
      await client.$connect();
      return client;
    } catch (error) {
      console.error("Prisma initialization failed:", error?.message || error);
      return null;
    }
  }

  async function assertDatabaseSchemaReady() {
    if (!getPrisma().__isAvailable) return false;
    try {
      await getPrisma().business.findFirst({
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
    return true;
  }

  async function initializeRuntime() {
    const existing = getRuntimeReadyPromise();
    if (existing) return existing;

    const promise = (async () => {
      const prismaClient = await initPrisma();
      if (prismaClient) {
        setPrisma(prismaClient);
      }
      const prismaReady = await assertDatabaseSchemaReady();
      if (!prismaReady) {
        console.error("Prisma is unavailable. Starting server in degraded mode.");
      }
      await safeConnect();
      if (prismaReady) {
        try {
          await lexiDemoSeedService.ensureLexiDemoSubscribedBusinesses();
        } catch (error) {
          console.error("Lexi demo seed failed:", error?.message || error);
        }
      }
      setJobRuntime(createJobRuntime({
        redisUrl: isRedisEnabled() ? getRedisUrl() : "",
        handlers: {
          onNotification: async (payload) => {
            await sendBookingNotifications(payload);
          },
          onBillingEvent: async (payload) => {
            await billingEventService.processBillingEvent(payload);
          }
        }
      }));
    })();

    setRuntimeReadyPromise(promise);
    return promise;
  }

  async function syncAdminFromEnv() {
    if (!getPrisma().__isAvailable) return;
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
    if (!adminEmail || !adminPassword) return;

    try {
      await getPrisma().user.upsert({
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

  async function shutdownRuntime() {
    try {
      const jobRuntime = getJobRuntime();
      if (jobRuntime) await jobRuntime.close();
    } catch {
      // ignore
    }
    await closeRedis();
  }

  return {
    initializeRuntime,
    syncAdminFromEnv,
    shutdownRuntime
  };
}
