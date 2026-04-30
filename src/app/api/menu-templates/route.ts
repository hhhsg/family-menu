import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET() {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const templates = db.prepare('SELECT * FROM menu_templates ORDER BY created_at DESC').all();
  return successResponse(templates);
}

export async function POST(request: Request) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const body = await request.json();
  const { name, meal_type, dish_ids } = body;

  if (!name || !meal_type || !dish_ids?.length) {
    return errorResponse('模板名、餐别和菜品不能为空', 400);
  }

  const result = db.prepare(
    'INSERT INTO menu_templates (name, meal_type, dish_ids) VALUES (?, ?, ?)'
  ).run(name, meal_type, JSON.stringify(dish_ids));

  return successResponse({ id: result.lastInsertRowid }, 201);
}
