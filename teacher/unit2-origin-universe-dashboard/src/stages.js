// stages.js — The ten teaching stages of the "Origin of the Universe" 5E, in packet
// order and mapped onto the 7-day teacher guide (unit2-origin-universe-guide.html).
// Pure data (no DOM) so it can be tested and reused by navigation and the rail.

export const FIVE_E = {
  engage: { key: "engage", label: "Engage", glyph: "🌌" },
  explore: { key: "explore", label: "Explore", glyph: "🔭" },
  explain: { key: "explain", label: "Explain", glyph: "💡" },
  elaborate: { key: "elaborate", label: "Elaborate", glyph: "🎈" },
  evaluate: { key: "evaluate", label: "Evaluate", glyph: "✔" },
};

export const STAGES = [
  {
    id: "engage", fiveE: "engage", day: "Day 1", short: "How Many Stars?",
    title: "How Did the Universe Form?",
    packet: "Engage · How Many Stars? video + Brainstorm & Rumors (p. 3)",
    question: "How many solar systems and galaxies are out there, and how did the universe form?",
    checks: ["hinge:engage", "ou-engage-quiz"],
  },
  {
    id: "spectra", fiveE: "explore", day: "Day 1", short: "Galaxy Spectra",
    title: "Light Spectra from Other Galaxies",
    packet: "Explore · Comparing five absorption spectra in nanometers (p. 4, Q1–3)",
    question: "Why do more distant galaxies have the same dark line pattern shifted farther toward red?",
    checks: ["hinge:spectra", "ou-spectra-quiz"],
  },
  {
    id: "sound", fiveE: "explore", day: "Day 2", short: "Sound Doppler",
    title: "Sound Waves on the Move (Models 1 & 2)",
    packet: "Explore · Waves 101, Siren video, Model 1 Doppler, Model 2 Piano, STW rows 1–2 (pp. 5–8, 11)",
    question: "What happens to sound waves when they travel from a moving source to an observer?",
    checks: ["hinge:sound", "ou-model1-quiz", "ou-model2-quiz"],
  },
  {
    id: "light", fiveE: "explore", day: "Day 3", short: "Light & Color",
    title: "Light Waves and Color (Models 3 & 4)",
    packet: "Explore · Model 3 Moving Galaxy, Model 4 EM Spectrum (ESSRT p. 3), STW rows 3–4 (pp. 9–11)",
    question: "What happens to light waves from a moving galaxy, and why does the color shift?",
    checks: ["hinge:light", "ou-model3-quiz", "ou-model4-quiz"],
  },
  {
    id: "explain", fiveE: "explain", day: "Day 4", short: "Expanding?",
    title: "Static, Contracting, or Expanding?",
    packet: "Explain · Three scenarios, Read–Generate–Sort–Solve, Class Consensus, Summary Task (pp. 12–15)",
    question: "What do the redshifted spectra of distant galaxies tell us about the universe?",
    checks: ["hinge:explain", "ou-explain-quiz", "ou-hubble-quiz", "ou-summary-quiz"],
  },
  {
    id: "balloon", fiveE: "elaborate", day: "Day 5", short: "Balloon Universe",
    title: "Running the Expansion Backward",
    packet: "Elaborate Part 1 & Part 2 · Balloon model rewind + early universe conditions (pp. 16–19)",
    question: "If the universe is expanding today, what did it look like over 13 billion years ago?",
    checks: ["hinge:balloon", "ou-balloon-quiz"],
  },
  {
    id: "stretch", fiveE: "elaborate", day: "Days 5–6", short: "Stretched Light",
    title: "Conservation & the Cosmic Light Stretcher",
    packet: "Elaborate Part 3 · Testing Big Bang predictions with H/He & stretched light (pp. 20–21)",
    question: "If matter and energy cannot be destroyed, where did the Big Bang's light and atoms go?",
    checks: ["hinge:stretch", "ou-stretch-quiz"],
  },
  {
    id: "evidence", fiveE: "elaborate", day: "Day 6", short: "Three Lines",
    title: "Testing the Big Bang: Three Lines of Evidence",
    packet: "Elaborate Part 4 · H/He pie charts, Murmur of a Bang (CMB), Bringing It Together (pp. 21–23)",
    question: "How do redshift, the CMB, and the 3 : 1 hydrogen-to-helium ratio support the Big Bang?",
    checks: ["hinge:evidence", "ou-part4-quiz"],
  },
  {
    id: "evaluate", fiveE: "evaluate", day: "Day 7", short: "Other Earths?",
    title: "Could There Be Other Earth-Like Planets?",
    packet: "Evaluate · 7-stage universe model, Revisiting the Performance Task, Idea Carousel (pp. 24–27)",
    question: "Were galaxies and solar systems formed the same way everywhere — is life elsewhere probable?",
    checks: ["hinge:evaluate", "ou-timeline-quiz"],
  },
  {
    id: "review", fiveE: "evaluate", day: "Day 7", short: "Review",
    title: "Myth or Fact & Summative Check",
    packet: "End-of-chapter Myth or Fact cards + 10-question summative quiz",
    question: "Ready to separate Big Bang myths from evidence-backed facts?",
    checks: ["ou-summative-quiz"],
  },
];

export function resolveStage(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/^#/, "").trim().toLowerCase();
  const byId = STAGES.findIndex((st) => st.id === s);
  if (byId >= 0) return byId;
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10) - 1;
    if (n >= 0 && n < STAGES.length) return n;
  }
  return 0;
}
