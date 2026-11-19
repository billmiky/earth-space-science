// timechart.js — A line chart you can travel through: slider, drag on the chart, or play.
// Used for both packet oxygen graphs. Time runs oldest (left) → today (right).

import { el, svg } from "./dom.js";
import { linear, chartRoot, text } from "./chart.js";
import { interp } from "./science.js";

/**
 * cfg: { title, aria, series:[{t,y,lo?,hi?}], xDomain:[old,new], yDomain:[0,max], ticksX:[], ticksY:[],
 *        xLabel, yLabel, fmtT(t), fmtY(v), start, playSeconds, bands?:[{x1,x2,label,cls}],
 *        overlay?(g, {x,y,H,mt,mb,state}), readout(t, v, lo, hi, state) → html, state:{} }
 * Returns { root, redraw(), destroy() }.
 */
export function timeChart(cfg) {
  const W = 900, H = 420, ml = 64, mr = 24, mt = 56, mb = 54;
  const x = linear(cfg.xDomain, [ml, W - mr]), y = linear(cfg.yDomain, [H - mb, mt]);
  let t = cfg.start, raf = null, last = 0;
  const host = el("div", { class: "chart-host" });
  const readout = el("div", { class: "readout o2-read" });
  const span = cfg.xDomain[0] - cfg.xDomain[1];
  const slider = el("input", { type: "range", min: "0", max: "1000", step: "1", "aria-label": `Travel through time: ${cfg.xLabel}` });
  slider.addEventListener("input", () => { stop(); setT(cfg.xDomain[0] - (slider.value / 1000) * span); });
  const playBtn = el("button", { class: "tool-btn primary", type: "button", text: "▶ Play through time", onclick: () => (raf ? stop() : play()) });

  const r = chartRoot(W, H, cfg.aria);
  const gStatic = svg("g", {}), gCursor = svg("g", { class: "cursor" });
  r.append(gStatic, gCursor);
  host.appendChild(r);

  function drawStatic() {
    gStatic.replaceChildren();
    r.querySelector("title")?.remove();
    gStatic.appendChild(text(10, 20, cfg.title, { class: "chart-title" }));
    for (const b of cfg.bands || []) {
      gStatic.appendChild(svg("rect", { x: x(b.x1), width: x(b.x2) - x(b.x1), y: mt, height: H - mb - mt, class: `stage-band ${b.cls || ""}` }));
      if (b.label) gStatic.appendChild(text((x(b.x1) + x(b.x2)) / 2, mt + 20, b.label, { class: "band-label", "text-anchor": "middle" }));
    }
    for (const v of cfg.ticksY) {
      gStatic.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(v), y2: y(v), class: "grid" }));
      gStatic.appendChild(text(ml - 8, y(v) + 5, String(v), { class: "tick", "text-anchor": "end" }));
    }
    for (const v of cfg.ticksX) {
      gStatic.appendChild(svg("line", { x1: x(v), x2: x(v), y1: H - mb, y2: H - mb + 6, class: "axis" }));
      gStatic.appendChild(text(x(v), H - mb + 24, v === 0 ? "today" : String(v), { class: "tick", "text-anchor": v === 0 ? "end" : "middle" }));
    }
    gStatic.appendChild(text((ml + W - mr) / 2, H - 6, cfg.xLabel, { class: "axis-label", "text-anchor": "middle" }));
    gStatic.appendChild(text(10, mt - 14, cfg.yLabel, { class: "axis-label" }));
    if (cfg.series[0].lo !== undefined) {
      const up = cfg.series.map((d) => `${x(d.t).toFixed(1)},${y(d.hi).toFixed(1)}`);
      const dn = [...cfg.series].reverse().map((d) => `${x(d.t).toFixed(1)},${y(d.lo).toFixed(1)}`);
      gStatic.appendChild(svg("path", { d: `M${up.join("L")}L${dn.join("L")}Z`, class: "unc-band" }));
    }
    gStatic.appendChild(svg("line", { x1: ml, x2: W - mr, y1: y(21), y2: y(21), class: "today-line" }));
    gStatic.appendChild(text(ml + 6, y(21) - 6, "21% (today)", { class: "today-label" }));
    gStatic.appendChild(svg("path", { d: `M${cfg.series.map((d) => `${x(d.t).toFixed(1)},${y(d.y).toFixed(1)}`).join("L")}`, class: "o2-line" }));
    if (cfg.overlay) cfg.overlay(gStatic, { x, y, H, W, mt, mb, ml, mr, state: cfg.state });
  }

  function place() {
    const v = interp(cfg.series, t), lo = interp(cfg.series, t, "lo"), hi = interp(cfg.series, t, "hi");
    const px = x(t), py = y(v);
    gCursor.replaceChildren(
      svg("line", { x1: px, x2: px, y1: mt, y2: H - mb, class: "cursor-line" }),
      svg("circle", { cx: px, cy: py, r: 9, class: "marker" }),
      text(px + (px < W * 0.7 ? 12 : -12), Math.max(mt + 38, py - 14), cfg.fmtY(v), { class: "bar-value sm", "text-anchor": px < W * 0.7 ? "start" : "end" }),
    );
    slider.value = String(Math.round(((cfg.xDomain[0] - t) / span) * 1000));
    slider.setAttribute("aria-valuetext", `${cfg.fmtT(t)}, oxygen ${cfg.fmtY(v)}`);
    readout.innerHTML = cfg.readout(t, v, lo, hi, cfg.state);
  }
  function setT(v) { t = Math.max(cfg.xDomain[1], Math.min(cfg.xDomain[0], v)); place(); }

  // drag / tap on the chart
  function fromEvent(e) {
    const pt = r.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = r.getScreenCTM(); if (!m) return;
    setT(x.invert(pt.matrixTransform(m.inverse()).x));
  }
  let dragging = false;
  r.addEventListener("pointerdown", (e) => { stop(); dragging = true; r.setPointerCapture?.(e.pointerId); fromEvent(e); });
  r.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  r.addEventListener("pointerup", () => { dragging = false; });
  r.addEventListener("pointercancel", () => { dragging = false; });
  r.style.touchAction = "pan-y";
  r.style.cursor = "ew-resize";

  function frame(ts) {
    const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    setT(t - (span * dt) / (cfg.playSeconds || 16));
    if (t <= cfg.xDomain[1]) { stop(); return; }
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (t <= cfg.xDomain[1] + 1e-9) t = cfg.xDomain[0];
    playBtn.textContent = "⏸ Pause"; last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; playBtn.textContent = "▶ Play through time"; }

  drawStatic(); place();
  const root = el("div", { class: "timechart" }, [host, el("div", { class: "row" }, [playBtn, el("label", { class: "ctl grow" }, [slider])]), readout]);
  return { root, redraw() { drawStatic(); place(); }, setT, destroy: stop };
}
