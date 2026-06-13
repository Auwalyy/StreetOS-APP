import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/services';
import { formatNaira } from '../utils/currency';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', sku: '', quantity: '', costPrice: '', sellingPrice: '', unit: 'piece', lowStockThreshold: '5', category: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.list().then((r) => r.data.data),
  });
  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryService.getLowStock().then((r) => r.data.data),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: (d: Record<string, unknown>) => inventoryService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); resetForm(); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => inventoryService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); resetForm(); },
  });
  const del = useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditItem(null);
    setForm({ name: '', sku: '', quantity: '', costPrice: '', sellingPrice: '', unit: 'piece', lowStockThreshold: '5', category: '' });
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name, sku: item.sku || '', quantity: String(item.quantity),
      costPrice: String(item.costPrice), sellingPrice: String(item.sellingPrice),
      unit: item.unit || 'piece', lowStockThreshold: String(item.lowStockThreshold || 5),
      category: item.category || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, quantity: Number(form.quantity), costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), lowStockThreshold: Number(form.lowStockThreshold) };
    editItem ? update.mutate({ id: editItem._id, data: payload }) : create.mutate(payload);
  };

  const items: any[] = Array.isArray(data) ? data : [];
  const lowStock: any[] = Array.isArray(lowStockData) ? lowStockData : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Inventory</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm((v) => !v); }}>
          {showForm && !editItem ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-yellow-700 mb-2">⚠️ Low Stock Alerts ({lowStock.length})</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i: any) => (
              <span key={i._id} className="badge bg-yellow-100 text-yellow-700">{i.name} — {i.quantity} {i.unit}</span>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card border-primary-200">
          <h2 className="text-sm font-bold text-gray-700 mb-4">{editItem ? 'Edit Item' : 'New Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" placeholder="Rice 50kg" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input" placeholder="SKU-001" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" placeholder="Grains" value={form.category} onChange={(e) => set('category', e.target.value)} />
              </div>
              <div>
                <label className="label">Quantity *</label>
                <input type="number" className="input" placeholder="0" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
              </div>
              <div>
                <label className="label">Unit</label>
                <input className="input" placeholder="piece / bag / kg" value={form.unit} onChange={(e) => set('unit', e.target.value)} />
              </div>
              <div>
                <label className="label">Low Stock Threshold</label>
                <input type="number" className="input" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} />
              </div>
              <div>
                <label className="label">Cost Price (₦)</label>
                <input type="number" className="input" placeholder="0" value={form.costPrice} onChange={(e) => set('costPrice', e.target.value)} required />
              </div>
              <div>
                <label className="label">Selling Price (₦)</label>
                <input type="number" className="input" placeholder="0" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Stock ({items.length} items)</h2>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No inventory items. Add your first item.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {['Name', 'Category', 'Qty', 'Cost', 'Price', 'Margin', 'Status', ''].map((h) => (
                  <th key={h} className="pb-3 text-xs font-semibold text-gray-500 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const margin = item.costPrice ? (((item.sellingPrice - item.costPrice) / item.costPrice) * 100).toFixed(0) : '—';
                const isLow = item.quantity <= (item.lowStockThreshold || 5);
                return (
                  <tr key={item._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="py-3 pr-4 text-gray-500 capitalize">{item.category || '—'}</td>
                    <td className="py-3 pr-4">{item.quantity} {item.unit}</td>
                    <td className="py-3 pr-4 text-gray-500">{formatNaira(item.costPrice)}</td>
                    <td className="py-3 pr-4 font-semibold">{formatNaira(item.sellingPrice)}</td>
                    <td className="py-3 pr-4 text-success font-semibold">{margin}%</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-primary-400 hover:underline">Edit</button>
                      <button onClick={() => del.mutate(item._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
