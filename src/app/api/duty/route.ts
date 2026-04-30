import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const weekStart = searchParams.get('week_start');

  let sql = `SELECT cd.*, u.username, u.nickname FROM cooking_duties cd
    JOIN users u ON u.id = cd.user_id WHERE 1=1`;
  const params: any[] = [];

  if (date) { sql += ' AND cd.date = ?'; params.push(date); }
  if (weekStart) {
    sql += ' AND cd.date >= ? AND cd.date <= date(?, "+6 days")';
    params.push(weekStart, weekStart);
  }

  sql += ' ORDER BY cd.date, CASE cd.meal_type WHEN "早餐" THEN 1 WHEN "午餐" THEN 2 WHEN "晚餐" THEN 3 ELSE 4 END';

  return successResponse(db.prepare(sql).all(...params));
}

export async function POST(request: Request) {
  const { error } = await checkPermission('duty.edit');
  if (error) return error;

  const body = await request.json();
  const { date, meal_type, user_id, notes } = body;

  if (!date || !meal_type || !user_id) {
    return errorResponse('日期、餐别和用户不能为空', 400);
  }

  // Upsert: replace existing assignment
  db.prepare('DELETE FROM cooking_duties WHERE date = ? AND meal_type = ?').run(date, meal_type);

  const result = db.prepare(
    'INSERT INTO cooking_duties (date, meal_type, user_id, notes) VALUES (?, ?, ?, ?)'
  ).run(date, meal_type, user_id, notes || null);

  return successResponse({ id: result.lastInsertRowid }, 201);
}
