import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { FlowingLinesLayer } from './FlowingLinesLayer';

/**
 * Premium app canvas — soft cool-neutral wash + whisper violet/indigo accents.
 * Palette (approx): stone-100 / neutral-50 / slate-100 base; violet-200 & indigo-200 at ~20–28% blur.
 * Motion: 24–32s loops, easeInOut — calm, not flashy. Disabled when prefers-reduced-motion.
 */
const easeDrift = { repeat: Infinity, ease: 'easeInOut' };

export function AmbientBackground() {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100 from-40% via-neutral-50 to-slate-100/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-5%,rgba(139,92,246,0.07),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_100%,rgba(99,102,241,0.05),transparent_55%)]" />

      <motion.div
        className="absolute inset-0"
        animate={reduced ? undefined : { y: [0, -12, 8, 0], x: [0, 8, -6, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FlowingLinesLayer />
      </motion.div>

      {!reduced ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/35 via-transparent to-indigo-100/30"
          animate={{ opacity: [0.45, 0.72, 0.52, 0.45] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      {reduced ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.05),transparent_45%)]" />
      ) : (
        <>
          <motion.div
            className="absolute -left-[18%] top-[-12%] h-[min(58vw,30rem)] w-[min(58vw,30rem)] rounded-full bg-violet-200/22 blur-[88px]"
            animate={{ x: [0, 36, -10, 0], y: [0, 22, 6, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 28, ...easeDrift }}
          />
          <motion.div
            className="absolute -right-[12%] top-[28%] h-[min(52vw,26rem)] w-[min(52vw,26rem)] rounded-full bg-indigo-200/18 blur-[92px]"
            animate={{ x: [0, -30, 14, 0], y: [0, 18, -8, 0] }}
            transition={{ duration: 34, ...easeDrift }}
          />
          <motion.div
            className="absolute -bottom-[8%] left-[22%] h-[min(48vw,24rem)] w-[min(48vw,24rem)] rounded-full bg-fuchsia-100/16 blur-[80px]"
            animate={{ x: [0, 20, -18, 0], y: [0, -14, 6, 0] }}
            transition={{ duration: 24, ...easeDrift }}
          />
          <motion.div
            className="absolute inset-0 opacity-[0.22] mix-blend-soft-light"
            style={{
              backgroundImage:
                'linear-gradient(118deg, transparent 0%, rgba(255,255,255,0.5) 42%, transparent 68%)',
              backgroundSize: '220% 100%',
              backgroundRepeat: 'no-repeat',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
    </div>
  );
}
