// panels/o2ext.js — Day 7 Elaborate: Extinction Events and Oxygen.
// The packet's last-600-million-years oxygen graph with its uncertainty band and the five
// extinctions marked, plus the recovery feedback and the Arguing-from-Evidence checklist.

import { el, svg } from "../dom.js";
import { O2_PHANERO, O2_PHANERO_LABELS, EXTINCTIONS, latestEvent } from "../science.js";
import { text } from "../chart.js";
import { card, layout, packetTask, toggle, bullets } from "../ui.js";
import { timeChart } from "../timechart.js";

// Read off the traced best-estimate line (checked in tests/science.test.mjs).
const READS = [
  ["Ordovician (444 Ma)", "About 19–20%; little change at the line, then a rise to ≈ 24% by 410 Ma."],
  ["Devonian (360 Ma)", "A low of ≈ 15–16% from about 380 to 365 Ma, then recovery to ≈ 24% by 325 Ma."],
  ["Permian (252 Ma)", "The biggest drop: from ≈ 30% (280 Ma) to ≈ 21% at the line and ≈ 17–18% soon after."],
  ["Triassic (201 Ma)", "Oxygen near its low, ≈ 14%, staying low until about 150 Ma, then rising."],
  ["K–Pg (66 Ma)", "About 19%; only a small dip (≈ 18.5%) after the line, then a slow rise to 21% today."],
];

const fmtMa = (t) => (t <= 0.5 ? "today" : `${Math.round(t)} million years ago`);

export function mount(container) {
  const state = { marks: true, labels: false };
  const chart = timeChart({
    title: "Atmospheric oxygen over the last 575 million years (traced from the packet graph)",
    aria: "Line graph of atmospheric oxygen over the last 575 million years with a shaded band of possible values. Oxygen is near 18 to 24 percent early on, dips to about 15 percent near 380 to 365 million years ago, peaks near 30 percent about 280 million years ago, falls to about 14 percent near 200 to 150 million years ago, then rises to 21 percent today. Dashed lines mark the five mass extinctions.",
    series: O2_PHANERO, xDomain: [580, 0], yDomain: [0, 40], ticksX: [500, 400, 300, 200, 100, 0], ticksY: [0, 10, 20, 30, 40],
    xLabel: "Millions of years ago (Ma)", yLabel: "Atmospheric oxygen (%)", start: 300, playSeconds: 20,
    fmtT: fmtMa, fmtY: (v) => `≈ ${Math.round(v)}%`, state,
    overlay: (g, { x, y, H, mt, mb, state: st }) => {
      if (st.marks) EXTINCTIONS.forEach((e, i) => {
        g.appendChild(svg("line", { x1: x(e.ma), x2: x(e.ma), y1: mt, y2: H - mb, class: "ext-line" }));
        g.appendChild(text(x(e.ma), mt + 14 + (i % 2) * 18, `${i + 1}`, { class: "ext-num", "text-anchor": "middle" }));
      });
      if (st.labels) O2_PHANERO_LABELS.forEach((l, i) => {
        g.appendChild(svg("rect", { x: x(l.x1), width: Math.max(4, x(l.x2) - x(l.x1)), y: H - mb - 12, height: 8, rx: 3, class: "note-bar" }));
        g.appendChild(text((x(l.x1) + x(l.x2)) / 2, y(5) - (i % 2) * 18, l.name, { class: "tick strong", "text-anchor": "middle" }));
      });
    },
    readout: (t, v, lo, hi) => {
      const near = EXTINCTIONS.find((e) => Math.abs(e.ma - t) <= 6);
      const prev = [...EXTINCTIONS].reverse().find((e) => e.ma > t + 6);
      const life = latestEvent(t / 1000, "life");
      const range = hi > lo ? `possible range <b>${Math.round(lo)}–${Math.round(hi)}%</b>` : "measured today";
      return `<div class="o2-head"><b>${fmtMa(t)}</b> · best estimate <b>≈ ${Math.round(v)}%</b> (${range})</div>` +
        (near ? `<div class="ext-alert">💥 <b>${near.name} extinction</b>, ${near.ma} Ma: about <b>${near.rate}%</b> of species lost. ${near.later[0]}.</div>`
          : `<div>${prev ? `Last extinction: <b>${prev.name}</b>, ${Math.round(prev.ma - t)} million years earlier.` : "None of the five extinctions has happened yet."}</div>`) +
        `<div><span class="lbl life">Newest life so far</span> ${life ? life.event : "—"}</div>`;
    },
  });


  const root = layout("two-col o2ext", [
    el("div", { class: "col" }, [
      card(null, [
        el("div", { class: "card-tools" }, [
          toggle("Mark the extinctions", true, (v) => { state.marks = v; chart.redraw(); }),
          toggle("Packet labels (gigantism, ocean anoxia, mammal size)", false, (v) => { state.labels = v; chart.redraw(); }),
        ]),
        chart.root,
        el("p", { class: "src", text: "Oxygen curve, uncertainty band and labels traced from the packet's “Extinction Events and Oxygen” graph; values between traced points are estimates. Extinction dates and rates: the packet's table." }),
      ]),
    ]),
    el("div", { class: "col" }, [
      card("What the graph shows at each line", [
        el("div", { class: "table-host" }, [el("table", { class: "data compact" }, [
          el("thead", {}, [el("tr", {}, ["Extinction", "Oxygen on the traced curve"].map((h) => el("th", { text: h })))]),
          el("tbody", {}, READS.map(([n, r]) => el("tr", {}, [el("td", { class: "strong", text: n }), el("td", { text: r })]))),
        ])]),
        el("p", { class: "muted", html: "<b>Note:</b> the packet says each extinction lines up with a drop in oxygen. On the graph the dips are clear for three of the five; for the Ordovician and K–Pg the change is small next to the uncertainty band. That is a good reliability discussion for the argument." }),
      ]),
      card("Why would recovery raise oxygen again?", [bullets([
        "Most oxygen is made by <b>photosynthesis</b> (algae, plankton, plants).",
        "An extinction kills photosynthesizers and breaks food chains → less O₂.",
        "Survivors spread into empty niches; <b>plants and algae regrow first</b> → O₂ rises → animals recover and diversify.",
      ])], { cls: "key-idea" }),
      packetTask("Arguing from Evidence (p. 20)", ["Clear <b>claim</b>", "A <b>negative</b> impact with evidence", "A <b>positive</b> impact with evidence", "How <b>recovery</b> affects oxygen", "<b>Reliability</b>: isotope dating and the fossil record"]),
    ]),
  ]);
  container.appendChild(root);
  return () => chart.destroy();
}
