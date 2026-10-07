// config.js — Central configuration: endpoints, refresh intervals, backend URL.

export const CONFIG = {
  // NOAA Space Weather Prediction Center — GOES X-ray flux (CORS enabled).
  noaaXrays: {
    day: "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json",
    threeDay: "https://services.swpc.noaa.gov/json/goes/primary/xrays-3-day.json",
    // GOES long channel (0.1–0.8 nm), used for A/B/C/M/X flare classes.
    channel: "0.1-0.8nm",
    refreshMs: 5 * 60 * 1000,
  },

  // NASA Exoplanet Archive TAP (no CORS headers — needs backend or bundled data).
  exoplanet: {
    table: "pscomppars",
    bundled: "data/exoplanets.json",
    refreshMs: 24 * 60 * 60 * 1000, // daily or longer
  },

  // Reference star data for the H–R diagram (bundled).
  referenceStars: "data/reference-stars.json",

  // JPL SBDB osculating elements for 19P/Borrelly (no CORS — bundled snapshot).
  borrelly: {
    bundled: "data/borrelly-elements.json",
    refreshMs: 7 * 24 * 60 * 60 * 1000, // weekly is plenty for osculating elements
  },

  // Ephemerides are computed client-side (Meeus) and refreshed locally.
  ephemeris: {
    refreshMs: 6 * 60 * 60 * 1000,
  },

  // Minimum viewport width (px) for a side-by-side two-panel layout.
  twoPanelSideBySideMinWidth: 1080,
  // Minimum viewport height (px) for a side-by-side two-panel layout.
  twoPanelSideBySideMinHeight: 560,
};

/**
 * Resolve the backend base URL. Priority:
 *   1. explicit ?backend= URL parameter (stored in state)
 *   2. window.ESS_BACKEND_BASE_URL global (set by a site script)
 * Returns "" (no backend) when unset.
 */
export function resolveBackendBase(state) {
  if (state && state.backend) return state.backend.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.ESS_BACKEND_BASE_URL) {
    return String(window.ESS_BACKEND_BASE_URL).replace(/\/+$/, "");
  }
  return "";
}
