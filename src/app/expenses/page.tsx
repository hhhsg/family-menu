'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), amount: '', description: '', category: '食材',
  });

  const fetchData = useCallback(async () => {
    const [expRes, sumRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/expenses/summary'),
    ]);
    const exp = await expRes.json();
    const sum = await sumRes.json();
    if (exp.success) setExpenses(exp.data);
    if (sum.success) setSummary(sum.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description.trim()) return;
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      toast.success('已记录');
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), amount: '', description: '', category: '食材' });
      fetchData();
    }
  };

  const categoryColors: Record<string, string> = {
    '食材': '#EF4444', '调料': '#F97316', '水果': '#22C55E',
    '零食': '#A855F7', '日用品': '#3B82F6', '其他': '#6B7280',
  };

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
        <h2 className="text-lg font-semibold">费用记录</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 h-9 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          + 记一笔
        </button>
      </div>

      {/* Summary card */}
      {summary && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500">本月开销</div>
          <div className="text-3xl font-bold mt-1">￥{summary.total.toFixed(1)}</div>
          {summary.change_pct !== null && (
            <div className={`text-xs mt-1 ${summary.change_pct >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              较上月 {summary.change_pct >= 0 ? '↑' : '↓'}{Math.abs(summary.change_pct)}%
            </div>
          )}

          {/* Category breakdown */}
          {summary.by_category?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {summary.by_category.map((cat: any) => (
                <span key={cat.category} className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: categoryColors[cat.category] || '#6B7280' }}>
                  {cat.category} ￥{cat.total.toFixed(0)}
                </span>
              ))}
            </div>
          )}

          {/* Per person */}
          {summary.by_person?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1">按人头</div>
              <div className="flex gap-3 text-sm">
                {summary.by_person.map((p: any) => (
                  <span key={p.username} className="text-gray-600">
                    {p.nickname || p.username} ￥{p.total.toFixed(0)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
          <div className="flex gap-2">
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              placeholder="金额" />
          </div>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="描述（买了什么）" />
          <div className="flex flex-wrap gap-1.5">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                className={`px-3 py-1.5 rounded-full text-xs ${form.category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {cat}
              </button>
            ))}
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">记录</button>
        </form>
      )}

      {/* Expense list */}
      <div className="space-y-1">
        {expenses.map((exp) => (
          <div key={exp.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: categoryColors[exp.category] || '#6B7280' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{exp.date}</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{exp.category}</span>
              </div>
              <div className="text-sm mt-0.5">{exp.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">￥{exp.amount.toFixed(1)}</div>
              {exp.nickname && <div className="text-[10px] text-gray-400">{exp.nickname}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
