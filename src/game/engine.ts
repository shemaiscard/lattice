import type {
  Coord,
  Difficulty,
  DotColorId,
  DotLinkPuzzle,
  LevelDef,
  LumenPuzzle,
  ProgressState,
  RiddlePuzzle,
  RunSummary,
} from './types';
import { LEVELS, getLevelById, getLevelsByDifficulty, getLevelsByStage } from './levels';

export function coordsEqual(a: Coord, b: Coord): boolean {
  return a.r === b.r && a.c === b.c;
}

export function isOrthogonallyAdjacent(a: Coord, b: Coord): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function coordKey(c: Coord): string {
  return `${c.r},${c.c}`;
}

// ============================================================================
// DOT LINK ENGINE (Pure State Functions)
// ============================================================================

export type DotLinkPaths = Partial<Record<DotColorId, Coord[]>>;

export interface DotLinkStepResult {
  paths: DotLinkPaths;
  activeColor: DotColorId | null;
  changed: boolean;
  connectedPair: DotColorId | null;
  cutOtherPath: boolean;
}

export function findEndpointAt(
  puzzle: DotLinkPuzzle,
  cell: Coord
): DotColorId | null {
  for (const pair of puzzle.pairs) {
    if (coordsEqual(pair.start, cell) || coordsEqual(pair.end, cell)) {
      return pair.id;
    }
  }
  return null;
}

export function findPathColorAt(
  paths: DotLinkPaths,
  cell: Coord
): DotColorId | null {
  for (const [colorId, path] of Object.entries(paths) as [DotColorId, Coord[] | undefined][]) {
    if (path && path.some((pt) => coordsEqual(pt, cell))) {
      return colorId;
    }
  }
  return null;
}

export function isPairConnected(
  puzzle: DotLinkPuzzle,
  paths: DotLinkPaths,
  colorId: DotColorId
): boolean {
  const pair = puzzle.pairs.find((p) => p.id === colorId);
  const path = paths[colorId];
  if (!pair || !path || path.length < 2) return false;
  const first = path[0];
  const last = path[path.length - 1];
  return (
    (coordsEqual(first, pair.start) && coordsEqual(last, pair.end)) ||
    (coordsEqual(first, pair.end) && coordsEqual(last, pair.start))
  );
}

export function startDotLinkAt(
  puzzle: DotLinkPuzzle,
  paths: DotLinkPaths,
  cell: Coord
): DotLinkStepResult {
  const endpointColor = findEndpointAt(puzzle, cell);
  if (endpointColor) {
    // Starting from an endpoint resets that color's path to just this endpoint
    return {
      paths: { ...paths, [endpointColor]: [cell] },
      activeColor: endpointColor,
      changed: true,
      connectedPair: null,
      cutOtherPath: false,
    };
  }

  // Starting from an existing segment resumes drawing from that cell
  const existingColor = findPathColorAt(paths, cell);
  if (existingColor) {
    const existingPath = paths[existingColor] ?? [];
    const idx = existingPath.findIndex((pt) => coordsEqual(pt, cell));
    if (idx !== -1) {
      return {
        paths: { ...paths, [existingColor]: existingPath.slice(0, idx + 1) },
        activeColor: existingColor,
        changed: idx < existingPath.length - 1,
        connectedPair: null,
        cutOtherPath: false,
      };
    }
  }

  return {
    paths,
    activeColor: null,
    changed: false,
    connectedPair: null,
    cutOtherPath: false,
  };
}

export function stepDotLinkTo(
  puzzle: DotLinkPuzzle,
  paths: DotLinkPaths,
  activeColor: DotColorId,
  cell: Coord
): DotLinkStepResult {
  if (
    cell.r < 0 ||
    cell.r >= puzzle.gridSize ||
    cell.c < 0 ||
    cell.c >= puzzle.gridSize
  ) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  const currentPath = paths[activeColor] ?? [];
  if (currentPath.length === 0) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  const head = currentPath[currentPath.length - 1];
  if (coordsEqual(head, cell)) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  // Must move orthogonally by 1 step
  if (!isOrthogonallyAdjacent(head, cell)) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  // Cannot step onto another color's fixed endpoint
  const endpointColor = findEndpointAt(puzzle, cell);
  if (endpointColor && endpointColor !== activeColor) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  // If backtracking onto our own existing path, truncate back to that cell
  const selfIdx = currentPath.findIndex((pt) => coordsEqual(pt, cell));
  if (selfIdx !== -1) {
    const trimmed = currentPath.slice(0, selfIdx + 1);
    return {
      paths: { ...paths, [activeColor]: trimmed },
      activeColor,
      changed: true,
      connectedPair: null,
      cutOtherPath: false,
    };
  }

  // If the pair was already completed at head (i.e. head is the opposite endpoint), don't overshoot past it
  const pair = puzzle.pairs.find((p) => p.id === activeColor);
  if (
    pair &&
    currentPath.length >= 2 &&
    (coordsEqual(head, pair.start) || coordsEqual(head, pair.end))
  ) {
    return { paths, activeColor, changed: false, connectedPair: null, cutOtherPath: false };
  }

  // If stepping onto another color's path segment, cut that other path cleanly before this cell
  const nextPaths: DotLinkPaths = { ...paths };
  let cutOtherPath = false;
  const occupiedBy = findPathColorAt(nextPaths, cell);
  if (occupiedBy && occupiedBy !== activeColor) {
    const otherPath = nextPaths[occupiedBy] ?? [];
    const cutIdx = otherPath.findIndex((pt) => coordsEqual(pt, cell));
    if (cutIdx !== -1) {
      nextPaths[occupiedBy] = cutIdx <= 1 ? [] : otherPath.slice(0, cutIdx);
      cutOtherPath = true;
    }
  }

  const updatedPath = [...currentPath, cell];
  nextPaths[activeColor] = updatedPath;

  const justConnected = isPairConnected(puzzle, nextPaths, activeColor) ? activeColor : null;
  return {
    paths: nextPaths,
    activeColor,
    changed: true,
    connectedPair: justConnected,
    cutOtherPath,
  };
}

