// panels/extinctions.js — Day 7 Elaborate: Mass Extinctions.
// Bar chart of the five extinctions (tap a bar), the packet table as cause → immediate → later
// cards, and a Read-Generate-Sort-Solve sorting round built from the same table.

import { el, fill, svg, tabs } from "../dom.js";
import { EXTINCTIONS, makeRng } from "../science.js";
import { linear, chartRoot, text } from "../chart.js";
import { card, layout, packetTask, bullets } from "../ui.js";

const BINS = [
  { key: "factors", label: "🌋 Earth-system cause" },
  { key: "immediate", label: "💀 Immediate impact" },
  { key: "later", label: "🌱 Later impact" },
];

export function mount(container) {
  let sel = 2; // Permian

  const chartHost = el("div", { class: "chart-host short" });
  function drawBars() {
    const W = 720, ml = 120, mr = 70, mt = 12, mb = 36, rowH = 40;
    const H = mt + mb + EXTINCTIONS.length * rowH;
    const x = linear([0, 100], [ml, W - mr]);
    const r = chartRoot(W, H, `Percent of all species lost in the five mass extinctions: ${EXTINCTIONS.map((e) => `${e.name} ${e.rate}%`).join(", ")}.`);
    for (const v of [0, 25, 50, 75, 100]) {
      r.appendChild(svg("line", { x1: x(v), x2: x(v), y1: mt, y2: H - mb, class: "grid" }));
      r.appendChild(text(x(v), H - mb + 20, `${v}%`, { class: "tick", "text-anchor": "middle" }));
    }
    EXTINCTIONS.forEach((e, i) => {
      const y = mt + i * rowH + 6, on = i === sel;
      const g = svg("g", { class: `ext-bar ${on ? "sel" : ""}`, role: "button", tabindex: "0", "aria-label": `${e.name}, ${e.ma} million years ago, ${e.rate} percent of species lost`, "aria-pressed": String(on),
        onclick: () => { sel = i; drawBars(); drawCards(); }, onkeydown: (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); sel = i; drawBars(); drawCards(); } } });
      g.appendChild(svg("rect", { x: 0, y: y - 4, width: W, height: rowH, class: "row-hit" }));
      g.appendChild(svg("rect", { x: x(0), y, width: x(e.rate) - x(0), height: rowH - 12, rx: 4, class: "bar-fill" }));
      g.appendChild(text(ml - 10, y + rowH / 2 - 2, `${e.name}`, { class: "row-label xs", "text-anchor": "end" }));
      g.appendChild(text(ml - 10, y + rowH / 2 + 13, `${e.ma} Ma`, { class: "tick", "text-anchor": "end" }));
      g.appendChild(text(x(e.rate) + 8, y + rowH / 2, `${e.rate}%`, { class: "bar-value sm" }));
      r.appendChild(g);
    });
    chartHost.replaceChildren(r);
  }

  const cardsHost = el("div", {});
  function drawCards() {
    const e = EXTINCTIONS[sel];
    cardsHost.replaceChildren(
      el("h3", { class: "ext-title", text: `${e.name}: ${e.ma} million years ago · ${e.rate}% of species lost` }),
      el("div", { class: "ext-cols" }, BINS.map((b) => el("div", { class: `ext-col ${b.key}` }, [el("div", { class: "kicker", text: b.label }), bullets(e[b.key])]))),
    );
  }

  // ---------- Read-Generate-Sort-Solve ----------
  function sortGame() {
    let ext = sel, round = null, idx = 0, picks = [];
    const box = el("div", {});
    function newRound() {
      const e = EXTINCTIONS[ext];
      const items = BINS.flatMap((b) => e[b.key].map((s) => ({ s, bin: b.key })));
      const rnd = makeRng(ext * 97 + 13);
      round = items.map((it) => ({ it, k: rnd() })).sort((a, b) => a.k - b.k).map((o) => o.it);
      idx = 0; picks = [];
      draw();
    }
    function draw() {
      const e = EXTINCTIONS[ext];
      const head = el("div", { class: "row" }, [
        el("span", { class: "strong", text: "Extinction:" }),
        ...EXTINCTIONS.map((x, i) => el("button", { class: `chip ${i === ext ? "active" : ""}`, type: "button", "aria-pressed": String(i === ext), text: x.name, onclick: () => { ext = i; newRound(); } })),
      ]);
      if (idx >= round.length) {
        const right = picks.filter((p, i) => p === round[i].bin).length;
        box.replaceChildren(head, el("div", { class: "fb ok" }, [el("b", { text: `Sorted! ${right} of ${round.length} on the first try. ` }), "Now Solve: write the group answer to “How did geological events impact evolutionary ones, and how did life influence the recovery?”"]),
          el("button", { class: "tool-btn primary", type: "button", text: "Sort again", onclick: newRound }));
        return;
      }
      const cur = round[idx], p = picks[idx];
      fill(box,
        head,
        el("div", { class: "myth-top" }, [el("span", { text: `${e.name} · statement ${idx + 1} of ${round.length}` })]),
        el("div", { class: "ev-card", text: cur.s }),
        el("div", { class: "claim-btns" }, BINS.map((b) => el("button", {
          class: `claim-btn ${p ? (b.key === cur.bin ? "right" : b.key === p ? "wrong" : "dim") : ""}`, type: "button", disabled: p ? true : null,
          text: b.label, onclick: () => { picks[idx] = b.key; draw(); },
        }))),
        p ? el("button", { class: "tool-btn primary", type: "button", text: "Next ▶", onclick: () => { idx++; draw(); } }) : null,
      );
    }
    newRound();
    return el("div", {}, [el("p", { class: "muted", text: "Read → Generate (sticky notes) → Sort → Solve. Sort the packet's statements for one extinction into causes, immediate impacts and later impacts." }), box]);
  }

  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["📋 The table", "🗂 Sort it (RGSS)"], (k) => tabBody.replaceChildren(k === 0 ? el("div", {}, [cardsHost, el("p", { class: "muted", text: "Scientists are still working out exact causes. Causes come from isotopes and rock evidence; impacts come from shifts in the fossil record." })]) : sortGame()));

  const root = layout("two-col extinctions", [
    el("div", { class: "col" }, [
      card("The five major mass extinctions · tap a bar", [chartHost, el("p", { class: "src", text: "Data: the packet's mass extinction table (percent of all species lost)." })]),
      card("Patterns across the extinctions", [bullets([
        "Every one involved big changes to Earth's systems: climate, sea level, ocean chemistry, volcanoes, and once an asteroid.",
        "<b>Negative:</b> 75–90% of species lost; whole ecosystems collapsed.",
        "<b>Positive:</b> survivors spread into empty niches (fish, four-legged animals, dinosaurs, mammals, flowering plants).",
      ])], { cls: "key-idea" }),
      packetTask("Elaborate (pp. 17–18)", ["Video: “That Time Oxygen Almost Killed Everything.” How was photosynthesis bad for organisms that already existed? Good for those after?", "Read-Generate-Sort-Solve with the extinction table."]),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody])]),
  ]);
  container.appendChild(root);
  drawBars(); drawCards();
}
