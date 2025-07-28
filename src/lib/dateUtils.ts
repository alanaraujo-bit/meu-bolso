// Utilitários para manipulação de datas com timezone brasileiro (America/Sao_Paulo)
// CORRIGE PROBLEMAS DE DIFERENÇA DE DATA ENTRE LOCAL E PRODUÇÃO

/**
 * Timezone brasileiro
 */
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data e hora atual no timezone de Brasília
 * VERSÃO CORRIGIDA para produção
 */
export function getDataAtualBrasil(): Date {
  // Em produção, force o timezone brasileiro
  if (typeof window === 'undefined') {
    // Server-side: force UTC-3 (Brasília)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const brasilTime = new Date(utc + (-3 * 3600000)); // UTC-3
    return brasilTime;
  } else {
    // Client-side: usar timezone local do navegador
    return new Date();
  }
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
    
    // CORREÇÃO: Criar a data forçando o timezone brasileiro
    if (typeof window === 'undefined') {
      // Server-side: criar data fixa no timezone brasileiro
      const data = new Date();
      data.setFullYear(ano);
      data.setMonth(mes);
      data.setDate(dia);
      data.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de DST
      
      // Ajustar para timezone brasileiro em produção
      const utc = data.getTime() + (data.getTimezoneOffset() * 60000);
      return new Date(utc + (-3 * 3600000)); // UTC-3
    } else {
      // Client-side: criar data local
      return new Date(ano, mes, dia, 12, 0, 0, 0);
    }
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
      // Se a string estiver vazia, usar data atual
      if (!data.trim()) {
        return getDataAtualBrasil();
      }
      
      // Se recebeu só a data (YYYY-MM-DD), adicionar a hora atual
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const agora = getDataAtualBrasil();
        const partesData = data.split('-').map(Number);
        
        // Criar data com a hora atual brasileira
        const dataComHora = new Date();
        dataComHora.setFullYear(partesData[0], partesData[1] - 1, partesData[2]);
        dataComHora.setHours(agora.getHours(), agora.getMinutes(), agora.getSeconds(), agora.getMilliseconds());
        
        return dataComHora;
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
