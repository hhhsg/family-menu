'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function PantryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [allRes, expiringRes, lowRes] = await Promise.all([
      fetch('/api/pantry'),
      fetch('/api/pantry?warning=expiring'),
      fetch('/api/pantry?warning=low'),
    ]);
    const all = await allRes.json();
    const expiring = await expiringRes.json();
    const low = await lowRes.json();
    if (all.success) setItems(all.data);
    if (expiring.success) setExpiringItems(expiring.data);
    if (low.success) setLowStockItems(low.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">食材库存</h2>

      {/* Warnings */}
      {expiringItems.length > 0 && (
        <div>
          <div className="text-sm font-medium text-red-500 mb-2">⚠ 快过期 ({expiringItems.length})</div>
          <div className="space-y-1">
            {expiringItems.map((item) => (
              <div key={item.id} className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3 flex items-center gap-3 border border-red-200 dark:border-red-900">
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.item_name}</div>
                  <div className="text-xs text-red-500 mt-0.5">
                    {item.quantity}{item.unit || ''} · 过期: {item.expiry_date} · {item.location || ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div>
          <div className="text-sm font-medium text-amber-500 mb-2">⚠ 缺货预警 ({lowStockItems.length})</div>
          <div className="space-y-1">
            {lowStockItems.map((item) => (
              <div key={item.id} className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 flex items-center gap-3 border border-amber-200 dark:border-amber-900">
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.item_name}</div>
                  <div className="text-xs text-amber-600 mt-0.5">
                    库存 {item.quantity}{item.unit || ''} / 最低 {item.min_quantity}{item.unit || ''}
                    {item.location ? ` · ${item.location}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory by category */}
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category}>
          <div className="text-sm font-medium text-gray-500 mb-2">{category} ({catItems.length})</div>
          <div className="space-y-1">
            {catItems.map((item) => {
              const isLow = item.min_quantity > 0 && item.quantity <= item.min_quantity;
              const isExpiring = item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 3 * 86400000);
              return (
                <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.item_name}</span>
                      {isLow && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-600">缺货</span>}
                      {isExpiring && <span className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-500">快过期</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.quantity}{item.unit || ''}
                      {item.location ? ` · ${item.location}` : ''}
                      {item.expiry_date ? ` · 过期: ${item.expiry_date}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🥘</div>
          <p className="text-gray-500">库存是空的</p>
        </div>
      )}
    </div>
  );
}
