import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('users.manage');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { nickname, role, permissions, is_active, preferences } = body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id));
  if (!user) return errorResponse('用户不存在', 404);

  db.prepare(`
    UPDATE users SET
      nickname = COALESCE(?, nickname),
      role = COALESCE(?, role),
      permissions = COALESCE(?, permissions),
      preferences = COALESCE(?, preferences),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    nickname !== undefined ? nickname : null,
    role || null,
    permissions !== undefined ? JSON.stringify(permissions) : null,
    preferences !== undefined ? JSON.stringify(preferences) : null,
    is_active !== undefined ? (is_active ? 1 : 0) : null,
    parseInt(id)
  );

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('users.manage');
  if (error) return error;

  const { id } = await context.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id)) as any;
  if (!user) return errorResponse('用户不存在', 404);
  if (user.role === 'admin') return errorResponse('不能删除管理员', 403);

  // Delete related data first, then the user
  db.prepare('DELETE FROM dish_ratings WHERE user_id = ?').run(parseInt(id));
  db.prepare('DELETE FROM orders WHERE user_id = ?').run(parseInt(id));
  db.prepare('DELETE FROM cooking_duties WHERE user_id = ?').run(parseInt(id));
  db.prepare('DELETE FROM expenses WHERE paid_by = ?').run(parseInt(id));
  db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(parseInt(id));
  db.prepare('DELETE FROM users WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('users.manage');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { password } = body;

  if (!password) return errorResponse('密码不能为空', 400);

  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, parseInt(id));

  return successResponse({ id: parseInt(id) });
}
