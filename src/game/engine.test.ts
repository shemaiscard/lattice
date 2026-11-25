import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevelsByDifficulty, getLevelsByStage } from './levels';
import {
  INITIAL_PROGRESS,
  applyDotLinkHint,
  calculateStars,
  coordKey,
  coordsEqual,
  createInitialLumenGrid,
  createMemoryDeck,
  createMemoryState,
  evaluateRiddleAnswer,
  flipMemoryCard,
  getCampaignTotals,
  getDotLinkStats,
  getLumenStats,
  getMemoryStats,
  hideMemoryMiss,
  isLevelUnlocked,
  isOrthogonallyAdjacent,
  recordLevelCompletion,
  startDotLinkAt,
  stepDotLinkTo,
  toggleLumenCell,
  type DotLinkPaths,
} from './engine';

test('campaign structure has 3 difficulties × 3 stages × 5 levels = 45 levels', () => {
  assert.equal(LEVELS.length, 45);
  for (const diff of ['easy', 'medium', 'hard'] as const) {
    assert.equal(getLevelsByDifficulty(diff).length, 15);
    for (const stage of [1, 2, 3]) {
      const stageLevels = getLevelsByStage(diff, stage);
      assert.equal(stageLevels.length, 5, `${diff} stage ${stage} should have 5 levels`);
      assert.deepEqual(stageLevels.map((l) => l.level), [1, 2, 3, 4, 5]);
      assert.equal(stageLevels[4].puzzle.type, 'memory', `${diff} stage ${stage} should end with Memory Match`);
      // Every stage must include at least one Dot Link and one Riddle
      assert.ok(
        stageLevels.some((l) => l.puzzle.type === 'dotlink'),
        `${diff} stage ${stage} must include a Dot Link puzzle`
      );
      assert.ok(
        stageLevels.some((l) => l.puzzle.type === 'riddle'),
        `${diff} stage ${stage} must include a Riddle puzzle`
      );
    }
  }
});

test('every Dot Link puzzle solution forms an exact full-grid orthogonal partition', () => {
  const dotLinkLevels = LEVELS.filter((l) => l.puzzle.type === 'dotlink');
  assert.ok(dotLinkLevels.length >= 15);

  for (const level of dotLinkLevels) {
    const puzzle = level.puzzle;
    if (puzzle.type !== 'dotlink') continue;

    const seen = new Set<string>();
    const paths: DotLinkPaths = {};

    for (const pair of puzzle.pairs) {
      assert.ok(
        pair.solution.length >= 3,
        `${level.id} pair ${pair.id} solution must be >= 3 cells`
      );
      assert.ok(
        coordsEqual(pair.start, pair.solution[0]),
        `${level.id} pair ${pair.id} start must match solution[0]`
      );
      assert.ok(
        coordsEqual(pair.end, pair.solution[pair.solution.length - 1]),
        `${level.id} pair ${pair.id} end must match solution[last]`
      );

      for (let i = 0; i < pair.solution.length; i++) {
        const pt = pair.solution[i];
        assert.ok(
          pt.r >= 0 && pt.r < puzzle.gridSize && pt.c >= 0 && pt.c < puzzle.gridSize,
          `${level.id} pair ${pair.id} out of bounds at (${pt.r},${pt.c})`
        );
        const key = coordKey(pt);
        assert.ok(!seen.has(key), `${level.id} duplicate cell at (${pt.r},${pt.c})`);
        seen.add(key);

        if (i > 0) {
          assert.ok(
            isOrthogonallyAdjacent(pair.solution[i - 1], pt),
            `${level.id} pair ${pair.id} non-orthogonal step at index ${i}`
          );
        }
      }

      paths[pair.id] = pair.solution;
    }

    assert.equal(
      seen.size,
      puzzle.gridSize * puzzle.gridSize,
      `${level.id} must cover all ${puzzle.gridSize * puzzle.gridSize} cells`
    );

    const stats = getDotLinkStats(puzzle, paths);
    assert.equal(stats.isSolved, true, `${level.id} solution must solve the puzzle`);
  }
});

