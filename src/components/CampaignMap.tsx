import {
  ArrowLeft,
  Check,
  KeyRound,
  Lock,
  Moon,
  Network,
  ScrollText,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';
import type { Difficulty, LevelDef, ProgressState, PuzzleType, ThemeMode } from '../game/types';
import { DIFFICULTY_META, getLevelsByStage } from '../game/levels';
import { getCampaignTotals, isLevelUnlocked } from '../game/engine';

interface CampaignMapProps {
  selectedDifficulty: Difficulty;
  progress: ProgressState;
  theme: ThemeMode;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onSelectLevel: (level: LevelDef) => void;
  onBackTitle: () => void;
  onToggleTheme: () => void;
}

const PUZZLE_TYPE_META: Record<PuzzleType, { label: string; Icon: typeof Network }> = {
  dotlink: { label: 'Dot Link', Icon: Network },
  riddle: { label: 'Riddle', Icon: ScrollText },
  lumen: { label: 'Lumen Grid', Icon: Sparkles },
  cipher: { label: 'Cipher Lock', Icon: KeyRound },
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function CampaignMap({
  selectedDifficulty,
  progress,
  theme,
  onSelectDifficulty,
  onSelectLevel,
  onBackTitle,
  onToggleTheme,
}: CampaignMapProps) {
  const totals = getCampaignTotals(progress);
  const meta = DIFFICULTY_META[selectedDifficulty];

  return (
    <div className="min-h-screen w-full bg-[#F6F5F1] text-[#181A1F] transition-colors duration-300 dark:bg-[#0D1017] dark:text-[#F3F5F8]">
      {/* Compact Game Shell Top Strip */}
      <div className="sticky top-0 z-20 border-b border-[#E2E0D8] bg-[#F6F5F1]/95 dark:border-[#212A3A] dark:bg-[#0D1017]/95">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackTitle}
              aria-label="Back to Title Screen"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight whitespace-nowrap sm:text-2xl">
              Campaign Atlas
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#5A606B] tabular-nums dark:text-[#94A0B8]">
            <span className="hidden sm:inline">
              Solved <strong className="text-[#181A1F] dark:text-[#F3F5F8]">{totals.solvedCount}/{totals.totalLevels}</strong>
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>
              Stars <strong className="text-[#181A1F] dark:text-[#F3F5F8]">{totals.earnedStars}/{totals.maxStars}</strong>
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DFDDD4] bg-[#FFFFFF] text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#F5A524]" /> : <Moon className="h-4 w-4 text-[#2B4EFF]" />}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1140px] px-5 py-8 sm:px-8 sm:py-10">
        {/* Difficulty Mode Segmented Selector */}
        <div className="flex flex-col justify-between gap-5 border-b border-[#E2E0D8] pb-7 sm:flex-row sm:items-end dark:border-[#212A3A]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              {meta.title} Mode
            </h2>
            <p className="mt-1.5 text-sm text-[#5A606B] dark:text-[#94A0B8]">
              {meta.subtitle}. Complete levels in order to unlock deeper stages.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Difficulty modes"
            className="inline-flex items-center gap-1 rounded-xl border border-[#DFDDD4] bg-[#ECEAE2] p-1 self-start sm:self-auto dark:border-[#252E40] dark:bg-[#141923]"
          >
            {DIFFICULTIES.map((diff) => {
              const active = selectedDifficulty === diff;
              const stats = totals.byDifficulty[diff];
              return (
                <button
                  key={diff}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectDifficulty(diff)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FFFFFF] text-[#181A1F] shadow-sm dark:bg-[#F5A524] dark:text-[#0D1017]'
                      : 'text-[#5A606B] hover:text-[#181A1F] dark:text-[#94A0B8] dark:hover:text-[#F3F5F8]'
                  }`}
                >
                  <span>{DIFFICULTY_META[diff].title}</span>
                  <span className="font-mono text-xs opacity-75 tabular-nums">
                    {stats.solved}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stages 1, 2, 3 */}
        <div className="mt-9 space-y-10">
          {[1, 2, 3].map((stageNum) => {
            const stageLevels = getLevelsByStage(selectedDifficulty, stageNum);
            const stageSolved = stageLevels.filter((l) => progress.records[l.id]?.completed).length;

            return (
              <section key={`${selectedDifficulty}-s${stageNum}`}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#181A1F] dark:text-[#F3F5F8]">
                    {meta.stageNames[stageNum - 1]}
                  </h3>
                  <span className="text-xs font-medium text-[#5A606B] tabular-nums dark:text-[#8E9BB5]">
                    {stageSolved}/{stageLevels.length} completed
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stageLevels.map((lvl, idx) => {
                    const unlocked = isLevelUnlocked(lvl, progress);
                    const rec = progress.records[lvl.id];
                    const typeMeta = PUZZLE_TYPE_META[lvl.puzzle.type];
                    const TypeIcon = typeMeta.Icon;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        disabled={!unlocked}
                        style={{ animationDelay: `${idx * 35}ms` }}
                        onClick={() => onSelectLevel(lvl)}
                        className={`animate-screen-enter group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EFF] dark:focus-visible:outline-[#F5A524] ${
                          unlocked
                            ? 'border-[#DFDDD4] bg-[#FFFFFF] hover:-translate-y-0.5 hover:border-[#2B4EFF] hover:shadow-[0_12px_28px_rgba(24,26,31,0.08)] dark:border-[#273042] dark:bg-[#151B26] dark:hover:border-[#F5A524] dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.4)]'
                            : 'cursor-not-allowed border-[#E8E6DF] bg-[#F1EFE9]/75 opacity-60 dark:border-[#1E2534] dark:bg-[#11151E]/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-medium text-[#5A606B] dark:text-[#8E9BB5]">
                            <span className="tabular-nums">
                              Stage {lvl.stage} · Level {lvl.level}
                            </span>
                            {rec?.completed ? (
                              <span
                                className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400"
                                aria-label="Completed"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Solved</span>
                              </span>
                            ) : !unlocked ? (
                              <Lock className="h-3.5 w-3.5" aria-label="Locked" />
                            ) : null}
                          </div>

                          <h4 className="mt-2.5 text-lg font-semibold text-[#181A1F] group-hover:text-[#2B4EFF] dark:text-[#F3F5F8] dark:group-hover:text-[#F5A524]">
                            {lvl.title}
                          </h4>

                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#5A606B] dark:text-[#94A0B8]">
                            <TypeIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{typeMeta.label}</span>
                            {lvl.puzzle.type === 'dotlink' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {lvl.puzzle.gridSize}×{lvl.puzzle.gridSize}
                                </span>
                              </>
                            )}
                            {lvl.puzzle.type === 'lumen' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {lvl.puzzle.gridSize}×{lvl.puzzle.gridSize}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#EFECE5] pt-3.5 dark:border-[#212A3C]">
                          <div className="flex items-center gap-1" aria-label={`${rec?.stars ?? 0} of 3 stars`}>
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  rec && s <= rec.stars
                                    ? 'fill-[#F5A524] text-[#F5A524]'
                                    : 'text-[#D4D1C7] dark:text-[#2F3A50]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#2B4EFF] dark:text-[#F5A524]">
                            {!unlocked ? 'Locked' : rec?.completed ? 'Replay' : 'Play →'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
