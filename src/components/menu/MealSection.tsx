'use client';

import { useState } from 'react';
import DishCard from './DishCard';

const MEAL_ICONS: Record<string, string> = {
  '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍪',
};

export default function MealSection({ menu }: { menu: any }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{MEAL_ICONS[menu.meal_type] || '🍽️'}</span>
          <span className="font-semibold text-base">{menu.meal_type}</span>
          {menu.label && (
            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded"> {menu.label} </span>
          )}
          {menu.duty && (
            <span className="text-xs text-gray-400">
              · {menu.duty.nickname} 做饭
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {menu.dishes.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">暂无菜品</div>
          ) : (
            menu.dishes.map((dish: any) => (
              <DishCard key={dish.id} dish={dish} menuId={menu.id} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
