'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchExpenses = useCallback(async () => {
    const res = await fetch(`/api/expenses?month=${month}`);
    const data = await res.json();
    if (data.success) setExpenses(data.data);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除吗？')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchExpenses(); }
  };

  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">费用管理</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-sm text-gray-500">当月总计</div>
        <div className="text-3xl font-bold">￥{total.toFixed(1)}</div>
      </div>

      <div className="space-y-1">
        {expenses.map((exp) => (
          <div key={exp.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{exp.date}</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{exp.category}</span>
              </div>
              <div className="text-sm mt-0.5">{exp.description}</div>
              {exp.nickname && <div className="text-[10px] text-gray-400">付款人: {exp.nickname}</div>}
            </div>
            <div className="text-right">
              <div className="font-semibold">￥{exp.amount.toFixed(1)}</div>
            </div>
            <button onClick={() => handleDelete(exp.id)} className="px-2 text-xs text-red-400">删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
