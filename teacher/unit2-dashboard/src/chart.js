// chart.js — Small scale + tick helpers for hand-built SVG charts (no libraries).

import { svg } from "./dom.js";

export function linear([d0, d1], [r0, r1]) {
  const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  f.invert = (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0);
  return f;
}

export function log10Scale([d0, d1], [r0, r1]) {
  const a = Math.log10(d0), b = Math.log10(d1);
  const f = (v) => r0 + ((Math.log10(Math.max(v, d0)) - a) / (b - a)) * (r1 - r0);
  return f;
}

/** "Nice" tick values between min and max (about `count` of them). */
export function niceTicks(min, max, count = 6) {
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(parseFloat(v.toPrecision(12)));
  return out;
}

/** Powers of ten between min and max (for log axes). */
export function powersOfTen(min, max) {
  const out = [];
  for (let e = Math.ceil(Math.log10(min)); e <= Math.floor(Math.log10(max)); e++) out.push(Math.pow(10, e));
  return out;
}

export function siLabel(v) {
  if (v >= 1e9) return `${v / 1e9}B`;
  if (v >= 1e6) return `${v / 1e6}M`;
  if (v >= 1e3) return `${v / 1e3}k`;
  if (v < 1) return String(v);
  return String(v);
}

/** Create the SVG root used by every chart. */
export function chartRoot(w, h, label) {
  return svg("svg", {
    viewBox: `0 0 ${w} ${h}`, class: "chart", role: "img", "aria-label": label,
    preserveAspectRatio: "xMidYMid meet",
  });
}

export function text(x, y, str, attrs = {}) {
  return svg("text", { x, y, ...attrs, text: str });
}
