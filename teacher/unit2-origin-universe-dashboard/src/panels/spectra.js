// panels/spectra.js — Stage 2 (Day 1 · Explore): Interactive 5-spectrum comparator with
// draggable nanometer straightedge ruler matching Packet p. 4.

import { el, svg } from "../dom.js";
import { PACKET_SPECTRA, LAB_LINES, wavelengthToHex } from "../science.js";
import { card, layout, packetTask, toggle, stat } from "../ui.js";

const MIN_NM = 380, MAX_NM = 740;

export function mount(container) {
  let rulerNm = 396;
  let showShifts = false;
  let highlightLineIdx = 0;

  const W = 940, H = 415;
  const padL = 216, padR = 24, padT = 46, rowH = 54, rowGap = 16;
  const specW = W - padL - padR;
  const xOf = (nm) => padL + ((nm - MIN_NM) / (MAX_NM - MIN_NM)) * specW;
  const nmOf = (x) => Math.max(MIN_NM, Math.min(MAX_NM, MIN_NM + ((x - padL) / specW) * (MAX_NM - MIN_NM)));

  const svgEl = svg("svg", { class: "spec-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Five galaxy absorption spectra from 380 to 740 nanometers" });

  // Build smooth rainbow gradient definition once
  const stops = [];
  for (let nm = MIN_NM; nm <= MAX_NM; nm += 12) {
    const pct = ((nm - MIN_NM) / (MAX_NM - MIN_NM)) * 100;
    stops.push(svg("stop", { offset: `${pct.toFixed(1)}%`, "stop-color": wavelengthToHex(nm) }));
  }
  svgEl.appendChild(svg("defs", {}, [svg("linearGradient", { id: "vis-grad", x1: "0", y1: "0", x2: "1", y2: "0" }, stops)]));

  // Top nanometer axis
  const axisG = svg("g", { class: "spec-axis" });
  axisG.appendChild(svg("text", { x: padL + specW / 2, y: 16, "text-anchor": "middle", class: "axis-title", text: "Wavelength (nanometers, nm) — Blue / Violet (short λ)  →  Red (long λ)" }));
  for (let nm = 400; nm <= 720; nm += 40) {
    const x = xOf(nm);
    axisG.appendChild(svg("line", { x1: x, y1: padT - 10, x2: x, y2: H - 18, stroke: "rgba(255,255,255,0.12)", "stroke-width": 1 }));
    axisG.appendChild(svg("text", { x, y: padT - 14, "text-anchor": "middle", class: "axis-tick", text: `${nm}` }));
  }
  svgEl.appendChild(axisG);

  const shiftLayer = svg("g", { class: "shift-layer" });
  const rowsG = svg("g");

  PACKET_SPECTRA.forEach((sp, ri) => {
    const y = padT + ri * (rowH + rowGap);
    rowsG.appendChild(svg("text", { x: padL - 12, y: y + 23, "text-anchor": "end", class: "spec-name", text: sp.object }));
    rowsG.appendChild(svg("text", { x: padL - 12, y: y + 41, "text-anchor": "end", class: "spec-sub", text: sp.id === "lab" ? "Rest reference" : "Galaxy / star" }));
    rowsG.appendChild(svg("rect", { x: padL, y, width: specW, height: rowH, rx: 6, fill: "url(#vis-grad)", stroke: "rgba(255,255,255,0.28)", "stroke-width": 1.5 }));
    sp.lines.forEach((ln, li) => {
      if (ln < MIN_NM || ln > MAX_NM) return;
      const lx = xOf(ln);
      rowsG.appendChild(svg("line", {
        x1: lx, y1: y + 1, x2: lx, y2: y + rowH - 1,
        stroke: "#06080f", "stroke-width": li === 0 || li === 6 ? 4.5 : 3.2,
      }));
    });
  });
  svgEl.append(rowsG, shiftLayer);

  // Draggable vertical straightedge ruler
  const rulerLine = svg("line", { y1: padT - 8, y2: H - 10, stroke: "#fde047", "stroke-width": 3, "stroke-dasharray": "7 4" });
  const rulerTag = svg("rect", { y: padT - 34, width: 76, height: 24, rx: 6, fill: "#fde047" });
  const rulerTxt = svg("text", { y: padT - 17, "text-anchor": "middle", fill: "#0b0f19", "font-size": 14, "font-weight": 800 });
  const rulerG = svg("g", { class: "ruler-g", style: "cursor:ew-resize" }, [rulerLine, rulerTag, rulerTxt]);
  svgEl.appendChild(rulerG);

  // Readout stats
  const sRuler = stat("Straightedge position", "396 nm");
  const sNearby = stat("Nearby Galaxy shift", "Click 'Reveal shifts'");
  const sVery = stat("Very Distant shift", "Click 'Reveal shifts'");

  const slider = el("input", {
    class: "slider", type: "range", min: MIN_NM, max: MAX_NM, step: 1, value: rulerNm,
    "aria-label": "Straightedge ruler wavelength in nanometers",
    oninput: () => { rulerNm = Number(slider.value); update(); },
  });

  function update() {
    const rx = xOf(rulerNm);
    rulerLine.setAttribute("x1", rx); rulerLine.setAttribute("x2", rx);
    rulerTag.setAttribute("x", Math.max(padL, Math.min(W - padR - 76, rx - 38)));
    rulerTxt.setAttribute("x", Math.max(padL + 38, Math.min(W - padR - 38, rx)));
    rulerTxt.textContent = `${Math.round(rulerNm)} nm`;
    slider.value = String(Math.round(rulerNm));
    sRuler.setValue(`${Math.round(rulerNm)} nm`);

    shiftLayer.replaceChildren();
    if (showShifts) {
      const refNm = LAB_LINES[highlightLineIdx];
      const refX = xOf(refNm);
      PACKET_SPECTRA.forEach((sp, ri) => {
        const y = padT + ri * (rowH + rowGap);
        const ln = sp.lines[highlightLineIdx];
        if (!ln || ln > MAX_NM) return;
        const lx = xOf(ln);
        const delta = ln - refNm;
        if (ri > 0) {
          shiftLayer.appendChild(svg("line", { x1: refX, y1: y + rowH + 6, x2: lx, y2: y + rowH + 6, stroke: "#f87171", "stroke-width": 3 }));
          shiftLayer.appendChild(svg("text", { x: (refX + lx) / 2, y: y + rowH + 14, "text-anchor": "middle", fill: "#fca5a5", "font-size": 12, "font-weight": 700, text: `+${delta} nm` }));
        }
        shiftLayer.appendChild(svg("circle", { cx: lx, cy: y + rowH / 2, r: 6, fill: "none", stroke: "#fde047", "stroke-width": 2.5 }));
      });
      const nearDelta = PACKET_SPECTRA[2].lines[highlightLineIdx] - refNm;
      const veryLn = PACKET_SPECTRA[4].lines[highlightLineIdx];
      sNearby.setValue(`+${nearDelta} nm`, "warn");
      sVery.setValue(veryLn ? `+${veryLn - refNm} nm` : "Shifted past 740 nm (IR!)", "bad");
    } else {
      sNearby.setValue("Measure with ruler", "");
      sVery.setValue("Measure with ruler", "");
    }
  }

  // Pointer drag on SVG for smartboard touch
  let dragging = false;
  function pointerToNm(e) {
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    rulerNm = nmOf(x);
    update();
  }
  svgEl.addEventListener("pointerdown", (e) => { dragging = true; svgEl.setPointerCapture(e.pointerId); pointerToNm(e); });
  svgEl.addEventListener("pointermove", (e) => { if (dragging) pointerToNm(e); });
  svgEl.addEventListener("pointerup", () => { dragging = false; });

  const snapBtns = [
    { label: "396 nm (Violet line)", idx: 0, nm: 396 },
    { label: "436 nm (Blue line)", idx: 2, nm: 436 },
    { label: "497 nm (Cyan line)", idx: 3, nm: 497 },
    { label: "654 nm (Red H-α)", idx: 6, nm: 654 },
  ].map((p) => el("button", {
    class: "chip", type: "button", text: p.label,
    onclick: () => { highlightLineIdx = p.idx; rulerNm = p.nm; update(); },
  }));

  const revealToggle = toggle("Reveal shift measurements (Δλ)", false, (on) => { showShifts = on; update(); });

  const controls = el("div", { class: "controls-row" }, [
    el("label", { class: "slider-label" }, [el("span", { text: "Drag straightedge on screen or slide:" }), slider]),
    el("div", { class: "chips" }, snapBtns),
    revealToggle,
  ]);

  update();

  container.append(layout("cols-wide", [
    card("Light Spectra from Five Objects (Packet p. 4)", [
      svgEl,
      controls,
    ], { kicker: "Board note: wavelength units = nanometers (nm)" }),
    el("div", { class: "stack" }, [
      el("div", { class: "stats-col" }, [sRuler, sNearby, sVery]),
      packetTask("Spectra Questions · p. 4", [
        "<b>Q1:</b> Is the pattern of dark lines the same or different across the five spectra?",
        "<b>Q2:</b> Which direction do the lines shift compared with the Lab Reference?",
        "<b>Q3:</b> How does the amount of shift compare for Nearby vs. Very Distant galaxies?",
      ]),
      el("div", { class: "callout-warn" }, [
        el("strong", { text: "Board reminder: " }),
        "The packet p. 4 axis omits units. Point out that the numbers are ",
        el("b", { text: "nanometers (nm)" }),
        " and model sliding a vertical straightedge downward.",
      ]),
    ]),
  ]));
}
