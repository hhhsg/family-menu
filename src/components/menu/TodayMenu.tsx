'use client';

import MealSection from './MealSection';

interface MenuData {
  id: number;
  date: string;
  meal_type: string;
  label: string | null;
  dishes: any[];
  duty: { nickname: string } | null;
}

export default function TodayMenu({ menus }: { menus: MenuData[] }) {
  return (
    <div className="space-y-4">
      {menus.map((menu) => (
        <MealSection key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
