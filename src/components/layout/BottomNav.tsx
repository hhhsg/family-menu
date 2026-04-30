'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/components/auth/PermissionGuard';

interface NavTab {
  path: string;
  label: string;
  icon: string;
  permission: string | null;
}

const allTabs: NavTab[] = [
  { path: '/menu', label: '菜单', icon: '📋', permission: 'menu.view' },
  { path: '/orders', label: '订单', icon: '📝', permission: 'order.create' },
  { path: '/shopping', label: '购物', icon: '🛒', permission: 'shopping.view' },
  { path: '/pantry', label: '库存', icon: '🥘', permission: 'pantry.view' },
  { path: '/profile', label: '我的', icon: '👤', permission: null },
];

export default function BottomNav() {
  const pathname = usePathname();
  const permissions = usePermissions();

  const tabs = allTabs.filter(
    (t) => !t.permission || permissions.includes(t.permission)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
