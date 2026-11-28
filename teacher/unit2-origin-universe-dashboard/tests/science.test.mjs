import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PACKET_SPECTRA, LAB_LINES, HUBBLE_CLUSTERS, hubbleVelocity,
  dopplerShift, soundDopplerFreq, wavelengthToHex, soundWavelengthCm,
  scaleFactor, galaxyDistances, cmbTemp, peakWavelengthNm, emBand,
  planckCurve, COMPOSITION, BB_STAGES,
} from "../src/science.js";

test("packet spectra show monotonic redshift with distance", () => {
  assert.equal(PACKET_SPECTRA.length, 5);
  assert.deepEqual(PACKET_SPECTRA[0].lines, LAB_LINES);
  for (let i = 1; i < PACKET_SPECTRA.length; i++) {
    assert.ok(PACKET_SPECTRA[i].lines[0] > PACKET_SPECTRA[i - 1].lines[0], `${PACKET_SPECTRA[i].object} shifted further red`);
  }
});

test("Doppler shift: receding redshifts (+λ), approaching blueshifts (-λ)", () => {
  assert.equal(dopplerShift(656.3, 0), 656.3);
  assert.ok(dopplerShift(656.3, 15000) > 685);
  assert.ok(dopplerShift(656.3, -15000) < 626);
});

test("sound Doppler increases frequency approaching and decreases receding", () => {
  assert.ok(soundDopplerFreq(440, 0.3) > 600);
  assert.ok(soundDopplerFreq(440, -0.3) < 350);
  assert.ok(soundWavelengthCm(523.3) < soundWavelengthCm(261.6));
});

test("Hubble's law: v = 70 × d matches chapter clusters", () => {
  assert.equal(hubbleVelocity(100), 7000);
  for (const c of HUBBLE_CLUSTERS) {
    const pred = hubbleVelocity(c.d);
    assert.ok(Math.abs(pred - c.v) / c.v < 0.12, `${c.name}: v=${c.v} vs pred=${pred}`);
  }
});

test("cosmic expansion history matches chapter balloon quiz (~67% at 5 Gyr ago)", () => {
  assert.ok(Math.abs(scaleFactor(0) - 1) < 1e-6);
  const at5 = scaleFactor(5);
  assert.ok(at5 > 0.64 && at5 < 0.70, `5 Gyr ago scale = ${at5}`);
  assert.ok(scaleFactor(10) < 0.40 && scaleFactor(10) > 0.30);
  assert.equal(scaleFactor(13.7), 0);
});

test("galaxyDistances shows no center: any chosen home sees every other galaxy receding", () => {
  for (const homeIdx of [0, 4, 9]) {
    const list = galaxyDistances(homeIdx, 1);
    assert.equal(list[homeIdx].dMpc, 0);
    for (const g of list) {
      if (g.idx !== homeIdx) assert.ok(g.dMpc > 0 && g.vKms > 0);
    }
  }
});

test("CMB light stretcher: 1x is 3,000 K visible/IR; 1,100x is ~2.73 K microwaves (~1 mm)", () => {
  assert.equal(cmbTemp(1), 3000);
  const tNow = cmbTemp(1100);
  assert.ok(tNow > 2.6 && tNow < 2.8, `T_now = ${tNow}`);
  const pkNow = peakWavelengthNm(tNow);
  assert.ok(pkNow > 1e6 && pkNow < 1.2e6, `peak = ${pkNow} nm (~1.06 mm)`);
  assert.equal(emBand(pkNow).id, "microwave");
  assert.equal(emBand(550).id, "visible");
  const curve = planckCurve(tNow);
  assert.ok(curve.some((p) => p.norm === 1));
});

test("composition pies sum to 100% and 7 timeline stages are ordered", () => {
  assert.equal(COMPOSITION.predicted.reduce((a, b) => a + b.pct, 0), 100);
  assert.equal(COMPOSITION.observed.reduce((a, b) => a + b.pct, 0), 100);
  assert.equal(BB_STAGES.length, 7);
  assert.match(wavelengthToHex(656), /^#[0-9a-f]{6}$/);
});
