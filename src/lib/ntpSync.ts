// Utilitário para sincronização precisa de horário
// Garante que o sistema esteja usando a hora exata

/**
 * Obtém a hora precisa de um servidor NTP brasileiro
 * Retorna a diferença em milissegundos entre o horário local e o servidor
 */
export async function sincronizarHorarioNTP(): Promise<number> {
  try {
    // Usar WorldTimeAPI para horário preciso do Brasil
    const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
    
    if (!response.ok) {
      throw new Error('Falha ao conectar com servidor de tempo');
    }
    
    const data = await response.json();
    const horarioServidor = new Date(data.datetime);
    const horarioLocal = new Date();
    
    // Calcular diferença
    const diferenca = horarioServidor.getTime() - horarioLocal.getTime();
    
    console.log('🕐 Sincronização NTP:', {
      servidor: horarioServidor.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      local: horarioLocal.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      diferenca: `${diferenca}ms`,
      timezone: data.timezone,
      offset: data.utc_offset
    });
    
    return diferenca;
  } catch (error) {
    console.warn('⚠️ Não foi possível sincronizar com NTP:', error);
    return 0; // Usar horário local como fallback
  }
}

/**
 * Obtém a data/hora atual com correção NTP
 */
export async function getDataAtualPrecisa(): Promise<Date> {
  const diferenca = await sincronizarHorarioNTP();
  const agora = new Date();
  
  // Aplicar correção se necessário
  if (Math.abs(diferenca) > 1000) { // Só corrigir se diferença > 1 segundo
    const dataCorrigida = new Date(agora.getTime() + diferenca);
    console.log('🔧 Horário corrigido:', {
      antes: agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      depois: dataCorrigida.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      correcao: `${diferenca}ms`
    });
    return dataCorrigida;
  }
  
  return agora;
}

/**
 * Verifica se o sistema está com horário preciso
 */
export async function verificarPrecisaoHorario(): Promise<{
  preciso: boolean;
  diferenca: number;
  recomendacao: string;
}> {
  const diferenca = await sincronizarHorarioNTP();
  const preciso = Math.abs(diferenca) <= 5000; // Tolerância de 5 segundos
  
  let recomendacao = '';
  if (!preciso) {
    if (Math.abs(diferenca) > 60000) {
      recomendacao = 'Sincronize o relógio do sistema com um servidor NTP';
    } else {
      recomendacao = 'Pequena diferença detectada, ajuste automático aplicado';
    }
  } else {
    recomendacao = 'Horário está preciso';
  }
  
  return {
    preciso,
    diferenca,
    recomendacao
  };
}

/**
 * Força sincronização do Windows com servidor NTP
 * (requer privilégios administrativos)
 */
export function comandoSincronizarWindows(): string[] {
  return [
    'w32tm /config /manualpeerlist:"a.ntp.br,b.ntp.br,c.ntp.br" /syncfromflags:manual /reliable:YES',
    'w32tm /resync',
    'w32tm /query /status'
  ];
}

// Auto-executar verificação em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  verificarPrecisaoHorario().then(resultado => {
    if (!resultado.preciso) {
      console.warn('⏰ ATENÇÃO: Horário do sistema pode estar impreciso', resultado);
    } else {
      console.log('✅ Horário do sistema está preciso');
    }
  });
}
