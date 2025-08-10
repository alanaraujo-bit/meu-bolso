'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import CleanLoading from './CleanLoading';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { onboardingCompleto, loading } = useOnboarding();

  // Rotas que não precisam de onboarding
  const rotasLivres = [
    '/login',
    '/cadastro',
    '/onboarding',
    '/api'
  ];

  // Verificar se é uma rota livre
  const isRotaLivre = rotasLivres.some(rota => pathname.startsWith(rota));

  useEffect(() => {
    // NÃO FAZER NADA se estivermos na página de onboarding
    if (pathname === '/onboarding') {
      console.log('🛡️ OnboardingGuard: Na página de onboarding, não interferindo');
      return;
    }

    console.log('🛡️ OnboardingGuard: Estado atual:', {
      status,
      loading,
      onboardingCompleto,
      pathname,
      isRotaLivre
    });

    // Só executar se a sessão estiver carregada, não estiver em loading, e não for rota livre
    if (status === 'authenticated' && !loading && !isRotaLivre) {
      // Verificar o localStorage diretamente para maior confiabilidade
      const localStorageCompleto = localStorage.getItem('onboarding-completo') === 'true';
      
      console.log('🔍 OnboardingGuard: Verificação de redirecionamento:', {
        hookOnboardingCompleto: onboardingCompleto,
        localStorageCompleto,
        pathname,
        shouldRedirectToOnboarding: !localStorageCompleto && pathname !== '/onboarding',
        shouldRedirectToDashboard: localStorageCompleto && pathname === '/onboarding'
      });

      // Se não completou onboarding e não está na página de onboarding
      if (!localStorageCompleto && pathname !== '/onboarding') {
        console.log('🚀 OnboardingGuard: REDIRECIONANDO para onboarding');
        router.replace('/onboarding');
        return;
      }
    }
  }, [status, loading, onboardingCompleto, pathname, isRotaLivre, router]);

  // Mostrar loading enquanto verifica onboarding
  if (status === 'authenticated' && loading && !isRotaLivre) {
    return <CleanLoading text="Verificando configuração..." fullScreen />;
  }

  // Se não completou onboarding e não está em rota livre, não renderizar
  if (status === 'authenticated' && !loading && !onboardingCompleto && !isRotaLivre) {
    return <CleanLoading text="Redirecionando..." fullScreen />;
  }

  return <>{children}</>;
}
