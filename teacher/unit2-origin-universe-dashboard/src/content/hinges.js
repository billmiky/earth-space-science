// hinges.js — Formative hinge questions from the 7-day Origin of the Universe teacher guide.
// Each question includes `why` diagnostics explaining what wrong answers reveal about student thinking.

export const HINGES = {
  "hinge:engage": {
    title: "Day 1 · Hinge · Cosmic Scale",
    questions: [
      {
        q: "Which is larger: the number of grains of sand on all of Earth's beaches, or the number of stars in the observable universe?",
        options: [
          "Grains of sand on Earth (by far)",
          "They are roughly equal",
          "Stars in the observable universe (by roughly 10,000× or more)",
          "We only know about stars in the Milky Way",
        ],
        correct: 2,
        explanation: "There are roughly 10²²–10²⁴ stars in the observable universe versus about 10¹⁸–10¹⁹ grains of sand on Earth — thousands of times more stars than sand grains.",
        why: {
          0: "Common intuition from Earth's scale — use the Hubble Ultra Deep Field to show one tiny speck of sky holds thousands of galaxies.",
          1: "Close in everyday intuition, but stars outnumber sand grains by ~10,000× or more.",
          3: "Hubble proved in the 1920s that smudges like Andromeda are whole galaxies far outside the Milky Way.",
        },
      },
    ],
  },
  "hinge:spectra": {
    title: "Day 1 · Hinge · Galaxy Spectra (p. 4)",
    questions: [
      {
        q: "Compared with the laboratory reference, the absorption lines in the very distant galaxy are…",
        options: [
          "in a completely different pattern",
          "the same pattern, shifted toward the red (longer wavelength) side",
          "the same pattern, shifted toward the blue side",
          "in the exact same positions",
        ],
        correct: 1,
        explanation: "Every galaxy shows the same hydrogen and helium line fingerprint, shifted toward longer (redder) wavelengths — and the farther the galaxy, the bigger the shift.",
        why: {
          0: "Thinks distant galaxies are made of different elements. Slide the straightedge ruler across the spacing between lines to prove the pattern is identical.",
          2: "Mixed up which end of the spectrum is red (long wavelength, ~700 nm) vs. blue/violet (~400 nm).",
          3: "Not comparing positions against the nanometer scale at the top.",
        },
      },
    ],
  },
  "hinge:sound": {
    title: "Day 2 · Hinge · Model 1 Sound Doppler",
    questions: [
      {
        q: "A sound source moves toward a microphone. Compared with when it is still, the microphone detects waves…",
        options: [
          "more often (higher frequency), because the waves are bunched closer together",
          "more often, because the source is producing waves faster",
          "less often, because the waves are spread out",
          "louder, but at the exact same frequency",
        ],
        correct: 0,
        explanation: "The source emits at a constant rate, but moving forward bunches each new wavefront closer to the one ahead — shorter wavelength, higher frequency, higher pitch.",
        why: {
          1: "Very common misconception! Have students snap their fingers each time a wave leaves the moving dot: the emission rate never changes.",
          2: "That's what happens behind the moving source (receding), not in front of it.",
          3: "Confuses loudness (amplitude/distance) with pitch (frequency). Doppler shifts pitch.",
        },
      },
    ],
  },
  "hinge:light": {
    title: "Day 3 · Hinge · Light Waves & Redshift",
    questions: [
      {
        q: "The very distant galaxy's absorption lines are shifted the most toward red. The best explanation from Models 3 & 4 is that it is…",
        options: [
          "moving toward us very fast",
          "moving away from us, faster than closer galaxies",
          "made of redder chemical elements",
          "hotter than other galaxies",
        ],
        correct: 1,
        explanation: "Moving away stretches light waves to longer wavelengths and lower frequency (redshift). A bigger redshift means a faster recession speed.",
        why: {
          0: "Approaching light is squished to shorter wavelengths (blueshift), not redshifted.",
          2: "The identical line pattern shows the same elements (H and He), just shifted in wavelength.",
          3: "Confuses Unit 1 star color/temperature with Doppler shift of absorption lines.",
        },
      },
    ],
  },
  "hinge:explain": {
    title: "Day 4 · Hinge · Three Universe Scenarios",
    questions: [
      {
        q: "Which observation of galaxy spectra would convince you that the universe is CONTRACTING?",
        options: [
          "All galaxies' lines are shifted toward red",
          "All galaxies' lines are shifted toward blue",
          "Galaxies' lines match the lab reference exactly",
          "Distant galaxies look dimmer than nearby ones",
        ],
        correct: 1,
        explanation: "In a contracting universe, galaxies move toward us, squishing light waves to shorter wavelengths and shifting spectral lines toward blue (blueshift).",
        why: {
          0: "Redshift means moving away (an expanding universe — what we actually observe).",
          2: "Matching the lab reference means zero relative motion (a static universe).",
          3: "Brightness changes with distance, not whether space is expanding or contracting.",
        },
      },
    ],
  },
  "hinge:balloon": {
    title: "Day 5 · Hinge · Running Expansion Backward",
    questions: [
      {
        q: "Because almost every galaxy is moving away from the Milky Way, what does the balloon model show about Earth's location?",
        options: [
          "Earth is right at the exact center of the universe",
          "Every galaxy sees all other galaxies moving away — there is no center",
          "The Milky Way is expanding faster than other galaxies",
          "Galaxies are flying outward into empty space around an explosion point",
        ],
        correct: 1,
        explanation: "Tap any galaxy as 'Home' on the balloon: every dot sees every other dot moving away, and farther dots move faster. Space itself expands everywhere at once with no center.",
        why: {
          0: "Classic misconception! Switch the 'Home' dot on the stage to prove every galaxy sees the exact same outward expansion.",
          2: "Real galaxies don't expand internally — gravity holds them together.",
          3: "Space itself is stretching; the Big Bang wasn't an explosion inside preexisting empty space.",
        },
      },
    ],
  },
  "hinge:stretch": {
    title: "Day 6 · Hinge · Where Did the Big Bang's Light Go?",
    questions: [
      {
        q: "The early universe was blindingly bright. Why don't we see bright visible light coming from every direction in the night sky today?",
        options: [
          "The light energy from the Big Bang was destroyed over time",
          "Expansion stretched its wavelength into microwaves, which human eyes can't see",
          "Stars absorbed all of the early light",
          "All the early light escaped past the edge of the universe",
        ],
        correct: 1,
        explanation: "By conservation of energy, the early light couldn't be destroyed. Expanding space stretched it ~1,100× from visible/near-IR light into ~1 mm microwaves (the CMB).",
        why: {
          0: "Violates the Law of Conservation of Energy — energy changes form/wavelength, never vanishes.",
          2: "Most of space is nearly empty; CMB photons have traveled freely for 13.8 billion years.",
          3: "The universe has no outer edge for light to leave through.",
        },
      },
    ],
  },
  "hinge:evidence": {
    title: "Day 6 · Hinge · Composition & Conservation",
    questions: [
      {
        q: "Big Bang models predict 75% H and 25% He. Observations today show ~70–74% H, ~25–28% He, and ~1–2% heavier elements. How do scientists interpret this?",
        options: [
          "It disproves the Big Bang because the percentages aren't identical",
          "It strongly supports the Big Bang: matter is still ~98% H & He, and stars fused a small slice into heavier elements",
          "It shows hydrogen is being destroyed in space",
          "It shows heavier elements came before hydrogen",
        ],
        correct: 1,
        explanation: "Conservation of matter keeps the universe overwhelmingly H and He (~3 : 1), while nuclear fusion in stars and supernovae (Unit 1) explains the tiny 1–2% of oxygen, carbon, and iron.",
        why: {
          0: "Real observations reflect 13.8 billion years of stars fusing a small fraction of H into He and heavier elements.",
          2: "Matter isn't destroyed — H nuclei fuse into He and heavier nuclei.",
          3: "The Big Bang only made light elements (H, He, trace Li); heavier elements came later inside stars.",
        },
      },
    ],
  },
  "hinge:evaluate": {
    title: "Day 7 · Hinge · Probable vs. Certain",
    questions: [
      {
        q: "Why do scientists conclude that other Earth-like planets (and possibly life) are PROBABLE elsewhere in the universe?",
        options: [
          "We have already photographed alien cities on exoplanets",
          "The same physical processes (H/He, gravity, fusion, supernovae) formed trillions of galaxies and stars everywhere",
          "Every single star in the universe has an identical copy of Earth",
          "Because the Milky Way is the oldest galaxy",
        ],
        correct: 1,
        explanation: "Galaxy spectra prove the same elements and physical laws operate across ~10²²–10²⁴ stars, making Earth-like planets very likely — though life elsewhere is probable, not yet proven certain.",
        why: {
          0: "We have no confirmed detection of life elsewhere yet — emphasize probable vs. certain.",
          2: "Planets vary widely (Unit 1 exoplanets), but across trillions of stars even rare Earth-like worlds add up.",
          3: "The Milky Way is one typical galaxy among hundreds of billions.",
        },
      },
    ],
  },
};