test('Dot Link interactive stepping, backtracking, cutting, and hint work accurately', () => {
  const level = LEVELS[0];
  assert.equal(level.puzzle.type, 'dotlink');
  if (level.puzzle.type !== 'dotlink') return;

  let paths: DotLinkPaths = {};
  const coral = level.puzzle.pairs[0];

  // Start at coral start
  const startRes = startDotLinkAt(level.puzzle, paths, coral.start);
  assert.equal(startRes.activeColor, 'coral');
  paths = startRes.paths;

  // Step through entire coral solution
  let lastConnected = null;
  for (let i = 1; i < coral.solution.length; i++) {
    const step = stepDotLinkTo(level.puzzle, paths, 'coral', coral.solution[i]);
    assert.equal(step.changed, true);
    paths = step.paths;
    lastConnected = step.connectedPair;
  }
  assert.equal(lastConnected, 'coral');

  // Backtrack one cell disconnects coral
  const back = stepDotLinkTo(
    level.puzzle,
    paths,
    'coral',
    coral.solution[coral.solution.length - 2]
  );
  assert.equal(back.changed, true);
  assert.equal(back.connectedPair, null);
  paths = back.paths;
  assert.equal(getDotLinkStats(level.puzzle, paths).connectedCount, 0);

  // Applying hints progressively solves the entire board
  for (let i = 0; i < level.puzzle.pairs.length; i++) {
    const hintRes = applyDotLinkHint(level.puzzle, paths);
    paths = hintRes.paths;
  }
  assert.equal(getDotLinkStats(level.puzzle, paths).isSolved, true);
});

test('every Riddle puzzle validates its canonical and accepted answers', () => {
  const riddles = LEVELS.filter((l) => l.puzzle.type === 'riddle');
  assert.equal(riddles.length, 12);

  for (const level of riddles) {
    if (level.puzzle.type !== 'riddle') continue;
    assert.equal(evaluateRiddleAnswer(level.puzzle, level.puzzle.answer), true);
    assert.equal(evaluateRiddleAnswer(level.puzzle, `  the ${level.puzzle.answer}! `), true);
    assert.equal(evaluateRiddleAnswer(level.puzzle, 'completely wrong answer'), false);
  }
});

test('every Lumen Toggle puzzle starts unsolved and solves via its solutionMoves', () => {
  const lumens = LEVELS.filter((l) => l.puzzle.type === 'lumen');
  assert.equal(lumens.length, 6);

  for (const level of lumens) {
    if (level.puzzle.type !== 'lumen') continue;
    let grid = createInitialLumenGrid(level.puzzle);
    assert.equal(
      getLumenStats(grid).isSolved,
      false,
      `${level.id} must not start already solved`
    );

    for (const move of level.puzzle.solutionMoves) {
      grid = toggleLumenCell(grid, move);
    }
    assert.equal(
      getLumenStats(grid).isSolved,
      true,
      `${level.id} must be solved after applying solutionMoves`
    );
  }
});

test('every Cipher Lock puzzle includes its correct answer in options', () => {
  const ciphers = LEVELS.filter((l) => l.puzzle.type === 'cipher');
  assert.equal(ciphers.length, 3);

  for (const level of ciphers) {
    if (level.puzzle.type !== 'cipher') continue;
    assert.ok(level.puzzle.options.includes(level.puzzle.correctAnswer));
  }
});

test('every Memory Match board has an even card count and fits the symbol set', () => {
  const boards = LEVELS.filter((l) => l.puzzle.type === 'memory');
  assert.equal(boards.length, 9);
  for (const level of boards) {
    if (level.puzzle.type !== 'memory') continue;
    const { rows, cols, pairs, parMoves, monochrome } = level.puzzle;
    assert.equal(rows * cols, pairs * 2, `${level.id} needs rows * cols = pairs * 2`);
    assert.ok(pairs <= 18, `${level.id} uses more symbols than the board has`);
    assert.ok(parMoves >= pairs, `${level.id} par cannot beat a perfect run`);
    assert.equal(monochrome, level.difficulty === 'hard', `${level.id} monochrome only on Hard`);
  }
});

