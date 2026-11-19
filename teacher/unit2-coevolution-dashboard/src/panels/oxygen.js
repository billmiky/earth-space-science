// panels/oxygen.js — Day 4 Explore Part 3: Oxygen in Earth's History.
// Nail demo reveal (with the Day 1 class predictions), the packet's five-stage oxygen graph
// you can travel through, and the See-Think-Wonder prompts.

import { el, svg, tabs } from "../dom.js";
import { O2_HISTORY, O2_STAGES, stageAt, latestEvent, TIMELINE_EVENTS, fmtGa } from "../science.js";
import { text } from "../chart.js";
import { card, layout, packetTask, toggle, bullets, saved } from "../ui.js";
import { nailDemo, NAIL_CHOICES } from "../nail.js";
import { timeChart } from "../timechart.js";

const STW = [
  ["How have geological factors on Earth changed over time?", "Banded iron and red beds appear 2.5–2 bya; continents break up and move; soil appears 407 mya."],
  ["How have biological factors changed over time?", "Microbes → photosynthesis → eukaryotes → multicellular → animals → land life, faster over time."],
  ["What patterns do you see between geologic and biological changes?", "Photosynthesis comes right before oxygen rocks; complex life follows oxygen rises (feedback)."],
  ["What is the role of radioactive isotopes in rebuilding the record?", "They date the cards. Different half-lives and ranges mean picking the right isotope matters."],
  ["How does your timeline line up with the oxygen graph?", "Oxygen rises right where complex life appears on the timeline."],
];

