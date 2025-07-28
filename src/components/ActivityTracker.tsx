"use client";

import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useSession } from 'next-auth/react';

export default function ActivityTracker() {
  const { data: session } = useSession();
  
  // O hook automaticamente gerencia o tracking de atividade
  useActivityTracker();

  // Este componente não renderiza nada, apenas executa o tracking
  return null;
}
