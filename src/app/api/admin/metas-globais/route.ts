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
    const status = searchParams.get('status') || 'todos';
    const periodo = searchParams.get('periodo') || 'todos';

    // Filtros de data
    let dataFiltro = {};
    const agora = new Date();
    
    switch (periodo) {
      case '30d':
        dataFiltro = {
          dataAlvo: {
            lte: new Date(agora.setDate(agora.getDate() + 30))
          }
        };
        break;
      case '90d':
        dataFiltro = {
          dataAlvo: {
            lte: new Date(agora.setDate(agora.getDate() + 90))
          }
        };
        break;
      case 'vencidas':
        dataFiltro = {
          dataAlvo: {
            lt: new Date()
          },
          isCompleted: false
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
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { user: { nome: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    // Filtrar por status se especificado
    if (status !== 'todos') {
      if (status === 'concluida') {
        whereClause.isCompleted = true;
      } else if (status === 'em_andamento') {
        whereClause.isCompleted = false;
        whereClause.dataAlvo = { gte: new Date() };
      } else if (status === 'atrasada') {
        whereClause.isCompleted = false;
        whereClause.dataAlvo = { lt: new Date() };
      } else if (status === 'proxima_vencimento') {
        const proximoVencimento = new Date();
        proximoVencimento.setDate(proximoVencimento.getDate() + 7);
        whereClause.isCompleted = false;
        whereClause.dataAlvo = {
          gte: new Date(),
          lte: proximoVencimento
        };
      }
    }

    // Buscar metas
    const metas = await prisma.meta.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataAlvo: 'asc'
      }
    });

    // Buscar estatísticas
    const [total, concluidas, emAndamento, atrasadas] = await Promise.all([
      prisma.meta.count(),
      prisma.meta.count({ where: { isCompleted: true } }),
      prisma.meta.count({ 
        where: { 
          isCompleted: false,
          dataAlvo: { gte: new Date() }
        } 
      }),
      prisma.meta.count({ 
        where: { 
          isCompleted: false,
          dataAlvo: { lt: new Date() }
        } 
      })
    ]);

    const [valorTotalResult, valorAlcancadoResult] = await Promise.all([
      prisma.meta.aggregate({
        _sum: {
          valorAlvo: true
        }
      }),
      prisma.meta.aggregate({
        _sum: {
          currentAmount: true
        }
      })
    ]);

    const stats = {
      total,
      concluidas,
      emAndamento,
      atrasadas,
      valorTotalMetas: Number(valorTotalResult._sum.valorAlvo) || 0,
      valorAlcancado: Number(valorAlcancadoResult._sum.currentAmount) || 0
    };

    // Formatar dados das metas
    const metasFormatadas = metas.map(meta => {
      const valorAlvo = Number(meta.valorAlvo);
      const currentAmount = Number(meta.currentAmount);
      const progresso = valorAlvo > 0 ? (currentAmount / valorAlvo) * 100 : 0;
      
      const hoje = new Date();
      const dataAlvo = new Date(meta.dataAlvo);
      const diasRestantes = Math.ceil((dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'em_andamento';
      if (meta.isCompleted) {
        status = 'concluida';
      } else if (diasRestantes < 0) {
        status = 'atrasada';
      } else if (diasRestantes <= 7) {
        status = 'proxima_vencimento';
      }

      return {
        id: meta.id,
        userId: meta.userId,
        usuarioNome: meta.user?.nome || 'N/A',
        usuarioEmail: meta.user?.email || 'N/A',
        nome: meta.nome,
        valorAlvo,
        currentAmount,
        dataAlvo: meta.dataAlvo.toISOString(),
        isCompleted: meta.isCompleted,
        progresso,
        diasRestantes,
        status
      };
    });

    return NextResponse.json({
      metas: metasFormatadas,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar metas globais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
