import { useQuery } from '@tanstack/react-query';
import { transactionService, scoreService, advisorService } from '../services/services';
import { useAuthStore } from '../store/authStore';
import { formatNaira } from '../utils/currency';
import { Link } from 'react-router-dom';

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <div className={`card border-l-4 flex-1 min-w-[160px]`} style={{ borderLeftColor: color }}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ScoreCircle({ score, max, label, color }: { score: number; max: number; label: string; color: string }) {
  const band = max === 100
    ? score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Work'
    : score >= 750 ? 'Excellent' : score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Poor';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-20 h-20 rounded-full border-[6px] flex flex-col items-center justify-center"
        style={{ borderColor: color }}>
        <span className="text-xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-gray-400">/{max}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{band}</span>
    </div>
  );
}

const QUICK_ACTIONS = [
  { emoji: '🤖', label: 'AI Advisor', to: '/advisor' },
  { emoji: '🪪', label: 'My Passport', to: '/passport' },
  { emoji: '📒', label: 'Debt Book', to: '/debts' },
  { emoji: '📦', label: 'Inventory', to: '/inventory' },
  { emoji: '📊', label: 'Analytics', to: '/analytics' },
  { emoji: '💰', label: 'Transactions', to: '/transactions' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: summaryRes, isRefetching, refetch } = useQuery({
    queryKey: ['summary', 'daily'],
    queryFn: () => transactionService.getSummary('daily'),
  });
  const { data: healthRes } = useQuery({ queryKey: ['health-score'], queryFn: () => scoreService.getHealth() });
  const { data: creditRes } = useQuery({ queryKey: ['credit-score'], queryFn: () => scoreService.getCredit() });
  const { data: briefingRes } = useQuery({ queryKey: ['daily-briefing'], queryFn: () => advisorService.getDailyBriefing() });
  const { data: recentRes } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionService.list({ limit: 5 }),
  });

  const s = summaryRes?.data?.data || {};
  const health = healthRes?.data?.data;
  const credit = creditRes?.data?.data;
  const briefing = briefingRes?.data?.data?.briefing || briefingRes?.data?.data?.message;
  const recent: any[] = Array.isArray(recentRes?.data?.data) ? recentRes.data.data : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Good morning 👋</p>
          <h1 className="text-2xl font-extrabold text-gray-900">{user?.businessName || user?.firstName}</h1>
        </div>
        <button onClick={() => refetch()} disabled={isRefetching}
          className="btn-secondary text-sm">{isRefetching ? 'Refreshing...' : '↻ Refresh'}</button>
      </div>

      {/* AI Briefing */}
      {briefing && (
        <div className="card bg-primary-50 border-primary-200 flex gap-4 items-start">
          <span className="text-3xl">🤖</span>
          <div>
            <p className="text-sm font-bold text-primary-500 mb-1">AI Daily Briefing</p>
            <p className="text-sm text-primary-400 leading-relaxed">{briefing}</p>
          </div>
          <Link to="/advisor" className="ml-auto text-xs text-primary-400 hover:underline whitespace-nowrap">Ask more →</Link>
        </div>
      )}

      {/* Stats */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Today's Summary</h2>
        <div className="flex gap-4 flex-wrap">
          <StatCard emoji="💰" label="Revenue" value={formatNaira(s.totalRevenue || 0)} color="#06D6A0" />
          <StatCard emoji="📈" label="Profit" value={formatNaira(s.totalProfit || 0)} color="#2D6A4F" />
          <StatCard emoji="🧾" label="Sales" value={String(s.salesCount || 0)} color="#4CC9F0" />
          <StatCard emoji="📦" label="Items Sold" value={String(s.itemsSold || 0)} color="#F77F00" />
        </div>
      </div>

      {/* Scores + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Business Scores</h2>
          <div className="flex justify-around">
            <Link to="/analytics">
              <ScoreCircle score={health?.score || 0} max={100} label="Health Score" color="#06D6A0" />
            </Link>
            <Link to="/analytics">
              <ScoreCircle score={credit?.score || 0} max={850} label="Credit Score" color="#2D6A4F" />
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 text-center">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-primary-500 font-semibold hover:underline">See All →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet. Go to Transactions to record your first sale!</p>
        ) : (
          <div className="space-y-2">
            {recent.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.type === 'sale' ? '💰' : t.type === 'expense' ? '💸' : '📥'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.productName || t.type}</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-success'}`}>
                  {t.type === 'expense' ? '-' : '+'}{formatNaira(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
