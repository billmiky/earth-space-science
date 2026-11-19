// panels/argument.js — Day 6 Explain Part 2: Constructing the Argument.
// Five-element class tracker (for circulating while students write), atmosphere then vs. now,
// "Signals in the Sands of Time" lines of evidence, and the Class Consensus Discussion steps.

import { el, svg, tabs } from "../dom.js";
import { ATMOSPHERE } from "../science.js";
import { chartRoot, text } from "../chart.js";
import { card, layout, bullets, toggle } from "../ui.js";

const ELEMENTS = [
  "Atmosphere <b>then and now</b> (H/He → CH₄, NH₃, H₂O, N₂ → 78% N₂, 21% O₂)",
  "Evidence of <b>photosynthesizers</b> (stromatolites, banded iron)",
  "O₂ changed <b>Earth's systems</b> (banded iron, red beds, ozone, ice age)",
  "O₂ changed the <b>biosphere</b> (eukaryotes, Cambrian, life on land)",
  "<b>Causal links or feedback</b> between the biosphere and Earth's systems",
];

const LINES = [
  ["Large structures you can see", "Stromatolites", "Folds in rock can look like stromatolites"],
  ["Chemical traces of fossils", "Carbon isotope “fingerprints”", "Some non-living processes mimic the chemistry"],
  ["Degraded biological compounds", "Broken-down molecules made by cells", "Can be contaminated or destroyed over time"],
  ["Fossils of the microorganisms", "Tiny fossil cells", "A sediment structure can look like a group of cells"],
];

