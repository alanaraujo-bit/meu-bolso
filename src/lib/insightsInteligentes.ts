import { prisma } from '@/lib/prisma';
import { 
  getDataAtualBrasil, 
  adicionarMeses, 
  inicioMesBrasil, 
  fimMesBrasil 
} from '@/lib/dateUtils';

// Tipos para análise de perfil
interface PerfilFinanceiro {
  userId: string;
  comportamento: ComportamentoFinanceiro;
  historico: HistoricoFinanceiro;
  padroes: PadroesGastos;
  metas: EstadoMetas;
  dividas: SituacaoDividas;
  sazonalidade: AnaliseAzonal;
}

interface ComportamentoFinanceiro {
  tipoUsuario: 'conservador' | 'moderado' | 'arriscado' | 'iniciante';
  disciplina: 'alta' | 'media' | 'baixa';
  tendencia: 'melhorando' | 'estavel' | 'piorando';
  consistencia: number; // 0-100
}

interface HistoricoFinanceiro {
  mesesAtivo: number;
  transacoesTotais: number;
  maiorEconomia: number;
  maiorDeficit: number;
  tempoMedioParaAlcancarMetas: number;
}

interface PadroesGastos {
  categoriaFavorita: string;
  diaQueMaisGasta: string;
  horariosGastos: string[];
  sazonalidade: { mes: number; variacao: number }[];
  gastosImpulsivos: number; // % de gastos impulsivos
}

interface EstadoMetas {
  totalCriadas: number;
  percentualSucesso: number;
  tempoMedioCompletude: number;
  valorMedioMetas: number;
  tendenciaValores: 'crescente' | 'decrescente' | 'estavel';
}

interface SituacaoDividas {
  comprometimentoRenda: number;
  historicoQuitacao: number; // % de dívidas quitadas no prazo
  tendenciaEndividamento: 'melhorando' | 'piorando' | 'estavel';
}

interface AnaliseAzonal {
  melhorMes: number;
  piorMes: number;
  variabilidadeGastos: number;
}

export class AnalisadorInsights {
  private userId: string;
  private perfil: PerfilFinanceiro | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Método principal para gerar insights inteligentes
  async gerarInsightsPersonalizados(dadosAtual: any): Promise<any[]> {
    try {
      // 1. Analisar perfil completo do usuário
      this.perfil = await this.analisarPerfilCompleto();
      
      // 2. Gerar insights baseados no perfil
      const insights = [];
      
      // Insights de comportamento financeiro
      insights.push(...await this.gerarInsightsComportamento(dadosAtual));
      
      // Insights de tendências e padrões
      insights.push(...await this.gerarInsightsTendencias(dadosAtual));
      
      // Insights de oportunidades
      insights.push(...await this.gerarInsightsOportunidades(dadosAtual));
      
      // Insights motivacionais e de apoio
      insights.push(...await this.gerarInsightsMotivacionais(dadosAtual));
      
      // Insights de planejamento futuro
      insights.push(...await this.gerarInsightsPlanejamento(dadosAtual));
      
      // Insights de educação financeira
      insights.push(...await this.gerarInsightsEducacionais(dadosAtual));

      // Ordenar por relevância e prioridade
      return this.ordenarInsightsPorRelevancia(insights);
    } catch (error) {
      console.error('Erro ao gerar insights personalizados:', error);
      return [];
    }
  }

