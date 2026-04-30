import { db } from '@/db';
import { checkAuth, successResponse } from '@/lib/auth-guard';
import { todayString } from '@/lib/utils';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const today = todayString();
  const date = new URL(request.url).searchParams.get('date') || today;

  const menus = db.prepare(`
    SELECT m.* FROM menus m
    WHERE m.date = ? AND m.is_active = 1
    ORDER BY CASE m.meal_type
      WHEN '早餐' THEN 1 WHEN '午餐' THEN 2
      WHEN '晚餐' THEN 3 WHEN '加餐' THEN 4 ELSE 5 END
  `).all(date) as any[];

  const result = menus.map((menu) => {
    const dishes = db.prepare(`
      SELECT d.*, AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
      FROM menu_dishes md
      JOIN dishes d ON d.id = md.dish_id
      LEFT JOIN dish_ratings dr ON dr.dish_id = d.id
      WHERE md.menu_id = ?
      GROUP BY d.id ORDER BY d.category, d.name
    `).all(menu.id) as any[];

    const duty = db.prepare(`
      SELECT cd.*, u.nickname, u.username
      FROM cooking_duties cd
      JOIN users u ON u.id = cd.user_id
      WHERE cd.date = ? AND cd.meal_type = ?
    `).get(date, menu.meal_type) as any;

    return {
      ...menu,
      dishes: dishes.map((d: any) => ({
        ...d,
        avg_rating: d.avg_rating ? Math.round(d.avg_rating * 10) / 10 : null,
      })),
      duty: duty ? { nickname: duty.nickname || duty.username } : null,
    };
  });

  return successResponse(result);
}
