// panels/evaluate.js — Day 8 Evaluate: Why Did It Take So Long?
// Revisiting the Performance Task: build the explanation (≥ 2 organisms that changed Earth's
// systems, ≥ 3 times oxygen led to more complex life), revisit the Day 1 ideas, rubric
// checklists for both written arguments, the Idea Carousel key and the performance-task link.

import { el, tabs } from "../dom.js";
import { card, layout, bullets, saved } from "../ui.js";

const QUESTION = "What set of conditions allowed humans to evolve on Earth, and why did it take about 3.5 billion years?";

const ORGANISMS = [
  { id: "o1", ok: true, text: "Photosynthesizing microbes in stromatolites (~2.7 bya)", how: "added O₂ to the oceans, which rusted dissolved iron into banded iron formations (~2.5 bya)" },
  { id: "o2", ok: true, text: "Cyanobacteria (~2.1 bya)", how: "kept adding O₂ until it built up in the air and rusted rocks on land into red beds (~2 bya)" },
  { id: "o3", ok: true, text: "Abundant multicellular algae (~1 bya)", how: "made a burst of oxygen; banded iron formations returned (~750 mya)" },
  { id: "o4", ok: true, text: "Land plants (~455 mya) and vascular plants (~420 mya)", how: "built soil with microbes (~407 mya) and raised O₂ toward 20–30%" },
  { id: "o5", ok: true, text: "Swamp plants (~300 mya)", how: "pushed oxygen to its peak and buried carbon that became coal" },
  { id: "o6", ok: false, text: "Dinosaurs (~230 mya)", why: "No card or graph links dinosaurs to a change in Earth's systems. Pick an organism that changed the oceans, air or rocks." },
];

const OXYGEN = [
  { id: "x1", ok: true, text: "O₂ rises (banded iron 2.5 bya, red beds 2 bya) → eukaryotic cells (~2.1 bya)", how: "eukaryotes use aerobic respiration, which releases far more energy" },
  { id: "x2", ok: true, text: "Algae's oxygen burst (~1 bya) → multicellular organisms (~600 mya) and soft-bodied animals (~560 mya)", how: "many cells working together need efficient aerobic respiration" },
  { id: "x3", ok: true, text: "Plants add O₂ on land (~455 mya) → first land animal (~425 mya)", how: "plants supplied oxygen and food on land" },
  { id: "x4", ok: true, text: "Swamp oxygen peak (~300 mya) → 21-inch dragonfly", how: "insects get oxygen by diffusion, so giant insects need very high O₂" },
  { id: "x5", ok: false, text: "Asteroid impact (66 mya) → mammals spread", why: "True and important, but it's an extinction opening niches, not a change in oxygen leading to more complex life." },
];

const RUBRIC = [
  ["Argument 1 · coevolution", "Atmosphere <b>when Earth formed</b> and <b>today</b> (78% N₂, 21% O₂, 1% other)"],
  ["Argument 1 · coevolution", "Evidence that <b>photosynthetic organisms emerged</b> (stromatolites, banded iron)"],
  ["Argument 1 · coevolution", "Evidence that oxygen changed <b>Earth's systems</b> (banded iron, red beds, ozone, ice age)"],
  ["Argument 1 · coevolution", "Evidence that oxygen changed <b>the biosphere</b> (eukaryotes, Cambrian, life on land)"],
  ["Argument 1 · coevolution", "<b>Causal links and feedback</b> (photosynthesis → O₂ → complex life → more photosynthesis)"],
  ["Argument 2 · extinctions", "A clear <b>claim</b>"],
  ["Argument 2 · extinctions", "A <b>negative</b> impact with evidence (e.g., Permian: 90% lost)"],
  ["Argument 2 · extinctions", "A <b>positive</b> impact with evidence (e.g., K–Pg: mammals fill niches)"],
  ["Argument 2 · extinctions", "How <b>recovery</b> affects oxygen (photosynthesizers recover → O₂ rises)"],
  ["Argument 2 · extinctions", "<b>Reliability</b>: dating ranges, uncertainty band, incomplete fossil record, correlation vs. causation"],
];

