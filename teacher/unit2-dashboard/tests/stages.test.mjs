import { test } from "node:test";
import assert from "node:assert/strict";
import { STAGES, FIVE_E, resolveStage, stageById } from "../src/stages.js";
import { NOTES } from "../src/content/notes.js";
import { QUIZZES } from "../src/content/quizzes.js";
import { MYTHS } from "../src/content/myths.js";

test("ten stages, unique ids, every stage has a valid 5E and a panel module on disk", async () => {
  const { existsSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  assert.equal(STAGES.length, 10);
  assert.equal(new Set(STAGES.map((s) => s.id)).size, 10);
  for (const s of STAGES) {
    assert.ok(FIVE_E[s.fiveE], s.id);
    assert.ok(existsSync(fileURLToPath(new URL(`../src/panels/${s.id}.js`, import.meta.url))), `panel ${s.id}`);
    assert.ok(s.title && s.packet && s.question, s.id);
  }
});

test("stages follow the packet's 5E order", () => {
  const order = STAGES.map((s) => s.fiveE);
  assert.deepEqual(order, ["engage", "explore", "explore", "explain", "explore", "explain", "elaborate", "elaborate", "evaluate", "evaluate"]);
});

test("resolveStage accepts ids, hashes, 1-based numbers, and junk", () => {
  assert.equal(resolveStage("ages"), 2);
  assert.equal(resolveStage("#water"), 5);
  assert.equal(resolveStage("4"), 3);
  assert.equal(resolveStage("10"), 9);
  assert.equal(resolveStage("0"), 0);
  assert.equal(resolveStage("99"), 0);
  assert.equal(resolveStage("nope"), 0);
  assert.equal(resolveStage(null), 0);
  assert.equal(stageById("life").id, "life");
});

test("every stage has teacher notes with the required sections", () => {
  for (const s of STAGES) {
    const n = NOTES[s.id];
    assert.ok(n, `notes for ${s.id}`);
    for (const k of ["minutes", "doNow"]) assert.ok(typeof n[k] === "string" && n[k], `${s.id}.${k}`);
    for (const k of ["flow", "answers", "lookFors", "misconceptions", "support"]) assert.ok(Array.isArray(n[k]) && n[k].length, `${s.id}.${k}`);
    for (const [label, value] of n.answers) assert.ok(label && value, `${s.id} answer`);
  }
});

test("quick-check keys exist and quizzes are well formed", () => {
  for (const s of STAGES) if (s.key) assert.ok(QUIZZES[s.key], `quiz ${s.key}`);
  assert.equal(QUIZZES["ss-summative-quiz"].questions.length, 10);
  for (const [key, q] of Object.entries(QUIZZES)) {
    assert.ok(q.questions.length >= 3, key);
    for (const x of q.questions) {
      assert.ok(x.q && x.explanation, key);
      assert.ok(x.options.length >= 2 && x.correct >= 0 && x.correct < x.options.length, `${key}: ${x.q}`);
    }
  }
});

test("myth or fact cards: 8, each typed Myth or Fact, and the notes answer key matches", () => {
  assert.equal(MYTHS.length, 8);
  assert.ok(MYTHS.every((m) => m.text && m.explanation && ["Myth", "Fact"].includes(m.type)));
  const myths = MYTHS.map((m, i) => (m.type === "Myth" ? i + 1 : null)).filter(Boolean).join(", ");
  assert.ok(NOTES.review.answers.some(([k, v]) => k === "Myths" && v === `Cards ${myths}`), `answer key should say Cards ${myths}`);
});

test("notes answer keys quote ages that the models produce", async () => {
  const { u238Age } = await import("../src/science.js");
  const a = NOTES.ages.answers.map((r) => r.join(" ")).join(" ");
  assert.ok(a.includes(u238Age(50.5).toFixed(2)));
  assert.ok(a.includes(u238Age(49).toFixed(2)));
  assert.ok(NOTES.life.answers[0][1].includes(u238Age(59).toFixed(1)));
});
