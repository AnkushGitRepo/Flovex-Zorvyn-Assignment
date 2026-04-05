import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setSearch, setCategory, setType, setSort, selectFilters } from '../store/filtersSlice';
import { addNotification } from '../store/notificationsSlice';
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from '../store/api/transactionsApi';
import { useRole } from '../hooks/useRole';
import CompanyLogo from '../components/ui/CompanyLogo';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Salary', 'Freelance', 'Utilities', 'Entertainment', 'Investment'];

const emptyForm = { name: '', amount: '', category: 'Food', type: 'expense', status: 'completed', date: new Date().toISOString().split('T')[0], note: '' };

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border text-sm text-dark rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer hover:border-indigo-flovex/40 transition-colors font-body"
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
    </div>
  );
}

function TxForm({ initial = emptyForm, onSave, formId }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const isCustomCategory = !CATEGORIES.includes(form.category);
  const [useCustom, setUseCustom] = useState(() => {
    const cat = initial.category;
    return !!cat && !CATEGORIES.includes(cat);
  });

  const handleCategoryChange = (val) => {
    if (val === '__custom__') {
      setUseCustom(true);
      set('category', '');
    } else {
      setUseCustom(false);
      set('category', val);
    }
  };

  const inputCls = 'w-full bg-cream border border-border rounded-xl px-3 py-2 text-sm text-dark outline-none focus:border-indigo-flovex/50 transition-colors font-body';

  return (
    <form id={formId} className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, amount: Number(form.amount) }); }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted mb-1 block">Name</label>
          <input required className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Zomato Order" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Amount (₹)</label>
          <input required type="number" min="0.01" step="any" className={inputCls} value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Date</label>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Category</label>
          {useCustom ? (
            <div className="flex gap-2">
              <input
                required
                className={inputCls}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Enter category name"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setUseCustom(false); set('category', 'Food'); }}
                className="shrink-0 text-xs text-muted hover:text-dark px-2 rounded-xl border border-border bg-cream transition-colors"
                title="Back to presets"
              >
                ✕
              </button>
            </div>
          ) : (
            <select className={inputCls} value={isCustomCategory ? '__custom__' : form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              <option value="__custom__">Custom…</option>
            </select>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Type</label>
          <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Status</label>
          <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="chargeback">Chargeback</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Note (optional)</label>
          <input className={inputCls} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Any note..." />
        </div>
      </div>
    </form>
  );
}

function TxFormFooter({ formId, onCancel, loading }) {
  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
      <Button
        variant="primary"
        type="submit"
        form={formId}
        disabled={loading}
        className="flex-1"
      >
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}

const MAX_MONTHS_BACK = 24;

function MonthNavigator({ value, onChange }) {
  const now = new Date();
  const earliest = new Date(now.getFullYear(), now.getMonth() - MAX_MONTHS_BACK, 1);
  const current = new Date(value.year, value.month - 1, 1);

  const canGoBack = current > earliest;
  const canGoForward = current < new Date(now.getFullYear(), now.getMonth(), 1);

  const go = (dir) => {
    const next = new Date(value.year, value.month - 1 + dir, 1);
    onChange({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const label = format(current, 'MMMM yyyy');

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-display font-bold text-dark">Transactions</h3>
        <p className="text-xs text-muted">Showing records for {label}</p>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => go(-1)}
          disabled={!canGoBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-border hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} className="text-dark" />
        </motion.button>
        <span className="text-sm font-semibold text-dark min-w-32 text-center">{label}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => go(1)}
          disabled={!canGoForward}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-border hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} className="text-dark" />
        </motion.button>
      </div>
    </div>
  );
}

