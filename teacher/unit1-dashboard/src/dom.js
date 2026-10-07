// dom.js — Tiny DOM helpers (browser only).

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "dataset") {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

/** Build a small status/provenance bar for a panel. */
export function provenanceBar({ source, dataType, retrieved, units, status, statusLabel }) {
  const bar = el("div", { class: "provenance", role: "status", "aria-live": "polite" });
  const items = [
    ["Source", source],
    ["Data", dataType],
    ["Retrieved", retrieved],
    ["Units", units],
    ["Freshness", statusLabel || status],
  ];
  for (const [label, value] of items) {
    if (!value) continue;
    bar.appendChild(el("span", { class: "prov-item" }, [
      el("b", { text: label + ":" }),
      " ",
      document.createTextNode(value),
    ]));
  }
  return bar;
}

/** Escape HTML entities for safe interpolation of external strings. */
export function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
