import { useEffect, useMemo, useRef, useState } from 'react';
import type { Coord, LumenPuzzle } from '../game/types';
import { createInitialLumenGrid, getLumenStats, toggleLumenCell } from '../game/engine';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

interface LumenBoardProps {
  levelId: string;
  puzzle: LumenPuzzle;
  resetToken: number;
  hintToken: number;
  onMove: () => void;
  onSolved: () => void;
  onBurst: (x: number, y: number, color: string) => void;
}

export function LumenBoard({
  levelId,
  puzzle,
  resetToken,
  hintToken,
  onMove,
  onSolved,
  onBurst,
}: LumenBoardProps) {
  const [grid, setGrid] = useState<boolean[][]>(() => createInitialLumenGrid(puzzle));
  const [playerParity, setPlayerParity] = useState<Set<string>>(() => new Set());
  const [hintedKey, setHintedKey] = useState<string | null>(null);
  const [solvedTriggered, setSolvedTriggered] = useState(false);
  const prevHintTokenRef = useRef(hintToken);

  useEffect(() => {
    setGrid(createInitialLumenGrid(puzzle));
    setPlayerParity(new Set());
    setHintedKey(null);
    setSolvedTriggered(false);
  }, [levelId, puzzle, resetToken]);

  // Compute remaining moves needed by XORing original solutionMoves with playerParity
  const remainingSolutionKeys = useMemo(() => {
    const needed = new Set<string>(puzzle.solutionMoves.map((m) => `${m.r},${m.c}`));
    for (const k of playerParity) {
      if (needed.has(k)) needed.delete(k);
      else needed.add(k);
    }
    return Array.from(needed);
  }, [puzzle.solutionMoves, playerParity]);

  useEffect(() => {
    if (hintToken === prevHintTokenRef.current) return;
    prevHintTokenRef.current = hintToken;
    if (solvedTriggered || remainingSolutionKeys.length === 0) return;
    setHintedKey(remainingSolutionKeys[0]);
    triggerHaptic('hint');
    playSound('hint');
  }, [hintToken, remainingSolutionKeys, solvedTriggered]);

  const stats = useMemo(() => getLumenStats(grid), [grid]);

  const handleTileClick = (cell: Coord, e: React.MouseEvent<HTMLButtonElement>) => {
    if (solvedTriggered) return;
    const key = `${cell.r},${cell.c}`;
    const nextGrid = toggleLumenCell(grid, cell);
    setGrid(nextGrid);
    setPlayerParity((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (hintedKey === key) setHintedKey(null);

    onMove();
    const rect = e.currentTarget.getBoundingClientRect();
    const nextStats = getLumenStats(nextGrid);
    if (nextStats.isSolved) {
      setSolvedTriggered(true);
      triggerHaptic('connect');
      playSound('connect');
      onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#F5A524');
      setTimeout(() => onSolved(), 280);
    } else {
      triggerHaptic('toggle');
      playSound('toggle', cell.r + cell.c);
    }
  };

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between px-1 text-xs font-medium text-[#5A606B] dark:text-[#94A0B8]">
        <span className="tabular-nums">
          Illuminated <strong className="text-[#181A1F] dark:text-[#F3F5F8]">{stats.litCount}/{stats.totalCells}</strong>
        </span>
        <span>Tap any tile to flip it and its 4 neighbors</span>
      </div>

      <div
        data-testid="lumen-board"
        className="aspect-square w-full rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-3.5 shadow-[0_14px_36px_rgba(24,26,31,0.08)] dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)]"
      >
        <div
          className="grid h-full w-full gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((isLit, c) => {
              const key = `${r},${c}`;
              const isHinted = hintedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Tile row ${r + 1} column ${c + 1}, ${isLit ? 'lit' : 'dim'}${isHinted ? ', hinted' : ''}`}
                  aria-pressed={isLit}
                  onClick={(e) => handleTileClick({ r, c }, e)}
                  className={`relative flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EFF] dark:focus-visible:outline-[#F5A524] ${
                    isLit
                      ? 'scale-100 border-[#2B4EFF] bg-[#2B4EFF] text-white shadow-[0_6px_18px_rgba(43,78,255,0.28)] dark:border-[#F5A524] dark:bg-[#F5A524] dark:text-[#0D1017] dark:shadow-[0_6px_22px_rgba(245,165,36,0.3)]'
                      : 'scale-[0.96] border-[#E2E0D8] bg-[#F2F0E8] text-[#8E94A0] hover:border-[#C9C6BA] dark:border-[#293448] dark:bg-[#1C2333] dark:text-[#5B6780] dark:hover:border-[#3D4B66]'
                  } ${isHinted ? 'ring-3 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-[#141923]' : ''}`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                    {isLit ? (
                      <polygon points="12,3 15,9 21,12 15,15 12,21 9,15 3,12 9,9" fill="currentColor" />
                    ) : (
                      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    )}
                  </svg>
                </button>
              );
            })
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#5A606B] dark:text-[#94A0B8]">
        Par target: <span className="font-mono font-semibold text-[#181A1F] dark:text-[#F3F5F8]">{puzzle.parMoves}</span> flips
      </p>
    </div>
  );
}
