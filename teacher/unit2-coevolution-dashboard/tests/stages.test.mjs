import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { STAGES, FIVE_E, resolveStage, stageById } from "../src/stages.js";
import { NOTES } from "../src/content/notes.js";
import { QUIZZES } from "../src/content/quizzes.js";
import { HINGES } from "../src/content/hinges.js";
import { MYTHS } from "../src/content/myths.js";

test("ten stages, unique ids, valid 5E, a day label, and a panel module on disk", () => {
  assert.equal(STAGES.length, 10);
  assert.equal(new Set(STAGES.map((s) => s.id)).size, 10);
  for (const s of STAGES) {
    assert.ok(FIVE_E[s.fiveE], s.id);
    assert.ok(s.title && s.packet && s.question && s.day, s.id);
    assert.ok(existsSync(fileURLToPath(new URL(`../src/panels/${s.id}.js`, import.meta.url))), `panel ${s.id}`);
  }
});

test("stages follow the guide's 5E order (Engage, Explore ×3, Explain ×2, Elaborate ×2, Evaluate ×2)", () => {
  assert.deepEqual(STAGES.map((s) => s.fiveE), ["engage", "explore", "explore", "explore", "explain", "explain", "elaborate", "elaborate", "evaluate", "evaluate"]);
});

test("resolveStage accepts ids, hashes, 1-based numbers, and junk", () => {
  assert.equal(resolveStage("dating"), 2);
  assert.equal(resolveStage("#o2ext"), 7);
  assert.equal(resolveStage("4"), 3);
  assert.equal(resolveStage("10"), 9);
  assert.equal(resolveStage("0"), 0);
  assert.equal(resolveStage("99"), 0);
  assert.equal(resolveStage("nope"), 0);
  assert.equal(resolveStage(null), 0);
  assert.equal(stageById("argument").id, "argument");
});

test("every stage has complete teacher notes", () => {
  for (const s of STAGES) {
    const n = NOTES[s.id];
    assert.ok(n, `notes for ${s.id}`);
    assert.ok(typeof n.minutes === "string" && n.minutes, `${s.id}.minutes`);
    assert.ok(typeof n.homework === "string" && n.homework, `${s.id}.homework`);
    for (const k of ["doNow", "flow", "conferring", "answers", "lookFors", "misconceptions", "exitSlips"]) assert.ok(Array.isArray(n[k]) && n[k].length, `${s.id}.${k}`);
    for (const k of ["doNow", "flow", "answers", "exitSlips"]) for (const pair of n[k]) assert.ok(pair.length === 2 && pair[0] && pair[1], `${s.id}.${k} pair`);
  }
});

test("every quick-check key resolves (chapter quizzes and guide hinges) and is well formed", () => {
  for (const s of STAGES) for (const k of s.checks) assert.ok(QUIZZES[k] || HINGES[k], `${s.id}: ${k}`);
  for (const [key, q] of Object.entries({ ...QUIZZES, ...HINGES })) {
    assert.ok(q.title && q.questions.length >= 1, key);
    for (const x of q.questions) {
      assert.ok(x.q && x.explanation, key);
      assert.ok(x.options.length >= 2 && x.correct >= 0 && x.correct < x.options.length, `${key}: ${x.q}`);
      if (x.why) { assert.equal(x.why.length, x.options.length, `${key} why length`); assert.equal(x.why[x.correct], "", `${key} correct option has no 'why'`); }
    }
  }
});

test("chapter content was extracted: 9 quizzes (summative has 10) and 8 Myth or Fact cards", () => {
  assert.equal(Object.keys(QUIZZES).length, 9);
  assert.equal(QUIZZES["coevolution-summative-quiz"].questions.length, 10);
  assert.equal(MYTHS.length, 8);
  assert.ok(MYTHS.every((m) => m.text && m.explanation && ["Myth", "Fact"].includes(m.type)));
  const myths = MYTHS.map((m, i) => (m.type === "Myth" ? i + 1 : null)).filter(Boolean).join(", ");
  assert.ok(NOTES.review.answers.some(([k, v]) => k === "Myths" && v === `Cards ${myths}`));
});
