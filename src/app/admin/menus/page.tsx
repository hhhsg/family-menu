'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MEAL_TYPES } from '@/lib/constants';
import { todayString, formatDate } from '@/lib/utils';

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

function changeWeek(offset: number): string[] {
  const ref = currentWeekRef;
  const base = new Date(ref[0] + 'T00:00:00');
  base.setDate(base.getDate() + offset * 7);
  const monday = new Date(base);
  monday.setDate(base.getDate() - (base.getDay() === 0 ? 6 : base.getDay() - 1));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

let currentWeekRef: string[] = [];

export default function AdminMenusPage() {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [menus, setMenus] = useState<Record<string, any[]>>({});
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ date: string; meal: string } | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<number[]>([]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const dates = getWeekDates();
    currentWeekRef = dates;
    setWeekDates(dates);
    fetchMenus(dates);
    fetchDishes();
  }, []);

  const fetchMenus = async (dates: string[]) => {
    setLoading(true);
    const map: Record<string, any[]> = {};
    for (const date of dates) {
      const res = await fetch(`/api/menus?date=${date}`);
      const data = await res.json();
      if (data.success) map[date] = data.data;
    }
    setMenus(map);
    setLoading(false);
  };

  const fetchDishes = async () => {
    const res = await fetch('/api/dishes');
    const data = await res.json();
    if (data.success) setDishes(data.data.filter((d: any) => d.is_available));
  };

  const handleEdit = (date: string, meal: string, menu?: any) => {
    setEditing({ date, meal });
    setSelectedDishes(menu?.dish_ids || []);
    setLabel(menu?.label || '');
  };

  const handleSave = async () => {
    if (!editing) return;

    const { date, meal } = editing;
    const existingMenu = menus[date]?.find((m: any) => m.meal_type === meal);

    const body: any = { date, meal_type: meal, label: label || null, dish_ids: selectedDishes };
    if (existingMenu) {
      body.dish_ids = selectedDishes;
      body.label = label;
      body.is_active = 1;
    }

    const url = existingMenu
      ? `/api/menus/${existingMenu.id}`
      : '/api/menus';
    const method = existingMenu ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success('已保存');
      setEditing(null);
      fetchMenus(weekDates);
    } else {
      const d = await res.json();
      toast.error(d.message || '保存失败');
    }
  };

  const handleDelete = async (menuId: number) => {
    if (!confirm('确定删除这个菜单吗？')) return;
    const res = await fetch(`/api/menus/${menuId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('已删除');
      fetchMenus(weekDates);
    }
  };

  const toggleDish = (dishId: number) => {
    setSelectedDishes((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const changeWeekOffset = (offset: number) => {
    const newDates = changeWeek(offset);
    currentWeekRef = newDates;
    setWeekDates(newDates);
    fetchMenus(newDates);
  };

  const isToday = (dateStr: string) => dateStr === todayString();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">菜单管理</h2>
        <div className="flex gap-2">
          <button onClick={() => changeWeekOffset(-1)} className="px-3 h-8 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg">
            ← 上周
          </button>
          <button onClick={() => changeWeekOffset(1)} className="px-3 h-8 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg">
            下周 →
          </button>
        </div>
      </div>

      {/* Week calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => {
          const dayMenus = menus[date] || [];
          const dateObj = new Date(date + 'T00:00:00');
          const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
          return (
            <div key={date} className={`text-center p-1 rounded-lg ${isToday(date) ? 'bg-indigo-100 dark:bg-indigo-950' : ''}`}>
              <div className="text-[10px] text-gray-400">周{dayNames[dateObj.getDay()]}</div>
              <div className={`text-sm font-semibold ${isToday(date) ? 'text-indigo-600' : ''}`}>
                {dateObj.getDate()}
              </div>
              <div className="mt-0.5">
                {MEAL_TYPES.map((meal) => {
                  const menu = dayMenus.find((m: any) => m.meal_type === meal);
                  return (
                    <div
                      key={meal}
                      className={`w-1.5 h-1.5 rounded-full mx-auto my-0.5 ${menu ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                      title={`${date} ${meal}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day list with meals */}
      <div className="space-y-3">
        {weekDates.map((date) => {
          const dayMenus = menus[date] || [];
          if (dayMenus.length === 0 && date !== todayString()) return null;
          return (
            <div key={date}>
              <div className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-indigo-600' : 'text-gray-600'}`}>
                {formatDate(date)}
              </div>
              <div className="space-y-1">
                {MEAL_TYPES.map((meal) => {
                  const menu = dayMenus.find((m: any) => m.meal_type === meal);
                  const dishIds: number[] = menu?.dish_ids || [];
                  return (
                    <div
                      key={meal}
                      className={`flex items-center gap-3 p-2 rounded-xl ${
                        editing?.date === date && editing?.meal === meal
                          ? 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                      onClick={() => handleEdit(date, meal, menu ? { ...menu, dish_ids: dishIds } : undefined)}
                    >
                      <span className="text-xs w-10 shrink-0">{meal}</span>
                      {menu ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1">
                              {dishIds.map((did) => {
                                const dish = dishes.find((d) => d.id === did);
                                return dish ? (
                                  <span key={did} className="text-xs px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md">
                                    {dish.name}
                                  </span>
                                ) : null;
                              })}
                              {dishIds.length === 0 && <span className="text-xs text-gray-400">未设置菜品</span>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(menu.id); }}
                            className="text-xs text-red-400 px-1"
                          >
                            删除
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 flex-1">点击添加菜品</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setEditing(null)}>
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {editing.date} · {editing.meal}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 text-lg">✕</button>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-500 mb-1 block">标签（可选）</label>
              <input
                type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                placeholder="如：周末大餐"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">选择菜品（{selectedDishes.length} 道）</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {dishes.map((dish) => (
                  <label
                    key={dish.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      selectedDishes.includes(dish.id) ? 'bg-indigo-50 dark:bg-indigo-950' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDishes.includes(dish.id)}
                      onChange={() => toggleDish(dish.id)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{dish.category}</span>
                    <span className="text-sm flex-1">{dish.name}</span>
                    {dish.avg_rating && <span className="text-xs text-yellow-500">★{Math.round(dish.avg_rating * 10) / 10}</span>}
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleSave} className="w-full h-11 rounded-xl bg-indigo-600 text-white font-medium text-sm">
              保存菜单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
