import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/services';
import { formatNaira } from '../utils/currency';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#1B4332', '#40916C', '#74C69D', '#D8F3DC', '#F77F00', '#FCBF49'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data: cashflowData } = useQuery({
    queryKey: ['cashflow', period],
    queryFn: () => analyticsService.getCashflow(period).then((r) => r.data.data),
  });
  const { data: plData } = useQuery({
    queryKey: ['profit-loss'],
    queryFn: () => analyticsService.getProfitLoss().then((r) => r.data.data),
  });
  const { data: topData } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => analyticsService.getTopProducts(8).then((r) => r.data.data),
  });
  const { data: trendsData } = useQuery({
    queryKey: ['revenue-trends'],
    queryFn: () => analyticsService.getRevenueTrends().then((r) => r.data.data),
  });
  const { data: debtData } = useQuery({
    queryKey: ['analytics-debt'],
    queryFn: () => analyticsService.getDebtSummary().then((r) => r.data.data),
  });

  const cashflow = Array.isArray(cashflowData) ? cashflowData : [];
  const trends = Array.isArray(trendsData) ? trendsData : [];
  const topProducts = Array.isArray(topData) ? topData : [];

  const debtPieData = debtData ? [
    { name: 'Owed to Me', value: debtData.totalOwedToMe || 0 },
    { name: 'I Owe', value: debtData.totalIOwe || 0 },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${period === p ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* P&L Summary */}
      {plData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatNaira(plData.revenue || 0), color: 'text-success' },
            { label: 'Total Expenses', value: formatNaira(plData.expenses || 0), color: 'text-red-500' },
            { label: 'Net Profit', value: formatNaira(plData.profit || 0), color: 'text-primary-500' },
            { label: 'Profit Margin', value: `${plData.profitMargin?.toFixed(1) || 0}%`, color: 'text-accent-500' },
          ].map((s) => (
            <div key={s.label} className="card">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Cashflow Chart */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Cashflow — {period}</h2>
        {cashflow.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={cashflow} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF233C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF233C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Area type="monotone" dataKey="income" stroke="#06D6A0" fill="url(#income)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#EF233C" fill="url(#expenses)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue Trends + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Revenue Trends</h2>
          {trends.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Bar dataKey="revenue" fill="#1B4332" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.slice(0, 6).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-semibold text-gray-800">{p.name || p._id}</span>
                      <span className="text-gray-500">{formatNaira(p.revenue || p.totalRevenue || 0)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length], width: `${Math.min(100, ((p.revenue || p.totalRevenue || 0) / (topProducts[0]?.revenue || topProducts[0]?.totalRevenue || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debt Breakdown */}
      {debtPieData.some((d) => d.value > 0) && (
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Debt Breakdown</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={debtPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${formatNaira(value)}`}>
                  {debtPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
