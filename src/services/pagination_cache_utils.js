export function createPaginationCacheUtils({
  defaultPageSize,
  maxPageSize,
  readCache,
  getJson,
  setJson,
  clearCachePrefix
}) {
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

  return {
    parsePageSize,
    encodeCursor,
    decodeCursor,
    makeCacheKey,
    getCached,
    setCached,
    clearReadCache
  };
}
