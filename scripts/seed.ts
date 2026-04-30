import Database from 'better-sqlite3';
import { hash } from 'bcryptjs';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/db/schema';
import { ALL_PERMISSIONS } from '../src/lib/constants';

const DB_PATH = process.env.DATABASE_PATH || './data/family-menu.db';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'admin123';

async function seed() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  // Run migrations first
  console.log('Running migrations...');
  migrate(db, { migrationsFolder: './drizzle' });

  const { users, dishes, dishIngredients, announcements } = schema;

  // Check if admin exists
  const existing = sqlite.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    sqlite.close();
    return;
  }

  // Create admin
  const adminHash = await hash(ADMIN_PASSWORD, 10);
  sqlite.prepare(`
    INSERT INTO users (username, password_hash, nickname, avatar_color, role, permissions, is_active)
    VALUES (?, ?, ?, ?, 'admin', ?, 1)
  `).run('admin', adminHash, '管理员', '#818CF8', JSON.stringify(ALL_PERMISSIONS));

  console.log('Created admin user (admin / admin123)');

  // Create sample users
  const memberHash = await hash('123456', 10);
  const memberPerms = JSON.stringify(['menu.view', 'dish.view', 'order.create', 'shopping.view', 'pantry.view', 'expenses.view', 'duty.view']);

  sqlite.prepare(`
    INSERT INTO users (username, password_hash, nickname, avatar_color, role, permissions, is_active)
    VALUES (?, ?, ?, ?, 'user', ?, 1)
  `).run('xiaoming', memberHash, '小明', '#F87171', memberPerms);

  sqlite.prepare(`
    INSERT INTO users (username, password_hash, nickname, avatar_color, role, permissions, is_active)
    VALUES (?, ?, ?, ?, 'user', ?, 1)
  `).run('xiaohong', memberHash, '小红', '#34D399', memberPerms);

  console.log('Created sample users (xiaoming / 123456, xiaohong / 123456)');

  // Create sample dishes
  const sampleDishes = [
    { name: '红烧排骨', category: '荤菜', cooking_time: 40, description: '经典家常红烧排骨，肉质酥烂' },
    { name: '清炒时蔬', category: '素菜', cooking_time: 15, description: '当季新鲜时蔬，清淡健康' },
    { name: '番茄蛋汤', category: '汤', cooking_time: 20, description: '酸甜可口，营养丰富' },
    { name: '小米粥', category: '主食', cooking_time: 30, description: '养胃小米粥，搭配小菜更佳' },
    { name: '酸梅汤', category: '饮品', cooking_time: 10, description: '冰镇酸梅汤，消暑解渴' },
    { name: '春卷', category: '小吃', cooking_time: 25, description: '外酥里嫩，馅料丰富' },
    { name: '清蒸鲈鱼', category: '荤菜', cooking_time: 25, description: '鲜嫩清蒸，保留原味' },
    { name: '麻婆豆腐', category: '素菜', cooking_time: 20, description: '麻辣鲜香，下饭利器' },
    { name: '蛋炒饭', category: '主食', cooking_time: 10, description: '简单快手的家常蛋炒饭' },
    { name: '凉拌黄瓜', category: '小吃', cooking_time: 10, description: '清脆爽口，开胃小菜' },
  ];

  const insertDish = sqlite.prepare(
    'INSERT INTO dishes (name, category, cooking_time, description) VALUES (?, ?, ?, ?)'
  );

  for (const dish of sampleDishes) {
    insertDish.run(dish.name, dish.category, dish.cooking_time, dish.description);
  }

  console.log('Created 10 sample dishes');

  // Create sample ingredients for each dish
  const ingredients: Record<string, [string, number, string][]> = {
    '红烧排骨': [['排骨', 500, '克'], ['生抽', 15, '毫升'], ['料酒', 10, '毫升'], ['冰糖', 20, '克'], ['八角', 2, '个'], ['桂皮', 1, '块']],
    '清炒时蔬': [['青菜', 300, '克'], ['蒜', 2, '瓣'], ['盐', 3, '克']],
    '番茄蛋汤': [['番茄', 2, '个'], ['鸡蛋', 2, '个'], ['盐', 3, '克'], ['葱', 1, '根']],
    '小米粥': [['小米', 100, '克'], ['水', 800, '毫升']],
    '酸梅汤': [['酸梅', 50, '克'], ['冰糖', 30, '克'], ['水', 1000, '毫升']],
    '春卷': [['春卷皮', 10, '张'], ['猪肉末', 200, '克'], ['白菜', 150, '克'], ['香菇', 3, '朵']],
    '清蒸鲈鱼': [['鲈鱼', 1, '条'], ['姜', 3, '片'], ['葱', 2, '根'], ['蒸鱼豉油', 20, '毫升']],
    '麻婆豆腐': [['豆腐', 1, '盒'], ['猪肉末', 100, '克'], ['豆瓣酱', 15, '克'], ['花椒', 5, '克'], ['酱油', 10, '毫升']],
    '蛋炒饭': [['米饭', 300, '克'], ['鸡蛋', 2, '个'], ['葱', 1, '根'], ['盐', 3, '克']],
    '凉拌黄瓜': [['黄瓜', 2, '根'], ['蒜', 3, '瓣'], ['醋', 10, '毫升'], ['香油', 5, '毫升'], ['盐', 3, '克']],
  };

  const dishes_map = sqlite.prepare('SELECT id, name FROM dishes').all() as { id: number; name: string }[];

  const insertIngredient = sqlite.prepare(
    'INSERT INTO dish_ingredients (dish_id, ingredient_name, amount, unit) VALUES (?, ?, ?, ?)'
  );

  for (const d of dishes_map) {
    const ings = ingredients[d.name];
    if (ings) {
      for (const [name, amount, unit] of ings) {
        insertIngredient.run(d.id, name, amount, unit);
      }
    }
  }

  console.log('Created dish ingredients');

  // Create a welcome announcement
  sqlite.prepare('INSERT INTO announcements (content, is_active) VALUES (?, 1)').run('欢迎使用家庭菜单！点击各菜品可以查看配料和点菜~');

  console.log('Seed complete!');
  sqlite.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
