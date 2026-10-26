// panels/lhb.js — Explain 1: timeline + Late Heavy Bombardment + Jupiter–Saturn 2:1 resonance.

import { el, svg, chips } from "../dom.js";
import { ROCK_SAMPLES, resonanceAligned, periodRatioToday, JUPITER_PERIOD_YR, SATURN_PERIOD_YR, u238Age, STROMATOLITE_PCT } from "../science.js";
import { linear, chartRoot, text } from "../chart.js";
import { card, layout, bullets, stat } from "../ui.js";

const MELT = ROCK_SAMPLES.filter((r) => r.set === "melt").map((r) => r.age);
const TIMELINE = [
  { event: "Meteorite mineral", full: "Oldest meteorite mineral (solar system forms)", age: 4.63, kind: "Formation" },
  { event: "Mars mineral", full: "Oldest Mars mineral", age: 4.49, kind: "Formation" },
  { event: "Earth & Moon minerals", full: "Oldest Earth and Moon minerals", age: 4.44, kind: "Formation" },
  { event: "Impact melt rocks", full: "Impact melt rocks (Late Heavy Bombardment)", age: 3.92, lo: Math.min(...MELT), hi: Math.max(...MELT), kind: "Bombardment" },
  { event: "First life (stromatolite)", full: "Oldest rock with evidence of life", age: u238Age(STROMATOLITE_PCT), kind: "Life" },
];
const KIND_COLOR = { Formation: "#4aa3ff", Bombardment: "#ff9f43", Life: "#4ade80" };

