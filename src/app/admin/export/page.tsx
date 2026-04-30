'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminExportPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (table: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/csv?table=${table}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('导出成功');
      } else {
        const d = await res.json();
        toast.error(d.message || '导出失败');
      }
    } catch {
      toast.error('导出失败');
    }
    setExporting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">数据导入导出</h2>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-medium mb-3">CSV 导出</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleExport('dishes')}
            disabled={exporting}
            className="w-full flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            🍳 导出菜品列表
          </button>
          <button
            onClick={() => handleExport('orders')}
            disabled={exporting}
            className="w-full flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            📝 导出订单记录
          </button>
          <button
            onClick={() => handleExport('expenses')}
            disabled={exporting}
            className="w-full flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            💰 导出费用记录
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-medium mb-2">数据库备份说明</h3>
        <p className="text-sm text-gray-500">
          SQLite 数据库文件位于服务器上的 <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">/app/data/family-menu.db</code>。
          可以通过 Docker 命令手动备份：
        </p>
        <pre className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs overflow-x-auto">
{`# 备份数据库
docker compose exec family-menu cp /app/data/family-menu.db /app/data/backups/$(date +%Y%m%d).db

# 恢复数据库
docker compose exec family-menu cp /app/data/backups/20260430.db /app/data/family-menu.db`}
        </pre>
      </div>
    </div>
  );
}
