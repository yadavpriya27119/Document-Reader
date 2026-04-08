import { motion } from 'framer-motion';

/**
 * Document icon with gentle float + vertical scan line (loading feel).
 */
export function UploadScanningIcon({ reducedMotion = false, children }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-b from-white to-violet-50/40 text-violet-600 shadow-[0_8px_24px_-6px_rgba(124,58,237,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {!reducedMotion ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.07] via-transparent to-indigo-500/[0.06]"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-[38%] bg-gradient-to-b from-transparent via-violet-400/35 to-transparent"
            initial={{ top: '-40%' }}
            animate={{ top: ['-40%', '110%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          />
        </>
      ) : null}
      <motion.div
        className="relative z-[1]"
        animate={
          reducedMotion
            ? {}
            : {
                y: [0, -4, 0],
                scale: [1, 1.04, 1],
              }
        }
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