export function getDotLinkStats(puzzle: DotLinkPuzzle, paths: DotLinkPaths): {
  connectedCount: number;
  totalPairs: number;
  filledCells: number;
  totalCells: number;
  isSolved: boolean;
} {
  let connectedCount = 0;
  for (const pair of puzzle.pairs) {
    if (isPairConnected(puzzle, paths, pair.id)) {
      connectedCount += 1;
    }
  }

  const occupied = new Set<string>();
  // Endpoints always occupy their cell
  for (const pair of puzzle.pairs) {
    occupied.add(coordKey(pair.start));
    occupied.add(coordKey(pair.end));
  }
  for (const path of Object.values(paths)) {
    if (!path) continue;
    for (const pt of path) {
      occupied.add(coordKey(pt));
    }
  }

  const totalCells = puzzle.gridSize * puzzle.gridSize;
  const filledCells = occupied.size;
  const isSolved = connectedCount === puzzle.pairs.length && filledCells === totalCells;

  return {
    connectedCount,
    totalPairs: puzzle.pairs.length,
    filledCells,
    totalCells,
    isSolved,
  };
}

/**
 * Hint helper: solves one currently unconnected (or non-optimal) color pair using its verified solution,
 * clearing any conflicting segments from other colors.
 */
export function applyDotLinkHint(
  puzzle: DotLinkPuzzle,
  paths: DotLinkPaths
): { paths: DotLinkPaths; revealedColor: DotColorId | null } {
  // Prefer an unconnected pair, or if all connected but cells missing, find one whose path != solution
  let target = puzzle.pairs.find((p) => !isPairConnected(puzzle, paths, p.id));
  if (!target) {
    target = puzzle.pairs.find((p) => {
      const current = paths[p.id] ?? [];
      return current.length !== p.solution.length;
    });
  }
  if (!target) return { paths, revealedColor: null };

  const targetKeys = new Set(target.solution.map(coordKey));
  const nextPaths: DotLinkPaths = {};
  for (const pair of puzzle.pairs) {
    if (pair.id === target.id) {
      nextPaths[pair.id] = target.solution.map((pt) => ({ ...pt }));
    } else {
      const existing = paths[pair.id];
      if (existing && !existing.some((pt) => targetKeys.has(coordKey(pt)))) {
        nextPaths[pair.id] = existing;
      }
    }
  }

  return { paths: nextPaths, revealedColor: target.id };
}

// ============================================================================
// RIDDLE ENGINE
// ============================================================================

export function normalizeRiddleText(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\s+/g, ' ');
}

export function evaluateRiddleAnswer(puzzle: RiddlePuzzle, attempt: string): boolean {
  const normalized = normalizeRiddleText(attempt);
  if (!normalized) return false;
  const accepted = new Set([
    normalizeRiddleText(puzzle.answer),
    ...puzzle.acceptedAnswers.map(normalizeRiddleText),
  ]);
  return accepted.has(normalized);
}

// ============================================================================
// LUMEN TOGGLE ENGINE (Lights-Out / Constellation Grid)
// ============================================================================

export function createInitialLumenGrid(puzzle: LumenPuzzle): boolean[][] {
  // Start with all tiles lit (true), then apply solutionMoves backwards (XOR is self-inverse)
  let grid: boolean[][] = Array.from({ length: puzzle.gridSize }, () =>
    Array.from({ length: puzzle.gridSize }, () => true)
  );
  for (const move of puzzle.solutionMoves) {
    grid = toggleLumenCell(grid, move);
  }
  return grid;
}

export function toggleLumenCell(grid: boolean[][], cell: Coord): boolean[][] {
  const size = grid.length;
  const next = grid.map((row) => [...row]);
  const deltas: [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of deltas) {
    const nr = cell.r + dr;
    const nc = cell.c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      next[nr][nc] = !next[nr][nc];
    }
  }
  return next;
}

export function getLumenStats(grid: boolean[][]): {
  litCount: number;
  totalCells: number;
  isSolved: boolean;
} {
  let litCount = 0;
  const totalCells = grid.length * grid.length;
  for (const row of grid) {
    for (const val of row) {
      if (val) litCount += 1;
    }
  }
  return { litCount, totalCells, isSolved: litCount === totalCells };
}

