import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Coord, DotColorId, DotLinkPuzzle, DotPairDef } from '../game/types';
import {
  applyDotLinkHint,
  coordsEqual,
  findEndpointAt,
  getDotLinkStats,
  isOrthogonallyAdjacent,
  isPairConnected,
  startDotLinkAt,
  stepDotLinkTo,
  type DotLinkPaths,
} from '../game/engine';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

export const DOT_PALETTE: Record<
  DotColorId,
  { hex: string; softBg: string; ring: string; darkGlow: string }
> = {
  coral: {
    hex: '#E84A5F',
    softBg: 'rgba(232, 74, 95, 0.16)',
    ring: 'rgba(232, 74, 95, 0.45)',
    darkGlow: 'rgba(232, 74, 95, 0.35)',
  },
  cobalt: {
    hex: '#2E7CF6',
    softBg: 'rgba(46, 124, 246, 0.16)',
    ring: 'rgba(46, 124, 246, 0.45)',
    darkGlow: 'rgba(46, 124, 246, 0.35)',
  },
  emerald: {
    hex: '#10B981',
    softBg: 'rgba(16, 185, 129, 0.16)',
    ring: 'rgba(16, 185, 129, 0.45)',
    darkGlow: 'rgba(16, 185, 129, 0.35)',
  },
  amber: {
    hex: '#F59E0B',
    softBg: 'rgba(245, 158, 11, 0.18)',
    ring: 'rgba(245, 158, 11, 0.45)',
    darkGlow: 'rgba(245, 158, 11, 0.35)',
  },
  violet: {
    hex: '#9333EA',
    softBg: 'rgba(147, 51, 234, 0.16)',
    ring: 'rgba(147, 51, 234, 0.45)',
    darkGlow: 'rgba(147, 51, 234, 0.35)',
  },
  cyan: {
    hex: '#06B6D4',
    softBg: 'rgba(6, 182, 212, 0.16)',
    ring: 'rgba(6, 182, 212, 0.45)',
    darkGlow: 'rgba(6, 182, 212, 0.35)',
  },
};

function DotShapeGlyph({ shape }: { shape: DotPairDef['shape'] }) {
  switch (shape) {
    case 'circle':
      return <circle cx="12" cy="12" r="4.5" fill="currentColor" />;
    case 'diamond':
      return <polygon points="12,5.5 18.5,12 12,18.5 5.5,12" fill="currentColor" />;
    case 'triangle':
      return <polygon points="12,6 18.5,17.5 5.5,17.5" fill="currentColor" />;
    case 'square':
      return <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />;
    case 'star':
      return (
        <polygon
          points="12,5 14.1,9.3 18.8,9.9 15.4,13.2 16.2,17.9 12,15.6 7.8,17.9 8.6,13.2 5.2,9.9 9.9,9.3"
          fill="currentColor"
        />
      );
    case 'hexagon':
      return (
        <polygon
          points="12,5.5 17.6,8.75 17.6,15.25 12,18.5 6.4,15.25 6.4,8.75"
          fill="currentColor"
        />
      );
  }
}

interface DotLinkBoardProps {
  levelId: string;
  puzzle: DotLinkPuzzle;
  resetToken: number;
  hintToken: number;
  onMove: () => void;
  onSolved: () => void;
  onBurst: (x: number, y: number, color: string) => void;
}

