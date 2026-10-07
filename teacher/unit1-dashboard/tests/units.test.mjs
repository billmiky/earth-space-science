import { test } from "node:test";
import assert from "node:assert/strict";
import { fmt, fmtTime, auToKm, logLumToLinear, kelvinTo, daysToYears, dateToJulian, julianToDate } from "../src/units.js";

test("fmt handles numbers, missing, and extremes", () => {
  assert.equal(fmt(null), "—");
  assert.equal(fmt(NaN), "—");
  assert.equal(fmt(1.31, 3), "1.31");
  assert.equal(fmt(0.0000004, 2), "4.0e-7");
});

test("fmtTime formats and rejects bad input", () => {
  assert.equal(fmtTime("2026-10-07T12:00:00Z"), "2026-10-07 12:00:00 UTC");
  assert.equal(fmtTime("garbage"), "—");
});

test("auToKm uses the standard AU", () => {
  assert.ok(Math.abs(auToKm(1) - 149597870.7) < 0.01);
});

test("logLumToLinear converts log10 luminosity", () => {
  assert.ok(Math.abs(logLumToLinear(0) - 1) < 1e-9);
  assert.ok(Math.abs(logLumToLinear(-2.40894) - Math.pow(10, -2.40894)) < 1e-9);
  assert.equal(logLumToLinear(null), null);
});

test("kelvinTo converts temperatures", () => {
  assert.equal(kelvinTo("C", 273.15).toFixed(2), "0.00");
  assert.ok(Math.abs(kelvinTo("F", 255.3722222222)) < 1e-6, "0°F ≈ 255.372 K");
  assert.equal(kelvinTo("K", 300), 300);
  assert.equal(kelvinTo("C", null), null);
});

test("daysToYears", () => {
  assert.ok(Math.abs(daysToYears(365.25) - 1) < 1e-9);
});

test("dateToJulian / julianToDate round-trip", () => {
  const d = new Date("2026-10-07T12:00:00Z");
  const jd = dateToJulian(d);
  const back = julianToDate(jd);
  assert.ok(Math.abs(back.getTime() - d.getTime()) < 1000, `round-trip off by ${back - d}ms`);
});

test("dateToJulian known value (J2000.0)", () => {
  assert.ok(Math.abs(dateToJulian(new Date("2000-01-01T12:00:00Z")) - 2451545.0) < 1e-6);
});