export function mount(container) {
  const state = { events: false };
  const chart = timeChart({
    title: "Stages of atmospheric oxygen (traced from the packet graph)",
    aria: "Line graph of percent oxygen in the atmosphere from 3.85 billion years ago to today, in five stages. About 0 percent until about 2.4 billion years ago, rises to about 4 percent and stays there until about 0.85 billion years ago, climbs steeply to a peak of about 36 percent near 0.33 billion years ago, then settles near 21 percent.",
    series: O2_HISTORY, xDomain: [3.85, 0], yDomain: [0, 40], ticksX: [3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0], ticksY: [0, 10, 20, 30, 40],
    xLabel: "Time (billion years ago)", yLabel: "Oxygen in the atmosphere (%)", start: 2.4, playSeconds: 18,
    fmtT: fmtGa, fmtY: (v) => (v < 0.5 ? "≈ 0%" : v < 1 ? "< 1%" : `≈ ${Math.round(v)}%`),
    bands: O2_STAGES.map((s, i) => ({ x1: s.start, x2: s.end, label: String(s.stage), cls: `s${i % 2}` })),
    state,
    overlay: (g, { x, H, mb, state: st }) => {
      if (!st.events) return;
      for (const e of TIMELINE_EVENTS.filter((d) => d.ga <= 3.85)) {
        const yy = e.sys === "life" ? H - mb - 14 : H - mb - 30;
        g.appendChild(svg("circle", { cx: x(e.ga), cy: yy, r: 6, class: `ev-dot ${e.sys}` }, [svg("title", { text: `${e.event} (${fmtGa(e.ga)})` })]));
      }
      g.appendChild(text(x(3.8) + 10, H - mb - 40, "events: ● Earth   ● life", { class: "tick" }));
    },
    readout: (t, v) => {
      const st = stageAt(t), life = latestEvent(t, "life"), earth = latestEvent(t, "earth");
      return `<div class="o2-head"><b>${fmtGa(t)}</b> · oxygen <b>${v < 0.5 ? "≈ 0%" : `≈ ${Math.round(v)}%`}</b> · <span class="stage-pill">Stage ${st.stage}</span> ${st.text}.</div>
        <div class="o2-cols"><div><span class="lbl life">Newest life so far</span> ${life ? life.event : "No signs of life yet"}</div>
        <div><span class="lbl earth">Latest change in Earth's systems</span> ${earth ? earth.event : "—"}</div></div>`;
    },
  });

  // right column
  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["🔩 Nail reveal", "👀 See-Think-Wonder", "🔑 Q1–7 key"], (i) => tabBody.replaceChildren([nailTab, stwTab, keyTab][i]()));

  function nailTab() {
    let reveal = false;
    const host = el("div", { class: "chart-host short" }, [nailDemo(false)]);
    const votes = saved("nail-votes", { a: 0, b: 0, both: 0, neither: 0 }).get();
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    const predicted = total
      ? el("ul", { class: "bullets" }, NAIL_CHOICES.map((c) => el("li", { html: `${c.label}: <b>${votes[c.key] || 0}</b>` })))
      : el("p", { class: "muted", text: "No Day 1 predictions saved on this device." });
    const msg = el("div", { class: "fb ok", hidden: true, html: "<b>Only the nail with air rusted.</b> The only difference between the tubes is oxygen. That red is iron oxide, the same stuff in banded iron formations and red beds. It only forms when oxygen is around." });
    return el("div", {}, [
      el("p", { class: "blurb", html: "Ask first: <b>What's the only difference between the tubes?</b> Then show the real tubes." }),
      el("div", { class: "pair" }, [host, el("div", {}, [el("p", { class: "strong", text: "Day 1 class predictions:" }), predicted])]),
      toggle("Reveal the expected result", false, (v) => { reveal = v; host.replaceChildren(nailDemo(reveal)); msg.hidden = !reveal; }),
      msg,
      el("p", { class: "muted", text: "The drawing shows the expected result. Always show your real tubes; if yours differ, discuss why." }),
    ]);
  }
  function stwTab() {
    return el("div", {}, [
      el("p", { class: "muted", text: "Packet p. 10, one row at a time. Samples are for you; Wonder answers will vary." }),
      el("table", { class: "data compact" }, [el("thead", {}, [el("tr", {}, [el("th", { text: "Prompt" }), el("th", { text: "Sample See / Think" })])]),
        el("tbody", {}, STW.map(([q, a]) => el("tr", {}, [el("td", { class: "strong", text: q }), el("td", { text: a })])))]),
    ]);
  }
  function keyTab() {
    return el("div", {}, [bullets([
      "<b>Q1</b> Oxygen starts to rise ≈ <b>2.4–2.5 bya</b> (start of stage 2, the Great Oxidation Event).",
      "<b>Q2</b> Sharp rise ≈ <b>0.85 bya</b>, continuing to ≈ 0.54 bya (stage 4).",
      "<b>Q3</b> Highest ≈ <b>0.3 bya</b>, roughly 30–35%, above today's 21%.",
      "<b>Q4</b> It matches the timeline: photosynthesis (2.7) just before the first rise; banded iron (2.5) and red beds (2.0) as it rises; complex life after the sharp rise; the peak at swamps and giant dragonflies.",
      "<b>Q5</b> Microbes made O₂ for hundreds of millions of years, but it reacted with dissolved iron first. Once that iron was used up, O₂ built up in the air.",
      "<b>Q6</b> Aerobic respiration releases far more energy → eukaryotes, multicellular life, animals; ozone let life move onto land.",
      "<b>Q7</b> Plants added O₂, built soil, sped up weathering and buried carbon in swamps.",
    ])]);
  }

  const root = layout("two-col oxygen", [
    el("div", { class: "col" }, [
      card(null, [el("div", { class: "card-tools" }, [toggle("Show timeline events", false, (v) => { state.events = v; chart.redraw(); })]), chart.root,
        el("p", { class: "src", text: "Oxygen curve and stages traced from the packet's “Stages of Atmospheric Oxygen” graph; values between traced points are estimates. Events: the chapter's timeline cards." })]),
      packetTask("Part 3 (pp. 8–9)", ["Q1–3: when did oxygen start to rise, rise sharply, and peak?", "Q4–5: compare with your timeline. Why the sharp rise 2.1–2.4 bya?", "Q6–7: how did oxygen affect complex life, and complex life affect the planet?"]),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody])]),
  ]);
  container.appendChild(root);
  return () => chart.destroy();
}
