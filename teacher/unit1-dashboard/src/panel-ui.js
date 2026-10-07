// panel-ui.js — Shared, reusable presentation widgets for panels: metric
// cards, data-type/"not to scale" tags, attributed imagery slots, and a
// no-persistence predict/reveal/compare interaction. Kept separate from
// dom.js so panel components can opt in without bloating the tiny DOM helpers.

import { el } from "./dom.js";
import { CONFIG } from "./config.js";

let promptsPromise = null;

/** Fetch (and cache) the phenomenon-first prompt data file. */
function loadPrompts() {
  if (!promptsPromise) {
    promptsPromise = fetch(CONFIG.prompts)
      .then((res) => (res.ok ? res.json() : { panels: {} }))
      .catch(() => ({ panels: {} }));
  }
  return promptsPromise;
}

/** Resolve the phenomenon-first prompt for a panel key. Never throws. */
export async function promptForPanel(panelKey) {
  const data = await loadPrompts();
  return (data.panels && data.panels[panelKey]) || null;
}

/**
 * Build the mode header band shown above a panel's title: a mode chip
 * (topic + glyph, not color-only), a 5E stage badge, and a large
 * phenomenon-first prompt line loaded from data/prompts.json.
 */
export function buildModeHeader(mode, fiveE, promptText) {
  const band = el("div", { class: "mode-band " + mode.cssClass });
  const chips = el("div", { class: "mode-chips" }, [
    el("span", { class: "mode-chip", text: mode.glyph + " " + mode.label }),
    el("span", { class: "stage-chip", text: "5E · " + fiveE.label }),
  ]);
  band.appendChild(chips);
  if (promptText) {
    band.appendChild(el("p", { class: "mode-prompt", text: promptText }));
  }
  return band;
}

/** Small, never-color-only badge for Observed / Calculated / Catalog / Derived values. */
export function dataTypeBadge(kind) {
  const glyphs = { observed: "●", calculated: "▲", catalog: "■", derived: "◆", predicted: "▲" };
  const label = { observed: "Observed", calculated: "Calculated", catalog: "Catalog", derived: "Derived", predicted: "Calculated / predicted" };
  const k = (kind || "").toLowerCase();
  const safeKind = glyphs[k] ? k : "calculated";
  return el("span", { class: "data-tag tag-" + safeKind, text: (glyphs[safeKind] || "▲") + " " + (label[safeKind] || kind) });
}

/** "Not to scale" tag — always paired with text, never a color-only cue. */
export function notScaleTag(text = "Not to scale") {
  return el("span", { class: "scale-tag", text: "⚠ " + text });
}

/**
 * A large, skimmable metric card: big number + unit + plain-language label,
 * an optional data-type tag, and a collapsible details table for the dense
 * readout a reader may want (kept intact, never removed).
 */
export function metricCard({ value, unit, label, sub, dataType, notScale, details, detailsLabel }) {
  const card = el("div", { class: "metric-card" });
  const topRow = el("div", { class: "metric-tags" });
  if (dataType) topRow.appendChild(dataTypeBadge(dataType));
  if (notScale) topRow.appendChild(notScaleTag());
  if (topRow.childNodes.length) card.appendChild(topRow);

  card.appendChild(el("div", { class: "metric-value" }, [
    el("span", { class: "metric-number", text: value }),
    unit ? el("span", { class: "metric-unit", text: unit }) : null,
  ]));
  card.appendChild(el("div", { class: "metric-label", text: label }));
  if (sub) card.appendChild(el("div", { class: "metric-sub", text: sub }));

  if (Array.isArray(details) && details.length) {
    const d = el("details", { class: "metric-details" });
    d.appendChild(el("summary", { text: detailsLabel || "Details" }));
    const table = el("div", { class: "metric-details-table" });
    for (const [k, v] of details) {
      table.appendChild(el("div", { class: "metric-details-row" }, [
        el("span", { class: "fact-label", text: k }),
        el("span", { class: "fact-value", text: v }),
      ]));
    }
    d.appendChild(table);
    card.appendChild(d);
  }
  return card;
}

/** Briefly pulse a card/element to mark a newly updated value. CSS disables
 * this under prefers-reduced-motion and the caller should skip it entirely
 * while the dashboard is frozen. */
export function markUpdated(element) {
  if (!element) return;
  element.classList.remove("just-updated");
  // Force reflow so re-adding the class restarts the animation.
  void element.offsetWidth;
  element.classList.add("just-updated");
}

/**
 * An attributed image slot for real NASA/ESA imagery. Shows a clean
 * fallback card (no broken-image icon) and an unobtrusive notice if the
 * image fails to load. Never renders the NASA insignia/logotype/seal —
 * only photographic or illustrative content supplied by the caller.
 */
