// adapters/exoplanet-catalog.js — NASA Exoplanet Archive catalog adapter.
// Primary path: bundled curated snapshot (real catalog data with provenance).
// Optional path: live TAP refresh through a configurable backend (Cloudflare
// Worker) because the archive TAP service does not send CORS headers.

import { CONFIG, resolveBackendBase } from "../config.js";
import { normalizeExoplanetRow } from "../models.js";

// In-memory memo so Panel D and Panel E share a single load.
let _memo = null;

/**
 * Load the curated exoplanet list.
 * @param {object} state — store state (may carry a backend URL)
 * @returns Promise<{ status, planets, meta, error }>
 */
export async function loadExoplanetCatalog(state = {}) {
  if (_memo) return _memo;
  _memo = doLoad(state);
  return _memo;
}

async function doLoad(state) {
  const backend = resolveBackendBase(state);

  // 1. Bundled snapshot always loads (fast, no network).
  let bundled;
  try {
    const res = await fetch(CONFIG.exoplanet.bundled);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    bundled = await res.json();
  } catch (err) {
    return { status: "error", planets: [], meta: null, error: String(err.message || err) };
  }

  const meta = {
    source: bundled.source,
    table: bundled.table,
    retrievedAt: bundled.retrieved_at,
    units: bundled.units,
    mode: "bundled",
  };

  // 2. If a backend is configured, attempt a live refresh (bounded query).
  if (backend) {
    try {
      const res = await fetch(
        `${backend}/exoplanet/curated`,
        { signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined }
      );
      if (res.ok) {
        const live = await res.json();
        if (live && Array.isArray(live.planets) && live.planets.length > 0) {
          bundled = live;
          meta.source = live.source;
          meta.table = live.table;
          meta.retrievedAt = live.retrieved_at;
          meta.mode = "live";
        }
      }
    } catch {
      // Live refresh failed — fall back to the bundled snapshot (honest label).
      meta.mode = "bundled-stale";
    }
  }

  const planets = (bundled.planets || []).map(normalizeExoplanetRow);
  return { status: "fresh", planets, meta, error: null };
}
