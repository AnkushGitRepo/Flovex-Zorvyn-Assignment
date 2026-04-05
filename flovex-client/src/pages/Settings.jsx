import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Download, Sun, Moon, Monitor } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRole } from '../hooks/useRole';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useGetTransactionsQuery } from '../store/api/transactionsApi';
import { addNotification } from '../store/notificationsSlice';
import { format } from 'date-fns';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280 } } };

function RoleToggle({ role, setRole }) {
  const isAdmin = role === 'admin';

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setRole(isAdmin ? 'viewer' : 'admin')}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isAdmin ? 'bg-indigo-flovex' : 'bg-border'}`}
      >
        <motion.span
          animate={{ x: isAdmin ? 30 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute inline-block h-5 w-5 rounded-full bg-white shadow-sm"
        />
      </button>
      <div>
        <p className="text-sm font-semibold text-dark">{isAdmin ? 'Admin Mode' : 'Viewer Mode'}</p>
        <p className="text-xs text-muted">{isAdmin ? 'Full edit access enabled' : 'Read-only access'}</p>
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function Settings() {
  const dispatch = useDispatch();
  const { role, isAdmin, setRole } = useRole();
  const { theme, setTheme } = useTheme();
  const { data } = useGetTransactionsQuery({ limit: 1000 });
  const transactions = data?.data || [];

  const handleExportCSV = () => {
    const headers = ['Name', 'Amount', 'Category', 'Type', 'Status', 'Date'];
    const rows = transactions.map((tx) => [
      tx.name,
      tx.amount,
      tx.category,
      tx.type,
      tx.status,
      format(new Date(tx.date), 'dd/MM/yyyy'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flovex-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(addNotification({ message: `Exported ${transactions.length} transactions as CSV` }));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">

      {/* Role Switcher */}
      <motion.div variants={item}>
        <Card className="p-6">
          <h3 className="font-display font-bold text-dark mb-1">Role & Permissions</h3>
          <p className="text-xs text-muted mb-5">Switch between Admin and Viewer mode. Changes take effect immediately across all pages.</p>

          <RoleToggle role={role} setRole={setRole} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${role === 'admin' ? 'border-indigo-flovex/30 bg-indigo-flovex/5' : 'border-border bg-cream/50 opacity-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-indigo-flovex" />
                <span className="text-sm font-semibold text-dark">Admin</span>
              </div>
              <ul className="text-xs text-muted space-y-0.5">
                <li>✓ Add transactions</li>
                <li>✓ Edit transactions</li>
                <li>✓ Delete transactions</li>
                <li>✓ Export CSV</li>
              </ul>
            </div>
            <div className={`p-3 rounded-xl border ${role === 'viewer' ? 'border-sage/30 bg-sage/5' : 'border-border bg-cream/50 opacity-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Eye size={16} className="text-sage" />
                <span className="text-sm font-semibold text-dark">Viewer</span>
              </div>
              <ul className="text-xs text-muted space-y-0.5">
                <li>✓ View dashboard</li>
                <li>✓ View transactions</li>
                <li>✓ View insights</li>
                <li>✗ Edit or delete</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div variants={item}>
        <Card className="p-6">
          <h3 className="font-display font-bold text-dark mb-1">Appearance</h3>
          <p className="text-xs text-muted mb-5">Choose how Flovex looks. System follows your OS preference.</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? 'border-indigo-flovex bg-indigo-flovex/8 text-indigo-flovex'
                      : 'border-border bg-cream/50 text-muted hover:border-indigo-flovex/40 hover:text-dark'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Data Management — Admin only */}
      {isAdmin && (
        <motion.div variants={item}>
          <Card className="p-6">
            <h3 className="font-display font-bold text-dark mb-1">Data Management</h3>
            <p className="text-xs text-muted mb-5">Export your data or reset to default seeded data.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={handleExportCSV} className="flex items-center gap-2">
                <Download size={16} />
                Export Transactions as CSV
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* App Info */}
      <motion.div variants={item}>
        <Card className="p-6">
          <h3 className="font-display font-bold text-dark mb-4">About Flovex</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Stack', value: 'MERN + Redux Toolkit + RTK Query' },
              { label: 'Animations', value: 'Framer Motion' },
              { label: 'Charts', value: 'Recharts' },
              { label: 'Current Role', value: role === 'admin' ? 'Admin' : 'Viewer' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-medium text-dark">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
