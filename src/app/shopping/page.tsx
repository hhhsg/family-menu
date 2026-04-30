'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function ShoppingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item_name: '', quantity: '1', unit: '', urgency_level: 'medium' });

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/shopping');
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleToggle = async (item: any) => {
    const res = await fetch(`/api/shopping/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_purchased: !item.is_purchased }),
    });
    if (res.ok) {
      toast.success(item.is_purchased ? '已恢复' : '已购买');
      fetchItems();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchItems(); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_name.trim()) return;
    const res = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity) || 1 }),
    });
    if (res.ok) {
      toast.success('已添加');
      setShowForm(false);
      setForm({ item_name: '', quantity: '1', unit: '', urgency_level: 'medium' });
      fetchItems();
    }
  };

  const pendingItems = items.filter((i) => !i.is_purchased);
  const purchasedItems = items.filter((i) => i.is_purchased);

  const urgencyColor: Record<string, string> = { high: 'border-red-400', medium: 'border-amber-400', low: 'border-gray-300' };

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
        <h2 className="text-lg font-semibold">购物清单</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 h-9 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          + 添加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <input
            type="text" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="物品名"
          />
          <div className="flex gap-2">
            <input
              type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-20 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              placeholder="数量"
            />
            <input
              type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              placeholder="单位（斤、个等）"
            />
          </div>
          <div className="flex gap-2">
            {(['high', 'medium', 'low'] as const).map((level) => (
              <button
                key={level} type="button"
                onClick={() => setForm({ ...form, urgency_level: level })}
                className={`px-3 py-1 rounded-full text-xs ${form.urgency_level === level
                  ? level === 'high' ? 'bg-red-500 text-white' : level === 'medium' ? 'bg-amber-500 text-white' : 'bg-gray-300 text-gray-700'
                  : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                {level === 'high' ? '紧急' : level === 'medium' ? '普通' : '不急'}
              </button>
            ))}
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">
            添加
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500">购物清单是空的</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pendingItems.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-2">待购买 ({pendingItems.length})</div>
              <div className="space-y-1">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-900 rounded-xl p-3 border-l-2 ${urgencyColor[item.urgency_level]} flex items-center gap-3`}
                  >
                    <button onClick={() => handleToggle(item)} className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{item.item_name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {item.quantity}{item.unit || ''}
                      </span>
                      {item.source === 'auto' && <span className="text-[10px] text-indigo-400 ml-1">自动</span>}
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400">删除</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchased */}
          {purchasedItems.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">已购买 ({purchasedItems.length})</div>
              <div className="space-y-1">
                {purchasedItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex items-center gap-3 opacity-60">
                    <button onClick={() => handleToggle(item)} className="w-5 h-5 rounded-full bg-emerald-400 shrink-0 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </button>
                    <span className="text-sm flex-1 line-through">{item.item_name}</span>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400">删除</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
