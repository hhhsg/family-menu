import { getSession } from '@/auth/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/api/auth', '/api/health'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static files, and assets
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/sw.js')
  ) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const permissions = (session.user as any).permissions as string[] | undefined;

  // Admin routes: check specific permissions
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin') {
      const hasAny = permissions && permissions.some((p: string) => p.includes('edit') || p.includes('manage'));
      if (!hasAny) return NextResponse.redirect(new URL('/menu', request.url));
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
          return NextResponse.redirect(new URL('/menu', request.url));
        }
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js).*)'],
};
