// panels/engage.js — Day 1 Engage: The Pace of Evolution.
// Pace-of-evolution timeline (packet spiral diagram as a dot timeline), 24-hour Earth clock,
// iron nail demo setup with class predictions, and the Domino Discover idea board.

import { el, svg, chips, tabs } from "../dom.js";
import { PACE_EVENTS, fmtGa, clockLabel, earthClock } from "../science.js";
import { linear, chartRoot, text } from "../chart.js";
import { card, layout, packetTask, toggle, saved } from "../ui.js";
import { nailDemo, NAIL_CHOICES } from "../nail.js";

const WINDOWS = [
  { label: "All 4.6 billion years", value: 4.6 },
  { label: "Last 1 billion years", value: 1 },
  { label: "Last 10 million years", value: 0.01 },
];

// Events placed on the Earth clock (the guide's Day 1 homework list).
const CLOCK_EVENTS = [
  { event: "Earth forms", ga: 4.6 },
  { event: "First life", ga: 3.8 },
  { event: "Photosynthesis", ga: 3.4 },
  { event: "Complex cells", ga: 2.0 },
  { event: "Cambrian animals", ga: 0.54 },
  { event: "Dinosaurs", ga: 0.23 },
  { event: "Humans", ga: 0.0002 },
];

export function mount(container) {
  let maxGa = 4.6, picked = null;

  // ---------- pace timeline ----------
  const chartHost = el("div", { class: "chart-host tall" });
  const readout = el("p", { class: "readout" });
  const winChips = chips(WINDOWS, maxGa, (v) => { maxGa = v; drawPace(); }, { label: "Time window" });

  function drawPace() {
    const shown = PACE_EVENTS.filter((d) => d.ga <= maxGa + 1e-9);
    const W = 820, ml = 250, mr = 30, mt = 34, mb = 50, rowH = 23;
    const H = mt + mb + shown.length * rowH;
    const x = linear([maxGa, 0], [ml, W - mr]);
    const r = chartRoot(W, H, `When each group first appeared, ${WINDOWS.find((w) => w.value === maxGa).label}: ${shown.length} of ${PACE_EVENTS.length} events fall in this window.`);
    r.appendChild(text(ml, 20, `${shown.length} of ${PACE_EVENTS.length} events fall in this window`, { class: "chart-title" }));
    const inMa = maxGa < 1, ticks = maxGa === 4.6 ? [4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0] : maxGa === 1 ? [1, 0.8, 0.6, 0.4, 0.2, 0] : [0.01, 0.008, 0.006, 0.004, 0.002, 0];
    for (const t of ticks) {
      r.appendChild(svg("line", { x1: x(t), x2: x(t), y1: mt, y2: H - mb, class: "grid" }));
      r.appendChild(text(x(t), H - mb + 22, t === 0 ? "today" : inMa ? String(+(t * 1000).toFixed(0)) : String(t), { class: "tick", "text-anchor": t === 0 ? "end" : "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 8, inMa ? "Million years ago" : "Billion years ago", { class: "axis-label", "text-anchor": "middle" }));
    shown.forEach((d, i) => {
      const y = mt + i * rowH + rowH / 2;
      const sel = picked === d.event;
      const g = svg("g", { class: `pace-row ${d.sys} ${sel ? "sel" : ""}`, tabindex: "0", role: "button", "aria-label": `${d.event}, ${fmtGa(d.ga)}`, onclick: () => pick(d), onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(d); } } });
      g.appendChild(svg("rect", { x: 0, y: y - rowH / 2, width: W, height: rowH, class: "row-hit" }));
      g.appendChild(svg("line", { x1: x(maxGa), x2: x(d.ga), y1: y, y2: y, class: "stem" }));
      g.appendChild(svg("circle", { cx: x(d.ga), cy: y, r: sel ? 9 : 7, class: "dot-mark" }));
      g.appendChild(text(ml - 12, y + 5, d.event, { class: "row-label xs", "text-anchor": "end" }));
      g.appendChild(svg("title", { text: `${d.event}: ${fmtGa(d.ga)}` }));
      r.appendChild(g);
    });
    chartHost.replaceChildren(r);
    if (!picked) readout.innerHTML = maxGa === 4.6
      ? "Tap any event. Then switch to <b>Last 1 billion years</b>: how many events are left?"
      : `<b>${shown.length}</b> of ${PACE_EVENTS.length} events are packed into the ${WINDOWS.find((w) => w.value === maxGa).label.toLowerCase()}.`;
  }
  function pick(d) {
    picked = d.event;
    readout.innerHTML = `<b>${d.event}</b>: ${fmtGa(d.ga)} · on the 24-hour Earth clock: <b>${clockLabel(d.ga)}</b>`;
    drawPace();
  }

  const legend = el("div", { class: "legend" }, [
    el("span", {}, [el("span", { class: "swatch earth" }), "Earth & space events"]),
    el("span", {}, [el("span", { class: "swatch life" }), "Life"]),
  ]);

  // ---------- right column tabs ----------
  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["🕛 Earth clock", "🔩 Nail demo", "💡 Our first ideas"], (i) => tabBody.replaceChildren([clockTab, nailTab, ideasTab][i]()));

  function clockTab() {
    let reveal = false;
    const host = el("div", { class: "chart-host" });
    const list = el("ul", { class: "bullets clock-list" });
    function draw() {
      const S = 380, c = S / 2, R = 150;
      const r = chartRoot(S, S, "Earth's 4.6-billion-year history squeezed into one 24-hour day. Life appears around 4 am; complex cells after 1 pm; animals after 9 pm; humans in the last few seconds before midnight.");
      r.appendChild(svg("circle", { cx: c, cy: c, r: R, class: "clock-face" }));
      // single-cell era shading: first life → multicellular (1 Ga)
      const ang = (ga) => (earthClock(ga).secs / 86400) * 2 * Math.PI - Math.PI / 2;
      const arc = (a0, a1, rr) => {
        const p = (a) => [c + rr * Math.cos(a), c + rr * Math.sin(a)];
        const [x0, y0] = p(a0), [x1, y1] = p(a1);
        return `M${c},${c} L${x0},${y0} A${rr},${rr} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`;
      };
      r.appendChild(svg("path", { d: arc(ang(3.8), ang(1.0), R - 4), class: "clock-single" }));
      for (let h = 0; h < 24; h++) {
        const a = (h / 24) * 2 * Math.PI - Math.PI / 2;
        r.appendChild(svg("line", { x1: c + (R - 10) * Math.cos(a), y1: c + (R - 10) * Math.sin(a), x2: c + R * Math.cos(a), y2: c + R * Math.sin(a), class: "axis" }));
        if (h % 3 === 0) r.appendChild(text(c + (R + 18) * Math.cos(a), c + (R + 18) * Math.sin(a) + 5, String(h === 0 ? 24 : h), { class: "tick", "text-anchor": "middle" }));
      }
      if (reveal) for (const e of CLOCK_EVENTS) {
        const a = ang(e.ga);
        r.appendChild(svg("circle", { cx: c + (R - 22) * Math.cos(a), cy: c + (R - 22) * Math.sin(a), r: 7, class: "marker" }, [svg("title", { text: `${e.event}: ${clockLabel(e.ga)}` })]));
      }
      r.appendChild(text(c, c - 8, "1 day =", { class: "tick", "text-anchor": "middle" }));
      r.appendChild(text(c, c + 16, "4.6 billion years", { class: "tick strong", "text-anchor": "middle" }));
      host.replaceChildren(r);
      list.replaceChildren(...CLOCK_EVENTS.map((e) => el("li", { html: `${e.event}: <b>${reveal ? clockLabel(e.ga) : "?"}</b>` })));
    }
    draw();
    return el("div", {}, [
      el("p", { class: "blurb", html: "<b>Do Now A:</b> If all of Earth's history were one 24-hour day, at what time do humans show up? Guess first." }),
      toggle("Show the events", false, (v) => { reveal = v; draw(); }),
      el("div", { class: "pair clock-pair" }, [host, el("div", {}, [list, el("p", { class: "muted", html: "1 hour ≈ 192 million years. Shaded: life was single-celled only (≈ 3.8 to 1 Ga)." })])]),
    ]);
  }

  function nailTab() {
    const votes = saved("nail-votes", { a: 0, b: 0, both: 0, neither: 0 });
    const tallies = {};
    const box = el("div", { class: "vote vote-4" }, NAIL_CHOICES.map((c) => {
      tallies[c.key] = el("span", { class: "tally-n", text: String(votes.get()[c.key] || 0) });
      return el("button", { class: "vote-btn", type: "button", onclick: () => { const v = { ...votes.get() }; v[c.key] = (v[c.key] || 0) + 1; votes.set(v); tallies[c.key].textContent = v[c.key]; } }, [el("span", { class: "vote-label", text: c.label }), tallies[c.key]]);
    }));
    return el("div", {}, [
      el("p", { class: "blurb", html: "Set this up today in front of the class and reveal it on <b>Day 4</b> (it needs at least 3 days). Students write a one-line prediction. <b>Don't explain why yet.</b>" }),
      el("div", { class: "pair" }, [el("div", { class: "chart-host short" }, [nailDemo(false)]), el("div", {}, [
        el("p", { class: "strong", text: "Class prediction (saved on this device for the Day 4 reveal):" }),
        box,
        el("button", { class: "tool-btn", type: "button", text: "Reset predictions", onclick: () => { votes.set({ a: 0, b: 0, both: 0, neither: 0 }); Object.values(tallies).forEach((n) => { n.textContent = "0"; }); } }),
      ])]),
    ]);
  }

  function ideasTab() {
    const ideas = saved("first-ideas", []);
    const input = el("input", { type: "text", class: "text-in", placeholder: "Type a pair's idea, e.g. “Oxygen built up”", "aria-label": "New idea" });
    const listEl = el("ol", { class: "idea-list" });
    function draw() {
      listEl.replaceChildren(...ideas.get().map((t, i) => el("li", {}, [el("span", { text: t }),
        el("button", { class: "icon-btn", type: "button", "aria-label": `Remove idea ${i + 1}`, text: "✕", onclick: () => { const v = ideas.get().filter((_, j) => j !== i); ideas.set(v); draw(); } })])));
      if (!ideas.get().length) listEl.appendChild(el("li", { class: "muted", text: "No ideas yet. Each pair adds one, no repeats." }));
    }
    function add() { const v = input.value.trim(); if (!v) return; ideas.set([...ideas.get(), v]); input.value = ""; draw(); input.focus(); }
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });
    draw();
    return el("div", {}, [
      el("p", { class: "blurb", html: "<b>Domino Discover:</b> “Our first ideas: What sped up evolution?” Each pair shares one idea in turn. The list is saved on this device so you can bring it back on <b>Day 8</b>." }),
      el("div", { class: "row" }, [input, el("button", { class: "tool-btn primary", type: "button", text: "Add", onclick: add })]),
      listEl,
    ]);
  }

  const root = layout("two-col engage", [
    el("div", { class: "col" }, [
      card("When did each group first appear?", [el("div", { class: "card-tools" }, [winChips.root, legend]), chartHost, readout,
        el("p", { class: "src", text: "Data: the packet's Pace of Evolution spiral diagram (New Visions ESS Unit 2)." })]),
      packetTask("Pace of Evolution (pp. 2–3)", [
        "Q1–6: when Earth formed, and how long each step took.",
        "Brainstorm table: 2–5 ideas for what influenced the <b>speed</b> of evolution, with evidence for each.",
      ]),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody])]),
  ]);
  container.appendChild(root);
  drawPace();
}
