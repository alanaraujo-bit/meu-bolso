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
    const periodo = searchParams.get('periodo') || '7d';

    // Calcular datas baseadas no período
    const agora = new Date();
    let dataInicio: Date;
    
    switch (periodo) {
      case '24h':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Datas para comparação
    const onlineThreshold = new Date(agora.getTime() - 5 * 60 * 1000); // 5 minutos
    const ativo24hThreshold = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    const ativo7dThreshold = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const mesPassado = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // === KPIs PRINCIPAIS ===
    
    // Usuários online (última atividade < 5 minutos)
    const usuariosOnlineAgora = await prisma.usuario.count({
      where: { atualizadoEm: { gte: onlineThreshold } }
    });

    // Usuários ativos nas últimas 24h
    const usuariosAtivos24h = await prisma.usuario.count({
      where: { atualizadoEm: { gte: ativo24hThreshold } }
    });

    // Usuários ativos nos últimos 7 dias
    const usuariosAtivos7d = await prisma.usuario.count({
      where: { atualizadoEm: { gte: ativo7dThreshold } }
    });

    // Total de usuários
    const totalUsuarios = await prisma.usuario.count();

    // Novos usuários nos últimos 30 dias
    const novosUsuarios30d = await prisma.usuario.count({
      where: { criadoEm: { gte: mesPassado } }
    });

    // Novos usuários no mês anterior (para cálculo de crescimento)
    const mesAnterior = new Date(mesPassado.getTime() - 30 * 24 * 60 * 60 * 1000);
    const novosUsuariosMesAnterior = await prisma.usuario.count({
      where: { 
        criadoEm: { 
          gte: mesAnterior,
          lt: mesPassado 
        } 
      }
    });

    const crescimentoUsuarios = novosUsuariosMesAnterior > 0 
      ? ((novosUsuarios30d - novosUsuariosMesAnterior) / novosUsuariosMesAnterior) * 100 
      : 100;

    // Transações no período
    const transacoesPeriodo = await prisma.transacao.findMany({
      where: { data: { gte: dataInicio } },
      select: { valor: true, tipo: true, data: true }
    });

    const totalTransacoes = transacoesPeriodo.length;
    
    const volumeFinanceiroTotal = transacoesPeriodo.reduce(
      (acc, t) => acc + Number(t.valor), 0
    );

    const ticketMedio = totalTransacoes > 0 ? volumeFinanceiroTotal / totalTransacoes : 0;

    // Cálculo de crescimento de receitas
    const receitasPeriodo = transacoesPeriodo
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const transacoesPeriodoAnterior = await prisma.transacao.findMany({
      where: { 
        data: { 
          gte: new Date(dataInicio.getTime() - (agora.getTime() - dataInicio.getTime())),
          lt: dataInicio 
        } 
      },
      select: { valor: true, tipo: true }
    });

    const receitasPeriodoAnterior = transacoesPeriodoAnterior
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const crescimentoReceitas = receitasPeriodoAnterior > 0 
      ? ((receitasPeriodo - receitasPeriodoAnterior) / receitasPeriodoAnterior) * 100 
      : 100;

    // Metas ativas
    const metasAtivas = await prisma.meta.count({
      where: { isCompleted: false }
    });

    // Taxa de retenção (usuários ativos nos últimos 7 dias / total de usuários)
    const taxaRetencao = totalUsuarios > 0 ? (usuariosAtivos7d / totalUsuarios) * 100 : 0;

    // === ATIVIDADE ONLINE ===
    
    // Usuários online com nomes (limitado aos primeiros 20)
    const usuariosOnlineDetalhes = await prisma.usuario.findMany({
      where: { atualizadoEm: { gte: onlineThreshold } },
      select: { 
        nome: true, 
        atualizadoEm: true 
      },
      orderBy: { atualizadoEm: 'desc' },
      take: 20
    });

    const usuariosOnline = usuariosOnlineDetalhes.map(u => ({
      nome: u.nome || 'Usuário sem nome',
      ultimaAtividade: formatarTempoAtras(u.atualizadoEm),
      statusOnline: calcularStatusOnline(u.atualizadoEm) as 'online' | 'ausente' | 'offline'
    }));

    // Histórico de atividade das últimas 24 horas (por hora)
    const historicoAtividade = [];
    for (let i = 23; i >= 0; i--) {
      const horaInicio = new Date(agora.getTime() - i * 60 * 60 * 1000);
      const horaFim = new Date(horaInicio.getTime() + 60 * 60 * 1000);
      
      const onlineNaHora = await prisma.usuario.count({
        where: { 
          atualizadoEm: { 
            gte: horaInicio,
            lt: horaFim 
          } 
        }
      });

      const ativoNaHora = await prisma.transacao.count({
        where: { 
          data: { 
            gte: horaInicio,
            lt: horaFim 
          } 
        }
      });

      historicoAtividade.push({
        hora: horaInicio.getHours().toString().padStart(2, '0') + ':00',
        online: onlineNaHora,
        ativo: ativoNaHora
      });
    }

    // === GRÁFICOS ===
    
    // Crescimento de usuários (últimos 30 dias)
    const crescimentoUsuarios30d = [];
    for (let i = 29; i >= 0; i--) {
      const dia = new Date(agora.getTime() - i * 24 * 60 * 60 * 1000);
      const diaInicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
      const diaFim = new Date(diaInicio.getTime() + 24 * 60 * 60 * 1000);
      
      const totalAteODia = await prisma.usuario.count({
        where: { criadoEm: { lt: diaFim } }
      });

      const novosNoDia = await prisma.usuario.count({
        where: { 
          criadoEm: { 
            gte: diaInicio,
            lt: diaFim 
          } 
        }
      });

      crescimentoUsuarios30d.push({
        data: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: totalAteODia,
        novos: novosNoDia
      });
    }

    // Performance financeira mensal (últimos 6 meses)
    const performanceFinanceira = [];
    for (let i = 5; i >= 0; i--) {
      const mesData = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      
      const transacoesMes = await prisma.transacao.findMany({
        where: { 
          data: { 
            gte: mesData,
            lt: proximoMes 
          } 
        },
        select: { valor: true, tipo: true }
      });

      const receitas = transacoesMes
        .filter(t => t.tipo === 'receita')
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const despesas = transacoesMes
        .filter(t => t.tipo === 'despesa')
        .reduce((acc, t) => acc + Number(t.valor), 0);

      performanceFinanceira.push({
        mes: mesData.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }

    // === RANKINGS ===
    
    // Usuários mais ativos
    const usuariosMaisAtivos = await prisma.usuario.findMany({
      include: {
        _count: { select: { transacoes: true } },
        transacoes: { select: { valor: true } }
      },
      orderBy: { transacoes: { _count: 'desc' } },
      take: 5
    });

    const usuariosMaisAtivosFormatados = usuariosMaisAtivos.map(u => ({
      nome: u.nome || 'Usuário sem nome',
      email: u.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Ofuscar email
      transacoes: u._count.transacoes,
      valorTotal: u.transacoes.reduce((acc, t) => acc + Number(t.valor), 0),
      ultimaAtividade: formatarTempoAtras(u.atualizadoEm)
    }));

    // Categorias mais usadas
    const categoriasMaisUsadas = await prisma.categoria.findMany({
      include: {
        _count: { select: { transacoes: true } },
        transacoes: { select: { valor: true } }
      },
      orderBy: { transacoes: { _count: 'desc' } },
      take: 5
    });

    const categoriasMaisUsadasFormatadas = categoriasMaisUsadas.map(c => ({
      nome: c.nome,
      cor: c.cor || '#6B7280',
      totalTransacoes: c._count.transacoes,
      valorTotal: c.transacoes.reduce((acc, t) => acc + Number(t.valor), 0)
    }));

    // Alertas (simulados com base nas métricas)
    const alertasAtivos = [];
    
    if (taxaRetencao < 50) {
      alertasAtivos.push({
        tipo: 'error' as const,
        titulo: 'Taxa de Retenção Baixa',
        descricao: `Apenas ${taxaRetencao.toFixed(1)}% dos usuários estão ativos`,
        timestamp: 'agora'
      });
    }

    if (crescimentoUsuarios < 0) {
      alertasAtivos.push({
        tipo: 'warning' as const,
        titulo: 'Crescimento Negativo',
        descricao: `Queda de ${Math.abs(crescimentoUsuarios).toFixed(1)}% no crescimento`,
        timestamp: 'há 1h'
      });
    }

    if (usuariosOnlineAgora < totalUsuarios * 0.01) {
      alertasAtivos.push({
        tipo: 'info' as const,
        titulo: 'Baixa Atividade Online',
        descricao: `Apenas ${usuariosOnlineAgora} usuários online agora`,
        timestamp: 'há 30min'
      });
    }

    // === RESPONSE ===
    
    const response = {
      kpis: {
        usuariosOnlineAgora,
        usuariosAtivos24h,
        usuariosAtivos7d,
        totalUsuarios,
        novosUsuarios30d,
        totalTransacoes,
        volumeFinanceiroTotal,
        metasAtivas,
        taxaRetencao,
        ticketMedio,
        crescimentoUsuarios,
        crescimentoReceitas
      },
      atividadeOnline: {
        usuariosOnline,
        historicoAtividade
      },
      graficos: {
        crescimentoUsuarios: crescimentoUsuarios30d,
        transacoesDiarias: [], // Placeholder
        distribuicaoUsuarios: [], // Placeholder
        performanceFinanceira
      },
      rankings: {
        usuariosMaisAtivos: usuariosMaisAtivosFormatados,
        categoriasMaisUsadas: categoriasMaisUsadasFormatadas,
        alertasAtivos
      },
      metricas: {
        tempoMedioSessao: 0, // Placeholder
        paginasMaisAcessadas: [], // Placeholder
        dispositivosAtivos: [], // Placeholder
        horariosPico: [] // Placeholder
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro no dashboard aprimorado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function formatarTempoAtras(data: Date): string {
  const agora = new Date();
  const diferenca = agora.getTime() - data.getTime();
  const minutos = Math.floor(diferenca / (1000 * 60));
  
  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `${minutos}min atrás`;
  
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h atrás`;
  
  const dias = Math.floor(horas / 24);
  return `${dias}d atrás`;
}

function calcularStatusOnline(ultimaAtividade: Date): string {
  const agora = new Date();
  const diferenca = agora.getTime() - ultimaAtividade.getTime();
  const minutos = Math.floor(diferenca / (1000 * 60));
  
  if (minutos <= 5) return 'online';
  if (minutos <= 15) return 'ausente';
  return 'offline';
}