const PT_ROWS = [
  ["Life appeared ~0.8 billion years after Earth formed", "Simple life may start fairly quickly on a suitable planet"],
  ["Complex life took ~4 billion years and needed oxygen from photosynthesis", "Intelligent life needs a planet that stays habitable for billions of years"],
  ["Life changed the atmosphere, oceans and rocks", "Oxygen or ozone in an exoplanet's air could be a biosignature"],
  ["Five mass extinctions (75–90% of species)", "Life can be knocked back; a civilization's lifetime may be limited"],
  ["Recovery after extinctions", "Life is resilient and can bounce back and diversify"],
  ["Uncertainty in dating and the fossil record", "Signs of life on other planets need several lines of evidence"],
];

const CAROUSEL = [
  ["✓", "An idea that works"], ["+", "Something to add"], ["?", "An idea that may not be relevant"], ["Δ", "A way to show something more clearly"],
];

export function mount(container) {
  const picked = new Set();
  const ticks = new Set();

  function pickList(items, host, fb) {
    host.replaceChildren(...items.map((it) => el("button", {
      class: `ev ${picked.has(it.id) ? "on" : ""} ${picked.has(it.id) ? (it.ok ? "good" : "bad") : ""}`, type: "button", "aria-pressed": String(picked.has(it.id)),
      onclick: () => {
        if (picked.has(it.id)) picked.delete(it.id); else picked.add(it.id);
        fb.hidden = !picked.has(it.id) || it.ok; fb.className = "fb no"; fb.textContent = it.ok ? "" : it.why;
        draw();
      },
    }, [it.text])));
  }

  const orgHost = el("div", { class: "ev-grid" }), orgFb = el("p", { class: "fb", hidden: true });
  const oxHost = el("div", { class: "ev-grid" }), oxFb = el("p", { class: "fb", hidden: true });
  const orgMeter = el("div", { class: "meter" }), oxMeter = el("div", { class: "meter" });
  const preview = el("div", { class: "cer-preview" });

  function meter(node, n, need, label) {
    node.replaceChildren(...Array.from({ length: need }, (_, i) => el("span", { class: `pip ${i < n ? "on" : ""}` })),
      el("span", { class: "meter-label", text: n >= need ? `${n} ${label} ✔` : `${n} of ${need} ${label}` }));
  }

  function draw() {
    pickList(ORGANISMS, orgHost, orgFb);
    pickList(OXYGEN, oxHost, oxFb);
    const orgs = ORGANISMS.filter((o) => o.ok && picked.has(o.id)), ox = OXYGEN.filter((o) => o.ok && picked.has(o.id));
    meter(orgMeter, orgs.length, 2, "organisms");
    meter(oxMeter, ox.length, 3, "oxygen examples");
    preview.replaceChildren(
      el("div", { class: "cer-row" }, [el("b", { text: "Claim" }), el("span", { text: "Earth's systems and life coevolved over ~3.5 billion years, with oxygen at the center, so complex and then intelligent life took a long time." })]),
      el("div", { class: "cer-row" }, [el("b", { text: "Life → Earth" }), orgs.length ? el("ul", {}, orgs.map((o) => el("li", { text: `${o.text} ${o.how}.` }))) : el("span", { class: "muted", text: "Pick organisms above." })]),
      el("div", { class: "cer-row" }, [el("b", { text: "O₂ → life" }), ox.length ? el("ul", {}, ox.map((o) => el("li", { html: `${o.text}, <b>because</b> ${o.how}.` }))) : el("span", { class: "muted", text: "Pick oxygen examples above." })]),
      el("div", { class: "cer-row" }, [el("b", { text: "So…" }), el("span", { text: orgs.length >= 2 && ox.length >= 3 ? "Each jump in complexity came only after oxygen rose, and oxygen could only rise as photosynthetic life grew. Those parallel changes took billions of years." : "Finish the picks to see the conclusion." })]),
    );
  }

  // ---------- right tabs ----------
  const rightBody = el("div", { class: "tab-body" });
  const score = el("div", { class: "score" });
  function rubric() {
    const groups = [...new Set(RUBRIC.map((r) => r[0]))];
    const wrap = el("div", {});
    function d() {
      wrap.replaceChildren(
        el("p", { class: "muted", text: "Built from the packet's requirements for the two written arguments. Tick items as a student's argument shows them." }),
        ...groups.flatMap((g) => [el("h4", { text: g }), el("ul", { class: "check" }, RUBRIC.map((r, i) => [r, i]).filter(([r]) => r[0] === g).map(([r, i]) => el("li", {}, [
          el("button", { class: `chk ${ticks.has(i) ? "on" : ""}`, type: "button", role: "checkbox", "aria-checked": String(ticks.has(i)), onclick: () => { if (ticks.has(i)) ticks.delete(i); else ticks.add(i); d(); } }, [el("span", { class: "box", text: ticks.has(i) ? "✔" : "" }), el("span", { html: r[1] })]),
        ])))]),
        score,
      );
      score.className = `score ${ticks.size === RUBRIC.length ? "ok" : ""}`;
      score.textContent = `${ticks.size} of ${RUBRIC.length} elements`;
    }
    d();
    return wrap;
  }
  function ideas() {
    const store = saved("first-ideas", []);
    const marks = saved("first-ideas-marks", {});
    const list = el("ol", { class: "idea-list" });
    function d() {
      const m = marks.get();
      list.replaceChildren(...(store.get().length ? store.get().map((t, i) => el("li", {}, [el("span", { text: t }),
        el("button", { class: `chip ${m[i] === "ok" ? "active" : ""}`, type: "button", text: "✔ Supported", "aria-pressed": String(m[i] === "ok"), onclick: () => { marks.set({ ...marks.get(), [i]: m[i] === "ok" ? null : "ok" }); d(); } }),
        el("button", { class: `chip ${m[i] === "rev" ? "active" : ""}`, type: "button", text: "↻ Revise", "aria-pressed": String(m[i] === "rev"), onclick: () => { marks.set({ ...marks.get(), [i]: m[i] === "rev" ? null : "rev" }); d(); } }),
      ])) : [el("li", { class: "muted", text: "No Day 1 ideas saved on this device. Use your chart paper from Day 1." })]));
    }
    d();
    return el("div", {}, [el("p", { class: "muted", html: "<b>Do Now B:</b> “Our first ideas: What sped up evolution?” from Day 1. Which turned out to be right? Which need revising?" }), list]);
  }
  function carousel() {
    return el("div", {}, [
      el("div", { class: "carousel" }, CAROUSEL.map(([s, t]) => el("div", { class: "car-item" }, [el("span", { class: "car-sym", text: s }), el("span", { text: t })]))),
      bullets([
        "Groups rotate to other posters and leave sticky notes with a symbol, then return and revise.",
        "The sticky notes are your check: many <b>?</b> notes on correlation-only claims → one more round on causal reasoning.",
        "Then revisit the <b>Driving Question Board</b>: move answered questions; point to the open ones (Could life exist on other planets?).",
      ]),
      card("Exit · 3-2-1", [bullets(["<b>3</b> conditions that allowed humans to evolve", "<b>2</b> kinds of evidence we used", "<b>1</b> question about life on other planets"])], { cls: "callout" }),
    ]);
  }
  function pt() {
    return el("div", {}, [el("p", { class: "muted", text: "Unit 2 performance task: is life, or intelligent life, likely elsewhere? Evidence from this 5E:" }),
      el("div", { class: "table-host" }, [el("table", { class: "data compact" }, [el("thead", {}, [el("tr", {}, [el("th", { text: "Evidence" }), el("th", { text: "How it helps the argument" })])]),
        el("tbody", {}, PT_ROWS.map(([a, b]) => el("tr", {}, [el("td", { class: "strong", text: a }), el("td", { text: b })])))])])]);
  }
  const rt = tabs(["Rubric", "Day 1 ideas", "Idea Carousel", "PT link"], (i) => rightBody.replaceChildren([rubric, ideas, carousel, pt][i]()));

  container.appendChild(layout("two-col evaluate", [
    el("div", { class: "col grow" }, [
      el("div", { class: "question-banner", text: QUESTION }),
      card("1 · At least 2 organisms that changed Earth's systems", [orgHost, orgFb, orgMeter]),
      card("2 · At least 3 times more oxygen led to more complex life", [oxHost, oxFb, oxMeter]),
      card("3 · The explanation so far", [preview]),
    ]),
    el("div", { class: "col narrow" }, [card("Evaluate", [rt.root, rightBody])]),
  ]));
  draw();
}
