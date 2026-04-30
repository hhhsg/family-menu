'use client';

import { useState, useEffect, useCallback } from 'react';
import { MEAL_TYPES } from '@/lib/constants';

function getWeekDates(): { date: string; dayName: string }[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const dates = [];
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: dayNames[i],
    });
  }
  return dates;
}

export default function DutyPage() {
  const [weekDates] = useState(getWeekDates);
  const [duties, setDuties] = useState<Record<string, Record<string, any>>>({});

  const fetchDuties = useCallback(async () => {
    const res = await fetch(`/api/duty?week_start=${weekDates[0].date}`);
    const data = await res.json();
    if (data.success) {
      const map: Record<string, Record<string, any>> = {};
      for (const d of data.data) {
        if (!map[d.date]) map[d.date] = {};
        map[d.date][d.meal_type] = d;
      }
      setDuties(map);
    }
  }, [weekDates]);

  useEffect(() => { fetchDuties(); }, [fetchDuties]);

  const mealIcons: Record<string, string> = { '早餐': '🍳', '午餐': '🍚', '晚餐': '🍲', '加餐': '🍰' };
  const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">做饭轮值</h2>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="grid grid-cols-7 gap-1 min-w-[480px]">
          {weekDates.map(({ date, dayName }) => (
            <div key={date} className={`text-center p-2 rounded-lg ${isToday(date) ? 'bg-indigo-100 dark:bg-indigo-950 ring-1 ring-indigo-300' : ''}`}>
              <div className="text-[10px] text-gray-400">{dayName}</div>
              <div className={`text-sm font-semibold ${isToday(date) ? 'text-indigo-600' : ''}`}>
                {parseInt(date.slice(8, 10))}
              </div>
              <div className="mt-1.5 space-y-1.5">
                {MEAL_TYPES.filter((m) => m !== '加餐').map((meal) => {
                  const duty = duties[date]?.[meal];
                  return (
                    <div key={meal} className="text-[10px] leading-tight">
                      <div className="text-gray-400">{mealIcons[meal]}</div>
                      <div className={`font-medium ${duty?.nickname ? 'text-indigo-600' : 'text-gray-300'}`}>
                        {duty?.nickname || duty?.username || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
