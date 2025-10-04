import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com',
  'admin@meubolso.com',
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'todos';

    const skip = (page - 1) * limit;

    // Filtros baseados no status
    let whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtros por status de atividade
    const agora = new Date();
    if (status === 'ativos') {
      const setesDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      whereClause.atualizadoEm = { gte: setesDiasAtras };
    } else if (status === 'inativos') {
      const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      whereClause.atualizadoEm = { lt: trintaDiasAtras };
    }

    // Buscar usuários com suas estatísticas
    const usuarios = await prisma.usuario.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            transacoes: true,
            metas: true,
            categorias: true,
            recorrentes: true,
          }
        },
        transacoes: {
          select: {
            valor: true,
            data: true,
          },
          orderBy: {
            data: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        atualizadoEm: 'desc'
      },
      skip,
      take: limit,
    });

    // Contar total para paginação
    const totalUsuarios = await prisma.usuario.count({
      where: whereClause
    });

    // Calcular estatísticas de cada usuário
    const usuariosComEstatisticas = await Promise.all(
      usuarios.map(async (usuario) => {
        // Calcular valor total movimentado
        const valorTotal = await prisma.transacao.aggregate({
          where: { userId: usuario.id },
          _sum: { valor: true }
        });

        // Calcular dias desde última atividade
        const diasInativo = Math.floor(
          (agora.getTime() - usuario.atualizadoEm.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Status de atividade
        let statusAtividade = 'ativo';
        if (diasInativo > 30) statusAtividade = 'inativo';
        else if (diasInativo > 7) statusAtividade = 'pouco_ativo';

        // Última transação
        const ultimaTransacao = usuario.transacoes[0];

        return {
          id: usuario.id,
          nome: usuario.nome || 'Usuário sem nome',
          email: usuario.email,
          criadoEm: usuario.criadoEm,
          atualizadoEm: usuario.atualizadoEm,
          diasInativo,
          statusAtividade,
          estatisticas: {
            totalTransacoes: usuario._count.transacoes,
            totalMetas: usuario._count.metas,
            totalCategorias: usuario._count.categorias,
            totalRecorrentes: usuario._count.recorrentes,
            valorTotalMovimentado: Number(valorTotal._sum.valor || 0),
          },
          ultimaTransacao: ultimaTransacao ? {
            valor: Number(ultimaTransacao.valor),
            data: ultimaTransacao.data,
          } : null,
        };
      })
    );

    // Estatísticas gerais
    const totalAtivos = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const totalInativos = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          lt: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const totalGeral = await prisma.usuario.count();

    return NextResponse.json({
      usuarios: usuariosComEstatisticas,
      paginacao: {
        page,
        limit,
        total: totalUsuarios,
        totalPages: Math.ceil(totalUsuarios / limit),
        hasNext: page * limit < totalUsuarios,
        hasPrev: page > 1,
      },
      estatisticas: {
        totalGeral,
        totalAtivos,
        totalInativos,
        totalPoucoAtivos: totalGeral - totalAtivos - totalInativos,
      },
      filtros: {
        search,
        status,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
