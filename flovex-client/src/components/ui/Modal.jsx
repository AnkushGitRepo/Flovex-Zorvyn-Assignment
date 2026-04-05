import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        /* Overlay — flex container handles centering so maxHeight is viewport-relative */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
            exit={{ opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.18 } }}
            className={`relative z-10 w-full ${maxWidth} bg-card rounded-2xl shadow-card-hover border border-border flex flex-col`}
            style={{ maxHeight: 'calc(100vh - 3rem)' }}
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-border">
              <h2 className="font-display font-bold text-lg text-dark">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-border transition-colors">
                <X size={18} className="text-muted" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {children}
            </div>

            {/* Sticky footer — rendered outside scroll area so buttons never get cut */}
            {footer && (
              <div className="px-6 pb-6 pt-3 shrink-0 border-t border-border">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
