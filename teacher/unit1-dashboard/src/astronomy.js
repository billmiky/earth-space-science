// astronomy.js — Self-contained astronomy calculation library.
//
// SOURCE & ACCURACY
//   Planetary positions: Jean Meeus, "Astronomical Algorithms" (2nd ed.),
//   Chapter 31 "Position of the Planets", Table 31.A low-precision mean
//   elements. These are the standard low-precision Keplerian mean elements
//   valid over roughly 1800–2050 with accuracy of a few arcminutes.
//   They describe REAL elliptical orbits (not circular approximations).
//   Coordinates are heliocentric ecliptic rectangular coordinates (AU) in the
//   J2000.0 ecliptic frame.
//
//   Comet positions: two-body Keplerian propagation from osculating orbital
//   elements supplied externally (e.g. JPL SBDB). Approximate — ignores
//   perturbations and non-gravitational forces.
//
//   Apparent magnitudes: Meeus Chapter 41 simplified formulae (approximate).

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const J2000 = 2451545.0;
export const AU_KM = 149597870.7;

export function normDeg(x) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

export function normRad(x) {
  const tau = Math.PI * 2;
  let v = x % tau;
  if (v < 0) v += tau;
  return v;
}

/**
 * Solve Kepler's equation M = E - e*sin(E) for E (radians).
 * Newton-Raphson with a fixed number of iterations.
 */
