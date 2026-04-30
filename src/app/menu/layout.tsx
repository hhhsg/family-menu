import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="家庭菜单" />
      <main className="pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
