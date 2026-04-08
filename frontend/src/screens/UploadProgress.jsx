import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { UploadProgressBar } from '../components/upload/UploadProgressBar';
import { FileDocumentIcon } from '../components/upload/FileDocumentIcon';
import { UploadingLabel } from '../components/upload/UploadingLabel';

const EASE_OUT = [0.22, 1, 0.36, 1];

export function UploadProgress({ progress, fileName }) {
  const reduced = usePrefersReducedMotion();
  const targetPct = Math.min(100, Math.max(0, progress * 100));
  const isSuccess = targetPct >= 99.5;

  const pctMotion = useMotionValue(targetPct);
  const smoothMv = useSpring(pctMotion, {
    stiffness: reduced ? 320 : 80,
    damping: reduced ? 38 : 22,
    mass: 0.9,
  });
  const [displayPct, setDisplayPct] = useState(() =>
    Math.min(100, Math.round(targetPct)),
  );

  useEffect(() => {
    pctMotion.set(targetPct);
  }, [targetPct, pctMotion]);

  useMotionValueEvent(smoothMv, 'change', (v) => {
    setDisplayPct(Math.min(100, Math.round(v)));
  });

  return (
    <motion.div
      className="relative w-full max-w-md px-4"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <motion.div
        className="relative flex flex-col items-center text-center"
        animate={
          isSuccess && !reduced
            ? { scale: [1, 1.008, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.65, ease: EASE_OUT }}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-600/85">
          {isSuccess ? 'Complete' : 'Upload'}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {isSuccess ? 'File processed' : 'Sending your file'}
        </h2>

        <p className="mt-1.5 text-sm text-slate-500">
          {isSuccess
            ? 'Indexed and ready when you are.'
            : 'Secure upload — hang tight for a moment.'}
        </p>

        {fileName ? (
          <div className="mt-8 flex w-full max-w-full items-center gap-3 text-left">
            <FileDocumentIcon reducedMotion={reduced} />
            <p
              className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800"
              title={fileName}
            >
              {fileName}
            </p>
          </div>
        ) : null}

        <div className={`mt-8 w-full overflow-visible ${isSuccess ? 'pr-6 sm:pr-7' : ''}`}>
          <div className="mb-3 flex items-end justify-between gap-3">
            {isSuccess ? (
              <span className="text-sm font-medium text-emerald-600">Done</span>
            ) : (
              <UploadingLabel />
            )}
            <motion.span
              className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl"
              initial={false}
              animate={{ opacity: 1 }}
            >
              {displayPct}
              <span className="ml-0.5 text-lg font-semibold text-slate-400">%</span>
            </motion.span>
          </div>

          <UploadProgressBar
            value={progress}
            isSuccess={isSuccess}
            reducedMotion={reduced}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
