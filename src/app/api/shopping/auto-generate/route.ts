import { db } from '@/db';
import { checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const { error } = await checkPermission('shopping.edit');
  if (error) return error;

  const body = await request.json();
  const { date } = body;

  // If no date provided, use today
  const targetDate = date || new Date().toISOString().slice(0, 10);

  // Get all confirmed orders for the date, join through menus->menu_dishes->dish_ingredients
  const ingredients = db.prepare(`
    SELECT di.ingredient_name, SUM(di.amount * o.quantity) as total_amount, di.unit, o.status
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    JOIN menu_dishes md ON md.menu_id = m.id
    JOIN dish_ingredients di ON di.dish_id = o.dish_id
    WHERE m.date = ? AND o.status = 'confirmed'
    GROUP BY di.ingredient_name, di.unit
  `).all(targetDate) as any[];

  if (ingredients.length === 0) {
    return errorResponse('没有已确认的订单可用于汇总', 400);
  }

  // Compare with pantry stock
  const results: any[] = [];
  for (const ing of ingredients) {
    const pantryItem = db.prepare(
      'SELECT * FROM pantry_items WHERE item_name = ?'
    ).get(ing.ingredient_name) as any;

    const needed = ing.total_amount || 1;
    const inStock = pantryItem?.quantity || 0;
    const toBuy = Math.max(0, needed - inStock);

    // Insert into shopping list if needed
    if (toBuy > 0) {
      const existing = db.prepare(
        'SELECT id FROM shopping_items WHERE item_name = ? AND is_purchased = 0 AND source = ?'
      ).get(ing.ingredient_name, 'auto') as any;

      if (existing) {
        db.prepare('UPDATE shopping_items SET quantity = ? WHERE id = ?').run(toBuy, existing.id);
        results.push({ item_name: ing.ingredient_name, quantity: toBuy, unit: ing.unit, updated: true });
      } else {
        db.prepare(
          'INSERT INTO shopping_items (item_name, quantity, unit, source, urgency_level) VALUES (?, ?, ?, ?, ?)'
        ).run(ing.ingredient_name, toBuy, ing.unit, 'auto', 'medium');
        results.push({ item_name: ing.ingredient_name, quantity: toBuy, unit: ing.unit, created: true });
      }
    } else {
      results.push({ item_name: ing.ingredient_name, quantity: needed, unit: ing.unit, sufficient: true });
    }
  }

  return successResponse({
    date: targetDate,
    items: results,
    total_items: results.length,
    to_buy: results.filter((r: any) => !r.sufficient).length,
    sufficient: results.filter((r: any) => r.sufficient).length,
  });
}
