'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import DishForm from '@/components/admin/DishForm';
import { DISH_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchDishes = useCallback(async () => {
    const url = filterCategory ? `/api/dishes?category=${filterCategory}` : '/api/dishes';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setDishes(data.data);
    setLoading(false);
  }, [filterCategory]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个菜品吗？')) return;
    const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('已删除');
      fetchDishes();
    }
  };

  const handleEdit = (dish: any) => {
    setEditingDish(dish);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingDish(null);
    fetchDishes();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">菜品管理</h2>
        <button
          onClick={() => { setEditingDish(null); setShowForm(true); }}
          className="px-4 h-10 bg-indigo-600 text-white rounded-xl text-sm font-medium"
        >
          + 添加菜品
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setFilterCategory('')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${!filterCategory ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
          全部
        </button>
        {DISH_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilterCategory(cat)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <DishForm dish={editingDish} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingDish(null); }} />
        </div>
      )}

      {/* Dish list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {dishes.map((dish) => (
            <div key={dish.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: CATEGORY_COLORS[dish.category] || '#6B7280' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: CATEGORY_COLORS[dish.category] }}>
                    {dish.category}
                  </span>
                  {!dish.is_available && <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">已下架</span>}
                  {dish.avg_rating && <span className="text-xs text-yellow-600">★{Math.round(dish.avg_rating * 10) / 10}</span>}
                </div>
                <div className="font-medium mt-0.5">{dish.name}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(dish)} className="px-3 h-8 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg">编辑</button>
                <button onClick={() => handleDelete(dish.id)} className="px-3 h-8 text-xs bg-red-50 dark:bg-red-950 text-red-600 rounded-lg">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
