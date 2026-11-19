// panels/timeline.js — Days 2–3 Explore Part 1: build the fossil timeline.
// Embeds the full-screen Coevolution timeline (../../unit2-coevolution-timeline/) and adds
// the Timeline Checklist, a cause-or-correlation discussion tool, and a "no caption" challenge.

import { el, chips, tabs } from "../dom.js";
import { card, bullets } from "../ui.js";

const TL = "../unit2-coevolution-timeline/index.html";
const MODES = [
  { label: "All cards", value: "all" },
  { label: "Build it (Day 2)", value: "build" },
  { label: "Connections (Day 3)", value: "conn" },
];

const CHECKLIST = [
  "At least <b>5 arrows</b> showing causal relationships",
  "At least <b>3 arrows cross the midline</b> (life ↔ Earth's systems)",
  "An <b>annotation on every arrow</b> (what happened and why)",
  "The <b>role of oxygen</b> shown clearly",
  "<b>Increasing complexity</b> shown clearly (blue arrows)",
];

// Links to discuss: is there a known process, or only timing? (guide Day 3 answer key + Q5)
const LINKS = [
  { a: "Stromatolites with photosynthesis (2.7 bya)", b: "Banded iron formation (2.5 bya)", verdict: "Causal case is strong",
    why: "Known mechanism: photosynthesis releases O₂, and O₂ + dissolved iron → iron oxide (rust). The nail demo shows the same reaction." },
  { a: "Banded iron / rising O₂ (2.5 bya)", b: "Eukaryotic cells (2.1 bya)", verdict: "Timing + a mechanism",
    why: "Eukaryotes use aerobic respiration, which needs oxygen and releases far more energy. Timing alone would only be correlation." },
  { a: "Rodinia breaks up (~1 bya)", b: "Abundant multicellular algae (~1 bya)", verdict: "Likely, still being tested",
    why: "Erosion would add nutrients to the ocean, but gaps in the record mean this stays a likely explanation, not a proven cause." },
  { a: "Swamp plants (~300 mya)", b: "21-inch dragonfly (~300 mya)", verdict: "Timing + a mechanism",
    why: "Insects get oxygen by diffusion through tiny tubes, so a giant insect needs very high O₂, which the swamp plants made." },
  { a: "Ice cream sales go up in July", b: "Sunburns go up in July", verdict: "Correlation only",
    why: "Neither causes the other. Hot, sunny weather causes both. (Do Now B on Day 3.)" },
];

// Photos from the timeline cards, shown with no caption (packet Q4).
const MYSTERY = [
  { img: "cyanobacteria", answer: "Cyanobacteria microfossils (~2.1 bya)", note: "Microscopic: without a microscope and context it looks like dots." },
  { img: "banded-iron", answer: "Banded iron formation (~2.5 bya)", note: "Just striped rock unless you know the red bands are iron oxide." },
  { img: "stromatolite", answer: "Stromatolite (~3.4 bya)", note: "Layered rock. Folded non-living rock can look the same." },
  { img: "eukaryotes", answer: "Early eukaryotic cells (~2.1 bya)", note: "Tiny round shapes; needs chemical tests and the rock's age." },
  { img: "multicellular", answer: "Multicellular organism fossil (~600 mya)", note: "Soft bodies leave faint impressions that are easy to misread." },
];