export function mount(container) {
  let raf = 0, last = 0, playing = false, speed = 0.25, s = 0;

  // ----- timeline -----
  const tlHost = el("div", { class: "chart-host short" });
  (function drawTimeline() {
    const W = 900, H = 250, ml = 178, mr = 24, mt = 14, mb = 58;
    const x = linear([4.8, 3.2], [ml, W - mr]);
    const r = chartRoot(W, H, "Timeline of the early solar system from 4.8 to 3.2 billion years ago");
    for (let v = 4.8; v >= 3.19; v -= 0.2) {
      r.appendChild(svg("line", { x1: x(v), x2: x(v), y1: mt, y2: H - mb, class: "grid" }));
      r.appendChild(text(x(v), H - mb + 22, v.toFixed(1), { class: "tick", "text-anchor": "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 6, "Billions of years ago (time runs left → right toward today)", { class: "axis-label", "text-anchor": "middle" }));
    r.appendChild(svg("rect", { x: x(4.04), width: x(3.8) - x(4.04), y: mt, height: H - mt - mb, class: "band melt" }));
    const rowH = (H - mt - mb) / TIMELINE.length;
    TIMELINE.forEach((t, i) => {
      const cy = mt + i * rowH + rowH / 2;
      r.appendChild(text(ml - 12, cy + 5, t.event, { class: "row-label sm", "text-anchor": "end" }));
      if (t.lo) r.appendChild(svg("line", { x1: x(t.hi), x2: x(t.lo), y1: cy, y2: cy, stroke: KIND_COLOR[t.kind], "stroke-width": 8, "stroke-opacity": 0.6, "stroke-linecap": "round" }));
      r.appendChild(svg("circle", { cx: x(t.age), cy, r: 9, fill: KIND_COLOR[t.kind], class: "pt" }, [svg("title", { text: `${t.full}: ≈ ${t.lo ? `${t.hi.toFixed(1)}–${t.lo.toFixed(1)}` : t.age.toFixed(2)} billion years ago` })]));
      const lx = t.lo ? x(t.lo) + 16 : x(t.age) + (t.age < 3.7 ? -16 : 16);
      r.appendChild(text(lx, cy + 5, t.lo ? `${t.hi.toFixed(1)}–${t.lo.toFixed(1)}` : t.age.toFixed(2), { class: "bar-value sm", "text-anchor": t.age < 3.7 ? "end" : "start" }));
    });
    tlHost.replaceChildren(r);
  })();

  // ----- resonance model -----
  const CX = 200, CY = 175;
  const R_J = 84, R_S = 140;
  const model = svg("svg", { viewBox: "0 0 400 370", class: "resonance", role: "img", "aria-label": "Jupiter and Saturn orbiting the Sun in a 2 to 1 resonance" });
  model.appendChild(svg("rect", { width: 400, height: 370, rx: 14, class: "space" }));
  model.appendChild(svg("circle", { cx: CX, cy: CY, r: R_J, class: "orbit jup" }));
  model.appendChild(svg("circle", { cx: CX, cy: CY, r: R_S, class: "orbit sat" }));
  model.appendChild(svg("circle", { cx: CX, cy: CY, r: 10, class: "sun" }));
  const align = svg("line", { x1: CX, y1: CY, x2: CX, y2: CY - R_S, class: "align", visibility: "hidden" });
  const spot = svg("circle", { cx: CX, cy: CY - R_S, r: 6, class: "spot" });
  const jup = svg("circle", { r: 12, class: "planet jup" });
  const sat = svg("circle", { r: 10, class: "planet sat" });
  const lblJ = svg("text", { x: 14, y: 24, class: "lbl jup" });
  const lblS = svg("text", { x: 14, y: 46, class: "lbl sat" });
  const msg = svg("text", { x: 200, y: 358, class: "lbl msg", "text-anchor": "middle" });
  [align, spot, jup, sat, lblJ, lblS, msg].forEach((n) => model.appendChild(n));

  const slider = el("input", { type: "range", min: 0, max: 3, step: 0.01, value: 0, "aria-label": "Saturn orbits completed", oninput: () => { pause(); set(parseFloat(slider.value)); } });
  const conj = stat("Alignments at the same spot", "0");
  conj.classList.add("inline");

  function set(v) {
    s = v;
    slider.value = v;
    const a = 2 * Math.PI * v, b = 2 * Math.PI * 2 * v;
    sat.setAttribute("cx", CX + R_S * Math.sin(a)); sat.setAttribute("cy", CY - R_S * Math.cos(a));
    jup.setAttribute("cx", CX + R_J * Math.sin(b)); jup.setAttribute("cy", CY - R_J * Math.cos(b));
    const lined = resonanceAligned(v);
    align.setAttribute("visibility", lined ? "visible" : "hidden");
    lblJ.textContent = `Jupiter orbits: ${(2 * v).toFixed(2)}`;
    lblS.textContent = `Saturn orbits: ${v.toFixed(2)}`;
    msg.textContent = lined ? "Lined up again, same place → another tug adds on" : "Not to scale. Press play or drag to 1.00, 2.00, 3.00";
    msg.classList.toggle("hot", lined);
    conj.setValue(String(Math.floor(v + 0.015)));
  }

  function frame(ts) {
    if (!playing) return;
    const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    let v = s + dt * speed;
    if (v >= 3) { v = 3; set(v); pause(); return; }
    set(v);
    raf = requestAnimationFrame(frame);
  }
  const playBtn = el("button", { class: "tool-btn primary", type: "button", text: "▶ Play", onclick: () => (playing ? pause() : play()) });
  function play() { if (s >= 3) set(0); playing = true; playBtn.textContent = "⏸ Pause"; last = performance.now(); raf = requestAnimationFrame(frame); }
  function pause() { playing = false; playBtn.textContent = "▶ Play"; cancelAnimationFrame(raf); }
  const speedChips = chips([{ label: "Slow", value: 0.12 }, { label: "Normal", value: 0.25 }, { label: "Fast", value: 0.6 }], 0.25, (v) => { speed = v; }, { label: "Speed" });

  const root = layout("lhb", [
    card("2 : 1 orbital resonance", [
      model,
      el("div", { class: "controls" }, [el("div", { class: "row" }, [playBtn, speedChips.root]), el("label", { class: "ctl wide" }, [el("span", { text: "Saturn orbits completed" }), slider]), conj]),
    ]),
    el("div", { class: "col" }, [
      card("Timeline of the early solar system", [tlHost]),
      card("The Late Heavy Bombardment hypothesis", [bullets([
        "<b>~4 billion years ago</b> the planets and moons may have been pummeled by asteroids and comets.",
        "<b>Cause (one model):</b> Jupiter orbits twice per Saturn orbit, so their tugs repeat and add up. Uranus and Neptune are destabilized and scatter Kuiper Belt objects inward.",
        "<b>Evidence:</b> many craters, and impact melt rocks clustered at <b>3.8–4.0 billion years</b>. <b>For life:</b> impacts may have <b>delivered</b> water and molecules, or <b>disrupted</b> early life.",
      ])], { cls: "key-idea" }),
      el("div", { class: "pair" }, [
        card("Strengths and limitations", [bullets([
          "Most dated lunar melt rocks come from <b>six Apollo sites</b> close together, so some may come from one or two giant impacts.",
          `Today Saturn : Jupiter is <b>${SATURN_PERIOD_YR} : ${JUPITER_PERIOD_YR} yr ≈ ${periodRatioToday().toFixed(2)}</b>, close to but not exactly 2 : 1.`,
          "Evidence can <b>support</b> a hypothesis without <b>proving</b> it.",
        ])], { cls: "callout" }),
        card("Think – Talk – Open Exchange", [el("p", { class: "tto", text: "How does your dating evidence support the LHB hypothesis? What implications might it have had for life on Earth?" })]),
      ]),
    ]),
  ]);
  container.appendChild(root);
  set(0);
  return () => { playing = false; cancelAnimationFrame(raf); };
}
