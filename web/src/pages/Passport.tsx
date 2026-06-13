import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { formatNaira } from '../utils/currency';

const passportService = {
  get: () => api.get('/passport'),
  generatePDF: () => api.post('/passport/generate-pdf'),
  share: () => api.post('/passport/share'),
};

function ScoreBadge({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? '#06D6A0' : pct >= 50 ? '#F77F00' : '#EF233C';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20 rounded-full border-[6px] flex flex-col items-center justify-center" style={{ borderColor: color }}>
        <span className="text-xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-gray-400">/{max}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
    </div>
  );
}

export default function PassportPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['passport'],
    queryFn: () => passportService.get().then((r) => r.data.data),
  });

  const generate = useMutation({
    mutationFn: () => passportService.generatePDF(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passport'] }),
  });
  const share = useMutation({
    mutationFn: () => passportService.share(),
    onSuccess: (res) => {
      const link = res.data?.data?.shareableUrl || res.data?.data?.link;
      if (link) { navigator.clipboard.writeText(link); alert('Shareable link copied to clipboard!'); }
    },
  });

  const p = data;
  const verificationColor = p?.verificationLevel === 'verified' ? 'text-success' : p?.verificationLevel === 'basic' ? 'text-warning' : 'text-gray-400';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Business Passport</h1>
          <p className="text-sm text-gray-500">Your digital business identity for lenders & partners</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? 'Generating...' : '📄 Generate PDF'}
          </button>
          <button className="btn-primary text-sm" onClick={() => share.mutate()} disabled={share.isPending}>
            {share.isPending ? '...' : '🔗 Share'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card text-center py-12 text-gray-400">Loading your passport...</div>
      ) : !p ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🪪</div>
          <p className="text-gray-500 text-sm mb-4">No passport yet. Generate your business identity to share with lenders.</p>
          <button className="btn-primary" onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? 'Generating...' : 'Generate My Passport'}
          </button>
        </div>
      ) : (
        <>
          {/* Passport Card */}
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-primary-200 text-xs font-semibold uppercase tracking-wide">StreetOS Business Passport</p>
                <h2 className="text-2xl font-extrabold mt-1">{p.businessName || user?.businessName || `${user?.firstName} ${user?.lastName}`}</h2>
                <p className="text-primary-200 text-sm capitalize mt-0.5">{user?.businessType?.replace('_', ' ')}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-500 font-extrabold text-xl">S</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary-300 text-xs">Passport ID</p>
                <p className="font-mono font-bold text-xs mt-0.5">{p.passportId || '—'}</p>
              </div>
              <div>
                <p className="text-primary-300 text-xs">Verification Level</p>
                <p className={`font-bold capitalize mt-0.5 ${p.verificationLevel === 'verified' ? 'text-green-300' : 'text-yellow-300'}`}>
                  {p.verificationLevel || 'basic'}
                </p>
              </div>
              <div>
                <p className="text-primary-300 text-xs">Member Since</p>
                <p className="font-semibold mt-0.5">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—'}</p>
              </div>
              <div>
                <p className="text-primary-300 text-xs">Total Revenue Recorded</p>
                <p className="font-bold mt-0.5">{formatNaira(p.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Business Scores</h2>
            <div className="flex justify-around">
              <ScoreBadge score={p.healthScore || 0} max={100} label="Health Score" />
              <ScoreBadge score={p.creditScore || 0} max={850} label="Credit Score" />
              <ScoreBadge score={Math.round((p.trustScore || 0) * 100)} max={100} label="Trust Score" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Transactions', value: p.totalTransactions || 0 },
              { label: 'Active Trading Days', value: p.activeTradingDays || 0 },
              { label: 'Debt Repayment Rate', value: `${Math.round((p.debtRepaymentRate || 0) * 100)}%` },
              { label: 'KYC Status', value: (user as any)?.kycStatus || 'none' },
            ].map((s) => (
              <div key={s.label} className="card text-center">
                <div className="text-lg font-extrabold text-gray-900 capitalize">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* What this means */}
          <div className="card bg-primary-50 border-primary-100">
            <h2 className="text-sm font-bold text-primary-500 mb-3">🏦 What Lenders See</h2>
            <ul className="space-y-2 text-sm text-primary-400">
              <li>✓ Your verified business identity and trading history</li>
              <li>✓ Revenue records that prove your income to banks</li>
              <li>✓ Credit score built from real transaction data</li>
              <li>✓ Debt management track record</li>
              <li className="text-xs text-primary-300 pt-1">Share your passport link with microfinance institutions, cooperatives, and fintech lenders.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
