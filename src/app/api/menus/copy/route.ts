import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const body = await request.json();
  const { source_date, target_date, meal_types } = body;

  if (!source_date || !target_date) {
    return errorResponse('来源日期和目标日期不能为空', 400);
  }

  const types = meal_types || ['早餐', '午餐', '晚餐', '加餐'];
  const results: number[] = [];

  for (const mealType of types) {
    const sourceMenu = db.prepare(
      'SELECT * FROM menus WHERE date = ? AND meal_type = ?'
    ).get(source_date, mealType) as any;

    if (!sourceMenu) continue;

    const sourceDishes = db.prepare(
      'SELECT dish_id FROM menu_dishes WHERE menu_id = ?'
    ).all(sourceMenu.id) as any[];

    // Delete existing target menu if exists
    db.prepare('DELETE FROM menus WHERE date = ? AND meal_type = ?').run(target_date, mealType);

    const result = db.prepare(
      'INSERT INTO menus (date, meal_type, label) VALUES (?, ?, ?)'
    ).run(target_date, mealType, sourceMenu.label);

    const newMenuId = result.lastInsertRowid as number;
    const insert = db.prepare('INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)');
    for (const { dish_id } of sourceDishes) {
      insert.run(newMenuId, dish_id);
    }
    results.push(newMenuId);
  }

  return successResponse({ menu_ids: results }, 201);
}
