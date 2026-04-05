import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', onClick, type = 'button', form, className = '', disabled = false }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-flovex text-white hover:bg-indigo-dim btn-shimmer',
    secondary: 'bg-card border border-border text-dark hover:bg-border',
    ghost: 'text-dark hover:bg-border',
    danger: 'bg-rose-flovex/10 text-rose-flovex hover:bg-rose-flovex/20',
    sage: 'bg-sage/15 text-sage hover:bg-sage/25',
  };

  return (
    <motion.button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </motion.button>
  );
}
