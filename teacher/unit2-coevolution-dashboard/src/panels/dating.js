// panels/dating.js — Day 3 Explore Part 2: Dating Fossil Layers.
// Decay curve with a half-life slider and the banded-iron sample, packet half-life tables
// (U-235, Rb-87, K-40, C-14) with a reveal, and a "which clock fits?" range chart.

import { el, svg, chips } from "../dom.js";
import { ISOTOPES, isotope, pctAfter, pctLeft, halfLifeTable, fmtYears, inRange, DATING_SAMPLES } from "../science.js";
import { linear, log10Scale, powersOfTen, chartRoot, text } from "../chart.js";
import { card, layout, packetTask, toggle } from "../ui.js";

const TABLE_ISOS = ["u235", "rb87", "k40", "c14"];
const BIF_YEARS = 2.5e9;

const yearsTick = (v) => (v >= 1e9 ? `${v / 1e9}B` : v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : String(v));

export function mount(container) {
  let isoKey = "u235", n = 0, showBif = true, revealTable = false, sampleKey = "human";

  // ---------- decay curve ----------
  const curveHost = el("div", { class: "chart-host" });
  const readout = el("p", { class: "readout big" });
  const slider = el("input", { type: "range", min: "0", max: "4", step: "0.05", value: "0", "aria-label": "Half-lives passed" });
  slider.addEventListener("input", () => { n = parseFloat(slider.value); drawCurve(); });
  const isoChips = chips(TABLE_ISOS.map((k) => ({ label: isotope(k).parent, value: k })), isoKey, (v) => { isoKey = v; drawCurve(); drawTable(); }, { label: "Isotope" });

  function drawCurve() {
    const iso = isotope(isoKey);
    const W = 780, H = 340, ml = 64, mr = 64, mt = 44, mb = 64;
    const x = linear([0, 4], [ml, W - mr]), y = linear([0, 100], [H - mb, mt]);
    const r = chartRoot(W, H, `Decay curve for ${iso.parent}: percent of parent left against half-lives passed. At ${n.toFixed(2)} half-lives, ${pctAfter(n).toFixed(1)} percent is left.`);
    r.appendChild(text(ml, 22, `${iso.parent} → ${iso.daughter} · half-life ${fmtYears(iso.half)} years`, { class: "chart-title" }));
    for (const v of [0, 25, 50, 75, 100]) {
      r.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
      r.appendChild(text(ml - 8, y(v) + 5, `${v}%`, { class: "tick", "text-anchor": "end" }));
    }
    for (let h = 0; h <= 4; h++) {
      r.appendChild(text(x(h), H - mb + 22, String(h), { class: "tick strong", "text-anchor": "middle" }));
      r.appendChild(text(x(h), H - mb + 42, h === 0 ? "0" : fmtYears(h * iso.half), { class: "tick", "text-anchor": "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 2, "Half-lives passed (top) · years (bottom)", { class: "axis-label", "text-anchor": "middle" }));
    let d = "";
    for (let t = 0; t <= 4.0001; t += 0.05) d += `${d ? "L" : "M"}${x(t).toFixed(1)},${y(pctAfter(t)).toFixed(1)} `;
    r.appendChild(svg("path", { d, class: "curve" }));
    if (showBif) {
      const hb = BIF_YEARS / iso.half;
      if (hb <= 4) {
        r.appendChild(svg("line", { x1: x(hb), x2: x(hb), y1: y(0), y2: y(pctAfter(hb)), class: "age-line" }));
        r.appendChild(text(x(hb) + (hb > 2.5 ? -8 : 8), y(0) - 10, "banded iron, 2.5 B", { class: "tick strong", "text-anchor": hb > 2.5 ? "end" : "start" }));
      }
    }
    r.appendChild(svg("line", { x1: x(n), x2: x(n), y1: y(0), y2: y(pctAfter(n)), class: "guide" }));
    r.appendChild(svg("circle", { cx: x(n), cy: y(pctAfter(n)), r: 9, class: "marker" }));
    curveHost.replaceChildren(r);
    const years = n * iso.half;
    let bif = "";
    if (showBif) {
      const p = pctLeft(BIF_YEARS, iso), hb = BIF_YEARS / iso.half;
      bif = `<br><span class="muted">Banded iron (2.5 billion years): ${hb.toFixed(2)} half-lives → about <b>${p >= 10 ? p.toFixed(0) : p.toFixed(1)}%</b> of the ${iso.parent} left${hb < 0.2 ? " (so little has decayed that the change is hard to measure)" : hb > 10 ? " (essentially none left to measure)" : ""}.</span>`;
    }
    readout.innerHTML = `${n.toFixed(2)} half-lives = <b>${fmtYears(years)} years</b> → <b>${+pctAfter(n).toFixed(2)}%</b> left${bif}`;
  }

  // ---------- packet table ----------
  const tableHost = el("div", { class: "table-host" });
  function drawTable() {
    const iso = isotope(isoKey);
    tableHost.replaceChildren(el("table", { class: "data compact" }, [
      el("thead", {}, [el("tr", {}, ["Half-lives", `${iso.parent} left`, "Years"].map((h) => el("th", { text: h })))]),
      el("tbody", {}, halfLifeTable(iso, 5).map((row) => el("tr", {}, [
        el("td", { class: "strong", text: String(row.n) }),
        el("td", { text: revealTable || row.n === 0 ? `${row.pct}%` : "?" }),
        el("td", { text: revealTable || row.n === 0 ? fmtYears(row.years) : "?" }),
      ]))),
    ]));
  }

  // ---------- which clock fits? ----------
  const rangeHost = el("div", { class: "chart-host" });
  const rangeNote = el("p", { class: "readout" });
  const sampleChips = chips(DATING_SAMPLES.map((s) => ({ label: s.label, value: s.key })), sampleKey, (v) => { sampleKey = v; drawRanges(); }, { label: "Sample to date" });
  function drawRanges() {
    const s = DATING_SAMPLES.find((d) => d.key === sampleKey);
    const W = 780, ml = 150, mr = 30, mt = 16, mb = 46, rowH = 34;
    const H = mt + mb + ISOTOPES.length * rowH;
    const dom = [10, 1e10], x = log10Scale(dom, [ml, W - mr]);
    const r = chartRoot(W, H, `Useful dating range of each isotope on a log scale, with the ${s.label} at ${fmtYears(s.years)} years marked.`);
    for (const p of powersOfTen(dom[0], dom[1])) {
      r.appendChild(svg("line", { x1: x(p), x2: x(p), y1: mt, y2: H - mb, class: "grid" }));
      r.appendChild(text(x(p), H - mb + 20, yearsTick(p), { class: "tick", "text-anchor": "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 6, "Age in years (log scale: each line is 10× older)", { class: "axis-label", "text-anchor": "middle" }));
    ISOTOPES.forEach((iso, i) => {
      const y = mt + i * rowH + 6, ok = inRange(iso, s.years);
      r.appendChild(svg("rect", { x: x(iso.min), y, width: x(iso.max) - x(iso.min), height: rowH - 12, rx: 4, class: `range ${ok ? "ok" : "no"}` }));
      r.appendChild(text(ml - 10, y + rowH / 2 - 1, iso.parent, { class: "row-label xs", "text-anchor": "end" }));
      if (ok) r.appendChild(text(x(iso.min) + 8, y + rowH / 2 - 1, "✔ fits", { class: "range-label" }));
    });
    r.appendChild(svg("line", { x1: x(s.years), x2: x(s.years), y1: mt - 4, y2: H - mb, class: "age-line" }));
    rangeHost.replaceChildren(r);
    const fits = ISOTOPES.filter((iso) => inRange(iso, s.years)).map((iso) => iso.parent);
    rangeNote.innerHTML = `<b>${s.label}</b> (${fmtYears(s.years)} years, ${s.note}): ${fits.length ? `fits <b>${fits.join(", ")}</b>` : "no isotope fits"}.` +
      (s.key === "human" ? " Carbon-14 stops at 70,000 years, so it can't date this. Potassium-40 dates the volcanic ash layers around the fossils." : "");
  }

  const root = layout("two-col dating", [
    el("div", { class: "col" }, [
      card("Half-life: each step leaves half of what was left", [
        el("div", { class: "card-tools" }, [isoChips.root]),
        curveHost,
        el("label", { class: "ctl wide" }, ["Half-lives passed", slider]),
        toggle("Mark the 2.5-billion-year banded iron", true, (v) => { showBif = v; drawCurve(); }),
        readout,
      ]),
      card("Which clock fits the sample?", [el("div", { class: "card-tools" }, [sampleChips.root]), rangeHost, rangeNote,
        el("p", { class: "src", text: "Half-lives and useful ranges: the packet's “Geologically Important Radioactive Elements” table (same values as the NYS ESSRT, p. 15)." })]),
    ]),
    el("div", { class: "col" }, [
      card("Packet half-life table", [
        el("p", { class: "muted", text: "Uses the isotope picked on the left. Work the first row together, then reveal." }),
        toggle("Reveal answers", false, (v) => { revealTable = v; drawTable(); }),
        tableHost,
      ]),
      packetTask("Part 2 (pp. 6–7)", [
        "Q1: tables for <b>Uranium-235</b> and <b>Rubidium-87</b>.",
        "Q2: the iron bands are ~2.5 billion years old. (a) How much U-235 is left? (b) Why is Rb-87 harder to use? (c) Advantage of a shorter half-life?",
        "Q3: which isotope dates early humans (~200,000 years)? Q4: its table.",
      ]),
      card("Mini-lesson on the board", [el("p", { class: "equation", html: "100% <span class='op'>→</span> 50% <span class='op'>→</span> 25% <span class='op'>→</span> 12.5% <span class='op'>→</span> 6.25%" }),
        el("p", { class: "muted", text: "Each arrow is one half-life. Half of what is left decays, not half of what you started with." })], { cls: "key-idea" }),
    ]),
  ]);
  container.appendChild(root);
  drawCurve(); drawTable(); drawRanges();
}
