/**
 * Sudoku Techniques Engine
 * Implements logical pattern detection, visual highlights, candidate eliminations,
 * and step-by-step human explanations.
 */

import {
  SIZE,
  ROW_CELLS,
  COL_CELLS,
  BOX_CELLS,
  ALL_UNITS,
  PEERS,
  countBits,
  maskToDigits,
  digitToMask,
  indexToCoord,
  coordToIndex
} from './sudoku.js';

/**
 * Technique definition catalog with descriptions, difficulty, and examples
 */
export const TECHNIQUE_CATALOG = {
  naked_single: {
    id: 'naked_single',
    name: 'Naked Single',
    category: 'Basic',
    difficulty: 'Very Easy',
    weight: 10,
    summary: 'A cell has only one possible candidate remaining because all other 8 digits appear in its row, column, or 3x3 box.',
    rule: 'If a cell has exactly one candidate digit, that digit MUST be placed in this cell.'
  },
  hidden_single: {
    id: 'hidden_single',
    name: 'Hidden Single',
    category: 'Basic',
    difficulty: 'Easy',
    weight: 20,
    summary: 'A candidate appears in only one cell within a specific row, column, or 3x3 box, even though that cell may hold other candidates.',
    rule: 'If a digit has only one legal cell inside a house (row/col/box), it must be placed there.'
  },
  pointing_pair: {
    id: 'pointing_pair',
    name: 'Pointing Pairs / Triples',
    category: 'Intersections',
    difficulty: 'Medium',
    weight: 35,
    summary: 'Inside a 3x3 box, a candidate is confined entirely to one row or column.',
    rule: 'Because the candidate must be placed in that box and row/col, it cannot appear anywhere else along that entire row or column outside the box.'
  },
  box_line_reduction: {
    id: 'box_line_reduction',
    name: 'Box-Line Reduction (Claiming)',
    category: 'Intersections',
    difficulty: 'Medium',
    weight: 40,
    summary: 'Inside a row or column, a candidate appears only within one 3x3 box.',
    rule: 'Because that candidate must exist in that row/col, it claims that digit for that box. It can be eliminated from all other cells in that 3x3 box.'
  },
  naked_pair: {
    id: 'naked_pair',
    name: 'Naked Pair',
    category: 'Subsets',
    difficulty: 'Medium',
    weight: 45,
    summary: 'Two cells in the same house contain the exact same two candidates {A, B} and no others.',
    rule: 'Those two digits must occupy those two cells, so {A, B} can be eliminated from all other cells in that house.'
  },
  hidden_pair: {
    id: 'hidden_pair',
    name: 'Hidden Pair',
    category: 'Subsets',
    difficulty: 'Medium',
    weight: 55,
    summary: 'Two candidates {A, B} appear in only two cells within a house, alongside other candidates.',
    rule: 'Because A and B must go in these two cells, all other candidates in those two cells can be safely removed.'
  },
  naked_triple: {
    id: 'naked_triple',
    name: 'Naked Triple',
    category: 'Subsets',
    difficulty: 'Hard',
    weight: 65,
    summary: 'Three cells in a house share candidates drawn from a set of three digits {A, B, C} (e.g. AB, BC, AC or ABC).',
    rule: 'These three digits are locked inside these three cells. Eliminate A, B, and C from all other cells in that house.'
  },
  hidden_triple: {
    id: 'hidden_triple',
    name: 'Hidden Triple',
    category: 'Subsets',
    difficulty: 'Hard',
    weight: 70,
    summary: 'Three digits {A, B, C} only appear within three cells of a house.',
    rule: 'Any other candidate digits residing in those three cells can be eliminated.'
  },
  x_wing: {
    id: 'x_wing',
    name: 'X-Wing',
    category: 'Fish',
    difficulty: 'Hard',
    weight: 75,
    summary: 'A candidate appears exactly twice in two different rows, and both pairs align in the exact same two columns (forming a rectangle).',
    rule: 'The candidate must be at opposite corners of the rectangle. Therefore, eliminate that candidate from all other cells in those two columns (and vice versa for column-based X-Wings).'
  },
  swordfish: {
    id: 'swordfish',
    name: 'Swordfish',
    category: 'Fish',
    difficulty: 'Master',
    weight: 95,
    summary: 'A 3x3 generalization of X-Wing: across 3 rows, a candidate is confined to subsets of the same 3 columns (or 3 columns confined to 3 rows).',
    rule: 'Eliminate that candidate from all other cells in those 3 cover lines.'
  },
  xy_wing: {
    id: 'xy_wing',
    name: 'XY-Wing (Y-Wing)',
    category: 'Wings',
    difficulty: 'Master',
    weight: 100,
    summary: 'A bivalue pivot cell {A, B} shares units with two bivalue wings {A, C} and {B, C} that do not see each other.',
    rule: 'Whichever value the pivot takes, one of the wings must be C. Therefore, any cell that sees BOTH wings cannot contain C.'
  }
};

