'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAdmin } from '@/components/auth/PermissionGuard';

export default function Header({ title }: { title: string }) {
  const { data: session } = useSession();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();

  const showBack = !['/menu', '/orders', '/shopping', '/pantry', '/profile', '/login'].includes(pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 safe-top">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => window.history.back()} className="p-1 -ml-1 text-gray-600 dark:text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <h1 className="text-base font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              管理
            </Link>
          )}
          <Link href="/profile" className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: session?.user ? ((session.user as any).avatarColor || '#60A5FA') : '#60A5FA' }}>
            {(session?.user?.name || '?')[0]}
          </Link>
        </div>
      </div>
    </header>
  );
}
