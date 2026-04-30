import { db } from '@/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ingredients = db.prepare(
    'SELECT * FROM dish_ingredients WHERE dish_id = ?'
  ).all(parseInt(id));

  return Response.json({ success: true, data: ingredients });
}
