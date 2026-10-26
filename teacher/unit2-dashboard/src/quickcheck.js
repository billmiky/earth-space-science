// quickcheck.js — Projector-size check-for-understanding viewer.
// Used inline (Review stage) and as the Q overlay on every stage.

import { el, clear } from "./dom.js";
import { QUIZZES } from "./content/quizzes.js";

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * One-question-at-a-time viewer. Click an option (or press A–D) to lock in the
 * "class answer"; the explanation appears. "Show answer" reveals without picking.
 */
export function quizViewer(quizKey, { onDone } = {}) {
  const quiz = QUIZZES[quizKey];
  const root = el("div", { class: "quiz" });
  if (!quiz) {
    root.appendChild(el("p", { class: "muted", text: "No quick check for this stage." }));
    return { root, destroy() {}, handleKey: () => false };
  }
  let i = 0;
  const picks = new Map(); // question index → chosen option index

  function render() {
    clear(root);
    const q = quiz.questions[i];
    const picked = picks.get(i);
    const answered = picked !== undefined;

    root.appendChild(el("div", { class: "quiz-top" }, [
      el("div", { class: "quiz-title", text: quiz.title }),
      el("div", { class: "quiz-progress", text: `Question ${i + 1} of ${quiz.questions.length}` }),
    ]));
    root.appendChild(el("div", { class: "quiz-q", html: q.q }));

    const opts = el("div", { class: "quiz-opts" });
    q.options.forEach((opt, oi) => {
      let state = "";
      if (answered) {
        if (oi === q.correct) state = " correct";
        else if (oi === picked) state = " wrong";
        else state = " dim";
      }
      opts.appendChild(el("button", {
        class: `quiz-opt${state}`, type: "button", disabled: answered || null,
        onclick: () => choose(oi),
      }, [el("span", { class: "quiz-letter", text: LETTERS[oi] }), el("span", { html: opt })]));
    });
    root.appendChild(opts);

    if (answered) {
      const ok = picked === q.correct || picked === -1;
      root.appendChild(el("div", { class: `quiz-fb ${picked === q.correct ? "ok" : "no"}` }, [
        el("b", { text: picked === -1 ? "Answer: " : picked === q.correct ? "✅ Correct. " : "❌ Not quite. " }),
        el("span", { html: q.explanation }),
      ]));
      void ok;
    }

    const nav = el("div", { class: "quiz-nav" }, [
      el("button", { class: "tool-btn", type: "button", text: "◀ Back", disabled: i === 0 || null, onclick: () => { i--; render(); } }),
      !answered ? el("button", { class: "tool-btn", type: "button", text: "Show answer", onclick: () => choose(-1) }) : null,
      i < quiz.questions.length - 1
        ? el("button", { class: "tool-btn primary", type: "button", text: "Next ▶", onclick: () => { i++; render(); } })
        : el("button", { class: "tool-btn primary", type: "button", text: onDone ? "Done" : "Start over", onclick: () => { if (onDone) onDone(); else { i = 0; picks.clear(); render(); } } }),
    ]);
    root.appendChild(nav);

    if (picks.size && i === quiz.questions.length - 1 && answered) {
      let right = 0;
      for (const [qi, p] of picks) if (p === quiz.questions[qi].correct) right++;
      root.appendChild(el("div", { class: "quiz-score", text: `Class answers correct: ${right} of ${picks.size} answered` }));
    }
  }

  function choose(oi) {
    if (picks.has(i)) return;
    picks.set(i, oi);
    render();
  }

  function handleKey(e) {
    const k = e.key.toLowerCase();
    const n = ["a", "b", "c", "d"].indexOf(k);
    if (n >= 0 && n < quiz.questions[i].options.length && !picks.has(i)) { choose(n); return true; }
    if (k === "enter" || k === " ") {
      if (e.target && /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return false;
      if (!picks.has(i)) choose(-1);
      else if (i < quiz.questions.length - 1) { i++; render(); }
      return true;
    }
    return false;
  }

  render();
  return { root, destroy() {}, handleKey };
}

/** Modal overlay wrapper around the viewer. */
export function openQuickCheck(host, quizKey) {
  const prevFocus = document.activeElement;
  const backdrop = el("div", { class: "modal-backdrop", role: "dialog", "aria-modal": "true", "aria-label": "Check for understanding" });
  const viewer = quizViewer(quizKey, { onDone: close });
  const panel = el("div", { class: "modal" }, [
    el("button", { class: "modal-close tool-btn", type: "button", text: "✕ Close (Esc)", onclick: () => close() }),
    viewer.root,
  ]);
  backdrop.appendChild(panel);
  host.appendChild(backdrop);
  backdrop.addEventListener("mousedown", (e) => { if (e.target === backdrop) close(); });
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (viewer.handleKey(e)) { e.preventDefault(); e.stopPropagation(); }
  }
  document.addEventListener("keydown", onKey, true);
  function close() {
    document.removeEventListener("keydown", onKey, true);
    backdrop.remove();
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }
  panel.querySelector(".modal-close").focus();
  return { close };
}
