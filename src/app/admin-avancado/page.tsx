'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CleanLoading from '@/components/CleanLoading';
import DashboardAvancado from '@/components/admin/DashboardAvancado';
import AdminNavigation from '@/components/admin/AdminNavigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    // Verificar se é admin
    const adminEmails = ['alanvitoraraujo1a@outlook.com', 'admin@meubolso.com'];
    if (!adminEmails.includes(session.user.email)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <CleanLoading text="Verificando acesso..." fullScreen />;
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AdminNavigation />
        <DashboardAvancado />
      </div>
    </div>
  );
}
