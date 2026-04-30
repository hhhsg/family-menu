import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('expenses.edit');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { date, amount, description, category, paid_by } = body;

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(parseInt(id));
  if (!expense) return errorResponse('记录不存在', 404);

  db.prepare(`
    UPDATE expenses SET
      date = COALESCE(?, date),
      amount = COALESCE(?, amount),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      paid_by = COALESCE(?, paid_by)
    WHERE id = ?
  `).run(date || null, amount ?? null, description || null, category || null, paid_by ?? null, parseInt(id));

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('expenses.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM expenses WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
