import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Check, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNotifications, selectUnreadCount, markAllRead, clearAll } from '../../store/notificationsSlice';
import { useRole } from '../../hooks/useRole';
import { formatDistanceToNow } from 'date-fns';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/subscriptions': 'Subscriptions',
  '/dashboard/insights': 'Insights',
  '/dashboard/api-docs': 'API Docs',
  '/dashboard/settings': 'Settings',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useRole();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const panelRef = useRef(null);

  const title = pageTitles[location.pathname] || 'Dashboard';

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleOpen = () => {
    setNotifOpen((p) => !p);
    if (!notifOpen && unreadCount > 0) {
      // Mark all read when opening
      setTimeout(() => dispatch(markAllRead()), 300);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-cream/80 backdrop-blur border-b border-border">
      {/* Left: menu + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-border transition-colors"
        >
          <Menu size={20} className="text-dark" />
        </button>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-xl text-dark"
        >
          {title}
        </motion.h1>
      </div>

      {/* Right: notif + role badge */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleOpen}
            className="relative p-2 rounded-xl hover:bg-border transition-colors"
          >
            <Bell size={20} className="text-dark" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-flovex rounded-full flex items-center justify-center text-[9px] text-white font-bold px-0.5"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
            {unreadCount === 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-border rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-card-hover z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="font-display font-bold text-sm text-dark">Notifications</p>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => dispatch(clearAll())}
                      className="flex items-center gap-1 text-xs text-muted hover:text-rose-flovex transition-colors"
                    >
                      <Trash2 size={12} /> Clear all
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Check size={20} className="text-muted mx-auto mb-2" />
                      <p className="text-xs text-muted">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                          !n.read ? 'bg-indigo-flovex/5' : ''
                        }`}
                      >
                        {!n.read && (
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-flovex shrink-0" />
                        )}
                        <div className={!n.read ? '' : 'ml-[18px]'}>
                          <p className="text-xs font-medium text-dark leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => navigate('/dashboard/settings')}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
            role === 'admin'
              ? 'bg-indigo-flovex/10 text-indigo-flovex hover:bg-indigo-flovex/20'
              : 'bg-sage/10 text-sage hover:bg-sage/20'
          }`}
        >
          {role === 'admin' ? 'Admin Mode' : 'Viewer Mode'}
        </button>
      </div>
    </header>
  );
}
