'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { ALLERGEN_OPTIONS } from '@/lib/constants';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [prefs, setPrefs] = useState<{ allergies: string[]; favorite_dishes: number[] }>({
    allergies: [],
    favorite_dishes: [],
  });
  const [nickname, setNickname] = useState('');
  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setNickname((session.user as any).nickname || '');
      const parsed = (session.user as any).preferences;
      if (typeof parsed === 'string') {
        try { setPrefs(JSON.parse(parsed)); } catch {}
      } else if (parsed) {
        setPrefs(parsed);
      }
    }
  }, [session]);

  const handleSaveNickname = async () => {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    if (res.ok) {
      toast.success('昵称已更新');
      setNicknameEditing(false);
    }
  };

  const toggleAllergy = (item: string) => {
    const updated = prefs.allergies.includes(item)
      ? prefs.allergies.filter((a) => a !== item)
      : [...prefs.allergies, item];
    const newPrefs = { ...prefs, allergies: updated };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  };

  const savePrefs = async (newPrefs: typeof prefs) => {
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: newPrefs }),
    });
  };

  const user = session?.user as any;

  return (
    <div className="space-y-4">
      {/* Avatar & nickname */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: user?.avatar_color || '#60A5FA' }}
        >
          {(user?.nickname || user?.username || '?')[0]}
        </div>
        {nicknameEditing ? (
          <div className="flex gap-2 mt-3 justify-center">
            <input
              type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm w-32 text-center"
            />
            <button onClick={handleSaveNickname} className="px-3 h-9 bg-indigo-600 text-white rounded-xl text-sm">保存</button>
            <button onClick={() => setNicknameEditing(false)} className="px-3 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm">取消</button>
          </div>
        ) : (
          <div className="mt-2">
            <div className="font-semibold text-lg">{user?.nickname || user?.username}</div>
            <div className="text-sm text-gray-400">@{user?.username}</div>
            <button onClick={() => setNicknameEditing(true)} className="text-xs text-indigo-600 mt-1">修改昵称</button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Allergy settings */}
        <button
          onClick={() => setShowAllergies(!showAllergies)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-850"
        >
          <div className="flex items-center gap-2">
            <span>🚫</span>
            <span className="text-sm">忌口设置</span>
            {prefs.allergies.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                {prefs.allergies.length}项
              </span>
            )}
          </div>
          <span className="text-gray-400 text-sm">{showAllergies ? '▼' : '▶'}</span>
        </button>
        {showAllergies && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {ALLERGEN_OPTIONS.map((item) => (
              <button
                key={item}
                onClick={() => toggleAllergy(item)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  prefs.allergies.includes(item)
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 border border-amber-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <a href="/orders" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-850 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span className="text-sm">我的订单</span>
          </div>
          <span className="text-gray-400 text-sm">▶</span>
        </a>

        <a href="/duty" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-850 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span className="text-sm">做饭轮值</span>
          </div>
          <span className="text-gray-400 text-sm">▶</span>
        </a>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full h-11 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 text-sm font-medium"
      >
        退出登录
      </button>
    </div>
  );
}
