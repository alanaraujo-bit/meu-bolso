'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MoneyLoading from '@/components/MoneyLoading';
import { getInitialRoute } from '@/lib/adminConfig';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.email) {
      // Usar a função que determina a rota inicial baseada no tipo de usuário
      const initialRoute = getInitialRoute(session.user.email);
      console.log(`🔄 Redirecionando para: ${initialRoute}`);
      router.push(initialRoute);
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <MoneyLoading text="Redirecionando..." />
    </div>
  );
}