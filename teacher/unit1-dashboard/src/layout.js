// layout.js — Panel host: decides and renders single / side-by-side / stacked /
// pair-switch layouts, and lazily mounts panel modules.

import { CONFIG } from "./config.js";
import { el } from "./dom.js";
import { PANEL_LABELS } from "./params.js";
import { modeForPanel, fiveEForPanel } from "./modes.js";
import { buildModeHeader, promptForPanel } from "./panel-ui.js";

/**
 * Pure layout decision.
 * @returns "single" | "side-by-side" | "stacked" | "pair-switch"
 */
export function decideLayout(mode, width, height) {
  if (mode !== "two") return "single";
  if (width >= CONFIG.twoPanelSideBySideMinWidth && height >= CONFIG.twoPanelSideBySideMinHeight) {
    return "side-by-side";
  }
  if (width >= 720) return "stacked";
  return "pair-switch";
}

const PANEL_MODULES = {
  "solar": () => import("./panels/solar-activity.js"),
  "solar-system": () => import("./panels/solar-system.js"),
  "borrelly": () => import("./panels/borrelly.js"),
  "exoplanet": () => import("./panels/exoplanet.js"),
  "host-star": () => import("./panels/host-star.js"),
  "observing": () => import("./panels/observing.js"),
};

export class PanelHost {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.mounted = new Map(); // key -> { cleanup }
    this.pairIndex = 0;
    this.root = null;
    this._buildShell();
    this.store.on("change", () => this.render());
    this._observeViewport();
  }

  _buildShell() {
    this.container.innerHTML = "";
    this.root = el("div", { class: "panels-grid layout-single", id: "panelsGrid" });
    this.pairSwitcher = el("div", { class: "pair-switcher", hidden: "true", role: "tablist", "aria-label": "Switch between the selected pair of panels" });
    this.primaryWrap = el("section", { class: "panel-wrap panel-primary", role: "tabpanel" });
    this.secondaryWrap = el("section", { class: "panel-wrap panel-secondary", role: "tabpanel" });
    this.root.appendChild(this.pairSwitcher);
    this.root.appendChild(this.primaryWrap);
    this.root.appendChild(this.secondaryWrap);
    this.container.appendChild(this.root);
  }

  _observeViewport() {
    const recompute = () => this.render();
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(recompute);
      this._ro.observe(this.container);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", recompute);
    }
  }

  _layoutMode() {
    const { layout } = this.store.state;
    const width = this.container.clientWidth || 1280;
    const height = this.container.clientHeight || 720;
    return decideLayout(layout, width, height);
  }

  render() {
    const state = this.store.state;
    const mode = this._layoutMode();
    this.root.className = `panels-grid layout-${mode}`;

    const showSecondary = state.layout === "two" && state.panel2 && mode !== "pair-switch";
    this.secondaryWrap.classList.toggle("hidden", !showSecondary);

    if (mode === "pair-switch" && state.layout === "two" && state.panel2) {
      this.pairSwitcher.hidden = false;
      this._renderPairSwitcher(state.panel, state.panel2);
      const activeKey = this.pairIndex === 0 ? state.panel : state.panel2;
      this.primaryWrap.classList.toggle("hidden", activeKey !== state.panel);
      this.secondaryWrap.classList.toggle("hidden", activeKey !== state.panel2);
      this._mountPanel(this.primaryWrap, state.panel);
      this._mountPanel(this.secondaryWrap, state.panel2);
    } else {
      this.pairSwitcher.hidden = true;
      this._mountPanel(this.primaryWrap, state.panel);
      if (showSecondary) this._mountPanel(this.secondaryWrap, state.panel2);
      else this._unmountPanel(this.secondaryWrap);
    }
  }

  _renderPairSwitcher(panelA, panelB) {
    this.pairSwitcher.innerHTML = "";
    const make = (key, idx) => el("button", {
      class: "pair-btn" + (this.pairIndex === idx ? " active" : ""),
      role: "tab",
      "aria-selected": String(this.pairIndex === idx),
      text: PANEL_LABELS[key] || key,
      onclick: () => { this.pairIndex = idx; this.render(); },
    });
    this.pairSwitcher.appendChild(make(panelA, 0));
    this.pairSwitcher.appendChild(make(panelB, 1));
  }

  _mountPanel(wrap, key) {
    if (wrap.dataset.mounted === key) return;
    this._unmountPanel(wrap);
    wrap.dataset.mounted = key;
    wrap.innerHTML = "";
    wrap.appendChild(el("div", { class: "panel-loading", text: "Loading panel…" }));
    Promise.all([PANEL_MODULES[key](), promptForPanel(key)])
      .then(([mod, promptData]) => {
        if (wrap.dataset.mounted !== key) return; // superseded
        wrap.innerHTML = "";
        wrap.appendChild(buildModeHeader(modeForPanel(key), fiveEForPanel(key), promptData?.prompt));
        const header = el("div", { class: "panel-header" }, [
          el("h2", { class: "panel-title", text: mod.meta?.label || PANEL_LABELS[key] }),
        ]);
        wrap.appendChild(header);
        const body = el("div", { class: "panel-body" });
        wrap.appendChild(body);
        try {
          const cleanup = mod.mount(body, { store: this.store });
          this.mounted.set(key, cleanup || null);
        } catch (err) {
          body.appendChild(el("div", { class: "panel-error", text: "Panel failed to load: " + (err.message || err) }));
        }
      })
      .catch((err) => {
        if (wrap.dataset.mounted !== key) return;
        wrap.innerHTML = "";
        wrap.appendChild(el("div", { class: "panel-error", text: "Panel failed to load: " + (err.message || err) }));
      });
  }

  _unmountPanel(wrap) {
    const key = wrap.dataset.mounted;
    if (key && this.mounted.has(key)) {
      try { this.mounted.get(key)?.(); } catch { /* ignore */ }
      this.mounted.delete(key);
    }
    wrap.dataset.mounted = "";
    wrap.innerHTML = "";
  }

  destroy() {
    for (const [key, cleanup] of this.mounted) {
      try { cleanup?.(); } catch { /* ignore */ }
    }
    this.mounted.clear();
    if (this._ro) this._ro.disconnect();
  }
}
