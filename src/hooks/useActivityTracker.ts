"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function useActivityTracker() {
  const { data: session } = useSession();
  const lastActivityRef = useRef(Date.now());
  const isAwayRef = useRef(false);

  const trackActivity = async (acao: 'login' | 'activity' | 'away' | 'logout') => {
    if (!session?.user?.email) return;

    try {
      await fetch('/api/user/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao,
          dispositivo: getDeviceInfo(),
          ip: await getUserIP(),
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  };

  const handleActivity = () => {
    const now = Date.now();
    
    // Se estava ausente e agora está ativo
    if (isAwayRef.current) {
      isAwayRef.current = false;
      trackActivity('activity');
    }
    
    lastActivityRef.current = now;
  };

  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Se inativo por mais de 5 minutos, marcar como ausente
    if (timeSinceLastActivity > 5 * 60 * 1000 && !isAwayRef.current) {
      isAwayRef.current = true;
      trackActivity('away');
    }
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    // Registrar login inicial
    trackActivity('login');

    // Eventos que indicam atividade
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle para evitar muitas chamadas
    let throttleTimer: NodeJS.Timeout | null = null;
    
    const throttledHandleActivity = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        handleActivity();
        throttleTimer = null;
      }, 10000); // 10 segundos
    };

    // Adicionar listeners de atividade
    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    // Verificar inatividade a cada minuto
    const inactivityInterval = setInterval(checkInactivity, 60000);

    // Registrar logout ao fechar a página
    const handleBeforeUnload = () => {
      // Usar sendBeacon para garantir que a requisição seja enviada
      navigator.sendBeacon('/api/user/activity', JSON.stringify({
        acao: 'logout'
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
      
      clearInterval(inactivityInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      
      // Registrar logout
      trackActivity('logout');
    };
  }, [session]);

  return { trackActivity };
}

function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (/Mobi|Android/i.test(userAgent)) {
    return 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return 'Tablet';
  }
  
  return 'Desktop';
}

async function getUserIP(): Promise<string | null> {
  try {
    // Em produção, você pode usar um serviço para obter o IP
    // Por enquanto, retornamos null
    return null;
  } catch {
    return null;
  }
}
