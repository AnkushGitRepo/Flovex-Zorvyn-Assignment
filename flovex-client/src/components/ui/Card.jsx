import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.015, boxShadow: '0 8px 32px 0 rgba(80,70,228,0.13)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={onClick}
      className={`bg-card rounded-2xl shadow-card border border-border ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
