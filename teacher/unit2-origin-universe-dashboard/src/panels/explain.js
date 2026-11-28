// panels/explain.js — Stage 5 (Day 4 · Explain): Three Scenarios Predictor, Real Redshift + Hubble's Law, and Day 1 Ideas Revisit.

import { el, svg, tabs, clear } from "../dom.js";
import { REAL_SPECTRAL_LINES, HUBBLE_CLUSTERS, dopplerShift, wavelengthToHex } from "../science.js";
import { card, layout, packetTask, stat, saved } from "../ui.js";

const SCENARIOS = [
  {
    id: "expanding", title: "Expanding Universe", shiftNm: 48, badge: "MATCHES REAL DATA ✔", tone: "bad",
    claim: "Light shifts toward the RED end of the spectrum.",
    evidence: "Galaxies move away → waves stretch to longer wavelengths & lower frequency.",
    reasoning: "Longer visible wavelengths appear redder — and farther galaxies shift even more.",
  },
  {
    id: "contracting", title: "Contracting Universe", shiftNm: -40, badge: "Not observed", tone: "accent",
    claim: "Light shifts toward the BLUE end of the spectrum.",
    evidence: "Galaxies move toward Earth → waves squish to shorter wavelengths & higher frequency.",
    reasoning: "Shorter visible wavelengths appear bluer (blueshift).",
  },
  {
    id: "static", title: "Static (Unchanging) Universe", shiftNm: 0, badge: "Not observed", tone: "good",
    claim: "NO shift — lines match the laboratory reference.",
    evidence: "Zero relative motion → wavelengths and frequency stay unchanged.",
    reasoning: "Without motion, light waves are neither stretched nor squished.",
  },
];

function miniSpectrumSvg(shiftNm) {
  const W = 380, H = 48;
  const s = svg("svg", { class: "mini-spec", viewBox: `0 0 ${W} ${H}` });
  const stops = [];
  for (let nm = 380; nm <= 740; nm += 20) {
    stops.push(svg("stop", { offset: `${((nm - 380) / 360) * 100}%`, "stop-color": wavelengthToHex(nm) }));
  }
  const gid = `ms-${shiftNm}`;
  s.appendChild(svg("defs", {}, [svg("linearGradient", { id: gid, x1: 0, y1: 0, x2: 1, y2: 0 }, stops)]));
  s.appendChild(svg("rect", { x: 0, y: 8, width: W, height: 32, rx: 5, fill: `url(#${gid})` }));
  [434, 486, 589, 656].forEach((nm) => {
    const x0 = ((nm - 380) / 360) * W;
    const x1 = ((nm + shiftNm - 380) / 360) * W;
    s.appendChild(svg("line", { x1: x0, y1: 4, x2: x0, y2: 12, stroke: "#fde047", "stroke-width": 2 }));
    if (x1 > 2 && x1 < W - 2) s.appendChild(svg("line", { x1: x1, y1: 8, x2: x1, y2: 40, stroke: "#05070c", "stroke-width": 3.5 }));
  });
  return s;
}

