import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import Card from '../components/ui/Card';
import { useGetMonthlyDataQuery, useGetCategoryBreakdownQuery, useGetCategoryTrendQuery, useGetAllCategoriesQuery } from '../store/api/chartsApi';
import { useGetDashboardStatsQuery } from '../store/api/dashboardApi';
import { useIsDark } from '../hooks/useTheme';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260 } } };

// Compute dynamic insights from data
function computeInsights(monthly, categories, savingsRate) {
  const result = [];

  // 1. Month-over-month expense change
  if (monthly.length >= 2) {
    const curr = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    if (prev.expense > 0) {
      const pct = Math.abs(Math.round(((curr.expense - prev.expense) / prev.expense) * 100));
      const up = curr.expense > prev.expense;
      result.push({
        color: up ? 'bg-rose-flovex/10 text-rose-flovex' : 'bg-sage/10 text-sage',
        emoji: up ? '🔴' : '🟢',
        text: `Total expenses ${up ? 'up' : 'down'} ${pct}% vs last month`,
      });
    }
  }

  // 2. Savings rate insight
  if (savingsRate > 0) {
    const onTrack = savingsRate >= 20;
    result.push({
      color: onTrack ? 'bg-sage/10 text-sage' : 'bg-amber-flovex/10 text-amber-flovex',
      emoji: onTrack ? '🟢' : '🟡',
      text: onTrack
        ? `Savings rate ${savingsRate}% — on track (target: 20%)`
        : `Savings rate ${savingsRate}% — below 20% target`,
    });
  }

  // 3. Top spending category
  if (categories.length > 0) {
    const top = categories[0];
    result.push({
      color: 'bg-rose-flovex/10 text-rose-flovex',
      emoji: '🔴',
      text: `Top spend: ${top.name} — ₹${top.value?.toLocaleString('en-IN')}`,
    });
  }

  // 4. Best income month in the view
  if (monthly.length > 0) {
    const best = [...monthly].sort((a, b) => b.income - a.income)[0];
    result.push({
      color: 'bg-indigo-flovex/10 text-indigo-flovex',
      emoji: '🔵',
      text: `Best income month: ${best.month} — ₹${best.income?.toLocaleString('en-IN')}`,
    });
  }

  // 5. Number of spending categories detected
  if (categories.length > 1) {
    result.push({
      color: 'bg-amber-flovex/10 text-amber-flovex',
      emoji: '🟡',
      text: `${categories.length} spending categories tracked`,
    });
  }

  return result;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1F] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value)?.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

function SavingsRing({ rate }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = inView ? (rate / 100) * circ : 0;

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-6">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" stroke="rgb(var(--color-border))" strokeWidth="12" />
          <motion.circle
            cx="72" cy="72" r={r}
            fill="none"
            stroke="#5046E4"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-2xl text-dark">{rate}%</span>
        </div>
      </div>
      <p className="text-sm text-muted mt-3 text-center">Of income saved this month</p>
    </div>
  );
}

