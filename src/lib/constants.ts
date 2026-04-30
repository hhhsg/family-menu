// Permission definitions
export const ALL_PERMISSIONS = [
  'menu.view', 'menu.edit',
  'dish.view', 'dish.edit',
  'order.create', 'order.manage',
  'shopping.view', 'shopping.edit',
  'pantry.view', 'pantry.edit',
  'expenses.view', 'expenses.edit',
  'duty.view', 'duty.edit',
  'users.manage',
  'announcement.manage',
  'export.manage',
  'push.send',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

// Permission presets
export const PERMISSION_PRESETS: Record<string, Permission[]> = {
  'family-chef': ['menu.view', 'menu.edit', 'dish.view', 'dish.edit', 'order.create', 'order.manage', 'shopping.view', 'shopping.edit', 'pantry.view', 'pantry.edit'],
  shopper: ['menu.view', 'dish.view', 'order.create', 'shopping.view', 'shopping.edit', 'pantry.view', 'pantry.edit', 'expenses.view', 'expenses.edit'],
  member: ['menu.view', 'dish.view', 'order.create', 'shopping.view', 'pantry.view', 'expenses.view', 'duty.view'],
};

export const DISH_CATEGORIES = ['荤菜', '素菜', '汤', '主食', '饮品', '小吃', '其他'] as const;
export const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐'] as const;
export const ORDER_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export const URGENCY_LEVELS = ['low', 'medium', 'high'] as const;
export const EXPENSE_CATEGORIES = ['食材', '调料', '水果', '零食', '日用品', '其他'] as const;
export const PANTRY_CATEGORIES = ['蔬菜', '肉类', '调料', '干货', '乳制品', '其他'] as const;
export const SHOPPING_SOURCES = ['manual', 'auto'] as const;

// Common allergens / dietary restrictions
export const ALLERGEN_OPTIONS = [
  '辣', '酱油', '海鲜', '香菜', '葱', '蒜',
  '牛奶', '鸡蛋', '花生', '芝麻', '味精', '醋',
] as const;

// Quick order notes
export const QUICK_NOTES = ['少盐', '不要葱', '多辣', '少油', '不要香菜', '不要蒜'] as const;

// Category colors
export const CATEGORY_COLORS: Record<string, string> = {
  '荤菜': '#EF4444', '素菜': '#22C55E', '汤': '#F97316',
  '主食': '#EAB308', '饮品': '#3B82F6', '小吃': '#A855F7', '其他': '#6B7280',
};

// Avatar colors (soft palette)
export const AVATAR_COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#A3E635', '#34D399',
  '#22D3EE', '#60A5FA', '#818CF8', '#C084FC', '#F472B6',
];
