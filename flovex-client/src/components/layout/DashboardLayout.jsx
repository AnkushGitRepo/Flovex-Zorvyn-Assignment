import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sidebarOpen && (
          <Sidebar key="mobile-sidebar" onClose={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="page-transition"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
