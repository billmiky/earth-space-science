// science.js — Pure astronomy, wave, Doppler, Hubble, and Big Bang physics data & models.
// Zero DOM. Matches unit2-probability-of-life/unit2-big-bang.qmd and the 7-day teacher guide.

export const C_KMS = 299792.458; // Speed of light (km/s)
export const H0 = 70;            // Hubble constant used in chapter (km/s/Mpc)
export const AGE_GYR = 13.8;     // Best modern age of the universe (Gyr)

// Packet p. 4 spectra (wavelengths in nanometers, nm)
export const LAB_LINES = [396, 408, 436, 497, 518, 595, 654];

export const PACKET_SPECTRA = [
  { id: "lab", object: "Laboratory Reference", tag: "At rest (0 km/s)", lines: [396, 408, 436, 497, 518, 595, 654] },
  { id: "star", object: "Nearby Star", tag: "Small shift (~+10 nm)", lines: [406, 419, 447, 507, 528, 606, 664] },
  { id: "nearby", object: "Nearby Galaxy", tag: "Clear redshift (~+23 nm)", lines: [419, 432, 459, 519, 540, 617, 676] },
  { id: "distant", object: "Distant Galaxy", tag: "Larger redshift (~+59 nm)", lines: [456, 468, 496, 553, 574, 652, 711] },
  { id: "very-distant", object: "Very Distant Galaxy", tag: "Largest redshift (~+124 nm)", lines: [522, 534, 560, 617, 639] },
];

// Real rest wavelengths (nm) for interactive redshift lab
export const REAL_SPECTRAL_LINES = [
  { name: "Ca K", element: "Calcium", nm: 393.4 },
  { name: "Ca H", element: "Calcium", nm: 396.8 },
  { name: "H-γ", element: "Hydrogen", nm: 434.0 },
  { name: "H-β", element: "Hydrogen", nm: 486.1 },
  { name: "Mg b", element: "Magnesium", nm: 517.5 },
  { name: "Na D", element: "Sodium", nm: 589.3 },
  { name: "H-α", element: "Hydrogen", nm: 656.3 },
];

// Real galaxy clusters from chapter Hubble's Law plot (distance in Mpc, velocity in km/s)
export const HUBBLE_CLUSTERS = [
  { name: "Virgo Cluster", d: 16.5, v: 1100 },
  { name: "Fornax Cluster", d: 19, v: 1380 },
  { name: "Hydra Cluster", d: 54, v: 3780 },
  { name: "Perseus Cluster", d: 75, v: 5370 },
  { name: "Coma Cluster", d: 99, v: 6930 },
  { name: "Abell 2029", d: 330, v: 23200 },
];

export function hubbleVelocity(distanceMpc) {
  return H0 * distanceMpc;
}

/** Relativistic Doppler factor sqrt((1 + beta) / (1 - beta)) for recession velocity vKms (>0 away). */
export function dopplerFactor(vKms) {
  const beta = Math.max(-0.85, Math.min(0.85, vKms / C_KMS));
  return Math.sqrt((1 + beta) / (1 - beta));
}

export function dopplerShift(lambda0Nm, vKms) {
  return lambda0Nm * dopplerFactor(vKms);
}

/** Perceived sound frequency (Hz) for moving source at fraction beta = v_source / c_sound. */
export function soundDopplerFreq(f0Hz, betaToward) {
  const clamped = Math.max(-0.8, Math.min(0.8, betaToward));
  return f0Hz / (1 - clamped);
}

/** Convert visible wavelength (380–750 nm) to an RGB hex string (smooth piecewise approximation). */
export function wavelengthToHex(nm) {
  let r = 0, g = 0, b = 0;
  if (nm < 380) { r = 0.25; g = 0.08; b = 0.42; }
  else if (nm < 440) { r = -(nm - 440) / 60; g = 0; b = 1; }
  else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { r = 0; g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; b = 0; }
  else if (nm <= 750) { r = 1; g = 0; b = 0; }
  else { r = 0.45; g = 0.05; b = 0.05; }

  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.35 + 0.65 * (nm - 380) / 40;
  else if (nm > 700 && nm <= 750) factor = 0.35 + 0.65 * (750 - nm) / 50;

  const toByte = (c) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, c * factor)), 0.85));
  const hex = (n) => n.toString(16).padStart(2, "0");
  return `#${hex(toByte(r))}${hex(toByte(g))}${hex(toByte(b))}`;
}

