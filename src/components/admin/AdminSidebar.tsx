'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/components/auth/PermissionGuard';

const adminLinks = [
  { path: '/admin', label: '仪表盘', icon: '📊', permission: null },
  { path: '/admin/users', label: '用户管理', icon: '👥', permission: 'users.manage' },
  { path: '/admin/dishes', label: '菜品管理', icon: '🍳', permission: 'dish.edit' },
  { path: '/admin/menus', label: '菜单管理', icon: '📋', permission: 'menu.edit' },
  { path: '/admin/orders', label: '订单管理', icon: '📝', permission: 'order.manage' },
  { path: '/admin/shopping', label: '购物清单', icon: '🛒', permission: 'shopping.edit' },
  { path: '/admin/pantry', label: '库存管理', icon: '🥘', permission: 'pantry.edit' },
  { path: '/admin/expenses', label: '费用管理', icon: '💰', permission: 'expenses.edit' },
  { path: '/admin/duty', label: '轮值管理', icon: '🧑‍🍳', permission: 'duty.edit' },
  { path: '/admin/announcements', label: '公告管理', icon: '📢', permission: 'announcement.manage' },
  { path: '/admin/export', label: '导入导出', icon: '📤', permission: 'export.manage' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const permissions = usePermissions();

  const filtered = adminLinks.filter(
    (l) => !l.permission || permissions.includes(l.permission)
  );

  return (
    <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <Link
        href="/menu"
        className="shrink-0 flex items-center gap-1 px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        ← 返回
      </Link>
      {filtered.map((link) => {
        const isActive = link.path === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(link.path);
        return (
          <Link
            key={link.path}
            href={link.path}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
