import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = ['alanvitoraraujo1a@outlook.com', 'admin@meubolso.com'];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';

    // Calcular datas baseadas no período
    const agora = new Date();
    let dataInicio = new Date();
    
    switch (periodo) {
      case 'hoje':
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataInicio.setDate(agora.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(agora.getMonth() - 1);
        break;
      case 'trimestre':
        dataInicio.setMonth(agora.getMonth() - 3);
        break;
    }

    // Estatísticas de usuários REAIS
    const totalUsuarios = await prisma.usuario.count();
    
    // Usuários ativos (atualizados nos últimos 7 dias)
    const usuariosAtivos = await prisma.usuario.count({
      where: {
        atualizadoEm: {
          gte: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Usuários novos no período
    const usuariosNovos = await prisma.usuario.count({
      where: {
        criadoEm: { gte: dataInicio }
      }
    });

    // Calcular crescimento (comparar com período anterior)
    let dataInicioAnterior = new Date(dataInicio);
    const diff = agora.getTime() - dataInicio.getTime();
    dataInicioAnterior = new Date(dataInicio.getTime() - diff);

    const usuariosNovosAnterior = await prisma.usuario.count({
      where: {
        criadoEm: { 
          gte: dataInicioAnterior,
          lt: dataInicio 
        }
      }
    });

    const crescimentoUsuarios = usuariosNovosAnterior > 0 
      ? ((usuariosNovos - usuariosNovosAnterior) / usuariosNovosAnterior) * 100 
      : 0;

    const usuarios = {
      total: totalUsuarios,
      ativos: usuariosAtivos,
      novos: usuariosNovos,
      crescimento: Number(crescimentoUsuarios.toFixed(1))
    };

    // Estatísticas financeiras
    const volumeTotal = await prisma.transacao.aggregate({
      _sum: { valor: true }
    });

    const volumePeriodo = await prisma.transacao.aggregate({
      where: {
        data: { gte: dataInicio }
      },
      _sum: { valor: true }
    });

    const transacoesTotal = await prisma.transacao.count();
    const transacoesPeriodo = await prisma.transacao.count({
      where: {
        data: { gte: dataInicio }
      }
    });

    const ticketMedio = transacoesTotal > 0 
      ? Number(volumeTotal._sum.valor || 0) / transacoesTotal 
      : 0;

    // Metas ativas
    const metasAtivas = await prisma.meta.count({
      where: { isCompleted: false }
    });

    // Categorias
    const totalCategorias = await prisma.categoria.count();

    // Calcular crescimento do volume financeiro
    const volumePeriodoAnterior = await prisma.transacao.aggregate({
      where: {
        data: { 
          gte: dataInicioAnterior,
          lt: dataInicio 
        }
      },
      _sum: { valor: true }
    });

    const crescimentoVolume = Number(volumePeriodoAnterior._sum.valor || 0) > 0 
      ? ((Number(volumePeriodo._sum.valor || 0) - Number(volumePeriodoAnterior._sum.valor || 0)) / Number(volumePeriodoAnterior._sum.valor || 0)) * 100
      : 0;

    // Alertas baseados em dados reais
    const transacoesSemCategoria = await prisma.transacao.count({
      where: { categoriaId: null }
    });

    const metasVencidas = await prisma.meta.count({
      where: { 
        dataAlvo: { lt: agora },
        isCompleted: false
      }
    });

    const recorrentesInativas = await prisma.transacaoRecorrente.count({
      where: {
        isActive: false
      }
    });

    const alertas = {
      criticos: metasVencidas,
      avisos: transacoesSemCategoria + recorrentesInativas,
      info: 0
    };

    return NextResponse.json({
      usuarios,
      financeiro: {
        volumeTotal: Number(volumeTotal._sum.valor || 0),
        volumeMes: Number(volumePeriodo._sum.valor || 0),
        ticketMedio: Number(ticketMedio.toFixed(2)),
        crescimentoVolume: Number(crescimentoVolume.toFixed(1))
      },
      atividade: {
        transacoesTotal,
        transacoesMes: transacoesPeriodo,
        metasAtivas,
        categorias: totalCategorias
      },
      alertas,
      periodo,
      atualizadoEm: agora.toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