/**
 * Helper to deduplicate highlight cells while preserving highest priority type
 */
function uniqueHighlights(list) {
  const map = new Map();
  for (const item of list) {
    if (!map.has(item.cell)) {
      map.set(item.cell, item);
    }
  }
  return Array.from(map.values());
}

/**
 * Scan the board and find the lowest-difficulty applicable technique step.
 */
export function findNextTechniqueStep(board, candidates) {
  const detectors = [
    findNakedSingle,
    findHiddenSingle,
    findPointing,
    findBoxLineReduction,
    findNakedPair,
    findHiddenPair,
    findNakedTriple,
    findHiddenTriple,
    findXWing,
    findSwordfish,
    findXYWing
  ];

  for (const detector of detectors) {
    const step = detector(board, candidates);
    if (step) return step;
  }
  return null;
}

/**
 * Execute a specific technique detector by its ID
 */
export function findTechniqueById(id, board, candidates) {
  switch (id) {
    case 'naked_single':
      return findNakedSingle(board, candidates);
    case 'hidden_single':
      return findHiddenSingle(board, candidates);
    case 'pointing_pair':
      return findPointing(board, candidates);
    case 'box_line_reduction':
      return findBoxLineReduction(board, candidates);
    case 'naked_pair':
      return findNakedPair(board, candidates);
    case 'hidden_pair':
      return findHiddenPair(board, candidates);
    case 'naked_triple':
      return findNakedTriple(board, candidates);
    case 'hidden_triple':
      return findHiddenTriple(board, candidates);
    case 'x_wing':
      return findXWing(board, candidates);
    case 'swordfish':
      return findSwordfish(board, candidates);
    case 'xy_wing':
      return findXYWing(board, candidates);
    default:
      return null;
  }
}

// -------------------------------------------------------------
// Technique Detectors
// -------------------------------------------------------------

export function findNakedSingle(board, candidates) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0 && countBits(candidates[i]) === 1) {
      const digit = maskToDigits(candidates[i])[0];
      const { row, col } = indexToCoord(i);
      return {
        id: 'naked_single',
        name: 'Naked Single',
        weight: 10,
        placement: { cell: i, digit },
        highlightCells: [{ cell: i, type: 'primary' }],
        highlightCandidates: [{ cell: i, digit }],
        eliminations: [],
        description: `Cell R${row + 1}C${col + 1} has only one candidate remaining: [${digit}]. It must be placed here.`
      };
    }
  }
  return null;
}

export function findHiddenSingle(board, candidates) {
  for (const unit of ALL_UNITS) {
    for (let d = 1; d <= 9; d++) {
      const mask = 1 << d;
      let count = 0;
      let lastCell = -1;

      for (const cell of unit.cells) {
        if (board[cell] === d) {
          count = 0;
          break; // Already placed in unit
        }
        if (board[cell] === 0 && (candidates[cell] & mask) !== 0) {
          count++;
          lastCell = cell;
        }
      }

      if (count === 1) {
        const { row, col } = indexToCoord(lastCell);
        return {
          id: 'hidden_single',
          name: 'Hidden Single',
          weight: 20,
          placement: { cell: lastCell, digit: d },
          highlightCells: [
            { cell: lastCell, type: 'primary' },
            ...unit.cells.filter(c => c !== lastCell).map(c => ({ cell: c, type: 'target' }))
          ],
          highlightCandidates: [{ cell: lastCell, digit: d }],
          eliminations: [],
          description: `In ${unit.type} ${unit.index + 1}, digit [${d}] can only fit in cell R${row + 1}C${col + 1}.`
        };
      }
    }
  }
  return null;
}

