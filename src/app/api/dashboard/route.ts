import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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

      // Executar todas as transações pendentes até a data atual
      while (proximaExecucao <= agora) {
        // Verificar se a transação está dentro do período de validade
        if (recorrente.dataFim && proximaExecucao > recorrente.dataFim) {
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
          // Criar nova transação
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

    // Buscar transações do mês atual (incluindo projeções de recorrentes)
    const transacoes = await prisma.transacao.findMany({
      where: {
        userId: usuario.id,
        data: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      include: {
        categoria: true
      },
      orderBy: {
        data: 'desc'
      }
    });

    // Buscar transações recorrentes para projetar no mês atual
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: usuario.id,
        isActive: true,
        dataInicio: { lte: fimMes }, // Recorrentes que já começaram ou começam até o fim do mês
        OR: [
          { dataFim: null }, // Sem data fim
          { dataFim: { gte: inicioMes } } // Ou que terminam depois do início do mês
        ]
      },
      include: {
        categoria: true
      }
    });

    // Função para gerar projeções das transações recorrentes para o mês
    const projecaoRecorrentes = [];
    for (const recorrente of recorrentes) {
      let dataProjecao = new Date(recorrente.dataInicio);
      
      // Avançar até o mês atual se necessário
      while (dataProjecao < inicioMes) {
        dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
      }
      
      // Gerar todas as ocorrências do mês atual
      while (dataProjecao <= fimMes) {
        // Verificar se está dentro do período de validade
        if (recorrente.dataFim && dataProjecao > recorrente.dataFim) {
          break;
        }
        
        // Verificar se já existe uma transação real para esta data
        const transacaoExistente = transacoes.find(t => 
          t.recorrenteId === recorrente.id &&
          t.data.toDateString() === dataProjecao.toDateString()
        );
        
        if (!transacaoExistente) {
          // Adicionar projeção
          projecaoRecorrentes.push({
            id: `projection_${recorrente.id}_${dataProjecao.getTime()}`,
            userId: recorrente.userId,
            categoriaId: recorrente.categoriaId,
            tipo: recorrente.tipo,
            valor: recorrente.valor,
            descricao: `${recorrente.descricao} (Projeção)`,
            data: dataProjecao,
            isRecorrente: true,
            recorrenteId: recorrente.id,
            isProjection: true, // Flag para identificar projeções
            categoria: recorrente.categoria,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          });
        }
        
        dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
      }
    }

    // Combinar transações reais com projeções
    const todasTransacoes = [...transacoes, ...projecaoRecorrentes].sort((a, b) => 
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

    // Calcular totais do mês atual (incluindo projeções)
    const totalReceitas = todasTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesas = todasTransacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const saldo = totalReceitas - totalDespesas;

    // Separar transações reais e projeções para métricas
    const transacoesReais = todasTransacoes.filter(t => !(t as any).isProjection);
    const projecoes = todasTransacoes.filter(t => (t as any).isProjection);

    const totalReceitasReais = transacoesReais
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesasReais = transacoesReais
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const saldoReal = totalReceitasReais - totalDespesasReais;

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
    
    // Maior gasto do mês (incluindo projeções)
    const maiorGasto = todasTransacoes
      .filter(t => t.tipo === 'despesa')
      .sort((a, b) => Number(b.valor) - Number(a.valor))[0];

    // Categoria que mais gasta (incluindo projeções)
    const gastosComCategoria = todasTransacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find(item => item.categoria === categoria);
        
        if (existing) {
          existing.valor += Number(transacao.valor);
          existing.transacoes += 1;
          if ((transacao as any).isProjection) {
            existing.projecoes = (existing.projecoes || 0) + 1;
          }
        } else {
          acc.push({
            categoria,
            valor: Number(transacao.valor),
            cor: transacao.categoria?.cor || '#EF4444',
            transacoes: 1,
            projecoes: (transacao as any).isProjection ? 1 : 0
          });
        }
        
        return acc;
      }, [] as Array<{ categoria: string; valor: number; cor: string; transacoes: number; projecoes?: number }>);

    const categoriaMaisGasta = gastosComCategoria.sort((a, b) => b.valor - a.valor)[0];

    // Receitas por categoria (incluindo projeções)
    const receitasComCategoria = todasTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find(item => item.categoria === categoria);
        
        if (existing) {
          existing.valor += Number(transacao.valor);
          if ((transacao as any).isProjection) {
            existing.projecoes = (existing.projecoes || 0) + Number(transacao.valor);
          } else {
            existing.reais = (existing.reais || 0) + Number(transacao.valor);
          }
        } else {
          acc.push({
            categoria,
            valor: Number(transacao.valor),
            cor: transacao.categoria?.cor || '#10B981',
            reais: (transacao as any).isProjection ? 0 : Number(transacao.valor),
            projecoes: (transacao as any).isProjection ? Number(transacao.valor) : 0
          });
        }
        
        return acc;
      }, [] as Array<{ categoria: string; valor: number; cor: string; reais?: number; projecoes?: number }>);

    // Evolução dos últimos 6 meses
    const evolucaoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date(ano, mes - 1 - i, 1);
      const dataFim = new Date(ano, mes - i, 0, 23, 59, 59);
      
      const transacoesMes = await prisma.transacao.findMany({
        where: {
          userId: usuario.id,
          data: {
            gte: dataInicio,
            lte: dataFim
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

    // Insights automáticos
    const insights = [];
    
    if (maiorGasto) {
      insights.push({
        tipo: 'info',
        titulo: 'Maior Gasto do Mês',
        descricao: `${maiorGasto.descricao} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(maiorGasto.valor))}`,
        icone: '💸'
      });
    }

    if (categoriaMaisGasta) {
      insights.push({
        tipo: 'info',
        titulo: 'Categoria Mais Gasta',
        descricao: `${categoriaMaisGasta.categoria} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoriaMaisGasta.valor)}`,
        icone: '📊'
      });
    }

    if (variacaoDespesas > 10) {
      insights.push({
        tipo: 'alerta',
        titulo: 'Aumento nos Gastos',
        descricao: `Seus gastos aumentaram ${variacaoDespesas.toFixed(1)}% em relação ao mês anterior`,
        icone: '⚠️'
      });
    }

    if (taxaEconomia > 20) {
      insights.push({
        tipo: 'sucesso',
        titulo: 'Excelente Economia!',
        descricao: `Você está economizando ${taxaEconomia.toFixed(1)}% da sua renda`,
        icone: '🎉'
      });
    } else if (taxaEconomia < 5 && totalReceitas > 0) {
      insights.push({
        tipo: 'dica',
        titulo: 'Melhore sua Economia',
        descricao: `Tente economizar mais. Sua taxa atual é de ${taxaEconomia.toFixed(1)}%`,
        icone: '💡'
      });
    }

    // Insight sobre transações recorrentes executadas
    if (transacoesRecorrentesExecutadas.length > 0) {
      insights.push({
        tipo: 'info',
        titulo: 'Transações Automáticas',
        descricao: `${transacoesRecorrentesExecutadas.length} transação(ões) recorrente(s) foram adicionadas automaticamente`,
        icone: '🔄'
      });
    }

    // Insight sobre projeções
    if (projecoes.length > 0) {
      const receitasProjetadas = projecoes.filter(p => p.tipo === 'receita').reduce((sum, p) => sum + Number(p.valor), 0);
      const despesasProjetadas = projecoes.filter(p => p.tipo === 'despesa').reduce((sum, p) => sum + Number(p.valor), 0);
      
      if (receitasProjetadas > 0) {
        insights.push({
          tipo: 'info',
          titulo: 'Receitas Projetadas',
          descricao: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitasProjetadas)} em receitas recorrentes previstas para este mês`,
          icone: '💰'
        });
      }

      if (despesasProjetadas > 0) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Despesas Projetadas',
          descricao: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasProjetadas)} em despesas recorrentes previstas para este mês`,
          icone: '📊'
        });
      }
    }

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
        transacoesCount: todasTransacoes.length,
        transacoesReaisCount: transacoesReais.length,
        projecoesCount: projecoes.length,
        categoriasCount: categorias.length,
        receitasCount: todasTransacoes.filter(t => t.tipo === 'receita').length,
        despesasCount: todasTransacoes.filter(t => t.tipo === 'despesa').length,
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
          categoria: maiorGasto.categoria?.nome || 'Sem categoria',
          isProjection: (maiorGasto as any).isProjection || false
        } : null,
        // Informações sobre transações recorrentes executadas
        transacoesRecorrentesExecutadas: transacoesRecorrentesExecutadas.length
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