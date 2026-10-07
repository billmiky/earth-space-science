// panels/exoplanet.js — Panel D: Earth–Exoplanet comparison (NASA Exoplanet Archive).

import { el, provenanceBar, esc } from "../dom.js";
import { loadExoplanetCatalog } from "../adapters/exoplanet-catalog.js";
import { missing } from "../models.js";
import { fmt, kelvinTo, daysToYears } from "../units.js";
import { metricCard, markUpdated, notScaleTag, imageSlot } from "../panel-ui.js";

// Optional NASA Exoplanet Travel Bureau posters, keyed by catalog plName.
// Always rendered inside a clearly-labeled "artist's concept" card — never
// presented as an observation, and always shown beside the real numbers.
const ARTIST_CONCEPTS = {
  "TRAPPIST-1 e": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/TRAPPIST-1e_Const_CMYK_Print_(cropped).png?width=500",
    alt: "Retro travel-poster style illustration imagining a rocky, ocean-bearing TRAPPIST-1e as seen from a hypothetical orbiting moon.",
    caption: "Artist's concept — not a photograph or observation",
    credit: "NASA/JPL-Caltech — Exoplanet Travel Bureau",
    creditHref: "https://exoplanets.nasa.gov/alien-worlds/exoplanet-travel-bureau/",
  },
};

export const meta = { key: "exoplanet", label: "D · Earth–Exoplanet Comparison" };

