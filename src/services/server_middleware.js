export function createServerLimiters({
  createDistributedRateLimiter,
  rateKeyByIp,
  rateKeyByUserOrIp,
  incrementRateLimit
} = {}) {
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

  return {
    apiLimiter,
    authLimiter,
    bookingLimiter,
    chatLimiter
  };
}

export function applyServerMiddleware({
  app,
  express,
  helmet,
  cors,
  compression,
  getCorsOptions,
  publicDir,
  apiLimiter,
  stripeBillingWebhookHandler,
  paypalBillingWebhookHandler
} = {}) {
  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(compression());

  // Webhook endpoints must keep their provider-specific body parsers ahead of the global JSON parser.
  app.post("/api/billing/webhook", express.raw({ type: "application/json" }), stripeBillingWebhookHandler);
  app.post("/api/billing/paypal-webhook", express.json({ limit: "1mb" }), paypalBillingWebhookHandler);

  app.use(express.json({ limit: "1mb" }));
  app.use("/api", apiLimiter);
  app.use(express.static(publicDir, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const normalizedPath = String(filePath || "").replace(/\\/g, "/");
      if (
        normalizedPath.endsWith("/index.html") ||
        normalizedPath.endsWith("/dashboard.html") ||
        normalizedPath.endsWith("/dashboard-admin.html") ||
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
        normalizedPath.endsWith("/dashboard-admin-shell.js") ||
        normalizedPath.endsWith("/auth.js") ||
        normalizedPath.endsWith("/theme-toggle.js")
      ) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
        return;
      }

      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  }));
}
