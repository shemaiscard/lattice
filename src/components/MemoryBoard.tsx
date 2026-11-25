import { useEffect, useRef, useState } from 'react';
import {
  Anchor,
  Bell,
  Cloud,
  Compass,
  Crown,
  Feather,
  Flame,
  Gem,
  Heart,
  KeyRound,
  Leaf,
  Moon,
  Music,
  Rocket,
  Snowflake,
  Star,
  Sun,
  Zap,
} from 'lucide-react';
import type { MemoryPuzzle } from '../game/types';
import {
  createMemoryState,
  flipMemoryCard,
  getMemoryStats,
  hideMemoryMiss,
  type MemoryState,
} from '../game/engine';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

interface MemoryBoardProps {
  levelId: string;
  puzzle: MemoryPuzzle;
  resetToken: number;
  hintToken: number;
  onMove: () => void;
  onSolved: () => void;
  onBurst: (x: number, y: number, color: string) => void;
}

/** 18 symbols, enough for the largest board (6 x 6). Colors repeat, icons never do. */
const SYMBOLS = [
  { name: 'Sun', Icon: Sun, color: '#E89A0C' },
  { name: 'Moon', Icon: Moon, color: '#4C6FFF' },
  { name: 'Star', Icon: Star, color: '#8B5CF6' },
  { name: 'Heart', Icon: Heart, color: '#E2487A' },
  { name: 'Leaf', Icon: Leaf, color: '#12A170' },
  { name: 'Flame', Icon: Flame, color: '#EA6A1A' },
  { name: 'Snowflake', Icon: Snowflake, color: '#0EA5C6' },
  { name: 'Anchor', Icon: Anchor, color: '#F05A4F' },
  { name: 'Feather', Icon: Feather, color: '#65A30D' },
  { name: 'Gem', Icon: Gem, color: '#0EA5C6' },
  { name: 'Crown', Icon: Crown, color: '#E89A0C' },
  { name: 'Key', Icon: KeyRound, color: '#F05A4F' },
  { name: 'Bell', Icon: Bell, color: '#EA6A1A' },
  { name: 'Music note', Icon: Music, color: '#8B5CF6' },
  { name: 'Cloud', Icon: Cloud, color: '#4C6FFF' },
  { name: 'Lightning', Icon: Zap, color: '#65A30D' },
  { name: 'Compass', Icon: Compass, color: '#12A170' },
  { name: 'Rocket', Icon: Rocket, color: '#E2487A' },
] as const;

const MISS_VISIBLE_MS = 850;
const PEEK_MS = 1400;

