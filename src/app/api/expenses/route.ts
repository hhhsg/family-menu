import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse, getUserId } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  const category = searchParams.get('category');

  let sql = `SELECT e.*, u.username, u.nickname FROM expenses e
    LEFT JOIN users u ON u.id = e.paid_by WHERE 1=1`;
  const params: any[] = [];

  if (month) { sql += " AND strftime('%Y-%m', e.date) = ?"; params.push(month); }
  if (category) { sql += ' AND e.category = ?'; params.push(category); }

  sql += ' ORDER BY e.date DESC, e.created_at DESC LIMIT 100';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error, session } = await checkPermission('expenses.edit');
  if (error) return error;

  const userId = getUserId(session!);
  const body = await request.json();
  const { date, amount, description, category, paid_by } = body;

  if (!date || !amount || !description) {
    return errorResponse('日期、金额和描述不能为空', 400);
  }

  const result = db.prepare(
    'INSERT INTO expenses (date, amount, description, category, paid_by) VALUES (?, ?, ?, ?, ?)'
  ).run(date, amount, description, category || '食材', paid_by || userId);

  return successResponse({ id: result.lastInsertRowid }, 201);
}
