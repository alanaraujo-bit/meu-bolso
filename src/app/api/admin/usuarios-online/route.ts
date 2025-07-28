import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ADMIN_EMAILS } from '@/lib/adminConfig';

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

    // Cálculos de tempo
    const agora = new Date();
    const cincoMinutosAtras = new Date(agora.getTime() - 5 * 60 * 1000); // 5 minutos
    const quinzeMinutosAtras = new Date(agora.getTime() - 15 * 60 * 1000); // 15 minutos
    const setesDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtros baseados no status
    let whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtros por status de atividade online
    if (status === 'online') {
      whereClause.atualizadoEm = { gte: cincoMinutosAtras };
    } else if (status === 'recente') {
      whereClause.atualizadoEm = { gte: quinzeMinutosAtras };
    } else if (status === 'ativos') {
      whereClause.atualizadoEm = { gte: setesDiasAtras };
    } else if (status === 'inativos') {
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
    const totalUsuarios = await prisma.usuario.count({ where: whereClause });

    // Calcular métricas de atividade online
    const usuariosOnlineAgora = await prisma.usuario.count({
      where: { atualizadoEm: { gte: cincoMinutosAtras } }
    });

    const usuariosRecentementeAtivos = await prisma.usuario.count({
      where: { atualizadoEm: { gte: quinzeMinutosAtras } }
    });

    const usuariosAtivos7d = await prisma.usuario.count({
      where: { atualizadoEm: { gte: setesDiasAtras } }
    });

    const usuariosInativos = await prisma.usuario.count({
      where: { atualizadoEm: { lt: trintaDiasAtras } }
    });

    // Processar dados dos usuários
    const usuariosProcessados = usuarios.map(usuario => {
      const minutosInativo = Math.floor((agora.getTime() - usuario.atualizadoEm.getTime()) / (1000 * 60));
      
      let statusOnline: 'online' | 'recente' | 'ausente' | 'offline';
      if (minutosInativo <= 5) {
        statusOnline = 'online';
      } else if (minutosInativo <= 15) {
        statusOnline = 'recente';
      } else if (minutosInativo <= 60) {
        statusOnline = 'ausente';
      } else {
        statusOnline = 'offline';
      }

      const diasInativo = Math.floor(minutosInativo / (60 * 24));
      
      let statusAtividade: 'ativo' | 'pouco_ativo' | 'inativo';
      if (diasInativo <= 7) {
        statusAtividade = 'ativo';
      } else if (diasInativo <= 30) {
        statusAtividade = 'pouco_ativo';
      } else {
        statusAtividade = 'inativo';
      }

      const valorTotalMovimentado = usuario.transacoes.reduce(
        (acc, t) => acc + Number(t.valor), 0
      );

      return {
        id: usuario.id,
        nome: usuario.nome || 'Sem nome',
        email: usuario.email,
        criadoEm: usuario.criadoEm.toISOString(),
        atualizadoEm: usuario.atualizadoEm.toISOString(),
        minutosInativo,
        diasInativo,
        statusOnline,
        statusAtividade,
        estatisticas: {
          totalTransacoes: usuario._count.transacoes,
          totalMetas: usuario._count.metas,
          totalCategorias: usuario._count.categorias,
          totalRecorrentes: usuario._count.recorrentes,
          valorTotalMovimentado,
        },
        ultimaTransacao: usuario.transacoes[0] ? {
          valor: Number(usuario.transacoes[0].valor),
          data: usuario.transacoes[0].data.toISOString(),
        } : null,
        ultimaAtividadeTexto: formatarUltimaAtividade(minutosInativo),
      };
    });

    const hasNext = skip + limit < totalUsuarios;
    const hasPrev = page > 1;
    const totalPages = Math.ceil(totalUsuarios / limit);

    return NextResponse.json({
      usuarios: usuariosProcessados,
      paginacao: {
        page,
        limit,
        total: totalUsuarios,
        totalPages,
        hasNext,
        hasPrev,
      },
      metricas: {
        usuariosOnlineAgora,
        usuariosRecentementeAtivos,
        usuariosAtivos7d,
        usuariosInativos,
        totalGeral: await prisma.usuario.count(),
      },
      filtros: {
        search,
        status,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar usuários online:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function formatarUltimaAtividade(minutosInativo: number): string {
  if (minutosInativo < 1) {
    return 'Agora mesmo';
  } else if (minutosInativo < 60) {
    return `${minutosInativo}min atrás`;
  } else if (minutosInativo < 1440) { // 24 horas
    const horas = Math.floor(minutosInativo / 60);
    return `${horas}h atrás`;
  } else {
    const dias = Math.floor(minutosInativo / 1440);
    return `${dias}d atrás`;
  }
}
