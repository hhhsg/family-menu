'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MEAL_TYPES } from '@/lib/constants';
import { todayString } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(todayString());
  const [filterMeal, setFilterMeal] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDate) params.set('date', filterDate);
    if (filterMeal) params.set('meal_type', filterMeal);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }, [filterDate, filterMeal]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === 'confirmed' ? '已确认' : '已取消');
      fetchOrders();
    }
  };

  const statusLabel: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' };
  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    confirmed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    cancelled: 'text-gray-400 bg-gray-100 dark:bg-gray-800',
  };

  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">订单管理</h2>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span>共 {counts.total} 单</span>
        <span className="text-amber-600">待确认 {counts.pending}</span>
        <span className="text-emerald-600">已确认 {counts.confirmed}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        />
        <select value={filterMeal} onChange={(e) => setFilterMeal(e.target.value)}
          className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">全部餐别</option>
          {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无订单</div>
      ) : (
        <div className="space-y-1">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <span className="text-xs text-gray-400">{order.meal_type}</span>
                  <span className="text-xs text-gray-500">{order.nickname || order.username}</span>
                </div>
                <div className="font-medium text-sm mt-0.5">
                  {order.dish_name}
                  <span className="text-gray-400 ml-1">x{order.quantity}</span>
                </div>
                {order.notes && <div className="text-xs text-gray-400 mt-0.5">备注: {order.notes}</div>}
              </div>
              {order.status === 'pending' && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleStatus(order.id, 'confirmed')} className="px-3 h-8 text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 rounded-lg">
                    确认
                  </button>
                  <button onClick={() => handleStatus(order.id, 'cancelled')} className="px-3 h-8 text-xs bg-red-50 dark:bg-red-950 text-red-600 rounded-lg">
                    取消
                  </button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <button onClick={() => handleStatus(order.id, 'cancelled')} className="px-3 h-8 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
                  取消
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
