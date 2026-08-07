import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AuthGate } from '@/components/admin/AuthGate';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AuthGate>{children}</AuthGate>
      </div>
    </div>
  );
}
