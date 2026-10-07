// cache.js — Fetch caching with freshness, stale, error and last-good behavior.
// Injectable storage/fetch so it can be unit tested in Node.

export const CACHE_PREFIX = "ess.cache.";

/** Pure freshness check. */
export function isFresh(fetchedAtMs, maxAgeMs, nowMs = Date.now()) {
  if (!fetchedAtMs) return false;
  return nowMs - fetchedAtMs < maxAgeMs;
}

/** Pure status classifier for a cached record. */
export function classifyCache(record, maxAgeMs, nowMs = Date.now()) {
  if (!record || !record.data) return "empty";
  return isFresh(record.fetchedAt, maxAgeMs, nowMs) ? "fresh" : "stale";
}

/**
 * Fetch with a localStorage-backed cache.
 * Returns { status, data, fetchedAt, error }.
 *   status: "fresh" | "stale" | "error" (fresh/stale carry data; error has no data)
 * On a failed fetch with an existing cached payload, the cached payload is
 * returned with status "stale" (last-successful-response behavior) — it is
 * NOT silently labelled as live data.
 */
export async function cachedFetch(key, url, opts = {}) {
  const {
    maxAgeMs = 5 * 60 * 1000,
    storage = (typeof localStorage !== "undefined" ? localStorage : null),
    fetchFn = (typeof fetch !== "undefined" ? fetch : null),
    parseJson = true,
  } = opts;

  const cacheKey = CACHE_PREFIX + key;
  let record = null;
  if (storage) {
    try {
      const raw = storage.getItem(cacheKey);
      if (raw) record = JSON.parse(raw);
    } catch {
      record = null;
    }
  }

  const cached = record && record.data !== undefined ? record : null;

  if (!fetchFn) {
    return cached
      ? { status: classifyCache(cached, maxAgeMs), data: cached.data, fetchedAt: cached.fetchedAt, error: null }
      : { status: "error", data: null, fetchedAt: null, error: new Error("No fetch function available") };
  }

  // A fresh cache satisfies the request without touching the network.
  if (cached && isFresh(cached.fetchedAt, maxAgeMs)) {
    return { status: "fresh", data: cached.data, fetchedAt: cached.fetchedAt, error: null };
  }

  try {
    const res = await fetchFn(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = parseJson ? await res.json() : await res.text();
    const fetchedAt = Date.now();
    if (storage) {
      try {
        storage.setItem(cacheKey, JSON.stringify({ data, fetchedAt }));
      } catch {
        /* quota exceeded — keep in-memory only */
      }
    }
    return { status: "fresh", data, fetchedAt, error: null };
  } catch (err) {
    if (cached) {
      return { status: "stale", data: cached.data, fetchedAt: cached.fetchedAt, error: err };
    }
    return { status: "error", data: null, fetchedAt: null, error: err };
  }
}
