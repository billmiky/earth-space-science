// panels/chalk.js — Explore 2: chemical weathering lab (chalk in water vs. vinegar), with class data.

import { el, svg } from "../dom.js";
import { massChange, mean } from "../science.js";
import { linear, niceTicks, chartRoot, text } from "../chart.js";
import { card, layout, bullets, packetTask } from "../ui.js";

const MAX_GROUPS = 8;
const COLORS = { Water: "#4aa3ff", Vinegar: "#ff9f43" };

export function mount(container) {
  const groups = [{ w0: 5.20, w1: 5.23, v0: 5.18, v1: 4.87 }];
  const tableHost = el("div", { class: "table-host" });
  const chartHost = el("div", { class: "chart-host" });
  const summary = el("p", { class: "result" });

  function cell(i, key) {
    const input = el("input", {
      type: "number", step: "0.01", inputmode: "decimal", value: Number.isFinite(groups[i][key]) ? groups[i][key] : "", "aria-label": `Group ${i + 1} ${key}`,
      oninput: () => { groups[i][key] = input.value === "" ? NaN : parseFloat(input.value); updateComputed(); },
    });
    return el("td", {}, [input]);
  }
  const computed = [];
  function drawTable() {
    computed.length = 0;
    const rows = groups.map((g, i) => {
      const cw = el("td", { class: "calc" }), cv = el("td", { class: "calc" });
      computed.push({ cw, cv });
      return el("tr", {}, [
        el("td", { class: "grp", text: `Group ${i + 1}` }),
        cell(i, "w0"), cell(i, "w1"), cw, cell(i, "v0"), cell(i, "v1"), cv,
        el("td", {}, [groups.length > 1 ? el("button", { class: "icon-btn", type: "button", "aria-label": `Remove group ${i + 1}`, text: "✕", onclick: () => { groups.splice(i, 1); drawTable(); } }) : null]),
      ]);
    });
    tableHost.replaceChildren(el("table", { class: "data input-table" }, [
      el("thead", {}, [
        el("tr", {}, [el("th", { rowspan: 2, text: "" }), el("th", { colspan: 3, class: "water", text: "Water (g)" }), el("th", { colspan: 3, class: "vinegar", text: "Vinegar (g)" }), el("th", { rowspan: 2 })]),
        el("tr", {}, ["Initial", "After 5 min", "Change", "Initial", "After 5 min", "Change"].map((h) => el("th", { text: h }))),
      ]),
      el("tbody", {}, rows),
    ]));
    updateComputed();
  }

  function updateComputed() {
    const wc = [], vc = [];
    groups.forEach((g, i) => {
      const w = massChange(g.w0, g.w1), v = massChange(g.v0, g.v1);
      const fmt = (m) => (Number.isFinite(m.change) ? `${m.change >= 0 ? "+" : ""}${m.change.toFixed(2)}` : "—");
      computed[i].cw.textContent = fmt(w); computed[i].cv.textContent = fmt(v);
      computed[i].cw.className = `calc ${w.change < 0 ? "neg" : ""}`; computed[i].cv.className = `calc ${v.change < 0 ? "neg" : ""}`;
      if (Number.isFinite(w.change)) wc.push(w.change);
      if (Number.isFinite(v.change)) vc.push(v.change);
    });
    drawChart(wc, vc);
  }

  function drawChart(wc, vc) {
    const W = 700, H = 300, ml = 110, mr = 30, mt = 34, mb = 58;
    const rows = [{ name: "Water", vals: wc }, { name: "Vinegar", vals: vc }];
    const all = [...wc, ...vc];
    const lim = Math.max(0.1, ...all.map(Math.abs)) * 1.35;
    const x = linear([-lim, lim], [ml, W - mr]);
    const r = chartRoot(W, H, "Mean change in chalk mass for water and vinegar");
    r.appendChild(text(ml, 20, "Change in chalk mass after 5 minutes (g)", { class: "chart-title" }));
    for (const v of niceTicks(-lim, lim, 6)) {
      r.appendChild(svg("line", { x1: x(v), x2: x(v), y1: mt, y2: H - mb, class: v === 0 ? "axis" : "grid" }));
      r.appendChild(text(x(v), H - mb + 22, String(Math.abs(v) < 1e-9 ? 0 : Number(v.toFixed(2))), { class: "tick", "text-anchor": "middle" }));
    }
    r.appendChild(text((ml + W - mr) / 2, H - 6, "← chalk lost mass · chalk gained mass →", { class: "axis-label", "text-anchor": "middle" }));
    const rowH = (H - mt - mb) / 2;
    rows.forEach((row, i) => {
      const m = mean(row.vals);
      const y = mt + i * rowH + rowH * 0.18;
      r.appendChild(text(ml - 12, y + rowH * 0.36, row.name, { class: "row-label", "text-anchor": "end" }));
      if (Number.isFinite(m)) {
        r.appendChild(svg("rect", { x: Math.min(x(0), x(m)), y, width: Math.max(2, Math.abs(x(m) - x(0))), height: rowH * 0.6, rx: 6, fill: COLORS[row.name], class: "bar" }));
        const label = `${m >= 0 ? "+" : ""}${m.toFixed(2)} g`;
        r.appendChild(text(m < 0 ? x(m) + 12 : x(m) + 12, y + rowH * 0.38, label, { class: `bar-value ${m < 0 ? "dark" : ""}`, "text-anchor": "start" }));
        row.vals.forEach((v) => r.appendChild(svg("circle", { cx: x(v), cy: y + rowH * 0.3, r: 6, class: "trial" })));
      }
    });
    chartHost.replaceChildren(r);
    const mw = mean(wc), mv = mean(vc);
    summary.innerHTML = Number.isFinite(mw) && Number.isFinite(mv)
      ? `Class mean: water <b>${mw >= 0 ? "+" : ""}${mw.toFixed(2)} g</b> · vinegar <b class="${mv < 0 ? "bad" : ""}">${mv >= 0 ? "+" : ""}${mv.toFixed(2)} g</b>. ${mv < mw ? "Acid took away far more chalk." : ""}`
      : "Enter all four masses for at least one group.";
  }

  const root = layout("two-col chalk", [
    el("div", { class: "col grow" }, [
      card("Class data", [
        tableHost,
        el("div", { class: "row" }, [
          el("button", { class: "tool-btn", type: "button", text: "＋ Add group", onclick: () => { if (groups.length < MAX_GROUPS) { groups.push({ w0: NaN, w1: NaN, v0: NaN, v1: NaN }); drawTable(); } } }),
          el("button", { class: "tool-btn", type: "button", text: "Clear all", onclick: () => { groups.length = 0; groups.push({ w0: NaN, w1: NaN, v0: NaN, v1: NaN }); drawTable(); } }),
        ]),
      ]),
      card("Results", [chartHost, summary]),
    ]),
    el("div", { class: "col narrow" }, [
      card("The reaction", [
        el("div", { class: "equation" }, [
          el("span", { html: "CaCO₃" }), el("small", { text: "chalk" }), el("span", { class: "op", text: "+" }),
          el("span", { html: "2 CH₃COOH" }), el("small", { text: "vinegar" }), el("span", { class: "op", text: "→" }),
          el("span", { html: "Ca(CH₃COO)₂" }), el("small", { text: "dissolves" }), el("span", { class: "op", text: "+" }),
          el("span", { html: "H₂O" }), el("span", { class: "op", text: "+" }),
          el("span", { class: "gas", html: "CO₂" }), el("small", { text: "the bubbles" }),
        ]),
        bullets([
          "Acids break down calcium carbonate: the chalk <b>loses mass</b>.",
          "Chalk, limestone, and marble are all calcium carbonate.",
          "<b>Chemical weathering:</b> a reaction (often with water) breaks down rock.",
        ]),
      ], { cls: "key-idea" }),
      packetTask("Part 1. Chemical Weathering", [
        "State the <b>independent</b> and <b>dependent</b> variables; write a prediction.",
        "Fill in the data table; analyze the relationship.",
        "How would <b>acidified rain</b> affect rock formations over time?",
      ]),
    ]),
  ]);
  container.appendChild(root);
  drawTable();
}
