// notes.js — Teacher notes drawer content for all 10 stages, mapped directly from
// teacher/unit2-origin-universe-guide.html (7-day Origin of the Universe 5E).

export const NOTES = {
  engage: {
    minutes: "Day 1 · 0–35 min",
    goals: [
      "Appreciate the scale of the universe (~10²²–10²⁴ stars — far more than grains of sand on Earth).",
      "Surface initial ideas about how the universe formed during Rumors while honoring personal and cultural beliefs.",
      "Frame science class as building evidence-based scientific explanations that can coexist with religious or philosophical beliefs.",
    ],
    doNow: [
      ["Option A · Estimate", "More grains of sand on Earth's beaches or stars in the universe? (Stars, by ~10,000× or more.)"],
      ["Option B · Unit 1 recall", "What can dark absorption lines in a star's spectrum tell us? (Which elements are present — each element's fingerprint.)"],
      ["Option C · Same or different?", "Do you think other solar systems look like ours? Give one reason."],
    ],
    flow: [
      ["0–4 min", "Do Now + collect estimates on Stars vs. Grains of Sand."],
      ["4–12 min", "Show 'How Many Stars?' video (0:00–2:51) or step through the cosmic scale vote on screen."],
      ["12–22 min", "Packet p. 3: Individual brainstorm of how the universe formed (idea + reason), then Rumors sticky-note swap."],
      ["22–32 min", "Type class ideas into the Rumors Board on screen (saved automatically for Days 4 and 6!). Read the Science + Beliefs framing aloud before challenging any idea."],
      ["32–35 min", "Bridge to Stage 2: 'Our first piece of evidence is the light coming from other galaxies.'"],
    ],
    conferring: [
      "What makes you think that? Is it something you've seen, read, or learned?",
      "Do you think the universe has always looked the way it does now? What would be different?",
    ],
    answers: [
      ["p. 3 Brainstorm", "No single right answer; look for an idea paired with a reason (e.g., giant explosion, gravity pulling gas together, always existed)."],
      ["Stars vs. Sand", "Observable universe: ~10²²–10²⁴ stars. Earth's beaches: ~10¹⁸–10¹⁹ grains of sand."],
    ],
    lookFors: [
      "Every student records at least one idea plus a reason on p. 3.",
      "Respectful listening during Rumors; scientific claims separated from personal beliefs.",
    ],
    misconceptions: [
      "Big Bang = explosion at one point into empty space (will be unpacked on Day 5).",
      "Thinking science and religious/philosophical beliefs must conflict — address proactively on Day 1.",
    ],
    exitSlips: [
      ["Fist to Five", "How confident are you in your Day 1 idea about how the universe formed? (Expect 2s and 3s — 'that's why we need evidence!')"],
    ],
    homework: "Cosmic Address sketch: draw nested rings from your street → NYC → Earth → Solar System → Milky Way → Observable Universe.",
    support: [
      "Read the coexistence framing verbatim before Rumors: 'A scientific explanation isn't necessarily in conflict with religious or philosophical beliefs.'",
    ],
  },

  spectra: {
    minutes: "Day 1 · 35–50 min",
    goals: [
      "Recognize that every galaxy shows the same hydrogen/helium absorption-line fingerprint as the laboratory reference.",
      "Observe that every galaxy's lines are shifted toward longer (redder) wavelengths, and more distant galaxies shift more.",
    ],
    doNow: [
      ["Quick board note", "Write 'units = nanometers (nm)' on the board — the packet p. 4 axis omits units!"],
    ],
    flow: [
      ["35–38 min", "Introduce Edwin Hubble's 1920s discovery of galaxies beyond the Milky Way. Add 'nm' to the p. 4 axis."],
      ["38–46 min", "Pairs inspect p. 4 Q1–3 using a straightedge ruler (mirror it on the Smartboard ruler!). Follow the 396 nm and 654 nm lines down all 5 spectra."],
      ["46–50 min", "Collect 'Spectra wonderings' on chart paper + Exit slip. Preview Day 2: 'Tomorrow we'll investigate moving waves starting with sound.'"],
    ],
    conferring: [
      "Look at the lab reference. Can you find that exact same group of lines in the nearby galaxy? Where did it move?",
      "Follow the dark line near 396 nm down the spectra. What happens to its position?",
      "What is the difference between the Nearby Galaxy and the Very Distant Galaxy?",
      "If galaxies are so far away, how does their light reach us?",
    ],
    answers: [
      ["p. 4 Q1 (Pattern)", "The same spacing/pattern of dark absorption lines appears in every spectrum → all galaxies contain the same elements (mostly H and He)."],
      ["p. 4 Q2 (Direction)", "In every galaxy, the lines are shifted to the RIGHT — toward longer, redder wavelengths (396 → 419 → 456 → 522 nm)."],
      ["p. 4 Q3 (Distance)", "The farther the galaxy, the larger the shift toward red (+23 nm nearby, +59 nm distant, +124 nm very distant)."],
    ],
    lookFors: [
      "Students align a vertical straightedge with a specific lab line rather than eyeballing.",
      "Students notice BOTH 'same pattern' (same elements) AND 'shifted right/red' (bigger shift = farther).",
    ],
    misconceptions: [
      "'Redshift means the galaxy itself is painted red.' Clarify that the dark lines shift toward the red end of the spectrum.",
      "'Different line positions mean different elements.' Check spacing between pairs of lines — the pattern is preserved!",
    ],
    exitSlips: [
      ["Quick check", "Use the p. 4 hinge question (press Q): How do the Very Distant Galaxy's lines compare to the Lab Reference?"],
    ],
    homework: "Finish p. 4 Q1–3 and write one wondering question about why distant galaxies' light shifts more.",
    support: [
      "If available, pass around diffraction glasses or handheld spectroscopes so students see how a spectrum forms.",
    ],
  },

  sound: {
    minutes: "Day 2 · 50 min",
    goals: [
      "Wavelength and frequency are inversely related: shorter wavelength = higher frequency.",
      "For sound, higher frequency = higher pitch.",
      "A moving source emits waves at a constant rate, but waves bunch up in front (higher pitch) and spread out behind (lower pitch) — the Doppler effect.",
      "Wave energy is not destroyed; it spreads outward through the system.",
    ],
    doNow: [
      ["Option A · Everyday sound", "Describe what a passing ambulance siren sounds like approaching vs. leaving ('neee-owww' — pitch drops)."],
      ["Option B · Wave sketch", "Sketch a long-wavelength wave and a short-wavelength wave. Label which has higher frequency (short wavelength)."],
      ["Option C · Recall", "Yesterday galaxy spectral lines shifted toward red. Give one possible reason."],
    ],
    flow: [
      ["0–4 min", "Do Now + call on 3–4 students to share Cosmic Address sketches."],
      ["4–10 min", "Waves 101 (p. 5 Q1–2): label wavelength & frequency on board."],
      ["10–15 min", "Siren video / sound demo (p. 6 Q1–2): describe pitch drop."],
      ["15–30 min", "Model 1 Doppler on Smartboard (pp. 6–7): mute audio first and snap fingers as each wave leaves the dot (constant rate!). Unmute and listen to receiver clicks speed up then slow down."],
      ["30–38 min", "Model 2 Piano (p. 8): tap low C vs. high C, watch wavelength shrink as Hz rises. Complete siren explanation + driver challenge."],
      ["38–48 min", "See-Think-Wonder rows 1–2 (p. 11) + Domino Discover."],
      ["48–50 min", "Exit slip."],
    ],
    conferring: [
      "Is the blue dot producing waves faster when it moves? How do you know? (Snap-finger check: rate is constant!)",
      "Where are the wave circles closest together? Where are they farthest apart?",
      "Put Models 1 and 2 together: why does the siren's pitch drop right as it passes?",
    ],
    answers: [
      ["p. 5 Q1–2", "Wavelength and frequency are inversely related. Farther galaxies' redshifted light has longer wavelength → lower frequency."],
      ["p. 6–7 Energy Q1", "Sound energy spreads outward over a larger area (gets fainter), never destroyed."],
      ["p. 7 Receiver Q1–3", "Source emits at a constant rate. Approaching: waves bunch up (shorter λ, higher f). Receding: waves spread out (longer λ, lower f)."],
      ["p. 8 Challenge (Driver)", "Driver hears a constant pitch (no Doppler effect) because there is zero relative motion between driver and siren."],
    ],
    lookFors: [
      "Distinguishes constant emission rate from changed received frequency.",
      "Connects Model 1 spacing to Model 2 pitch (bunched = short λ = high f = high pitch).",
    ],
    misconceptions: [
      "'Doppler makes sounds louder/softer.' Loudness is distance/amplitude; Doppler changes PITCH (frequency).",
      "'The moving source emits waves faster.' Use the muted finger-snapping test on the Smartboard!",
    ],
    exitSlips: [
      ["Option A", "Explain why a siren's pitch drops as it passes you. Use the words wavelength and frequency."],
    ],
    homework: "Doppler street diagram: draw an ambulance moving right with bunched waves in front, stretched waves behind, and label what an observer on each side hears.",
    support: [
      "Hands high = high pitch / short wavelength; hands low = low pitch / long wavelength — great quick kinesthetic check after Model 2.",
    ],
  },

  light: {
    minutes: "Day 3 · 50 min",
    goals: [
      "Light behaves like sound: moving apart → longer wavelength, lower frequency, shifted toward red (redshift).",
      "Moving together → shorter wavelength, higher frequency, shifted toward blue (blueshift).",
      "Light's energy comes from nuclear fusion in the galaxy's stars, travels outward through space, and is never destroyed.",
    ],
    doNow: [
      ["Option A · Rainbow order", "List visible light colors from longest to shortest wavelength (Red, Orange, Yellow, Green, Blue, Violet)."],
      ["Option B · Transfer", "If light works like sound, what happens to light from an approaching object? (Shorter λ, higher f, blueshift.)"],
      ["Option C · Energy", "Where does a galaxy's light energy come from? (Nuclear fusion in its stars — Unit 1.)"],
    ],
    flow: [
      ["0–4 min", "Do Now + share Day 2 Doppler street diagrams."],
      ["4–7 min", "PACKET FIX: Have every student cross out 'blue' in Model 4 Q4 (p. 10) and write 'red'!"],
      ["7–22 min", "Model 3 Moving Galaxy on Smartboard (pp. 9–10): energy Q1–3, then test Stationary / Toward / Away and fill the table."],
      ["22–32 min", "Model 4 EM Spectrum (p. 10 + ESSRT p. 3): sweep visible colors and check frequency/energy arrows."],
      ["32–46 min", "See-Think-Wonder rows 3–4 (p. 11) + Domino Discover side-by-side with Day 2 sound chart. Revisit Day 1 'Spectra wonderings'."],
      ["46–50 min", "Rubric self-check + Exit slip."],
    ],
    conferring: [
      "How do your observations of light waves in Model 3 connect to sound waves in Model 1?",
      "Does the galaxy itself change color, or only the light that reaches Earth?",
      "On ESSRT p. 3, which direction is higher frequency? Which is longer wavelength?",
    ],
    answers: [
      ["p. 9 Energy Q1–3", "Energy comes from nuclear fusion in stars, travels outward in all directions, and keeps going until absorbed (e.g., telescope/eye/dust) where it transforms (heat/signal) — never destroyed."],
      ["p. 10 Model 3 Table", "Still → no change (white). Toward Earth → higher f, shorter λ, toward blue. Away from Earth → lower f, longer λ, toward red."],
      ["p. 10 Model 4 Q4 (FIXED)", "Fix typo ('blue' → 'red'): moving away stretches light to longer wavelengths, lower frequency → red end of spectrum."],
    ],
    lookFors: [
      "Students map sound bunched ↔ light blue and sound spread ↔ light red.",
      "Students cite ESSRT p. 3 correctly: longer wavelength = LOWER frequency and LOWER energy.",
    ],
    misconceptions: [
      "'Away = cold = blue.' Do the whiteboard fill-in: Away → wavelength LONGER → frequency LOWER → RED.",
      "'Longer wavelength = more energy.' Point directly to the opposite arrows on ESSRT p. 3.",
    ],
    exitSlips: [
      ["Whiteboard fill-in", "Galaxy moving AWAY → wavelength ____ (longer) → frequency ____ (lower) → shifts toward ____ (red)."],
    ],
    homework: "Complete any unfinished rows of the See-Think-Wonder chart (p. 11) and highlight evidence for tomorrow's explanation.",
    support: [
      "Remind students of the p. 10 Q4 packet typo BEFORE they begin Model 4 so they don't try to justify 'blue'.",
    ],
  },

  explain: {
    minutes: "Day 4 · 50 min",
    goals: [
      "Predict spectral shifts for three scenarios: expanding (red), contracting (blue), static (no shift).",
      "Use real galaxy spectra + Doppler effect to argue that the universe is expanding (farther galaxies recede faster).",
      "Recognize that Models 1 & 3 simulate energy flow without energy ever being destroyed.",
    ],
    doNow: [
      ["Option A · Quick sort", "Match: (1) toward us, (2) away, (3) still → (a) no shift, (b) redshift, (c) blueshift. (1-c, 2-b, 3-a.)"],
      ["Option B · Claim it", "Complete: 'Distant galaxies are…' (…moving away from us, and farther ones are moving away faster.)"],
      ["Option C · Evidence vs. Reasoning", "Is 'light from a receding source stretches' evidence or reasoning? (Reasoning — a scientific principle. Evidence = shifted spectral lines.)"],
    ],
    flow: [
      ["0–4 min", "Do Now."],
      ["4–14 min", "Packet p. 12: Three Scenarios (Expanding / Contracting / Static). Lock in predictions on Stage Tab 1, then overlay real spectra!"],
      ["14–28 min", "Read–Generate–Sort–Solve (pp. 13–14). Optional: show Hubble's Law cluster plot on Tab 2 (v = 70 × d)."],
      ["28–40 min", "Class Consensus Discussion: project 2–3 group claims; revisit Day 1 Rumors Board on Tab 3 to eliminate unsupported scientific claims (like 'static/unchanging') while honoring personal beliefs."],
      ["40–48 min", "Summary Task Q1–2 (p. 15): models of energy flow & conservation."],
      ["48–50 min", "Exit slip (preview Day 5: 'If it's expanding today, what was it like in the past?')."],
    ],
    conferring: [
      "Which scenario's prediction matches the real galaxy spectra from Day 1?",
      "Point to one specific spectral line and tell me how far it moved.",
      "Why does it matter that MORE distant galaxies shift MORE?",
    ],
    answers: [
      ["p. 12 Three Scenarios", "Expanding → redshift (away, longer λ). Contracting → blueshift (toward, shorter λ). Static → no shift (matches lab reference)."],
      ["pp. 13–14 Exemplar CER", "Claim: Universe is expanding. Evidence: Every galaxy shows the same H/He lines shifted toward red, with Very Distant shifted most (+124 nm). Reasoning: By Doppler effect, redshift means moving away; farther = faster means space itself is expanding."],
      ["p. 15 Summary Task", "Models 1 & 3 show a source, waves, and observer with energy flowing outward. Energy spreads out and shifts wavelength, never destroyed."],
    ],
    lookFors: [
      "CER cites specific numerical shifts (e.g., 396 nm → 522 nm) rather than vague 'lines moved'.",
      "Connects 'farther shifts more' to universal expansion rather than random galaxy motion.",
    ],
    misconceptions: [
      "Eliminating students' personal/religious beliefs on the Day 1 chart — only eliminate testable scientific claims contradicted by spectra (like 'static universe').",
    ],
    exitSlips: [
      ["Option A · Conservation", "In Models 1 and 3, was energy ever destroyed? Explain."],
      ["Option B · Preview", "If the universe is expanding today, what was it like a long time ago? (Smaller, galaxies closer together.)"],
    ],
    homework: "Dot Universe: draw a 3×3 grid of dots 1 cm apart ('Now') and 2 cm apart ('Later'). Measure how far 4+ dots moved from your chosen 'home' dot — then switch home dots to test if there is a center!",
    support: [
      "Post Class Consensus Discussion sentence stems ('I build on…', 'What evidence supports…') — this is the first consensus discussion in this 5E.",
    ],
  },

  balloon: {
    minutes: "Day 5 · 0–34 min",
    goals: [
      "Rewinding expansion shows the early universe was vastly smaller, hotter, denser, and brighter (~13.8 billion years ago).",
      "Every galaxy sees all other galaxies moving away — space expands everywhere with no center and no edge.",
      "Name the balloon model's limitation: marker galaxies stretch on rubber, whereas real galaxies are held together by gravity.",
    ],
    doNow: [
      ["Share Dot Universe HW", "Have 2–3 students share their ruler measurements: dots that started farther from home moved farther — regardless of which dot was home!"],
    ],
    flow: [
      ["0–4 min", "Do Now: share Dot Universe measurements."],
      ["4–20 min", "Part 1 Balloon Model (pp. 16–17): draw 15–20 galaxies on half-inflated balloon, inflate, then deflate to rewind to 5 Gyr ago (~67%), 10 Gyr ago (~35%), and the beginning. Demo 'Tap any galaxy as Home' on Smartboard!"],
      ["20–28 min", "Part 2 Q1–3 (p. 18): agree the early universe was extremely hot, dense, and bright → Big Bang theory."],
      ["28–34 min", "Read p. 19 Claims 1 & 2 (75% H / 25% He + huge visible light) and watch 'Origins of the Universe 101' (to 1:10)."],
    ],
    conferring: [
      "As you let air out to rewind time, what happens to the distances between galaxies?",
      "If everything is packed into a tiny space, what happens to temperature, density, and brightness?",
      "Where is this balloon model misleading? (Marker dots stretch, but real galaxies don't!)",
    ],
    answers: [
      ["pp. 16–17 Balloon", "Inflating: every galaxy moves farther from every other galaxy; farther ones move faster. Deflating: all galaxies crowd together until everything was packed in one tiny, hot, dense state."],
      ["p. 18 Part 2", "Early universe conditions: extremely hot, extremely dense, extremely bright — the Big Bang theory."],
      ["Model Limitation", "Drawn marker galaxies stretch with the rubber; real galaxies stay the same size because gravity holds them together."],
    ],
    lookFors: [
      "Students explicitly distinguish 'galaxies moving apart because space stretches' from 'an explosion throwing debris into empty space'.",
      "Students can prove there is no center by switching the home galaxy.",
    ],
    misconceptions: [
      "'Galaxies and Earth are stretching bigger as the universe expands.' Toggle the 'Real vs. Balloon Dots' switch on the Smartboard!",
      "'We are at the center.' Tap Galaxy H or Galaxy K on screen to show it sees the exact same outward arrows.",
    ],
    exitSlips: [
      ["Quick check", "Why did scientists infer the early universe was extremely hot and dense?"],
    ],
    homework: "Preview Part 3: write a prediction — if energy cannot be destroyed, what happened to all the bright light from the early universe?",
    support: [
      "Check for latex allergies before distributing balloons; keep latex-free balloons or let pairs use the Smartboard simulator.",
    ],
  },

  stretch: {
    minutes: "Day 5 (34–50 min) + Day 6 (0–16 min)",
    goals: [
      "Conservation of matter and energy: neither can be created or destroyed, only moved or changed in form.",
      "Expansion does not change the 3 : 1 ratio of H to He atoms.",
      "Expansion stretches early visible light (~500–1000 nm) by ~1,100× into invisible microwaves (~1 mm, 2.7 K) — the Cosmic Microwave Background.",
    ],
    doNow: [
      ["Day 6 Option A · Stretch it", "Visible light ≈ 500 nm. Stretch it 2,000× → ~1,000,000 nm = 1 mm. What band on ESSRT p. 3? (Microwaves!)"],
      ["Day 6 Option B · Recipe", "Big Bang made 3 H for every 1 He (by mass). If matter can't be destroyed, what should we find today? (~3 : 1 H : He.)"],
      ["Day 6 Option C · Night sky", "If the early universe was blindingly bright, why is the night sky dark today?"],
    ],
    flow: [
      ["Day 5 · 34–44 min", "Energy & matter conservation discussion (connect back to Models 1 & 3 + Unit 1 fusion)."],
      ["Day 5 · 44–48 min", "Draw 3 : 1 H/He atoms + visible wave on un-inflated balloon (p. 20). Save balloons for Day 6."],
      ["Day 6 · 4–16 min", "Inflate H/He balloons + drag the Smartboard Cosmic Light Stretcher from 1× (3,000 K visible) to 1,100× (2.7 K microwaves). Answer Part 3 Q3–6 (pp. 20–21)."],
    ],
    conferring: [
      "As the balloon inflated, did the count of H and He atoms change? Did the 3 : 1 ratio change?",
      "What happened to the wavelength of the light wave you drew? Find that band on ESSRT p. 3.",
      "Why can't our eyes see that leftover light today?",
    ],
    answers: [
      ["p. 20 Q3 (Matter)", "Because matter cannot be created or destroyed, the universe today should still be mostly ~75% hydrogen and ~25% helium."],
      ["p. 20 Q4–5 (Light)", "As space expands, the early visible light waves stretch to much longer wavelengths (lower frequency/energy) — shifting from visible → infrared → microwaves."],
      ["p. 21 Q6 (Prediction)", "We should detect faint microwave radiation coming from every direction in space (not visible light)."],
    ],
    lookFors: [
      "Students explicitly connect 'longer wavelength' → 'microwaves on ESSRT p. 3' → 'why the night sky looks dark to human eyes'.",
    ],
    misconceptions: [
      "'The Big Bang light disappeared / ran out.' Reinforce conservation of energy — it's still all around us as 2.7 K microwaves!",
      "'Stretching makes the light more energetic.' Longer wavelength = LOWER frequency and LOWER energy.",
    ],
    exitSlips: [
      ["Hinge (press Q)", "Why don't we see bright visible light from all directions today? (Stretched into microwaves.)"],
    ],
    homework: "Sketch one wave on a small balloon (visible, short λ) and next to it on a huge balloon (microwave, long λ), labeling frequency and energy.",
    support: [
      "Keep ESSRT p. 3 visible alongside the Planck curve on screen so students see Visible (400–700 nm) → Infrared → Microwaves (1 mm).",
    ],
  },

  evidence: {
    minutes: "Day 6 · 16–50 min",
    goals: [
      "Compare predicted composition (75% H / 25% He) against observed composition (~70–74% H, ~25–28% He, ~1–2% heavier) and explain the tiny difference via stellar fusion & supernovae.",
      "Connect the 1964 Penzias & Wilson CMB discovery to the Big Bang prediction.",
      "Synthesize all three lines of evidence (redshift, CMB, H/He ratio) with explicit scientific reasoning.",
    ],
    doNow: [
      ["Number note", "Packet text says 'slightly less than 75% H / 25% He, ~2% other'; pie shows 70/28/1/1; table says 74/25. Clarify sources round differently — the key is ~98% H+He, still close to 3 : 1!"],
    ],
    flow: [
      ["16–24 min", "Part 4 Q1 (pp. 21–22): compare Predicted vs. Observed pie charts on Tab 1. Ask: 'Does 70/28/2 disprove 75/25?' (No — stars fused a tiny share into heavier elements!)"],
      ["24–34 min", "Read & annotate 'Murmur of a Bang' + inspect CMB full-sky map on Tab 2 (Penzias & Wilson 1964, 2.7 K / −270 °C). Answer Q3."],
      ["34–42 min", "Individual writing: Bringing All the Evidence Together (p. 23) — all 3 reasoning rows."],
      ["42–48 min", "Consensus-Building Share + final revisit of Day 1 Rumors Board on Tab 3. Preview Day 7: 'Is life elsewhere probable?'"],
      ["48–50 min", "Exit slip."],
    ],
    conferring: [
      "Does the small difference between 75/25 and 70/28/2 weaken or strengthen the theory? Why?",
      "How does the CMB prove energy from the early universe was NOT destroyed?",
      "Rubric scan: does each reasoning box on p. 23 use 'because' or 'therefore' and name a scientific concept?",
    ],
    answers: [
      ["Row 1 · Redshift", "All distant galaxies show redshifted spectra (farther = more shifted) → Doppler effect shows space is expanding → rewinding points to a hot, dense beginning."],
      ["Row 2 · CMB", "Faint 2.7 K microwave glow comes uniformly from every direction → conservation of energy + expansion stretched the early universe's bright light into microwaves."],
      ["Row 3 · H & He Ratio", "Universe is ~74% H, ~25% He, <2% heavier → conservation of matter matches Big Bang's 3 : 1 prediction, with stellar fusion explaining the ~2% heavy elements."],
    ],
    lookFors: [
      "Reasoning boxes name specific mechanisms (Doppler effect, conservation of energy/matter, nuclear fusion) instead of just repeating evidence.",
    ],
    misconceptions: [
      "'Because 70% ≠ 75%, the Big Bang prediction failed.' Explicitly link back to Unit 1 stellar nucleosynthesis!",
      "'A scientific theory is just a guess.' Point out three independent lines of evidence all confirming predictions made decades earlier.",
    ],
    exitSlips: [
      ["Confidence check", "Repeat Day 1's Fist-to-Five on how the universe formed and compare! Which piece of evidence was most convincing?"],
    ],
    homework: "Review your p. 23 table and highlight the 3 concepts (Doppler, Conservation, Fusion) to prepare for Day 7's Performance Task.",
    support: [
      "Pause during p. 23 writing to model one 'because / therefore' sentence if students are only restating observations.",
    ],
  },

  evaluate: {
    minutes: "Day 7 · 50 min",
    goals: [
      "Trace the 7-stage formation of the universe from inflation → first atoms/CMB → first galaxies & stars → heavy elements & rocky planets.",
      "Argue from evidence that the same physical processes occurred everywhere across ~10²²–10²⁴ stars, making Earth-like planets (and life) probable — while distinguishing probable from certain.",
    ],
    doNow: [
      ["Option A · Odds", "If only 1 in a billion stars had a planet with life, and there are 10²² stars, how many living worlds? (10²² ÷ 10⁹ = 10¹³ = 10 trillion!)"],
      ["Option B · Same recipe", "What are stars in other galaxies made of, and what's your evidence? (H & He — identical absorption lines in every galaxy spectrum.)"],
    ],
    flow: [
      ["0–4 min", "Do Now on back of Performance Task handout."],
      ["4–14 min", "Step through the 7-Stage Universe Timeline (pp. 24–25) on Tab 1 (note: infographic says 15 B yrs; modern best value is 13.8 B yrs) + test cosmic odds on Tab 2."],
      ["14–28 min", "Individual: Revisiting the Performance Task handout using the rubric (pp. 26–27)."],
      ["28–36 min", "Small-group chart-paper models: Big Bang → galaxies & stars → Earth-like planets & life likelihood."],
      ["36–43 min", "Idea Carousel with sticky-note symbols (✓ resonates · + add · ? relevant? · Δ clarify)."],
      ["43–50 min", "Revisit Driving Question Board + bridge to next investigation + 3-2-1 Exit slip."],
    ],
    conferring: [
      "How do you know the processes that formed our solar system happened in other galaxies too? (Same spectra, same physics everywhere.)",
      "Does 'Earth-like planets are likely' mean 'life is certain'? What else would life need?",
      "Which 3+ sources of evidence from this 5E are in your Performance Task explanation?",
    ],
    answers: [
      ["p. 24 Q1 (Same everywhere?)", "Yes — the entire universe underwent the same expansion, cooling, H/He atom formation, gravity clumping into galaxies/stars, fusion, and supernovae."],
      ["p. 24 Q2 (Similar solar systems?)", "Probably! Spectra show the exact same elements everywhere, and with ~10²²–10²⁴ stars, gravity + supernovae produce rocky planets throughout the cosmos."],
      ["PT Rubric Must-Haves", "3+ lines of evidence (redshift, CMB, H/He) · wave/matter behavior under expansion · because/therefore logic · conservation of matter & energy."],
    ],
    lookFors: [
      "Students distinguish probable from proven/certain — avoid overclaiming 'aliens definitely exist'.",
      "Group models explicitly connect H/He spectra → same elements everywhere → heavy elements from supernovae → rocky planets.",
    ],
    misconceptions: [
      "Overclaiming certainty ('there MUST be life') vs. evidence-based probability.",
      "Thinking the packet's 13.7 B yrs vs. infographic's 15 B yrs means scientists don't know — explain measurement precision refined to 13.8 B yrs.",
    ],
    exitSlips: [
      ["3-2-1 Exit", "3 pieces of Big Bang evidence · 2 reasons other solar systems resemble ours · 1 question about life elsewhere."],
    ],
    homework: "Complete any revisions to the Revisiting the Performance Task organizer.",
    support: [
      "Keep the Idea Carousel legend (✓ + ? Δ) projected on Tab 3 during group rotations.",
    ],
  },

  review: {
    minutes: "Review · 10–25 min",
    goals: [
      "Address lingering Big Bang misconceptions through the 8 Myth or Fact cards.",
      "Check mastery across all 10 summative end-of-chapter Regents-style questions.",
    ],
    doNow: [
      ["Rapid review", "Run 3 Myth or Fact cards as a whole-class stand-up/sit-down warm-up before a quiz."],
    ],
    flow: [
      ["0–10 min", "Project Myth or Fact? cards — have pairs vote Myth vs. Fact and defend their choice before tapping."],
      ["10–25 min", "Run the 10-question Summative Quiz using A–D keys; pause on any question where the class splits."],
    ],
    conferring: [
      "Which word in that statement makes it a Myth instead of a Fact?",
      "Which piece of evidence from our packet proves that choice wrong?",
    ],
    answers: [
      ["All keys built in", "Tap any choice (or press A–D / Enter) on screen to reveal the full explanation immediately."],
    ],
    lookFors: [
      "Students explain WHY myths fail (e.g., no center, energy conserved as CMB, galaxies don't stretch).",
    ],
    misconceptions: [
      "All 8 core misconceptions from the teacher guide are targeted directly in the Myth or Fact deck.",
    ],
    exitSlips: [
      ["Target check", "Have students write down the 1 question they missed or felt least sure about and star that page in their packet."],
    ],
    homework: "Study packet pp. 4, 10, 12, 23, and ESSRT p. 3 Electromagnetic Spectrum.",
    support: [
      "Use Focus Mode (H) during quiz review for maximum projector visibility from the back row.",
    ],
  },
};
