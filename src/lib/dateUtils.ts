// Utilitários para manipulação de datas com timezone brasileiro (America/Sao_Paulo)
// VERSÃO SIMPLIFICADA - CORRIGE ERROS DE BUILD

/**
 * Timezone brasileiro
 */
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data e hora atual no timezone de Brasília
 */
export function getDataAtualBrasil(): Date {
  // Criar data atual no timezone brasileiro
  const agora = new Date();
  
  // Converter para o timezone brasileiro usando Intl
  const formatoSaoPaulo = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const partes = formatoSaoPaulo.formatToParts(agora);
  
  const ano = parseInt(partes.find(p => p.type === 'year')?.value || '0');
  const mes = parseInt(partes.find(p => p.type === 'month')?.value || '0') - 1; // Month é 0-indexed
  const dia = parseInt(partes.find(p => p.type === 'day')?.value || '0');
  const hora = parseInt(partes.find(p => p.type === 'hour')?.value || '0');
  const minuto = parseInt(partes.find(p => p.type === 'minute')?.value || '0');
  const segundo = parseInt(partes.find(p => p.type === 'second')?.value || '0');
  
  const dataBrasil = new Date(ano, mes, dia, hora, minuto, segundo);
  
  // DEBUG: Log da conversão de timezone
  console.log('🇧🇷 DEBUG getDataAtualBrasil():', {
    original: agora.toISOString(),
    brasil: dataBrasil.toLocaleString('pt-BR', { timeZone: BRAZIL_TIMEZONE }),
    diferençaHoras: (dataBrasil.getTime() - agora.getTime()) / (1000 * 60 * 60)
  });
  
  return dataBrasil;
}

/**
 * Formata data para padrão brasileiro
 */
