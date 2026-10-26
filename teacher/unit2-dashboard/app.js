// app.js — Unit 2 "Stability of the Solar System" dashboard shell.
// Full-screen, one-stage-at-a-time classroom presentation. Vanilla ES modules, no build step.

import { el, clear } from "./src/dom.js";
import { STAGES, FIVE_E, resolveStage } from "./src/stages.js";
import { NOTES } from "./src/content/notes.js";
import { openQuickCheck } from "./src/quickcheck.js";
import { Timer } from "./src/timer.js";

const PANELS = {
  engage: () => import("./src/panels/engage.js"),
  decay: () => import("./src/panels/decay.js"),
  ages: () => import("./src/panels/ages.js"),
  lhb: () => import("./src/panels/lhb.js"),
  chalk: () => import("./src/panels/chalk.js"),
  water: () => import("./src/panels/water.js"),
  rockcycle: () => import("./src/panels/rockcycle.js"),
  life: () => import("./src/panels/life.js"),
  evaluate: () => import("./src/panels/evaluate.js"),
  review: () => import("./src/panels/review.js"),
};

const $ = (id) => document.getElementById(id);

function boot() {
  const topbar = $("topbar"), stageEl = $("stage"), rail = $("rail"), overlays = $("overlays");
  let index = 0, cleanup = null, token = 0, notesOpen = false;

  // ---------- header ----------
  const brand = el("div", { class: "brand" }, [
    el("span", { class: "brand-glyph", "aria-hidden": "true", text: "🌑" }),
    el("div", {}, [el("div", { class: "brand-title", text: "Unit 2 · Stability of the Solar System" }), el("div", { class: "brand-sub", text: "5E classroom dashboard · Earth & Space Science" })]),
  ]);
  const prevBtn = el("button", { class: "tool-btn", type: "button", id: "prev", title: "Previous stage (←)", "aria-label": "Previous stage", text: "◀", onclick: () => go(index - 1) });
  const nextBtn = el("button", { class: "tool-btn primary", type: "button", id: "next", title: "Next stage (→)", "aria-label": "Next stage", text: "Next ▶", onclick: () => go(index + 1) });
  const notesBtn = el("button", { class: "tool-btn", type: "button", id: "notesBtn", title: "Teacher notes (N)", "aria-expanded": "false", text: "📋 Notes", onclick: () => toggleNotes() });
  const checkBtn = el("button", { class: "tool-btn", type: "button", id: "checkBtn", title: "Check for understanding (Q)", text: "❓ Check", onclick: () => openCheck() });
  const timerBtn = el("button", { class: "tool-btn", type: "button", id: "timerBtn", title: "Timer (T)", text: "⏱ Timer", onclick: () => toggleTimerPanel() });
  const focusBtn = el("button", { class: "tool-btn", type: "button", id: "focusBtn", title: "Hide toolbars (H)", text: "🔲 Focus", onclick: () => setFocus(true) });
  const fsBtn = el("button", { class: "tool-btn", type: "button", id: "fsBtn", title: "Full screen (F)", text: "⛶ Full screen", onclick: () => toggleFullscreen() });
  const helpBtn = el("button", { class: "tool-btn", type: "button", title: "Keyboard shortcuts (?)", "aria-label": "Keyboard shortcuts", text: "?", onclick: () => toggleHelp() });
  const hubLink = el("a", { class: "tool-btn link", href: "../index.html", title: "Back to Teacher Hub", text: "🏠" });
  topbar.append(brand, el("div", { class: "topbar-tools" }, [timerBtn, checkBtn, notesBtn, focusBtn, fsBtn, helpBtn, hubLink, prevBtn, nextBtn]));
  if (!document.documentElement.requestFullscreen) fsBtn.hidden = true;

  // floating mini toolbar (Focus mode)
  const floatBar = el("div", { class: "floatbar", hidden: true }, [
    el("button", { class: "tool-btn", type: "button", text: "◀", "aria-label": "Previous stage", onclick: () => go(index - 1) }),
    el("span", { class: "float-label", id: "floatLabel" }),
    el("button", { class: "tool-btn", type: "button", text: "▶", "aria-label": "Next stage", onclick: () => go(index + 1) }),
    el("button", { class: "tool-btn", type: "button", text: "❓", "aria-label": "Check for understanding", onclick: () => openCheck() }),
    el("button", { class: "tool-btn", type: "button", text: "📋", "aria-label": "Teacher notes", onclick: () => toggleNotes() }),
    el("button", { class: "tool-btn", type: "button", text: "Show toolbars", onclick: () => setFocus(false) }),
  ]);
  overlays.appendChild(floatBar);

  // ---------- rail ----------
  const railButtons = STAGES.map((s, i) => {
    const e = FIVE_E[s.fiveE];
    const b = el("button", { class: `rail-btn e-${s.fiveE}`, type: "button", title: `${i + 1}. ${e.label}: ${s.title}`, "aria-label": `Stage ${i + 1}: ${e.label}, ${s.short}`, onclick: () => go(i) }, [
      el("span", { class: "rail-num", text: String(i + 1) }),
      el("span", { class: "rail-text" }, [el("span", { class: "rail-e", text: e.label }), el("span", { class: "rail-name", text: s.short })]),
    ]);
    rail.appendChild(b);
    return b;
  });

  // ---------- notes drawer ----------
  const drawer = el("aside", { class: "drawer", id: "drawer", "aria-label": "Teacher notes", hidden: true });
  overlays.appendChild(drawer);

  function renderNotes() {
    const s = STAGES[index], n = NOTES[s.id];
    clear(drawer);
    const sec = (title, node) => el("section", { class: "n-sec" }, [el("h4", { text: title }), node]);
    const list = (items) => el("ul", {}, items.map((t) => el("li", { text: t })));
    drawer.append(
      el("header", { class: "drawer-head" }, [
        el("div", {}, [el("div", { class: "kicker", text: `${FIVE_E[s.fiveE].label} · ${n.minutes}` }), el("h3", { text: s.title })]),
        el("button", { class: "tool-btn", type: "button", text: "✕", "aria-label": "Close notes", onclick: () => toggleNotes(false) }),
      ]),
      el("div", { class: "drawer-body" }, [
        sec("Packet", el("p", { text: s.packet })),
        sec("Do Now / launch", el("p", { text: n.doNow })),
        sec("Suggested flow", el("ol", {}, n.flow.map((t) => el("li", { text: t })))),
        n.tto ? sec("Think – Talk – Open Exchange", el("p", { class: "tto", text: n.tto })) : null,
        sec("Answer key", el("dl", {}, n.answers.flatMap(([k, v]) => [el("dt", { text: k }), el("dd", { text: v })]))),
        sec("Look-fors", list(n.lookFors)),
        sec("Common misconceptions", list(n.misconceptions)),
        sec("Supports", list(n.support)),
      ]),
    );
  }
  function positionDrawer() {
    // Keep the toolbar and stage rail usable while the notes are open.
    drawer.style.top = `${topbar.offsetHeight}px`;
    drawer.style.bottom = `${rail.offsetHeight}px`;
  }
  window.addEventListener("resize", () => { if (notesOpen) positionDrawer(); });
  function toggleNotes(force) {
    notesOpen = force === undefined ? !notesOpen : force;
    drawer.hidden = !notesOpen;
    notesBtn.setAttribute("aria-expanded", String(notesOpen));
    notesBtn.classList.toggle("active", notesOpen);
    document.body.classList.toggle("notes-open", notesOpen);
    if (notesOpen) { renderNotes(); positionDrawer(); }
  }

  // ---------- timer ----------
  const timerPanel = el("div", { class: "timer-panel", hidden: true, role: "dialog", "aria-label": "Timer" });
  const timerDisplay = el("div", { class: "timer-display", text: "0:00" });
  const timer = new Timer((remaining, running, finished) => {
    const m = Math.floor(remaining / 60), s = Math.floor(remaining % 60);
    const txt = `${m}:${String(s).padStart(2, "0")}`;
    timerDisplay.textContent = txt;
    timerBtn.textContent = running || remaining > 0 ? `⏱ ${txt}` : "⏱ Timer";
    timerBtn.classList.toggle("running", running);
    timerBtn.classList.toggle("done", finished);
    timerDisplay.classList.toggle("done", finished);
  });
  timerPanel.append(
    timerDisplay,
    el("div", { class: "row" }, [1, 2, 3, 5, 10].map((m) => el("button", { class: "tool-btn", type: "button", text: `${m} min`, onclick: () => timer.set(m * 60) }))),
    el("div", { class: "row" }, [
      el("button", { class: "tool-btn primary", type: "button", text: "▶ / ⏸", onclick: () => timer.toggle() }),
      el("button", { class: "tool-btn", type: "button", text: "Reset", onclick: () => timer.reset() }),
      el("button", { class: "tool-btn", type: "button", text: "Close", onclick: () => toggleTimerPanel(false) }),
    ]),
  );
  overlays.appendChild(timerPanel);
  function toggleTimerPanel(force) { timerPanel.hidden = force === undefined ? !timerPanel.hidden : !force; }

  // ---------- help ----------
  const help = el("div", { class: "modal-backdrop", hidden: true, role: "dialog", "aria-modal": "true", "aria-label": "Keyboard shortcuts" }, [
    el("div", { class: "modal help" }, [
      el("h3", { text: "Keyboard shortcuts" }),
      el("dl", {}, [
        ["← →  or  PageUp / PageDown", "Previous / next stage"], ["1 – 9, 0", "Jump to stage 1–10"], ["N", "Teacher notes"], ["Q", "Check for understanding"],
        ["T", "Timer"], ["F", "Full screen"], ["H", "Focus (hide toolbars)"], ["Esc", "Close any overlay"], ["?", "This help"],
      ].flatMap(([k, v]) => [el("dt", {}, [el("kbd", { text: k })]), el("dd", { text: v })])),
      el("button", { class: "tool-btn primary", type: "button", text: "Close", onclick: () => toggleHelp(false) }),
    ]),
  ]);
  overlays.appendChild(help);
  function toggleHelp(force) { help.hidden = force === undefined ? !help.hidden : !force; }
  help.addEventListener("mousedown", (e) => { if (e.target === help) toggleHelp(false); });

  // ---------- quick check ----------
  function openCheck() {
    const s = STAGES[index];
    openQuickCheck(overlays, s.key || "ss-summative-quiz");
  }

  // ---------- focus + fullscreen ----------
  function setFocus(on) {
    document.body.classList.toggle("focus", on);
    floatBar.hidden = !on;
    if (notesOpen) positionDrawer();
  }
  function toggleFullscreen() {
    if (!document.documentElement.requestFullscreen) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }
  document.addEventListener("fullscreenchange", () => {
    const on = !!document.fullscreenElement;
    fsBtn.textContent = on ? "⛶ Exit full screen" : "⛶ Full screen";
    fsBtn.classList.toggle("active", on);
  });

  // ---------- stage rendering ----------
  async function go(i, { replace = false } = {}) {
    i = Math.max(0, Math.min(STAGES.length - 1, i));
    const my = ++token;
    index = i;
    const s = STAGES[i], e = FIVE_E[s.fiveE];
    document.body.dataset.fivee = s.fiveE;
    document.title = `${s.title} · Unit 2 Dashboard`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === STAGES.length - 1;
    railButtons.forEach((b, j) => { b.classList.toggle("active", j === i); if (j === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    railButtons[i].scrollIntoView({ block: "nearest", inline: "center" });
    $("floatLabel") && ($("floatLabel").textContent = `${i + 1}/${STAGES.length} · ${s.short}`);
    checkBtn.disabled = false;
    const url = new URL(location.href); url.hash = s.id;
    history[replace ? "replaceState" : "pushState"](null, "", url);
    if (notesOpen) renderNotes();

    if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
    clear(stageEl);
    const head = el("header", { class: `stage-head e-${s.fiveE}` }, [
      el("div", { class: "stage-tag" }, [el("span", { "aria-hidden": "true", text: e.glyph }), ` ${e.label} · ${i + 1} of ${STAGES.length}`]),
      el("h1", { class: "stage-title", text: s.title }),
      el("p", { class: "stage-q", text: s.question }),
    ]);
    const body = el("div", { class: "stage-body", id: "stageBody" }, [el("div", { class: "loading", text: "Loading…" })]);
    stageEl.append(head, body);
    try {
      const mod = await PANELS[s.id]();
      if (my !== token) return;
      clear(body);
      cleanup = mod.mount(body, { stage: s }) || null;
    } catch (err) {
      if (my !== token) return;
      clear(body);
      body.appendChild(el("div", { class: "panel-error", text: `This panel failed to load: ${err.message || err}` }));
      console.error(err);
    }
  }

  // ---------- keyboard ----------
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag) && !(tag === "INPUT" && ["range", "checkbox"].includes(e.target.type));
    if (typing) return;
    if (document.querySelector(".modal-backdrop:not([hidden])") && e.key !== "Escape" && e.key !== "?") return;
    const k = e.key;
    if (k === "Escape") {
      if (!help.hidden) toggleHelp(false);
      else if (!timerPanel.hidden) toggleTimerPanel(false);
      else if (notesOpen) toggleNotes(false);
      else if (document.body.classList.contains("focus")) setFocus(false);
      return;
    }
    // Sliders use arrows; do not hijack them.
    const onRange = tag === "INPUT" && e.target.type === "range";
    if ((k === "ArrowRight" || k === "ArrowLeft") && onRange) return;
    if (k === "ArrowRight" || k === "PageDown") { e.preventDefault(); go(index + 1); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); go(index - 1); }
    else if (/^[0-9]$/.test(k)) { go(k === "0" ? 9 : parseInt(k, 10) - 1); }
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "q" || k === "Q") openCheck();
    else if (k === "t" || k === "T") toggleTimerPanel();
    else if (k === "f" || k === "F") toggleFullscreen();
    else if (k === "h" || k === "H") setFocus(!document.body.classList.contains("focus"));
    else if (k === "?") toggleHelp();
  });

  window.addEventListener("popstate", () => go(resolveStage(location.hash || new URLSearchParams(location.search).get("stage")), { replace: true }));

  const params = new URLSearchParams(location.search);
  go(resolveStage(location.hash || params.get("stage")), { replace: true });
  if (params.get("focus") === "1") setFocus(true);

  window.__unit2 = { go, get index() { return index; } };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
