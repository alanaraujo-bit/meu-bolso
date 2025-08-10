'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CleanLoading from '@/components/CleanLoading';
import { getInitialRouteWithConfig, isAdminEmail } from '@/lib/adminConfig';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (status === 'loading') return;
      
      if (session?.user?.email) {
        try {
          // Para administradores, usar redirecionamento direto
          if (isAdminEmail(session.user.email)) {
            console.log('🔄 Admin detectado, redirecionando para: /admin');
            router.push('/admin');
            return;
          }
          
          // Para usuários normais, buscar configuração de página inicial
          const response = await fetch('/api/usuario/configuracoes');
          if (response.ok) {
            const data = await response.json();
            const paginaInicial = data.configuracoes?.paginaInicial || 'dashboard';
            
            // Mapear página inicial para rota
            const rotaMap: { [key: string]: string } = {
              'dashboard': '/dashboard',
              'transacoes': '/transacoes',
              'categorias': '/categorias', 
              'metas': '/metas',
              'relatorios': '/dashboard' // Relatórios ainda não implementados, vai para dashboard
            };
            
            const rota = rotaMap[paginaInicial] || '/dashboard';
            console.log(`🔄 Redirecionando para página inicial configurada: ${rota} (${paginaInicial})`);
            router.push(rota);
          } else {
            console.log('🔄 Erro ao buscar configurações, redirecionando para dashboard padrão');
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Erro ao buscar configurações:', error);
          console.log('🔄 Erro, redirecionando para dashboard padrão');
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      
      setLoading(false);
    };

    handleRedirect();
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <CleanLoading text="Carregando..." fullScreen />
    </div>
  );
}
