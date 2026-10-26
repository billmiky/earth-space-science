// panels/rockcycle.js — Elaborate 1: the rock cycle, water, layers, and stability.

import { el, svg } from "../dom.js";
import { card, layout, bullets, packetTask, toggle } from "../ui.js";

const NODES = {
  Igneous: { x: 330, y: 62, label: "Igneous rock", c: "#e0533f" },
  Sediments: { x: 560, y: 178, label: "Sediments", c: "#b58a5a" },
  Sedimentary: { x: 470, y: 338, label: "Sedimentary rock", c: "#e28f1c" },
  Metamorphic: { x: 190, y: 338, label: "Metamorphic rock", c: "#8e5bc0" },
  Magma: { x: 100, y: 178, label: "Magma", c: "#c0392b" },
};

export const PROCESSES = [
  { name: "Weathering & erosion", from: "Igneous", to: "Sediments", water: "Yes", desc: "Rain, carbonic acid, ice, and flowing water break rock into pieces and dissolve minerals; rivers, wind, and glaciers carry the pieces away." },
  { name: "Deposition, compaction & cementation", from: "Sediments", to: "Sedimentary", water: "Yes", desc: "Water drops sediment in layers (in lakes and oceans). New layers pile on top and press down; dissolved minerals cement the grains into sedimentary rock." },
  { name: "Heat & pressure (burial, folding)", from: "Sedimentary", to: "Metamorphic", water: "Not mainly", desc: "Deep burial and plate collisions squeeze and heat rock until its minerals change, without melting it." },
  { name: "Melting", from: "Metamorphic", to: "Magma", water: "Partly", desc: "Rock dragged deep at subduction zones melts from mantle heat. Water carried down by the sinking plate lowers the melting point." },
  { name: "Cooling & crystallization", from: "Magma", to: "Igneous", water: "No", desc: "Magma cools underground (intrusive rock like granite) or erupts as lava (extrusive rock like basalt)." },
  { name: "Uplift, then weathering again", from: "Metamorphic", to: "Sediments", water: "Yes", desc: "Plate tectonics pushes deep rock up into mountains, where weathering and erosion start the cycle again." },
];

