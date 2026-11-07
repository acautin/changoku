# Changoku Labs • Study Games, Technique Visualizer & Combinatorics

An interactive, zero-dependency modern JavaScript Sudoku application and study lab by **Changoku Labs**, featuring:

1. **Interactive Play & Study Board**: Full 9×9 gameplay with candidate pencil notes, smart peer note auto-clean, auto-candidate calculation, completed digit counter & dimming, real-time conflict checking, "Check Errors" validation, step-by-step logical hints, undo/redo, `localStorage` auto-save, and puzzle import/export with solver diagnostics.
2. **Daily Changoku Challenge**: Deterministic daily puzzle seeded via a Mulberry32 PRNG (`YYYY-MM-DD`) so every player gets the exact same board each day without a backend server. Includes a **Day-of-the-Week Difficulty Curve** (*Mon/Tue = Easy, Wed/Thu = Medium, Fri/Sat = Hard, Sun = Expert*), `Temporal` API calendar math (with `Date` fallback), live timer (`⏱️`), streak counter (`🔥 Racha`), hidden **7-Day Streak Jokers** (max 5), and one-tap **WhatsApp / Clipboard Result Sharing**.
3. **11-Technique Interactive Visualizer**: Dedicated study tool walking through 11 essential and advanced Sudoku solving techniques with color-coded premise cells, pivots, wings, targets, and animated candidate eliminations.
4. **On-The-Fly Puzzle Generator**: Generates mathematically unique Sudoku puzzles in 2–7 milliseconds directly in the browser, featuring 180° rotational symmetry and human-style logical difficulty grading.
5. **Theory & Combinatorics Explorer**: An interactive mathematical exploration answering whether Sudoku is solved, state space bounds ($6.67 \times 10^{21}$ grids), Gary McGuire's 17-clue minimum proof, and live browser benchmarks.
6. **Bilingual (`🇨🇱 ES` / `🇬🇧 EN`) & High-Contrast Day/Night Themes**: Instant toggle between Chilean Spanish and English across the entire UI, hints, visualizer, and theory articles, plus a default high-contrast **Day Mode** (`☀️ Día`) and **Night Mode** (`🌙 Noche`).
7. **Installable Offline PWA & Single-File Mobile Bundler**: Includes a Web App Manifest (`manifest.json`) and Offline Service Worker (`sw.js`) for *"Add to Home Screen"* installation, plus a zero-dependency bundler (`scripts/bundle.js`) that packages the entire app into a single standalone `.html` file (`dist/changoku-es.html`) ready to share via WhatsApp or AirDrop.

---

## Quick Start

The application is written in vanilla ES modules and HTML5/CSS3 with zero runtime dependencies.

### Option 1: Run Local Server (`npm` or Python)
```bash
npm start
# Runs python3 -m http.server 3000 -> Open http://localhost:3000
```

### Option 2: Package into a Single Self-Contained Mobile HTML File
Package all HTML, CSS, SVG icon, and ES modules into a single zero-dependency `.html` file (`dist/changoku-es.html` or `dist/changoku-en.html`) that you can send directly to a phone via WhatsApp, AirDrop, or Email and open offline in any mobile browser:
```bash
# Build Chilean Spanish version (dist/changoku-es.html)
npm run build:es

# Build English version (dist/changoku-en.html)
npm run build:en

# Custom output path
node scripts/bundle.js --lang=es --out=dist/changoku-mama.html
```

### Option 3: Run Automated Test Suites
```bash
# 1. Core Engine Suite (Solver, 17-Clue Benchmark, 11 Techniques, Seeded Daily PRNG)
npm test

# 2. Playwright Mobile Visual & E2E Suite (16 single-responsibility tests + mobile screenshots)
npm run test:e2e
```

---

## Theoretical Questions Answered

### 1. Is Sudoku a Solved Game?

The answer depends on the game-theoretic and computational definition:

