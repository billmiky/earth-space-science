import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const read = (rel) => readFileSync(join(repoRoot, rel), "utf8");
const exists = (rel) => existsSync(join(repoRoot, rel));

const FILES = [
  "teacher/unit2-dashboard/index.html", "teacher/unit2-dashboard/app.js", "teacher/unit2-dashboard/styles.css",
  "teacher/unit2-dashboard/src/",
];

test("Unit 2 dashboard files exist and are published resources in _quarto.yml", () => {
  const yml = read("_quarto.yml");
  for (const f of FILES) {
    assert.ok(exists(f), `missing ${f}`);
    assert.ok(yml.includes(f), `_quarto.yml missing resource: ${f}`);
  }
  for (const img of ["images/moon-full-galileo.jpg", "images/stromatolite-tumbiana-nasa.jpg"]) {
    assert.ok(exists(img), `missing ${img}`);
    assert.ok(yml.includes(img), `_quarto.yml missing resource: ${img}`);
  }
});

test("dashboard HTML uses relative asset paths and is noindex", () => {
  const html = read("teacher/unit2-dashboard/index.html");
  assert.ok(html.includes('href="styles.css"') && html.includes('src="app.js"'));
  assert.ok(!html.includes('href="/') && !html.includes('src="/'));
  assert.ok(/noindex/.test(html));
});

test("images referenced by panels resolve from the dashboard folder", () => {
  for (const f of ["engage", "life"]) {
    const src = read(`teacher/unit2-dashboard/src/panels/${f}.js`);
    for (const m of src.matchAll(/src: "(\.\.\/\.\.\/images\/[^"]+)"/g)) {
      assert.ok(exists(join("teacher/unit2-dashboard", m[1])), `${f}: ${m[1]}`);
    }
  }
});

test("every panel module in app.js exists", () => {
  const app = read("teacher/unit2-dashboard/app.js");
  const paths = [...app.matchAll(/import\("\.\/(src\/panels\/[\w-]+\.js)"\)/g)].map((m) => m[1]);
  assert.equal(paths.length, 10);
  for (const p of paths) assert.ok(exists(join("teacher/unit2-dashboard", p)), p);
});

test("teacher hub links to the Unit 2 dashboard (qmd and rendered html)", () => {
  for (const f of ["teacher/index.qmd", "teacher/index.html"]) {
    assert.ok(read(f).includes('href="unit2-dashboard/index.html"'), `${f} missing Unit 2 dashboard link`);
  }
});

test("Unit 2 guide documents the dashboard and sets search: false", () => {
  const qmd = read("teacher/unit2-guide.qmd");
  assert.ok(/search:\s*false/.test(qmd));
  assert.ok(qmd.includes("unit2-dashboard/index.html"));
  assert.ok(read("teacher/unit2-guide.html").includes("unit2-dashboard/index.html"));
});

test("dashboard source never loads remote scripts or fonts (works on a locked-down school network)", () => {
  for (const f of ["index.html", "app.js", "styles.css"]) {
    assert.ok(!/https?:\/\//.test(read(`teacher/unit2-dashboard/${f}`).replace(/xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, "")), `${f} has a remote URL`);
  }
});
