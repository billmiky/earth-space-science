// science.js — Data and pure helpers for the Coevolution dashboard (no DOM; unit-tested).
// Every data table here is copied from the student chapter
// (unit2-probability-of-life/unit2-coevolution.qmd), which in turn comes from the
// New Visions ESS Unit 2 Coevolution packet. Oxygen curves are traced from the packet graphs
// and are labeled as estimates wherever they are drawn.

// ---------- Engage: when each group first appeared (packet spiral diagram) ----------
// sys: "earth" (Earth & space events) or "life".
export const PACE_EVENTS = [
  { event: "Sun ignites", ga: 4.6, sys: "earth" },
  { event: "Earth forms", ga: 4.6, sys: "earth" },
  { event: "Moon forms", ga: 4.5, sys: "earth" },
  { event: "Liquid water", ga: 4.4, sys: "earth" },
  { event: "Prokaryotes (simple cells)", ga: 3.8, sys: "life" },
  { event: "Photosynthesis", ga: 3.4, sys: "life" },
  { event: "Atmospheric oxygen", ga: 2.4, sys: "earth" },
  { event: "Eukaryotes (complex cells)", ga: 2.0, sys: "life" },
  { event: "Multicellular life", ga: 1.0, sys: "life" },
  { event: "Sponges and fungi", ga: 0.8, sys: "life" },
  { event: "Cambrian explosion", ga: 0.54, sys: "life" },
  { event: "Fish (vertebrates)", ga: 0.5, sys: "life" },
  { event: "Land plants", ga: 0.47, sys: "life" },
  { event: "Sharks", ga: 0.42, sys: "life" },
  { event: "Insects, amphibians", ga: 0.38, sys: "life" },
  { event: "Reptiles", ga: 0.31, sys: "life" },
  { event: "Dinosaurs", ga: 0.23, sys: "life" },
  { event: "Mammals", ga: 0.2, sys: "life" },
  { event: "Birds", ga: 0.15, sys: "life" },
  { event: "Flowers and bees", ga: 0.13, sys: "life" },
  { event: "Primates", ga: 0.055, sys: "life" },
  { event: "Ardipithecus ramidus", ga: 0.0043, sys: "life" },
  { event: "Fire", ga: 0.001, sys: "life" },
  { event: "Homo sapiens", ga: 0.0002, sys: "life" },
  { event: "Writing", ga: 0.00001, sys: "life" },
];

export const EARTH_AGE_GA = 4.6;

/** Clock time (24-hour day = 4.6 billion years) for an event `ga` billion years ago. */
export function earthClock(ga) {
  const secs = ((EARTH_AGE_GA - ga) / EARTH_AGE_GA) * 86400;
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.floor(secs % 60);
  return { secs, h, m, s };
}

/** "4:10 am" style label; seconds shown in the last minute of the day. */
export function clockLabel(ga) {
  const { h, m, s, secs } = earthClock(ga);
  const hh = h % 12 === 0 ? 12 : h % 12, ap = h < 12 || h === 24 ? "am" : "pm";
  if (secs >= 86400) return "midnight";
  const base = `${hh}:${String(m).padStart(2, "0")}`;
  return secs > 86340 ? `${base}:${String(s).padStart(2, "0")} ${ap}` : `${base} ${ap}`;
}

/** Readable age: "2.4 billion years ago", "540 million years ago", "200,000 years ago". */
export function fmtGa(ga) {
  if (ga <= 0) return "today";
  if (ga >= 1) return `${+ga.toFixed(2)} billion years ago`;
  if (ga >= 0.001) return `${+(ga * 1000).toPrecision(3)} million years ago`;
  return `about ${Math.round(ga * 1e9).toLocaleString("en-US")} years ago`;
}