function CategoryTrends({ categories, allCategories }) {
  const [selected, setSelected] = useState('');
  const isDark = useIsDark();

  const activeCategory = selected || categories[0]?.name || allCategories[0] || '';
  const { data: trendRes, isFetching } = useGetCategoryTrendQuery(activeCategory, { skip: !activeCategory });
  const trend = trendRes?.data || [];

  const gridColor = isDark ? '#2A2A38' : '#ECEAE3';
  const tickColor = isDark ? '#6B6B80' : '#9B9BAD';

  // Find color for active category (custom categories get a fallback color)
  const catColor = categories.find((c) => c.name === activeCategory)?.color || '#9B9BAD';

  // Merge breakdown categories (with colors) and all distinct categories
  // Show breakdown ones first, then any custom-only ones
  const breakdownNames = new Set(categories.map((c) => c.name));
  const extraCategories = allCategories.filter((n) => !breakdownNames.has(n));
  const dropdownOptions = [
    ...categories.map((c) => ({ name: c.name, hasData: true })),
    ...extraCategories.map((n) => ({ name: n, hasData: false })),
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-dark">Category Trends</h3>
          <p className="text-xs text-muted mt-0.5">12-month spending history by category</p>
        </div>
        <select
          value={activeCategory}
          onChange={(e) => setSelected(e.target.value)}
          className="text-xs font-medium bg-cream border border-border text-dark rounded-xl px-3 py-2 outline-none focus:border-indigo-flovex/50 transition-colors"
        >
          {dropdownOptions.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isFetching ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted">Loading…</div>
        ) : trend.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted">No data for this category</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[#1A1A1F] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
                      <p className="font-semibold mb-1">{label}</p>
                      <p style={{ color: catColor }}>Spent: ₹{Number(payload[0]?.value)?.toLocaleString('en-IN')}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="amount" name="Spent" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800}>
                {trend.map((_, i) => (
                  <Cell key={i} fill={catColor} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default function Insights() {
  const isDark = useIsDark();
  const { data: monthlyRes } = useGetMonthlyDataQuery();
  const { data: categoryRes } = useGetCategoryBreakdownQuery();
  const { data: statsRes } = useGetDashboardStatsQuery();
  const { data: allCatsRes } = useGetAllCategoriesQuery();

  const monthly = monthlyRes?.data || [];
  const categories = categoryRes?.data || [];
  const savingsRate = parseFloat(statsRes?.data?.savingsRate || 0);
  const allCategories = allCatsRes?.data || [];

  const gridColor = isDark ? '#2A2A38' : '#ECEAE3';
  const tickColor = isDark ? '#6B6B80' : '#9B9BAD';
  const labelColor = isDark ? '#9B9BAD' : '#1A1A1F';

  const dynamicInsights = computeInsights(monthly, categories, savingsRate);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-5"
    >
      {/* Top Spending Categories — horizontal bar */}
      <motion.div variants={item}>
        <Card className="p-5">
          <h3 className="font-display font-bold text-dark mb-1">Top Spending Categories</h3>
          <p className="text-xs text-muted mb-4">By total amount spent</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categories} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: labelColor }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Spent" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1000}>
                {categories.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Monthly comparison line chart */}
      <motion.div variants={item}>
        <Card className="p-5">
          <h3 className="font-display font-bold text-dark mb-1">Monthly Comparison</h3>
          <p className="text-xs text-muted mb-4">Income vs Expenses — Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: tickColor }} />
              <Line type="monotone" dataKey="income"  name="Income"  stroke="#7DB89A" strokeWidth={2.5} dot={{ r: 4, fill: '#7DB89A' }} isAnimationActive animationDuration={1000} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#E86B6B" strokeWidth={2.5} dot={{ r: 4, fill: '#E86B6B' }} isAnimationActive animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Savings Rate ring */}
      <motion.div variants={item} className="h-full">
        <Card className="p-5 h-full flex flex-col">
          <h3 className="font-display font-bold text-dark mb-1">Savings Rate</h3>
          <p className="text-xs text-muted mb-2">Based on total income vs expenses</p>
          <div className="flex-1 flex items-center justify-center">
            <SavingsRing rate={savingsRate} />
          </div>
        </Card>
      </motion.div>

      {/* Smart Observations — dynamic */}
      <motion.div variants={item} className="h-full">
        <Card className="p-5 h-full">
          <h3 className="font-display font-bold text-dark mb-1">Flovex Insights</h3>
          <p className="text-xs text-muted mb-4">AI-powered observations</p>
          {dynamicInsights.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">No data yet — add transactions to see insights</p>
          ) : (
            <div className="space-y-3">
              {dynamicInsights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm ${ins.color}`}
                >
                  <span className="text-base shrink-0">{ins.emoji}</span>
                  <span className="font-medium">{ins.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Category Trends — full width */}
      {(categories.length > 0 || allCategories.length > 0) && (
        <motion.div variants={item} className="lg:col-span-2">
          <CategoryTrends categories={categories} allCategories={allCategories} />
        </motion.div>
      )}

      {/* Monthly Summary Table */}
      <motion.div variants={item} className="lg:col-span-2">
        <Card className="p-5 overflow-hidden">
          <h3 className="font-display font-bold text-dark mb-4">Monthly Income vs Expense Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted font-semibold">
                  <th className="pb-3 text-left">Month</th>
                  <th className="pb-3 text-right">Income</th>
                  <th className="pb-3 text-right">Expenses</th>
                  <th className="pb-3 text-right">Savings</th>
                  <th className="pb-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => (
                  <motion.tr
                    key={row.month}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-cream/40' : ''}`}
                  >
                    <td className="py-3 font-medium text-dark">{row.month}</td>
                    <td className="py-3 text-right text-sage font-semibold">₹{row.income?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-rose-flovex font-semibold">₹{row.expense?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-indigo-flovex font-semibold">₹{row.savings?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-muted">
                      {row.income > 0 ? ((row.savings / row.income) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
