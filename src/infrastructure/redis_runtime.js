import { createClient } from "redis";

const redisUrl = String(process.env.REDIS_URL || "").trim();
const redisPrefix = String(process.env.REDIS_PREFIX || "salonai").trim();

let client = null;
let ready = false;

async function safeConnect() {
  if (!redisUrl) return;
  if (client) return;
  try {
    const c = createClient({ url: redisUrl });
    c.on("error", (error) => {
      console.error("Redis error:", error.message);
    });
    await c.connect();
    await c.ping();
    client = c;
    ready = true;
  } catch (error) {
    ready = false;
    client = null;
    console.error("Redis init failed:", error.message);
  }
}

function makeKey(key) {
  return `${redisPrefix}:${key}`;
}

async function getJson(key) {
  if (!ready || !client) return null;
  try {
    const raw = await client.get(makeKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setJson(key, value, ttlMs = 15_000) {
  if (!ready || !client) return false;
  try {
    await client.set(makeKey(key), JSON.stringify(value), { PX: Math.max(1_000, ttlMs) });
    return true;
  } catch {
    return false;
  }
}

async function clearCachePrefix(prefix = "cache:") {
  if (!ready || !client) return;
  try {
    const pattern = makeKey(`${prefix}*`);
    const keys = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 200 })) {
      keys.push(key);
      if (keys.length >= 200) {
        await client.del(keys.splice(0, keys.length));
      }
    }
    if (keys.length) {
      await client.del(keys);
    }
  } catch {
    // best effort
  }
}

async function incrementRateLimit(key, windowMs) {
  if (!ready || !client) return null;
  try {
    const namespaced = makeKey(`rl:${key}`);
    const count = await client.incr(namespaced);
    if (count === 1) {
      await client.pexpire(namespaced, Math.max(1_000, windowMs));
    }
    const ttlMs = await client.pttl(namespaced);
    return { count, ttlMs: Math.max(ttlMs, 0) };
  } catch {
    return null;
  }
}

function isRedisEnabled() {
  return ready && Boolean(client);
}

function getRedisUrl() {
  return redisUrl;
}

async function closeRedis() {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    // ignore
  } finally {
    client = null;
    ready = false;
  }
}

export {
  clearCachePrefix,
  closeRedis,
  getJson,
  getRedisUrl,
  incrementRateLimit,
  isRedisEnabled,
  safeConnect,
  setJson
};
