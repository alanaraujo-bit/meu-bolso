"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FloatingHelp from "@/components/FloatingHelp";
import AdminRedirect from "@/components/AdminRedirect";
import ActivityTracker from "@/components/ActivityTracker";
import OnboardingGuard from "@/components/OnboardingGuard";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Durante a hidratação, renderiza apenas o children para evitar flash
  if (!isClient) {
    return <>{children}</>;
  }

  // Verifica se é admin (email específico)
  const isAdmin = session?.user?.email === "alanvitoraraujo1a@outlook.com";
  
  // Verifica se está em rota admin
  const isAdminRoute = pathname?.startsWith("/admin");
  
  // Lista de rotas que não devem usar OnboardingGuard
  const rotasSemGuard = ['/login', '/cadastro', '/api'];
  const rotaSemGuard = rotasSemGuard.some(rota => pathname?.startsWith(rota));
  
  // Lista de rotas que não devem mostrar navbar
  const rotasSemNavbar = ['/login', '/cadastro', '/api', '/onboarding'];
  const rotaSemNavbar = rotasSemNavbar.some(rota => pathname?.startsWith(rota));

  // Se for admin e estiver em rota admin, renderiza apenas o children (sem navbar/help normais)
  if (isAdmin && isAdminRoute) {
    return (
      <>
        <ActivityTracker />
        {children}
      </>
    );
  }

  // Se for rota sem guard (login, cadastro), renderizar sem OnboardingGuard
  if (rotaSemGuard) {
    return (
      <>
        <AdminRedirect />
        <ActivityTracker />
        {children}
      </>
    );
  }

  // Se for rota sem navbar (incluindo onboarding), renderizar sem navbar mas com OnboardingGuard
  if (rotaSemNavbar) {
    return (
      <>
        <AdminRedirect />
        <ActivityTracker />
        <OnboardingGuard>
          {children}
        </OnboardingGuard>
      </>
    );
  }

  // Caso contrário, renderiza o layout normal com OnboardingGuard
  return (
    <>
      <AdminRedirect />
      <ActivityTracker />
      <OnboardingGuard>
        <Navbar />
        {children}
        <FloatingHelp />
      </OnboardingGuard>
    </>
  );
}