// ---------- Timeline events (chapter's two-track timeline; used for readouts) ----------
export const TIMELINE_EVENTS = [
  { ga: 4.6, sys: "earth", event: "Earth forms; early atmosphere is mostly hydrogen and helium" },
  { ga: 4.4, sys: "earth", event: "Oldest mineral grains (zircons) show a solid crust and liquid water" },
  { ga: 3.9, sys: "earth", event: "Heavy asteroid bombardment slows down" },
  { ga: 3.8, sys: "earth", event: "Atmosphere is methane, ammonia, water vapor and nitrogen; almost no oxygen" },
  { ga: 2.5, sys: "earth", event: "Banded iron formations pile up on the seafloor (peak about 2.5 Ga)" },
  { ga: 2.4, sys: "earth", event: "Great Oxidation Event: oxygen starts to build up in the air" },
  { ga: 2.3, sys: "earth", event: "Huronian glaciation: Earth's first major ice age" },
  { ga: 2.0, sys: "earth", event: "Red beds: iron-rich rocks on land start to rust" },
  { ga: 1.85, sys: "earth", event: "Banded iron formations stop forming" },
  { ga: 0.7, sys: "earth", event: "“Snowball Earth” ice ages (about 720–635 Ma)" },
  { ga: 0.6, sys: "earth", event: "Second big rise in oxygen (about 850–540 Ma)" },
  { ga: 0.5, sys: "earth", event: "Ozone layer thick enough to shield land from UV" },
  { ga: 0.33, sys: "earth", event: "Coal forms from buried swamp forests; oxygen peaks near 35%" },
  { ga: 0.252, sys: "earth", event: "Massive volcanic eruptions (Siberian Traps)" },
  { ga: 0.066, sys: "earth", event: "Asteroid impact (Chicxulub crater, Mexico)" },
  { ga: 3.8, sys: "life", event: "First signs of life: chemical traces of simple cells" },
  { ga: 3.5, sys: "life", event: "Stromatolites: layered mounds built by microbe mats" },
  { ga: 2.7, sys: "life", event: "Cyanobacteria release oxygen by photosynthesis" },
  { ga: 2.0, sys: "life", event: "Eukaryotes: complex cells with a nucleus" },
  { ga: 1.0, sys: "life", event: "Multicellular life: cells living clustered together" },
  { ga: 0.58, sys: "life", event: "Ediacaran animals: first large, soft-bodied animals" },
  { ga: 0.54, sys: "life", event: "Cambrian explosion: most animal body plans appear" },
  { ga: 0.47, sys: "life", event: "First land plants" },
  { ga: 0.375, sys: "life", event: "First forests; four-legged animals move onto land" },
  { ga: 0.3, sys: "life", event: "Giant insects and other “widespread gigantism”" },
  { ga: 0.23, sys: "life", event: "Dinosaurs and first mammals appear" },
  { ga: 0.06, sys: "life", event: "Mammals spread into niches left by the dinosaurs" },
  { ga: 0.0002, sys: "life", event: "Homo sapiens (about 200,000 years ago)" },
];

/** Newest event of a system at or before time `ga` (going forward in time). */
export function latestEvent(ga, sys) {
  return TIMELINE_EVENTS.filter((e) => e.sys === sys && e.ga >= ga - 1e-9).sort((a, b) => a.ga - b.ga)[0] || null;
}

// ---------- Radiometric dating (packet table "Geologically Important Radioactive Elements") ----------
export const ISOTOPES = [
  { key: "sm147", parent: "Samarium-147", daughter: "Neodymium-143", half: 106e9, min: 1e7, max: 4.6e9, materials: "Garnets, micas" },
  { key: "rb87", parent: "Rubidium-87", daughter: "Strontium-87", half: 48.8e9, min: 1e7, max: 4.6e9, materials: "Potassium-bearing minerals; whole igneous or metamorphic rock" },
  { key: "u238", parent: "Uranium-238", daughter: "Lead-206", half: 4.5e9, min: 1e7, max: 4.6e9, materials: "Zircon, apatite, uraninite" },
  { key: "u235", parent: "Uranium-235", daughter: "Lead-207", half: 713e6, min: 1e7, max: 4.6e9, materials: "Zircon, apatite, uraninite" },
  { key: "k40", parent: "Potassium-40", daughter: "Argon-40", half: 1.3e9, min: 1e5, max: 4.6e9, materials: "Mica, feldspar, hornblende; volcanic rock (tuff, lava)" },
  { key: "c14", parent: "Carbon-14", daughter: "Nitrogen-14", half: 5730, min: 100, max: 70000, materials: "Organic material, glacial ice, groundwater, ocean water" },
];