// Model 2 Piano notes (C4 to C5, speed of sound = 343 m/s)
export const PIANO_NOTES = [
  { note: "C4", label: "Low C", hz: 261.6, color: "#e26a4f" },
  { note: "D4", label: "D", hz: 293.7, color: "#eb8b42" },
  { note: "E4", label: "E", hz: 329.6, color: "#e8b84b" },
  { note: "F4", label: "F", hz: 349.2, color: "#9dc656" },
  { note: "G4", label: "G", hz: 392.0, color: "#4ec29b" },
  { note: "A4", label: "A", hz: 440.0, color: "#38bdf8" },
  { note: "B4", label: "B", hz: 493.9, color: "#5c95e8" },
  { note: "C5", label: "High C", hz: 523.3, color: "#7986e8" },
];

export function soundWavelengthCm(hz) {
  return (34300 / hz);
}

// ESSRT p. 3 Electromagnetic Spectrum bands (wavelength in nm)
export const EM_BANDS = [
  { id: "gamma", label: "Gamma rays", minNm: 1e-5, maxNm: 1e-2, color: "#5c95e8", note: "Shortest wavelength · highest frequency & energy" },
  { id: "xray", label: "X-rays", minNm: 1e-2, maxNm: 10, color: "#38bdf8", note: "Medical imaging & solar flares (GOES satellite)" },
  { id: "uv", label: "Ultraviolet", minNm: 10, maxNm: 400, color: "#4ec2d4", note: "Shorter than violet light" },
  { id: "visible", label: "Visible light", minNm: 400, maxNm: 700, color: "#e8b84b", note: "400 nm (violet/blue) to 700 nm (red) — human eyes" },
  { id: "ir", label: "Infrared", minNm: 700, maxNm: 1e6, color: "#e27a4f", note: "Heat radiation · longer than red light" },
  { id: "microwave", label: "Microwaves", minNm: 1e6, maxNm: 1e9, color: "#d95b43", note: "1 mm to 1 m — Cosmic Microwave Background peaks at ~1 mm!" },
  { id: "radio", label: "Radio waves", minNm: 1e9, maxNm: 1e13, color: "#a84438", note: "Longest wavelength · lowest frequency & energy" },
];

export function emBand(nm) {
  for (const b of EM_BANDS) {
    if (nm < b.maxNm) return b;
  }
  return EM_BANDS[EM_BANDS.length - 1];
}

/**
 * Relative size of the universe compared with today (matches unit2-big-bang.qmd `ouScale`).
 * 0 Gyr ago → 1.00; 5 Gyr ago → ~0.67; 10 Gyr ago → ~0.35; 13.7+ Gyr ago → 0.
 */
export function scaleFactor(gyrAgo) {
  const age = 13.7, k = 0.0899, t = age - gyrAgo;
  if (t <= 0) return 0;
  return Math.pow(Math.sinh(k * t) / Math.sinh(k * age), 2 / 3);
}

// Deterministic constellation of 12 galaxies on a normalized 2D expanding grid (-1..1)
export const BALLOON_GALAXIES = [
  { id: "MW", name: "Milky Way", x: 0.0, y: 0.0 },
  { id: "A", name: "Galaxy A", x: 0.24, y: -0.14 },
  { id: "B", name: "Galaxy B", x: -0.32, y: -0.22 },
  { id: "C", name: "Galaxy C", x: 0.14, y: 0.34 },
  { id: "D", name: "Galaxy D", x: -0.45, y: 0.28 },
  { id: "E", name: "Galaxy E", x: 0.56, y: 0.18 },
  { id: "F", name: "Galaxy F", x: -0.18, y: -0.62 },
  { id: "G", name: "Galaxy G", x: 0.48, y: -0.52 },
  { id: "H", name: "Galaxy H", x: -0.72, y: -0.08 },
  { id: "I", name: "Galaxy I", x: -0.54, y: 0.64 },
  { id: "J", name: "Galaxy J", x: 0.78, y: -0.24 },
  { id: "K", name: "Galaxy K", x: 0.62, y: 0.62 },
];

