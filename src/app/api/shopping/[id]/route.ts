import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('shopping.edit');
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { item_name, quantity, unit, urgency_level, is_purchased } = body;

  const item = db.prepare('SELECT * FROM shopping_items WHERE id = ?').get(parseInt(id));
  if (!item) return errorResponse('购物项不存在', 404);

  db.prepare(`
    UPDATE shopping_items SET
      item_name = COALESCE(?, item_name),
      quantity = COALESCE(?, quantity),
      unit = COALESCE(?, unit),
      urgency_level = COALESCE(?, urgency_level),
      is_purchased = COALESCE(?, is_purchased)
    WHERE id = ?
  `).run(
    item_name || null, quantity ?? null, unit !== undefined ? unit : null,
    urgency_level || null, is_purchased !== undefined ? (is_purchased ? 1 : 0) : null,
    parseInt(id)
  );

  return successResponse({ id: parseInt(id) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await checkPermission('shopping.edit');
  if (error) return error;

  const { id } = await context.params;
  db.prepare('DELETE FROM shopping_items WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
