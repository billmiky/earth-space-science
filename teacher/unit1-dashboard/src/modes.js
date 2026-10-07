// modes.js — Presentation "mode" metadata: which thematic strand and 5E stage
// each panel belongs to. Pure data/lookup only (no DOM), so it can be reused
// by layout.js (mode header band) and tested independently.
//
// Modes group panels by classroom topic and drive the accent used in the
// mode header band. Colors are never the only way meaning is conveyed —
// every mode also has a text label and an icon glyph.

export const MODES = {
  sun: {
    key: "sun",
    label: "How the Sun Works",
    glyph: "☀",
    cssClass: "mode-sun",
  },
  star: {
    key: "star",
    label: "Star Life Cycles",
    glyph: "✦",
    cssClass: "mode-star",
  },
  planets: {
    key: "planets",
    label: "Planets and Orbits",
    glyph: "◐",
    cssClass: "mode-planets",
  },
};

/** Panel key -> mode key. */
export const PANEL_MODE = {
  "solar": "sun",
  "solar-system": "planets",
  "borrelly": "planets",
  "exoplanet": "planets",
  "host-star": "star",
  "observing": "planets",
};

/**
 * Panel key -> 5E instructional stage(s), matching the teacher guide
 * (teacher/unit1-guide.qmd). Shown as a persistent badge in the mode header
 * band — never used as the only cue for anything (it is text).
 */
export const PANEL_FIVE_E = {
  "solar": { stage: "engage-explore", label: "Engage + Explore" },
  "solar-system": { stage: "explore", label: "Explore" },
  "borrelly": { stage: "engage-explore", label: "Engage + Explore" },
  "exoplanet": { stage: "evaluate", label: "Evaluate" },
  "host-star": { stage: "explain-elaborate", label: "Explain + Elaborate" },
  "observing": { stage: "extend", label: "Extend" },
};

/** Look up mode metadata for a panel key, with a safe fallback. */
export function modeForPanel(panelKey) {
  return MODES[PANEL_MODE[panelKey]] || MODES.planets;
}

/** Look up 5E metadata for a panel key, with a safe fallback. */
export function fiveEForPanel(panelKey) {
  return PANEL_FIVE_E[panelKey] || { stage: "explore", label: "Explore" };
}
