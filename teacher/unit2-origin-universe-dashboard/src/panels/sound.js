// panels/sound.js — Stage 3 (Day 2 · Explore): Model 1 Animated Sound Doppler + Model 2 Interactive Piano.

import { el, svg, tabs } from "../dom.js";
import { PIANO_NOTES, soundDopplerFreq, soundWavelengthCm } from "../science.js";
import { card, layout, packetTask, stat, toggle } from "../ui.js";

export function mount(container) {
  let rafId = null;
  let audioCtx = null;

  function getAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function clickBeep(freq = 540, dur = 0.045, vol = 0.08) {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch { /* audio optional */ }
  }

  function playNote(hz) {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = hz;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.58);
    } catch { /* audio optional */ }
  }

  // ---------- TAB 1: MODEL 1 MOVING SOUND SOURCE ----------
  function buildModel1() {
    let running = true;
    let speedFrac = 0.45; // v_source / c_sound
    let muted = true;     // Start muted so class can snap fingers at constant emission rate!
    let srcX = 110;
    const srcY = 170;
    const micX = 430;
    const waveSpeed = 125; // px/s
    const emitEvery = 0.42; // seconds (constant!)
    let sinceEmit = 0;
    let lastTs = 0;
    let flashTimer = 0;
    let waves = [];

    const canvas = el("canvas", { class: "sim-canvas", width: 820, height: 340 });
    const ctx = canvas.getContext("2d");

    const sEmit = stat("Source emission rate", "2.4 waves/s (CONSTANT)", { tone: "good" });
    const sRecv = stat("Microphone receives", "Higher pitch (approaching)", { tone: "accent" });
    const sMode = stat("Motion relative to mic", "Moving toward mic →");

    const speedSlider = el("input", {
      class: "slider", type: "range", min: 0, max: 0.72, step: 0.04, value: speedFrac,
      "aria-label": "Source speed as fraction of sound speed",
      oninput: () => { speedFrac = Number(speedSlider.value); },
    });

    const playBtn = el("button", {
      class: "tool-btn primary", type: "button", text: "⏸ Pause",
      onclick: () => { running = !running; playBtn.textContent = running ? "⏸ Pause" : "▶ Play"; },
    });
    const resetBtn = el("button", {
      class: "tool-btn", type: "button", text: "↺ Restart pass",
      onclick: () => { srcX = 95; waves = []; sinceEmit = 0; },
    });
    const muteBtn = toggle("Audio clicks ON (unmute after finger-snap check)", false, (on) => { muted = !on; });

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (running) {
        srcX += speedFrac * waveSpeed * dt;
        if (srcX > 760) { srcX = 75; waves = []; }
        sinceEmit += dt;
        if (sinceEmit >= emitEvery) {
          sinceEmit -= emitEvery;
          waves.push({ x: srcX, r: 4, hitMic: false });
        }
        for (const w of waves) {
          const prevR = w.r;
          w.r += waveSpeed * dt;
          const dist = Math.hypot(micX - w.x, 0);
          if (!w.hitMic && prevR < dist && w.r >= dist) {
            w.hitMic = true;
            flashTimer = 0.16;
            const approaching = srcX < micX;
            const beta = approaching ? speedFrac : -speedFrac;
            if (!muted) clickBeep(soundDopplerFreq(480, beta), 0.04, 0.09);
          }
        }
        waves = waves.filter((w) => w.r < 760);
        if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - dt);
      }

      // Draw frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Track line
      ctx.strokeStyle = "rgba(148,163,184,0.22)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(30, srcY); ctx.lineTo(790, srcY); ctx.stroke();
      ctx.setLineDash([]);

      // Expanding sound circles (faint as they spread -> energy spreads out!)
      for (const w of waves) {
        const alpha = Math.max(0.08, 1 - w.r / 520);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(w.x, srcY, w.r, 0, Math.PI * 2); ctx.stroke();
      }

      // Microphone receiver
      const lit = flashTimer > 0;
      ctx.fillStyle = lit ? "#4ade80" : "#1e293b";
      ctx.strokeStyle = lit ? "#bbf7d0" : "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(micX, srcY, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e8edf6";
      ctx.font = "700 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🎤 Receiver", micX, srcY + 38);

      // Moving source dot
      ctx.fillStyle = "#38bdf8";
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(srcX, srcY, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e0f2fe";
      ctx.fillText("Sound Source", srcX, srcY - 24);

      // Update live stats
      const approaching = srcX < micX;
      const beta = speedFrac === 0 ? 0 : (approaching ? speedFrac : -speedFrac);
      const ratio = soundDopplerFreq(1, beta);
      if (speedFrac === 0) {
        sMode.setValue("Stationary (v = 0)", "");
        sRecv.setValue("Same frequency (1.00×)", "good");
      } else if (approaching) {
        sMode.setValue("Approaching receiver →", "accent");
        sRecv.setValue(`Bunched waves · ${ratio.toFixed(2)}× higher pitch`, "accent");
      } else {
        sMode.setValue("Moving away from receiver →", "bad");
        sRecv.setValue(`Stretched waves · ${ratio.toFixed(2)}× lower pitch`, "bad");
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return layout("cols-wide", [
      card("Model 1: Sound Waves from a Moving Source", [
        canvas,
        el("div", { class: "controls-row" }, [
          playBtn, resetBtn,
          el("label", { class: "slider-label" }, [el("span", { text: "Source speed:" }), speedSlider]),
          muteBtn,
        ]),
      ], { kicker: "Snap fingers each time a wave leaves the blue dot — does the rate change?" }),
      el("div", { class: "stack" }, [
        el("div", { class: "stats-col" }, [sEmit, sMode, sRecv]),
        packetTask("Model 1 · pp. 6–7", [
          "<b>Energy:</b> Watch the circles grow fainter as they spread — is energy destroyed? (No, it spreads over a larger area.)",
          "<b>Snap check:</b> Source emits at a <b>constant</b> rate.",
          "<b>Receiver:</b> Bunched in front → faster clicks (higher pitch). Spread behind → slower clicks (lower pitch).",
        ]),
      ]),
    ]);
  }

  // ---------- TAB 2: MODEL 2 INTERACTIVE WAVE PIANO ----------
  function buildModel2() {
    let active = PIANO_NOTES[0];
    let showDriver = false;

    const waveSvg = svg("svg", { class: "wave-svg", viewBox: "0 0 760 190", role: "img", "aria-label": "Sound wave diagram showing wavelength and frequency" });
    const sPitch = stat("Selected note", `${active.label} (${active.note})`);
    const sFreq = stat("Frequency", `${active.hz.toFixed(1)} Hz`);
    const sWave = stat("Wavelength (in air)", `${soundWavelengthCm(active.hz).toFixed(0)} cm`);

    function drawWave() {
      waveSvg.replaceChildren();
      const cycles = (active.hz / 261.6) * 4.5;
      const pts = [];
      for (let x = 20; x <= 740; x += 4) {
        const t = (x - 20) / 720;
        const y = 95 - Math.sin(t * cycles * Math.PI * 2) * 56;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      waveSvg.appendChild(svg("line", { x1: 20, y1: 95, x2: 740, y2: 95, stroke: "rgba(255,255,255,0.16)", "stroke-dasharray": "6 6" }));
      waveSvg.appendChild(svg("polyline", { points: pts.join(" "), fill: "none", stroke: active.color, "stroke-width": 4.5, "stroke-linecap": "round" }));

      // Wavelength bracket across one full cycle
      const lamPx = 720 / cycles;
      const x1 = 20 + lamPx * 0.25, x2 = x1 + lamPx;
      waveSvg.appendChild(svg("line", { x1, y1: 24, x2, y2: 24, stroke: "#fde047", "stroke-width": 3 }));
      waveSvg.appendChild(svg("line", { x1, y1: 18, x2: x1, y2: 34, stroke: "#fde047", "stroke-width": 3 }));
      waveSvg.appendChild(svg("line", { x1: x2, y1: 18, x2: x2, y2: 34, stroke: "#fde047", "stroke-width": 3 }));
      waveSvg.appendChild(svg("text", { x: (x1 + x2) / 2, y: 15, "text-anchor": "middle", fill: "#fde047", "font-size": 14, "font-weight": 800, text: `1 wavelength (λ ≈ ${soundWavelengthCm(active.hz).toFixed(0)} cm)` }));

      sPitch.setValue(`${active.label} (${active.note})`);
      sFreq.setValue(`${active.hz.toFixed(1)} Hz`, active.hz > 380 ? "accent" : "warn");
      sWave.setValue(`${soundWavelengthCm(active.hz).toFixed(0)} cm`, active.hz > 380 ? "accent" : "warn");
    }

    const keysRow = el("div", { class: "piano-keys" });
    const keyBtns = PIANO_NOTES.map((n) => {
      const b = el("button", {
        class: "piano-key", type: "button", style: `--k:${n.color}`,
        onclick: () => {
          active = n;
          keyBtns.forEach((x, i) => x.classList.toggle("active", PIANO_NOTES[i].note === n.note));
          playNote(n.hz);
          drawWave();
        },
      }, [
        el("span", { class: "pk-note", text: n.note }),
        el("span", { class: "pk-hz", text: `${Math.round(n.hz)} Hz` }),
      ]);
      return b;
    });
    keyBtns[0].classList.add("active");
    keysRow.append(...keyBtns);
    drawWave();

    const driverBox = el("div", { class: "reveal-box", hidden: true }, [
      el("strong", { text: "Challenge answer (p. 8): " }),
      "The ambulance driver hears a ",
      el("b", { text: "constant pitch with NO Doppler shift" }),
      " — the driver moves with the siren, so there is zero relative motion between source and observer.",
    ]);

    return layout("cols-wide", [
      card("Model 2: Pitch, Frequency & Wavelength Piano", [
        waveSvg,
        keysRow,
        el("div", { class: "row" }, [
          el("button", {
            class: "tool-btn", type: "button", text: "🚑 Challenge: What does the ambulance driver hear?",
            onclick: () => { showDriver = !showDriver; driverBox.hidden = !showDriver; },
          }),
        ]),
        driverBox,
      ], { kicker: "Tap keys from Low C → High C to hear pitch and see wavelength shrink" }),
      el("div", { class: "stack" }, [
        el("div", { class: "stats-col" }, [sPitch, sFreq, sWave]),
        packetTask("Model 2 & Siren · p. 8", [
          "As frequency <b>increases</b> → pitch gets <b>higher</b> and wavelength gets <b>shorter</b>.",
          "Combine Models 1 & 2: approaching siren bunches waves → shorter λ → higher f → <b>higher pitch</b>.",
        ]),
      ]),
    ]);
  }

  const body = el("div", { class: "tab-body fill" });
  const t = tabs(["🚑 Model 1: Moving Source (Doppler)", "🎹 Model 2: Pitch & Wavelength Piano"], (i) => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    body.replaceChildren(i === 0 ? buildModel1() : buildModel2());
  });
  container.append(el("div", { class: "stack fill" }, [el("div", { class: "tab-bar" }, [t.root]), body]));

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (audioCtx) { try { audioCtx.close(); } catch { /* ignore */ } }
  };
}
