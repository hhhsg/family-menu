'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function AdminShoppingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/shopping');
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAutoGenerate = async () => {
    if (!confirm('根据今日已确认订单汇总配料？')) return;
    const res = await fetch('/api/shopping/auto-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(`已汇总，${data.data.to_buy} 项需购买，${data.data.sufficient} 项库存充足`);
      fetchItems();
    } else {
      const d = await res.json();
      toast.error(d.message || '汇总失败');
    }
  };

  const handleToggle = async (item: any) => {
    const res = await fetch(`/api/shopping/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_purchased: !item.is_purchased }),
    });
    if (res.ok) { toast.success(item.is_purchased ? '已恢复' : '已购买'); fetchItems(); }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchItems(); }
  };

  const pendingItems = items.filter((i) => !i.is_purchased);
  const purchasedItems = items.filter((i) => i.is_purchased);

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
        <h2 className="text-lg font-semibold">购物清单管理</h2>
        <button onClick={handleAutoGenerate} className="px-4 h-9 bg-emerald-600 text-white rounded-xl text-sm font-medium">
          ⟳ 一键汇总
        </button>
      </div>

      {pendingItems.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 mb-2">待购买 ({pendingItems.length})</div>
          <div className="space-y-1">
            {pendingItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <button onClick={() => handleToggle(item)} className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.item_name}</span>
                    <span className="text-xs text-gray-400">{item.quantity}{item.unit || ''}</span>
                    {item.source === 'auto' && <span className="text-[10px] text-indigo-400">自动</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 px-1">删除</button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {items.length === 0 && <div className="text-center py-12 text-gray-400">购物清单为空</div>}
    </div>
  );
}
