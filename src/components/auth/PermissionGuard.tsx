'use client';

import { useSession } from 'next-auth/react';
import type { Permission } from '@/lib/constants';

export function usePermission(permission: Permission): boolean {
  const { data: session } = useSession();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!perms) return false;
  return perms.includes(permission);
}

export function usePermissions(): string[] {
  const { data: session } = useSession();
  return ((session?.user as any)?.permissions as string[]) || [];
}

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return (session?.user as any)?.role === 'admin';
}

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const has = usePermission(permission);
  if (!has) return fallback;
  return <>{children}</>;
}