| Aspect | Status | Details |
| :--- | :--- | :--- |
| **Standard 9×9 Space** | **Exhaustively Analyzed** | Total valid filled grids: **6,670,903,752,021,072,936,960** ($\approx 6.671 \times 10^{21}$). |
| **Symmetry Equivalence** | **Fully Catalogued** | Taking into account rotations, reflections, permutations of rows/cols within bands, and digit permutations, there are exactly **5,472,730,538** essentially different grids (Russell & Jarvis, 2006). |
| **Minimum Clue Bound** | **Mathematically Solved** | In 2012, Gary McGuire, Bastian Tugemann, and Gilles Civario proved via a 7.1 million CPU-hour supercomputer search that **no 16-clue Sudoku has a unique solution**. The minimum number of clues is **17**. |
| **Generalized $N \times N$** | **NP-Complete** | Determining if an arbitrary $n^2 \times n^2$ puzzle is solvable is NP-complete (Takayuki Yato and Takahiro Seta, 2003; ASP-complete). |
| **Computer Solvability** | **Trivially Solved** | For $9 \times 9$, Donald Knuth's Dancing Links (Algorithm X) or backtracking with constraint propagation solves any board in **under 1 millisecond**. |

---

### 2. Can We Generate All Combinations?

It depends on whether you mean **completed solution grids** or **partial clue puzzles**:

#### A. All 6.67 × 10²¹ Completed Grids
- **Sequential Output**: Generating every single valid grid sequentially is computationally infeasible due to cosmic time scales:
  $$\frac{6.67 \times 10^{21} \text{ grids}}{1,000,000,000 \text{ grids/second}} \approx 6.67 \times 10^{12} \text{ seconds} \approx \mathbf{211,000 \text{ years}}$$
- **Storage Space**: Storing $6.67 \times 10^{21}$ grids in uncompressed text (81 bytes per grid) would require **$\approx 540,000$ exabytes** of data.

#### B. The 5.47 Billion Symmetry Equivalence Classes
- **Yes!** The 5,472,730,538 fundamental classes have been generated, catalogued, and indexed by mathematicians into compressed databases of roughly 40 to 60 GB.

#### C. All Starting Clue Puzzles
- The space of all partial 81-cell configurations is $3^{81} \approx 4.4 \times 10^{38}$.
- The number of valid puzzles with a single unique solution is estimated between $10^{30}$ and $10^{35}$.
- Because storing all possible puzzles is impossible, modern software generates them **procedurally on demand**.

---

### 3. Are They Possible to Generate on the Fly or Does Someone Need to Design Them?

**They are 100% possible to generate on the fly!**

Modern digital Sudoku games generate fresh, mathematically guaranteed unique puzzles in **2 to 10 milliseconds**.

#### The 4-Stage On-The-Fly Generation Algorithm:
```
1. FULL GRID GENERATION:
   Start with an empty 9×9 board.
   Fill cells using randomized backtracking with constraint propagation (MRV heuristic).
   Takes: ~1 ms.
   
2. SYMMETRIC HOLE DIGGING:
   Group cells into 180° rotationally symmetric pairs: (r, c) and (8-r, 8-c).
   Shuffle the pairs into random order.
   For each pair:
     Temporarily remove both numbers.
     Test uniqueness: countSolutions(board, limit=2) === 1.
     If still strictly unique: keep the holes!
     If ambiguous (>= 2 solutions): rollback and restore the numbers!
     
3. DIFFICULTY TARGETING:
   Stop digging when clue count reaches the desired target:
   • Easy: 35–40 clues
   • Medium: 29–34 clues
   • Hard: 25–28 clues
   • Expert: 21–24 clues
   
4. LOGICAL DEDUCTION GRADING:
   A human-style solver attempts to solve the puzzle using only logical deduction
   (Singles → Pairs → Intersections → X-Wings → Wings) without guessing.
   Difficulty is graded by the highest technique required to complete it.
```

---

## Techniques Catalog & Visualizer Guide

The app includes interactive visualizations for 11 core techniques:

```
┌─────────────────┬────────────────────────────┬─────────────┐
│ Category        │ Technique                  │ Difficulty  │
├─────────────────┼────────────────────────────┼─────────────┤
│ Basic           │ Naked Single               │ Very Easy   │
│ Basic           │ Hidden Single              │ Easy        │
│ Intersections   │ Pointing Candidates        │ Medium      │
│ Intersections   │ Box-Line Reduction         │ Medium      │
│ Subsets         │ Naked Pair                 │ Medium      │
│ Subsets         │ Hidden Pair                │ Medium      │
│ Subsets         │ Naked Triple               │ Hard        │
│ Subsets         │ Hidden Triple              │ Hard        │
│ Fish            │ X-Wing                     │ Hard        │
│ Fish            │ Swordfish                  │ Master      │
│ Wings           │ XY-Wing (Y-Wing)           │ Master      │
└─────────────────┴────────────────────────────┴─────────────┘
```