export function DotLinkBoard({
  levelId,
  puzzle,
  resetToken,
  hintToken,
  onMove,
  onSolved,
  onBurst,
}: DotLinkBoardProps) {
  const [paths, setPaths] = useState<DotLinkPaths>({});
  const [activeColor, setActiveColor] = useState<DotColorId | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pulseCell, setPulseCell] = useState<string | null>(null);
  const [solvedTriggered, setSolvedTriggered] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const pathsRef = useRef<DotLinkPaths>(paths);
  const activeColorRef = useRef<DotColorId | null>(activeColor);
  const dragMovedRef = useRef(false);
  const prevHintTokenRef = useRef(hintToken);

  pathsRef.current = paths;
  activeColorRef.current = activeColor;

  // Reset board on level change or explicit reset
  useEffect(() => {
    setPaths({});
    setActiveColor(null);
    setIsDragging(false);
    setPulseCell(null);
    setSolvedTriggered(false);
  }, [levelId, resetToken]);

  const emitCellBurst = useCallback(
    (cell: Coord, colorId: DotColorId) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cellW = rect.width / puzzle.gridSize;
      const cellH = rect.height / puzzle.gridSize;
      const cx = rect.left + (cell.c + 0.5) * cellW;
      const cy = rect.top + (cell.r + 0.5) * cellH;
      onBurst(cx, cy, DOT_PALETTE[colorId].hex);
    },
    [onBurst, puzzle.gridSize]
  );

  // Trigger hint when HUD hint button increments hintToken
  useEffect(() => {
    if (hintToken === prevHintTokenRef.current) return;
    prevHintTokenRef.current = hintToken;
    if (solvedTriggered) return;

    const { paths: nextPaths, revealedColor } = applyDotLinkHint(puzzle, pathsRef.current);
    if (revealedColor) {
      setPaths(nextPaths);
      setActiveColor(null);
      triggerHaptic('hint');
      playSound('hint');
      const pair = puzzle.pairs.find((p) => p.id === revealedColor);
      if (pair) emitCellBurst(pair.end, revealedColor);
      if (getDotLinkStats(puzzle, nextPaths).isSolved) {
        setSolvedTriggered(true);
        setTimeout(() => onSolved(), 280);
      }
    }
  }, [hintToken, puzzle, solvedTriggered, emitCellBurst, onSolved]);

  const stats = useMemo(() => getDotLinkStats(puzzle, paths), [puzzle, paths]);

  const cellToCoordFromPointer = useCallback(
    (clientX: number, clientY: number): Coord | null => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
      const c = Math.floor((x / rect.width) * puzzle.gridSize);
      const r = Math.floor((y / rect.height) * puzzle.gridSize);
      if (r < 0 || r >= puzzle.gridSize || c < 0 || c >= puzzle.gridSize) return null;
      return { r, c };
    },
    [puzzle.gridSize]
  );

  const commitWinCheck = useCallback(
    (nextPaths: DotLinkPaths) => {
      if (solvedTriggered) return;
      if (getDotLinkStats(puzzle, nextPaths).isSolved) {
        setSolvedTriggered(true);
        setIsDragging(false);
        setActiveColor(null);
        setTimeout(() => onSolved(), 260);
      }
    },
    [puzzle, solvedTriggered, onSolved]
  );

  const handleCellSelect = useCallback(
    (cell: Coord) => {
      if (solvedTriggered) return;

      const curActive = activeColorRef.current;
      const curPaths = pathsRef.current;

      // Support accessible click-to-step: if a color is already selected and clicked cell is adjacent, step to it!
      if (curActive) {
        const curPath = curPaths[curActive] ?? [];
        const head = curPath[curPath.length - 1];
        if (head && isOrthogonallyAdjacent(head, cell)) {
          const endpointHere = findEndpointAt(puzzle, cell);
          if (!endpointHere || endpointHere === curActive) {
            const res = stepDotLinkTo(puzzle, curPaths, curActive, cell);
            if (res.changed) {
              setPaths(res.paths);
              setPulseCell(`${cell.r}-${cell.c}`);
              if (res.connectedPair) {
                triggerHaptic('connect');
                playSound('connect');
                emitCellBurst(cell, res.connectedPair);
                setActiveColor(null);
                onMove();
              } else {
                triggerHaptic('step');
                playSound('step', (res.paths[curActive]?.length ?? 1) - 1);
              }
              commitWinCheck(res.paths);
              return;
            }
          }
        }
      }

      // Otherwise start/resume from this cell
      const startRes = startDotLinkAt(puzzle, curPaths, cell);
      if (startRes.activeColor) {
        setPaths(startRes.paths);
        setActiveColor(startRes.activeColor);
        setPulseCell(`${cell.r}-${cell.c}`);
        triggerHaptic('tap');
        playSound('tap');
        onMove();
      }
    },
    [puzzle, solvedTriggered, emitCellBurst, onMove, commitWinCheck]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (solvedTriggered) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const cell = cellToCoordFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    dragMovedRef.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);

    const curActive = activeColorRef.current;
    const curPaths = pathsRef.current;

    // If user clicks an adjacent cell of an active non-dragging path, step into it and start dragging
    if (curActive) {
      const curPath = curPaths[curActive] ?? [];
      const head = curPath[curPath.length - 1];
      if (head && isOrthogonallyAdjacent(head, cell)) {
        const ep = findEndpointAt(puzzle, cell);
        if (!ep || ep === curActive) {
          const stepRes = stepDotLinkTo(puzzle, curPaths, curActive, cell);
          if (stepRes.changed) {
            setPaths(stepRes.paths);
            setIsDragging(!stepRes.connectedPair);
            setPulseCell(`${cell.r}-${cell.c}`);
            dragMovedRef.current = true;
            if (stepRes.connectedPair) {
              triggerHaptic('connect');
              playSound('connect');
              emitCellBurst(cell, stepRes.connectedPair);
              setActiveColor(null);
            } else {
              triggerHaptic('step');
              playSound('step', (stepRes.paths[curActive]?.length ?? 1) - 1);
            }
            commitWinCheck(stepRes.paths);
            return;
          }
        }
      }
    }

    const res = startDotLinkAt(puzzle, curPaths, cell);
    if (res.activeColor) {
      setPaths(res.paths);
      setActiveColor(res.activeColor);
      setIsDragging(true);
      setPulseCell(`${cell.r}-${cell.c}`);
      triggerHaptic('tap');
      playSound('tap');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !activeColorRef.current || solvedTriggered) return;
    const cell = cellToCoordFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    const color = activeColorRef.current;
    const res = stepDotLinkTo(puzzle, pathsRef.current, color, cell);
    if (!res.changed) return;

    dragMovedRef.current = true;
    setPaths(res.paths);
    setPulseCell(`${cell.r}-${cell.c}`);

    if (res.connectedPair) {
      triggerHaptic('connect');
      playSound('connect');
      emitCellBurst(cell, res.connectedPair);
      onMove();
      setIsDragging(false);
      setActiveColor(null);
      commitWinCheck(res.paths);
    } else {
      triggerHaptic('step');
      playSound('step', (res.paths[color]?.length ?? 1) - 1);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      if (dragMovedRef.current) {
        onMove();
      }
      setIsDragging(false);
    }
  };

  // Keyboard directional stepping for active path
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (solvedTriggered || !activeColorRef.current) return;
      const deltaMap: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      const delta = deltaMap[e.key];
      if (!delta) return;
      const color = activeColorRef.current;
      const curPath = pathsRef.current[color] ?? [];
      if (curPath.length === 0) return;
      e.preventDefault();
      const head = curPath[curPath.length - 1];
      const nextCell = { r: head.r + delta[0], c: head.c + delta[1] };
      const res = stepDotLinkTo(puzzle, pathsRef.current, color, nextCell);
      if (res.changed) {
        setPaths(res.paths);
        setPulseCell(`${nextCell.r}-${nextCell.c}`);
        if (res.connectedPair) {
          triggerHaptic('connect');
          playSound('connect');
          emitCellBurst(nextCell, res.connectedPair);
          setActiveColor(null);
          onMove();
          commitWinCheck(res.paths);
        } else {
          triggerHaptic('step');
          playSound('step', (res.paths[color]?.length ?? 1) - 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [puzzle, solvedTriggered, emitCellBurst, onMove, commitWinCheck]);

  const cellOwnerMap = useMemo(() => {
    const map = new Map<string, DotColorId>();
    for (const [colorId, path] of Object.entries(paths) as [DotColorId, Coord[] | undefined][]) {
      if (!path) continue;
      for (const pt of path) {
        map.set(`${pt.r}-${pt.c}`, colorId);
      }
    }
    return map;
  }, [paths]);

  const endpointMap = useMemo(() => {
    const map = new Map<string, DotPairDef>();
    for (const pair of puzzle.pairs) {
      map.set(`${pair.start.r}-${pair.start.c}`, pair);
      map.set(`${pair.end.r}-${pair.end.c}`, pair);
    }
    return map;
  }, [puzzle.pairs]);

  const coveragePct = Math.round((stats.filledCells / stats.totalCells) * 100);
  const gridUnit = 100;
  const viewBoxSize = puzzle.gridSize * gridUnit;

  return (
    <div className="flex w-full max-w-[540px] flex-col items-center gap-4">
      {/* Compact Live Telemetry Strip (unboxed clean typography) */}
      <div className="flex w-full items-center justify-between px-1 text-xs font-medium text-[#5A606B] dark:text-[#94A0B8]">
        <div className="flex items-center gap-3 tabular-nums">
          <span>
            Pairs <strong className="text-[#181A1F] dark:text-[#F3F5F8]">{stats.connectedCount}/{stats.totalPairs}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Board <strong className="text-[#181A1F] dark:text-[#F3F5F8]">{coveragePct}%</strong>
          </span>
        </div>
        <span className="text-[11px]">
          {stats.connectedCount === stats.totalPairs && stats.filledCells < stats.totalCells
            ? 'Fill every remaining square to complete'
            : 'Drag or tap adjacent tiles to link dots'}
        </span>
      </div>

      {/* Main Tactile Dot Link Board */}
      <div
        ref={boardRef}
        data-testid="dotlink-board"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className="relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-2.5 shadow-[0_14px_36px_rgba(24,26,31,0.08)] dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)]"
      >
        {/* Grid Cells Layer */}
        <div
          className="relative grid h-full w-full gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: puzzle.gridSize * puzzle.gridSize }).map((_, idx) => {
            const r = Math.floor(idx / puzzle.gridSize);
            const c = idx % puzzle.gridSize;
            const key = `${r}-${c}`;
            const owner = cellOwnerMap.get(key);
            const ep = endpointMap.get(key);
            const isPulsing = pulseCell === key;
            const cellColor = owner ? DOT_PALETTE[owner] : ep ? DOT_PALETTE[ep.id] : null;
            const isComplete = ep ? isPairConnected(puzzle, paths, ep.id) : false;

            return (
              <button
                key={key}
                type="button"
                aria-label={
                  ep
                    ? `${ep.label} dot at row ${r + 1} column ${c + 1}`
                    : `Grid tile row ${r + 1} column ${c + 1}`
                }
                data-cell={`${r}-${c}`}
                onClick={(ev) => {
                  // Only trigger click handler when not already handled by pointer drag
                  if (ev.detail === 0) {
                    handleCellSelect({ r, c });
                  }
                }}
                style={
                  owner && cellColor
                    ? { backgroundColor: cellColor.softBg }
                    : undefined
                }
                className="relative flex items-center justify-center rounded-xl border border-[#ECEAE3] bg-[#F8F7F3] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2B4EFF] dark:border-[#222B3C] dark:bg-[#1B2230] dark:focus-visible:outline-[#F5A524]"
              >
                {isPulsing && cellColor && (
                  <span
                    key={`${key}-${Date.now()}`}
                    aria-hidden="true"
                    style={{ borderColor: cellColor.hex }}
                    className="animate-haptic-ripple pointer-events-none absolute inset-1.5 rounded-full border-2"
                  />
                )}
                {ep && (
                  <div
                    style={{
                      backgroundColor: DOT_PALETTE[ep.id].hex,
                      transform: activeColor === ep.id ? 'scale(1.14)' : 'scale(1)',
                      boxShadow: isComplete
                        ? `0 0 0 4px ${DOT_PALETTE[ep.id].ring}`
                        : activeColor === ep.id
                          ? `0 0 0 5px ${DOT_PALETTE[ep.id].ring}`
                          : '0 4px 10px rgba(0,0,0,0.22)',
                    }}
                    className={`relative z-20 flex h-[66%] w-[66%] items-center justify-center rounded-full text-white transition-transform duration-150 ${
                      isComplete ? 'animate-dot-lock' : ''
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden="true">
                      <DotShapeGlyph shape={ep.shape} />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SVG Conduit Path Layer */}
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="pointer-events-none absolute inset-2.5 z-10 h-[calc(100%-20px)] w-[calc(100%-20px)]"
          aria-hidden="true"
        >
          {puzzle.pairs.map((pair) => {
            const path = paths[pair.id];
            if (!path || path.length < 2) return null;
            const d = path
              .map((pt, i) => {
                const x = (pt.c + 0.5) * gridUnit;
                const y = (pt.r + 0.5) * gridUnit;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ');
            const color = DOT_PALETTE[pair.id];
            const connected = isPairConnected(puzzle, paths, pair.id);

            return (
              <g key={pair.id}>
                {connected && (
                  <path
                    d={d}
                    fill="none"
                    stroke={color.darkGlow}
                    strokeWidth={34}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <path
                  d={d}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth={22}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pair Legend (accessible color + shape progress readout) */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#5A606B] dark:text-[#94A0B8]">
        {puzzle.pairs.map((pair) => {
          const done = isPairConnected(puzzle, paths, pair.id);
          return (
            <div
              key={pair.id}
              className={`flex items-center gap-1.5 transition-opacity ${
                done ? 'opacity-100 font-semibold text-[#181A1F] dark:text-[#F3F5F8]' : 'opacity-75'
              }`}
            >
              <span
                style={{ backgroundColor: DOT_PALETTE[pair.id].hex }}
                className="flex h-4 w-4 items-center justify-center rounded-full text-white"
              >
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" aria-hidden="true">
                  <DotShapeGlyph shape={pair.shape} />
                </svg>
              </span>
              <span>{pair.label}</span>
              {done && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
