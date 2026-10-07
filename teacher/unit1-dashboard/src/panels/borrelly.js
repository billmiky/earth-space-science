// panels/borrelly.js — Panel C: Earth vs. Comet 19P/Borrelly.

import { el, provenanceBar } from "../dom.js";
import { loadBorrellyElements } from "../adapters/borrelly.js";
import { keplerPropagate, cometOrbitPath, planetOrbitPath, planetHelioEcliptic } from "../astronomy.js";
import { fmt, dateToJulian, julianToDate } from "../units.js";

export const meta = { key: "borrelly", label: "C · Earth vs. Comet Borrelly" };

export function mount(container, ctx) {
  const root = el("div", { class: "panel borrelly-panel" });

  // Date control (synchronized between map and graph). The slider uses a
  // numeric day offset so it works reliably across browsers.
  const controls = el("div", { class: "panel-controls" });
  const startStr = "2018-01-01";
  const endStr = "2042-01-01";
  const midStr = "2026-06-01";
  const startJd = dateToJulian(new Date(startStr + "T12:00:00Z"));
  const endJd = dateToJulian(new Date(endStr + "T12:00:00Z"));
  const totalDays = Math.round(endJd - startJd);
  const midOffset = Math.round(dateToJulian(new Date(midStr + "T12:00:00Z")) - startJd);
  const dateInput = el("input", { type: "range", min: 0, max: totalDays, value: midOffset, class: "date-range", "aria-label": "Selected date" });
  const dateLabel = el("span", { class: "date-label", text: midStr });
  controls.appendChild(el("label", { class: "ctl wide" }, [el("span", { text: "Date (synced)" }), dateInput]));
  controls.appendChild(dateLabel);
  root.appendChild(controls);

  const mapWrap = el("div", { class: "svg-wrap" });
  root.appendChild(mapWrap);

  const graphWrap = el("div", { class: "chart-wrap graph-small" });
  const graphCanvas = el("canvas", { class: "chart-canvas", role: "img", "aria-label": "Comet Borrelly heliocentric distance versus time" });
  graphWrap.appendChild(graphCanvas);
  root.appendChild(graphWrap);

  const readout = el("div", { class: "ro-list" });
  root.appendChild(readout);

  const note = el("div", { class: "panel-note" });
  root.appendChild(note);

  container.appendChild(root);

  let elements = null;
  let metaInfo = null;
  let status = "loading";

  async function load() {
    const result = await loadBorrellyElements(ctx.store.state);
    elements = result.elements;
    metaInfo = result.meta;
    status = result.status;
    draw();
  }

  function offsetDateStr(offset) {
    return julianToDate(startJd + offset).toISOString().slice(0, 10);
  }

  function selectedJd() {
    return startJd + parseInt(dateInput.value, 10);
  }

  function draw() {
    dateLabel.textContent = offsetDateStr(parseInt(dateInput.value, 10));
    if (!elements) {
      mapWrap.innerHTML = "";
      graphCanvas.width = 2; graphCanvas.height = 2;
      readout.innerHTML = "";
      note.innerHTML = "";
      note.appendChild(el("div", { class: "status error", text: "Could not load Borrelly orbital elements." }));
      return;
    }
    drawMap();
    drawGraph();
    drawReadout();
    drawNote();
  }

  function drawMap() {
    const jd = selectedJd();
    const scale = 7.2;
    mapWrap.innerHTML = "";
    const svg = el("svg", {
      viewBox: `-${scale} -${scale} ${scale * 2} ${scale * 2}`,
      class: "orbit-svg",
      role: "img",
      "aria-label": "Top-down ecliptic projection of Earth and Comet Borrelly orbits",
    });

    for (let au = 1; au <= 7; au += 1) {
      svg.appendChild(el("circle", { cx: 0, cy: 0, r: au, class: "au-grid" }));
      svg.appendChild(el("text", { x: au, y: 0.16, class: "au-label", text: au + " AU" }));
    }
    svg.appendChild(el("circle", { cx: 0, cy: 0, r: 0.14, class: "sun-dot" }));
    svg.appendChild(el("text", { x: 0, y: -0.24, class: "sun-label", text: "Sun" }));

    // Earth orbit
    const earthPts = planetOrbitPath("earth", 240);
    const earthD = earthPts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(4) + " " + (-p.y).toFixed(4)).join(" ");
    svg.appendChild(el("path", { d: earthD, class: "orbit-path", style: "stroke:#38bdf8" }));

    // Borrelly orbit (ecliptic projection)
    const cometPts = cometOrbitPath(elements, 720);
    const cometD = cometPts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(4) + " " + (-p.y).toFixed(4)).join(" ");
    svg.appendChild(el("path", { d: cometD, class: "orbit-path comet", style: "stroke:#f472b6" }));

    // Position markers
    const earth = planetHelioEcliptic(jd, "earth");
    svg.appendChild(el("circle", { cx: earth.x, cy: -earth.y, r: 0.12, class: "planet-dot", style: "fill:#38bdf8" }));
    svg.appendChild(el("text", { x: earth.x + 0.18, y: -earth.y - 0.18, class: "planet-label", text: "Earth" }));

    const comet = keplerPropagate(elements, jd);
    svg.appendChild(el("circle", { cx: comet.x, cy: -comet.y, r: 0.12, class: "planet-dot", style: "fill:#f472b6" }));
    svg.appendChild(el("text", { x: comet.x + 0.18, y: -comet.y - 0.18, class: "planet-label", text: "19P/Borrelly" }));

    mapWrap.appendChild(svg);
  }

  function drawGraph() {
    const canvas = graphCanvas;
    const ctx2 = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 220;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2.clearRect(0, 0, w, h);

    const jd0 = startJd;
    const jd1 = endJd;
    const N = 365;
    const jdSel = selectedJd();

    const padL = 46, padR = 12, padT = 12, padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const rMax = elements.Q_au * 1.1 || 6.5;

    const xOf = (jd) => padL + ((jd - jd0) / (jd1 - jd0)) * plotW;
    const yOf = (r) => padT + (1 - r / rMax) * plotH;

    // y gridlines
    ctx2.strokeStyle = "rgba(148,163,184,0.2)";
    ctx2.fillStyle = "#94a3b8";
    ctx2.font = "600 11px system-ui, sans-serif";
    ctx2.textAlign = "right";
    for (let r = 1; r <= rMax; r += 1) {
      const y = yOf(r);
      ctx2.beginPath(); ctx2.moveTo(padL, y); ctx2.lineTo(padL + plotW, y); ctx2.stroke();
      ctx2.fillText(r + " AU", padL - 4, y + 4);
    }

    // Distance curve
    ctx2.beginPath();
    for (let i = 0; i <= N; i++) {
      const jd = jd0 + (i / N) * (jd1 - jd0);
      const p = keplerPropagate(elements, jd);
      const r = Math.hypot(p.x, p.y, p.z);
      const x = xOf(jd), y = yOf(r);
      if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
    }
    ctx2.strokeStyle = "#f472b6";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    // Perihelion / aphelion reference lines
    ctx2.setLineDash([4, 4]);
    ctx2.strokeStyle = "#fbbf24";
    ctx2.beginPath(); ctx2.moveTo(padL, yOf(elements.q_au)); ctx2.lineTo(padL + plotW, yOf(elements.q_au)); ctx2.stroke();
    ctx2.strokeStyle = "#fb923c";
    ctx2.beginPath(); ctx2.moveTo(padL, yOf(elements.Q_au)); ctx2.lineTo(padL + plotW, yOf(elements.Q_au)); ctx2.stroke();
    ctx2.setLineDash([]);

    // Selected date marker
    const pSel = keplerPropagate(elements, jdSel);
    const rSel = Math.hypot(pSel.x, pSel.y, pSel.z);
    ctx2.beginPath();
    ctx2.arc(xOf(jdSel), yOf(rSel), 6, 0, Math.PI * 2);
    ctx2.fillStyle = "#ffffff";
    ctx2.fill();
    ctx2.strokeStyle = "#f472b6";
    ctx2.lineWidth = 2;
    ctx2.stroke();

    // Axis labels
    ctx2.fillStyle = "#e2e8f0";
    ctx2.textAlign = "center";
    ctx2.fillText("Sun distance vs. time (AU)", padL + plotW / 2, 14);
    ctx2.fillText(offsetDateStr(parseInt(dateInput.value, 10)), xOf(jdSel), h - 8);
  }

  function drawReadout() {
    const jd = selectedJd();
    const p = keplerPropagate(elements, jd);
    const r = Math.hypot(p.x, p.y, p.z);
    const earth = planetHelioEcliptic(jd, "earth");
    const earthR = Math.hypot(earth.x, earth.y, earth.z);

    readout.innerHTML = "";
    const rows = [
      ["Borrelly Sun distance (selected date)", fmt(r, 4) + " AU"],
      ["Earth Sun distance (selected date)", fmt(earthR, 4) + " AU"],
      ["Perihelion (closest to Sun)", fmt(elements.q_au, 3) + " AU"],
      ["Aphelion (farthest from Sun)", fmt(elements.Q_au, 3) + " AU"],
      ["Orbital period", fmt(elements.period_days || 2500, 4) + " days (~" + fmt((elements.period_days || 2500) / 365.25, 2) + " yr)"],
    ];
    for (const [k, v] of rows) {
      readout.appendChild(el("div", { class: "ro-row" }, [
        el("span", { text: k }), el("b", { text: v }),
      ]));
    }
  }

  function drawNote() {
    note.innerHTML = "";
    if (metaInfo) {
      note.appendChild(provenanceBar({
        source: metaInfo.source,
        dataType: "Calculated (two-body Keplerian)",
        retrieved: metaInfo.retrievedAt,
        units: "AU",
        status: status,
        statusLabel: status === "fresh" ? "Osculating elements (" + (metaInfo.solutionDate || "JPL") + ")" : status,
      }));
    }
    note.appendChild(el("p", { class: "panel-note-text", html:
      "<strong>Instructional note:</strong> Borrelly periodically releases vaporized water and dust as it nears the Sun. " +
      "This dashboard shows the <em>orbit</em> that drives that cycle — it does <strong>not</strong> directly measure water release, " +
      "and Earth's distance from the Sun does <strong>not</strong> cause Earth's seasons. Positions are calculated predictions, not live telescope observations." }));
  }

  dateInput.addEventListener("input", () => {
    dateLabel.textContent = offsetDateStr(parseInt(dateInput.value, 10));
    draw();
  });

  load();

  return {
    destroy() { /* no timers */ },
  };
}
