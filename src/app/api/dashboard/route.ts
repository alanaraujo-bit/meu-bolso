import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Obter parâmetros de consulta
    const url = new URL(req.url);
    const mes = parseInt(url.searchParams.get('mes') || new Date().getMonth() + 1 + '');
    const ano = parseInt(url.searchParams.get('ano') || new Date().getFullYear() + '');

    // Calcular período
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    // Buscar transações do período
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
      .reduce((acc, t) => acc + t.valor.toNumber(), 0);

    const totalDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor.toNumber(), 0);

    const saldo = totalReceitas - totalDespesas;

    // Contar transações e categorias
    const transacoesCount = transacoes.length;
    const categoriasCount = await prisma.categoria.count({
      where: { userId: usuario.id }
    });

    // Agrupar receitas por categoria
    const receitasPorCategoria = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        userId: usuario.id,
        tipo: 'receita',
        data: {
          gte: inicioMes,
          lte: fimMes
        },
        categoriaId: {
          not: null as any
        }
      },
      _sum: {
        valor: true
      }
    });

    // Buscar dados das categorias para receitas
    const receitasComCategoria = await Promise.all(
      receitasPorCategoria.map(async (item) => {
        const categoria = await prisma.categoria.findUnique({
          where: { id: item.categoriaId! }
        });
        return {
          categoria,
          _sum: item._sum
        };
      })
    );

    // Agrupar despesas por categoria
    const gastosPorCategoria = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        userId: usuario.id,
        tipo: 'despesa',
        data: {
          gte: inicioMes,
          lte: fimMes
        },
        categoriaId: {
          not: null as any
        }
      },
      _sum: {
        valor: true
      }
    });

    // Buscar dados das categorias para despesas
    const gastosComCategoria = await Promise.all(
      gastosPorCategoria.map(async (item) => {
        const categoria = await prisma.categoria.findUnique({
          where: { id: item.categoriaId! }
        });
        return {
          categoria,
          _sum: item._sum
        };
      })
    );

    // Evolução dos últimos 6 meses
    const evolucaoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const dataRef = new Date(ano, mes - 1 - i, 1);
      const mesRef = dataRef.getMonth() + 1;
      const anoRef = dataRef.getFullYear();
      
      const inicioMesRef = new Date(anoRef, mesRef - 1, 1);
      const fimMesRef = new Date(anoRef, mesRef, 0, 23, 59, 59, 999);

      const transacoesMes = await prisma.transacao.findMany({
        where: {
          userId: usuario.id,
          data: {
            gte: inicioMesRef,
            lte: fimMesRef
          }
        }
      });

      const receitasMes = transacoesMes
        .filter(t => t.tipo === 'receita')
        .reduce((acc, t) => acc + t.valor.toNumber(), 0);

      const despesasMes = transacoesMes
        .filter(t => t.tipo === 'despesa')
        .reduce((acc, t) => acc + t.valor.toNumber(), 0);

      evolucaoMensal.push({
        mes: mesRef,
        ano: anoRef,
        receitas: receitasMes,
        despesas: despesasMes
      });
    }

    // Buscar metas
    const metas = await prisma.meta.findMany({
      where: { userId: usuario.id },
      select: {
        id: true,
        nome: true,
        valorAlvo: true,
        currentAmount: true,
        dataAlvo: true,
        isCompleted: true
      }
    });

    const hoje = new Date();
    const metasAtivas = metas.filter(m => !m.isCompleted && new Date(m.dataAlvo) >= hoje);
    const metasConcluidas = metas.filter(m => m.isCompleted);
    const metasVencidas = metas.filter(m => !m.isCompleted && new Date(m.dataAlvo) < hoje);
    
    const totalEconomizado = metas.reduce((acc, meta) => acc + meta.currentAmount.toNumber(), 0);
    const totalMetas = metas.reduce((acc, meta) => acc + meta.valorAlvo.toNumber(), 0);

    // Calcular contadores específicos
    const contadorReceitas = transacoes.filter(t => t.tipo === 'receita').length;
    const contadorDespesas = transacoes.filter(t => t.tipo === 'despesa').length;

    const resumoData = {
      totalReceitas: totalReceitas,
      totalDespesas: totalDespesas,
      saldo: saldo,
      transacoesCount: transacoesCount,
      receitasCount: contadorReceitas,
      despesasCount: contadorDespesas,
      categoriasCount: categoriasCount,
      totalEconomizado: totalEconomizado,
      metasAtivas: metasAtivas.length,
      metasConcluidas: metasConcluidas.length
    };

    return NextResponse.json({
      periodo: { mes, ano },
      resumo: resumoData,
      graficos: {
        receitasPorCategoria: receitasComCategoria.map(item => ({
          nome: item.categoria?.nome || 'Sem categoria',
          valor: item._sum?.valor?.toNumber() || 0,
          cor: item.categoria?.cor || '#6B7280'
        })),
        gastosPorCategoria: gastosComCategoria.map(item => ({
          nome: item.categoria?.nome || 'Sem categoria',
          valor: item._sum?.valor?.toNumber() || 0,
          cor: item.categoria?.cor || '#6B7280'
        })),
        evolucaoMensal: evolucaoMensal.map(item => ({
          mes: `${item.mes.toString().padStart(2, '0')}/${item.ano}`,
          receitas: item.receitas || 0,
          despesas: item.despesas || 0,
          saldo: (item.receitas || 0) - (item.despesas || 0)
        }))
      },
      metas: {
        ativas: metasAtivas.map(meta => ({
          id: meta.id,
          nome: meta.nome,
          valorAlvo: meta.valorAlvo.toNumber(),
          currentAmount: meta.currentAmount.toNumber(),
          progresso: (meta.currentAmount.toNumber() / meta.valorAlvo.toNumber()) * 100,
          dataAlvo: meta.dataAlvo
        })),
        resumo: {
          total: metas.length,
          ativas: metasAtivas.length,
          concluidas: metasConcluidas.length,
          vencidas: metasVencidas.length,
          totalEconomizado,
          totalMetas
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}