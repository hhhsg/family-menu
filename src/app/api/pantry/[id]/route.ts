import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('pantry.edit');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { item_name, category, quantity, unit, min_quantity, expiry_date, location, notes } = body;

  const item = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(parseInt(id));
  if (!item) return errorResponse('食材不存在', 404);

  db.prepare(`
    UPDATE pantry_items SET
      item_name = COALESCE(?, item_name),
      category = COALESCE(?, category),
      quantity = COALESCE(?, quantity),
      unit = COALESCE(?, unit),
      min_quantity = COALESCE(?, min_quantity),
      expiry_date = COALESCE(?, expiry_date),
      location = COALESCE(?, location),
      notes = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    item_name || null, category || null, quantity ?? null, unit !== undefined ? unit : null,
    min_quantity ?? null, expiry_date !== undefined ? expiry_date : null,
    location !== undefined ? location : null, notes !== undefined ? notes : null,
    parseInt(id)
  );

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('pantry.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM pantry_items WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