/** Distance (Mpc) and recession speed from any chosen home galaxy at scale factor a. */
export function galaxyDistances(homeIndex, a = 1) {
  const home = BALLOON_GALAXIES[homeIndex] || BALLOON_GALAXIES[0];
  return BALLOON_GALAXIES.map((g, idx) => {
    const dx = (g.x - home.x) * 200 * a;
    const dy = (g.y - home.y) * 200 * a;
    const dMpc = Math.hypot(dx, dy);
    return { ...g, idx, dx, dy, dMpc, vKms: Math.round(hubbleVelocity(dMpc)) };
  });
}

/** CMB temperature (K) as space stretches by factor s (1× = 3,000 K at recombination; 1,100× = 2.73 K today). */
export function cmbTemp(stretch) {
  return 3000 / Math.max(1, stretch);
}

/** Wien's displacement peak wavelength in nanometers (nm) for temperature T (K). */
export function peakWavelengthNm(tempK) {
  return 2.89777e6 / Math.max(0.1, tempK);
}

/** Normalized Planck radiance curve over log10(lambda_nm) from 2 (100 nm) to 7.5 (~3 cm). */
export function planckCurve(tempK, steps = 110) {
  const hck = 1.4388e7; // nm·K
  const pts = [];
  let maxY = 0;
  for (let i = 0; i <= steps; i++) {
    const logNm = 2 + (i / steps) * 5.5;
    const nm = Math.pow(10, logNm);
    const x = hck / (nm * tempK);
    const y = x > 600 ? 0 : (1 / Math.pow(nm, 4)) / Math.expm1(x);
    if (y > maxY) maxY = y;
    pts.push({ logNm, nm, y });
  }
  return pts.map((p) => ({ ...p, norm: maxY > 0 ? p.y / maxY : 0 }));
}

export const COMPOSITION = {
  predicted: [
    { element: "Hydrogen", pct: 75, color: "#3fb7c7" },
    { element: "Helium", pct: 25, color: "#4ec29b" },
  ],
  observed: [
    { element: "Hydrogen", pct: 70, color: "#3fb7c7" },
    { element: "Helium", pct: 28, color: "#4ec29b" },
    { element: "Oxygen", pct: 1, color: "#e8b84b" },
    { element: "All other elements", pct: 1, color: "#e26a4f" },
  ],
};

export const BB_STAGES = [
  { n: 1, time: "10⁻⁴³ sec", tempC: "Inconceivably hot", sizeLabel: "Atom → grapefruit", text: "The cosmos goes through a superfast \"inflation,\" expanding from the size of an atom to that of a grapefruit in a tiny fraction of a second." },
  { n: 2, time: "10⁻³² sec", tempC: "10²⁷ °C", sizeLabel: "Expanding quark soup", text: "Post-inflation, the universe is a seething, hot soup of electrons, quarks, and other particles." },
  { n: 3, time: "10⁻⁶ sec", tempC: "10¹³ °C", sizeLabel: "Protons & neutrons form", text: "A rapidly cooling cosmos permits quarks to clump into protons and neutrons." },
  { n: 4, time: "3 min", tempC: "10⁸ °C", sizeLabel: "Superhot opaque fog (75% H, 25% He nuclei)", text: "Still too hot to form into atoms, charged electrons and protons prevent light from shining; the universe is a superhot fog." },
  { n: 5, time: "300,000–380,000 yrs", tempC: "~3,000 K (packet: 10,000 °C)", sizeLabel: "First atoms · CMB light released!", text: "Electrons combine with protons and neutrons to form atoms, mostly hydrogen and helium. Light can finally shine — this is the CMB we detect today." },
  { n: 6, time: "1 billion yrs", tempC: "−200 °C", sizeLabel: "First galaxies & stars ignite", text: "Gravity makes hydrogen and helium gas coalesce into giant clouds that become galaxies; smaller clumps collapse to form the first stars." },
  { n: 7, time: "13.8 billion yrs (Today)", tempC: "−270 °C (2.7 K)", sizeLabel: "Trillions of galaxies & rocky planets", text: "As galaxies cluster under gravity, early stars die in supernovae and spread heavy elements into space, forming new stars and rocky planets like Earth. (Packet infographic lists 15 billion yrs; modern best value is 13.8 billion yrs.)" },
];
