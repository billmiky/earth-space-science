import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeGoesRecord, normalizeGoesSeries, flareClass,
  normalizeExoplanetRow, derivedLuminosity, missing,
} from "../src/models.js";

test("normalizeGoesRecord handles valid record", () => {
  const r = normalizeGoesRecord({
    time_tag: "2026-10-07T17:20:00Z", satellite: 18, flux: 8.7e-7,
    observed_flux: 9.4e-7, electron_correction: 6.3e-8,
    electron_contaminaton: false, energy: "0.1-0.8nm",
  });
  assert.ok(r.timeMs > 0);
  assert.equal(r.flux, 8.7e-7);
  assert.equal(r.channel, "0.1-0.8nm");
  assert.equal(r.contaminated, false);
});

test("normalizeGoesRecord drops malformed timestamps", () => {
  const r = normalizeGoesRecord({ time_tag: "not-a-time", flux: 1e-7, energy: "0.1-0.8nm" });
  assert.equal(r.timeMs, null);
});

test("normalizeGoesSeries filters channel, sorts, drops missing", () => {
  const raw = [
    { time_tag: "2026-10-07T12:00:00Z", flux: 2e-7, energy: "0.1-0.8nm" },
    { time_tag: "2026-10-07T11:00:00Z", flux: 1e-7, energy: "0.05-0.4nm" }, // wrong channel
    { time_tag: "2026-10-07T10:00:00Z", flux: 5e-7, energy: "0.1-0.8nm" },
    { time_tag: "bad", flux: 9e-7, energy: "0.1-0.8nm" },                    // bad time
    { time_tag: "2026-10-07T09:00:00Z", flux: null, energy: "0.1-0.8nm" },   // missing flux
  ];
  const series = normalizeGoesSeries(raw, "0.1-0.8nm");
  assert.equal(series.length, 2);
  assert.equal(series[0].flux, 5e-7);
  assert.equal(series[1].flux, 2e-7);
});

test("flareClass classifies flux bands", () => {
  assert.equal(flareClass(5e-5), "M");
  assert.equal(flareClass(2e-4), "X");
  assert.equal(flareClass(3e-7), "B");
  assert.equal(flareClass(2e-9), "A");
  assert.equal(flareClass(null), null);
});

test("normalizeExoplanetRow converts units", () => {
  const r = normalizeExoplanetRow({
    pl_name: "X b", hostname: "X", pl_rade: 1.1, pl_bmasse: 2.2,
    pl_orbper: 10, pl_orbeccen: 0.01, pl_eqt: 250, pl_orbsmax: 0.5,
    st_teff: 5772, st_mass: 1, st_rad: 1, st_lum: 0.0,
    disc_year: 2020, discoverymethod: "Transit", sy_dist: 10,
  });
  assert.equal(r.radiusEarth, 1.1);
  assert.ok(Math.abs(r.starLumLinear - 1) < 1e-9);
  assert.ok(Math.abs(r.distanceLy - 32.6156) < 1e-3);
});

test("normalizeExoplanetRow keeps nulls as null", () => {
  const r = normalizeExoplanetRow({ pl_name: "Y b" });
  assert.equal(r.radiusEarth, null);
  assert.equal(r.starLumLinear, null);
});

test("derivedLuminosity matches Stefan-Boltzmann", () => {
  const l = derivedLuminosity(5772, 1);
  assert.ok(Math.abs(l - 1) < 1e-9);
  assert.equal(derivedLuminosity(null, 1), null);
});

test("missing helper", () => {
  assert.equal(missing(null), true);
  assert.equal(missing(NaN), true);
  assert.equal(missing(0), false);
});