export default function Transactions() {
  const dispatch = useDispatch();
  const { search, category, type, sort } = useSelector(selectFilters);
  const { isAdmin } = useRole();

  const now = new Date();
  const [activeMonth, setActiveMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const queryParams = {
    ...(search && { search }),
    ...(category !== 'all' && { category }),
    ...(type !== 'all' && { type }),
    sort,
    month: activeMonth.month,
    year: activeMonth.year,
    limit: 200,
  };

  const { data, isLoading } = useGetTransactionsQuery(queryParams);
  const [createTx, { isLoading: creating }] = useCreateTransactionMutation();
  const [updateTx, { isLoading: updating }] = useUpdateTransactionMutation();
  const [deleteTx, { isLoading: deleting }] = useDeleteTransactionMutation();

  const transactions = data?.data || [];

  const handleCreate = async (form) => {
    const res = await createTx(form);
    if (!res.error) {
      dispatch(addNotification({ message: `Transaction "${form.name}" added — ${form.type === 'income' ? '+' : '-'}₹${Number(form.amount).toLocaleString('en-IN')}` }));
    }
    setAddOpen(false);
  };

  const handleEdit = async (form) => {
    const res = await updateTx({ id: editTx._id, ...form });
    if (!res.error) {
      dispatch(addNotification({ message: `Transaction "${form.name}" updated` }));
    }
    setEditTx(null);
  };

  const handleDelete = async () => {
    const res = await deleteTx(deleteId);
    if (!res.error) {
      dispatch(addNotification({ message: 'Transaction deleted' }));
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card className="p-4" hover={false}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 bg-cream border border-border rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={15} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="bg-transparent text-sm text-dark placeholder-muted outline-none w-full font-body"
            />
          </div>
          <FilterSelect value={category} onChange={(v) => dispatch(setCategory(v))} options={CATEGORIES} placeholder="All Categories" />
          <FilterSelect
            value={type}
            onChange={(v) => dispatch(setType(v))}
            options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
            placeholder="All Types"
          />
          <FilterSelect
            value={sort}
            onChange={(v) => dispatch(setSort(v))}
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'highest', label: 'Highest' },
              { value: 'lowest', label: 'Lowest' },
            ]}
            placeholder="Sort"
          />
          {isAdmin && (
            <Button variant="primary" onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 ml-auto shrink-0">
              <Plus size={16} /> Add Transaction
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden" hover={false}>
        <div className="p-4 border-b border-border">
          <MonthNavigator value={activeMonth} onChange={setActiveMonth} />
          {data?.meta?.total !== undefined && (
            <p className="text-xs text-muted mt-1">{data.meta.total} record{data.meta.total !== 1 ? 's' : ''}</p>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted font-semibold">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((tx) => (
                    <motion.tr
                      key={tx._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-border last:border-0 hover:bg-cream/60 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={tx.name} size={32} />
                          <span className="font-medium text-dark">{tx.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{tx.category}</td>
                      <td className="px-4 py-3 text-muted">{format(new Date(tx.date), 'dd MMM yyyy')}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.type === 'income' ? 'text-sage' : 'text-rose-flovex'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={tx.status} variant={tx.status} />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditTx(tx)}
                              className="p-1.5 rounded-lg hover:bg-indigo-flovex/10 text-muted hover:text-indigo-flovex transition-colors"
                            >
                              <Pencil size={15} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteId(tx._id)}
                              className="p-1.5 rounded-lg hover:bg-rose-flovex/10 text-muted hover:text-rose-flovex transition-colors"
                            >
                              <Trash2 size={15} />
                            </motion.button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* FAB — Admin only */}
      {isAdmin && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-flovex text-white rounded-full shadow-glow flex items-center justify-center z-40"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Transaction"
        footer={<TxFormFooter formId="form-add" onCancel={() => setAddOpen(false)} loading={creating} />}
      >
        <TxForm formId="form-add" onSave={handleCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTx}
        onClose={() => setEditTx(null)}
        title="Edit Transaction"
        footer={<TxFormFooter formId="form-edit" onCancel={() => setEditTx(null)} loading={updating} />}
      >
        {editTx && (
          <TxForm
            formId="form-edit"
            initial={{ ...editTx, date: new Date(editTx.date).toISOString().split('T')[0] }}
            onSave={handleEdit}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Transaction"
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1">
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">Are you sure you want to delete this transaction? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
