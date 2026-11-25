import type { Coord, DotColorId, DotPairDef, LevelDef, Difficulty } from './types';

const PAIR_META: Record<
  DotColorId,
  { label: string; shape: DotPairDef['shape'] }
> = {
  coral: { label: 'Vermilion', shape: 'circle' },
  cobalt: { label: 'Cerulean', shape: 'diamond' },
  emerald: { label: 'Jade', shape: 'triangle' },
  amber: { label: 'Marigold', shape: 'square' },
  violet: { label: 'Orchid', shape: 'star' },
  cyan: { label: 'Teal', shape: 'hexagon' },
};

function makePair(id: DotColorId, pts: [number, number][]): DotPairDef {
  const solution: Coord[] = pts.map(([r, c]) => ({ r, c }));
  const meta = PAIR_META[id];
  return {
    id,
    label: meta.label,
    shape: meta.shape,
    start: solution[0],
    end: solution[solution.length - 1],
    solution,
  };
}

export const DIFFICULTY_META: Record<
  Difficulty,
  { title: string; subtitle: string; stageNames: [string, string, string] }
> = {
  easy: {
    title: 'Easy',
    subtitle: 'Foundations of Flow & Wit',
    stageNames: ['Stage 1 · Awakening', 'Stage 2 · Courtyard', 'Stage 3 · Lanterns'],
  },
  medium: {
    title: 'Medium',
    subtitle: 'Tangled Paths & Cryptic Verse',
    stageNames: ['Stage 1 · Cloister', 'Stage 2 · Observatory', 'Stage 3 · Sundial'],
  },
  hard: {
    title: 'Hard',
    subtitle: 'Mastery of the Grand Lattice',
    stageNames: ['Stage 1 · Citadel', 'Stage 2 · Astral Vault', 'Stage 3 · Sovereign'],
  },
};

