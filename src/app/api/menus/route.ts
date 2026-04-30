import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const mealType = searchParams.get('meal_type');

  let sql = 'SELECT * FROM menus WHERE 1=1';
  const params: any[] = [];
  if (date) { sql += ' AND date = ?'; params.push(date); }
  if (mealType) { sql += ' AND meal_type = ?'; params.push(mealType); }
  sql += ' ORDER BY date DESC, CASE meal_type WHEN "早餐" THEN 1 WHEN "午餐" THEN 2 WHEN "晚餐" THEN 3 ELSE 4 END';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const body = await request.json();
  const { date, meal_type, label, dish_ids } = body;
  if (!date || !meal_type) return errorResponse('日期和餐别不能为空', 400);

  const existing = db.prepare('SELECT id FROM menus WHERE date = ? AND meal_type = ?').get(date, meal_type);
  if (existing) return errorResponse('该日期餐别已有菜单', 409);

  const result = db.prepare(
    'INSERT INTO menus (date, meal_type, label) VALUES (?, ?, ?)'
  ).run(date, meal_type, label || null);

  const menuId = result.lastInsertRowid as number;

  if (dish_ids && dish_ids.length > 0) {
    const insert = db.prepare('INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)');
    for (const dishId of dish_ids) {
      insert.run(menuId, dishId);
    }
  }

  return successResponse({ id: menuId }, 201);
}
