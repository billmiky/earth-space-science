// ui.js — Shared building blocks for Origin of the Universe dashboard panels.

import { el } from "./dom.js";

export function card(title, children = [], { cls = "", kicker = "" } = {}) {
  return el("section", { class: `card ${cls}`.trim() }, [
    title || kicker
      ? el("header", { class: "card-head" }, [
        kicker ? el("span", { class: "kicker", text: kicker }) : null,
        title ? el("h3", { text: title }) : null,
      ])
      : null,
    ...[].concat(children),
  ]);
}

export function stat(label, value, { tone = "" } = {}) {
  const v = el("div", { class: `stat-value ${tone}`.trim(), text: value });
  const root = el("div", { class: "stat" }, [el("div", { class: "stat-label", text: label }), v]);
  root.setValue = (x, nextTone) => {
    v.textContent = x;
    if (nextTone !== undefined) v.className = `stat-value ${nextTone}`.trim();
  };
  root.valueEl = v;
  return root;
}

export function bullets(items) {
  return el("ul", { class: "bullets" }, items.map((t) => el("li", { html: t })));
}

export function layout(cls, children) {
  return el("div", { class: `panel-grid ${cls}` }, children);
}

export function packetTask(title, items) {
  return el("aside", { class: "packet-task" }, [
    el("div", { class: "packet-title", text: `✏️ In your packet: ${title}` }),
    bullets(items),
  ]);
}

export function toggle(label, initial, onChange) {
  let on = !!initial;
  const b = el("button", {
    class: "tool-btn toggle", type: "button", role: "switch", "aria-checked": String(on),
    onclick: () => { on = !on; sync(); onChange(on); },
  });
  function sync() {
    b.setAttribute("aria-checked", String(on));
    b.classList.toggle("active", on);
    b.textContent = `${on ? "✔" : "○"} ${label}`;
  }
  sync();
  b.set = (v) => { on = !!v; sync(); };
  return b;
}

export function saved(key, fallback) {
  const k = `origin-dash:${key}`;
  let mem = fallback;
  try { const raw = localStorage.getItem(k); if (raw !== null) mem = JSON.parse(raw); } catch { /* ignore */ }
  return {
    get: () => mem,
    set(v) { mem = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };
}
