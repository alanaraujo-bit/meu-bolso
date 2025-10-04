import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📥 === EXPORTANDO DADOS DO USUÁRIO ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Usuário autenticado:', session.user.email);

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        criadoEm: true,
        avatarUrl: true,
        tema: true,
        formatoMoeda: true,
        confirmarExclusoes: true,
        timeoutSessao: true,
        paginaInicial: true,
        mostrarTooltips: true
      }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('📊 Coletando dados para exportação...');

    // Buscar todos os dados do usuário
    const [transacoes, categorias, metas, dividas, transacoesRecorrentes] = await Promise.all([
      // Transações
      prisma.transacao.findMany({
        where: { userId: usuario.id },
        include: {
          categoria: true
        },
        orderBy: { data: 'desc' }
      }),
      
      // Categorias
      prisma.categoria.findMany({
        where: { userId: usuario.id },
        include: {
          _count: {
            select: { transacoes: true }
          }
        },
        orderBy: { nome: 'asc' }
      }),
      
      // Metas
      prisma.meta.findMany({
        where: { userId: usuario.id },
        orderBy: { criadoEm: 'desc' }
      }),
      
      // Dívidas
      prisma.divida.findMany({
        where: { userId: usuario.id },
        orderBy: { criadoEm: 'desc' }
      }),
      
      // Transações Recorrentes
      prisma.transacaoRecorrente.findMany({
        where: { userId: usuario.id },
        include: {
          categoria: true
        },
        orderBy: { criadoEm: 'desc' }
      })
    ]);

    // Calcular estatísticas
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const saldoAtual = totalReceitas - totalDespesas;

    const metasAtingidas = metas.filter(m => {
      const progresso = Math.min((Number(m.currentAmount) / Number(m.valorAlvo)) * 100, 100);
      return progresso >= 100;
    }).length;

    const dividasAbertas = dividas.filter(d => d.status === 'ATIVA').length;

    // Preparar dados para exportação
    const dadosExportacao = {
      metadata: {
        exportadoEm: new Date().toISOString(),
        versao: '1.0',
        usuario: {
          nome: usuario.nome,
          email: usuario.email,
          membroDesde: usuario.criadoEm
        }
      },
      configuracoes: {
        tema: usuario.tema,
        formatoMoeda: usuario.formatoMoeda,
        confirmarExclusoes: usuario.confirmarExclusoes,
        timeoutSessao: usuario.timeoutSessao,
        paginaInicial: usuario.paginaInicial,
        mostrarTooltips: usuario.mostrarTooltips
      },
      estatisticas: {
        totalTransacoes: transacoes.length,
        totalCategorias: categorias.length,
        totalMetas: metas.length,
        totalDividas: dividas.length,
        totalRecorrentes: transacoesRecorrentes.length,
        totalReceitas,
        totalDespesas,
        saldoAtual,
        metasAtingidas,
        dividasAbertas
      },
      dados: {
        transacoes: transacoes.map(t => ({
          id: t.id,
          descricao: t.descricao,
          valor: Number(t.valor),
          tipo: t.tipo,
          data: t.data,
          categoria: t.categoria?.nome || 'Sem categoria',
          criadoEm: t.criadoEm
        })),
        
        categorias: categorias.map(c => ({
          id: c.id,
          nome: c.nome,
          icone: c.icone,
          cor: c.cor,
          tipo: c.tipo,
          totalTransacoes: c._count?.transacoes || 0,
          criadoEm: c.criadoEm
        })),
        
        metas: metas.map(m => ({
          id: m.id,
          nome: m.nome,
          valorAlvo: Number(m.valorAlvo),
          valorAtual: Number(m.currentAmount),
          dataAlvo: m.dataAlvo,
          isCompleted: m.isCompleted,
          criadoEm: m.criadoEm
        })),
        
        dividas: dividas.map(d => ({
          id: d.id,
          nome: d.nome,
          valorTotal: Number(d.valorTotal),
          numeroParcelas: d.numeroParcelas,
          valorParcela: Number(d.valorParcela),
          dataPrimeiraParcela: d.dataPrimeiraParcela,
          status: d.status,
          criadoEm: d.criadoEm
        })),
        
        transacoesRecorrentes: transacoesRecorrentes.map(tr => ({
          id: tr.id,
          descricao: tr.descricao,
          valor: Number(tr.valor),
          tipo: tr.tipo,
          categoria: tr.categoria?.nome || 'Sem categoria',
          frequencia: tr.frequencia,
          dataInicio: tr.dataInicio,
          dataFim: tr.dataFim,
          isActive: tr.isActive,
          criadoEm: tr.criadoEm
        }))
      }
    };

    console.log('✅ Dados coletados para exportação:', {
      transacoes: transacoes.length,
      categorias: categorias.length,
      metas: metas.length,
      dividas: dividas.length,
      recorrentes: transacoesRecorrentes.length
    });

    // Retornar como JSON para download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="meu-bolso-backup-${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(JSON.stringify(dadosExportacao, null, 2), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('💥 Erro ao exportar dados:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
