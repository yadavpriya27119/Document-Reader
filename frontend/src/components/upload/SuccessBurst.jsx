import { motion } from 'framer-motion';

const PARTICLES = [
  { x: -28, y: -42, r: -140, s: 0.55 },
  { x: 36, y: -36, r: 40, s: 0.5 },
  { x: -40, y: 22, r: 120, s: 0.45 },
  { x: 44, y: 28, r: -60, s: 0.5 },
  { x: 0, y: -52, r: 0, s: 0.4 },
  { x: -52, y: -8, r: 180, s: 0.42 },
  { x: 48, y: -12, r: -100, s: 0.48 },
  { x: -20, y: 46, r: 70, s: 0.38 },
  { x: 24, y: 40, r: -30, s: 0.44 },
  { x: -36, y: -28, r: 200, s: 0.36 },
];

/**
 * Lightweight burst (no canvas): small dots radiate and fade — confetti-adjacent, calm.
 */
export function SuccessBurst({ reducedMotion = false }) {
  if (reducedMotion) return null;
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-0 w-0 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full bg-violet-400/90 shadow-sm shadow-violet-300/50"
          style={{ marginLeft: -3, marginTop: -3 }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0.85, 0],
            scale: [0, p.s, p.s * 0.85, 0.2],
            x: p.x,
            y: p.y,
            rotate: p.r,
          }}
          transition={{
            duration: 0.85,
            delay: i * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}
