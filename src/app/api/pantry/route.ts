import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const warning = searchParams.get('warning'); // 'expiring' | 'low' | 'all'

  let sql = 'SELECT * FROM pantry_items WHERE 1=1';
  const params: any[] = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (warning === 'expiring') {
    // Items expiring within 3 days
    sql += " AND expiry_date IS NOT NULL AND expiry_date <= date('now', '+3 days')";
  } else if (warning === 'low') {
    sql += ' AND quantity <= min_quantity AND min_quantity > 0';
  }

  sql += ' ORDER BY category, item_name';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error } = await checkPermission('pantry.edit');
  if (error) return error;

  const body = await request.json();
  const { item_name, category, quantity, unit, min_quantity, expiry_date, location, notes } = body;

  if (!item_name) return errorResponse('食材名不能为空', 400);

  const result = db.prepare(`
    INSERT INTO pantry_items (item_name, category, quantity, unit, min_quantity, expiry_date, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(item_name, category || '其他', quantity || 0, unit || null,
    min_quantity || 0, expiry_date || null, location || null, notes || null);

  return successResponse({ id: result.lastInsertRowid }, 201);
}
