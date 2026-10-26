// Generated from unit2-probability-of-life/unit2-solar-system.qmd (chapter quizzes + Myth or Fact cards).
// Keep wording in sync with the student chapter.

export const QUIZZES = {
  "ss-crater-quiz": {
    "title": "☄️ Check Your Understanding — The Crater Mystery",
    "questions": [
      {
        "q": "About how many times more craters have been found on the Moon than on Earth?",
        "options": [
          "About 8 times",
          "About 800 times",
          "About 8,000 times",
          "About the same number"
        ],
        "correct": 2,
        "explanation": "1,000,000 ÷ 128 ≈ 7,800. The Moon has thousands of times more known craters, even though it is a much smaller target."
      },
      {
        "q": "Switch to 'Craters per million km²'. Why is this a fairer comparison?",
        "options": [
          "It removes the effect of each body's size",
          "It counts only the biggest craters",
          "It shows how old each crater is",
          "It makes Earth's number bigger"
        ],
        "correct": 0,
        "explanation": "Bigger bodies have more surface to hit. Dividing by surface area compares crater crowding on the same-sized patch of ground. The Moon's surface is still about 100,000× more crowded than Earth's."
      },
      {
        "q": "Earth has stronger gravity than the Moon or Mars. What does that suggest about the crater data?",
        "options": [
          "Earth was hit less often",
          "Earth was probably hit at least as often, so something must have erased or hidden its craters",
          "Gravity pushes asteroids away from Earth",
          "Craters only form on bodies without gravity"
        ],
        "correct": 1,
        "explanation": "Stronger gravity pulls in more objects, not fewer. If Earth was hit as often but shows far fewer craters, something on Earth must remove them. That is the question this chapter investigates."
      }
    ]
  },
  "ss-decay-quiz": {
    "title": "☢️ Check Your Understanding — Half-Life",
    "questions": [
      {
        "q": "Set the slider to 2 half-lives. What percent of the parent isotope is left?",
        "options": [
          "0%",
          "25%",
          "50%",
          "75%"
        ],
        "correct": 1,
        "explanation": "Each half-life cuts the amount in half: 100% → 50% → 25%. It does not run out after two half-lives."
      },
      {
        "q": "A bone has 25% of its original carbon-14 left. How old is it?",
        "options": [
          "5,730 years",
          "11,460 years",
          "17,190 years",
          "2,865 years"
        ],
        "correct": 1,
        "explanation": "25% means two half-lives have passed: 2 × 5,730 = 11,460 years."
      },
      {
        "q": "Use the range chart. Why can't carbon-14 date a 4.4-billion-year-old Moon rock?",
        "options": [
          "Moon rocks have too much carbon",
          "Carbon-14 decays faster on the Moon",
          "Carbon-14 only works up to about 70,000 years, and the rock is not organic",
          "Carbon-14 can date it, it just takes longer"
        ],
        "correct": 2,
        "explanation": "After about 12 half-lives (~70,000 years) carbon-14 is essentially gone. Ancient rocks are dated with slow clocks like uranium-238 (half-life 4.5 billion years)."
      }
    ]
  },
  "ss-ages-quiz": {
    "title": "🪨 Check Your Understanding — Ages of Solar System Rocks",
    "questions": [
      {
        "q": "The oldest minerals from Earth, Mars, the Moon, and a meteorite have 49.0–50.5% of their uranium-238 left. What does that tell you?",
        "options": [
          "They are all about 4.4–4.6 billion years old, so they formed at about the same time",
          "Earth is billions of years older than the Moon",
          "Meteorites are the youngest objects",
          "The minerals formed at random times"
        ],
        "correct": 0,
        "explanation": "About 50% left means about one half-life (4.5 billion years). All four ages fall between about 4.4 and 4.6 billion years, evidence that the planets and moons formed together around 4.6 billion years ago."
      },
      {
        "q": "The impact melt rocks have 53.7–55.7% of their uranium-238 left. About when did most of the asteroids strike the Moon?",
        "options": [
          "About 4.6 billion years ago",
          "About 3.8–4.0 billion years ago",
          "About 66 million years ago",
          "About 1 billion years ago"
        ],
        "correct": 1,
        "explanation": "More uranium-238 left means younger. 55.7% → 3.80 billion years and 53.7% → 4.04 billion years. Most impacts happened in a burst a few hundred million years after the Moon formed."
      },
      {
        "q": "The meteorite mineral has LESS uranium-238 left (49.0%) than the Earth mineral (50.5%). Which is older?",
        "options": [
          "The Earth mineral",
          "The meteorite mineral",
          "They are the same age",
          "You can't tell from uranium-238"
        ],
        "correct": 1,
        "explanation": "The longer a mineral has existed, the more of its uranium-238 has decayed. Less parent left = older. The meteorite mineral (~4.6 billion years) is a little older than the Earth mineral (~4.4 billion years)."
      }
    ]
  },
  "ss-lhb-quiz": {
    "title": "💥 Check Your Understanding — The Late Heavy Bombardment",
    "questions": [
      {
        "q": "Which piece of evidence from your investigation best supports the Late Heavy Bombardment hypothesis?",
        "options": [
          "Earth has 128 known craters",
          "Carbon-14 has a half-life of 5,730 years",
          "Impact melt rocks from many lunar craters cluster around 3.8–4.0 billion years old",
          "Jupiter is the largest planet"
        ],
        "correct": 2,
        "explanation": "If most impact melt rocks formed within the same few hundred million years, many impacts happened in a burst, which is exactly what the LHB hypothesis predicts."
      },
      {
        "q": "In the computer model, what made the solar system unstable about 4 billion years ago?",
        "options": [
          "The Sun exploded",
          "Jupiter and Saturn's orbits reached a 2 : 1 resonance, and their combined pull scattered Uranus, Neptune, and Kuiper Belt objects",
          "Earth's Moon was captured",
          "Comets started forming for the first time"
        ],
        "correct": 1,
        "explanation": "When Jupiter orbits twice for every Saturn orbit, their tugs repeat at the same spots and add up. That disturbed the outer planets, which scattered small bodies inward toward the planets."
      },
      {
        "q": "The LHB hit the Moon about 3.9 billion years ago. Why would Earth have been hit at the same time?",
        "options": [
          "Earth was not formed yet",
          "Asteroids only hit moons",
          "Earth's atmosphere was too thick",
          "Earth and the Moon are neighbors in the same region of space, and Earth's stronger gravity attracts even more impactors"
        ],
        "correct": 3,
        "explanation": "Earth and the Moon share the same orbit around the Sun. Anything sweeping through the inner solar system would hit both, and Earth is a bigger target with stronger gravity."
      }
    ]
  },
  "ss-chalk-quiz": {
    "title": "🧪 Check Your Understanding — Chemical Weathering",
    "questions": [
      {
        "q": "In the chalk experiment, what is the independent variable?",
        "options": [
          "The type of liquid (water or vinegar)",
          "The change in mass of the chalk",
          "The 5-minute time",
          "The balance"
        ],
        "correct": 0,
        "explanation": "The independent variable is the one you deliberately change: the liquid. The 5-minute time is kept the same for both (a controlled variable)."
      },
      {
        "q": "What is the dependent variable?",
        "options": [
          "The type of cup",
          "The change in mass of the chalk",
          "The vinegar",
          "The masking tape label"
        ],
        "correct": 1,
        "explanation": "The dependent variable is what you measure to see the effect: the chalk's change in mass (plus your observations)."
      },
      {
        "q": "The chalk in vinegar lost mass and fizzed. What does this predict about acidic rain falling on limestone for thousands of years?",
        "options": [
          "Nothing will happen",
          "The limestone will slowly dissolve and wear away",
          "The limestone will grow larger",
          "The rain will turn into limestone"
        ],
        "correct": 1,
        "explanation": "Even weak acids slowly dissolve calcium carbonate rock. Over thousands to millions of years, this chemical weathering carves caves, wears down mountains, and erases surface features like craters."
      }
    ]
  },
  "ss-water-quiz": {
    "title": "💧 Check Your Understanding — The Role of Water",
    "questions": [
      {
        "q": "Why does water dissolve so many substances?",
        "options": [
          "Water is very heavy",
          "Water is polar: its slightly negative oxygen end and slightly positive hydrogen ends pull on other molecules and ions",
          "Water is always hot",
          "Water has no charge at all"
        ],
        "correct": 1,
        "explanation": "Water's polarity lets it surround and pull apart many substances, which is why it's called the universal solvent."
      },
      {
        "q": "What forms when carbon dioxide dissolves in water?",
        "options": [
          "Salt",
          "Carbonic acid (H₂CO₃)",
          "Oxygen gas",
          "Calcium carbonate"
        ],
        "correct": 1,
        "explanation": "CO₂ + H₂O ⇌ H₂CO₃. This weak acid makes rain slightly acidic and slowly dissolves rock: chemical weathering."
      },
      {
        "q": "In the crater model, set the world to Earth and the time to 4.5. Why are so few craters left compared with the Moon?",
        "options": [
          "Earth was hit less often",
          "Water-driven weathering and erosion, plus plate tectonics and volcanism, erase old craters on Earth",
          "Earth's craters are too small to see",
          "The model only counts craters on the Moon"
        ],
        "correct": 1,
        "explanation": "All three worlds get the same impacts in the model. Only the erasing processes differ, which is the key idea behind the real crater numbers (128 vs. 300,000 vs. 1,000,000)."
      }
    ]
  },
  "ss-rockcycle-quiz": {
    "title": "♻️ Check Your Understanding — The Rock Cycle",
    "questions": [
      {
        "q": "Which pair of rock cycle processes relies MOST on water?",
        "options": [
          "Weathering & erosion, and deposition",
          "Cooling & crystallization of magma",
          "Melting deep in the mantle",
          "Heat & pressure during burial"
        ],
        "correct": 0,
        "explanation": "Rain, carbonic acid, rivers, and oceans break rock down, carry the pieces, and lay them down in layers. These are the processes that wear away and bury craters."
      },
      {
        "q": "In the Dating Game, objects in deeper layers were older. Which rock cycle idea explains this?",
        "options": [
          "Magma always rises to the top",
          "Heavy objects sink through rock",
          "Radioactive decay is faster near the surface",
          "Sediment is deposited in layers, with newer layers settling on top of older ones"
        ],
        "correct": 3,
        "explanation": "Deposition builds layers from the bottom up, so (unless disturbed) the deeper the layer, the older it is."
      },
      {
        "q": "Which body in the tectonics table would you expect to keep its ancient craters BEST?",
        "options": [
          "Earth",
          "The Moon",
          "They would all keep them equally",
          "Earth's ocean floor"
        ],
        "correct": 1,
        "explanation": "The Moon has no active plate tectonics, no liquid water, and almost no atmosphere, so nothing erases its craters. Earth's ocean floor is recycled within about 200 million years."
      }
    ]
  },
  "ss-life-quiz": {
    "title": "🦠 Check Your Understanding — Earliest Life",
    "questions": [
      {
        "q": "The stromatolite has 59% of its uranium-238 left. About how old is it?",
        "options": [
          "About 0.6 billion years",
          "About 3.4 billion years",
          "About 4.5 billion years",
          "About 9 billion years"
        ],
        "correct": 1,
        "explanation": "59% is a bit more than 50%, so a bit less than one half-life (4.5 billion years) has passed: 4.5 × log₂(100/59) ≈ 3.4 billion years."
      },
      {
        "q": "Can this one sample rule out life before 3.5 billion years ago?",
        "options": [
          "Yes, it proves life started exactly 3.4 billion years ago",
          "No, it shows life existed BY then, but older evidence may have been erased by the rock cycle, plate tectonics, or impacts",
          "Yes, because no older rocks exist anywhere",
          "No, because the uranium clock is unreliable"
        ],
        "correct": 1,
        "explanation": "A sample sets a minimum age for life. Absence of older evidence is not evidence of absence, especially on a planet that recycles its crust."
      },
      {
        "q": "How does the timing of this sample connect to the stability of the solar system?",
        "options": [
          "Life appeared before Earth formed",
          "Life appears in the rock record shortly after the Late Heavy Bombardment ended and the solar system became more stable",
          "Life caused the Late Heavy Bombardment",
          "There is no connection"
        ],
        "correct": 1,
        "explanation": "The LHB ended about 3.8 billion years ago; life is clearly present by about 3.4–3.5 billion years ago. Fewer sterilizing impacts gave life a stable environment to persist."
      }
    ]
  },
  "ss-summative-quiz": {
    "title": "🌑 Summative Quiz — Stability of the Solar System",
    "questions": [
      {
        "q": "Earth has about 128 known craters, Mars more than 300,000, and the Moon more than 1,000,000. Which explanation fits ALL the evidence in this chapter?",
        "options": [
          "Earth formed after the bombardment was over",
          "Earth's atmosphere stopped every asteroid",
          "All three were hit during the same bombardment, but Earth's water, rock cycle, and plate tectonics erased most of its craters",
          "The Moon attracts more asteroids because it is smaller"
        ],
        "correct": 2,
        "explanation": "The rocks show all three bodies are the same age and the bombardment hit the inner solar system around 3.8–4.0 billion years ago. The difference is in what happened afterward: Earth's surface processes erased the record."
      },
      {
        "q": "A mineral has 50% of its original uranium-238 left. How old is it?",
        "options": [
          "2.25 billion years",
          "4.5 billion years",
          "9 billion years",
          "5,730 years"
        ],
        "correct": 1,
        "explanation": "50% left means exactly one half-life has passed. Uranium-238's half-life is 4.5 billion years."
      },
      {
        "q": "An archaeologist finds a 20,000-year-old wooden spear. Which isotope should she use to date it?",
        "options": [
          "Uranium-238",
          "Carbon-14",
          "Samarium-147",
          "Rubidium-87"
        ],
        "correct": 1,
        "explanation": "The spear is organic and within carbon-14's useful range (100–70,000 years). The other isotopes only work from about 10 million years and up, and in minerals, not wood."
      },
      {
        "q": "A rock sample has 12.5% of its original carbon-14 left. How old is it?",
        "options": [
          "5,730 years",
          "11,460 years",
          "17,190 years",
          "22,920 years"
        ],
        "correct": 2,
        "explanation": "100% → 50% → 25% → 12.5% is three half-lives: 3 × 5,730 = 17,190 years."
      },
      {
        "q": "Impact melt rocks from the Moon have 53.7–55.7% of their uranium-238 left, while the oldest Moon mineral has 50.5%. What can you conclude?",
        "options": [
          "The impacts happened a few hundred million years after the Moon formed",
          "The impacts happened before the Moon formed",
          "The impacts happened only in the last million years",
          "The Moon and the impacts are the same age"
        ],
        "correct": 0,
        "explanation": "More uranium-238 left = younger. The melt rocks (~3.8–4.0 billion years) are younger than the oldest Moon mineral (~4.4 billion years), so the heavy bombardment came later."
      },
      {
        "q": "During the chalk experiment, the chalk in vinegar fizzed and lost 0.31 g, while the chalk in water barely changed. What does this show?",
        "options": [
          "Vinegar adds mass to rock",
          "Acidic water chemically weathers calcium carbonate rock much faster than plain water",
          "Water is the strongest acid",
          "Mass is not a useful measurement"
        ],
        "correct": 1,
        "explanation": "The acid reacts with calcium carbonate, releasing CO₂ gas and dissolving the chalk. Rainwater containing carbonic acid does the same thing to rock, slowly, over long periods."
      },
      {
        "q": "Why does dissolved carbon dioxide make water better at weathering rock?",
        "options": [
          "CO₂ makes water freeze faster",
          "CO₂ makes water heavier",
          "CO₂ removes all minerals from water",
          "CO₂ + H₂O forms carbonic acid, which dissolves minerals like calcium carbonate"
        ],
        "correct": 3,
        "explanation": "Water's polarity lets it dissolve CO₂, forming carbonic acid (H₂CO₃), a weak acid that drives chemical weathering."
      },
      {
        "q": "Based on the water and tectonics tables, which of these bodies would you expect to have the LEAST weathering and erosion today?",
        "options": [
          "Earth",
          "Mars",
          "The Moon",
          "Earth and Mars equally"
        ],
        "correct": 2,
        "explanation": "The Moon has only small amounts of ice, almost no atmosphere, and no active tectonics, so its 4-billion-year-old craters remain. Mars had some water and activity early on; Earth has the most."
      },
      {
        "q": "In a cliff of undisturbed sedimentary layers, a fossil fish is found below a fossil leaf. What can you infer?",
        "options": [
          "The leaf is probably older than the fish",
          "The fish is probably older than the leaf",
          "They must be exactly the same age",
          "Nothing, because layers are random"
        ],
        "correct": 1,
        "explanation": "Sediment layers build from the bottom up, so lower layers were deposited first and are older (unless the rocks were later folded or overturned)."
      },
      {
        "q": "The oldest stromatolite (59% U-238 left) is about 3.4–3.5 billion years old. Which statement is best supported?",
        "options": [
          "Life began exactly 3.4 billion years ago",
          "Life began before the solar system formed",
          "Life existed on Earth by about 3.5 billion years ago, not long after the Late Heavy Bombardment ended, though it might have started earlier",
          "Life could not exist until the rock cycle stopped"
        ],
        "correct": 2,
        "explanation": "The sample gives a minimum age for life. Older evidence may have been destroyed by impacts or recycled by the rock cycle and plate tectonics, so earlier life can't be ruled out."
      }
    ]
  }
};
