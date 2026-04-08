import { motion } from 'framer-motion';

const EASE_DRIFT = [0.42, 0, 0.58, 1];

/**
 * Floating upload panel: ambient pool, animated gradient rim, sharp inner surface, subtle 3D drift.
 */
export function UploadProgressCard({
  children,
  isUploading,
  isSuccess,
  reducedMotion = false,
}) {
  const tilt = reducedMotion
    ? {}
    : {
        rotateX: [0, 0.55, -0.35, 0.45, 0],
        rotateY: [0, -0.65, 0.45, -0.3, 0],
      };

  const pulse =
    reducedMotion || isSuccess
      ? { scale: 1 }
      : { scale: [1, 1.007, 0.999, 1] };

  return (
    <div className="relative mx-auto w-full max-w-md px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(32rem,135%)] w-[min(28rem,115%)] -translate-x-1/2 -translate-y-1/2 rounded-[2.25rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(139,92,246,0.22),rgba(99,102,241,0.08)_45%,transparent_70%)] blur-xl"
        aria-hidden
      />
      {!reducedMotion ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-48 w-64 -translate-x-1/2 rounded-full bg-indigo-400/12 blur-2xl"
          animate={{ opacity: [0.45, 0.75, 0.5, 0.45], scale: [1, 1.08, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      <motion.div
        className="relative"
        style={{ perspective: 960 }}
        animate={pulse}
        transition={
          reducedMotion
            ? {}
            : { duration: 3.2, repeat: isSuccess ? 0 : Infinity, ease: 'easeInOut' }
        }
      >
        <motion.div
          className="rounded-[1.85rem] p-px shadow-[0_25px_60px_-15px_rgba(91,33,182,0.2)]"
          style={{
            backgroundImage:
              'linear-gradient(125deg, #7c3aed 0%, #6366f1 20%, #a78bfa 45%, #818cf8 70%, #c084fc 100%)',
            backgroundSize: '240% 240%',
          }}
          animate={
            reducedMotion
              ? {}
              : { backgroundPosition: ['0% 40%', '100% 55%', '0% 40%'] }
          }
          transition={{
            backgroundPosition: { duration: 9, repeat: Infinity, ease: 'linear' },
          }}
        >
          <motion.div
            className="relative overflow-hidden rounded-[1.8rem] bg-white px-8 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_8px_rgba(15,23,42,0.04)] sm:px-10 sm:py-11"
            style={{ transformStyle: 'preserve-3d' }}
            animate={tilt}
            transition={{ duration: 16, repeat: Infinity, ease: EASE_DRIFT }}
          >
            {!reducedMotion ? (
              <motion.div
                className="pointer-events-none absolute -inset-1 rounded-[1.8rem] opacity-[0.28]"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.95) 44%, rgba(237,233,254,0.45) 52%, transparent 74%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['130% 0', '-50% 0'] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                aria-hidden
              />
            ) : null}

            <div className="relative z-[1]">{children}</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