export function formatarDataBrasil(data: Date): string {
  return data.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para padrão brasileiro
 */
export function formatarDataHoraBrasil(data: Date): string {
  return data.toLocaleString('pt-BR', { timeZone: BRAZIL_TIMEZONE });
}

/**
 * Obtém data formatada atual
 */
export function getDataAtualFormatada(): string {
  return formatarDataBrasil(getDataAtualBrasil());
}

/**
 * Obtém data/hora formatada atual
 */
export function getDataHoraAtualFormatada(): string {
  return formatarDataHoraBrasil(getDataAtualBrasil());
}

/**
 * Formata valor monetário brasileiro
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Obtém primeiro dia do mês atual
 */
export function getPrimeiroDiaDoMes(): Date {
  const hoje = getDataAtualBrasil();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

/**
 * Obtém último dia do mês atual
 */
export function getUltimoDiaDoMes(): Date {
  const hoje = getDataAtualBrasil();
  return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function calcularDiferencaDias(data1: Date, data2: Date): number {
  const diffTime = Math.abs(data2.getTime() - data1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Verifica se uma data é hoje
 */
export function isHoje(data: Date): boolean {
  const hoje = getDataAtualBrasil();
  return data.toDateString() === hoje.toDateString();
}

/**
 * Verifica se uma data está no mês atual
 */
export function isMesAtual(data: Date): boolean {
  const hoje = getDataAtualBrasil();
  return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
}

/**
 * Obtém data de N dias atrás
 */
export function getDataAntesNCias(dias: number): Date {
  const data = getDataAtualBrasil();
  data.setDate(data.getDate() - dias);
  return data;
}

/**
 * Obtém data de N dias no futuro
 */
export function getDataFuturaNCias(dias: number): Date {
  const data = getDataAtualBrasil();
  data.setDate(data.getDate() + dias);
  return data;
}

/**
 * Converte string de data para Date
 */
export function stringParaData(dataString: string): Date {
  return new Date(dataString);
}

/**
 * Converte Date para string ISO
 */
export function dataParaStringISO(data: Date): string {
  return data.toISOString();
}

/**
 * Obtém nome do mês em português
 */
export function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes] || '';
}

/**
 * Obtém nome do dia da semana em português
 */
export function getNomeDiaSemana(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[diaSemana] || '';
}

/**
 * Formata data relativa (há X dias, etc.)
 */
export function formatarDataRelativa(data: Date): string {
  const hoje = getDataAtualBrasil();
  const diffDays = calcularDiferencaDias(data, hoje);
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays <= 7) return `Há ${diffDays} dias`;
  if (diffDays <= 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays <= 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  
  return `Há ${Math.floor(diffDays / 365)} anos`;
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date no timezone de Brasília
 * CORRIGIDO: Garante que a data seja EXATAMENTE a data informada
 */
export function parseDataBrasil(dataString: string): Date {
  if (!dataString) throw new Error('Data string é obrigatória');
  
  try {
    // Para datas no formato YYYY-MM-DD, criar a data exatamente no dia informado
    const partes = dataString.split('-');
    if (partes.length !== 3) {
      throw new Error('Formato de data inválido. Use YYYY-MM-DD');
    }
    
    const ano = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; // JavaScript usa 0-11 para meses
    const dia = parseInt(partes[2]);
    
    // Validar se os valores são números válidos
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
      throw new Error(`Data inválida: ${dataString}`);
    }
    
    // CORREÇÃO DEFINITIVA: Criar a data exatamente como informada
    // Usar constructor que sempre respeita valores locais
    const data = new Date(ano, mes, dia, 12, 0, 0, 0);
    
    // Verificar se a data foi criada corretamente
    if (data.getFullYear() !== ano || data.getMonth() !== mes || data.getDate() !== dia) {
      throw new Error(`Data inválida criada: ${dataString}`);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao fazer parse da data:', error, 'String recebida:', dataString);
    throw error;
  }
}

/**
 * Formata uma Date para string no formato YYYY-MM-DD
 */
export function formatDataBrasil(data: Date): string {
  if (!data || !(data instanceof Date)) {
    throw new Error('Data deve ser uma instância válida de Date');
  }
  
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma Date para string no formato brasileiro (DD/MM/YYYY)
 */
export function formatDataBrasileiraExibicao(data: Date): string {
  if (!data || !(data instanceof Date)) {
    return '';
  }
  
  return data.toLocaleDateString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
}

/**
 * Formata uma Date para string com data e hora no formato brasileiro
 */
export function formatDataHoraBrasileiraExibicao(data: Date): string {
  if (!data || !(data instanceof Date)) {
    return '';
  }
  
  return data.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Prepara uma data para salvar no banco
 * Garante que receba o horário correto do Brasil
 */
export function prepararDataParaBanco(data: Date | string): Date {
  try {
    if (typeof data === 'string') {
      // Se a string estiver vazia, usar data atual com hora atual
      if (!data.trim()) {
        return getDataAtualBrasil();
      }
      
      // Se recebeu só a data (YYYY-MM-DD), combinar com hora atual
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const agora = new Date();
        const partes = data.split('-');
        const ano = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; // JavaScript usa 0-11 para meses
        const dia = parseInt(partes[2]);
        
        // Criar data com a hora atual
        const dataComHoraAtual = new Date(ano, mes, dia, agora.getHours(), agora.getMinutes(), agora.getSeconds());
        return dataComHoraAtual;
      }
      
      return parseDataBrasil(data);
    }
    
    // Se for Date, retornar como está
    if (data instanceof Date) {
      return data;
    }
    
    // Fallback para data atual
    return getDataAtualBrasil();
  } catch (error) {
    console.error('Erro ao preparar data para banco:', error, 'Data recebida:', data);
    // Em caso de erro, retornar data atual
    return getDataAtualBrasil();
  }
}

/**
 * Adiciona meses a uma data
 */
export function adicionarMeses(data: Date, meses: number): Date {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
}

/**
 * Compara se duas datas são do mesmo dia (ignorando hora)
 */
export function saoMesmoDia(data1: Date, data2: Date): boolean {
  if (!data1 || !data2) return false;
  
  const d1Str = data1.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const d2Str = data2.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  
  return d1Str === d2Str;
}

/**
 * Obtém a data de hoje no formato YYYY-MM-DD para inputs
 */
export function getDataHojeInput(): string {
  return formatDataBrasil(getDataAtualBrasil());
}

/**
 * Cria data de início do mês brasileiro
 */
export function inicioMesBrasil(ano: number, mes: number): Date {
  return new Date(ano, mes - 1, 1, 0, 0, 0, 0);
}

/**
 * Cria data de fim do mês brasileiro
 */
export function fimMesBrasil(ano: number, mes: number): Date {
  return new Date(ano, mes, 0, 23, 59, 59, 999);
}

/**
 * Adiciona dias a uma data
 */
export function adicionarDias(data: Date, dias: number): Date {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

/**
 * Adiciona anos a uma data
 */
export function adicionarAnos(data: Date, anos: number): Date {
  const novaData = new Date(data);
  novaData.setFullYear(novaData.getFullYear() + anos);
  return novaData;
}

/**
 * Início do dia no timezone brasileiro
 */
export function inicioDataBrasil(data: Date): Date {
  const novaData = new Date(data);
  novaData.setHours(0, 0, 0, 0);
  return novaData;
}

/**
 * Fim do dia no timezone brasileiro
 */
export function fimDataBrasil(data: Date): Date {
  const novaData = new Date(data);
  novaData.setHours(23, 59, 59, 999);
  return novaData;
}
