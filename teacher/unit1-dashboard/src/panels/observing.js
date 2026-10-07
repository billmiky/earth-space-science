// panels/observing.js — Panel F: Tonight's Observing Targets.

import { el } from "../dom.js";
import { PLANET_KEYS, PLANETS, planetHelioEcliptic, eclipticToEquatorial, altAz, apparentMagnitude, sunGeocentricEcliptic } from "../astronomy.js";
import { fmt, dateToJulian } from "../units.js";
import { dataTypeBadge } from "../panel-ui.js";

export const meta = { key: "observing", label: "F · Tonight's Observing Targets" };

// Approximate local wall time -> UTC conversion using the Intl API.
export function tzOffsetMinutes(dateUtc, tz) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const parts = {};
    for (const p of dtf.formatToParts(dateUtc)) parts[p.type] = p.value;
    const hour = parts.hour === "24" ? 0 : parseInt(parts.hour, 10);
    const asUTC = Date.UTC(
      parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10),
      hour, parseInt(parts.minute, 10), parseInt(parts.second, 10)
    );
    return (asUTC - dateUtc.getTime()) / 60000;
  } catch {
    return 0;
  }
}

export function localWallToUtc(y, mo, d, h, mi, tz) {
  const guess = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
  const offset = tzOffsetMinutes(guess, tz);
  return new Date(guess.getTime() - offset * 60000);
}

