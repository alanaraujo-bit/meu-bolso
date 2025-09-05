'use client';

import { useState, useEffect } from 'react';
import { informacoesTimezone } from '@/lib/timezoneConfig';

interface TimezoneInfo {
  timestamp: string;
  brasilHora: string;
  utcHora: string;
  localHora: string;
  offset: number;
  timezone: string;
  processTimezone?: string;
}

export default function TimezoneIndicator() {
  const [info, setInfo] = useState<TimezoneInfo | null>(null);
  const [horaAtual, setHoraAtual] = useState<string>('');

  useEffect(() => {
    // Atualizar informações de timezone
    const atualizarInfo = () => {
      try {
        const timezoneInfo = informacoesTimezone();
        setInfo(timezoneInfo);
        
        // Atualizar hora atual em tempo real
        const agora = new Date();
        setHoraAtual(agora.toLocaleString('pt-BR', { 
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      } catch (error) {
        console.error('Erro ao obter informações de timezone:', error);
      }
    };

    // Atualizar imediatamente
    atualizarInfo();

    // Atualizar a cada segundo
    const interval = setInterval(atualizarInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!info) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🇧🇷</span>
        <span className="font-medium text-green-600 dark:text-green-400">
          Timezone Brasil
        </span>
      </div>
      
      <div className="space-y-1 text-gray-600 dark:text-gray-400">
        <div className="flex justify-between gap-4">
          <span>Hora atual:</span>
          <span className="font-mono text-green-600 dark:text-green-400">
            {horaAtual}
          </span>
        </div>
        
        <div className="flex justify-between gap-4">
          <span>Timezone:</span>
          <span className="font-mono">
            {info.timezone}
          </span>
        </div>
        
        <div className="flex justify-between gap-4">
          <span>Offset UTC:</span>
          <span className="font-mono">
            {info.offset > 0 ? '-' : '+'}
            {Math.abs(info.offset / 60)}h
          </span>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
            Debug Info
          </summary>
          <div className="mt-1 space-y-1 text-gray-500">
            <div>UTC: {info.utcHora}</div>
            <div>Local: {info.localHora}</div>
            <div>Process TZ: {info.processTimezone || 'não definido'}</div>
          </div>
        </details>
      )}
    </div>
  );
}