export function imageSlot({ src, alt, credit, creditHref, caption, fallbackText }) {
  const figure = el("figure", { class: "img-slot" });
  const frame = el("div", { class: "img-frame" });
  const img = el("img", {
    src, alt, loading: "lazy", decoding: "async", class: "img-real",
  });
  const fallback = el("div", { class: "img-fallback", hidden: "true" }, [
    el("span", { class: "img-fallback-icon", "aria-hidden": "true", text: "✦" }),
    el("span", { class: "img-fallback-text", text: fallbackText || "Image unavailable right now." }),
  ]);
  img.addEventListener("error", () => {
    img.hidden = true;
    fallback.hidden = false;
  });
  frame.appendChild(img);
  frame.appendChild(fallback);
  figure.appendChild(frame);

  const figcap = el("figcaption", { class: "img-credit" });
  if (caption) figcap.appendChild(el("span", { class: "img-caption", text: caption }));
  if (credit) {
    const creditSpan = el("span", { class: "img-attrib" });
    creditSpan.appendChild(document.createTextNode(credit + " · "));
    creditSpan.appendChild(el("a", { href: creditHref || "#", target: "_blank", rel: "noopener noreferrer", text: "Source" }));
    figcap.appendChild(creditSpan);
  }
  figure.appendChild(figcap);
  return figure;
}

/**
 * A no-persistence Predict → Reveal → Compare interaction. All state lives
 * in local closure variables only; nothing is written to the store or
 * localStorage, so no student data is retained.
 *
 * @param {object} cfg
 * @param cfg.question - phenomenon-style question (should not name the
 *   underlying mechanism).
 * @param cfg.options - array of short choice strings.
 * @param cfg.getActual - () => { label: string, optionIndex: number|null }
 *   called at Reveal time to fetch the current real value/direction.
 * @param cfg.explain - (actual) => string, shown at Compare time.
 */
export function predictReveal({ question, options, getActual, explain }) {
  const wrap = el("div", { class: "predict-reveal" });
  wrap.appendChild(el("p", { class: "pr-question", text: question }));

  let chosen = null;
  let actual = null;

  const choiceGroup = el("div", { class: "pr-choices", role: "radiogroup", "aria-label": question });
  const choiceButtons = options.map((opt, idx) => {
    const btn = el("button", {
      class: "chip pr-choice",
      "aria-pressed": "false",
      text: opt,
      onclick: () => {
        chosen = idx;
        for (const b of choiceButtons) b.classList.toggle("active", b === btn);
        for (const b of choiceButtons) b.setAttribute("aria-pressed", String(b === btn));
        predictBtn.disabled = false;
      },
    });
    return btn;
  });
  for (const b of choiceButtons) choiceGroup.appendChild(b);
  wrap.appendChild(choiceGroup);

  const actions = el("div", { class: "pr-actions" });
  const predictBtn = el("button", { class: "tool-btn pr-predict", text: "Predict", disabled: "true", onclick: () => {
    status.textContent = "Prediction locked in: \u201c" + options[chosen] + "\u201d. Click Reveal when ready.";
    status.className = "pr-status pr-locked";
    revealBtn.disabled = false;
    predictBtn.disabled = true;
    for (const b of choiceButtons) b.disabled = true;
  } });
  const revealBtn = el("button", { class: "tool-btn pr-reveal", text: "Reveal", disabled: "true", onclick: () => {
    actual = getActual();
    status.textContent = "Actual: " + actual.label;
    status.className = "pr-status pr-revealed";
    compareBtn.disabled = false;
  } });
  const compareBtn = el("button", { class: "tool-btn pr-compare", text: "Compare", disabled: "true", onclick: () => {
    const matched = actual.optionIndex !== null && actual.optionIndex === chosen;
    status.textContent = (matched ? "Your prediction matched. " : "Your prediction didn't match. ") +
      (explain ? explain(actual) : "");
    status.className = "pr-status " + (matched ? "pr-match" : "pr-mismatch");
  } });
  const resetBtn = el("button", { class: "tool-btn pr-reset", text: "Try again", onclick: () => {
    chosen = null; actual = null;
    for (const b of choiceButtons) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); b.disabled = false; }
    predictBtn.disabled = true; revealBtn.disabled = true; compareBtn.disabled = true;
    status.textContent = "Make a prediction, then reveal the real value.";
    status.className = "pr-status";
  } });
  actions.appendChild(predictBtn);
  actions.appendChild(revealBtn);
  actions.appendChild(compareBtn);
  actions.appendChild(resetBtn);
  wrap.appendChild(actions);

  const status = el("p", { class: "pr-status", text: "Make a prediction, then reveal the real value." });
  wrap.appendChild(status);

  return wrap;
}