/** Split a long process name into at most two balanced lines. */
function wrapName(name) {
  if (name.length <= 22) return [name];
  const mid = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) if (name[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [name] : [name.slice(0, best), name.slice(best + 1)];
}

const LAYERS = [
  { name: "Layer 1 (top)", color: "#d9c28f" },
  { name: "Layer 2", color: "#c4a56e" },
  { name: "Layer 3", color: "#a98650" },
  { name: "Layer 4", color: "#8b6b3d" },
  { name: "Layer 5 (bottom)", color: "#6b4f2a" },
];

export function mount(container) {
  let idx = 0, tour = null, overturned = false;
  const diagramHost = el("div", { class: "diagram-host" });
  const descHost = el("div", { class: "proc-desc" });
  const list = el("div", { class: "proc-list", role: "listbox", "aria-label": "Rock cycle processes" });
  const strataHost = el("div", { class: "strata-host" });

  function drawDiagram() {
    const W = 660, H = 400, sel = PROCESSES[idx];
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "rock-diagram", role: "img", "aria-label": "Rock cycle diagram" });
    s.appendChild(svg("defs", {}, ["a0", "a1"].map((id, i) => svg("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 16, markerHeight: 16, markerUnits: "userSpaceOnUse", orient: "auto" }, [svg("path", { d: "M0,0 L10,5 L0,10 z", fill: i ? "#2dd4bf" : "#64748b" })]))));
    PROCESSES.forEach((p, i) => {
      const a = NODES[p.from], b = NODES[p.to], on = i === idx;
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      s.appendChild(svg("line", {
        x1: a.x + (dx / len) * 92, y1: a.y + (dy / len) * 37, x2: b.x - (dx / len) * 96, y2: b.y - (dy / len) * 40,
        class: `arrow ${on ? "on" : ""}`, "marker-end": `url(#a${on ? 1 : 0})`, onclick: () => pick(i), style: "cursor:pointer",
      }));
    });
    Object.values(NODES).forEach((n) => {
      s.appendChild(svg("ellipse", { cx: n.x, cy: n.y, rx: 92, ry: 36, fill: n.c }));
      s.appendChild(svg("text", { x: n.x, y: n.y + 6, class: "node-label", "text-anchor": "middle", text: n.label }));
    });
    wrapName(sel.name).forEach((line, i, all) => s.appendChild(svg("text", { x: 330, y: 152 + i * 22, class: "proc-name", "text-anchor": "middle", text: line })));
    s.appendChild(svg("text", { x: 330, y: 152 + 22 * 2 + 10, class: `proc-water ${sel.water === "Yes" ? "yes" : ""}`, "text-anchor": "middle", text: `Relies on water? ${sel.water}` }));
    diagramHost.replaceChildren(s);
  }

  function drawList() {
    list.replaceChildren(...PROCESSES.map((p, i) => el("button", {
      class: `proc-btn ${i === idx ? "active" : ""}`, type: "button", role: "option", "aria-selected": String(i === idx),
      onclick: () => pick(i),
    }, [el("span", { class: "proc-num", text: String(i + 1) }), el("span", { text: p.name }), el("span", { class: `water-tag ${p.water === "Yes" ? "yes" : ""}`, text: p.water === "Yes" ? "💧 water" : p.water === "Partly" ? "💧 partly" : "no water" })])));
    const p = PROCESSES[idx];
    descHost.innerHTML = `<b>${p.name}</b> (${NODES[p.from].label} → ${NODES[p.to].label}). ${p.desc}`;
  }

  function pick(i) { idx = i; stopTour(); refresh(); }
  function refresh() { drawDiagram(); drawList(); }

  function drawStrata() {
    const order = overturned ? [...LAYERS].reverse() : LAYERS;
    const s = svg("svg", { viewBox: "0 0 360 250", class: "strata", role: "img", "aria-label": overturned ? "Overturned layers: oldest layer now on top" : "Undisturbed layers: oldest layer at the bottom" });
    order.forEach((l, i) => {
      s.appendChild(svg("rect", { x: 20, y: 10 + i * 40, width: 250, height: 38, fill: l.color }));
      s.appendChild(svg("text", { x: 145, y: 34 + i * 40, class: "strata-label", "text-anchor": "middle", text: l.name }));
    });
    s.appendChild(svg("text", { x: 290, y: 40, class: "tick", text: "younger" }));
    s.appendChild(svg("text", { x: 290, y: 215, class: "tick", text: "older" }));
    const up = overturned;
    s.appendChild(svg("line", { x1: 330, y1: up ? 205 : 55, x2: 330, y2: up ? 55 : 205, class: "age-arrow" }));
    s.appendChild(svg("path", { d: up ? "M322,64 L330,48 L338,64 Z" : "M322,196 L330,212 L338,196 Z", fill: "#2dd4bf" }));
    strataHost.replaceChildren(s, el("p", { class: "muted", text: overturned ? "Tectonic folding can flip layers, so the rule only works for undisturbed layers." : "Each new layer settles on top, so deeper = older (unless disturbed)." }));
  }

  function stopTour() { if (tour) { clearInterval(tour); tour = null; tourBtn.textContent = "▶ Auto tour"; } }
  const tourBtn = el("button", { class: "tool-btn primary", type: "button", text: "▶ Auto tour", onclick: () => {
    if (tour) { stopTour(); return; }
    tourBtn.textContent = "⏸ Stop tour";
    tour = setInterval(() => { idx = (idx + 1) % PROCESSES.length; refresh(); }, 3500);
  } });
  const nextBtn = el("button", { class: "tool-btn", type: "button", text: "Next ▶", onclick: () => pick((idx + 1) % PROCESSES.length) });
  const flip = toggle("Tectonics overturns the layers", false, (v) => { overturned = v; drawStrata(); });

  const root = layout("rock", [
    el("div", { class: "col grow" }, [
      card(null, [el("div", { class: "row" }, [tourBtn, nextBtn]), diagramHost, descHost]),
    ]),
    el("div", { class: "col" }, [
      card("Processes (💧 = relies on water)", [list]),
      card("Layers, cycles, and stability", [bullets([
        "It's a <b>cycle</b>: any rock can become any other. No rock formation on Earth is permanent.",
        "<b>Plate tectonics</b> lifts, buries, and melts crust, so Earth's surface keeps changing.",
        "The same processes recycle carbon and nutrients, and <b>erased almost all of Earth's craters</b>.",
      ])], { cls: "key-idea" }),
    ]),
    el("div", { class: "col" }, [
      card("Deeper = older", [flip, strataHost]),
      packetTask("The Rock Cycle", ["Name water-reliant processes; outline sedimentary rock in blue.", "Conclusion (#8): link the rock cycle to life <i>and</i> to the missing crater record."]),
    ]),
  ]);
  container.appendChild(root);
  refresh(); drawStrata();
  return stopTour;
}
