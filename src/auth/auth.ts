import { auth as getSession } from './auth.config';
import { ALL_PERMISSIONS } from '@/lib/constants';
import type { Permission } from '@/lib/constants';

export { getSession };
export { signIn, signOut } from './auth.config';

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;
  const perms = (session.user as any).permissions as string[] | undefined;
  if (!perms) return false;
  return perms.includes(permission) || perms.includes('*');
}

export async function requirePermission(permission: Permission): Promise<boolean> {
  return hasPermission(permission);
}

export function getPermissionsFromRole(role: string): Permission[] {
  if (role === 'admin') return [...ALL_PERMISSIONS];
  return [];
}
