import { motion } from 'framer-motion';

export function UploadingDots({ reducedMotion = false }) {
  if (reducedMotion) {
    return <span className="text-slate-400">…</span>;
  }
  return (
    <span className="inline-flex translate-y-px gap-0.5 pl-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-violet-400"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.14,
          }}
        />
      ))}
    </span>
  );
}
