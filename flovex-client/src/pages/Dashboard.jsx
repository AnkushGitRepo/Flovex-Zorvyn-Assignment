import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import CompanyLogo from '../components/ui/CompanyLogo';
import CountUpNumber from '../components/ui/CountUpNumber';
import { useGetDashboardStatsQuery, useGetRecentTransactionsQuery } from '../store/api/dashboardApi';
import { useGetWeeklyDataQuery, useGetCategoryBreakdownQuery, useGetMonthlyDataQuery } from '../store/api/chartsApi';
import { useIsDark } from '../hooks/useTheme';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280 } } };

function StatCard({ label, value, trend, trendUp, icon: Icon, color }) {
  return (
    <motion.div variants={item}>
      <Card className="p-3 sm:p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted font-medium mb-0.5 truncate">{label}</p>
            <p className="font-display font-bold text-base sm:text-2xl text-dark leading-tight">
              ₹<CountUpNumber value={value} />
            </p>
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}>
            <Icon size={16} className="sm:hidden" />
            <Icon size={20} className="hidden sm:block" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-sage/15 text-sage' : 'bg-rose-flovex/15 text-rose-flovex'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

function FinancialBreakdownBar({ stats }) {
  const [hovered, setHovered] = useState(null);

  const segments = [
    { key: 'income',   label: 'Total Income',   value: stats.totalIncome   || 0, color: '#E8B84B' },
    { key: 'expenses', label: 'Total Expenses',  value: stats.totalExpenses || 0, color: '#E86B6B' },
    { key: 'savings',  label: 'Total Savings',   value: stats.totalSavings  || 0, color: '#5046E4' },
    { key: 'balance',  label: 'Net Balance',     value: Math.abs(stats.balance || 0), color: '#7DB89A' },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((s, sg) => s + sg.value, 0);
  if (total === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-dark">Financial Overview</h3>
            <p className="text-xs text-muted mt-0.5">Proportional breakdown across all metrics</p>
          </div>
          {hovered && (
            <motion.div
              key={hovered.key}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-right"
            >
              <p className="text-sm font-semibold text-dark">{hovered.label}</p>
              <p className="text-xs text-muted">
                ₹{hovered.value.toLocaleString('en-IN')} · {((hovered.value / total) * 100).toFixed(1)}%
              </p>
            </motion.div>
          )}
        </div>

        {/* Horizontal proportion bar */}
        <div className="flex h-5 rounded-full overflow-hidden gap-px">
          {segments.map((seg) => (
            <div
              key={seg.key}
              style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
              className={`h-full cursor-pointer transition-opacity duration-150 ${
                hovered && hovered.key !== seg.key ? 'opacity-35' : 'opacity-100'
              }`}
              onMouseEnter={() => setHovered(seg)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-muted">{seg.label}</span>
              <span className="font-semibold text-dark">{((seg.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[#1A1A1F] text-white text-xs rounded-xl px-3 py-2 shadow-xl"
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString('en-IN')}
        </p>
      ))}
    </motion.div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const [cashFlowView, setCashFlowView] = useState('monthly');

  const { data: statsRes, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: recentRes, isLoading: recentLoading } = useGetRecentTransactionsQuery();
  const { data: weeklyRes } = useGetWeeklyDataQuery();
  const { data: monthlyRes } = useGetMonthlyDataQuery();
  const { data: categoryRes } = useGetCategoryBreakdownQuery();

  const stats = statsRes?.data || {};
  const recent = recentRes?.data || [];
  const weekly = weeklyRes?.data || [];
  const monthly = monthlyRes?.data || [];
  const categories = categoryRes?.data || [];

  const cashFlowData = cashFlowView === 'monthly' ? monthly : weekly;
  const cashFlowXKey = cashFlowView === 'monthly' ? 'month' : 'day';

  const gridColor = isDark ? '#2A2A38' : '#ECEAE3';
  const tickColor = isDark ? '#6B6B80' : '#9B9BAD';

  const statCards = [
    { label: 'Total Balance',   value: stats.balance       || 0, trend: '17%', trendUp: true,  icon: Wallet,       color: 'bg-sage/10 text-sage' },
    { label: 'Total Income',    value: stats.totalIncome   || 0, trend: '23%', trendUp: true,  icon: TrendingUp,   color: 'bg-amber-flovex/10 text-amber-flovex' },
    { label: 'Total Expenses',  value: stats.totalExpenses || 0, trend: '12%', trendUp: false, icon: TrendingDown, color: 'bg-rose-flovex/10 text-rose-flovex' },
    { label: 'Total Savings',   value: stats.totalSavings  || 0, trend: '45%', trendUp: true,  icon: PiggyBank,    color: 'bg-indigo-flovex/10 text-indigo-flovex' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={item} className="bg-card rounded-2xl h-36 animate-pulse" />
            ))
          : statCards.map((c) => <StatCard key={c.label} {...c} />)
        }
      </motion.div>

      {/* Financial breakdown bar */}
      {!statsLoading && stats.totalIncome > 0 && (
        <FinancialBreakdownBar stats={stats} />
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Cash flow bar chart with Monthly/Weekly toggle */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 h-full"
        >
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-dark">
                  {cashFlowView === 'monthly' ? 'Monthly' : 'Weekly'} Cash Flow
                </h3>
                <p className="text-xs text-muted">Income vs Expenses</p>
              </div>
              <div className="flex items-center gap-1.5">
                {['monthly', 'weekly'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCashFlowView(v)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                      cashFlowView === v
                        ? 'bg-indigo-flovex text-white shadow-sm'
                        : 'bg-border/40 text-muted hover:text-dark hover:bg-border/70'
                    }`}
                  >
                    {v === 'monthly' ? 'Monthly' : 'Weekly'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cashFlowData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey={cashFlowXKey} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income"  name="Income"  fill="#7DB89A" radius={[6,6,0,0]} isAnimationActive animationDuration={900} />
                <Bar dataKey="expense" name="Expense" fill="#E86B6B" radius={[6,6,0,0]} isAnimationActive animationDuration={1100} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Spending Breakdown donut — custom legend to prevent overlap/cut-off */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="h-full"
        >
          <Card className="p-5 h-full flex flex-col">
            <h3 className="font-display font-bold text-dark mb-1">Spending Breakdown</h3>
            <p className="text-xs text-muted mb-2">By category</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={categories.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive
                  animationDuration={1000}
                >
                  {categories.slice(0, 5).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom legend — no overlap with chart */}
            <div className="mt-2 space-y-1.5 flex-1">
              {categories.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-dark">₹{entry.value?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-dark">Recent Transactions</h3>
            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-flovex hover:underline"
            >
              See All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-border rounded-xl animate-pulse" />
                ))
              : recent.map((tx) => (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={tx.name} size={36} />
                      <div>
                        <p className="text-sm font-medium text-dark">{tx.name}</p>
                        <p className="text-xs text-muted">{format(new Date(tx.date), 'dd MMM, yyyy')}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-sage' : 'text-rose-flovex'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </motion.div>
                ))
            }
          </div>
          <button
            onClick={() => navigate('/dashboard/transactions')}
            className="w-full mt-4 py-2 text-sm font-semibold text-indigo-flovex border border-indigo-flovex/20 rounded-xl hover:bg-indigo-flovex/5 transition-colors"
          >
            View All Transactions →
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
