import { motion } from 'framer-motion';

const EASE = [0.25, 0.1, 0.25, 1];

/**
 * Minimal horizontal progress: subtle gradient, soft glow, shimmer, leading-edge highlight.
 * @param {{ value: number, isSuccess?: boolean, reducedMotion?: boolean, className?: string }} props
 */
export function UploadProgressBar({
  value,
  isSuccess = false,
  reducedMotion = false,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, value * 100));

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100/90 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70">
        <motion.div
          className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
          initial={false}
          animate={{
            width: `${pct}%`,
            boxShadow: isSuccess
              ? '0 0 22px 5px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.35)'
              : '0 0 14px 2px rgba(139,92,246,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
          transition={
            reducedMotion
              ? { duration: 0.2 }
              : {
                  width: {
                    type: 'spring',
                    stiffness: 95,
                    damping: 26,
                    mass: 0.85,
                  },
                  boxShadow: { duration: 0.5, ease: EASE },
                }
          }
        >
          <div
            className="h-full min-w-[1.75rem] rounded-full bg-gradient-to-r from-violet-500/95 via-indigo-500 to-sky-500/90"
            style={{
              backgroundSize: '200% 100%',
            }}
          />

          {!reducedMotion && !isSuccess ? (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ width: '38%' }}
              initial={{ x: '-120%' }}
              animate={{ x: ['-120%', '380%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            />
          ) : null}

          {!reducedMotion && pct > 2 && !isSuccess ? (
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 w-[10px] bg-gradient-to-l from-white/45 to-transparent"
              animate={{ opacity: [0.55, 0.95, 0.55] }}
              transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          ) : null}
        </motion.div>
      </div>

      {!reducedMotion && pct > 0.5 && pct < 99.5 ? (
        <motion.div
          className="pointer-events-none absolute top-1/2 z-[1] h-7 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-200/90 via-white to-indigo-200/90 opacity-90 blur-[3px]"
          style={{ left: `calc(${pct}% - 1.5px)` }}
          animate={{ opacity: [0.55, 0.95, 0.55], scaleY: [0.85, 1.05, 0.85] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      {isSuccess ? (
        <motion.div
          className="absolute -right-0.5 top-1/2 z-[2] flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-indigo-100"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <motion.div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600"
            initial={{ scale: 0.6 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
