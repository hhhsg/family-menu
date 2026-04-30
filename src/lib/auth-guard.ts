import { getSession } from '@/auth/auth';
import { NextResponse } from 'next/server';
import type { Permission } from './constants';

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export async function checkAuth() {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, error: errorResponse('未登录', 401) };
  }
  return { session, error: null };
}

export async function checkPermission(permission: Permission) {
  const { session, error } = await checkAuth();
  if (error) return { session: null, error };

  const perms = (session!.user as any).permissions as string[];
  if (!perms?.includes(permission)) {
    return { session: null, error: errorResponse('无权限', 403) };
  }
  return { session: session!, error: null };
}

export function getUserId(session: any): number {
  return parseInt(session.user.id);
}
