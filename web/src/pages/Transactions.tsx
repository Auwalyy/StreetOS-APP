import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/services';
import { formatNaira } from '../utils/currency';

const TYPES = ['sale', 'expense', 'income'];
const METHODS = ['cash', 'transfer', 'pos', 'credit'];

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'sale', amount: '', productName: '', quantity: '1', paymentMethod: 'cash', notes: '' });
  const [period, setPeriod] = useState('daily');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.list({ limit: 50 }).then((r) => r.data.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['tx-summary', period],
    queryFn: () => transactionService.getSummary(period).then((r) => r.data.data),
  });

  const create = useMutation({
    mutationFn: (d: Record<string, unknown>) => transactionService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['tx-summary'] });
      setShowForm(false);
      setForm({ type: 'sale', amount: '', productName: '', quantity: '1', paymentMethod: 'cash', notes: '' });
    },
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form, amount: Number(form.amount), quantity: Number(form.quantity) });
  };

  const txList: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Transactions</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Transaction'}
        </button>
      </div>

      {/* Summary */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-bold text-gray-700">Summary</span>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${period === p ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: formatNaira(summary?.totalRevenue || 0), color: 'text-success' },
            { label: 'Profit', value: formatNaira(summary?.totalProfit || 0), color: 'text-primary-500' },
            { label: 'Sales', value: summary?.salesCount || 0, color: 'text-info' },
            { label: 'Items Sold', value: summary?.itemsSold || 0, color: 'text-accent-500' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3">
              <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* New Transaction Form */}
      {showForm && (
        <div className="card border-primary-200">
          <h2 className="text-sm font-bold text-gray-700 mb-4">New Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {create.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {(create.error as any)?.response?.data?.message || 'Failed to create transaction'}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₦)</label>
                <input type="number" className="input" placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} required />
              </div>
              <div>
                <label className="label">Quantity</label>
                <input type="number" className="input" placeholder="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
              </div>
              <div>
                <label className="label">Product/Description</label>
                <input className="input" placeholder="Rice 50kg" value={form.productName} onChange={(e) => set('productName', e.target.value)} />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="input" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  {METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4">All Transactions</h2>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : txList.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {txList.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.type === 'sale' ? '💰' : t.type === 'expense' ? '💸' : '📥'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.productName || t.type}</p>
                    <p className="text-xs text-gray-400 flex gap-2">
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize">{t.paymentMethod}</span>
                      {t.quantity > 1 && <span>×{t.quantity}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-success'}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatNaira(t.amount)}
                  </span>
                  <p className="text-xs text-gray-400 capitalize">{t.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
