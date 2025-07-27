import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { 
  getDataAtualBrasil, 
  adicionarDias, 
  inicioMesBrasil,
  fimMesBrasil
} from '@/lib/dateUtils';

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
    const periodo = searchParams.get('periodo') || '30d';
    
    // Calcular datas baseadas no período
    const agora = getDataAtualBrasil();
    let dataInicio = new Date(agora);
    
    switch (periodo) {
      case '7d':
        dataInicio = adicionarDias(agora, -7);
        break;
      case '30d':
        dataInicio = adicionarDias(agora, -30);
        break;
      case '90d':
        dataInicio = adicionarDias(agora, -90);
        break;
      default:
        dataInicio = adicionarDias(agora, -30);
    }

    // KPIs Principais - DADOS REAIS
    const totalUsuarios = await prisma.usuario.count();
    
    // Usuários ativos nos últimos 7 dias
    const usuariosAtivos7d = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Novos usuários nos últimos 30 dias
    const novosUsuarios30d = await prisma.usuario.count({
      where: {
        criadoEm: {
          gte: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Total de transações
    const totalTransacoes = await prisma.transacao.count();
    
    // Volume financeiro total
    const volumeTotal = await prisma.transacao.aggregate({
      _sum: { valor: true },
    });

    // Metas ativas
    const metasAtivas = await prisma.meta.count({
      where: { isCompleted: false },
    });

    // Taxa de retenção real (usuários que voltaram nos últimos 30 dias)
    const usuariosComTransacoes30d = await prisma.usuario.count({
      where: {
        transacoes: {
          some: {
            data: {
              gte: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });
    
    const taxaRetencao = totalUsuarios > 0 
      ? (usuariosComTransacoes30d / totalUsuarios) * 100 
      : 0;

    // Ticket médio por usuário
    const ticketMedio = totalUsuarios > 0 
      ? Number(volumeTotal._sum.valor || 0) / totalUsuarios 
      : 0;

    // Crescimento de usuários real - últimos 30 dias
    const crescimentoUsuarios = [];
    for (let i = 29; i >= 0; i--) {
      const dia = new Date(agora.getTime() - i * 24 * 60 * 60 * 1000);
      const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
      
      const count = await prisma.usuario.count({
        where: {
          criadoEm: { lte: inicioDia }
        }
      });

      crescimentoUsuarios.push({
        data: dia.toISOString().split('T')[0],
        usuarios: count,
      });
    }

    // Transações diárias dos últimos 30 dias
    const transacoesDiarias = [];
    for (let i = 29; i >= 0; i--) {
      const dia = adicionarDias(agora, -i);
      const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
      const fimDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59);
      
      const count = await prisma.transacao.count({
        where: {
          data: {
            gte: inicioDia,
            lte: fimDia
          }
        }
      });

      const valor = await prisma.transacao.aggregate({
        where: {
          data: {
            gte: inicioDia,
            lte: fimDia
          }
        },
        _sum: { valor: true }
      });

      transacoesDiarias.push({
        data: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: count,
        valor: valor._sum.valor || 0
      });
    }

    // Tipos de transação
    const tiposTransacao = await prisma.transacao.groupBy({
      by: ['tipo'],
      _count: { tipo: true },
      _sum: { valor: true },
    });

    // Usuários mais ativos - DADOS REAIS
    const usuariosMaisAtivos = await prisma.usuario.findMany({
      include: {
        _count: {
          select: { transacoes: true }
        },
        transacoes: {
          select: { valor: true }
        }
      },
      orderBy: {
        transacoes: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const usuariosMaisAtivosFormatados = usuariosMaisAtivos.map((usuario, index) => {
      const valorTotal = usuario.transacoes.reduce((sum, t) => sum + Number(t.valor), 0);
      return {
        id: index + 1,
        nome: usuario.nome || 'Usuário sem nome',
        email: usuario.email,
        transacoes: usuario._count.transacoes,
        valorTotal: valorTotal,
      };
    });

    // Categorias mais usadas
    const categoriasMaisUsadas = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { transacoes: true },
        },
        transacoes: {
          select: { valor: true },
        },
      },
      orderBy: {
        transacoes: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Top metas
    const topMetas = await prisma.meta.findMany({
      orderBy: { valorAlvo: 'desc' },
      take: 10,
    });

    // Metas criadas/concluídas
    const metasCriadas = await prisma.meta.count();
    const metasConcluidas = await prisma.meta.count({
      where: { isCompleted: true },
    });

    // Categorias criadas
    const totalCategorias = await prisma.categoria.count();

    // Valor médio por transação
    const valorMedio = Number(volumeTotal._sum.valor || 0) / totalTransacoes;

    // Dados de retenção semanal - DADOS REAIS
    const retencaoSemanal = [];
    for (let i = 11; i >= 0; i--) {
      const inicioDaSemana = new Date(agora.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const fimDaSemana = new Date(inicioDaSemana.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const usuariosAtivosNaSemana = await prisma.usuario.count({
        where: {
          transacoes: {
            some: {
              data: {
                gte: inicioDaSemana,
                lte: fimDaSemana
              }
            }
          }
        }
      });

      const retencaoPercentual = totalUsuarios > 0 
        ? (usuariosAtivosNaSemana / totalUsuarios) * 100 
        : 0;

      retencaoSemanal.push({
        semana: `Semana ${12 - i}`,
        retencao: Number(retencaoPercentual.toFixed(1)),
      });
    }

    return NextResponse.json({
      kpis: {
        totalUsuarios,
        usuariosAtivos7d,
        novosUsuarios30d,
        totalTransacoes,
        volumeFinanceiroTotal: volumeTotal._sum.valor || 0,
        metasAtivas,
        taxaRetencao,
        ticketMedio,
      },
      graficos: {
        crescimentoUsuarios,
        transacoesDiarias,
        tiposTransacao: tiposTransacao.map(t => ({
          tipo: t.tipo,
          count: t._count.tipo,
          valor: t._sum.valor || 0,
        })),
        retencaoSemanal,
      },
      rankings: {
        usuariosMaisAtivos: usuariosMaisAtivosFormatados,
        categoriasMaisUsadas: categoriasMaisUsadas.map(c => ({
          id: c.id,
          nome: c.nome,
          cor: c.cor,
          totalTransacoes: c._count.transacoes,
          valorTotal: c.transacoes.reduce((sum, t) => sum + Number(t.valor), 0),
        })),
        topMetas: topMetas.map(m => ({
          id: m.id,
          nome: m.nome,
          valorAlvo: Number(m.valorAlvo),
          valorAtual: Number(m.currentAmount),
          concluida: m.isCompleted,
        })),
      },
      resumo: {
        metasCriadas,
        metasConcluidas,
        totalCategorias,
        valorMedio,
        periodo,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas avançadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
