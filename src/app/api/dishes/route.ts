import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let sql = `SELECT d.*, AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
    FROM dishes d LEFT JOIN dish_ratings dr ON dr.dish_id = d.id WHERE 1=1`;
  const params: any[] = [];

  if (category) { sql += ' AND d.category = ?'; params.push(category); }
  if (search) { sql += ' AND d.name LIKE ?'; params.push(`%${search}%`); }

  sql += ' GROUP BY d.id ORDER BY d.category, d.name';

  const dishes = db.prepare(sql).all(...params);
  return successResponse(dishes);
}

export async function POST(request: Request) {
  const { error } = await checkPermission('dish.edit');
  if (error) return error;

  const body = await request.json();
  const { name, description, category, cooking_time, image_url, ingredients } = body;

  if (!name || !category) {
    return errorResponse('菜名和分类不能为空', 400);
  }

  const result = db.prepare(
    'INSERT INTO dishes (name, description, category, cooking_time, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run(name, description || null, category, cooking_time || null, image_url || null);

  const dishId = result.lastInsertRowid as number;

  if (ingredients && ingredients.length > 0) {
    const insertIng = db.prepare(
      'INSERT INTO dish_ingredients (dish_id, ingredient_name, amount, unit) VALUES (?, ?, ?, ?)'
    );
    for (const ing of ingredients) {
      if (ing.ingredient_name) {
        insertIng.run(dishId, ing.ingredient_name, ing.amount || null, ing.unit || null);
      }
    }
  }

  return successResponse({ id: dishId }, 201);
}
