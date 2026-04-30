import { db } from '@/db';
import { checkAuth, successResponse } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const { error } = await checkAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM

  const targetMonth = month || new Date().toISOString().slice(0, 7);

  // Monthly total
  const total = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%Y-%m', date) = ?"
  ).get(targetMonth) as any;

  // By category
  const byCategory = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM expenses WHERE strftime('%Y-%m', date) = ?
    GROUP BY category ORDER BY total DESC
  `).all(targetMonth) as any[];

  // By person
  const byPerson = db.prepare(`
    SELECT u.username, u.nickname, SUM(e.amount) as total, COUNT(*) as count
    FROM expenses e
    LEFT JOIN users u ON u.id = e.paid_by
    WHERE strftime('%Y-%m', e.date) = ?
    GROUP BY e.paid_by ORDER BY total DESC
  `).all(targetMonth) as any[];

  // Previous month total for comparison
  const [year, mon] = targetMonth.split('-');
  const prevMonth = mon === '01'
    ? `${parseInt(year) - 1}-12`
    : `${year}-${String(parseInt(mon) - 1).padStart(2, '0')}`;

  const prevTotal = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%Y-%m', date) = ?"
  ).get(prevMonth) as any;

  return successResponse({
    month: targetMonth,
    total: total.total || 0,
    prev_total: prevTotal.total || 0,
    change_pct: prevTotal.total ? Math.round(((total.total - prevTotal.total) / prevTotal.total) * 100) : null,
    by_category: byCategory,
    by_person: byPerson,
  });
}
