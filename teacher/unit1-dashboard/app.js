// app.js — Unit 1 Astronomy Dashboard bootstrap.

import { Store } from "./src/store.js";
import { Toolbar } from "./src/controls.js";
import { PanelHost } from "./src/layout.js";

function boot() {
  const store = new Store();

  const toolbarEl = document.getElementById("toolbar");
  const hostEl = document.getElementById("panels-host");

  const host = new PanelHost(hostEl, store);
  new Toolbar(toolbarEl, store, host);

  // Initial render.
  host.render();

  // Expose a minimal debug handle (not used by teachers).
  if (window) {
    window.__essDashboard = { store, host };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
