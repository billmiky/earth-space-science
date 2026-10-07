// panels/host-star.js — Panel E: Meet the Host Star (H–R diagram).

import { el, provenanceBar } from "../dom.js";
import { loadExoplanetCatalog } from "../adapters/exoplanet-catalog.js";
import { missing, derivedLuminosity } from "../models.js";
import { fmt } from "../units.js";
import { metricCard, markUpdated } from "../panel-ui.js";

export const meta = { key: "host-star", label: "E · Meet the Host Star" };

export function mount(container, ctx) {
  const { store } = ctx;
  const root = el("div", { class: "panel host-star-panel" });

  const title = el("div", { class: "host-title" });
  root.appendChild(title);

  const svgWrap = el("div", { class: "svg-wrap hr-wrap" });
  root.appendChild(svgWrap);

  const sizeWrap = el("div", { class: "size-compare", role: "group", "aria-label": "Star size comparison, scaled by catalog radius" });
  root.appendChild(sizeWrap);

  const metricCards = el("div", { class: "metric-cards" });
  root.appendChild(metricCards);

  const provenance = el("div", { class: "prov-wrap" });
  root.appendChild(provenance);

  container.appendChild(root);

  let planets = [];
  let metaInfo = null;
  let refStars = [];
  let status = "loading";
  let lastRadius = null;

  async function load() {
    try {
      const cat = await loadExoplanetCatalog(store.state);
      planets = cat.planets;
      metaInfo = cat.meta;
      status = cat.status;
    } catch {
      /* handled below */
    }
    try {
      const res = await fetch("../unit1-dashboard/data/reference-stars.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      refStars = (await res.json()).stars || [];
    } catch {
      refStars = [];
    }
    draw();
  }

  function selectedPlanet() {
    return planets.find((p) => p.plName === store.state.exoplanet) || planets[0];
  }

  function draw() {
    const p = selectedPlanet();
    if (!p) {
      title.innerHTML = "";
      svgWrap.innerHTML = "";
      sizeWrap.innerHTML = "";
      metricCards.innerHTML = "";
      provenance.innerHTML = "";
      provenance.appendChild(el("div", { class: "status error", text: "No catalog data available." }));
      return;
    }

    const teff = p.starTeffK;
    const mass = p.starMassMsun;
    const radius = p.starRadiusRsun;
    const lumCatalog = p.starLumLinear;          // catalog (from log10 L/Lsun)
    const lumDerived = derivedLuminosity(teff, radius); // derived (Stefan–Boltzmann)

    title.innerHTML = "";
    title.appendChild(el("h3", { text: "Host star: " + p.hostname + "  ·  " + p.plName }));

    drawHR(teff, lumCatalog, p.hostname);
    drawSizeCompare(radius, p.hostname);

    metricCards.innerHTML = "";
    const radiusCard = metricCard({
      value: missing(radius) ? "—" : fmt(radius, 2),
      unit: "R☉ (solar radii)",
      label: "How big this star is, compared to the Sun",
      dataType: "catalog",
      details: [
        ["Mass", missing(mass) ? "— not in catalog" : fmt(mass, 4) + " M☉"],
        ["Radius", missing(radius) ? "— not in catalog" : fmt(radius, 6) + " R☉"],
      ],
    });
    metricCards.appendChild(radiusCard);
    if (lastRadius !== null && lastRadius !== radius) markUpdated(radiusCard);
    lastRadius = radius;

    metricCards.appendChild(metricCard({
      value: missing(teff) ? "—" : fmt(teff, 0),
      unit: "K",
      label: "Surface temperature (Sun = 5772 K)",
      dataType: "catalog",
    }));

    metricCards.appendChild(metricCard({
      value: missing(lumCatalog) ? "—" : fmt(lumCatalog, 3),
      unit: "L☉ (catalog)",
      label: "How much light this star puts out",
      dataType: "catalog",
      details: [["log₁₀ (L/L☉)", fmt(p.starLumLog10, 4)]],
    }));

    metricCards.appendChild(metricCard({
      value: missing(lumDerived) ? "—" : fmt(lumDerived, 3),
      unit: "L☉ (derived)",
      label: "Luminosity recalculated from temperature + radius",
      sub: "L = 4πR²σT⁴ — should roughly match the catalog value",
      dataType: "derived",
    }));

    provenance.innerHTML = "";
    if (metaInfo) {
      provenance.appendChild(provenanceBar({
        source: metaInfo.source,
        dataType: "Catalog + derived",
        retrieved: metaInfo.retrievedAt,
        units: "K, M☉, R☉, L☉",
        status,
        statusLabel: "Catalog-backed · not a real-time life-cycle feed",
      }));
    }
    provenance.appendChild(el("p", { class: "panel-note-text", html:
      "<strong>Catalog</strong> values come from the NASA Exoplanet Archive. <strong>Derived</strong> luminosity uses the " +
      "Stefan–Boltzmann law assuming a blackbody star. H–R diagram uses conventional axes: effective temperature " +
      "decreases left→right (log scale), luminosity increases upward (log scale). Stellar ages are not inferred here." }));
  }

  /** Radius-scaled star-size comparison drawn from catalog radius values. */
  function drawSizeCompare(radiusRsun, label) {
    sizeWrap.innerHTML = "";
    if (missing(radiusRsun) || radiusRsun <= 0) {
      sizeWrap.appendChild(el("p", { class: "panel-note-text", text: "Radius not in catalog — size comparison unavailable for this star." }));
      return;
    }
    const maxPx = 180;
    const minPx = 14;
    // Keep the Sun's on-screen size fixed and scale the host star's pixel
    // diameter by the real radius ratio, capping at maxPx so very large
    // giants don't overflow the panel.
    const sunPx = 60;
    const rawHostPx = sunPx * radiusRsun;
    const hostPx = Math.max(minPx, Math.min(maxPx, rawHostPx));
    const capped = rawHostPx > maxPx || rawHostPx < minPx;

    sizeWrap.appendChild(el("div", { class: "size-circle sun-ref", style: `width:${sunPx}px;height:${sunPx}px` }, [
      el("span", { text: "Sun (1 R☉)" }),
    ]));
    sizeWrap.appendChild(el("div", { class: "size-circle host-star", style: `width:${hostPx}px;height:${hostPx}px` }, [
      el("span", { text: label + " (" + fmt(radiusRsun, 2) + " R☉)" }),
    ]));
    if (capped) {
      sizeWrap.appendChild(el("p", { class: "size-scale-note", text: "Display size capped to fit this panel — the real radius ratio (" + fmt(radiusRsun, 2) + "×) is used for the numbers above." }));
    }
  }

  function drawHR(teffK, lumLinear, label) {
    svgWrap.innerHTML = "";
    const W = 560, H = 420;
    const padL = 64, padR = 16, padT = 20, padB = 44;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Log temperature axis: hot on the left, cool on the right.
    const tLogMax = Math.log10(45000);
    const tLogMin = Math.log10(2400);
    const xOf = (teff) => padL + (1 - (Math.log10(teff) - tLogMin) / (tLogMax - tLogMin)) * plotW;
    const lMin = Math.log10(0.0005);
    const lMax = Math.log10(300000);
    const yOf = (lum) => padT + (1 - (Math.log10(lum) - lMin) / (lMax - lMin)) * plotH;

    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "hr-svg", role: "img", "aria-label": "Hertzsprung–Russell diagram of reference stars and the selected host star" });

    // Grid lines
    for (let t = 3000; t <= 40000; t *= 2) {
      svg.appendChild(el("line", { x1: xOf(t), y1: padT, x2: xOf(t), y2: padT + plotH, class: "hr-grid" }));
      svg.appendChild(el("text", { x: xOf(t), y: padT + plotH + 16, class: "hr-tick", text: t + " K" }));
    }
    for (let l = 1e-3; l <= 1e5; l *= 10) {
      svg.appendChild(el("line", { x1: padL, y1: yOf(l), x2: padL + plotW, y2: yOf(l), class: "hr-grid" }));
      svg.appendChild(el("text", { x: padL - 8, y: yOf(l) + 4, class: "hr-tick", text: "1e" + Math.log10(l) }));
    }

    // Reference stars
    for (const s of refStars) {
      svg.appendChild(el("circle", {
        cx: xOf(s.teff_k), cy: yOf(s.lum_lsun), r: 4,
        class: "hr-ref",
      }));
      svg.appendChild(el("text", { x: xOf(s.teff_k) + 6, y: yOf(s.lum_lsun) - 6, class: "hr-label", text: s.name }));
    }

    // Sun marker (special)
    svg.appendChild(el("circle", { cx: xOf(5772), cy: yOf(1), r: 5, class: "hr-sun" }));

    // Host star
    if (!missing(teffK) && !missing(lumLinear)) {
      svg.appendChild(el("circle", {
        cx: xOf(teffK), cy: yOf(Math.max(lumLinear, 1e-4)), r: 8,
        class: "hr-host",
      }));
      svg.appendChild(el("text", { x: xOf(teffK), y: yOf(Math.max(lumLinear, 1e-4)) - 12, class: "hr-host-label", text: label }));
    }

    // Axis labels
    svg.appendChild(el("text", { x: padL + plotW / 2, y: H - 4, class: "hr-axis", text: "Effective temperature (K) — decreases →" }));
    const yLabel = el("text", { x: 16, y: padT + plotH / 2, class: "hr-axis", text: "Luminosity (L☉, log)" });
    yLabel.setAttribute("transform", `rotate(-90 16 ${padT + plotH / 2})`);
    svg.appendChild(yLabel);

    svgWrap.appendChild(svg);
  }

  const off = store.on("change", () => draw());
  load();

  return {
    destroy() { off(); },
  };
}