  // Análise completa do perfil financeiro
  private async analisarPerfilCompleto(): Promise<PerfilFinanceiro> {
    const agora = getDataAtualBrasil();
    const seisesesAtras = adicionarMeses(agora, -6);

    // Buscar dados históricos
    const [transacoes, metas, dividas, usuario] = await Promise.all([
      prisma.transacao.findMany({
        where: {
          userId: this.userId,
          data: { gte: seisesesAtras }
        },
        include: { categoria: true },
        orderBy: { data: 'desc' }
      }),
      prisma.meta.findMany({
        where: { userId: this.userId },
        orderBy: { criadoEm: 'desc' }
      }),
      prisma.divida.findMany({
        where: { userId: this.userId },
        include: { parcelas: true }
      }),
      prisma.usuario.findUnique({
        where: { id: this.userId }
      })
    ]);

    // Analisar comportamento
    const comportamento = this.analisarComportamento(transacoes, metas, dividas);
    
    // Analisar histórico
    const historico = this.analisarHistorico(transacoes, metas, usuario);
    
    // Analisar padrões
    const padroes = this.analisarPadroes(transacoes);
    
    // Analisar metas
    const estadoMetas = this.analisarMetas(metas);
    
    // Analisar dívidas
    const situacaoDividas = this.analisarDividas(dividas);
    
    // Analisar sazonalidade
    const sazonalidade = this.analisarSazonalidade(transacoes);

    return {
      userId: this.userId,
      comportamento,
      historico,
      padroes,
      metas: estadoMetas,
      dividas: situacaoDividas,
      sazonalidade
    };
  }

