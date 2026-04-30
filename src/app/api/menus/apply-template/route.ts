import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const body = await request.json();
  const { template_id, date, meal_type } = body;

  if (!template_id || !date) {
    return errorResponse('模板和日期不能为空', 400);
  }

  const template = db.prepare('SELECT * FROM menu_templates WHERE id = ?').get(template_id) as any;
  if (!template) return errorResponse('模板不存在', 404);

  const dishIds: number[] = JSON.parse(template.dish_ids);
  const availableDishes = db.prepare(
    `SELECT id FROM dishes WHERE id IN (${dishIds.map(() => '?').join(',')}) AND is_available = 1`
  ).all(...dishIds) as any[];

  if (availableDishes.length === 0) {
    return errorResponse('模板中没有可用的菜品', 400);
  }

  const targetMeal = meal_type || template.meal_type;

  // Upsert: delete existing then insert
  db.prepare('DELETE FROM menus WHERE date = ? AND meal_type = ?').run(date, targetMeal);

  const result = db.prepare(
    'INSERT INTO menus (date, meal_type, label) VALUES (?, ?, ?)'
  ).run(date, targetMeal, template.name);

  const menuId = result.lastInsertRowid as number;
  const insert = db.prepare('INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)');
  for (const { id } of availableDishes) {
    insert.run(menuId, id);
  }

  return successResponse({
    menu_id: menuId,
    dishes_added: availableDishes.length,
    dishes_skipped: dishIds.length - availableDishes.length,
  }, 201);
}
