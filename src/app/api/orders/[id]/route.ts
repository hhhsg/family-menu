import { db } from '@/db';
import { checkAuth, checkPermission, successResponse, errorResponse, getUserId } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await checkAuth();
  if (error) return error;

  const { id } = await context.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(id)) as any;
  if (!order) return errorResponse('订单不存在', 404);

  const userId = getUserId(session!);
  const perms = (session!.user as any).permissions as string[];
  const isOwner = order.user_id === userId;
  const isManager = perms?.includes('order.manage');

  // cancel: owner or manager; confirm: manager only
  const body = await request.json();
  const { status } = body;

  if (!status || !['confirmed', 'cancelled'].includes(status)) {
    return errorResponse('状态无效', 400);
  }

  if (status === 'confirmed' && !isManager) {
    return errorResponse('只有管理员可以确认订单', 403);
  }
  if (status === 'cancelled' && !isOwner && !isManager) {
    return errorResponse('无权取消此订单', 403);
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, parseInt(id));
  return successResponse({ id: parseInt(id), status });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await checkAuth();
  if (error) return error;

  const { id } = await context.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(id)) as any;
  if (!order) return errorResponse('订单不存在', 404);

  const userId = getUserId(session!);
  const perms = (session!.user as any).permissions as string[];
  if (order.user_id !== userId && !perms?.includes('order.manage')) {
    return errorResponse('无权删除此订单', 403);
  }

  db.prepare('DELETE FROM orders WHERE id = ?').run(parseInt(id));
  return successResponse(null);
}
