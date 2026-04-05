import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import CompanyLogo from '../components/ui/CompanyLogo';
import { useRole } from '../hooks/useRole';
import { addNotification } from '../store/notificationsSlice';
import {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useProcessDueSubscriptionsMutation,
} from '../store/api/subscriptionsApi';

const CATEGORIES = [
  'Entertainment', 'Utilities', 'Food', 'Transport', 'Shopping',
  'Health', 'Education', 'Finance', 'Other',
];

const BILLING_CYCLES = [
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const cardVariant = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260 } } };

function cycleLabel(cycle) {
  return { weekly: '/wk', monthly: '/mo', yearly: '/yr' }[cycle] || '';
}

function monthlyCost(sub) {
  if (sub.billingCycle === 'monthly') return sub.amount;
  if (sub.billingCycle === 'yearly')  return sub.amount / 12;
  if (sub.billingCycle === 'weekly')  return sub.amount * 4.33;
  return 0;
}

// ── Sub-form ───────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', amount: '', category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: '', status: 'active' };

function SubscriptionForm({ formId, initial = EMPTY_FORM, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: Number(form.amount) });
  };

  const field = 'w-full bg-cream border border-border rounded-xl px-3 py-2.5 text-sm text-dark outline-none focus:border-indigo-flovex/60 transition-colors';

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted mb-1 block">Service Name</label>
        <input className={field} placeholder="e.g. Netflix" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted mb-1 block">Amount (₹)</label>
          <input className={field} type="number" min="0" step="0.01" placeholder="649" value={form.amount} onChange={(e) => set('amount', e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted mb-1 block">Billing Cycle</label>
          <select className={field} value={form.billingCycle} onChange={(e) => set('billingCycle', e.target.value)}>
            {BILLING_CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted mb-1 block">Category</label>
        <select className={field} value={form.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted mb-1 block">Next Billing Date</label>
        <input className={field} type="date" value={form.nextBillingDate} onChange={(e) => set('nextBillingDate', e.target.value)} required />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted mb-1 block">Status</label>
        <select className={field} value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </form>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
function SubscriptionCard({ sub, isAdmin, onEdit, onDelete, onTogglePause }) {
  const isPaused    = sub.status === 'paused';
  const isCancelled = sub.status === 'cancelled';

  return (
    <motion.div variants={cardVariant} layout>
      <Card className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo name={sub.name} size={40} />
            <div className="min-w-0">
              <p className="font-display font-bold text-dark text-sm leading-tight truncate">{sub.name}</p>
              <p className="text-xs text-muted mt-0.5">{sub.category}</p>
            </div>
          </div>
          <Badge label={sub.status.charAt(0).toUpperCase() + sub.status.slice(1)} variant={sub.status} />
        </div>

        {/* Amount + cycle */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-dark font-display">
              ₹{sub.amount.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-muted ml-1">{cycleLabel(sub.billingCycle)}</span>
            </p>
            {sub.billingCycle !== 'monthly' && (
              <p className="text-xs text-muted">≈ ₹{Math.round(monthlyCost(sub)).toLocaleString('en-IN')}/mo</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Next billing</p>
            <p className="text-xs font-semibold text-dark">
              {sub.nextBillingDate ? format(new Date(sub.nextBillingDate), 'dd MMM yyyy') : '—'}
            </p>
          </div>
        </div>

        {/* Actions — admin only */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <button
              onClick={() => onEdit(sub)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-dark transition-colors px-2 py-1.5 rounded-lg hover:bg-border"
            >
              <Pencil size={13} /> Edit
            </button>
            {!isCancelled && (
              <button
                onClick={() => onTogglePause(sub)}
                className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-border ${isPaused ? 'text-sage hover:text-sage' : 'text-amber-flovex hover:text-amber-flovex'}`}
              >
                {isPaused ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={() => onDelete(sub)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-rose-flovex transition-colors px-2 py-1.5 rounded-lg hover:bg-border ml-auto"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ── Status filter tabs ─────────────────────────────────────────────────────────
function StatusTabs({ active, onChange }) {
  const tabs = [
    { value: 'all',       label: 'All' },
    { value: 'active',    label: 'Active' },
    { value: 'paused',    label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            active === t.value
              ? 'bg-indigo-flovex text-white'
              : 'bg-border text-muted hover:text-dark'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const dispatch = useDispatch();
  const { isAdmin } = useRole();

  const [statusFilter, setStatusFilter] = useState('all');
  const [addOpen,    setAddOpen]    = useState(false);
  const [editSub,    setEditSub]    = useState(null);
  const [deleteSub,  setDeleteSub]  = useState(null);

  const queryParams = statusFilter !== 'all' ? { status: statusFilter } : {};
  const { data, isLoading } = useGetSubscriptionsQuery(queryParams);
  const subscriptions = data?.data || [];

  const [createSub,  { isLoading: creating }]    = useCreateSubscriptionMutation();
  const [updateSub,  { isLoading: updating }]    = useUpdateSubscriptionMutation();
  const [deleteMut,  { isLoading: deleting }]    = useDeleteSubscriptionMutation();
  const [processDue, { isLoading: processing }]  = useProcessDueSubscriptionsMutation();

  // Monthly cost summary (active only)
  const activeMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + monthlyCost(s), 0);

  const handleCreate = async (form) => {
    const res = await createSub(form);
    if (!res.error) {
      dispatch(addNotification({ message: `Subscription "${form.name}" added — ₹${Number(form.amount).toLocaleString('en-IN')}${cycleLabel(form.billingCycle)}` }));
    }
    setAddOpen(false);
  };

  const handleEdit = async (form) => {
    const res = await updateSub({ id: editSub._id, ...form });
    if (!res.error) {
      dispatch(addNotification({ message: `"${form.name}" subscription updated` }));
    }
    setEditSub(null);
  };

  const handleDelete = async () => {
    const res = await deleteMut(deleteSub._id);
    if (!res.error) {
      dispatch(addNotification({ message: `"${deleteSub.name}" subscription deleted` }));
    }
    setDeleteSub(null);
  };

  const handleTogglePause = async (sub) => {
    const isPaused = sub.status === 'paused';
    // When resuming: if nextBillingDate is in the past, set it to today
    const nextBillingDate = isPaused && new Date(sub.nextBillingDate) < new Date()
      ? new Date().toISOString()
      : sub.nextBillingDate;
    const newStatus = isPaused ? 'active' : 'paused';
    const res = await updateSub({ id: sub._id, status: newStatus, nextBillingDate });
    if (!res.error) {
      dispatch(addNotification({ message: `"${sub.name}" ${isPaused ? 'resumed' : 'paused'}` }));
    }
  };

  const handleProcessDue = async () => {
    const res = await processDue();
    if (!res.error) {
      const { processed, transactionsCreated } = res.data?.data || {};
      dispatch(addNotification({ message: `Processed ${processed} subscriptions — ${transactionsCreated} new transaction${transactionsCreated === 1 ? '' : 's'} created` }));
    }
  };

  const editInitial = editSub
    ? { ...editSub, nextBillingDate: new Date(editSub.nextBillingDate).toISOString().split('T')[0] }
    : undefined;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
      {/* Header card */}
      <motion.div variants={cardVariant}>
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-dark text-lg">Subscriptions</h2>
              <p className="text-xs text-muted mt-0.5">
                Active monthly spend:&nbsp;
                <span className="font-bold text-indigo-flovex">₹{Math.round(activeMonthly).toLocaleString('en-IN')}/mo</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={handleProcessDue}
                  disabled={processing}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <RefreshCw size={14} className={processing ? 'animate-spin' : ''} />
                  Process Due
                </Button>
              )}
              {isAdmin && (
                <Button variant="primary" onClick={() => setAddOpen(true)} className="flex items-center gap-1.5">
                  <Plus size={16} /> Add Subscription
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={cardVariant}>
        <StatusTabs active={statusFilter} onChange={setStatusFilter} />
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-border animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted text-sm">No subscriptions found.</p>
          {isAdmin && (
            <Button variant="primary" onClick={() => setAddOpen(true)} className="mt-4 mx-auto flex items-center gap-1.5">
              <Plus size={16} /> Add your first subscription
            </Button>
          )}
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                sub={sub}
                isAdmin={isAdmin}
                onEdit={setEditSub}
                onDelete={setDeleteSub}
                onTogglePause={handleTogglePause}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Subscription"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="form-add-sub" disabled={creating}>
              {creating ? 'Adding…' : 'Add Subscription'}
            </Button>
          </div>
        }
      >
        <SubscriptionForm formId="form-add-sub" onSave={handleCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editSub}
        onClose={() => setEditSub(null)}
        title="Edit Subscription"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditSub(null)}>Cancel</Button>
            <Button variant="primary" type="submit" form="form-edit-sub" disabled={updating}>
              {updating ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editSub && <SubscriptionForm formId="form-edit-sub" initial={editInitial} onSave={handleEdit} />}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteSub}
        onClose={() => setDeleteSub(null)}
        title="Delete Subscription"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteSub(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Delete <span className="font-semibold text-dark">{deleteSub?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </motion.div>
  );
}