export function findPointing(board, candidates) {
  // Candidate in a box is confined to a single row or column
  for (let b = 0; b < 9; b++) {
    const boxCells = BOX_CELLS[b];
    for (let d = 1; d <= 9; d++) {
      const mask = 1 << d;
      const matchingCells = boxCells.filter(c => board[c] === 0 && (candidates[c] & mask) !== 0);
      if (matchingCells.length >= 2 && matchingCells.length <= 3) {
        const rows = new Set(matchingCells.map(c => Math.floor(c / 9)));
        const cols = new Set(matchingCells.map(c => c % 9));

        if (rows.size === 1) {
          const row = Array.from(rows)[0];
          const eliminations = [];
          for (const cell of ROW_CELLS[row]) {
            if (!boxCells.includes(cell) && board[cell] === 0 && (candidates[cell] & mask) !== 0) {
              eliminations.push({ cell, digit: d });
            }
          }
          if (eliminations.length > 0) {
            return {
              id: 'pointing_pair',
              name: 'Pointing Candidates',
              weight: 35,
              placement: null,
              highlightCells: uniqueHighlights([
                ...matchingCells.map(c => ({ cell: c, type: 'primary' })),
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates: matchingCells.map(c => ({ cell: c, digit: d })),
              eliminations,
              description: `In Box ${b + 1}, digit [${d}] is confined to Row ${row + 1}. Therefore, [${d}] can be eliminated from all other cells in Row ${row + 1}.`
            };
          }
        }

        if (cols.size === 1) {
          const col = Array.from(cols)[0];
          const eliminations = [];
          for (const cell of COL_CELLS[col]) {
            if (!boxCells.includes(cell) && board[cell] === 0 && (candidates[cell] & mask) !== 0) {
              eliminations.push({ cell, digit: d });
            }
          }
          if (eliminations.length > 0) {
            return {
              id: 'pointing_pair',
              name: 'Pointing Candidates',
              weight: 35,
              placement: null,
              highlightCells: uniqueHighlights([
                ...matchingCells.map(c => ({ cell: c, type: 'primary' })),
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates: matchingCells.map(c => ({ cell: c, digit: d })),
              eliminations,
              description: `In Box ${b + 1}, digit [${d}] is confined to Column ${col + 1}. Therefore, [${d}] can be eliminated from all other cells in Column ${col + 1}.`
            };
          }
        }
      }
    }
  }
  return null;
}

export function findBoxLineReduction(board, candidates) {
  // In a row or column, a candidate appears only within one box
  const lines = [
    ...ROW_CELLS.map((cells, i) => ({ type: 'row', index: i, cells })),
    ...COL_CELLS.map((cells, i) => ({ type: 'col', index: i, cells }))
  ];

  for (const line of lines) {
    for (let d = 1; d <= 9; d++) {
      const mask = 1 << d;
      const matchingCells = line.cells.filter(c => board[c] === 0 && (candidates[c] & mask) !== 0);
      if (matchingCells.length >= 2 && matchingCells.length <= 3) {
        const boxes = new Set(matchingCells.map(c => {
          const r = Math.floor(c / 9);
          const col = c % 9;
          return Math.floor(r / 3) * 3 + Math.floor(col / 3);
        }));

        if (boxes.size === 1) {
          const box = Array.from(boxes)[0];
          const eliminations = [];
          for (const cell of BOX_CELLS[box]) {
            if (!line.cells.includes(cell) && board[cell] === 0 && (candidates[cell] & mask) !== 0) {
              eliminations.push({ cell, digit: d });
            }
          }
          if (eliminations.length > 0) {
            return {
              id: 'box_line_reduction',
              name: 'Box-Line Reduction (Claiming)',
              weight: 40,
              placement: null,
              highlightCells: uniqueHighlights([
                ...matchingCells.map(c => ({ cell: c, type: 'primary' })),
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates: matchingCells.map(c => ({ cell: c, digit: d })),
              eliminations,
              description: `In ${line.type} ${line.index + 1}, digit [${d}] is confined to Box ${box + 1}. It can be eliminated from the rest of Box ${box + 1}.`
            };
          }
        }
      }
    }
  }
  return null;
}

export function findNakedPair(board, candidates) {
  for (const unit of ALL_UNITS) {
    const emptyCells = unit.cells.filter(c => board[c] === 0 && countBits(candidates[c]) === 2);
    for (let i = 0; i < emptyCells.length; i++) {
      for (let j = i + 1; j < emptyCells.length; j++) {
        const c1 = emptyCells[i];
        const c2 = emptyCells[j];
        if (candidates[c1] === candidates[c2]) {
          const digits = maskToDigits(candidates[c1]);
          const eliminations = [];

          for (const cell of unit.cells) {
            if (cell !== c1 && cell !== c2 && board[cell] === 0) {
              for (const d of digits) {
                if ((candidates[cell] & (1 << d)) !== 0) {
                  eliminations.push({ cell, digit: d });
                }
              }
            }
          }

          if (eliminations.length > 0) {
            const coord1 = indexToCoord(c1);
            const coord2 = indexToCoord(c2);
            const highlightCandidates = [];
            for (const c of [c1, c2]) {
              for (const d of digits) highlightCandidates.push({ cell: c, digit: d });
            }
            return {
              id: 'naked_pair',
              name: 'Naked Pair',
              weight: 45,
              placement: null,
              highlightCells: uniqueHighlights([
                { cell: c1, type: 'primary' },
                { cell: c2, type: 'primary' },
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates,
              eliminations,
              description: `Cells R${coord1.row + 1}C${coord1.col + 1} and R${coord2.row + 1}C${coord2.col + 1} in ${unit.type} ${unit.index + 1} both contain only [${digits.join(', ')}]. Those digits can be eliminated from all other cells in that ${unit.type}.`
            };
          }
        }
      }
    }
  }
  return null;
}

export function findHiddenPair(board, candidates) {
  for (const unit of ALL_UNITS) {
    const digitCells = Array.from({ length: 10 }, () => []);
    for (const cell of unit.cells) {
      if (board[cell] === 0) {
        for (const d of maskToDigits(candidates[cell])) {
          digitCells[d].push(cell);
        }
      }
    }

    for (let d1 = 1; d1 <= 8; d1++) {
      if (digitCells[d1].length !== 2) continue;
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        if (digitCells[d2].length !== 2) continue;

        const cells1 = digitCells[d1];
        const cells2 = digitCells[d2];
        if (cells1[0] === cells2[0] && cells1[1] === cells2[1]) {
          const c1 = cells1[0];
          const c2 = cells1[1];
          const eliminations = [];

          for (const d of maskToDigits(candidates[c1])) {
            if (d !== d1 && d !== d2) eliminations.push({ cell: c1, digit: d });
          }
          for (const d of maskToDigits(candidates[c2])) {
            if (d !== d1 && d !== d2) eliminations.push({ cell: c2, digit: d });
          }

          if (eliminations.length > 0) {
            const coord1 = indexToCoord(c1);
            const coord2 = indexToCoord(c2);
            return {
              id: 'hidden_pair',
              name: 'Hidden Pair',
              weight: 55,
              placement: null,
              highlightCells: [
                { cell: c1, type: 'primary' },
                { cell: c2, type: 'primary' }
              ],
              highlightCandidates: [
                { cell: c1, digit: d1 },
                { cell: c1, digit: d2 },
                { cell: c2, digit: d1 },
                { cell: c2, digit: d2 }
              ],
              eliminations,
              description: `In ${unit.type} ${unit.index + 1}, digits [${d1}, ${d2}] appear only in R${coord1.row + 1}C${coord1.col + 1} and R${coord2.row + 1}C${coord2.col + 1}. All other candidates in these two cells can be eliminated.`
            };
          }
        }
      }
    }
  }
  return null;
}

export function findNakedTriple(board, candidates) {
  for (const unit of ALL_UNITS) {
    const emptyCells = unit.cells.filter(c => board[c] === 0 && countBits(candidates[c]) >= 2 && countBits(candidates[c]) <= 3);
    if (emptyCells.length < 3) continue;

    for (let i = 0; i < emptyCells.length - 2; i++) {
      for (let j = i + 1; j < emptyCells.length - 1; j++) {
        for (let k = j + 1; k < emptyCells.length; k++) {
          const c1 = emptyCells[i];
          const c2 = emptyCells[j];
          const c3 = emptyCells[k];

          // Exclude degenerate Naked Pairs inside the triple
          if (
            countBits(candidates[c1] | candidates[c2]) <= 2 ||
            countBits(candidates[c1] | candidates[c3]) <= 2 ||
            countBits(candidates[c2] | candidates[c3]) <= 2
          ) {
            continue;
          }

          const combinedMask = candidates[c1] | candidates[c2] | candidates[c3];

          if (countBits(combinedMask) === 3) {
            const digits = maskToDigits(combinedMask);
            const eliminations = [];

            for (const cell of unit.cells) {
              if (cell !== c1 && cell !== c2 && cell !== c3 && board[cell] === 0) {
                for (const d of digits) {
                  if ((candidates[cell] & (1 << d)) !== 0) {
                    eliminations.push({ cell, digit: d });
                  }
                }
              }
            }

            if (eliminations.length > 0) {
              const coords = [c1, c2, c3].map(c => {
                const { row, col } = indexToCoord(c);
                return `R${row + 1}C${col + 1}`;
              });
              const highlightCandidates = [];
              for (const c of [c1, c2, c3]) {
                for (const d of digits) {
                  if ((candidates[c] & (1 << d)) !== 0) {
                    highlightCandidates.push({ cell: c, digit: d });
                  }
                }
              }
              return {
                id: 'naked_triple',
                name: 'Naked Triple',
                weight: 65,
                placement: null,
                highlightCells: uniqueHighlights([
                  { cell: c1, type: 'primary' },
                  { cell: c2, type: 'primary' },
                  { cell: c3, type: 'primary' },
                  ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
                ]),
                highlightCandidates,
                eliminations,
                description: `Cells ${coords.join(', ')} in ${unit.type} ${unit.index + 1} form a Naked Triple on digits [${digits.join(', ')}]. Eliminating [${digits.join(', ')}] from other cells in that ${unit.type}.`
              };
            }
          }
        }
      }
    }
  }
  return null;
}

export function findHiddenTriple(board, candidates) {
  for (const unit of ALL_UNITS) {
    const digitCells = Array.from({ length: 10 }, () => []);
    for (const cell of unit.cells) {
      if (board[cell] === 0) {
        for (const d of maskToDigits(candidates[cell])) {
          digitCells[d].push(cell);
        }
      }
    }

    for (let d1 = 1; d1 <= 7; d1++) {
      if (digitCells[d1].length < 2 || digitCells[d1].length > 3) continue;
      for (let d2 = d1 + 1; d2 <= 8; d2++) {
        if (digitCells[d2].length < 2 || digitCells[d2].length > 3) continue;
        for (let d3 = d2 + 1; d3 <= 9; d3++) {
          if (digitCells[d3].length < 2 || digitCells[d3].length > 3) continue;

          // Exclude degenerate Hidden Pairs
          if (
            new Set([...digitCells[d1], ...digitCells[d2]]).size <= 2 ||
            new Set([...digitCells[d1], ...digitCells[d3]]).size <= 2 ||
            new Set([...digitCells[d2], ...digitCells[d3]]).size <= 2
          ) {
            continue;
          }

          const cellSet = new Set([...digitCells[d1], ...digitCells[d2], ...digitCells[d3]]);
          if (cellSet.size === 3) {
            const tripleCells = Array.from(cellSet).sort((a, b) => a - b);
            const eliminations = [];
            const highlightCandidates = [];

            for (const cell of tripleCells) {
              for (const d of maskToDigits(candidates[cell])) {
                if (d !== d1 && d !== d2 && d !== d3) {
                  eliminations.push({ cell, digit: d });
                } else {
                  highlightCandidates.push({ cell, digit: d });
                }
              }
            }

            if (eliminations.length > 0) {
              const coords = tripleCells.map(c => {
                const { row, col } = indexToCoord(c);
                return `R${row + 1}C${col + 1}`;
              });
              return {
                id: 'hidden_triple',
                name: 'Hidden Triple',
                weight: 70,
                placement: null,
                highlightCells: tripleCells.map(c => ({ cell: c, type: 'primary' })),
                highlightCandidates,
                eliminations,
                description: `In ${unit.type} ${unit.index + 1}, digits [${d1}, ${d2}, ${d3}] appear only in cells ${coords.join(', ')}. All other candidates in those 3 cells are eliminated.`
              };
            }
          }
        }
      }
    }
  }
  return null;
}

export function findXWing(board, candidates) {
  // Check rows
  for (let d = 1; d <= 9; d++) {
    const mask = 1 << d;
    const rowPositions = [];

    for (let r = 0; r < 9; r++) {
      const cols = [];
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c;
        if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
          cols.push(c);
        }
      }
      if (cols.length === 2) {
        rowPositions.push({ row: r, cols });
      }
    }

    for (let i = 0; i < rowPositions.length; i++) {
      for (let j = i + 1; j < rowPositions.length; j++) {
        const r1 = rowPositions[i];
        const r2 = rowPositions[j];
        if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
          const c1 = r1.cols[0];
          const c2 = r1.cols[1];
          const eliminations = [];

          for (let r = 0; r < 9; r++) {
            if (r !== r1.row && r !== r2.row) {
              const idx1 = r * 9 + c1;
              const idx2 = r * 9 + c2;
              if (board[idx1] === 0 && (candidates[idx1] & mask) !== 0) {
                eliminations.push({ cell: idx1, digit: d });
              }
              if (board[idx2] === 0 && (candidates[idx2] & mask) !== 0) {
                eliminations.push({ cell: idx2, digit: d });
              }
            }
          }

          if (eliminations.length > 0) {
            const baseCells = [
              r1.row * 9 + c1,
              r1.row * 9 + c2,
              r2.row * 9 + c1,
              r2.row * 9 + c2
            ];
            return {
              id: 'x_wing',
              name: 'X-Wing (Row-based)',
              weight: 75,
              placement: null,
              highlightCells: uniqueHighlights([
                ...baseCells.map(cell => ({ cell, type: 'primary' })),
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates: baseCells.map(cell => ({ cell, digit: d })),
              eliminations,
              description: `Digit [${d}] forms an X-Wing in Rows ${r1.row + 1} and ${r2.row + 1} across Columns ${c1 + 1} and ${c2 + 1}. Eliminating [${d}] from all other cells in Columns ${c1 + 1} and ${c2 + 1}.`
            };
          }
        }
      }
    }
  }

  // Check columns (transposed X-Wing)
  for (let d = 1; d <= 9; d++) {
    const mask = 1 << d;
    const colPositions = [];

    for (let c = 0; c < 9; c++) {
      const rows = [];
      for (let r = 0; r < 9; r++) {
        const idx = r * 9 + c;
        if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
          rows.push(r);
        }
      }
      if (rows.length === 2) {
        colPositions.push({ col: c, rows });
      }
    }

    for (let i = 0; i < colPositions.length; i++) {
      for (let j = i + 1; j < colPositions.length; j++) {
        const c1 = colPositions[i];
        const c2 = colPositions[j];
        if (c1.rows[0] === c2.rows[0] && c1.rows[1] === c2.rows[1]) {
          const r1 = c1.rows[0];
          const r2 = c1.rows[1];
          const eliminations = [];

          for (let c = 0; c < 9; c++) {
            if (c !== c1.col && c !== c2.col) {
              const idx1 = r1 * 9 + c;
              const idx2 = r2 * 9 + c;
              if (board[idx1] === 0 && (candidates[idx1] & mask) !== 0) {
                eliminations.push({ cell: idx1, digit: d });
              }
              if (board[idx2] === 0 && (candidates[idx2] & mask) !== 0) {
                eliminations.push({ cell: idx2, digit: d });
              }
            }
          }

          if (eliminations.length > 0) {
            const baseCells = [
              r1 * 9 + c1.col,
              r2 * 9 + c1.col,
              r1 * 9 + c2.col,
              r2 * 9 + c2.col
            ];
            return {
              id: 'x_wing',
              name: 'X-Wing (Column-based)',
              weight: 75,
              placement: null,
              highlightCells: uniqueHighlights([
                ...baseCells.map(cell => ({ cell, type: 'primary' })),
                ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
              ]),
              highlightCandidates: baseCells.map(cell => ({ cell, digit: d })),
              eliminations,
              description: `Digit [${d}] forms an X-Wing in Columns ${c1.col + 1} and ${c2.col + 1} across Rows ${r1 + 1} and ${r2 + 1}. Eliminating [${d}] from all other cells in Rows ${r1 + 1} and ${r2 + 1}.`
            };
          }
        }
      }
    }
  }

  return null;
}

export function findXYWing(board, candidates) {
  // Find all bivalue cells
  const bivalueCells = [];
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0 && countBits(candidates[i]) === 2) {
      bivalueCells.push({ cell: i, digits: maskToDigits(candidates[i]) });
    }
  }

  // Iterate over potential pivot cells
  for (let p = 0; p < bivalueCells.length; p++) {
    const pivot = bivalueCells[p];
    const [A, B] = pivot.digits;
    const pivotPeers = new Set(PEERS[pivot.cell]);

    // Wings must be peers of pivot with candidates {A, C} and {B, C}
    const wing1Candidates = [];
    const wing2Candidates = [];

    for (let w = 0; w < bivalueCells.length; w++) {
      if (w === p) continue;
      const wing = bivalueCells[w];
      if (!pivotPeers.has(wing.cell)) continue;

      const [x, y] = wing.digits;
      // Wing 1 contains A and some C (C !== B)
      if (x === A && y !== B) wing1Candidates.push({ ...wing, C: y });
      else if (y === A && x !== B) wing1Candidates.push({ ...wing, C: x });

      // Wing 2 contains B and some C (C !== A)
      if (x === B && y !== A) wing2Candidates.push({ ...wing, C: y });
      else if (y === B && x !== A) wing2Candidates.push({ ...wing, C: x });
    }

    for (const w1 of wing1Candidates) {
      const w1Peers = new Set(PEERS[w1.cell]);
      for (const w2 of wing2Candidates) {
        if (w1.cell === w2.cell) continue;
        if (w1.C !== w2.C) continue; // Must share the same C
        // Crucial: In a true XY-Wing, the two wings do not see each other
        // (otherwise pivot + w1 + w2 in the same house would just be a Naked Triple)
        if (w1Peers.has(w2.cell)) continue;

        const C = w1.C;
        const w2Peers = new Set(PEERS[w2.cell]);
        const eliminations = [];

        for (let target = 0; target < 81; target++) {
          if (
            target !== pivot.cell &&
            target !== w1.cell &&
            target !== w2.cell &&
            board[target] === 0 &&
            w1Peers.has(target) &&
            w2Peers.has(target)
          ) {
            if ((candidates[target] & (1 << C)) !== 0) {
              eliminations.push({ cell: target, digit: C });
            }
          }
        }

        if (eliminations.length > 0) {
          const pCoord = indexToCoord(pivot.cell);
          const w1Coord = indexToCoord(w1.cell);
          const w2Coord = indexToCoord(w2.cell);
          return {
            id: 'xy_wing',
            name: 'XY-Wing (Y-Wing)',
            weight: 100,
            placement: null,
            highlightCells: uniqueHighlights([
              { cell: pivot.cell, type: 'pivot' },
              { cell: w1.cell, type: 'wing' },
              { cell: w2.cell, type: 'wing' },
              ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
            ]),
            highlightCandidates: [
              { cell: pivot.cell, digit: A },
              { cell: pivot.cell, digit: B },
              { cell: w1.cell, digit: A },
              { cell: w1.cell, digit: C },
              { cell: w2.cell, digit: B },
              { cell: w2.cell, digit: C }
            ],
            eliminations,
            description: `Pivot cell R${pCoord.row + 1}C${pCoord.col + 1} [${A}, ${B}] links Wing 1 R${w1Coord.row + 1}C${w1Coord.col + 1} [${A}, ${C}] and Wing 2 R${w2Coord.row + 1}C${w2Coord.col + 1} [${B}, ${C}]. Regardless of the pivot's value, one wing must be [${C}], so any cell seeing both wings cannot contain [${C}].`
          };
        }
      }
    }
  }

  return null;
}

export function findSwordfish(board, candidates) {
  // 1. Row-based Swordfish: 3 rows where digit d appears in subsets of the same 3 columns
  for (let d = 1; d <= 9; d++) {
    const mask = 1 << d;
    const rowPositions = [];

    for (let r = 0; r < 9; r++) {
      const cols = [];
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c;
        if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
          cols.push(c);
        }
      }
      if (cols.length >= 2 && cols.length <= 3) {
        rowPositions.push({ row: r, cols });
      }
    }

    if (rowPositions.length >= 3) {
      for (let i = 0; i < rowPositions.length - 2; i++) {
        for (let j = i + 1; j < rowPositions.length - 1; j++) {
          for (let k = j + 1; k < rowPositions.length; k++) {
            const r1 = rowPositions[i];
            const r2 = rowPositions[j];
            const r3 = rowPositions[k];

            // Exclude degenerate X-Wings (any 2 rows confined to just 2 columns)
            if (
              new Set([...r1.cols, ...r2.cols]).size <= 2 ||
              new Set([...r1.cols, ...r3.cols]).size <= 2 ||
              new Set([...r2.cols, ...r3.cols]).size <= 2
            ) {
              continue;
            }

            const colSet = new Set([...r1.cols, ...r2.cols, ...r3.cols]);
            if (colSet.size === 3) {
              const cols = Array.from(colSet).sort((a, b) => a - b);
              // Exclude trivial single-stack box-line reductions
              const colStacks = new Set(cols.map(c => Math.floor(c / 3)));
              if (colStacks.size === 1) continue;

              const baseRows = [r1.row, r2.row, r3.row];
              const eliminations = [];

              for (const c of cols) {
                for (let r = 0; r < 9; r++) {
                  if (!baseRows.includes(r)) {
                    const idx = r * 9 + c;
                    if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
                      eliminations.push({ cell: idx, digit: d });
                    }
                  }
                }
              }

              if (eliminations.length > 0) {
                const primaryCells = [];
                for (const r of [r1, r2, r3]) {
                  for (const c of r.cols) {
                    primaryCells.push(r.row * 9 + c);
                  }
                }
                return {
                  id: 'swordfish',
                  name: 'Swordfish (Row-based)',
                  weight: 95,
                  placement: null,
                  highlightCells: uniqueHighlights([
                    ...primaryCells.map(c => ({ cell: c, type: 'primary' })),
                    ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
                  ]),
                  highlightCandidates: primaryCells.map(cell => ({ cell, digit: d })),
                  eliminations,
                  description: `Digit [${d}] forms a Swordfish across Rows ${r1.row + 1}, ${r2.row + 1}, ${r3.row + 1} and Columns ${cols.map(c => c + 1).join(', ')}. Eliminating [${d}] from all other cells in those 3 columns.`
                };
              }
            }
          }
        }
      }
    }
  }

  // 2. Column-based Swordfish: 3 columns where digit d appears in subsets of the same 3 rows
  for (let d = 1; d <= 9; d++) {
    const mask = 1 << d;
    const colPositions = [];

    for (let c = 0; c < 9; c++) {
      const rows = [];
      for (let r = 0; r < 9; r++) {
        const idx = r * 9 + c;
        if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
          rows.push(r);
        }
      }
      if (rows.length >= 2 && rows.length <= 3) {
        colPositions.push({ col: c, rows });
      }
    }

    if (colPositions.length >= 3) {
      for (let i = 0; i < colPositions.length - 2; i++) {
        for (let j = i + 1; j < colPositions.length - 1; j++) {
          for (let k = j + 1; k < colPositions.length; k++) {
            const c1 = colPositions[i];
            const c2 = colPositions[j];
            const c3 = colPositions[k];

            if (
              new Set([...c1.rows, ...c2.rows]).size <= 2 ||
              new Set([...c1.rows, ...c3.rows]).size <= 2 ||
              new Set([...c2.rows, ...c3.rows]).size <= 2
            ) {
              continue;
            }

            const rowSet = new Set([...c1.rows, ...c2.rows, ...c3.rows]);
            if (rowSet.size === 3) {
              const rows = Array.from(rowSet).sort((a, b) => a - b);
              const rowBands = new Set(rows.map(r => Math.floor(r / 3)));
              if (rowBands.size === 1) continue;

              const baseCols = [c1.col, c2.col, c3.col];
              const eliminations = [];

              for (const r of rows) {
                for (let c = 0; c < 9; c++) {
                  if (!baseCols.includes(c)) {
                    const idx = r * 9 + c;
                    if (board[idx] === 0 && (candidates[idx] & mask) !== 0) {
                      eliminations.push({ cell: idx, digit: d });
                    }
                  }
                }
              }

              if (eliminations.length > 0) {
                const primaryCells = [];
                for (const c of [c1, c2, c3]) {
                  for (const r of c.rows) {
                    primaryCells.push(r * 9 + c.col);
                  }
                }
                return {
                  id: 'swordfish',
                  name: 'Swordfish (Column-based)',
                  weight: 95,
                  placement: null,
                  highlightCells: uniqueHighlights([
                    ...primaryCells.map(c => ({ cell: c, type: 'primary' })),
                    ...eliminations.map(e => ({ cell: e.cell, type: 'target' }))
                  ]),
                  highlightCandidates: primaryCells.map(cell => ({ cell, digit: d })),
                  eliminations,
                  description: `Digit [${d}] forms a Swordfish across Columns ${c1.col + 1}, ${c2.col + 1}, ${c3.col + 1} and Rows ${rows.map(r => r + 1).join(', ')}. Eliminating [${d}] from all other cells in those 3 rows.`
                };
              }
            }
          }
        }
      }
    }
  }

  return null;
}
