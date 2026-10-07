import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");

function readRepo(rel) {
  return readFileSync(join(repoRoot, rel), "utf8");
}
function exists(rel) {
  return existsSync(join(repoRoot, rel));
}

test("teacher pages are published resources in _quarto.yml", () => {
  const yml = readRepo("_quarto.yml");
  for (const res of [
    "teacher/index.html",
    "teacher/unit1-guide.html",
    "teacher/unit6-guide.html",
    "teacher/unit1-dashboard/index.html",
    "teacher/unit1-dashboard/src/",
    "teacher/unit1-dashboard/data/",
  ]) {
    assert.ok(yml.includes(res), `_quarto.yml missing resource: ${res}`);
  }
});

test("teacher pages are NOT in book chapters (student navigation)", () => {
  const yml = readRepo("_quarto.yml");
  const chapters = yml.split("chapters:")[1] || "";
  assert.ok(!chapters.includes("teacher/"), "teacher pages leaked into student chapters");
});

test("teacher documentation pages use search: false", () => {
  for (const f of ["index.qmd", "unit1-guide.qmd", "unit2-guide.qmd", "unit6-guide.qmd"]) {
    const src = readRepo(join("teacher", f));
    assert.ok(/search:\s*false/.test(src), `teacher/${f} does not set search: false`);
  }
});

test("published teacher assets exist on disk", () => {
  const files = [
    "teacher/index.html",
    "teacher/unit1-guide.html",
    "teacher/unit2-guide.html",
    "teacher/unit3-guide.html",
    "teacher/unit4-guide.html",
    "teacher/unit5-guide.html",
    "teacher/unit6-guide.html",
    "teacher/unit1-dashboard/index.html",
    "teacher/unit1-dashboard/app.js",
    "teacher/unit1-dashboard/styles.css",
    "teacher/unit1-dashboard/data/exoplanets.json",
    "teacher/unit1-dashboard/data/borrelly-elements.json",
    "teacher/unit1-dashboard/data/reference-stars.json",
  ];
  for (const f of files) {
    assert.ok(exists(f), `missing published file: ${f}`);
  }
});

test("dashboard HTML uses relative asset paths (no leading-root URLs)", () => {
  const html = readRepo("teacher/unit1-dashboard/index.html");
  assert.ok(html.includes('href="styles.css"'), "styles.css not relative");
  assert.ok(html.includes('src="app.js"'), "app.js not relative");
  assert.ok(!html.includes('href="/'), "dashboard uses a leading-root URL");
});

test("hub links resolve relative to the teacher folder", () => {
  const html = readRepo("teacher/index.html");
  assert.ok(html.includes('href="unit1-dashboard/index.html"'), "dashboard link missing/absolute");
  assert.ok(html.includes('href="unit1-guide.html"'), "guide link missing/absolute");
});

test("bundled exoplanet data has provenance + retrieval date", () => {
  const data = JSON.parse(readRepo("teacher/unit1-dashboard/data/exoplanets.json"));
  assert.ok(data.source, "source missing");
  assert.ok(data.retrieved_at, "retrieved_at missing");
  assert.ok(Array.isArray(data.planets) && data.planets.length >= 10);
});
