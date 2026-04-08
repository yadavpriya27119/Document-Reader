import { motion } from 'framer-motion';

/**
 * One-shot diagonal light sweep across the bubble (after content settles).
 */
export function ReplyShimmerSweep({ active }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-2xl"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.85, duration: 0.45, ease: 'easeOut' }}
      aria-hidden
    >
      <motion.div
        className="absolute -inset-y-8 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/45 to-transparent"
        initial={{ x: '-60%' }}
        animate={{ x: '220%' }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
