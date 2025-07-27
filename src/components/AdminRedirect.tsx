"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAdminEmail, getInitialRoute } from "@/lib/adminConfig";

export default function AdminRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Só executar quando a sessão estiver carregada
    if (status === "loading") return;

    // Se o usuário está logado
    if (session?.user?.email) {
      const userEmail = session.user.email;
      
      // Se é um admin
      if (isAdminEmail(userEmail)) {
        // Se está na página inicial ou dashboard, redirecionar para admin
        if (pathname === '/' || pathname === '/dashboard') {
          console.log('🛡️ Admin detectado, redirecionando para painel administrativo...');
          router.replace('/admin');
        }
      }
      // Se é usuário normal tentando acessar admin
      else if (pathname.startsWith('/admin')) {
        console.log('👤 Usuário normal detectado, redirecionando para dashboard...');
        router.replace('/dashboard');
      }
    }
  }, [session, status, pathname, router]);

  return null; // Este componente não renderiza nada
}
