import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

export interface ParticleBurstHandle {
  burst: (clientX: number, clientY: number, color: string, count?: number) => void;
  celebrate: () => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 0 | 1; // 0 = circle, 1 = diamond
}

const POOL_SIZE = 140;
const CELEBRATION_COLORS = ['#F5A524', '#2E7CF6', '#10B981', '#E84A5F', '#9333EA', '#06B6D4'];

export const ParticleCanvas = forwardRef<ParticleBurstHandle>(function ParticleCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poolRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    // Pre-allocate fixed zero-GC particle ring buffer
    const pool: Particle[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        alpha: 0,
        life: 0,
        maxLife: 0.7,
        color: '#F5A524',
        rotation: 0,
        vRot: 0,
        shape: 0,
      });
    }
    poolRef.current = pool;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ensureLoop = () => {
    if (rafRef.current !== null) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastTimeRef.current) / 1000;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        rafRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let anyActive = false;
      const pool = poolRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        anyActive = true;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt; // subtle gravity
        p.vx *= 0.985;
        p.rotation += p.vRot * dt;
        const progress = p.life / p.maxLife;
        p.alpha = 1 - progress * progress;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * (1 - progress * 0.35), 0, Math.PI * 2);
          ctx.fill();
        } else {
          const s = p.size * (1 - progress * 0.25);
          ctx.fillRect(-s, -s, s * 2, s * 2);
        }
        ctx.restore();
      }

      if (anyActive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const spawn = (x: number, y: number, color: string, count: number, speedScale: number) => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const pool = poolRef.current;
    let spawned = 0;
    for (let i = 0; i < pool.length && spawned < count; i++) {
      const p = pool[i];
      if (p.active) continue;
      const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.45;
      const speed = (110 + Math.random() * 190) * speedScale;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 70 * speedScale;
      p.size = 3 + Math.random() * 3.5;
      p.life = 0;
      p.maxLife = 0.55 + Math.random() * 0.4;
      p.color = color;
      p.rotation = Math.random() * Math.PI;
      p.vRot = (Math.random() - 0.5) * 8;
      p.shape = Math.random() > 0.45 ? 1 : 0;
      spawned += 1;
    }
    if (spawned > 0) ensureLoop();
  };

  useImperativeHandle(ref, () => ({
    burst(clientX: number, clientY: number, color: string, count = 16) {
      spawn(clientX, clientY, color, count, 1);
    },
    celebrate() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      CELEBRATION_COLORS.forEach((col, i) => {
        spawn(
          w * (0.28 + (i % 3) * 0.22),
          h * (0.34 + Math.floor(i / 3) * 0.12),
          col,
          14,
          1.35
        );
      });
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
});