export function mount(container) {
  let mode = "build";
  const frame = el("iframe", {
    class: "tl-frame", title: "Coevolution of Earth and Life interactive timeline (24 packet cards)",
    src: `${TL}?mode=${mode}`, allow: "fullscreen", loading: "lazy",
  });
  const modeChips = chips(MODES, mode, (v) => { mode = v; frame.src = `${TL}?mode=${v}`; }, { label: "Timeline mode" });
  const openLink = el("a", { class: "tool-btn", href: TL, target: "_blank", rel: "noopener", text: "Open on its own ↗" });

  const tabBody = el("div", { class: "tab-body" });
  const t = tabs(["✅ Checklist", "🔗 Cause?", "🔎 No caption"], (i) => tabBody.replaceChildren([checklist, causeTab, mysteryTab][i]()));

  function checklist() {
    const on = new Set();
    const listEl = el("ul", { class: "check" });
    function draw() {
      listEl.replaceChildren(...CHECKLIST.map((c, i) => el("li", {}, [el("button", {
        class: `chk ${on.has(i) ? "on" : ""}`, type: "button", role: "checkbox", "aria-checked": String(on.has(i)),
        onclick: () => { if (on.has(i)) on.delete(i); else on.add(i); draw(); },
      }, [el("span", { class: "box", text: on.has(i) ? "✔" : "" }), el("span", { html: c })])])));
    }
    draw();
    return el("div", {}, [
      el("p", { class: "muted", text: "Timeline Checklist (Day 3). Use it with each group; a complete poster is the gate for Day 4. Red = causal, blue = increasing complexity." }),
      listEl,
      card("Model one arrow (Day 2, minute 40)", [bullets([
        "Hold up <b>Stromatolites with photosynthesis</b> (2.7 bya) and <b>Banded iron formation</b> (2.5 bya).",
        "Point out the shared word <b>oxygen</b>. Draw a red arrow and write: “Oxygen from photosynthesis rusted iron in the ocean.”",
        "In the timeline, choose <b>Connections</b> to show the same arrow.",
      ])], { cls: "callout" }),
    ]);
  }

  function causeTab() {
    let i = 0, shown = false;
    const box = el("div", {});
    function draw() {
      const l = LINKS[i];
      box.replaceChildren(
        el("div", { class: "link-pair" }, [el("span", { class: "lp-a", text: l.a }), el("span", { class: "lp-arrow", text: "→" }), el("span", { class: "lp-b", text: l.b })]),
        el("p", { class: "blurb", html: "Is there a <b>known process</b> linking these, or do they only happen at about the same time?" }),
        shown ? el("div", { class: "fb ok" }, [el("b", { text: `${l.verdict}. ` }), l.why]) : el("button", { class: "tool-btn primary", type: "button", text: "Reveal", onclick: () => { shown = true; draw(); } }),
        el("div", { class: "row" }, [
          el("button", { class: "tool-btn", type: "button", text: "◀", "aria-label": "Previous link", disabled: i === 0 || null, onclick: () => { i--; shown = false; draw(); } }),
          el("span", { class: "muted", text: `${i + 1} of ${LINKS.length}` }),
          el("button", { class: "tool-btn", type: "button", text: "▶", "aria-label": "Next link", disabled: i === LINKS.length - 1 || null, onclick: () => { i++; shown = false; draw(); } }),
        ]),
      );
    }
    draw();
    return el("div", {}, [el("p", { class: "muted", text: "Packet Q5: is your evidence correlative or causative? What extra information would make it stronger?" }), box]);
  }

  function mysteryTab() {
    let i = 0, shown = false;
    const box = el("div", {});
    function draw() {
      const m = MYSTERY[i];
      box.replaceChildren(
        el("figure", { class: "photo mystery" }, [
          el("img", { src: `../unit2-coevolution-timeline/img/${m.img}.jpg`, alt: shown ? `Timeline card photo: ${m.answer}` : "Mystery photo from one of the timeline cards, caption hidden" }),
          el("figcaption", { text: "Card image: New Visions ESS Unit 2 timeline cards." }),
        ]),
        shown ? el("div", { class: "fb ok" }, [el("b", { text: `${m.answer}. ` }), m.note])
          : el("button", { class: "tool-btn primary", type: "button", text: "Reveal what it is", onclick: () => { shown = true; draw(); } }),
        el("div", { class: "row" }, [
          el("button", { class: "tool-btn", type: "button", text: "◀", "aria-label": "Previous photo", disabled: i === 0 || null, onclick: () => { i--; shown = false; draw(); } }),
          el("span", { class: "muted", text: `${i + 1} of ${MYSTERY.length}` }),
          el("button", { class: "tool-btn", type: "button", text: "▶", "aria-label": "Next photo", disabled: i === MYSTERY.length - 1 || null, onclick: () => { i++; shown = false; draw(); } }),
        ]),
      );
    }
    draw();
    return el("div", {}, [el("p", { class: "muted", text: "Packet Q4: how easy is it to tell what a fossil shows without a caption? Ask the class first." }), box]);
  }

  container.appendChild(el("div", { class: "panel-grid tl-grid" }, [
    el("div", { class: "col tl-main" }, [
      el("div", { class: "card-tools" }, [modeChips.root, openLink]),
      frame,
      el("p", { class: "muted", html: "Click inside the timeline to use its own keys: <kbd>←</kbd> <kbd>→</kbd> step, <kbd>Enter</kbd> opens the card. Click outside it to use the dashboard keys again." }),
    ]),
    el("div", { class: "col" }, [card(null, [t.root, tabBody])]),
  ]));
}
