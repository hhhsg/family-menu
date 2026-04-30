import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function DutyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <Header title="做饭轮值" />
      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
