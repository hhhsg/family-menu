import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse } from '@/lib/auth-guard';

export async function GET() {
  const { error } = await checkAuth();
  if (error) return error;

  const announcements = db.prepare(
    'SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5'
  ).all();

  return successResponse(announcements);
}

export async function POST(request: Request) {
  const { error } = await checkPermission('announcement.manage');
  if (error) return error;

  const body = await request.json();
  const { content } = body;

  if (!content) return errorResponse('内容不能为空', 400);

  const result = db.prepare(
    'INSERT INTO announcements (content) VALUES (?)'
  ).run(content);

  return successResponse({ id: result.lastInsertRowid }, 201);
}
