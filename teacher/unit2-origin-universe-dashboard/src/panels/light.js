// panels/light.js — Stage 4 (Day 3 · Explore): Model 3 Moving Galaxy Light + Model 4 EM Spectrum (ESSRT p. 3).

import { el, svg, tabs, chips } from "../dom.js";
import { EM_BANDS, emBand, wavelengthToHex } from "../science.js";
import { card, layout, packetTask, stat } from "../ui.js";

export function mount(container) {
  let rafId = null;

  // ---------- TAB 1: MODEL 3 MOVING GALAXY LIGHT WAVES ----------
  function buildModel3() {
    let mode = "away"; // "toward" | "still" | "away"
    let phase = 0;
    let lastTs = 0;

    const canvas = el("canvas", { class: "sim-canvas", width: 820, height: 320 });
    const ctx = canvas.getContext("2d");

    const sDir = stat("Galaxy motion", "Moving AWAY from Earth", { tone: "bad" });
    const sWave = stat("Wavelength at Earth", "Longer (stretched)", { tone: "bad" });
    const sColor = stat("Light color shift", "Toward RED (redshift)", { tone: "bad" });

    const modeChips = chips([
      { value: "toward", label: "⬅ Moving Toward Earth", color: "#38bdf8" },
      { value: "still", label: "● Not Moving", color: "#cbd5e1" },
      { value: "away", label: "Moving Away from Earth ➡", color: "#f87171" },
    ], mode, (v) => { mode = v; syncStats(); }, { label: "Galaxy motion" });

    function syncStats() {
      if (mode === "toward") {
        sDir.setValue("Moving TOWARD Earth", "accent");
        sWave.setValue("Shorter λ · Higher frequency", "accent");
        sColor.setValue("Toward BLUE (blueshift)", "accent");
      } else if (mode === "still") {
        sDir.setValue("Not moving (stationary)", "good");
        sWave.setValue("No change in λ or frequency", "good");
        sColor.setValue("No shift (white / lab match)", "good");
      } else {
        sDir.setValue("Moving AWAY from Earth", "bad");
        sWave.setValue("Longer λ · Lower frequency", "bad");
        sColor.setValue("Toward RED (redshift)", "bad");
      }
    }
    syncStats();

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      phase += dt * 3.4;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Earth observer on left, Galaxy on right
      const earthX = 95, galX = 680, midY = 160;
      const waveColor = mode === "toward" ? "#5aa9e6" : mode === "away" ? "#ef6b5b" : "#e8edf6";
      const wavelengthPx = mode === "toward" ? 36 : mode === "away" ? 86 : 58;

      // Light wave traveling from galaxy -> Earth
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      for (let x = earthX + 46; x <= galX - 58; x += 3) {
        const y = midY + Math.sin(((x - earthX) / wavelengthPx) * Math.PI * 2 + phase) * 34;
        if (x === earthX + 46) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Earth circle
      ctx.fillStyle = "#1c6784";
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(earthX, midY, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#5cc489";
      ctx.beginPath(); ctx.arc(earthX - 10, midY - 6, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(earthX + 10, midY + 9, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e8edf6";
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌍 Earth Observer", earthX, midY + 58);

      // Moving spiral galaxy icon
      const gx = galX + (mode === "still" ? 0 : Math.sin(phase * 0.45) * 14);
      ctx.save();
      ctx.translate(gx, midY);
      ctx.rotate(-0.3);
      ctx.strokeStyle = "#e8b84b";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 0, 52, 20, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath(); ctx.ellipse(0, 0, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#e8edf6";
      ctx.fillText("🌌 Distant Galaxy", galX, midY + 58);

      // Motion arrow above galaxy
      if (mode !== "still") {
        const dir = mode === "toward" ? -1 : 1;
        const ax1 = galX - dir * 32, ax2 = galX + dir * 38;
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(ax1, midY - 56); ctx.lineTo(ax2, midY - 56); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax2, midY - 56); ctx.lineTo(ax2 - dir * 12, midY - 65); ctx.lineTo(ax2 - dir * 12, midY - 47); ctx.closePath();
        ctx.fillStyle = waveColor; ctx.fill();
        ctx.font = "700 14px system-ui, sans-serif";
        ctx.fillText(mode === "toward" ? "Moving toward Earth" : "Moving away from Earth", galX, midY - 74);
      }

      // Wavelength label
      ctx.fillStyle = "#fde047";
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.fillText(
        mode === "toward" ? "Squished waves → shorter λ → higher frequency → BLUESHIFT"
          : mode === "away" ? "Stretched waves → longer λ → lower frequency → REDSHIFT"
            : "Unchanged waves → lab wavelength → NO SHIFT",
        388, 52,
      );

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return layout("cols-wide", [
      card("Model 3: Light Waves from a Moving Galaxy", [
        canvas,
        el("div", { class: "controls-row" }, [modeChips.root]),
        el("div", { class: "callout-info" }, [
          el("strong", { text: "Energy flow (pp. 9–10): " }),
          "Light energy comes from ", el("b", { text: "nuclear fusion in the galaxy's stars" }),
          ", travels outward through space, and transforms when absorbed by Earth/telescopes — never destroyed.",
        ]),
      ], { kicker: "Same physics as Model 1 sound, now with light" }),
      el("div", { class: "stack" }, [
        el("div", { class: "stats-col" }, [sDir, sWave, sColor]),
        packetTask("Model 3 · pp. 9–10", [
          "Fill in the 3-row table: Not moving / Moving toward Earth / Moving away from Earth.",
          "Remember: the galaxy itself doesn't change color — only the waves arriving at Earth are stretched or squished!",
        ]),
      ]),
    ]);
  }

  // ---------- TAB 2: MODEL 4 EM SPECTRUM (ESSRT p. 3) ----------
  function buildModel4() {
    let visNm = 550;
    let logEm = 2.74; // ~550 nm

    const visSwatch = el("div", { class: "color-swatch" });
    const visSvg = svg("svg", { class: "wave-svg", viewBox: "0 0 720 120" });
    const sVis = stat("Visible wavelength", "550 nm (Green)");
    const sBand = stat("ESSRT p. 3 EM Band", "Visible light");
    const sRel = stat("Wavelength ↔ Frequency & Energy", "Opposite arrows on ESSRT p. 3!");

    const visSlider = el("input", {
      class: "slider", type: "range", min: 400, max: 700, step: 2, value: visNm,
      "aria-label": "Visible light wavelength from 400 to 700 nanometers",
      oninput: () => { visNm = Number(visSlider.value); logEm = Math.log10(visNm); emSlider.value = logEm.toFixed(2); update(); },
    });
    const emSlider = el("input", {
      class: "slider", type: "range", min: -3, max: 11, step: 0.08, value: logEm,
      "aria-label": "Full electromagnetic spectrum log wavelength",
      oninput: () => { logEm = Number(emSlider.value); const nm = Math.pow(10, logEm); if (nm >= 400 && nm <= 700) { visNm = nm; visSlider.value = String(Math.round(nm)); } update(); },
    });

    const bandStrip = el("div", { class: "em-strip" }, EM_BANDS.map((b) =>
      el("button", {
        class: "em-cell", type: "button", style: `--em:${b.color}`, "data-band": b.id,
        onclick: () => {
          const midLog = (Math.log10(b.minNm) + Math.log10(b.maxNm)) / 2;
          logEm = Math.max(-3, Math.min(11, midLog));
          emSlider.value = logEm.toFixed(2);
          if (b.id === "visible") { visNm = 550; visSlider.value = "550"; }
          update();
        },
      }, [el("span", { text: b.label })])));

    function colorName(nm) {
      if (nm < 445) return "Violet";
      if (nm < 490) return "Blue";
      if (nm < 520) return "Cyan";
      if (nm < 575) return "Green";
      if (nm < 600) return "Yellow";
      if (nm < 630) return "Orange";
      return "Red";
    }

    function update() {
      const hex = wavelengthToHex(visNm);
      visSwatch.style.background = hex;
      visSwatch.textContent = `${Math.round(visNm)} nm · ${colorName(visNm)}`;
      sVis.setValue(`${Math.round(visNm)} nm (${colorName(visNm)})`);

      const nm = Math.pow(10, logEm);
      const band = emBand(nm);
      sBand.setValue(band.label, band.id === "microwave" ? "warn" : band.id === "visible" ? "good" : "accent");
      sRel.setValue(band.note);
      bandStrip.querySelectorAll(".em-cell").forEach((c) => c.classList.toggle("active", c.dataset.band === band.id));

      // Draw visible sine wave whose spacing grows from 400 nm -> 700 nm
      visSvg.replaceChildren();
      const cycles = 11 - ((visNm - 400) / 300) * 6;
      const pts = [];
      for (let x = 20; x <= 700; x += 3) {
        const y = 60 - Math.sin(((x - 20) / 680) * cycles * Math.PI * 2) * 38;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      visSvg.appendChild(svg("polyline", { points: pts.join(" "), fill: "none", stroke: hex, "stroke-width": 4.5, "stroke-linecap": "round" }));
    }
    update();

    return layout("cols-wide", [
      card("Model 4: Electromagnetic Spectrum (ESSRT p. 3)", [
        el("div", { class: "em-arrows" }, [
          el("span", { text: "◀ Shorter λ · HIGHER frequency & energy" }),
          el("span", { text: "Longer λ · LOWER frequency & energy ▶" }),
        ]),
        bandStrip,
        el("label", { class: "slider-label" }, [el("span", { text: "Sweep full EM spectrum:" }), emSlider]),
        el("div", { class: "vis-box" }, [
          visSwatch,
          visSvg,
          el("label", { class: "slider-label" }, [el("span", { text: "Visible zoom (400 nm Violet → 700 nm Red):" }), visSlider]),
        ]),
      ], { kicker: "Shorter wavelength = blue/violet · Longer wavelength = red → infrared → microwaves" }),
      el("div", { class: "stack" }, [
        el("div", { class: "stats-col" }, [sVis, sBand, sRel]),
        el("div", { class: "callout-warn" }, [
          el("strong", { text: "Packet fix (p. 10, Model 4 Q4): " }),
          "The printed packet says 'appears blue' — tell students to cross out ",
          el("s", { text: "blue" }), " and write ", el("b", { text: "red" }), " before answering!",
        ]),
        packetTask("Model 4 · p. 10", [
          "Sweep from red to violet: as frequency rises, wavelength shrinks.",
          "Whiteboard check: Moving AWAY → wavelength <b>longer</b> → frequency <b>lower</b> → shifts toward <b>red</b>.",
        ]),
      ]),
    ]);
  }

  const body = el("div", { class: "tab-body fill" });
  const t = tabs(["🌌 Model 3: Moving Galaxy Light", "🌈 Model 4: EM Spectrum (ESSRT p. 3)"], (i) => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    body.replaceChildren(i === 0 ? buildModel3() : buildModel4());
  });
  container.append(el("div", { class: "stack fill" }, [el("div", { class: "tab-bar" }, [t.root]), body]));

  return () => { if (rafId) cancelAnimationFrame(rafId); };
}
