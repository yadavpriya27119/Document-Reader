import { motion } from 'framer-motion';

/**
 * Simple document icon with optional idle pulse (premium SaaS feel).
 */
export function FileDocumentIcon({ reducedMotion = false, className = '' }) {
  return (
    <motion.div
      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 ${className}`}
      animate={
        reducedMotion
          ? {}
          : {
              boxShadow: [
                '0 1px 2px rgba(15,23,42,0.06)',
                '0 4px 14px -2px rgba(99,102,241,0.18)',
                '0 1px 2px rgba(15,23,42,0.06)',
              ],
            }
      }
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        className="h-5 w-5 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </motion.div>
  );
}
