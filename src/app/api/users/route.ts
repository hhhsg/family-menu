import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';
import bcrypt from 'bcryptjs';

export async function GET() {
  const { error } = await checkPermission('users.manage');
  if (error) return error;

  const users = db.prepare(
    'SELECT id, username, nickname, avatar_color, role, permissions, preferences, is_active, created_at FROM users ORDER BY id'
  ).all();

  return successResponse(
    (users as any[]).map((u) => ({
      ...u,
      permissions: u.permissions ? JSON.parse(u.permissions) : [],
      preferences: u.preferences ? JSON.parse(u.preferences) : {},
    }))
  );
}

export async function POST(request: Request) {
  const { error } = await checkPermission('users.manage');
  if (error) return error;

  const body = await request.json();
  const { username, password, nickname, role } = body;

  if (!username || !password) return errorResponse('用户名和密码不能为空', 400);

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return errorResponse('用户名已存在', 409);

  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)'
  ).run(username, hash, nickname || null, role || 'user');

  return successResponse({ id: result.lastInsertRowid }, 201);
}
