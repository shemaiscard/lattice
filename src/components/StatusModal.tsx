import { ArrowRight, Home, Map as MapIcon, Play, RotateCcw, Star } from 'lucide-react';
import type { LevelDef, RunSummary } from '../game/types';

interface PauseModalProps {
  level: LevelDef;
  onResume: () => void;
  onRestart: () => void;
  onOpenMap: () => void;
  onTitle: () => void;
}

export function PauseModal({
  level,
  onResume,
  onRestart,
  onOpenMap,
  onTitle,
}: PauseModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
    >
      <div className="animate-modal-pop w-full max-w-sm rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-7 text-[#181A1F] shadow-2xl dark:border-[#2A3447] dark:bg-[#151B26] dark:text-[#F3F5F8]">
        <p className="text-xs font-medium text-[#5A606B] dark:text-[#8E9BB5]">
          {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)} · Stage {level.stage} · Level {level.level}
        </p>
        <h2
          id="pause-modal-title"
          className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold"
        >
          Paused
        </h2>
        <p className="mt-1 text-sm text-[#5A606B] dark:text-[#94A0B8]">{level.title}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] dark:bg-[#F5A524] dark:text-[#0D1017]"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DFDDD4] bg-[#F8F7F3] px-5 text-sm font-semibold transition-colors hover:border-[#2B4EFF] dark:border-[#2A3447] dark:bg-[#1C2333] dark:hover:border-[#F5A524]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restart Level</span>
          </button>
          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DFDDD4] bg-transparent px-5 text-sm font-semibold transition-colors hover:border-[#2B4EFF] dark:border-[#2A3447] dark:hover:border-[#F5A524]"
          >
            <MapIcon className="h-4 w-4" />
            <span>Campaign Map</span>
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-[#5A606B] transition-colors hover:text-[#181A1F] dark:text-[#94A0B8] dark:hover:text-[#F3F5F8]"
          >
            <Home className="h-4 w-4" />
            <span>Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface VictoryModalProps {
  level: LevelDef;
  summary: RunSummary;
  nextLevel: LevelDef | null;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenMap: () => void;
}

export function VictoryModal({
  level,
  summary,
  nextLevel,
  onNextLevel,
  onReplay,
  onOpenMap,
}: VictoryModalProps) {
  const headline = summary.difficultyCompleted
    ? `${level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)} Tier Mastered`
    : summary.stageCompleted
      ? `Stage ${level.stage} Cleared`
      : 'Level Complete';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
    >
      <div className="animate-modal-pop w-full max-w-md rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-7 text-center text-[#181A1F] shadow-2xl sm:p-8 dark:border-[#2A3447] dark:bg-[#151B26] dark:text-[#F3F5F8]">
        <p className="text-xs font-medium text-[#5A606B] dark:text-[#8E9BB5]">
          {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)} · Stage {level.stage} · Level {level.level}
        </p>

        <h2
          id="victory-modal-title"
          className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight"
        >
          {headline}
        </h2>
        <p className="mt-1 text-sm text-[#5A606B] dark:text-[#94A0B8]">{level.title}</p>

        {/* Animated Star Reveal */}
        <div
          className="mt-5 flex items-center justify-center gap-2.5"
          aria-label={`Earned ${summary.stars} out of 3 stars`}
        >
          {[1, 2, 3].map((s) => {
            const earned = s <= summary.stars;
            return (
              <div
                key={s}
                style={{ animationDelay: `${90 + s * 100}ms` }}
                className="animate-star-pop"
              >
                <Star
                  className={`h-9 w-9 ${
                    earned
                      ? 'fill-[#F5A524] text-[#F5A524]'
                      : 'text-[#DCD9CF] dark:text-[#2B3548]'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Mastery Stat Tiles */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[#ECEAE3] bg-[#F8F7F3] py-3 dark:border-[#232D40] dark:bg-[#1B2230]">
            <div className="text-[11px] font-medium text-[#6B717D] dark:text-[#8E9BB5]">Moves</div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums">{summary.moves}</div>
          </div>
          <div className="rounded-xl border border-[#ECEAE3] bg-[#F8F7F3] py-3 dark:border-[#232D40] dark:bg-[#1B2230]">
            <div className="text-[11px] font-medium text-[#6B717D] dark:text-[#8E9BB5]">Time</div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums">{summary.seconds}s</div>
          </div>
          <div className="rounded-xl border border-[#ECEAE3] bg-[#F8F7F3] py-3 dark:border-[#232D40] dark:bg-[#1B2230]">
            <div className="text-[11px] font-medium text-[#6B717D] dark:text-[#8E9BB5]">Hints</div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums">{summary.hintsUsed}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {nextLevel ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextLevel}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.98] dark:bg-[#F5A524] dark:text-[#0D1017]"
            >
              <span>
                Next: Stage {nextLevel.stage} Level {nextLevel.level}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onOpenMap}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] px-6 text-sm font-semibold text-white dark:bg-[#F5A524] dark:text-[#0D1017]"
            >
              <span>View Completed Atlas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DFDDD4] bg-[#F8F7F3] text-sm font-semibold transition-colors hover:border-[#2B4EFF] dark:border-[#2A3447] dark:bg-[#1C2333] dark:hover:border-[#F5A524]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={onOpenMap}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DFDDD4] bg-transparent text-sm font-semibold transition-colors hover:border-[#2B4EFF] dark:border-[#2A3447] dark:hover:border-[#F5A524]"
            >
              <MapIcon className="h-4 w-4" />
              <span>Stages</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
