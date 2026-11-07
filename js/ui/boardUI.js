/**
 * Sudoku Board Interactive UI Component
 * Handles rendering, selection, keyboard/keypad input, pencil notes,
 * conflict highlighting, and game state.
 */

import {
  parseBoard,
  boardToString,
  calculateCandidates,
  isValidPlacement,
  getConflicts,
  maskToDigits,
  PEERS,
  isBoardComplete
} from '../engine/sudoku.js';

import { solve, solveLogical, countSolutions } from '../engine/solver.js';

export class BoardUI {
  constructor(boardEl, options = {}) {
    this.boardEl = boardEl;
    this.options = options;

    this.initialBoard = new Uint8Array(81);
    this.currentBoard = new Uint8Array(81);
    this.solution = new Uint8Array(81);
    this.userCandidates = Array.from({ length: 81 }, () => new Set());
    this.autoCandidatesEnabled = false;

    this.selectedCell = null;
    this.isNoteMode = false;
    this.history = [];
    this.redoStack = [];
    this.mistakeCells = new Set();

    this.onStateChange = options.onStateChange || (() => {});
    this.onHint = options.onHint || (() => {});
    this.onNoteModeChange = options.onNoteModeChange || (() => {});

    this.cellElements = [];
    this.initBoardDOM();
    this.attachEvents();
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

      // Candidate 3x3 grid inside cell
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

      // Main value display element
      const valSpan = document.createElement('span');
      valSpan.className = 'cell-value';
      cell.appendChild(valSpan);

      this.boardEl.appendChild(cell);
      this.cellElements.push(cell);
    }
  }

  attachEvents() {
    this.boardEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) {
        const idx = parseInt(cell.dataset.index, 10);
        this.selectCell(idx);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.boardEl.closest('.tab-pane') && !this.boardEl.closest('.tab-pane').classList.contains('active')) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        this.toggleNoteMode();
        e.preventDefault();
        return;
      }

      if (this.selectedCell === null) return;

      const idx = this.selectedCell;
      const row = Math.floor(idx / 9);
      const col = idx % 9;

      if (e.key >= '1' && e.key <= '9') {
        const digit = parseInt(e.key, 10);
        this.inputDigit(digit);
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        this.clearSelectedCell();
        e.preventDefault();
      } else if (e.key === 'ArrowUp' && row > 0) {
        this.selectCell((row - 1) * 9 + col);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' && row < 8) {
        this.selectCell((row + 1) * 9 + col);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && col > 0) {
        this.selectCell(row * 9 + (col - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && col < 8) {
        this.selectCell(row * 9 + (col + 1));
        e.preventDefault();
      }
    });
  }

  loadBoard(puzzleStr) {
    const parsed = typeof puzzleStr === 'string' ? parseBoard(puzzleStr) : puzzleStr;
    this.initialBoard.set(parsed);
    this.currentBoard.set(parsed);
    this.history = [];
    this.redoStack = [];
    this.userCandidates = Array.from({ length: 81 }, () => new Set());
    this.mistakeCells = new Set();
    this.activeHintStep = null;

    // Compute full solution for checking
    const solved = solve(this.initialBoard);
    if (solved) this.solution.set(solved);

    if (this.autoCandidatesEnabled) {
      this.computeAutoCandidates();
    }

    this.render();
    this.onStateChange(this.getStats());
  }

  selectCell(index) {
    this.selectedCell = index;
    this.renderHighlights();
  }

  inputDigit(digit) {
    if (this.selectedCell === null) return;
    const idx = this.selectedCell;

    // Given clues are immutable
    if (this.initialBoard[idx] !== 0) return;

    this.activeHintStep = null;
    this.saveHistory();

    if (this.isNoteMode) {
      // Toggle candidate pencil note
      const cSet = this.userCandidates[idx];
      if (cSet.has(digit)) cSet.delete(digit);
      else cSet.add(digit);
    } else {
      // Set cell value
      const prev = this.currentBoard[idx];
      const nextVal = prev === digit ? 0 : digit;
      this.currentBoard[idx] = nextVal;

      if (nextVal !== 0) {
        // Clear candidates in this cell and remove placed digit from all peers
        this.userCandidates[idx].clear();
        for (const peer of PEERS[idx]) {
          this.userCandidates[peer].delete(nextVal);
        }
      } else if (this.autoCandidatesEnabled) {
        this.computeAutoCandidates();
      }
    }

    this.render();
    this.checkCompletion();
    this.onStateChange(this.getStats());
  }

  clearSelectedCell() {
    if (this.selectedCell === null) return;
    const idx = this.selectedCell;
    if (this.initialBoard[idx] !== 0) return;

    this.saveHistory();
    this.currentBoard[idx] = 0;
    this.userCandidates[idx].clear();

    if (this.autoCandidatesEnabled) {
      this.computeAutoCandidates();
    }

    this.render();
    this.onStateChange(this.getStats());
  }

  toggleNoteMode() {
    this.isNoteMode = !this.isNoteMode;
    this.onNoteModeChange(this.isNoteMode);
    return this.isNoteMode;
  }

  toggleAutoCandidates() {
    this.autoCandidatesEnabled = !this.autoCandidatesEnabled;
    if (this.autoCandidatesEnabled) {
      this.computeAutoCandidates();
    } else {
      this.userCandidates = Array.from({ length: 81 }, () => new Set());
    }
    this.render();
    this.onStateChange(this.getStats());
    return this.autoCandidatesEnabled;
  }

  serializeState() {
    return {
      initialStr: boardToString(this.initialBoard),
      currentStr: boardToString(this.currentBoard),
      candidates: this.userCandidates.map(s => Array.from(s)),
      autoCandidatesEnabled: this.autoCandidatesEnabled,
      isNoteMode: this.isNoteMode
    };
  }

  restoreState(saved) {
    if (!saved || !saved.initialStr || saved.initialStr.length !== 81) return false;
    this.initialBoard.set(parseBoard(saved.initialStr));
    this.currentBoard.set(
      saved.currentStr && saved.currentStr.length === 81
        ? parseBoard(saved.currentStr)
        : this.initialBoard
    );
    this.history = [];
    this.redoStack = [];
    this.mistakeCells = new Set();
    this.activeHintStep = null;

    const solved = solve(this.initialBoard);
    if (solved) this.solution.set(solved);

    this.autoCandidatesEnabled = Boolean(saved.autoCandidatesEnabled);
    this.isNoteMode = Boolean(saved.isNoteMode);

    if (Array.isArray(saved.candidates) && saved.candidates.length === 81) {
      this.userCandidates = saved.candidates.map(arr => new Set(Array.isArray(arr) ? arr : []));
    } else if (this.autoCandidatesEnabled) {
      this.computeAutoCandidates();
    } else {
      this.userCandidates = Array.from({ length: 81 }, () => new Set());
    }

    this.render();
    this.onStateChange(this.getStats());
    return true;
  }

  computeAutoCandidates() {
    const masks = calculateCandidates(this.currentBoard);
    for (let i = 0; i < 81; i++) {
      this.userCandidates[i].clear();
      if (this.currentBoard[i] === 0) {
        for (const d of maskToDigits(masks[i])) {
          this.userCandidates[i].add(d);
        }
      }
    }
  }

  saveHistory() {
    this.history.push({
      board: new Uint8Array(this.currentBoard),
      candidates: this.userCandidates.map(s => new Set(s))
    });
    this.redoStack = [];
  }

  undo() {
    if (this.history.length === 0) return;
    this.redoStack.push({
      board: new Uint8Array(this.currentBoard),
      candidates: this.userCandidates.map(s => new Set(s))
    });
    const last = this.history.pop();
    this.currentBoard.set(last.board);
    this.userCandidates = last.candidates.map(s => new Set(s));
    this.render();
    this.onStateChange(this.getStats());
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.history.push({
      board: new Uint8Array(this.currentBoard),
      candidates: this.userCandidates.map(s => new Set(s))
    });
    const next = this.redoStack.pop();
    this.currentBoard.set(next.board);
    this.userCandidates = next.candidates.map(s => new Set(s));
    this.render();
    this.onStateChange(this.getStats());
  }

  getHint() {
    let customMasks = null;
    if (this.autoCandidatesEnabled) {
      customMasks = new Uint16Array(81);
      for (let i = 0; i < 81; i++) {
        let mask = 0;
        for (const d of this.userCandidates[i]) {
          mask |= (1 << d);
        }
        customMasks[i] = mask;
      }
    }

    const analysis = solveLogical(this.currentBoard, customMasks);
    if (analysis.steps.length > 0) {
      const step = analysis.steps[0];
      this.activeHintStep = step;
      if (step.placement) {
        this.selectCell(step.placement.cell);
      } else if (step.eliminations && step.eliminations.length > 0) {
        this.selectCell(step.eliminations[0].cell);
      } else {
        this.renderHighlights();
      }
      this.onHint(step);
      return step;
    } else {
      this.activeHintStep = null;
      this.renderHighlights();
      const msg = {
        name: 'No Pure Logical Step',
        description: 'No standard human technique found from the current board state without bifurcation.'
      };
      this.onHint(msg);
      return msg;
    }
  }

  solveCurrent() {
    const solved = solve(this.currentBoard) || solve(this.initialBoard);
    if (solved) {
      this.saveHistory();
      this.currentBoard.set(solved);
      this.solution.set(solved);
      this.render();
      this.checkCompletion();
      this.onStateChange(this.getStats());
      return true;
    }
    return false;
  }

  checkCompletion() {
    if (isBoardComplete(this.currentBoard)) {
      this.onStateChange({ ...this.getStats(), completed: true });
    }
  }

  checkMistakes() {
    this.mistakeCells = new Set();
    let mistakeCount = 0;

    for (let i = 0; i < 81; i++) {
      if (this.currentBoard[i] !== 0 && this.initialBoard[i] === 0) {
        if (this.solution[i] !== 0 && this.currentBoard[i] !== this.solution[i]) {
          this.mistakeCells.add(i);
          mistakeCount++;
        }
      }
    }

    this.render();
    return {
      count: mistakeCount,
      cells: Array.from(this.mistakeCells)
    };
  }

  clearMistakes() {
    this.mistakeCells = new Set();
    this.render();
  }

  getExportData() {
    const initialStr = boardToString(this.initialBoard);
    const currentStr = boardToString(this.currentBoard);
    const initialSols = countSolutions(this.initialBoard, 2);
    const currentSols = countSolutions(this.currentBoard, 2);

    const mistakes = [];
    for (let i = 0; i < 81; i++) {
      if (this.currentBoard[i] !== 0 && this.initialBoard[i] === 0) {
        if (this.solution[i] !== 0 && this.currentBoard[i] !== this.solution[i]) {
          const r = Math.floor(i / 9) + 1;
          const c = (i % 9) + 1;
          mistakes.push(`R${r}C${c}: has [${this.currentBoard[i]}] (correct is [${this.solution[i]}])`);
        }
      }
    }

    return {
      initialStr,
      currentStr,
      initialSols,
      currentSols,
      isSolvable: currentSols > 0,
      mistakes
    };
  }

  getStats() {
    let filled = 0;
    const conflictsList = getConflicts(this.currentBoard);
    const conflictSet = new Set(conflictsList);
    const digitCounts = new Array(10).fill(0);

    for (let i = 0; i < 81; i++) {
      const val = this.currentBoard[i];
      if (val !== 0) {
        filled++;
        if (!conflictSet.has(i)) {
          digitCounts[val]++;
        }
      }
    }
    return {
      filled,
      remaining: 81 - filled,
      conflicts: conflictsList.length,
      digitCounts
    };
  }

  render() {
    const conflicts = new Set(getConflicts(this.currentBoard));

    for (let i = 0; i < 81; i++) {
      const cellEl = this.cellElements[i];
      const valSpan = cellEl.querySelector('.cell-value');
      const val = this.currentBoard[i];
      const isGiven = this.initialBoard[i] !== 0;

      // Classes
      cellEl.className = 'cell';
      if (isGiven) cellEl.classList.add('given');
      else if (val !== 0) cellEl.classList.add('user-filled');

      if (conflicts.has(i)) cellEl.classList.add('conflict');
      if (this.mistakeCells && this.mistakeCells.has(i)) cellEl.classList.add('mistake');

      // Value & candidates
      if (val !== 0) {
        valSpan.textContent = val;
        valSpan.style.display = 'block';
        cellEl.querySelector('.candidates-grid').style.display = 'none';
      } else {
        valSpan.textContent = '';
        valSpan.style.display = 'none';
        const candGrid = cellEl.querySelector('.candidates-grid');
        candGrid.style.display = 'grid';

        const cSet = this.userCandidates[i];
        const spans = candGrid.querySelectorAll('.candidate-num');
        for (let d = 1; d <= 9; d++) {
          const sp = spans[d - 1];
          if (cSet && cSet.has(d)) {
            sp.classList.add('active');
            sp.style.visibility = 'visible';
          } else {
            sp.classList.remove('active');
            sp.style.visibility = 'hidden';
          }
        }
      }
    }

    this.renderHighlights();
  }

  renderHighlights() {
    const selectedVal = this.selectedCell !== null ? this.currentBoard[this.selectedCell] : 0;
    const selectedRow = this.selectedCell !== null ? Math.floor(this.selectedCell / 9) : -1;
    const selectedCol = this.selectedCell !== null ? this.selectedCell % 9 : -1;
    const selectedBox =
      this.selectedCell !== null
        ? Math.floor(selectedRow / 3) * 3 + Math.floor(selectedCol / 3)
        : -1;

    const hintMap = new Map();
    if (this.activeHintStep && this.activeHintStep.highlightCells) {
      for (const h of this.activeHintStep.highlightCells) {
        hintMap.set(h.cell, h.type);
      }
    }

    for (let i = 0; i < 81; i++) {
      const cellEl = this.cellElements[i];
      cellEl.classList.remove(
        'selected',
        'highlighted',
        'same-digit',
        'tech-primary',
        'tech-pivot',
        'tech-wing',
        'tech-target'
      );

      if (hintMap.has(i)) {
        const type = hintMap.get(i);
        if (type === 'primary') cellEl.classList.add('tech-primary');
        else if (type === 'pivot') cellEl.classList.add('tech-pivot');
        else if (type === 'wing') cellEl.classList.add('tech-wing');
        else if (type === 'target') cellEl.classList.add('tech-target');
      }

      if (i === this.selectedCell) {
        cellEl.classList.add('selected');
      } else if (this.selectedCell !== null) {
        const r = Math.floor(i / 9);
        const c = i % 9;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (r === selectedRow || c === selectedCol || b === selectedBox) {
          cellEl.classList.add('highlighted');
        }
        if (selectedVal !== 0 && this.currentBoard[i] === selectedVal) {
          cellEl.classList.add('same-digit');
        }
      }
    }
  }
}
