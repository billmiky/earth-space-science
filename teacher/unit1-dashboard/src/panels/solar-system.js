// panels/solar-system.js — Panel B: Solar System Now (calculated ephemerides).

import { el, esc } from "../dom.js";
import { PLANETS, PLANET_KEYS, planetHelioEcliptic, helioDistance, planetOrbitPath } from "../astronomy.js";
import { fmt, dateToJulian } from "../units.js";

export const meta = { key: "solar-system", label: "B · Solar System Now" };

const AU_KM = 149597870.7;

export function mount(container, ctx) {
  const { store } = ctx;

  const root = el("div", { class: "panel solar-system-panel" });

  // Controls
  const controls = el("div", { class: "panel-controls" });
  const today = new Date().toISOString().slice(0, 10);
  const dateInput = el("input", { type: "date", value: today, "aria-label": "Selected date" });
  const cmpInput = el("input", { type: "date", value: "", "aria-label": "Comparison date (optional)" });
  controls.appendChild(el("label", { class: "ctl" }, [el("span", { text: "Date" }), dateInput]));
  controls.appendChild(el("label", { class: "ctl" }, [el("span", { text: "Compare with (optional)" }), cmpInput]));
  root.appendChild(controls);

  // Planet selector
  const planetChips = el("div", { class: "planet-chips", role: "group", "aria-label": "Select planets to display" });
  root.appendChild(planetChips);

  const svgWrap = el("div", { class: "svg-wrap" });
  root.appendChild(svgWrap);

  const readout = el("div", { class: "orbit-readout", role: "table", "aria-label": "Heliocentric distances in AU" });
  root.appendChild(readout);

  const note = el("div", { class: "panel-note", html:
    "Calculated positions (Meeus low-precision ephemerides), heliocentric ecliptic frame, " +
    "viewed from ecliptic north. Object sizes and distances are <strong>not</strong> drawn to scale." });
  root.appendChild(note);

  container.appendChild(root);

  const selected = new Set(["earth", "mars", "jupiter"]);

  function rebuildChips() {
    planetChips.innerHTML = "";
    for (const key of PLANET_KEYS) {
      const btn = el("button", {
        class: "chip planet-chip" + (selected.has(key) ? " active" : ""),
        style: `--planet:${PLANETS[key].color}`,
        text: PLANETS[key].name,
        "aria-pressed": String(selected.has(key)),
        onclick: () => {
          if (selected.has(key)) selected.delete(key);
          else selected.add(key);
          rebuildChips();
          draw();
        },
      });
      planetChips.appendChild(btn);
    }
  }

  function draw() {
    const d = dateInput.value ? new Date(dateInput.value + "T12:00:00Z") : new Date();
    const jd = dateToJulian(d);
    const cmpVal = cmpInput.value;
    const jdCmp = cmpVal ? dateToJulian(new Date(cmpVal + "T12:00:00Z")) : null;

    const keys = [...selected];
    const scale = computeScale(keys);
    svgWrap.innerHTML = "";
    const svg = el("svg", {
      viewBox: `-${scale} -${scale} ${scale * 2} ${scale * 2}`,
      class: "orbit-svg",
      role: "img",
      "aria-label": "Top-down view of the solar system showing selected planetary orbits and positions",
    });

    // AU grid
    for (let au = 2; au <= Math.ceil(scale); au += 2) {
      svg.appendChild(el("circle", { cx: 0, cy: 0, r: au, class: "au-grid" }));
      svg.appendChild(el("text", { x: au, y: 0.2, class: "au-label", text: au + " AU" }));
    }

    // Sun
    svg.appendChild(el("circle", { cx: 0, cy: 0, r: 0.18, class: "sun-dot" }));
    svg.appendChild(el("text", { x: 0, y: -0.3, class: "sun-label", text: "Sun" }));

    // Orbit paths
    for (const key of keys) {
      const pts = planetOrbitPath(key, 240);
      const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(4) + " " + (-p.y).toFixed(4)).join(" ");
      svg.appendChild(el("path", { d, class: "orbit-path", style: `stroke:${PLANETS[key].color}` }));
    }

    // Position markers
    for (const key of keys) {
      const p = planetHelioEcliptic(jd, key);
      addMarker(svg, p.x, -p.y, PLANETS[key].color, PLANETS[key].name, "now");
      if (jdCmp !== null) {
        const q = planetHelioEcliptic(jdCmp, key);
        addMarker(svg, q.x, -q.y, PLANETS[key].color, null, "cmp");
      }
    }

    svgWrap.appendChild(svg);
    drawReadout(keys, jd, jdCmp);
  }

  function addMarker(svg, x, y, color, label, kind) {
    svg.appendChild(el("circle", {
      cx: x, cy: y, r: 0.14,
      class: kind === "now" ? "planet-dot" : "planet-dot cmp",
      style: `fill:${color}`,
    }));
    if (label) {
      svg.appendChild(el("text", { x: x + 0.2, y: y - 0.2, class: "planet-label", text: label }));
    }
  }

  function computeScale(keys) {
    let maxA = 3;
    for (const key of keys) {
      maxA = Math.max(maxA, PLANETS[key].a0 * 1.15);
    }
    return Math.min(36, Math.ceil(maxA));
  }

  function drawReadout(keys, jd, jdCmp) {
    readout.innerHTML = "";
    const header = el("div", { class: "ro-row head" }, [
      el("span", { text: "Planet" }),
      el("span", { text: "Distance now (AU)" }),
      el("span", { text: jdCmp !== null ? "Distance compare (AU)" : "Distance now (km)" }),
    ]);
    readout.appendChild(header);
    for (const key of keys) {
      const rNow = helioDistance(jd, key);
      const row = el("div", { class: "ro-row" }, [
        el("span", { class: "ro-name", style: `color:${PLANETS[key].color}`, text: PLANETS[key].name }),
        el("span", { text: fmt(rNow, 4) }),
        el("span", { text: jdCmp !== null ? fmt(helioDistance(jdCmp, key), 4) : fmt(rNow * AU_KM, 5) + " km" }),
      ]);
      readout.appendChild(row);
    }
  }

  const onDate = () => {
    draw();
  };
  dateInput.addEventListener("change", onDate);
  cmpInput.addEventListener("change", onDate);

  // Store date changes so guides/URLs can deep-link.
  dateInput.addEventListener("change", () => store.setDate(dateInput.value));

  rebuildChips();
  draw();

  return {
    destroy() {
      /* no timers */
    },
  };
}
