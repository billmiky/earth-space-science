// controls.js — Presentation toolbar (panel selectors, layout, presets,
// freeze, fullscreen, settings, hide controls, teacher-hub link).

import { el } from "./dom.js";
import { PANEL_KEYS, PANEL_LABELS, PRESETS } from "./params.js";
import { fmtTime } from "./units.js";

export class Toolbar {
  constructor(container, store, host) {
    this.container = container;
    this.store = store;
    this.host = host;
    this.visible = true;
    this._build();
    this.store.on("change", () => this.sync());
    this.sync();
  }

  _build() {
    this.container.innerHTML = "";
    this.bar = el("div", { class: "toolbar", role: "toolbar", "aria-label": "Presentation controls" });

    this.hubLink = el("a", { class: "tool-btn hub-link", href: "../index.html", text: "◀ Teacher Hub", title: "Back to Teacher Hub" });
    this.bar.appendChild(this.hubLink);

    // Panel selector
    this.panelSelect = this._makeSelect("Panel", PANEL_KEYS.map((k) => [k, PANEL_LABELS[k]]));
    this.panelSelect.select.addEventListener("change", () => this.store.setPanel(this.panelSelect.select.value));
    this.bar.appendChild(this.panelSelect.wrap);

    // Layout toggle (segmented)
    this.layoutToggle = el("div", { class: "seg", role: "group", "aria-label": "Layout mode" });
    this.singleBtn = el("button", { class: "seg-btn", text: "1 panel", onclick: () => this.store.setLayout("single") });
    this.twoBtn = el("button", { class: "seg-btn", text: "2 panels", onclick: () => this.store.setLayout("two") });
    this.layoutToggle.appendChild(this.singleBtn);
    this.layoutToggle.appendChild(this.twoBtn);
    this.bar.appendChild(this.layoutToggle);

    // Second-panel selector (visible in two-panel mode)
    this.panel2Wrap = el("div", { class: "tool-item" });
    this.panel2Select = this._makeSelect("Second panel", [
      ["", "Choose second panel…"],
      ...PANEL_KEYS.map((k) => [k, PANEL_LABELS[k]]),
    ]);
    this.panel2Select.select.addEventListener("change", () => this.store.setPanel2(this.panel2Select.select.value || null));
    this.panel2Wrap.appendChild(this.panel2Select.wrap);
    this.bar.appendChild(this.panel2Wrap);

    // Preset selector
    this.presetSelect = this._makeSelect("Preset", [
      ["", "Preset… (none)"],
      ...Object.entries(PRESETS).map(([k, v]) => [k, v.label]),
    ]);
    this.presetSelect.select.addEventListener("change", () => this.store.setPreset(this.presetSelect.select.value || null));
    this.bar.appendChild(this.presetSelect.wrap);

    // Freeze / resume
    this.freezeBtn = el("button", { class: "tool-btn", text: "❄ Freeze", "aria-pressed": "false", onclick: () => this.store.toggleFreeze() });
    this.bar.appendChild(this.freezeBtn);
    this.freezeIndicator = el("span", { class: "freeze-indicator", hidden: "true" });
    this.bar.appendChild(this.freezeIndicator);

    // Fullscreen
    this.fullscreenBtn = el("button", { class: "tool-btn", text: "⛶ Fullscreen", onclick: () => this._toggleFullscreen() });
    this.bar.appendChild(this.fullscreenBtn);

    // Settings
    this.settingsBtn = el("button", { class: "tool-btn", text: "⚙ Settings", onclick: () => this._toggleSettings() });
    this.bar.appendChild(this.settingsBtn);

    // Hide controls
    this.hideBtn = el("button", { class: "tool-btn", text: "Hide controls", onclick: () => this.hide() });
    this.bar.appendChild(this.hideBtn);

    this.container.appendChild(this.bar);

    // Floating restore button (shown when controls are hidden)
    this.restoreBtn = el("button", { class: "restore-btn", text: "Show controls", hidden: "true", onclick: () => this.show() });
    this.container.appendChild(this.restoreBtn);

    // Settings panel
    this.settingsPanel = el("div", { class: "settings-panel", hidden: "true", role: "dialog", "aria-label": "Settings" });
    this.settingsPanel.appendChild(this._buildSettings());
    this.container.appendChild(this.settingsPanel);
  }

