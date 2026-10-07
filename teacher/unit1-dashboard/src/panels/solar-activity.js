// panels/solar-activity.js — Panel A: Solar Activity Now (NOAA GOES X-rays).

import { el, provenanceBar } from "../dom.js";
import { loadGoesXrays, seriesPeak, seriesLatest } from "../adapters/noaa-goes.js";
import { FLARE_BANDS, flareClass } from "../models.js";
import { CONFIG } from "../config.js";
import { fmt, fmtTime } from "../units.js";

export const meta = { key: "solar", label: "A · Solar Activity Now" };

export function mount(container, ctx) {
  const { store } = ctx;

  const root = el("div", { class: "panel solar-panel" });

  const readout = el("div", { class: "readouts", role: "group", "aria-label": "Latest solar X-ray flux" });
  root.appendChild(readout);

  const controls = el("div", { class: "panel-controls" });
  const spanBtn24 = el("button", { class: "chip active", text: "24 hours", onclick: () => setSpan("day") });
  const spanBtn72 = el("button", { class: "chip", text: "~72 hours", onclick: () => setSpan("threeDay") });
  controls.appendChild(spanBtn24);
  controls.appendChild(spanBtn72);
  root.appendChild(controls);

  const canvasWrap = el("div", { class: "chart-wrap" });
  const canvas = el("canvas", { class: "chart-canvas", role: "img", "aria-label": "GOES solar X-ray flux (log scale) versus time, with flare-class bands A through X" });
  canvasWrap.appendChild(canvas);
  root.appendChild(canvasWrap);

  const legend = el("div", { class: "flare-legend", role: "list", "aria-label": "Flare class reference bands" });
  root.appendChild(legend);

  const statusBox = el("div", { class: "status-box" });
  root.appendChild(statusBox);

  container.appendChild(root);

  let span = "day";
  let series = [];
  let timer = null;
  let destroyed = false;
  let lastFetchedAt = null;
  let lastStatus = null;

  function setSpan(next) {
    span = next;
    spanBtn24.classList.toggle("active", span === "day");
    spanBtn72.classList.toggle("active", span === "threeDay");
    load();
  }

  async function load() {
    if (destroyed) return;
    statusBox.innerHTML = "";
    statusBox.appendChild(el("div", { class: "status loading", text: "Loading NOAA GOES X-ray data…" }));
    const result = await loadGoesXrays(span);
    if (destroyed) return;
    series = result.series;
    lastFetchedAt = result.fetchedAt;
    lastStatus = result.status;
    draw();
  }

  function draw() {
    // Readouts
    const latest = seriesLatest(series);
    const peak = seriesPeak(series);
    const cls = latest ? flareClass(latest.flux) : null;

    readout.innerHTML = "";
    if (!latest) {
      readout.appendChild(el("div", { class: "readout", text: "No data available" }));
    } else {
      readout.appendChild(el("div", { class: "readout main" }, [
        el("span", { class: "ro-label", text: "Latest X-ray flux" }),
        el("span", { class: "ro-value", text: (latest.flux * 1e6).toFixed(3) + " ×10⁻⁶ W/m²" }),
        el("span", { class: "ro-sub", text: cls ? "Flare class " + cls : "Below A-class" }),
      ]));
      readout.appendChild(el("div", { class: "readout" }, [
        el("span", { class: "ro-label", text: "Observed" }),
        el("span", { class: "ro-value", text: fmtTime(latest.timeMs) }),
      ]));
      readout.appendChild(el("div", { class: "readout" }, [
        el("span", { class: "ro-label", text: "Peak in window" }),
        el("span", { class: "ro-value", text: (peak.value * 1e6).toFixed(3) + " ×10⁻⁶ W/m²" }),
        el("span", { class: "ro-sub", text: fmtTime(peak.timeMs) }),
      ]));
      readout.appendChild(el("div", { class: "readout" }, [
        el("span", { class: "ro-label", text: "Satellite" }),
        el("span", { class: "ro-value", text: "GOES-" + latest.satellite }),
      ]));
    }

    drawChart(canvas, series);
    drawLegend(legend);
    drawStatus();
  }

  function drawStatus() {
    statusBox.innerHTML = "";
    if (lastStatus === "error") {
      statusBox.appendChild(el("div", { class: "status error", text: "Could not load NOAA data. Showing nothing (no cached copy available)." }));
    } else if (lastStatus === "stale") {
      statusBox.appendChild(el("div", { class: "status stale", text: "Showing the last successfully retrieved NOAA data (live fetch failed)." }));
    } else if (lastStatus === "fresh") {
      statusBox.appendChild(provenanceBar({
        source: "NOAA SWPC · GOES X-ray flux",
        dataType: "Observed (0.1–0.8 nm channel)",
        retrieved: fmtTime(lastFetchedAt),
        units: "W/m² (log scale)",
        status: "fresh",
        statusLabel: "Live · refresh every 5 min",
      }));
    }
  }

  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (!store.state.frozen) load();
    }, CONFIG.noaaXrays.refreshMs);
  }

  function onStore() {
    if (!store.state.frozen) {
      // resume refreshes
    }
    schedule();
  }

  const offStore = store.on("change", onStore);
  schedule();
  load();

  return {
    destroy() {
      destroyed = true;
      offStore();
      if (timer) clearInterval(timer);
    },
  };
}

