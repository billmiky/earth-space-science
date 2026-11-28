import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STAGES, FIVE_E, resolveStage } from "../src/stages.js";
import { NOTES } from "../src/content/notes.js";
import { QUIZZES } from "../src/content/quizzes.js";
import { HINGES } from "../src/content/hinges.js";
import { MYTHS } from "../src/content/myths.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("ten stages, unique ids, valid 5E, day label, and panel module on disk", () => {
  assert.equal(STAGES.length, 10);
  const ids = new Set();
  for (const s of STAGES) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(FIVE_E[s.fiveE], `invalid 5E ${s.fiveE}`);
    assert.ok(s.day && s.short && s.title && s.question && s.packet);
    assert.ok(existsSync(join(root, "src/panels", `${s.id}.js`)), `missing panel ${s.id}.js`);
  }
});

test("stages follow 5E order (Engage, Explore ×3, Explain, Elaborate ×3, Evaluate ×2)", () => {
  assert.deepEqual(
    STAGES.map((s) => s.fiveE),
    ["engage", "explore", "explore", "explore", "explain", "elaborate", "elaborate", "elaborate", "evaluate", "evaluate"],
  );
});

test("resolveStage accepts ids, hashes, 1-based numbers, and junk", () => {
  assert.equal(resolveStage("#spectra"), 1);
  assert.equal(resolveStage("balloon"), 5);
  assert.equal(resolveStage("10"), 9);
  assert.equal(resolveStage("bogus"), 0);
});

test("every stage has complete teacher notes", () => {
  for (const s of STAGES) {
    const n = NOTES[s.id];
    assert.ok(n, `missing notes for ${s.id}`);
    assert.ok(n.minutes && n.flow.length && n.conferring.length && n.answers.length && n.lookFors.length && n.misconceptions.length);
  }
});

test("every quick-check key resolves and is well formed", () => {
  for (const s of STAGES) {
    assert.ok(Array.isArray(s.checks) && s.checks.length > 0, `no checks on ${s.id}`);
    for (const k of s.checks) {
      const qset = HINGES[k] || QUIZZES[k];
      assert.ok(qset, `missing check ${k} on ${s.id}`);
      assert.ok(qset.questions.length > 0);
      for (const q of qset.questions) {
        assert.ok(q.q && q.options.length >= 2 && q.correct >= 0 && q.correct < q.options.length && q.explanation);
      }
    }
  }
});

test("chapter content was extracted: 14 quizzes (summative has 10) and 8 Myth or Fact cards", () => {
  assert.equal(Object.keys(QUIZZES).length, 14);
  assert.equal(QUIZZES["ou-summative-quiz"].questions.length, 10);
  assert.equal(MYTHS.length, 8);
  for (const m of MYTHS) assert.ok((m.type === "Myth" || m.type === "Fact") && m.text && m.explanation);
});
