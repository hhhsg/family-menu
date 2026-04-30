'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ALL_PERMISSIONS, PERMISSION_PRESETS } from '@/lib/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({ username: '', password: '', nickname: '' });

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('用户已创建');
      setShowCreate(false);
      setForm({ username: '', password: '', nickname: '' });
      fetchUsers();
    } else {
      const d = await res.json();
      toast.error(d.message || '创建失败');
    }
  };

  const handleUpdateUser = async (userId: number, updates: any) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      toast.success('已更新');
      fetchUsers();
    }
  };

  const handleResetPassword = async (userId: number) => {
    const pw = prompt('输入新密码（至少4位）：');
    if (!pw || pw.length < 4) return;
    const res = await fetch(`/api/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) toast.success('密码已重置');
  };

  const handleToggleActive = (user: any) => {
    handleUpdateUser(user.id, { is_active: !user.is_active });
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`确定永久删除用户「${user.nickname || user.username}」吗？此操作不可撤销。`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('已删除'); fetchUsers(); }
    else { const d = await res.json(); toast.error(d.message || '删除失败'); }
  };

  const applyPreset = (user: any, presetName: string) => {
    const perms = PERMISSION_PRESETS[presetName] || [];
    handleUpdateUser(user.id, { permissions: perms });
    setEditingUser({ ...editingUser, permissions: perms });
  };

  const togglePermission = (perm: string) => {
    if (!editingUser) return;
    const perms = editingUser.permissions || [];
    const updated = perms.includes(perm) ? perms.filter((p: string) => p !== perm) : [...perms, perm];
    setEditingUser({ ...editingUser, permissions: updated });
  };

  const savePermissions = () => {
    if (!editingUser) return;
    handleUpdateUser(editingUser.id, { permissions: editingUser.permissions });
    setEditingUser(null);
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
        <h2 className="text-lg font-semibold">用户管理</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 h-9 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          + 添加用户
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="用户名" required />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="密码" required minLength={4} />
          <input type="text" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            placeholder="昵称（可选）" />
          <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium">创建用户</button>
        </form>
      )}

      {/* User list */}
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: user.avatar_color }}>
                  {(user.nickname || user.username)[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.nickname || user.username}</span>
                    {user.role === 'admin' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">管理员</span>}
                    {!user.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">已禁用</span>}
                  </div>
                  <div className="text-xs text-gray-400">@{user.username}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {user.role !== 'admin' && (
                  <>
                    <button onClick={() => setEditingUser(user)} className="px-3 h-7 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg">权限</button>
                    <button onClick={() => handleResetPassword(user.id)} className="px-3 h-7 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg">重置</button>
                    <button onClick={() => handleToggleActive(user)} className={`px-3 h-7 text-xs rounded-lg ${user.is_active ? 'bg-red-50 dark:bg-red-950 text-red-600' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'}`}>
                      {user.is_active ? '禁用' : '启用'}
                    </button>
                    <button onClick={() => handleDelete(user)} className="px-3 h-7 text-xs bg-red-500 text-white rounded-lg">
                      删除
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Permission editor */}
            {editingUser?.id === user.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {Object.entries(PERMISSION_PRESETS).map(([key, _]) => (
                    <button key={key} onClick={() => applyPreset(user, key)}
                      className="px-2 py-1 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                      {key === 'family-chef' ? '🧑‍🍳厨师' : key === 'shopper' ? '🛒采购员' : key === 'member' ? '👤成员' : key}
                    </button>
                  ))}
                  <button onClick={() => setEditingUser({ ...editingUser, permissions: [] })}
                    className="px-2 py-1 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800">清空</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] cursor-pointer ${
                      (editingUser.permissions || []).includes(perm)
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <input type="checkbox" checked={(editingUser.permissions || []).includes(perm)}
                        onChange={() => togglePermission(perm)} className="sr-only" />
                      {perm}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={savePermissions} className="px-4 h-8 text-xs bg-indigo-600 text-white rounded-lg">保存权限</button>
                  <button onClick={() => setEditingUser(null)} className="px-4 h-8 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg">取消</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
