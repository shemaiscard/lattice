import { useEffect, useRef, useState } from 'react';
import { Lightbulb, Send } from 'lucide-react';
import type { RiddlePuzzle } from '../game/types';
import { evaluateRiddleAnswer } from '../game/engine';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

interface RiddleBoardProps {
  levelId: string;
  puzzle: RiddlePuzzle;
  resetToken: number;
  hintToken: number;
  onAttempt: () => void;
  onSolved: () => void;
}

export function RiddleBoard({
  levelId,
  puzzle,
  resetToken,
  hintToken,
  onAttempt,
  onSolved,
}: RiddleBoardProps) {
  const [answerInput, setAnswerInput] = useState('');
  const [revealedClues, setRevealedClues] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'solved'>('idle');
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevHintTokenRef = useRef(hintToken);

  useEffect(() => {
    setAnswerInput('');
    setRevealedClues(0);
    setFeedback('idle');
    setShakeKey(0);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [levelId, resetToken]);

  useEffect(() => {
    if (hintToken === prevHintTokenRef.current) return;
    prevHintTokenRef.current = hintToken;
    if (feedback === 'solved') return;
    if (revealedClues < puzzle.clues.length) {
      setRevealedClues((c) => Math.min(c + 1, puzzle.clues.length));
      triggerHaptic('hint');
      playSound('hint');
    }
  }, [hintToken, puzzle.clues.length, revealedClues, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback === 'solved') return;
    if (!answerInput.trim()) {
      setFeedback('wrong');
      setShakeKey((k) => k + 1);
      triggerHaptic('error');
      playSound('error');
      return;
    }

    onAttempt();
    if (evaluateRiddleAnswer(puzzle, answerInput)) {
      setFeedback('solved');
      setAnswerInput(puzzle.answer);
      triggerHaptic('connect');
      playSound('connect');
      setTimeout(() => onSolved(), 680);
    } else {
      setFeedback('wrong');
      setShakeKey((k) => k + 1);
      triggerHaptic('error');
      playSound('error');
    }
  };

  const letters = puzzle.answer.toUpperCase().split('');
  const typedLetters = answerInput.replace(/\s+/g, '').toUpperCase().split('');

  return (
    <div className="flex w-full max-w-[640px] shrink-0 flex-col gap-4 sm:gap-6">
      <div
        key={levelId}
        className="animate-screen-enter rounded-2xl border border-[#DFDDD4] bg-[#FFFFFF] p-5 shadow-[0_14px_36px_rgba(24,26,31,0.07)] sm:p-9 dark:border-[#273042] dark:bg-[#141923] dark:shadow-[0_18px_48px_rgba(0,0,0,0.42)]"
      >
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-[#5A606B] dark:text-[#94A0B8]">
          <span>{puzzle.category}</span>
          <span className="tabular-nums">{letters.length} letters</span>
        </div>

        <blockquote className="font-[family-name:var(--font-display)] text-2xl leading-[1.42] font-medium text-[#181A1F] text-balance sm:text-[28px] dark:text-[#F3F5F8]">
          “{puzzle.prompt}”
        </blockquote>

        {/* Letter Slots Preview */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2" aria-hidden="true">
          {letters.map((targetChar, i) => {
            const shownChar =
              feedback === 'solved'
                ? targetChar
                : revealedClues >= 2 && i === 0
                  ? targetChar
                  : typedLetters[i] ?? '';
            return (
              <div
                key={i}
                style={feedback === 'solved' ? { animationDelay: `${i * 45}ms` } : undefined}
                className={`flex h-12 w-10 items-center justify-center rounded-xl border font-mono text-lg font-semibold transition-colors sm:h-13 sm:w-11 ${
                  feedback === 'solved'
                    ? 'animate-letter-wave border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : shownChar
                      ? 'border-[#2B4EFF]/50 bg-[#2B4EFF]/8 text-[#181A1F] dark:border-[#F5A524]/60 dark:bg-[#F5A524]/12 dark:text-[#F3F5F8]'
                      : 'border-[#E2E0D8] bg-[#F6F5F1] text-[#8E94A0] dark:border-[#2A3447] dark:bg-[#1B2230] dark:text-[#66738A]'
                }`}
              >
                {shownChar}
              </div>
            );
          })}
        </div>

        {/* Progressive Clues */}
        {revealedClues > 0 && (
          <div className="mt-6 space-y-2 border-t border-[#ECEAE3] pt-4 dark:border-[#242D3F]">
            {puzzle.clues.slice(0, revealedClues).map((clue, idx) => (
              <p
                key={idx}
                className="animate-screen-enter flex items-start gap-2.5 text-sm text-[#424854] dark:text-[#C5CEDE]"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#2B4EFF] dark:text-[#F5A524]" />
                <span>
                  <strong className="font-semibold">Hint {idx + 1}:</strong> {clue}
                </span>
              </p>
            ))}
          </div>
        )}

        {/* Answer Form */}
        <form
          key={shakeKey}
          onSubmit={handleSubmit}
          className={`mt-7 flex flex-col gap-3 sm:flex-row ${
            feedback === 'wrong' ? 'animate-lattice-shake' : ''
          }`}
        >
          <label htmlFor="riddle-answer" className="sr-only">
            Your answer to the riddle
          </label>
          <input
            ref={inputRef}
            id="riddle-answer"
            type="text"
            autoComplete="off"
            value={answerInput}
            disabled={feedback === 'solved'}
            onChange={(e) => {
              setAnswerInput(e.target.value);
              if (feedback === 'wrong') setFeedback('idle');
            }}
            placeholder="Type your answer..."
            className={`min-h-12 flex-1 rounded-xl border px-4 text-base font-medium outline-none transition-colors ${
              feedback === 'wrong'
                ? 'border-rose-500 bg-rose-50/70 text-[#181A1F] dark:border-rose-400 dark:bg-rose-950/30 dark:text-[#F3F5F8]'
                : 'border-[#D8D5CB] bg-[#F8F7F3] text-[#181A1F] focus:border-[#2B4EFF] dark:border-[#2D384D] dark:bg-[#1B2230] dark:text-[#F3F5F8] dark:focus:border-[#F5A524]'
            }`}
          />
          <button
            type="submit"
            disabled={feedback === 'solved'}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] px-6 text-sm font-semibold text-white transition-transform hover:opacity-95 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0 dark:bg-[#F5A524] dark:text-[#0D1017]"
          >
            <Send className="h-4 w-4" />
            <span>Submit Answer</span>
          </button>
        </form>

        {feedback === 'wrong' && (
          <p
            role="alert"
            className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400"
          >
            Not quite that word. Think laterally or press Hint [H] for a clue.
          </p>
        )}

        {feedback === 'solved' && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            Solved: {puzzle.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
