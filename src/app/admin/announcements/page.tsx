'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    if (data.success) setAnnouncements(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.ok) {
      toast.success('公告已发布');
      setContent('');
      fetchAnnouncements();
    }
  };

  const handleToggle = async (a: any) => {
    const res = await fetch(`/api/announcements/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !a.is_active }),
    });
    if (res.ok) {
      toast.success(a.is_active ? '已下架' : '已上架');
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除吗？')) return;
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchAnnouncements(); }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">公告管理</h2>

      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm resize-none"
          rows={2} placeholder="公告内容..."
        />
        <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">发布公告</button>
      </form>

      <div className="space-y-1">
        {announcements.map((a) => (
          <div key={a.id} className={`bg-white dark:bg-gray-900 rounded-xl p-3 border flex items-center gap-3 ${a.is_active ? 'border-indigo-200 dark:border-indigo-900' : 'border-gray-100 dark:border-gray-800 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{a.content}</p>
              <p className="text-[10px] text-gray-400 mt-1">{a.created_at}</p>
            </div>
            <button onClick={() => handleToggle(a)} className={`px-3 h-7 text-xs rounded-lg ${a.is_active ? 'bg-amber-50 dark:bg-amber-950 text-amber-600' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'}`}>
              {a.is_active ? '下架' : '上架'}
            </button>
            <button onClick={() => handleDelete(a.id)} className="px-3 h-7 text-xs bg-red-50 dark:bg-red-950 text-red-600 rounded-lg">删除</button>
          </div>
        ))}
      </div>

      {announcements.length === 0 && <div className="text-center py-12 text-gray-400">暂无公告</div>}
    </div>
  );
}