export const isotope = (key) => ISOTOPES.find((i) => i.key === key);

/** Percent of parent left after `n` half-lives. */
export const pctAfter = (n) => 100 * Math.pow(0.5, n);
/** Percent of parent left after `years` for an isotope. */
export const pctLeft = (years, iso) => pctAfter(years / iso.half);
/** Rows of a packet half-life table (0..rows-1 half-lives). */
export function halfLifeTable(iso, rows = 5) {
  return Array.from({ length: rows }, (_, n) => ({ n, pct: pctAfter(n), years: n * iso.half }));
}
export const inRange = (iso, years) => years >= iso.min && years <= iso.max;

/** Readable years: "713 million", "1.426 billion", "5,730". */
export function fmtYears(y) {
  if (!Number.isFinite(y)) return "—";
  if (y === 0) return "0";
  if (y >= 1e9) return `${+(y / 1e9).toFixed(3)} billion`;
  if (y >= 1e6) return `${+(y / 1e6).toFixed(1)} million`;
  return Math.round(y).toLocaleString("en-US");
}

// Samples the packet asks students to date (Part 2 + the Day 3 homework cross-section).
export const DATING_SAMPLES = [
  { key: "human", label: "Early human fossils", years: 2e5, note: "packet Q3" },
  { key: "coral", label: "Coral reef", years: 5e8, note: "Day 3 homework" },
  { key: "bif", label: "Banded iron formation", years: 2.5e9, note: "packet Q2" },
  { key: "gneiss", label: "Acasta Gneiss", years: 4e9, note: "Day 3 homework" },
];

// ---------- Oxygen (packet "Stages of Atmospheric Oxygen" graph, traced) ----------
export const O2_HISTORY = [
  [3.8, 0], [3.4, 0], [3.0, 0], [2.7, 0], [2.45, 0], [2.3, 1], [2.1, 2.5], [1.95, 3.5], [1.85, 3.6],
  [1.5, 3.6], [1.2, 3.6], [0.95, 3.8], [0.85, 5], [0.75, 9], [0.63, 15], [0.5, 17], [0.43, 22],
  [0.37, 30], [0.33, 36], [0.3, 32], [0.25, 21], [0.18, 20], [0.12, 23], [0.08, 22], [0.04, 20], [0, 21],
].map(([ga, o2]) => ({ t: ga, y: o2 }));

export const O2_STAGES = [
  { stage: 1, start: 3.85, end: 2.45, text: "Almost no oxygen in the air" },
  { stage: 2, start: 2.45, end: 1.85, text: "Oxygen is made, but most is absorbed by the oceans and seafloor rock (iron)" },
  { stage: 3, start: 1.85, end: 0.85, text: "Oxygen escapes the oceans and is absorbed by rocks on land and by forming the ozone layer" },
  { stage: 4, start: 0.85, end: 0.54, text: "Oxygen “sinks” are full, so oxygen builds up quickly in the air" },
  { stage: 5, start: 0.54, end: 0, text: "Oxygen rises and falls; today's air is about 78% nitrogen, 21% oxygen, 1% other" },
];

export const stageAt = (ga) => O2_STAGES.find((s) => ga <= s.start + 1e-9 && ga >= s.end - 1e-9) || O2_STAGES[0];

