// panels/engage.js — Stage 1 (Day 1 · Engage): Cosmic scale vote + Rumors class brainstorm board.

import { el, clear } from "../dom.js";
import { card, layout, packetTask, saved } from "../ui.js";

const DEFAULT_IDEAS = [
  { text: "A huge explosion sent matter outward into space", status: "open" },
  { text: "Gravity pulled gas and dust together into stars and planets", status: "open" },
  { text: "The universe has always been here and stayed the same size", status: "open" },
];

export function mount(container) {
  const ideasStore = saved("day1-ideas", DEFAULT_IDEAS);
  const voteStore = saved("stars-vote", { sand: 0, stars: 0, revealed: false });

  // ---------- Left: Cosmic scale vote ----------
  const voteBox = el("div", { class: "stack-sm" });
  function renderVote() {
    clear(voteBox);
    const v = voteStore.get();
    const total = v.sand + v.stars;
    const sandPct = total ? Math.round((v.sand / total) * 100) : 0;
    const starPct = total ? Math.round((v.stars / total) * 100) : 0;

    voteBox.append(
      el("p", { class: "lead", text: "Which is greater: all the grains of sand on Earth's beaches, or all the stars in the observable universe?" }),
      el("div", { class: "vote-grid" }, [
        el("button", {
          class: "vote-btn", type: "button",
          onclick: () => { voteStore.set({ ...v, sand: v.sand + 1 }); renderVote(); },
        }, [
          el("span", { class: "vote-emoji", text: "🏖️" }),
          el("span", { class: "vote-label", text: "Grains of Sand on Earth" }),
          el("span", { class: "vote-count", text: `${v.sand} vote${v.sand === 1 ? "" : "s"}${total ? ` (${sandPct}%)` : ""}` }),
        ]),
        el("button", {
          class: "vote-btn", type: "button",
          onclick: () => { voteStore.set({ ...v, stars: v.stars + 1 }); renderVote(); },
        }, [
          el("span", { class: "vote-emoji", text: "✨" }),
          el("span", { class: "vote-label", text: "Stars in the Universe" }),
          el("span", { class: "vote-count", text: `${v.stars} vote${v.stars === 1 ? "" : "s"}${total ? ` (${starPct}%)` : ""}` }),
        ]),
      ]),
      el("div", { class: "row" }, [
        el("button", {
          class: "tool-btn primary", type: "button",
          text: v.revealed ? "Hide cosmic scale reveal" : "Reveal cosmic scale",
          onclick: () => { voteStore.set({ ...v, revealed: !v.revealed }); renderVote(); },
        }),
        el("button", {
          class: "tool-btn", type: "button", text: "Reset votes",
          onclick: () => { voteStore.set({ sand: 0, stars: 0, revealed: false }); renderVote(); },
        }),
      ]),
    );

    if (v.revealed) {
      voteBox.append(el("div", { class: "reveal-box ok" }, [
        el("div", { class: "scale-compare" }, [
          el("div", { class: "scale-item" }, [
            el("div", { class: "scale-num", text: "~10¹⁸ – 10¹⁹" }),
            el("div", { class: "scale-lbl", text: "Grains of sand on every beach on Earth" }),
          ]),
          el("div", { class: "scale-vs", text: "vs." }),
          el("div", { class: "scale-item hi" }, [
            el("div", { class: "scale-num", text: "~10²² – 10²⁴" }),
            el("div", { class: "scale-lbl", text: "Stars in the observable universe (~10,000× more!)" }),
          ]),
        ]),
        el("p", { class: "muted", text: "The Milky Way alone holds 100–400 billion stars — and it is just one of hundreds of billions of galaxies." }),
      ]));
    }
  }
  renderVote();

  const frameBox = el("div", { class: "callout-info" }, [
    el("strong", { text: "Framing the classroom conversation: " }),
    "In science class we look at the evidence scientists have gathered to build a scientific explanation. A scientific explanation isn't necessarily in conflict with religious or philosophical beliefs — many scientists hold both.",
  ]);

  // ---------- Right: Live Rumors Ideas Board (saved for Days 4 & 6) ----------
  const ideaInput = el("input", {
    class: "text-input", type: "text", placeholder: "Add a class idea from Rumors (saved for Days 4 & 6)…",
    "aria-label": "Add a student idea about how the universe formed",
  });
  const ideasList = el("div", { class: "ideas-list" });

  function renderIdeas() {
    clear(ideasList);
    const items = ideasStore.get();
    if (!items.length) {
      ideasList.append(el("p", { class: "muted", text: "No class ideas recorded yet. Type ideas above as pairs share during Rumors." }));
      return;
    }
    items.forEach((it, idx) => {
      ideasList.append(el("div", { class: `idea-row st-${it.status || "open"}` }, [
        el("span", { class: "idea-text", text: it.text }),
        el("button", {
          class: "mini-btn", type: "button", title: "Remove idea", "aria-label": "Remove idea", text: "✕",
          onclick: () => {
            const next = ideasStore.get().filter((_, i) => i !== idx);
            ideasStore.set(next);
            renderIdeas();
          },
        }),
      ]));
    });
  }
  renderIdeas();

  const addIdea = () => {
    const t = ideaInput.value.trim();
    if (!t) return;
    ideasStore.set([...ideasStore.get(), { text: t, status: "open" }]);
    ideaInput.value = "";
    renderIdeas();
  };
  ideaInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addIdea(); } });

  const formRow = el("div", { class: "row" }, [
    ideaInput,
    el("button", { class: "tool-btn primary", type: "button", text: "+ Add idea", onclick: addIdea }),
  ]);

  container.append(layout("cols-2", [
    el("div", { class: "stack" }, [
      card("Stars vs. Grains of Sand", [voteBox, frameBox], { kicker: "Class vote · Scale of the cosmos" }),
      packetTask("Engage · p. 3", [
        "Brainstorm 1–2 ideas about how the universe formed, plus a reason for each.",
        "Run <b>Rumors</b>: swap ideas with 3 classmates and listen for patterns.",
      ]),
    ]),
    card("Class Ideas Board (Rumors)", [
      el("p", { class: "muted", text: "Saved automatically on this device so we can revisit and test these ideas against evidence on Days 4 and 6." }),
      formRow,
      ideasList,
      el("div", { class: "row" }, [
        el("button", {
          class: "tool-btn", type: "button", text: "Restore starter examples",
          onclick: () => { ideasStore.set(DEFAULT_IDEAS); renderIdeas(); },
        }),
      ]),
    ], { kicker: "Revisited on Days 4 & 6" }),
  ]));
}