export function solveKepler(M, e) {
  const m = normRad(M);
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 12; i++) {
    const f = E - e * Math.sin(E) - m;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

// Low-precision mean orbital elements (Meeus Table 31.A).
// i, L, peri (longitude of perihelion), node are degrees; rates per Julian century.
export const PLANETS = {
  mercury: { name: "Mercury", color: "#9ca3af", a0: 0.387098310, a1: 0.0, e0: 0.20563175, e1: 0.000020406, i0: 7.004986, i1: -0.0059516, L0: 252.250906, L1: 149472.6746358, peri0: 77.457719, peri1: 0.1594001, node0: 48.330894, node1: -0.1254227 },
  venus:   { name: "Venus",   color: "#f4c542", a0: 0.723329820, a1: 0.0, e0: 0.00677192, e1: -0.000047765, i0: 3.394662, i1: -0.0009008, L0: 181.979801, L1: 58517.8156760, peri0: 131.564677, peri1: 0.0047289, node0: 76.679920, node1: -0.2774095 },
  earth:   { name: "Earth",   color: "#38bdf8", a0: 1.000001018, a1: 0.0, e0: 0.01670863, e1: -0.000042037, i0: 0.0, i1: 0.0, L0: 100.466916, L1: 35999.3728499, peri0: 102.937348, peri1: 0.3232735, node0: 0.0, node1: 0.0 },
  mars:    { name: "Mars",    color: "#f87171", a0: 1.523679342, a1: 0.0, e0: 0.09340062, e1: 0.000090483, i0: 1.849726, i1: -0.0006011, L0: 355.433275, L1: 19140.2993313, peri0: 336.060234, peri1: 0.4439016, node0: 49.558094, node1: -0.2950250 },
  jupiter: { name: "Jupiter", color: "#fb923c", a0: 5.202603191, a1: 0.0000001913, e0: 0.04849485, e1: 0.000163244, i0: 1.303270, i1: -0.0054966, L0: 34.351484, L1: 3034.9056746, peri0: 14.331309, peri1: 0.2155268, node0: 100.464441, node1: 0.2046910 },
  saturn:  { name: "Saturn",  color: "#fbbf24", a0: 9.554909596, a1: -0.0000021389, e0: 0.05550862, e1: -0.000346818, i0: 2.488878, i1: 0.0037363, L0: 50.077471, L1: 1222.1137943, peri0: 93.057237, peri1: 0.5665415, node0: 113.665524, node1: -0.2564522 },
  uranus:  { name: "Uranus",  color: "#67e8f9", a0: 19.218446062, a1: -0.0000000372, e0: 0.04629590, e1: -0.000027337, i0: 0.773196, i1: 0.0007744, L0: 314.055005, L1: 428.4669983, peri0: 173.005159, peri1: 0.0893206, node0: 74.005947, node1: 0.2141274 },
  neptune: { name: "Neptune", color: "#818cf8", a0: 30.110386869, a1: -0.0000001663, e0: 0.00898809, e1: 0.000006408, i0: 1.769952, i1: -0.0093082, L0: 304.348665, L1: 218.4862002, peri0: 48.123691, peri1: 0.0291587, node0: 131.784057, node1: -0.0389602 },
};

export const PLANET_KEYS = Object.keys(PLANETS);

/**
 * Heliocentric ecliptic rectangular coordinates (AU) of a planet at JD.
 * Returns {x, y, z} in the J2000 ecliptic frame.
 */
export function planetHelioEcliptic(jd, key) {
  const p = PLANETS[key];
  const T = (jd - J2000) / 36525.0;
  const a = p.a0 + p.a1 * T;
  const e = p.e0 + p.e1 * T;
  const i = (p.i0 + p.i1 * T) * DEG;
  const L = normDeg(p.L0 + p.L1 * T) * DEG;
  const peri = normDeg(p.peri0 + p.peri1 * T) * DEG;
  const node = normDeg(p.node0 + p.node1 * T) * DEG;
  const omega = peri - node;               // argument of perihelion
  const M = normRad(L - peri);             // mean anomaly (rad)
  const E = solveKepler(M, e);
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cosO = Math.cos(omega), sinO = Math.sin(omega);
  const cosI = Math.cos(i), sinI = Math.sin(i);
  const cosN = Math.cos(node), sinN = Math.sin(node);
  const x = (cosO * cosN - sinO * sinN * cosI) * xp + (-sinO * cosN - cosO * sinN * cosI) * yp;
  const y = (cosO * sinN + sinO * cosN * cosI) * xp + (-sinO * sinN + cosO * cosN * cosI) * yp;
  const z = (sinO * sinI) * xp + (cosO * sinI) * yp;
  return { x, y, z };
}

/** Heliocentric distance in AU. */
export function helioDistance(jd, key) {
  const { x, y, z } = planetHelioEcliptic(jd, key);
  return Math.hypot(x, y, z);
}

/** Geocentric ecliptic position of the Sun (AU). Equal to -Earth heliocentric. */
export function sunGeocentricEcliptic(jd) {
  const e = planetHelioEcliptic(jd, "earth");
  return { x: -e.x, y: -e.y, z: -e.z };
}

/** Mean obliquity of the ecliptic (degrees). */
export function obliquityDeg(jd) {
  const T = (jd - J2000) / 36525.0;
  return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
}

/** Convert ecliptic rectangular (AU) to equatorial RA/Dec (degrees). */
export function eclipticToEquatorial(x, y, z, jd) {
  const eps = obliquityDeg(jd) * DEG;
  const cosE = Math.cos(eps), sinE = Math.sin(eps);
  const xeq = x;
  const yeq = y * cosE - z * sinE;
  const zeq = y * sinE + z * cosE;
  const ra = normDeg(Math.atan2(yeq, xeq) * RAD);
  const dec = Math.atan2(zeq, Math.hypot(xeq, yeq)) * RAD;
  return { ra, dec };
}

/** Greenwich mean sidereal time (degrees) at JD. */
export function gmstDeg(jd) {
  const T = (jd - J2000) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - J2000) +
    0.000387933 * T * T - T * T * T / 38710000.0;
  return normDeg(gmst);
}

/** Local sidereal time (degrees) at JD for an east-positive longitude. */
export function lstDeg(jd, lonDeg) {
  return normDeg(gmstDeg(jd) + lonDeg);
}

/**
 * Altitude/azimuth (degrees) of an equatorial position for an observer.
 * az is measured from North (0=N, 90=E, 180=S, 270=W).
 */
export function altAz(raDeg, decDeg, jd, latDeg, lonDeg) {
  const lat = latDeg * DEG;
  const dec = decDeg * DEG;
  const H = (lstDeg(jd, lonDeg) - raDeg) * DEG; // hour angle (rad)
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;
  const az = normDeg(Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)
  ) * RAD + 180);
  return { alt, az };
}

/**
 * Phase angle (deg), planet-Sun distance r (AU) and planet-Earth distance
 * delta (AU) for a planet at JD.
 */
