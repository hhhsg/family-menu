import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('duty.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM cooking_duties WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
