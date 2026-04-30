import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('menu.view');
  if (error) return error;

  const { id } = await context.params;
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(parseInt(id)) as any;
  if (!menu) return errorResponse('菜单不存在', 404);

  const dishes = db.prepare(`
    SELECT d.*, AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
    FROM menu_dishes md
    JOIN dishes d ON d.id = md.dish_id
    LEFT JOIN dish_ratings dr ON dr.dish_id = d.id
    WHERE md.menu_id = ?
    GROUP BY d.id ORDER BY d.category, d.name
  `).all(parseInt(id)) as any[];

  const duty = db.prepare(`
    SELECT cd.*, u.nickname, u.username
    FROM cooking_duties cd
    JOIN users u ON u.id = cd.user_id
    WHERE cd.date = ? AND cd.meal_type = ?
  `).get(menu.date, menu.meal_type) as any;

  return successResponse({
    ...menu,
    dishes: dishes.map((d: any) => ({ ...d, avg_rating: d.avg_rating ? Math.round(d.avg_rating * 10) / 10 : null })),
    duty: duty ? { nickname: duty.nickname || duty.username } : null,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { date, meal_type, label, dish_ids, is_active } = body;

  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(parseInt(id));
  if (!menu) return errorResponse('菜单不存在', 404);

  if (date || meal_type) {
    const checkDate = date || (menu as any).date;
    const checkMeal = meal_type || (menu as any).meal_type;
    const dup = db.prepare('SELECT id FROM menus WHERE date = ? AND meal_type = ? AND id != ?')
      .get(checkDate, checkMeal, parseInt(id));
    if (dup) return errorResponse('该日期餐别已有菜单', 409);
  }

  db.prepare(`
    UPDATE menus SET date=COALESCE(?,date), meal_type=COALESCE(?,meal_type),
    label=COALESCE(?,label), is_active=COALESCE(?,is_active) WHERE id=?
  `).run(date || null, meal_type || null, label !== undefined ? label : null,
    is_active !== undefined ? (is_active ? 1 : 0) : null, parseInt(id));

  if (dish_ids !== undefined) {
    db.prepare('DELETE FROM menu_dishes WHERE menu_id = ?').run(parseInt(id));
    const insert = db.prepare('INSERT INTO menu_dishes (menu_id, dish_id) VALUES (?, ?)');
    for (const dishId of dish_ids) {
      insert.run(parseInt(id), dishId);
    }
  }

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('menu.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM menus WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
