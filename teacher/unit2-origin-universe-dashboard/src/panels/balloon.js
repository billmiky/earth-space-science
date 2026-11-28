// panels/balloon.js — Stage 6 (Day 5 · Elaborate): Interactive Expanding Space & "Rewind to the Big Bang".
// Tap ANY galaxy to make it Home and prove there is no center; toggle balloon-dot limitation.

import { el, svg } from "../dom.js";
import { BALLOON_GALAXIES, scaleFactor, galaxyDistances } from "../science.js";
import { card, layout, packetTask, stat, toggle } from "../ui.js";

export function mount(container) {
  let gyrAgo = 0;
  let homeIdx = 0;
  let balloonLimitation = false; // false = real galaxies stay fixed size; true = balloon marker dots stretch!

  const W = 640, H = 330, cx = W / 2, cy = H / 2;
  const svgEl = svg("svg", { class: "balloon-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Expanding universe model where you can tap any galaxy as Home" });

  const sTime = stat("Time", "Today (0 B yrs ago)", { tone: "good" });
  const sSize = stat("Size vs. Today", "100%");
  const sCond = stat("Conditions", "Cold (−270 °C) · spread out");
  const distTableBody = el("tbody");

  const slider = el("input", {
    class: "slider", type: "range", min: 0, max: 13.5, step: 0.1, value: gyrAgo,
    "aria-label": "Billions of years ago",
    oninput: () => { gyrAgo = Number(slider.value); render(); },
  });

  function render() {
    svgEl.replaceChildren();
    const a = Math.max(0.05, scaleFactor(gyrAgo));
    const home = BALLOON_GALAXIES[homeIdx];
    const dists = galaxyDistances(homeIdx, a);

    // Warm glow when rewound near the Big Bang
    const heat = Math.max(0, Math.min(1, (1 - a) * 1.15));
    const balloonR = 24 + a * 134;
    const bgFill = heat > 0.65
      ? `rgba(245, 158, 11, ${(0.22 + heat * 0.45).toFixed(2)})`
      : `rgba(56, 189, 248, ${(0.08 + a * 0.10).toFixed(2)})`;
    const ringStroke = heat > 0.65 ? "#fbbf24" : "#38bdf8";

    svgEl.appendChild(svg("circle", { cx, cy, r: balloonR, fill: bgFill, stroke: ringStroke, "stroke-width": 2.5, "stroke-dasharray": "8 6" }));

    // Expanding coordinate grid rings centered on chosen Home
    const homeX = cx + home.x * 136 * a;
    const homeY = cy + home.y * 116 * a;
    [44, 88, 132].forEach((r) => {
      svgEl.appendChild(svg("circle", { cx: homeX, cy: homeY, r: r * a, fill: "none", stroke: "rgba(255,255,255,0.08)", "stroke-width": 1 }));
    });

    // Galaxies & outward recession arrows from Home
    dists.forEach((g) => {
      const gx = cx + g.x * 136 * a;
      const gy = cy + g.y * 116 * a;
      const isHome = g.idx === homeIdx;

      if (!isHome && a > 0.14) {
        const vx = gx - homeX, vy = gy - homeY;
        const len = Math.hypot(vx, vy);
        if (len > 10) {
          const arrowLen = Math.min(36, len * 0.24);
          const ax = gx + (vx / len) * arrowLen;
          const ay = gy + (vy / len) * arrowLen;
          svgEl.appendChild(svg("line", { x1: gx, y1: gy, x2: ax, y2: ay, stroke: "#f87171", "stroke-width": 2.4, "stroke-linecap": "round" }));
        }
      }

      const galR = balloonLimitation ? (4.5 + a * 9.5) : 8.5;
      const grp = svg("g", { style: "cursor:pointer", onclick: () => { homeIdx = g.idx; render(); } }, [
        svg("circle", {
          cx: gx, cy: gy, r: isHome ? galR + 3.5 : galR,
          fill: isHome ? "#fde047" : "#38bdf8",
          stroke: isHome ? "#fff" : "#0b0f19",
          "stroke-width": isHome ? 3 : 2,
        }),
        a > 0.22 || isHome
          ? svg("text", { x: gx, y: isHome ? gy + galR + 17 : gy - galR - 5, "text-anchor": "middle", fill: isHome ? "#fde047" : "#e2e8f0", "font-size": isHome ? 12.5 : 11, "font-weight": 800, text: isHome ? `★ ${g.id} (Home)` : g.id })
          : null,
      ]);
      svgEl.appendChild(grp);
    });

    // Update stats
    const pct = Math.round(scaleFactor(gyrAgo) * 100);
    sTime.setValue(gyrAgo === 0 ? "Today (0 B yrs ago)" : `${gyrAgo.toFixed(1)} billion yrs ago`, gyrAgo > 11 ? "warn" : "good");
    sSize.setValue(`${pct}% of today's size`, pct < 25 ? "warn" : "accent");
    if (gyrAgo > 12.5) sCond.setValue("Extremely HOT, DENSE & BRIGHT 🔥", "bad");
    else if (gyrAgo > 8) sCond.setValue("Much hotter & galaxies crowded close", "warn");
    else if (gyrAgo > 3) sCond.setValue("Closer together · warmer than today", "accent");
    else sCond.setValue("Cold (−270 °C) · galaxies far apart", "good");

    slider.value = String(gyrAgo);

    // Distance table for 5 nearest/farthest galaxies from chosen Home
    distTableBody.replaceChildren();
    const sorted = dists.filter((d) => d.idx !== homeIdx).sort((x, y) => x.dMpc - y.dMpc);
    const pick = [sorted[0], sorted[2], sorted[5], sorted[sorted.length - 1]].filter(Boolean);
    pick.forEach((g) => {
      distTableBody.appendChild(el("tr", {}, [
        el("td", { text: g.name }),
        el("td", { text: `${Math.round(g.dMpc)} Mpc` }),
        el("td", { text: `${g.vKms.toLocaleString()} km/s` }),
      ]));
    });
  }

  const presets = [
    { label: "Today (0 B yrs)", val: 0 },
    { label: "5 B yrs ago (~67%)", val: 5 },
    { label: "10 B yrs ago (~35%)", val: 10 },
    { label: "Near Big Bang", val: 13.4 },
  ].map((p) => el("button", {
    class: "chip", type: "button", text: p.label,
    onclick: () => { gyrAgo = p.val; render(); },
  }));

  const limitToggle = toggle("Show balloon limitation (marker dots stretch)", false, (on) => { balloonLimitation = on; render(); });

  render();

  container.append(layout("cols-wide", [
    card("Expanding Space Simulator — Tap ANY Galaxy to Make It 'Home'", [
      svgEl,
      el("div", { class: "controls-row" }, [
        el("label", { class: "slider-label" }, [el("span", { text: "Rewind time (Today → Big Bang):" }), slider]),
        el("div", { class: "chips" }, presets),
        limitToggle,
      ]),
    ], { kicker: "Every galaxy sees all others moving away — there is NO center!" }),
    el("div", { class: "stack" }, [
      el("div", { class: "stats-col" }, [sTime, sSize, sCond]),
      card("Distances from Chosen Home Galaxy", [
        el("table", { class: "data compact" }, [
          el("thead", {}, [el("tr", {}, [el("th", { text: "Galaxy" }), el("th", { text: "Distance" }), el("th", { text: "Speed" })])]),
          distTableBody,
        ]),
      ]),
      packetTask("Elaborate Parts 1–2 · pp. 16–19", [
        "Deflate the balloon to rewind to <b>5 B</b> and <b>10 B yrs ago</b> → early universe was <b>hot, dense, and bright</b>.",
        "<b>Limitation:</b> Marker galaxies stretch on a balloon, but gravity holds real galaxies together.",
      ]),
    ]),
  ]));
}
