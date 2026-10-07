// models.js — Normalized data models and normalization helpers (pure).

/**
 * Normalize a raw NOAA GOES X-ray record into the dashboard model.
 * Raw fields: time_tag, satellite, flux, observed_flux, electron_correction,
 * electron_contaminaton, energy.
 */
export function normalizeGoesRecord(raw) {
  const t = new Date(raw.time_tag).getTime();
  return {
    timeMs: Number.isNaN(t) ? null : t,
    timeTag: raw.time_tag || null,
    satellite: raw.satellite ?? null,
    flux: typeof raw.flux === "number" ? raw.flux : null, // W/m^2 (corrected)
    observedFlux: typeof raw.observed_flux === "number" ? raw.observed_flux : null,
    electronCorrection: typeof raw.electron_correction === "number" ? raw.electron_correction : null,
    contaminated: raw.electron_contaminaton === true,
    channel: raw.energy || null,
  };
}

/**
 * Filter + normalize a NOAA GOES array to a single wavelength channel,
 * sorted by time. Drops records with unparsable timestamps or missing flux.
 */
export function normalizeGoesSeries(rawArray, channel) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray
    .map(normalizeGoesRecord)
    .filter((r) => r.timeMs !== null && r.flux !== null && r.channel === channel)
    .sort((a, b) => a.timeMs - b.timeMs);
}

/** Flare-class band boundaries for the GOES long channel (W/m^2). */
export const FLARE_BANDS = [
  { cls: "A", min: 1e-8, max: 1e-7, color: "#6ee7b7", label: "A (1e-8)" },
  { cls: "B", min: 1e-7, max: 1e-6, color: "#a3e635", label: "B (1e-7)" },
  { cls: "C", min: 1e-6, max: 1e-5, color: "#fde047", label: "C (1e-6)" },
  { cls: "M", min: 1e-5, max: 1e-4, color: "#fb923c", label: "M (1e-5)" },
  { cls: "X", min: 1e-4, max: 1e-3, color: "#f87171", label: "X (1e-4)" },
];

/** Classify a flux value (W/m^2) into a flare class letter. */
export function flareClass(flux) {
  if (flux === null || flux === undefined || Number.isNaN(flux)) return null;
  if (flux >= 1e-4) return "X";
  if (flux >= 1e-5) return "M";
  if (flux >= 1e-6) return "C";
  if (flux >= 1e-7) return "B";
  return "A";
}

/**
 * Normalize an exoplanet archive (pscomppars) row into the dashboard model.
 * Keeps raw values plus computed linear luminosity and distance in ly.
 */
export function normalizeExoplanetRow(raw) {
  const logL = typeof raw.st_lum === "number" ? raw.st_lum : null;
  const lumLinear = logL === null ? null : Math.pow(10, logL);
  const syDistPc = typeof raw.sy_dist === "number" ? raw.sy_dist : null;
  const distLy = syDistPc === null ? null : syDistPc * 3.26156;
  return {
    plName: raw.pl_name ?? null,
    hostname: raw.hostname ?? null,
    radiusEarth: typeof raw.pl_rade === "number" ? raw.pl_rade : null,
    massEarth: typeof raw.pl_bmasse === "number" ? raw.pl_bmasse : null,
    orbitalPeriodDays: typeof raw.pl_orbper === "number" ? raw.pl_orbper : null,
    eccentricity: typeof raw.pl_orbeccen === "number" ? raw.pl_orbeccen : null,
    equilibriumTempK: typeof raw.pl_eqt === "number" ? raw.pl_eqt : null,
    semiMajorAxisAu: typeof raw.pl_orbsmax === "number" ? raw.pl_orbsmax : null,
    starTeffK: typeof raw.st_teff === "number" ? raw.st_teff : null,
    starMassMsun: typeof raw.st_mass === "number" ? raw.st_mass : null,
    starRadiusRsun: typeof raw.st_rad === "number" ? raw.st_rad : null,
    starLumLog10: logL,
    starLumLinear: lumLinear,
    discYear: typeof raw.disc_year === "number" ? raw.disc_year : null,
    discoveryMethod: raw.discoverymethod ?? null,
    distancePc: syDistPc,
    distanceLy: distLy,
  };
}

/**
 * Derive stellar luminosity from Teff and radius using the
 * Stefan–Boltzmann law assuming a blackbody (T_sun = 5772 K).
 * Clearly labelled as a DERIVED value wherever displayed.
 */
export function derivedLuminosity(teffK, radiusRsun) {
  if (teffK === null || radiusRsun === null || Number.isNaN(teffK) || Number.isNaN(radiusRsun)) {
    return null;
  }
  const TSUN = 5772;
  return (radiusRsun ** 2) * (teffK / TSUN) ** 4;
}

/** Null-safe "missing data" helper. */
export function missing(value) {
  return value === null || value === undefined || Number.isNaN(value);
}
