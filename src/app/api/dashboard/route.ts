import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesParam = searchParams.get('mes');
    const anoParam = searchParams.get('ano');
    
    const hoje = new Date();
    const mes = mesParam ? parseInt(mesParam) : hoje.getMonth() + 1;
    const ano = anoParam ? parseInt(anoParam) : hoje.getFullYear();

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Datas para o período atual
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59);
    
    // Datas para o mês anterior
    const inicioMesAnterior = new Date(ano, mes - 2, 1);
    const fimMesAnterior = new Date(ano, mes - 1, 0, 23, 59, 59);

    // Buscar transações do mês atual
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

    // Calcular totais do mês atual
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const saldo = totalReceitas - totalDespesas;

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

    // Métricas avançadas
    const mediaGastoDiario = totalDespesas / hoje.getDate();
    const taxaEconomia = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;
    
    // Maior gasto do mês
    const maiorGasto = transacoes
      .filter(t => t.tipo === 'despesa')
      .sort((a, b) => Number(b.valor) - Number(a.valor))[0];

    // Categoria que mais gasta
    const gastosComCategoria = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find(item => item.categoria === categoria);
        
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

    const categoriaMaisGasta = gastosComCategoria.sort((a, b) => b.valor - a.valor)[0];

    // Receitas por categoria
    const receitasComCategoria = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, transacao) => {
        const categoria = transacao.categoria?.nome || 'Sem categoria';
        const existing = acc.find(item => item.categoria === categoria);
        
        if (existing) {
          existing.valor += Number(transacao.valor);
        } else {
          acc.push({
            categoria,
            valor: Number(transacao.valor),
            cor: transacao.categoria?.cor || '#10B981'
          });
        }
        
        return acc;
      }, [] as Array<{ categoria: string; valor: number; cor: string }>);

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

    return NextResponse.json({
      periodo: {
        mes: mes,
        ano: ano
      },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
        economias: saldo > 0 ? saldo : 0,
        transacoesCount: transacoes.length,
        categoriasCount: categorias.length,
        receitasCount: transacoes.filter(t => t.tipo === 'receita').length,
        despesasCount: transacoes.filter(t => t.tipo === 'despesa').length,
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
        } : null
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