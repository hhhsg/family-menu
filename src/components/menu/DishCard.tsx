'use client';

import { useState } from 'react';
import { CATEGORY_COLORS } from '@/lib/constants';
import IngredientList from './IngredientList';

export default function DishCard({ dish, menuId }: { dish: any; menuId: number }) {
  const [showIngredients, setShowIngredients] = useState(false);
  const [ordered, setOrdered] = useState(false); // Will be replaced by actual order check

  const color = CATEGORY_COLORS[dish.category] || '#6B7280';

  return (
    <div className="px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Left color bar */}
        <div
          className="w-1 self-stretch rounded-full shrink-0 mt-1 mb-1"
          style={{ backgroundColor: color, minHeight: '40px' }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              {dish.category}
            </span>
            {dish.avg_rating && (
              <span className="text-xs text-yellow-600">
                ★{dish.avg_rating}
                {dish.rating_count > 0 && (
                  <span className="text-gray-400 ml-0.5">({dish.rating_count})</span>
                )}
              </span>
            )}
            {dish.cooking_time && (
              <span className="text-xs text-gray-400">约{dish.cooking_time}分钟</span>
            )}
          </div>

          <h4 className="font-medium text-base">{dish.name}</h4>
          {dish.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{dish.description}</p>
          )}

          {/* Ingredient toggle */}
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="text-xs text-indigo-500 mt-1.5 flex items-center gap-1"
          >
            查看配料
            <svg
              className={`w-3 h-3 transition-transform ${showIngredients ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Order button */}
        <button
          onClick={() => ordered ? setOrdered(false) : setOrdered(true)}
          disabled={ordered}
          className={`shrink-0 min-h-[44px] min-w-[64px] px-4 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            ordered
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {ordered ? '已点 ✓' : '点菜'}
        </button>
      </div>

      {/* Ingredient list */}
      {showIngredients && <IngredientList dishId={dish.id} />}
    </div>
  );
}
