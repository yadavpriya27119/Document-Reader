import { motion } from 'framer-motion';

/**
 * Soft radial burst rings on upload complete — behind checkmark.
 */
export function CompletionHalo({ active, reducedMotion = false }) {
  if (!active || reducedMotion) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-0 w-0" aria-hidden>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 block h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/55 bg-violet-400/[0.12] shadow-[0_0_36px_rgba(139,92,246,0.28)]"
          initial={{ scale: 0.35, opacity: 0.75 }}
          animate={{ scale: 2.15 + i * 0.4, opacity: 0 }}
          transition={{
            duration: 0.9,
            delay: i * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}
