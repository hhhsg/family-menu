import { db } from '@/db';
import { checkPermission, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkPermission('export.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table'); // dishes | orders | expenses

  let data: any[] = [];
  let filename = 'export.csv';

  switch (table) {
    case 'dishes':
      data = db.prepare(`
        SELECT d.name, d.category, d.description, d.cooking_time,
          AVG(dr.rating) as avg_rating, COUNT(dr.id) as rating_count
        FROM dishes d LEFT JOIN dish_ratings dr ON dr.dish_id = d.id
        GROUP BY d.id ORDER BY d.category, d.name
      `).all();
      filename = '菜品列表.csv';
      break;
    case 'orders': {
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      data = db.prepare(`
        SELECT o.created_at as 下单时间, u.username as 用户名, u.nickname as 昵称,
          d.name as 菜名, m.date as 日期, m.meal_type as 餐别,
          o.quantity as 数量, o.status as 状态
        FROM orders o
        JOIN users u ON u.id = o.user_id
        JOIN dishes d ON d.id = o.dish_id
        JOIN menus m ON m.id = o.menu_id
        WHERE strftime('%Y-%m', m.date) = ?
        ORDER BY m.date DESC, o.created_at DESC
      `).all(month);
      filename = `订单记录_${month}.csv`;
      break;
    }
    case 'expenses': {
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      data = db.prepare(`
        SELECT e.date as 日期, e.description as 描述, e.amount as 金额,
          e.category as 分类, u.nickname as 付款人
        FROM expenses e LEFT JOIN users u ON u.id = e.paid_by
        WHERE strftime('%Y-%m', e.date) = ?
        ORDER BY e.date DESC
      `).all(month);
      filename = `费用记录_${month}.csv`;
      break;
    }
    default:
      return errorResponse('请指定表格: dishes, orders, expenses', 400);
  }

  if (data.length === 0) {
    return errorResponse('没有数据可导出', 404);
  }

  const headers = Object.keys(data[0]);
  const BOM = '﻿'; // UTF-8 BOM for Excel
  const csv = BOM + headers.join(',') + '\n' +
    data.map((row: any) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ).join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
