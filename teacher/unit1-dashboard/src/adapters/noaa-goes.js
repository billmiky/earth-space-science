// adapters/noaa-goes.js — NOAA SWPC GOES X-ray flux adapter.

import { CONFIG } from "../config.js";
import { cachedFetch } from "../cache.js";
import { normalizeGoesSeries } from "../models.js";

/**
 * Load GOES X-ray data for the long channel.
 * @param {"day"|"threeDay"} span
 * @returns Promise<{ status, series, fetchedAt, error, source }>
 */
export async function loadGoesXrays(span = "day") {
  const url = span === "threeDay" ? CONFIG.noaaXrays.threeDay : CONFIG.noaaXrays.day;
  const key = `noaa-goes-xrays-${span}`;
  const result = await cachedFetch(key, url, { maxAgeMs: CONFIG.noaaXrays.refreshMs });
  const series = result.status === "error" ? [] : normalizeGoesSeries(result.data, CONFIG.noaaXrays.channel);
  return {
    status: result.status,
    series,
    fetchedAt: result.fetchedAt,
    error: result.error ? String(result.error.message || result.error) : null,
    source: "NOAA SWPC · GOES X-ray flux (0.1–0.8 nm)",
    units: "W/m²",
  };
}

/** Peak flux value and time within a series. */
export function seriesPeak(series) {
  if (!series || series.length === 0) return { value: null, timeMs: null };
  let peak = series[0];
  for (const r of series) {
    if (r.flux > peak.flux) peak = r;
  }
  return { value: peak.flux, timeMs: peak.timeMs };
}

/** Latest record in a sorted series. */
export function seriesLatest(series) {
  if (!series || series.length === 0) return null;
  return series[series.length - 1];
}