### Visualizer Color Legend
- 🟦 **Primary / Base Cells**: Cells where the pattern is anchored (e.g. base rows in X-Wing, wings in XY-Wing, pair cells in Naked Pair).
- 🟪 **Pivot Cell**: The anchor cell in XY-Wing ($[A, B]$).
- 🟧 **Affected Peers**: Cells that see the pattern and are subject to candidate elimination.
- 🟥 **Strikethrough Candidates**: Candidates mathematically eliminated by the technique.

---

## Project Structure

```
changoku/
├── index.html                 # Main application interface (Play, Visualizer, Theory)
├── manifest.json              # Web App Manifest for installable mobile/desktop PWA
├── sw.js                      # Zero-dependency Offline Service Worker (cache-first)
├── icon.svg                   # Changoku Labs vector app icon & favicon
├── package.json               # Scripts (start, test, test:e2e, build:es, build:en)
├── playwright.config.js       # Headless Chrome configuration for mobile visual & E2E tests
├── README.md                  # Architecture, combinatorics theory, and usage guide
├── ROADMAP.md                 # Feature checklist, milestones, and v1.1 scope record
├── css/
│   └── style.css              # Responsive mobile portrait/landscape & Day/Night themes
├── js/
│   ├── app.js                 # Main controller (i18n, theme, localStorage, Daily, PWA)
│   ├── engine/
│   │   ├── sudoku.js          # Bitmask operations, candidate computation, unit tables
│   │   ├── solver.js          # Fast backtracking solver, uniqueness counter, logical solver
│   │   ├── generator.js       # On-the-fly & seeded Daily generator + Temporal calendar math
│   │   └── techniques.js      # Detectors for all 11 techniques with step explanations
│   ├── i18n/
│   │   └── translations.js    # Complete Chilean Spanish ('es') & English ('en') dictionary
│   ├── study/
│   │   └── studyPuzzles.js    # 11 verified single-solution study boards + 17-clue benchmark
│   └── ui/
│       ├── boardUI.js         # Interactive 9×9 board, pencil notes, auto-clean, undo/redo
│       ├── visualizerUI.js    # Interactive technique explorer & deduction animator
│       └── theoryUI.js        # Theory tab UI, live benchmarker, 17-clue verifier
├── scripts/
│   └── bundle.js              # Single-file offline HTML bundler (dist/changoku-es.html)
└── tests/
    ├── test-engine.js         # Node.js unit suite for solver, generator, and techniques
    └── e2e.spec.js            # 16 Playwright mobile visual & functional E2E tests
```

---

## Key Keyboard Shortcuts

- **`1` – `9`**: Place digit in selected cell (or toggle candidate in pencil mode).
- **`Backspace` / `Delete`**: Clear digit or candidates in selected cell.
- **`Arrow Keys`**: Move selection across the 9×9 board.
- **`N`**: Toggle pencil note mode on/off.

---

## References

1. **Felgenhauer, B., & Jarvis, F.** (2005). *Enumerating possible Sudoku grids*.
2. **Russell, E., & Jarvis, F.** (2006). *There are 5472730538 essentially different Sudoku grids*.
3. **McGuire, G., Tugemann, B., & Civario, G.** (2012). *There is no 16-Clue Sudoku: Solving the Sudoku Minimum Number of Clues Problem*. [arXiv:1201.0749](https://arxiv.org/abs/1201.0749).
4. **Yato, T., & Seta, T.** (2003). *Complexity and Completeness of Finding Another Solution and Its Application to Puzzles*. IEICE Transactions.
5. **Knuth, D. E.** (2000). *Dancing Links (Algorithm X)*. Millennial Perspectives in Computer Science.

---

## License

Licensed under the [Apache License 2.0](LICENSE) • **Changoku Labs**
