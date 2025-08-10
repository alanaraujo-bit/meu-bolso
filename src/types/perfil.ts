// Tipos para o sistema de perfil do usuário

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  criadoEm: Date;
  atualizadoEm: Date;
  ultimaAtividade: Date;
  configuracoes: ConfiguracoesUsuario;
  estatisticas: EstatisticasUsuario;
}

export interface ConfiguracoesUsuario {
  // Configurações de Exibição
  tema: 'claro' | 'escuro' | 'automatico';
  formatoMoeda: 'BRL' | 'USD' | 'EUR';
  
  // Configurações de Segurança
  confirmarExclusoes: boolean;
  timeoutSessao: number; // em minutos (0 = nunca)
  
  // Configurações de Interface
  paginaInicial: 'dashboard' | 'transacoes' | 'relatorios' | 'metas';
  mostrarTooltips: boolean;
}

export interface EstatisticasUsuario {
  totalTransacoes: number;
  totalCategorias: number;
  totalMetas: number;
  totalDividas: number;
  valorTotalMovimentado: number;
  tempoUso: number; // em dias desde o cadastro
  ultimoLogin: Date;
}

export interface OpcoesLimpeza {
  transacoes: boolean;
  categorias: boolean;
  metas: boolean;
  dividas: boolean;
  todosOsDados: boolean;
}

export interface ConfiguracoesPadrao {
  tema: 'automatico';
  formatoMoeda: 'BRL';
  confirmarExclusoes: true;
  timeoutSessao: 60;
  paginaInicial: 'dashboard';
  mostrarTooltips: true;
}

export const CONFIGURACOES_PADRAO: ConfiguracoesUsuario = {
  tema: 'automatico',
  formatoMoeda: 'BRL',
  confirmarExclusoes: true,
  timeoutSessao: 60,
  paginaInicial: 'dashboard',
  mostrarTooltips: true,
};