export const LEVELS: LevelDef[] = [
  // =========================================================================
  // EASY: STAGE 1
  // =========================================================================
  {
    id: 'easy-s1-l1',
    difficulty: 'easy',
    stage: 1,
    level: 1,
    title: 'First Thread',
    subtitle: 'Link every matching pair and fill every tile.',
    puzzle: {
      type: 'dotlink',
      gridSize: 5,
      parMoves: 4,
      pairs: [
        makePair('coral', [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,2]]),
        makePair('cobalt', [[0,4],[1,4],[2,4],[3,4],[3,3]]),
        makePair('emerald', [[1,0],[2,0],[3,0],[4,0],[4,1]]),
        makePair('amber', [[1,2],[1,1],[2,1],[3,1],[3,2],[4,2],[4,3],[4,4]]),
      ],
    },
  },
  {
    id: 'easy-s1-l2',
    difficulty: 'easy',
    stage: 1,
    level: 2,
    title: 'The Quiet Traveler',
    subtitle: 'Decode the verse to unlock the gate.',
    puzzle: {
      type: 'riddle',
      category: 'Classic Riddle',
      prompt: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
      clues: [
        'Travelers unfold me before setting out on a journey.',
        'It is a three-letter word starting with M.',
      ],
      answer: 'Map',
      acceptedAnswers: ['map', 'a map', 'world map', 'atlas'],
      explanation: 'A map depicts cities, mountains, and oceans on paper without holding the real things.',
    },
  },
  {
    id: 'easy-s1-l3',
    difficulty: 'easy',
    stage: 1,
    level: 3,
    title: 'Morning Lanterns',
    subtitle: 'Illuminate every tile on the 3×3 board.',
    puzzle: {
      type: 'lumen',
      gridSize: 3,
      solutionMoves: [{ r: 1, c: 1 }, { r: 0, c: 0 }],
      parMoves: 2,
    },
  },
  {
    id: 'easy-s1-l4',
    difficulty: 'easy',
    stage: 1,
    level: 4,
    title: 'Twin Weave',
    subtitle: 'Route four threads around the courtyard.',
    puzzle: {
      type: 'dotlink',
      gridSize: 5,
      parMoves: 5,
      pairs: [
        makePair('coral', [[2,0],[1,0],[0,0],[0,1],[0,2],[1,2],[2,2]]),
        makePair('cobalt', [[0,4],[0,3],[1,3],[2,3],[3,3],[3,2]]),
        makePair('emerald', [[1,1],[2,1],[3,1],[3,0]]),
        makePair('amber', [[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0]]),
      ],
    },
  },
  {
    id: 'easy-s1-l5',
    difficulty: 'easy',
    stage: 1,
    level: 5,
    title: 'Twin Sparks',
    subtitle: 'Turn two cards at a time and find every matching pair.',
    puzzle: {
      type: 'memory',
      rows: 3,
      cols: 4,
      pairs: 6,
      monochrome: false,
      parMoves: 11,
    },
  },

  // =========================================================================
  // EASY: STAGE 2
  // =========================================================================
  {
    id: 'easy-s2-l1',
    difficulty: 'easy',
    stage: 2,
    level: 1,
    title: 'Spiral Gate',
    subtitle: 'Guide the outer currents without blocking the core.',
    puzzle: {
      type: 'dotlink',
      gridSize: 5,
      parMoves: 5,
      pairs: [
        makePair('coral', [[0,0],[1,0],[2,0],[3,0],[4,0]]),
        makePair('cobalt', [[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4]]),
        makePair('emerald', [[1,1],[1,2],[1,3],[2,3],[3,3],[4,3],[4,2]]),
        makePair('amber', [[4,1],[3,1],[2,1],[2,2],[3,2]]),
      ],
    },
  },
  {
    id: 'easy-s2-l2',
    difficulty: 'easy',
    stage: 2,
    level: 2,
    title: 'Voice Without Breath',
    subtitle: 'Listen closely to what answers back.',
    puzzle: {
      type: 'riddle',
      category: 'Nature Riddle',
      prompt: 'I speak without a mouth and hear without ears. I have nobody, yet I come alive with wind and canyons. What am I?',
      clues: [
        'Call out across a hollow valley and I return your words.',
        'Four letters, beginning with E.',
      ],
      answer: 'Echo',
      acceptedAnswers: ['echo', 'an echo'],
      explanation: 'An echo repeats every spoken word purely through reflected sound waves.',
    },
  },
  {
    id: 'easy-s2-l3',
    difficulty: 'easy',
    stage: 2,
    level: 3,
    title: 'Stepping Stones',
    subtitle: 'Deduce the next number in the rising cadence.',
    puzzle: {
      type: 'cipher',
      prompt: 'Each carved stone adds one more step than the jump before it. Which number completes the lock?',
      sequence: [
        { value: '2', sublabel: 'I' },
        { value: '4', sublabel: 'II' },
        { value: '7', sublabel: 'III' },
        { value: '11', sublabel: 'IV' },
        { value: '16', sublabel: 'V' },
      ],
      options: ['20', '21', '22', '24'],
      correctAnswer: '22',
      clues: [
        'Look at the gaps between consecutive stones: +2, +3, +4, +5.',
        'Add 6 to the final visible stone (16).',
      ],
      explanation: 'Differences grow by one each step (+2, +3, +4, +5, +6), so 16 + 6 = 22.',
    },
  },
  {
    id: 'easy-s2-l4',
    difficulty: 'easy',
    stage: 2,
    level: 4,
    title: 'Crosswind',
    subtitle: 'Five color pairs share one compact 5×5 square.',
    puzzle: {
      type: 'dotlink',
      gridSize: 5,
      parMoves: 6,
      pairs: [
        makePair('coral', [[0,0],[0,1],[0,2],[1,2],[2,2]]),
        makePair('cobalt', [[0,4],[0,3],[1,3],[2,3],[3,3]]),
        makePair('emerald', [[1,1],[1,0],[2,0],[3,0],[4,0]]),
        makePair('amber', [[2,1],[3,1],[3,2]]),
        makePair('violet', [[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1]]),
      ],
    },
  },
  {
    id: 'easy-s2-l5',
    difficulty: 'easy',
    stage: 2,
    level: 5,
    title: 'Courtyard Stones',
    subtitle: 'Eight pairs hide under the courtyard stones.',
    puzzle: {
      type: 'memory',
      rows: 4,
      cols: 4,
      pairs: 8,
      monochrome: false,
      parMoves: 14,
    },
  },

  // =========================================================================
  // EASY: STAGE 3
  // =========================================================================
  {
    id: 'easy-s3-l1',
    difficulty: 'easy',
    stage: 3,
    level: 1,
    title: 'Ember Switch',
    subtitle: 'Thread five pairs cleanly across the lantern floor.',
    puzzle: {
      type: 'dotlink',
      gridSize: 5,
      parMoves: 6,
      pairs: [
        makePair('coral', [[0,0],[1,0],[2,0],[2,1],[1,1]]),
        makePair('cobalt', [[0,1],[0,2],[0,3],[1,3],[1,2],[2,2]]),
        makePair('emerald', [[0,4],[1,4],[2,4],[2,3],[3,3],[3,4]]),
        makePair('amber', [[3,0],[4,0],[4,1],[3,1],[3,2]]),
        makePair('violet', [[4,2],[4,3],[4,4]]),
      ],
    },
  },
  {
    id: 'easy-s3-l2',
    difficulty: 'easy',
    stage: 3,
    level: 2,
    title: 'The Shrinking Flame',
    subtitle: 'Time measures itself in wax and light.',
    puzzle: {
      type: 'riddle',
      category: 'Object Riddle',
      prompt: 'My life can be measured in hours. I serve by being devoured. Thin, I am quick; fat, I am slow. Wind is my foe. What am I?',
      clues: [
        'You strike a match to awaken me at dusk.',
        'Six letters, starting with C.',
      ],
      answer: 'Candle',
      acceptedAnswers: ['candle', 'a candle', 'wax candle'],
      explanation: 'A candle burns faster when thin, slower when thick, and goes out in the wind.',
    },
  },
  {
    id: 'easy-s3-l3',
    difficulty: 'easy',
    stage: 3,
    level: 3,
    title: 'Four Corners',
    subtitle: 'Balance the constellation so every node shines.',
    puzzle: {
      type: 'lumen',
      gridSize: 3,
      solutionMoves: [{ r: 0, c: 2 }, { r: 2, c: 0 }, { r: 1, c: 2 }],
      parMoves: 3,
    },
  },
  {
    id: 'easy-s3-l4',
    difficulty: 'easy',
    stage: 3,
    level: 4,
    title: 'Keyless Door',
    subtitle: 'The Easy Tier finale riddle.',
    puzzle: {
      type: 'riddle',
      category: 'Wordplay Riddle',
      prompt: 'I have keys that open no locks, space without a room, and you may enter yet never step outside. What am I?',
      clues: [
        'Your fingers may be resting on one right now.',
        'Eight letters, ending in -board.',
      ],
      answer: 'Keyboard',
      acceptedAnswers: ['keyboard', 'a keyboard', 'computer keyboard'],
      explanation: 'A keyboard has keys, a space bar, and an Enter key.',
    },
  },
  {
    id: 'easy-s3-l5',
    difficulty: 'easy',
    stage: 3,
    level: 5,
    title: 'Lantern Pairs',
    subtitle: 'Every lantern has a twin somewhere in the dark.',
    puzzle: {
      type: 'memory',
      rows: 4,
      cols: 5,
      pairs: 10,
      monochrome: false,
      parMoves: 18,
    },
  },

  // =========================================================================
  // MEDIUM: STAGE 1
  // =========================================================================
  {
    id: 'medium-s1-l1',
    difficulty: 'medium',
    stage: 1,
    level: 1,
    title: 'Amber Corridor',
    subtitle: 'Step up to the 6×6 lattice with five long circuits.',
    puzzle: {
      type: 'dotlink',
      gridSize: 6,
      parMoves: 6,
      pairs: [
        makePair('coral', [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2]]),
        makePair('cobalt', [[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[4,3]]),
        makePair('emerald', [[2,2],[1,2],[1,1],[1,0],[2,0],[3,0],[4,0],[5,0]]),
        makePair('amber', [[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1]]),
        makePair('violet', [[2,1],[3,1],[4,1],[4,2]]),
      ],
    },
  },
  {
    id: 'medium-s1-l2',
    difficulty: 'medium',
    stage: 1,
    level: 2,
    title: 'The Unseen Companion',
    subtitle: 'It follows faithfully yet vanishes in pitch dark.',
    puzzle: {
      type: 'riddle',
      category: 'Lateral Riddle',
      prompt: 'Only one color, yet not one size. Stuck at the bottom, yet easily flies. Present in sun, absent in rain. Doing no harm and feeling no pain. What am I?',
      clues: [
        'Look behind or beside your feet under bright midday light.',
        'Six letters, starting with S.',
      ],
      answer: 'Shadow',
      acceptedAnswers: ['shadow', 'a shadow', 'your shadow'],
      explanation: 'A shadow stretches and shrinks with the sun, clings to your feet, and disappears on overcast rainy days.',
    },
  },
  {
    id: 'medium-s1-l3',
    difficulty: 'medium',
    stage: 1,
    level: 3,
    title: 'Cloister Array',
    subtitle: 'Restore light across all 16 tiles of the 4×4 matrix.',
    puzzle: {
      type: 'lumen',
      gridSize: 4,
      solutionMoves: [{ r: 0, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 0 }],
      parMoves: 3,
    },
  },
  {
    id: 'medium-s1-l4',
    difficulty: 'medium',
    stage: 1,
    level: 4,
    title: 'Double Helix',
    subtitle: 'Weave five currents cleanly through the center.',
    puzzle: {
      type: 'dotlink',
      gridSize: 6,
      parMoves: 7,
      pairs: [
        makePair('coral', [[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[1,2],[2,2]]),
        makePair('cobalt', [[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[4,4]]),
        makePair('emerald', [[1,1],[2,1],[3,1],[4,1],[4,0],[5,0]]),
        makePair('amber', [[1,4],[1,3],[2,3],[2,4],[3,4],[3,3],[3,2],[4,2],[4,3]]),
        makePair('violet', [[5,1],[5,2],[5,3],[5,4],[5,5]]),
      ],
    },
  },
  {
    id: 'medium-s1-l5',
    difficulty: 'medium',
    stage: 1,
    level: 5,
    title: 'Cloister Echoes',
    subtitle: 'Ten echoes, and each one is answered exactly once.',
    puzzle: {
      type: 'memory',
      rows: 4,
      cols: 5,
      pairs: 10,
      monochrome: false,
      parMoves: 17,
    },
  },

  // =========================================================================
  // MEDIUM: STAGE 2
  // =========================================================================
  {
    id: 'medium-s2-l1',
    difficulty: 'medium',
    stage: 2,
    level: 1,
    title: 'Clockwork Coil',
    subtitle: 'Wind the amber core without pinching the rim.',
    puzzle: {
      type: 'dotlink',
      gridSize: 6,
      parMoves: 7,
      pairs: [
        makePair('coral', [[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2]]),
        makePair('cobalt', [[1,2],[1,1],[2,1],[3,1],[4,1],[4,2]]),
        makePair('emerald', [[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]),
        makePair('amber', [[2,2],[3,2],[3,3],[2,3],[1,3],[1,4],[2,4],[3,4]]),
        makePair('violet', [[5,0],[5,1],[5,2],[5,3],[5,4],[4,4],[4,3]]),
      ],
    },
  },
  {
    id: 'medium-s2-l2',
    difficulty: 'medium',
    stage: 2,
    level: 2,
    title: 'The Fragile Word',
    subtitle: 'Even a whisper destroys it.',
    puzzle: {
      type: 'riddle',
      category: 'Poetic Riddle',
      prompt: 'So fragile am I that merely speaking my name breaks me in an instant. What am I?',
      clues: [
        'Libraries and quiet sanctuaries treasure me.',
        'Seven letters, starting with S.',
      ],
      answer: 'Silence',
      acceptedAnswers: ['silence', 'quiet'],
      explanation: 'Saying the word "silence" aloud immediately breaks the silence.',
    },
  },
  {
    id: 'medium-s2-l3',
    difficulty: 'medium',
    stage: 2,
    level: 3,
    title: 'Astronomer’s Dial',
    subtitle: 'Find the hidden rule binding these paired glyphs.',
    puzzle: {
      type: 'cipher',
      prompt: 'Each dial doubles the previous value and subtracts one. Which reading completes the telescope lock?',
      sequence: [
        { value: '3', sublabel: 'α' },
        { value: '5', sublabel: 'β' },
        { value: '9', sublabel: 'γ' },
        { value: '17', sublabel: 'δ' },
        { value: '33', sublabel: 'ε' },
      ],
      options: ['57', '64', '65', '66'],
      correctAnswer: '65',
      clues: [
        'Notice the gaps double every step: +2, +4, +8, +16.',
        'Compute (33 × 2) − 1.',
      ],
      explanation: 'Each term follows 2n − 1 (or adds powers of two: +2, +4, +8, +16, +32), yielding 33 + 32 = 65.',
    },
  },
  {
    id: 'medium-s2-l4',
    difficulty: 'medium',
    stage: 2,
    level: 4,
    title: 'Prism Vault',
    subtitle: 'Six distinct threads interlock in a 6×6 chamber.',
    puzzle: {
      type: 'dotlink',
      gridSize: 6,
      parMoves: 8,
      pairs: [
        makePair('coral', [[2,0],[1,0],[0,0],[0,1],[0,2],[1,2]]),
        makePair('cobalt', [[1,1],[2,1],[3,1],[3,0],[4,0],[5,0]]),
        makePair('emerald', [[0,3],[0,4],[0,5],[1,5],[2,5],[2,4]]),
        makePair('amber', [[1,4],[1,3],[2,3],[2,2],[3,2],[4,2],[4,3]]),
        makePair('violet', [[4,1],[5,1],[5,2],[5,3],[5,4],[5,5]]),
        makePair('cyan', [[3,3],[3,4],[3,5],[4,5],[4,4]]),
      ],
    },
  },
  {
    id: 'medium-s2-l5',
    difficulty: 'medium',
    stage: 2,
    level: 5,
    title: 'Star Charts',
    subtitle: 'Pair up twelve charts before the night ends.',
    puzzle: {
      type: 'memory',
      rows: 4,
      cols: 6,
      pairs: 12,
      monochrome: false,
      parMoves: 21,
    },
  },

  // =========================================================================
  // MEDIUM: STAGE 3
  // =========================================================================
  {
    id: 'medium-s3-l1',
    difficulty: 'medium',
    stage: 3,
    level: 1,
    title: 'Meridian Weave',
    subtitle: 'Connect all six color conduits without a single wasted square.',
    puzzle: {
      type: 'dotlink',
      gridSize: 6,
      parMoves: 8,
      pairs: [
        makePair('coral', [[0,2],[0,1],[0,0],[1,0],[2,0],[3,0]]),
        makePair('cobalt', [[1,1],[1,2],[1,3],[0,3],[0,4],[0,5]]),
        makePair('emerald', [[2,1],[2,2],[3,2],[3,1],[4,1],[4,0],[5,0]]),
        makePair('amber', [[2,3],[2,4],[1,4],[1,5],[2,5],[3,5]]),
        makePair('violet', [[3,3],[3,4],[4,4],[4,5],[5,5],[5,4]]),
        makePair('cyan', [[4,2],[4,3],[5,3],[5,2],[5,1]]),
      ],
    },
  },
  {
    id: 'medium-s3-l2',
    difficulty: 'medium',
    stage: 3,
    level: 2,
    title: 'The Endless Horizon',
    subtitle: 'Always approaching, never arrived.',
    puzzle: {
      type: 'riddle',
      category: 'Time Riddle',
      prompt: 'What is always on its way, promised to every soul, yet never actually arrives as itself?',
      clues: [
        'The moment it arrives, you call it Today instead.',
        'Eight letters, starting with T.',
      ],
      answer: 'Tomorrow',
      acceptedAnswers: ['tomorrow', 'the future'],
      explanation: 'Tomorrow is always ahead; as soon as midnight passes, it becomes today.',
    },
  },
  {
    id: 'medium-s3-l3',
    difficulty: 'medium',
    stage: 3,
    level: 3,
    title: 'Sundial Matrix',
    subtitle: 'Four precise flips restore the entire 4×4 sundial.',
    puzzle: {
      type: 'lumen',
      gridSize: 4,
      solutionMoves: [{ r: 0, c: 0 }, { r: 1, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 3 }],
      parMoves: 4,
    },
  },
  {
    id: 'medium-s3-l4',
    difficulty: 'medium',
    stage: 3,
    level: 4,
    title: 'The Weightless Carver',
    subtitle: 'The Medium Tier finale riddle.',
    puzzle: {
      type: 'riddle',
      category: 'Paradox Riddle',
      prompt: 'The more of me you take away, the larger I become. Put me in a wooden barrel and I make it lighter. What am I?',
      clues: [
        'Digging into the earth creates me.',
        'Four letters, starting with H.',
      ],
      answer: 'Hole',
      acceptedAnswers: ['hole', 'a hole'],
      explanation: 'Removing material enlarges a hole, and carving a hole into a barrel reduces its weight.',
    },
  },
  {
    id: 'medium-s3-l5',
    difficulty: 'medium',
    stage: 3,
    level: 5,
    title: 'Sundial Shadows',
    subtitle: 'Fifteen pairs. Remember where each shadow fell.',
    puzzle: {
      type: 'memory',
      rows: 5,
      cols: 6,
      pairs: 15,
      monochrome: false,
      parMoves: 26,
    },
  },

  // =========================================================================
  // HARD: STAGE 1
  // =========================================================================
  {
    id: 'hard-s1-l1',
    difficulty: 'hard',
    stage: 1,
    level: 1,
    title: 'Obsidian Circuit',
    subtitle: 'Enter the 7×7 master grid with six interlocking lines.',
    puzzle: {
      type: 'dotlink',
      gridSize: 7,
      parMoves: 9,
      pairs: [
        makePair('coral', [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,2],[1,2]]),
        makePair('cobalt', [[1,1],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1]]),
        makePair('emerald', [[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[3,3],[3,2],[3,1],[2,1]]),
        makePair('amber', [[1,6],[1,5],[2,5],[3,5],[4,5],[4,4],[4,3],[4,2],[4,1]]),
        makePair('violet', [[2,6],[3,6],[4,6],[5,6],[6,6],[6,5],[5,5]]),
        makePair('cyan', [[5,1],[5,2],[5,3],[5,4],[6,4],[6,3],[6,2]]),
      ],
    },
  },
  {
    id: 'hard-s1-l2',
    difficulty: 'hard',
    stage: 1,
    level: 2,
    title: 'The Silent Devourer',
    subtitle: 'A master riddle of permanence and decay.',
    puzzle: {
      type: 'riddle',
      category: 'Master Riddle',
      prompt: 'This thing all things devours: birds, beasts, trees, flowers; gnaws iron, bites steel; grinds hard stones to meal. What am I?',
      clues: [
        'Clocks and hourglasses measure my steady passage.',
        'Four letters, starting with T.',
      ],
      answer: 'Time',
      acceptedAnswers: ['time'],
      explanation: 'Nothing escapes time: it erodes stone, rusts iron, and outlasts every living thing.',
    },
  },
  {
    id: 'hard-s1-l3',
    difficulty: 'hard',
    stage: 1,
    level: 3,
    title: 'Citadel Beacon',
    subtitle: 'Bring all 25 nodes of the 5×5 beacon to full luminescence.',
    puzzle: {
      type: 'lumen',
      gridSize: 5,
      solutionMoves: [
        { r: 0, c: 2 },
        { r: 2, c: 0 },
        { r: 2, c: 4 },
        { r: 4, c: 2 },
      ],
      parMoves: 4,
    },
  },
  {
    id: 'hard-s1-l4',
    difficulty: 'hard',
    stage: 1,
    level: 4,
    title: 'Cathedral Knot',
    subtitle: 'Six folded conduits span every corner of the 7×7 hall.',
    puzzle: {
      type: 'dotlink',
      gridSize: 7,
      parMoves: 9,
      pairs: [
        makePair('coral', [[2,0],[1,0],[0,0],[0,1],[1,1],[2,1],[2,2],[1,2],[0,2]]),
        makePair('cobalt', [[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6]]),
        makePair('emerald', [[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[4,0],[5,0],[6,0]]),
        makePair('amber', [[1,4],[1,5],[2,5],[2,4],[3,4],[3,5],[4,5],[4,4]]),
        makePair('violet', [[4,1],[5,1],[6,1],[6,2],[5,2],[4,2],[4,3],[5,3]]),
        makePair('cyan', [[6,3],[6,4],[5,4],[5,5],[6,5],[6,6],[5,6]]),
      ],
    },
  },
  {
    id: 'hard-s1-l5',
    difficulty: 'hard',
    stage: 1,
    level: 5,
    title: 'Citadel Seals',
    subtitle: 'Every seal is cast in the same ink. Only the shape gives it away.',
    puzzle: {
      type: 'memory',
      rows: 4,
      cols: 6,
      pairs: 12,
      monochrome: true,
      parMoves: 21,
    },
  },

  // =========================================================================
  // HARD: STAGE 2
  // =========================================================================
  {
    id: 'hard-s2-l1',
    difficulty: 'hard',
    stage: 2,
    level: 1,
    title: 'Labyrinth Ring',
    subtitle: 'Route six tight serpentine paths through the 7×7 vault.',
    puzzle: {
      type: 'dotlink',
      gridSize: 7,
      parMoves: 10,
      pairs: [
        makePair('coral', [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[2,1],[1,1]]),
        makePair('cobalt', [[0,1],[0,2],[0,3],[0,4],[1,4],[1,3],[1,2],[2,2]]),
        makePair('emerald', [[0,5],[0,6],[1,6],[1,5],[2,5],[2,6],[3,6],[4,6],[5,6],[6,6]]),
        makePair('amber', [[3,2],[4,2],[4,3],[3,3],[2,3],[2,4],[3,4],[3,5],[4,5]]),
        makePair('violet', [[5,0],[6,0],[6,1],[5,1],[5,2],[6,2],[6,3],[5,3]]),
        makePair('cyan', [[4,4],[5,4],[6,4],[6,5],[5,5]]),
      ],
    },
  },
  {
    id: 'hard-s2-l2',
    difficulty: 'hard',
    stage: 2,
    level: 2,
    title: 'The Three-Faced Craft',
    subtitle: 'A riddle of maker, buyer, and user.',
    puzzle: {
      type: 'riddle',
      category: 'Cryptic Riddle',
      prompt: 'The person who builds me sells me. The person who buys me never uses me. The person who uses me never sees or knows me. What am I?',
      clues: [
        'It is crafted by carpenters for a final resting place.',
        'Six letters, starting with C.',
      ],
      answer: 'Coffin',
      acceptedAnswers: ['coffin', 'a coffin', 'casket', 'a casket'],
      explanation: 'A carpenter sells the coffin, mourners buy it, and the departed rests inside without knowing.',
    },
  },
  {
    id: 'hard-s2-l3',
    difficulty: 'hard',
    stage: 2,
    level: 3,
    title: 'Vault of Primes',
    subtitle: 'Uncover the dual-layer rule governing the Astral Seal.',
    puzzle: {
      type: 'cipher',
      prompt: 'Each carved rune equals the square of a consecutive prime number, minus one. Which value breaks the seal?',
      sequence: [
        { value: '3', sublabel: 'p₁' },
        { value: '8', sublabel: 'p₂' },
        { value: '24', sublabel: 'p₃' },
        { value: '48', sublabel: 'p₄' },
        { value: '120', sublabel: 'p₅' },
      ],
      options: ['143', '168', '195', '224'],
      correctAnswer: '168',
      clues: [
        'Add 1 to each number: 4, 9, 25, 49, 121. Those are 2², 3², 5², 7², 11².',
        'The next prime after 11 is 13. Compute 13² − 1.',
      ],
      explanation: 'The sequence is p² − 1 for primes 2, 3, 5, 7, 11, 13. Thus 13² − 1 = 169 − 1 = 168.',
    },
  },
  {
    id: 'hard-s2-l4',
    difficulty: 'hard',
    stage: 2,
    level: 4,
    title: 'Astral Braid',
    subtitle: 'Six intertwined arcs lock the second Hard stage.',
    puzzle: {
      type: 'dotlink',
      gridSize: 7,
      parMoves: 10,
      pairs: [
        makePair('coral', [[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]),
        makePair('cobalt', [[1,1],[1,2],[1,3],[1,4],[0,4],[0,5],[0,6],[1,6]]),
        makePair('emerald', [[2,1],[2,2],[2,3],[3,3],[3,2],[3,1],[4,1],[4,2]]),
        makePair('amber', [[1,5],[2,5],[2,6],[3,6],[3,5],[3,4],[2,4]]),
        makePair('violet', [[6,0],[6,1],[5,1],[5,2],[6,2],[6,3],[5,3],[4,3],[4,4]]),
        makePair('cyan', [[4,5],[4,6],[5,6],[6,6],[6,5],[5,5],[5,4],[6,4]]),
      ],
    },
  },
  {
    id: 'hard-s2-l5',
    difficulty: 'hard',
    stage: 2,
    level: 5,
    title: 'Vault Ledger',
    subtitle: 'Fifteen pairs in one color. Trust your memory, not your eyes.',
    puzzle: {
      type: 'memory',
      rows: 5,
      cols: 6,
      pairs: 15,
      monochrome: true,
      parMoves: 26,
    },
  },

  // =========================================================================
  // HARD: STAGE 3
  // =========================================================================
  {
    id: 'hard-s3-l1',
    difficulty: 'hard',
    stage: 3,
    level: 1,
    title: 'Sovereign Lattice',
    subtitle: 'Our deepest concentric 7×7 Dot Link chamber.',
    puzzle: {
      type: 'dotlink',
      gridSize: 7,
      parMoves: 10,
      pairs: [
        makePair('coral', [[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4]]),
        makePair('cobalt', [[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[6,5]]),
        makePair('emerald', [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,2],[5,2]]),
        makePair('amber', [[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5]]),
        makePair('violet', [[2,2],[2,3],[2,4],[3,4],[4,4],[5,4],[6,4]]),
        makePair('cyan', [[3,3],[3,2],[4,2],[4,3],[5,3],[6,3]]),
      ],
    },
  },
  {
    id: 'hard-s3-l2',
    difficulty: 'hard',
    stage: 3,
    level: 2,
    title: 'The Hungry Element',
    subtitle: 'Feed it to watch it rise; quench it to watch it fall.',
    puzzle: {
      type: 'riddle',
      category: 'Elemental Riddle',
      prompt: 'I am not alive, yet I grow. I have no lungs, yet I need air. I have no mouth, yet water kills me. What am I?',
      clues: [
        'Hearth and forge both depend upon my warmth.',
        'Four letters, starting with F.',
      ],
      answer: 'Fire',
      acceptedAnswers: ['fire', 'flame', 'a fire', 'a flame'],
      explanation: 'Fire grows with fuel, requires oxygen, and is extinguished by water.',
    },
  },
  {
    id: 'hard-s3-l3',
    difficulty: 'hard',
    stage: 3,
    level: 3,
    title: 'Crown Constellation',
    subtitle: 'Five exact activations awaken the final 5×5 star field.',
    puzzle: {
      type: 'lumen',
      gridSize: 5,
      solutionMoves: [
        { r: 1, c: 1 },
        { r: 1, c: 3 },
        { r: 2, c: 2 },
        { r: 3, c: 1 },
        { r: 3, c: 3 },
      ],
      parMoves: 5,
    },
  },
  {
    id: 'hard-s3-l4',
    difficulty: 'hard',
    stage: 3,
    level: 4,
    title: 'The Grand Sovereign',
    subtitle: 'The final riddle of LATTICE.',
    puzzle: {
      type: 'riddle',
      category: 'Grand Finale Riddle',
      prompt: 'I can be cracked, made, told, and played. Yet even in silence, a clever mind keeps me inside a lock or a laugh. Wait, I have no lock of iron, only wit. What am I?',
      clues: [
        'You tell me to friends to make them smile.',
        'Four letters, starting with J.',
      ],
      answer: 'Joke',
      acceptedAnswers: ['joke', 'a joke'],
      explanation: 'A joke can be cracked, made, told, and played.',
    },
  },
  {
    id: 'hard-s3-l5',
    difficulty: 'hard',
    stage: 3,
    level: 5,
    title: 'Sovereign\'s Hall',
    subtitle: 'The final hall: eighteen pairs in a single shade.',
    puzzle: {
      type: 'memory',
      rows: 6,
      cols: 6,
      pairs: 18,
      monochrome: true,
      parMoves: 32,
    },
  },
];

export function getLevelById(id: string): LevelDef | undefined {
  return LEVELS.find((lvl) => lvl.id === id);
}

export function getLevelsByDifficulty(difficulty: Difficulty): LevelDef[] {
  return LEVELS.filter((lvl) => lvl.difficulty === difficulty);
}

export function getLevelsByStage(difficulty: Difficulty, stage: number): LevelDef[] {
  return LEVELS.filter((lvl) => lvl.difficulty === difficulty && lvl.stage === stage);
}

export function getNextLevel(currentId: string): LevelDef | null {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx + 1 >= LEVELS.length) return null;
  return LEVELS[idx + 1];
}
