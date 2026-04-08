import { motion } from 'framer-motion';

/**
 * “Uploading” with animated ellipsis.
 */
export function UploadingLabel({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-0 text-sm font-medium text-slate-500 ${className}`}
    >
      <span>Uploading</span>
      <span className="inline-flex w-[1.15em] justify-start">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block w-[0.28em] text-center"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.18,
            }}
          >
            .
          </motion.span>
        ))}
      </span>
    </span>
  );
}
