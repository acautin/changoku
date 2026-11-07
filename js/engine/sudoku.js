/**
 * Sudoku Core Engine
 * Units, bitmask operations, candidate calculations, and board utilities.
 */

export const SIZE = 9;
export const BOX_SIZE = 3;
export const NUM_CELLS = 81;
export const ALL_CANDIDATES_MASK = 0b1111111110; // Bits 1..9 set

// Precomputed Unit Tables
export const ROW_CELLS = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => r * 9 + c)
);

export const COL_CELLS = Array.from({ length: 9 }, (_, c) =>
  Array.from({ length: 9 }, (_, r) => r * 9 + c)
);

export const BOX_CELLS = Array.from({ length: 9 }, (_, b) => {
  const boxRow = Math.floor(b / 3) * 3;
  const boxCol = (b % 3) * 3;
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push((boxRow + r) * 9 + (boxCol + c));
    }
  }
  return cells;
});

export const ALL_UNITS = [
  ...ROW_CELLS.map((cells, i) => ({ type: 'row', index: i, cells })),
  ...COL_CELLS.map((cells, i) => ({ type: 'col', index: i, cells })),
  ...BOX_CELLS.map((cells, i) => ({ type: 'box', index: i, cells }))
];

export const CELL_UNITS = Array.from({ length: NUM_CELLS }, (_, i) => {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
  return [
    { type: 'row', index: r, cells: ROW_CELLS[r] },
    { type: 'col', index: c, cells: COL_CELLS[c] },
    { type: 'box', index: b, cells: BOX_CELLS[b] }
  ];
});

export const PEERS = Array.from({ length: NUM_CELLS }, (_, i) => {
  const peerSet = new Set();
  for (const unit of CELL_UNITS[i]) {
    for (const cell of unit.cells) {
      if (cell !== i) peerSet.add(cell);
    }
  }
  return Array.from(peerSet).sort((a, b) => a - b);
});

// Bitmask helpers
export function digitToMask(d) {
  return 1 << d;
}

export function maskToDigits(mask) {
  const digits = [];
  for (let d = 1; d <= 9; d++) {
    if ((mask & (1 << d)) !== 0) digits.push(d);
  }
  return digits;
}

export function countBits(mask) {
  let count = 0;
  let m = mask;
  while (m > 0) {
    m &= m - 1;
    count++;
  }
  return count;
}

export function getSingleDigit(mask) {
  if (countBits(mask) !== 1) return 0;
  for (let d = 1; d <= 9; d++) {
    if ((mask & (1 << d)) !== 0) return d;
  }
  return 0;
}

// Coordinate conversions
export function indexToCoord(index) {
  return {
    row: Math.floor(index / 9),
    col: index % 9,
    box: Math.floor(Math.floor(index / 9) / 3) * 3 + Math.floor((index % 9) / 3)
  };
}

export function coordToIndex(row, col) {
  return row * 9 + col;
}

// String serialization (81 chars: digits or . / 0 for empty)
export function parseBoard(str) {
  const clean = str.replace(/[^0-9.]/g, '');
  const board = new Uint8Array(81);
  for (let i = 0; i < 81; i++) {
    const ch = clean[i] || '.';
    board[i] = ch === '.' ? 0 : parseInt(ch, 10);
  }
  return board;
}

export function boardToString(board) {
  let str = '';
  for (let i = 0; i < 81; i++) {
    str += board[i] === 0 ? '.' : board[i].toString();
  }
  return str;
}

// Candidates computation
export function calculateCandidates(board) {
  const candidates = new Uint16Array(81);
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) {
      candidates[i] = 0;
      continue;
    }
    let usedMask = 0;
    const peerList = PEERS[i];
    for (let p = 0; p < peerList.length; p++) {
      const val = board[peerList[p]];
      if (val !== 0) {
        usedMask |= (1 << val);
      }
    }
    candidates[i] = ALL_CANDIDATES_MASK & ~usedMask;
  }
  return candidates;
}

// Validation helpers
export function isValidPlacement(board, index, digit) {
  if (digit < 1 || digit > 9) return false;
  const peerList = PEERS[index];
  for (let p = 0; p < peerList.length; p++) {
    if (board[peerList[p]] === digit) return false;
  }
  return true;
}

export function getConflicts(board) {
  const conflicts = new Set();
  for (const unit of ALL_UNITS) {
    const seen = new Map();
    for (const cell of unit.cells) {
      const val = board[cell];
      if (val !== 0) {
        if (seen.has(val)) {
          conflicts.add(cell);
          conflicts.add(seen.get(val));
        } else {
          seen.set(val, cell);
        }
      }
    }
  }
  return Array.from(conflicts);
}

export function isBoardValid(board) {
  return getConflicts(board).length === 0;
}

export function isBoardComplete(board) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) return false;
  }
  return isBoardValid(board);
}