  _makeSelect(label, options) {
    const select = el("select", { class: "tool-select" });
    for (const [value, text] of options) {
      select.appendChild(el("option", { value, text }));
    }
    const wrap = el("label", { class: "tool-item" }, [
      el("span", { class: "tool-label", text: label }),
      select,
    ]);
    return { wrap, select };
  }

  _buildSettings() {
    const box = el("div", { class: "settings-box" });

    const title = el("h3", { text: "Presentation settings" });
    box.appendChild(title);

    const backendLabel = el("label", { class: "setting-row" }, [
      el("span", { text: "Backend base URL (optional)" }),
      el("input", { type: "url", placeholder: "https://your-worker.example.workers.dev", value: this.store.state.backend || "" }),
    ]);
    const backendInput = backendLabel.querySelector("input");
    backendInput.addEventListener("change", () => this.store.setBackend(backendInput.value.trim()));
    box.appendChild(backendLabel);

    const obs = this.store.state.observing || {};
    const locName = el("input", { type: "text", value: obs.name || "" });
    const locLat = el("input", { type: "number", step: "0.0001", value: String(obs.lat ?? 0) });
    const locLon = el("input", { type: "number", step: "0.0001", value: String(obs.lon ?? 0) });
    const locTz = el("input", { type: "text", value: obs.tz || "" });

    const applyLoc = () => this.store.setObserving({
      name: locName.value.trim() || "Custom location",
      lat: parseFloat(locLat.value) || 0,
      lon: parseFloat(locLon.value) || 0,
      tz: locTz.value.trim() || "UTC",
    });

    box.appendChild(el("div", { class: "setting-row" }, [
      el("span", { text: "Observing location name" }), locName,
    ]));
    box.appendChild(el("div", { class: "setting-row" }, [
      el("span", { text: "Latitude (°N)" }), locLat,
    ]));
    box.appendChild(el("div", { class: "setting-row" }, [
      el("span", { text: "Longitude (°E)" }), locLon,
    ]));
    box.appendChild(el("div", { class: "setting-row" }, [
      el("span", { text: "IANA timezone (e.g. America/New_York)" }), locTz,
    ]));
    box.appendChild(el("button", { class: "tool-btn", text: "Apply location", onclick: applyLoc }));

    box.appendChild(el("p", { class: "settings-note", html:
      "The backend URL is used only to allow live refresh of sources that block " +
      "browser requests (NASA Exoplanet Archive, JPL). Without it, the dashboard " +
      "uses bundled, clearly-labelled catalog snapshots." }));

    const closeBtn = el("button", { class: "tool-btn", text: "Close settings", onclick: () => this._toggleSettings(false) });
    box.appendChild(closeBtn);

    return box;
  }

  _toggleSettings(force) {
    const show = force === undefined ? this.settingsPanel.hidden : !force;
    this.settingsPanel.hidden = !show;
  }

  _toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }

  hide() {
    this.visible = false;
    this.bar.hidden = true;
    this.restoreBtn.hidden = false;
  }

  show() {
    this.visible = true;
    this.bar.hidden = false;
    this.restoreBtn.hidden = true;
  }

  sync() {
    const s = this.store.state;
    this.panelSelect.select.value = s.panel;
    this.panel2Select.select.value = s.panel2 || "";
    this.presetSelect.select.value = s.preset || "";
    this.singleBtn.classList.toggle("active", s.layout !== "two");
    this.twoBtn.classList.toggle("active", s.layout === "two");
    this.panel2Wrap.hidden = s.layout !== "two";

    // Prevent selecting the same panel twice in the second-panel selector.
    const p2 = this.panel2Select.select;
    for (const opt of p2.options) {
      opt.disabled = opt.value === s.panel;
    }

    // Restrained motion (orbit sweep, pulses, starfield) is disabled while
    // frozen, in addition to the prefers-reduced-motion CSS rule.
    document.body.classList.toggle("is-frozen", !!s.frozen);

    if (s.frozen) {
      this.freezeBtn.textContent = "▶ Resume";
      this.freezeBtn.classList.add("frozen");
      this.freezeBtn.setAttribute("aria-pressed", "true");
      this.freezeIndicator.hidden = false;
      this.freezeIndicator.textContent = s.frozenAt
        ? "Frozen at " + fmtTime(s.frozenAt)
        : "Frozen";
    } else {
      this.freezeBtn.textContent = "❄ Freeze";
      this.freezeBtn.classList.remove("frozen");
      this.freezeBtn.setAttribute("aria-pressed", "false");
      this.freezeIndicator.hidden = true;
    }
  }
}
