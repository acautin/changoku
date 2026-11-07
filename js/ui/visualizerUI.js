/**
 * Sudoku Technique Visualizer UI Component
 * Provides interactive walkthroughs, highlight color coding, candidate strike-throughs,
 * and step deduction executions for all 11 core techniques.
 */

import {
  parseBoard,
  calculateCandidates,
  maskToDigits,
  PEERS
} from '../engine/sudoku.js';

import {
  TECHNIQUE_CATALOG,
  findTechniqueById
} from '../engine/techniques.js';

import {
  TECHNIQUE_STUDY_PUZZLES
} from '../study/studyPuzzles.js';

import {
  TRANSLATIONS,
  localizeStep
} from '../i18n/translations.js';

export class VisualizerUI {
  constructor(containerEl, boardEl, onTransferPuzzle, initialLang = 'en') {
    this.containerEl = containerEl;
    this.boardEl = boardEl;
    this.onTransferPuzzle = onTransferPuzzle || (() => {});
    this.lang = initialLang;

    this.currentTechniqueId = 'x_wing';
    this.currentPuzzle = null;
    this.currentBoard = new Uint8Array(81);
    this.currentCandidates = new Uint16Array(81);
    this.activeStep = null;
    this.applied = false;

    this.cellElements = [];
    this.initBoardDOM();
    this.initControls();
  }