// ============================================================================
// PROGRESSION, UNLOCKING & SCORING
// ============================================================================

export const INITIAL_PROGRESS: ProgressState = {
  records: {},
  streak: 0,
  bestStreak: 0,
  lastPlayedLevelId: null,
};

export function isLevelUnlocked(level: LevelDef, progress: ProgressState): boolean {
  // Stage 1 Level 1 of EVERY difficulty (Easy, Medium, Hard) is unlocked from the start
  // so players can jump right into their preferred tier, then unlock Stage 1->2->3 sequentially!
  if (level.stage === 1 && level.level === 1) {
    return true;
  }

  const tierLevels = getLevelsByDifficulty(level.difficulty);
  const idx = tierLevels.findIndex((l) => l.id === level.id);
  if (idx <= 0) return true;
  const prevLevel = tierLevels[idx - 1];
  return Boolean(progress.records[prevLevel.id]?.completed);
}

export function calculateStars(
  level: LevelDef,
  moves: number,
  hintsUsed: number
): 1 | 2 | 3 {
  if (hintsUsed >= 2) return 1;
  if (level.puzzle.type === 'dotlink' || level.puzzle.type === 'lumen') {
    const par = level.puzzle.parMoves;
    if (hintsUsed === 0 && moves <= par + 2) return 3;
    if (hintsUsed <= 1 && moves <= par + 6) return 2;
    return 1;
  }
  // Riddles & Ciphers
  if (hintsUsed === 0 && moves <= 1) return 3;
  if (hintsUsed <= 1 && moves <= 3) return 2;
  return 1;
}

export function recordLevelCompletion(
  progress: ProgressState,
  level: LevelDef,
  moves: number,
  seconds: number,
  hintsUsed: number
): { nextProgress: ProgressState; summary: RunSummary } {
  const stars = calculateStars(level, moves, hintsUsed);
  const prev = progress.records[level.id];
  const isNewBest =
    !prev ||
    stars > prev.stars ||
    (stars === prev.stars && seconds < prev.bestSeconds);

  const nextRecord = {
    completed: true,
    stars: prev ? (Math.max(prev.stars, stars) as 1 | 2 | 3) : stars,
    bestMoves: prev ? Math.min(prev.bestMoves, moves) : moves,
    bestSeconds: prev ? Math.min(prev.bestSeconds, seconds) : seconds,
  };

  const nextRecords = {
    ...progress.records,
    [level.id]: nextRecord,
  };

  const nextStreak = progress.streak + 1;
  const nextBestStreak = Math.max(progress.bestStreak, nextStreak);

  const stageLevels = getLevelsByStage(level.difficulty, level.stage);
  const stageCompleted = stageLevels.every((l) => Boolean(nextRecords[l.id]?.completed));

  const diffLevels = getLevelsByDifficulty(level.difficulty);
  const difficultyCompleted = diffLevels.every((l) => Boolean(nextRecords[l.id]?.completed));

  return {
    nextProgress: {
      records: nextRecords,
      streak: nextStreak,
      bestStreak: nextBestStreak,
      lastPlayedLevelId: level.id,
    },
    summary: {
      levelId: level.id,
      moves,
      seconds,
      hintsUsed,
      stars,
      isNewBest,
      stageCompleted,
      difficultyCompleted,
    },
  };
}

export function getCampaignTotals(progress: ProgressState): {
  solvedCount: number;
  totalLevels: number;
  earnedStars: number;
  maxStars: number;
  byDifficulty: Record<Difficulty, { solved: number; total: number; stars: number }>;
} {
  let solvedCount = 0;
  let earnedStars = 0;
  const byDifficulty: Record<Difficulty, { solved: number; total: number; stars: number }> = {
    easy: { solved: 0, total: 0, stars: 0 },
    medium: { solved: 0, total: 0, stars: 0 },
    hard: { solved: 0, total: 0, stars: 0 },
  };

  for (const level of LEVELS) {
    byDifficulty[level.difficulty].total += 1;
    const rec = progress.records[level.id];
    if (rec?.completed) {
      solvedCount += 1;
      earnedStars += rec.stars;
      byDifficulty[level.difficulty].solved += 1;
      byDifficulty[level.difficulty].stars += rec.stars;
    }
  }

  return {
    solvedCount,
    totalLevels: LEVELS.length,
    earnedStars,
    maxStars: LEVELS.length * 3,
    byDifficulty,
  };
}

export function getRecommendedNextLevel(progress: ProgressState): LevelDef {
  if (progress.lastPlayedLevelId) {
    const last = getLevelById(progress.lastPlayedLevelId);
    if (last && !progress.records[last.id]?.completed) {
      return last;
    }
  }
  const firstUnsolved = LEVELS.find(
    (l) => isLevelUnlocked(l, progress) && !progress.records[l.id]?.completed
  );
  return firstUnsolved ?? LEVELS[0];
}

const STORAGE_KEY = 'lattice_campaign_progress_v1';

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      records: parsed.records ?? {},
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      lastPlayedLevelId: parsed.lastPlayedLevelId ?? null,
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}
