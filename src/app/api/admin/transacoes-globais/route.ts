import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'alanvitoraraujo1a@outlook.com') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo') || 'todos';
    const periodo = searchParams.get('periodo') || '30d';
    const categoria = searchParams.get('categoria') || 'todas';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filtros de data
    let dataFiltro = {};
    const agora = new Date();
    
    switch (periodo) {
      case '7d':
        dataFiltro = {
          data: {
            gte: new Date(agora.setDate(agora.getDate() - 7))
          }
        };
        break;
      case '30d':
        dataFiltro = {
          data: {
            gte: new Date(agora.setDate(agora.getDate() - 30))
          }
        };
        break;
      case '90d':
        dataFiltro = {
          data: {
            gte: new Date(agora.setDate(agora.getDate() - 90))
          }
        };
        break;
      case 'todos':
      default:
        dataFiltro = {};
        break;
    }

    // Construir where clause
    const whereClause: any = {
      ...dataFiltro,
      ...(tipo !== 'todos' && { tipo }),
      ...(categoria !== 'todas' && { categoria: { nome: categoria } }),
      ...(search && {
        OR: [
          { descricao: { contains: search, mode: 'insensitive' } },
          { user: { nome: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    // Buscar transações com paginação
    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          categoria: {
            select: {
              nome: true,
              cor: true
            }
          }
        },
        orderBy: {
          data: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transacao.count({ where: whereClause })
    ]);

    // Buscar estatísticas
    const [receitas, despesas, volumeTotal] = await Promise.all([
      prisma.transacao.count({
        where: { ...whereClause, tipo: 'receita' }
      }),
      prisma.transacao.count({
        where: { ...whereClause, tipo: 'despesa' }
      }),
      prisma.transacao.aggregate({
        where: whereClause,
        _sum: {
          valor: true
        }
      })
    ]);

    const stats = {
      total,
      receitas,
      despesas,
      volumeTotal: volumeTotal._sum.valor || 0
    };

    // Formatar dados das transações
    const transacoesFormatadas = transacoes.map(transacao => ({
      id: transacao.id,
      userId: transacao.userId,
      usuarioNome: transacao.user?.nome || 'N/A',
      usuarioEmail: transacao.user?.email || 'N/A',
      tipo: transacao.tipo,
      valor: transacao.valor,
      descricao: transacao.descricao,
      data: transacao.data.toISOString(),
      categoria: transacao.categoria?.nome || 'Sem categoria',
      corCategoria: transacao.categoria?.cor || '#6B7280'
    }));

    return NextResponse.json({
      transacoes: transacoesFormatadas,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar transações globais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
