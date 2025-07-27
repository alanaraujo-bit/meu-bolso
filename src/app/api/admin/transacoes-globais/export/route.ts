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
    const format = searchParams.get('format') || 'csv';

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

    // Buscar todas as transações para exportação
    const transacoes = await prisma.transacao.findMany({
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
      }
    });

    if (format === 'csv') {
      // Gerar CSV
      const csvHeader = 'ID,Usuario,Email,Tipo,Valor,Descricao,Categoria,Data\n';
      const csvData = transacoes.map(transacao => {
        const linha = [
          transacao.id,
          `"${transacao.user?.nome || 'N/A'}"`,
          `"${transacao.user?.email || 'N/A'}"`,
          transacao.tipo,
          transacao.valor.toString(),
          `"${transacao.descricao || ''}"`,
          `"${transacao.categoria?.nome || 'Sem categoria'}"`,
          new Date(transacao.data).toLocaleDateString('pt-BR')
        ].join(',');
        return linha;
      }).join('\n');

      const csvContent = csvHeader + csvData;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="transacoes-globais-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Formato JSON por padrão
    const jsonData = transacoes.map(transacao => ({
      id: transacao.id,
      usuario: {
        nome: transacao.user?.nome || 'N/A',
        email: transacao.user?.email || 'N/A'
      },
      tipo: transacao.tipo,
      valor: Number(transacao.valor),
      descricao: transacao.descricao,
      categoria: transacao.categoria?.nome || 'Sem categoria',
      data: transacao.data.toISOString()
    }));

    return NextResponse.json({
      transacoes: jsonData,
      exportadoEm: new Date().toISOString(),
      total: jsonData.length
    });

  } catch (error) {
    console.error('Erro ao exportar transações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
