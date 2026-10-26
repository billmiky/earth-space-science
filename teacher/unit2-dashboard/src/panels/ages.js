// panels/ages.js — Explore 1, Part 2: the age of rocks (U-238 dating curve, Tables 2 and 3).

import { el, svg } from "../dom.js";
import { ROCK_SAMPLES, u238Age, remainingPct } from "../science.js";
import { linear, niceTicks, chartRoot, text } from "../chart.js";
import { card, layout, toggle, packetTask } from "../ui.js";

const SETS = {
  minerals: { label: "Table 2 · Oldest minerals", color: "#4aa3ff" },
  melt: { label: "Table 3 · Impact melt rocks", color: "#ff9f43" },
};

export function mount(container) {
  const state = { zoom: true, reveal: false, show: { minerals: true, melt: true }, selected: null, mine: NaN };
  const chartHost = el("div", { class: "chart-host tall" });
  const tableHost = el("div", { class: "table-host" });
  const readout = el("div", { class: "readout big" });

  function shown() { return ROCK_SAMPLES.filter((r) => state.show[r.set]); }

  function drawChart() {
    const W = 860, H = 440, ml = 88, mr = 22, mt = 20, mb = 60;
    const xd = state.zoom ? [3.5, 5] : [0, 31.5];
    const yd = state.zoom ? [45, 60] : [0, 100];
    const x = linear(xd, [ml, W - mr]), y = linear(yd, [H - mb, mt]);
    const r = chartRoot(W, H, "Uranium-238 dating curve with sample points");
    r.appendChild(svg("defs", {}, [svg("clipPath", { id: "ages-clip" }, [svg("rect", { x: ml, y: mt, width: W - ml - mr, height: H - mt - mb })])]));
    for (const v of niceTicks(yd[0], yd[1], state.zoom ? 5 : 5)) {
      r.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
      r.appendChild(text(ml - 8, y(v) + 5, `${v}%`, { class: "tick", "text-anchor": "end" }));
    }
    for (const v of state.zoom ? niceTicks(xd[0], xd[1], 6) : [0, 4.5, 9, 13.5, 18, 22.5, 27, 31.5]) {
      r.appendChild(svg("line", { x1: x(v), x2: x(v), y1: mt, y2: H - mb, class: "grid" }));
      r.appendChild(text(x(v), H - mb + 22, String(v), { class: "tick", "text-anchor": "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 8, "Billions of years →", { class: "axis-label", "text-anchor": "middle" }));
    r.appendChild(text(20, (mt + H - mb) / 2, "↑ Uranium-238 remaining (%)", { class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 20 ${(mt + H - mb) / 2})` }));

    const g = svg("g", { "clip-path": "url(#ages-clip)" });
    // bands (only when ages revealed, so students can find them first)
    if (state.reveal && state.zoom) {
      const melt = ROCK_SAMPLES.filter((s) => s.set === "melt").map((s) => s.age);
      const mins = ROCK_SAMPLES.filter((s) => s.set === "minerals").map((s) => s.age);
      if (state.show.melt) {
        g.appendChild(svg("rect", { x: x(Math.min(...melt)), width: x(Math.max(...melt)) - x(Math.min(...melt)), y: mt, height: H - mt - mb, class: "band melt" }));
      }
      if (state.show.minerals) {
        g.appendChild(svg("rect", { x: x(Math.min(...mins)), width: x(Math.max(...mins)) - x(Math.min(...mins)), y: mt, height: H - mt - mb, class: "band minerals" }));
      }
    }
    let d = "";
    for (let t = xd[0]; t <= xd[1] + 1e-9; t += (xd[1] - xd[0]) / 300) d += `${d ? "L" : "M"}${x(t).toFixed(1)},${y(remainingPct(t / 4.5)).toFixed(1)} `;
    g.appendChild(svg("path", { d, class: "curve" }));
    const sel = ROCK_SAMPLES.find((s) => s.id === state.selected);
    if (sel && state.show[sel.set]) {
      g.appendChild(svg("line", { x1: x(xd[0]), x2: x(sel.age), y1: y(sel.pct), y2: y(sel.pct), class: "guide" }));
      if (state.reveal) g.appendChild(svg("line", { x1: x(sel.age), x2: x(sel.age), y1: y(sel.pct), y2: y(yd[0]), class: "guide" }));
    }
    for (const s of shown()) {
      const cx = state.reveal ? x(s.age) : x(u238Age(s.pct));
      g.appendChild(svg("circle", {
        cx, cy: y(s.pct), r: s.id === state.selected ? 11 : 8, fill: SETS[s.set].color, class: "pt", tabindex: 0, role: "button",
        "aria-label": `${s.object}, ${s.pct}% uranium-238 remaining`,
        onclick: () => select(s.id),
      }));
    }
    if (state.mine > 0 && state.mine <= 100) {
      const t = u238Age(state.mine);
      if (t >= xd[0] && t <= xd[1]) g.appendChild(svg("path", { d: "M0,-11 L3.2,-3.5 11,-3.5 4.8,1.6 7,10 0,5 -7,10 -4.8,1.6 -11,-3.5 -3.2,-3.5 Z", transform: `translate(${x(t)},${y(state.mine)})`, class: "star" }));
    }
    r.appendChild(g);
    chartHost.replaceChildren(r);
  }

  function drawTable() {
    const rows = [];
    for (const key of ["minerals", "melt"]) {
      if (!state.show[key]) continue;
      rows.push(el("tr", { class: "group" }, [el("td", { colspan: 3 }, [el("span", { class: "dot", style: `background:${SETS[key].color}` }), " ", SETS[key].label])]));
      for (const s of ROCK_SAMPLES.filter((r) => r.set === key)) {
        rows.push(el("tr", { class: s.id === state.selected ? "active clickable" : "clickable", tabindex: 0, onclick: () => select(s.id), onkeydown: (e) => { if (e.key === "Enter") select(s.id); } }, [
          el("td", { text: s.object }), el("td", { text: `${s.pct}%` }),
          el("td", { class: "age", text: state.reveal ? `${s.age.toFixed(2)} Gyr` : "?" }),
        ]));
      }
    }
    tableHost.replaceChildren(el("table", { class: "data" }, [
      el("thead", {}, [el("tr", {}, [el("th", { text: "Sample" }), el("th", { text: "U-238 left" }), el("th", { text: "Age" })])]),
      el("tbody", {}, rows),
    ]));
  }

  function drawReadout() {
    const sel = ROCK_SAMPLES.find((s) => s.id === state.selected);
    const parts = [];
    if (sel) parts.push(`<b>${sel.object}</b>: ${sel.pct}% U-238 left → ` + (state.reveal ? `<b class="good">≈ ${sel.age.toFixed(2)} billion years old</b>` : "find its age on the curve"));
    if (state.mine > 0 && state.mine <= 100) parts.push(`Your sample: ${state.mine}% → <b class="good">≈ ${u238Age(state.mine).toFixed(2)} billion years</b>${u238Age(state.mine) < 3.5 || u238Age(state.mine) > 5 ? " (turn off zoom to see it)" : ""}`);
    readout.innerHTML = parts.join("<br>") || "Tap a dot or a table row to follow it across to the curve.";
  }

  function select(id) { state.selected = state.selected === id ? null : id; redraw(); }
  function redraw() { drawChart(); drawTable(); drawReadout(); }

  const tZoom = toggle("Zoom to 3.5–5 billion years", true, (v) => { state.zoom = v; redraw(); });
  const tReveal = toggle("Reveal ages", false, (v) => { state.reveal = v; redraw(); });
  const tMin = toggle("Table 2 minerals", true, (v) => { state.show.minerals = v; redraw(); });
  const tMelt = toggle("Table 3 impact melt", true, (v) => { state.show.melt = v; redraw(); });
  const mine = el("input", { type: "number", min: 0.1, max: 100, step: "any", inputmode: "decimal", placeholder: "e.g. 59", "aria-label": "Your own sample percent U-238 remaining",
    oninput: () => { state.mine = mine.value === "" ? NaN : parseFloat(mine.value); redraw(); } });

  const root = layout("two-col ages", [
    el("div", { class: "col grow" }, [
      card(null, [el("div", { class: "card-tools" }, [tZoom, tReveal, tMin, tMelt]), chartHost, readout]),
    ]),
    el("div", { class: "col narrow" }, [
      card("Table 2 and Table 3", [tableHost]),
      card("Try your own sample", [el("label", { class: "ctl" }, [el("span", { text: "U-238 remaining (%)" }), mine])]),
      packetTask("Tables 2 & 3 + Making Sense", [
        "<b>See:</b> What do the oldest minerals have in common? What is the <b>range</b> of the melt-rock ages?",
        "<b>Think:</b> When did the planets form, and when did most impacts happen?",
      ]),
    ]),
  ]);
  container.appendChild(root);
  redraw();
}
