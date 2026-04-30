'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MEAL_TYPES } from '@/lib/constants';

export default function AdminDutyPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [duties, setDuties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), meal_type: '早餐', user_id: '', notes: '',
  });

  const fetchData = useCallback(async () => {
    const [uRes, dRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/duty'),
    ]);
    const u = await uRes.json();
    const d = await dRes.json();
    if (u.success) setUsers(u.data.filter((user: any) => user.is_active));
    if (d.success) setDuties(d.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) { toast.error('请选择用户'); return; }
    const res = await fetch('/api/duty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: parseInt(form.user_id) }),
    });
    if (res.ok) {
      toast.success('已分配');
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/duty/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchData(); }
  };

  const grouped: Record<string, any[]> = {};
  for (const d of duties) {
    if (!grouped[d.date]) grouped[d.date] = [];
    grouped[d.date].push(d);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">轮值管理</h2>

      {/* Assignment form */}
      <form onSubmit={handleAssign} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex gap-2">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
          <select value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
            className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
            {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
          <option value="">选择做饭人...</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.nickname || u.username}</option>)}
        </select>
        <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">分配</button>
      </form>

      {/* Duty list */}
      <div className="space-y-3">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="text-sm text-gray-500 mb-1">{date}</div>
            <div className="space-y-1">
              {grouped[date].map((duty) => (
                <div key={duty.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <span className="text-xs w-10">{duty.meal_type}</span>
                  <span className="text-sm flex-1">{duty.nickname || duty.username}</span>
                  {duty.notes && <span className="text-xs text-gray-400">{duty.notes}</span>}
                  <button onClick={() => handleDelete(duty.id)} className="text-xs text-red-400">删除</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
