import { NextRequest, NextResponse } from 'next/server';
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
  'alanvitoraraujo1a@outlook.com', // Substitua pelo seu email
  'admin@meubolso.com',
  // Adicione outros emails de admin aqui
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }

    const hoje = getDataAtualBrasil();
    const ontem = adicionarDias(hoje, -1);
    const semanaPassada = adicionarDias(hoje, -7);
    const mesPassado = adicionarDias(hoje, -30);
    const inicioMes = inicioMesBrasil(hoje.getFullYear(), hoje.getMonth() + 1);
    const fimMes = fimMesBrasil(hoje.getFullYear(), hoje.getMonth() + 1);

    // 🧍‍♂️ 1. MÉTRICAS DE USUÁRIOS
    const totalUsuarios = await prisma.usuario.count();
    
    const usuariosAtivosHoje = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: ontem
        }
      }
    });

    const usuariosAtivosSemana = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: semanaPassada
        }
      }
    });

    const usuariosAtivosMes = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: mesPassado
        }
      }
    });

    const novosUsuariosMes = await prisma.usuario.count({
      where: {
        criadoEm: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    // Crescimento mensal de usuários (últimos 6 meses)
    const crescimentoUsuarios = [];
    for (let i = 5; i >= 0; i--) {
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const inicioMesAtual = inicioMesBrasil(mesAtual.getFullYear(), mesAtual.getMonth() + 1);
      const fimMesAtual = fimMesBrasil(mesAtual.getFullYear(), mesAtual.getMonth() + 1);
      
      const usuarios = await prisma.usuario.count({
        where: {
          criadoEm: {
            gte: inicioMesAtual,
            lte: fimMesAtual
          }
        }
      });

      crescimentoUsuarios.push({
        mes: mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        usuarios
      });
    }

    // 📅 2. MÉTRICAS DE USO DO SISTEMA
    const totalTransacoes = await prisma.transacao.count();
    
    const transacoesPorTipo = await prisma.transacao.groupBy({
      by: ['tipo'],
      _count: {
        id: true
      }
    });

    const transacoesMes = await prisma.transacao.count({
      where: {
        criadoEm: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    const totalMetas = await prisma.meta.count();
    const metasAtivas = await prisma.meta.count({
      where: { isCompleted: false }
    });
    const metasConcluidas = await prisma.meta.count({
      where: { isCompleted: true }
    });

    const totalCategorias = await prisma.categoria.count();
    const mediaCategoriasPorUsuario = totalUsuarios > 0 ? (totalCategorias / totalUsuarios).toFixed(1) : '0';

    const recorrentesAtivas = await prisma.transacaoRecorrente.count({
      where: { isActive: true }
    });

    // 🧠 3. MÉTRICAS DE ENGAJAMENTO
    const usuariosComTransacoes = await prisma.usuario.count({
      where: {
        transacoes: {
          some: {}
        }
      }
    });

    const usuariosComMetas = await prisma.usuario.count({
      where: {
        metas: {
          some: {}
        }
      }
    });

    const engajamentoTransacoes = totalUsuarios > 0 ? 
      ((usuariosComTransacoes / totalUsuarios) * 100).toFixed(1) : '0';
    
    const engajamentoMetas = totalUsuarios > 0 ? 
      ((usuariosComMetas / totalUsuarios) * 100).toFixed(1) : '0';

    // 📈 4. RETENÇÃO E CHURN
    const usuariosInativos30dias = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          lt: adicionarDias(hoje, -30)
        }
      }
    });

    const churnRate = totalUsuarios > 0 ? 
      ((usuariosInativos30dias / totalUsuarios) * 100).toFixed(1) : '0';

    // 💵 5. MÉTRICAS FINANCEIRAS AGREGADAS
    const totalReceitas = await prisma.transacao.aggregate({
      where: { tipo: 'receita' },
      _sum: { valor: true }
    });

    const totalDespesas = await prisma.transacao.aggregate({
      where: { tipo: 'despesa' },
      _sum: { valor: true }
    });

    const valorMedioTransacao = await prisma.transacao.aggregate({
      _avg: { valor: true }
    });

    // Categorias mais utilizadas
    const categoriasPopulares = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { transacoes: true }
        }
      },
      orderBy: {
        transacoes: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Evolução de transações (últimos 30 dias)
    const evolucaoTransacoes = [];
    for (let i = 29; i >= 0; i--) {
      const dia = adicionarDias(hoje, -i);
      const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
      const fimDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59);
      
      const transacoesDia = await prisma.transacao.count({
        where: {
          criadoEm: {
            gte: inicioDia,
            lte: fimDia
          }
        }
      });

      evolucaoTransacoes.push({
        data: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        transacoes: transacoesDia
      });
    }

    // Top usuários mais ativos
    const usuariosAtivos = await prisma.usuario.findMany({
      include: {
        _count: {
          select: {
            transacoes: true,
            metas: true,
            categorias: true
          }
        }
      },
      orderBy: {
        transacoes: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Metas mais comuns (por valor)
    const metasComuns = await prisma.meta.groupBy({
      by: ['valorAlvo'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json({
      usuarios: {
        total: totalUsuarios,
        ativos: {
          hoje: usuariosAtivosHoje,
          semana: usuariosAtivosSemana,
          mes: usuariosAtivosMes
        },
        novos: {
          mes: novosUsuariosMes
        },
        crescimento: crescimentoUsuarios,
        topAtivos: usuariosAtivos.map(u => ({
          email: u.email.substring(0, 3) + '***', // Anonimizar email
          transacoes: u._count.transacoes,
          metas: u._count.metas,
          categorias: u._count.categorias,
          ultimoLogin: u.atualizadoEm
        }))
      },
      sistema: {
        transacoes: {
          total: totalTransacoes,
          mes: transacoesMes,
          porTipo: transacoesPorTipo,
          evolucao: evolucaoTransacoes,
          valorMedio: Number(valorMedioTransacao._avg.valor || 0).toFixed(2)
        },
        metas: {
          total: totalMetas,
          ativas: metasAtivas,
          concluidas: metasConcluidas,
          comuns: metasComuns
        },
        categorias: {
          total: totalCategorias,
          mediaPorUsuario: mediaCategoriasPorUsuario,
          populares: categoriasPopulares.map(c => ({
            nome: c.nome,
            icone: c.icone,
            uso: c._count.transacoes
          }))
        },
        recorrentes: {
          ativas: recorrentesAtivas
        }
      },
      engajamento: {
        usuariosComTransacoes: {
          total: usuariosComTransacoes,
          percentual: engajamentoTransacoes
        },
        usuariosComMetas: {
          total: usuariosComMetas,
          percentual: engajamentoMetas
        }
      },
      retencao: {
        inativos30dias: usuariosInativos30dias,
        churnRate: churnRate,
        retencaoRate: (100 - parseFloat(churnRate)).toFixed(1)
      },
      financeiro: {
        totalReceitas: Number(totalReceitas._sum.valor || 0),
        totalDespesas: Number(totalDespesas._sum.valor || 0),
        saldoTotal: Number(totalReceitas._sum.valor || 0) - Number(totalDespesas._sum.valor || 0),
        valorMedioTransacao: Number(valorMedioTransacao._avg.valor || 0)
      },
      geradoEm: hoje.toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar métricas admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
