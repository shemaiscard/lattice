export type HapticPattern = 'tap' | 'step' | 'connect' | 'toggle' | 'error' | 'hint' | 'victory';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  step: 8,
  toggle: 12,
  hint: [10, 22, 10],
  connect: [14, 24, 22],
  error: [35, 32, 35],
  victory: [18, 34, 22, 34, 48],
};

let hapticsEnabled = true;

type HapticListener = (pattern: HapticPattern) => void;
const listeners = new Set<HapticListener>();

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function subscribeHaptics(listener: HapticListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (!hapticsEnabled) return;

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERNS[pattern]);
    }
  } catch {
    // Vibration API may be blocked or unsupported in desktop browsers
  }

  for (const listener of listeners) {
    listener(pattern);
  }
}
