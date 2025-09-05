// Configuração global de timezone para garantir precisão absoluta
// Este arquivo deve ser importado no início da aplicação

/**
 * Configura o timezone para America/Sao_Paulo em todo o ambiente
 */
export function configurarTimezoneBrasil() {
  // Configurar timezone no Node.js
  if (typeof process !== 'undefined' && process.env) {
    process.env.TZ = 'America/Sao_Paulo';
    process.env.TIMEZONE = 'America/Sao_Paulo';
  }
  
  // Verificar se a configuração foi aplicada
  const agora = new Date();
  console.log('🇧🇷 Timezone configurado:', {
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A',
    dataAtual: agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    offset: agora.getTimezoneOffset(),
    timestamp: agora.toISOString()
  });
  
  return true;
}

/**
 * Força a aplicação do timezone brasileiro em uma data
 */
export function forcarTimezoneBrasil(data: Date): Date {
  if (typeof Intl === 'undefined') return data;
  
  const formatador = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const partes = formatador.formatToParts(data);
  const ano = parseInt(partes.find(p => p.type === 'year')?.value || '0');
  const mes = parseInt(partes.find(p => p.type === 'month')?.value || '0') - 1;
  const dia = parseInt(partes.find(p => p.type === 'day')?.value || '0');
  const hora = parseInt(partes.find(p => p.type === 'hour')?.value || '0');
  const minuto = parseInt(partes.find(p => p.type === 'minute')?.value || '0');
  const segundo = parseInt(partes.find(p => p.type === 'second')?.value || '0');
  
  return new Date(ano, mes, dia, hora, minuto, segundo);
}

/**
 * Obtém informações detalhadas sobre o timezone atual
 */
export function informacoesTimezone() {
  const agora = new Date();
  const brasilHora = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const utcHora = agora.toUTCString();
  const localHora = agora.toLocaleString();
  
  return {
    timestamp: agora.toISOString(),
    brasilHora,
    utcHora,
    localHora,
    offset: agora.getTimezoneOffset(),
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A',
    processTimezone: typeof process !== 'undefined' ? process.env.TZ : undefined
  };
}

// Configurar timezone imediatamente na importação (apenas no servidor)
if (typeof process !== 'undefined' && process.env) {
  process.env.TZ = 'America/Sao_Paulo';
  process.env.TIMEZONE = 'America/Sao_Paulo';
}
