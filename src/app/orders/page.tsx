'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id: number) => {
    if (!confirm('确定取消这个订单吗？')) return;
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) {
      toast.success('已取消');
      fetchOrders();
    }
  };

  // Group orders by date
  const grouped: Record<string, any[]> = {};
  for (const o of orders) {
    if (!grouped[o.date]) grouped[o.date] = [];
    grouped[o.date].push(o);
  }

  const statusLabel: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' };
  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    confirmed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    cancelled: 'text-gray-400 bg-gray-100 dark:bg-gray-800',
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">我的订单</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">还没有订单</p>
          <p className="text-sm text-gray-400 mt-1">去菜单页点菜吧</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="text-sm text-gray-500 mb-2">{date}</div>
            <div className="space-y-1">
              {items.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{order.meal_type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </div>
                    <div className="font-medium mt-0.5">{order.dish_name}</div>
                    {order.notes && <div className="text-xs text-gray-400 mt-0.5">备注: {order.notes}</div>}
                  </div>
                  <div className="text-sm text-gray-500">x{order.quantity}</div>
                  {order.status === 'pending' && (
                    <button onClick={() => handleCancel(order.id)} className="text-xs text-red-400 px-2">
                      取消
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
