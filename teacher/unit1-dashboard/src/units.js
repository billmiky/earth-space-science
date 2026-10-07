// units.js — Pure unit-conversion and formatting helpers (no DOM).

/** Format a number with a sensible number of significant digits. */
export function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) {
    return value.toExponential(Math.max(1, digits - 1));
  }
  // Up to `digits` significant figures.
  const rounded = Number(value.toPrecision(digits));
  return String(rounded);
}

/** Format a time tag for display. Accepts ISO string, Date, or ms epoch. */
export function fmtTime(value) {
  if (value === null || value === undefined) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

/** Convert AU to kilometers. */
export function auToKm(au) {
  return au * 149597870.7;
}

/** Convert log10(L/Lsun) to linear luminosity. Returns null for null input. */
export function logLumToLinear(logL) {
  if (logL === null || logL === undefined || Number.isNaN(logL)) return null;
  return Math.pow(10, logL);
}

/**
 * Convert an exoplanet equilibrium temperature estimate between Kelvin,
 * Celsius and Fahrenheit. Returns null on invalid input.
 */
export function kelvinTo(unit, kelvin) {
  if (kelvin === null || kelvin === undefined || Number.isNaN(kelvin)) return null;
  if (unit === "K") return kelvin;
  if (unit === "C") return kelvin - 273.15;
  if (unit === "F") return (kelvin - 273.15) * 9 / 5 + 32;
  return null;
}

/** Days to Earth years (365.25 d). */
export function daysToYears(days) {
  return days / 365.25;
}

/**
 * Julian Date from a JavaScript Date (UTC). Standard astronomical formula.
 * Returns a number (days since noon 4713 BC).
 */
export function dateToJulian(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate() +
    (d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600) / 24;
  let yAdj = y;
  let mAdj = m;
  if (m <= 2) {
    yAdj -= 1;
    mAdj += 12;
  }
  const A = Math.floor(yAdj / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yAdj + 4716)) +
    Math.floor(30.6001 * (mAdj + 1)) + day + B - 1524.5;
}

/** Julian Date to JavaScript Date (UTC). */
export function julianToDate(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z;
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const dayInt = Math.floor(day);
  const frac = day - dayInt;
  const hours = Math.floor(frac * 24);
  const minutes = Math.floor((frac * 24 - hours) * 60);
  const seconds = Math.floor(((frac * 24 - hours) * 60 - minutes) * 60);
  return new Date(Date.UTC(year, month - 1, dayInt, hours, minutes, seconds));
}