  initBoardDOM() {
    this.boardEl.innerHTML = '';
    this.cellElements = [];

    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.dataset.row = row;
      cell.dataset.col = col;

      const candGrid = document.createElement('div');
      candGrid.className = 'candidates-grid';
      for (let d = 1; d <= 9; d++) {
        const cSpan = document.createElement('span');
        cSpan.className = 'candidate-num';
        cSpan.dataset.digit = d;
        cSpan.textContent = d;
        candGrid.appendChild(cSpan);
      }
      cell.appendChild(candGrid);

      const valSpan = document.createElement('span');
      valSpan.className = 'cell-value';
      cell.appendChild(valSpan);

      this.boardEl.appendChild(cell);
      this.cellElements.push(cell);
    }
  }

  initControls() {
    // Technique sidebar buttons
    const navContainer = this.containerEl.querySelector('.technique-nav');
    if (navContainer) {
      navContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tech-list-btn');
        if (btn && btn.dataset.techId) {
          navContainer.querySelectorAll('.tech-list-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.loadTechnique(btn.dataset.techId);
        }
      });
    }

    // Explainer action buttons
    const applyBtn = this.containerEl.querySelector('#tech-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyStep());
    }

    const resetBtn = this.containerEl.querySelector('#tech-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetCurrentTechnique());
    }

    const transferBtn = this.containerEl.querySelector('#tech-transfer-btn');
    if (transferBtn) {
      transferBtn.addEventListener('click', () => {
        if (this.currentPuzzle) {
          this.onTransferPuzzle(this.currentPuzzle.boardStr);
        }
      });
    }
  }

  loadTechnique(techId) {
    this.currentTechniqueId = techId;
    this.applied = false;

    const puzzle = TECHNIQUE_STUDY_PUZZLES.find(p => p.techniqueId === techId) || TECHNIQUE_STUDY_PUZZLES[0];
    this.currentPuzzle = puzzle;
    this.currentBoard.set(parseBoard(puzzle.boardStr));
    this.currentCandidates.set(calculateCandidates(this.currentBoard));

    // Run detector
    this.activeStep = findTechniqueById(techId, this.currentBoard, this.currentCandidates);

    this.render();
    this.updateExplainerUI();
  }

  resetCurrentTechnique() {
    this.applied = false;
    if (this.currentPuzzle) {
      this.currentBoard.set(parseBoard(this.currentPuzzle.boardStr));
      this.currentCandidates.set(calculateCandidates(this.currentBoard));
      this.activeStep = findTechniqueById(this.currentTechniqueId, this.currentBoard, this.currentCandidates);
    }
    this.render();
    this.updateExplainerUI();
  }

  applyStep() {
    if (!this.activeStep || this.applied) return;

    if (this.activeStep.placement) {
      const { cell, digit } = this.activeStep.placement;
      this.currentBoard[cell] = digit;
      this.currentCandidates[cell] = 0;
      const clearMask = ~(1 << digit);
      for (const peer of PEERS[cell]) {
        this.currentCandidates[peer] &= clearMask;
      }
    } else if (this.activeStep.eliminations) {
      for (const e of this.activeStep.eliminations) {
        this.currentCandidates[e.cell] &= ~(1 << e.digit);
      }
    }

    this.applied = true;
    this.render();
    this.updateExplainerUI();
  }

  render() {
    const step = this.activeStep;
    const highlightMap = new Map();
    if (step && step.highlightCells && !this.applied) {
      for (const h of step.highlightCells) {
        highlightMap.set(h.cell, h.type);
      }
    }

    const elimMap = new Map();
    if (step && step.eliminations && !this.applied) {
      for (const e of step.eliminations) {
        if (!elimMap.has(e.cell)) elimMap.set(e.cell, new Set());
        elimMap.get(e.cell).add(e.digit);
      }
    }

    const keepMap = new Map();
    if (step && step.highlightCandidates && !this.applied) {
      for (const k of step.highlightCandidates) {
        if (!keepMap.has(k.cell)) keepMap.set(k.cell, new Set());
        keepMap.get(k.cell).add(k.digit);
      }
    }

    for (let i = 0; i < 81; i++) {
      const cellEl = this.cellElements[i];
      const val = this.currentBoard[i];
      const valSpan = cellEl.querySelector('.cell-value');
      const candGrid = cellEl.querySelector('.candidates-grid');

      // Reset classes
      cellEl.className = 'cell';

      // Technique highlights
      if (highlightMap.has(i)) {
        const type = highlightMap.get(i);
        if (type === 'primary') cellEl.classList.add('tech-primary');
        else if (type === 'pivot') cellEl.classList.add('tech-pivot');
        else if (type === 'wing') cellEl.classList.add('tech-wing');
        else if (type === 'target') cellEl.classList.add('tech-target');
      }

      if (val !== 0) {
        cellEl.classList.add('given');
        valSpan.textContent = val;
        valSpan.style.display = 'block';
        candGrid.style.display = 'none';
      } else {
        valSpan.textContent = '';
        valSpan.style.display = 'none';
        candGrid.style.display = 'grid';

        const digits = maskToDigits(this.currentCandidates[i]);
        const digitSet = new Set(digits);
        const elimDigits = elimMap.get(i) || new Set();
        const keepDigits = keepMap.get(i) || new Set();

        const spans = candGrid.querySelectorAll('.candidate-num');
        for (let d = 1; d <= 9; d++) {
          const sp = spans[d - 1];
          sp.className = 'candidate-num';

          if (elimDigits.has(d)) {
            sp.classList.add('active', 'highlight-elim');
            sp.style.visibility = 'visible';
          } else if (keepDigits.has(d)) {
            sp.classList.add('active', 'highlight-keep');
            sp.style.visibility = 'visible';
          } else if (digitSet.has(d)) {
            sp.classList.add('active');
            sp.style.visibility = 'visible';
          } else {
            sp.style.visibility = 'hidden';
          }
        }
      }
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    this.updateExplainerUI();
  }

  updateExplainerUI() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.en;
    const baseMeta = TECHNIQUE_CATALOG[this.currentTechniqueId] || {};
    const localMeta = (t.techniques && t.techniques[this.currentTechniqueId]) || {};
    const meta = { ...baseMeta, ...localMeta };

    const titleEl = this.containerEl.querySelector('#tech-title');
    const badgeEl = this.containerEl.querySelector('#tech-diff-badge');
    const ruleEl = this.containerEl.querySelector('#tech-rule');
    const descEl = this.containerEl.querySelector('#tech-description');
    const applyBtn = this.containerEl.querySelector('#tech-apply-btn');

    if (titleEl) titleEl.textContent = meta.name || 'Technique';
    if (badgeEl) badgeEl.textContent = `${meta.category} • ${meta.difficulty}`;
    if (ruleEl) ruleEl.textContent = meta.rule || '';

    if (descEl) {
      if (this.applied) {
        descEl.innerHTML = t.appliedSuccessHtml;
      } else if (this.activeStep) {
        const localized = localizeStep(this.activeStep, this.lang);
        descEl.textContent = localized.description;
      } else {
        descEl.textContent = meta.summary || '';
      }
    }

    if (applyBtn) {
      applyBtn.disabled = this.applied || !this.activeStep;
      applyBtn.textContent = this.applied ? t.btnAppliedDeduction : t.btnApplyDeduction;
    }
  }
}
