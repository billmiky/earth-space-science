# CLAUDE.md

An interactive Earth & Space Science textbook for NYC high school students, built as a
**Quarto book** with Observable JS (OJS) interactives. Students use it outside class to
catch up, review, and work through their **student packets** (New Visions ESS curriculum).

## Layout

- `_quarto.yml` — book config. **The `chapters:` list is the source of truth** for which
  `.qmd` files are live. Static files that pages link to or iframe (built interactives,
  standalone `.html`, data, images) must also be listed under `project.resources`, or they
  will be missing from the rendered site.
- `unitN-*/` — one folder per unit. Live chapters follow the pattern
  `index.qmd`, `unitN-opening.qmd`, `unitN-<topic>.qmd`…, `unitN-closing.qmd`.
- Legacy files: `NN-chapter.qmd`, `NN-<topic>.qmd` inside unit folders, and everything in
  `oldchapters/`, are **not** in the book. Don't edit them unless asked.
- `src-interactives/<app>/` — React 19 + Vite + Tailwind source. `npm run build` writes
  straight into `unit5-hurricanes-blizzards/<app>/` (`emptyOutDir: true`), so never
  hand-edit the built `assets/index-*.js`; change the source and rebuild.
- `teacher/` — teacher hub, unit guides, and dashboards (`noindex`, self-contained).
  Unit 1 dashboard can optionally use the Cloudflare Worker in `backend/` (manual deploy
  only — see `backend/README.md`).
- `styles.css` (global), `custom.css`, and the `include-*` HTML snippets
  (`mobile-enhancements.html`, `earth-toc.html`, `copy-protection.html`, `meta-viewport.html`).
- `_extensions/qmd-lab/closeread` — scrollytelling extension.
- `pdfs/` — curriculum source packets/teacher materials.

## Commands

```bash
quarto preview --port 4040 --host 0.0.0.0   # live preview
quarto render                                # full build to _book/
quarto render unit5-hurricanes-blizzards/unit5-hurricanes.qmd   # one chapter

cd src-interactives/<app> && npm install && npm run build   # rebuild a React interactive
```

- Quarto is **not** installed in the cloud container by default; `build.sh` shows how to
  fetch it (it also raises Deno's memory limit — big OJS chapters need it).
- Python deps (`requirements.txt`) are only for the few Python cells; most content is OJS.
- **Do not run `setup-textbook.sh` or `add-content.sh`** — they are original scaffolding
  scripts and will overwrite `_quarto.yml`/`styles.css` or chapter files.

## How a chapter is built (current pattern)

Recent work rebuilds each chapter around its curriculum **packet** (5E or 3E sequence,
Performance Task Organizer for openings/closings). Follow an existing rebuilt chapter —
e.g. `unit5-hurricanes-blizzards/unit5-hurricanes.qmd` — rather than inventing structure:

1. YAML front matter: `title`, `subtitle` (the packet's guiding question), `toc: true`,
   `execute: echo: false`.
2. A chapter-scoped `{=html}` `<style>` block (`.engage-box`, `.explore-box`, `.explain-box`,
   `.elaborate-box`, `.evaluate-box`, `.key-idea`, `.student-task`, `.pe-badge`, …).
3. Quiz jump button, big question, PE badges (e.g. `HS-ESS2-5`).
4. A collapsed "📒 Using this chapter with your student packet" callout mapping each packet
   section to an anchor in the chapter.
5. One `#` section per 5E phase, with `{#prefix-...}` anchors. Packet prompts go in
   `.student-task` boxes ("✏️ In your packet: …") followed by a collapsed
   "🔑 Check your thinking (try it first!)" callout.
6. End with: summary, **Myth or Fact?** cards, then an **End-of-Chapter Quiz** (8–10 MCQs,
   immediate explanatory feedback). Evaluate sections include a performance-task helper and
   rubric checklist.

Conventions:

- **Prefix everything per chapter** (CSS classes, element IDs, JS functions, and OJS
  variable names — e.g. `hu-`, `humf`, `bz-`, `sp-`, `u5o-`). OJS cells share one namespace
  per page, so duplicate names break rendering (see `fix_ojs.sh` for a past collision fix).
- Load OJS libraries with **pinned versions**: `require("d3@7.9.0")`,
  `require("@observablehq/plot@0.6.16")`, `require("topojson-client@3.1.0")`.
- **Real data only** (NOAA, NASA, USGS, HURDAT2, ERSST, etc.), with the source cited in
  the chapter. Never fabricate or "simulate" data presented as real; label models and
  what-ifs as such. Recent commits explicitly removed fabricated tracks/simulated data.
- Be faithful to the packet, but if the packet or teacher guide has an error, correct it in
  the chapter and note the discrepancy (commit messages do this too).
- **Mobile-first**: single column, `max-width: 100%` SVGs, tap targets ≥ 44px, tables in
  `overflow-x: auto` containers. Check dark mode (`.quarto-dark`) for any hard-coded colors.
- Every image/figure gets meaningful alt text (`fig-alt` or `alt`); iframes get a `title`.
- Videos: `youtube-nocookie.com` embeds with `loading="lazy"`.
- Student-facing writing: short, plain language, bolded key terms; students are the
  audience, not teachers.

> `.github/copilot-instructions.md` predates the packet-aligned rebuild and says to avoid
> classroom/lab activities. The current direction is to mirror the packet (with virtual
> stand-ins for hands-on labs); prefer this file when they conflict.

## Deployment

`.github/workflows/static.yml` deploys on push to `main` by uploading the repo as-is
(it does **not** run `quarto render`). `_book/` is in `.gitignore`, though a few files are
tracked. Confirm with the user how the live site is published before changing anything
deploy-related.

## Git

- Work on the assigned feature branch; PRs into `main`.
- Commit one chapter per commit when rebuilding a unit, with a message that walks through
  the packet sequence covered and any corrections/removals.
