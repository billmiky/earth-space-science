import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PANEL_KEYS, PRESETS, parseParams, applyPreset, dedupePanels,
  serializeState, resolveState, defaultPrefs, isPanelKey,
} from "../src/params.js";

test("PANEL_KEYS contains all six panels", () => {
  assert.equal(PANEL_KEYS.length, 6);
  assert.ok(isPanelKey("solar"));
  assert.ok(isPanelKey("observing"));
  assert.ok(!isPanelKey("bogus"));
});

test("parseParams validates and drops invalid values", () => {
  assert.deepEqual(parseParams("?panel=bogus&layout=weird"), {});
  assert.deepEqual(parseParams("?panel=solar"), { panel: "solar" });
  assert.deepEqual(parseParams("?layout=two"), { layout: "two" });
  assert.deepEqual(parseParams("?panel=solar&panel2=host-star&layout=two"), {
    panel: "solar", panel2: "host-star", layout: "two",
  });
  // shorthand aliases
  assert.equal(parseParams("?p=borrelly").panel, "borrelly");
  assert.equal(parseParams("?p2=exoplanet").panel2, "exoplanet");
  // freeze + date
  assert.deepEqual(parseParams("?freeze=1"), { freeze: true });
  assert.deepEqual(parseParams("?freeze=0"), { freeze: false });
  assert.equal(parseParams("?date=2026-10-07").date, "2026-10-07");
  assert.equal(parseParams("?date=not-a-date").date, undefined);
  // preset validation
  assert.equal(parseParams("?preset=bogus").preset, undefined);
  assert.equal(parseParams("?preset=solar-record").preset, "solar-record");
});

test("applyPreset sets panel, panel2, layout", () => {
  const state = applyPreset("orbits-evidence", defaultPrefs());
  assert.equal(state.panel, "solar-system");
  assert.equal(state.panel2, "borrelly");
  assert.equal(state.layout, "two");
  assert.equal(state.preset, "orbits-evidence");

  const solo = applyPreset("solar-record", defaultPrefs());
  assert.equal(solo.layout, "single");
  assert.equal(solo.panel2, null);
});

test("dedupePanels prevents selecting the same panel twice", () => {
  assert.deepEqual(dedupePanels("solar", "solar"), { panel: "solar", panel2: null });
  assert.deepEqual(dedupePanels("solar", "mars"), { panel: "solar", panel2: "mars" });
});

test("serializeState encodes panels, layout, preset, freeze", () => {
  const s = { panel: "solar-system", panel2: "borrelly", layout: "two", preset: "orbits-evidence", frozen: true };
  const qs = serializeState(s);
  assert.match(qs, /panel=solar-system/);
  assert.match(qs, /panel2=borrelly/);
  assert.match(qs, /layout=two/);
  assert.match(qs, /preset=orbits-evidence/);
  assert.match(qs, /freeze=1/);
});

test("resolveState: URL params override saved preferences", () => {
  const saved = { ...defaultPrefs(), panel: "observing", layout: "single" };
  const out = resolveState({ panel: "solar" }, saved);
  assert.equal(out.panel, "solar");
  // layout carried from saved
  assert.equal(out.layout, "single");
});

test("resolveState: preset in URL overrides and dedupes", () => {
  const saved = { ...defaultPrefs(), panel: "solar", panel2: "solar", layout: "two" };
  const out = resolveState({ preset: "orbits-evidence" }, saved);
  assert.equal(out.panel, "solar-system");
  assert.equal(out.panel2, "borrelly");
  assert.equal(out.layout, "two");
});

test("resolveState: single layout clears second panel", () => {
  const saved = { ...defaultPrefs(), panel: "solar", panel2: "mars", layout: "two" };
  const out = resolveState({ layout: "single" }, saved);
  assert.equal(out.panel2, null);
});

test("resolveState: exoplanet + backend params", () => {
  const saved = defaultPrefs();
  const out = resolveState(
    { exoplanet: "Kepler-22 b", backend: "https://example.workers.dev" },
    saved
  );
  assert.equal(out.exoplanet, "Kepler-22 b");
  assert.equal(out.backend, "https://example.workers.dev");
});

test("preset definitions cover the four required presets", () => {
  assert.deepEqual(Object.keys(PRESETS).sort(), [
    "orbits-evidence", "plan-observe", "planet-parent-star", "solar-record",
  ]);
});