// ---------- Extinctions (packet table) + Phanerozoic oxygen (packet graph, traced) ----------
export const EXTINCTIONS = [
  { name: "Ordovician", ma: 444, rate: 85,
    factors: ["Supercontinent Gondwana moved into the southern hemisphere", "Sea levels rose and fell repeatedly", "An ice age began in the late Ordovician", "Changes in water chemistry, such as oxygen depletion"],
    immediate: ["Significant habitat loss for marine species", "Extinction of many marine invertebrates"],
    later: ["Marine vertebrates, like fish, took over spaces left by the extinct invertebrates"] },
  { name: "Devonian", ma: 360, rate: 75,
    factors: ["Global cooling and glaciation (ice ages)", "Sea levels rose and fell repeatedly", "Widespread oxygen depletion in the oceans", "Volcanic gases disrupted climate and ocean chemistry"],
    immediate: ["Reef ecosystems collapsed; reef builders like corals went extinct", "Many marine species lost, including lobe-finned fish"],
    later: ["Four-legged land animals, ray-finned fish and cartilaginous fish exploded in number"] },
  { name: "Permian", ma: 252, rate: 90,
    factors: ["Massive volcanic eruptions", "Big increases in methane and CO₂", "Rapid global warming", "Ocean acidification from extra CO₂"],
    immediate: ["Most life in the oceans and on land went extinct", "Victims included marine invertebrates and many land animals and plants"],
    later: ["New plants and animals evolved, including dinosaurs"] },
  { name: "Triassic", ma: 201, rate: 76,
    factors: ["Massive volcanic activity", "Big increase in methane and CO₂", "Severe global warming", "Ocean acidification from extra CO₂"],
    immediate: ["Significant habitat loss", "Collapse of many ecosystems", "Many marine and land species disappeared"],
    later: ["Turtles, crocodiles, mammals, fishes and many plants filled the niches; the age of dinosaurs began"] },
  { name: "K–Pg", ma: 66, rate: 75,
    factors: ["Massive asteroid impact", "Dramatic drop in global temperatures", "Massive volcanic activity"],
    immediate: ["Food chains collapsed because photosynthesis was disrupted", "Significant loss of biodiversity", "End of the dinosaurs"],
    later: ["Mammals took over the dinosaurs' niches; frogs, lizards, snakes and flowering plants increased"] },
];

export const O2_PHANERO = [
  [575, 19, 15, 22], [550, 18.2, 14.5, 23], [500, 18, 15, 24], [460, 19, 16, 24], [444, 20, 17, 25],
  [425, 22.5, 19, 27], [410, 24, 20, 27], [395, 20, 15, 24], [380, 15.5, 13, 19], [365, 15.5, 12, 21],
  [350, 18.5, 15, 24], [325, 24, 20, 29], [300, 28, 25, 32], [280, 30, 27, 33], [265, 28.5, 24, 32],
  [252, 21, 16, 27], [240, 17.5, 14, 22], [225, 18, 15, 22], [210, 16, 13, 20], [200, 14, 12, 18],
  [180, 13.8, 12, 17], [150, 13.8, 12, 18], [125, 15, 12, 20], [100, 17.5, 14, 22], [80, 19.3, 16, 23],
  [66, 19, 16, 23], [55, 18.5, 16, 22], [35, 19.5, 17, 22], [15, 20.5, 19, 22], [0, 21, 21, 21],
].map(([ma, o2, lo, hi]) => ({ t: ma, y: o2, lo, hi }));

// Labels printed on the packet graph.
export const O2_PHANERO_LABELS = [
  { x1: 330, x2: 280, name: "widespread gigantism" },
  { x1: 252, x2: 245, name: "ocean anoxia" },
  { x1: 205, x2: 198, name: "ocean anoxia" },
  { x1: 40, x2: 25, name: "mammal size increase" },
];

/** Straight-line interpolation of `key` at time `t` in a series sorted oldest → newest. */
export function interp(series, t, key = "y") {
  if (t >= series[0].t) return series[0][key];
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1], b = series[i];
    if (t >= b.t) return a[key] + ((a.t - t) / (a.t - b.t)) * (b[key] - a[key]);
  }
  return series[series.length - 1][key];
}

/** O₂ change from `before` Ma ahead of an extinction to the extinction, and `after` Ma later. */
export function o2AroundExtinction(ma, before = 10, after = 20) {
  return { before: interp(O2_PHANERO, ma + before), at: interp(O2_PHANERO, ma), after: interp(O2_PHANERO, Math.max(0, ma - after)) };
}

// ---------- Explain: claims, evidence and reasoning (packet Part 1) ----------
export const CLAIMS = [
  { key: "A", text: "Early life forms influenced oxygen levels in the oceans" },
  { key: "B", text: "Increasing oxygen influenced geological formations and processes, in the ocean and on land" },
  { key: "C", text: "Increasing oxygen influenced biological evolution in the ocean and on land" },
];

