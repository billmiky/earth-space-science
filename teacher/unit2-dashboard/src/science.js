// science.js — Pure calculation + model code for the Unit 2 dashboard (no DOM).
// Everything the panels compute lives here so it can be unit tested.

/** U-238 → Pb-206 half-life in billions of years. */
export const U238_HALF_LIFE_GYR = 4.5;

/** Percent of parent isotope left after n half-lives. */
export function remainingPct(halfLives) {
  return 100 * Math.pow(0.5, halfLives);
}

/** Age in billions of years from percent of U-238 remaining (0 < pct ≤ 100). */
export function u238Age(pct) {
  return U238_HALF_LIFE_GYR * Math.log2(100 / pct);
}

/** Inverse of u238Age. */
export function u238Pct(ageGyr) {
  return 100 * Math.pow(0.5, ageGyr / U238_HALF_LIFE_GYR);
}

/** Age in years from a number of half-lives and a half-life in years. */
export function ageFromHalfLives(n, halfLifeYears) {
  return n * halfLifeYears;
}

/** Human-friendly years: 5,730 years · 17,190 years · 4.5 billion years. */
export function fmtYears(y) {
  if (!isFinite(y)) return "—";
  const a = Math.abs(y);
  if (a >= 1e9) return `${trim(y / 1e9)} billion years`;
  if (a >= 1e6) return `${trim(y / 1e6)} million years`;
  return `${Math.round(y).toLocaleString("en-US")} years`;
}

function trim(x) {
  const s = Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2);
  return String(parseFloat(s));
}

/** Format a count with thousands separators. */
export function fmtInt(n) {
  return Math.round(n).toLocaleString("en-US");
}

// ---------- Isotopes (packet table: "Geologically important radioactive elements") ----------

export const ISOTOPES = [
  { key: "c14", name: "Carbon-14", daughter: "Nitrogen-14", halfLife: 5730, min: 100, max: 7e4, organic: true,
    materials: "Organic materials, glacial ice with CO₂, groundwater, ocean water" },
  { key: "k40", name: "Potassium-40", daughter: "Argon-40", halfLife: 1.3e9, min: 1e5, max: 4.6e9, organic: false,
    materials: "Potassium-bearing minerals; igneous or volcanic rock" },
  { key: "u235", name: "Uranium-235", daughter: "Lead-207", halfLife: 7.13e8, min: 1e7, max: 4.6e9, organic: false,
    materials: "Uranium-bearing minerals (zircon, apatite, uraninite)" },
  { key: "u238", name: "Uranium-238", daughter: "Lead-206", halfLife: 4.5e9, min: 1e7, max: 4.6e9, organic: false,
    materials: "Uranium-bearing minerals (zircon, apatite, uraninite)" },
  { key: "rb87", name: "Rubidium-87", daughter: "Strontium-87", halfLife: 4.88e10, min: 1e7, max: 4.6e9, organic: false,
    materials: "Potassium-bearing minerals; whole igneous or metamorphic rock" },
  { key: "sm147", name: "Samarium-147", daughter: "Neodymium-143", halfLife: 1.06e11, min: 1e7, max: 4.6e9, organic: false,
    materials: "Garnets, micas" },
];

export function isotopeByKey(key) {
  return ISOTOPES.find((i) => i.key === key) || ISOTOPES[0];
}

/** Objects used in the "Which isotope?" picker. */
export const DATING_OBJECTS = [
  { name: "Charcoal from an ancient campfire", note: "about 3,000 years old", age: 3000, organic: true },
  { name: "Frozen mammoth bone", note: "about 40,000 years old", age: 4e4, organic: true },
  { name: "Volcanic ash above a dinosaur fossil", note: "about 66 million years old", age: 6.6e7, organic: false },
  { name: "Zircon crystal in a Moon rock", note: "about 4.4 billion years old", age: 4.4e9, organic: false },
];

/** True when this isotope can date an object of this age and material. */
export function canDate(isotope, obj) {
  return obj.age >= isotope.min && obj.age <= isotope.max && isotope.organic === obj.organic;
}

export function usableIsotopes(obj) {
  return ISOTOPES.filter((i) => canDate(i, obj));
}

// ---------- Deterministic PRNG (so every projection looks the same) ----------

