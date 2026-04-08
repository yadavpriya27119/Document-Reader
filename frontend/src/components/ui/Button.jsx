import { motion } from 'framer-motion';

const base =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45';

const variants = {
  primary:
    'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 focus-visible:outline-amber-400',
  secondary:
    'border border-white/15 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 focus-visible:outline-white/40',
  ghost:
    'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-zinc-500',
};

export function Button({
  children,
  variant = 'primary',
  disabled,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
