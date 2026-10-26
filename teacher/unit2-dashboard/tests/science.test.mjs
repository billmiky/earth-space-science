import { test } from "node:test";
import assert from "node:assert/strict";
import {
  u238Age, u238Pct, remainingPct, ageFromHalfLives, fmtYears, atomsLeft, shuffledRanks, makeRng,
  ISOTOPES, DATING_OBJECTS, canDate, usableIsotopes, ROCK_SAMPLES, CRATER_BODIES, STROMATOLITE_PCT,
  makeCraterSim, visibleCraters, WORLDS, resonanceAligned, periodRatioToday, massChange, mean,
} from "../src/science.js";

const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} vs ${b}`);

test("half-life math: 50% is one half-life, round-trips with u238Pct", () => {
  near(u238Age(50), 4.5, 1e-9);
  near(u238Age(25), 9, 1e-9);
  near(u238Pct(u238Age(59)), 59, 1e-9);
  assert.equal(remainingPct(3), 12.5);
  assert.equal(ageFromHalfLives(3, 5730), 17190);
});

test("packet tables 1 and 2 (U-238 and C-14)", () => {
  assert.deepEqual([0, 1, 2, 3].map((n) => ageFromHalfLives(n, 4.5e9)), [0, 4.5e9, 9e9, 13.5e9]);
  assert.deepEqual([0, 1, 2, 3].map((n) => ageFromHalfLives(n, 5730)), [0, 5730, 11460, 17190]);
});

test("fmtYears picks a readable unit", () => {
  assert.equal(fmtYears(5730), "5,730 years");
  assert.equal(fmtYears(4.5e9), "4.5 billion years");
  assert.equal(fmtYears(9e9), "9 billion years");
  assert.equal(fmtYears(7.13e8), "713 million years");
  assert.equal(fmtYears(NaN), "—");
});

test("atom grid halves exactly for whole half-lives of 160 atoms", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map((n) => atomsLeft(160, n)), [160, 80, 40, 20, 10, 5]);
  assert.ok(atomsLeft(160, 0.5) > 80 && atomsLeft(160, 0.5) < 160);
});

test("shuffledRanks is a deterministic permutation", () => {
  const a = shuffledRanks(160, 11), b = shuffledRanks(160, 11);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), Array.from({ length: 160 }, (_, i) => i));
  assert.notDeepEqual(a, shuffledRanks(160, 12));
});

test("makeRng is deterministic and in (0,1)", () => {
  const r1 = makeRng(5), r2 = makeRng(5);
  for (let i = 0; i < 100; i++) { const v = r1(); assert.equal(v, r2()); assert.ok(v > 0 && v < 1); }
});

test("isotope chooser: organic and young → C-14; old rock → slow isotopes only", () => {
  const [charcoal, mammoth, ash, zircon] = DATING_OBJECTS;
  assert.deepEqual(usableIsotopes(charcoal).map((i) => i.key), ["c14"]);
  assert.deepEqual(usableIsotopes(mammoth).map((i) => i.key), ["c14"]);
  assert.ok(!usableIsotopes(ash).some((i) => i.key === "c14"));
  assert.ok(usableIsotopes(zircon).some((i) => i.key === "u238"));
  assert.ok(!canDate(ISOTOPES.find((i) => i.key === "c14"), zircon));
  assert.ok(canDate(ISOTOPES.find((i) => i.key === "k40"), { age: 2e5, organic: false }));
});

test("rock ages match the chapter: planets ≈ 4.4–4.6 Gyr, impacts ≈ 3.8–4.0 Gyr", () => {
  for (const r of ROCK_SAMPLES.filter((s) => s.set === "minerals")) assert.ok(r.age > 4.4 && r.age < 4.65, r.object);
  const melt = ROCK_SAMPLES.filter((s) => s.set === "melt").map((s) => s.age);
  near(Math.min(...melt), 3.80, 0.01);
  near(Math.max(...melt), 4.04, 0.01);
  near(ROCK_SAMPLES.find((s) => s.id === "meteorite").age, 4.63, 0.01);
});

test("stromatolite is about 3.4 billion years old", () => {
  near(u238Age(STROMATOLITE_PCT), 3.43, 0.01);
});

test("crater data: Moon is ~7,800× Earth in total, ~100,000× per area", () => {
  const [earth, mars, moon] = CRATER_BODIES;
  assert.equal(Math.round(moon.craters / earth.craters), 7813);
  const ratio = moon.perArea / earth.perArea;
  assert.ok(ratio > 9e4 && ratio < 1.2e5);
  assert.ok(mars.perArea > earth.perArea && mars.perArea < moon.perArea);
});

test("crater model: Moon keeps everything, Earth loses almost all, Mars in between", () => {
  const sim = makeCraterSim();
  assert.equal(sim.length, 900);
  assert.equal(visibleCraters(sim, WORLDS.moon, 4.5).length, 900);
  const earth = visibleCraters(sim, WORLDS.earth, 4.5).length;
  const mars = visibleCraters(sim, WORLDS.mars, 4.5).length;
  assert.ok(earth < 60, `earth ${earth}`);
  assert.ok(mars > earth * 5 && mars < 900, `mars ${mars}`);
  assert.equal(visibleCraters(sim, WORLDS.moon, 0).length, 0);
  // deterministic
  assert.equal(makeCraterSim().length, makeCraterSim().length);
  assert.deepEqual(makeCraterSim()[10], makeCraterSim()[10]);
});

test("resonance: planets align at whole Saturn orbits; today's ratio is ≈ 2.48", () => {
  for (const s of [0, 1, 2, 3]) assert.ok(resonanceAligned(s), `s=${s}`);
  for (const s of [0.25, 0.5, 1.5, 2.3]) assert.ok(!resonanceAligned(s), `s=${s}`);
  near(periodRatioToday(), 2.484, 0.01);
});

test("chalk lab: mass change and means", () => {
  const v = massChange(5.18, 4.87);
  near(v.change, -0.31, 1e-9);
  assert.ok(v.pct < -5 && v.pct > -7);
  assert.ok(Number.isNaN(mean([])));
  near(mean([1, NaN, 3]), 2, 1e-9);
});
