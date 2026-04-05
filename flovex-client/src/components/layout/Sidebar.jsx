import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeftRight, Sparkles, Settings, LogOut, X, BookOpen, Repeat2 } from 'lucide-react';
import { useRole } from '../../hooks/useRole';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, end: true },
  { to: '/dashboard/transactions',  label: 'Transactions',  icon: ArrowLeftRight },
  { to: '/dashboard/subscriptions', label: 'Subscriptions', icon: Repeat2 },
  { to: '/dashboard/insights',      label: 'Insights',      icon: Sparkles },
];

const sidebarVariants = {
  hidden: { x: -260 },
  visible: { x: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit: { x: -260, transition: { duration: 0.22, ease: 'easeIn' } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 300 } }),
};

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isAdmin } = useRole();

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ to: '/dashboard/api-docs', label: 'API Docs', icon: BookOpen }] : []),
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col w-64 min-h-screen bg-[#1A1A1F] text-white fixed left-0 top-0 z-40 shadow-2xl"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="8" width="11" height="11" rx="2" fill="#5046E4" transform="rotate(-15 2 8)" />
            <rect x="12" y="10" width="11" height="11" rx="2" fill="#7DB89A" opacity="0.85" transform="rotate(10 12 10)" />
          </svg>
          <span className="font-display font-bold text-xl tracking-tight">Flovex</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User avatar */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-flovex flex items-center justify-center text-white font-bold text-sm">
            {role === 'admin' ? 'AD' : 'VW'}
          </div>
          <div>
            <p className="text-sm font-semibold">{role === 'admin' ? 'Admin User' : 'Viewer User'}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role === 'admin' ? 'bg-indigo-flovex/20 text-indigo-light' : 'bg-sage/20 text-sage'}`}>
              {role === 'admin' ? 'Admin Mode' : 'Viewer Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item, i) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <motion.div key={item.to} custom={i} variants={itemVariants} initial="hidden" animate="visible" className="relative">
              {/* Active indicator — left-0 is sidebar left edge since motion.div fills full nav width */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-indigo-flovex rounded-r-full"
                />
              )}
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-indigo-flovex/15 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