export function mount(container, ctx) {
  const { store } = ctx;
  const root = el("div", { class: "panel observing-panel" });

  const controls = el("div", { class: "panel-controls" });
  const today = new Date().toISOString().slice(0, 10);
  const dateInput = el("input", { type: "date", value: today, "aria-label": "Observing date" });
  const timeInput = el("input", { type: "time", value: "21:00", "aria-label": "Observing time (local)" });
  controls.appendChild(el("label", { class: "ctl" }, [el("span", { text: "Date" }), dateInput]));
  controls.appendChild(el("label", { class: "ctl" }, [el("span", { text: "Time (local)" }), timeInput]));
  root.appendChild(controls);

  const locLine = el("div", { class: "loc-line" });
  root.appendChild(locLine);

  const skyWrap = el("div", { class: "svg-wrap sky-wrap" });
  root.appendChild(skyWrap);

  const table = el("div", { class: "obs-table", role: "table", "aria-label": "Observing targets table" });
  root.appendChild(table);

  const note = el("div", { class: "panel-note" });
  root.appendChild(note);

  container.appendChild(root);

  function draw() {
    const obs = store.state.observing || {};
    const [h, m] = (timeInput.value || "21:00").split(":").map((x) => parseInt(x, 10));
    const [y, mo, d] = (dateInput.value || today).split("-").map((x) => parseInt(x, 10));
    const tz = obs.tz || "UTC";
    const utcDate = localWallToUtc(y, mo, d, h, m, tz);
    const jd = dateToJulian(utcDate);

    locLine.innerHTML = "";
    locLine.appendChild(el("span", { text: "📍 " + (obs.name || "Custom location") }));
    locLine.appendChild(el("span", { text: fmt(obs.lat, 6) + "° N, " + fmt(obs.lon, 6) + "° E" }));
    locLine.appendChild(el("span", { text: "Timezone: " + tz + " · local " + timeInput.value }));
    locLine.appendChild(el("span", { text: "UTC " + utcDate.toISOString().replace("T", " ").slice(0, 16) }));

    // Sun altitude for daylight/twilight context.
    const sunEcl = sunGeocentricEcliptic(jd);
    const sunEq = eclipticToEquatorial(sunEcl.x, sunEcl.y, sunEcl.z, jd);
    const sunAlt = altAz(sunEq.ra, sunEq.dec, jd, obs.lat, obs.lon).alt;

    const targets = PLANET_KEYS.map((key) => {
      const helio = planetHelioEcliptic(jd, key);
      const eq = eclipticToEquatorial(helio.x, helio.y, helio.z, jd);
      const { alt, az } = altAz(eq.ra, eq.dec, jd, obs.lat, obs.lon);
      const mag = apparentMagnitude(jd, key);
      return { key, name: PLANETS[key].name, color: PLANETS[key].color, alt, az, mag, above: alt >= 0 };
    });

    drawSky(targets, sunAlt);
    drawTable(targets, sunAlt);
    drawNote(sunAlt);
  }

  function drawSky(targets, sunAlt) {
    skyWrap.innerHTML = "";
    const R = 150, cx = 160, cy = 160;
    const svg = el("svg", { viewBox: "0 0 320 340", class: "sky-svg", role: "img", "aria-label": "Sky direction view showing planet altitude and azimuth" });

    // Horizon circle + concentric altitude rings
    svg.appendChild(el("circle", { cx, cy, r: R, class: "sky-horizon" }));
    for (const ringAlt of [30, 60]) {
      const rr = R * (90 - ringAlt) / 90;
      svg.appendChild(el("circle", { cx, cy, r: rr, class: "sky-ring" }));
      svg.appendChild(el("text", { x: cx, y: cy - rr + 4, class: "sky-ring-label", text: ringAlt + "°" }));
    }

    // Cardinal directions
    const dirs = [["N", 0, cy - R - 10], ["E", 90, cx + R + 14], ["S", 180, cy + R + 18], ["W", 270, cx - R - 18]];
    for (const [label, azDeg, x, y] of dirs) {
      svg.appendChild(el("text", { x: x, y: y, class: "sky-dir", text: label }));
    }

    for (const t of targets) {
      const rr = R * (90 - Math.max(0, Math.min(90, t.alt))) / 90;
      const ang = (t.az - 180) * Math.PI / 180; // north up
      const px = cx + rr * Math.sin(ang);
      const py = cy - rr * Math.cos(ang);
      const dot = el("circle", {
        cx: px, cy: py, r: 6,
        class: t.above ? "sky-dot above" : "sky-dot below",
        style: `fill:${t.color}`,
      });
      svg.appendChild(dot);
      svg.appendChild(el("text", { x: px + 8, y: py - 6, class: "sky-label", text: t.name }));
    }

    skyWrap.appendChild(svg);
  }

  function drawTable(targets, sunAlt) {
    table.innerHTML = "";
    const header = el("div", { class: "obs-row head" }, [
      el("span", { text: "Planet" }), el("span", { text: "Alt" }), el("span", { text: "Az" }),
      el("span", { text: "Horizon" }), el("span", { text: "Mag (predicted)" }),
    ]);
    table.appendChild(header);

    const sorted = [...targets].sort((a, b) => b.alt - a.alt);
    for (const t of sorted) {
      const observable = t.above && sunAlt < -6;
      table.appendChild(el("div", { class: "obs-row" }, [
        el("span", { class: "obs-name", style: `color:${t.color}`, text: t.name }),
        el("span", { text: fmt(t.alt, 3) + "°" }),
        el("span", { text: fmt(t.az, 3) + "°" }),
        el("span", { class: t.above ? "ok" : "no", text: t.above ? "Above" : "Below" }),
        el("span", { text: t.mag === null ? "—" : fmt(t.mag, 2) + " mag" }),
      ]));
    }
  }

  function drawNote(sunAlt) {
    note.innerHTML = "";
    note.appendChild(el("div", { class: "metric-tags" }, [dataTypeBadge("calculated")]));
    const twilight = sunAlt >= -6;
    note.appendChild(el("p", { class: "panel-note-text", html:
      "Positions are <strong>calculated</strong> observer ephemerides (Meeus), not live telescope views. " +
      "“Above horizon” does <strong>not</strong> mean visible. The Sun is currently " +
      (twilight ? "<strong>above −6° altitude (daylight/twilight)</strong> — treat targets as not observable until the sky is dark." : "below −6° altitude, so the sky may be dark enough for planets (weather and obstructions aside).") +
      " This panel never provides solar-viewing guidance." }));
    note.appendChild(el("p", { class: "panel-note-text", text:
      "Predicted magnitudes use simplified Meeus formulae and are approximate." }));
  }

  dateInput.addEventListener("change", draw);
  timeInput.addEventListener("change", draw);
  const off = store.on("change", draw);
  draw();

  return {
    destroy() { off(); },
  };
}
