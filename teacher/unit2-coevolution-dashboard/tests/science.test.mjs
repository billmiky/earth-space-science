import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PACE_EVENTS, earthClock, clockLabel, fmtGa, ISOTOPES, isotope, pctAfter, pctLeft, halfLifeTable, fmtYears, inRange,
  DATING_SAMPLES, O2_HISTORY, O2_STAGES, stageAt, O2_PHANERO, EXTINCTIONS, interp, CLAIMS, EVIDENCE, LOOPS, latestEvent, makeRng,
} from "../src/science.js";

const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} vs ${b}`);

test("Earth clock: humans appear in the last few seconds; Cambrian after 9 pm", () => {
  assert.equal(clockLabel(4.6), "12:00 am");
  assert.match(clockLabel(0.0002), /^11:59:5\d pm$/);
  const c = earthClock(0.54);
  assert.equal(c.h, 21);
  assert.equal(clockLabel(3.8), "4:10 am");
});

test("pace events: most of the events fall in the last billion years", () => {
  const recent = PACE_EVENTS.filter((e) => e.ga <= 1).length;
  assert.ok(recent / PACE_EVENTS.length > 0.6);
  assert.equal(fmtGa(2.4), "2.4 billion years ago");
  assert.equal(fmtGa(0.54), "540 million years ago");
  assert.equal(fmtGa(0.0002), "about 200,000 years ago");
});

test("packet half-life tables (guide answer key)", () => {
  assert.deepEqual(halfLifeTable(isotope("u235")).map((r) => fmtYears(r.years)), ["0", "713 million", "1.426 billion", "2.139 billion", "2.852 billion"]);
  assert.deepEqual(halfLifeTable(isotope("rb87")).map((r) => fmtYears(r.years)), ["0", "48.8 billion", "97.6 billion", "146.4 billion", "195.2 billion"]);
  assert.deepEqual(halfLifeTable(isotope("k40")).map((r) => fmtYears(r.years)), ["0", "1.3 billion", "2.6 billion", "3.9 billion", "5.2 billion"]);
  assert.deepEqual(halfLifeTable(isotope("c14")).map((r) => r.years), [0, 5730, 11460, 17190, 22920]);
  assert.deepEqual(halfLifeTable(isotope("c14")).map((r) => r.pct), [100, 50, 25, 12.5, 6.25]);
});

test("Q2: ~8.8% U-235 and ~96.5% Rb-87 left after 2.5 billion years", () => {
  near(pctLeft(2.5e9, isotope("u235")), 8.8, 0.1);
  near(pctLeft(2.5e9, isotope("rb87")), 96.5, 0.1);
  near(pctAfter(2), 25, 1e-9);
});

test("Q3: only Potassium-40 dates a 200,000-year-old sample", () => {
  const human = DATING_SAMPLES.find((s) => s.key === "human");
  assert.deepEqual(ISOTOPES.filter((i) => inRange(i, human.years)).map((i) => i.key), ["k40"]);
  const bif = DATING_SAMPLES.find((s) => s.key === "bif");
  assert.ok(!inRange(isotope("c14"), bif.years) && inRange(isotope("u235"), bif.years));
});

test("oxygen stages: ~0% until 2.45 Ga, peak ~36% near 0.33 Ga, 21% today", () => {
  assert.equal(interp(O2_HISTORY, 3.0), 0);
  near(interp(O2_HISTORY, 0.33), 36, 1e-9);
  assert.equal(interp(O2_HISTORY, 0), 21);
  assert.equal(Math.max(...O2_HISTORY.map((d) => d.y)), 36);
  assert.equal(stageAt(3.0).stage, 1);
  assert.equal(stageAt(2.0).stage, 2);
  assert.equal(stageAt(0.7).stage, 4);
  assert.equal(stageAt(0.1).stage, 5);
  for (let i = 1; i < O2_STAGES.length; i++) assert.equal(O2_STAGES[i].start, O2_STAGES[i - 1].end);
});

test("extinction table and the o2ext panel's reads of the traced curve", () => {
  assert.deepEqual(EXTINCTIONS.map((e) => [e.ma, e.rate]), [[444, 85], [360, 75], [252, 90], [201, 76], [66, 75]]);
  // Permian: big drop from ~30% at 280 Ma to 21% at the line and ~17–18% after.
  near(interp(O2_PHANERO, 280), 30, 1e-9); near(interp(O2_PHANERO, 252), 21, 1e-9); near(interp(O2_PHANERO, 240), 17.5, 1e-9);
  // Devonian low ~15–16% from 380 to 365 Ma; Triassic ~14%.
  near(interp(O2_PHANERO, 372), 15.5, 1e-9); near(interp(O2_PHANERO, 200), 14, 1e-9);
  // Ordovician and K–Pg: changes small (< 1.5 points) within ±10 Myr.
  assert.ok(Math.abs(interp(O2_PHANERO, 454) - interp(O2_PHANERO, 444)) < 1.5);
  assert.ok(Math.abs(interp(O2_PHANERO, 76) - interp(O2_PHANERO, 56)) < 1.5);
  for (const d of O2_PHANERO) assert.ok(d.lo <= d.y && d.y <= d.hi, `band at ${d.t}`);
});

test("claims, evidence and loops are well formed", () => {
  const keys = CLAIMS.map((c) => c.key);
  assert.deepEqual(keys, ["A", "B", "C"]);
  for (const k of keys) assert.ok(EVIDENCE.filter((e) => e.claim === k).length >= 2, k);
  assert.ok(LOOPS.every((l) => l.steps.length === 4));
});

test("latestEvent walks forward in time", () => {
  assert.equal(latestEvent(4.7, "life"), null);
  assert.match(latestEvent(2.45, "life").event, /Cyanobacteria/);
  assert.match(latestEvent(0.25, "earth").event, /Siberian/);
});

test("makeRng is deterministic", () => {
  const a = makeRng(3), b = makeRng(3);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
});
