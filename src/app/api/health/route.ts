import { db } from '@/db';

export async function GET() {
  try {
    db.prepare('SELECT 1').get();
    return Response.json({ status: 'ok', db: 'connected' });
  } catch {
    return Response.json({ status: 'error', db: 'disconnected' }, { status: 500 });
  }
}
