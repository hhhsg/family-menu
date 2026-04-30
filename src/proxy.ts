import { auth } from '@/auth/auth.config';
import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/api/auth'];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn && pathname === '/login') {
      return NextResponse.redirect(new URL('/menu', req.url));
    }
    return NextResponse.next();
  }

  // Allow static files and API health check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const permissions = req.auth.user?.permissions as string[] | undefined;

  // Admin routes: check specific permissions
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin') {
      const hasAny = permissions && permissions.some((p) => p.includes('edit') || p.includes('manage'));
      if (!hasAny) return NextResponse.redirect(new URL('/menu', req.url));
      return NextResponse.next();
    }

    const permissionMap: Record<string, string> = {
      '/admin/users': 'users.manage',
      '/admin/dishes': 'dish.edit',
      '/admin/menus': 'menu.edit',
      '/admin/orders': 'order.manage',
      '/admin/shopping': 'shopping.edit',
      '/admin/pantry': 'pantry.edit',
      '/admin/expenses': 'expenses.edit',
      '/admin/duty': 'duty.edit',
      '/admin/announcements': 'announcement.manage',
      '/admin/export': 'export.manage',
    };

    for (const [_path, perm] of Object.entries(permissionMap)) {
      if (pathname.startsWith(_path)) {
        if (!permissions?.includes(perm)) {
          return NextResponse.redirect(new URL('/menu', req.url));
        }
        break;
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js).*)'],
};