  private analisarComportamento(transacoes: any[], metas: any[], dividas: any[]): ComportamentoFinanceiro {
    const receitasTotal = transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0);
    const despesasTotal = transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0);
    const saldo = receitasTotal - despesasTotal;
    
    // Determinar tipo de usuário
    let tipoUsuario: 'conservador' | 'moderado' | 'arriscado' | 'iniciante';
    if (transacoes.length < 20) {
      tipoUsuario = 'iniciante';
    } else if (saldo > receitasTotal * 0.2) {
      tipoUsuario = 'conservador';
    } else if (saldo > 0) {
      tipoUsuario = 'moderado';
    } else {
      tipoUsuario = 'arriscado';
    }
    
    // Avaliar disciplina
    const metasConcluidas = metas.filter(m => m.isCompleted).length;
    const percentualSucessoMetas = metas.length > 0 ? metasConcluidas / metas.length : 0;
    
    let disciplina: 'alta' | 'media' | 'baixa';
    if (percentualSucessoMetas > 0.7 && saldo > 0) {
      disciplina = 'alta';
    } else if (percentualSucessoMetas > 0.4 || saldo > receitasTotal * 0.1) {
      disciplina = 'media';
    } else {
      disciplina = 'baixa';
    }
    
    // Analisar tendência (últimos 3 meses vs 3 anteriores)
    const agora = new Date();
    const tresesesAtras = adicionarMeses(agora, -3);
    const seisesesAtras = adicionarMeses(agora, -6);
    
    const ultimos3Meses = transacoes.filter(t => t.data >= tresesesAtras);
    const meses3a6 = transacoes.filter(t => t.data >= seisesesAtras && t.data < tresesesAtras);
    
    const saldoUltimos3 = ultimos3Meses.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0) -
                         ultimos3Meses.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0);
    const saldoMeses3a6 = meses3a6.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0) -
                         meses3a6.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0);
    
    let tendencia: 'melhorando' | 'estavel' | 'piorando';
    if (saldoUltimos3 > saldoMeses3a6 * 1.1) {
      tendencia = 'melhorando';
    } else if (saldoUltimos3 < saldoMeses3a6 * 0.9) {
      tendencia = 'piorando';
    } else {
      tendencia = 'estavel';
    }
    
    // Calcular consistência (regularidade nas transações)
    const consistencia = Math.min(100, (transacoes.length / 180) * 100); // Base: 1 transação por dia nos últimos 6 meses
    
    return {
      tipoUsuario,
      disciplina,
      tendencia,
      consistencia
    };
  }

  private analisarHistorico(transacoes: any[], metas: any[], usuario: any): HistoricoFinanceiro {
    const dataInicio = usuario?.criadoEm ? new Date(usuario.criadoEm) : new Date();
    const agora = new Date();
    const mesesAtivo = Math.max(1, Math.floor((agora.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    // Analisar histórico por mês
    const historicoMensal = [];
    for (let i = 0; i < mesesAtivo; i++) {
      const mesData = adicionarMeses(agora, -i);
      const inicioMes = inicioMesBrasil(mesData.getFullYear(), mesData.getMonth() + 1);
      const fimMes = fimMesBrasil(mesData.getFullYear(), mesData.getMonth() + 1);
      
      const transacoesMes = transacoes.filter(t => t.data >= inicioMes && t.data <= fimMes);
      const receitasMes = transacoesMes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0);
      const despesasMes = transacoesMes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0);
      
      historicoMensal.push({
        mes: i,
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      });
    }
    
    const maiorEconomia = Math.max(...historicoMensal.map(h => h.saldo));
    const maiorDeficit = Math.min(...historicoMensal.map(h => h.saldo));
    
    // Tempo médio para alcançar metas
    const metasConcluidas = metas.filter(m => m.isCompleted);
    const tempoMedioParaAlcancarMetas = metasConcluidas.length > 0 ? 
      metasConcluidas.reduce((sum, m) => {
        const inicio = new Date(m.criadoEm);
        const fim = new Date(m.atualizadoEm); // Assumindo que atualizadoEm é quando foi concluída
        return sum + Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / metasConcluidas.length : 0;
    
    return {
      mesesAtivo,
      transacoesTotais: transacoes.length,
      maiorEconomia,
      maiorDeficit,
      tempoMedioParaAlcancarMetas
    };
  }

  private analisarPadroes(transacoes: any[]): PadroesGastos {
    const despesas = transacoes.filter(t => t.tipo === 'despesa');
    
    // Categoria favorita
    const categorias = despesas.reduce((acc, t) => {
      const cat = t.categoria?.nome || 'Sem categoria';
      acc[cat] = (acc[cat] || 0) + Number(t.valor);
      return acc;
    }, {});
    
    const categoriaFavorita = Object.entries(categorias)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Sem categoria';
    
    // Dia que mais gasta
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const gastosPorDia = despesas.reduce((acc, t) => {
      const dia = diasSemana[t.data.getDay()];
      acc[dia] = (acc[dia] || 0) + Number(t.valor);
      return acc;
    }, {});
    
    const diaQueMaisGasta = Object.entries(gastosPorDia)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Não identificado';
    
    // Horários de gastos (simulado - seria necessário ter timestamp completo)
    const horariosGastos = ['Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-24h)'];
    
    // Sazonalidade por mês
    const sazonalidade = Array.from({length: 12}, (_, i) => {
      const gastosMes = despesas.filter(t => t.data.getMonth() === i)
        .reduce((sum, t) => sum + Number(t.valor), 0);
      return { mes: i + 1, variacao: gastosMes };
    });
    
    // Gastos impulsivos (estimativa baseada em valor baixo e descrição vaga)
    const gastosImpulsivos = despesas.filter(t => 
      Number(t.valor) < 50 && (!t.descricao || t.descricao.length < 10)
    ).length / despesas.length * 100;
    
    return {
      categoriaFavorita,
      diaQueMaisGasta,
      horariosGastos,
      sazonalidade,
      gastosImpulsivos
    };
  }

  private analisarMetas(metas: any[]): EstadoMetas {
    if (metas.length === 0) {
      return {
        totalCriadas: 0,
        percentualSucesso: 0,
        tempoMedioCompletude: 0,
        valorMedioMetas: 0,
        tendenciaValores: 'estavel'
      };
    }
    
    const metasConcluidas = metas.filter(m => m.isCompleted);
    const percentualSucesso = metasConcluidas.length / metas.length * 100;
    
    const valorMedioMetas = metas.reduce((sum, m) => sum + Number(m.valorAlvo), 0) / metas.length;
    
    // Tendência dos valores das metas (últimas 5 vs primeiras 5)
    const metasOrdenadas = [...metas].sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
    const primeiras5 = metasOrdenadas.slice(0, 5);
    const ultimas5 = metasOrdenadas.slice(-5);
    
    const mediaPrimeiras = primeiras5.reduce((sum, m) => sum + Number(m.valorAlvo), 0) / primeiras5.length;
    const mediaUltimas = ultimas5.reduce((sum, m) => sum + Number(m.valorAlvo), 0) / ultimas5.length;
    
    let tendenciaValores: 'crescente' | 'decrescente' | 'estavel';
    if (mediaUltimas > mediaPrimeiras * 1.2) {
      tendenciaValores = 'crescente';
    } else if (mediaUltimas < mediaPrimeiras * 0.8) {
      tendenciaValores = 'decrescente';
    } else {
      tendenciaValores = 'estavel';
    }
    
    return {
      totalCriadas: metas.length,
      percentualSucesso,
      tempoMedioCompletude: 0, // Seria necessário mais lógica para calcular
      valorMedioMetas,
      tendenciaValores
    };
  }

  private analisarDividas(dividas: any[]): SituacaoDividas {
    if (dividas.length === 0) {
      return {
        comprometimentoRenda: 0,
        historicoQuitacao: 100,
        tendenciaEndividamento: 'estavel'
      };
    }
    
    // Para uma análise mais precisa, seria necessário dados de renda
    const comprometimentoRenda = 0; // Placeholder
    
    const dividasQuitadas = dividas.filter(d => d.status === 'QUITADA');
    const historicoQuitacao = dividasQuitadas.length / dividas.length * 100;
    
    // Tendência baseada nas datas de criação das dívidas
    const agora = new Date();
    const seisesesAtras = adicionarMeses(agora, -6);
    const dividasRecentes = dividas.filter(d => new Date(d.criadoEm) >= seisesesAtras);
    const dividasAntigas = dividas.filter(d => new Date(d.criadoEm) < seisesesAtras);
    
    let tendenciaEndividamento: 'melhorando' | 'piorando' | 'estavel';
    if (dividasRecentes.length < dividasAntigas.length) {
      tendenciaEndividamento = 'melhorando';
    } else if (dividasRecentes.length > dividasAntigas.length * 1.5) {
      tendenciaEndividamento = 'piorando';
    } else {
      tendenciaEndividamento = 'estavel';
    }
    
    return {
      comprometimentoRenda,
      historicoQuitacao,
      tendenciaEndividamento
    };
  }

  private analisarSazonalidade(transacoes: any[]): AnaliseAzonal {
    const gastosPorMes = Array.from({length: 12}, (_, i) => {
      return transacoes.filter(t => t.tipo === 'despesa' && t.data.getMonth() === i)
        .reduce((sum, t) => sum + Number(t.valor), 0);
    });
    
    const melhorMes = gastosPorMes.indexOf(Math.min(...gastosPorMes.filter(v => v > 0))) + 1;
    const piorMes = gastosPorMes.indexOf(Math.max(...gastosPorMes)) + 1;
    
    const media = gastosPorMes.reduce((sum, v) => sum + v, 0) / gastosPorMes.length;
    const variancia = gastosPorMes.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / gastosPorMes.length;
    const variabilidadeGastos = Math.sqrt(variancia) / media * 100;
    
    return {
      melhorMes,
      piorMes,
      variabilidadeGastos
    };
  }

  // Métodos para gerar diferentes tipos de insights...
  private async gerarInsightsComportamento(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { comportamento } = this.perfil;
    
    // Insight baseado no tipo de usuário
    switch (comportamento.tipoUsuario) {
      case 'conservador':
        insights.push({
          tipo: 'sucesso',
          categoria: 'Comportamento',
          titulo: 'Perfil Conservador Identificado',
          descricao: `Você demonstra um excelente controle financeiro! Seu perfil conservador mostra que você prioriza a segurança financeira e tem disciplina para manter um bom saldo.`,
          recomendacao: 'Como você já tem o básico dominado, que tal explorar investimentos de baixo risco para fazer seu dinheiro render mais?',
          metricas: `Nível de disciplina: ${comportamento.disciplina} | Tendência: ${comportamento.tendencia}`,
          icone: '🛡️',
          prioridade: 'media'
        });
        break;
        
      case 'moderado':
        insights.push({
          tipo: 'info',
          categoria: 'Comportamento',
          titulo: 'Equilíbrio Financeiro Moderado',
          descricao: `Você mantém um bom equilíbrio entre gastos e economia. Seu perfil moderado mostra que você consegue se controlar na maioria das vezes.`,
          recomendacao: 'Tente aumentar gradualmente sua reserva de emergência para 3-6 meses de gastos. Isso te dará mais segurança.',
          metricas: `Consistência: ${comportamento.consistencia.toFixed(1)}% | Tendência: ${comportamento.tendencia}`,
          icone: '⚖️',
          prioridade: 'media'
        });
        break;
        
      case 'arriscado':
        insights.push({
          tipo: 'alerta',
          categoria: 'Comportamento',
          titulo: 'Perfil de Risco Alto Detectado',
          descricao: `Percebi que você tem um perfil mais arriscado com seus gastos. Isso não é necessariamente ruim, mas é importante estar atento aos limites.`,
          recomendacao: 'Que tal começar com pequenas metas de economia? Mesmo R$ 50 por semana já faz diferença no longo prazo.',
          metricas: `Disciplina atual: ${comportamento.disciplina} | Precisa melhorar: tendência ${comportamento.tendencia}`,
          icone: '⚠️',
          prioridade: 'alta'
        });
        break;
        
      case 'iniciante':
        insights.push({
          tipo: 'dica',
          categoria: 'Bem-vindo',
          titulo: 'Jornada Financeira Iniciando',
          descricao: `Que bom te ver aqui! Estou aqui para te ajudar a construir hábitos financeiros saudáveis desde o início. Cada pequeno passo conta!`,
          recomendacao: 'Comece registrando todos seus gastos por 30 dias. Isso vai te dar uma visão clara de para onde seu dinheiro está indo.',
          metricas: `Transações registradas: ${this.perfil.historico.transacoesTotais} | Continue assim!`,
          icone: '🌱',
          prioridade: 'alta'
        });
        break;
    }
    
    return insights;
  }

  private async gerarInsightsTendencias(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { comportamento, padroes } = this.perfil;
    
    // Insight sobre tendência
    if (comportamento.tendencia === 'melhorando') {
      insights.push({
        tipo: 'sucesso',
        categoria: 'Progresso',
        titulo: '📈 Trajetória Ascendente Detectada!',
        descricao: `Estou muito orgulhoso de você! Seus números mostram uma clara melhoria nos últimos meses. Você está no caminho certo!`,
        recomendacao: 'Mantenha esse ritmo! Quando estamos melhorando, é o momento ideal para estabelecer metas mais ambiciosas.',
        metricas: `Tendência: ${comportamento.tendencia} | Consistência: ${comportamento.consistencia.toFixed(1)}%`,
        icone: '🚀',
        prioridade: 'alta'
      });
    } else if (comportamento.tendencia === 'piorando') {
      insights.push({
        tipo: 'apoio',
        categoria: 'Apoio',
        titulo: 'Momento de Reflexão e Recomeço',
        descricao: `Ei, não se preocupe! Todos passamos por fases mais difíceis. O importante é que você está aqui, consciente e pronto para melhorar.`,
        recomendacao: 'Vamos juntos identificar o que mudou nos últimos meses. Às vezes é só uma questão de ajustar algumas categorias.',
        metricas: `Vamos reverter: ${comportamento.tendencia} → melhorando`,
        icone: '🤝',
        prioridade: 'critica'
      });
    }
    
    // Insight sobre padrões de gastos
    if (padroes.gastosImpulsivos > 30) {
      insights.push({
        tipo: 'dica',
        categoria: 'Comportamento',
        titulo: 'Detectei Alguns Gastos Impulsivos',
        descricao: `Percebi que cerca de ${padroes.gastosImpulsivos.toFixed(1)}% dos seus gastos podem ser impulsivos. Não se preocupe, isso é normal!`,
        recomendacao: 'Tente a regra dos 24h: antes de qualquer compra não planejada, espere um dia. Você vai se surpreender quantas vezes vai desistir!',
        metricas: `Gastos impulsivos: ${padroes.gastosImpulsivos.toFixed(1)}% | Meta: <20%`,
        icone: '🎯',
        prioridade: 'media'
      });
    }
    
    return insights;
  }

  private async gerarInsightsOportunidades(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { padroes, historico } = this.perfil;
    
    // Oportunidade baseada na categoria favorita
    insights.push({
      tipo: 'oportunidade',
      categoria: 'Otimização',
      titulo: `Oportunidade em ${padroes.categoriaFavorita}`,
      descricao: `Notei que ${padroes.categoriaFavorita} é sua categoria de maior gasto. Que tal pesquisarmos alternativas para otimizar esses custos?`,
      recomendacao: 'Experimente o desafio dos 30 dias: encontre 3 formas diferentes de reduzir gastos nesta categoria sem afetar sua qualidade de vida.',
      metricas: `Categoria principal: ${padroes.categoriaFavorita} | Dia favorito: ${padroes.diaQueMaisGasta}`,
      icone: '💡',
      prioridade: 'media'
    });
    
    // Oportunidade de planejamento sazonal
    if (this.perfil.sazonalidade.variabilidadeGastos > 50) {
      insights.push({
        tipo: 'dica',
        categoria: 'Planejamento',
        titulo: 'Padrão Sazonal Identificado',
        descricao: `Seus gastos variam bastante ao longo do ano. Isso é uma oportunidade para um planejamento mais estratégico!`,
        recomendacao: `Prepare-se para o mês ${this.perfil.sazonalidade.piorMes} (seu mês de maior gasto) criando uma reserva extra nos meses anteriores.`,
        metricas: `Melhor mês: ${this.perfil.sazonalidade.melhorMes} | Pior mês: ${this.perfil.sazonalidade.piorMes}`,
        icone: '📅',
        prioridade: 'media'
      });
    }
    
    return insights;
  }

  private async gerarInsightsMotivacionais(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { historico, metas } = this.perfil;
    
    // Comemorar marcos
    if (historico.transacoesTotais >= 100) {
      insights.push({
        tipo: 'celebracao',
        categoria: 'Conquista',
        titulo: '🎉 Marco Atingido!',
        descricao: `Uau! Você já registrou ${historico.transacoesTotais} transações! Isso mostra um comprometimento real com sua organização financeira.`,
        recomendacao: 'Você merece se orgulhar! Que tal definir uma pequena recompensa para comemorar essa conquista?',
        metricas: `Transações: ${historico.transacoesTotais} | Tempo ativo: ${historico.mesesAtivo} meses`,
        icone: '🏆',
        prioridade: 'media'
      });
    }
    
    // Motivar sobre metas
    if (metas.totalCriadas === 0) {
      insights.push({
        tipo: 'motivacao',
        categoria: 'Crescimento',
        titulo: 'Hora de Sonhar Grande!',
        descricao: `Que tal criarmos sua primeira meta? Não precisa ser algo gigante - pode ser juntar R$ 200 para um livro que você quer ou uma roupa nova.`,
        recomendacao: 'Metas pequenas e alcançáveis criam o hábito de conquista. Depois podemos sonhar maior juntos!',
        metricas: `Metas criadas: 0 | Potencial ilimitado! 🌟`,
        icone: '🎯',
        prioridade: 'alta'
      });
    } else if (metas.percentualSucesso > 70) {
      insights.push({
        tipo: 'sucesso',
        categoria: 'Conquista',
        titulo: 'Você é um Conquistador de Metas!',
        descricao: `Com ${metas.percentualSucesso.toFixed(1)}% de sucesso nas suas metas, você está no top 10% das pessoas mais disciplinadas!`,
        recomendacao: 'Seu nível de sucesso te permite sonhar maior. Que tal uma meta desafiadora para o próximo trimestre?',
        metricas: `Taxa de sucesso: ${metas.percentualSucesso.toFixed(1)}% | Metas criadas: ${metas.totalCriadas}`,
        icone: '👑',
        prioridade: 'alta'
      });
    }
    
    return insights;
  }

  private async gerarInsightsPlanejamento(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { historico, comportamento } = this.perfil;
    
    // Planejamento baseado no histórico
    if (historico.maiorEconomia > 0) {
      insights.push({
        tipo: 'planejamento',
        categoria: 'Estratégia',
        titulo: 'Potencial de Economia Comprovado',
        descricao: `Você já conseguiu economizar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(historico.maiorEconomia)} em um mês! Isso prova que você tem potencial.`,
        recomendacao: 'Vamos analisar o que você fez naquele mês e replicar essas estratégias. Você pode voltar a esse nível!',
        metricas: `Recorde de economia: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(historico.maiorEconomia)}`,
        icone: '📊',
        prioridade: 'media'
      });
    }
    
    // Preparação para emergências
    if (comportamento.tipoUsuario !== 'conservador') {
      insights.push({
        tipo: 'preparacao',
        categoria: 'Segurança',
        titulo: 'Construindo sua Rede de Segurança',
        descricao: `Uma reserva de emergência é como um cobertor em uma noite fria - você não precisa dele sempre, mas quando precisa, faz toda diferença.`,
        recomendacao: 'Que tal começarmos com uma meta de R$ 500 de emergência? É um valor pequeno mas que já te dá tranquilidade.',
        metricas: `Meta sugerida: R$ 500 iniciais | Prazo: 3 meses`,
        icone: '🛡️',
        prioridade: 'alta'
      });
    }
    
    return insights;
  }

  private async gerarInsightsEducacionais(dadosAtual: any): Promise<any[]> {
    if (!this.perfil) return [];
    
    const insights = [];
    const { comportamento, historico } = this.perfil;
    
    // Dicas educacionais baseadas no perfil
    if (comportamento.tipoUsuario === 'iniciante') {
      insights.push({
        tipo: 'educacao',
        categoria: 'Aprendizado',
        titulo: 'Dica do Amigo: Regra 50/30/20',
        descricao: `Uma dica simples para organizar seu dinheiro: 50% para necessidades, 30% para desejos e 20% para poupança. É um ótimo ponto de partida!`,
        recomendacao: 'Não precisa ser exato nos primeiros meses. O importante é criar o hábito de pensar nessas proporções.',
        metricas: `Necessidades: 50% | Desejos: 30% | Poupança: 20%`,
        icone: '📚',
        prioridade: 'media'
      });
    }
    
    if (historico.mesesAtivo >= 3) {
      insights.push({
        tipo: 'educacao',
        categoria: 'Evolução',
        titulo: 'Próximo Nível: Análise de Tendências',
        descricao: `Com ${historico.mesesAtivo} meses de dados, você já pode começar a identificar padrões sazonais nos seus gastos. Isso é poder!`,
        recomendacao: 'Observe se há meses que você gasta mais (férias, festas de fim de ano) e se prepare para eles antecipadamente.',
        metricas: `Histórico: ${historico.mesesAtivo} meses | Transações: ${historico.transacoesTotais}`,
        icone: '📈',
        prioridade: 'baixa'
      });
    }
    
    return insights;
  }

  private ordenarInsightsPorRelevancia(insights: any[]): any[] {
    const prioridadeOrdem: { [key: string]: number } = { 
      'critica': 4, 
      'alta': 3, 
      'media': 2, 
      'baixa': 1 
    };
    
    const tipoRelevancia: { [key: string]: number } = {
      'apoio': 10,
      'motivacao': 9,
      'celebracao': 8,
      'erro': 7,
      'alerta': 6,
      'sucesso': 5,
      'oportunidade': 4,
      'dica': 3,
      'planejamento': 2,
      'educacao': 1,
      'info': 1
    };
    
    return insights.sort((a, b) => {
      const prioridadeA = prioridadeOrdem[a.prioridade] || 0;
      const prioridadeB = prioridadeOrdem[b.prioridade] || 0;
      const tipoA = tipoRelevancia[a.tipo] || 0;
      const tipoB = tipoRelevancia[b.tipo] || 0;
      
      // Primeiro por prioridade, depois por tipo
      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA;
      }
      return tipoB - tipoA;
    });
  }
}
