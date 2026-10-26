// panels/water.js — Explain 2: the role of water + the "Which craters survive?" model.

import { el, svg, chips, tabs } from "../dom.js";
import { WORLDS, makeCraterSim, visibleCraters, SIM_DURATION_GYR } from "../science.js";
import { linear, niceTicks, chartRoot, text } from "../chart.js";
import { card, layout, bullets, stat, packetTask } from "../ui.js";

const SIM = makeCraterSim();
const TIMES = Array.from({ length: 46 }, (_, i) => +(i * 0.1).toFixed(1));
const COUNTS = Object.fromEntries(Object.values(WORLDS).map((w) => [w.key, TIMES.map((T) => visibleCraters(SIM, w, T).length)]));
const MELT_WINDOW = [0.45, 0.75];

const WATER_TABLE = [
  ["Earth", "71% of the surface is water. 96.5% of Earth's water is salt water in the oceans; 3.5% is fresh water in lakes, glaciers, and polar ice caps."],
  ["Mercury", "Very small traces of water vapor in its atmosphere"],
  ["Mars", "Almost all ice at the poles; a small amount of vapor in the atmosphere; some brief (transient) liquid water on the surface"],
  ["The Moon", "Some water, but in limited amounts and mostly as ice"],
];
const TECTONIC_TABLE = [
  ["Earth", "Undergoes extensive tectonic activity, shaping the planet's surface."],
  ["Mercury", "No active plate tectonics. Scarps and cliffs show past crustal compression as the planet cooled and shrank."],
  ["Mars", "No active plate tectonics now. Ancient rift valleys and volcanoes show activity that seems to have stopped long ago."],
  ["The Moon", "Not known to have active plate tectonics. Some early activity, but far less geologic activity than Earth."],
];

function waterMolecule() {
  const s = svg("svg", { viewBox: "0 0 300 190", class: "molecule", role: "img", "aria-label": "Water molecule: oxygen with a slight negative charge and two hydrogens with a slight positive charge" });
  s.appendChild(svg("line", { x1: 150, y1: 70, x2: 80, y2: 140, class: "bond" }));
  s.appendChild(svg("line", { x1: 150, y1: 70, x2: 220, y2: 140, class: "bond" }));
  s.appendChild(svg("circle", { cx: 150, cy: 70, r: 38, class: "atom-o" }));
  s.appendChild(svg("circle", { cx: 80, cy: 140, r: 24, class: "atom-h" }));
  s.appendChild(svg("circle", { cx: 220, cy: 140, r: 24, class: "atom-h" }));
  s.appendChild(text(150, 79, "O", { class: "atom-label" }));
  s.appendChild(text(80, 148, "H", { class: "atom-label dark" }));
  s.appendChild(text(220, 148, "H", { class: "atom-label dark" }));
  s.appendChild(text(150, 24, "δ−", { class: "charge neg", "text-anchor": "middle" }));
  s.appendChild(text(46, 118, "δ+", { class: "charge pos", "text-anchor": "middle" }));
  s.appendChild(text(254, 118, "δ+", { class: "charge pos", "text-anchor": "middle" }));
  return s;
}

function refTable(rows, head) {
  return el("table", { class: "data compact" }, [
    el("thead", {}, [el("tr", {}, [el("th", { text: "Planet / object" }), el("th", { text: head })])]),
    el("tbody", {}, rows.map(([a, b]) => el("tr", {}, [el("td", { class: "strong", text: a }), el("td", { text: b })]))),
  ]);
}

