import { test } from "node:test";
import assert from "node:assert/strict";
import { decideLayout } from "../src/layout.js";

test("single mode is always single", () => {
  assert.equal(decideLayout("single", 1920, 1080), "single");
  assert.equal(decideLayout("single", 500, 500), "single");
});

test("two-panel side-by-side on large screens", () => {
  assert.equal(decideLayout("two", 1920, 1080), "side-by-side");
  assert.equal(decideLayout("two", 1366, 768), "side-by-side");
});

test("two-panel stacked on medium widths or short heights", () => {
  // tall but medium width
  assert.equal(decideLayout("two", 800, 900), "stacked");
  // wide but short
  assert.equal(decideLayout("two", 1600, 500), "stacked");
});

test("two-panel pair-switch on narrow viewports", () => {
  assert.equal(decideLayout("two", 600, 900), "pair-switch");
  assert.equal(decideLayout("two", 375, 700), "pair-switch");
});
