// notes.js — Teacher notes shown in the Notes drawer (N). One entry per stage id.
// Answer keys are computed from science.js so they can never drift from the models.

import { ROCK_SAMPLES, u238Age, CRATER_BODIES, STROMATOLITE_PCT } from "../science.js";

const g = (x) => x.toFixed(2);
const age = (id) => g(ROCK_SAMPLES.find((r) => r.id === id).age);

export const NOTES = {
  engage: {
    minutes: "8–10 min",
    doNow: "Show the Moon image. Ask: “What do you notice? What do you wonder?” Collect two wonders on the board.",
    flow: [
      "Reveal the three crater counts (use the log-scale bars). Ask students to predict before switching to “per million km²”.",
      "Have pairs complete See–Think–Wonder in the packet (3 min).",
      "Run the hypothesis vote: “Earth was hit less” vs. “Earth's craters were erased.” Tally with the buttons. Do not resolve it; the rest of the unit does.",
      "Close with the focus question and park student wonders on the board for Explain 2.",
    ],
    answers: [
      ["Moon vs. Earth (totals)", `${(1e6 / 128).toFixed(0)}× more craters on the Moon`],
      ["Per million km²", CRATER_BODIES.map((b) => `${b.body} ${b.perArea >= 100 ? Math.round(b.perArea).toLocaleString("en-US") : b.perArea.toFixed(2)}`).join(" · ")],
    ],
    lookFors: [
      "Students reading a log axis as “each gridline is 10× more.”",
      "Students noticing that size and gravity make “Earth was hit less” unlikely.",
    ],
    misconceptions: [
      "“Earth's atmosphere stopped asteroids.” (Large impactors punch through; the crater record is about erasure, not blocking.)",
      "“Bigger body = more craters.” (Per-area numbers show the Moon is still ~100,000× more crowded.)",
    ],
    support: ["Pre-teach: crater, impact, log scale.", "Sentence frame: “I see ___. That makes me think ___. I wonder ___.”"],
  },
  decay: {
    minutes: "15–20 min (plus PhET Dating Game in class)",
    doNow: "“Is the speed of change always the same?” Have students answer after they use the PhET Decay Rates tab.",
    flow: [
      "Project the atom grid at 0 half-lives. Ask: “Which atoms will decay next?” Then drag to 1 half-life. Point out half remain, but you cannot say which atoms.",
      "Step 1 → 2 → 3 half-lives and fill in the percent and years readout together (this is packet Tables 1 and 2).",
      "Switch isotopes (C-14 → U-238). The pattern (100, 50, 25, 12.5%) is identical; only the years change.",
      "Open the “Which clock?” tab and let students pick isotopes for each object. Debrief range and material.",
    ],
    answers: [
      ["Table 1 · U-238", "0 → 100% (0) · 1 → 50% (4.5 billion) · 2 → 25% (9.0 billion) · 3 → 12.5% (13.5 billion)"],
      ["Table 2 · C-14", "0 → 100% (0) · 1 → 50% (5,730) · 2 → 25% (11,460) · 3 → 12.5% (17,190)"],
      ["Packet note", "Packet Table 1 prints 13.4 billion; 3 × 4.5 = 13.5 billion."],
      ["Which clock?", "Charcoal and mammoth bone → C-14 · Volcanic ash and Moon zircon → U-238 (and K-40 / other slow clocks)"],
    ],
    lookFors: [
      "Students explaining “stable” as the steady rate and “not stable” as the individual atom.",
      "Students using years = half-lives × half-life.",
    ],
    misconceptions: [
      "“After two half-lives it's all gone.” (25% remains.)",
      "“Heat or pressure speeds up decay.” (It doesn't; that's why it's a reliable clock.)",
    ],
    support: ["Keep the readout table visible while students talk.", "Use the words parent/daughter with the colored dots."],
  },
  ages: {
    minutes: "12–15 min",
    doNow: "“If a mineral has half its uranium-238 left, how old is it?”",
    flow: [
      "Show the curve zoomed in. Have students read ages for the four Table 2 minerals first, then reveal.",
      "Add the impact melt rocks (Table 3). Ask: “How is this group different from the minerals?”",
      "Use the sample box to try your own percentage, or the stromatolite's 59%, as a bridge to Elaborate 2.",
      "See–Think–Wonder: oldest minerals ≈ same age → formed together; melt rocks younger → a later burst of impacts.",
    ],
    answers: [
      ["Table 2 · minerals (Gyr)", `Earth ${age("earth")} · Mars ${age("mars")} · Moon ${age("moon")} · Meteorite ${age("meteorite")}`],
      ["Table 3 · impact melt (Gyr)", `Rock 1 ${age("melt1")} · Rock 2 ${age("melt2")} · Rock 3 ${age("melt3")} · Rock 4 ${age("melt4")} (range ≈ ${age("melt1")}–${age("melt3")})`],
      ["Conclusion", "Planets ≈ 4.4–4.6 billion years old; most impacts ≈ 3.8–4.0 billion years ago"],
    ],
    lookFors: [
      "Students reading the y-axis (percent remaining) and then across to the curve, then down.",
      "Students noticing less uranium left = older.",
    ],
    misconceptions: [
      "“More uranium left means older.” (It means younger.)",
      "“Meteorites are younger than Earth rocks.” (The meteorite mineral is the oldest.)",
    ],
    support: ["Draw the horizontal-then-vertical reading path with the teacher pen.", "Round to one decimal for MLL students first."],
  },
  lhb: {
    minutes: "15 min",
    doNow: "“What do Earth, Mars, and the Moon share about when they formed?”",
    flow: [
      "Show the timeline. Ask: “Does it look like impacts were spread evenly across time?”",
      "Run the resonance animation. Pause on each alignment and say: “Same place every time, so the tugs add up.”",
      "Read the LHB box together. Then use Think–Talk–Open Exchange with the strengths/limitations cards.",
      "Compare to today: Jupiter and Saturn are close to, but not in, a 2:1 resonance (ratio ≈ 2.48).",
    ],
    tto: "How does your dating evidence support the LHB hypothesis? What implications might it have had for life on Earth?",
    answers: [
      ["Packet Q1–6", "Oldest Earth ≈ 4.4 Gyr; Moon ≈ 4.4; Mars ≈ 4.5 · planets ≈ 4.5–4.6 Gyr · most Moon impacts 3.8–4.0 Gyr · yes, Earth and Mars were in the same “shooting gallery” · evidence: old cratered surfaces on Mars/Mercury, same-age impact melt or shocked minerals on Earth and in meteorites"],
      ["Life implications", "Impacts may have delivered water and key molecules, or disrupted early life"],
    ],
    lookFors: [
      "Students separating evidence (melt-rock ages, crater counts) from the hypothesis (the resonance cause).",
      "Students saying “supports” rather than “proves.”",
    ],
    misconceptions: [
      "“Scientists know the LHB happened exactly this way.” (Still debated; Apollo samples come from a few sites.)",
      "“The planets are in a 2:1 resonance now.” (They are not.)",
    ],
    support: ["Sentence frame: “The evidence ___ supports the hypothesis because ___.”"],
  },
  chalk: {
    minutes: "15–20 min lab + 5 min debrief",
    doNow: "Prediction: “Which liquid will change the chalk more, water or vinegar? Why?”",
    flow: [
      "Run the lab: one piece of chalk in water, one in white vinegar, 5 minutes each. Measure the mass before and after.",
      "Type each group's masses into a row of the class table. The chart shows the class average.",
      "Show the reaction. Ask: “Where did the missing mass go?” (Dissolved, and CO₂ gas in the bubbles.)",
      "Link to Earth: rain is naturally a weak acid (carbonic acid). Over millions of years it dissolves rock.",
    ],
    answers: [
      ["Variables", "Independent: type of liquid · Dependent: change in chalk mass · Constant: chalk size, time, amount of liquid"],
      ["Example data", "Water 5.20 → 5.23 g (+0.03) · Vinegar 5.18 → 4.87 g (−0.31)"],
      ["Acid rain", "Acidified rain would weather limestone and marble faster than ordinary rain"],
    ],
    lookFors: [
      "Students stating the independent and dependent variables correctly.",
      "Students explaining why water gained a little mass (soaking in).",
    ],
    misconceptions: [
      "“The chalk disappeared.” (Matter was conserved: it dissolved and some left as CO₂.)",
    ],
    support: ["Pre-label balances and cups.", "Show the equation with the bubble (CO₂) highlighted."],
  },
  water: {
    minutes: "20 min",
    doNow: "“Name three ways water changes rock.” (Weathering, erosion, deposition.)",
    flow: [
      "Show the water molecule. Why does the polar molecule dissolve so many things? Connect CO₂ + H₂O → carbonic acid.",
      "Project the crater model. Start on the Moon at 4.5 Gyr (nothing erased), then switch to Mars, then Earth.",
      "Play the time slider on Earth. Ask students to explain the dip during the LHB window and the decline afterwards.",
      "Open the reference tables (water, tectonics). Students use them as evidence for Part 3: the scientific explanation.",
    ],
    answers: [
      ["Why craters vanish on Earth", "Liquid water drives weathering, erosion, and deposition; plate tectonics and volcanism recycle crust. Ocean floor < ~200 million years old."],
      ["Mars", "Early water and volcanism, then mostly stopped, so many ancient craters survive"],
      ["Moon", "No liquid water, almost no atmosphere, no plate tectonics → craters from 4 billion years ago remain"],
    ],
    lookFors: [
      "Students linking each world's surface processes to its crater count.",
      "Students recognizing the model is simplified.",
    ],
    misconceptions: [
      "“Earth has no craters.” (It has ~128 known; most are young or deeply eroded.)",
    ],
    support: ["Use the world color chips as redundant cues alongside names."],
  },
  rockcycle: {
    minutes: "12–15 min",
    doNow: "“Where do sedimentary rocks come from?”",
    flow: [
      "Step through the processes with Next. Ask which ones rely on water and which do not.",
      "Show the layers diagram and ask: “Why did deeper layers give older dates in the Dating Game?”",
      "Open the tectonics table. Ask: “What does the cycle say about the stability of rock formations across Earth's history?”",
      "Conclusion (#8): connect the rock cycle to life (nutrients, carbon) and to the lost crater record.",
    ],
    answers: [
      ["Water-reliant steps", "Weathering & erosion · deposition, compaction & cementation · uplift then weathering again"],
      ["Deeper = older", "New sediment settles on top of older sediment (unless layers were flipped or disturbed)"],
      ["Stability", "No rock formation on Earth is permanent; plate tectonics and the cycle keep changing the surface"],
    ],
    lookFors: ["Students describing arrows as a loop, with any rock able to become any other."],
    misconceptions: ["“Rocks cycle in one fixed direction.” (Any pathway is possible.)"],
    support: ["Offer the process name + from → to as a one-line frame."],
  },
  life: {
    minutes: "10–12 min",
    doNow: "“If a rock has 59% of its uranium-238 left, is it older or younger than a rock with 50%?”",
    flow: [
      "Show the stromatolite photo. Explain: layers built by microbes (cyanobacteria) trapping sediment.",
      "Students estimate the age, then Reveal the reading on the curve (59% → about 3.4 Gyr).",
      "Use the timeline to place first life soon after the bombardment: “How long after the calm?”",
      "Debate the strengths and limitations. Can this sample alone rule out life before 3.5 billion years ago?",
    ],
    answers: [
      ["Stromatolite age", `${STROMATOLITE_PCT}% left → about ${u238Age(STROMATOLITE_PCT).toFixed(1)} billion years`],
      ["Limits", "One sample shows life existed by ~3.4–3.5 Gyr; it cannot rule out earlier life. Older rocks may be recycled or destroyed by impacts."],
      ["Stability and life", "Life shows up soon after the solar system settled; fewer giant impacts gave life a chance to survive and spread"],
    ],
    lookFors: ["Students using “by” (minimum age) rather than “began at.”"],
    misconceptions: ["“The oldest rock found is when life began.” (Absence of evidence ≠ evidence of absence.)"],
    support: ["Sentence frame: “The sample shows ___, but it cannot show ___ because ___.”"],
  },
  evaluate: {
    minutes: "20–25 min",
    doNow: "Re-read the question. “What is your claim in one sentence?”",
    flow: [
      "Build the claim together: pick the claim that fits all the evidence (the second one).",
      "Students choose at least 3 pieces of evidence from the evidence bank, then match each to reasoning with “because / therefore.”",
      "Project the rubric checklist. Tick items as pairs read their explanations aloud. Self-score Proficient or Developing, then Glow and Grow.",
      "Close with the Summary Task: strength of scientific explanations and stability of the solar system.",
    ],
    answers: [
      ["Strong claim", "All three bodies were hit during the same bombardment, but Earth's water, rock cycle, and plate tectonics erased most of its craters."],
      ["Evidence", "Oldest minerals 4.4–4.6 Gyr · impact melt 3.8–4.0 Gyr · crater counts 128 / 300,000+ / 1,000,000+ · chalk lost mass in vinegar · Earth has far more liquid water"],
      ["Stability and change", "A long stable period, a burst of instability about 4 billion years ago, then relative calm in which life appeared"],
    ],
    lookFors: [
      "Evidence from at least 3 sources, each linked to the claim by reasoning, not just listed.",
      "An explicit discussion of the stability of the solar system as a factor in life appearing.",
    ],
    misconceptions: ["Listing evidence without a logic statement. Prompt: “Say because… therefore…”"],
    support: ["Sentence frames are in the CER builder; allow students to speak before writing."],
  },
  review: {
    minutes: "15 min",
    doNow: "Show one Myth or Fact card on the board as students enter.",
    flow: [
      "Play Myth or Fact as a whole-class vote (hands, whiteboards, or cold-call).",
      "Use the chapter quiz as an exit ticket. Have students hold up A–D before you reveal.",
      "Look for any item missed by more than a third of the class and re-teach it using the matching stage (use the number keys).",
    ],
    answers: [
      ["Myths", "Cards 1, 3, 4, 5, 7"],
      ["Facts", "Cards 2, 6, 8"],
    ],
    lookFors: ["Students giving the evidence behind each answer, not just the label."],
    misconceptions: ["See the myths, which are the most common misconceptions in the chapter."],
    support: ["Offer whiteboards for silent voting."],
  },
};
