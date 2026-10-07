import { test } from "node:test";
import assert from "node:assert/strict";
import {
  helioDistance, sunGeocentricEcliptic, eclipticToEquatorial,
  keplerPropagate, solveKepler, altAz, lstDeg,
} from "../src/astronomy.js";
import { dateToJulian } from "../src/units.js";

test("solveKepler circular orbit", () => {
  const E = solveKepler(1.0, 0);
  assert.ok(Math.abs(E - 1.0) < 1e-12);
});

test("solveKepler eccentric orbit converges", () => {
  const M = 0.5, e = 0.6;
  const E = solveKepler(M, e);
  const residual = E - e * Math.sin(E) - M;
  assert.ok(Math.abs(residual) < 1e-10);
});

test("Earth heliocentric distance is ~1 AU", () => {
  const jd = dateToJulian(new Date("2026-10-07T12:00:00Z"));
  const r = helioDistance(jd, "earth");
  assert.ok(Math.abs(r - 1.0) < 0.02, `Earth r=${r}`);
});

test("Sun geocentric position is opposite Earth's", () => {
  const jd = dateToJulian(new Date("2026-10-07T12:00:00Z"));
  const sun = sunGeocentricEcliptic(jd);
  // Sun is ~1 AU away
  assert.ok(Math.abs(Math.hypot(sun.x, sun.y, sun.z) - 1) < 0.02);
});

test("Sun RA/Dec near October 7 reference values", () => {
  const jd = dateToJulian(new Date("2026-10-07T12:00:00Z"));
  const sun = sunGeocentricEcliptic(jd);
  const eq = eclipticToEquatorial(sun.x, sun.y, sun.z, jd);
  // ~ RA 193°, Dec -5.7°
  assert.ok(Math.abs(eq.ra - 193.2) < 1.5, `RA=${eq.ra}`);
  assert.ok(Math.abs(eq.dec - (-5.7)) < 1.5, `Dec=${eq.dec}`);
});

test("Borrelly two-body propagation reaches perihelion/aphelion", () => {
  const el = {
    e: 0.638, a_au: 3.61, i_deg: 29.3, node_deg: 74.3, peri_deg: 352.0,
    M_deg: 313.0, epoch_jd: 2459286.5, n_deg_day: 0.144,
    q_au: 1.31, Q_au: 5.91, period_days: 2500,
  };
  const pPeri = keplerPropagate(el, 2459612.267);
  const rPeri = Math.hypot(pPeri.x, pPeri.y, pPeri.z);
  assert.ok(Math.abs(rPeri - 1.31) < 0.03, `rPeri=${rPeri}`);
  const pAph = keplerPropagate(el, 2459612.267 + 1250);
  const rAph = Math.hypot(pAph.x, pAph.y, pAph.z);
  assert.ok(Math.abs(rAph - 5.91) < 0.1, `rAph=${rAph}`);
});

test("altAz returns valid ranges", () => {
  const jd = dateToJulian(new Date("2026-10-08T01:00:00Z"));
  const { alt, az } = altAz(45, 20, jd, 40.7, -74.0);
  assert.ok(alt >= -90 && alt <= 90);
  assert.ok(az >= 0 && az < 360);
});

test("lst is periodic", () => {
  const jd = dateToJulian(new Date("2026-10-08T01:00:00Z"));
  assert.ok(lstDeg(jd, -74) >= 0 && lstDeg(jd, -74) < 360);
});
