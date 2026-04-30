import { db } from '@/db';
import { todayString } from '@/lib/utils';

export default async function AdminDashboard() {
  const today = todayString();

  const orderCount = db.prepare(
    "SELECT COUNT(*) as c FROM orders WHERE created_at >= ?"
  ).get(today) as any;

  const userCount = db.prepare(
    "SELECT COUNT(*) as c FROM users WHERE is_active = 1"
  ).get() as any;

  const dishCount = db.prepare(
    "SELECT COUNT(*) as c FROM dishes WHERE is_available = 1"
  ).get() as any;

  const pantryWarnings = db.prepare(
    "SELECT COUNT(*) as c FROM pantry_items WHERE quantity <= min_quantity AND min_quantity > 0"
  ).get() as any;

  const stats = [
    { label: '今日点菜', value: orderCount?.c || 0, color: 'bg-indigo-500' },
    { label: '活跃用户', value: userCount?.c || 0, color: 'bg-emerald-500' },
    { label: '可点菜品', value: dishCount?.c || 0, color: 'bg-amber-500' },
    { label: '库存警告', value: pantryWarnings?.c || 0, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold mb-3">快捷操作</h3>
        <div className="grid grid-cols-2 gap-2">
          <a href="/admin/menus" className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm">
            📋 创建今日菜单
          </a>
          <a href="/admin/shopping" className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm">
            🛒 汇总购物清单
          </a>
          <a href="/admin/dishes" className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm">
            🍳 管理菜品
          </a>
          <a href="/admin/users" className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-sm">
            👥 管理用户
          </a>
        </div>
      </div>
    </div>
  );
}
