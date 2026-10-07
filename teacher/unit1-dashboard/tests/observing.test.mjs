import { test } from "node:test";
import assert from "node:assert/strict";
import { tzOffsetMinutes, localWallToUtc } from "../src/panels/observing.js";

test("tzOffsetMinutes — New York EDT (UTC-4) in July", () => {
  const d = new Date("2026-07-15T12:00:00Z");
  assert.equal(tzOffsetMinutes(d, "America/New_York"), -240);
});

test("tzOffsetMinutes — New York EST (UTC-5) in January", () => {
  const d = new Date("2026-01-15T12:00:00Z");
  assert.equal(tzOffsetMinutes(d, "America/New_York"), -300);
});

test("tzOffsetMinutes — invalid timezone falls back to 0", () => {
  const d = new Date("2026-07-15T12:00:00Z");
  assert.equal(tzOffsetMinutes(d, "Not/AZone"), 0);
});

test("localWallToUtc converts NY local to UTC", () => {
  // 2026-07-15 21:00 in New York (EDT, UTC-4) -> 2026-07-16 01:00 UTC
  const utc = localWallToUtc(2026, 7, 15, 21, 0, "America/New_York");
  assert.equal(utc.toISOString(), "2026-07-16T01:00:00.000Z");
});

test("localWallToUtc converts NY winter local to UTC", () => {
  // 2026-01-15 21:00 in New York (EST, UTC-5) -> 2026-01-16 02:00 UTC
  const utc = localWallToUtc(2026, 1, 15, 21, 0, "America/New_York");
  assert.equal(utc.toISOString(), "2026-01-16T02:00:00.000Z");
});
