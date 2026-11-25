export type Difficulty = 'easy' | 'medium' | 'hard';

export type PuzzleType = 'dotlink' | 'riddle' | 'lumen' | 'cipher' | 'memory';

export type GameScreen = 'title' | 'map' | 'playing' | 'paused' | 'victory';

export type ThemeMode = 'dark' | 'light';

export interface Coord {
  r: number;
  c: number;
}

export type DotColorId = 'coral' | 'cobalt' | 'emerald' | 'amber' | 'violet' | 'cyan';

export interface DotPairDef {
  id: DotColorId;
  label: string;
  shape: 'circle' | 'diamond' | 'triangle' | 'square' | 'star' | 'hexagon';
  start: Coord;
  end: Coord;
  /** Exact mathematically verified orthogonal path from start to end */
  solution: Coord[];
}

export interface DotLinkPuzzle {
  type: 'dotlink';
  gridSize: number;
  pairs: DotPairDef[];
  parMoves: number;
}

export interface RiddlePuzzle {
  type: 'riddle';
  prompt: string;
  clues: [string, string];
  answer: string;
  acceptedAnswers: string[];
  category: string;
  explanation: string;
}

export interface LumenPuzzle {
  type: 'lumen';
  gridSize: number;
  /** Moves from all-lit state used to construct the solvable starting pattern */
  solutionMoves: Coord[];
  parMoves: number;
}

export interface CipherSequenceItem {
  value: string;
  sublabel?: string;
}

export interface CipherPuzzle {
  type: 'cipher';
  prompt: string;
  sequence: CipherSequenceItem[];
  options: string[];
  correctAnswer: string;
  clues: [string, string];
  explanation: string;
}

export interface MemoryPuzzle {
  type: 'memory';
  rows: number;
  cols: number;
  /** Distinct symbols on the board. Each appears twice, so rows * cols = pairs * 2. */
  pairs: number;
  /** Draw every symbol in one color, so only the shape tells two cards apart. */
  monochrome: boolean;
  /** Pair attempts (two cards turned over) a sharp memory needs. */
  parMoves: number;
}

export type PuzzlePayload = DotLinkPuzzle | RiddlePuzzle | LumenPuzzle | CipherPuzzle | MemoryPuzzle;

export interface LevelDef {
  id: string;
  difficulty: Difficulty;
  stage: number; // 1, 2, 3
  level: number; // 1 to 5
  title: string;
  subtitle: string;
  puzzle: PuzzlePayload;
}

export interface LevelRecord {
  completed: boolean;
  stars: 1 | 2 | 3;
  bestMoves: number;
  bestSeconds: number;
}

export interface ProgressState {
  records: Record<string, LevelRecord>;
  streak: number;
  bestStreak: number;
  lastPlayedLevelId: string | null;
}

export interface RunSummary {
  levelId: string;
  moves: number;
  seconds: number;
  hintsUsed: number;
  stars: 1 | 2 | 3;
  isNewBest: boolean;
  stageCompleted: boolean;
  difficultyCompleted: boolean;
}
