import { useEffect, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { CipherPuzzle } from '../game/types';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

interface CipherBoardProps {
  levelId: string;
  puzzle: CipherPuzzle;
  resetToken: number;
  hintToken: number;
  onAttempt: () => void;
  onSolved: () => void;
  onBurst: (x: number, y: number, color: string) => void;
}

export function CipherBoard({
  levelId,
  puzzle,
  resetToken,
  hintToken,
  onAttempt,
  onSolved,
  onBurst,
}: CipherBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const [revealedClues, setRevealedClues] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const prevHintTokenRef = useRef(hintToken);

  useEffect(() => {
    setSelected(null);
    setWrongChoices([]);
    setRevealedClues(0);
    setSolved(false);
    setShakeKey(0);
  }, [levelId, resetToken]);

  useEffect(() => {
    if (hintToken === prevHintTokenRef.current) return;
    prevHintTokenRef.current = hintToken;
    if (solved) return;
    if (revealedClues < puzzle.clues.length) {
      setRevealedClues((c) => Math.min(c + 1, puzzle.clues.length));
      triggerHaptic('hint');
      playSound('hint');
    }
  }, [hintToken, puzzle.clues.length, revealedClues, solved]);

  const handleChoose = (option: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (solved || wrongChoices.includes(option)) return;
    setSelected(option);
    onAttempt();

    if (option === puzzle.correctAnswer) {
      setSolved(true);
      triggerHaptic('connect');
      playSound('connect');
      const rect = e.currentTarget.getBoundingClientRect();
      onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#10B981');
      setTimeout(() => onSolved(), 680);
    } else {
      setWrongChoices((prev) => [...prev, option]);
      setShakeKey((k) => k + 1);
      triggerHaptic('error');
      playSound('error');
    }
  };

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-6">
      <div
        key={levelId}
        className="animate-screen-enter rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-7 shadow-[0_14px_36px_rgba(24,26,31,0.07)] sm:p-9 dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_18px_48px_rgba(0,0,0,0.42)]"
      >
        <p className="text-base leading-relaxed text-[#383D47] dark:text-[#C5CEDE]">
          {puzzle.prompt}
        </p>

        {/* Sequence Display */}
        <div className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {puzzle.sequence.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-xl border border-[#E2E0D8] bg-[#F8F7F3] py-4 dark:border-[#293448] dark:bg-[#1B2230]"
            >
              {item.sublabel && (
                <span className="text-[11px] font-medium text-[#757C8A] dark:text-[#7E8BA3]">
                  {item.sublabel}
                </span>
              )}
              <span className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#181A1F] dark:text-[#F3F5F8]">
                {item.value}
              </span>
            </div>
          ))}

          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 py-4 transition-colors ${
              solved
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'border-dashed border-[#2B4EFF]/60 bg-[#2B4EFF]/6 text-[#2B4EFF] dark:border-[#F5A524]/70 dark:bg-[#F5A524]/10 dark:text-[#F5A524]'
            }`}
          >
            <span className="text-[11px] font-medium opacity-80">Next</span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {solved ? puzzle.correctAnswer : '?'}
            </span>
          </div>
        </div>

        {/* Progressive Clues */}
        {revealedClues > 0 && (
          <div className="mt-6 space-y-2 border-t border-[#ECEAE3] pt-4 dark:border-[#242D3F]">
            {puzzle.clues.slice(0, revealedClues).map((clue, idx) => (
              <p
                key={idx}
                className="flex items-start gap-2.5 text-sm text-[#424854] dark:text-[#C5CEDE]"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#2B4EFF] dark:text-[#F5A524]" />
                <span>
                  <strong className="font-semibold">Hint {idx + 1}:</strong> {clue}
                </span>
              </p>
            ))}
          </div>
        )}

        {/* Dial Choices */}
        <div
          key={shakeKey}
          className={`mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 ${
            selected && wrongChoices.includes(selected) ? 'animate-lattice-shake' : ''
          }`}
        >
          {puzzle.options.map((option) => {
            const isWrong = wrongChoices.includes(option);
            const isCorrect = solved && option === puzzle.correctAnswer;
            return (
              <button
                key={option}
                type="button"
                disabled={solved || isWrong}
                onClick={(e) => handleChoose(option, e)}
                className={`min-h-14 rounded-xl border font-mono text-xl font-semibold tabular-nums transition-all active:scale-96 ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isWrong
                      ? 'border-rose-300 bg-rose-50 text-rose-400 line-through dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-500'
                      : 'border-[#D8D5CB] bg-[#F8F7F3] text-[#181A1F] hover:border-[#2B4EFF] hover:bg-[#2B4EFF]/8 dark:border-[#2D384D] dark:bg-[#1B2230] dark:text-[#F3F5F8] dark:hover:border-[#F5A524] dark:hover:bg-[#F5A524]/12'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {solved && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            Lock opened — {puzzle.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
