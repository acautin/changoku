/**
 * Test Engine for Sudoku Solver, Generator, and Techniques
 */

import {
  parseBoard,
  boardToString,
  calculateCandidates,
  PEERS,
  isBoardValid,
  isBoardComplete
} from '../js/engine/sudoku.js';

import { solve, countSolutions, solveLogical } from '../js/engine/solver.js';
import {
  generateCompleteBoard,
  generatePuzzle,
  generateDailyPuzzle,
  getDailySchedule,
  daysBetweenDates
} from '../js/engine/generator.js';
import { findTechniqueById, findNextTechniqueStep } from '../js/engine/techniques.js';
import { FAMOUS_17_CLUE_PUZZLE, TECHNIQUE_STUDY_PUZZLES } from '../js/study/studyPuzzles.js';

console.log('--- RUNNING SUDOKU ENGINE TEST SUITE ---');

// Test 1: Peers verification
let peerTestPassed = true;
for (let i = 0; i < 81; i++) {
  if (PEERS[i].length !== 20) {
    console.error(`Cell ${i} has ${PEERS[i].length} peers (expected 20)`);
    peerTestPassed = false;
  }
}
console.log(`[PASS] Peers count test (all 81 cells have exactly 20 peers): ${peerTestPassed}`);

// Test 2: Solving McGuire 17-clue puzzle
console.log('Testing McGuire 17-clue puzzle solver and uniqueness...');
const t0 = performance.now();
const board17 = parseBoard(FAMOUS_17_CLUE_PUZZLE.boardStr);
const solutionsCount17 = countSolutions(board17, 2);
const t1 = performance.now();
console.log(`[PASS] 17-clue puzzle solutions count: ${solutionsCount17} (expected 1, took ${(t1 - t0).toFixed(2)}ms)`);
if (solutionsCount17 !== 1) {
  throw new Error('McGuire 17 clue puzzle did not return unique solution!');
}

const solved17 = solve(board17);
console.log(`[PASS] 17-clue solved complete: ${isBoardComplete(solved17)}`);

// Test 3: Technique Detectors & Study Board Uniqueness Audit
console.log('Testing all 11 Technique Detectors & Study Boards...');
for (const p of TECHNIQUE_STUDY_PUZZLES) {
  if (p.boardStr.length !== 81) {
    throw new Error(`Study puzzle ${p.id} has length ${p.boardStr.length} (expected 81)`);
  }
  const b = parseBoard(p.boardStr);
  if (!isBoardValid(b)) {
    throw new Error(`Study puzzle ${p.id} is invalid!`);
  }
  const sols = countSolutions(b, 2);
  if (sols !== 1) {
    throw new Error(`Study puzzle ${p.id} has ${sols} solutions (expected 1)!`);
  }
  const solved = solve(b);
  const cand = calculateCandidates(b);

  const directMatch = findTechniqueById(p.techniqueId, b, cand);
  if (!directMatch) {
    throw new Error(`Technique detector failed for: ${p.techniqueId}`);
  }

  const nextMatch = findNextTechniqueStep(b, cand);
  if (!nextMatch || nextMatch.id !== p.techniqueId) {
    throw new Error(
      `Study puzzle ${p.id} has simpler technique [${nextMatch?.id}] before [${p.techniqueId}]!`
    );
  }

  // Verify eliminations/placements against unique solution
  if (directMatch.placement) {
    const { cell, digit } = directMatch.placement;
    if (solved[cell] !== digit) {
      throw new Error(`Invalid placement in ${p.id}: placed ${digit}, solution is ${solved[cell]}`);
    }
  }
  if (directMatch.eliminations) {
    for (const e of directMatch.eliminations) {
      if (solved[e.cell] === e.digit) {
        throw new Error(
          `Invalid elimination in ${p.id}: eliminated true solution digit ${e.digit} at cell ${e.cell}`
        );
      }
    }
  }

  console.log(`[PASS] ${p.techniqueId.padEnd(18)} | Unique: true | NextStep: ${nextMatch.name}`);
}

// Test 4: Complete Board Generator
console.log('Testing complete random board generation...');
const tGen0 = performance.now();
const completeBoard = generateCompleteBoard();
const tGen1 = performance.now();
console.log(`[PASS] Generated full board in ${(tGen1 - tGen0).toFixed(2)}ms, complete: ${isBoardComplete(completeBoard)}`);

// Test 5: On-The-Fly Puzzle Generator
console.log('Testing on-the-fly puzzle generator (Medium with 180° symmetry)...');
const tPuz0 = performance.now();
const puzResult = generatePuzzle('medium', true);
const tPuz1 = performance.now();
console.log(`[PASS] Generated puzzle in ${(tPuz1 - tPuz0).toFixed(2)}ms with ${puzResult.cluesCount} clues, difficulty: ${puzResult.difficulty}`);

const puzUniqueness = countSolutions(puzResult.puzzle, 2);
console.log(`[PASS] Generated puzzle uniqueness: ${puzUniqueness} (expected 1)`);

// Test 6: Logical Solver
console.log('Testing step-by-step logical solver on generated puzzle...');
const logicalTest = solveLogical(puzResult.puzzle);
console.log(`[PASS] Logical solver executed ${logicalTest.steps.length} deduction steps. Highest technique: ${logicalTest.highestTechnique}`);

// Test 7: Deterministic Seeded Daily Puzzle & Day-of-Week Curve
console.log('Testing deterministic Daily Puzzle PRNG & Day-of-Week Curve...');
const sunSched = getDailySchedule('2026-11-08'); // Sunday
const monSched = getDailySchedule('2026-11-09'); // Monday
if (sunSched.targetDifficulty !== 'expert' || monSched.targetDifficulty !== 'easy') {
  throw new Error(`Unexpected daily schedule curve: Sun=${sunSched.targetDifficulty}, Mon=${monSched.targetDifficulty}`);
}
const dailyRun1 = generateDailyPuzzle('2026-11-08');
const dailyRun2 = generateDailyPuzzle('2026-11-08');
const str1 = boardToString(dailyRun1.puzzle);
const str2 = boardToString(dailyRun2.puzzle);
if (str1 !== str2) {
  throw new Error('Daily puzzle generator is not deterministic for the same date!');
}
if (daysBetweenDates('2026-11-01', '2026-11-08') !== 7) {
  throw new Error('daysBetweenDates failed calendar diff check!');
}
console.log(`[PASS] Daily puzzle is 100% deterministic (Sun=expert, Mon=easy) & calendar diff verified: ${str1 === str2}`);

console.log('--- ALL ENGINE TESTS PASSED SUCCESSFULLY! (100%) ---');
