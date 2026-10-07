// adapters/borrelly.js — 19P/Borrelly osculating elements adapter.
// Bundled JPL SBDB snapshot with optional backend refresh.

import { CONFIG, resolveBackendBase } from "../config.js";

/**
 * Load Borrelly orbital elements.
 * @returns Promise<{ status, elements, meta, error }>
 */
export async function loadBorrellyElements(state = {}) {
  const backend = resolveBackendBase(state);

  let bundled;
  try {
    const res = await fetch(CONFIG.borrelly.bundled);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    bundled = await res.json();
  } catch (err) {
    return { status: "error", elements: null, meta: null, error: String(err.message || err) };
  }

  const meta = {
    source: bundled.source,
    object: bundled.object,
    retrievedAt: bundled.retrieved_at,
    solutionDate: bundled.solution_date,
    note: bundled.calculation_note,
    mode: "bundled",
  };

  if (backend) {
    try {
      const res = await fetch(
        `${backend}/sbdb?obj=19P`,
        { signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined }
      );
      if (res.ok) {
        const live = await res.json();
        if (live && live.elements && typeof live.elements.e === "number") {
          meta.source = live.source || meta.source;
          meta.retrievedAt = live.retrieved_at || meta.retrievedAt;
          meta.mode = "live";
          return { status: "fresh", elements: live.elements, meta, error: null };
        }
      }
    } catch {
      meta.mode = "bundled-stale";
    }
  }

  return { status: "fresh", elements: bundled.elements, meta, error: null };
}
