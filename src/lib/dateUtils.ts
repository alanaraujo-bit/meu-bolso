// Utilitários para manipulação de datas com timezone brasileiro
// Esse módulo garante que todas as datas sejam tratadas corretamente

/**
 * Obtém a data atual no timezone de Brasília
 */
export function getDataAtualBrasil(): Date {
  // Criar uma nova data com a hora atual do Brasil
  const agora = new Date();
  
  // Converter para o timezone brasileiro
  const brasilTime = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  return brasilTime;
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date no timezone de Brasília
 * Garante que a data seja interpretada corretamente sem deslocamento de timezone
 */
export function parseDataBrasil(dataString: string): Date {
  if (!dataString) throw new Error('Data string é obrigatória');
  
  try {
    // Se já tem informação de hora, usar direto
    if (dataString.includes('T') || dataString.includes(' ')) {
      return new Date(dataString);
    }
    
    // Para datas no formato YYYY-MM-DD, adicionar hora zero no timezone local
    const [ano, mes, dia] = dataString.split('-').map(Number);
    
    // Validar se os valores são números válidos
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
      throw new Error(`Data inválida: ${dataString}`);
    }
    
    // Validar ranges básicos
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      throw new Error(`Data fora dos limites válidos: ${dataString}`);
    }
    
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  } catch (error) {
    console.error('Erro ao fazer parse da data:', error, 'String recebida:', dataString);
    throw error;
  }
}

/**
 * Formata uma Date para string no formato YYYY-MM-DD
 * Garante que a data seja formatada no timezone brasileiro
 */
export function formatDataBrasil(data: Date): string {
  if (!data || !(data instanceof Date)) {
    throw new Error('Data deve ser uma instância válida de Date');
  }
  
  // Garantir que usamos o timezone brasileiro
  const dataLocal = new Date(data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
  
  const ano = dataLocal.getFullYear();
  const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(dataLocal.getDate()).padStart(2, '0');
  
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
 * Cria uma data para início do mês (00:00:00) no timezone brasileiro
 */
export function criarInicioMesBrasil(ano: number, mes: number): Date {
  return new Date(ano, mes - 1, 1, 0, 0, 0, 0);
}

/**
 * Cria uma data para fim do mês (23:59:59) no timezone brasileiro  
 */
export function criarFimMesBrasil(ano: number, mes: number): Date {
  return new Date(ano, mes, 0, 23, 59, 59, 999);
}

/**
 * Compara se duas datas são do mesmo dia (ignorando hora)
 */
export function saoMesmoDia(data1: Date, data2: Date): boolean {
  if (!data1 || !data2) return false;
  
  const d1 = new Date(data1.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
  const d2 = new Date(data2.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Adiciona dias a uma data no timezone brasileiro
 */
export function adicionarDias(data: Date, dias: number): Date {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

/**
 * Adiciona meses a uma data no timezone brasileiro
 */
export function adicionarMeses(data: Date, meses: number): Date {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
}

/**
 * Adiciona anos a uma data no timezone brasileiro
 */
export function adicionarAnos(data: Date, anos: number): Date {
  const novaData = new Date(data);
  novaData.setFullYear(novaData.getFullYear() + anos);
  return novaData;
}

/**
 * Obtém a data de hoje no formato YYYY-MM-DD para inputs de data
 */
export function getDataHojeInput(): string {
  return formatDataBrasil(getDataAtualBrasil());
}

/**
 * Converte uma data do banco (UTC) para Date local
 */
export function converterDataDoBanco(dataString: string | Date): Date {
  if (!dataString) return new Date();
  
  if (typeof dataString === 'string') {
    return new Date(dataString);
  }
  
  return dataString;
}

/**
 * Prepara uma data para salvar no banco (converte para UTC)
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
        const [ano, mes, dia] = data.split('-').map(Number);
        
        // Criar data com a hora atual brasileira
        const dataComHora = new Date();
        dataComHora.setFullYear(ano, mes - 1, dia);
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
 * Cria data de início do dia (00:00:00) no timezone brasileiro
 */
export function inicioDataBrasil(data: Date): Date {
  const dataBrasil = new Date(data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
  dataBrasil.setHours(0, 0, 0, 0);
  return dataBrasil;
}

/**
 * Cria data de fim do dia (23:59:59) no timezone brasileiro
 */
export function fimDataBrasil(data: Date): Date {
  const dataBrasil = new Date(data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
  dataBrasil.setHours(23, 59, 59, 999);
  return dataBrasil;
}

/**
 * Cria data de início de mês no timezone brasileiro
 */
export function inicioMesBrasil(ano: number, mes: number): Date {
  // Ajustar para mês anterior se necessário
  if (mes <= 0) {
    ano -= 1;
    mes = 12 + mes; // mes será negativo, então somamos
  }
  if (mes > 12) {
    ano += Math.floor((mes - 1) / 12);
    mes = ((mes - 1) % 12) + 1;
  }
  
  // mes é 1-indexed (Janeiro = 1)
  const data = new Date();
  data.setFullYear(ano, mes - 1, 1);
  data.setHours(0, 0, 0, 0);
  return new Date(data.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
}

/**
 * Cria data de fim de mês no timezone brasileiro
 */
export function fimMesBrasil(ano: number, mes: number): Date {
  // Ajustar para mês anterior se necessário
  if (mes <= 0) {
    ano -= 1;
    mes = 12 + mes; // mes será negativo, então somamos
  }
  if (mes > 12) {
    ano += Math.floor((mes - 1) / 12);
    mes = ((mes - 1) % 12) + 1;
  }
  
  // mes é 1-indexed (Janeiro = 1)
  const data = new Date();
  data.setFullYear(ano, mes, 0); // Dia 0 do próximo mês = último dia do mês atual
  data.setHours(23, 59, 59, 999);
  return new Date(data.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
}