export function mount(container) {
  // ---------- tracker ----------
  let classSize = 28;
  const counts = ELEMENTS.map(() => 0);
  const trackHost = el("div", { class: "tracker" });
  const alert = el("div", { class: "fb no", hidden: true });
  const sizeIn = el("input", { type: "number", min: "1", max: "60", value: String(classSize), "aria-label": "Students in class", class: "num-sm" });
  sizeIn.addEventListener("input", () => { classSize = Math.max(1, parseInt(sizeIn.value, 10) || 1); drawTracker(); });
  function drawTracker() {
    trackHost.replaceChildren(...ELEMENTS.map((label, k) => {
      const pct = Math.min(100, Math.round((counts[k] / classSize) * 100));
      return el("div", { class: "track-row" }, [
        el("span", { class: "track-num", text: "①②③④⑤"[k] }),
        el("div", { class: "track-main" }, [
          el("div", { class: "track-label", html: label }),
          el("div", { class: "track-bar", role: "img", "aria-label": `${counts[k]} of ${classSize} students` }, [el("span", { style: `width:${pct}%` })]),
        ]),
        el("button", { class: "tool-btn", type: "button", text: "−", "aria-label": `One fewer for element ${k + 1}`, onclick: () => { counts[k] = Math.max(0, counts[k] - 1); drawTracker(); } }),
        el("span", { class: "track-count", text: `${counts[k]}` }),
        el("button", { class: "tool-btn primary", type: "button", text: "+", "aria-label": `One more for element ${k + 1}`, onclick: () => { counts[k] = Math.min(classSize, counts[k] + 1); drawTracker(); } }),
      ]);
    }));
    const missing5 = counts[4] < classSize / 2;
    alert.hidden = !(missing5 && counts.some((c) => c > 0));
    alert.innerHTML = "<b>Element ⑤ is the one most often missing.</b> If more than half the class lacks it at minute 14, pause and model one sentence: “<b>Because</b>… <b>this caused</b>… <b>which then</b>…”";
  }

  // ---------- atmosphere then and now ----------
  function atmosphere() {
    const today = ATMOSPHERE[2];
    const S = 260, c = S / 2, R = 100, r0 = 58;
    const donut = chartRoot(S, S, "Today's atmosphere: 78 percent nitrogen, 21 percent oxygen, 1 percent other gases.");
    let a = -Math.PI / 2;
    const cls = ["n2", "o2", "other"];
    today.mix.forEach(([, pct], k) => {
      const a1 = a + (pct / 100) * 2 * Math.PI - 0.025;
      const p = (ang, rr) => `${c + rr * Math.cos(ang)},${c + rr * Math.sin(ang)}`;
      const large = a1 - a > Math.PI ? 1 : 0;
      donut.appendChild(svg("path", { d: `M${p(a, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r0)} A${r0},${r0} 0 ${large} 0 ${p(a, r0)} Z`, class: `slice ${cls[k]}` }));
      a = a1 + 0.025;
    });
    donut.appendChild(text(c, c - 2, "21% O₂", { class: "bar-value", "text-anchor": "middle" }));
    donut.appendChild(text(c, c + 20, "today", { class: "tick", "text-anchor": "middle" }));
    return el("div", {}, [
      el("div", { class: "atmo" }, ATMOSPHERE.map((st, k) => el("div", { class: `atmo-col ${k === 2 ? "now" : ""}` }, [
        el("div", { class: "kicker", text: st.when }),
        k === 2 ? el("div", { class: "chart-host short" }, [donut]) : el("div", { class: "gas-chips" }, st.gases.map((g) => el("span", { class: "gas", text: g }))),
        k === 2 ? el("div", { class: "legend" }, today.mix.map(([n, p], j) => el("span", {}, [el("span", { class: `swatch ${cls[j]}` }), `${n} ${p}%`]))) : null,
        el("p", { class: "strong", text: st.o2 }),
      ]))),
      el("p", { class: "muted", text: "The packet gives which gases made up the early atmospheres, not their exact amounts, so only today's mix is drawn to scale. Life made the difference: almost all of today's oxygen came from photosynthesis." }),
    ]);
  }

  function signals() {
    return el("div", {}, [
      el("p", { class: "muted", text: "Four lines of evidence for early life (astrobiologist Tara Djokic, packet p. 14). Finding more than one together makes the argument much stronger." }),
      el("div", { class: "table-host" }, [el("table", { class: "data compact" }, [
        el("thead", {}, [el("tr", {}, ["Line of evidence", "Example", "Why it can be tricky"].map((h) => el("th", { text: h })))]),
        el("tbody", {}, LINES.map((r) => el("tr", {}, r.map((c, j) => el("td", { class: j === 0 ? "strong" : "", text: c }))))),
      ])]),
      bullets([
        "The <b>rock cycle</b> has deformed, metamorphosed and eroded most ancient rock, like piecing together a <b>crime scene</b>.",
        "The same lessons guide the <b>Perseverance</b> rover's search for ancient life in Jezero Crater on Mars.",
      ]),
    ]);
  }

  function consensus() {
    return el("div", {}, [
      el("ol", { class: "bullets steps" }, [
        "Project the first selected argument.", "That student shares.", "Someone restates it.", "The class asks clarifying questions. Repeat for 2–3 arguments.",
        "Table groups confer: Where do you see feedback? How is the planet today different from 4 bya, and why? How confident are we?",
        "Whole class comes to agreement. Chart the consensus ideas.",
      ].map((s) => el("li", { text: s }))),
      card("Make sure the class reaches", [bullets([
        "Life changed dramatically over 4 billion years, but <b>slowly, with long stable periods</b>.",
        "Our understanding rests on <b>radiometric dating</b> plus reasoning about photosynthesis, aerobic respiration and rock formation.",
        "When photosynthesizers increase, the oxygen record in rocks rises, then animal complexity rises: <b>feedback</b>.",
        "Conclusions are <b>only as strong as the records</b>.",
      ])], { cls: "key-idea" }),
    ]);
  }

  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["🌍 Atmosphere then & now", "🔬 Signals in the Sands", "🤝 Consensus"], (k) => tabBody.replaceChildren([atmosphere, signals, consensus][k]()));

  const model = el("div", { class: "fb ok", hidden: true, html: "<b>Feedback sentence:</b> Microbes changed the oceans and atmosphere, <b>which allowed</b> more complex life, and that life, especially plants, <b>then added</b> even more oxygen and built soil, which supported more life on land." });

  const root = layout("two-col argument", [
    el("div", { class: "col" }, [
      card("Five-element check while students write", [
        el("div", { class: "row" }, [el("span", { class: "muted", text: "Students in class:" }), sizeIn,
          el("button", { class: "tool-btn", type: "button", text: "Reset counts", onclick: () => { counts.fill(0); drawTracker(); } })]),
        el("p", { class: "muted", text: "Circulate and tap + each time you see a student include the element. Nothing is saved." }),
        trackHost, alert,
        toggle("Show a model feedback sentence", false, (v) => { model.hidden = !v; }), model,
      ]),
      card("“Don't use every piece of evidence.”", [el("p", { class: "blurb", text: "Choose the few that best support the claim, explain the causal links, and say honestly which part is least certain." })], { cls: "callout" }),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody])]),
  ]);
  container.appendChild(root);
  drawTracker();
}