export function MemoryBoard({
  levelId,
  puzzle,
  resetToken,
  hintToken,
  onMove,
  onSolved,
  onBurst,
}: MemoryBoardProps) {
  const [state, setState] = useState<MemoryState>(() => createMemoryState(puzzle));
  const [peeking, setPeeking] = useState(false);
  const [solvedTriggered, setSolvedTriggered] = useState(false);
  const prevHintTokenRef = useRef(hintToken);

  // A fresh shuffle on every start and every reset.
  useEffect(() => {
    setState(createMemoryState(puzzle));
    setPeeking(false);
    setSolvedTriggered(false);
  }, [levelId, puzzle, resetToken]);

  // A missed pair stays visible for a moment, then turns back over.
  useEffect(() => {
    if (state.open.length !== 2) return;
    const timer = setTimeout(() => setState((s) => hideMemoryMiss(s)), MISS_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [state.open]);

  // Hint: show every card face up for a short peek.
  useEffect(() => {
    if (hintToken === prevHintTokenRef.current) return;
    prevHintTokenRef.current = hintToken;
    if (solvedTriggered) return;
    setPeeking(true);
    triggerHaptic('hint');
    playSound('hint');
  }, [hintToken, solvedTriggered]);

  useEffect(() => {
    if (!peeking) return;
    const timer = setTimeout(() => setPeeking(false), PEEK_MS);
    return () => clearTimeout(timer);
  }, [peeking]);

  const stats = getMemoryStats(state);

  const handleCardClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (solvedTriggered || peeking) return;
    const { state: next, outcome } = flipMemoryCard(state, index);
    if (outcome === 'ignored') return;
    setState(next);

    if (outcome === 'first') {
      triggerHaptic('tap');
      playSound('toggle', index);
      return;
    }

    onMove();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (outcome === 'miss') {
      triggerHaptic('tap');
      playSound('step', index);
      return;
    }

    const symbol = SYMBOLS[next.deck[index]];
    if (getMemoryStats(next).isSolved) {
      setSolvedTriggered(true);
      triggerHaptic('connect');
      playSound('connect');
      onBurst(x, y, '#F5A524');
      setTimeout(() => onSolved(), 420);
    } else {
      triggerHaptic('connect');
      playSound('connect');
      onBurst(x, y, puzzle.monochrome ? '#2B4EFF' : symbol.color);
    }
  };

  return (
    <div
      className="flex w-full flex-col items-center gap-4"
      style={{ maxWidth: Math.min(560, puzzle.cols * 96) }}
    >
      <div className="flex w-full items-center justify-between gap-3 px-1 text-xs font-medium text-[#5A606B] dark:text-[#94A0B8]">
        <span className="tabular-nums">
          Pairs found{' '}
          <strong className="text-[#181A1F] dark:text-[#F3F5F8]">
            {stats.pairsFound}/{stats.totalPairs}
          </strong>
        </span>
        <span className="text-right">
          {puzzle.monochrome ? 'One color: match by shape' : 'Turn over two cards to find a match'}
        </span>
      </div>

      <div
        data-testid="memory-board"
        className="w-full rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-2.5 shadow-[0_14px_36px_rgba(24,26,31,0.08)] sm:p-3.5 dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)]"
      >
        <div
          className="grid w-full gap-1.5 sm:gap-2.5"
          style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
        >
          {state.deck.map((symbolIndex, index) => {
            const symbol = SYMBOLS[symbolIndex];
            const matched = state.matched[index];
            const faceUp = matched || peeking || state.open.includes(index);
            const r = Math.floor(index / puzzle.cols) + 1;
            const c = (index % puzzle.cols) + 1;
            const SymbolIcon = symbol.Icon;
            return (
              <button
                key={`${resetToken}-${index}`}
                type="button"
                aria-label={`Card row ${r} column ${c}, ${
                  faceUp ? symbol.name : 'face down'
                }${matched ? ', matched' : ''}`}
                disabled={matched}
                onClick={(e) => handleCardClick(index, e)}
                className="relative aspect-square w-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EFF] dark:focus-visible:outline-[#F5A524]"
                style={{ perspective: '700px' }}
              >
                <span
                  className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Back of the card */}
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-xl border border-[#2B4EFF] bg-[#2B4EFF] text-white/70 shadow-[0_5px_14px_rgba(43,78,255,0.22)] dark:border-[#F5A524] dark:bg-[#F5A524] dark:text-[#0D1017]/55 dark:shadow-[0_5px_16px_rgba(245,165,36,0.22)]"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    <svg viewBox="0 0 24 24" className="h-[38%] w-[38%]" aria-hidden="true">
                      <path
                        d="M12 3 21 12 12 21 3 12Z M12 8 16 12 12 16 8 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  {/* Face of the card */}
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-xl border bg-[#FBFAF6] dark:bg-[#1C2333] ${
                      matched
                        ? 'border-emerald-500 ring-2 ring-emerald-500/35 dark:border-emerald-400'
                        : 'border-[#E2E0D8] dark:border-[#293448]'
                    } ${puzzle.monochrome ? 'text-[#181A1F] dark:text-[#F3F5F8]' : ''}`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      color: puzzle.monochrome ? undefined : symbol.color,
                    }}
                  >
                    <SymbolIcon className="h-[46%] w-[46%]" strokeWidth={2.1} aria-hidden="true" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-[#5A606B] dark:text-[#94A0B8]">
        Par target:{' '}
        <span className="font-mono font-semibold text-[#181A1F] dark:text-[#F3F5F8]">
          {puzzle.parMoves}
        </span>{' '}
        pair attempts
      </p>
    </div>
  );
}
