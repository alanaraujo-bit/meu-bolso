"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FloatingHelp from "@/components/FloatingHelp";
import AdminRedirect from "@/components/AdminRedirect";

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

  // Se for admin e estiver em rota admin, renderiza apenas o children (sem navbar/help normais)
  if (isAdmin && isAdminRoute) {
    return <>{children}</>;
  }

  // Caso contrário, renderiza o layout normal
  return (
    <>
      <AdminRedirect />
      <Navbar />
      {children}
      <FloatingHelp />
    </>
  );
}