export function planetGeometry(jd, key) {
  const p = planetHelioEcliptic(jd, key);
  const e = planetHelioEcliptic(jd, "earth");
  const dx = p.x - e.x, dy = p.y - e.y, dz = p.z - e.z;
  const delta = Math.hypot(dx, dy, dz);
  const r = Math.hypot(p.x, p.y, p.z);
  const R = Math.hypot(e.x, e.y, e.z);
  // cos(i) = (r^2 + delta^2 - R^2) / (2 r delta)
  const cosI = (r * r + delta * delta - R * R) / (2 * r * delta);
  const phase = Math.acos(Math.max(-1, Math.min(1, cosI))) * RAD;
  return { r, delta, phase };
}

// Simplified apparent visual magnitude coefficients (Meeus Ch. 41, approximate).
const MAG = {
  mercury: (i) => -0.42 + 0.038 * i - 0.000273 * i * i + 0.000002 * i * i * i,
  venus: (i) => -4.40 + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i,
  mars: (i) => -1.52 + 0.016 * i,
  jupiter: (i) => -9.40 + 0.005 * i,
  saturn: (i) => -8.88 + 0.044 * Math.abs(i),
  uranus: () => -7.19,
  neptune: () => -6.87,
};

/**
 * Approximate predicted apparent visual magnitude of a planet.
 * Returns null if unsupported. Label as "calculated, not a live measurement".
 */
export function apparentMagnitude(jd, key) {
  const f = MAG[key];
  if (!f) return null;
  const { r, delta, phase } = planetGeometry(jd, key);
  return f(phase) + 5 * Math.log10(r * delta);
}

/**
 * Two-body Keplerian propagation of a comet from osculating elements.
 * elements: { e, a_au, i_deg, node_deg, peri_deg, M_deg, epoch_jd, n_deg_day }
 * Returns heliocentric ecliptic rect {x,y,z} (AU).
 */
export function keplerPropagate(elements, jd) {
  const { e, a_au, i_deg, node_deg, peri_deg, epoch_jd } = elements;
  const M0deg = (elements.M_deg !== undefined ? elements.M_deg : 0);
  const n_deg_day = elements.n_deg_day !== undefined
    ? elements.n_deg_day
    : 360.0 / 365.25 / Math.pow(a_au, 1.5);
  const M = (M0deg + (jd - epoch_jd) * n_deg_day) * DEG; // radians
  const E = solveKepler(M, e);
  const xp = a_au * (Math.cos(E) - e);
  const yp = a_au * Math.sqrt(1 - e * e) * Math.sin(E);
  const omega = (peri_deg - node_deg) * DEG;
  const i = i_deg * DEG;
  const node = node_deg * DEG;
  const cosO = Math.cos(omega), sinO = Math.sin(omega);
  const cosI = Math.cos(i), sinI = Math.sin(i);
  const cosN = Math.cos(node), sinN = Math.sin(node);
  const x = (cosO * cosN - sinO * sinN * cosI) * xp + (-sinO * cosN - cosO * sinN * cosI) * yp;
  const y = (cosO * sinN + sinO * cosN * cosI) * xp + (-sinO * sinN + cosO * cosN * cosI) * yp;
  const z = (sinO * sinI) * xp + (cosO * sinI) * yp;
  return { x, y, z };
}

/** Sample points along a planet's orbit for one full period. */
export function planetOrbitPath(key, samples = 360) {
  const p = PLANETS[key];
  const a = p.a0;
  const periodDays = 365.25 * a * Math.sqrt(a); // approximate Kepler period
  const now = Date.now();
  const jd0 = now / 86400000 + 2440587.5;
  const pts = [];
  for (let s = 0; s <= samples; s++) {
    const jd = jd0 + (s / samples) * periodDays;
    const { x, y } = planetHelioEcliptic(jd, key);
    pts.push({ x, y, z: 0 });
  }
  return pts;
}

/** Sample points along a comet orbit for one full period (two-body). */
export function cometOrbitPath(elements, samples = 720) {
  const { a_au, e } = elements;
  const periodDays = elements.period_days || 365.25 * a_au * Math.sqrt(a_au);
  const epoch = elements.epoch_jd || J2000;
  const pts = [];
  for (let s = 0; s <= samples; s++) {
    const jd = epoch + (s / samples) * periodDays;
    const { x, y } = keplerPropagate(elements, jd);
    pts.push({ x, y, z: 0 });
  }
  return pts;
}
