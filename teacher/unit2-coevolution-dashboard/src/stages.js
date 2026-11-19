// stages.js — The ten teaching stages of the "Coevolution of Earth and Life" 5E, in packet
// order and mapped onto the 8-day teacher guide (unit2-coevolution-guide.html).
// Pure data (no DOM) so it can be tested and reused by the navigation and the rail.

export const FIVE_E = {
  engage: { key: "engage", label: "Engage", glyph: "⏩" },
  explore: { key: "explore", label: "Explore", glyph: "🔍" },
  explain: { key: "explain", label: "Explain", glyph: "💡" },
  elaborate: { key: "elaborate", label: "Elaborate", glyph: "💥" },
  evaluate: { key: "evaluate", label: "Evaluate", glyph: "✔" },
};

// checks: quick-check sources for the ❓ button. "hinge:*" keys come from the teacher guide's
// checks for understanding (src/content/hinges.js); the rest are the student chapter's quizzes.
export const STAGES = [
  {
    id: "engage", fiveE: "engage", day: "Day 1", short: "Pace of Evolution",
    title: "The Pace of Evolution",
    packet: "Engage · Pace of Evolution diagram, Q1–6 + brainstorm table (pp. 2–3)",
    question: "Life stayed single-celled for billions of years. Why did evolution speed up?",
    checks: ["hinge:engage", "pace-quiz"],
  },
  {
    id: "timeline", fiveE: "explore", day: "Days 2–3", short: "Fossil Timeline",
    title: "Building the Fossil Timeline",
    packet: "Explore Part 1 · Reconstructing Earth's Geological and Evolutionary History (pp. 4–5)",
    question: "What can the fossil record tell us about life and Earth's systems over 4 billion years?",
    checks: ["hinge:timeline", "timeline-quiz"],
  },
  {
    id: "dating", fiveE: "explore", day: "Day 3", short: "Dating Layers",
    title: "Dating Fossil Layers",
    packet: "Explore Part 2 · Dating Fossil Layers, Q1–4 (pp. 6–7) · ESSRT p. 15",
    question: "How do we know when things happened, and which isotope fits which sample?",
    checks: ["hinge:dating", "dating-quiz"],
  },
  {
    id: "oxygen", fiveE: "explore", day: "Day 4", short: "Oxygen History",
    title: "Oxygen in Earth's History",
    packet: "Explore Part 3 · Stages of Atmospheric Oxygen Q1–7 + See-Think-Wonder (pp. 8–10)",
    question: "How do changes in oxygen line up with the events on our timeline?",
    checks: ["hinge:oxygen", "oxygen-stages-quiz"],
  },
  {
    id: "evidence", fiveE: "explain", day: "Day 5", short: "Evidence",
    title: "Evidence of Coevolution",
    packet: "Explain Part 1 · Video notes + Claim / Evidence / Reasoning table (pp. 11–12)",
    question: "How did Earth's systems and living things change each other?",
    checks: ["hinge:evidence", "coevolution-evidence-quiz"],
  },
  {
    id: "argument", fiveE: "explain", day: "Day 6", short: "Argument",
    title: "Constructing the Argument",
    packet: "Explain Part 2 · Argument, Signals in the Sands of Time, reflection, Summary Task (pp. 13–16)",
    question: "The evolution of complex organisms relied on the coevolution of the biosphere and Earth's systems.",
    checks: ["hinge:argument", "biosignature-quiz"],
  },
  {
    id: "extinctions", fiveE: "elaborate", day: "Day 7", short: "Mass Extinctions",
    title: "Mass Extinctions",
    packet: "Elaborate · Mass extinction table + Read-Generate-Sort-Solve (pp. 17–18)",
    question: "How did geological events affect evolution, and how did life recover?",
    checks: ["hinge:extinctions", "extinction-table-quiz"],
  },
  {
    id: "o2ext", fiveE: "elaborate", day: "Day 7", short: "Extinctions & O₂",
    title: "Extinction Events and Oxygen",
    packet: "Elaborate · Extinction Events and Oxygen graph + Arguing from Evidence (pp. 19–20)",
    question: "What happens to oxygen around each extinction, and what does recovery do to it?",
    checks: ["hinge:o2ext", "extinction-oxygen-quiz"],
  },
  {
    id: "evaluate", fiveE: "evaluate", day: "Day 8", short: "Why So Long?",
    title: "Why Did It Take So Long?",
    packet: "Revisiting the Performance Task handout · Idea Carousel · Driving Question Board",
    question: "What set of conditions allowed humans to evolve on Earth, and why did it take so long?",
    checks: ["coevolution-summative-quiz"],
  },
  {
    id: "review", fiveE: "evaluate", day: "Review", short: "Review",
    title: "Myth or Fact? + Chapter Quiz",
    packet: "End-of-chapter review (student chapter)",
    question: "Which of these statements would you defend, and what evidence would you cite?",
    checks: ["coevolution-summative-quiz"],
  },
];

export function stageIndex(id) {
  const i = STAGES.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

export function stageById(id) {
  return STAGES[stageIndex(id)];
}

/** Resolve a stage from "?stage=dating", "#dating", or a 1-based number. */
export function resolveStage(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/^#/, "").toLowerCase();
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10) - 1;
    return n >= 0 && n < STAGES.length ? n : 0;
  }
  return stageIndex(s);
}
