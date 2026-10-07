import { test } from "node:test";
import assert from "node:assert/strict";
import { cachedFetch, isFresh, classifyCache } from "../src/cache.js";

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}

test("isFresh", () => {
  const now = 1000000;
  assert.equal(isFresh(now - 1000, 5000, now), true);
  assert.equal(isFresh(now - 6000, 5000, now), false);
  assert.equal(isFresh(null, 5000, now), false);
});

test("classifyCache", () => {
  const now = 1000000;
  assert.equal(classifyCache({ data: 1, fetchedAt: now - 1000 }, 5000, now), "fresh");
  assert.equal(classifyCache({ data: 1, fetchedAt: now - 6000 }, 5000, now), "stale");
  assert.equal(classifyCache(null, 5000, now), "empty");
});

test("cachedFetch returns fresh data and caches it", async () => {
  const storage = new FakeStorage();
  let calls = 0;
  const fetchFn = async () => {
    calls += 1;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  const r1 = await cachedFetch("k", "https://x.test", { storage, fetchFn, maxAgeMs: 60000 });
  assert.equal(r1.status, "fresh");
  assert.deepEqual(r1.data, { ok: true });
  assert.equal(calls, 1);

  // Second call should hit the cache (fresh), no upstream fetch.
  const r2 = await cachedFetch("k", "https://x.test", { storage, fetchFn, maxAgeMs: 60000 });
  assert.equal(r2.status, "fresh");
  assert.equal(calls, 1);
});

test("cachedFetch returns stale (last-good) when fetch fails", async () => {
  const storage = new FakeStorage();
  let fail = false;
  const fetchFn = async () => {
    if (fail) return new Response("down", { status: 500 });
    return new Response(JSON.stringify({ v: 1 }), { status: 200 });
  };
  await cachedFetch("k", "https://x.test", { storage, fetchFn, maxAgeMs: 60000 });
  fail = true;
  // maxAgeMs: 0 forces a refetch attempt so the failure path is exercised.
  const r = await cachedFetch("k", "https://x.test", { storage, fetchFn, maxAgeMs: 0 });
  assert.equal(r.status, "stale");
  assert.deepEqual(r.data, { v: 1 });
  assert.ok(r.error);
});

test("cachedFetch returns error with no cached data", async () => {
  const storage = new FakeStorage();
  const fetchFn = async () => new Response("down", { status: 500 });
  const r = await cachedFetch("k", "https://x.test", { storage, fetchFn });
  assert.equal(r.status, "error");
  assert.equal(r.data, null);
  assert.ok(r.error);
});
