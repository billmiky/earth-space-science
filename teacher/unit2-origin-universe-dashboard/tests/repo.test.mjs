import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const read = (rel) => readFileSync(join(repoRoot, rel), "utf8");
const exists = (rel) => existsSync(join(repoRoot, rel));
const D = "teacher/unit2-origin-universe-dashboard";

test("dashboard files exist and are published resources in _quarto.yml", () => {
  const yml = read("_quarto.yml");
  for (const f of [`${D}/index.html`, `${D}/app.js`, `${D}/styles.css`, `${D}/src/`]) {
    assert.ok(exists(f), `missing ${f}`);
    assert.ok(yml.includes(f), `_quarto.yml missing resource: ${f}`);
  }
});

test("dashboard HTML uses relative asset paths, teacher-gate.js, and is noindex", () => {
  const html = read(`${D}/index.html`);
  assert.ok(html.includes('href="styles.css"') && html.includes('src="app.js"'));
  assert.ok(html.includes('src="../teacher-gate.js"'));
  assert.ok(!html.includes('href="/') && !html.includes('src="/'));
  assert.ok(/noindex/.test(html));
});

test("every panel module in app.js exists", () => {
  const app = read(`${D}/app.js`);
  const paths = [...app.matchAll(/import\("\.\/(src\/panels\/[\w-]+\.js)"\)/g)].map((m) => m[1]);
  assert.equal(paths.length, 10);
  for (const p of paths) assert.ok(exists(join(D, p)), p);
});

test("teacher hub and origin of the universe guide link to the dashboard", () => {
  for (const f of ["teacher/index.qmd", "teacher/index.html"]) {
    assert.ok(read(f).includes('href="unit2-origin-universe-dashboard/index.html"'), f);
  }
  assert.ok(read("teacher/unit2-origin-universe-guide.html").includes("unit2-origin-universe-dashboard/index.html"));
});

test("dashboard source never loads remote scripts or fonts (works on a locked-down school network)", () => {
  const files = [
    "index.html", "app.js", "styles.css",
    ...readdirSync(join(repoRoot, D, "src")).filter((f) => f.endsWith(".js")).map((f) => `src/${f}`),
    ...readdirSync(join(repoRoot, D, "src/panels")).map((f) => `src/panels/${f}`),
  ];
  for (const f of files) {
    const body = read(`${D}/${f}`).replace(/xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, "").replace(/"http:\/\/www\.w3\.org\/2000\/svg"/g, "");
    assert.ok(!/https?:\/\//.test(body), `${f} has a remote URL`);
  }
});

test("quizzes.js and myths.js are in sync with the chapter (re-run scripts/extract-content.mjs if this fails)", async () => {
  const { execFileSync } = await import("node:child_process");
  const before = [read(`${D}/src/content/quizzes.js`), read(`${D}/src/content/myths.js`)];
  execFileSync(process.execPath, [join(repoRoot, D, "scripts/extract-content.mjs")]);
  assert.equal(read(`${D}/src/content/quizzes.js`), before[0]);
  assert.equal(read(`${D}/src/content/myths.js`), before[1]);
});
