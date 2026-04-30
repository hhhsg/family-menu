'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('请输入用户名和密码');
      return;
    }
    setLoading(true);
    const result = await signIn('credentials', {
      username: username.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error('用户名或密码错误');
    } else {
      toast.success('登录成功');
      router.push('/menu');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🍽️</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">家庭菜单</h1>
        <p className="text-sm text-gray-500 mt-1">登录后开始点菜</p>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          用户名
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="请输入用户名"
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="请输入密码"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-xl transition-all text-base"
      >
        {loading ? '登录中...' : '登 录'}
      </button>
    </form>
  );
}
