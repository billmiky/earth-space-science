// panels/life.js — Elaborate 2: the oldest rock with evidence of life (stromatolite) + stability timeline.

import { el, svg } from "../dom.js";
import { u238Age, remainingPct, STROMATOLITE_PCT } from "../science.js";
import { linear, chartRoot, text } from "../chart.js";
import { card, layout, bullets, toggle, packetTask } from "../ui.js";

export function mount(container) {
  let reveal = false;
  const chartHost = el("div", { class: "chart-host" });
  const readout = el("p", { class: "readout big" });
  const age = u238Age(STROMATOLITE_PCT);

  function drawCurve() {
    const W = 600, H = 320, ml = 56, mr = 16, mt = 30, mb = 58;
    const x = linear([0, 31.5], [ml, W - mr]), y = linear([0, 100], [H - mb, mt]);
    const r = chartRoot(W, H, "Uranium-238 dating curve with the stromatolite at 59 percent remaining");
    r.appendChild(text(ml, 18, `Stromatolite: ${STROMATOLITE_PCT}% U-238 remaining`, { class: "chart-title" }));
    for (const v of [0, 25, 50, 75, 100]) {
      r.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
      r.appendChild(text(ml - 8, y(v) + 5, `${v}%`, { class: "tick", "text-anchor": "end" }));
    }
    for (const v of [0, 4.5, 9, 13.5, 18, 22.5, 27, 31.5]) r.appendChild(text(x(v), H - mb + 22, String(v), { class: "tick", "text-anchor": "middle" }));
    r.appendChild(text((ml + W - mr) / 2, H - 6, "Billions of years →", { class: "axis-label", "text-anchor": "middle" }));
    let d = "";
    for (let t = 0; t <= 31.5; t += 0.1) d += `${d ? "L" : "M"}${x(t).toFixed(1)},${y(remainingPct(t / 4.5)).toFixed(1)} `;
    r.appendChild(svg("path", { d, class: "curve" }));
    r.appendChild(svg("line", { x1: x(0), x2: reveal ? x(age) : x(31.5), y1: y(STROMATOLITE_PCT), y2: y(STROMATOLITE_PCT), class: "guide" }));
    if (reveal) {
      r.appendChild(svg("line", { x1: x(age), x2: x(age), y1: y(STROMATOLITE_PCT), y2: y(0), class: "guide" }));
      r.appendChild(svg("circle", { cx: x(age), cy: y(STROMATOLITE_PCT), r: 9, class: "marker" }));
      r.appendChild(text(x(age) + 14, y(STROMATOLITE_PCT) - 12, `≈ ${age.toFixed(1)} billion years`, { class: "bar-value" }));
    }
    chartHost.replaceChildren(r);
    readout.innerHTML = reveal ? `${STROMATOLITE_PCT}% remaining → about <b class="good">${age.toFixed(1)} billion years old</b>` : "Find 59% on the y-axis, across to the curve, then down. Estimate first.";
  }
  const reveal$ = toggle("Show the reading on the curve", false, (v) => { reveal = v; drawCurve(); });

  // Stability story timeline: 4.6 Gya → today
  function timeline() {
    const W = 1100, H = 160, ml = 24, mr = 24, mt = 30, mb = 40;
    const x = linear([4.7, 0], [ml, W - mr]);
    const r = chartRoot(W, H, "Stability of the solar system through time: formation, bombardment, then calm and life");
    const bandY = mt + 10, bandH = 46;
    const phases = [
      { a: 4.6, b: 4.04, cls: "form", label: "Forming" },
      { a: 4.04, b: 3.8, cls: "unstable", label: "" },
      { a: 3.8, b: 0, cls: "calm", label: "Relatively calm: life appears and spreads" },
    ];
    phases.forEach((p) => {
      r.appendChild(svg("rect", { x: x(p.a), width: x(p.b) - x(p.a), y: bandY, height: bandH, class: `phase ${p.cls}` }));
      if (p.label) r.appendChild(text((x(p.a) + x(p.b)) / 2, bandY + bandH / 2 + 6, p.label, { class: "phase-label", "text-anchor": "middle" }));
    });
    r.appendChild(text(x(3.92), bandY - 8, "Late Heavy Bombardment (instability)", { class: "phase-label sm", "text-anchor": "middle" }));
    for (let v = 4.5; v >= 0; v -= 0.5) {
      r.appendChild(svg("line", { x1: x(v), x2: x(v), y1: bandY + bandH, y2: bandY + bandH + 7, class: "axis" }));
      r.appendChild(text(x(v), H - mb + 26, v === 0 ? "today" : v.toFixed(1), { class: "tick", "text-anchor": "middle" }));
    }
    [{ t: 4.6, l: "Solar system forms" }, { t: age, l: "First life (stromatolite)" }].forEach((m, i) => {
      r.appendChild(svg("circle", { cx: x(m.t), cy: bandY + bandH + 7, r: 8, class: "marker", style: `fill:${i ? "#4ade80" : "#4aa3ff"}` }));
      r.appendChild(text(x(m.t) + (i ? 0 : 6), bandY + bandH + 40, m.l, { class: "tick strong", "text-anchor": i ? "middle" : "start" }));
    });
    return r;
  }

  const root = layout("life", [
    el("div", { class: "life-top" }, [
      el("figure", { class: "photo" }, [
        el("img", { src: "../../images/stromatolite-tumbiana-nasa.jpg", alt: "A cut stromatolite rock with curved, finely layered bands in orange-brown stone, shown next to a U.S. penny for scale" }),
        el("figcaption", { text: "A ~2.7 Gyr stromatolite from Western Australia, similar to the one in your packet. Credit: NASA/JPL-Caltech." }),
      ]),
      card(null, [reveal$, chartHost, readout]),
      el("div", { class: "col" }, [
        card("Strengths and limitations of one sample", [bullets([
          "<b>Strength:</b> a steady clock (U-238) and layers built by microbes. Life existed by <b>~3.4–3.5 Gyr ago</b>, a few hundred million years after the LHB.",
          "<b>Limitation:</b> one sample shows life existed <b>by</b> then. It <b>cannot rule out</b> earlier life, since older rocks were recycled or destroyed.",
        ])], { cls: "key-idea" }),
        packetTask("The Beginning of Life on Earth", ["Use the dating curve to find the stromatolite's age.", "Can you rule out life before 3.5 Gyr? Strengths and limitations?"]),
      ]),
    ]),
    card("Stability of the solar system and life", [timeline(), el("p", { class: "muted", text: "Billions of years ago →  Life shows up in the rock record soon after the solar system settled down. A calmer system, with fewer giant impacts, gave life a chance to survive and spread." })], { cls: "tl-card" }),
  ]);
  container.appendChild(root);
  drawCurve();
}
