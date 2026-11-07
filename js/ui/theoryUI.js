/**
 * Sudoku Combinatorics & Theory Interactive UI
 * Answers theoretical questions with mathematical rigor and provides live
 * browser benchmarking of on-the-fly generation and uniqueness checks.
 */

import { generatePuzzle } from '../engine/generator.js';
import { countSolutions } from '../engine/solver.js';
import { parseBoard } from '../engine/sudoku.js';
import { FAMOUS_17_CLUE_PUZZLE } from '../study/studyPuzzles.js';
import { TRANSLATIONS } from '../i18n/translations.js';

export class TheoryUI {
  constructor(containerEl, onLoadPuzzleToPlay, initialLang = 'es') {
    this.containerEl = containerEl;
    this.onLoadPuzzleToPlay = onLoadPuzzleToPlay || (() => {});
    this.lang = initialLang;
    this.lastVerifyResult = null;
    this.lastBenchResult = null;

    this.initControls();
    this.setLanguage(this.lang);
  }

  t() {
    const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.es;
    return dict.theory;
  }

  setLanguage(lang) {
    this.lang = TRANSLATIONS[lang] ? lang : 'es';
    const th = this.t();
    if (!th || !this.containerEl) return;

    const setText = (sel, text) => {
      const el = this.containerEl.querySelector(sel);
      if (el) el.textContent = text;
    };
    const setHtml = (sel, html) => {
      const el = this.containerEl.querySelector(sel);
      if (el) el.innerHTML = html;
    };

    setText('#theory-hero-title', th.heroTitle);
    setText('#theory-hero-subtitle', th.heroSubtitle);

    // Question 1
    setText('#theory-q1-title', th.q1Title);
    setText('#theory-q1-intro', th.q1Intro);
    setText('#theory-stat-1-label', th.stat1Label);
    setText('#theory-stat-2-label', th.stat2Label);
    setText('#theory-stat-3-label', th.stat3Label);
    setText('#theory-stat-4-val', th.stat4Val);
    setText('#theory-stat-4-label', th.stat4Label);
    setHtml('#theory-q1-p1', th.q1P1);
    setHtml('#theory-q1-p2', th.q1P2);
    setHtml('#theory-q1-p3', th.q1P3);
    setText('#load-17-clue-btn', th.btnLoad17);
    setText('#verify-17-clue-btn', th.btnVerify17);

    if (this.lastVerifyResult) {
      setText('#verify-17-output', th.verify17Result(this.lastVerifyResult.ms, this.lastVerifyResult.count));
    }

    // Question 2
    setText('#theory-q2-title', th.q2Title);
    setHtml('#theory-q2-intro', th.q2Intro);
    setHtml('#theory-q2-p1', th.q2P1);
    setHtml('#theory-q2-p2', th.q2P2);
    setHtml('#theory-q2-p3', th.q2P3);

    // Question 3
    setText('#theory-q3-title', th.q3Title);
    setHtml('#theory-q3-intro', th.q3Intro);
    setText('#theory-q3-p1', th.q3P1);
    setText('#theory-code-flow', th.codeFlow);
    setHtml('#theory-q3-p2', th.q3P2);

    // Benchmark Card
    setText('#theory-bench-title', th.benchTitle);
    setText('#theory-bench-desc', th.benchDesc);
    setText('#run-bench-btn', th.btnRunBench);

    const benchOut = this.containerEl.querySelector('#bench-output');
    if (benchOut) {
      if (this.lastBenchResult) {
        const r = this.lastBenchResult;
        benchOut.textContent = th.benchResult(r.avgTime, r.totalTime, r.cluesStr, r.allUnique);
      } else {
        benchOut.textContent = th.benchInitialOutput;
      }
    }
  }

  initControls() {
    // Benchmark generator button
    const benchBtn = this.containerEl.querySelector('#run-bench-btn');
    const benchOut = this.containerEl.querySelector('#bench-output');

    if (benchBtn && benchOut) {
      benchBtn.addEventListener('click', () => {
        const th = this.t();
        benchBtn.disabled = true;
        benchOut.textContent = th.benchRunning;

        setTimeout(() => {
          const times = [];
          const clues = [];
          let allUnique = true;

          const startTotal = performance.now();
          for (let i = 0; i < 5; i++) {
            const t0 = performance.now();
            const res = generatePuzzle('medium', true);
            const t1 = performance.now();
            times.push(t1 - t0);
            clues.push(res.cluesCount);

            if (countSolutions(res.puzzle, 2) !== 1) {
              allUnique = false;
            }
          }
          const totalTime = (performance.now() - startTotal).toFixed(2);
          const avgTime = (parseFloat(totalTime) / 5).toFixed(2);
          const cluesStr = clues.join(', ');

          this.lastBenchResult = { avgTime, totalTime, cluesStr, allUnique };
          benchOut.textContent = this.t().benchResult(avgTime, totalTime, cluesStr, allUnique);

          benchBtn.disabled = false;
        }, 50);
      });
    }

    // Load 17 clue puzzle button
    const load17Btn = this.containerEl.querySelector('#load-17-clue-btn');
    if (load17Btn) {
      load17Btn.addEventListener('click', () => {
        this.onLoadPuzzleToPlay(FAMOUS_17_CLUE_PUZZLE.boardStr);
      });
    }

    // Verify 17-clue uniqueness button
    const verify17Btn = this.containerEl.querySelector('#verify-17-clue-btn');
    const verify17Out = this.containerEl.querySelector('#verify-17-output');
    if (verify17Btn && verify17Out) {
      verify17Btn.addEventListener('click', () => {
        const board = parseBoard(FAMOUS_17_CLUE_PUZZLE.boardStr);
        const t0 = performance.now();
        const count = countSolutions(board, 2);
        const t1 = performance.now();
        const ms = (t1 - t0).toFixed(2);

        this.lastVerifyResult = { ms, count };
        verify17Out.textContent = this.t().verify17Result(ms, count);
      });
    }
  }
}
