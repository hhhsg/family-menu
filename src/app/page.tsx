import { getSession } from '@/auth/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (session?.user) {
    redirect('/menu');
  } else {
    redirect('/login');
  }
}
