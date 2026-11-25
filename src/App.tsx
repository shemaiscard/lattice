import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Difficulty,
  GameScreen,
  LevelDef,
  ProgressState,
  RunSummary,
  ThemeMode,
} from './game/types';
import { LEVELS, getLevelById, getNextLevel } from './game/levels';
import {
  getRecommendedNextLevel,
  loadProgress,
  recordLevelCompletion,
  saveProgress,
} from './game/engine';
import { setHapticsEnabled, triggerHaptic } from './utils/haptics';
import { playSound, setSoundEnabled } from './utils/sound';
import { ParticleCanvas, type ParticleBurstHandle } from './components/ParticleCanvas';
import { TitleScreen } from './components/TitleScreen';
import { CampaignMap } from './components/CampaignMap';
import { GameHud } from './components/GameHud';
import { DotLinkBoard } from './components/DotLinkBoard';
import { RiddleBoard } from './components/RiddleBoard';
import { LumenBoard } from './components/LumenBoard';
import { CipherBoard } from './components/CipherBoard';
import { PauseModal, VictoryModal } from './components/StatusModal';

const THEME_STORAGE_KEY = 'lattice_theme_v1';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

function getInitialScreen(): GameScreen {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'playing';
  }
  return 'title';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [progress, setProgress] = useState<ProgressState>(loadProgress);
  const [screen, setScreen] = useState<GameScreen>(getInitialScreen);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [currentLevelId, setCurrentLevelId] = useState<string>(() => {
    const prog = loadProgress();
    return getRecommendedNextLevel(prog).id;
  });

  // Active level run counters
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [hintToken, setHintToken] = useState(0);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  const particlesRef = useRef<ParticleBurstHandle | null>(null);
  const currentLevel: LevelDef = getLevelById(currentLevelId) ?? LEVELS[0];
  const nextLevel = getNextLevel(currentLevel.id);

  // Sync theme to <html class="dark">
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // Sync sound & haptics settings
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    setHapticsEnabled(hapticsOn);
  }, [hapticsOn]);

  // Mirror game state machine to document.body.dataset.state
  useEffect(() => {
    const bodyState =
      screen === 'victory'
        ? 'gameover'
        : screen === 'map'
          ? 'map'
          : screen;
    document.body.dataset.state = bodyState;
  }, [screen]);

  // Elapsed timer during active play
  useEffect(() => {
    if (screen !== 'playing') return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen]);

  const startLevel = useCallback((level: LevelDef) => {
    setCurrentLevelId(level.id);
    setSelectedDifficulty(level.difficulty);
    setMoves(0);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setRunSummary(null);
    setResetToken((t) => t + 1);
    setScreen('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    triggerHaptic('tap');
    playSound('tap');
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    triggerHaptic('toggle');
    playSound('toggle');
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playSound('tap');
      return next;
    });
    triggerHaptic('tap');
  }, []);

  const handleToggleHaptics = useCallback(() => {
    setHapticsOn((prev) => {
      const next = !prev;
      setHapticsEnabled(next);
      if (next) triggerHaptic('connect');
      return next;
    });
    playSound('tap');
  }, []);

  const handleResetLevel = useCallback(() => {
    setMoves(0);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setRunSummary(null);
    setResetToken((t) => t + 1);
    setScreen('playing');
    triggerHaptic('toggle');
    playSound('tap');
  }, []);

  const handleUseHint = useCallback(() => {
    setHintsUsed((h) => h + 1);
    setHintToken((t) => t + 1);
  }, []);

  const handleLevelSolved = useCallback(() => {
    const finalMoves = Math.max(1, moves);
    const finalSeconds = Math.max(1, elapsedSeconds);
    const { nextProgress, summary } = recordLevelCompletion(
      progress,
      currentLevel,
      finalMoves,
      finalSeconds,
      hintsUsed
    );
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setRunSummary(summary);
    setScreen('victory');
    triggerHaptic('victory');
    playSound('victory');
    particlesRef.current?.celebrate();
  }, [moves, elapsedSeconds, progress, currentLevel, hintsUsed]);

  const handleBurst = useCallback((x: number, y: number, color: string) => {
    particlesRef.current?.burst(x, y, color, 16);
  }, []);

  // Global keyboard shortcuts (Title Enter/Space, Playing Esc/P/R/H/T/M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (screen === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startLevel(getRecommendedNextLevel(progress));
        return;
      }

      if (e.key === 'Escape') {
        if (screen === 'playing') {
          e.preventDefault();
          setScreen('paused');
          triggerHaptic('tap');
        } else if (screen === 'paused') {
          e.preventDefault();
          setScreen('playing');
          triggerHaptic('tap');
        }
        return;
      }

      if (isTyping) return;

      if (screen === 'playing') {
        const lower = e.key.toLowerCase();
        if (lower === 'p') {
          e.preventDefault();
          setScreen('paused');
          triggerHaptic('tap');
        } else if (lower === 'r') {
          e.preventDefault();
          handleResetLevel();
        } else if (lower === 'h') {
          e.preventDefault();
          handleUseHint();
        } else if (lower === 't') {
          e.preventDefault();
          handleToggleTheme();
        } else if (lower === 'm') {
          e.preventDefault();
          handleToggleSound();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    progress,
    startLevel,
    handleResetLevel,
    handleUseHint,
    handleToggleTheme,
    handleToggleSound,
  ]);

  const recommended = getRecommendedNextLevel(progress);

  return (
    <div className="min-h-screen w-full bg-[#F6F5F1] text-[#181A1F] transition-colors duration-300 dark:bg-[#0D1017] dark:text-[#F3F5F8]">
      <ParticleCanvas ref={particlesRef} />

      {screen === 'title' && (
        <div key="title" className="animate-screen-enter">
          <TitleScreen
            theme={theme}
            soundOn={soundOn}
            hapticsOn={hapticsOn}
            progress={progress}
            nextLevel={recommended}
            onStartPlay={() => startLevel(recommended)}
            onOpenMap={() => {
              triggerHaptic('tap');
              playSound('tap');
              setScreen('map');
            }}
            onToggleTheme={handleToggleTheme}
            onToggleSound={handleToggleSound}
            onToggleHaptics={handleToggleHaptics}
          />
        </div>
      )}

      {screen === 'map' && (
        <div key="map" className="animate-screen-enter">
          <CampaignMap
            selectedDifficulty={selectedDifficulty}
            progress={progress}
            theme={theme}
            onSelectDifficulty={(diff) => {
              setSelectedDifficulty(diff);
              triggerHaptic('tap');
              playSound('tap');
            }}
            onSelectLevel={startLevel}
            onBackTitle={() => {
              triggerHaptic('tap');
              playSound('tap');
              setScreen('title');
            }}
            onToggleTheme={handleToggleTheme}
          />
        </div>
      )}

      {(screen === 'playing' || screen === 'paused' || screen === 'victory') && (
        <div key="arena" className="animate-screen-enter flex min-h-screen flex-col">
            <GameHud
              level={currentLevel}
              moves={moves}
              elapsedSeconds={elapsedSeconds}
              hintsUsed={hintsUsed}
              streak={progress.streak}
              theme={theme}
              soundOn={soundOn}
              hapticsOn={hapticsOn}
              onOpenMap={() => {
                setSelectedDifficulty(currentLevel.difficulty);
                setScreen('map');
                triggerHaptic('tap');
                playSound('tap');
              }}
              onHint={handleUseHint}
              onReset={handleResetLevel}
              onPause={() => {
                setScreen('paused');
                triggerHaptic('tap');
              }}
              onToggleTheme={handleToggleTheme}
              onToggleSound={handleToggleSound}
              onToggleHaptics={handleToggleHaptics}
            />

            <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col items-center justify-center px-5 py-7 sm:py-10">
              {/* Level Title & Subtitle Header */}
              <div className="mb-6 text-center">
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[#181A1F] sm:text-3xl dark:text-[#F3F5F8]">
                  {currentLevel.title}
                </h1>
                <p className="mt-1 text-sm text-[#5A606B] dark:text-[#94A0B8]">
                  {currentLevel.subtitle}
                </p>
              </div>

              {/* Active Puzzle Arena */}
              {currentLevel.puzzle.type === 'dotlink' && (
                <DotLinkBoard
                  levelId={currentLevel.id}
                  puzzle={currentLevel.puzzle}
                  resetToken={resetToken}
                  hintToken={hintToken}
                  onMove={() => setMoves((m) => m + 1)}
                  onSolved={handleLevelSolved}
                  onBurst={handleBurst}
                />
              )}

              {currentLevel.puzzle.type === 'riddle' && (
                <RiddleBoard
                  levelId={currentLevel.id}
                  puzzle={currentLevel.puzzle}
                  resetToken={resetToken}
                  hintToken={hintToken}
                  onAttempt={() => setMoves((m) => m + 1)}
                  onSolved={handleLevelSolved}
                />
              )}

              {currentLevel.puzzle.type === 'lumen' && (
                <LumenBoard
                  levelId={currentLevel.id}
                  puzzle={currentLevel.puzzle}
                  resetToken={resetToken}
                  hintToken={hintToken}
                  onMove={() => setMoves((m) => m + 1)}
                  onSolved={handleLevelSolved}
                  onBurst={handleBurst}
                />
              )}

              {currentLevel.puzzle.type === 'cipher' && (
                <CipherBoard
                  levelId={currentLevel.id}
                  puzzle={currentLevel.puzzle}
                  resetToken={resetToken}
                  hintToken={hintToken}
                  onAttempt={() => setMoves((m) => m + 1)}
                  onSolved={handleLevelSolved}
                  onBurst={handleBurst}
                />
              )}
            </main>

            {screen === 'paused' && (
              <PauseModal
                level={currentLevel}
                onResume={() => {
                  setScreen('playing');
                  triggerHaptic('tap');
                }}
                onRestart={handleResetLevel}
                onOpenMap={() => {
                  setSelectedDifficulty(currentLevel.difficulty);
                  setScreen('map');
                  triggerHaptic('tap');
                }}
                onTitle={() => {
                  setScreen('title');
                  triggerHaptic('tap');
                }}
              />
            )}

            {screen === 'victory' && runSummary && (
              <VictoryModal
                level={currentLevel}
                summary={runSummary}
                nextLevel={nextLevel}
                onNextLevel={() => {
                  if (nextLevel) startLevel(nextLevel);
                }}
                onReplay={handleResetLevel}
                onOpenMap={() => {
                  setSelectedDifficulty(currentLevel.difficulty);
                  setScreen('map');
                  triggerHaptic('tap');
                }}
              />
            )}
        </div>
      )}
    </div>
  );
}
