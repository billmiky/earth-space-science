// stages.js — The ten teaching stages, in the order of the "Stability of the Solar
// System" 5E packet. Pure data (no DOM) so it can be tested and reused by the
// navigation, the rail, and the teacher guide.

export const FIVE_E = {
  engage: { key: "engage", label: "Engage", glyph: "☄" },
  explore: { key: "explore", label: "Explore", glyph: "🔬" },
  explain: { key: "explain", label: "Explain", glyph: "💡" },
  elaborate: { key: "elaborate", label: "Elaborate", glyph: "♻" },
  evaluate: { key: "evaluate", label: "Evaluate", glyph: "✔" },
};

export const STAGES = [
  {
    id: "engage", fiveE: "engage", short: "Crater Mystery", key: "ss-crater-quiz",
    title: "The Crater Mystery",
    packet: "Craters in the Solar System · See–Think–Wonder",
    question: "Earth is the biggest target with the strongest gravity. So where did all of Earth's craters go?",
  },
  {
    id: "decay", fiveE: "explore", short: "Half-Life", key: "ss-decay-quiz",
    title: "Reading the Clocks Inside Rocks",
    packet: "Early Solar System Investigation · Part 1 (Decay Rates + Dating Game)",
    question: "Each atom is unstable, yet the rate of decay is perfectly steady. How can both be true?",
  },
  {
    id: "ages", fiveE: "explore", short: "Age of Rocks", key: "ss-ages-quiz",
    title: "The Age of Rocks in the Solar System",
    packet: "Early Solar System Investigation · Part 2 (Tables 2 & 3)",
    question: "When did Earth, Mars, and the Moon form, and when were they hit?",
  },
  {
    id: "lhb", fiveE: "explain", short: "Bombardment", key: "ss-lhb-quiz",
    title: "Explaining the Craters: The Late Heavy Bombardment",
    packet: "Explaining the Craters + LHB reading + Think–Talk–Open Exchange",
    question: "What could shake up the solar system about 4 billion years ago, and how would we know?",
  },
  {
    id: "chalk", fiveE: "explore", short: "Chalk Lab", key: "ss-chalk-quiz",
    title: "Can Water Wipe Away Rock?",
    packet: "The Role of Water Investigation · Part 1 (Chemical Weathering)",
    question: "Does acidic water change rock faster than plain water? How would you know?",
  },
  {
    id: "water", fiveE: "explain", short: "Water & Craters", key: "ss-water-quiz",
    title: "Which Craters Survive?",
    packet: "The Role of Water · Part 2 (Water in the Inner Solar System) + Part 3 Scientific Explanation",
    question: "Why does one world keep its 4-billion-year-old craters while another loses them?",
  },
  {
    id: "rockcycle", fiveE: "elaborate", short: "Rock Cycle", key: "ss-rockcycle-quiz",
    title: "Earth's Recycling Machine",
    packet: "The Rock Cycle infographic",
    question: "What does the rock cycle say about how stable Earth's surface is?",
  },
  {
    id: "life", fiveE: "elaborate", short: "Earliest Life", key: "ss-life-quiz",
    title: "The Oldest Rock with Evidence of Life",
    packet: "The Beginning of Life on Earth",
    question: "How old is the stromatolite, and what can one sample tell us (and not tell us)?",
  },
  {
    id: "evaluate", fiveE: "evaluate", short: "Explain It", key: null,
    title: "Build and Evaluate the Explanation",
    packet: "Scientific Explanation + Rubric + Summary Task",
    question: "Why is there a tremendous difference in the number of craters on the Moon, Mars, and Earth?",
  },
  {
    id: "review", fiveE: "evaluate", short: "Review", key: "ss-summative-quiz",
    title: "Myth or Fact? + Chapter Quiz",
    packet: "End-of-chapter review",
    question: "Which of these statements would you defend, and what evidence would you cite?",
  },
];

export function stageIndex(id) {
  const i = STAGES.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

export function stageById(id) {
  return STAGES[stageIndex(id)];
}

/** Resolve a stage from "?stage=ages", "#ages", or a 1-based number. */
export function resolveStage(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/^#/, "").toLowerCase();
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10) - 1;
    return n >= 0 && n < STAGES.length ? n : 0;
  }
  return stageIndex(s);
}
