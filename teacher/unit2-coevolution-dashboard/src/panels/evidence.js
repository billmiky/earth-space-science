// panels/evidence.js — Day 5 Explain Part 1: Evidence of Coevolution.
// Whole-class claim sorter (which claim does each piece of evidence support?), animated
// feedback loops, and the video-notes answer key.

import { el, fill, svg, chips, tabs } from "../dom.js";
import { CLAIMS, EVIDENCE, LOOPS } from "../science.js";
import { chartRoot, text } from "../chart.js";
import { card, layout, packetTask, bullets } from "../ui.js";

const VIDEO_NOTES = [
  "Oxygen reacted with iron in the oceans → <b>banded iron formations</b> (rust layers on the sea floor).",
  "Oxygen in the air weathered rocks on land → <b>red beds</b>; weathering sped up.",
  "Oxygen formed the <b>ozone layer</b>, which blocks UV and made land livable.",
  "Oxygen reacted with other metals → <b>new oxidized minerals</b> (blue and green copper minerals).",
  "Oxygen helped build <b>soil</b>, through organisms that use aerobic respiration.",
  "Oxygen destroyed <b>methane</b> (a greenhouse gas), which likely cooled the climate (ice age).",
];

/** Wrap a label into lines of about `n` characters. */
function wrap(s, n) {
  const out = []; let line = "";
  for (const w of s.split(" ")) { if ((line + " " + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line);
  return out;
}

export function mount(container) {
  // ---------- claim sorter ----------
  let i = 0;
  const picks = new Map();
  const sorter = el("div", { class: "sorter" });
  const claimKey = el("div", { class: "claim-key" }, CLAIMS.map((c) => el("div", {}, [el("b", { text: `Claim ${c.key}: ` }), c.text])));
  function drawSorter() {
    const e = EVIDENCE[i], p = picks.get(i);
    const done = picks.size, right = [...picks].filter(([k, v]) => EVIDENCE[k].claim === v).length;
    fill(sorter, 
      el("div", { class: "myth-top" }, [el("span", { text: `Evidence ${i + 1} of ${EVIDENCE.length}` }), el("span", { text: `Class score ${right} / ${done}` })]),
      el("div", { class: "ev-card", text: e.ev }),
      el("div", { class: "claim-btns" }, CLAIMS.map((c) => el("button", {
        class: `claim-btn ${p ? (c.key === e.claim ? "right" : c.key === p ? "wrong" : "dim") : ""}`, type: "button", disabled: p ? true : null,
        onclick: () => { picks.set(i, c.key); drawSorter(); },
      }, [el("b", { text: `Claim ${c.key}` })]))),
      p ? el("div", { class: `fb ${p === e.claim ? "ok" : "no"}` }, [el("b", { text: p === e.claim ? "✅ Claim " + e.claim + ". " : `❌ Best fit: Claim ${e.claim}. ` }), el("span", {}, [el("b", { text: "Reasoning: " }), e.why])]) : null,
      el("div", { class: "row" }, [
        el("button", { class: "tool-btn", type: "button", text: "◀ Back", disabled: i === 0 || null, onclick: () => { i--; drawSorter(); } }),
        el("button", { class: "tool-btn primary", type: "button", text: i < EVIDENCE.length - 1 ? "Next ▶" : "Start over", onclick: () => { if (i < EVIDENCE.length - 1) i++; else { i = 0; picks.clear(); } drawSorter(); } }),
      ]),
    );
  }

  // ---------- feedback loops ----------
  let loopKey = LOOPS[0].key, step = -1;
  const loopHost = el("div", { class: "chart-host" });
  const loopNote = el("p", { class: "readout" });
  const loopChips = chips(LOOPS.map((l) => ({ label: l.title, value: l.key })), loopKey, (v) => { loopKey = v; step = -1; drawLoop(); }, { label: "Feedback loop" });
  function drawLoop() {
    const L = LOOPS.find((l) => l.key === loopKey);
    const S = 560, c = S / 2, R = 180;
    const r = chartRoot(S, S - 40, `${L.kind}: ${L.steps.join(", then ")}, and back to the start.`);
    const pos = L.steps.map((_, k) => { const a = -Math.PI / 2 + (k / L.steps.length) * 2 * Math.PI; return [c + R * Math.cos(a), c - 20 + R * 0.78 * Math.sin(a)]; });
    L.steps.forEach((s, k) => {
      // Arrow from the edge of node k toward node k+1, bowed outward so it stays visible.
      const [x0, y0] = pos[k], [x1, y1] = pos[(k + 1) % L.steps.length];
      const ax = x0 + (x1 - x0) * 0.3, ay = y0 + (y1 - y0) * 0.3, bx = x0 + (x1 - x0) * 0.7, by = y0 + (y1 - y0) * 0.7;
      const mx = (ax + bx) / 2, my = (ay + by) / 2, ox = mx - c, oy = my - (c - 20), len = Math.hypot(ox, oy) || 1;
      r.appendChild(svg("path", { d: `M${ax},${ay} Q${mx + (ox / len) * 40},${my + (oy / len) * 40} ${bx},${by}`, class: `loop-arrow ${step === k ? "on" : ""}`, "marker-end": "url(#loopHead)" }));
    });
    r.prepend(svg("defs", {}, [svg("marker", { id: "loopHead", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto" }, [svg("path", { d: "M0,0 L10,5 L0,10 Z", class: "loop-head" })])]));
    L.steps.forEach((s, k) => {
      const [px, py] = pos[k], lines = wrap(s, 20), on = step === k || step === (k - 1 + L.steps.length) % L.steps.length && step >= 0;
      r.appendChild(svg("rect", { x: px - 92, y: py - 14 - lines.length * 10, width: 184, height: 28 + lines.length * 20, rx: 12, class: `loop-node ${on ? "on" : ""}` }));
      lines.forEach((ln, j) => r.appendChild(text(px, py + 6 - (lines.length - 1) * 10 + j * 20, ln, { class: "loop-text", "text-anchor": "middle" })));
    });
    loopHost.replaceChildren(r);
    loopNote.innerHTML = step < 0 ? `<b>${L.kind}.</b> ${L.note} Press <b>Step</b> to walk the loop.` : `<b>${step + 1}.</b> ${L.steps[step]} <b>→</b> ${L.steps[(step + 1) % L.steps.length]}`;
  }

  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["🔄 Feedback loops", "🎬 Video notes key"], (k) => tabBody.replaceChildren(k === 0 ? el("div", {}, [
    loopChips.root, loopHost, loopNote,
    el("div", { class: "row" }, [
      el("button", { class: "tool-btn primary", type: "button", text: "Step ▶", onclick: () => { step = (step + 1) % LOOPS.find((l) => l.key === loopKey).steps.length; drawLoop(); } }),
      el("button", { class: "tool-btn", type: "button", text: "Reset", onclick: () => { step = -1; drawLoop(); } }),
    ]),
  ]) : el("div", {}, [
    el("p", { class: "muted", text: "“The Role of Oxygen in Earth's History”: ways oxygen changed Earth's surface (accept any 4). Pause halfway: turn and tell a partner one thing you wrote." }),
    bullets(VIDEO_NOTES),
  ])));

  const root = layout("two-col evidence", [
    el("div", { class: "col" }, [
      card("Which claim does this evidence support?", [claimKey, sorter]),
      card("Evidence vs. reasoning", [bullets([
        "<b>Evidence</b> is what you can see or test: the bold description and date on a card.",
        "<b>Reasoning</b> is the process that connects it to the claim, often the italic text.",
      ])], { cls: "key-idea" }),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody]),
      packetTask("Part 1 (pp. 11–12)", ["Record 4 ways oxygen changed Earth's surface (video).", "Add evidence and reasoning for each of the 3 claims. Star your strongest E + R pair per claim."])]),
  ]);
  container.appendChild(root);
  drawSorter(); drawLoop();
}