/** Park–Miller minimal-standard generator. Returns a function → (0,1). */
export function makeRng(seed) {
  let s = Math.floor(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** A fixed random ordering of 0..n-1; atom i decays "early" when its rank is high. */
export function shuffledRanks(n, seed = 7) {
  const rng = makeRng(seed);
  const ranks = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  return ranks;
}

/** Number of parent atoms left out of n after the given half-lives. */
export function atomsLeft(n, halfLives) {
  return Math.ceil(n * Math.pow(0.5, halfLives) - 1e-9);
}

// ---------- Crater survival model (matches the student chapter) ----------

/** Relative impact rate: early heavy bombardment + LHB burst (4.1–3.8 Gya ≈ t 0.45–0.75) + background. */
export function impactRate(t) {
  return 0.35 + 5 * Math.exp(-t / 0.12) + (t > 0.45 && t < 0.75 ? 3.5 : 0);
}

export const SIM_DURATION_GYR = 4.5;

export function makeCraterSim(seed = 2024, count = 900) {
  const rand = makeRng(seed);
  const craters = [];
  while (craters.length < count) {
    const t = rand() * SIM_DURATION_GYR;
    if (rand() * 9 < impactRate(t)) {
      craters.push({ t, x: rand(), y: rand(), r: 0.006 + 0.03 * Math.pow(rand(), 3), u: rand() });
    }
  }
  return craters.sort((a, b) => a.t - b.t);
}

/** K(t): total "erasing" accumulated from formation to t (erasure rate × time). */
export const WORLDS = {
  moon: { key: "moon", name: "Moon", blurb: "No liquid water, almost no atmosphere, no plate tectonics", color: "#a8b3c4", ground: "#8f8f8f", K: () => 0 },
  mars: { key: "mars", name: "Mars", blurb: "Water and volcanism early, then almost none", color: "#f26d5b", ground: "#b5653b", K: (t) => (t < 1.2 ? 0.9 * t : 1.08 + 0.04 * (t - 1.2)) },
  earth: { key: "earth", name: "Earth", blurb: "Liquid water + plate tectonics + volcanism", color: "#4aa3ff", ground: "#5d7a3a", K: (t) => 4.5 * t },
};

/** A crater formed at c.t still shows at time T if it has not been erased. */
export function craterSurvives(world, c, T) {
  return c.t <= T && c.u < Math.exp(-(world.K(T) - world.K(c.t)));
}

export function visibleCraters(sim, world, T) {
  return sim.filter((c) => craterSurvives(world, c, T));
}

// ---------- Craters on real bodies ----------

export const CRATER_BODIES = [
  { body: "Earth", craters: 128, areaMkm2: 510.1, color: "#4aa3ff" },
  { body: "Mars", craters: 300000, areaMkm2: 144.8, color: "#f26d5b" },
  { body: "Moon", craters: 1000000, areaMkm2: 37.9, color: "#a8b3c4" },
].map((d) => ({ ...d, perArea: d.craters / d.areaMkm2 }));

// ---------- Rocks of the early solar system (packet Tables 2 and 3) ----------

export const ROCK_SAMPLES = [
  { id: "earth", object: "Oldest Earth mineral", pct: 50.5, set: "minerals" },
  { id: "mars", object: "Oldest Mars mineral", pct: 50.1, set: "minerals" },
  { id: "moon", object: "Oldest Moon mineral", pct: 50.5, set: "minerals" },
  { id: "meteorite", object: "Oldest meteorite mineral", pct: 49.0, set: "minerals" },
  { id: "melt1", object: "Impact melt rock 1", pct: 55.7, set: "melt" },
  { id: "melt2", object: "Impact melt rock 2", pct: 55.4, set: "melt" },
  { id: "melt3", object: "Impact melt rock 3", pct: 53.7, set: "melt" },
  { id: "melt4", object: "Impact melt rock 4", pct: 54.9, set: "melt" },
].map((d) => ({ ...d, age: u238Age(d.pct) }));

export const STROMATOLITE_PCT = 59;

// ---------- Jupiter–Saturn resonance ----------

export const JUPITER_PERIOD_YR = 11.86;
export const SATURN_PERIOD_YR = 29.46;

/** Angles (radians, 0 = straight up, clockwise) of both planets after s Saturn orbits in a 2:1 resonance. */
export function resonanceAngles(saturnOrbits) {
  return { saturn: 2 * Math.PI * saturnOrbits, jupiter: 2 * Math.PI * 2 * saturnOrbits };
}

/** True when both planets sit at the same angle (a conjunction at the same spot). */
export function resonanceAligned(saturnOrbits, tolerance = 0.015) {
  const d = Math.abs(((2 * saturnOrbits) % 1) - (saturnOrbits % 1));
  return d < tolerance || d > 1 - tolerance;
}

/** Real-world Saturn : Jupiter period ratio today (≈ 2.48, close to but not 2). */
export function periodRatioToday() {
  return SATURN_PERIOD_YR / JUPITER_PERIOD_YR;
}

// ---------- Chalk lab ----------

/** Change in mass (g) and percent change for one trial. */
export function massChange(initial, final) {
  const change = final - initial;
  return { change, pct: (100 * change) / initial };
}

export function mean(values) {
  const v = values.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
}
