import { motion } from 'framer-motion';

export default function EmptyState({ title = 'No results', message = 'Try adjusting your filters.' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-4 opacity-30">
        <circle cx="40" cy="40" r="36" stroke="#9B9BAD" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M28 40h24M40 28v24" stroke="#9B9BAD" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="font-display font-bold text-lg text-dark">{title}</p>
      <p className="text-sm text-muted mt-1">{message}</p>
    </motion.div>
  );
}
