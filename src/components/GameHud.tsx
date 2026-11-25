import {
  Grid2X2,
  Lightbulb,
  Moon,
  Pause,
  RotateCcw,
  Sun,
  Vibrate,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { LevelDef, ThemeMode } from '../game/types';

interface GameHudProps {
  level: LevelDef;
  moves: number;
  elapsedSeconds: number;
  hintsUsed: number;
  streak: number;
  theme: ThemeMode;
  soundOn: boolean;
  hapticsOn: boolean;
  onOpenMap: () => void;
  onHint: () => void;
  onReset: () => void;
  onPause: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameHud({
  level,
  moves,
  elapsedSeconds,
  hintsUsed,
  streak,
  theme,
  soundOn,
  hapticsOn,
  onOpenMap,
  onHint,
  onReset,
  onPause,
  onToggleTheme,
  onToggleSound,
  onToggleHaptics,
}: GameHudProps) {
  const diffLabel = level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1);

  return (
    <div className="sticky top-0 z-20 w-full border-b border-[#E2E0D8] bg-[#F6F5F1]/95 transition-colors dark:border-[#212A3A] dark:bg-[#0D1017]/95">
      <div className="mx-auto flex h-15 max-w-[1160px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Campaign Map button + Unboxed Level Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenMap();
            }}
            aria-label="Open Campaign Map"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DFDDD4] bg-[#FFFFFF] px-3 text-xs font-semibold text-[#181A1F] transition-colors hover:border-[#2B4EFF] whitespace-nowrap shrink-0 dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
          >
            <Grid2X2 className="h-4 w-4" />
            <span className="hidden sm:inline">Levels</span>
          </button>

          <div className="min-w-0 truncate text-xs font-medium text-[#5A606B] sm:text-sm dark:text-[#94A0B8]">
            <span className="font-semibold text-[#181A1F] dark:text-[#F3F5F8]">{diffLabel}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="sm:hidden tabular-nums">
              S{level.stage} · L{level.level}
            </span>
            <span className="hidden sm:inline tabular-nums">
              Stage {level.stage}
              <span className="mx-1.5" aria-hidden="true">·</span>
              Level {level.level}
            </span>
          </div>
        </div>

        {/* Center: Live Tabular Gameplay Counters */}
        <div className="hidden items-center gap-5 text-xs font-medium text-[#5A606B] tabular-nums md:flex dark:text-[#94A0B8]">
          <div>
            Moves <strong className="ml-1 font-mono text-sm text-[#181A1F] dark:text-[#F3F5F8]">{moves}</strong>
          </div>
          <div>
            Time <strong className="ml-1 font-mono text-sm text-[#181A1F] dark:text-[#F3F5F8]">{formatTime(elapsedSeconds)}</strong>
          </div>
          {streak > 0 && (
            <div>
              Streak <strong className="ml-1 font-mono text-sm text-[#2B4EFF] dark:text-[#F5A524]">{streak}</strong>
            </div>
          )}
        </div>

        {/* Right: Utility Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onHint();
            }}
            aria-label={`Use Hint (${hintsUsed} used)`}
            title="Hint [H]"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DFDDD4] bg-[#FFFFFF] px-2.5 text-xs font-semibold text-[#181A1F] transition-colors hover:border-[#2B4EFF] whitespace-nowrap shrink-0 dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
          >
            <Lightbulb className="h-3.5 w-3.5 text-[#2B4EFF] dark:text-[#F5A524]" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReset();
            }}
            aria-label="Reset puzzle"
            title="Reset [R]"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleTheme();
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title="Toggle Theme [T]"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-[#F5A524]" /> : <Moon className="h-4 w-4 text-[#2B4EFF]" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleHaptics();
            }}
            aria-label={hapticsOn ? 'Disable haptics' : 'Enable haptics'}
            aria-pressed={hapticsOn}
            title={hapticsOn ? 'Haptics On' : 'Haptics Off'}
            className={`hidden h-9 w-9 items-center justify-center rounded-lg border transition-colors sm:inline-flex ${
              hapticsOn
                ? 'border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8]'
                : 'border-[#DFDDD4]/60 bg-transparent text-[#8E94A0] dark:border-[#273042]/60 dark:text-[#5B6780]'
            }`}
          >
            <Vibrate className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleSound();
            }}
            aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
            aria-pressed={soundOn}
            title="Mute [M]"
            className={`hidden h-9 w-9 items-center justify-center rounded-lg border transition-colors sm:inline-flex ${
              soundOn
                ? 'border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8]'
                : 'border-[#DFDDD4]/60 bg-transparent text-[#8E94A0] dark:border-[#273042]/60 dark:text-[#5B6780]'
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Pause game"
            title="Pause [Esc]"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
