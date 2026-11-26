// Item Bank & Quiz Maker: a read-only, static copy of the ESS Tracker's Regents item bank.
// Data comes from data.js (window.BANK), written by ess-tracker/tools/export_static_bank.py.
(() => {
  const B = window.BANK;
  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };
  const items = B.items;
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const topicBy = Object.fromEntries(B.topics.map((t, n) => [t.code, { ...t, sort: n }]));
  const skillBy = Object.fromEntries(B.skills.map((s) => [s.code, s.name]));
  const examName = Object.fromEntries(B.exams.map((e) => [e.code, e.name]));
  const examSort = Object.fromEntries(B.exams.map((e, n) => [e.code, n]));
  const unitOf = (i) => (topicBy[i.topic] ? String(topicBy[i.topic].unit) : "");
  const label = (i) => `${examName[i.exam]} Q${i.q}`;
  $("updated").textContent = `Updated ${B.updated}.`;

  // ---------------------------------------------------------------- storage (optional, per browser)
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: fine */ } },
  };
  let basket = store.get("ess-bank-basket", []).filter((id) => byId[id]);

  // ---------------------------------------------------------------- filters
  const F = { unit: $("f-unit"), topic: $("f-topic"), pe: $("f-pe"), sep: $("f-sep"), fmt: $("f-fmt"), exam: $("f-exam"),
              q: $("f-q"), nointerim: $("f-nointerim") };
  for (const [n, name] of Object.entries(B.units)) F.unit.append(el("option", { value: n, textContent: `${n}: ${name}` }));
  for (const s of B.standards) F.pe.append(el("option", { value: s.code, textContent: `${s.code} · ${s.topic}` }));
  for (const s of B.skills) F.sep.append(el("option", { value: s.code, textContent: s.name }));
  for (const e of B.exams) F.exam.append(el("option", { value: e.code, textContent: e.name }));
  function fillTopics() {
    const keep = F.topic.value;
    F.topic.replaceChildren(el("option", { value: "", textContent: "All" }));
    for (const [n, name] of Object.entries(B.units)) {
      if (F.unit.value && F.unit.value !== n) continue;
      const g = el("optgroup", { label: `Unit ${n}: ${name}` });
      for (const t of B.topics) if (String(t.unit) === n) g.append(el("option", { value: t.code, textContent: t.title }));
      F.topic.append(g);
    }
    F.topic.value = [...F.topic.options].some((o) => o.value === keep) ? keep : "";
  }
  fillTopics();
  const saved = store.get("ess-bank-filters", {});
  for (const [k, v] of Object.entries(saved)) if (F[k]) { if (F[k].type === "checkbox") F[k].checked = v; else F[k].value = v; }
  fillTopics();
  if (saved.topic) F.topic.value = saved.topic;

  function matches(i) {
    if (F.unit.value && unitOf(i) !== F.unit.value) return false;
    if (F.topic.value && i.topic !== F.topic.value) return false;
    if (F.pe.value && !i.pes.includes(F.pe.value)) return false;
    if (F.sep.value && i.sep !== F.sep.value) return false;
    if (F.fmt.value && i.fmt !== F.fmt.value) return false;
    if (F.exam.value && i.exam !== F.exam.value) return false;
    if (F.nointerim.checked && i.interim) return false;
    const q = F.q.value.trim().toLowerCase();
    if (q && !`${i.desc} ${i.set} ${i.id}`.toLowerCase().includes(q)) return false;
    return true;
  }
  function sortKey(i) {
    const t = topicBy[i.topic];
    const byTopic = F.unit.value || F.topic.value;
    return [byTopic ? (t ? t.sort : 99) : 0, examSort[i.exam], i.q];
  }
  const cmp = (a, b) => { const x = sortKey(a), y = sortKey(b); for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) return x[k] - y[k]; return 0; };

  function renderList() {
    const list = items.filter(matches).sort(cmp);
    $("count").textContent = `${list.length} question${list.length === 1 ? "" : "s"}`;
    $("results").replaceChildren(...list.map((i) => {
      const t = topicBy[i.topic];
      const box = el("input", { type: "checkbox", checked: basket.includes(i.id) });
      box.dataset.id = i.id;
      box.className = "pick";
      const tags = el("div", { className: "tags" },
        t ? el("span", { className: "tag topic", textContent: `${t.unit} · ${t.title}` }) : null,
        ...i.pes.map((p) => el("span", { className: "tag", textContent: p })),
        i.sep ? el("span", { className: "tag", textContent: skillBy[i.sep] || i.sep }) : null,
        el("span", { className: "tag", textContent: i.fmt === "CR" ? "Written" : "Multiple choice" }),
        i.esrt ? el("span", { className: "tag", textContent: `Ref Tables ${i.esrt}` }) : null,
        i.interim ? el("span", { className: "tag interim", textContent: `🔒 ${i.interim}`,
                                 title: "On a New Visions interim. New Visions asks that interim questions not be used for class practice." }) : null);
      const view = el("button", { type: "button", className: "secondary mini", textContent: "View" });
      view.addEventListener("click", () => openDialog([i.id], label(i), false));
      return el("div", { className: "row" + (basket.includes(i.id) ? " picked" : "") },
        el("label", { className: "add" }, box, "Add"),
        el("div", { className: "what" }, el("div", { className: "desc", textContent: i.desc || "(no description)" }),
          el("div", { className: "muted", textContent: `${label(i)}${i.set ? " · " + i.set : ""}` }), tags),
        el("div", { className: "side" }, view, i.fmt === "MC" && i.key ? el("span", { className: "muted", textContent: `key ${i.key}` }) : null));
    }));
  }
  function onFilter() {
    store.set("ess-bank-filters", Object.fromEntries(Object.entries(F).map(([k, n]) => [k, n.type === "checkbox" ? n.checked : n.value])));
    renderList();
  }
  F.unit.addEventListener("change", () => { fillTopics(); onFilter(); });
  for (const k of ["topic", "pe", "sep", "fmt", "exam", "nointerim"]) F[k].addEventListener("change", onFilter);
  F.q.addEventListener("input", onFilter);
  $("f-reset").addEventListener("click", () => {
    for (const n of Object.values(F)) { if (n.type === "checkbox") n.checked = false; else n.value = ""; }
    fillTopics(); onFilter();
  });

  // ---------------------------------------------------------------- basket
  $("results").addEventListener("change", (e) => {
    if (!e.target.classList.contains("pick")) return;
    const i = byId[e.target.dataset.id];
    if (e.target.checked && i.interim && !confirm(`This question is on ${i.interim}. New Visions asks that interim ` +
        "questions not be used for class practice, so the interim shows what students really know.\n\nAdd it anyway?")) {
      e.target.checked = false; return;
    }
    basket = e.target.checked ? [...basket.filter((x) => x !== i.id), i.id] : basket.filter((x) => x !== i.id);
    e.target.closest(".row").classList.toggle("picked", e.target.checked);
    saveBasket();
  });
  function saveBasket() { store.set("ess-bank-basket", basket); drawBasket(); }
  function drawBasket() {
    $("basket").hidden = basket.length === 0;
    $("basket-count").textContent = `${basket.length} picked`;
    $("basket-list").replaceChildren(...basket.map((id, n) => {
      const i = byId[id];
      const li = el("li", {}, `${label(i)} · ${i.fmt === "CR" ? "written" : "MC"} · ${i.desc} `);
      if (i.interim) li.append(el("span", { className: "tag interim", textContent: `🔒 ${i.interim}` }), " ");
      for (const [txt, d, title] of [["↑", -1, "Move up"], ["↓", 1, "Move down"], ["×", 0, "Remove"]]) {
        const b = el("button", { type: "button", className: "secondary mini", textContent: txt, title });
        b.addEventListener("click", () => {
          if (d === 0) basket.splice(n, 1);
          else if (basket[n + d] !== undefined) [basket[n], basket[n + d]] = [basket[n + d], basket[n]];
          saveBasket(); renderList();
        });
        li.append(b);
      }
      return li;
    }));
  }
  $("b-toggle").addEventListener("click", () => {
    const ol = $("basket-list");
    ol.hidden = !ol.hidden;
    $("b-toggle").textContent = ol.hidden ? "Show list" : "Hide list";
    $("b-toggle").setAttribute("aria-expanded", String(!ol.hidden));
  });
  $("b-clear").addEventListener("click", () => { if (confirm("Clear all picked questions?")) { basket = []; saveBasket(); renderList(); } });
  $("b-preview").addEventListener("click", () => openDialog(basket, `Quiz preview · ${basket.length} questions`, true));
  $("b-copy").addEventListener("click", async () => {
    const text = basket.join("\n");
    let ok = false;
    if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; } }
    if (!ok) {
      const ta = el("textarea", { value: text });
      document.body.append(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
    }
    $("b-status").textContent = ok ? "Copied. Paste into the tracker: Assessments → New assessment." : "Couldn't copy. IDs: " + basket.join(", ");
  });

  // ---------------------------------------------------------------- questions (shared by View, Preview, Print)
  // Exam questions come in sets that share passages and figures. A question picked without the questions before it
  // in its set gets that earlier material too ("earlier"), each piece only once per quiz.
  const sets = {};
  for (const i of [...items].sort((a, b) => a.q - b.q)) if (i.set) (sets[`${i.exam}|${i.set}`] ||= []).push(i);
  function entries(ids) {
    const shown = new Set(), out = [];
    for (const id of ids) {
      const i = byId[id];
      if (!i) continue;
      const gone = new Set(i.hidden);
      let earlier = [];
      for (const o of i.set ? sets[`${i.exam}|${i.set}`] : []) {
        if (o.q < i.q) earlier.push(...(o.media.stimulus || []).filter((f) => !shown.has(f)).map((f) => [f, o.q]));
      }
      let stim = (i.media.stimulus || []).filter((f) => !shown.has(f));
      earlier = earlier.filter(([f]) => !gone.has(f));
      stim = stim.filter((f) => !gone.has(f));
      earlier.forEach(([f]) => shown.add(f)); stim.forEach((f) => shown.add(f));
      out.push({ item: i, earlier, stim });
    }
    return out;
  }
  const img = (f, alt) => el("img", { className: "qimg", src: `img/${f}`, alt, loading: "lazy" });
  function piece(f, note, hideable) {
    const box = el("div", { className: "piece" });
    if (note) {
      const n = el("div", { className: "note", textContent: note + " " });
      if (hideable) {
        const b = el("button", { type: "button", className: "secondary mini", textContent: "Hide for this printout" });
        b.addEventListener("click", () => { box.classList.toggle("off"); b.textContent = box.classList.contains("off") ? "↺ Show again" : "Hide for this printout"; });
        n.append(b);
      }
      box.append(n);
    }
    box.append(img(f, note || "Information for this question"));
    return box;
  }
  function question(e, num, printing) {
    const i = e.item;
    const sec = el("section", { className: "qprev" });
    if (!printing) {
      const t = topicBy[i.topic];
      sec.append(el("p", { className: "muted qmeta", textContent:
        `${num ? `Question ${num} · ` : ""}${label(i)} · ${i.pes.join(", ")} · ${skillBy[i.sep] || i.sep} · ${t ? t.title : ""}` }));
    }
    for (const [f, q] of e.earlier) sec.append(piece(f, `From earlier in this set (exam Q${q}).`, printing));
    for (const f of e.stim) sec.append(piece(f, "", false));
    (i.media.question || []).forEach((f, k) => {
      const fig = el("div", { className: "qfig" });
      if (k === 0 && num) fig.append(el("span", { className: "qnum", textContent: String(num) }));
      fig.append(img(f, `Question ${num || ""}`));
      sec.append(fig);
    });
    if (!printing) {
      const key = el("div", { className: "qkey" });
      if (i.fmt === "MC") key.append(el("p", {}, el("b", { textContent: `Answer: ${i.key || "(not loaded)"}` })));
      else if ((i.media.rating || []).length) {
        key.append(el("div", { className: "muted", textContent: "Rating guide" }));
        for (const f of i.media.rating) key.append(img(f, "Rating guide"));
      }
      sec.append(key);
    }
    return sec;
  }

  // ---------------------------------------------------------------- dialog (View / Preview)
  const dlg = $("dlg");
  function openDialog(ids, title, numbered) {
    $("dlg-title").textContent = title;
    $("dlg-body").replaceChildren(...entries(ids).map((e, n) => question(e, numbered ? n + 1 : null, false)));
    $("dlg-body").classList.toggle("hide-keys", !$("dlg-keys").checked);
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }
  $("dlg-keys").addEventListener("change", (e) => $("dlg-body").classList.toggle("hide-keys", !e.target.checked));
  $("dlg-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  // ---------------------------------------------------------------- print view
  $("p-title").value = store.get("ess-bank-title", "Quiz");
  function buildPrint() {
    const doc = $("printdoc");
    const es = entries(basket);
    doc.replaceChildren(
      el("h1", { className: "doctitle", textContent: $("p-title").value || "Quiz" }),
      el("div", { className: "namelines" }, el("span", { textContent: "Name ______________________________" }),
        el("span", { textContent: "Date ____________" }), el("span", { textContent: "Period ______" })),
      ...es.map((e, n) => question(e, n + 1, true)));
    const kp = el("section", { className: "keypage", hidden: !$("p-key").checked },
      el("h2", { className: "keytitle", textContent: `Answer key · ${$("p-title").value || "Quiz"}` }));
    const tb = el("table", {}, el("tr", {}, el("th", { textContent: "#" }), el("th", { textContent: "Type" }), el("th", { textContent: "Answer" })));
    es.forEach((e, n) => tb.append(el("tr", {}, el("td", { textContent: String(n + 1) }),
      el("td", { textContent: e.item.fmt === "MC" ? "MC" : "Written" }),
      el("td", { textContent: e.item.fmt === "MC" ? (e.item.key || "—") : "see below" }))));
    kp.append(tb);
    es.forEach((e, n) => {
      if (e.item.fmt !== "CR" || !(e.item.media.rating || []).length) return;
      const k = el("div", { className: "keyitem" }, el("h3", { textContent: `Question ${n + 1}` }));
      for (const f of e.item.media.rating) k.append(img(f, `Rating guide for question ${n + 1}`));
      kp.append(k);
    });
    doc.append(kp);
  }
  function showPrint(on) {
    $("printview").hidden = !on;
    $("app").hidden = on;
    $("basket").hidden = on || basket.length === 0;
    if (on) { buildPrint(); window.scrollTo(0, 0); }
  }
  $("b-print").addEventListener("click", () => showPrint(true));
  $("p-close").addEventListener("click", () => showPrint(false));
  // update in place so "Hide for this printout" choices are kept
  $("p-key").addEventListener("change", () => { const k = document.querySelector(".keypage"); if (k) k.hidden = !$("p-key").checked; });
  $("p-title").addEventListener("input", () => {
    const t = $("p-title").value || "Quiz";
    store.set("ess-bank-title", t);
    const h = document.querySelector(".doctitle"); if (h) h.textContent = t;
    const k = document.querySelector(".keytitle"); if (k) k.textContent = `Answer key · ${t}`;
  });
  $("p-go").addEventListener("click", () => window.print());

  renderList();
  drawBasket();
})();
