'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DISH_CATEGORIES } from '@/lib/constants';

interface Ingredient {
  ingredient_name: string;
  amount: number | null;
  unit: string;
}

interface DishData {
  id?: number;
  name?: string;
  description?: string;
  category?: string;
  cooking_time?: number | null;
  image_url?: string;
  is_available?: boolean;
  ingredients?: Ingredient[];
}

export default function DishForm({
  dish,
  onSave,
  onCancel,
}: {
  dish?: DishData;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(dish?.name || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [category, setCategory] = useState(dish?.category || '荤菜');
  const [cookingTime, setCookingTime] = useState(dish?.cooking_time?.toString() || '');
  const [imageUrl, setImageUrl] = useState(dish?.image_url || '');
  const [isAvailable, setIsAvailable] = useState(dish?.is_available !== false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    dish?.ingredients || [{ ingredient_name: '', amount: null, unit: '' }]
  );
  const [saving, setSaving] = useState(false);

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient_name: '', amount: null, unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number | null) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('请输入菜名'); return; }

    setSaving(true);
    const url = dish?.id ? `/api/dishes/${dish.id}` : '/api/dishes';
    const method = dish?.id ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        category,
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
        ingredients: ingredients.filter((i) => i.ingredient_name.trim()),
      }),
    });

    if (res.ok) {
      toast.success(dish?.id ? '菜品已更新' : '菜品已创建');
      onSave();
    } else {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">菜名 *</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base"
          placeholder="如：红烧排骨"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">分类 *</label>
        <div className="flex flex-wrap gap-2">
          {DISH_CATEGORIES.map((cat) => (
            <button
              key={cat} type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base resize-none"
          rows={2} placeholder="简短描述..."
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">烹饪时间（分钟）</label>
          <input
            type="number" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base"
            placeholder="如：30"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">图片链接</label>
          <input
            type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base"
            placeholder="可选"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label className="text-sm">可点菜</label>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">配料</label>
          <button type="button" onClick={addIngredient} className="text-sm text-indigo-600 font-medium">
            + 添加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text" value={ing.ingredient_name} onChange={(e) => updateIngredient(i, 'ingredient_name', e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                placeholder="配料名"
              />
              <input
                type="number" value={ing.amount ?? ''} onChange={(e) => updateIngredient(i, 'amount', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-16 h-10 px-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                placeholder="量"
              />
              <input
                type="text" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                className="w-14 h-10 px-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                placeholder="单位"
              />
              <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 text-sm px-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 font-medium text-sm">
          取消
        </button>
        <button type="submit" disabled={saving} className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-medium text-sm disabled:opacity-50">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
