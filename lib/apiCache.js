/**
 * High-performance, zero-dependency in-memory cache for Next.js API routes.
 * Drastically cuts down Neon database traffic for polling endpoints (admin stats, bookings feed).
 */

const cacheStore = globalThis.__a2z_api_cache || new Map();
if (!globalThis.__a2z_api_cache) {
  globalThis.__a2z_api_cache = cacheStore;
}

const tagMap = globalThis.__a2z_api_tags || new Map();
if (!globalThis.__a2z_api_tags) {
  globalThis.__a2z_api_tags = tagMap;
}

export function getCached(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached(key, data, ttlSeconds = 3, tags = []) {
  const expiresAt = Date.now() + (ttlSeconds * 1000);
  cacheStore.set(key, { data, expiresAt });

  for (const tag of tags) {
    if (!tagMap.has(tag)) {
      tagMap.set(tag, new Set());
    }
    tagMap.get(tag).add(key);
  }
}

export function invalidateTags(...tags) {
  const flatTags = tags.flat();
  for (const tag of flatTags) {
    const keys = tagMap.get(tag);
    if (keys) {
      for (const key of keys) {
        cacheStore.delete(key);
      }
      tagMap.delete(tag);
    }
  }
}

export function clearAllCache() {
  cacheStore.clear();
  tagMap.clear();
}
