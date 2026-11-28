// panels/evaluate.js — Stage 9 (Day 7 · Evaluate): 7-Stage Formation Timeline, Cosmic Odds Calculator, and Idea Carousel + Rubric.

import { el, tabs, clear } from "../dom.js";
import { BB_STAGES } from "../science.js";
import { card, layout, packetTask, stat } from "../ui.js";

export function mount(container) {
  // ---------- TAB 1: 7-STAGE FORMATION TIMELINE ----------
  function buildTimeline() {
    let step = 0;
    const stepBar = el("div", { class: "step-bar" });
    const stageCard = el("div", { class: "card timeline-card" });

    function render() {
      clear(stepBar);
      BB_STAGES.forEach((st, idx) => {
        stepBar.appendChild(el("button", {
          class: `step-btn ${idx === step ? "active" : idx < step ? "past" : ""}`, type: "button",
          onclick: () => { step = idx; render(); },
        }, [
          el("span", { class: "step-num", text: `Stage ${st.n}` }),
          el("span", { class: "step-time", text: st.time }),
        ]));
      });

      const st = BB_STAGES[step];
      clear(stageCard);
      stageCard.append(
        el("div", { class: "row-between" }, [
          el("span", { class: "pill ok", text: `Stage ${st.n} of 7 · ${st.time}` }),
          el("span", { class: "pill", text: `Temp: ${st.tempC}` }),
        ]),
        el("h2", { class: "tl-head", text: st.sizeLabel }),
        el("p", { class: "lead", text: st.text }),
        el("div", { class: "row" }, [
          el("button", { class: "tool-btn", type: "button", text: "◀ Previous stage", disabled: step === 0 || null, onclick: () => { step--; render(); } }),
          el("button", { class: "tool-btn primary", type: "button", text: "Next stage ▶", disabled: step === BB_STAGES.length - 1 || null, onclick: () => { step++; render(); } }),
        ]),
      );
    }
    render();

    return el("div", { class: "stack" }, [
      stepBar,
      stageCard,
      el("div", { class: "callout-info" }, [
        el("strong", { text: "Big takeaway (p. 24 Q1–2): " }),
        "Every part of the universe went through these exact same stages (inflation → H/He atoms → gravity → stars → supernovae heavy elements). That's why other galaxies and solar systems likely resemble ours!",
      ]),
    ]);
  }

  // ---------- TAB 2: COSMIC ODDS CALCULATOR ----------
  function buildOdds() {
    let starsExp = 22;     // 10^22 stars
    let fracPlanets = 0.5; // 50% have planets
    let fracEarth = 0.05;  // 5% Earth-like in habitable zone
    let lifeExp = -6;      // 1 in 1,000,000 Earth-like worlds develops life

    const sStars = stat("Stars in observable universe", "10²² (10 sextillion)");
    const sEarths = stat("Estimated Earth-like planets", "", { tone: "accent" });
    const sLife = stat("Worlds with life (if 1 in 10⁶)", "", { tone: "good" });

    const slPlanets = el("input", { class: "slider", type: "range", min: 0.1, max: 1, step: 0.1, value: fracPlanets, oninput: () => { fracPlanets = Number(slPlanets.value); calc(); } });
    const slEarth = el("input", { class: "slider", type: "range", min: 0.01, max: 0.25, step: 0.01, value: fracEarth, oninput: () => { fracEarth = Number(slEarth.value); calc(); } });
    const slLife = el("input", { class: "slider", type: "range", min: -9, max: -2, step: 1, value: lifeExp, oninput: () => { lifeExp = Number(slLife.value); calc(); } });
    const lblP = el("span"), lblE = el("span"), lblL = el("span");

    function fmtBig(n) {
      if (n >= 1e18) return `${(n / 1e18).toFixed(1)} quintillion`;
      if (n >= 1e15) return `${(n / 1e15).toFixed(1)} quadrillion`;
      if (n >= 1e12) return `${(n / 1e12).toFixed(1)} trillion`;
      if (n >= 1e9) return `${(n / 1e9).toFixed(1)} billion`;
      if (n >= 1e6) return `${(n / 1e6).toFixed(1)} million`;
      return Math.round(n).toLocaleString();
    }

    function calc() {
      const stars = Math.pow(10, starsExp);
      const earths = stars * fracPlanets * fracEarth;
      const living = earths * Math.pow(10, lifeExp);
      lblP.textContent = `Stars with planets: ${Math.round(fracPlanets * 100)}%`;
      lblE.textContent = `Planets that are Earth-like in habitable zone: ${Math.round(fracEarth * 100)}%`;
      lblL.textContent = `Chance life emerges on an Earth-like world: 1 in ${Math.pow(10, -lifeExp).toLocaleString()}`;
      sStars.setValue("10²² stars");
      sEarths.setValue(`~${fmtBig(earths)}`, "accent");
      sLife.setValue(`~${fmtBig(living)}`, "good");
    }
    calc();

    return layout("cols-2", [
      card("How Many Earth-Like Worlds? (Probable vs. Certain)", [
        el("p", { class: "muted", text: "Even if life is extraordinarily rare (1 in a billion!), test what happens across 10²² stars:" }),
        el("label", { class: "slider-label" }, [lblP, slPlanets]),
        el("label", { class: "slider-label" }, [lblE, slEarth]),
        el("label", { class: "slider-label" }, [lblL, slLife]),
        el("div", { class: "callout-warn" }, [
          el("strong", { text: "Science precision: " }),
          "High probability is NOT the same as proven certainty — we have strong reasons to think Earth-like worlds are common, while scientists are still searching for confirmed biosignatures.",
        ]),
      ], { kicker: "Unit 2 Driving Question" }),
      el("div", { class: "stack" }, [
        el("div", { class: "stats-col" }, [sStars, sEarths, sLife]),
        packetTask("Evaluate · pp. 24–25", [
          "Explain using <b>3+ lines of evidence</b> why other solar systems formed the same way as ours.",
          "Distinguish <b>probable</b> (very likely given scale + shared physics) from <b>certain</b>.",
        ]),
      ]),
    ]);
  }

  // ---------- TAB 3: IDEA CAROUSEL & PT RUBRIC ----------
  function buildCarouselRubric() {
    const rubricItems = [
      "Cites 3+ lines of evidence: redshifted galaxy spectra, Cosmic Microwave Background (CMB), and ~3 : 1 H/He ratio.",
      "Explains how waves stretch (longer λ, lower f → red → microwaves) and matter stays conserved during expansion.",
      "Uses explicit scientific logic ('because', 'therefore') connecting each piece of evidence to the Big Bang.",
      "Connects universal physics + ~10²² stars to why other Earth-like planets (and possibly life) are probable.",
    ];
    return layout("cols-2", [
      card("Idea Carousel Sticky-Note Key", [
        el("div", { class: "carousel-key" }, [
          el("div", { class: "ck-item" }, [el("span", { class: "ck-sym ok", text: "✓" }), el("div", {}, [el("b", { text: "Resonates" }), el("div", { class: "muted", text: "Strong evidence or clear connection we agree with." })])]),
          el("div", { class: "ck-item" }, [el("span", { class: "ck-sym accent", text: "+" }), el("div", {}, [el("b", { text: "Add this" }), el("div", { class: "muted", text: "An important piece of evidence or link that would strengthen the model." })])]),
          el("div", { class: "ck-item" }, [el("span", { class: "ck-sym warn", text: "?" }), el("div", {}, [el("b", { text: "Question / relevant?" }), el("div", { class: "muted", text: "Check for overclaiming ('certain' vs. 'probable') or missing mechanism." })])]),
          el("div", { class: "ck-item" }, [el("span", { class: "ck-sym bad", text: "Δ" }), el("div", {}, [el("b", { text: "Clarify / revise" }), el("div", { class: "muted", text: "A label, arrow, or reasoning step that could be represented more clearly." })])]),
        ]),
      ], { kicker: "Project during group chart-paper rotations" }),
      card("Performance Task Rubric Checklist (pp. 26–27)", [
        el("ul", { class: "check-list" }, rubricItems.map((txt) =>
          el("li", {}, [el("label", { class: "check-row" }, [el("input", { type: "checkbox" }), el("span", { text: txt })])]))),
      ], { kicker: "Self-check before turning in" }),
    ]);
  }

  const body = el("div", { class: "tab-body fill" });
  const t = tabs(["⏳ 1. 7-Stage Universe Timeline", "🪐 2. Cosmic Odds Calculator", "📌 3. Idea Carousel & Rubric"], (i) => {
    body.replaceChildren(i === 0 ? buildTimeline() : i === 1 ? buildOdds() : buildCarouselRubric());
  });
  container.append(el("div", { class: "stack fill" }, [el("div", { class: "tab-bar" }, [t.root]), body]));
}
