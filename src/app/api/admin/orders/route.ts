import { db } from '@/db';
import { checkPermission, successResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkPermission('order.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const mealType = searchParams.get('meal_type');
  const status = searchParams.get('status');

  let sql = `SELECT o.*, d.name as dish_name, d.category, m.date, m.meal_type,
    u.username, u.nickname
    FROM orders o
    JOIN dishes d ON d.id = o.dish_id
    JOIN menus m ON m.id = o.menu_id
    JOIN users u ON u.id = o.user_id
    WHERE 1=1`;
  const params: any[] = [];

  if (date) { sql += ' AND m.date = ?'; params.push(date); }
  if (mealType) { sql += ' AND m.meal_type = ?'; params.push(mealType); }
  if (status) { sql += ' AND o.status = ?'; params.push(status); }

  sql += ' ORDER BY m.date DESC, m.meal_type, o.created_at DESC';

  return successResponse(db.prepare(sql).all(...params));
}
