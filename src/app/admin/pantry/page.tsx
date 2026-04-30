'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PANTRY_CATEGORIES } from '@/lib/constants';

export default function AdminPantryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    item_name: '', category: '其他', quantity: '0', unit: '',
    min_quantity: '0', expiry_date: '', location: '', notes: '',
  });

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/pantry');
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openForm = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        item_name: item.item_name, category: item.category, quantity: String(item.quantity),
        unit: item.unit || '', min_quantity: String(item.min_quantity || 0),
        expiry_date: item.expiry_date || '', location: item.location || '', notes: item.notes || '',
      });
    } else {
      setEditingItem(null);
      setForm({ item_name: '', category: '其他', quantity: '0', unit: '', min_quantity: '0', expiry_date: '', location: '', notes: '' });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_name.trim()) return;

    const body = {
      ...form,
      quantity: parseFloat(form.quantity) || 0,
      min_quantity: parseFloat(form.min_quantity) || 0,
      expiry_date: form.expiry_date || null,
    };

    const url = editingItem ? `/api/pantry/${editingItem.id}` : '/api/pantry';
    const method = editingItem ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editingItem ? '已更新' : '已添加');
      setShowForm(false);
      fetchItems();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除吗？')) return;
    const res = await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchItems(); }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">库存管理</h2>
        <button onClick={() => openForm()} className="px-4 h-9 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          + 添加食材
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <input type="text" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="食材名" required />
          <div className="flex gap-2">
            <input type="number" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" placeholder="数量" />
            <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-24 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" placeholder="单位" />
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.1" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" placeholder="最低库存" />
            <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                {PANTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" placeholder="位置" />
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">
            {editingItem ? '更新' : '添加'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="w-full h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm">取消</button>
        </form>
      )}

      <div className="space-y-1">
        {items.map((item) => {
          const isLow = item.min_quantity > 0 && item.quantity <= item.min_quantity;
          const isExpiring = item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 3 * 86400000);
          return (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.item_name}</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{item.category}</span>
                  {isLow && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-600">缺货</span>}
                  {isExpiring && <span className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-500">快过期</span>}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  库存 {item.quantity}{item.unit || ''} / 最低 {item.min_quantity}{item.unit || ''}
                  {item.location ? ` · ${item.location}` : ''}
                  {item.expiry_date ? ` · ${item.expiry_date}到期` : ''}
                </div>
              </div>
              <button onClick={() => openForm(item)} className="px-3 h-7 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg">编辑</button>
              <button onClick={() => handleDelete(item.id)} className="px-3 h-7 text-xs bg-red-50 dark:bg-red-950 text-red-600 rounded-lg">删除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
