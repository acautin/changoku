/**
 * Curated Study Puzzles & Technique Demonstration States
 * Every puzzle in this catalog is an 81-character, uniquely solvable board state
 * where all simpler techniques have been exhausted so the target technique is
 * immediately active as the next logical deduction step.
 */

export const FAMOUS_17_CLUE_PUZZLE = {
  id: 'mcguire_17_clue',
  name: 'Famous 17-Clue Minimum Puzzle',
  author: 'Gordon Royle / Gary McGuire Minimum Clue Benchmark',
  boardStr: '000000010400000000020000000000050407008000300001090000300400200050100000000806000',
  description: 'Proved in 2012 by Gary McGuire, Bastian Tugemann, and Gilles Civario via 7.1 million CPU hours of supercomputing search: standard 9x9 Sudoku CANNOT have a unique solution with 16 clues. The mathematical minimum is exactly 17 clues.'
};

export const TECHNIQUE_STUDY_PUZZLES = [
  {
    id: 'naked_single',
    techniqueId: 'naked_single',
    title: 'Naked Single Demonstration',
    difficulty: 'Very Easy',
    boardStr: '5..3.6....72...8....89......19....28...7..5...5...2.3......8.4..3......9..4..1.5.',
    focusCell: 2, // R1C3
    explanation: 'Inspect cell R1C3. Its row, column, and 3x3 box already contain every digit from 2 through 9. Therefore, candidate [1] is the sole remaining candidate and must be placed in R1C3.'
  },
  {
    id: 'hidden_single',
    techniqueId: 'hidden_single',
    title: 'Hidden Single Demonstration',
    difficulty: 'Easy',
    boardStr: '5.13.6....72...8....89......19....28...7..5...5...2.3......8.4..3......9..4..1.5.',
    focusCell: 4, // R1C5
    explanation: 'Even when a cell holds multiple candidate pencil marks, inspect the entire row, column, or 3x3 box. In Row 1, digit [8] can only legally fit in R1C5.'
  },
  {
    id: 'pointing_pair',
    techniqueId: 'pointing_pair',
    title: 'Pointing Candidates (Intersection)',
    difficulty: 'Medium',
    boardStr: '591386.7..721..89...8927..5.19..3.28..37.95...5.8.293......8.4..3.....89..4..1.5.',
    focusCell: 13,
    explanation: 'Within Box 2, all candidates for digit [4] are restricted to Row 2. Since Box 2 must contain a [4], it is forced into Row 2 inside Box 2, eliminating [4] from all other cells along Row 2 outside Box 2.'
  },
  {
    id: 'box_line_reduction',
    techniqueId: 'box_line_reduction',
    title: 'Box-Line Reduction (Claiming)',
    difficulty: 'Medium',
    boardStr: '9748615238.3..71961.6.9.7843987..612517286349642139857.61..89.5.896....173591..68',
    focusCell: 12,
    explanation: 'Along Column 4, all candidates for digit [5] are confined to Box 2. Column 4 "claims" digit [5] for Box 2, eliminating [5] from all other cells in Box 2 outside Column 4.'
  },
  {
    id: 'naked_pair',
    techniqueId: 'naked_pair',
    title: 'Naked Pair Elimination',
    difficulty: 'Medium',
    boardStr: '..2.351.4..3791..6....4235..713586.2.26.17538....26..18...73.6.....64...267589413',
    focusCell: 15,
    explanation: 'In Row 2, cells R2C7 and R2C8 both contain the exact same two candidates [2, 8] and no others. Because those two digits must occupy those two cells, [2] and [8] can be eliminated from all other cells in Row 2.'
  },
  {
    id: 'hidden_pair',
    techniqueId: 'hidden_pair',
    title: 'Hidden Pair Elimination',
    difficulty: 'Medium',
    boardStr: '83.94..616193.5.7.2.4.6139.7425....65684.....391..6...9.61....318..346.94.36..1..',
    focusCell: 34,
    explanation: 'In Column 8, candidates [1, 3] appear ONLY in cells R4C8 and R5C8, hidden alongside other candidates. Because [1] and [3] must occupy those two cells, all other candidates in R4C8 and R5C8 are eliminated.'
  },
  {
    id: 'naked_triple',
    techniqueId: 'naked_triple',
    title: 'Naked Triple Elimination',
    difficulty: 'Hard',
    boardStr: '.49372.51.7.1.93...1.8.69.7.52461....8..95....9..834.5.2.5371..931628574.6.914283',
    focusCell: 39,
    explanation: 'In Row 5, cells R5C4, R5C7, and R5C9 only contain candidates from the three-digit set [2, 6, 7]. Those three digits are locked inside those three cells and can be eliminated from all other cells in Row 5.'
  },
  {
    id: 'hidden_triple',
    techniqueId: 'hidden_triple',
    title: 'Hidden Triple Elimination',
    difficulty: 'Hard',
    boardStr: '27.39...65.62789.198.64...76954.7..3..7.26.9581295367412.5.97.8.69..45.2.58..2..9',
    focusCell: 7,
    explanation: 'In Column 8, digits [2, 5, 8] only appear within three cells: R1C8, R3C8, and R4C8. Those three cells must hold [2, 5, 8], so all other candidate digits inside R1C8, R3C8, and R4C8 are eliminated.'
  },
  {
    id: 'x_wing',
    techniqueId: 'x_wing',
    title: 'Classic X-Wing Pattern',
    difficulty: 'Hard',
    boardStr: '6...4..59.....1.46.3.956.82543168927..75..6141.6.7.538....9.271....1.8.5.12.854.3',
    focusCell: 9,
    explanation: 'In Columns 1 and 5, candidate [2] appears only in Rows 2 and 5, forming a rectangle. Since [2] must occupy opposite corners of this rectangle, [2] can be eliminated from all other cells along Rows 2 and 5.'
  },
  {
    id: 'swordfish',
    techniqueId: 'swordfish',
    title: 'Swordfish Pattern (3x3 Fish)',
    difficulty: 'Master',
    boardStr: '68.3.915239.21586.125.8.9.3579831426416.5238.238...5.174..286.58625.371.95....2.8',
    focusCell: 2,
    explanation: 'Across Rows 1, 2, and 8, candidate [4] is confined to subsets of three columns: Columns 3, 5, and 9 (a canonical 2-2-2 Swordfish). One [4] in each base row locks Columns 3, 5, and 9, eliminating [4] from all other cells in those three columns.'
  },
  {
    id: 'xy_wing',
    techniqueId: 'xy_wing',
    title: 'XY-Wing (Y-Wing) Triplet',
    difficulty: 'Master',
    boardStr: '3574..8..2698731544182657399.45.62..1.29.4..55361279487953...8.6.1758.9.8.36..5.7',
    focusCell: 71,
    explanation: 'Pivot cell R8C9 [2, 3] connects to Wing 1 R9C8 [1, 2] (via Box 9) and Wing 2 R4C9 [1, 3] (via Column 9). Whether R8C9 is 2 or 3, one of the two wings is forced to be [1]. Any cell seeing both wings cannot contain [1].'
  }
];