export function mount(container) {
  // ---------- TAB 1: THREE SCENARIOS ----------
  function buildScenarios() {
    const revealed = new Set();
    let showMatch = false;
    const grid = el("div", { class: "scenario-grid" });

    function render() {
      clear(grid);
      SCENARIOS.forEach((sc) => {
        const open = revealed.has(sc.id);
        const matchCls = showMatch && sc.id === "expanding" ? " winner" : showMatch ? " dim" : "";
        grid.appendChild(el("div", { class: `card scenario-card${matchCls}` }, [
          el("div", { class: "row-between" }, [
            el("h3", { text: sc.title }),
            showMatch ? el("span", { class: `pill ${sc.id === "expanding" ? "ok" : ""}`, text: sc.badge }) : null,
          ]),
          open ? miniSpectrumSvg(sc.shiftNm) : el("div", { class: "hidden-spec", text: "Tap to reveal predicted spectrum & reasoning" }),
          open ? el("div", { class: "stack-xs" }, [
            el("p", {}, [el("b", { text: "Predicted shift: " }), sc.claim]),
            el("p", {}, [el("b", { text: "Mechanism: " }), sc.evidence]),
            el("p", { class: "muted", text: sc.reasoning }),
          ]) : null,
          el("button", {
            class: `tool-btn ${open ? "" : "primary"}`, type: "button",
            text: open ? "Hide" : "Reveal prediction",
            onclick: () => { if (open) revealed.delete(sc.id); else revealed.add(sc.id); render(); },
          }),
        ]));
      });
    }
    render();

    return el("div", { class: "stack" }, [
      grid,
      el("div", { class: "row" }, [
        el("button", {
          class: "tool-btn primary", type: "button",
          text: "Reveal all three predictions",
          onclick: () => { SCENARIOS.forEach((s) => revealed.add(s.id)); render(); },
        }),
        el("button", {
          class: "tool-btn", type: "button",
          text: "Compare with real Day 1 galaxy spectra ✔",
          onclick: () => { SCENARIOS.forEach((s) => revealed.add(s.id)); showMatch = !showMatch; render(); },
        }),
      ]),
      packetTask("Explain · pp. 12–14", [
        "Complete the 3-scenario table (p. 12), then run <b>Read–Generate–Sort–Solve</b> (pp. 13–14) to write the class CER.",
        "<b>Summary Task (p. 15):</b> Was energy ever destroyed in Models 1 or 3? No — it moved outward and shifted wavelength.",
      ]),
    ]);
  }

  // ---------- TAB 2: LIVE REDSHIFT SLIDER + HUBBLE'S LAW ----------
  function buildRedshiftHubble() {
    let vKms = 12000;
    const specSvg = svg("svg", { class: "spec-svg", viewBox: "0 0 760 170" });
    const stops = [];
    for (let nm = 380; nm <= 740; nm += 12) {
      stops.push(svg("stop", { offset: `${((nm - 380) / 360) * 100}%`, "stop-color": wavelengthToHex(nm) }));
    }
    specSvg.appendChild(svg("defs", {}, [svg("linearGradient", { id: "rs-grad", x1: 0, y1: 0, x2: 1, y2: 0 }, stops)]));
    const layer = svg("g");
    specSvg.appendChild(layer);

    const sVel = stat("Galaxy velocity (v)", "+12,000 km/s", { tone: "bad" });
    const sHa = stat("H-α line (rest 656.3 nm)", "683.1 nm");
    const sDist = stat("Hubble distance (d = v / 70)", "171 Mpc");

    const vSlider = el("input", {
      class: "slider", type: "range", min: -20000, max: 45000, step: 500, value: vKms,
      "aria-label": "Galaxy velocity in kilometers per second",
      oninput: () => { vKms = Number(vSlider.value); drawSpec(); },
    });

    function drawSpec() {
      layer.replaceChildren();
      const xOf = (nm) => 120 + ((nm - 380) / 360) * 615;
      layer.appendChild(svg("text", { x: 110, y: 48, "text-anchor": "end", class: "spec-name", text: "Lab rest" }));
      layer.appendChild(svg("rect", { x: 120, y: 22, width: 615, height: 42, rx: 5, fill: "url(#rs-grad)" }));
      layer.appendChild(svg("text", { x: 110, y: 124, "text-anchor": "end", class: "spec-name", text: "Observed" }));
      layer.appendChild(svg("rect", { x: 120, y: 98, width: 615, height: 42, rx: 5, fill: "url(#rs-grad)" }));

      REAL_SPECTRAL_LINES.forEach((ln) => {
        const x0 = xOf(ln.nm);
        const obs = dopplerShift(ln.nm, vKms);
        const x1 = xOf(obs);
        layer.appendChild(svg("line", { x1: x0, y1: 22, x2: x0, y2: 64, stroke: "#06080f", "stroke-width": 3 }));
        if (obs >= 380 && obs <= 740) {
          layer.appendChild(svg("line", { x1: x1, y1: 98, x2: x1, y2: 140, stroke: "#06080f", "stroke-width": 3.5 }));
          layer.appendChild(svg("line", { x1: x0, y1: 66, x2: x1, y2: 96, stroke: vKms > 0 ? "rgba(248,113,113,0.55)" : vKms < 0 ? "rgba(56,189,248,0.55)" : "rgba(255,255,255,0.25)", "stroke-width": 1.6, "stroke-dasharray": "4 3" }));
        }
      });

      const haObs = dopplerShift(656.3, vKms);
      sVel.setValue(`${vKms > 0 ? "+" : ""}${vKms.toLocaleString()} km/s`, vKms > 0 ? "bad" : vKms < 0 ? "accent" : "good");
      sHa.setValue(haObs > 740 ? `${haObs.toFixed(0)} nm (Infrared!)` : `${haObs.toFixed(1)} nm`);
      sDist.setValue(vKms > 0 ? `~${Math.round(vKms / 70)} Mpc` : "Approaching / local");
    }
    drawSpec();

    // Hubble's Law plot (real 6 galaxy clusters from chapter)
    const hSvg = svg("svg", { class: "chart-svg", viewBox: "0 0 540 270", role: "img", "aria-label": "Hubble's Law scatter plot of galaxy cluster velocity versus distance" });
    const hx = (d) => 68 + (d / 360) * 448;
    const hy = (v) => 228 - (v / 26000) * 195;
    // Grid & axes
    for (let d = 0; d <= 350; d += 50) {
      hSvg.appendChild(svg("line", { x1: hx(d), y1: 28, x2: hx(d), y2: 228, stroke: "rgba(255,255,255,0.09)" }));
      hSvg.appendChild(svg("text", { x: hx(d), y: 245, "text-anchor": "middle", class: "axis-tick", text: String(d) }));
    }
    for (let v = 0; v <= 25000; v += 5000) {
      hSvg.appendChild(svg("line", { x1: 68, y1: hy(v), x2: 516, y2: hy(v), stroke: "rgba(255,255,255,0.09)" }));
      hSvg.appendChild(svg("text", { x: 60, y: hy(v) + 4, "text-anchor": "end", class: "axis-tick", text: v ? `${v / 1000}k` : "0" }));
    }
    hSvg.appendChild(svg("text", { x: 292, y: 264, "text-anchor": "middle", class: "axis-title", text: "Distance (Megaparsecs, Mpc)" }));
    hSvg.appendChild(svg("text", { x: 16, y: 128, "text-anchor": "middle", transform: "rotate(-90 16 128)", class: "axis-title", text: "Recession speed (km/s)" }));
    // Dashed line v = 70 * d
    hSvg.appendChild(svg("line", { x1: hx(0), y1: hy(0), x2: hx(350), y2: hy(24500), stroke: "#fde047", "stroke-width": 2.5, "stroke-dasharray": "7 5" }));
    HUBBLE_CLUSTERS.forEach((c) => {
      hSvg.appendChild(svg("circle", { cx: hx(c.d), cy: hy(c.v), r: 6, fill: "#f87171", stroke: "#fff", "stroke-width": 1.5 }));
      const dx = c.d > 250 ? -8 : 8, anchor = c.d > 250 ? "end" : "start";
      hSvg.appendChild(svg("text", { x: hx(c.d) + dx, y: hy(c.v) - 6, "text-anchor": anchor, fill: "#e8edf6", "font-size": 12, "font-weight": 700, text: c.name }));
    });

    return layout("cols-2", [
      card("Interactive Redshift Slider (Real H / Ca / Na Lines)", [
        specSvg,
        el("label", { class: "slider-label" }, [el("span", { text: "Slide velocity (negative = toward, positive = away):" }), vSlider]),
        el("div", { class: "stats-row" }, [sVel, sHa, sDist]),
      ], { kicker: "Test blueshift vs. redshift live" }),
      card("Optional Extension: Hubble's Law (v = 70 × d)", [
        hSvg,
        el("p", { class: "muted", text: "Real cluster observations: a galaxy twice as far away moves away twice as fast — the signature of expanding space." }),
      ], { kicker: "Real NASA / NED cluster data" }),
    ]);
  }

  // ---------- TAB 3: REVISIT DAY 1 IDEAS & CER ----------
  function buildRevisit() {
    const ideasStore = saved("day1-ideas", []);
    const listEl = el("div", { class: "ideas-list" });
    function render() {
      clear(listEl);
      const items = ideasStore.get();
      if (!items.length) {
        listEl.append(el("p", { class: "muted", text: "Add class ideas on Stage 1 (Engage) to revisit and test them here." }));
        return;
      }
      items.forEach((it, idx) => {
        const setSt = (st) => {
          const next = ideasStore.get().map((x, i) => (i === idx ? { ...x, status: st } : x));
          ideasStore.set(next);
          render();
        };
        listEl.append(el("div", { class: `idea-row st-${it.status || "open"}` }, [
          el("span", { class: "idea-text", text: it.text }),
          el("div", { class: "row-xs" }, [
            el("button", { class: `mini-btn ${it.status === "keep" ? "ok" : ""}`, type: "button", text: "✔ Supported", onclick: () => setSt("keep") }),
            el("button", { class: `mini-btn ${it.status === "revise" ? "warn" : ""}`, type: "button", text: "✎ Revise", onclick: () => setSt("revise") }),
            el("button", { class: `mini-btn ${it.status === "out" ? "bad" : ""}`, type: "button", text: "✕ Eliminate", onclick: () => setSt("out") }),
          ]),
        ]));
      });
    }
    render();

    return layout("cols-2", [
      card("Revisit Day 1 Ideas Board", [
        el("div", { class: "callout-info" }, [
          el("strong", { text: "Reminder: " }),
          "Eliminate testable scientific claims contradicted by spectra (e.g., 'static/unchanging universe'), never students' personal beliefs.",
        ]),
        listEl,
      ], { kicker: "Class Consensus Discussion" }),
      card("Exemplar CER Structure (pp. 13–14)", [
        el("div", { class: "cer-box" }, [
          el("p", {}, [el("span", { class: "cer-tag c", text: "CLAIM" }), " The universe is expanding."]),
          el("p", {}, [el("span", { class: "cer-tag e", text: "EVIDENCE" }), " Every galaxy has the same H & He absorption-line pattern shifted toward red, and more distant galaxies shift much more (+23 nm nearby → +124 nm very distant)."]),
          el("p", {}, [el("span", { class: "cer-tag r", text: "REASONING" }), " By the Doppler effect (Model 3), light from a receding source stretches to longer, redder wavelengths. Because every galaxy is moving away — and farther ones faster — space itself must be expanding."]),
        ]),
      ], { kicker: "Model scientific explanation" }),
    ]);
  }

  const body = el("div", { class: "tab-body fill" });
  const t = tabs(["🔭 1. Three Scenarios", "📈 2. Redshift Lab & Hubble's Law", "🗣️ 3. Revisit Day 1 Ideas & CER"], (i) => {
    body.replaceChildren(i === 0 ? buildScenarios() : i === 1 ? buildRedshiftHubble() : buildRevisit());
  });
  container.append(el("div", { class: "stack fill" }, [el("div", { class: "tab-bar" }, [t.root]), body]));
}