export function mount(container, ctx) {
  const { store } = ctx;
  const root = el("div", { class: "panel exoplanet-panel" });

  const controls = el("div", { class: "panel-controls" });
  const select = el("select", { class: "tool-select", "aria-label": "Select exoplanet" });
  controls.appendChild(el("label", { class: "ctl" }, [el("span", { text: "Exoplanet" }), select]));
  const search = el("input", { type: "search", placeholder: "Search curated list…", class: "tool-select", "aria-label": "Search curated planets" });
  controls.appendChild(search);
  root.appendChild(controls);

  const compare = el("div", { class: "size-compare", role: "group", "aria-label": "Relative size comparison of Earth and the selected exoplanet" });
  root.appendChild(compare);

  const evidenceRow = el("div", { class: "evidence-row" });
  const metricCards = el("div", { class: "metric-cards" });
  const artistWrap = el("div", { class: "artist-wrap" });
  evidenceRow.appendChild(metricCards);
  evidenceRow.appendChild(artistWrap);
  root.appendChild(evidenceRow);

  const facts = el("div", { class: "facts" });
  root.appendChild(facts);

  const provenance = el("div", { class: "prov-wrap" });
  root.appendChild(provenance);

  container.appendChild(root);

  let planets = [];
  let metaInfo = null;
  let status = "loading";
  let lastRadius = null;

  async function load() {
    const result = await loadExoplanetCatalog(store.state);
    planets = result.planets;
    metaInfo = result.meta;
    status = result.status;
    populate();
    draw();
  }

  function populate() {
    select.innerHTML = "";
    const cur = store.state.exoplanet;
    for (const p of planets) {
      const opt = el("option", { value: p.plName, text: p.plName + (p.hostname ? "  ·  " + p.hostname : "") });
      if (p.plName === cur) opt.selected = true;
      select.appendChild(opt);
    }
    if (!planets.some((p) => p.plName === cur) && planets.length) {
      select.value = planets[0].plName;
    }
  }

  function selectedPlanet() {
    return planets.find((p) => p.plName === select.value) || planets[0];
  }

  function draw() {
    const p = selectedPlanet();
    if (!p) {
      facts.innerHTML = "";
      compare.innerHTML = "";
      metricCards.innerHTML = "";
      artistWrap.innerHTML = "";
      provenance.innerHTML = "";
      provenance.appendChild(el("div", { class: "status error", text: "No exoplanet catalog data available." }));
      return;
    }

    // Size comparison
    const maxR = Math.max(2.5, p.radiusEarth ?? 1);
    const earthD = 90;
    const planetD = Math.max(10, Math.min(260, (p.radiusEarth ?? 1) / maxR * 260));
    compare.innerHTML = "";
    compare.appendChild(el("div", { class: "size-circle earth", style: `width:${earthD}px;height:${earthD}px`, text: "" }, [
      el("span", { text: "Earth · 1 R⊕" }),
    ]));
    compare.appendChild(el("div", { class: "size-circle planet", style: `width:${planetD}px;height:${planetD}px`, text: "" }, [
      el("span", { text: p.plName + " · " + fmt(p.radiusEarth, 3) + " R⊕" }),
    ]));
    compare.appendChild(notScaleTag("Sizes compressed to fit this panel — not to true scale"));

    metricCards.innerHTML = "";
    const radiusCard = metricCard({
      value: missing(p.radiusEarth) ? "—" : fmt(p.radiusEarth, 2),
      unit: "R⊕ (Earth radii)",
      label: "How big this planet is, compared to Earth",
      dataType: "catalog",
    });
    metricCards.appendChild(radiusCard);
    if (lastRadius !== null && lastRadius !== p.radiusEarth) markUpdated(radiusCard);
    lastRadius = p.radiusEarth;

    metricCards.appendChild(metricCard({
      value: missing(p.orbitalPeriodDays) ? "—" : fmt(p.orbitalPeriodDays, 1),
      unit: "Earth days",
      label: "Length of one orbit (its \u201cyear\u201d)",
      sub: missing(p.orbitalPeriodDays) ? "" : "≈ " + fmt(daysToYears(p.orbitalPeriodDays), 2) + " Earth years",
      dataType: "catalog",
    }));

    metricCards.appendChild(metricCard({
      value: missing(p.equilibriumTempK) ? "—" : fmt(p.equilibriumTempK, 0),
      unit: "K (equilibrium)",
      label: "Modeled temperature with no atmosphere",
      sub: "Estimate, not a measured surface temperature",
      dataType: "calculated",
    }));

    metricCards.appendChild(metricCard({
      value: missing(p.distanceLy) ? "—" : fmt(p.distanceLy, 1),
      unit: "light-years away",
      label: "Distance from Earth",
      dataType: "catalog",
    }));

    // Optional, always-labeled artist's concept card — shown beside the
    // numeric evidence above, never presented as an observation.
    artistWrap.innerHTML = "";
    const concept = ARTIST_CONCEPTS[p.plName];
    if (concept) {
      const card = el("div", { class: "artist-card" }, [
        el("span", { class: "artist-badge", text: "Artist's concept — not an observation" }),
        imageSlot({
          src: concept.src,
          alt: concept.alt,
          caption: concept.caption,
          credit: concept.credit,
          creditHref: concept.creditHref,
          fallbackText: "Artist's-concept poster unavailable right now.",
        }),
      ]);
      artistWrap.appendChild(card);
    }

    facts.innerHTML = "";
    const row = (label, value, hint) => el("div", { class: "fact-row" }, [
      el("span", { class: "fact-label", text: label }),
      el("span", { class: "fact-value" + (missing(value) ? " missing" : ""), text: missing(value) ? "— not in catalog" : value }),
      hint ? el("span", { class: "fact-hint", text: hint }) : null,
    ]);

    facts.appendChild(el("h3", { class: "facts-title", text: p.plName + "  (host: " + p.hostname + ")" }));
    facts.appendChild(row("Radius (relative to Earth)", fmt(p.radiusEarth, 4), "Earth radii"));
    facts.appendChild(row("Mass (relative to Earth)", fmt(p.massEarth, 4), "Earth masses"));
    facts.appendChild(row("Orbital period", fmt(p.orbitalPeriodDays, 5), "days ≈ " + fmt(daysToYears(p.orbitalPeriodDays), 3) + " yr"));
    facts.appendChild(row("Orbital eccentricity", fmt(p.eccentricity, 3), "0 = circular"));
    facts.appendChild(row("Semi-major axis", fmt(p.semiMajorAxisAu, 4), "AU"));
    facts.appendChild(row("Equilibrium temperature", fmt(p.equilibriumTempK, 4), "K ≈ " + fmt(kelvinTo("C", p.equilibriumTempK), 3) + " °C (estimate, not surface)"));
    facts.appendChild(row("Host-star temperature", fmt(p.starTeffK, 4), "K"));
    facts.appendChild(row("Host-star mass", fmt(p.starMassMsun, 4), "solar masses"));
    facts.appendChild(row("Host-star radius", fmt(p.starRadiusRsun, 4), "solar radii"));
    facts.appendChild(row("Host-star luminosity", fmt(p.starLumLinear, 4), "L☉ (from log₁₀ L/L☉ = " + fmt(p.starLumLog10, 4) + ")"));
    facts.appendChild(row("Discovery", p.discYear === null ? null : String(p.discYear), p.discoveryMethod || ""));
    facts.appendChild(row("Distance", fmt(p.distanceLy, 4), "light-years ≈ " + fmt(p.distancePc, 4) + " pc"));

    // Missing-data indicator
    const missingFields = [
      ["Radius", p.radiusEarth], ["Mass", p.massEarth], ["Eccentricity", p.eccentricity],
      ["Equilibrium temp", p.equilibriumTempK], ["Host-star luminosity", p.starLumLinear],
    ].filter(([, v]) => missing(v)).map(([l]) => l);
    if (missingFields.length) {
      facts.appendChild(el("p", { class: "missing-note", text: "Missing in catalog: " + missingFields.join(", ") + "." }));
    }

    // Provenance
    provenance.innerHTML = "";
    if (metaInfo) {
      provenance.appendChild(provenanceBar({
        source: metaInfo.source,
        dataType: "Catalog (" + metaInfo.table + ")",
        retrieved: metaInfo.retrievedAt,
        units: "mixed (see rows)",
        status,
        statusLabel: metaInfo.mode === "live" ? "Live (backend)" : metaInfo.mode === "bundled-stale" ? "Bundled (live refresh failed)" : "Bundled snapshot",
      }));
    }
    provenance.appendChild(el("p", { class: "panel-note-text", html:
      "Equilibrium temperature is a <strong>model estimate</strong> for a planet with no atmosphere — not a measured surface temperature. " +
      "This dashboard reports catalog values and deliberately does <strong>not</strong> compute a habitability or “Earth-likeness” score." }));
  }

  select.addEventListener("change", () => {
    store.setExoplanet(select.value);
    draw();
  });
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    for (const opt of select.options) {
      opt.hidden = q !== "" && !opt.text.toLowerCase().includes(q);
    }
  });

  // Reflect shared selection changes (from Panel E or URL).
  const off = store.on("change", () => {
    if (select.value !== store.state.exoplanet && planets.some((p) => p.plName === store.state.exoplanet)) {
      select.value = store.state.exoplanet;
      draw();
    }
  });

  load();

  return {
    destroy() { off(); },
  };
}