export const EVIDENCE = [
  { ev: "Stromatolites with evidence of photosynthesis appear about 2.7 billion years ago.", claim: "A",
    why: "Photosynthesis (light + water + CO₂ → glucose + O₂) releases oxygen, so these microbes were adding O₂ to the ocean." },
  { ev: "Banded iron formations: rust layers on the ancient seafloor, peaking about 2.5 billion years ago.", claim: "A",
    why: "Dissolved iron only settles out as rust when it reacts with oxygen. The oxygen came from photosynthesizing microbes." },
  { ev: "Red beds (rust-colored rocks on land) appear only after about 2 billion years ago.", claim: "B",
    why: "Iron minerals on land only rust if there is oxygen in the air. Before the Great Oxidation Event they stayed grey." },
  { ev: "Banded iron formations stop forming about 1.85 billion years ago.", claim: "B",
    why: "Oxygen used up the dissolved iron, so a type of ocean rock stopped forming." },
  { ev: "The first ice age (Huronian glaciation) begins soon after oxygen starts building up, about 2.4–2.3 billion years ago.", claim: "B",
    why: "Oxygen destroys methane, a powerful greenhouse gas. Less methane meant less heat trapped, so the climate cooled." },
  { ev: "The ozone layer exists, and new oxidized minerals (like blue and green copper minerals) appear.", claim: "B",
    why: "Ozone (O₃) forms only from O₂, and oxidized minerals form only when oxygen reacts with metals." },
  { ev: "Fossils of eukaryotes (complex cells with a nucleus) appear after oxygen rises, about 2.1 billion years ago.", claim: "C",
    why: "Aerobic respiration (using oxygen to break down food) releases far more energy. Bigger, complex cells need that energy." },
  { ev: "Multicellular organisms (~600 Ma) and soft-bodied animals (~560 Ma) appear after the second big rise in oxygen.", claim: "C",
    why: "Many cells working together, with muscles and active bodies, need lots of oxygen delivered to their cells." },
  { ev: "The first land plants appear about 470–455 million years ago, after oxygen built up the ozone layer.", claim: "C",
    why: "Ozone blocks harmful UV light. Without it, life on land would be badly damaged by UV radiation." },
  { ev: "A 21-inch dragonfly lived about 300 million years ago, when oxygen peaked near 35%.", claim: "C",
    why: "Insects get oxygen by diffusion through tiny tubes. More oxygen in the air lets it reach deeper into a larger body." },
];

// Feedback loops (chapter "Feedback Loops: Life and Earth Change Each Other").
export const LOOPS = [
  { key: "oxygen", title: "Photosynthesis → oxygen → complex life", kind: "Positive feedback",
    steps: ["Cyanobacteria and plants make O₂", "O₂ rusts iron, then builds up in air and ozone", "More energy (respiration) and a UV shield", "More complex life, including more photosynthesizers"],
    note: "More photosynthesizers → even more oxygen." },
  { key: "thermostat", title: "Weathering ↔ CO₂ ↔ climate", kind: "Negative (stabilizing) feedback",
    steps: ["Warmer climate", "Faster rock weathering (plant roots speed it up)", "More CO₂ pulled out of the air", "Climate cools"],
    note: "It pushes back toward balance and has kept Earth's climate fairly stable for billions of years." },
  { key: "recovery", title: "Extinction → empty niches → recovery", kind: "Recovery feedback",
    steps: ["Earth-system change (volcanoes, ice age, impact)", "Mass extinction; photosynthesis and oxygen drop", "Survivors spread into empty niches", "Recovered plants and algae raise oxygen again"],
    note: "Life bounces back and changes the atmosphere again." },
];

// Atmosphere then and now (packet). Only today's mix has percentages the packet gives.
export const ATMOSPHERE = [
  { when: "When Earth formed (≈ 4.6 Ga)", gases: ["Hydrogen (H₂)", "Helium (He)"], o2: "No free oxygen" },
  { when: "By ≈ 3.8 Ga", gases: ["Methane (CH₄)", "Ammonia (NH₃)", "Water vapor (H₂O)", "Nitrogen (N₂)"], o2: "Almost no oxygen" },
  { when: "Today", gases: ["Nitrogen 78%", "Oxygen 21%", "Other 1%"], o2: "21% oxygen", mix: [["Nitrogen", 78], ["Oxygen", 21], ["Other", 1]] },
];

/** Small deterministic random generator (mulberry32) so shuffles repeat for a given seed. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
