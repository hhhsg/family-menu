import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse, getUserId } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error, session } = await checkAuth();
  if (error) return error;

  const userId = getUserId(session!);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const menuId = searchParams.get('menu_id');

  let sql = `SELECT o.*, d.name as dish_name, d.category, m.date, m.meal_type
    FROM orders o
    JOIN dishes d ON d.id = o.dish_id
    JOIN menus m ON m.id = o.menu_id
    WHERE o.user_id = ?`;
  const params: any[] = [userId];

  if (status) { sql += ' AND o.status = ?'; params.push(status); }
  if (menuId) { sql += ' AND o.menu_id = ?'; params.push(menuId); }

  sql += ' ORDER BY m.date DESC, o.created_at DESC';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error, session } = await checkPermission('order.create');
  if (error) return error;

  const userId = getUserId(session!);
  const body = await request.json();
  const { menu_id, dish_id, quantity, notes } = body;

  if (!menu_id || !dish_id) return errorResponse('菜单和菜品不能为空', 400);

  const menu = db.prepare('SELECT id FROM menus WHERE id = ? AND is_active = 1').get(menu_id);
  if (!menu) return errorResponse('菜单不存在或已关闭', 404);

  const existing = db.prepare(
    'SELECT id FROM orders WHERE user_id = ? AND menu_id = ? AND dish_id = ?'
  ).get(userId, menu_id, dish_id);
  if (existing) return errorResponse('已经点过这个菜了', 409);

  const result = db.prepare(
    'INSERT INTO orders (user_id, menu_id, dish_id, quantity, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, menu_id, dish_id, quantity || 1, notes || null);

  return successResponse({ id: result.lastInsertRowid }, 201);
}
