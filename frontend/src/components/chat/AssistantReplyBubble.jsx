import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { RevealAnswerText } from './RevealAnswerText';
import { ReplySparkleOverlay } from './ReplySparkleOverlay';
import { ReplyShimmerSweep } from './ReplyShimmerSweep';

/**
 * Animated assistant message: entry pop, reveal text, then sparkles + shimmer flourish.
 */
export function AssistantReplyBubble({ text, isStreaming, isBusy }) {
  const reduced = usePrefersReducedMotion();
  const [flourish, setFlourish] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  const armFlourish = useCallback(() => {
    if (reduced) return;
    setFlourish(true);
    setShimmer(true);
    window.setTimeout(() => setFlourish(false), 950);
    window.setTimeout(() => setShimmer(false), 1500);
  }, [reduced]);

  const streamFinished = !isBusy;

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: flourish
          ? '0 16px 48px -12px rgba(139,92,246,0.28), 0 0 0 1px rgba(196,181,253,0.45), 0 0 32px rgba(167,139,250,0.18)'
          : '0 10px 36px -14px rgba(99,102,241,0.14), 0 0 0 1px rgba(237,233,254,0.85)',
      }}
      transition={{
        opacity: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
        scale: reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 24 },
        boxShadow: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        exit: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      }}
      className="relative mt-8 overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/95 to-fuchsia-50/60 p-5 shadow-lg backdrop-blur-sm"
    >
      <AnimatePresence>{flourish ? <ReplySparkleOverlay key="spark" /> : null}</AnimatePresence>
      <ReplyShimmerSweep active={Boolean(shimmer && !reduced)} />

      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700/80">Reply</p>
      <RevealAnswerText
        text={text}
        isStreaming={isStreaming}
        streamFinished={streamFinished}
        reducedMotion={reduced}
        onSettled={armFlourish}
      />
    </motion.article>
  );
}
