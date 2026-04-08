import { motion } from 'framer-motion';

export function Card({ title, subtitle, children, className = '', delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl shadow-black/40 backdrop-blur-xl ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
      <div className="relative">
        {title ? (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </motion.section>
  );
}
