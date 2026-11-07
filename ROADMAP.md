# Changoku Labs — Features List, Roadmap & Definition of Done

A focused, scope-controlled roadmap for **Changoku** (`changoku`) by **Changoku Labs**. Built as a zero-dependency, zero-maintenance web & mobile puzzle lab—designed to ship cleanly, delight its first real users (Mom & family!), serve as a high-signal engineering project, and reach a clear **"Feature Complete (v1.1)"** finish line without scope creep.

---

## ✅ Foundation (v1.0)

- **Core Sudoku Engine ([`js/engine/`](js/engine))**
  - Bitmask & MRV backtracking solver capable of verifying uniqueness (`countSolutions`) in `< 2ms`.
  - On-the-fly procedural puzzle generator with 180° rotational symmetry across 4 difficulty tiers (`Easy`, `Medium`, `Hard`, `Expert`).
  - Human-style step-by-step logical solver grading puzzles by required technique.
- **11 Logical Deduction Techniques ([`js/engine/techniques.js`](js/engine/techniques.js))**
  - Basic: *Naked Single*, *Hidden Single*.
  - Intersections: *Pointing Pair/Triple*, *Box-Line Reduction*.
  - Subsets: *Naked Pair*, *Hidden Pair*, *Naked Triple*, *Hidden Triple*.
  - Fish: *X-Wing*, *Swordfish*.
  - Wings: *XY-Wing (Y-Wing)*.
- **Interactive Technique Visualizer & Combinatorics Explorer**
  - 11 curated, verified single-solution study boards ([`js/study/studyPuzzles.js`](js/study/studyPuzzles.js)) + Gary McGuire's 17-clue minimum puzzle.
  - Color-coded visual highlights for Base Cells, Pivots, Wings, Affected Peers, and Eliminated Candidates.
- **Bilingual Support (`es` Chilean Spanish / `en` English)**
  - Full UI, Theory page, and dynamic step/hint localization ([`js/i18n/translations.js`](js/i18n/translations.js)) with friendly Chilean Spanish phrasing (*Pista*, *Notas a Lápiz*, *Auto-Notas*, *¡Seca!*) and instant language toggle (`🇨🇱 ES` / `🇬🇧 EN`).
- **Zero-Dependency Single-File Packaging ([`scripts/bundle.js`](scripts/bundle.js))**
  - One-command bundler (`npm run build:es` / `npm run build:en`) that packages HTML, CSS, SVG icon, and all ES modules into a single standalone `.html` file (`dist/changoku-es.html`) ready to share via WhatsApp/AirDrop and play offline on any phone.

---

## 📱 Milestone 1: "Mom's Daily Player" (Mobile & UX Polish) — ✅ Completed

High-priority, high-impact ergonomics focused on comfort, daylight readability, responsive mobile portrait/landscape layouts, and zero-loss persistence on mobile phones:

- [x] **Responsive Mobile Portrait & Landscape Ergonomics ([`css/style.css`](css/style.css))**
  - Zero horizontal overflow on compact mobile screens (`390×844` portrait and `844×390` side-by-side landscape with 3×3 keypad), verified by automated Playwright geometry assertions ([`tests/e2e.spec.js`](tests/e2e.spec.js)).
- [x] **Auto-Save Current Game (`localStorage`)**
  - Automatically saves the initial board, user entries, pencil marks, timer, and difficulty on every move so closing the browser tab, accidental back navigation, or reloading never loses progress.
- [x] **Light / High-Contrast Theme Default & Toggle ("☀️ Día / 🌙 Noche")**
  - Starts in a warm paper/high-contrast **Day Mode** by default for comfortable reading, with a one-tap toggle to slate **Night Mode** persisted in `localStorage`.
- [x] **Smart Auto-Clean Pencil Marks**
  - When placing a number in a cell, automatically removes that digit from the manual pencil notes of all 20 peer cells in the same row, column, and 3×3 box.
- [x] **Completed Digit Dimming & Counter**
  - Shows a live count of remaining instances (`9` down to `1`, then `✓`) on each keypad button and dims/checks off a keypad button once all 9 instances of that digit are validly placed on the board.

---

## 🌐 Milestone 2: Daily Challenge, Streak Jokers & Offline PWA — ✅ Completed

Keeps Changoku **100% static, $0/month, and zero-ops** while supporting daily family competition and offline home-screen installation:

- [x] **Daily Changoku Challenge (Deterministic Seeded PRNG)**
  - Client-side daily seed (`YYYY-MM-DD`) via Mulberry32 PRNG so every player gets the exact same board each day without a server.
  - **Day-of-the-Week Difficulty Curve**:
    - **Monday & Tuesday**: *Easy (Fácil)*
    - **Wednesday & Thursday**: *Medium (Medio)*
    - **Friday & Saturday**: *Hard (Difícil)*
    - **Sunday**: *Expert (Experto — ¡Domingo de Campeonato!)*
- [x] **Modern `Temporal` API + Hidden 7-Day Streak Jokers (*Comodín de Racha*)**
  - Uses `Temporal.PlainDate` (with `Date` fallback) for timezone-safe calendar math.
  - Silently awards `+1` Streak Joker every 7 consecutive days of streak (up to a max of `5` Jokers) and automatically consumes Jokers if 1 or more days are missed to rescue the player's streak.
- [x] **Live Timer, Streak Badge & One-Tap WhatsApp Share**
  - Tracks solve time (`⏱️`), active streak (`🔥 Racha`), and hints used, generating aspoiler-free summary ready to paste into the family WhatsApp chat (`📲 Compartir`).
- [x] **Installable Offline PWA ([`manifest.json`](manifest.json) + Service Worker [`sw.js`](sw.js) + [`icon.svg`](icon.svg))**
  - Supports *"Add to Home Screen" / "Agregar a la pantalla de inicio"* on iOS and Android so Changoku installs with its own home-screen icon, launches full-screen without browser chrome, and works 100% offline.

---

## 🧠 Optional Future Ideas (Backlog / Out of Scope for v1.1)

Kept here as optional ideas if ever revisited in the future:

- [ ] **Number-First ("Fast Fill") Input Mode & Font Zoom (`A-` / `A+`)**
- [ ] **"Practice This Technique" Generator Filter**
- [ ] **2-Stage Progressive Hint Button**

---

## 🏁 Definition of Done (v1.1 Feature Complete)

1. **Milestones 1 & 2 are shipped and verified** by the Node.js engine suite (`npm test`) and 16 Playwright mobile visual & functional E2E tests (`npm run test:e2e`).
2. **No backend server or React Native port** is required—keeping hosting costs at $0 (GitHub Pages / single-file HTML bundle) and operational maintenance at zero.
3. Learnings from Changoku's modular engine and zero-dependency architecture carry forward as building blocks into future **Changoku Labs** projects.
