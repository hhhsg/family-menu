import { db } from '@/db';
import { checkAuth, successResponse } from '@/lib/auth-guard';

export async function PATCH(request: Request) {
  const { error, session } = await checkAuth();
  if (error) return error;

  const userId = parseInt((session!.user as any).id);
  const body = await request.json();
  const { nickname, preferences } = body;

  if (nickname !== undefined) {
    db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, userId);
  }
  if (preferences !== undefined) {
    db.prepare('UPDATE users SET preferences = ? WHERE id = ?').run(JSON.stringify(preferences), userId);
  }

  return successResponse({ id: userId });
}