function drawChart(canvas, series) {
  const ctx = canvas.getContext("2d");
  if (!series || series.length === 0) {
    // Empty state
    canvas.width = 2; canvas.height = 2;
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600;
  const h = canvas.clientHeight || 320;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const padL = 66, padR = 14, padT = 14, padB = 44;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Y range in log10 space, covering A through X.
  const yMin = Math.log10(1e-8);
  const yMax = Math.log10(3e-4);
  const t0 = series[0].timeMs;
  const t1 = series[series.length - 1].timeMs;

  const xOf = (t) => padL + ((t - t0) / Math.max(1, t1 - t0)) * plotW;
  const yOf = (logV) => padT + (1 - (logV - yMin) / (yMax - yMin)) * plotH;

  // Flare class bands
  for (const band of FLARE_BANDS) {
    const yTop = yOf(Math.log10(band.max));
    const yBot = yOf(Math.log10(band.min));
    ctx.fillStyle = band.color + "22";
    ctx.fillRect(padL, yTop, plotW, yBot - yTop);
    ctx.strokeStyle = band.color + "55";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, yTop);
    ctx.lineTo(padL + plotW, yTop);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = band.color;
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(band.label, padL + 4, yTop + 14);
  }

  // Grid + axis ticks (log decades)
  ctx.strokeStyle = "rgba(148,163,184,0.25)";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 12px system-ui, sans-serif";
  ctx.textAlign = "right";
  for (let exp = -8; exp <= -4; exp++) {
    const y = yOf(exp * Math.LN10);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    ctx.fillText("1e" + exp, padL - 6, y + 4);
  }

  // Time axis labels (start / middle / end)
  ctx.textAlign = "center";
  const tLabels = [[t0, "start"], [(t0 + t1) / 2, "mid"], [t1, "end"]];
  for (const [t, kind] of tLabels) {
    const x = xOf(t);
    ctx.fillText(fmtTime(t).slice(5, 16), x, h - padB + 18);
  }

  // Flux line
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const x = xOf(series[i].timeMs);
    const y = yOf(Math.log10(Math.max(series[i].flux, 1e-10)));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#fde047";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(16, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("X-ray flux (W/m², log)", 0, 0);
  ctx.restore();
  ctx.fillText("Time (UTC)", padL + plotW / 2, h - 6);
}

function drawLegend(legend) {
  legend.innerHTML = "";
  for (const band of FLARE_BANDS) {
    legend.appendChild(el("span", { class: "legend-item" }, [
      el("span", { class: "legend-swatch", style: `background:${band.color}` }),
      el("span", { text: band.cls + " " + band.label }),
    ]));
  }
  legend.appendChild(el("span", { class: "legend-note", text: "Bands are reference levels for the 0.1–0.8 nm channel" }));
}
