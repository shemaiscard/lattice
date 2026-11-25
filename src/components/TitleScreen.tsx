import { useState } from 'react';
import {
  Map as MapIcon,
  Moon,
  Play,
  Sun,
  Vibrate,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { LevelDef, ProgressState, ThemeMode } from '../game/types';
import { getCampaignTotals } from '../game/engine';

interface TitleScreenProps {
  theme: ThemeMode;
  soundOn: boolean;
  hapticsOn: boolean;
  progress: ProgressState;
  nextLevel: LevelDef;
  onStartPlay: () => void;
  onOpenMap: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
}

export function TitleScreen({
  theme,
  soundOn,
  hapticsOn,
  progress,
  nextLevel,
  onStartPlay,
  onOpenMap,
  onToggleTheme,
  onToggleSound,
  onToggleHaptics,
}: TitleScreenProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const totals = getCampaignTotals(progress);
  const hasStarted = totals.solvedCount > 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: nx * 12, y: ny * 12 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#F6F5F1] text-[#181A1F] transition-colors duration-300 dark:bg-[#0D1017] dark:text-[#F3F5F8]"
    >
      {/* Subtle Architectural Grid Hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            theme === 'dark'
              ? 'linear-gradient(to right, rgba(148,160,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,160,184,0.08) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(24,26,31,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,26,31,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top Utility Row (Compact icon buttons only — no website navbar) */}
      <div className="relative z-10 flex items-center justify-end gap-2 px-6 pt-5 sm:px-10 sm:pt-7">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DFDDD4] bg-[#FFFFFF]/90 px-3.5 text-xs font-semibold text-[#181A1F] transition-colors hover:border-[#2B4EFF] dark:border-[#273042] dark:bg-[#161B26]/90 dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-[#F5A524]" /> : <Moon className="h-4 w-4 text-[#2B4EFF]" />}
          <span className="whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleHaptics}
          aria-label={hapticsOn ? 'Disable haptics' : 'Enable haptics'}
          aria-pressed={hapticsOn}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            hapticsOn
              ? 'border-[#DFDDD4] bg-[#FFFFFF]/90 text-[#181A1F] dark:border-[#273042] dark:bg-[#161B26]/90 dark:text-[#F3F5F8]'
              : 'border-[#DFDDD4]/70 bg-transparent text-[#8E94A0] dark:border-[#273042]/70 dark:text-[#5B6780]'
          }`}
          title={hapticsOn ? 'Haptics On' : 'Haptics Off'}
        >
          <Vibrate className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          aria-pressed={soundOn}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            soundOn
              ? 'border-[#DFDDD4] bg-[#FFFFFF]/90 text-[#181A1F] dark:border-[#273042] dark:bg-[#161B26]/90 dark:text-[#F3F5F8]'
              : 'border-[#DFDDD4]/70 bg-transparent text-[#8E94A0] dark:border-[#273042]/70 dark:text-[#5B6780]'
          }`}
          title={soundOn ? 'Sound On' : 'Sound Off'}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Split Stage: Calm Negative Space Left + Interactive Dot-Link Centerpiece Right */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1180px] flex-1 grid-cols-1 items-center gap-12 px-6 py-8 lg:grid-cols-12 lg:px-10">
        {/* Left Region: Bespoke SVG Emblem, Display Lockup & CTAs */}
        <div className="animate-screen-enter flex flex-col items-start lg:col-span-6">
          {/* Bespoke Inline SVG Title Lockup */}
          <div className="mb-6 flex items-center gap-4">
            <svg
              viewBox="0 0 64 64"
              className="h-14 w-14 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="56"
                height="56"
                rx="14"
                className="fill-[#FFFFFF] stroke-[#DFDDD4] dark:fill-[#161B26] dark:stroke-[#2A3447]"
                strokeWidth="2"
              />
              <path
                d="M18 18 L18 46 L46 46"
                fill="none"
                stroke="#2E7CF6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 18 L46 18 L46 32"
                fill="none"
                stroke="#F5A524"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="18" cy="18" r="5.5" fill="#2E7CF6" />
              <circle cx="46" cy="46" r="5.5" fill="#2E7CF6" />
              <circle cx="32" cy="18" r="5.5" fill="#F5A524" />
              <circle cx="46" cy="32" r="5.5" fill="#F5A524" />
              <circle cx="32" cy="32" r="4.5" fill="#10B981" />
            </svg>

            <div>
              <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[#181A1F] sm:text-6xl dark:text-[#F3F5F8]">
                LATTICE
              </h1>
            </div>
          </div>

          <p className="max-w-lg text-lg leading-relaxed text-[#4B515C] text-balance sm:text-xl dark:text-[#A4B0C6]">
            Connect luminous dot circuits, crack lateral riddles, and illuminate ancient logic grids across 36 handcrafted levels.
          </p>

          {/* Clean Unboxed Campaign Summary */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#5A606B] tabular-nums dark:text-[#8E9BB5]">
            <span>3 Difficulties</span>
            <span aria-hidden="true">·</span>
            <span>9 Stages</span>
            <span aria-hidden="true">·</span>
            <span>
              {totals.solvedCount}/{totals.totalLevels} Solved
            </span>
            {totals.earnedStars > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{totals.earnedStars} Stars</span>
              </>
            )}
          </div>

          {/* Primary & Secondary Actions (2 clean menu actions) */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              data-start="true"
              onClick={onStartPlay}
              className="inline-flex min-h-13 items-center gap-2.5 rounded-xl bg-[#2B4EFF] px-7 text-base font-semibold text-white shadow-[0_10px_24px_rgba(43,78,255,0.28)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 dark:bg-[#F5A524] dark:text-[#0D1017] dark:shadow-[0_10px_26px_rgba(245,165,36,0.28)]"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              <span>
                {hasStarted
                  ? `Continue · ${nextLevel.difficulty.charAt(0).toUpperCase() + nextLevel.difficulty.slice(1)} S${nextLevel.stage} L${nextLevel.level}`
                  : 'Play Campaign'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenMap}
              className="inline-flex min-h-13 items-center gap-2.5 rounded-xl border border-[#D8D5CB] bg-[#FFFFFF] px-6 text-base font-semibold text-[#181A1F] transition-colors hover:border-[#2B4EFF] whitespace-nowrap shrink-0 dark:border-[#2A3447] dark:bg-[#161B26] dark:text-[#F3F5F8] dark:hover:border-[#F5A524]"
            >
              <MapIcon className="h-4.5 w-4.5" />
              <span>Stages &amp; Modes</span>
            </button>
          </div>
        </div>

        {/* Right Region: Interactive Kinetic Dot-Link Artifact Showcase */}
        <div className="animate-screen-enter flex items-center justify-center lg:col-span-6">
          <div
            style={{
              transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)`,
              transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="relative aspect-square w-full max-w-[430px] rounded-3xl border border-[#DFDDD4] bg-[#FFFFFF] p-5 shadow-[0_24px_64px_rgba(24,26,31,0.10)] dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_28px_72px_rgba(0,0,0,0.55)]"
          >
            <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
              {/* 4x4 tactile backdrop squares */}
              {Array.from({ length: 16 }).map((_, idx) => {
                const r = Math.floor(idx / 4);
                const c = idx % 4;
                return (
                  <rect
                    key={idx}
                    x={16 + c * 94}
                    y={16 + r * 94}
                    width="82"
                    height="82"
                    rx="16"
                    className="fill-[#F6F5F1] stroke-[#ECEAE3] dark:fill-[#1B2230] dark:stroke-[#232D40]"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Animated Dot-Link Thread 1 (Coral) */}
              <path
                d="M 57 57 L 151 57 L 245 57 L 245 151 L 151 151"
                fill="none"
                stroke="#E84A5F"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-svg-draw"
                style={{ animationDelay: '0.1s' }}
              />

              {/* Animated Dot-Link Thread 2 (Cobalt) */}
              <path
                d="M 339 57 L 339 151 L 339 245 L 339 339"
                fill="none"
                stroke="#2E7CF6"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-svg-draw"
                style={{ animationDelay: '0.3s' }}
              />

              {/* Animated Dot-Link Thread 3 (Emerald) */}
              <path
                d="M 57 151 L 57 245 L 57 339 L 151 339"
                fill="none"
                stroke="#10B981"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-svg-draw"
                style={{ animationDelay: '0.5s' }}
              />

              {/* Animated Dot-Link Thread 4 (Amber) */}
              <path
                d="M 151 245 L 245 245 L 245 339"
                fill="none"
                stroke="#F5A524"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-svg-draw"
                style={{ animationDelay: '0.7s' }}
              />

              {/* Endpoint Nodes */}
              {[
                { cx: 57, cy: 57, fill: '#E84A5F' },
                { cx: 151, cy: 151, fill: '#E84A5F' },
                { cx: 339, cy: 57, fill: '#2E7CF6' },
                { cx: 339, cy: 339, fill: '#2E7CF6' },
                { cx: 57, cy: 151, fill: '#10B981' },
                { cx: 151, cy: 339, fill: '#10B981' },
                { cx: 151, cy: 245, fill: '#F5A524' },
                { cx: 245, cy: 339, fill: '#F5A524' },
              ].map((dot, i) => (
                <g key={i}>
                  <circle cx={dot.cx} cy={dot.cy} r="23" fill={dot.fill} />
                  <circle cx={dot.cx} cy={dot.cy} r="7" fill="#FFFFFF" fillOpacity="0.92" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </main>

      {/* Bottom Safe-Margin Flat Control Hint */}
      <div className="relative z-10 px-6 pb-6 text-center text-xs font-medium text-[#6B717D] dark:text-[#7E8BA3]">
        Drag or Click to Link Dots · Type to Solve Riddles · Enter to Start · Esc to Pause
      </div>
    </div>
  );
}
