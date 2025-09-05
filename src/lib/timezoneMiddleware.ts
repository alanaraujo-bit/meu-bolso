// Middleware para configuração precisa de timezone
// Garante que todas as requisições usem o timezone brasileiro

import { NextRequest, NextResponse } from 'next/server';

export function timezoneMiddleware(request: NextRequest) {
  // Configurar timezone no processo
  if (typeof process !== 'undefined' && process.env) {
    process.env.TZ = 'America/Sao_Paulo';
    process.env.TIMEZONE = 'America/Sao_Paulo';
  }
  
  // Criar resposta com headers de timezone
  const response = NextResponse.next();
  
  // Adicionar headers de timezone
  response.headers.set('X-Timezone', 'America/Sao_Paulo');
  response.headers.set('X-Timezone-Offset', '-180'); // UTC-3 em minutos
  response.headers.set('X-Local-Time', new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo' 
  }));
  
  // Log para debug (remover em produção se necessário)
  if (process.env.NODE_ENV === 'development') {
    console.log('🇧🇷 Timezone Middleware - Horário Brasil:', 
      new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    );
  }
  
  return response;
}

export default timezoneMiddleware;
