function createMemoryLimiter({ windowMs, max, keyFn }) {
  const counters = new Map();
  return (req, res, next) => {
    const identifier = keyFn(req);
    const now = Date.now();
    const key = `${identifier}`;
    const current = counters.get(key);

    if (!current || now > current.expiresAt) {
      counters.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({ error: "Too many requests. Please retry shortly." });
    }
    return next();
  };
}

export function createDistributedRateLimiter({
  name,
  windowMs,
  max,
  keyFn,
  incrementRateLimit
}) {
  const fallbackLimiter = createMemoryLimiter({ windowMs, max, keyFn });
  if (typeof incrementRateLimit !== "function") {
    return fallbackLimiter;
  }

  return async (req, res, next) => {
    try {
      const identifier = keyFn(req);
      const bucketKey = `${name}:${identifier}:${Math.floor(Date.now() / windowMs)}`;
      const result = await incrementRateLimit(bucketKey, windowMs);
      if (!result) {
        return fallbackLimiter(req, res, next);
      }
      if (result.count > max) {
        res.setHeader("Retry-After", Math.max(1, Math.ceil(result.ttlMs / 1000)));
        return res.status(429).json({ error: "Too many requests. Please retry shortly." });
      }
      return next();
    } catch {
      return next();
    }
  };
}
