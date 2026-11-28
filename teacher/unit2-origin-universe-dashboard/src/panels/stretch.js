// panels/stretch.js — Stage 7 (Days 5–6 · Elaborate): Cosmic Light Stretcher & Conservation of Matter/Energy.

import { el, svg } from "../dom.js";
import { cmbTemp, peakWavelengthNm, emBand, planckCurve, wavelengthToHex } from "../science.js";
import { card, layout, packetTask, stat } from "../ui.js";

export function mount(container) {
  let logStretch = 0; // 0 = 1× (3,000 K visible); 3.0414 = 1,100× (2.73 K microwaves)

  const balloonSvg = svg("svg", { class: "wave-svg", viewBox: "0 0 760 145", role: "img", "aria-label": "Stretched light wave and conserved 3 to 1 hydrogen and helium atoms" });
  const planckSvg = svg("svg", { class: "chart-svg", viewBox: "0 0 760 225", role: "img", "aria-label": "Planck spectrum shifting from visible light into microwaves as space expands" });

  const sStretch = stat("Space stretched by", "1× (380,000 yrs after Big Bang)");
  const sTemp = stat("Universe temperature", "3,000 K (glowing orange-red)", { tone: "warn" });
  const sBand = stat("Peak light band (ESSRT p. 3)", "Visible / Near-Infrared", { tone: "good" });
  const sAtoms = stat("Matter ratio (conserved!)", "12 H : 4 He  →  75% H : 25% He", { tone: "accent" });

  const slider = el("input", {
    class: "slider", type: "range", min: 0, max: 3.0414, step: 0.02, value: logStretch,
    "aria-label": "Cosmic expansion stretch factor from 1x to 1100x",
    oninput: () => { logStretch = Number(slider.value); render(); },
  });

  function fmtPeak(nm) {
    if (nm < 1000) return `${Math.round(nm)} nm`;
    if (nm < 1e6) return `${(nm / 1000).toFixed(1)} µm`;
    return `${(nm / 1e6).toFixed(2)} mm`;
  }

  function render() {
    const stretch = Math.pow(10, logStretch);
    const tempK = cmbTemp(stretch);
    const peakNm = peakWavelengthNm(tempK);
    const band = emBand(peakNm);
    const frac = logStretch / 3.0414;

    // 1. Balloon strip: conserved 3:1 H/He atoms + stretching light wave
    balloonSvg.replaceChildren();
    const stripW = 230 + frac * 500;
    const x0 = (760 - stripW) / 2;
    balloonSvg.appendChild(svg("rect", { x: x0, y: 18, width: stripW, height: 108, rx: 18, fill: "rgba(56,189,248,0.10)", stroke: "rgba(148,163,184,0.35)", "stroke-width": 2 }));

    // Draw wave stretching across the expanding strip (fixed number of crests = 4!)
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const px = x0 + 20 + (i / 120) * (stripW - 40);
      const py = 72 - Math.sin((i / 120) * 4 * Math.PI * 2) * 28;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    const wColor = peakNm < 700 ? wavelengthToHex(Math.max(420, peakNm)) : peakNm < 1e5 ? "#e27a4f" : "#f87171";
    balloonSvg.appendChild(svg("polyline", { points: pts.join(" "), fill: "none", stroke: wColor, "stroke-width": 4, "stroke-linecap": "round" }));

    // Draw 12 H (cyan) and 4 He (green) atoms spaced across strip — count & 3:1 ratio NEVER change!
    for (let i = 0; i < 16; i++) {
      const isHe = i % 4 === 3;
      const ax = x0 + 26 + ((i + 0.5) / 16) * (stripW - 52);
      const ay = i % 2 === 0 ? 34 : 110;
      balloonSvg.appendChild(svg("circle", { cx: ax, cy: ay, r: isHe ? 7 : 5.5, fill: isHe ? "#4ec29b" : "#3fb7c7" }));
      balloonSvg.appendChild(svg("text", { x: ax, y: ay + 3.5, "text-anchor": "middle", fill: "#071018", "font-size": 8, "font-weight": 800, text: isHe ? "He" : "H" }));
    }

    // 2. Planck Blackbody Spectrum shifting across ESSRT bands (log10 nm: 2.0 .. 7.5)
    planckSvg.replaceChildren();
    const padL = 50, padR = 24, padT = 28, padB = 42, plotW = 760 - padL - padR, plotH = 225 - padT - padB;
    const xOfLog = (lg) => padL + ((lg - 2) / 5.5) * plotW;

    // Background EM band zones
    const zones = [
      { label: "UV", a: 2.0, b: 2.6, fill: "rgba(92,149,232,0.16)" },
      { label: "Visible", a: 2.6, b: 2.845, fill: "rgba(232,184,75,0.28)" },
      { label: "Infrared", a: 2.845, b: 6.0, fill: "rgba(226,122,79,0.14)" },
      { label: "Microwaves (CMB)", a: 6.0, b: 7.5, fill: "rgba(217,91,67,0.22)" },
    ];
    zones.forEach((z) => {
      const zx1 = xOfLog(z.a), zx2 = xOfLog(z.b);
      planckSvg.appendChild(svg("rect", { x: zx1, y: padT, width: zx2 - zx1, height: plotH, fill: z.fill }));
      planckSvg.appendChild(svg("text", { x: (zx1 + zx2) / 2, y: padT + 16, "text-anchor": "middle", fill: "#cbd5e1", "font-size": 12, "font-weight": 700, text: z.label }));
    });

    // Curve
    const curve = planckCurve(tempK, 120);
    const pathD = curve.map((p, i) => `${i === 0 ? "M" : "L"}${xOfLog(p.logNm).toFixed(1)},${(padT + plotH - p.norm * (plotH - 26)).toFixed(1)}`).join(" ");
    planckSvg.appendChild(svg("path", { d: `${pathD} L${xOfLog(7.5)},${padT + plotH} L${xOfLog(2)},${padT + plotH} Z`, fill: wColor, opacity: 0.25 }));
    planckSvg.appendChild(svg("path", { d: pathD, fill: "none", stroke: wColor, "stroke-width": 4 }));

    // Peak marker
    const peakLog = Math.log10(peakNm);
    if (peakLog >= 2 && peakLog <= 7.5) {
      const px = xOfLog(peakLog);
      planckSvg.appendChild(svg("line", { x1: px, y1: padT + 20, x2: px, y2: padT + plotH, stroke: "#fde047", "stroke-width": 2, "stroke-dasharray": "5 4" }));
      planckSvg.appendChild(svg("text", { x: Math.min(710, Math.max(95, px)), y: padT + plotH + 34, "text-anchor": "middle", fill: "#fde047", "font-size": 13, "font-weight": 800, text: `Peak λ ≈ ${fmtPeak(peakNm)}` }));
    }

    // X ticks
    [{ lg: 2.7, lbl: "500 nm" }, { lg: 4, lbl: "10 µm" }, { lg: 6, lbl: "1 mm" }, { lg: 7, lbl: "1 cm" }].forEach((tk) => {
      planckSvg.appendChild(svg("text", { x: xOfLog(tk.lg), y: padT + plotH + 16, "text-anchor": "middle", class: "axis-tick", text: tk.lbl }));
    });

    // Stats
    sStretch.setValue(stretch < 1.05 ? "1× (380,000 yrs · CMB released)" : `${Math.round(stretch).toLocaleString()}× larger`, stretch > 900 ? "bad" : "accent");
    sTemp.setValue(tempK >= 100 ? `${Math.round(tempK).toLocaleString()} K` : `${tempK.toFixed(1)} K (−270 °C)`, tempK < 10 ? "accent" : "warn");
    sBand.setValue(`${band.label} (peak ${fmtPeak(peakNm)})`, band.id === "microwave" ? "bad" : "good");
    slider.value = logStretch.toFixed(2);
  }

  const presets = [
    { label: "1× (3,000 K · Visible)", v: 0 },
    { label: "10× (300 K · Infrared)", v: 1 },
    { label: "100× (30 K · Far-IR)", v: 2 },
    { label: "1,100× (2.7 K · CMB Microwaves)", v: 3.0414 },
  ].map((p) => el("button", {
    class: "chip", type: "button", text: p.label,
    onclick: () => { logStretch = p.v; render(); },
  }));

  render();

  container.append(layout("cols-wide", [
    card("The Cosmic Light Stretcher & Matter Conservation", [
      balloonSvg,
      planckSvg,
      el("div", { class: "controls-row" }, [
        el("label", { class: "slider-label" }, [el("span", { text: "Stretch space (1× → 1,100×):" }), slider]),
        el("div", { class: "chips" }, presets),
      ]),
    ], { kicker: "Conservation of matter & energy: atoms stay 3 : 1, early light stretches into microwaves!" }),
    el("div", { class: "stack" }, [
      el("div", { class: "stats-col" }, [sStretch, sTemp, sBand, sAtoms]),
      packetTask("Elaborate Part 3 · pp. 20–21", [
        "<b>Q3 (Matter):</b> 3 : 1 H : He ratio stays intact as space expands.",
        "<b>Q4–6 (Light):</b> Early visible light wasn't destroyed — expansion stretched it ~1,100× into <b>~1 mm microwaves</b> (invisible to human eyes!).",
      ]),
    ]),
  ]));
}
