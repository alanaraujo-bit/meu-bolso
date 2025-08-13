import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  getDataAtualBrasil, 
  adicionarDias, 
  adicionarMeses, 
  adicionarAnos,
  parseDataBrasil,
  inicioDataBrasil,
  fimDataBrasil,
  inicioMesBrasil,
  fimMesBrasil
} from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

// Função para calcular próxima data baseada na frequência
function calcularProximaData(ultimaData: Date, frequencia: string): Date {
  switch (frequencia) {
    case 'diaria':
      return adicionarDias(ultimaData, 1);
    case 'semanal':
      return adicionarDias(ultimaData, 7);
    case 'quinzenal':
      return adicionarDias(ultimaData, 15);
    case 'mensal':
      return adicionarMeses(ultimaData, 1);
    case 'trimestral':
      return adicionarMeses(ultimaData, 3);
    case 'semestral':
      return adicionarMeses(ultimaData, 6);
    case 'anual':
      return adicionarAnos(ultimaData, 1);
    default:
      return ultimaData;
  }
}

// Função para executar transações recorrentes pendentes automaticamente
async function executarTransacoesRecorrentesPendentes(usuarioId: string) {
  try {
    const agora = getDataAtualBrasil();
    
    // Buscar transações recorrentes ativas
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: usuarioId,
        isActive: true,
        dataInicio: { lte: agora },
        OR: [
          { dataFim: null },
          { dataFim: { gte: agora } }
        ]
      },
      include: {
        transacoes: {
          orderBy: { data: "desc" },
          take: 1,
        },
      },
    });

    const transacoesCriadas = [];

    for (const recorrente of recorrentes) {
      // Determinar a data da próxima execução
      let proximaExecucao = new Date(recorrente.dataInicio);

      // Se já há transações, calcular a partir da última
      if (recorrente.transacoes.length > 0) {
        const ultimaTransacao = recorrente.transacoes[0];
        proximaExecucao = calcularProximaData(ultimaTransacao.data, recorrente.frequencia);
      }

      // MODIFICAÇÃO: Executar apenas transações que já venceram (não futuras)
      // Só criar transações para datas que já passaram ou são hoje
      while (proximaExecucao <= agora) {
        // Verificar se a transação está dentro do período de validade
        if (recorrente.dataFim && proximaExecucao > recorrente.dataFim) {
          break;
        }

        // NOVA VERIFICAÇÃO: Não criar transações futuras antecipadamente
        // Para transações mensais, só criar quando realmente chegar o dia
        const diaProximaExecucao = proximaExecucao.getDate();
        const mesProximaExecucao = proximaExecucao.getMonth();
        const anoProximaExecucao = proximaExecucao.getFullYear();
        
        const hoje = new Date();
        const diaHoje = hoje.getDate();
        const mesHoje = hoje.getMonth();
        const anoHoje = hoje.getFullYear();

        // Se a próxima execução é para uma data futura, não criar ainda
        if (anoProximaExecucao > anoHoje || 
           (anoProximaExecucao === anoHoje && mesProximaExecucao > mesHoje) ||
           (anoProximaExecucao === anoHoje && mesProximaExecucao === mesHoje && diaProximaExecucao > diaHoje)) {
          break;
        }

        // Verificar se já existe uma transação para esta data
        const inicioData = inicioDataBrasil(proximaExecucao);
        const fimData = fimDataBrasil(proximaExecucao);

        const transacaoExistente = await prisma.transacao.findFirst({
          where: {
            userId: usuarioId,
            recorrenteId: recorrente.id,
            data: {
              gte: inicioData,
              lt: fimData,
            },
          },
        });

        if (!transacaoExistente) {
          // Criar nova transação apenas para datas que já venceram
          const novaTransacao = await prisma.transacao.create({
            data: {
              userId: usuarioId,
              categoriaId: recorrente.categoriaId,
              tipo: recorrente.tipo,
              valor: recorrente.valor,
              descricao: recorrente.descricao || `${recorrente.tipo === 'receita' ? 'Receita' : 'Despesa'} recorrente`,
              data: proximaExecucao,
              isRecorrente: true,
              recorrenteId: recorrente.id,
            },
          });

          transacoesCriadas.push(novaTransacao);
        }

        // Calcular próxima data para verificar se há mais pendências
        proximaExecucao = calcularProximaData(proximaExecucao, recorrente.frequencia);
      }
    }

    return transacoesCriadas;
  } catch (error) {
    console.error('Erro ao executar transações recorrentes:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesParam = searchParams.get('mes');
    const anoParam = searchParams.get('ano');
    
    const hoje = getDataAtualBrasil();
    const mes = mesParam ? parseInt(mesParam) : hoje.getMonth() + 1;
    const ano = anoParam ? parseInt(anoParam) : hoje.getFullYear();

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Executar transações recorrentes pendentes automaticamente
    console.log('🔄 Executando transações recorrentes pendentes automaticamente...');
    const transacoesRecorrentesExecutadas = await executarTransacoesRecorrentesPendentes(usuario.id);
    if (transacoesRecorrentesExecutadas.length > 0) {
      console.log(`✅ ${transacoesRecorrentesExecutadas.length} transações recorrentes foram executadas automaticamente`);
    }

    // Datas para o período atual
    const inicioMes = inicioMesBrasil(ano, mes);
    const fimMes = fimMesBrasil(ano, mes);
    
    // Datas para o mês anterior
    const inicioMesAnterior = inicioMesBrasil(ano, mes - 1);
    const fimMesAnterior = fimMesBrasil(ano, mes - 1);

    // Buscar transações do mês atual (excluindo transações futuras)
    const dataAtualBrasil = getDataAtualBrasil();
    const dataLimite = dataAtualBrasil < fimMes ? dataAtualBrasil : fimMes; // Use a data menor entre hoje e fim do mês
    
    const transacoes = await prisma.transacao.findMany({
      where: {
        userId: usuario.id,
        data: {
          gte: inicioMes,
          lte: dataLimite // NOVA REGRA: Não pegar nada do futuro
        }
      },
      include: {
        categoria: true
      },
      orderBy: {
        data: 'desc'
      }
    });

    // DESABILITADO: Não vamos buscar recorrentes para projeções
    const recorrentes: any[] = [];

    // DESABILITADO: Não vamos mais gerar projeções
    const projecaoRecorrentes: any[] = [];
    
    // DESABILITADO: Não vamos mais buscar projeções de dívidas  
    const projecaoParcelas: any[] = [];

    // Combinar apenas transações reais (sem projeções)
    const todasTransacoes = [...transacoes].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    // Buscar transações do mês anterior
    const transacoesMesAnterior = await prisma.transacao.findMany({
      where: {
        userId: usuario.id,
        data: {
          gte: inicioMesAnterior,
          lte: fimMesAnterior
        }
      }
    });

    // Buscar categorias
    const categorias = await prisma.categoria.findMany({
      where: {
        userId: usuario.id
      }
    });

    // Buscar metas
    const metas = await prisma.meta.findMany({
      where: {
        userId: usuario.id
      }
    });

    // Agora todas as transações são reais (sem projeções)
    const transacoesReais = todasTransacoes; // Todas são reais
    const projecoes: any[] = []; // Não há mais projeções

    const totalReceitas = transacoesReais
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesas = transacoesReais
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const saldo = totalReceitas - totalDespesas;

    // Manter compatibilidade com variáveis existentes
    const totalReceitasReais = totalReceitas;
    const totalDespesasReais = totalDespesas;
    const saldoReal = saldo;

    // Calcular totais do mês anterior
    const totalReceitasMesAnterior = transacoesMesAnterior
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesasMesAnterior = transacoesMesAnterior
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Calcular variações percentuais
    const variacaoReceitas = totalReceitasMesAnterior > 0 
      ? ((totalReceitas - totalReceitasMesAnterior) / totalReceitasMesAnterior) * 100 
      : 0;
    
    const variacaoDespesas = totalDespesasMesAnterior > 0 
      ? ((totalDespesas - totalDespesasMesAnterior) / totalDespesasMesAnterior) * 100 
      : 0;

    // Métricas avançadas (baseadas em transações reais)
    const mediaGastoDiario = totalDespesasReais / hoje.getDate();
    const taxaEconomia = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;
    
    // Maior gasto do mês (APENAS TRANSAÇÕES REAIS)
    const maiorGasto = transacoesReais
      .filter(t => t.tipo === 'despesa')
      .sort((a, b) => Number(b.valor) - Number(a.valor))[0];

    // Categoria que mais gasta (APENAS TRANSAÇÕES REAIS)
    const gastosComCategoria = transacoesReais
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find((item: any) => item.categoria === categoria);
        
        if (existing) {
          existing.valor += Number(transacao.valor);
          existing.transacoes += 1;
        } else {
          acc.push({
            categoria,
            valor: Number(transacao.valor),
            cor: transacao.categoria?.cor || '#EF4444',
            transacoes: 1
          });
        }
        
        return acc;
      }, [] as Array<{ categoria: string; valor: number; cor: string; transacoes: number }>);

    const categoriaMaisGasta = gastosComCategoria.sort((a: any, b: any) => b.valor - a.valor)[0];

    // Receitas por categoria (APENAS TRANSAÇÕES REAIS)
    const receitasComCategoria = transacoesReais
      .filter(t => t.tipo === 'receita')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find((item: any) => item.categoria === categoria);
        
        if (existing) {
          existing.valor += Number(transacao.valor);
          existing.reais = (existing.reais || 0) + Number(transacao.valor);
        } else {
          acc.push({
            categoria,
            valor: Number(transacao.valor),
            cor: transacao.categoria?.cor || '#10B981',
            reais: Number(transacao.valor), // Todas são reais agora
            projecoes: 0 // Não há projeções aqui
          });
        }
        
        return acc;
      }, [] as Array<{ categoria: string; valor: number; cor: string; reais?: number; projecoes?: number }>);

    // Evolução dos últimos 6 meses
    const evolucaoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date(ano, mes - 1 - i, 1);
      const dataFim = new Date(ano, mes - i, 0, 23, 59, 59);
      
      // Garantir que não pegamos dados futuros em nenhum mês
      const dataLimiteMes = dataAtualBrasil < dataFim ? dataAtualBrasil : dataFim;
      
      const transacoesMes = await prisma.transacao.findMany({
        where: {
          userId: usuario.id,
          data: {
            gte: dataInicio,
            lte: dataLimiteMes // Não pegar dados futuros
          }
        }
      });

      const receitasMes = transacoesMes
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0);
      
      const despesasMes = transacoesMes
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      evolucaoMensal.push({
        mes: dataInicio.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      });
    }

    // Processar metas
    const metasProcessadas = metas.map(meta => {
      const progresso = Number(meta.valorAlvo) > 0 ? (Number(meta.currentAmount) / Number(meta.valorAlvo)) * 100 : 0;
      
      return {
        id: meta.id,
        nome: meta.nome,
        valorAlvo: Number(meta.valorAlvo),
        currentAmount: Number(meta.currentAmount),
        progresso,
        dataAlvo: meta.dataAlvo.toISOString(),
        isCompleted: meta.isCompleted
      };
    });

    const metasAtivas = metasProcessadas.filter(m => !m.isCompleted);
    const metasConcluidas = metasProcessadas.filter(m => m.isCompleted);
    const metasVencidas = metasAtivas.filter(m => new Date(m.dataAlvo) < new Date());

    // Buscar informações sobre dívidas
    const dividas = await prisma.divida.findMany({
      where: { userId: usuario.id },
      include: {
        parcelas: true,
        categoria: true,
      },
    });

    // Calcular estatísticas das dívidas
    const dividasAtivas = dividas.filter(d => d.status === 'ATIVA').length;
    const valorTotalDividas = dividas.reduce((acc, d) => acc + d.valorTotal.toNumber(), 0);
    const valorTotalPagoDividas = dividas.reduce((acc, divida) => {
      const parcelasPagas = divida.parcelas.filter(p => p.status === 'PAGA').length;
      return acc + (parcelasPagas * divida.valorParcela.toNumber());
    }, 0);
    const valorTotalRestanteDividas = valorTotalDividas - valorTotalPagoDividas;

    // Parcelas vencidas
    const agora = new Date();
    const parcelasVencidas = dividas.reduce((acc, divida) => {
      const vencidas = divida.parcelas.filter(p => 
        p.status === 'PENDENTE' && new Date(p.dataVencimento) < agora
      ).length;
      return acc + vencidas;
    }, 0);

    // Próximas parcelas (próximos 7 dias)
    const em7Dias = new Date();
    em7Dias.setDate(em7Dias.getDate() + 7);
    
    const proximasParcelas = dividas.reduce((acc, divida) => {
      const proximas = divida.parcelas.filter(p => 
        p.status === 'PENDENTE' && 
        new Date(p.dataVencimento) >= agora && 
        new Date(p.dataVencimento) <= em7Dias
      );
      return acc + proximas.length;
    }, 0);

    // Lista detalhada das próximas parcelas (próximos 30 dias)
    const em30Dias = new Date();
    em30Dias.setDate(em30Dias.getDate() + 30);
    
    const proximasParcelasDetalhadas: Array<{
      id: string;
      dividaId: string;
      dividaNome: string;
      numero: number;
      valor: number;
      dataVencimento: Date;
      categoria: string;
      cor: string;
      diasParaVencimento: number;
    }> = [];
    
    dividas.forEach(divida => {
      divida.parcelas
        .filter(p => 
          p.status === 'PENDENTE' && 
          new Date(p.dataVencimento) >= agora && 
          new Date(p.dataVencimento) <= em30Dias
        )
        .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
        .forEach(parcela => {
          proximasParcelasDetalhadas.push({
            id: parcela.id,
            dividaId: divida.id,
            dividaNome: divida.nome,
            numero: parcela.numero,
            valor: parcela.valor.toNumber(),
            dataVencimento: parcela.dataVencimento,
            categoria: divida.categoria?.nome || 'Sem categoria',
            cor: divida.categoria?.cor || '#EF4444',
            diasParaVencimento: Math.ceil((new Date(parcela.dataVencimento).getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
          });
        });
    });

    // Ordenar por data de vencimento
    proximasParcelasDetalhadas.sort((a, b) => 
      new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    );

    // Sistema de Insights Inteligentes e Profissionais
    const insights = [];
    
    // 1. ANÁLISE DE PERFORMANCE FINANCEIRA
    if (totalReceitas > 0) {
      const saudefinanceira = (saldo / totalReceitas) * 100;
      
      if (saudefinanceira >= 20) {
        insights.push({
          tipo: 'sucesso',
          categoria: 'Performance',
          titulo: 'Excelente Gestão Financeira',
          descricao: `Parabéns! Você está mantendo ${saudefinanceira.toFixed(1)}% da sua renda como saldo positivo. Isso demonstra disciplina e planejamento eficaz.`,
          recomendacao: 'Continue assim e considere investir o excedente para acelerar seus objetivos financeiros.',
          metricas: `Taxa de economia: ${saudefinanceira.toFixed(1)}%`,
          icone: '🎯',
          prioridade: 'alta'
        });
      } else if (saudefinanceira >= 10) {
        insights.push({
          tipo: 'sucesso',
          categoria: 'Performance',
          titulo: 'Gestão Financeira Sólida',
          descricao: `Você está economizando ${saudefinanceira.toFixed(1)}% da sua renda. Está no caminho certo para uma vida financeira equilibrada.`,
          recomendacao: 'Tente aumentar gradualmente sua taxa de economia para 20% cortando gastos supérfluos.',
          metricas: `Meta recomendada: 20% | Atual: ${saudefinanceira.toFixed(1)}%`,
          icone: '�',
          prioridade: 'media'
        });
      } else if (saldoReal < 0) {
        insights.push({
          tipo: 'erro',
          categoria: 'Alerta Crítico',
          titulo: 'Orçamento no Vermelho',
          descricao: `Atenção! Seus gastos superaram a renda em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(saldoReal))}. Ação imediata necessária.`,
          recomendacao: 'Revise seus gastos essenciais vs. supérfluos e crie um plano de corte de 20% nas despesas não essenciais.',
          metricas: `Déficit: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(saldoReal))}`,
          icone: '�',
          prioridade: 'critica'
        });
      } else {
        insights.push({
          tipo: 'alerta',
          categoria: 'Oportunidade',
          titulo: 'Margem de Economia Baixa',
          descricao: `Sua taxa de economia está em ${saudefinanceira.toFixed(1)}%. Há espaço para otimização do seu orçamento.`,
          recomendacao: 'Analise a categoria que mais consome seu orçamento e estabeleça limites mensais para aumentar sua economia.',
          metricas: `Economia atual: ${saudefinanceira.toFixed(1)}% | Recomendado: 20%`,
          icone: '💡',
          prioridade: 'media'
        });
      }
    }

    // 2. ANÁLISE COMPARATIVA MENSAL
    if (variacaoDespesas !== 0) {
      if (variacaoDespesas > 15) {
        insights.push({
          tipo: 'alerta',
          categoria: 'Tendência',
          titulo: 'Crescimento Significativo nos Gastos',
          descricao: `Seus gastos aumentaram ${variacaoDespesas.toFixed(1)}% comparado ao mês anterior. Isso pode impactar seus objetivos financeiros.`,
          recomendacao: 'Identifique quais categorias tiveram maior aumento e avalie se foram gastos necessários ou supérfluos.',
          metricas: `Variação: +${variacaoDespesas.toFixed(1)}% | Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas - totalDespesasMesAnterior)}`,
          icone: '📊',
          prioridade: 'alta'
        });
      } else if (variacaoDespesas < -10) {
        insights.push({
          tipo: 'sucesso',
          categoria: 'Conquista',
          titulo: 'Redução Efetiva de Gastos',
          descricao: `Parabéns! Você reduziu seus gastos em ${Math.abs(variacaoDespesas).toFixed(1)}%. Isso demonstra disciplina financeira.`,
          recomendacao: 'Mantenha essa tendência e redirecione a economia para seus objetivos de longo prazo.',
          metricas: `Economia: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalDespesas - totalDespesasMesAnterior))}`,
          icone: '🏆',
          prioridade: 'alta'
        });
      }
    }

    // 3. INTELIGÊNCIA SOBRE CATEGORIAS
    if (categoriaMaisGasta) {
      const percentualCategoria = (categoriaMaisGasta.valor / totalDespesas) * 100;
      
      if (percentualCategoria > 40) {
        insights.push({
          tipo: 'dica',
          categoria: 'Otimização',
          titulo: 'Concentração Excessiva de Gastos',
          descricao: `${categoriaMaisGasta.categoria} representa ${percentualCategoria.toFixed(1)}% dos seus gastos. Alta concentração em uma categoria pode ser um risco.`,
          recomendacao: 'Diversifique seus gastos e estabeleça um teto máximo de 35% para qualquer categoria individual.',
          metricas: `${categoriaMaisGasta.categoria}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoriaMaisGasta.valor)} (${percentualCategoria.toFixed(1)}%)`,
          icone: '⚖️',
          prioridade: 'media'
        });
      }
    }

    // 4. GESTÃO DE DÍVIDAS ESTRATÉGICA
    if (dividasAtivas > 0) {
      const razaoDividaRenda = totalReceitas > 0 ? (valorTotalRestanteDividas / totalReceitas) * 100 : 0;
      
      if (razaoDividaRenda > 30) {
        insights.push({
          tipo: 'erro',
          categoria: 'Endividamento',
          titulo: 'Nível de Endividamento Crítico',
          descricao: `Suas dívidas representam ${razaoDividaRenda.toFixed(1)}% da sua renda. Isso está acima do limite recomendado de 30%.`,
          recomendacao: 'Priorize quitar as dívidas com maiores juros e evite novos endividamentos. Considere renegociar condições.',
          metricas: `Comprometimento: ${razaoDividaRenda.toFixed(1)}% da renda | Limite seguro: 30%`,
          icone: '⚠️',
          prioridade: 'critica'
        });
      } else if (razaoDividaRenda > 15) {
        insights.push({
          tipo: 'dica',
          categoria: 'Endividamento',
          titulo: 'Gestão de Dívidas Moderada',
          descricao: `Suas dívidas representam ${razaoDividaRenda.toFixed(1)}% da renda. Está dentro do aceitável, mas há espaço para melhoria.`,
          recomendacao: 'Acelere o pagamento das dívidas destinando qualquer renda extra para quitação antecipada.',
          metricas: `Valor restante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalRestanteDividas)}`,
          icone: '💳',
          prioridade: 'media'
        });
      }
      
      // Insight específico sobre parcelas vencidas
      if (parcelasVencidas > 0) {
        insights.push({
          tipo: 'erro',
          categoria: 'Urgente',
          titulo: 'Parcelas em Atraso Detectadas',
          descricao: `${parcelasVencidas} parcela(s) vencida(s) podem gerar juros e afetar seu score de crédito.`,
          recomendacao: 'Quite imediatamente as parcelas em atraso e configure lembretes para evitar futuros atrasos.',
          metricas: `Parcelas vencidas: ${parcelasVencidas}`,
          icone: '🚨',
          prioridade: 'critica'
        });
      }

      // Insight sobre próximas parcelas
      if (proximasParcelas > 0) {
        insights.push({
          tipo: 'info',
          categoria: 'Planejamento',
          titulo: 'Parcelas Próximas do Vencimento',
          descricao: `${proximasParcelas} parcela(s) vencem nos próximos 7 dias. Organize seu fluxo de caixa.`,
          recomendacao: 'Reserve o valor necessário e considere antecipar o pagamento se houver desconto.',
          metricas: `Próximas parcelas: ${proximasParcelas} em 7 dias`,
          icone: '📅',
          prioridade: 'media'
        });
      }
    }

    // 5. PROJEÇÕES E PLANEJAMENTO
    if (projecoes.length > 0) {
      const despesasProjetadas = projecoes.filter(p => p.tipo === 'despesa').reduce((sum, p) => sum + Number(p.valor), 0);
      const receitasProjetadas = projecoes.filter(p => p.tipo === 'receita').reduce((sum, p) => sum + Number(p.valor), 0);
      
      if (despesasProjetadas > 0) {
        const impactoOrcamento = totalReceitas > 0 ? (despesasProjetadas / totalReceitas) * 100 : 0;
        
        insights.push({
          tipo: 'info',
          categoria: 'Projeção',
          titulo: 'Compromissos Financeiros Programados',
          descricao: `Você tem ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasProjetadas)} em despesas programadas (recorrentes + parcelas).`,
          recomendacao: 'Mantenha esses valores reservados para garantir o cumprimento dos compromissos.',
          metricas: `Impacto no orçamento: ${impactoOrcamento.toFixed(1)}% da renda`,
          icone: '📋',
          prioridade: 'media'
        });
      }
    }

    // 6. INSIGHTS DE PERFORMANCE HISTÓRICA
    if (maiorGasto && Number(maiorGasto.valor) > mediaGastoDiario * 10) {
      insights.push({
        tipo: 'alerta',
        categoria: 'Comportamento',
        titulo: 'Gasto Atípico Identificado',
        descricao: `Detectamos um gasto de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(maiorGasto.valor))}, significativamente acima da sua média diária.`,
        recomendacao: 'Avalie se este gasto estava planejado e ajuste seu orçamento para os próximos dias se necessário.',
        metricas: `Gasto: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(maiorGasto.valor))} | Média diária: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaGastoDiario)}`,
        icone: '�',
        prioridade: 'media'
      });
    }

    // 7. TRANSAÇÕES AUTOMÁTICAS
    if (transacoesRecorrentesExecutadas.length > 0) {
      insights.push({
        tipo: 'info',
        categoria: 'Automação',
        titulo: 'Transações Processadas Automaticamente',
        descricao: `${transacoesRecorrentesExecutadas.length} transação(ões) recorrente(s) foram processadas automaticamente neste período.`,
        recomendacao: 'Revise periodicamente suas transações recorrentes para garantir que ainda fazem sentido para seu orçamento.',
        metricas: `Transações processadas: ${transacoesRecorrentesExecutadas.length}`,
        icone: '🤖',
        prioridade: 'baixa'
      });
    }

    // Ordenar insights por prioridade (crítica > alta > média > baixa)
    const prioridadeOrdem: { [key: string]: number } = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
    insights.sort((a: any, b: any) => prioridadeOrdem[b.prioridade] - prioridadeOrdem[a.prioridade]);

    return NextResponse.json({
      periodo: {
        mes: mes,
        ano: ano
      },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
        // Separação entre valores reais e projetados
        totalReceitasReais,
        totalDespesasReais, 
        saldoReal,
        totalReceitasProjetadas: totalReceitas - totalReceitasReais,
        totalDespesasProjetadas: totalDespesas - totalDespesasReais,
        saldoProjetado: saldo - saldoReal,
        economias: saldo > 0 ? saldo : 0,
        transacoesCount: transacoesReais.length, // Apenas transações reais
        transacoesReaisCount: transacoesReais.length,
        projecoesCount: projecoes.length,
        categoriasCount: categorias.length,
        receitasCount: transacoesReais.filter(t => t.tipo === 'receita').length, // Apenas transações reais
        despesasCount: transacoesReais.filter(t => t.tipo === 'despesa').length, // Apenas transações reais
        totalEconomizado: metasConcluidas.reduce((sum, m) => sum + m.currentAmount, 0),
        metasAtivas: metasAtivas.length,
        metasConcluidas: metasConcluidas.length,
        // Métricas avançadas
        variacaoReceitas,
        variacaoDespesas,
        taxaEconomia,
        mediaGastoDiario,
        maiorGasto: maiorGasto ? {
          descricao: maiorGasto.descricao,
          valor: Number(maiorGasto.valor),
          categoria: maiorGasto.categoria?.nome || 'Sem categoria'
        } : null,
        // Informações sobre transações recorrentes executadas
        transacoesRecorrentesExecutadas: transacoesRecorrentesExecutadas.length,
        // Informações sobre dívidas
        dividasAtivas,
        valorTotalDividas,
        valorTotalPagoDividas,
        valorTotalRestanteDividas,
        parcelasVencidas,
        proximasParcelas
      },
      dividas: {
        proximasParcelas: proximasParcelasDetalhadas.slice(0, 10), // Máximo 10 próximas parcelas
        totalProximas: proximasParcelasDetalhadas.length,
        resumo: {
          ativas: dividasAtivas,
          valorTotal: valorTotalDividas,
          valorPago: valorTotalPagoDividas,
          valorRestante: valorTotalRestanteDividas,
          parcelasVencidas,
          proximasParcelas
        }
      },
      graficos: {
        receitasPorCategoria: receitasComCategoria,
        gastosPorCategoria: gastosComCategoria,
        evolucaoMensal,
        comparacaoMensal: {
          atual: { receitas: totalReceitas, despesas: totalDespesas, saldo },
          anterior: { receitas: totalReceitasMesAnterior, despesas: totalDespesasMesAnterior, saldo: totalReceitasMesAnterior - totalDespesasMesAnterior }
        }
      },
      metas: {
        ativas: metasAtivas,
        concluidas: metasConcluidas,
        vencidas: metasVencidas,
        resumo: {
          total: metasProcessadas.length,
          ativas: metasAtivas.length,
          concluidas: metasConcluidas.length,
          vencidas: metasVencidas.length,
          totalEconomizado: metasConcluidas.reduce((sum, m) => sum + m.currentAmount, 0)
        }
      },
      insights
    });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}