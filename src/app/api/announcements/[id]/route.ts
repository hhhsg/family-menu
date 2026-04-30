import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('announcement.manage');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { content, is_active } = body;

  db.prepare(`
    UPDATE announcements SET
      content = COALESCE(?, content),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(content || null, is_active !== undefined ? (is_active ? 1 : 0) : null, parseInt(id));

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('announcement.manage');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM announcements WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
