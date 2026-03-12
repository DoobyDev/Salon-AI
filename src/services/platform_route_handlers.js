import path from "node:path";

export function createPlatformRouteHandlers({
  prisma,
  isRedisEnabled,
  jobRuntime,
  getCached,
  setCached,
  getAvailableSlotsForBusiness,
  mapBusiness,
  openai,
  cancellationPolicy,
  publicDir
} = {}) {
  function healthHandler(_req, res) {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  async function readinessHandler(_req, res) {
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
  }

  async function configHandler(_req, res) {
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
    return res.json(payload);
  }

  function authPageHandler(_req, res) {
    return res.sendFile(path.join(publicDir, "auth.html"));
  }

  function dashboardPageHandler(req, res) {
    const requestedRole = String(req?.query?.role || "").trim().toLowerCase();
    const dashboardFile =
      requestedRole === "admin"
        ? "dashboard-admin.html"
        : requestedRole === "customer"
          ? "dashboard-customer.html"
          : "dashboard.html";
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.sendFile(path.join(publicDir, dashboardFile));
  }

  function legalPageHandler(_req, res) {
    return res.sendFile(path.join(publicDir, "legal.html"));
  }

  return {
    healthHandler,
    readinessHandler,
    configHandler,
    authPageHandler,
    dashboardPageHandler,
    legalPageHandler
  };
}
