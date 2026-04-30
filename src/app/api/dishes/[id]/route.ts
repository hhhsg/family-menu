import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('dish.view');
  if (error) return error;

  const { id } = await context.params;
  const dish = db.prepare(`
    SELECT d.*, AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
    FROM dishes d LEFT JOIN dish_ratings dr ON dr.dish_id = d.id
    WHERE d.id = ? GROUP BY d.id
  `).get(parseInt(id));

  if (!dish) return errorResponse('菜品不存在', 404);

  const ingredients = db.prepare(
    'SELECT * FROM dish_ingredients WHERE dish_id = ?'
  ).all(parseInt(id));

  return successResponse({ ...dish as any, ingredients });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('dish.edit');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { name, description, category, cooking_time, image_url, is_available, ingredients } = body;

  db.prepare(`
    UPDATE dishes SET name=?, description=?, category=?, cooking_time=?, image_url=?, is_available=?
    WHERE id=?
  `).run(name, description, category, cooking_time, image_url, is_available ? 1 : 0, parseInt(id));

  if (ingredients) {
    db.prepare('DELETE FROM dish_ingredients WHERE dish_id = ?').run(parseInt(id));
    const insertIng = db.prepare(
      'INSERT INTO dish_ingredients (dish_id, ingredient_name, amount, unit) VALUES (?, ?, ?, ?)'
    );
    for (const ing of ingredients) {
      if (ing.ingredient_name) {
        insertIng.run(parseInt(id), ing.ingredient_name, ing.amount || null, ing.unit || null);
      }
    }
  }

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('dish.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM dishes WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
