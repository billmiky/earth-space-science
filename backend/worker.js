// backend/worker.js — Cloudflare Worker that proxies a small, allowlisted set
// of astronomy data APIs that do NOT send CORS headers, and caches responses.
//
// This worker is NOT an open proxy: every upstream query is validated and
// bounded here. Secrets (none are required for these public endpoints) must
// never appear in frontend code.

// Configuration (set via wrangler.toml `vars`, or the Cloudflare dashboard):
//   ALLOWED_ORIGINS — comma-separated list of allowed browser origins (e.g.
//                     "https://billmiky.github.io"), or "*" for local dev only.
//                     If unset, no CORS headers are returned (requests from
//                     browsers are blocked; non-browser fetches still work).

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const raw = (env && env.ALLOWED_ORIGINS) || "";
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.includes("*") || (origin && allowed.includes(origin))) {
    return {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    };
  }
  return {};
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

// --- Bounded upstream queries -----------------------------------------------

// Curated exoplanet list. The WHERE clause is fixed — the client cannot inject SQL.
const CURATED_NAMES = [
  "51 Peg b", "GJ 1214 b", "HD 209458 b", "K2-18 b", "Kepler-186 f",
  "Kepler-22 b", "Kepler-442 b", "Kepler-452 b", "Kepler-62 f", "LHS 1140 b",
  "Proxima Cen b", "TOI-700 d", "TRAPPIST-1 e", "TRAPPIST-1 f",
  "TRAPPIST-1 g", "WASP-12 b",
];

const EXOPLANET_COLUMNS =
  "pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_orbeccen,pl_eqt,pl_orbsmax," +
  "st_teff,st_mass,st_rad,st_lum,disc_year,discoverymethod,sy_dist";

const TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

async function getExoplanetCurated() {
  const quoted = CURATED_NAMES.map((n) => `'${n.replace(/'/g, "''")}'`).join(",");
  const query = `select ${EXOPLANET_COLUMNS} from pscomppars where pl_name in (${quoted}) order by pl_name`;
  const url = `${TAP_URL}?${new URLSearchParams({ query, format: "json" })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TAP HTTP ${res.status}`);
  const planets = await res.json();
  return {
    source: "NASA Exoplanet Archive TAP service",
    table: "pscomppars (Planetary Systems Composite Parameters)",
    retrieved_at: new Date().toISOString(),
    planets,
  };
}

const SBDB_URL = "https://ssd-api.jpl.nasa.gov/sbdb.api";
// Allowlist of small bodies we are willing to proxy (bounded).
const SBDB_ALLOWED = new Set(["19P"]);

async function getSbdb(obj) {
  const url = `${SBDB_URL}?${new URLSearchParams({ sstr: obj })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SBDB HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !data.orbit || !Array.isArray(data.orbit.elements)) {
    throw new Error("Unexpected SBDB response");
  }
  const els = {};
  for (const item of data.orbit.elements) {
    const name = item.name;
    if (name === "e") els.e = parseFloat(item.value);
    else if (name === "a") els.a_au = parseFloat(item.value);
    else if (name === "q") els.q_au = parseFloat(item.value);
    else if (name === "Q") els.Q_au = parseFloat(item.value);
    else if (name === "i") els.i_deg = parseFloat(item.value);
    else if (name === "om") els.node_deg = parseFloat(item.value);
    else if (name === "w") els.peri_deg = parseFloat(item.value);
    else if (name === "ma") els.M_deg = parseFloat(item.value);
    else if (name === "tp") els.tp_jd = parseFloat(item.value);
    else if (name === "per") els.period_days = parseFloat(item.value);
    else if (name === "n") els.n_deg_day = parseFloat(item.value);
  }
  return {
    source: "NASA/JPL Small-Body Database (SBDB) API",
    object: data.object ? data.object.fullname : obj,
    retrieved_at: new Date().toISOString(),
    elements: els,
  };
}

// --- Cache helpers ----------------------------------------------------------

async function cachedJson(request, cacheKey, ttlSeconds, producer) {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;
  const body = await producer();
  const response = json(body);
  response.headers.set("Cache-Control", `public, max-age=${ttlSeconds}`);
  // Cache API requires a Response; put only successful JSON.
  await cache.put(request, response.clone());
  return response;
}

// --- Request handler --------------------------------------------------------

async function handle(request, env) {
  const url = new URL(request.url);
  const extra = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: extra });
  }
  if (request.method !== "GET") {
    return json({ error: "method not allowed" }, 405, extra);
  }

  const path = url.pathname.replace(/\/+$/, "");

  try {
    if (path === "/exoplanet/curated") {
      return await cachedJson(request, "exoplanet-curated", 24 * 3600, getExoplanetCurated)
        .then((r) => new Response(r.body, { status: r.status, headers: { ...Object.fromEntries(r.headers), ...extra } }));
    }

    if (path === "/sbdb") {
      const obj = url.searchParams.get("obj") || "";
      if (!SBDB_ALLOWED.has(obj)) {
        return json({ error: "object not allowed" }, 400, extra);
      }
      return await cachedJson(request, `sbdb-${obj}`, 7 * 24 * 3600, () => getSbdb(obj))
        .then((r) => new Response(r.body, { status: r.status, headers: { ...Object.fromEntries(r.headers), ...extra } }));
    }

    if (path === "/health") {
      return json({ ok: true, service: "earth-space-science teacher backend" }, 200, extra);
    }

    return json({ error: "not found" }, 404, extra);
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) }, 502, extra);
  }
}

export default {
  async fetch(request, env) {
    return handle(request, env);
  },
};
