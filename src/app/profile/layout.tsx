import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <Header title="个人中心" />
      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
