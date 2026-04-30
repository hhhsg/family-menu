import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const purchased = searchParams.get('purchased');

  let sql = 'SELECT * FROM shopping_items WHERE 1=1';
  const params: any[] = [];
  if (purchased === '0') { sql += ' AND is_purchased = 0'; }
  else if (purchased === '1') { sql += ' AND is_purchased = 1'; }

  sql += ' ORDER BY CASE urgency_level WHEN "high" THEN 1 WHEN "medium" THEN 2 ELSE 3 END, created_at DESC';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error } = await checkPermission('shopping.edit');
  if (error) return error;

  const body = await request.json();
  const { item_name, quantity, unit, urgency_level } = body;

  if (!item_name) return errorResponse('物品名不能为空', 400);

  const result = db.prepare(
    'INSERT INTO shopping_items (item_name, quantity, unit, urgency_level) VALUES (?, ?, ?, ?)'
  ).run(item_name, quantity || 1, unit || null, urgency_level || 'medium');

  return successResponse({ id: result.lastInsertRowid }, 201);
}
