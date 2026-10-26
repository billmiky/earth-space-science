// dom.js — Tiny DOM helpers (browser only).

const SVG_NS = "http://www.w3.org/2000/svg";

function apply(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") node.setAttribute("class", v);
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? "" : v);
  }
}

function append(node, children) {
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === "string" || typeof child === "number" ? document.createTextNode(String(child)) : child);
  }
  return node;
}

/** HTML element helper: el("div", {class: "x"}, [children]). */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  apply(node, attrs);
  return append(node, children);
}

/** SVG element helper (same signature as el). */
export function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  apply(node, attrs);
  return append(node, children);
}

/** Remove all children. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Segmented tab strip; returns { root, select(i) }. */
export function tabs(items, onSelect, initial = 0) {
  const root = el("div", { class: "seg", role: "tablist" });
  const buttons = items.map((label, i) =>
    el("button", {
      class: "seg-btn", role: "tab", type: "button", text: label,
      onclick: () => select(i),
    }));
  buttons.forEach((b) => root.appendChild(b));
  function select(i) {
    buttons.forEach((b, j) => {
      b.classList.toggle("active", i === j);
      b.setAttribute("aria-selected", String(i === j));
    });
    onSelect(i);
  }
  select(initial);
  return { root, select };
}

/** Pill-button group (single select). */
export function chips(items, value, onChange, { label = "" } = {}) {
  const root = el("div", { class: "chips", role: "group", "aria-label": label });
  const buttons = new Map();
  for (const it of items) {
    const b = el("button", {
      class: "chip", type: "button", text: it.label,
      style: it.color ? `--chip:${it.color}` : null,
      "aria-pressed": "false",
      onclick: () => set(it.value, true),
    });
    buttons.set(it.value, b);
    root.appendChild(b);
  }
  function set(v, fire) {
    value = v;
    for (const [k, b] of buttons) {
      b.classList.toggle("active", k === v);
      b.setAttribute("aria-pressed", String(k === v));
    }
    if (fire) onChange(v);
  }
  set(value, false);
  return { root, set: (v) => set(v, false) };
}
