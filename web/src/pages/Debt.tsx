import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtService } from '../services/services';
import { formatNaira } from '../utils/currency';

const DEBT_TYPES = ['owed_to_me', 'i_owe'];

export default function DebtPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string } | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ debtorName: '', debtorPhone: '', amount: '', dueDate: '', description: '', type: 'owed_to_me' });

  const { data, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => debtService.list().then((r) => r.data.data),
  });
  const { data: summaryData } = useQuery({
    queryKey: ['debt-summary'],
    queryFn: () => debtService.getSummary().then((r) => r.data.data),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: (d: Record<string, unknown>) => debtService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] });
      qc.invalidateQueries({ queryKey: ['debt-summary'] });
      setShowForm(false);
      setForm({ debtorName: '', debtorPhone: '', amount: '', dueDate: '', description: '', type: 'owed_to_me' });
    },
  });
  const recordPayment = useMutation({
    mutationFn: ({ id, amount, method }: { id: string; amount: number; method: string }) =>
      debtService.recordPayment(id, amount, method),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['debts'] }); setPaymentModal(null); setPayAmount(''); },
  });
  const settle = useMutation({
    mutationFn: (id: string) => debtService.settle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form, amount: Number(form.amount) });
  };

  const debts: any[] = Array.isArray(data) ? data : [];
  const filtered = filter === 'all' ? debts : debts.filter((d) => d.type === filter || d.status === filter);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Debt Book</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Record Debt'}
        </button>
      </div>

      {/* Summary */}
      {summaryData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Owed to Me', value: formatNaira(summaryData.totalOwedToMe || 0), color: 'text-success' },
            { label: 'I Owe', value: formatNaira(summaryData.totalIOwe || 0), color: 'text-red-500' },
            { label: 'Overdue', value: summaryData.overdueCount || 0, color: 'text-warning' },
            { label: 'Total Records', value: summaryData.totalCount || 0, color: 'text-gray-700' },
          ].map((s) => (
            <div key={s.label} className="card">
              <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card border-primary-200">
          <h2 className="text-sm font-bold text-gray-700 mb-4">New Debt Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {DEBT_TYPES.map((t) => <option key={t} value={t}>{t === 'owed_to_me' ? 'Owed to Me' : 'I Owe'}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Name *</label>
                <input className="input" placeholder="Chidi Okafor" value={form.debtorName} onChange={(e) => set('debtorName', e.target.value)} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input" placeholder="+234..." value={form.debtorPhone} onChange={(e) => set('debtorPhone', e.target.value)} />
              </div>
              <div>
                <label className="label">Amount (₦) *</label>
                <input type="number" className="input" placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} required />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="Goods supplied..." value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save Debt'}
            </button>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card w-full max-w-sm mx-4">
            <h3 className="font-bold text-gray-800 mb-4">Record Payment — {paymentModal.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Amount (₦)</label>
                <input type="number" className="input" placeholder="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Method</label>
                <select className="input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  {['cash', 'transfer', 'pos'].map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1"
                  onClick={() => recordPayment.mutate({ id: paymentModal.id, amount: Number(payAmount), method: payMethod })}
                  disabled={!payAmount || recordPayment.isPending}>
                  {recordPayment.isPending ? 'Saving...' : 'Save Payment'}
                </button>
                <button className="btn-secondary flex-1" onClick={() => setPaymentModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-700">Records</h2>
          {['all', 'owed_to_me', 'i_owe', 'overdue'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f === 'owed_to_me' ? 'Owed to Me' : f === 'i_owe' ? 'I Owe' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No debt records.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((d: any) => {
              const isOverdue = d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'settled';
              return (
                <div key={d._id} className={`flex items-center justify-between p-4 rounded-xl border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{d.debtorName}</span>
                      <span className={`badge text-xs ${d.type === 'owed_to_me' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {d.type === 'owed_to_me' ? 'Owes me' : 'I owe'}
                      </span>
                      {d.status === 'settled' && <span className="badge bg-gray-100 text-gray-500">Settled</span>}
                      {isOverdue && <span className="badge bg-red-100 text-red-600">Overdue</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{d.description || '—'} {d.dueDate ? `· Due ${new Date(d.dueDate).toLocaleDateString()}` : ''}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`text-base font-bold ${d.type === 'owed_to_me' ? 'text-success' : 'text-red-500'}`}>
                      {formatNaira(d.remainingAmount ?? d.amount)}
                    </span>
                    {d.status !== 'settled' && (
                      <div className="flex gap-2">
                        <button onClick={() => setPaymentModal({ id: d._id, name: d.debtorName })}
                          className="text-xs text-primary-400 hover:underline">Pay</button>
                        <button onClick={() => settle.mutate(d._id)}
                          className="text-xs text-gray-400 hover:underline">Settle</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
