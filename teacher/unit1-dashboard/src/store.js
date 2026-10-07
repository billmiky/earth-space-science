// store.js — Runtime state store: URL params, localStorage persistence,
// freeze/resume, and a tiny event emitter. DOM-aware (browser only).

import {
  parseParams, resolveState, defaultPrefs, serializeState,
  dedupePanels, applyPreset, isPanelKey, isLayout, PRESETS, STORAGE_KEY,
} from "./params.js";

export class Store {
  constructor(deps = {}) {
    this.window = deps.window || (typeof window !== "undefined" ? window : null);
    this.storage = deps.storage || (this.window ? this.window.localStorage : null);
    this._listeners = new Map();
    this._state = null;
    this._init();
  }

  _init() {
    const saved = this._loadPrefs();
    const urlParams = this.window ? parseParams(this.window.location.search) : {};
    this._state = resolveState(urlParams, saved);
    this._applyFreezeTimestamp();
  }

  _loadPrefs() {
    const base = defaultPrefs();
    if (!this.storage) return base;
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return base;
      const merged = { ...base, ...parsed };
      if (!isPanelKey(merged.panel)) merged.panel = base.panel;
      if (merged.panel2 !== null && !isPanelKey(merged.panel2)) merged.panel2 = null;
      if (!isLayout(merged.layout)) merged.layout = base.layout;
      return merged;
    } catch {
      return base;
    }
  }

  _applyFreezeTimestamp() {
    if (this._state.frozen && !this._state.frozenAt) {
      this._state.frozenAt = new Date().toISOString();
    }
    if (!this._state.frozen) this._state.frozenAt = null;
  }

  get state() {
    return this._state;
  }

  /** Persist preferences (excluding transient frozenAt) and update the URL. */
  _persist() {
    if (this.storage) {
      try {
        const { frozenAt, ...prefs } = this._state;
        this.storage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        /* storage may be unavailable (private mode) — ignore */
      }
    }
    if (this.window && this.window.history && this.window.history.replaceState) {
      const qs = serializeState(this._state);
      try {
        this.window.history.replaceState({}, "", this.window.location.pathname + qs);
      } catch {
        /* ignore URL update failures */
      }
    }
    this._emit("change", this._state);
  }

  _set(patch) {
    this._state = { ...this._state, ...patch };
    this._persist();
  }

  setPanel(key) {
    if (!isPanelKey(key)) return;
    const { panel, panel2 } = dedupePanels(key, this._state.panel2);
    this._set({ panel, panel2 });
  }

  setPanel2(key) {
    if (key !== null && !isPanelKey(key)) return;
    const { panel, panel2 } = dedupePanels(this._state.panel, key);
    this._set({ panel, panel2 });
  }

  setLayout(layout) {
    if (!isLayout(layout)) return;
    const patch = { layout };
    if (layout === "single") patch.panel2 = null;
    this._set(patch);
  }

  setPreset(name) {
    if (!name || !Object.prototype.hasOwnProperty.call(PRESETS, name)) {
      // Clear the preset without changing the current panel/layout.
      this._set({ preset: null });
      return;
    }
    const next = applyPreset(name, this._state);
    this._set(next);
  }

  setExoplanet(name) {
    if (typeof name !== "string" || !name) return;
    this._set({ exoplanet: name });
  }

  setDate(iso) {
    this._set({ date: iso || null });
  }

  setObserving(patch) {
    const observing = { ...this._state.observing, ...patch };
    this._set({ observing });
  }

  setBackend(url) {
    this._set({ backend: url || "" });
  }

  /** Freeze: stop time-advancing and data replacement. Records the time. */
  freeze() {
    if (this._state.frozen) return;
    this._set({ frozen: true, frozenAt: new Date().toISOString() });
  }

  /** Resume: explicitly unfreeze. */
  resume() {
    if (!this._state.frozen) return;
    this._set({ frozen: false, frozenAt: null });
  }

  toggleFreeze() {
    if (this._state.frozen) this.resume();
    else this.freeze();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this._listeners.get(event).delete(fn);
  }

  _emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(payload); } catch { /* listener errors are non-fatal */ }
    }
  }
}
