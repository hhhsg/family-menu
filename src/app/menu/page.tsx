import { getSession } from '@/auth/auth';
import { db } from '@/db';
import { formatDate, isToday, getMealtimeTheme, todayString } from '@/lib/utils';
import TodayMenu from '@/components/menu/TodayMenu';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import { headers } from 'next/headers';

export default async function MenuPage() {
  const hrs = new Date().getHours();
  const themeBg = getMealtimeTheme(hrs);
  const today = todayString();

  // Fetch today's active menus with dishes and ingredients
  const menus = db.prepare(`
    SELECT m.* FROM menus m
    WHERE m.date = ? AND m.is_active = 1
    ORDER BY
      CASE m.meal_type
        WHEN '早餐' THEN 1
        WHEN '午餐' THEN 2
        WHEN '晚餐' THEN 3
        WHEN '加餐' THEN 4
        ELSE 5
      END
  `).all(today) as any[];

  // Fetch dishes for each menu
  const menusWithDishes = menus.map((menu) => {
    const menuDishes = db.prepare(`
      SELECT d.*, AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
      FROM menu_dishes md
      JOIN dishes d ON d.id = md.dish_id
      LEFT JOIN dish_ratings dr ON dr.dish_id = d.id
      WHERE md.menu_id = ?
      GROUP BY d.id
      ORDER BY d.category, d.name
    `).all(menu.id) as any[];

    // Fetch cooking duty
    const duty = db.prepare(`
      SELECT cd.*, u.nickname, u.username
      FROM cooking_duties cd
      JOIN users u ON u.id = cd.user_id
      WHERE cd.date = ? AND cd.meal_type = ?
    `).get(today, menu.meal_type) as any;

    return {
      ...menu,
      dishes: menuDishes.map((d: any) => ({
        ...d,
        avg_rating: d.avg_rating ? Math.round(d.avg_rating * 10) / 10 : null,
      })),
      duty: duty ? { nickname: duty.nickname || duty.username } : null,
    };
  });

  // Fetch active announcements
  const announcements = db.prepare(
    'SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 2'
  ).all() as any[];

  return (
    <div className="min-h-screen pb-16">
      <div className={`bg-gradient-to-b ${themeBg} pb-4`}>
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold">今日菜单</h1>
              <p className="text-sm text-gray-500">{formatDate(today)}</p>
            </div>
          </div>

          {announcements.length > 0 && (
            <div className="space-y-1 mt-2">
              {announcements.map((a: any) => (
                <AnnouncementBanner key={a.id} content={a.content} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {menusWithDishes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-gray-500">今天还没有安排菜单哦~</p>
            <p className="text-sm text-gray-400 mt-1">等管理员来安排吧</p>
          </div>
        ) : (
          <TodayMenu menus={menusWithDishes} />
        )}
      </div>
    </div>
  );
}
