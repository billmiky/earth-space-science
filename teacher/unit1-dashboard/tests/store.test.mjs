import { test } from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/store.js";
import { STORAGE_KEY } from "../src/params.js";

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}

function fakeWindow(search = "") {
  return {
    location: { search, pathname: "/teacher/unit1-dashboard/index.html", href: "x" },
    history: { replaceState() {} },
  };
}

test("Store initializes with defaults when nothing is saved", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  assert.equal(store.state.panel, "solar");
  assert.equal(store.state.layout, "single");
});

test("Store persists preferences to localStorage", () => {
  const storage = new FakeStorage();
  const store = new Store({ window: fakeWindow(), storage });
  store.setPanel("observing");
  const saved = JSON.parse(storage.getItem(STORAGE_KEY));
  assert.equal(saved.panel, "observing");
});

test("Store loads saved preferences on init", () => {
  const storage = new FakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ panel: "exoplanet", layout: "two", panel2: "host-star" }));
  const store = new Store({ window: fakeWindow(), storage });
  assert.equal(store.state.panel, "exoplanet");
  assert.equal(store.state.layout, "two");
  assert.equal(store.state.panel2, "host-star");
});

test("Store rejects invalid saved panel/layout", () => {
  const storage = new FakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ panel: "bogus", layout: "bogus" }));
  const store = new Store({ window: fakeWindow(), storage });
  assert.equal(store.state.panel, "solar");
  assert.equal(store.state.layout, "single");
});

test("duplicate panel prevention via setPanel2", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  store.setPanel("solar");
  store.setPanel2("solar");
  assert.equal(store.state.panel2, null);
});

test("setLayout single clears second panel", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  store.setLayout("two");
  store.setPanel2("borrelly");
  assert.equal(store.state.panel2, "borrelly");
  store.setLayout("single");
  assert.equal(store.state.panel2, null);
});

test("freeze/resume records and clears frozenAt", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  assert.equal(store.state.frozen, false);
  store.freeze();
  assert.equal(store.state.frozen, true);
  assert.ok(store.state.frozenAt);
  store.resume();
  assert.equal(store.state.frozen, false);
  assert.equal(store.state.frozenAt, null);
});

test("toggleFreeze toggles", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  store.toggleFreeze();
  assert.equal(store.state.frozen, true);
  store.toggleFreeze();
  assert.equal(store.state.frozen, false);
});

test("shared exoplanet selection", () => {
  const store = new Store({ window: fakeWindow(), storage: new FakeStorage() });
  store.setExoplanet("Kepler-22 b");
  assert.equal(store.state.exoplanet, "Kepler-22 b");
  store.setExoplanet("");
  assert.equal(store.state.exoplanet, "Kepler-22 b"); // empty ignored
});

test("URL params override saved preferences", () => {
  const storage = new FakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ panel: "observing" }));
  const store = new Store({ window: fakeWindow("?panel=solar-system&layout=two&panel2=borrelly"), storage });
  assert.equal(store.state.panel, "solar-system");
  assert.equal(store.state.layout, "two");
  assert.equal(store.state.panel2, "borrelly");
});

test("preset URL param applies preset", () => {
  const store = new Store({ window: fakeWindow("?preset=plan-observe"), storage: new FakeStorage() });
  assert.equal(store.state.panel, "solar-system");
  assert.equal(store.state.panel2, "observing");
  assert.equal(store.state.layout, "two");
});
