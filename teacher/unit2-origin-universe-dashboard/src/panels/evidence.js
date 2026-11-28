// panels/evidence.js — Stage 8 (Day 6 · Elaborate Part 4): Composition Pies, CMB All-Sky Map, and 3-Lines Synthesis Table.

import { el, svg, tabs, clear } from "../dom.js";
import { COMPOSITION } from "../science.js";
import { card, layout, packetTask, toggle } from "../ui.js";

function pieSvg(slices, title, sub) {
  const s = svg("svg", { class: "pie-svg", viewBox: "0 0 280 280", role: "img", "aria-label": title });
  const cx = 140, cy = 122, r = 92;
  let ang = -Math.PI / 2;
  slices.forEach((sl) => {
    const a2 = ang + (sl.pct / 100) * Math.PI * 2;
    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = sl.pct > 50 ? 1 : 0;
    const d = `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
    s.appendChild(svg("path", { d, fill: sl.color, stroke: "#0b0f19", "stroke-width": 2.5 }));
    if (sl.pct >= 12) {
      const mid = (ang + a2) / 2;
      s.appendChild(svg("text", {
        x: cx + r * 0.56 * Math.cos(mid), y: cy + r * 0.56 * Math.sin(mid) + 5,
        "text-anchor": "middle", fill: "#071018", "font-size": 16, "font-weight": 800,
        text: `${sl.pct}%`,
      }));
    }
    ang = a2;
  });
  s.appendChild(svg("text", { x: cx, y: 242, "text-anchor": "middle", fill: "#e8edf6", "font-size": 16, "font-weight": 800, text: title }));
  s.appendChild(svg("text", { x: cx, y: 263, "text-anchor": "middle", fill: "#9aa7bd", "font-size": 13, text: sub }));
  return s;
}

function cmbMapSvg() {
  const s = svg("svg", { class: "cmb-svg", viewBox: "0 0 640 310", role: "img", "aria-label": "Stylized full-sky Cosmic Microwave Background temperature map at 2.725 Kelvin" });
  s.appendChild(svg("defs", {}, [
    svg("clipPath", { id: "cmb-oval" }, [svg("ellipse", { cx: 320, cy: 148, rx: 288, ry: 126 })]),
  ]));
  const g = svg("g", { "clip-path": "url(#cmb-oval)" });
  g.appendChild(svg("rect", { x: 20, y: 12, width: 600, height: 272, fill: "#1e5d7a" }));
  // Deterministic subtle Mollweide-like micro-fluctuation patches (±0.0002 K around 2.725 K)
  const palette = ["#2a7c99", "#4ec29b", "#d9b64e", "#e27a4f", "#184666"];
  for (let i = 0; i < 165; i++) {
    const px = 38 + ((i * 73) % 564);
    const py = 26 + ((i * 47 + Math.floor(i / 7) * 19) % 244);
    const rx = 14 + (i % 5) * 8;
    const ry = 10 + (i % 4) * 6;
    g.appendChild(svg("ellipse", { cx: px, cy: py, rx, ry, fill: palette[i % palette.length], opacity: 0.42 }));
  }
  s.append(g, svg("ellipse", { cx: 320, cy: 148, rx: 288, ry: 126, fill: "none", stroke: "#7dd3fc", "stroke-width": 2.5 }));
  s.appendChild(svg("text", { x: 320, y: 298, "text-anchor": "middle", fill: "#cbd5e1", "font-size": 13, "font-weight": 700, text: "Uniform 2.725 K (−270.4 °C) microwave glow in every direction · tiny ±0.0002 K ripples seeded galaxies" }));
  return s;
}

const THREE_LINES = [
  {
    id: "redshift",
    evidence: "1. Redshift in galaxy spectra",
    obs: "Every distant galaxy's H & He lines are shifted toward red — and farther galaxies shift more.",
    reasoning: "By the Doppler effect, redshift means galaxies are moving away, and farther = faster means space itself is expanding. Rewinding expansion points to a hot, tiny beginning.",
    concept: "Doppler Effect + Expansion",
  },
  {
    id: "cmb",
    evidence: "2. Cosmic Microwave Background (CMB)",
    obs: "Faint 2.7 K (−270 °C) microwave radiation arrives uniformly from every direction in the sky (discovered 1964 by Penzias & Wilson).",
    reasoning: "By conservation of energy, the blinding visible light of the early universe couldn't be destroyed — 13.8 billion years of expansion stretched it ~1,100× into microwaves.",
    concept: "Conservation of Energy",
  },
  {
    id: "hhe",
    evidence: "3. ~74% Hydrogen, ~25% Helium, <2% Heavier",
    obs: "Observed matter today is ~98% H & He (pie chart: 70% H, 28% He, 1% O, 1% other) — matching the predicted 75% / 25% ratio.",
    reasoning: "By conservation of matter, the Big Bang's original 3 : 1 H-to-He recipe is still here. Nuclear fusion in stars and supernovae (Unit 1) fused a tiny fraction into heavier elements.",
    concept: "Conservation of Matter + Fusion",
  },
];

export function mount(container) {
  // ---------- TAB 1: PREDICTED VS. OBSERVED MATTER ----------
  function buildPies() {
    let showWhy = false;
    const whyBox = el("div", { class: "reveal-box ok", hidden: true }, [
      el("strong", { text: "Why isn't observed today an exact 75% / 25% match? " }),
      "For 13.8 billion years, ", el("b", { text: "nuclear fusion in stars" }),
      " has turned a small slice of hydrogen into helium, and ", el("b", { text: "supernovae" }),
      " forged the ~1–2% of oxygen, carbon, silicon, and iron! Because matter is conserved, ~98% of the universe is still H and He — strongly confirming the Big Bang prediction.",
    ]);
    const legend = el("div", { class: "legend-row" }, COMPOSITION.observed.map((c) =>
      el("span", { class: "legend-item" }, [el("i", { style: `background:${c.color}` }), `${c.element}`])));

    return layout("cols-wide", [
      card("Evidence 1: Matter Composition — Predicted vs. Observed", [
        el("div", { class: "pies-row" }, [
          pieSvg(COMPOSITION.predicted, "Big Bang Prediction", "3 : 1 ratio by mass (75% H · 25% He)"),
          pieSvg(COMPOSITION.observed, "Observed Universe Today", "70% H · 28% He · 1% O · 1% other"),
        ]),
        legend,
        el("div", { class: "row" }, [toggle("Reveal why stars explain the ~2% heavier elements", false, (on) => { showWhy = on; whyBox.hidden = !showWhy; })]),
        whyBox,
      ], { kicker: "Note: text/table cite ~74% H, ~25% He, <2% other — all close to 3 : 1!" }),
      packetTask("Part 4 · Composition (pp. 21–22)", [
        "Compare the two pie charts: does the small 2% difference disprove the Big Bang?",
        "Connect back to <b>Unit 1 (Star Life Cycles)</b>: where did oxygen and heavier elements come from?",
      ]),
    ]);
  }

  // ---------- TAB 2: CMB MAP & 1964 DISCOVERY ----------
  function buildCmb() {
    return layout("cols-wide", [
      card("Evidence 2: Cosmic Microwave Background (CMB)", [
        cmbMapSvg(),
        el("div", { class: "callout-info" }, [
          el("strong", { text: "Murmur of a Bang (1964–65): " }),
          "Arno Penzias & Robert Wilson tried to eliminate mysterious microwave static in their New Jersey horn antenna — even cleaning out pigeon droppings! The static came evenly from every direction, day and night: the exact Big Bang afterglow predicted in the 1940s.",
        ]),
      ], { kicker: "Leftover light from 380,000 years after the Big Bang" }),
      el("div", { class: "stack" }, [
        packetTask("Murmur of a Bang · p. 22", [
          "Annotate: <u>underline</u> ideas that confirm, <b>circle</b> ideas that add, <b>box</b> ideas that change your thinking.",
          "<b>Q3:</b> Compare microwave wavelengths (~1 mm) with visible light (~500 nm) — about 2,000× longer!",
        ]),
        card("Why this confirms Conservation of Energy", [
          el("p", { text: "Early visible light energy wasn't destroyed — cosmic expansion stretched its wavelength into microwaves that still fill every cubic centimeter of space today." }),
        ]),
      ]),
    ]);
  }

  // ---------- TAB 3: BRINGING ALL 3 LINES TOGETHER (p. 23) ----------
  function buildSynthesis() {
    const shown = new Set();
    const rowsEl = el("div", { class: "stack-sm" });
    function renderRows() {
      clear(rowsEl);
      THREE_LINES.forEach((row) => {
        const open = shown.has(row.id);
        rowsEl.appendChild(el("div", { class: "card synth-row" }, [
          el("div", { class: "row-between" }, [
            el("h3", { text: row.evidence }),
            el("button", {
              class: `tool-btn ${open ? "" : "primary"}`, type: "button",
              text: open ? "Hide reasoning" : "Reveal scientific reasoning",
              onclick: () => { if (open) shown.delete(row.id); else shown.add(row.id); renderRows(); },
            }),
          ]),
          el("p", {}, [el("b", { text: "Observation: " }), row.obs]),
          open ? el("div", { class: "reveal-box ok" }, [
            el("span", { class: "pill ok", text: row.concept }),
            " ",
            row.reasoning,
          ]) : null,
        ]));
      });
    }
    renderRows();
    return el("div", { class: "stack" }, [
      el("div", { class: "row-between" }, [
        el("p", { class: "muted", text: "Packet p. 23 · Rubric check: does each reasoning box use 'because/therefore' and name a scientific concept?" }),
        el("button", {
          class: "tool-btn primary", type: "button", text: "Reveal all 3 reasoning boxes",
          onclick: () => { THREE_LINES.forEach((r) => shown.add(r.id)); renderRows(); },
        }),
      ]),
      rowsEl,
    ]);
  }

  const body = el("div", { class: "tab-body fill" });
  const t = tabs(["🥧 1. H & He Composition", "📡 2. Cosmic Microwave Background", "🧩 3. All 3 Lines Together (p. 23)"], (i) => {
    body.replaceChildren(i === 0 ? buildPies() : i === 1 ? buildCmb() : buildSynthesis());
  });
  container.append(el("div", { class: "stack fill" }, [el("div", { class: "tab-bar" }, [t.root]), body]));
}
