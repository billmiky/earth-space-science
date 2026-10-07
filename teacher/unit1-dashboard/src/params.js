// params.js — Pure URL-parameter and preset logic (no DOM, fully testable).

export const PANEL_KEYS = [
  "solar",
  "solar-system",
  "borrelly",
  "exoplanet",
  "host-star",
  "observing",
];

export const PANEL_LABELS = {
  "solar": "A · Solar Activity Now",
  "solar-system": "B · Solar System Now",
  "borrelly": "C · Earth vs. Comet Borrelly",
  "exoplanet": "D · Earth–Exoplanet Comparison",
  "host-star": "E · Meet the Host Star",
  "observing": "F · Tonight's Observing Targets",
};

export const PRESETS = {
  "solar-record": {
    label: "Solar record",
    panel: "solar",
    panel2: null,
    layout: "single",
  },
  "orbits-evidence": {
    label: "Orbits and evidence",
    panel: "solar-system",
    panel2: "borrelly",
    layout: "two",
  },
  "planet-parent-star": {
    label: "Planet and parent star",
    panel: "exoplanet",
    panel2: "host-star",
    layout: "two",
  },
  "plan-observe": {
    label: "Plan and observe",
    panel: "solar-system",
    panel2: "observing",
    layout: "two",
  },
};

export function isPanelKey(k) {
  return PANEL_KEYS.includes(k);
}

export function isLayout(v) {
  return v === "single" || v === "two";
}

/**
 * Parse and validate URL query parameters.
 * Returns an object with only the explicitly provided (and valid) parameters.
 * Invalid values are dropped so they can fall back to saved preferences.
 */
export function parseParams(queryString) {
  const out = {};
  if (!queryString) return out;
  const q = queryString.replace(/^\?/, "");
  if (!q) return out;
  const params = new URLSearchParams(q);

  const panel = params.get("panel") || params.get("p");
  if (panel && isPanelKey(panel)) out.panel = panel;

  const panel2 = params.get("panel2") || params.get("p2");
  if (panel2 && isPanelKey(panel2)) out.panel2 = panel2;

  const layout = params.get("layout");
  if (layout && isLayout(layout)) out.layout = layout;

  const preset = params.get("preset");
  if (preset && Object.prototype.hasOwnProperty.call(PRESETS, preset)) out.preset = preset;

  if (params.get("freeze") === "1") out.freeze = true;
  if (params.get("freeze") === "0") out.freeze = false;

  const date = params.get("date");
  if (date && !Number.isNaN(new Date(date).getTime())) out.date = date;

  const planet = params.get("planet");
  if (planet) out.exoplanet = planet;

  const backend = params.get("backend");
  if (backend && /^https?:\/\//.test(backend)) out.backend = backend;

  return out;
}

/**
 * Apply a preset to a state object (does not mutate the input).
 */
export function applyPreset(presetName, state) {
  const preset = PRESETS[presetName];
  if (!preset) return state;
  const next = { ...state, preset: presetName };
  next.panel = preset.panel;
  next.layout = preset.layout;
  next.panel2 = preset.layout === "two" ? preset.panel2 : null;
  // Presets never force freezing on.
  if (presetName !== state.preset) next.frozen = state.frozen || false;
  return next;
}

/**
 * Enforce "no duplicate panels". If secondary equals primary, the secondary
 * selection is cleared. Returns { panel, panel2 }.
 */
export function dedupePanels(panel, panel2) {
  if (panel2 && panel2 === panel) {
    return { panel, panel2: null };
  }
  return { panel, panel2 };
}

/** Build a query string for a state so teachers can bookmark/share a view. */
export function serializeState(state) {
  const parts = [];
  if (state.panel) parts.push(`panel=${encodeURIComponent(state.panel)}`);
  if (state.layout === "two" && state.panel2) parts.push(`panel2=${encodeURIComponent(state.panel2)}`);
  if (state.layout) parts.push(`layout=${encodeURIComponent(state.layout)}`);
  if (state.preset) parts.push(`preset=${encodeURIComponent(state.preset)}`);
  if (state.frozen) parts.push("freeze=1");
  return parts.length ? "?" + parts.join("&") : "";
}

/**
 * Resolve the effective state from URL parameters merged over saved
 * preferences. URL parameters override saved preferences when explicitly
 * present. Presets (when provided by URL) override individual panel/layout
 * params.
 */
export function resolveState(urlParams, savedPrefs) {
  let state = { ...savedPrefs };
  if (urlParams.preset) {
    state = applyPreset(urlParams.preset, state);
  }
  if (urlParams.panel) state.panel = urlParams.panel;
  if (urlParams.layout) state.layout = urlParams.layout;
  if (urlParams.panel2 !== undefined) {
    state.panel2 = urlParams.panel2;
  } else if (urlParams.preset && urlParams.layout !== "two") {
    // preset already set panel2; keep it
  }
  if (urlParams.layout === "single") state.panel2 = null;
  if (urlParams.freeze !== undefined) state.frozen = urlParams.freeze;
  if (urlParams.date) state.date = urlParams.date;
  if (urlParams.exoplanet) state.exoplanet = urlParams.exoplanet;
  if (urlParams.backend) state.backend = urlParams.backend;
  const deduped = dedupePanels(state.panel, state.panel2);
  state.panel = deduped.panel;
  state.panel2 = deduped.panel2;
  if (state.layout !== "two" && state.panel2) {
    // A second panel only makes sense in two-panel mode.
    state.panel2 = null;
  }
  return state;
}

/** Default preferences used when nothing has been saved yet. */
export function defaultPrefs() {
  return {
    panel: "solar",
    panel2: null,
    layout: "single",
    preset: null,
    frozen: false,
    frozenAt: null,
    exoplanet: "TRAPPIST-1 e",
    date: null,
    observing: {
      name: "New York City, NY",
      lat: 40.7128,
      lon: -74.006,
      tz: "America/New_York",
      hour: 21,
      minute: 0,
    },
    backend: "",
  };
}

/** Namespaced localStorage key. */
export const STORAGE_KEY = "ess.unit1.dashboard.v1";