test('Memory Match deck holds every symbol exactly twice', () => {
  for (const level of LEVELS) {
    if (level.puzzle.type !== 'memory') continue;
    const deck = createMemoryDeck(level.puzzle);
    assert.equal(deck.length, level.puzzle.rows * level.puzzle.cols);
    const counts = new Map<number, number>();
    for (const s of deck) counts.set(s, (counts.get(s) ?? 0) + 1);
    assert.equal(counts.size, level.puzzle.pairs);
    for (const n of counts.values()) assert.equal(n, 2);
  }
});

test('Memory Match flips: first card, miss, match, ignored cards and solve', () => {
  const level = LEVELS.find((l) => l.id === 'easy-s1-l5')!;
  assert.equal(level.puzzle.type, 'memory');
  if (level.puzzle.type !== 'memory') return;
  let state = createMemoryState(level.puzzle);
  state = { ...state, deck: [0, 1, 0, 1, 2, 3, 2, 3, 4, 5, 4, 5] };

  let r = flipMemoryCard(state, 0);
  assert.equal(r.outcome, 'first');
  assert.equal(flipMemoryCard(r.state, 0).outcome, 'ignored', 'same card twice');

  r = flipMemoryCard(r.state, 1);
  assert.equal(r.outcome, 'miss');
  assert.deepEqual(r.state.open, [0, 1]);
  assert.deepEqual(hideMemoryMiss(r.state).open, []);

  // A third card while a miss is showing hides the miss and starts a new attempt.
  r = flipMemoryCard(r.state, 2);
  assert.equal(r.outcome, 'first');
  assert.deepEqual(r.state.open, [2]);

  r = flipMemoryCard(r.state, 0);
  assert.equal(r.outcome, 'match');
  assert.ok(r.state.matched[0] && r.state.matched[2]);
  assert.equal(flipMemoryCard(r.state, 0).outcome, 'ignored', 'matched card');

  state = r.state;
  for (const [a, b] of [[1, 3], [4, 6], [5, 7], [8, 10], [9, 11]]) {
    state = flipMemoryCard(state, a).state;
    const m = flipMemoryCard(state, b);
    assert.equal(m.outcome, 'match');
    state = m.state;
  }
  assert.deepEqual(getMemoryStats(state), { pairsFound: 6, totalPairs: 6, isSolved: true });
});

test('Memory Match stars follow par like Dot Link and Lumen', () => {
  const level = LEVELS.find((l) => l.id === 'easy-s1-l5')!;
  if (level.puzzle.type !== 'memory') return;
  const par = level.puzzle.parMoves;
  assert.equal(calculateStars(level, par + 2, 0), 3);
  assert.equal(calculateStars(level, par + 3, 0), 2);
  assert.equal(calculateStars(level, par + 6, 1), 2);
  assert.equal(calculateStars(level, par + 7, 0), 1);
  assert.equal(calculateStars(level, par, 2), 1);
});

test('progression unlocks Stage 1 Level 1 of each tier and unlocks sequential levels on completion', () => {
  const easy1 = LEVELS.find((l) => l.id === 'easy-s1-l1')!;
  const easy2 = LEVELS.find((l) => l.id === 'easy-s1-l2')!;
  const hard1 = LEVELS.find((l) => l.id === 'hard-s1-l1')!;
  const hard2 = LEVELS.find((l) => l.id === 'hard-s1-l2')!;

  assert.equal(isLevelUnlocked(easy1, INITIAL_PROGRESS), true);
  assert.equal(isLevelUnlocked(hard1, INITIAL_PROGRESS), true);
  assert.equal(isLevelUnlocked(easy2, INITIAL_PROGRESS), false);
  assert.equal(isLevelUnlocked(hard2, INITIAL_PROGRESS), false);

  const { nextProgress, summary } = recordLevelCompletion(
    INITIAL_PROGRESS,
    easy1,
    4,
    22,
    0
  );
  assert.equal(summary.stars, 3);
  assert.equal(isLevelUnlocked(easy2, nextProgress), true);
  assert.equal(getCampaignTotals(nextProgress).solvedCount, 1);
  assert.equal(getCampaignTotals(nextProgress).earnedStars, 3);
});
