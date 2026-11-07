/**
 * Sudoku Solver Engine
 * 1. Fast MRV Backtracking Solver (finding solutions and counting uniqueness)
 * 2. Logical Step-by-Step Solver (grading difficulty and generating hints)
 */

import {
  SIZE,
  NUM_CELLS,
  PEERS,
  ALL_CANDIDATES_MASK,
  calculateCandidates,
  countBits,
  maskToDigits,
  isValidPlacement,
  isBoardValid
} from './sudoku.js';
import { findNextTechniqueStep } from './techniques.js';

/**
 * Fast backtracking solver using Minimum Remaining Values (MRV) heuristic.
 * Returns a solved Uint8Array board or null if no solution exists.
 */
export function solve(board) {
  const current = new Uint8Array(board);
  if (!isBoardValid(current)) return null;

  const solved = new Uint8Array(81);
  let found = false;

  function backtrack() {
    let bestCell = -1;
    let minCandidates = 10;
    let bestMask = 0;

    for (let i = 0; i < 81; i++) {
      if (current[i] === 0) {
        let mask = ALL_CANDIDATES_MASK;
        const peerList = PEERS[i];
        for (let p = 0; p < peerList.length; p++) {
          const val = current[peerList[p]];
          if (val !== 0) {
            mask &= ~(1 << val);
          }
        }
        const count = countBits(mask);
        if (count === 0) {
          // Dead end
          return false;
        }
        if (count < minCandidates) {
          minCandidates = count;
          bestCell = i;
          bestMask = mask;
          if (count === 1) break; // Cannot get better than 1
        }
      }
    }

    if (bestCell === -1) {
      // All cells filled
      solved.set(current);
      found = true;
      return true;
    }

    // Try candidates for bestCell
    for (let d = 1; d <= 9; d++) {
      if ((bestMask & (1 << d)) !== 0) {
        current[bestCell] = d;
        if (backtrack()) return true;
        current[bestCell] = 0;
      }
    }

    return false;
  }

  backtrack();
  return found ? solved : null;
}

/**
 * Count solutions up to `limit` (default: 2).
 * Used for uniqueness check: returns 0 (unsolvable), 1 (unique), or 2 (multiple).
 */
export function countSolutions(board, limit = 2) {
  const current = new Uint8Array(board);
  if (!isBoardValid(current)) return 0;

  let solutionCount = 0;

  function backtrack() {
    if (solutionCount >= limit) return;

    let bestCell = -1;
    let minCandidates = 10;
    let bestMask = 0;

    for (let i = 0; i < 81; i++) {
      if (current[i] === 0) {
        let mask = ALL_CANDIDATES_MASK;
        const peerList = PEERS[i];
        for (let p = 0; p < peerList.length; p++) {
          const val = current[peerList[p]];
          if (val !== 0) {
            mask &= ~(1 << val);
          }
        }
        const count = countBits(mask);
        if (count === 0) {
          return;
        }
        if (count < minCandidates) {
          minCandidates = count;
          bestCell = i;
          bestMask = mask;
          if (count === 1) break;
        }
      }
    }

    if (bestCell === -1) {
      solutionCount++;
      return;
    }

    for (let d = 1; d <= 9; d++) {
      if ((bestMask & (1 << d)) !== 0) {
        current[bestCell] = d;
        backtrack();
        current[bestCell] = 0;
        if (solutionCount >= limit) return;
      }
    }
  }

  backtrack();
  return solutionCount;
}

/**
 * Difficulty rating weights based on the highest technique needed
 */
export const DIFFICULTY_LEVELS = {
  VERY_EASY: { name: 'Very Easy', maxRating: 10 },
  EASY: { name: 'Easy', maxRating: 25 },
  MEDIUM: { name: 'Medium', maxRating: 55 },
  HARD: { name: 'Hard', maxRating: 80 },
  EXPERT: { name: 'Expert / Master', maxRating: 120 }
};

/**
 * Solve board step-by-step using human logic techniques.
 * Preserves candidate eliminations across steps instead of resetting them on placements.
 * Returns { success, steps, difficulty, highestTechnique, stuck }
 */
export function solveLogical(initialBoard, initialCandidates = null) {
  const board = new Uint8Array(initialBoard);
  const baseCandidates = calculateCandidates(board);
  const candidates = new Uint16Array(81);

  for (let i = 0; i < 81; i++) {
    if (initialCandidates && initialCandidates[i] !== undefined) {
      // Intersect with valid base candidates so invalid pencil marks don't break solver
      candidates[i] = baseCandidates[i] & initialCandidates[i];
    } else {
      candidates[i] = baseCandidates[i];
    }
  }

  const steps = [];
  let maxTechniqueWeight = 0;
  let highestTechnique = 'Naked Single';

  const maxSteps = 250; // Safeguard against infinite loops
  let stepCount = 0;

  while (stepCount < maxSteps) {
    stepCount++;

    // Check if board is complete
    let filledCount = 0;
    for (let i = 0; i < 81; i++) {
      if (board[i] !== 0) filledCount++;
    }
    if (filledCount === 81) {
      return {
        success: true,
        steps,
        difficulty: getDifficultyFromWeight(maxTechniqueWeight),
        highestTechnique,
        maxTechniqueWeight,
        stuck: false
      };
    }

    // Find the simplest logical technique applicable
    const step = findNextTechniqueStep(board, candidates);
    if (!step) {
      // Stuck: human techniques exhausted (requires trial and error / bifurcation)
      return {
        success: false,
        steps,
        difficulty: 'Extreme (Bifurcation Required)',
        highestTechnique: 'Trial & Error / Advanced Chaining',
        maxTechniqueWeight: 150,
        stuck: true
      };
    }

    // Record step
    steps.push(step);
    if (step.weight > maxTechniqueWeight) {
      maxTechniqueWeight = step.weight;
      highestTechnique = step.name;
    }

    // Apply the step while preserving prior candidate eliminations
    if (step.placement) {
      const { cell, digit } = step.placement;
      board[cell] = digit;
      candidates[cell] = 0;
      const clearMask = ~(1 << digit);
      const peerList = PEERS[cell];
      for (let p = 0; p < peerList.length; p++) {
        candidates[peerList[p]] &= clearMask;
      }
    } else if (step.eliminations && step.eliminations.length > 0) {
      for (const elim of step.eliminations) {
        candidates[elim.cell] &= ~(1 << elim.digit);
      }
    }
  }

  return {
    success: false,
    steps,
    difficulty: 'Unresolved',
    highestTechnique,
    maxTechniqueWeight,
    stuck: true
  };
}

export function getDifficultyFromWeight(weight) {
  if (weight <= 10) return 'Very Easy';
  if (weight <= 25) return 'Easy';
  if (weight <= 55) return 'Medium';
  if (weight <= 85) return 'Hard';
  return 'Expert / Master';
}
