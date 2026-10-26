// panels/engage.js — Engage: The Crater Mystery.

import { el, svg, chips } from "../dom.js";
import { CRATER_BODIES, fmtInt } from "../science.js";
import { log10Scale, powersOfTen, siLabel, chartRoot, text } from "../chart.js";
import { card, layout, packetTask } from "../ui.js";

export function mount(container) {
  let mode = "total";
  const votes = { hit: 0, erased: 0 };

  const chartHost = el("div", { class: "chart-host" });
  const modeChips = chips(
    [{ label: "Total craters found", value: "total" }, { label: "Craters per million km²", value: "per" }],
    mode, (v) => { mode = v; draw(); }, { label: "Chart view" });

  function draw() {
    const per = mode === "per";
    const W = 760, H = 340, ml = 110, mr = 120, mt = 36, mb = 60;
    const domain = per ? [0.1, 1e5] : [1, 1e7];
    const x = log10Scale(domain, [ml, W - mr]);
    const bodies = CRATER_BODIES;
    const rowH = (H - mt - mb) / bodies.length;
    const root = chartRoot(W, H, per ? "Craters per million square kilometers, log scale" : "Impact craters found, log scale");
    root.appendChild(text(ml, 22, per ? "Craters per million km² of surface (log scale)" : "Impact craters discovered (log scale)", { class: "chart-title" }));
    for (const p of powersOfTen(domain[0], domain[1])) {
      root.appendChild(svg("line", { x1: x(p), x2: x(p), y1: mt, y2: H - mb, class: "grid" }));
      root.appendChild(text(x(p), H - mb + 22, p < 1 ? String(p) : siLabel(p), { class: "tick", "text-anchor": "middle" }));
    }
    root.appendChild(text((ml + W - mr) / 2, H - 6, per ? "Each gridline is 10× more crowded →" : "Each gridline is 10× more craters →", { class: "axis-label", "text-anchor": "middle" }));
    bodies.forEach((b, i) => {
      const v = per ? b.perArea : b.craters;
      const y = mt + i * rowH + rowH * 0.15;
      root.appendChild(svg("rect", { x: x(domain[0]), y, width: Math.max(2, x(v) - x(domain[0])), height: rowH * 0.7, rx: 6, fill: b.color, class: "bar" }));
      root.appendChild(text(ml - 12, y + rowH * 0.45, b.body, { class: "row-label", "text-anchor": "end" }));
      const lab = per ? (v >= 100 ? fmtInt(v) : v.toFixed(2)) : fmtInt(v);
      root.appendChild(text(x(v) + 10, y + rowH * 0.46, lab, { class: "bar-value" }));
    });
    chartHost.replaceChildren(root);
    note.textContent = per
      ? "Surface area (million km²): Earth 510.1 · Mars 144.8 · Moon 37.9. The Moon's surface is still ≈100,000× more crowded than Earth's."
      : `The Moon has about ${fmtInt(1e6 / 128)}× more known craters than Earth, even though it is a much smaller target.`;
  }
  const note = el("p", { class: "chart-note" });

  // Hypothesis vote
  const tallyHit = el("span", { class: "tally-n", text: "0" });
  const tallyErased = el("span", { class: "tally-n", text: "0" });
  function vote(k) { votes[k]++; tallyHit.textContent = votes.hit; tallyErased.textContent = votes.erased; }
  const hint = el("p", { class: "hint", hidden: true, html: "<b>Hint:</b> a bigger body with stronger gravity pulls in <em>more</em> impactors, not fewer. If Earth was hit as often, something must have <b>removed</b> its craters." });

  const left = el("div", { class: "col" }, [
    card("Impact craters discovered", [
      el("div", { class: "card-tools" }, [modeChips.root]),
      chartHost, note,
    ]),
    packetTask("See – Think – Wonder (Craters in the Solar System)", [
      "<b>See:</b> What patterns do you notice in the crater numbers?",
      "<b>Think:</b> Was Earth hit less, or were its craters erased?",
      "<b>Wonder:</b> Write at least two questions.",
    ]),
  ]);

  const right = el("div", { class: "col" }, [
    el("figure", { class: "photo" }, [
      el("img", { src: "../../images/moon-full-galileo.jpg", alt: "The full Moon, a mosaic of Galileo spacecraft images, showing bright cratered highlands, dark smooth plains called maria, and bright rays spreading from young craters" }),
      el("figcaption", { text: "The Moon, pocked with impact craters. Credit: NASA/JPL (Galileo spacecraft)." }),
    ]),
    card("Class vote: which explanation do you support?", [
      el("div", { class: "vote" }, [
        el("button", { class: "vote-btn", type: "button", onclick: () => vote("hit") }, [el("span", { class: "vote-label", text: "Earth was hit less" }), tallyHit]),
        el("button", { class: "vote-btn alt", type: "button", onclick: () => vote("erased") }, [el("span", { class: "vote-label", text: "Earth's craters were erased" }), tallyErased]),
      ]),
      el("div", { class: "row" }, [
        el("button", { class: "tool-btn", type: "button", text: "Reset votes", onclick: () => { votes.hit = votes.erased = 0; tallyHit.textContent = "0"; tallyErased.textContent = "0"; } }),
        el("button", { class: "tool-btn", type: "button", text: "Show hint", onclick: () => { hint.hidden = !hint.hidden; } }),
      ]),
      hint,
    ]),
  ]);

  container.appendChild(layout("two-col engage", [left, right]));
  draw();
}
