// panels/evaluate.js — Evaluate: build a CER explanation and self-score with the rubric.

import { el, tabs } from "../dom.js";
import { card, layout, bullets } from "../ui.js";

const QUESTION = "Why is there a tremendous difference in the number of craters found on the Moon, Mars, and Earth?";

const CLAIMS = [
  { id: "c1", text: "Earth was hit by far fewer asteroids than the Moon and Mars.", good: false,
    fb: "Not supported. The rocks show Earth formed at the same time and was in the same “shooting gallery”; with stronger gravity it should be hit at least as often." },
  { id: "c2", text: "All three were hit during the same bombardment, but Earth's water, rock cycle, and plate tectonics erased most of its craters.", good: true,
    fb: "Strong claim. It answers the question and fits every piece of evidence in the chapter." },
  { id: "c3", text: "Earth's atmosphere stopped most asteroids before they reached the ground.", good: false,
    fb: "Not supported. Large impactors punch through the atmosphere, and no evidence in this chapter points to it. Check the crater model instead." },
];

const EVIDENCE = [
  { id: "e1", ok: true, text: "Oldest minerals on Earth, the Moon, Mars, and meteorites are all ≈ 4.4–4.6 billion years old.", reason: "the bodies formed at the same time from the same cloud, so they were all targets in the same bombardment" },
  { id: "e2", ok: true, text: "Impact melt rocks are ≈ 3.8–4.0 billion years old.", reason: "most impacts happened in one burst (the Late Heavy Bombardment), so Earth was hit too" },
  { id: "e3", ok: true, text: "Known craters: Earth ≈ 128, Mars 300,000+, Moon 1,000,000+.", reason: "this is the pattern that needs explaining: far fewer craters survive on Earth" },
  { id: "e4", ok: true, text: "Chalk lost mass in vinegar but barely changed in water.", reason: "acidic water chemically weathers rock, as rain with carbonic acid does on Earth" },
  { id: "e5", ok: true, text: "71% of Earth's surface is water; Mercury, Mars, and the Moon have little or no liquid water.", reason: "only Earth has enough liquid water for lots of weathering, erosion, and deposition" },
  { id: "e6", ok: true, text: "Earth has extensive plate tectonics; the ocean floor is less than ~200 million years old.", reason: "plate tectonics and the rock cycle recycle the crust and destroy old craters" },
  { id: "e7", ok: false, text: "Carbon-14 has a half-life of 5,730 years.", reason: "", why: "True, but carbon-14 is too fast to date rocks billions of years old, and it says nothing about why craters differ." },
  { id: "e8", ok: false, text: "Jupiter is the largest planet.", reason: "", why: "True, but it does not help explain why the three bodies have such different crater counts." },
];

const RUBRIC = [
  ["Claim and evidence", "At least <b>3 sources</b> of relevant evidence from this learning cycle"],
  ["Claim and evidence", "When the <b>solar system formed</b> (oldest minerals ≈ 4.4–4.6 billion years)"],
  ["Claim and evidence", "When the <b>great bombardment</b> occurred (impact melt rocks ≈ 3.8–4.0 billion years)"],
  ["Claim and evidence", "What accounts for the <b>difference in crater numbers</b> (water, weathering, erosion, rock cycle, plate tectonics)"],
  ["Reasoning", "An accurate explanation of <b>radiometric dating</b> (half-life, percent remaining → age)"],
  ["Reasoning", "An accurate explanation of <b>surface processes on Earth</b>"],
  ["Reasoning", "A logic statement linking evidence to claim (<b>because</b>, <b>therefore</b>)"],
  ["Reasoning", "<b>Strengths and limitations</b> of the data (e.g., Apollo sites; one stromatolite)"],
  ["Stability and change", "An explicit discussion of how the <b>stability of the solar system</b> was a factor in life appearing"],
];

const PT_ROWS = [
  ["Solar system formed ≈ 4.6 billion years ago", "Life had to wait for a planet to form and cool down"],
  ["Late Heavy Bombardment ≈ 3.8–4.0 billion years ago", "Unstable planetary orbits can bombard planets and disrupt early life"],
  ["Oldest evidence of life ≈ 3.4–3.5 billion years ago", "Life appeared relatively quickly once the solar system became stable"],
  ["Liquid water + active rock cycle + plate tectonics", "Recycle nutrients and carbon and keep a planet livable (but erase craters)"],
  ["Few planets have Earth's water and tectonics", "A planet needs a stable system and active surface processes, which may be rare"],
];

