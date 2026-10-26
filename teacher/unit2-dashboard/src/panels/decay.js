// panels/decay.js — Explore 1, Part 1: radioactive decay, half-life, and "which clock?".

import { el, svg, chips, tabs } from "../dom.js";
import { ISOTOPES, isotopeByKey, remainingPct, fmtYears, shuffledRanks, atomsLeft, DATING_OBJECTS, canDate, usableIsotopes } from "../science.js";
import { linear, log10Scale, powersOfTen, siLabel, chartRoot, text } from "../chart.js";
import { card, layout, stat, bullets, packetTask } from "../ui.js";

const COLS = 16, ROWS = 10, N = COLS * ROWS;
const LAB_ISOTOPES = ["c14", "u238", "k40", "u235"];

export function mount(container) {
  let timer = null;
  const body = el("div", { class: "tab-body" });
  const t = tabs(["⚛ Half-life lab", "🕰 Which clock?"], (i) => { stopPlay(); body.replaceChildren(i === 0 ? lab() : clocks()); });
  const bar = el("div", { class: "tab-bar" }, [t.root]);
  container.appendChild(el("div", { class: "stack" }, [bar, body]));

  function stopPlay() { if (timer) { clearInterval(timer); timer = null; } }

  function lab() {
    let iso = isotopeByKey("c14");
    let n = 0;
    const ranks = shuffledRanks(N, 11);
    const atoms = [];
    const gridSvg = svg("svg", { viewBox: "0 0 640 400", class: "atom-grid", role: "img", "aria-label": "Grid of 160 atoms: blue parent atoms and orange daughter atoms" });
    const cw = 640 / COLS, ch = 400 / ROWS;
    for (let i = 0; i < N; i++) {
      const c = svg("circle", { cx: (i % COLS) * cw + cw / 2, cy: Math.floor(i / COLS) * ch + ch / 2, r: Math.min(cw, ch) * 0.34, class: "atom parent" });
      atoms.push(c); gridSvg.appendChild(c);
    }
    const curveHost = el("div", { class: "chart-host short" });
    const tableHost = el("div", { class: "table-host" });
    const sNum = stat("Half-lives passed", "0");
    const sPct = stat("Parent atoms left", "100%", { tone: "blue" });
    const sAge = stat("Time elapsed", "0 years");
    const sAtoms = el("div", { class: "atom-legend" }, [
      el("span", { class: "dot parent" }), " parent ", el("b", { class: "cnt-p", text: String(N) }),
      el("span", { class: "dot daughter" }), " daughter ", el("b", { class: "cnt-d", text: "0" }),
    ]);

    const slider = el("input", { type: "range", min: 0, max: 5, step: 0.05, value: 0, "aria-label": "Half-lives passed", oninput: () => setN(parseFloat(slider.value)) });
    const isoChips = chips(LAB_ISOTOPES.map((k) => ({ label: isotopeByKey(k).name, value: k })), "c14", (k) => { iso = isotopeByKey(k); setN(n, true); }, { label: "Isotope" });
    const stepBtns = [0, 1, 2, 3].map((k) => el("button", { class: "tool-btn", type: "button", text: `${k}`, "aria-label": `${k} half-lives`, onclick: () => setN(k) }));
    const playBtn = el("button", { class: "tool-btn primary", type: "button", text: "▶ Play", onclick: () => {
      if (timer) { stopPlay(); playBtn.textContent = "▶ Play"; return; }
      if (n >= 5) setN(0);
      playBtn.textContent = "⏸ Pause";
      timer = setInterval(() => { if (n >= 5) { stopPlay(); playBtn.textContent = "▶ Play"; return; } setN(Math.min(5, n + 0.05)); }, 70);
    } });

    function drawCurve() {
      const W = 520, H = 250, ml = 52, mr = 14, mt = 14, mb = 56;
      const x = linear([0, 5], [ml, W - mr]), y = linear([0, 100], [H - mb, mt]);
      const r = chartRoot(W, H, "Decay curve: percent of parent left versus half-lives");
      for (const v of [0, 25, 50, 75, 100]) {
        r.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
        r.appendChild(text(ml - 8, y(v) + 5, `${v}%`, { class: "tick", "text-anchor": "end" }));
      }
      for (let k = 0; k <= 5; k++) r.appendChild(text(x(k), H - mb + 22, String(k), { class: "tick", "text-anchor": "middle" }));
      r.appendChild(text((ml + W - mr) / 2, H - 6, "Half-lives passed →", { class: "axis-label", "text-anchor": "middle" }));
      let d = "";
      for (let k = 0; k <= 5.001; k += 0.05) d += `${k === 0 ? "M" : "L"}${x(k).toFixed(1)},${y(remainingPct(k)).toFixed(1)} `;
      r.appendChild(svg("path", { d, class: "curve" }));
      r.appendChild(svg("line", { x1: x(n), x2: x(n), y1: y(0), y2: y(remainingPct(n)), class: "guide" }));
      r.appendChild(svg("line", { x1: x(0), x2: x(n), y1: y(remainingPct(n)), y2: y(remainingPct(n)), class: "guide" }));
      r.appendChild(svg("circle", { cx: x(n), cy: y(remainingPct(n)), r: 8, class: "marker" }));
      curveHost.replaceChildren(r);
    }

    function drawTable() {
      const rows = [0, 1, 2, 3].map((k) => {
        const active = Math.abs(n - k) < 0.025;
        return el("tr", { class: active ? "active" : "" }, [
          el("td", { text: String(k) }),
          el("td", { text: `${remainingPct(k)}%`.replace(/(\.\d)0*%/, "$1%") }),
          el("td", { text: k === 0 ? "0" : fmtYears(k * iso.halfLife) }),
        ]);
      });
      tableHost.replaceChildren(el("table", { class: "data" }, [
        el("thead", {}, [el("tr", {}, [el("th", { text: "Half-lives" }), el("th", { text: `${iso.name} left` }), el("th", { text: "Years" })])]),
        el("tbody", {}, rows),
      ]));
    }

    function setN(v, force) {
      n = Math.round(v * 100) / 100;
      slider.value = n;
      const left = atomsLeft(N, n);
      atoms.forEach((a, i) => a.setAttribute("class", `atom ${ranks[i] < left ? "parent" : "daughter"}`));
      sNum.setValue(Number.isInteger(n) ? String(n) : n.toFixed(2));
      sPct.setValue(`${remainingPct(n).toFixed(remainingPct(n) >= 10 ? 1 : 2).replace(/\.0$/, "")}%`);
      sAge.setValue(n === 0 ? "0 years" : fmtYears(n * iso.halfLife));
      sAtoms.querySelector(".cnt-p").textContent = String(left);
      sAtoms.querySelector(".cnt-d").textContent = String(N - left);
      drawCurve(); drawTable();
      void force;
    }

    const root = layout("lab-grid", [
      el("div", { class: "col" }, [
        card(null, [
          gridSvg, sAtoms,
          el("div", { class: "controls" }, [
            el("label", { class: "ctl wide" }, [el("span", { text: "Half-lives passed" }), slider]),
            el("div", { class: "row" }, [el("span", { class: "ctl-label", text: "Jump to" }), ...stepBtns, playBtn]),
            isoChips.root,
          ]),
        ]),
        packetTask("Part 1a Decay Rates + Part 1b Dating Game", [
          "Add C-14, then U-238 nuclei. What do the two colors of dots represent? Find each half-life.",
          "<b>See–Think–Wonder:</b> Was the speed of change always the same? How is each isotope stable and not stable?",
        ]),
      ]),
      el("div", { class: "col" }, [
        el("div", { class: "stat-row" }, [sNum, sPct, sAge]),
        card("Percent of parent left", [curveHost]),
        card("Table 1 / Table 2", [tableHost]),
        card("Stable and unstable at the same time", [bullets([
          "Each <b>atom</b> is unstable: you cannot predict when one will decay.",
          "The <b>rate</b> is steady: 50% → 25% → 12.5%. Heat, pressure, and chemistry do not change it.",
        ])], { cls: "key-idea" }),
      ]),
    ]);
    setN(0);
    const wrap = el("div", { class: "fill" }, [root]);
    return wrap;
  }

  function clocks() {
    let obj = DATING_OBJECTS[0];
    const host = el("div", { class: "chart-host tall" });
    const result = el("p", { class: "result" });
    const objChips = chips(DATING_OBJECTS.map((o, i) => ({ label: o.name, value: i })), 0, (i) => { obj = DATING_OBJECTS[i]; draw(); }, { label: "Object to date" });
    function draw() {
      const W = 900, H = 350, ml = 150, mr = 20, mt = 16, mb = 58;
      const dom = [50, 1e10];
      const x = log10Scale(dom, [ml, W - mr]);
      const r = chartRoot(W, H, "Useful dating range of each isotope on a log scale");
      for (const p of powersOfTen(dom[0], dom[1])) {
        r.appendChild(svg("line", { x1: x(p), x2: x(p), y1: mt, y2: H - mb, class: "grid" }));
        r.appendChild(text(x(p), H - mb + 22, siLabel(p), { class: "tick", "text-anchor": "middle" }));
      }
      r.appendChild(text((ml + W - mr) / 2, H - 6, "Age of the object (years) →", { class: "axis-label", "text-anchor": "middle" }));
      const rowH = (H - mt - mb) / ISOTOPES.length;
      ISOTOPES.forEach((iso, i) => {
        const ok = canDate(iso, obj);
        const y = mt + i * rowH + rowH * 0.15;
        r.appendChild(svg("rect", { x: x(Math.max(iso.min, dom[0])), y, width: x(iso.max) - x(Math.max(iso.min, dom[0])), height: rowH * 0.7, rx: 5, class: `range ${ok ? "ok" : "no"}` }));
        r.appendChild(text(ml - 10, y + rowH * 0.46, iso.name, { class: "row-label sm", "text-anchor": "end" }));
        r.appendChild(text(x(iso.min) + 8, y + rowH * 0.46, ok ? "✔ can date this" : iso.organic !== obj.organic ? "✖ wrong material" : "✖ wrong age", { class: "range-label" }));
      });
      r.appendChild(svg("line", { x1: x(obj.age), x2: x(obj.age), y1: mt, y2: H - mb, class: "age-line" }));
      host.replaceChildren(r);
      const use = usableIsotopes(obj).map((i) => i.name);
      result.innerHTML = `<b>${obj.name}</b> (${obj.note}). Usable clocks: <b class="good">${use.join(", ") || "none"}</b>. ` +
        (obj.organic ? "It is <b>organic</b> (once alive), so use <b>carbon-14</b>." : "It is far too old for carbon-14 (and not organic), so use a slow isotope like <b>uranium-238</b>.");
    }
    draw();
    const table = el("table", { class: "data compact" }, [
      el("thead", {}, [el("tr", {}, ["Parent", "Daughter", "Half-life", "Useful dating range", "Datable materials"].map((h) => el("th", { text: h })))]),
      el("tbody", {}, ISOTOPES.slice().reverse().map((i) => el("tr", {}, [
        i.name, i.daughter, fmtYears(i.halfLife), `${fmtYears(i.min)} – ${fmtYears(i.max)}`, i.materials,
      ].map((c) => el("td", { text: c }))))),
    ]);
    return el("div", { class: "fill" }, [layout("clock-grid", [
      el("div", { class: "col" }, [
        card("Pick an object to date", [objChips.root, host, result]),
      ]),
      el("div", { class: "col" }, [card("Packet table: radioactive elements used for dating", [table])]),
    ])]);
  }

  const cleanupTimer = () => stopPlay();
  return cleanupTimer;
}