export function mount(container) {
  let worldKey = "moon", T = SIM_DURATION_GYR, raf = 0, last = 0, playing = false;

  // ---- left column: tabbed reference ----
  const refBody = el("div", { class: "ref-body" });
  const refTabs = tabs(["Why water?", "Water in space", "Tectonics"], (i) => {
    refBody.replaceChildren(
      i === 0 ? el("div", {}, [waterMolecule(), bullets([
        "<b>Polar molecule:</b> slightly negative oxygen end, slightly positive hydrogen ends. It pulls on ions and molecules, so water dissolves a lot: the <b>universal solvent</b>.",
        "<b>CO₂ + H₂O ⇌ H₂CO₃:</b> dissolved CO₂ makes <b>carbonic acid</b>. Normal rain is a bit acidic (pH ≈ 5.6).",
        "Carbonic acid dissolves limestone and moves carbon between air, oceans, and rock.",
      ])]) : i === 1 ? refTable(WATER_TABLE, "Water") : refTable(TECTONIC_TABLE, "Tectonic activity"));
  });

  // ---- middle: surface ----
  const SURF = 400;
  const surface = svg("svg", { viewBox: `0 0 ${SURF} ${SURF}`, class: "surface", role: "img", "aria-label": "Top-down patch of surface showing craters that survive" });
  const ground = svg("rect", { width: SURF, height: SURF, rx: 14 });
  const gCraters = svg("g");
  surface.append(ground, gCraters);
  const sCount = stat("Craters visible on this patch", "0");
  const sImpacts = el("div", { class: "muted", text: "" });

  // ---- right: chart ----
  const chartHost = el("div", { class: "chart-host short" });
  const worldChips = chips(Object.values(WORLDS).map((w) => ({ label: w.name, value: w.key, color: w.color })), worldKey, (k) => { worldKey = k; pause(); redraw(); }, { label: "World" });
  const blurb = el("p", { class: "blurb" });
  const slider = el("input", { type: "range", min: 0, max: SIM_DURATION_GYR, step: 0.05, value: T, "aria-label": "Billion years since formation", oninput: () => { pause(); T = parseFloat(slider.value); redraw(); } });
  const playBtn = el("button", { class: "tool-btn primary", type: "button", text: "▶ Play", onclick: () => (playing ? pause() : play()) });
  const jumps = [["Formation", 0], ["During LHB", 0.6], ["After LHB", 1.2], ["Today", SIM_DURATION_GYR]].map(([label, v]) => el("button", { class: "tool-btn", type: "button", text: label, onclick: () => { pause(); T = v; redraw(); } }));

  function frame(ts) {
    if (!playing) return;
    const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    T = Math.min(SIM_DURATION_GYR, T + dt * 0.45);
    redraw();
    if (T >= SIM_DURATION_GYR) { pause(); return; }
    raf = requestAnimationFrame(frame);
  }
  function play() { if (T >= SIM_DURATION_GYR) T = 0; playing = true; playBtn.textContent = "⏸ Pause"; last = performance.now(); raf = requestAnimationFrame(frame); }
  function pause() { playing = false; playBtn.textContent = "▶ Play"; cancelAnimationFrame(raf); }

  function drawChart() {
    const W = 560, H = 270, ml = 54, mr = 14, mt = 14, mb = 56;
    const x = linear([0, SIM_DURATION_GYR], [ml, W - mr]);
    const ymax = Math.max(...Object.values(COUNTS).map((a) => Math.max(...a)));
    const y = linear([0, ymax * 1.05], [H - mb, mt]);
    const r = chartRoot(W, H, "Visible craters over time for the Moon, Mars, and Earth");
    for (const v of niceTicks(0, ymax, 5)) {
      r.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
      r.appendChild(text(ml - 8, y(v) + 5, String(v), { class: "tick", "text-anchor": "end" }));
    }
    for (let v = 0; v <= 4.5; v += 0.5) r.appendChild(text(x(v), H - mb + 22, v.toFixed(1), { class: "tick", "text-anchor": "middle" }));
    r.appendChild(text((ml + W - mr) / 2, H - 6, "Billion years since the solar system formed →", { class: "axis-label", "text-anchor": "middle" }));
    r.appendChild(svg("rect", { x: x(MELT_WINDOW[0]), width: x(MELT_WINDOW[1]) - x(MELT_WINDOW[0]), y: mt, height: H - mt - mb, class: "band melt" }));
    r.appendChild(text(x(MELT_WINDOW[1]) + 6, mt + 16, "LHB", { class: "tick" }));
    for (const w of Object.values(WORLDS)) {
      const d = TIMES.map((t, i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(COUNTS[w.key][i]).toFixed(1)}`).join(" ");
      r.appendChild(svg("path", { d, class: `line ${w.key === worldKey ? "sel" : ""}`, stroke: w.color }));
      r.appendChild(text(x(4.5) - 4, y(COUNTS[w.key][45]) - 8, w.name, { class: "tick", fill: w.color, "text-anchor": "end" }));
    }
    r.appendChild(svg("line", { x1: x(T), x2: x(T), y1: mt, y2: H - mb, class: "guide" }));
    chartHost.replaceChildren(r);
  }

  function redraw() {
    const w = WORLDS[worldKey];
    ground.setAttribute("fill", w.ground);
    const vis = visibleCraters(SIM, w, T);
    gCraters.replaceChildren(...vis.map((c) => svg("circle", { cx: c.x * SURF, cy: c.y * SURF, r: c.r * SURF, class: "crater" })));
    sCount.setValue(String(vis.length));
    sCount.valueEl.style.color = w.color;
    sImpacts.textContent = `${SIM.filter((c) => c.t <= T).length} impacts so far · ${(SIM_DURATION_GYR - T).toFixed(2)} billion years ago → today`;
    blurb.innerHTML = `<b style="color:${w.color}">${w.name}:</b> ${w.blurb}`;
    slider.value = T;
    drawChart();
  }

  const root = layout("water", [
    el("div", { class: "col" }, [card("Why is water so important?", [refTabs.root, refBody]), packetTask("Part 2 + Part 3", ["Use the tables and model as <b>evidence</b> in your scientific explanation."])]),
    el("div", { class: "col" }, [card("A patch of surface", [surface, sCount, sImpacts])]),
    el("div", { class: "col" }, [
      card("Which craters survive?", [
        worldChips.root, blurb,
        el("div", { class: "controls" }, [
          el("label", { class: "ctl wide" }, [el("span", { text: "Billion years since formation" }), slider]),
          el("div", { class: "row" }, [playBtn, ...jumps]),
        ]),
        chartHost,
        el("p", { class: "muted", text: "Simplified model, not to scale. Real crater counts depend on size, age, and how hard scientists have looked." }),
      ]),
    ]),
  ]);
  container.appendChild(root);
  redraw();
  return () => { playing = false; cancelAnimationFrame(raf); };
}