export function mount(container) {
  let claim = null;
  const picked = new Set();
  const ticks = new Set();

  // ----- left: CER builder -----
  const claimHost = el("div", { class: "claim-list" });
  const claimFb = el("p", { class: "fb", hidden: true });
  const evHost = el("div", { class: "ev-grid" });
  const evFb = el("p", { class: "fb", hidden: true });
  const meter = el("div", { class: "meter" });
  const preview = el("div", { class: "cer-preview" });

  function drawClaims() {
    claimHost.replaceChildren(...CLAIMS.map((c) => el("button", {
      class: `claim ${claim === c.id ? "active" : ""} ${claim === c.id ? (c.good ? "good" : "bad") : ""}`, type: "button", "aria-pressed": String(claim === c.id),
      onclick: () => { claim = c.id; claimFb.hidden = false; claimFb.className = `fb ${c.good ? "ok" : "no"}`; claimFb.textContent = c.fb; drawClaims(); drawPreview(); },
    }, [c.text])));
  }
  function drawEvidence() {
    evHost.replaceChildren(...EVIDENCE.map((e) => el("button", {
      class: `ev ${picked.has(e.id) ? "on" : ""} ${picked.has(e.id) ? (e.ok ? "good" : "bad") : ""}`, type: "button", "aria-pressed": String(picked.has(e.id)),
      onclick: () => {
        if (picked.has(e.id)) picked.delete(e.id); else picked.add(e.id);
        evFb.hidden = !picked.has(e.id) || e.ok; evFb.className = "fb no"; evFb.textContent = e.ok ? "" : e.why;
        drawEvidence(); drawPreview();
      },
    }, [e.text])));
  }
  function drawPreview() {
    const good = EVIDENCE.filter((e) => picked.has(e.id) && e.ok);
    const n = good.length;
    meter.innerHTML = "";
    meter.append(...[0, 1, 2].map((i) => el("span", { class: `pip ${i < n ? "on" : ""}` })), el("span", { class: "meter-label", text: n >= 3 ? `${n} relevant sources ✔` : `${n} of 3 relevant sources` }));
    const c = CLAIMS.find((x) => x.id === claim);
    preview.replaceChildren(
      el("div", { class: "cer-row" }, [el("b", { text: "Claim" }), el("span", { text: c ? c.text : "Choose a claim above." })]),
      el("div", { class: "cer-row" }, [el("b", { text: "Evidence" }), good.length ? el("ul", {}, good.map((e) => el("li", { text: e.text }))) : el("span", { class: "muted", text: "Pick evidence from the bank." })]),
      el("div", { class: "cer-row" }, [el("b", { text: "Reasoning" }), good.length ? el("ul", {}, good.map((e) => el("li", { html: `Because ${e.text.replace(/\.$/, "").replace(/^./, (m) => m.toLowerCase())}, <b>therefore</b> ${e.reason}.` }))) : el("span", { class: "muted", text: "Reasoning stems appear with each piece of evidence." })]),
    );
  }

  // ----- right: rubric / PT / summary -----
  const rightBody = el("div", { class: "tab-body" });
  const score = el("div", { class: "score" });
  function drawRubric() {
    const groups = [...new Set(RUBRIC.map((r) => r[0]))];
    rightBody.replaceChildren(
      el("p", { class: "muted", text: "Proficient includes all of these; Developing includes some. Tick items as students show them." }),
      ...groups.flatMap((g) => [
        el("h4", { text: g }),
        el("ul", { class: "check" }, RUBRIC.map((r, i) => [r, i]).filter(([r]) => r[0] === g).map(([r, i]) => el("li", {}, [
          el("button", { class: `chk ${ticks.has(i) ? "on" : ""}`, type: "button", role: "checkbox", "aria-checked": String(ticks.has(i)), onclick: () => { if (ticks.has(i)) ticks.delete(i); else ticks.add(i); drawRubric(); } }, [el("span", { class: "box", text: ticks.has(i) ? "✔" : "" }), el("span", { html: r[1] })]),
        ]))),
      ]),
      score,
      el("p", { class: "muted", html: "<b>Self-score:</b> circle Proficient or Developing, then write one <b>Glow</b> (strength) and one <b>Grow</b> (next step)." }),
    );
    const all = ticks.size === RUBRIC.length;
    score.className = `score ${all ? "ok" : ""}`;
    score.textContent = `${ticks.size} of ${RUBRIC.length} · ${all ? "Proficient" : "Developing"}`;
  }
  function drawPT() {
    rightBody.replaceChildren(el("p", { class: "muted", text: "For the Unit 2 performance task you will argue whether life, and intelligent life, is likely elsewhere. Evidence from this chapter:" }),
      el("table", { class: "data compact" }, [el("thead", {}, [el("tr", {}, [el("th", { text: "Evidence from this chapter" }), el("th", { text: "How it helps your argument" })])]), el("tbody", {}, PT_ROWS.map(([a, b]) => el("tr", {}, [el("td", { class: "strong", text: a }), el("td", { text: b })])))]));
  }
  function drawSummary() {
    rightBody.replaceChildren(card("Summary Task", [bullets([
      "What have you learned about the <b>strength of scientific explanations</b>? <span class='muted'>(Multiple independent lines of evidence make a claim stronger; one sample alone has limitations.)</span>",
      "What have you learned about the <b>stability of the solar system</b>? <span class='muted'>(A long stable period, a burst of instability about 4 billion years ago, then relative calm.)</span>",
    ])], { cls: "key-idea" }));
  }
  const rt = tabs(["Rubric", "Performance Task link", "Summary Task"], (i) => [drawRubric, drawPT, drawSummary][i]());

  const root = layout("two-col evaluate", [
    el("div", { class: "col grow" }, [
      el("div", { class: "question-banner", text: QUESTION }),
      card("1 · Choose a claim", [claimHost, claimFb]),
      card("2 · Pick at least 3 pieces of relevant evidence", [evHost, evFb, meter]),
      card("3 · Your explanation so far", [preview]),
    ]),
    el("div", { class: "col narrow" }, [card("Evaluate: explanation checklist", [rt.root, rightBody])]),
  ]);
  container.appendChild(root);
  drawClaims(); drawEvidence(); drawPreview();
}
