import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-4">
      <Header title="管理后台" />
      <AdminSidebar />
      <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
