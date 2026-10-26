// panels/review.js — Review: Myth or Fact card game + the end-of-chapter quiz.

import { el, tabs } from "../dom.js";
import { MYTHS } from "../content/myths.js";
import { quizViewer } from "../quickcheck.js";

export function mount(container) {
  const body = el("div", { class: "tab-body fill" });
  let viewer = null;
  const t = tabs(["🧐 Myth or Fact?", "📝 Chapter quiz"], (i) => { viewer = null; body.replaceChildren(i === 0 ? myths() : quiz()); });
  container.appendChild(el("div", { class: "stack" }, [el("div", { class: "tab-bar" }, [t.root]), body]));

  function quiz() {
    viewer = quizViewer("ss-summative-quiz");
    return el("div", { class: "quiz-wrap" }, [viewer.root]);
  }

  function myths() {
    let i = 0, score = 0, answered = 0, done = false, picked = null;
    const root = el("div", { class: "myth" });
    function render() {
      root.replaceChildren();
      if (done) {
        root.append(
          el("div", { class: "myth-done" }, [
            el("div", { class: "big", text: "🎉" }),
            el("h3", { text: "All cards complete!" }),
            el("p", { text: `Class score: ${score} of ${MYTHS.length}` }),
            el("button", { class: "tool-btn primary", type: "button", text: "Play again", onclick: () => { i = 0; score = 0; answered = 0; done = false; picked = null; render(); } }),
          ]));
        return;
      }
      const c = MYTHS[i];
      root.append(
        el("div", { class: "myth-top" }, [el("span", { text: `Card ${i + 1} of ${MYTHS.length}` }), el("span", { text: `Score ${score} / ${answered}` })]),
        el("div", { class: "myth-card", text: c.text }),
        el("div", { class: "myth-btns" }, [
          el("button", { class: `myth-btn m ${picked ? "dim" : ""}`, type: "button", disabled: picked || null, text: "❌ MYTH", onclick: () => answer("Myth") }),
          el("button", { class: `myth-btn f ${picked ? "dim" : ""}`, type: "button", disabled: picked || null, text: "✅ FACT", onclick: () => answer("Fact") }),
        ]),
      );
      if (picked) {
        const ok = picked === c.type;
        root.append(
          el("div", { class: `quiz-fb ${ok ? "ok" : "no"}` }, [el("b", { text: ok ? "✅ Correct! " : `❌ That's a ${c.type}! ` }), el("span", { text: c.explanation })]),
          el("button", { class: "tool-btn primary", type: "button", text: i < MYTHS.length - 1 ? "Next card ▶" : "Finish", onclick: () => { picked = null; if (i < MYTHS.length - 1) i++; else done = true; render(); } }));
      }
    }
    function answer(choice) {
      if (picked) return;
      picked = choice; answered++;
      if (choice === MYTHS[i].type) score++;
      render();
    }
    render();
    return el("div", { class: "myth-wrap" }, [root]);
  }

  // A–D (and Enter/Space) answer the chapter quiz while this stage is on screen.
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (viewer && viewer.handleKey(e)) e.preventDefault();
  }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}
