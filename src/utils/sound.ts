type SoundEvent = 'tap' | 'step' | 'connect' | 'toggle' | 'hint' | 'error' | 'victory';

let soundEnabled = true;
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number,
  delay = 0
): void {
  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playSound(event: SoundEvent, stepIndex = 0): void {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    switch (event) {
      case 'tap': {
        playTone(ctx, 420, 0.06, 'sine', 0.055);
        break;
      }
      case 'step': {
        // Gentle pentatonic ascent as path extends
        const scale = [330, 370, 415, 494, 554, 659, 740, 831];
        const note = scale[Math.min(stepIndex, scale.length - 1)];
        playTone(ctx, note, 0.075, 'triangle', 0.05);
        break;
      }
      case 'toggle': {
        playTone(ctx, 310 + (stepIndex % 4) * 35, 0.09, 'triangle', 0.065);
        break;
      }
      case 'connect': {
        playTone(ctx, 523.25, 0.14, 'sine', 0.07, 0);
        playTone(ctx, 659.25, 0.18, 'sine', 0.075, 0.06);
        break;
      }
      case 'hint': {
        playTone(ctx, 587.33, 0.14, 'sine', 0.055, 0);
        playTone(ctx, 783.99, 0.16, 'sine', 0.05, 0.07);
        break;
      }
      case 'error': {
        playTone(ctx, 185, 0.13, 'sawtooth', 0.045, 0);
        playTone(ctx, 148, 0.16, 'sawtooth', 0.04, 0.09);
        break;
      }
      case 'victory': {
        const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
        chord.forEach((freq, idx) => {
          playTone(ctx, freq, 0.34, 'triangle', 0.065, idx * 0.065);
        });
        break;
      }
    }
  } catch {
    // Ignore audio context edge errors in headless environments
  }
}
