// hinges.js — Hinge / check-for-understanding questions from the teacher guide
// (teacher/unit2-coevolution-guide.html, "Checks for understanding" on each day).
// `why` holds the guide's note on what each wrong answer usually means; it is shown when
// that option is picked, so the class sees why the reasoning doesn't work.

export const HINGES = {
  "hinge:engage": {
    title: "Day 1 hinge question",
    questions: [
      {
        q: "Which statement is best supported by the Pace of Evolution diagram?",
        options: [
          "Life evolved at a steady pace over 4 billion years.",
          "Most of the variety of complex life appeared in the last billion years.",
          "Complex cells appeared before simple cells.",
          "Humans appeared soon after life began.",
        ],
        correct: 1,
        why: ["This assumes evolution is linear. The events crowd together in the last billion years.", "", "This misreads the direction of the diagram: simple cells (~3.8 Ga) come first, complex cells (~2 Ga) later.", "Humans appear in the last 0.0002 billion years, almost 4 billion years after the first cells."],
        explanation: "Sponges, the Cambrian explosion, fish, plants, dinosaurs, mammals and humans all appear in the last billion years. If more than 20% miss this, trace the diagram together from 4.6 billion years ago to now.",
      },
    ],
  },
  "hinge:timeline": {
    title: "Days 2–3 quick polls",
    questions: [
      {
        q: "Which card belongs on the <b>bottom half</b> of the timeline (Other Earth's Systems)?",
        options: ["Stromatolite formation", "Banded iron formation", "Early eukaryotic cells", "21-inch dragonfly fossil"],
        correct: 1,
        why: ["A stromatolite is built by mats of microbes, so it goes with life (top half).", "", "Eukaryotic cells are living things (top half).", "A dragonfly is an animal (top half)."],
        explanation: "A banded iron formation is a rock made by a chemical reaction (iron + oxygen → rust), so it belongs with Earth's other systems.",
      },
      {
        q: "Which came first: photosynthesis or the first oxygen in rocks?",
        options: [
          "Photosynthesis (stromatolites, ~2.7 bya), about 200 million years before the banded iron (~2.5 bya)",
          "The banded iron formation came first",
          "They happened at exactly the same time",
          "Oxygen in rocks came first, about 1 billion years earlier",
        ],
        correct: 0,
        why: ["", "Re-read the dates on the cards: 2.7 bya is older than 2.5 bya.", "Re-read the dates: there are about 200 million years between them.", "Re-read the dates: the oldest oxygen-bearing rock card is 2.5 bya."],
        explanation: "Stromatolites with evidence of photosynthesis (2.7 bya) come about 200 million years before the banded iron formation (2.5 bya). The microbes made the oxygen that rusted the iron.",
      },
    ],
  },
  "hinge:dating": {
    title: "Day 3 checks",
    questions: [
      {
        q: "Uranium-235 has a half-life of 713 million years. How much is left after 1.426 billion years?",
        options: ["50%", "25%", "12.5%", "0%"],
        correct: 1,
        why: ["This counts only one half-life. 1.426 billion ÷ 713 million = 2 half-lives.", "", "That would be 3 half-lives (2.139 billion years).", "Two halves do not make a whole: each half-life removes half of what is left."],
        explanation: "1.426 billion ÷ 713 million = 2 half-lives: 100% → 50% → 25%.",
      },
      {
        q: "True or false: “Carbon-14 can date a 200,000-year-old fossil.”",
        options: ["True: Carbon-14 is used for old bones", "False: 200,000 years is outside Carbon-14's useful range (100–70,000 years)"],
        correct: 1,
        why: ["Find 200,000 in the “Useful dating range” column. Carbon-14 stops at 70,000 years.", ""],
        explanation: "Carbon-14's useful range is 100 to 70,000 years. Potassium-40 (100,000 to 4.6 billion years) fits a 200,000-year-old sample, by dating the volcanic layers around the fossil.",
      },
    ],
  },
  "hinge:oxygen": {
    title: "Day 4 checks",
    questions: [
      {
        q: "In the iron nail demo, the nail under oil didn't rust because…",
        options: ["Oil is a chemical that stops iron from reacting.", "No oxygen could reach the iron.", "Water alone rusts iron, but the oil dried it out."],
        correct: 1,
        why: ["The oil's job was only to seal out the air. The only difference between the tubes is oxygen.", "", "Both nails were in water. Water alone did not rust the sealed nail; it needs oxygen too."],
        explanation: "Rust (iron oxide) only forms when oxygen reaches iron. That is why red rocks like banded iron formations and red beds are evidence that oxygen was present.",
      },
      {
        q: "Atmospheric oxygen rose about 2.4 billion years ago mainly because…",
        options: [
          "Volcanoes released oxygen gas.",
          "Photosynthetic microbes had been making O₂, and once iron in the oceans stopped absorbing it, it built up in the air.",
          "Early animals breathed it out.",
          "Earth cooled and oxygen came out of the rocks.",
        ],
        correct: 1,
        why: ["Volcanoes release gases like CO₂, water vapor and sulfur gases, not significant free oxygen.", "", "This mixes up respiration and photosynthesis (animals use O₂), and animals appear far later.", "Rocks absorbed oxygen (rusting); they did not release it."],
        explanation: "Microbes had been releasing oxygen since about 2.7 bya. It first reacted with dissolved iron (banded iron formations). Once that “oxygen sink” filled, O₂ built up in the air.",
      },
    ],
  },
  "hinge:evidence": {
    title: "Day 5 checks",
    questions: [
      {
        q: "Which statement is <b>evidence</b>, not reasoning?",
        options: ["Photosynthesis produces oxygen.", "Red beds of sedimentary rock are dated to about 2 billion years ago.", "Animals need oxygen for aerobic respiration.", "Oxygen reacts with iron to form rust."],
        correct: 1,
        why: ["This is a process that explains evidence, so it is reasoning.", "", "This is a process (reasoning), not something observed in the rock record.", "This is the mechanism (reasoning) that explains the red rocks."],
        explanation: "Evidence is what is in the fossil or rock record, like a dated rock layer. Reasoning is the process that connects the evidence to the claim.",
      },
      {
        q: "Which chain shows coevolution?",
        options: [
          "Rodinia breaks up → nutrients → algae bloom → more O₂ → more banded iron",
          "Dinosaurs evolve → dinosaurs go extinct",
        ],
        correct: 0,
        why: ["", "This chain is only biology. Coevolution needs Earth's systems and life changing each other."],
        explanation: "In chain A, Earth changes life (nutrients feed algae), and life changes Earth again (oxygen makes more iron oxide).",
      },
    ],
  },
  "hinge:argument": {
    title: "Day 6 checks",
    questions: [
      {
        q: "“The fact that stromatolites appear before banded iron <b>proves</b> that stromatolites caused the iron bands.” Do you agree?",
        options: [
          "Agree: the order of events proves it",
          "Disagree: the order alone is correlation; adding the mechanism (photosynthesis makes O₂, and O₂ + iron → rust) makes the causal case much stronger",
        ],
        correct: 1,
        why: ["Two events in order are correlated. A causal claim needs a known process linking them.", ""],
        explanation: "Timing alone is correlation. A known mechanism plus more than one line of evidence makes a causal argument strong.",
      },
      {
        q: "Rank the evidence that life once existed. Which is <b>strongest</b>?",
        options: [
          "A fossil that looks like a cell",
          "A fossil that looks like a cell AND chemical traces of photosynthesis in the same rock",
          "A striped rock that might be a stromatolite",
        ],
        correct: 1,
        why: ["One line of evidence. Non-living structures can look like cells.", "", "Weakest: folded rock layers can mimic stromatolites."],
        explanation: "Strongest to weakest: b > a > c. Several independent lines of evidence together (the reading's four lines) make the strongest case.",
      },
    ],
  },
  "hinge:extinctions": {
    title: "Day 7 hinge question",
    questions: [
      {
        q: "According to the oxygen graph (p. 19), every major extinction lines up with…",
        options: ["a rise in atmospheric oxygen", "a drop in atmospheric oxygen", "no change in oxygen", "an asteroid impact"],
        correct: 1,
        why: ["Look at each dashed line: oxygen falls near it, then recovers afterward.", "", "Oxygen changes at every extinction line.", "This overgeneralizes from the dinosaurs. Only the K–Pg extinction involved an asteroid."],
        explanation: "That is the packet's pattern: oxygen drops around the extinctions and rises again afterward as photosynthesizers recover. On the graph the dips are clearest at the Devonian, Permian and Triassic; at the Ordovician and K–Pg the change is small next to the uncertainty band, so say “most” and mention the uncertainty.",
      },
    ],
  },
  "hinge:o2ext": {
    title: "Day 7 quick check (from the conferring question “Why does plant recovery come first?”)",
    questions: [
      {
        q: "Which organisms have to recover first for oxygen to rise again after an extinction?",
        options: ["Large predators", "Photosynthesizers: plants, algae and phytoplankton", "Decomposers only", "Insects"],
        correct: 1,
        why: ["Predators use oxygen; they don't make it, and they need food chains rebuilt first.", "", "Decomposers use oxygen as they break down dead matter.", "Insects breathe oxygen in; they don't produce it."],
        explanation: "Recovery begins with photosynthesizers. As they regrow, oxygen rises, which supports the return and diversification of animal life.",
      },
    ],
  },
};
