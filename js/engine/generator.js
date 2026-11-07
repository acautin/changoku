/**
 * On-The-Fly Sudoku Puzzle Generator
 * Generates unique-solution Sudokus with rotational symmetry and difficulty ratings.
 */

import {
  NUM_CELLS,
  PEERS,
  ALL_CANDIDATES_MASK,
  countBits,
  isBoardValid
} from './sudoku.js';
import { countSolutions, solve, solveLogical } from './solver.js';

/**
 * Creates a deterministic Mulberry32 Pseudo-Random Number Generator from a seed string.
 * Ensures every device in the world generates the exact same Daily Puzzle for a given date.
 */
export function createSeededRandom(seedStr) {
  let h = 2166136261 >>> 0;
  const str = String(seedStr);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns local date formatted as YYYY-MM-DD.
 * Uses the modern Temporal API when available, with a safe Date fallback for older phones.
 */
export function getTodayDateString(dateObj = null) {
  if (!dateObj && typeof globalThis.Temporal !== 'undefined' && globalThis.Temporal.Now) {
    return globalThis.Temporal.Now.plainDateISO().toString();
  }
  const dt = dateObj || new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the exact number of calendar days from dateStrA to dateStrB (YYYY-MM-DD).
 * Uses Temporal.PlainDate when available, with a UTC calendar fallback.
 */
export function daysBetweenDates(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return Infinity;
  if (typeof globalThis.Temporal !== 'undefined' && globalThis.Temporal.PlainDate) {
    const a = globalThis.Temporal.PlainDate.from(dateStrA);
    const b = globalThis.Temporal.PlainDate.from(dateStrB);
    return a.until(b, { largestUnit: 'days' }).days;
  }
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
  const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
  return Math.round((utc2 - utc1) / 86400000);
}

/**
 * Maps a YYYY-MM-DD date string to the Day-of-the-Week Difficulty Curve:
 * Mon/Tue -> 'easy', Wed/Thu -> 'medium', Fri/Sat -> 'hard', Sun -> 'expert'
 */
export function getDailySchedule(dateStr = getTodayDateString()) {
  let dayOfWeek;
  if (typeof globalThis.Temporal !== 'undefined' && globalThis.Temporal.PlainDate) {
    // Temporal.PlainDate.dayOfWeek is 1 (Mon) .. 7 (Sun); normalize 7 -> 0 for Sunday
    const isoDay = globalThis.Temporal.PlainDate.from(dateStr).dayOfWeek;
    dayOfWeek = isoDay === 7 ? 0 : isoDay;
  } else {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dayOfWeek = dt.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  }
  const curve = {
    1: 'easy',
    2: 'easy',
    3: 'medium',
    4: 'medium',
    5: 'hard',
    6: 'hard',
    0: 'expert'
  };
  return {
    dateStr,
    dayOfWeek,
    targetDifficulty: curve[dayOfWeek] || 'medium'
  };
}

/**
 * Shuffles an array in place using Fisher-Yates
 */
function shuffle(array, rng = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a complete, randomly filled valid 9x9 Sudoku grid.
 */
export function generateCompleteBoard(rng = Math.random) {
  const board = new Uint8Array(81);

  function fill() {
    let bestCell = -1;
    let minCandidates = 10;
    let candidatesList = null;

    for (let i = 0; i < 81; i++) {
      if (board[i] === 0) {
        let mask = ALL_CANDIDATES_MASK;
        const peerList = PEERS[i];
        for (let p = 0; p < peerList.length; p++) {
          const val = board[peerList[p]];
          if (val !== 0) mask &= ~(1 << val);
        }
        const count = countBits(mask);
        if (count === 0) return false; // Dead end

        if (count < minCandidates) {
          minCandidates = count;
          bestCell = i;
          const digits = [];
          for (let d = 1; d <= 9; d++) {
            if ((mask & (1 << d)) !== 0) digits.push(d);
          }
          candidatesList = digits;
          if (count === 1) break;
        }
      }
    }

    if (bestCell === -1) return true; // All filled

    shuffle(candidatesList, rng);
    for (const d of candidatesList) {
      board[bestCell] = d;
      if (fill()) return true;
      board[bestCell] = 0;
    }

    return false;
  }

  fill();
  return board;
}

/**
 * Precomputes 180-degree rotationally symmetric pairs.
 * (r, c) pairs with (8 - r, 8 - c).
 */
function getSymmetricCellPairs() {
  const pairs = [];
  const visited = new Uint8Array(81);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const idx1 = r * 9 + c;
      const idx2 = (8 - r) * 9 + (8 - c);

      if (!visited[idx1]) {
        visited[idx1] = 1;
        visited[idx2] = 1;
        pairs.push(idx1 === idx2 ? [idx1] : [idx1, idx2]);
      }
    }
  }
  return pairs;
}

/**
 * Generate a puzzle on the fly with guaranteed unique solution.
 * @param {string} targetDifficulty - 'easy', 'medium', 'hard', 'expert'
 * @param {boolean} symmetric - enforce 180-degree rotational symmetry
 * @param {function} rng - random number generator function returning [0, 1)
 */
export function generatePuzzle(targetDifficulty = 'medium', symmetric = true, rng = Math.random) {
  const targetConfig = {
    easy: { minClues: 36, maxClues: 40, minWeight: 10, maxWeight: 20, maxAttempts: 4 },
    medium: { minClues: 30, maxClues: 34, minWeight: 20, maxWeight: 55, maxAttempts: 6 },
    hard: { minClues: 26, maxClues: 29, minWeight: 35, maxWeight: 85, maxAttempts: 8 },
    expert: { minClues: 22, maxClues: 25, minWeight: 55, maxWeight: 150, maxAttempts: 10 }
  };

  const cfg = targetConfig[targetDifficulty] || targetConfig.medium;
  let bestCandidate = null;

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    const fullSolution = generateCompleteBoard(rng);
    const puzzle = new Uint8Array(fullSolution);

    const pairs = symmetric
      ? shuffle(getSymmetricCellPairs(), rng)
      : shuffle(Array.from({ length: 81 }, (_, i) => [i]), rng);

    let currentClues = 81;

    for (const pair of pairs) {
      if (currentClues <= cfg.minClues) break;

      const [c1, c2] = pair;
      const v1 = puzzle[c1];
      const v2 = c2 !== undefined ? puzzle[c2] : null;

      puzzle[c1] = 0;
      if (v2 !== null) puzzle[c2] = 0;

      // Check if solution is still strictly unique
      if (countSolutions(puzzle, 2) === 1) {
        currentClues -= (v2 !== null ? 2 : 1);
        if (currentClues <= cfg.maxClues && currentClues <= cfg.minClues + 2 && rng() > 0.6) {
          break;
        }
      } else {
        // Rollback
        puzzle[c1] = v1;
        if (v2 !== null) puzzle[c2] = v2;
      }
    }

    // Evaluate logical difficulty
    const analysis = solveLogical(puzzle);
    const candidate = {
      puzzle,
      solution: fullSolution,
      cluesCount: currentClues,
      difficulty: analysis.difficulty,
      highestTechnique: analysis.highestTechnique,
      maxTechniqueWeight: analysis.maxTechniqueWeight,
      stepsCount: analysis.steps.length
    };

    if (
      !bestCandidate ||
      Math.abs(candidate.maxTechniqueWeight - cfg.minWeight) <
        Math.abs(bestCandidate.maxTechniqueWeight - cfg.minWeight)
    ) {
      bestCandidate = candidate;
    }

    if (
      candidate.maxTechniqueWeight >= cfg.minWeight &&
      candidate.maxTechniqueWeight <= cfg.maxWeight &&
      (!analysis.stuck || targetDifficulty === 'expert')
    ) {
      return candidate;
    }
  }

  return bestCandidate;
}

/**
 * Generates the deterministic Daily Changoku puzzle for a given YYYY-MM-DD date string.
 * Every player on any device gets the exact same board and day-of-the-week difficulty!
 */
export function generateDailyPuzzle(dateStr = getTodayDateString()) {
  const schedule = getDailySchedule(dateStr);
  const rng = createSeededRandom(`changoku-daily-v1-${schedule.dateStr}`);
  const gen = generatePuzzle(schedule.targetDifficulty, true, rng);
  return {
    ...gen,
    dateStr: schedule.dateStr,
    dayOfWeek: schedule.dayOfWeek,
    targetDifficulty: schedule.targetDifficulty
  };
}
