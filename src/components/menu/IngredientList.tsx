'use client';

import { useEffect, useState } from 'react';

export default function IngredientList({ dishId }: { dishId: number }) {
  const [ingredients, setIngredients] = useState<any[]>([]);

  useEffect(() => {
    // Fetch ingredients for this dish
    fetch(`/api/dishes/${dishId}/ingredients`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setIngredients(data.data);
      })
      .catch(() => {});
  }, [dishId]);

  if (ingredients.length === 0) {
    return (
      <div className="mt-2 ml-4 animate-fade-in">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400">加载配料中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 ml-4 animate-fade-in">
      <div className="flex flex-wrap gap-1.5">
        {ingredients.map((ing: any) => (
          <span
            key={ing.id}
            className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {ing.ingredient_name}
            {ing.amount && (
              <span className="ml-1 text-gray-400">
                {ing.amount}{ing.unit || ''}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
