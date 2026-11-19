// nail.js — The iron nail demo from the teacher guide (set up Day 1, revealed Day 4).
// Tube A: water covers most of the nail, top open to air. Tube B: nail fully under water with
// an oil layer sealing out air. The drawing shows the expected result only after `reveal`.

import { svg } from "./dom.js";
import { chartRoot, text } from "./chart.js";

export const NAIL_CHOICES = [
  { key: "a", label: "Only Tube A (open to air) rusts" },
  { key: "b", label: "Only Tube B (under oil) rusts" },
  { key: "both", label: "Both rust the same" },
  { key: "neither", label: "Neither rusts" },
];

function tube(x, { oil, label, sub, reveal, rusty }) {
  const g = svg("g", {});
  const top = 60, bottom = 330, w = 110;
  g.appendChild(svg("rect", { x, y: top, width: w, height: bottom - top, rx: 18, class: "tube-glass" }));
  const waterTop = oil ? 120 : 150;
  g.appendChild(svg("rect", { x: x + 6, y: waterTop, width: w - 12, height: bottom - waterTop - 6, rx: 12, class: "tube-water" }));
  if (oil) g.appendChild(svg("rect", { x: x + 6, y: waterTop - 26, width: w - 12, height: 26, class: "tube-oil" }));
  // nail: head + shaft
  const cx = x + w / 2, nailTop = oil ? 160 : 92;
  g.appendChild(svg("rect", { x: cx - 5, y: nailTop, width: 10, height: 300 - nailTop, rx: 3, class: `nail ${reveal && rusty ? "rusty" : ""}` }));
  g.appendChild(svg("rect", { x: cx - 16, y: nailTop - 8, width: 32, height: 10, rx: 3, class: `nail ${reveal && rusty ? "rusty" : ""}` }));
  g.appendChild(svg("path", { d: `M${cx - 5},300 L${cx},318 L${cx + 5},300 Z`, class: `nail ${reveal && rusty ? "rusty" : ""}` }));
  if (oil) g.appendChild(text(cx, waterTop - 8, "oil", { class: "tube-tag", "text-anchor": "middle" }));
  else g.appendChild(text(x + 26, top + 40, "air", { class: "tube-tag", "text-anchor": "middle" }));
  g.appendChild(text(cx, 360, label, { class: "row-label sm", "text-anchor": "middle" }));
  g.appendChild(text(cx, 384, sub, { class: "tick", "text-anchor": "middle" }));
  if (reveal) g.appendChild(text(cx, 410, rusty ? "Rusted (iron oxide)" : "Little or no rust", { class: `tube-result ${rusty ? "rusty" : ""}`, "text-anchor": "middle" }));
  return g;
}

/** SVG of both tubes. `reveal` colors the nail that rusts and adds result labels. */
export function nailDemo(reveal) {
  const r = chartRoot(420, 420, reveal
    ? "Iron nail demo result: the nail in Tube A, open to air, has rusted orange. The nail in Tube B, sealed under oil, has little or no rust."
    : "Iron nail demo setup: Tube A has a nail partly in water with air above. Tube B has a nail fully under water with a layer of oil on top.");
  r.classList.add("nail-demo");
  r.append(
    tube(60, { oil: false, label: "Tube A", sub: "open to air", reveal, rusty: true }),
    tube(250, { oil: true, label: "Tube B", sub: "sealed under oil", reveal, rusty: false }),
  );
  return r;
}
