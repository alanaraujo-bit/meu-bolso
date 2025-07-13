import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

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
      }
    });

    // Calcular totais
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const totalDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const saldo = totalReceitas - totalDespesas;

    // Contar transações e categorias
    const transacoesCount = await prisma.transacao.count({
      where: { userId: usuario.id }
    });

    const categoriasCount = await prisma.categoria.count({
      where: { userId: usuario.id }
    });

    // Receitas por categoria
    const receitasPorCategoria = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        userId: usuario.id,
        tipo: 'receita',
        data: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _sum: {
        valor: true
      }
    });

    const receitasComCategoria = await Promise.all(
      receitasPorCategoria.map(async (item: { categoriaId: string | null; _sum: { valor: number | null } }) => {
        if (!item.categoriaId) {
          return {
            categoria: 'Sem categoria',
            valor: Number(item._sum.valor || 0),
            cor: '#6B7280'
          };
        }
        
        const categoria = await prisma.categoria.findUnique({
          where: { id: item.categoriaId }
        });
        
        return {
          categoria: categoria?.nome || 'Categoria não encontrada',
          valor: Number(item._sum.valor || 0),
          cor: categoria?.cor || '#6B7280'
        };
      })
    );

    // Gastos por categoria
    const gastosPorCategoria = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        userId: usuario.id,
        tipo: 'despesa',
        data: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _sum: {
        valor: true
      }
    });

    const gastosComCategoria = await Promise.all(
      gastosPorCategoria.map(async (item: { categoriaId: string | null; _sum: { valor: number | null } }) => {
        if (!item.categoriaId) {
          return {
            categoria: 'Sem categoria',
            valor: Number(item._sum.valor || 0),
            cor: '#6B7280'
          };
        }
        
        const categoria = await prisma.categoria.findUnique({
          where: { id: item.categoriaId }
        });
        
        return {
          categoria: categoria?.nome || 'Categoria não encontrada',
          valor: Number(item._sum.valor || 0),
          cor: categoria?.cor || '#6B7280'
        };
      })
    );

    // Evolução mensal (últimos 6 meses)
    const evolucaoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);
      
      const transacoesMes = await prisma.transacao.findMany({
        where: {
          userId: usuario.id,
          data: {
            gte: mesAtual,
            lte: proximoMes
          }
        }
      });

      const receitasMes = transacoesMes
        .filter(t => t.tipo === 'receita')
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const despesasMes = transacoesMes
        .filter(t => t.tipo === 'despesa')
        .reduce((acc, t) => acc + Number(t.valor), 0);

      evolucaoMensal.push({
        mes: mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      });
    }

    // Buscar metas
    const metas = await prisma.meta.findMany({
      where: { userId: usuario.id },
      orderBy: { criadoEm: 'desc' }
    });

    return NextResponse.json({
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
        economias: saldo > 0 ? saldo : 0,
        transacoesCount,
        categoriasCount,
        receitasCount: transacoes.filter(t => t.tipo === 'receita').length,
        despesasCount: transacoes.filter(t => t.tipo === 'despesa').length
      },
      graficos: {
        receitasPorCategoria: receitasComCategoria,
        gastosPorCategoria: gastosComCategoria,
        evolucaoMensal
      },
      metas: metas.map(meta => ({
        ...meta,
        progresso: meta.valorAlvo > 0 ? (Number(meta.valorAtual) / Number(meta.valorAlvo)) * 100 : 0
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}