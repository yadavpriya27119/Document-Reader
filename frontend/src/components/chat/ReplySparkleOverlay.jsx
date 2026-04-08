import { motion } from 'framer-motion';

const SPARKS = [
  { style: { top: '8%', left: '12%' }, delay: 0 },
  { style: { top: '6%', right: '18%' }, delay: 0.04 },
  { style: { top: '22%', left: '4%' }, delay: 0.08 },
  { style: { top: '18%', right: '8%' }, delay: 0.02 },
  { style: { top: '48%', left: '2%' }, delay: 0.1 },
  { style: { top: '52%', right: '4%' }, delay: 0.06 },
  { style: { bottom: '14%', left: '10%' }, delay: 0.12 },
  { style: { bottom: '10%', right: '14%' }, delay: 0.05 },
  { style: { bottom: '28%', left: '22%' }, delay: 0.09 },
  { style: { bottom: '24%', right: '20%' }, delay: 0.03 },
];

/**
 * Brief premium sparkles along the bubble edge — fades quickly, non-blocking.
 */
export function ReplySparkleOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-visible rounded-2xl" aria-hidden>
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.7)]"
          style={s.style}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], scale: [0, 1.2, 1, 0.4] }}
          transition={{
            duration: 0.75,
            delay: s.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}
