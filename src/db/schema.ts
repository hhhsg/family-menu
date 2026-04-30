import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── USERS ───────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  nickname: text('nickname'),
  avatar_color: text('avatar_color').notNull().default('#60A5FA'),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  permissions: text('permissions'), // JSON array of Permission strings
  preferences: text('preferences'), // JSON: { allergies: string[], favorite_dishes: number[] }
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── DISHES ──────────────────────────────────────────────
export const dishes = sqliteTable('dishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull().default('其他'),
  cooking_time: integer('cooking_time'),
  image_url: text('image_url'),
  is_available: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── DISH INGREDIENTS ────────────────────────────────────
export const dishIngredients = sqliteTable('dish_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dish_id: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
  ingredient_name: text('ingredient_name').notNull(),
  amount: real('amount'),
  unit: text('unit'),
});

// ─── DISH RATINGS ────────────────────────────────────────
export const dishRatings = sqliteTable('dish_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  dish_id: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  userDishUnique: uniqueIndex('idx_dish_ratings_user_dish').on(table.user_id, table.dish_id),
}));

// ─── MENUS ───────────────────────────────────────────────
export const menus = sqliteTable('menus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD
  meal_type: text('meal_type').notNull(), // 早餐/午餐/晚餐/加餐
  label: text('label'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  dateMealUnique: uniqueIndex('idx_menus_date_meal').on(table.date, table.meal_type),
}));

// ─── MENU DISHES ─────────────────────────────────────────
export const menuDishes = sqliteTable('menu_dishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menu_id: integer('menu_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
  dish_id: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
});

// ─── MENU TEMPLATES ──────────────────────────────────────
export const menuTemplates = sqliteTable('menu_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  meal_type: text('meal_type').notNull(),
  dish_ids: text('dish_ids').notNull(), // JSON array
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── ORDERS ──────────────────────────────────────────────
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  menu_id: integer('menu_id').notNull().references(() => menus.id),
  dish_id: integer('dish_id').notNull().references(() => dishes.id),
  quantity: integer('quantity').notNull().default(1),
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // pending/confirmed/cancelled
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  userMenuDishUnique: uniqueIndex('idx_orders_user_menu_dish').on(table.user_id, table.menu_id, table.dish_id),
}));

// ─── SHOPPING ITEMS ──────────────────────────────────────
export const shoppingItems = sqliteTable('shopping_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  item_name: text('item_name').notNull(),
  quantity: real('quantity').default(1),
  unit: text('unit'),
  urgency_level: text('urgency_level').notNull().default('medium'),
  is_purchased: integer('is_purchased', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('manual'), // manual / auto
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── PANTRY ITEMS ────────────────────────────────────────
export const pantryItems = sqliteTable('pantry_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  item_name: text('item_name').notNull(),
  category: text('category').notNull().default('其他'),
  quantity: real('quantity').default(0),
  unit: text('unit'),
  min_quantity: real('min_quantity').default(0),
  expiry_date: text('expiry_date'), // YYYY-MM-DD
  location: text('location'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updated_at: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── EXPENSES ────────────────────────────────────────────
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('食材'),
  paid_by: integer('paid_by').references(() => users.id),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── COOKING DUTIES ──────────────────────────────────────
export const cookingDuties = sqliteTable('cooking_duties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  meal_type: text('meal_type').notNull(),
  user_id: integer('user_id').notNull().references(() => users.id),
  notes: text('notes'),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  dateMealUnique: uniqueIndex('idx_duties_date_meal').on(table.date, table.meal_type),
}));

// ─── ANNOUNCEMENTS ───────────────────────────────────────
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── PUSH SUBSCRIPTIONS ──────────────────────────────────
export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});
